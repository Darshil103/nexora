package com.nexora.dto;

import lombok.*;
import java.math.BigDecimal;

@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class WalletDTO {
    private Long id;
    private BigDecimal balance;
    private BigDecimal reservedBalance;
    private String currency;
}
