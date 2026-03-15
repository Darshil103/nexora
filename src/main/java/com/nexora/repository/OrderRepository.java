package com.nexora.repository;

import com.nexora.entity.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface OrderRepository extends JpaRepository<Order, Long> {
    List<Order> findByUserIdOrderByCreatedAtDesc(Long userId);
    List<Order> findByStockIdAndStatusAndOrderTypeOrderByPriceAscCreatedAtAsc(Long stockId, Order.OrderStatus status, Order.OrderType orderType);
    List<Order> findByStockIdAndStatusAndOrderTypeOrderByPriceDescCreatedAtAsc(Long stockId, Order.OrderStatus status, Order.OrderType orderType);
    List<Order> findByStatusIn(List<Order.OrderStatus> statuses);
    long countByStatus(Order.OrderStatus status);
    List<Order> findByUserIdAndStockIdAndStatusAndOrderType(Long userId, Long stockId, Order.OrderStatus status, Order.OrderType orderType);
}

