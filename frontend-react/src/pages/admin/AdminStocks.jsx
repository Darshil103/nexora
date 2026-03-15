import { useState, useEffect } from 'react';
import { stocksAPI } from '../../services/api';
import { getStatusBadgeClass } from '../../data/mockData';
import '../investor/InvestorPages.css';

const AdminStocks = () => {
  const [stocks, setStocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);

  const fetchStocks = async () => {
    try {
      setLoading(true);
      const res = await stocksAPI.getAll();
      if (res.data?.success) {
        setStocks(res.data.data);
      }
    } catch (err) {
      console.error("Failed to fetch stocks", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchStocks(); }, []);

  const handleHalt = async (id, symbol) => {
    if (!confirm(`Are you sure you want to HALT trading for ${symbol}? All pending orders will be blocked.`)) return;
    try {
      setActionLoading(id);
      await stocksAPI.updateStatus(id, 'HALTED');
      alert(`${symbol} has been halted successfully.`);
      fetchStocks();
    } catch (err) {
      alert('Failed to halt stock: ' + (err.response?.data?.message || err.message));
    } finally {
      setActionLoading(null);
    }
  };

  const handleActivate = async (id, symbol) => {
    if (!confirm(`Re-activate trading for ${symbol}?`)) return;
    try {
      setActionLoading(id);
      await stocksAPI.updateStatus(id, 'ACTIVE');
      alert(`${symbol} has been activated successfully.`);
      fetchStocks();
    } catch (err) {
      alert('Failed to activate stock: ' + (err.response?.data?.message || err.message));
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="page-container animate-fade-in">
      <div className="page-header"><h1 className="page-title">Stock Management</h1></div>
      <div className="table-container">
        <table className="table">
          <thead><tr><th>Symbol</th><th>Startup</th><th>Price</th><th>Day Change</th><th>Total Shares</th><th>Circulating</th><th>Volume</th><th>Status</th><th>Actions</th></tr></thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="9" style={{ textAlign: 'center', padding: '2rem' }}>Loading stocks...</td></tr>
            ) : stocks.length === 0 ? (
              <tr><td colSpan="9" style={{ textAlign: 'center', padding: '2rem' }}>No stocks listed</td></tr>
            ) : stocks.map((s) => (
              <tr key={s.id}>
                <td className="mono" style={{ fontWeight: 600 }}>{s.symbol}</td>
                <td>{s.startupName || s.name}</td>
                <td className="mono tabular-nums">₹{(s.currentPrice || 0).toFixed(2)}</td>
                <td className={`mono tabular-nums ${(s.change || 0) >= 0 ? 'text-green' : 'text-red'}`}>
                  {(s.change || 0) >= 0 ? '▲' : '▼'} {Math.abs(s.change || 0).toFixed(2)}%
                </td>
                <td className="mono tabular-nums">{((s.totalShares || 0) / 1000).toFixed(0)}K</td>
                <td className="mono tabular-nums">{((s.circulatingShares || 0) / 1000).toFixed(0)}K</td>
                <td className="mono tabular-nums">{((s.dayVolume || 0) / 1000).toFixed(0)}K</td>
                <td><span className={`badge ${getStatusBadgeClass(s.status)}`}>{s.status}</span></td>
                <td>
                  <div style={{ display: 'flex', gap: '4px' }}>
                    {s.status === 'ACTIVE' ? (
                      <button 
                        className="btn btn-danger btn-sm" 
                        disabled={actionLoading === s.id}
                        onClick={() => handleHalt(s.id, s.symbol)}
                      >
                        {actionLoading === s.id ? '...' : '🛑 Halt'}
                      </button>
                    ) : (
                      <button 
                        className="btn btn-primary btn-sm" 
                        disabled={actionLoading === s.id}
                        onClick={() => handleActivate(s.id, s.symbol)}
                      >
                        {actionLoading === s.id ? '...' : '✅ Activate'}
                      </button>
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

export default AdminStocks;
