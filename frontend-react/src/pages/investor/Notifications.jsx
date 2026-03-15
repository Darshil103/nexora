import useNotificationStore from '../../store/notificationStore';
import { formatDateTime } from '../../data/mockData';
import './InvestorPages.css';

const Notifications = () => {
  const { notifications, markAsRead, markAllAsRead, unreadCount } = useNotificationStore();

  const typeStyles = {
    TRADE: { icon: '📈', color: 'var(--accent-green)' },
    DIVIDEND: { icon: '💰', color: 'var(--accent-gold)' },
    ALERT: { icon: '🔔', color: 'var(--accent-red)' },
    SYSTEM: { icon: '⚙️', color: 'var(--accent-blue)' },
  };

  return (
    <div className="page-container animate-fade-in">
      <div className="page-header">
        <h1 className="page-title">Notifications</h1>
        {unreadCount > 0 && (
          <button className="btn btn-secondary btn-sm" onClick={markAllAsRead}>Mark all as read ({unreadCount})</button>
        )}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {notifications.map((n) => {
          const style = typeStyles[n.type] || typeStyles.SYSTEM;
          return (
            <div
              key={n.id}
              className="card"
              onClick={() => !n.is_read && markAsRead(n.id)}
              style={{
                cursor: n.is_read ? 'default' : 'pointer',
                borderColor: n.is_read ? 'var(--border-accent)' : style.color,
                padding: '16px 20px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
                <span style={{ fontSize: '1.5rem' }}>{style.icon}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                    <span style={{ fontWeight: 600, color: n.is_read ? 'var(--text-secondary)' : 'var(--text-primary)' }}>{n.title}</span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{formatDateTime(n.createdAt)}</span>
                  </div>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{n.message}</p>
                </div>
                {!n.is_read && <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: style.color, flexShrink: 0, marginTop: '6px' }}></div>}
              </div>
            </div>
          );
        })}
      </div>

      {notifications.length === 0 && <div className="empty-state"><p>No notifications</p></div>}
    </div>
  );
};

export default Notifications;
