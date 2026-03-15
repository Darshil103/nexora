package com.nexora.controller;

import com.nexora.dto.*;
import com.nexora.entity.Startup;
import com.nexora.repository.StartupRepository;
import com.nexora.service.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/market")
@RequiredArgsConstructor
public class MarketController {

    private final StockService stockService;
    private final StartupRepository startupRepository;

    @GetMapping("/overview")
    public ResponseEntity<ApiResponse<List<StockDTO>>> getMarketOverview() {
        return ResponseEntity.ok(ApiResponse.success(stockService.getAllActiveStocks()));
    }

    @GetMapping("/startups")
    public ResponseEntity<ApiResponse<List<StartupDTO>>> getStartups() {
        List<StartupDTO> dtos = startupRepository.findByStatus(Startup.StartupStatus.ACTIVE).stream()
                .map(s -> StartupDTO.builder()
                        .id(s.getId()).founderId(s.getFounder().getId()).founderName(s.getFounder().getFullName())
                        .name(s.getName()).description(s.getDescription()).industry(s.getIndustry())
                        .stage(s.getStage().name()).valuation(s.getValuation())
                        .foundedDate(s.getFoundedDate() != null ? s.getFoundedDate().toString() : null)
                        .employeeCount(s.getEmployeeCount()).revenue(s.getRevenue()).status(s.getStatus().name())
                        .createdAt(s.getCreatedAt().toString()).build())
                .toList();
        return ResponseEntity.ok(ApiResponse.success(dtos));
    }
}
