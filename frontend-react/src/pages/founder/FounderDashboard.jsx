import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { IoArrowForwardOutline } from 'react-icons/io5';
import useAuthStore from '../../store/authStore';
import { startupsAPI, dividendsAPI } from '../../services/api';
import { formatINR, formatDate, getStatusBadgeClass } from '../../data/mockData';
import '../investor/InvestorPages.css';

const FounderDashboard = () => {
  const { user } = useAuthStore();
  const [myStartups, setMyStartups] = useState([]);
  const [recentDividends, setRecentDividends] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.id) fetchDashboardData();
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const sRes = await startupsAPI.getByFounder(user.id);
      if (sRes.data.success) {
        setMyStartups(sRes.data.data);
        if (sRes.data.data.length > 0) {
           const dRes = await dividendsAPI.getByStartup(sRes.data.data[0].id);
           if (dRes.data.success) setRecentDividends(dRes.data.data.slice(0, 3));
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Founder Dashboard</h1>
          <p className="text-muted">Manage your startups and track their performance 🚀</p>
        </div>
      </div>

      {/* My Startups */}
      <div style={{ marginBottom: '32px' }}>
        <h3 style={{ marginBottom: '16px' }}>My Startups</h3>
        <div className="grid-2">
          {myStartups.map((s) => (
            <div key={s.id} className="card" style={{ padding: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
                <div className="stock-mini-logo" style={{ width: '52px', height: '52px', borderRadius: '14px', fontSize: '1.2rem' }}>{s.symbol[0]}</div>
                <div style={{ flex: 1 }}>
                  <h3 style={{ marginBottom: '4px' }}>{s.name}</h3>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <span className="mono text-muted" style={{ fontSize: '0.8rem' }}>{s.symbol}</span>
                    <span className={`badge ${getStatusBadgeClass(s.status)}`}>{s.status}</span>
                    <span className="badge badge-cyan">{s.stage.replace('_', ' ')}</span>
                  </div>
                </div>
              </div>

              <div className="info-grid" style={{ marginBottom: '16px' }}>
                <div className="info-item"><div className="info-label">Valuation</div><div className="info-value">{formatINR(s.valuation)}</div></div>
                <div className="info-item"><div className="info-label">Revenue</div><div className="info-value">{formatINR(s.revenue)}</div></div>
                <div className="info-item"><div className="info-label">Stock Price</div><div className="info-value">₹{s.stockPrice?.toFixed(2) || '0.00'}</div></div>
                <div className="info-item">
                  <div className="info-label">Employees</div>
                  <div className="info-value">{s.employeeCount || 0}</div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                <Link to={`/founder/startup/${s.id}`} className="btn btn-primary btn-sm" style={{ flex: 1 }}>Manage <IoArrowForwardOutline /></Link>
                <Link to={`/investor/stock/${s.symbol}`} className="btn btn-ghost btn-sm">View Stock</Link>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Dividends */}
      <div className="card">
        <div className="card-header">
          <span className="card-title">Recent Dividends</span>
        </div>
        <div className="table-container">
          <table className="table">
            <thead><tr><th>Startup</th><th>Per Share</th><th>Total</th><th>Payment Date</th><th>Status</th></tr></thead>
            <tbody>
              {recentDividends.map((d) => (
                <tr key={d.id}>
                  <td style={{ fontWeight: 600 }}>{d.startupName}</td>
                  <td className="mono tabular-nums text-gold">₹{d.dividendPerShare?.toFixed(2)}</td>
                  <td className="mono tabular-nums">{formatINR(d.totalAmount)}</td>
                  <td style={{ fontSize: '0.8rem' }}>{formatDate(d.paymentDate)}</td>
                  <td><span className={`badge ${getStatusBadgeClass(d.status)}`}>{d.status}</span></td>
                </tr>
              ))}
              {recentDividends.length === 0 && <tr><td colSpan="5" className="text-center text-muted">No dividends found</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default FounderDashboard;
