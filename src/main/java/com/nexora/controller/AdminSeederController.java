package com.nexora.controller;

import com.nexora.entity.PriceHistory;
import com.nexora.entity.Stock;
import com.nexora.repository.PriceHistoryRepository;
import com.nexora.repository.StockRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminSeederController {

    private final StockRepository stockRepository;
    private final PriceHistoryRepository priceHistoryRepository;

    @PostMapping("/seed-price-history")
    public ResponseEntity<String> seedPriceHistory() {
        if (priceHistoryRepository.count() > 0) {
            priceHistoryRepository.deleteAll(); // clear old/demo price history
        }

        List<Stock> stocks = stockRepository.findAll();
        for (Stock stock : stocks) {
            seedPriceHistoryForStock(stock, 30);
        }

        return ResponseEntity.ok("Seeded price history for " + stocks.size() + " stocks over 30 days.");
    }

    private void seedPriceHistoryForStock(Stock stock, int days) {
        // Assume current price is the latest price. We generate prices backwards to simulate a trend.
        // We'll simulate a general upward trend of about 10-15% over the 30 days.
        BigDecimal endPrice = stock.getCurrentPrice();
        BigDecimal startPrice = endPrice.multiply(BigDecimal.valueOf(0.85)); // 15% lower 30 days ago

        BigDecimal step = endPrice.subtract(startPrice).divide(BigDecimal.valueOf(days), 2, RoundingMode.HALF_UP);
        
        for (int i = days; i >= 0; i--) {
            LocalDate date = LocalDate.now().minusDays(i);
            
            BigDecimal base = startPrice.add(step.multiply(BigDecimal.valueOf(days - i)));
            BigDecimal variance = base.multiply(new BigDecimal("0.02")); // 2% daily variance
            
            BigDecimal open = base.subtract(variance.multiply(BigDecimal.valueOf(Math.random())));
            BigDecimal close = i == 0 ? endPrice : base.add(variance.multiply(BigDecimal.valueOf(Math.random())));
            BigDecimal high = open.max(close).add(variance);
            BigDecimal low = open.min(close).subtract(variance);
            
            long volume = 50000 + (long) (Math.random() * 200000);

            priceHistoryRepository.save(PriceHistory.builder()
                    .stock(stock)
                    .date(date)
                    .openPrice(open.setScale(2, RoundingMode.HALF_UP))
                    .highPrice(high.setScale(2, RoundingMode.HALF_UP))
                    .lowPrice(low.setScale(2, RoundingMode.HALF_UP))
                    .closePrice(close.setScale(2, RoundingMode.HALF_UP))
                    .volume(volume)
                    .build());
        }
    }
}
