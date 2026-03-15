package com.nexora.dto;
import lombok.*;
import java.math.BigDecimal;
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class PerformanceDTO {
    private BigDecimal totalReturn;
    private BigDecimal returnPercentage;
    private String period;
}
