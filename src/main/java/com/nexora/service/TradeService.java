package com.nexora.service;

import com.nexora.dto.TradeDTO;
import com.nexora.entity.*;
import com.nexora.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.time.LocalDate;
import java.util.List;
import java.util.ArrayList;
import java.util.Map;
import java.util.HashMap;
import java.util.Collections;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TradeService {

    private final TradeRepository tradeRepository;
    private final HoldingRepository holdingRepository;
    private final StockRepository stockRepository;
    private final WalletService walletService;
    private final AuditService auditService;

    @Transactional
    public void executeTrade(User buyer, User seller, Stock stock, Order buyOrder, Order sellOrder,
                            long quantity, BigDecimal tradePrice) {
        BigDecimal totalValue = tradePrice.multiply(BigDecimal.valueOf(quantity));

        // Create trade record
        recordTrade(buyer, seller, stock, buyOrder, sellOrder, quantity, tradePrice, buyOrder.getPriceType());

        // Wallet operations
        BigDecimal reservedAmount = buyOrder.getPrice().multiply(BigDecimal.valueOf(quantity));
        walletService.debitForTrade(buyer.getId(), totalValue, reservedAmount,
                "BUY " + quantity + " " + stock.getSymbol() + " @ ₹" + tradePrice);
        walletService.creditForTrade(seller.getId(), totalValue,
                "SELL " + quantity + " " + stock.getSymbol() + " @ ₹" + tradePrice);

        // Update holdings
        updateHoldings(buyer.getId(), stock.getId(), quantity, tradePrice, true);
        updateHoldings(seller.getId(), stock.getId(), quantity, tradePrice, false);

        // Update stock price and volume
        stock.setCurrentPrice(tradePrice);
        stock.setDayVolume(stock.getDayVolume() + quantity);
        if (stock.getDayHigh() == null || tradePrice.compareTo(stock.getDayHigh()) > 0) stock.setDayHigh(tradePrice);
        if (stock.getDayLow() == null || tradePrice.compareTo(stock.getDayLow()) < 0) stock.setDayLow(tradePrice);
        stockRepository.save(stock);

        auditService.logAction(buyer, "BUY_TRADE", "STOCK", stock.getId(), 
                null, quantity + " shares @ ₹" + tradePrice, "MATCHMAKING");
        auditService.logAction(seller, "SELL_TRADE", "STOCK", stock.getId(), 
                null, quantity + " shares @ ₹" + tradePrice, "MATCHMAKING");
    }

    @Transactional
    public Trade recordTrade(User buyer, User seller, Stock stock, Order buyOrder, Order sellOrder,
                             long quantity, BigDecimal price, Order.PriceType tradeType) {
        Trade trade = Trade.builder()
                .buyer(buyer).seller(seller).stock(stock)
                .buyOrder(buyOrder).sellOrder(sellOrder)
                .quantity(quantity).price(price).totalValue(price.multiply(BigDecimal.valueOf(quantity)))
                .tradeType(tradeType)
                .build();
        return tradeRepository.save(trade);
    }

    @Transactional
    public void updateHoldings(Long userId, Long stockId, long quantity, BigDecimal price, boolean isBuy) {
        var existing = holdingRepository.findByUserIdAndStockId(userId, stockId);
        if (isBuy) {
            if (existing.isPresent()) {
                Holding h = existing.get();
                BigDecimal totalCost = h.getAverageCost().multiply(BigDecimal.valueOf(h.getQuantity()))
                        .add(price.multiply(BigDecimal.valueOf(quantity)));
                long newQty = h.getQuantity() + quantity;
                h.setQuantity(newQty);
                h.setAverageCost(totalCost.divide(BigDecimal.valueOf(newQty), 2, RoundingMode.HALF_UP));
                holdingRepository.save(h);
            } else {
                Stock stock = stockRepository.findById(stockId).orElseThrow();
                User user = new User(); user.setId(userId);
                Holding h = Holding.builder()
                        .user(user).stock(stock)
                        .quantity(quantity).averageCost(price).build();
                holdingRepository.save(h);
            }
        } else {
            if (existing.isPresent()) {
                Holding h = existing.get();
                long newQty = h.getQuantity() - quantity;
                if (newQty <= 0) {
                    holdingRepository.delete(h);
                } else {
                    h.setQuantity(newQty);
                    holdingRepository.save(h);
                }
            }
        }
    }

    public List<TradeDTO> getAllTrades() {
        return tradeRepository.findAllByOrderByCreatedAtDesc().stream().map(this::toDTO).toList();
    }

    public List<TradeDTO> getMyTrades(Long userId) {
        return tradeRepository.findByBuyerIdOrSellerIdOrderByCreatedAtDesc(userId, userId)
                .stream().map(this::toDTO).toList();
    }

    public BigDecimal getTotalVolume24h() {
        return tradeRepository.sumTotalValueSince(LocalDateTime.now().minusHours(24));
    }

    public long getTradeCount24h() {
        return tradeRepository.countSince(LocalDateTime.now().minusHours(24));
    }

    public List<Map<String, Object>> getDailyVolume(int days) {
        LocalDateTime since = LocalDateTime.now().minusDays(days);
        List<Trade> trades = tradeRepository.findByCreatedAtAfter(since);
        
        Map<LocalDate, List<Trade>> byDate = trades.stream()
            .collect(Collectors.groupingBy(t -> t.getCreatedAt().toLocalDate()));
        
        List<Map<String, Object>> result = new ArrayList<>();
        for (int i = 0; i < days; i++) {
            LocalDate date = LocalDate.now().minusDays(days - 1 - i);
            List<Trade> dayTrades = byDate.getOrDefault(date, Collections.emptyList());
            
            BigDecimal volume = dayTrades.stream()
                .map(Trade::getTotalValue)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
            
            Map<String, Object> day = new HashMap<>();
            day.put("date", date.getMonth().name().substring(0, 3) + " " + date.getDayOfMonth());
            day.put("volume", volume);
            day.put("trades", dayTrades.size());
            result.add(day);
        }
        return result;
    }

    private TradeDTO toDTO(Trade t) {
        return TradeDTO.builder()
                .id(t.getId()).buyerName(t.getBuyer().getFullName())
                .sellerName(t.getSeller().getFullName())
                .symbol(t.getStock().getSymbol())
                .stockName(t.getStock().getStartup().getName())
                .quantity(t.getQuantity()).price(t.getPrice()).totalValue(t.getTotalValue())
                .tradeType(t.getTradeType().name()).status(t.getStatus().name())
                .createdAt(t.getCreatedAt().toString()).build();
    }
}
