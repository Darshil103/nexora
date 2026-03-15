package com.nexora.service;

import com.nexora.dto.DividendDTO;
import com.nexora.entity.*;
import com.nexora.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class DividendService {

    private final DividendRepository dividendRepository;
    private final StartupRepository startupRepository;
    private final StockRepository stockRepository;
    private final HoldingRepository holdingRepository;
    private final WalletService walletService;
    private final NotificationService notificationService;

    public List<DividendDTO> getAllDividends() {
        return dividendRepository.findAllByOrderByAnnouncementDateDesc().stream().map(this::toDTO).toList();
    }

    public List<DividendDTO> getByStartup(Long startupId) {
        return dividendRepository.findByStartupIdOrderByAnnouncementDateDesc(startupId).stream().map(this::toDTO).toList();
    }

    @Transactional
    public DividendDTO announce(Long startupId, BigDecimal dividendPerShare, String paymentDate) {
        Startup startup = startupRepository.findById(startupId).orElseThrow(() -> new RuntimeException("Startup not found"));
        Stock stock = stockRepository.findByStartupId(startupId).orElseThrow(() -> new RuntimeException("Stock not found"));
        BigDecimal totalAmount = dividendPerShare.multiply(BigDecimal.valueOf(stock.getCirculatingShares()));

        Dividend d = Dividend.builder()
                .startup(startup).dividendPerShare(dividendPerShare).totalAmount(totalAmount)
                .announcementDate(LocalDate.now()).paymentDate(LocalDate.parse(paymentDate))
                .build();
        return toDTO(dividendRepository.save(d));
    }

    @Transactional
    public DividendDTO payDividend(Long dividendId) {
        Dividend d = dividendRepository.findById(dividendId).orElseThrow(() -> new RuntimeException("Dividend not found"));
        if (d.getStatus() != Dividend.DividendStatus.ANNOUNCED) throw new RuntimeException("Dividend not in ANNOUNCED state");

        Stock stock = stockRepository.findByStartupId(d.getStartup().getId()).orElseThrow();
        List<Holding> holders = holdingRepository.findByStockId(stock.getId());

        for (Holding h : holders) {
            BigDecimal payout = d.getDividendPerShare().multiply(BigDecimal.valueOf(h.getQuantity()));
            walletService.creditForTrade(h.getUser().getId(), payout,
                    "Dividend from " + d.getStartup().getName() + " — ₹" + d.getDividendPerShare() + "/share");
            notificationService.create(h.getUser().getId(), "Dividend Received",
                    "₹" + payout + " dividend from " + d.getStartup().getName(),
                    Notification.NotificationType.DIVIDEND);
        }

        d.setStatus(Dividend.DividendStatus.PAID);
        return toDTO(dividendRepository.save(d));
    }

    @Transactional
    public DividendDTO cancelDividend(Long dividendId) {
        Dividend d = dividendRepository.findById(dividendId).orElseThrow(() -> new RuntimeException("Dividend not found"));
        d.setStatus(Dividend.DividendStatus.CANCELLED);
        return toDTO(dividendRepository.save(d));
    }

    private DividendDTO toDTO(Dividend d) {
        Stock stock = stockRepository.findByStartupId(d.getStartup().getId()).orElse(null);
        return DividendDTO.builder()
                .id(d.getId()).startupId(d.getStartup().getId())
                .startupName(d.getStartup().getName())
                .symbol(stock != null ? stock.getSymbol() : "")
                .dividendPerShare(d.getDividendPerShare()).totalAmount(d.getTotalAmount())
                .announcementDate(d.getAnnouncementDate().toString())
                .paymentDate(d.getPaymentDate().toString())
                .status(d.getStatus().name()).build();
    }
}
