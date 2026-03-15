package com.nexora.service;

import com.nexora.dto.IPOApplicationDTO;
import com.nexora.dto.IPOListingDTO;
import com.nexora.entity.*;
import com.nexora.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
public class IPOService {

    private final IPOListingRepository ipoListingRepository;
    private final IPOApplicationRepository ipoApplicationRepository;
    private final StockRepository stockRepository;
    private final WalletService walletService;
    private final HoldingRepository holdingRepository;
    private final NotificationService notificationService;

    public List<IPOListingDTO> getAllListings() {
        return ipoListingRepository.findAllByOrderByCreatedAtDesc().stream().map(this::toDTO).toList();
    }

    public long countActiveIPOs() {
        return ipoListingRepository.countByStatus(IPOListing.IPOStatus.OPEN);
    }

    public List<IPOListingDTO> getByStatus(String status) {
        return ipoListingRepository.findByStatusOrderByOpenDateDesc(IPOListing.IPOStatus.valueOf(status))
                .stream().map(this::toDTO).toList();
    }

    @Transactional
    public IPOListingDTO createListing(IPOListingDTO dto) {
        Stock stock = stockRepository.findById(dto.getStockId()).orElseThrow(() -> new RuntimeException("Stock not found"));
        IPOListing ipo = IPOListing.builder()
                .stock(stock).ipoPrice(dto.getIpoPrice()).minPrice(dto.getMinPrice())
                .maxPrice(dto.getMaxPrice()).sharesOffered(dto.getSharesOffered())
                .openDate(java.time.LocalDate.parse(dto.getOpenDate()))
                .closeDate(java.time.LocalDate.parse(dto.getCloseDate()))
                .build();
        return toDTO(ipoListingRepository.save(ipo));
    }

    @Transactional
    public IPOApplicationDTO applyForIPO(Long userId, Long ipoId, Long sharesApplied) {
        if (ipoApplicationRepository.existsByIpoIdAndUserId(ipoId, userId))
            throw new RuntimeException("Already applied for this IPO");

        IPOListing ipo = ipoListingRepository.findById(ipoId).orElseThrow(() -> new RuntimeException("IPO not found"));
        if (ipo.getStatus() != IPOListing.IPOStatus.OPEN)
            throw new RuntimeException("IPO is not open for applications");

        BigDecimal amount = ipo.getIpoPrice().multiply(BigDecimal.valueOf(sharesApplied));
        walletService.reserveBalance(userId, amount);

        User user = new User(); user.setId(userId);
        IPOApplication app = IPOApplication.builder()
                .ipo(ipo).user(user).sharesApplied(sharesApplied).amount(amount).build();
        app = ipoApplicationRepository.save(app);

        notificationService.create(userId, "IPO Application Submitted",
                "Applied for " + sharesApplied + " shares of " + ipo.getStock().getSymbol(),
                Notification.NotificationType.SYSTEM);

        return toAppDTO(app);
    }

    public List<IPOApplicationDTO> getMyApplications(Long userId) {
        return ipoApplicationRepository.findByUserId(userId).stream().map(this::toAppDTO).toList();
    }

    @Transactional
    public IPOListingDTO updateStatus(Long ipoId, String status) {
        IPOListing ipo = ipoListingRepository.findById(ipoId).orElseThrow(() -> new RuntimeException("IPO not found"));
        ipo.setStatus(IPOListing.IPOStatus.valueOf(status));
        return toDTO(ipoListingRepository.save(ipo));
    }

    private IPOListingDTO toDTO(IPOListing ipo) {
        Stock stock = ipo.getStock();
        return IPOListingDTO.builder()
                .id(ipo.getId()).stockId(stock.getId()).symbol(stock.getSymbol())
                .startupName(stock.getStartup().getName()).industry(stock.getStartup().getIndustry())
                .ipoPrice(ipo.getIpoPrice()).minPrice(ipo.getMinPrice()).maxPrice(ipo.getMaxPrice())
                .sharesOffered(ipo.getSharesOffered())
                .openDate(ipo.getOpenDate().toString()).closeDate(ipo.getCloseDate().toString())
                .status(ipo.getStatus().name()).build();
    }

    private IPOApplicationDTO toAppDTO(IPOApplication a) {
        return IPOApplicationDTO.builder()
                .id(a.getId()).ipoId(a.getIpo().getId())
                .startupName(a.getIpo().getStock().getStartup().getName())
                .symbol(a.getIpo().getStock().getSymbol())
                .sharesApplied(a.getSharesApplied()).amount(a.getAmount())
                .sharesAllotted(a.getSharesAllotted()).status(a.getStatus().name())
                .createdAt(a.getCreatedAt().toString()).build();
    }
}
