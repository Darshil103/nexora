package com.nexora.dto;

import lombok.*;
import java.math.BigDecimal;

@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class PortfolioDTO {
    private BigDecimal totalInvested;
    private BigDecimal currentValue;
    private BigDecimal totalPnl;
    private BigDecimal pnlPercentage;
    private int holdingsCount;
}
