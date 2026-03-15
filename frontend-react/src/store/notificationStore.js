import { create } from 'zustand';

const useNotificationStore = create((set) => ({
  notifications: [],
  unreadCount: 0,

  setNotifications: (notifications) => set({
    notifications,
    unreadCount: notifications.filter((n) => !n.is_read).length,
  }),

  markAsRead: (id) => set((state) => ({
    notifications: state.notifications.map((n) =>
      n.id === id ? { ...n, is_read: true } : n
    ),
    unreadCount: state.unreadCount - 1,
  })),

  markAllAsRead: () => set((state) => ({
    notifications: state.notifications.map((n) => ({ ...n, is_read: true })),
    unreadCount: 0,
  })),

  addNotification: (notification) => set((state) => ({
    notifications: [notification, ...state.notifications],
    unreadCount: state.unreadCount + 1,
  })),
}));

export default useNotificationStore;
