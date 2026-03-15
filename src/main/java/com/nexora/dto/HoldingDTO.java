package com.nexora.dto;

import lombok.*;
import java.math.BigDecimal;

@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class HoldingDTO {
    private Long id;
    private Long stockId;
    private String symbol;
    private String name;
    private Long quantity;
    private BigDecimal averageCost;
    private BigDecimal currentPrice;
    private BigDecimal currentValue;
    private BigDecimal pnl;
    private BigDecimal pnlPercentage;
}
