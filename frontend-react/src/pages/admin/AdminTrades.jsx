import { useState, useEffect } from 'react';
import { usersAPI } from '../../services/api';
import { formatINR, formatDateTime, getStatusBadgeClass } from '../../data/mockData';
import '../investor/InvestorPages.css';

const AdminTrades = () => {
  const [trades, setTrades] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTrades = async () => {
      try {
        setLoading(true);
        const res = await usersAPI.getAdminTrades();
        if (res.data?.success) {
          setTrades(res.data.data);
        }
      } catch (err) {
        console.error("Failed to fetch trades", err);
      } finally {
        setLoading(false);
      }
    };
    fetchTrades();
  }, []);

  return (
    <div className="page-container animate-fade-in">
      <div className="page-header"><h1 className="page-title">Trade Monitoring</h1></div>
      <div className="table-container">
        <table className="table">
          <thead><tr><th>Buyer</th><th>Seller</th><th>Stock</th><th>Qty</th><th>Price</th><th>Total</th><th>Type</th><th>Status</th><th>Time</th></tr></thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="9" style={{ textAlign: 'center', padding: '2rem' }}>Loading trades...</td></tr>
            ) : trades.length === 0 ? (
              <tr><td colSpan="9" style={{ textAlign: 'center', padding: '2rem' }}>No trades recorded today</td></tr>
            ) : trades.map((t) => (
              <tr key={t.id}>
                <td>{t.buyer_name}</td>
                <td>{t.seller_name}</td>
                <td className="mono" style={{ fontWeight: 600 }}>{t.symbol}</td>
                <td className="mono tabular-nums">{t.quantity}</td>
                <td className="mono tabular-nums">₹{t.price.toFixed(2)}</td>
                <td className="mono tabular-nums">{formatINR(t.total_value)}</td>
                <td><span className={`badge ${getStatusBadgeClass(t.trade_type)}`}>{t.trade_type}</span></td>
                <td><span className={`badge ${getStatusBadgeClass(t.status)}`}>{t.status}</span></td>
                <td style={{ fontSize: '0.8rem' }}>{formatDateTime(t.createdAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminTrades;
