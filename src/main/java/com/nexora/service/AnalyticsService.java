package com.nexora.service;

import com.nexora.entity.Stock;
import com.nexora.repository.StockRepository;
import com.nexora.repository.TradeRepository;
import com.nexora.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AnalyticsService {

    private final UserRepository userRepository;
    private final StockRepository stockRepository;
    private final TradeRepository tradeRepository;

    @Transactional(readOnly = true)
    public Map<String, Object> getSystemOverview() {
        Map<String, Object> overview = new HashMap<>();
        overview.put("totalUsers", userRepository.count());
        overview.put("activeStocks", stockRepository.findByStatus(Stock.StockStatus.ACTIVE).size());
        
        LocalDateTime twentyFourHoursAgo = LocalDateTime.now().minusHours(24);
        overview.put("tradeVolume24h", tradeRepository.sumTotalValueSince(twentyFourHoursAgo));
        overview.put("tradeCount24h", tradeRepository.countSince(twentyFourHoursAgo));
        
        return overview;
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> getTopPerformingStocks() {
        List<Stock> activeStocks = stockRepository.findByStatus(Stock.StockStatus.ACTIVE);
        
        // Sort by current price descending
        return activeStocks.stream()
                .sorted((s1, s2) -> s2.getCurrentPrice().compareTo(s1.getCurrentPrice()))
                .limit(5)
                .map(stock -> {
                    Map<String, Object> map = new HashMap<>();
                    map.put("id", stock.getId());
                    map.put("symbol", stock.getSymbol());
                    map.put("price", stock.getCurrentPrice());
                    map.put("dayHigh", stock.getDayHigh());
                    map.put("dayLow", stock.getDayLow());
                    map.put("dayVolume", stock.getDayVolume());
                    return map;
                })
                .collect(Collectors.toList());
    }
}
