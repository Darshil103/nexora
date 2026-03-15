package com.nexora.repository;

import com.nexora.entity.PriceHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import java.time.LocalDate;
import java.util.List;

public interface PriceHistoryRepository extends JpaRepository<PriceHistory, Long> {
    List<PriceHistory> findByStockIdOrderByDateAsc(Long stockId);
    List<PriceHistory> findByStockIdAndDateBetweenOrderByDateAsc(Long stockId, LocalDate start, LocalDate end);
}
