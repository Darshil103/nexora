package com.nexora.controller;

import com.nexora.dto.*;
import com.nexora.service.StockService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/stocks")
@RequiredArgsConstructor
public class StockController {

    private final StockService stockService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<StockDTO>>> getAllStocks() {
        return ResponseEntity.ok(ApiResponse.success(stockService.getAllActiveStocks()));
    }

    @GetMapping("/all")
    public ResponseEntity<ApiResponse<List<StockDTO>>> getAllStocksIncludingInactive() {
        return ResponseEntity.ok(ApiResponse.success(stockService.getAllStocks()));
    }

    @GetMapping("/symbol/{symbol}")
    public ResponseEntity<ApiResponse<StockDTO>> getBySymbol(@PathVariable String symbol) {
        try {
            return ResponseEntity.ok(ApiResponse.success(stockService.getBySymbol(symbol)));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<StockDTO>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(stockService.getById(id)));
    }

    @GetMapping("/{id}/price-history")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getPriceHistory(
            @PathVariable Long id, @RequestParam(defaultValue = "1M") String period) {
        return ResponseEntity.ok(ApiResponse.success(stockService.getPriceHistory(id, period)));
    }
}
