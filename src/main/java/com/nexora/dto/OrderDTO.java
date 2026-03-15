package com.nexora.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.*;
import lombok.*;
import java.math.BigDecimal;

@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class OrderDTO {
    private Long id;
    @NotNull 
    @JsonProperty("stock_id")
    private Long stockId;
    
    private String symbol;
    private String stockName;
    
    @NotBlank 
    @JsonProperty("order_type")
    private String orderType; // BUY or SELL
    
    @NotBlank 
    @JsonProperty("price_type")
    private String priceType; // MARKET or LIMIT
    
    @NotNull @Min(1) 
    private Long quantity;
    
    @JsonProperty("filled_quantity")
    private Long filledQuantity;
    private BigDecimal price;
    private BigDecimal totalValue;
    private String status;
    private String createdAt;
    private String executedAt;
}
