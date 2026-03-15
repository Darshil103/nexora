package com.nexora.dto;
import lombok.*;
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class KYCStatusDTO {
    private String kycStatus;
    private String panNumber;
    private String aadhaarNumber;
    private String kycApprovedDate;
}
