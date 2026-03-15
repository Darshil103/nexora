-- Create database
CREATE DATABASE nexora CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Create user
CREATE USER 'nexora_user'@'localhost' IDENTIFIED BY 'nexora_password';

-- Grant privileges
GRANT ALL PRIVILEGES ON nexora.* TO 'nexora_user'@'localhost';

-- Apply privileges
FLUSH PRIVILEGES;

-- Verify
SHOW DATABASES;

-- You should see: nexora

use nexora;
select count(*) from users;

CREATE TABLE users (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(100) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    phone VARCHAR(15),
    user_type ENUM('ADMIN', 'INVESTOR', 'STARTUP_FOUNDER') NOT NULL,
    status ENUM('ACTIVE', 'INACTIVE', 'SUSPENDED') DEFAULT 'ACTIVE',
    kyc_status ENUM('PENDING', 'APPROVED', 'REJECTED') DEFAULT 'PENDING',
    pan_number VARCHAR(20),
    aadhaar_number VARCHAR(20),
    address_proof VARCHAR(255),
    kyc_approved_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_username (username),
    INDEX idx_kyc_status (kyc_status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE startups (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    founder_id BIGINT NOT NULL,
    name VARCHAR(100) NOT NULL UNIQUE,
    description LONGTEXT,
    industry VARCHAR(50),
    stage ENUM('SEED', 'SERIES_A', 'SERIES_B', 'GROWTH') DEFAULT 'SEED',
    valuation DECIMAL(15,2),
    founded_date DATE,
    employee_count INT,
    revenue DECIMAL(15,2),
    status ENUM('PENDING', 'ACTIVE', 'INACTIVE', 'DELISTED') DEFAULT 'PENDING',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (founder_id) REFERENCES users(id),
    INDEX idx_status (status),
    INDEX idx_founder_id (founder_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


CREATE TABLE stocks (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    startup_id BIGINT NOT NULL UNIQUE,
    symbol VARCHAR(10) UNIQUE NOT NULL,
    current_price DECIMAL(10,2) NOT NULL,
    total_shares BIGINT NOT NULL,
    circulating_shares BIGINT NOT NULL,
    day_high DECIMAL(10,2),
    day_low DECIMAL(10,2),
    year_high DECIMAL(10,2),
    year_low DECIMAL(10,2),
    day_volume BIGINT,
    status ENUM('ACTIVE', 'INACTIVE', 'HALTED') DEFAULT 'ACTIVE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (startup_id) REFERENCES startups(id),
    INDEX idx_symbol (symbol),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


CREATE TABLE wallets (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL UNIQUE,
    balance DECIMAL(15,2) DEFAULT 0,
    reserved_balance DECIMAL(15,2) DEFAULT 0,
    currency VARCHAR(3) DEFAULT 'INR',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    INDEX idx_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


CREATE TABLE holdings (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    stock_id BIGINT NOT NULL,
    quantity BIGINT NOT NULL,
    average_cost DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (stock_id) REFERENCES stocks(id),
    UNIQUE KEY unique_user_stock (user_id, stock_id),
    INDEX idx_user_id (user_id),
    INDEX idx_stock_id (stock_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


CREATE TABLE orders (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    stock_id BIGINT NOT NULL,
    order_type ENUM('BUY', 'SELL') NOT NULL,
    price_type ENUM('MARKET', 'LIMIT') NOT NULL,
    quantity BIGINT NOT NULL,
    filled_quantity BIGINT DEFAULT 0,
    price DECIMAL(10,2) NOT NULL,
    total_value DECIMAL(15,2) NOT NULL,
    status ENUM('PENDING', 'PARTIALLY_FILLED', 'EXECUTED', 'CANCELLED') DEFAULT 'PENDING',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    executed_at TIMESTAMP NULL,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (stock_id) REFERENCES stocks(id),
    INDEX idx_user_id (user_id),
    INDEX idx_status (status),
    INDEX idx_stock_id (stock_id),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE trades (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    buyer_id BIGINT NOT NULL,
    seller_id BIGINT NOT NULL,
    stock_id BIGINT NOT NULL,
    quantity BIGINT NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    total_value DECIMAL(15,2) NOT NULL,
    buy_order_id BIGINT,
    sell_order_id BIGINT,
    trade_type ENUM('MARKET', 'LIMIT') NOT NULL,
    status ENUM('EXECUTED', 'SETTLED') DEFAULT 'EXECUTED',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    settled_at TIMESTAMP NULL,
    FOREIGN KEY (buyer_id) REFERENCES users(id),
    FOREIGN KEY (seller_id) REFERENCES users(id),
    FOREIGN KEY (stock_id) REFERENCES stocks(id),
    FOREIGN KEY (buy_order_id) REFERENCES orders(id),
    FOREIGN KEY (sell_order_id) REFERENCES orders(id),
    INDEX idx_buyer_id (buyer_id),
    INDEX idx_seller_id (seller_id),
    INDEX idx_stock_id (stock_id),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


CREATE TABLE transactions (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    wallet_id BIGINT NOT NULL,
    transaction_type ENUM('DEPOSIT', 'WITHDRAWAL', 'TRADE_BUY', 'TRADE_SELL', 'DIVIDEND', 'FEE') NOT NULL,
    amount DECIMAL(15,2) NOT NULL,
    balance_before DECIMAL(15,2) NOT NULL,
    balance_after DECIMAL(15,2) NOT NULL,
    description VARCHAR(255),
    status ENUM('PENDING', 'COMPLETED', 'FAILED') DEFAULT 'PENDING',
    reference_id VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (wallet_id) REFERENCES wallets(id),
    INDEX idx_wallet_id (wallet_id),
    INDEX idx_type (transaction_type),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE price_history (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    stock_id BIGINT NOT NULL,
    date DATE NOT NULL,
    open_price DECIMAL(10,2) NOT NULL,
    high_price DECIMAL(10,2) NOT NULL,
    low_price DECIMAL(10,2) NOT NULL,
    close_price DECIMAL(10,2) NOT NULL,
    volume BIGINT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (stock_id) REFERENCES stocks(id),
    UNIQUE KEY unique_stock_date (stock_id, date),
    INDEX idx_stock_id (stock_id),
    INDEX idx_date (date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE ipo_listings (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    stock_id BIGINT NOT NULL,
    ipo_price DECIMAL(10,2) NOT NULL,
    min_price DECIMAL(10,2) NOT NULL,
    max_price DECIMAL(10,2) NOT NULL,
    shares_offered BIGINT NOT NULL,
    open_date DATE NOT NULL,
    close_date DATE NOT NULL,
    status ENUM('UPCOMING', 'OPEN', 'CLOSED', 'LISTED') DEFAULT 'UPCOMING',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (stock_id) REFERENCES stocks(id),
    UNIQUE KEY unique_stock_ipo (stock_id),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE ipo_applications (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    ipo_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    shares_applied BIGINT NOT NULL,
    amount DECIMAL(15,2) NOT NULL,
    shares_allotted BIGINT DEFAULT 0,
    status ENUM('PENDING', 'ALLOTTED', 'REJECTED') DEFAULT 'PENDING',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (ipo_id) REFERENCES ipo_listings(id),
    FOREIGN KEY (user_id) REFERENCES users(id),
    UNIQUE KEY unique_user_ipo (ipo_id, user_id),
    INDEX idx_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE dividends (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    startup_id BIGINT NOT NULL,
    dividend_per_share DECIMAL(10,2) NOT NULL,
    total_amount DECIMAL(15,2) NOT NULL,
    announcement_date DATE NOT NULL,
    payment_date DATE NOT NULL,
    status ENUM('ANNOUNCED', 'PAID', 'CANCELLED') DEFAULT 'ANNOUNCED',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (startup_id) REFERENCES startups(id),
    INDEX idx_startup_id (startup_id),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE stop_loss_orders (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    stock_id BIGINT NOT NULL,
    trigger_price DECIMAL(10,2) NOT NULL,
    quantity BIGINT NOT NULL,
    status ENUM('PENDING', 'TRIGGERED', 'CANCELLED') DEFAULT 'PENDING',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    triggered_at TIMESTAMP NULL,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (stock_id) REFERENCES stocks(id),
    INDEX idx_user_id (user_id),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


CREATE TABLE support_tickets (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    category VARCHAR(50) NOT NULL,
    subject VARCHAR(255) NOT NULL,
    description LONGTEXT NOT NULL,
    status ENUM('OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED') DEFAULT 'OPEN',
    priority ENUM('LOW', 'MEDIUM', 'HIGH') DEFAULT 'MEDIUM',
    assigned_to BIGINT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (assigned_to) REFERENCES users(id),
    INDEX idx_user_id (user_id),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


CREATE TABLE notifications (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    title VARCHAR(255) NOT NULL,
    message LONGTEXT NOT NULL,
    type ENUM('TRADE', 'DIVIDEND', 'ALERT', 'SYSTEM') NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    INDEX idx_user_id (user_id),
    INDEX idx_is_read (is_read)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


CREATE TABLE audit_logs (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT,
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id BIGINT NOT NULL,
    old_value LONGTEXT,
    new_value LONGTEXT,
    ip_address VARCHAR(45),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    INDEX idx_user_id (user_id),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert Admin User
INSERT INTO users (username, email, password_hash, full_name, phone, user_type, status, kyc_status, pan_number, aadhaar_number, kyc_approved_date)
VALUES ('admin', 'admin@nexora.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcg7b3XeKeUxWdeS86E36gBGYW2', 'Admin User', '9876543210', 'ADMIN', 'ACTIVE', 'APPROVED', 'ADMIN123456', 'ADMIN1234567890', CURDATE());

-- Insert Investor Users
INSERT INTO users (username, email, password_hash, full_name, phone, user_type, status, kyc_status, pan_number, aadhaar_number, kyc_approved_date)
VALUES 
('investor1', 'investor1@nexora.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcg7b3XeKeUxWdeS86E36gBGYW2', 'Rahul Sharma', '9876543211', 'INVESTOR', 'ACTIVE', 'APPROVED', 'INVESTOR123456', 'INVESTOR1234567890', CURDATE()),
('investor2', 'investor2@nexora.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcg7b3XeKeUxWdeS86E36gBGYW2', 'Priya Singh', '9876543212', 'INVESTOR', 'ACTIVE', 'APPROVED', 'INVESTOR234567', 'INVESTOR2234567890', CURDATE());

-- Insert Startup Founders
INSERT INTO users (username, email, password_hash, full_name, phone, user_type, status, kyc_status, pan_number, aadhaar_number, kyc_approved_date)
VALUES 
('founder1', 'founder1@startup1.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcg7b3XeKeUxWdeS86E36gBGYW2', 'Founder One', '9876543213', 'STARTUP_FOUNDER', 'ACTIVE', 'APPROVED', 'FOUNDER123456', 'FOUNDER1234567890', CURDATE()),
('founder2', 'founder2@startup2.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcg7b3XeKeUxWdeS86E36gBGYW2', 'Founder Two', '9876543214', 'STARTUP_FOUNDER', 'ACTIVE', 'APPROVED', 'FOUNDER234567', 'FOUNDER2234567890', CURDATE());

-- Create Wallets for Investors (auto-created for each investor)
INSERT INTO wallets (user_id, balance, reserved_balance, currency)
SELECT id, 500000.00, 0.00, 'INR' FROM users WHERE user_type = 'INVESTOR';

-- Create Startups
INSERT INTO startups (founder_id, name, description, industry, stage, valuation, founded_date, employee_count, revenue, status)
VALUES 
(3, 'TechFlow AI', 'AI-powered workflow automation platform for enterprises', 'TECH', 'SERIES_A', 500000000, '2020-01-15', 150, 50000000, 'ACTIVE'),
(4, 'HealthSync', 'Healthcare management platform with AI', 'HEALTHCARE', 'SEED', 100000000, '2021-06-20', 25, 5000000, 'ACTIVE'),
(3, 'FinMetrics', 'Personal finance management and analytics', 'FINTECH', 'SERIES_B', 300000000, '2019-03-10', 80, 20000000, 'ACTIVE'),
(4, 'EduHub', 'Online learning platform with gamification', 'EDTECH', 'GROWTH', 250000000, '2020-09-05', 60, 15000000, 'ACTIVE');

-- Create Stocks
INSERT INTO stocks (startup_id, symbol, current_price, total_shares, circulating_shares, day_high, day_low, year_high, year_low, day_volume, status)
VALUES 
(1, 'TFLOW', 250.50, 2000000, 1500000, 252.00, 249.00, 280.00, 200.00, 125000, 'ACTIVE'),
(2, 'HSYNC', 185.25, 1000000, 750000, 187.00, 183.00, 220.00, 150.00, 98500, 'ACTIVE'),
(3, 'FMTRIC', 120.75, 2500000, 2000000, 122.00, 119.00, 150.00, 100.00, 156000, 'ACTIVE'),
(4, 'EDUHB', 95.50, 2600000, 2500000, 96.00, 94.00, 120.00, 80.00, 205000, 'ACTIVE');

-- Create Holdings for Investors
INSERT INTO holdings (user_id, stock_id, quantity, average_cost)
VALUES 
(2, 1, 500, 240.00),
(2, 2, 300, 180.00),
(2, 3, 2000, 118.00),
(2, 4, 1200, 93.00);

-- Create Price History
INSERT INTO price_history (stock_id, date, open_price, high_price, low_price, close_price, volume)
VALUES 
(1, DATE_SUB(CURDATE(), INTERVAL 10 DAY), 245.00, 252.00, 244.00, 251.00, 125000),
(1, DATE_SUB(CURDATE(), INTERVAL 9 DAY), 251.00, 255.00, 250.00, 254.00, 130000),
(1, DATE_SUB(CURDATE(), INTERVAL 8 DAY), 254.00, 252.00, 248.00, 250.50, 120000),
(2, DATE_SUB(CURDATE(), INTERVAL 10 DAY), 182.00, 186.00, 181.00, 185.00, 98500),
(2, DATE_SUB(CURDATE(), INTERVAL 9 DAY), 185.00, 187.00, 184.00, 186.00, 102000),
(2, DATE_SUB(CURDATE(), INTERVAL 8 DAY), 186.00, 185.00, 183.00, 185.25, 95000),
(3, DATE_SUB(CURDATE(), INTERVAL 10 DAY), 118.00, 122.00, 117.00, 121.00, 156000),
(3, DATE_SUB(CURDATE(), INTERVAL 9 DAY), 121.00, 123.00, 120.00, 122.50, 158000),
(3, DATE_SUB(CURDATE(), INTERVAL 8 DAY), 122.50, 121.00, 119.00, 120.75, 152000),
(4, DATE_SUB(CURDATE(), INTERVAL 10 DAY), 93.00, 96.00, 92.00, 95.00, 205000),
(4, DATE_SUB(CURDATE(), INTERVAL 9 DAY), 95.00, 97.00, 94.00, 96.00, 210000),
(4, DATE_SUB(CURDATE(), INTERVAL 8 DAY), 96.00, 95.00, 93.00, 95.50, 200000);

-- Create Orders
INSERT INTO orders (user_id, stock_id, order_type, price_type, quantity, filled_quantity, price, total_value, status, created_at, executed_at)
VALUES 
(2, 1, 'BUY', 'MARKET', 500, 500, 240.00, 120000.00, 'EXECUTED', DATE_SUB(NOW(), INTERVAL 20 DAY), DATE_SUB(NOW(), INTERVAL 20 DAY)),
(2, 2, 'BUY', 'MARKET', 300, 300, 180.00, 54000.00, 'EXECUTED', DATE_SUB(NOW(), INTERVAL 18 DAY), DATE_SUB(NOW(), INTERVAL 18 DAY)),
(2, 3, 'BUY', 'LIMIT', 2000, 2000, 118.00, 236000.00, 'EXECUTED', DATE_SUB(NOW(), INTERVAL 15 DAY), DATE_SUB(NOW(), INTERVAL 15 DAY)),
(2, 4, 'BUY', 'MARKET', 1200, 1200, 93.00, 111600.00, 'EXECUTED', DATE_SUB(NOW(), INTERVAL 10 DAY), DATE_SUB(NOW(), INTERVAL 10 DAY));

-- Create IPO Listings
INSERT INTO ipo_listings (stock_id, ipo_price, min_price, max_price, shares_offered, open_date, close_date, status)
VALUES 
(1, 200.00, 190.00, 210.00, 500000, DATE_SUB(CURDATE(), INTERVAL 30 DAY), DATE_SUB(CURDATE(), INTERVAL 25 DAY), 'LISTED'),
(2, 150.00, 140.00, 160.00, 300000, DATE_SUB(CURDATE(), INTERVAL 60 DAY), DATE_SUB(CURDATE(), INTERVAL 55 DAY), 'LISTED');

-- Create Dividends
INSERT INTO dividends (startup_id, dividend_per_share, total_amount, announcement_date, payment_date, status)
VALUES 
(1, 5.00, 7500000.00, DATE_SUB(CURDATE(), INTERVAL 90 DAY), DATE_SUB(CURDATE(), INTERVAL 60 DAY), 'PAID'),
(3, 2.50, 5000000.00, DATE_SUB(CURDATE(), INTERVAL 45 DAY), DATE_SUB(CURDATE(), INTERVAL 30 DAY), 'PAID');

-- Verify all tables are created
SHOW TABLES;

-- Verify user data
SELECT COUNT(*) as total_users FROM users;
SELECT * FROM users;

-- Verify wallets
SELECT * FROM wallets;

-- Verify startups
SELECT * FROM startups;

-- Verify stocks
SELECT * FROM stocks;

drop table users;
drop table startups;
drop table stocks;
drop table holdings;
drop table orders;
drop table trades;
drop table price_history;
drop tables ipo_listings;
drop tables ipo_applications;

