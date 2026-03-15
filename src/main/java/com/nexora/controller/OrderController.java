package com.nexora.controller;

import com.nexora.dto.*;
import com.nexora.service.OrderService;
import com.nexora.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;
    private final UserService userService;

    @PostMapping
    public ResponseEntity<ApiResponse<OrderDTO>> placeOrder(Authentication auth, @Valid @RequestBody OrderDTO dto) {
        try {
            Long userId = userService.getUserByEmail(auth.getName()).getId();
            return ResponseEntity.ok(ApiResponse.success("Order placed", orderService.placeOrder(userId, dto)));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<OrderDTO>>> getMyOrders(Authentication auth) {
        Long userId = userService.getUserByEmail(auth.getName()).getId();
        return ResponseEntity.ok(ApiResponse.success(orderService.getMyOrders(userId)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<OrderDTO>> cancelOrder(Authentication auth, @PathVariable Long id) {
        try {
            Long userId = userService.getUserByEmail(auth.getName()).getId();
            return ResponseEntity.ok(ApiResponse.success("Order cancelled", orderService.cancelOrder(userId, id)));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }
}
