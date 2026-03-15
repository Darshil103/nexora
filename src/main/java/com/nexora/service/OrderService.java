package com.nexora.service;

import com.nexora.dto.OrderDTO;
import com.nexora.entity.*;
import com.nexora.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class OrderService {

    private final OrderRepository orderRepository;
    private final StockRepository stockRepository;
    private final UserRepository userRepository;
    private final HoldingRepository holdingRepository;
    private final WalletService walletService;
    private final TradeService tradeService;
    private final NotificationService notificationService;

    @Transactional
    public OrderDTO placeOrder(Long userId, OrderDTO dto) {
        User user = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("User not found"));
        if (user.getKycStatus() != User.KycStatus.APPROVED) throw new RuntimeException("KYC not approved");

        Stock stock = stockRepository.findById(dto.getStockId()).orElseThrow(() -> new RuntimeException("Stock not found"));
        if (stock.getStatus() == Stock.StockStatus.HALTED) throw new RuntimeException("Stock is halted");

        Order.OrderType orderType = Order.OrderType.valueOf(dto.getOrderType());
        Order.PriceType priceType = Order.PriceType.valueOf(dto.getPriceType());
        BigDecimal price = priceType == Order.PriceType.MARKET ? stock.getCurrentPrice() : dto.getPrice();
        if (price == null || price.compareTo(BigDecimal.ZERO) <= 0) throw new RuntimeException("Invalid price");

        BigDecimal totalValue = price.multiply(BigDecimal.valueOf(dto.getQuantity()));

        // Validate balance for BUY or holdings for SELL
        if (orderType == Order.OrderType.BUY) {
            walletService.reserveBalance(userId, totalValue);
        } else {
            Holding h = holdingRepository.findByUserIdAndStockId(userId, stock.getId())
                    .orElseThrow(() -> new RuntimeException("No holdings in this stock"));
            
            long pendingQty = orderRepository.findByUserIdAndStockIdAndStatusAndOrderType(
                    userId, stock.getId(), Order.OrderStatus.PENDING, Order.OrderType.SELL)
                    .stream().mapToLong(o -> o.getQuantity() - o.getFilledQuantity()).sum();
            
            long partialQty = orderRepository.findByUserIdAndStockIdAndStatusAndOrderType(
                    userId, stock.getId(), Order.OrderStatus.PARTIALLY_FILLED, Order.OrderType.SELL)
                    .stream().mapToLong(o -> o.getQuantity() - o.getFilledQuantity()).sum();
            
            if (h.getQuantity() - (pendingQty + partialQty) < dto.getQuantity()) {
                throw new RuntimeException("Insufficient available shares");
            }
        }

        Order order = Order.builder()
                .user(user).stock(stock).orderType(orderType).priceType(priceType)
                .quantity(dto.getQuantity()).price(price).totalValue(totalValue)
                .build();
        order = orderRepository.save(order);

        // Try to match immediately for MARKET orders
        if (priceType == Order.PriceType.MARKET) {
            matchOrder(order);
        }

        return toDTO(order);
    }

    @Transactional
    public void matchOrder(Order order) {
        if (order.getStatus() == Order.OrderStatus.EXECUTED || order.getStatus() == Order.OrderStatus.CANCELLED) return;

        Long stockId = order.getStock().getId();
        long remaining = order.getQuantity() - order.getFilledQuantity();
        if (remaining <= 0) return;

        // For BUY orders, look at SELL orders sorted by lowest price first
        // For SELL orders, look at BUY orders sorted by highest price first
        List<Order> counterOrders;
        if (order.getOrderType() == Order.OrderType.BUY) {
            counterOrders = orderRepository.findByStockIdAndStatusAndOrderTypeOrderByPriceAscCreatedAtAsc(
                    stockId, Order.OrderStatus.PENDING, Order.OrderType.SELL);
        } else {
            counterOrders = orderRepository.findByStockIdAndStatusAndOrderTypeOrderByPriceDescCreatedAtAsc(
                    stockId, Order.OrderStatus.PENDING, Order.OrderType.BUY);
        }

        for (Order counter : counterOrders) {
            if (remaining <= 0) break;
            if (counter.getUser().getId().equals(order.getUser().getId())) continue; // skip self-trade

            // Price compatibility check for limit orders
            boolean priceMatch;
            if (order.getOrderType() == Order.OrderType.BUY) {
                // I want to BUY at max `order.getPrice()`. Counter SELL must be <= my price.
                priceMatch = order.getPrice().compareTo(counter.getPrice()) >= 0;
            } else {
                // I want to SELL at min `order.getPrice()`. Counter BUY must be >= my price.
                priceMatch = order.getPrice().compareTo(counter.getPrice()) <= 0;
            }

            if (!priceMatch && order.getPriceType() == Order.PriceType.LIMIT) continue;

            long counterRemaining = counter.getQuantity() - counter.getFilledQuantity();
            long tradeQty = Math.min(remaining, counterRemaining);
            BigDecimal tradePrice = counter.getPrice(); // match at counter's price

            // Execute trade
            User buyer = order.getOrderType() == Order.OrderType.BUY ? order.getUser() : counter.getUser();
            User seller = order.getOrderType() == Order.OrderType.SELL ? order.getUser() : counter.getUser();
            Order buyOrder = order.getOrderType() == Order.OrderType.BUY ? order : counter;
            Order sellOrder = order.getOrderType() == Order.OrderType.SELL ? order : counter;

            tradeService.executeTrade(buyer, seller, order.getStock(), buyOrder, sellOrder, tradeQty, tradePrice);

            // Update fill quantities
            order.setFilledQuantity(order.getFilledQuantity() + tradeQty);
            counter.setFilledQuantity(counter.getFilledQuantity() + tradeQty);

            if (counter.getFilledQuantity().equals(counter.getQuantity())) {
                counter.setStatus(Order.OrderStatus.EXECUTED);
                counter.setExecutedAt(LocalDateTime.now());
            } else {
                counter.setStatus(Order.OrderStatus.PARTIALLY_FILLED);
            }
            orderRepository.save(counter);

            remaining -= tradeQty;
        }

        if (order.getFilledQuantity().equals(order.getQuantity())) {
            order.setStatus(Order.OrderStatus.EXECUTED);
            order.setExecutedAt(LocalDateTime.now());
        } else if (order.getFilledQuantity() > 0) {
            order.setStatus(Order.OrderStatus.PARTIALLY_FILLED);
        }
        // For MARKET orders that couldn't be fully filled, execute against system liquidity with price impact
        if (order.getPriceType() == Order.PriceType.MARKET && order.getFilledQuantity() < order.getQuantity()) {
            long autoFill = order.getQuantity() - order.getFilledQuantity();
            Stock stock = order.getStock();
            BigDecimal currentPrice = stock.getCurrentPrice();
            
            // Calculate Stable Price Impact
            // Impact = (Quantity / CirculatingShares) * IntensityFactor (0.5)
            // Capped at 2% to prevent insane volatility
            double circulating = stock.getCirculatingShares() > 0 ? stock.getCirculatingShares() : 1000000.0;
            double impactRatio = ((double) autoFill / circulating) * 0.5;
            impactRatio = Math.min(impactRatio, 0.02); // Cap at 2% per trade
            
            BigDecimal mp;
            if (order.getOrderType() == Order.OrderType.BUY) {
                mp = currentPrice.multiply(BigDecimal.valueOf(1 + impactRatio)).setScale(2, RoundingMode.HALF_UP);
            } else {
                mp = currentPrice.multiply(BigDecimal.valueOf(1 - impactRatio)).setScale(2, RoundingMode.HALF_UP);
            }
            
            // Ensure minimum price
            if (mp.compareTo(BigDecimal.valueOf(0.05)) < 0) mp = BigDecimal.valueOf(0.05);

            User admin = userRepository.findByEmail("admin@nexora.com").orElseThrow();

            // Self-execute against adjusted market price
            if (order.getOrderType() == Order.OrderType.BUY) {
                BigDecimal reservedForAutoFill = order.getPrice().multiply(BigDecimal.valueOf(autoFill));
                walletService.debitForTrade(order.getUser().getId(), mp.multiply(BigDecimal.valueOf(autoFill)), reservedForAutoFill,
                        "BUY " + autoFill + " " + stock.getSymbol() + " @ ₹" + mp + " (Market Impact)");
                // Update holdings
                tradeService.updateHoldings(order.getUser().getId(), stock.getId(), autoFill, mp, true);
                // Record Trade in ledger
                tradeService.recordTrade(order.getUser(), admin, stock, order, null, autoFill, mp, order.getPriceType());
            } else {
                walletService.creditForTrade(order.getUser().getId(), mp.multiply(BigDecimal.valueOf(autoFill)),
                        "SELL " + autoFill + " " + stock.getSymbol() + " @ ₹" + mp + " (Market Impact)");
                tradeService.updateHoldings(order.getUser().getId(), stock.getId(), autoFill, mp, false);
                // Record Trade in ledger
                tradeService.recordTrade(admin, order.getUser(), stock, null, order, autoFill, mp, order.getPriceType());
            }
            order.setFilledQuantity(order.getQuantity());
            order.setStatus(Order.OrderStatus.EXECUTED);
            order.setExecutedAt(LocalDateTime.now());

            // Update stock price and volume
            stock.setCurrentPrice(mp);
            stock.setDayVolume(stock.getDayVolume() + autoFill);
            if (stock.getDayHigh() == null || mp.compareTo(stock.getDayHigh()) > 0) stock.setDayHigh(mp);
            if (stock.getDayLow() == null || mp.compareTo(stock.getDayLow()) < 0) stock.setDayLow(mp);
            stockRepository.save(stock);
        }
        orderRepository.save(order);

        notificationService.create(order.getUser().getId(), "Order " + order.getStatus().name(),
                order.getOrderType() + " " + order.getQuantity() + " " + order.getStock().getSymbol() + " — " + order.getStatus(),
                Notification.NotificationType.TRADE);
    }

    @Transactional
    public OrderDTO cancelOrder(Long userId, Long orderId) {
        Order order = orderRepository.findById(orderId).orElseThrow(() -> new RuntimeException("Order not found"));
        if (!order.getUser().getId().equals(userId)) throw new RuntimeException("Not your order");
        if (order.getStatus() != Order.OrderStatus.PENDING && order.getStatus() != Order.OrderStatus.PARTIALLY_FILLED)
            throw new RuntimeException("Cannot cancel this order");

        if (order.getOrderType() == Order.OrderType.BUY) {
            long unfilled = order.getQuantity() - order.getFilledQuantity();
            BigDecimal refund = order.getPrice().multiply(BigDecimal.valueOf(unfilled));
            walletService.releaseReserve(userId, refund);
        }
        order.setStatus(Order.OrderStatus.CANCELLED);
        return toDTO(orderRepository.save(order));
    }

    public List<OrderDTO> getMyOrders(Long userId) {
        return orderRepository.findByUserIdOrderByCreatedAtDesc(userId).stream().map(this::toDTO).toList();
    }

    public List<OrderDTO> getAllOrdersForAdmin() {
        return orderRepository.findAll().stream().map(this::toDTO).toList();
    }

    private OrderDTO toDTO(Order o) {
        return OrderDTO.builder()
                .id(o.getId()).stockId(o.getStock().getId()).symbol(o.getStock().getSymbol())
                .stockName(o.getStock().getStartup().getName())
                .orderType(o.getOrderType().name()).priceType(o.getPriceType().name())
                .quantity(o.getQuantity()).filledQuantity(o.getFilledQuantity())
                .price(o.getPrice()).totalValue(o.getTotalValue()).status(o.getStatus().name())
                .createdAt(o.getCreatedAt().toString())
                .executedAt(o.getExecutedAt() != null ? o.getExecutedAt().toString() : null)
                .build();
    }
}
