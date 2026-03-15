package com.nexora.service;

import com.nexora.dto.HoldingDTO;
import com.nexora.dto.PortfolioDTO;
import com.nexora.entity.Holding;
import com.nexora.repository.HoldingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;

@Service
@RequiredArgsConstructor
public class HoldingService {

    private final HoldingRepository holdingRepository;

    public List<HoldingDTO> getMyHoldings(Long userId) {
        return holdingRepository.findByUserId(userId).stream().map(this::toDTO).toList();
    }

    public PortfolioDTO getPortfolioSummary(Long userId) {
        List<Holding> holdings = holdingRepository.findByUserId(userId);
        BigDecimal totalInvested = BigDecimal.ZERO;
        BigDecimal currentValue = BigDecimal.ZERO;

        for (Holding h : holdings) {
            totalInvested = totalInvested.add(h.getAverageCost().multiply(BigDecimal.valueOf(h.getQuantity())));
            currentValue = currentValue.add(h.getStock().getCurrentPrice().multiply(BigDecimal.valueOf(h.getQuantity())));
        }

        BigDecimal pnl = currentValue.subtract(totalInvested);
        BigDecimal pnlPct = totalInvested.compareTo(BigDecimal.ZERO) > 0
                ? pnl.divide(totalInvested, 4, RoundingMode.HALF_UP).multiply(BigDecimal.valueOf(100))
                : BigDecimal.ZERO;

        return PortfolioDTO.builder()
                .totalInvested(totalInvested).currentValue(currentValue)
                .totalPnl(pnl).pnlPercentage(pnlPct).holdingsCount(holdings.size())
                .build();
    }

    private HoldingDTO toDTO(Holding h) {
        BigDecimal currentPrice = h.getStock().getCurrentPrice();
        BigDecimal currentValue = currentPrice.multiply(BigDecimal.valueOf(h.getQuantity()));
        BigDecimal invested = h.getAverageCost().multiply(BigDecimal.valueOf(h.getQuantity()));
        BigDecimal pnl = currentValue.subtract(invested);
        BigDecimal pnlPct = invested.compareTo(BigDecimal.ZERO) > 0
                ? pnl.divide(invested, 4, RoundingMode.HALF_UP).multiply(BigDecimal.valueOf(100))
                : BigDecimal.ZERO;

        return HoldingDTO.builder()
                .id(h.getId()).stockId(h.getStock().getId())
                .symbol(h.getStock().getSymbol()).name(h.getStock().getStartup().getName())
                .quantity(h.getQuantity()).averageCost(h.getAverageCost())
                .currentPrice(currentPrice).currentValue(currentValue)
                .pnl(pnl).pnlPercentage(pnlPct)
                .build();
    }
}
