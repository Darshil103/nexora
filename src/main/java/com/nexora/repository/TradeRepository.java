package com.nexora.repository;

import com.nexora.entity.Trade;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public interface TradeRepository extends JpaRepository<Trade, Long> {
    List<Trade> findByBuyerIdOrSellerIdOrderByCreatedAtDesc(Long buyerId, Long sellerId);
    List<Trade> findByStockIdOrderByCreatedAtDesc(Long stockId);
    List<Trade> findAllByOrderByCreatedAtDesc();
    List<Trade> findByCreatedAtAfter(LocalDateTime since);
    @Query("SELECT COALESCE(SUM(t.totalValue), 0) FROM Trade t WHERE t.createdAt >= :since")
    BigDecimal sumTotalValueSince(LocalDateTime since);
    @Query("SELECT COUNT(t) FROM Trade t WHERE t.createdAt >= :since")
    long countSince(LocalDateTime since);
}
