package com.nexora.service;

import com.nexora.dto.StockDTO;
import com.nexora.entity.Stock;
import com.nexora.entity.Startup;
import com.nexora.entity.PriceHistory;
import com.nexora.repository.StockRepository;
import com.nexora.repository.StartupRepository;
import com.nexora.repository.PriceHistoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.*;

@Service
@RequiredArgsConstructor
public class StockService {

    private final StockRepository stockRepository;
    private final StartupRepository startupRepository;
    private final PriceHistoryRepository priceHistoryRepository;

    public long countAllStocks() {
        return stockRepository.count();
    }

    public List<StockDTO> getAllActiveStocks() {
        return stockRepository.findByStatus(Stock.StockStatus.ACTIVE).stream().map(this::toDTO).toList();
    }

    public List<StockDTO> getAllStocks() {
        return stockRepository.findAll().stream().map(this::toDTO).toList();
    }

    public StockDTO getBySymbol(String symbol) {
        Stock s = stockRepository.findBySymbol(symbol.toUpperCase())
                .orElseThrow(() -> new RuntimeException("Stock not found: " + symbol));
        return toDTO(s);
    }

    public StockDTO getById(Long id) {
        Stock s = stockRepository.findById(id).orElseThrow(() -> new RuntimeException("Stock not found"));
        return toDTO(s);
    }

    @Transactional
    public void updatePrice(Long stockId, BigDecimal newPrice) {
        Stock s = stockRepository.findById(stockId).orElseThrow(() -> new RuntimeException("Stock not found"));
        s.setCurrentPrice(newPrice);
        if (s.getDayHigh() == null || newPrice.compareTo(s.getDayHigh()) > 0) s.setDayHigh(newPrice);
        if (s.getDayLow() == null || newPrice.compareTo(s.getDayLow()) < 0) s.setDayLow(newPrice);
        if (s.getYearHigh() == null || newPrice.compareTo(s.getYearHigh()) > 0) s.setYearHigh(newPrice);
        if (s.getYearLow() == null || newPrice.compareTo(s.getYearLow()) < 0) s.setYearLow(newPrice);
        stockRepository.save(s);
    }

    @Transactional
    public StockDTO haltStock(Long stockId) {
        Stock s = stockRepository.findById(stockId).orElseThrow(() -> new RuntimeException("Stock not found"));
        s.setStatus(Stock.StockStatus.HALTED);
        return toDTO(stockRepository.save(s));
    }

    @Transactional
    public StockDTO activateStock(Long stockId) {
        Stock s = stockRepository.findById(stockId).orElseThrow(() -> new RuntimeException("Stock not found"));
        s.setStatus(Stock.StockStatus.ACTIVE);
        return toDTO(stockRepository.save(s));
    }

    public List<Map<String, Object>> getPriceHistory(Long stockId, String period) {
        LocalDate end = LocalDate.now();
        LocalDate start = switch (period != null ? period : "1M") {
            case "1W" -> end.minusWeeks(1);
            case "3M" -> end.minusMonths(3);
            case "1Y" -> end.minusYears(1);
            case "ALL" -> end.minusYears(10);
            default -> end.minusMonths(1);
        };
        return priceHistoryRepository.findByStockIdAndDateBetweenOrderByDateAsc(stockId, start, end)
                .stream().map(ph -> {
                    Map<String, Object> m = new HashMap<>();
                    m.put("date", ph.getDate().toString());
                    m.put("open", ph.getOpenPrice());
                    m.put("high", ph.getHighPrice());
                    m.put("low", ph.getLowPrice());
                    m.put("close", ph.getClosePrice());
                    m.put("volume", ph.getVolume());
                    return m;
                }).toList();
    }

    private StockDTO toDTO(Stock s) {
        Startup startup = s.getStartup();
        // Calculate change based on price history
        BigDecimal change = BigDecimal.ZERO;
        List<PriceHistory> history = priceHistoryRepository.findByStockIdOrderByDateAsc(s.getId());
        if (!history.isEmpty()) {
            BigDecimal prevClose = history.get(history.size() - 1).getClosePrice();
            if (prevClose.compareTo(BigDecimal.ZERO) > 0) {
                change = s.getCurrentPrice().subtract(prevClose)
                        .divide(prevClose, 4, RoundingMode.HALF_UP)
                        .multiply(BigDecimal.valueOf(100));
            }
        }

        return StockDTO.builder()
                .id(s.getId())
                .startupId(startup.getId())
                .startupName(startup.getName())
                .description(startup.getDescription())
                .symbol(s.getSymbol())
                .currentPrice(s.getCurrentPrice())
                .totalShares(s.getTotalShares())
                .circulatingShares(s.getCirculatingShares())
                .dayHigh(s.getDayHigh())
                .dayLow(s.getDayLow())
                .yearHigh(s.getYearHigh())
                .yearLow(s.getYearLow())
                .dayVolume(s.getDayVolume())
                .status(s.getStatus().name())
                .industry(startup.getIndustry())
                .stage(startup.getStage().name())
                .valuation(startup.getValuation())
                .revenue(startup.getRevenue())
                .employeeCount(startup.getEmployeeCount())
                .foundedDate(startup.getFoundedDate() != null ? startup.getFoundedDate().toString() : null)
                .change(change)
                .createdAt(s.getCreatedAt())
                .build();
    }
}
