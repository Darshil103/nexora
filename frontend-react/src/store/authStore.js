import { create } from 'zustand';

const useAuthStore = create((set) => ({
  user: JSON.parse(localStorage.getItem('nexora_user') || 'null'),
  token: localStorage.getItem('nexora_token') || null,
  isAuthenticated: !!localStorage.getItem('nexora_token'),

  login: (user, token) => {
    localStorage.setItem('nexora_token', token);
    localStorage.setItem('nexora_user', JSON.stringify(user));
    set({ user, token, isAuthenticated: true });
  },

  logout: () => {
    localStorage.removeItem('nexora_token');
    localStorage.removeItem('nexora_user');
    set({ user: null, token: null, isAuthenticated: false });
  },

  updateUser: (userData) => {
    const updated = { ...JSON.parse(localStorage.getItem('nexora_user') || '{}'), ...userData };
    localStorage.setItem('nexora_user', JSON.stringify(updated));
    set({ user: updated });
  },

  isKycApproved: () => {
    const user = JSON.parse(localStorage.getItem('nexora_user') || '{}');
    return user.kycStatus === 'APPROVED';
  },

  getUserRole: () => {
    const user = JSON.parse(localStorage.getItem('nexora_user') || '{}');
    return user.userType || null;
  },

  getDashboardPath: () => {
    const user = JSON.parse(localStorage.getItem('nexora_user') || '{}');
    switch (user.userType) {
      case 'ADMIN': return '/admin/dashboard';
      case 'INVESTOR': return '/investor/dashboard';
      case 'STARTUP_FOUNDER': return '/founder/dashboard';
      default: return '/login';
    }
  },
}));

export default useAuthStore;
