package com.nexora.controller;

import com.nexora.dto.*;
import com.nexora.service.IPOService;
import com.nexora.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/ipo")
@RequiredArgsConstructor
public class IPOController {

    private final IPOService ipoService;
    private final UserService userService;

    @GetMapping("/listings")
    public ResponseEntity<ApiResponse<List<IPOListingDTO>>> getListings() {
        return ResponseEntity.ok(ApiResponse.success(ipoService.getAllListings()));
    }

    @PostMapping("/listings")
    public ResponseEntity<ApiResponse<IPOListingDTO>> createListing(@RequestBody IPOListingDTO dto) {
        return ResponseEntity.ok(ApiResponse.success("IPO listing created", ipoService.createListing(dto)));
    }

    @PostMapping("/apply")
    public ResponseEntity<ApiResponse<IPOApplicationDTO>> apply(Authentication auth, @RequestBody Map<String, Object> body) {
        try {
            Long userId = userService.getUserByEmail(auth.getName()).getId();
            Long ipoId = Long.valueOf(body.get("ipoId").toString());
            Long shares = Long.valueOf(body.get("sharesApplied").toString());
            return ResponseEntity.ok(ApiResponse.success("IPO application submitted", ipoService.applyForIPO(userId, ipoId, shares)));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @GetMapping("/applications")
    public ResponseEntity<ApiResponse<List<IPOApplicationDTO>>> getMyApplications(Authentication auth) {
        Long userId = userService.getUserByEmail(auth.getName()).getId();
        return ResponseEntity.ok(ApiResponse.success(ipoService.getMyApplications(userId)));
    }
}
