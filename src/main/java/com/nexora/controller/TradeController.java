package com.nexora.controller;

import com.nexora.dto.*;
import com.nexora.service.TradeService;
import com.nexora.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/trades")
@RequiredArgsConstructor
public class TradeController {

    private final TradeService tradeService;
    private final UserService userService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<TradeDTO>>> getMyTrades(Authentication auth) {
        Long userId = userService.getUserByEmail(auth.getName()).getId();
        return ResponseEntity.ok(ApiResponse.success(tradeService.getMyTrades(userId)));
    }
}
