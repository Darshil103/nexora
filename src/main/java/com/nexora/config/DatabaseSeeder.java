package com.nexora.config;

import com.nexora.entity.Startup;
import com.nexora.entity.User;
import com.nexora.entity.Wallet;
import com.nexora.repository.StartupRepository;
import com.nexora.repository.UserRepository;
import com.nexora.repository.WalletRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Configuration
@RequiredArgsConstructor
public class DatabaseSeeder {

    private final UserRepository userRepository;
    private final WalletRepository walletRepository;
    private final StartupRepository startupRepository;
    private final PasswordEncoder passwordEncoder;

    @Bean
    public CommandLineRunner seedDatabase() {
        return args -> {
            // 1. Seed Admin User
            if (!userRepository.existsByEmail("admin@nexora.com")) {
                User admin = User.builder()
                        .fullName("Nexora Admin")
                        .username("admin_main")
                        .email("admin@nexora.com")
                        .passwordHash(passwordEncoder.encode("admin123"))
                        .userType(User.UserType.ADMIN)
                        .status(User.UserStatus.ACTIVE)
                        .kycStatus(User.KycStatus.APPROVED)
                        .kycApprovedDate(LocalDate.now())
                        .build();
                userRepository.save(admin);
                
                System.out.println("=============================================");
                System.out.println("✅ ADMIN ACCOUNT CREATED:");
                System.out.println("Email: admin@nexora.com");
                System.out.println("Password: admin123");
                System.out.println("=============================================");
            }

            // 2. Seed 10 Startups (assigned to a dummy founder)
            if (startupRepository.count() == 0) {
                 User dummyFounder = null;
                 if (!userRepository.existsByEmail("founder@nexora.com")) {
                     dummyFounder = User.builder()
                             .fullName("Dummy Founder")
                             .username("founder_dummy")
                             .email("founder@nexora.com")
                             .passwordHash(passwordEncoder.encode("founder123"))
                             .userType(User.UserType.STARTUP_FOUNDER)
                             .kycStatus(User.KycStatus.APPROVED)
                             .build();
                     userRepository.save(dummyFounder);
                 } else {
                     dummyFounder = userRepository.findByEmail("founder@nexora.com").orElse(null);
                 }

                 if (dummyFounder != null) {
                     List<Startup> startups = List.of(
                             createStartup(dummyFounder, "TechFlow AI", "Artificial Intelligence", Startup.Stage.SEED, 5000000, 15),
                             createStartup(dummyFounder, "GreenEnergyX", "Renewable Energy", Startup.Stage.SERIES_A, 12000000, 45),
                             createStartup(dummyFounder, "MediChain", "Healthcare Tech", Startup.Stage.SERIES_B, 45000000, 120),
                             createStartup(dummyFounder, "QuantumShield", "Cybersecurity", Startup.Stage.SEED, 8000000, 25),
                             createStartup(dummyFounder, "AeroLogistics", "Transportation", Startup.Stage.SERIES_A, 22000000, 80),
                             createStartup(dummyFounder, "FinNova", "FinTech", Startup.Stage.SERIES_B, 60000000, 200),
                             createStartup(dummyFounder, "BioSynthetix", "Biotechnology", Startup.Stage.SEED, 15000000, 35),
                             createStartup(dummyFounder, "RoboFarm", "AgriTech", Startup.Stage.SERIES_A, 18000000, 60),
                             createStartup(dummyFounder, "SpaceOrbitals", "Aerospace", Startup.Stage.GROWTH, 150000000, 500),
                             createStartup(dummyFounder, "EduVerse", "EdTech", Startup.Stage.SEED, 4000000, 12)
                     );
                     startupRepository.saveAll(startups);
                     System.out.println("✅ 10 TEST STARTUPS INSERTED.");
                 }
            }
        };
    }

    private Startup createStartup(User founder, String name, String industry, Startup.Stage stage, double valuation, int employeeCount) {
        return Startup.builder()
                .founder(founder)
                .name(name)
                .description(name + " is a leading company in " + industry)
                .industry(industry)
                .stage(stage)
                .foundedDate(LocalDate.now().minusYears(2))
                .employeeCount(employeeCount)
                .revenue(BigDecimal.valueOf(valuation * 0.2)) // Dummy revenue
                .valuation(BigDecimal.valueOf(valuation))
                .status(Startup.StartupStatus.ACTIVE) // Use ACTIVE since there is no PENDING
                .build();
    }
}
