package com.nexora.repository;

import com.nexora.entity.StopLossOrder;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface StopLossOrderRepository extends JpaRepository<StopLossOrder, Long> {
    List<StopLossOrder> findByUserIdOrderByCreatedAtDesc(Long userId);
    List<StopLossOrder> findByStockIdAndStatus(Long stockId, StopLossOrder.StopLossStatus status);
}
