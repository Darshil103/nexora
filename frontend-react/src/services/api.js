import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('nexora_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

const toCamel = (s) => s.replace(/([-_][a-z])/ig, ($1) => $1.toUpperCase().replace('-', '').replace('_', ''));
const keysToCamel = (o) => {
  if (o === Object(o) && !Array.isArray(o) && typeof o !== 'function') {
    const n = {};
    Object.keys(o).forEach((k) => { n[toCamel(k)] = keysToCamel(o[k]); });
    return n;
  } else if (Array.isArray(o)) {
    return o.map((i) => keysToCamel(i));
  }
  return o;
};

api.interceptors.response.use(
  (res) => {
    if (res.data) res.data = keysToCamel(res.data);
    return res;
  },
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('nexora_token');
      localStorage.removeItem('nexora_user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

// ========== AUTH ==========
export const authAPI = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  me: () => api.get('/auth/me'),
};

// ========== USERS & ADMIN ==========
export const usersAPI = {
  getAll: (params) => api.get('/admin/users', { params }),
  getById: (id) => api.get(`/admin/users/${id}`),
  update: (id, data) => api.put(`/users/me`, data),
  updateStatus: (id, status) => status === 'SUSPENDED' ? api.put(`/admin/users/${id}/suspend`) : api.put(`/admin/users/${id}/activate`),
  updateKyc: (id, status) => status === 'APPROVED' ? api.put(`/admin/users/${id}/approve-kyc`) : api.put(`/admin/users/${id}/reject-kyc`),
  submitKyc: (data) => api.post('/users/kyc', data),
  changePassword: (data) => api.post('/users/change-password', data),
  getAdminStats: () => api.get('/admin/stats'),
  getAdminAuditLogs: () => api.get('/admin/audit-logs'),
  getAdminTrades: () => api.get('/admin/trades'),
  getAdminSupport: () => api.get('/admin/support'),
};

// ========== STARTUPS ==========
export const startupsAPI = {
  getAll: (params) => api.get('/startups', { params }),
  getById: (id) => api.get(`/startups/${id}`),
  create: (data) => api.post('/startups', data),
  update: (id, data) => api.put(`/startups/${id}`, data),
  getByFounder: (founderId) => api.get(`/startups/founder/${founderId}`),
  adminUpdateStatus: (id, status) => status === 'ACTIVE' ? api.put(`/admin/startups/${id}/approve`) : api.put(`/admin/startups/${id}/reject`),
};

// ========== STOCKS ==========
export const stocksAPI = {
  getAll: (params) => api.get('/stocks', { params }),
  getBySymbol: (symbol) => api.get(`/stocks/symbol/${symbol}`),
  getById: (id) => api.get(`/stocks/${id}`),
  update: (id, data) => api.put(`/stocks/${id}`, data),
  updateStatus: (id, status) => status === 'HALTED' ? api.put(`/admin/stocks/${id}/halt`) : api.put(`/admin/stocks/${id}/activate`),
  getPriceHistory: (stockId, params) => api.get(`/stocks/${stockId}/price-history`, { params }),
};

// ========== ORDERS ==========
export const ordersAPI = {
  getAll: (params) => api.get('/orders', { params }),
  getByUser: (userId, params) => api.get(`/orders`, { params }),
  create: (data) => api.post('/orders', data),
  cancel: (id) => api.delete(`/orders/${id}`),
};

// ========== TRADES ==========
export const tradesAPI = {
  getAll: (params) => api.get('/trades', { params }),
  getByStock: (stockId) => api.get(`/trades/stock/${stockId}`),
  getByUser: (userId) => api.get(`/trades`),
};

// ========== WALLETS ==========
export const walletsAPI = {
  getByUser: () => api.get('/wallet'),
  deposit: (data) => api.post('/wallet/deposit', data),
  withdraw: (data) => api.post('/wallet/withdraw', data),
};

// ========== TRANSACTIONS ==========
export const transactionsAPI = {
  getByWallet: () => api.get('/wallet/transactions'),
};

// ========== HOLDINGS ==========
export const holdingsAPI = {
  getByUser: (userId) => api.get(`/holdings`),
  getByUserAndStock: (userId, stockId) => api.get(`/holdings/user/${userId}/stock/${stockId}`),
};

// ========== IPO ==========
export const ipoAPI = {
  getAll: (params) => api.get('/ipo/listings', { params }),
  getById: (id) => api.get(`/ipo/listings/${id}`),
  create: (data) => api.post('/ipo/listings', data),
  update: (id, data) => api.put(`/admin/ipo/${id}/status`, data),
  apply: (data) => api.post('/ipo/apply', data),
  getApplications: (ipoId) => api.get(`/ipo/${ipoId}/applications`),
  getMyApplications: (userId) => api.get(`/ipo/applications`),
};

// ========== DIVIDENDS ==========
export const dividendsAPI = {
  getAll: (params) => api.get('/dividends', { params }),
  getByStartup: (startupId) => api.get(`/dividends/startup/${startupId}`),
  create: (data) => api.post('/dividends', data),
  updateStatus: (id, status) => status === 'PAID' ? api.put(`/admin/dividends/${id}/pay`) : api.put(`/admin/dividends/${id}/cancel`),
};

// ========== STOP LOSS ==========
export const stopLossAPI = {
  getByUser: (userId) => api.get(`/stop-loss/user/${userId}`),
  create: (data) => api.post('/stop-loss', data),
  cancel: (id) => api.patch(`/stop-loss/${id}/cancel`),
};

// ========== SUPPORT ==========
export const supportAPI = {
  getAll: (params) => api.get('/support', { params }),
  getByUser: (userId) => api.get(`/support/user/${userId}`),
  create: (data) => api.post('/support', data),
  update: (id, data) => api.put(`/support/${id}`, data),
};

// ========== NOTIFICATIONS ==========
export const notificationsAPI = {
  getByUser: (userId) => api.get(`/notifications`),
  markRead: (id) => api.put(`/notifications/${id}/read`),
  markAllRead: (userId) => api.put(`/notifications/read-all`),
  getUnreadCount: (userId) => api.get(`/notifications/unread-count`),
};

// ========== AUDIT LOGS ==========
// ========== REPORTS ==========
export const reportsAPI = {
  getPortfolioTrend: (userId) => api.get(`/reports/portfolio-trend/${userId}`),
};

export default api;
