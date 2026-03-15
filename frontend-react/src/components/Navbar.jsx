import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { IoNotificationsOutline, IoChevronDownOutline, IoLogOutOutline, IoPersonOutline, IoSettingsOutline } from 'react-icons/io5';
import useAuthStore from '../store/authStore';
import useNotificationStore from '../store/notificationStore';
import './Navbar.css';

const Navbar = () => {
  const { user, logout, getDashboardPath } = useAuthStore();
  const { unreadCount, notifications, markAsRead, markAllAsRead } = useNotificationStore();
  const navigate = useNavigate();
  const [showNotif, setShowNotif] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const notifRef = useRef(null);
  const profileRef = useRef(null);

  useEffect(() => {
    const handleClick = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) setShowNotif(false);
      if (profileRef.current && !profileRef.current.contains(e.target)) setShowProfile(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const notifTypeIcon = {
    TRADE: '📈', DIVIDEND: '💰', ALERT: '🔔', SYSTEM: '⚙️',
  };

  const profilePath = user?.userType === 'ADMIN' ? '/admin/profile'
    : user?.userType === 'STARTUP_FOUNDER' ? '/founder/profile'
    : '/investor/profile';

  return (
    <nav className="navbar">
      <div className="navbar-left">
        <Link to={getDashboardPath()} className="navbar-logo">
          <span className="logo-icon">◇</span>
          <span className="logo-text">NEXORA</span>
        </Link>
      </div>

      <div className="navbar-right">
        {/* Notifications */}
        <div className="navbar-notif" ref={notifRef}>
          <button className="notif-btn" onClick={() => setShowNotif(!showNotif)}>
            <IoNotificationsOutline />
            {unreadCount > 0 && <span className="notif-badge">{unreadCount}</span>}
          </button>
          {showNotif && (
            <div className="notif-dropdown">
              <div className="notif-header">
                <span>Notifications</span>
                {unreadCount > 0 && (
                  <button className="notif-mark-all" onClick={markAllAsRead}>Mark all read</button>
                )}
              </div>
              <div className="notif-list">
                {notifications.length === 0 ? (
                  <div className="notif-empty">No notifications</div>
                ) : (
                  notifications.slice(0, 8).map((n) => (
                    <div
                      key={n.id}
                      className={`notif-item ${!n.is_read ? 'unread' : ''}`}
                      onClick={() => markAsRead(n.id)}
                    >
                      <span className="notif-type-icon">{notifTypeIcon[n.type] || '📌'}</span>
                      <div className="notif-content">
                        <div className="notif-title">{n.title}</div>
                        <div className="notif-msg">{n.message}</div>
                      </div>
                      {!n.is_read && <span className="notif-dot"></span>}
                    </div>
                  ))
                )}
              </div>
              {notifications.length > 0 && (
                <Link to={`${user?.userType === 'INVESTOR' ? '/investor' : user?.userType === 'STARTUP_FOUNDER' ? '/founder' : '/admin'}/notifications`}
                  className="notif-view-all" onClick={() => setShowNotif(false)}>
                  View all notifications
                </Link>
              )}
            </div>
          )}
        </div>

        {/* Profile */}
        <div className="navbar-profile" ref={profileRef}>
          <button className="profile-btn" onClick={() => setShowProfile(!showProfile)}>
            <div className="avatar">{user?.fullName?.[0] || 'U'}</div>
            <div className="profile-info">
              <span className="profile-name">{user?.fullName || 'User'}</span>
              <span className="profile-role">{user?.userType?.replace('_', ' ')}</span>
            </div>
            <IoChevronDownOutline className="chevron" />
          </button>
          {showProfile && (
            <div className="profile-dropdown">
              <Link to={profilePath} className="dropdown-item" onClick={() => setShowProfile(false)}>
                <IoPersonOutline /> Profile
              </Link>
              <Link to={profilePath} className="dropdown-item" onClick={() => setShowProfile(false)}>
                <IoSettingsOutline /> Settings
              </Link>
              <hr />
              <button className="dropdown-item logout" onClick={handleLogout}>
                <IoLogOutOutline /> Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
