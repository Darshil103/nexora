package com.nexora.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "stocks")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Stock {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "startup_id", nullable = false, unique = true)
    private Startup startup;

    @Column(unique = true, nullable = false, length = 10)
    private String symbol;

    @Column(name = "current_price", nullable = false, precision = 10, scale = 2)
    private BigDecimal currentPrice;

    @Column(name = "total_shares", nullable = false)
    private Long totalShares;

    @Column(name = "circulating_shares", nullable = false)
    private Long circulatingShares;

    @Column(name = "day_high", precision = 10, scale = 2)
    private BigDecimal dayHigh;

    @Column(name = "day_low", precision = 10, scale = 2)
    private BigDecimal dayLow;

    @Column(name = "year_high", precision = 10, scale = 2)
    private BigDecimal yearHigh;

    @Column(name = "year_low", precision = 10, scale = 2)
    private BigDecimal yearLow;

    @Column(name = "day_volume")
    @Builder.Default
    private Long dayVolume = 0L;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private StockStatus status = StockStatus.ACTIVE;

    @Column(name = "created_at", updatable = false)
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at")
    @Builder.Default
    private LocalDateTime updatedAt = LocalDateTime.now();

    @PreUpdate
    protected void onUpdate() { this.updatedAt = LocalDateTime.now(); }

    public enum StockStatus { ACTIVE, INACTIVE, HALTED }
}
