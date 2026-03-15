import { useState, useEffect } from 'react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { usersAPI, stocksAPI } from '../../services/api';
import { mockAuditLogs, mockStocks, formatINR, formatDateTime } from '../../data/mockData';
import '../investor/InvestorPages.css';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [stocks, setStocks] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isInitial = true;
    const fetchData = async () => {
      try {
        if (isInitial) setLoading(true);
        const [statsRes, stocksRes, logsRes] = await Promise.all([
          usersAPI.getAdminStats(),
          stocksAPI.getAll(),
          usersAPI.getAdminAuditLogs().catch(() => ({ data: { success: true, data: [] } }))
        ]);

        if (statsRes.data?.success) setStats(statsRes.data.data);
        if (stocksRes.data?.success) setStocks(stocksRes.data.data);
        if (logsRes.data?.success) setAuditLogs(logsRes.data.data);
      } catch (err) {
        console.error("Failed to fetch dashboard data", err);
      } finally {
        if (isInitial) {
          setLoading(false);
          isInitial = false;
        }
      }
    };
    
    fetchData(); // Initial fetch
    const interval = setInterval(fetchData, 10000); // Poll every 10 seconds
    
    return () => clearInterval(interval); // Cleanup on unmount
  }, []);

  const dailyVolume = stats?.dailyVolume || [];
  const userGrowth = stats?.userGrowth || [];

  if (loading || !stats) {
    return (
      <div className="page-container empty-state">
        <div className="loading-spinner"></div>
        <p style={{ marginTop: '16px', color: 'var(--text-muted)' }}>Loading platform statistics...</p>
      </div>
    );
  }

  return (
    <div className="page-container animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Admin Dashboard</h1>
          <p className="text-muted">Platform overview and key metrics</p>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid-4 mb-lg">
        <div className="card card-stat">
          <div className="stat-label">Total Users</div>
          <div className="stat-value mono text-cyan">{(stats.totalUsers || 0).toLocaleString()}</div>
        </div>
        <div className="card card-stat">
          <div className="stat-label">Total Investors</div>
          <div className="stat-value mono">{(stats.totalInvestors || 0).toLocaleString()}</div>
        </div>
        <div className="card card-stat">
          <div className="stat-label">Listed Startups</div>
          <div className="stat-value mono text-gold">{stats.totalStartups || 0}</div>
        </div>
        <div className="card card-stat">
          <div className="stat-label">Trades Today</div>
          <div className="stat-value mono text-green">{(stats.totalTradesToday || 0).toLocaleString()}</div>
        </div>
      </div>

      <div className="grid-4 mb-lg">
        <div className="card card-stat">
          <div className="stat-label">Trade Volume (Today)</div>
          <div className="stat-value mono">{formatINR(stats.totalVolumeToday || 0)}</div>
        </div>
        <div className="card card-stat">
          <div className="stat-label">Pending KYC</div>
          <div className="stat-value mono text-amber">{stats.pendingKyc || 0}</div>
        </div>
        <div className="card card-stat">
          <div className="stat-label">Active IPOs</div>
          <div className="stat-value mono text-gold">{stats.activeIpos || 0}</div>
        </div>
        <div className="card card-stat">
          <div className="stat-label">Founders</div>
          <div className="stat-value mono">{(stats.totalFounders || 0).toLocaleString()}</div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid-2 mb-lg">
        <div className="card">
          <div className="card-header"><span className="card-title">Daily Trade Volume</span></div>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={dailyVolume}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1E2A45" />
              <XAxis dataKey="date" stroke="#5A6A8A" fontSize={11} />
              <Bar dataKey="volume" fill="#00D4FF" radius={[4, 4, 0, 0]} />
              <YAxis stroke="#5A6A8A" fontSize={11} tickFormatter={(v) => `${(v / 1000000).toFixed(0)}M`} />
              <Tooltip contentStyle={{ background: '#141D35', border: '1px solid #1E2A45', borderRadius: '8px' }} formatter={(v) => formatINR(v)} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="card">
          <div className="card-header"><span className="card-title">User Growth</span></div>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={userGrowth}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1E2A45" />
              <XAxis dataKey="month" stroke="#5A6A8A" fontSize={11} />
              <YAxis stroke="#5A6A8A" fontSize={11} />
              <Tooltip contentStyle={{ background: '#141D35', border: '1px solid #1E2A45', borderRadius: '8px' }} />
              <Line type="monotone" dataKey="users" stroke="#00E676" strokeWidth={2} dot={{ fill: '#00E676' }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top Stocks + Activity */}
      <div className="grid-2">
        <div className="card">
          <div className="card-header"><span className="card-title">Top Traded Stocks</span></div>
          {stocks.sort((a, b) => (b.dayVolume || 0) - (a.dayVolume || 0)).slice(0, 5).map((s) => (
            <div key={s.id} className="activity-item">
              <div className="stock-mini-logo">{s.symbol?.[0]}</div>
              <div className="activity-details">
                <span className="mono" style={{ fontWeight: 600 }}>{s.symbol}</span>
                <span className="text-muted" style={{ fontSize: '0.75rem' }}>{s.name}</span>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div className="mono tabular-nums" style={{ fontWeight: 600 }}>₹{(s.currentPrice || 0).toFixed(2)}</div>
                <div className="text-muted" style={{ fontSize: '0.75rem' }}>Vol: {((s.dayVolume || 0) / 1000).toFixed(0)}K</div>
              </div>
            </div>
          ))}
        </div>
        <div className="card">
          <div className="card-header"><span className="card-title">Recent Activity</span></div>
          {auditLogs.slice(0, 6).map((log) => (
            <div key={log.id} className="activity-item">
              <div style={{ width: '36px', height: '36px', background: 'var(--bg-tertiary)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent-primary)' }}>
                {(log.action || 'LO').slice(0, 2)}
              </div>
              <div className="activity-details">
                <span style={{ fontWeight: 600, fontSize: '0.85rem' }}>{(log.action || 'Action').replace(/_/g, ' ')}</span>
                <span className="text-muted" style={{ fontSize: '0.75rem' }}>by {log.userFullName || log.user?.fullName || 'System'} · {log.entityType} #{log.entityId}</span>
              </div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{formatDateTime(log.createdAt)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
