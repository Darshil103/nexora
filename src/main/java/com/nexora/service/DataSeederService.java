package com.nexora.service;

import com.nexora.entity.*;
import com.nexora.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Slf4j
@Service
@RequiredArgsConstructor
public class DataSeederService implements CommandLineRunner {

    private final UserRepository userRepository;
    private final StartupRepository startupRepository;
    private final StockRepository stockRepository;
    private final WalletRepository walletRepository;
    private final HoldingRepository holdingRepository;
    private final OrderRepository orderRepository;
    private final PriceHistoryRepository priceHistoryRepository;
    private final IPOListingRepository ipoListingRepository;
    private final DividendRepository dividendRepository;
    private final NotificationRepository notificationRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(String... args) {
        if (userRepository.count() > 0) {
            log.info("Database already seeded, skipping...");
            return;
        }
        log.info("Seeding database with initial data...");

        String hash = passwordEncoder.encode("password123");

        // Users
        User admin = userRepository.save(User.builder().username("admin").email("admin@nexora.com").passwordHash(hash)
                .fullName("Admin User").phone("9876543210").userType(User.UserType.ADMIN)
                .kycStatus(User.KycStatus.APPROVED).panNumber("ADMIN12345").aadhaarNumber("111122223333")
                .kycApprovedDate(LocalDate.now()).build());

        User inv1 = userRepository.save(User.builder().username("rahul_sharma").email("investor1@nexora.com").passwordHash(hash)
                .fullName("Rahul Sharma").phone("9876543211").userType(User.UserType.INVESTOR)
                .kycStatus(User.KycStatus.APPROVED).panNumber("ABCDE1234F").aadhaarNumber("444455556666")
                .kycApprovedDate(LocalDate.now()).build());

        User inv2 = userRepository.save(User.builder().username("priya_singh").email("investor2@nexora.com").passwordHash(hash)
                .fullName("Priya Singh").phone("9876543212").userType(User.UserType.INVESTOR)
                .kycStatus(User.KycStatus.APPROVED).panNumber("FGHIJ5678K").aadhaarNumber("777788889999")
                .kycApprovedDate(LocalDate.now()).build());

        User inv3 = userRepository.save(User.builder().username("amit_patel").email("investor3@nexora.com").passwordHash(hash)
                .fullName("Amit Patel").phone("9876543215").userType(User.UserType.INVESTOR)
                .kycStatus(User.KycStatus.PENDING).build());

        User founder1 = userRepository.save(User.builder().username("vikram_tech").email("founder1@nexora.com").passwordHash(hash)
                .fullName("Vikram Rao").phone("9876543213").userType(User.UserType.STARTUP_FOUNDER)
                .kycStatus(User.KycStatus.APPROVED).panNumber("LMNOP9012Q").aadhaarNumber("111100002222")
                .kycApprovedDate(LocalDate.now()).build());

        User founder2 = userRepository.save(User.builder().username("neha_health").email("founder2@nexora.com").passwordHash(hash)
                .fullName("Neha Gupta").phone("9876543214").userType(User.UserType.STARTUP_FOUNDER)
                .kycStatus(User.KycStatus.APPROVED).panNumber("RSTUV3456W").aadhaarNumber("333344445555")
                .kycApprovedDate(LocalDate.now()).build());

        // Wallets for investors
        walletRepository.save(Wallet.builder().user(inv1).balance(new BigDecimal("500000.00")).build());
        walletRepository.save(Wallet.builder().user(inv2).balance(new BigDecimal("350000.00")).build());
        walletRepository.save(Wallet.builder().user(inv3).balance(new BigDecimal("100000.00")).build());

        // Startups
        Startup s1 = startupRepository.save(Startup.builder().founder(founder1).name("TechFlow AI")
                .description("AI-powered workflow automation platform for enterprises. Uses machine learning to optimize business processes and reduce operational costs by up to 60%.")
                .industry("TECH").stage(Startup.Stage.SERIES_A).valuation(new BigDecimal("500000000"))
                .foundedDate(LocalDate.of(2020, 1, 15)).employeeCount(150).revenue(new BigDecimal("50000000")).build());

        Startup s2 = startupRepository.save(Startup.builder().founder(founder2).name("HealthSync")
                .description("Healthcare management platform with AI-powered diagnostics and telemedicine. Serving 500+ hospitals across India.")
                .industry("HEALTHCARE").stage(Startup.Stage.SEED).valuation(new BigDecimal("100000000"))
                .foundedDate(LocalDate.of(2021, 6, 20)).employeeCount(25).revenue(new BigDecimal("5000000")).build());

        Startup s3 = startupRepository.save(Startup.builder().founder(founder1).name("FinMetrics")
                .description("Personal finance management and analytics platform. Helps users track investments, expenses, and plan for financial goals.")
                .industry("FINTECH").stage(Startup.Stage.SERIES_B).valuation(new BigDecimal("300000000"))
                .foundedDate(LocalDate.of(2019, 3, 10)).employeeCount(80).revenue(new BigDecimal("20000000")).build());

        Startup s4 = startupRepository.save(Startup.builder().founder(founder2).name("EduHub")
                .description("Online learning platform with gamification. Features adaptive learning algorithms and 10,000+ courses.")
                .industry("EDTECH").stage(Startup.Stage.GROWTH).valuation(new BigDecimal("250000000"))
                .foundedDate(LocalDate.of(2020, 9, 5)).employeeCount(60).revenue(new BigDecimal("15000000")).build());

        Startup s5 = startupRepository.save(Startup.builder().founder(founder1).name("GreenEV Motors")
                .description("Electric vehicle startup manufacturing affordable EVs for Indian cities. Plans to launch 3 models by 2027.")
                .industry("TECH").stage(Startup.Stage.SERIES_A).valuation(new BigDecimal("800000000"))
                .foundedDate(LocalDate.of(2021, 2, 14)).employeeCount(200).revenue(new BigDecimal("30000000")).build());

        Startup s6 = startupRepository.save(Startup.builder().founder(founder2).name("AgriX Solutions")
                .description("AgriTech platform using IoT sensors and AI for precision farming. Serving 1 lakh+ farmers across 5 states.")
                .industry("TECH").stage(Startup.Stage.SEED).valuation(new BigDecimal("75000000"))
                .foundedDate(LocalDate.of(2022, 7, 1)).employeeCount(30).revenue(new BigDecimal("3000000")).build());

        // Stocks
        Stock st1 = stockRepository.save(Stock.builder().startup(s1).symbol("TFLOW").currentPrice(new BigDecimal("245.50"))
                .totalShares(2000000L).circulatingShares(1500000L)
                .dayHigh(new BigDecimal("252.00")).dayLow(new BigDecimal("240.10"))
                .yearHigh(new BigDecimal("280.00")).yearLow(new BigDecimal("200.00")).dayVolume(125000L).build());

        Stock st2 = stockRepository.save(Stock.builder().startup(s2).symbol("HSYNC").currentPrice(new BigDecimal("89.75"))
                .totalShares(1000000L).circulatingShares(750000L)
                .dayHigh(new BigDecimal("92.00")).dayLow(new BigDecimal("87.50"))
                .yearHigh(new BigDecimal("120.00")).yearLow(new BigDecimal("65.00")).dayVolume(78000L).build());

        Stock st3 = stockRepository.save(Stock.builder().startup(s3).symbol("FMTRIC").currentPrice(new BigDecimal("178.30"))
                .totalShares(2500000L).circulatingShares(2000000L)
                .dayHigh(new BigDecimal("182.00")).dayLow(new BigDecimal("175.00"))
                .yearHigh(new BigDecimal("200.00")).yearLow(new BigDecimal("120.00")).dayVolume(235000L).build());

        Stock st4 = stockRepository.save(Stock.builder().startup(s4).symbol("EDUHB").currentPrice(new BigDecimal("156.00"))
                .totalShares(2600000L).circulatingShares(2500000L)
                .dayHigh(new BigDecimal("158.50")).dayLow(new BigDecimal("152.00"))
                .yearHigh(new BigDecimal("180.00")).yearLow(new BigDecimal("100.00")).dayVolume(156000L).build());

        Stock st5 = stockRepository.save(Stock.builder().startup(s5).symbol("GRNEV").currentPrice(new BigDecimal("312.40"))
                .totalShares(3000000L).circulatingShares(2000000L)
                .dayHigh(new BigDecimal("320.00")).dayLow(new BigDecimal("305.00"))
                .yearHigh(new BigDecimal("350.00")).yearLow(new BigDecimal("220.00")).dayVolume(89000L).build());

        Stock st6 = stockRepository.save(Stock.builder().startup(s6).symbol("AGRIX").currentPrice(new BigDecimal("67.20"))
                .totalShares(1500000L).circulatingShares(1000000L)
                .dayHigh(new BigDecimal("70.00")).dayLow(new BigDecimal("65.50"))
                .yearHigh(new BigDecimal("85.00")).yearLow(new BigDecimal("45.00")).dayVolume(45000L).build());

        // Holdings for investor1
        holdingRepository.save(Holding.builder().user(inv1).stock(st1).quantity(100L).averageCost(new BigDecimal("200.00")).build());
        holdingRepository.save(Holding.builder().user(inv1).stock(st3).quantity(50L).averageCost(new BigDecimal("150.00")).build());
        holdingRepository.save(Holding.builder().user(inv1).stock(st5).quantity(30L).averageCost(new BigDecimal("280.00")).build());

        // Holdings for investor2
        holdingRepository.save(Holding.builder().user(inv2).stock(st2).quantity(200L).averageCost(new BigDecimal("75.00")).build());
        holdingRepository.save(Holding.builder().user(inv2).stock(st4).quantity(100L).averageCost(new BigDecimal("130.00")).build());

        // Price history (30 days for each stock)
        seedPriceHistory(st1, new BigDecimal("220"), new BigDecimal("245.50"), 30);
        seedPriceHistory(st2, new BigDecimal("78"), new BigDecimal("89.75"), 30);
        seedPriceHistory(st3, new BigDecimal("160"), new BigDecimal("178.30"), 30);
        seedPriceHistory(st4, new BigDecimal("140"), new BigDecimal("156.00"), 30);
        seedPriceHistory(st5, new BigDecimal("280"), new BigDecimal("312.40"), 30);
        seedPriceHistory(st6, new BigDecimal("72"), new BigDecimal("67.20"), 30);

        // IPO listings
        ipoListingRepository.save(IPOListing.builder().stock(st1).ipoPrice(new BigDecimal("200.00"))
                .minPrice(new BigDecimal("190.00")).maxPrice(new BigDecimal("210.00")).sharesOffered(500000L)
                .openDate(LocalDate.now().minusDays(30)).closeDate(LocalDate.now().minusDays(25))
                .status(IPOListing.IPOStatus.LISTED).build());

        ipoListingRepository.save(IPOListing.builder().stock(st5).ipoPrice(new BigDecimal("280.00"))
                .minPrice(new BigDecimal("260.00")).maxPrice(new BigDecimal("300.00")).sharesOffered(800000L)
                .openDate(LocalDate.now().plusDays(5)).closeDate(LocalDate.now().plusDays(15))
                .status(IPOListing.IPOStatus.UPCOMING).build());

        // Dividends
        dividendRepository.save(Dividend.builder().startup(s1).dividendPerShare(new BigDecimal("5.00"))
                .totalAmount(new BigDecimal("7500000.00")).announcementDate(LocalDate.now().minusDays(90))
                .paymentDate(LocalDate.now().minusDays(60)).status(Dividend.DividendStatus.PAID).build());

        dividendRepository.save(Dividend.builder().startup(s3).dividendPerShare(new BigDecimal("2.50"))
                .totalAmount(new BigDecimal("5000000.00")).announcementDate(LocalDate.now().minusDays(45))
                .paymentDate(LocalDate.now().minusDays(30)).status(Dividend.DividendStatus.PAID).build());

        // Notifications
        notificationRepository.save(Notification.builder().user(inv1).title("Welcome to Nexora!")
                .message("Your account has been created successfully. Complete KYC to start trading.")
                .type(Notification.NotificationType.SYSTEM).build());
        notificationRepository.save(Notification.builder().user(inv1).title("KYC Approved")
                .message("Your KYC has been approved. You can now trade on Nexora.")
                .type(Notification.NotificationType.SYSTEM).build());
        notificationRepository.save(Notification.builder().user(inv1).title("Dividend Received")
                .message("You received ₹500 dividend from TechFlow AI.")
                .type(Notification.NotificationType.DIVIDEND).build());

        // Sample executed orders
        orderRepository.save(Order.builder().user(inv1).stock(st1).orderType(Order.OrderType.BUY)
                .priceType(Order.PriceType.MARKET).quantity(100L).filledQuantity(100L)
                .price(new BigDecimal("200.00")).totalValue(new BigDecimal("20000.00"))
                .status(Order.OrderStatus.EXECUTED).createdAt(LocalDateTime.now().minusDays(20))
                .executedAt(LocalDateTime.now().minusDays(20)).build());

        orderRepository.save(Order.builder().user(inv1).stock(st3).orderType(Order.OrderType.BUY)
                .priceType(Order.PriceType.LIMIT).quantity(50L).filledQuantity(50L)
                .price(new BigDecimal("150.00")).totalValue(new BigDecimal("7500.00"))
                .status(Order.OrderStatus.EXECUTED).createdAt(LocalDateTime.now().minusDays(15))
                .executedAt(LocalDateTime.now().minusDays(15)).build());

        log.info("Database seeded successfully!");
    }

    private void seedPriceHistory(Stock stock, BigDecimal startPrice, BigDecimal endPrice, int days) {
        BigDecimal step = endPrice.subtract(startPrice).divide(BigDecimal.valueOf(days), 2, java.math.RoundingMode.HALF_UP);
        for (int i = days; i > 0; i--) {
            BigDecimal base = startPrice.add(step.multiply(BigDecimal.valueOf(days - i)));
            BigDecimal variance = base.multiply(new BigDecimal("0.02"));
            BigDecimal open = base.subtract(variance.multiply(BigDecimal.valueOf(Math.random())));
            BigDecimal close = base.add(variance.multiply(BigDecimal.valueOf(Math.random())));
            BigDecimal high = open.max(close).add(variance);
            BigDecimal low = open.min(close).subtract(variance);
            long volume = 50000 + (long) (Math.random() * 200000);

            priceHistoryRepository.save(PriceHistory.builder()
                    .stock(stock).date(LocalDate.now().minusDays(i))
                    .openPrice(open.setScale(2, java.math.RoundingMode.HALF_UP))
                    .highPrice(high.setScale(2, java.math.RoundingMode.HALF_UP))
                    .lowPrice(low.setScale(2, java.math.RoundingMode.HALF_UP))
                    .closePrice(close.setScale(2, java.math.RoundingMode.HALF_UP))
                    .volume(volume).build());
        }
    }
}
