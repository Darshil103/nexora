package com.nexora.dto;

import lombok.*;
import java.math.BigDecimal;

@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class IPOApplicationDTO {
    private Long id;
    private Long ipoId;
    private String startupName;
    private String symbol;
    private Long sharesApplied;
    private BigDecimal amount;
    private Long sharesAllotted;
    private String status;
    private String createdAt;
}
