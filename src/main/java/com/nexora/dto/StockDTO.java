package com.nexora.dto;

import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class StockDTO {
    private Long id;
    private Long startupId;
    private String startupName;
    private String description;
    private String symbol;
    private BigDecimal currentPrice;
    private Long totalShares;
    private Long circulatingShares;
    private BigDecimal dayHigh;
    private BigDecimal dayLow;
    private BigDecimal yearHigh;
    private BigDecimal yearLow;
    private Long dayVolume;
    private String status;
    private String industry;
    private String stage;
    private BigDecimal valuation;
    private BigDecimal revenue;
    private Integer employeeCount;
    private String foundedDate;
    private BigDecimal change; // percentage change
    private LocalDateTime createdAt;
}
