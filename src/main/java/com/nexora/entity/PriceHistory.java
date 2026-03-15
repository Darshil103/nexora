package com.nexora.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "price_history", uniqueConstraints = @UniqueConstraint(columnNames = {"stock_id", "date"}))
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class PriceHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "stock_id", nullable = false)
    private Stock stock;

    @Column(nullable = false)
    private LocalDate date;

    @Column(name = "open_price", nullable = false, precision = 10, scale = 2)
    private BigDecimal openPrice;

    @Column(name = "high_price", nullable = false, precision = 10, scale = 2)
    private BigDecimal highPrice;

    @Column(name = "low_price", nullable = false, precision = 10, scale = 2)
    private BigDecimal lowPrice;

    @Column(name = "close_price", nullable = false, precision = 10, scale = 2)
    private BigDecimal closePrice;

    @Column(nullable = false)
    private Long volume;

    @Column(name = "created_at", updatable = false)
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();
}
