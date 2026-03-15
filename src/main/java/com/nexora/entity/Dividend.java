package com.nexora.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "dividends")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Dividend {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "startup_id", nullable = false)
    private Startup startup;

    @Column(name = "dividend_per_share", nullable = false, precision = 10, scale = 2)
    private BigDecimal dividendPerShare;

    @Column(name = "total_amount", nullable = false, precision = 15, scale = 2)
    private BigDecimal totalAmount;

    @Column(name = "announcement_date", nullable = false)
    private LocalDate announcementDate;

    @Column(name = "payment_date", nullable = false)
    private LocalDate paymentDate;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private DividendStatus status = DividendStatus.ANNOUNCED;

    @Column(name = "created_at", updatable = false)
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    public enum DividendStatus { ANNOUNCED, PAID, CANCELLED }
}
