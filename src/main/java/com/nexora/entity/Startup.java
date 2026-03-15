package com.nexora.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "startups")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Startup {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "founder_id", nullable = false)
    private User founder;

    @Column(unique = true, nullable = false, length = 100)
    private String name;

    @Column(columnDefinition = "LONGTEXT")
    private String description;

    @Column(length = 50)
    private String industry;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private Stage stage = Stage.SEED;

    @Column(precision = 15, scale = 2)
    private BigDecimal valuation;

    @Column(name = "founded_date")
    private LocalDate foundedDate;

    @Column(name = "employee_count")
    private Integer employeeCount;

    @Column(precision = 15, scale = 2)
    private BigDecimal revenue;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private StartupStatus status = StartupStatus.ACTIVE;

    @Column(name = "created_at", updatable = false)
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at")
    @Builder.Default
    private LocalDateTime updatedAt = LocalDateTime.now();

    @PreUpdate
    protected void onUpdate() { this.updatedAt = LocalDateTime.now(); }

    public enum Stage { SEED, SERIES_A, SERIES_B, GROWTH }
    public enum StartupStatus { PENDING, ACTIVE, INACTIVE, DELISTED }
}
