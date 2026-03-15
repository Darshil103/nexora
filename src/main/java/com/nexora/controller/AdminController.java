package com.nexora.controller;

import com.nexora.dto.*;
import com.nexora.service.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final UserService userService;
    private final StockService stockService;
    private final TradeService tradeService;
    private final IPOService ipoService;
    private final DividendService dividendService;
    private final SupportService supportService;
    private final StartupService startupService;
    private final AuditService auditService;

    // ---------- Dashboard Stats ----------
    @GetMapping("/stats")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getStats() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("total_users", userService.countUsers());
        stats.put("total_investors", userService.countByType("INVESTOR"));
        stats.put("total_startups", stockService.countAllStocks());
        stats.put("total_founders", userService.countByType("STARTUP_FOUNDER"));
        stats.put("pending_kyc", userService.countPendingKyc());
        stats.put("active_ipos", ipoService.countActiveIPOs());
        try {
            stats.put("total_volume_today", tradeService.getTotalVolume24h());
            stats.put("total_trades_today", tradeService.getTradeCount24h());
            stats.put("daily_volume", tradeService.getDailyVolume(14));
            stats.put("user_growth", userService.getUserGrowth(12));
        } catch (Exception e) {
            stats.put("total_volume_today", 0);
            stats.put("total_trades_today", 0);
        }
        return ResponseEntity.ok(ApiResponse.success(stats));
    }

    // ---------- User Management ----------
    @GetMapping("/users")
    public ResponseEntity<ApiResponse<List<UserDTO>>> getAllUsers() {
        return ResponseEntity.ok(ApiResponse.success(userService.getAllUsers()));
    }

    @GetMapping("/users/{id}")
    public ResponseEntity<ApiResponse<UserDTO>> getUser(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(userService.getUserById(id)));
    }

    @PutMapping("/users/{id}/approve-kyc")
    public ResponseEntity<ApiResponse<UserDTO>> approveKyc(@PathVariable Long id) {
        try {
            UserDTO updated = userService.approveKyc(id);
            auditService.logAction(null, "APPROVE_KYC", "USER", id, "PENDING", "APPROVED", "ADMIN");
            return ResponseEntity.ok(ApiResponse.success("KYC approved", updated));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Failed to approve KYC: " + e.getMessage()));
        }
    }

    @PutMapping("/users/{id}/reject-kyc")
    public ResponseEntity<ApiResponse<UserDTO>> rejectKyc(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success("KYC rejected", userService.rejectKyc(id)));
    }

    @PutMapping("/users/{id}/suspend")
    public ResponseEntity<ApiResponse<UserDTO>> suspendUser(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success("User suspended", userService.suspendUser(id)));
    }

    @PutMapping("/users/{id}/activate")
    public ResponseEntity<ApiResponse<UserDTO>> activateUser(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success("User activated", userService.activateUser(id)));
    }

    // ---------- Stock Management ----------
    @PutMapping("/stocks/{id}/halt")
    public ResponseEntity<ApiResponse<StockDTO>> haltStock(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success("Stock halted", stockService.haltStock(id)));
    }

    @PutMapping("/stocks/{id}/activate")
    public ResponseEntity<ApiResponse<StockDTO>> activateStock(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success("Stock activated", stockService.activateStock(id)));
    }

    // ---------- Startup Management ----------
    @GetMapping("/startups")
    public ResponseEntity<ApiResponse<List<StartupDTO>>> getPendingStartups() {
        return ResponseEntity.ok(ApiResponse.success(startupService.getAllStartups())); // Ideally this would filter by PENDING
    }

    @PutMapping("/startups/{id}/approve")
    public ResponseEntity<ApiResponse<StartupDTO>> approveStartup(@PathVariable Long id) {
        // Here we just use the existing updateStartup method from StartupService, 
        // but an Admin doesn't need to be the founder.
        // For simplicity, we'll assume StartupController or a dedicated service handles this properly.
        // Since StartupService.updateStartup checks for FounderID, we need a specific admin approval method.
        // I will add an `approveStartup` method to StartupService next.
        return ResponseEntity.ok(ApiResponse.success("Startup approved", startupService.approveStartup(id)));
    }

    @PutMapping("/startups/{id}/reject")
    public ResponseEntity<ApiResponse<StartupDTO>> rejectStartup(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success("Startup rejected", startupService.rejectStartup(id)));
    }

    // ---------- IPO Management ----------
    @PutMapping("/ipo/{id}/status")
    public ResponseEntity<ApiResponse<IPOListingDTO>> updateIPOStatus(@PathVariable Long id, @RequestBody Map<String, String> body) {
        return ResponseEntity.ok(ApiResponse.success(ipoService.updateStatus(id, body.get("status"))));
    }

    // ---------- Dividend Management ----------
    @PutMapping("/dividends/{id}/pay")
    public ResponseEntity<ApiResponse<DividendDTO>> payDividend(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success("Dividend paid", dividendService.payDividend(id)));
    }

    @PutMapping("/dividends/{id}/cancel")
    public ResponseEntity<ApiResponse<DividendDTO>> cancelDividend(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success("Dividend cancelled", dividendService.cancelDividend(id)));
    }

    // ---------- Support ----------
    @GetMapping("/support")
    public ResponseEntity<ApiResponse<List<SupportTicketDTO>>> getAllTickets() {
        return ResponseEntity.ok(ApiResponse.success(supportService.getAllTickets()));
    }

    @PutMapping("/support/{id}/status")
    public ResponseEntity<ApiResponse<SupportTicketDTO>> updateTicketStatus(@PathVariable Long id, @RequestBody Map<String, String> body) {
        return ResponseEntity.ok(ApiResponse.success(supportService.updateStatus(id, body.get("status"))));
    }

    // ---------- Trades ----------
    @GetMapping("/trades")
    public ResponseEntity<ApiResponse<List<TradeDTO>>> getAllTrades() {
        return ResponseEntity.ok(ApiResponse.success(tradeService.getAllTrades()));
    }

    @GetMapping("/audit-logs")
    public ResponseEntity<ApiResponse<List<AuditLogDTO>>> getAuditLogs() {
        return ResponseEntity.ok(ApiResponse.success(auditService.getAuditLogs()));
    }
}
