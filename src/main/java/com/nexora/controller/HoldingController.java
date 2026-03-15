package com.nexora.controller;

import com.nexora.dto.*;
import com.nexora.service.HoldingService;
import com.nexora.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/holdings")
@RequiredArgsConstructor
public class HoldingController {

    private final HoldingService holdingService;
    private final UserService userService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<HoldingDTO>>> getMyHoldings(Authentication auth) {
        Long userId = userService.getUserByEmail(auth.getName()).getId();
        return ResponseEntity.ok(ApiResponse.success(holdingService.getMyHoldings(userId)));
    }

    @GetMapping("/summary")
    public ResponseEntity<ApiResponse<PortfolioDTO>> getPortfolioSummary(Authentication auth) {
        Long userId = userService.getUserByEmail(auth.getName()).getId();
        return ResponseEntity.ok(ApiResponse.success(holdingService.getPortfolioSummary(userId)));
    }
}
