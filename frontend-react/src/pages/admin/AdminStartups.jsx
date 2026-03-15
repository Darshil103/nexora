import { useState, useEffect } from 'react';
import { startupsAPI } from '../../services/api';
import { formatINR, getStatusBadgeClass } from '../../data/mockData';
import '../investor/InvestorPages.css';

const AdminStartups = () => {
  const [startups, setStartups] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchStartups = async () => {
    try {
      setLoading(true);
      const res = await startupsAPI.getAll();
      if (res.data?.success) {
        setStartups(res.data.data);
      }
    } catch (err) {
      console.error("Failed to fetch startups", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStartups();
  }, []);

  const handleStatusUpdate = async (startupId, newStatus) => {
    try {
      await startupsAPI.adminUpdateStatus(startupId, newStatus);
      fetchStartups(); // Refresh the list
    } catch (err) {
      console.error("Failed to update startup status", err);
    }
  };

  return (
    <div className="page-container animate-fade-in">
      <div className="page-header"><h1 className="page-title">Startup Management</h1></div>
      <div className="table-container">
        <table className="table">
          <thead><tr><th>Name</th><th>Symbol</th><th>Industry</th><th>Stage</th><th>Valuation</th><th>Revenue</th><th>Status</th><th>Actions</th></tr></thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="8" style={{ textAlign: 'center', padding: '2rem' }}>Loading startups...</td></tr>
            ) : startups.length === 0 ? (
              <tr><td colSpan="8" style={{ textAlign: 'center', padding: '2rem' }}>No startups found</td></tr>
            ) : startups.map((s) => (
              <tr key={s.id}>
                <td style={{ fontWeight: 600 }}>{s.name}</td>
                <td className="mono">{s.stock_symbol}</td>
                <td><span className="badge badge-purple">{s.industry}</span></td>
                <td><span className="badge badge-cyan">{s.stage?.replace('_', ' ')}</span></td>
                <td className="mono tabular-nums">{formatINR(s.valuation)}</td>
                <td className="mono tabular-nums">{formatINR(s.revenue)}</td>
                <td><span className={`badge ${getStatusBadgeClass(s.status)}`}>{s.status}</span></td>
                <td>
                  <div style={{ display: 'flex', gap: '4px' }}>
                    <button className="btn btn-ghost btn-sm">View</button>
                    {s.status === 'PENDING' ? (
                      <button className="btn btn-primary btn-sm" onClick={() => handleStatusUpdate(s.id, 'ACTIVE')}>Approve</button>
                    ) : (
                      <button className="btn btn-danger btn-sm" onClick={() => handleStatusUpdate(s.id, 'DELISTED')}>Delist</button>
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

export default AdminStartups;
