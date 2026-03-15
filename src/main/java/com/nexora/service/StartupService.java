package com.nexora.service;

import com.nexora.dto.StartupDTO;
import com.nexora.entity.Startup;
import com.nexora.entity.Stock;
import com.nexora.entity.User;
import com.nexora.repository.StartupRepository;
import com.nexora.repository.StockRepository;
import com.nexora.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class StartupService {

    private final StartupRepository startupRepository;
    private final UserRepository userRepository;
    private final StockRepository stockRepository;

    public List<StartupDTO> getAllStartups() {
        return startupRepository.findAll().stream().map(this::toDTO).collect(Collectors.toList());
    }

    public StartupDTO getById(Long id) {
        Startup startup = startupRepository.findById(id).orElseThrow(() -> new RuntimeException("Startup not found"));
        return toDTO(startup);
    }

    public List<StartupDTO> getByFounder(Long founderId) {
        return startupRepository.findAll().stream()
                .filter(s -> s.getFounder().getId().equals(founderId))
                .map(this::toDTO).collect(Collectors.toList());
    }

    @Transactional
    public StartupDTO createStartup(StartupDTO dto, Long founderId) {
        User founder = userRepository.findById(founderId).orElseThrow(() -> new RuntimeException("Founder not found"));
        
        Startup startup = Startup.builder()
                .founder(founder)
                .name(dto.getName())
                .description(dto.getDescription())
                .industry(dto.getIndustry())
                .stage(Startup.Stage.valueOf(dto.getStage() != null ? dto.getStage() : "SEED"))
                .valuation(dto.getValuation())
                .foundedDate(dto.getFoundedDate() != null ? LocalDate.parse(dto.getFoundedDate()) : null)
                .employeeCount(dto.getEmployeeCount())
                .revenue(dto.getRevenue())
                .status(Startup.StartupStatus.PENDING)
                .build();
                
        return toDTO(startupRepository.save(startup));
    }

    @Transactional
    public StartupDTO updateStartup(Long id, StartupDTO dto, Long founderId) {
        Startup startup = startupRepository.findById(id).orElseThrow(() -> new RuntimeException("Startup not found"));
        if (!startup.getFounder().getId().equals(founderId)) {
            throw new RuntimeException("Not authorized to update this startup");
        }

        if (dto.getName() != null) startup.setName(dto.getName());
        if (dto.getDescription() != null) startup.setDescription(dto.getDescription());
        if (dto.getIndustry() != null) startup.setIndustry(dto.getIndustry());
        if (dto.getStage() != null) startup.setStage(Startup.Stage.valueOf(dto.getStage()));
        if (dto.getValuation() != null) startup.setValuation(dto.getValuation());
        if (dto.getFoundedDate() != null) startup.setFoundedDate(LocalDate.parse(dto.getFoundedDate()));
        if (dto.getEmployeeCount() != null) startup.setEmployeeCount(dto.getEmployeeCount());
        if (dto.getRevenue() != null) startup.setRevenue(dto.getRevenue());
        if (dto.getStatus() != null) startup.setStatus(Startup.StartupStatus.valueOf(dto.getStatus()));

        return toDTO(startupRepository.save(startup));
    }

    @Transactional
    public StartupDTO approveStartup(Long id) {
        Startup startup = startupRepository.findById(id).orElseThrow(() -> new RuntimeException("Startup not found"));
        startup.setStatus(Startup.StartupStatus.ACTIVE);
        
        // Check if stock already exists for this startup
        Stock existingStock = stockRepository.findByStartupId(id).orElse(null);
        if (existingStock == null) {
            // Create stock automatically when startup is approved
            Stock stock = Stock.builder()
                    .startup(startup)
                    .symbol(generateStockSymbol(startup.getName()))
                    .currentPrice(BigDecimal.valueOf(100))
                    .totalShares(1000000L)
                    .circulatingShares(500000L)
                    .dayHigh(BigDecimal.valueOf(100))
                    .dayLow(BigDecimal.valueOf(100))
                    .yearHigh(BigDecimal.valueOf(100))
                    .yearLow(BigDecimal.valueOf(100))
                    .dayVolume(0L)
                    .status(Stock.StockStatus.ACTIVE)
                    .build();
            stockRepository.save(stock);
        }
        
        return toDTO(startupRepository.save(startup));
    }
    
    private String generateStockSymbol(String name) {
        String cleaned = name.replaceAll("[^a-zA-Z]", "");
        if (cleaned.length() >= 6) {
            return cleaned.substring(0, 6).toUpperCase();
        }
        return cleaned.toUpperCase();
    }

    @Transactional
    public StartupDTO rejectStartup(Long id) {
        Startup startup = startupRepository.findById(id).orElseThrow(() -> new RuntimeException("Startup not found"));
        startup.setStatus(Startup.StartupStatus.DELISTED);
        return toDTO(startupRepository.save(startup));
    }

    private StartupDTO toDTO(Startup s) {
        Stock stock = stockRepository.findByStartupId(s.getId()).orElse(null);
        return StartupDTO.builder()
                .id(s.getId())
                .founderId(s.getFounder().getId())
                .founderName(s.getFounder().getFullName())
                .name(s.getName())
                .description(s.getDescription())
                .industry(s.getIndustry())
                .stage(s.getStage() != null ? s.getStage().name() : null)
                .valuation(s.getValuation())
                .foundedDate(s.getFoundedDate() != null ? s.getFoundedDate().toString() : null)
                .employeeCount(s.getEmployeeCount())
                .revenue(s.getRevenue())
                .status(s.getStatus().name())
                .stockSymbol(stock != null ? stock.getSymbol() : null)
                .stockPrice(stock != null ? stock.getCurrentPrice() : null)
                .createdAt(s.getCreatedAt().toString())
                .build();
    }
}
