package com.nexora.dto;

import lombok.*;
import java.math.BigDecimal;

@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class IPOListingDTO {
    private Long id;
    private Long stockId;
    private String symbol;
    private String startupName;
    private String industry;
    private BigDecimal ipoPrice;
    private BigDecimal minPrice;
    private BigDecimal maxPrice;
    private Long sharesOffered;
    private String openDate;
    private String closeDate;
    private String status;
}
