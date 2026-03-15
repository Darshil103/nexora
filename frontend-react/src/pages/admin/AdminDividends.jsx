import { useState, useEffect } from 'react';
import { dividendsAPI } from '../../services/api';
import { formatINR, formatDate, getStatusBadgeClass } from '../../data/mockData';
import '../investor/InvestorPages.css';

const AdminDividends = () => {
  const [dividends, setDividends] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDividends = async () => {
      try {
        setLoading(true);
        const res = await dividendsAPI.getAll();
        if (res.data?.success) {
          setDividends(res.data.data);
        }
      } catch (err) {
        console.error("Failed to fetch dividends", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDividends();
  }, []);

  return (
    <div className="page-container animate-fade-in">
      <div className="page-header"><h1 className="page-title">Dividend Management</h1></div>
      <div className="table-container">
        <table className="table">
          <thead><tr><th>Startup</th><th>Per Share</th><th>Total</th><th>Announced</th><th>Payment</th><th>Status</th><th>Actions</th></tr></thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="7" style={{ textAlign: 'center', padding: '2rem' }}>Loading dividends...</td></tr>
            ) : dividends.length === 0 ? (
              <tr><td colSpan="7" style={{ textAlign: 'center', padding: '2rem' }}>No dividends recorded</td></tr>
            ) : dividends.map((d) => (
              <tr key={d.id}>
                <td style={{ fontWeight: 600 }}>{d.startup_name}</td>
                <td className="mono tabular-nums text-gold">₹{(d.dividend_per_share || 0).toFixed(2)}</td>
                <td className="mono tabular-nums">{formatINR(d.total_amount || 0)}</td>
                <td style={{ fontSize: '0.8rem' }}>{formatDate(d.announcement_date)}</td>
                <td style={{ fontSize: '0.8rem' }}>{formatDate(d.payment_date)}</td>
                <td><span className={`badge ${getStatusBadgeClass(d.status)}`}>{d.status}</span></td>
                <td>
                  <div style={{ display: 'flex', gap: '4px' }}>
                    {d.status === 'ANNOUNCED' && <button className="btn btn-primary btn-sm">Approve & Pay</button>}
                    {d.status === 'ANNOUNCED' && <button className="btn btn-danger btn-sm">Cancel</button>}
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

export default AdminDividends;
