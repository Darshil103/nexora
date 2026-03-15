package com.nexora.dto;
import lombok.*;
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class ErrorResponse {
    private int status;
    private String message;
    private String timestamp;
}
