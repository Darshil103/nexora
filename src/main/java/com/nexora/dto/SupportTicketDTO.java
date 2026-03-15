package com.nexora.dto;

import lombok.*;

@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class SupportTicketDTO {
    private Long id;
    private Long userId;
    private String userName;
    private String category;
    private String subject;
    private String description;
    private String status;
    private String priority;
    private String assignedToName;
    private String createdAt;
    private String updatedAt;
}
