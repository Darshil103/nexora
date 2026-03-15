package com.nexora.dto;

import lombok.*;
import java.math.BigDecimal;

@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class DividendDTO {
    private Long id;
    private Long startupId;
    private String startupName;
    private String symbol;
    private BigDecimal dividendPerShare;
    private BigDecimal totalAmount;
    private String announcementDate;
    private String paymentDate;
    private String status;
}
