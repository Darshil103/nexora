package com.nexora.dto;

import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class UserDTO {
    private Long id;
    private String username;
    private String email;
    private String fullName;
    private String phone;
    private String userType;
    private String status;
    private String kycStatus;
    private String panNumber;
    private String aadhaarNumber;
    private LocalDate kycApprovedDate;
    private LocalDateTime createdAt;
}
