package com.nexora.controller;

import com.nexora.dto.*;
import com.nexora.service.UserService;
import com.nexora.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;
    private final JwtUtil jwtUtil;

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<UserDTO>> getMe(Authentication auth) {
        return ResponseEntity.ok(ApiResponse.success(userService.getUserByEmail(auth.getName())));
    }

    @PutMapping("/me")
    public ResponseEntity<ApiResponse<UserDTO>> updateProfile(Authentication auth, @RequestBody UserDTO dto) {
        UserDTO me = userService.getUserByEmail(auth.getName());
        return ResponseEntity.ok(ApiResponse.success(userService.updateProfile(me.getId(), dto)));
    }

    @PostMapping("/kyc")
    public ResponseEntity<ApiResponse<UserDTO>> submitKyc(Authentication auth, @RequestBody Map<String, String> body) {
        UserDTO me = userService.getUserByEmail(auth.getName());
        return ResponseEntity.ok(ApiResponse.success("KYC submitted",
                userService.submitKyc(me.getId(), body.get("pan_number"), body.get("aadhaar_number"), body.get("address_proof"))));
    }

    @PostMapping("/change-password")
    public ResponseEntity<ApiResponse<String>> changePassword(Authentication auth, @RequestBody Map<String, String> body) {
        try {
            UserDTO me = userService.getUserByEmail(auth.getName());
            userService.changePassword(me.getId(), body.get("oldPassword"), body.get("newPassword"));
            return ResponseEntity.ok(ApiResponse.success("Password changed", null));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }
}
