package com.nexora.controller;

import com.nexora.dto.ApiResponse;
import com.nexora.service.ReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
public class ReportController {

    private final ReportService reportService;

    @GetMapping("/portfolio/{userId}")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getPortfolioReport(@PathVariable Long userId) {
        return ResponseEntity.ok(ApiResponse.success(reportService.getUserPortfolioReport(userId)));
    }

    @GetMapping("/trades/{userId}")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getTradeHistoryReport(@PathVariable Long userId) {
        return ResponseEntity.ok(ApiResponse.success(reportService.getUserTradeHistoryReport(userId)));
    }

    @GetMapping("/portfolio-trend/{userId}")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getPortfolioTrend(@PathVariable Long userId) {
        return ResponseEntity.ok(ApiResponse.success(reportService.getPortfolioTrend(userId)));
    }
}

