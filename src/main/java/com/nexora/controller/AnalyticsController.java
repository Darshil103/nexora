package com.nexora.controller;

import com.nexora.dto.ApiResponse;
import com.nexora.service.AnalyticsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/analytics")
@RequiredArgsConstructor
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    @GetMapping("/overview")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getSystemOverview() {
        return ResponseEntity.ok(ApiResponse.success(analyticsService.getSystemOverview()));
    }

    @GetMapping("/top-stocks")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getTopStocks() {
        return ResponseEntity.ok(ApiResponse.success(analyticsService.getTopPerformingStocks()));
    }
}

