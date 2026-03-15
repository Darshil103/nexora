package com.nexora.dto;

import lombok.*;
import java.math.BigDecimal;

@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class TradeDTO {
    private Long id;
    private String buyerName;
    private String sellerName;
    private String symbol;
    private String stockName;
    private Long quantity;
    private BigDecimal price;
    private BigDecimal totalValue;
    private String tradeType;
    private String status;
    private String createdAt;
}
