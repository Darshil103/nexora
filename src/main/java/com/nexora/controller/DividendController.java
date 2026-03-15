package com.nexora.controller;

import com.nexora.dto.*;
import com.nexora.service.DividendService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/dividends")
@RequiredArgsConstructor
public class DividendController {

    private final DividendService dividendService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<DividendDTO>>> getAllDividends() {
        return ResponseEntity.ok(ApiResponse.success(dividendService.getAllDividends()));
    }

    @GetMapping("/startup/{startupId}")
    public ResponseEntity<ApiResponse<List<DividendDTO>>> getByStartup(@PathVariable Long startupId) {
        return ResponseEntity.ok(ApiResponse.success(dividendService.getByStartup(startupId)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<DividendDTO>> announce(@RequestBody Map<String, String> body) {
        try {
            Long startupId = Long.valueOf(body.get("startupId"));
            BigDecimal dps = new BigDecimal(body.get("dividendPerShare"));
            String paymentDate = body.get("paymentDate");
            return ResponseEntity.ok(ApiResponse.success("Dividend announced", dividendService.announce(startupId, dps, paymentDate)));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }
}
