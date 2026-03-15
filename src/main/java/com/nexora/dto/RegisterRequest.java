package com.nexora.dto;

import jakarta.validation.constraints.*;
import lombok.*;

@Data @NoArgsConstructor @AllArgsConstructor
public class RegisterRequest {
    @NotBlank private String username;
    @NotBlank @Email private String email;
    @NotBlank @Size(min = 6) private String password;
    @NotBlank private String fullName;
    private String phone;
    @NotBlank private String userType; // INVESTOR or STARTUP_FOUNDER
}
