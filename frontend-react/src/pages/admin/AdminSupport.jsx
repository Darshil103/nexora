import { useState, useEffect } from 'react';
import { usersAPI } from '../../services/api';
import { formatDateTime, getStatusBadgeClass } from '../../data/mockData';
import '../investor/InvestorPages.css';

const AdminSupport = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        setLoading(true);
        const res = await usersAPI.getAdminSupport();
        if (res.data?.success) {
          setTickets(res.data.data);
        }
      } catch (err) {
        console.error("Failed to fetch tickets", err);
      } finally {
        setLoading(false);
      }
    };
    fetchTickets();
  }, []);

  return (
    <div className="page-container animate-fade-in">
      <div className="page-header"><h1 className="page-title">Support Tickets</h1></div>
      <div className="table-container">
        <table className="table">
          <thead><tr><th>Subject</th><th>Category</th><th>Priority</th><th>Status</th><th>Created</th><th>Actions</th></tr></thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="6" style={{ textAlign: 'center', padding: '2rem' }}>Loading tickets...</td></tr>
            ) : tickets.length === 0 ? (
              <tr><td colSpan="6" style={{ textAlign: 'center', padding: '2rem' }}>No open tickets</td></tr>
            ) : tickets.map((t) => (
              <tr key={t.id}>
                <td style={{ fontWeight: 600 }}>{t.subject}</td>
                <td>{t.category}</td>
                <td><span className={`badge ${getStatusBadgeClass(t.priority)}`}>{t.priority}</span></td>
                <td><span className={`badge ${getStatusBadgeClass(t.status)}`}>{t.status}</span></td>
                <td style={{ fontSize: '0.8rem' }}>{formatDateTime(t.createdAt)}</td>
                <td><div style={{ display: 'flex', gap: '4px' }}><button className="btn btn-ghost btn-sm">Assign</button><button className="btn btn-primary btn-sm">Resolve</button></div></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminSupport;
