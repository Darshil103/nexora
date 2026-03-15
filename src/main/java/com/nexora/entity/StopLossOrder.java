package com.nexora.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "stop_loss_orders")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class StopLossOrder {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "stock_id", nullable = false)
    private Stock stock;

    @Column(name = "trigger_price", nullable = false, precision = 10, scale = 2)
    private BigDecimal triggerPrice;

    @Column(nullable = false)
    private Long quantity;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private StopLossStatus status = StopLossStatus.PENDING;

    @Column(name = "created_at", updatable = false)
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "triggered_at")
    private LocalDateTime triggeredAt;

    public enum StopLossStatus { PENDING, TRIGGERED, CANCELLED }
}
