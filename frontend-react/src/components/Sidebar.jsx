import { NavLink, useLocation } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import {
  IoGridOutline, IoTrendingUpOutline, IoWalletOutline, IoBriefcaseOutline,
  IoReceiptOutline, IoRocketOutline, IoCashOutline, IoNotificationsOutline,
  IoHelpCircleOutline, IoPersonOutline, IoBusinessOutline, IoStatsChartOutline,
  IoPeopleOutline, IoSettingsOutline, IoShieldCheckmarkOutline, IoDocumentTextOutline,
  IoBarChartOutline, IoLayersOutline, IoSwapHorizontalOutline,
} from 'react-icons/io5';
import './Sidebar.css';

const Sidebar = ({ collapsed, onToggle }) => {
  const { user } = useAuthStore();
  const location = useLocation();
  const role = user?.userType;

  const investorLinks = [
    { to: '/investor/dashboard', icon: <IoGridOutline />, label: 'Dashboard' },
    { to: '/investor/market', icon: <IoTrendingUpOutline />, label: 'Market' },
    { to: '/investor/portfolio', icon: <IoBriefcaseOutline />, label: 'Portfolio' },
    { to: '/investor/orders', icon: <IoReceiptOutline />, label: 'Orders' },
    { to: '/investor/wallet', icon: <IoWalletOutline />, label: 'Wallet' },
    { to: '/investor/ipo', icon: <IoRocketOutline />, label: 'IPO' },
    { to: '/investor/dividends', icon: <IoCashOutline />, label: 'Dividends' },
    { to: '/investor/notifications', icon: <IoNotificationsOutline />, label: 'Notifications' },
    { to: '/investor/support', icon: <IoHelpCircleOutline />, label: 'Support' },
    { to: '/investor/profile', icon: <IoPersonOutline />, label: 'Profile' },
  ];

  const founderLinks = [
    { to: '/founder/dashboard', icon: <IoGridOutline />, label: 'Dashboard' },
    { to: '/founder/ipo', icon: <IoRocketOutline />, label: 'IPO Management' },
    { to: '/founder/support', icon: <IoHelpCircleOutline />, label: 'Support' },
    { to: '/founder/profile', icon: <IoPersonOutline />, label: 'Profile' },
  ];

  const adminLinks = [
    { to: '/admin/dashboard', icon: <IoGridOutline />, label: 'Dashboard' },
    { to: '/admin/users', icon: <IoPeopleOutline />, label: 'Users' },
    { to: '/admin/startups', icon: <IoBusinessOutline />, label: 'Startups' },
    { to: '/admin/stocks', icon: <IoBarChartOutline />, label: 'Stocks' },
    { to: '/admin/ipo', icon: <IoRocketOutline />, label: 'IPO' },
    { to: '/admin/trades', icon: <IoSwapHorizontalOutline />, label: 'Trades' },
    { to: '/admin/support', icon: <IoHelpCircleOutline />, label: 'Support' },
    { to: '/admin/dividends', icon: <IoCashOutline />, label: 'Dividends' },
    { to: '/admin/audit', icon: <IoShieldCheckmarkOutline />, label: 'Audit Logs' },
    { to: '/admin/profile', icon: <IoPersonOutline />, label: 'Profile' },
  ];

  const links = role === 'ADMIN' ? adminLinks
    : role === 'STARTUP_FOUNDER' ? founderLinks
    : investorLinks;

  return (
    <aside className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-content">
        <div className="sidebar-section-label">{collapsed ? '' : 'MENU'}</div>
        <nav className="sidebar-nav">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
              title={link.label}
            >
              <span className="sidebar-icon">{link.icon}</span>
              {!collapsed && <span className="sidebar-label">{link.label}</span>}
            </NavLink>
          ))}
        </nav>
      </div>

      <button className="sidebar-toggle" onClick={onToggle}>
        <IoLayersOutline />
        {!collapsed && <span>Collapse</span>}
      </button>
    </aside>
  );
};

export default Sidebar;
