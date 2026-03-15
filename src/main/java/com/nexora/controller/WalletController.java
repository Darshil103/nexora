package com.nexora.controller;

import com.nexora.dto.*;
import com.nexora.service.WalletService;
import com.nexora.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/wallet")
@RequiredArgsConstructor
public class WalletController {

    private final WalletService walletService;
    private final UserService userService;

    @GetMapping
    public ResponseEntity<ApiResponse<WalletDTO>> getWallet(Authentication auth) {
        Long userId = userService.getUserByEmail(auth.getName()).getId();
        return ResponseEntity.ok(ApiResponse.success(walletService.getWallet(userId)));
    }

    @PostMapping("/deposit")
    public ResponseEntity<ApiResponse<WalletDTO>> deposit(Authentication auth, @RequestBody Map<String, String> body) {
        try {
            Long userId = userService.getUserByEmail(auth.getName()).getId();
            BigDecimal amount = new BigDecimal(body.get("amount"));
            String ref = body.get("referenceId");
            return ResponseEntity.ok(ApiResponse.success("Deposit successful", walletService.deposit(userId, amount, ref)));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @PostMapping("/withdraw")
    public ResponseEntity<ApiResponse<WalletDTO>> withdraw(Authentication auth, @RequestBody Map<String, String> body) {
        try {
            Long userId = userService.getUserByEmail(auth.getName()).getId();
            BigDecimal amount = new BigDecimal(body.get("amount"));
            return ResponseEntity.ok(ApiResponse.success("Withdrawal successful", walletService.withdraw(userId, amount)));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @GetMapping("/transactions")
    public ResponseEntity<ApiResponse<List<TransactionDTO>>> getTransactions(Authentication auth) {
        Long userId = userService.getUserByEmail(auth.getName()).getId();
        return ResponseEntity.ok(ApiResponse.success(walletService.getTransactions(userId)));
    }
}
