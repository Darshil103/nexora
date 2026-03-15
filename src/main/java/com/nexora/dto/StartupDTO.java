package com.nexora.dto;

import lombok.*;
import java.math.BigDecimal;

@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class StartupDTO {
    private Long id;
    private Long founderId;
    private String founderName;
    private String name;
    private String description;
    private String industry;
    private String stage;
    private BigDecimal valuation;
    private String foundedDate;
    private Integer employeeCount;
    private BigDecimal revenue;
    private String status;
    private String stockSymbol;
    private BigDecimal stockPrice;
    private String createdAt;
}
