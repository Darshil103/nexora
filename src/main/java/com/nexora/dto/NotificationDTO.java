package com.nexora.dto;

import lombok.*;

@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class NotificationDTO {
    private Long id;
    private String title;
    private String message;
    private String type;
    private Boolean isRead;
    private String createdAt;
}
