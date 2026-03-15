package com.nexora.controller;

import com.nexora.dto.ApiResponse;
import com.nexora.dto.StartupDTO;
import com.nexora.security.CurrentUser;
import com.nexora.service.StartupService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/startups")
@RequiredArgsConstructor
public class StartupController {

    private final StartupService startupService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<StartupDTO>>> getAllStartups() {
        return ResponseEntity.ok(ApiResponse.success(startupService.getAllStartups()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<StartupDTO>> getStartup(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(startupService.getById(id)));
    }

    @GetMapping("/founder/{founderId}")
    public ResponseEntity<ApiResponse<List<StartupDTO>>> getByFounder(@PathVariable Long founderId) {
        return ResponseEntity.ok(ApiResponse.success(startupService.getByFounder(founderId)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<StartupDTO>> createStartup(@CurrentUser Long userId, @RequestBody StartupDTO dto) {
        if (userId == null) {
            return ResponseEntity.ok(ApiResponse.error("Unauthorized: Please login first"));
        }
        return ResponseEntity.ok(ApiResponse.success("Startup created", startupService.createStartup(dto, userId)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<StartupDTO>> updateStartup(@CurrentUser Long userId, @PathVariable Long id, @RequestBody StartupDTO dto) {
        if (userId == null) {
            return ResponseEntity.ok(ApiResponse.error("Unauthorized: Please login first"));
        }
        return ResponseEntity.ok(ApiResponse.success("Startup updated", startupService.updateStartup(id, dto, userId)));
    }
}
