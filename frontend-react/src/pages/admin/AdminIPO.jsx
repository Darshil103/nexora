import { useState, useEffect } from 'react';
import { ipoAPI } from '../../services/api';
import { formatDate, getStatusBadgeClass } from '../../data/mockData';
import '../investor/InvestorPages.css';

const AdminIPO = () => {
  const [ipos, setIpos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);

  const fetchIpos = async () => {
    try {
      setLoading(true);
      const res = await ipoAPI.getAll();
      if (res.data?.success) {
        setIpos(res.data.data);
      }
    } catch (err) {
      console.error("Failed to fetch IPOs", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchIpos(); }, []);

  const handleStatusChange = async (id, newStatus, name) => {
    if (!confirm(`Change ${name} IPO status to ${newStatus}?`)) return;
    try {
      setActionLoading(id);
      await ipoAPI.update(id, { status: newStatus });
      alert(`IPO status updated to ${newStatus}`);
      fetchIpos();
    } catch (err) {
      alert('Failed to update IPO status: ' + (err.response?.data?.message || err.message));
    } finally {
      setActionLoading(null);
    }
  };

  const getNextStatuses = (current) => {
    switch (current) {
      case 'UPCOMING': return ['OPEN'];
      case 'OPEN': return ['CLOSED', 'LISTED'];
      case 'CLOSED': return ['LISTED'];
      default: return [];
    }
  };

  return (
    <div className="page-container animate-fade-in">
      <div className="page-header"><h1 className="page-title">IPO Management</h1></div>
      <div className="table-container">
        <table className="table">
          <thead><tr><th>Startup</th><th>Symbol</th><th>Price Band</th><th>Shares</th><th>Opens</th><th>Closes</th><th>Status</th><th>Actions</th></tr></thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="8" style={{ textAlign: 'center', padding: '2rem' }}>Loading IPOs...</td></tr>
            ) : ipos.length === 0 ? (
              <tr><td colSpan="8" style={{ textAlign: 'center', padding: '2rem' }}>No IPOs currently active or upcoming</td></tr>
            ) : ipos.map((ipo) => (
              <tr key={ipo.id}>
                <td style={{ fontWeight: 600 }}>{ipo.startupName}</td>
                <td className="mono">{ipo.symbol}</td>
                <td className="mono tabular-nums">₹{ipo.minPrice} - ₹{ipo.maxPrice}</td>
                <td className="mono tabular-nums">{((ipo.sharesOffered || 0) / 1000).toFixed(0)}K</td>
                <td style={{ fontSize: '0.8rem' }}>{formatDate(ipo.openDate)}</td>
                <td style={{ fontSize: '0.8rem' }}>{formatDate(ipo.closeDate)}</td>
                <td><span className={`badge ${getStatusBadgeClass(ipo.status)}`}>{ipo.status}</span></td>
                <td>
                  <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                    {getNextStatuses(ipo.status).map(status => (
                      <button 
                        key={status}
                        className={`btn btn-sm ${status === 'LISTED' ? 'btn-primary' : status === 'CLOSED' ? 'btn-danger' : 'btn-ghost'}`}
                        disabled={actionLoading === ipo.id}
                        onClick={() => handleStatusChange(ipo.id, status, ipo.startupName)}
                      >
                        {actionLoading === ipo.id ? '...' : status === 'OPEN' ? '🟢 Open' : status === 'LISTED' ? '📈 List' : '🔴 Close'}
                      </button>
                    ))}
                    {getNextStatuses(ipo.status).length === 0 && (
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>No actions</span>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminIPO;
