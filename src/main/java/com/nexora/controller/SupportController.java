package com.nexora.controller;

import com.nexora.dto.*;
import com.nexora.service.SupportService;
import com.nexora.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/support")
@RequiredArgsConstructor
public class SupportController {

    private final SupportService supportService;
    private final UserService userService;

    @PostMapping
    public ResponseEntity<ApiResponse<SupportTicketDTO>> createTicket(Authentication auth, @RequestBody Map<String, String> body) {
        Long userId = userService.getUserByEmail(auth.getName()).getId();
        return ResponseEntity.ok(ApiResponse.success("Ticket created",
                supportService.createTicket(userId, body.get("category"), body.get("subject"), body.get("description"), body.get("priority"))));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<SupportTicketDTO>>> getMyTickets(Authentication auth) {
        Long userId = userService.getUserByEmail(auth.getName()).getId();
        return ResponseEntity.ok(ApiResponse.success(supportService.getMyTickets(userId)));
    }
}
