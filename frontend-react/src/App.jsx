import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import './index.css';

// Layouts & Guards
import DashboardLayout from './components/DashboardLayout';
import ProtectedRoute from './components/ProtectedRoute';

// Public Pages
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import KYC from './pages/KYC';

// Investor Pages
import InvestorDashboard from './pages/investor/InvestorDashboard';
import Market from './pages/investor/Market';
import StockDetail from './pages/investor/StockDetail';
import Portfolio from './pages/investor/Portfolio';
import Orders from './pages/investor/Orders';
import Wallet from './pages/investor/Wallet';
import IPO from './pages/investor/IPO';
import Dividends from './pages/investor/Dividends';
import Notifications from './pages/investor/Notifications';
import Support from './pages/investor/Support';
import Profile from './pages/investor/Profile';

// Founder Pages
import FounderDashboard from './pages/founder/FounderDashboard';
import StartupManage from './pages/founder/StartupManage';
import FounderIPO from './pages/founder/FounderIPO';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import UserManagement from './pages/admin/UserManagement';
import AdminStartups from './pages/admin/AdminStartups';
import AdminStocks from './pages/admin/AdminStocks';
import AdminIPO from './pages/admin/AdminIPO';
import AdminTrades from './pages/admin/AdminTrades';
import AdminSupport from './pages/admin/AdminSupport';
import AdminDividends from './pages/admin/AdminDividends';
import AuditLogs from './pages/admin/AuditLogs';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/kyc" element={<KYC />} />

        {/* Investor Routes */}
        <Route path="/investor" element={
          <ProtectedRoute allowedRoles={['INVESTOR']}>
            <DashboardLayout />
          </ProtectedRoute>
        }>
          <Route path="dashboard" element={<InvestorDashboard />} />
          <Route path="market" element={<Market />} />
          <Route path="stock/:symbol" element={<StockDetail />} />
          <Route path="portfolio" element={<Portfolio />} />
          <Route path="orders" element={<Orders />} />
          <Route path="wallet" element={<Wallet />} />
          <Route path="ipo" element={<IPO />} />
          <Route path="dividends" element={<Dividends />} />
          <Route path="notifications" element={<Notifications />} />
          <Route path="support" element={<Support />} />
          <Route path="profile" element={<Profile />} />
          <Route index element={<Navigate to="dashboard" replace />} />
        </Route>

        {/* Founder Routes */}
        <Route path="/founder" element={
          <ProtectedRoute allowedRoles={['STARTUP_FOUNDER']}>
            <DashboardLayout />
          </ProtectedRoute>
        }>
          <Route path="dashboard" element={<FounderDashboard />} />
          <Route path="startup/:id" element={<StartupManage />} />
          <Route path="ipo" element={<FounderIPO />} />
          <Route path="support" element={<Support />} />
          <Route path="profile" element={<Profile />} />
          <Route index element={<Navigate to="dashboard" replace />} />
        </Route>

        {/* Admin Routes */}
        <Route path="/admin" element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <DashboardLayout />
          </ProtectedRoute>
        }>
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="users" element={<UserManagement />} />
          <Route path="startups" element={<AdminStartups />} />
          <Route path="stocks" element={<AdminStocks />} />
          <Route path="ipo" element={<AdminIPO />} />
          <Route path="trades" element={<AdminTrades />} />
          <Route path="support" element={<AdminSupport />} />
          <Route path="dividends" element={<AdminDividends />} />
          <Route path="audit" element={<AuditLogs />} />
          <Route path="profile" element={<Profile />} />
          <Route index element={<Navigate to="dashboard" replace />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
