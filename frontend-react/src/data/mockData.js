// Mock data for development before backend is ready

export const mockUser = {
  id: 1,
  username: 'investor1',
  email: 'john@example.com',
  full_name: 'John Sharma',
  phone: '9876543210',
  userType: 'INVESTOR',
  status: 'ACTIVE',
  kyc_status: 'APPROVED',
  pan_number: 'ABCDE1234F',
  aadhaar_number: '123456789012',
  created_at: '2025-01-15T10:00:00',
};

export const mockStocks = [
  { id: 1, startup_id: 1, symbol: 'TFLOW', name: 'TechFlow AI', industry: 'TECH', stage: 'SERIES_A', currentPrice: 245.50, dayHigh: 252.00, dayLow: 240.10, yearHigh: 310.00, yearLow: 120.00, day_volume: 125400, total_shares: 1000000, circulating_shares: 400000, status: 'ACTIVE', change: 3.2, valuation: 500000000, description: 'AI-powered workflow automation platform for enterprises. Building next-gen productivity tools using large language models.', founded_date: '2022-03-15', employee_count: 85, revenue: 12000000 },
  { id: 2, startup_id: 2, symbol: 'HSYNC', name: 'HealthSync', industry: 'HEALTHCARE', stage: 'SEED', currentPrice: 89.75, dayHigh: 92.00, dayLow: 87.50, yearHigh: 105.00, yearLow: 45.00, day_volume: 78200, total_shares: 500000, circulating_shares: 150000, status: 'ACTIVE', change: -1.5, valuation: 100000000, description: 'Digital health records and telemedicine platform connecting patients with healthcare providers across India.', founded_date: '2023-06-01', employee_count: 42, revenue: 5500000 },
  { id: 3, startup_id: 3, symbol: 'FMTRIC', name: 'FinMetrics', industry: 'FINTECH', stage: 'SERIES_B', currentPrice: 178.30, dayHigh: 182.00, dayLow: 175.00, yearHigh: 220.00, yearLow: 95.00, day_volume: 234500, total_shares: 800000, circulating_shares: 350000, status: 'ACTIVE', change: 5.8, valuation: 300000000, description: 'Advanced financial analytics and risk assessment tools for banks and NBFCs in the Indian market.', founded_date: '2021-11-10', employee_count: 120, revenue: 28000000 },
  { id: 4, startup_id: 4, symbol: 'EDUHB', name: 'EduHub', industry: 'EDTECH', stage: 'GROWTH', currentPrice: 156.00, dayHigh: 158.50, dayLow: 152.00, yearHigh: 175.00, yearLow: 80.00, day_volume: 156300, total_shares: 600000, circulating_shares: 280000, status: 'ACTIVE', change: -0.8, valuation: 250000000, description: 'Personalized learning platform with AI tutors for K-12 students. 2M+ active learners across India.', founded_date: '2020-08-20', employee_count: 200, revenue: 45000000 },
  { id: 5, startup_id: 5, symbol: 'GRNEV', name: 'GreenEV Motors', industry: 'TECH', stage: 'SERIES_A', currentPrice: 312.40, dayHigh: 320.00, dayLow: 305.00, yearHigh: 340.00, yearLow: 180.00, day_volume: 89000, total_shares: 750000, circulating_shares: 200000, status: 'ACTIVE', change: 7.1, valuation: 400000000, description: 'Electric vehicle manufacturing startup focused on affordable 2-wheelers and 3-wheelers for Indian markets.', founded_date: '2022-01-05', employee_count: 150, revenue: 18000000 },
  { id: 6, startup_id: 6, symbol: 'AGRIX', name: 'AgriX Solutions', industry: 'TECH', stage: 'SEED', currentPrice: 67.20, dayHigh: 70.00, dayLow: 65.50, yearHigh: 85.00, yearLow: 40.00, day_volume: 45000, total_shares: 400000, circulating_shares: 100000, status: 'ACTIVE', change: -2.3, valuation: 80000000, description: 'AgriTech platform using IoT sensors and AI to help Indian farmers optimize crop yield and reduce waste.', founded_date: '2023-09-12', employee_count: 30, revenue: 2500000 },
];

export const mockHoldings = [
  { id: 1, stock_id: 1, symbol: 'TFLOW', name: 'TechFlow AI', quantity: 100, average_cost: 200.00, currentPrice: 245.50 },
  { id: 2, stock_id: 3, symbol: 'FMTRIC', name: 'FinMetrics', quantity: 50, average_cost: 150.00, currentPrice: 178.30 },
  { id: 3, stock_id: 4, symbol: 'EDUHB', name: 'EduHub', quantity: 75, average_cost: 140.00, currentPrice: 156.00 },
  { id: 4, stock_id: 5, symbol: 'GRNEV', name: 'GreenEV Motors', quantity: 30, average_cost: 280.00, currentPrice: 312.40 },
];

export const mockWallet = {
  id: 1,
  user_id: 1,
  balance: 250000.00,
  reserved_balance: 15000.00,
  currency: 'INR',
};

export const mockOrders = [
  { id: 1, stock_id: 1, symbol: 'TFLOW', order_type: 'BUY', price_type: 'MARKET', quantity: 50, filled_quantity: 50, price: 245.50, total_value: 12275, status: 'EXECUTED', created_at: '2026-03-09T14:30:00', executed_at: '2026-03-09T14:30:05' },
  { id: 2, stock_id: 3, symbol: 'FMTRIC', order_type: 'BUY', price_type: 'LIMIT', quantity: 30, filled_quantity: 0, price: 170.00, total_value: 5100, status: 'PENDING', created_at: '2026-03-09T15:00:00', executed_at: null },
  { id: 3, stock_id: 2, symbol: 'HSYNC', order_type: 'SELL', price_type: 'MARKET', quantity: 20, filled_quantity: 20, price: 89.75, total_value: 1795, status: 'EXECUTED', created_at: '2026-03-08T11:00:00', executed_at: '2026-03-08T11:00:03' },
  { id: 4, stock_id: 4, symbol: 'EDUHB', order_type: 'BUY', price_type: 'LIMIT', quantity: 25, filled_quantity: 10, price: 153.00, total_value: 3825, status: 'PARTIALLY_FILLED', created_at: '2026-03-08T09:30:00', executed_at: null },
  { id: 5, stock_id: 1, symbol: 'TFLOW', order_type: 'SELL', price_type: 'LIMIT', quantity: 15, filled_quantity: 0, price: 260.00, total_value: 3900, status: 'CANCELLED', created_at: '2026-03-07T16:00:00', executed_at: null },
];

export const mockTransactions = [
  { id: 1, transaction_type: 'DEPOSIT', amount: 100000, balance_before: 150000, balance_after: 250000, description: 'UPI Deposit', status: 'COMPLETED', reference_id: 'UPI12345', created_at: '2026-03-09T10:00:00' },
  { id: 2, transaction_type: 'TRADE_BUY', amount: -12275, balance_before: 250000, balance_after: 237725, description: 'Bought 50 shares of TFLOW', status: 'COMPLETED', reference_id: 'ORD001', created_at: '2026-03-09T14:30:05' },
  { id: 3, transaction_type: 'TRADE_SELL', amount: 1795, balance_before: 237725, balance_after: 239520, description: 'Sold 20 shares of HSYNC', status: 'COMPLETED', reference_id: 'ORD003', created_at: '2026-03-08T11:00:03' },
  { id: 4, transaction_type: 'DIVIDEND', amount: 500, balance_before: 239520, balance_after: 240020, description: 'Dividend from TechFlow AI', status: 'COMPLETED', reference_id: 'DIV001', created_at: '2026-03-07T09:00:00' },
  { id: 5, transaction_type: 'WITHDRAWAL', amount: -50000, balance_before: 240020, balance_after: 190020, description: 'Bank Withdrawal', status: 'COMPLETED', reference_id: 'WD001', created_at: '2026-03-06T15:00:00' },
];

export const mockIPOs = [
  { id: 1, stock_id: 7, startup_name: 'SolarGrid Energy', symbol: 'SGRID', ipo_price: 120.00, min_price: 110.00, max_price: 130.00, shares_offered: 200000, open_date: '2026-03-15', close_date: '2026-03-18', status: 'UPCOMING', industry: 'TECH', description: 'Distributed solar energy solutions for rural India' },
  { id: 2, stock_id: 8, startup_name: 'CloudKitchen India', symbol: 'CKIT', ipo_price: 85.00, min_price: 80.00, max_price: 90.00, shares_offered: 150000, open_date: '2026-03-10', close_date: '2026-03-13', status: 'OPEN', industry: 'TECH', description: 'Multi-brand cloud kitchen network across tier-1 cities' },
  { id: 3, stock_id: 9, startup_name: 'MedPharm AI', symbol: 'MPAI', ipo_price: 200.00, min_price: 190.00, max_price: 210.00, shares_offered: 300000, open_date: '2026-02-20', close_date: '2026-02-25', status: 'LISTED', industry: 'HEALTHCARE', description: 'AI-driven drug discovery platform' },
];

export const mockDividends = [
  { id: 1, startup_id: 1, startup_name: 'TechFlow AI', symbol: 'TFLOW', dividend_per_share: 5.00, total_amount: 500000, announcement_date: '2026-03-01', payment_date: '2026-03-15', status: 'ANNOUNCED' },
  { id: 2, startup_id: 3, startup_name: 'FinMetrics', symbol: 'FMTRIC', dividend_per_share: 3.50, total_amount: 280000, announcement_date: '2026-02-15', payment_date: '2026-03-01', status: 'PAID' },
  { id: 3, startup_id: 4, startup_name: 'EduHub', symbol: 'EDUHB', dividend_per_share: 2.00, total_amount: 120000, announcement_date: '2026-01-20', payment_date: '2026-02-01', status: 'PAID' },
];

export const mockNotifications = [
  { id: 1, title: 'Order Executed', message: 'Your buy order for 50 shares of TFLOW has been executed at ₹245.50', type: 'TRADE', is_read: false, created_at: '2026-03-09T14:30:05' },
  { id: 2, title: 'Dividend Announced', message: 'TechFlow AI announced a dividend of ₹5.00 per share', type: 'DIVIDEND', is_read: false, created_at: '2026-03-09T12:00:00' },
  { id: 3, title: 'IPO Opening Soon', message: 'SolarGrid Energy IPO opens on March 15, 2026', type: 'ALERT', is_read: true, created_at: '2026-03-08T09:00:00' },
  { id: 4, title: 'KYC Approved', message: 'Your KYC verification has been approved. You can now trade on Nexora.', type: 'SYSTEM', is_read: true, created_at: '2026-03-05T16:00:00' },
  { id: 5, title: 'Price Alert', message: 'GRNEV has risen 7.1% today. Current price: ₹312.40', type: 'ALERT', is_read: false, created_at: '2026-03-09T15:00:00' },
];

export const mockPriceHistory = Array.from({ length: 90 }, (_, i) => {
  const date = new Date('2025-12-15');
  date.setDate(date.getDate() + i);
  const base = 200 + Math.sin(i / 10) * 30 + (i * 0.5);
  return {
    date: date.toISOString().split('T')[0],
    open_price: +(base + Math.random() * 5).toFixed(2),
    high_price: +(base + 5 + Math.random() * 10).toFixed(2),
    low_price: +(base - 5 - Math.random() * 5).toFixed(2),
    close_price: +(base + Math.random() * 8 - 2).toFixed(2),
    volume: Math.floor(50000 + Math.random() * 100000),
  };
});

export const mockStopLossOrders = [
  { id: 1, stock_id: 1, symbol: 'TFLOW', trigger_price: 220.00, quantity: 50, status: 'PENDING', created_at: '2026-03-08T10:00:00' },
  { id: 2, stock_id: 3, symbol: 'FMTRIC', trigger_price: 160.00, quantity: 25, status: 'PENDING', created_at: '2026-03-07T14:00:00' },
];

export const mockSupportTickets = [
  { id: 1, category: 'Trading', subject: 'Order not executing', description: 'My limit order has been pending for 2 days', status: 'OPEN', priority: 'HIGH', created_at: '2026-03-09T10:00:00' },
  { id: 2, category: 'Wallet', subject: 'Deposit not reflecting', description: 'Made a UPI deposit yesterday but balance not updated', status: 'IN_PROGRESS', priority: 'MEDIUM', created_at: '2026-03-08T14:00:00' },
];

// Admin mock data
export const mockAdminStats = {
  total_users: 15420,
  total_investors: 12350,
  total_founders: 3050,
  total_startups: 248,
  total_trades_today: 3420,
  total_volume_today: 45600000,
  pending_kyc: 127,
  active_ipos: 2,
};

export const mockAllUsers = [
  { id: 1, full_name: 'John Sharma', email: 'john@ex.com', userType: 'INVESTOR', status: 'ACTIVE', kyc_status: 'APPROVED', created_at: '2025-01-15' },
  { id: 2, full_name: 'Priya Patel', email: 'priya@ex.com', userType: 'STARTUP_FOUNDER', status: 'ACTIVE', kyc_status: 'APPROVED', created_at: '2025-02-20' },
  { id: 3, full_name: 'Rahul Kumar', email: 'rahul@ex.com', userType: 'INVESTOR', status: 'ACTIVE', kyc_status: 'PENDING', created_at: '2026-03-01' },
  { id: 4, full_name: 'Anita Desai', email: 'anita@ex.com', userType: 'INVESTOR', status: 'SUSPENDED', kyc_status: 'REJECTED', created_at: '2025-06-10' },
  { id: 5, full_name: 'Vikram Singh', email: 'vikram@ex.com', userType: 'STARTUP_FOUNDER', status: 'ACTIVE', kyc_status: 'APPROVED', created_at: '2025-04-05' },
  { id: 6, full_name: 'Admin User', email: 'admin@nexora.com', userType: 'ADMIN', status: 'ACTIVE', kyc_status: 'APPROVED', created_at: '2024-01-01' },
];

export const mockAuditLogs = [
  { id: 1, user_id: 1, user_name: 'John Sharma', action: 'ORDER_PLACED', entity_type: 'ORDER', entity_id: 1, ip_address: '192.168.1.10', created_at: '2026-03-09T14:30:00', old_value: null, new_value: '{"type":"BUY","symbol":"TFLOW","qty":50}' },
  { id: 2, user_id: 6, user_name: 'Admin User', action: 'KYC_APPROVED', entity_type: 'USER', entity_id: 3, ip_address: '192.168.1.1', created_at: '2026-03-09T12:00:00', old_value: '{"kyc_status":"PENDING"}', new_value: '{"kyc_status":"APPROVED"}' },
  { id: 3, user_id: 6, user_name: 'Admin User', action: 'STOCK_HALTED', entity_type: 'STOCK', entity_id: 2, ip_address: '192.168.1.1', created_at: '2026-03-08T16:00:00', old_value: '{"status":"ACTIVE"}', new_value: '{"status":"HALTED"}' },
  { id: 4, user_id: 2, user_name: 'Priya Patel', action: 'STARTUP_UPDATED', entity_type: 'STARTUP', entity_id: 1, ip_address: '192.168.1.20', created_at: '2026-03-08T11:00:00', old_value: '{"revenue":10000000}', new_value: '{"revenue":12000000}' },
];

export const mockTrades = [
  { id: 1, buyer_name: 'John Sharma', seller_name: 'Vikram Singh', symbol: 'TFLOW', quantity: 50, price: 245.50, total_value: 12275, trade_type: 'MARKET', status: 'EXECUTED', created_at: '2026-03-09T14:30:05' },
  { id: 2, buyer_name: 'Rahul Kumar', seller_name: 'Anita Desai', symbol: 'FMTRIC', quantity: 30, price: 178.30, total_value: 5349, trade_type: 'LIMIT', status: 'SETTLED', created_at: '2026-03-09T11:00:00' },
  { id: 3, buyer_name: 'Priya Patel', seller_name: 'John Sharma', symbol: 'HSYNC', quantity: 20, price: 89.75, total_value: 1795, trade_type: 'MARKET', status: 'EXECUTED', created_at: '2026-03-08T11:00:03' },
];

// Helper function to format INR currency
export const formatINR = (amount) => {
  if (amount === null || amount === undefined) return '₹0';
  const absAmount = Math.abs(amount);
  if (absAmount >= 10000000) return `₹${(amount / 10000000).toFixed(2)} Cr`;
  if (absAmount >= 100000) return `₹${(amount / 100000).toFixed(2)} L`;
  return `₹${absAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

export const formatNumber = (num) => {
  if (!num) return '0';
  return num.toLocaleString('en-IN');
};

export const formatDate = (dateStr) => {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
};

export const formatDateTime = (dateStr) => {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
};

export const getStatusBadgeClass = (status) => {
  const map = {
    ACTIVE: 'badge-active', APPROVED: 'badge-approved', EXECUTED: 'badge-executed', COMPLETED: 'badge-green',
    SETTLED: 'badge-green', LISTED: 'badge-green', ALLOTTED: 'badge-green', PAID: 'badge-green', RESOLVED: 'badge-green',
    PENDING: 'badge-pending', UPCOMING: 'badge-amber', ANNOUNCED: 'badge-amber', IN_PROGRESS: 'badge-amber',
    PARTIALLY_FILLED: 'badge-amber', OPEN: 'badge-amber',
    REJECTED: 'badge-rejected', CANCELLED: 'badge-cancelled', SUSPENDED: 'badge-suspended', FAILED: 'badge-red',
    CLOSED: 'badge-red', TRIGGERED: 'badge-red',
    INACTIVE: 'badge-inactive', HALTED: 'badge-halted', DELISTED: 'badge-gray',
    BUY: 'badge-buy', SELL: 'badge-sell',
    MARKET: 'badge-cyan', LIMIT: 'badge-gold',
    LOW: 'badge-green', MEDIUM: 'badge-amber', HIGH: 'badge-red',
    ADMIN: 'badge-purple', INVESTOR: 'badge-cyan', STARTUP_FOUNDER: 'badge-gold',
  };
  return map[status] || 'badge-gray';
};

