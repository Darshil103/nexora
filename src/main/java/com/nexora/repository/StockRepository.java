package com.nexora.repository;

import com.nexora.entity.Stock;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface StockRepository extends JpaRepository<Stock, Long> {
    Optional<Stock> findBySymbol(String symbol);
    List<Stock> findByStatus(Stock.StockStatus status);
    Optional<Stock> findByStartupId(Long startupId);
    boolean existsBySymbol(String symbol);
}
