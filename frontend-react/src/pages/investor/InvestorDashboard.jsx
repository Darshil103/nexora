import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { IoTrendingUpOutline, IoTrendingDownOutline, IoWalletOutline, IoArrowForwardOutline } from 'react-icons/io5';
import { AreaChart, Area, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from 'recharts';
import useAuthStore from '../../store/authStore';
import { holdingsAPI, ordersAPI, transactionsAPI, walletsAPI, stocksAPI, reportsAPI } from '../../services/api';
import { formatINR, formatDateTime, getStatusBadgeClass } from '../../data/mockData';
import './InvestorPages.css';

const InvestorDashboard = () => {
  const { user } = useAuthStore();
  const kycApproved = user?.kycStatus === 'APPROVED';
  
  const [holdings, setHoldings] = useState([]);
  const [wallet, setWallet] = useState({ balance: 0, reservedBalance: 0 });
  const [recentOrders, setRecentOrders] = useState([]);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [topStocks, setTopStocks] = useState([]);
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    if (user?.id) fetchDashboardData();
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      const wRes = await walletsAPI.getByUser(user.id);
      if (wRes.data.success) {
        setWallet(wRes.data.data);
        const tRes = await transactionsAPI.getByWallet(wRes.data.data.id);
        if (tRes.data.success) setRecentTransactions(tRes.data.data.slice(0, 5));
      }

      const hRes = await holdingsAPI.getByUser(user.id);
      if (hRes.data.success) setHoldings(hRes.data.data);

      const oRes = await ordersAPI.getByUser(user.id);
      if (oRes.data.success) setRecentOrders(oRes.data.data.slice(0, 5));

      const sRes = await stocksAPI.getAll();
      if (sRes.data.success) {
        const sorted = sRes.data.data.sort((a, b) => Math.abs(b.change) - Math.abs(a.change)).slice(0, 5);
        setTopStocks(sorted);
      }

      const reportRes = await reportsAPI.getPortfolioTrend(user.id);
      if (reportRes.data.success) {
        setChartData(reportRes.data.data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const totalInvested = holdings.reduce((s, h) => s + h.quantity * (h.averageCost || h.average_cost || 0), 0);
  const currentValue = holdings.reduce((s, h) => s + h.quantity * (h.currentPrice || h.current_price || 0), 0);
  const totalPnl = currentValue - totalInvested;
  const pnlPct = totalInvested > 0 ? ((totalPnl / totalInvested) * 100) : 0;

  return (
    <div className="page-container animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="text-muted">Welcome back, {user?.fullName || 'Investor'} 👋</p>
        </div>
      </div>

      {/* KYC Banner */}
      {!kycApproved && (
        <div className="kyc-banner">
          <span className="kyc-icon">⚠️</span>
          <div className="kyc-text">
            <strong>KYC Verification Required</strong> — Complete your KYC to start trading on Nexora.
            <Link to="/kyc" style={{ marginLeft: '8px' }}>Complete Now →</Link>
          </div>
        </div>
      )}

      {/* Portfolio & Wallet Summary */}
      <div className="grid-4 mb-lg">
        <div className="card card-stat">
          <div className="stat-label">Total Invested</div>
          <div className="stat-value mono">{formatINR(totalInvested)}</div>
        </div>
        <div className="card card-stat">
          <div className="stat-label">Current Value</div>
          <div className="stat-value mono">{formatINR(currentValue)}</div>
        </div>
        <div className="card card-stat">
          <div className="stat-label">Total P&L</div>
          <div className={`stat-value mono ${totalPnl >= 0 ? 'text-green' : 'text-red'}`}>
            {totalPnl >= 0 ? '+' : ''}{formatINR(totalPnl)}
            <span style={{ fontSize: '0.9rem', marginLeft: '8px' }}>({pnlPct >= 0 ? '+' : ''}{pnlPct.toFixed(2)}%)</span>
          </div>
        </div>
        <div className="card card-stat">
          <div className="stat-label">Wallet Balance</div>
          <div className="stat-value mono text-cyan">{formatINR(wallet.balance)}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            Reserved: {formatINR(wallet.reservedBalance)}
          </div>
        </div>
      </div>

      <div className="dashboard-grid">
        {/* Holdings */}
        <div className="card" style={{ gridColumn: 'span 2' }}>
          <div className="card-header">
            <span className="card-title">My Holdings</span>
            <Link to="/investor/portfolio" className="btn btn-ghost btn-sm">View All <IoArrowForwardOutline /></Link>
          </div>
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Stock</th>
                  <th>Qty</th>
                  <th>Avg Cost</th>
                  <th>Current</th>
                  <th>P&L</th>
                </tr>
              </thead>
              <tbody>
                {holdings.map((h) => {
                  const pnl = ((h.currentPrice || h.current_price || 0) - (h.averageCost || h.average_cost || 0)) * h.quantity;
                  const pnlP = ((h.averageCost || h.average_cost) > 0) ? (((h.currentPrice || h.current_price || 0) - (h.averageCost || h.average_cost)) / (h.averageCost || h.average_cost)) * 100 : 0;
                  return (
                    <tr key={h.id}>
                      <td>
                        <Link to={`/investor/stock/${h.symbol}`} style={{ fontWeight: 600 }}>
                          <span className="mono">{h.symbol}</span>
                          <span className="text-muted" style={{ fontSize: '0.75rem', marginLeft: '8px' }}>{h.name}</span>
                        </Link>
                      </td>
                      <td className="mono tabular-nums">{h.quantity}</td>
                      <td className="mono tabular-nums">₹{(h.averageCost || h.average_cost || 0).toFixed(2)}</td>
                      <td className="mono tabular-nums">₹{(h.currentPrice || h.current_price || 0).toFixed(2)}</td>
                      <td className={`mono tabular-nums ${pnl >= 0 ? 'text-green' : 'text-red'}`}>
                        {pnl >= 0 ? '+' : ''}₹{pnl.toFixed(2)}
                        <span style={{ fontSize: '0.75rem', marginLeft: '4px' }}>({pnlP >= 0 ? '+' : ''}{pnlP.toFixed(1)}%)</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Mini Chart */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">Portfolio Trend</span>
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={chartData} margin={{ top: 20, right: 20, left: 10, bottom: 0 }}>
              <defs>
                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00D4FF" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#00D4FF" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} stroke="#1E2A45" strokeDasharray="4 4" />
              <XAxis 
                dataKey="date" 
                stroke="#6B7A99" 
                fontSize={11} 
                tickLine={false} 
                axisLine={false} 
                dy={10}
              />
              <YAxis 
                stroke="#6B7A99" 
                fontSize={11} 
                tickLine={false} 
                axisLine={false} 
                tickFormatter={(value) => `₹${value.toLocaleString()}`}
                width={80}
                dx={-10}
              />
              <Tooltip
                contentStyle={{ background: 'rgba(20, 29, 53, 0.9)', border: '1px solid #1E2A45', borderRadius: '8px', fontSize: '0.85rem', backdropFilter: 'blur(4px)' }}
                labelStyle={{ color: '#8899BB', marginBottom: '4px' }}
                itemStyle={{ color: '#00D4FF', fontWeight: 600 }}
                formatter={(value) => [`₹${value.toLocaleString()}`, 'Portfolio Value']}
              />
              <Area 
                type="monotone" 
                dataKey="value" 
                stroke="#00D4FF" 
                strokeWidth={3}
                fillOpacity={1} 
                fill="url(#colorValue)" 
                activeDot={{ r: 6, stroke: '#0F1626', strokeWidth: 2, fill: '#00D4FF' }} 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Orders & Transactions */}
      <div className="dashboard-grid mt-lg">
        <div className="card">
          <div className="card-header">
            <span className="card-title">Recent Orders</span>
            <Link to="/investor/orders" className="btn btn-ghost btn-sm">View All</Link>
          </div>
          {recentOrders.map((o) => (
            <div key={o.id} className="activity-item">
              <span className={`badge ${getStatusBadgeClass(o.orderType || o.order_type)}`}>{o.orderType || o.order_type}</span>
              <div className="activity-details">
                <span className="mono" style={{ fontWeight: 600 }}>{o.symbol}</span>
                <span className="text-muted" style={{ fontSize: '0.75rem' }}>{o.quantity} shares @ ₹{o.price}</span>
              </div>
              <span className={`badge ${getStatusBadgeClass(o.status)}`}>{o.status}</span>
            </div>
          ))}
        </div>

        <div className="card">
          <div className="card-header">
            <span className="card-title">Recent Transactions</span>
            <Link to="/investor/wallet" className="btn btn-ghost btn-sm">View All</Link>
          </div>
          {recentTransactions.map((t) => (
            <div key={t.id} className="activity-item">
              <span className={`badge ${t.amount >= 0 ? 'badge-green' : 'badge-red'}`}>
                {(t.transactionType || t.transaction_type || '').replace('TRADE_', '')}
              </span>
              <div className="activity-details">
                <span style={{ fontSize: '0.85rem' }}>{t.description}</span>
                <span className="text-muted" style={{ fontSize: '0.75rem' }}>{formatDateTime(t.createdAt)}</span>
              </div>
              <span className={`mono tabular-nums ${t.amount >= 0 ? 'text-green' : 'text-red'}`} style={{ fontWeight: 600 }}>
                {t.amount >= 0 ? '+' : ''}₹{Math.abs(t.amount).toLocaleString('en-IN')}
              </span>
            </div>
          ))}
        </div>

        {/* Top Movers */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">Top Movers</span>
            <Link to="/investor/market" className="btn btn-ghost btn-sm">Market</Link>
          </div>
          {topStocks.map((s) => (
            <div key={s.id} className="activity-item">
              <div className="stock-mini-logo">{s.symbol[0]}</div>
              <div className="activity-details">
                <Link to={`/investor/stock/${s.symbol}`} className="mono" style={{ fontWeight: 600, fontSize: '0.9rem' }}>{s.symbol}</Link>
                <span className="text-muted" style={{ fontSize: '0.75rem' }}>{s.name}</span>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div className="mono tabular-nums" style={{ fontSize: '0.9rem', fontWeight: 600 }}>₹{(s.currentPrice || s.current_price || 0).toFixed(2)}</div>
                <div className={`mono tabular-nums ${s.change >= 0 ? 'text-green' : 'text-red'}`} style={{ fontSize: '0.75rem' }}>
                  {s.change >= 0 ? '▲' : '▼'} {Math.abs(s.change || 0)}%
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default InvestorDashboard;
