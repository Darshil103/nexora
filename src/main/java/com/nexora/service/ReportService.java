package com.nexora.service;

import com.nexora.entity.Holding;
import com.nexora.entity.Trade;
import com.nexora.entity.PriceHistory;
import com.nexora.repository.HoldingRepository;
import com.nexora.repository.PriceHistoryRepository;
import com.nexora.repository.TradeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReportService {

    private final HoldingRepository holdingRepository;
    private final TradeRepository tradeRepository;
    private final PriceHistoryRepository priceHistoryRepository;

    @Transactional(readOnly = true)
    public Map<String, Object> getUserPortfolioReport(Long userId) {
        List<Holding> holdings = holdingRepository.findByUserId(userId);

        BigDecimal totalInvested = BigDecimal.ZERO;
        BigDecimal currentValue = BigDecimal.ZERO;

        List<Map<String, Object>> holdingDetails = holdings.stream().map(h -> {
            Map<String, Object> map = new HashMap<>();
            map.put("symbol", h.getStock().getSymbol());
            map.put("quantity", h.getQuantity());
            map.put("averageCost", h.getAverageCost());
            map.put("currentPrice", h.getStock().getCurrentPrice());

            BigDecimal invested = h.getAverageCost().multiply(BigDecimal.valueOf(h.getQuantity()));
            BigDecimal current = h.getStock().getCurrentPrice().multiply(BigDecimal.valueOf(h.getQuantity()));
            map.put("totalInvested", invested);
            map.put("currentValue", current);
            
            BigDecimal profitLoss = current.subtract(invested);
            map.put("profitLoss", profitLoss);

            BigDecimal profitLossPercentage = BigDecimal.ZERO;
            if (invested.compareTo(BigDecimal.ZERO) > 0) {
                profitLossPercentage = profitLoss.divide(invested, 4, RoundingMode.HALF_UP).multiply(BigDecimal.valueOf(100));
            }
            map.put("profitLossPercentage", profitLossPercentage);

            return map;
        }).collect(Collectors.toList());

        for (Map<String, Object> detail : holdingDetails) {
            totalInvested = totalInvested.add((BigDecimal) detail.get("totalInvested"));
            currentValue = currentValue.add((BigDecimal) detail.get("currentValue"));
        }

        BigDecimal totalProfitLoss = currentValue.subtract(totalInvested);
        BigDecimal totalProfitLossPercentage = BigDecimal.ZERO;
        if (totalInvested.compareTo(BigDecimal.ZERO) > 0) {
            totalProfitLossPercentage = totalProfitLoss.divide(totalInvested, 4, RoundingMode.HALF_UP).multiply(BigDecimal.valueOf(100));
        }

        Map<String, Object> report = new HashMap<>();
        report.put("holdings", holdingDetails);
        report.put("totalInvested", totalInvested);
        report.put("currentValue", currentValue);
        report.put("totalProfitLoss", totalProfitLoss);
        report.put("totalProfitLossPercentage", totalProfitLossPercentage);

        return report;
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> getUserTradeHistoryReport(Long userId) {
        List<Trade> trades = tradeRepository.findByBuyerIdOrSellerIdOrderByCreatedAtDesc(userId, userId);

        return trades.stream().map(trade -> {
            Map<String, Object> map = new HashMap<>();
            map.put("tradeId", trade.getId());
            map.put("symbol", trade.getStock().getSymbol());
            map.put("quantity", trade.getQuantity());
            map.put("price", trade.getPrice());
            map.put("totalValue", trade.getTotalValue());
            map.put("date", trade.getCreatedAt());
            
            String type = trade.getBuyer().getId().equals(userId) ? "BUY" : "SELL";
            map.put("type", type);
            
            return map;
        }).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> getPortfolioTrend(Long userId) {
        List<Trade> trades = tradeRepository.findByBuyerIdOrSellerIdOrderByCreatedAtDesc(userId, userId);
        if (trades.isEmpty()) return Collections.emptyList();

        // We want chronological order (oldest first)
        List<Trade> chronologicalTrades = new ArrayList<>(trades);
        Collections.reverse(chronologicalTrades);

        List<Map<String, Object>> trend = new ArrayList<>();
        Map<Long, Long> currentHoldings = new HashMap<>();
        Map<Long, BigDecimal> lastPrices = new HashMap<>();

        java.time.format.DateTimeFormatter formatter = java.time.format.DateTimeFormatter.ofPattern("MMM dd HH:mm");

        for (Trade t : chronologicalTrades) {
            Long stockId = t.getStock().getId();
            BigDecimal price = t.getPrice();
            boolean isBuy = t.getBuyer().getId().equals(userId);
            long qty = t.getQuantity();

            currentHoldings.put(stockId, currentHoldings.getOrDefault(stockId, 0L) + (isBuy ? qty : -qty));
            lastPrices.put(stockId, price);

            BigDecimal portfolioValue = BigDecimal.ZERO;
            for (Map.Entry<Long, Long> entry : currentHoldings.entrySet()) {
                if (entry.getValue() > 0) {
                    portfolioValue = portfolioValue.add(
                        lastPrices.get(entry.getKey()).multiply(BigDecimal.valueOf(entry.getValue()))
                    );
                }
            }

            Map<String, Object> point = new HashMap<>();
            point.put("date", t.getCreatedAt().format(formatter));
            point.put("value", portfolioValue.setScale(2, RoundingMode.HALF_UP));
            trend.add(point);
        }

        // Add a final point for "Now" valuing current holdings at actual current stock prices
        List<Holding> actualHoldings = holdingRepository.findByUserId(userId);
        BigDecimal currentPortfolioValue = BigDecimal.ZERO;
        for (Holding h : actualHoldings) {
            currentPortfolioValue = currentPortfolioValue.add(
                h.getStock().getCurrentPrice().multiply(BigDecimal.valueOf(h.getQuantity()))
            );
        }

        Map<String, Object> nowPoint = new HashMap<>();
        nowPoint.put("date", "Now");
        nowPoint.put("value", currentPortfolioValue.setScale(2, RoundingMode.HALF_UP));
        trend.add(nowPoint);

        return trend;
    }
}
