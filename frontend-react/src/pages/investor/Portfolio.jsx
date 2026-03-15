import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import useAuthStore from '../../store/authStore';
import { holdingsAPI, stocksAPI, stopLossAPI } from '../../services/api';
import { formatINR, getStatusBadgeClass } from '../../data/mockData';
import './InvestorPages.css';

const Portfolio = () => {
  const { user } = useAuthStore();
  const [tab, setTab] = useState('holdings');
  const [holdings, setHoldings] = useState([]);
  const [stocks, setStocks] = useState([]);
  const [stopLossOrders, setStopLossOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!user?.id) return;
      try {
        setLoading(true);
        const [hRes, sRes, slRes] = await Promise.all([
          holdingsAPI.getByUser(user.id),
          stocksAPI.getAll(),
          stopLossAPI.getByUser(user.id).catch(() => ({ data: { success: true, data: [] } }))
        ]);
        
        if (hRes.data?.success) setHoldings(hRes.data.data);
        if (sRes.data?.success) setStocks(sRes.data.data);
        if (slRes.data?.success) setStopLossOrders(slRes.data.data);
      } catch (err) {
        console.error("Failed to fetch portfolio data", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);

  const totalInvested = holdings.reduce((s, h) => s + (h.quantity * (h.averageCost || 0)), 0);
  const currentValue = holdings.reduce((s, h) => s + (h.quantity * (h.currentPrice || 0)), 0);
  const totalPnl = currentValue - totalInvested;

  // Pie chart data by industry
  const industryMap = {};
  holdings.forEach((h) => {
    const stock = stocks.find((s) => s.id === h.stock_id || s.symbol === h.symbol);
    const ind = stock?.industry || 'OTHER';
    const val = h.quantity * (h.currentPrice || 0);
    industryMap[ind] = (industryMap[ind] || 0) + val;
  });
  const pieData = Object.entries(industryMap).map(([name, value]) => ({ name, value: +value.toFixed(2) }));
  const COLORS = ['#00D4FF', '#FFB800', '#00E676', '#FF4444', '#B388FF', '#FF9100'];

  if (loading) return <div className="page-container empty-state"><p>Loading portfolio...</p></div>;

  return (
    <div className="page-container animate-fade-in">
      <div className="page-header">
        <h1 className="page-title">Portfolio</h1>
      </div>

      <div className="grid-3 mb-lg">
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
            {totalInvested > 0 && (
              <span style={{ fontSize: '0.9rem', marginLeft: '8px' }}>
                ({((totalPnl / totalInvested) * 100).toFixed(2)}%)
              </span>
            )}
          </div>
        </div>
      </div>

      {holdings.length > 0 && (
        <div className="portfolio-chart-section">
          <div className="card">
            <div className="card-header"><span className="card-title">Allocation by Industry</span></div>
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={4} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                  {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ background: '#141D35', border: '1px solid #1E2A45', borderRadius: '8px', fontSize: '0.8rem' }} formatter={(v) => formatINR(v)} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="card">
            <div className="card-header"><span className="card-title">Holdings Breakdown</span></div>
            <div style={{ padding: '12px 0' }}>
              {holdings.map((h) => {
                const val = h.quantity * (h.currentPrice || 0);
                const pct = currentValue > 0 ? ((val / currentValue) * 100).toFixed(1) : 0;
                return (
                  <div key={h.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                    <div className="stock-mini-logo">{h.symbol?.[0]}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                        <span className="mono" style={{ fontWeight: 600 }}>{h.symbol}</span>
                        <span className="mono tabular-nums" style={{ fontSize: '0.85rem' }}>{formatINR(val)} ({pct}%)</span>
                      </div>
                      <div style={{ height: '4px', background: 'var(--bg-primary)', borderRadius: '2px', overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${pct}%`, background: 'var(--accent-primary)', borderRadius: '2px' }}></div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      <div className="tabs">
        <button className={`tab ${tab === 'holdings' ? 'active' : ''}`} onClick={() => setTab('holdings')}>Holdings</button>
        <button className={`tab ${tab === 'stoploss' ? 'active' : ''}`} onClick={() => setTab('stoploss')}>Stop Loss Orders</button>
      </div>

      {tab === 'holdings' && (
        <div className="table-container">
          {holdings.length === 0 ? (
            <div className="empty-state"><p>No holdings yet. Start trading to build your portfolio!</p></div>
          ) : (
            <table className="table">
              <thead>
                <tr>
                  <th>Company</th>
                  <th>Symbol</th>
                  <th>Shares</th>
                  <th>Avg Cost</th>
                  <th>Current Price</th>
                  <th>Current Value</th>
                  <th>P&L (₹)</th>
                  <th>P&L (%)</th>
                </tr>
              </thead>
              <tbody>
                {holdings.map((h) => {
                  const cv = h.quantity * (h.currentPrice || 0);
                  const pnl = ((h.currentPrice || 0) - (h.averageCost || 0)) * h.quantity;
                  const pnlPct = h.averageCost > 0 ? (((h.currentPrice || 0) - h.averageCost) / h.averageCost) * 100 : 0;
                  return (
                    <tr key={h.id}>
                      <td><Link to={`/investor/stock/${h.symbol}`} style={{ fontWeight: 600 }}>{h.name}</Link></td>
                      <td className="mono">{h.symbol}</td>
                      <td className="mono tabular-nums">{h.quantity}</td>
                      <td className="mono tabular-nums">₹{(h.averageCost || 0).toFixed(2)}</td>
                      <td className="mono tabular-nums">₹{(h.currentPrice || 0).toFixed(2)}</td>
                      <td className="mono tabular-nums">{formatINR(cv)}</td>
                      <td className={`mono tabular-nums ${pnl >= 0 ? 'text-green' : 'text-red'}`}>{pnl >= 0 ? '+' : ''}₹{pnl.toFixed(2)}</td>
                      <td className={`mono tabular-nums ${pnlPct >= 0 ? 'text-green' : 'text-red'}`}>{pnlPct >= 0 ? '+' : ''}{pnlPct.toFixed(2)}%</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      )}

      {tab === 'stoploss' && (
        <div className="card">
          <div className="card-header">
            <span className="card-title">Active Stop Loss Orders</span>
            <button className="btn btn-primary btn-sm">+ New Stop Loss</button>
          </div>
          <div className="table-container">
            {stopLossOrders.length === 0 ? (
              <div className="empty-state"><p>No active stop loss orders.</p></div>
            ) : (
              <table className="table">
                <thead><tr><th>Stock</th><th>Trigger Price</th><th>Quantity</th><th>Status</th><th>Action</th></tr></thead>
                <tbody>
                  {stopLossOrders.map((sl) => (
                    <tr key={sl.id}>
                      <td className="mono" style={{ fontWeight: 600 }}>{sl.symbol}</td>
                      <td className="mono tabular-nums">₹{(sl.trigger_price || 0).toFixed(2)}</td>
                      <td className="mono tabular-nums">{sl.quantity}</td>
                      <td><span className={`badge ${getStatusBadgeClass(sl.status)}`}>{sl.status}</span></td>
                      <td>{sl.status === 'PENDING' && <button className="btn btn-danger btn-sm">Cancel</button>}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Portfolio;
