import { useState, useEffect } from 'react';
import { IoSearchOutline } from 'react-icons/io5';
import { usersAPI } from '../../services/api';
import { formatDateTime } from '../../data/mockData';
import '../investor/InvestorPages.css';

const AuditLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [expanded, setExpanded] = useState(null);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        setLoading(true);
        const res = await usersAPI.getAdminAuditLogs();
        if (res.data?.success) {
          setLogs(res.data.data);
        }
      } catch (err) {
        console.error("Failed to fetch audit logs", err);
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, []);

  const filtered = logs.filter((l) =>
    (l.action?.toLowerCase() || '').includes(search.toLowerCase()) ||
    (l.user?.fullName?.toLowerCase() || '').includes(search.toLowerCase()) ||
    (l.entity_type?.toLowerCase() || '').includes(search.toLowerCase())
  );

  const formatJson = (val) => {
    if (!val) return 'null';
    try {
      return JSON.stringify(JSON.parse(val), null, 2);
    } catch (e) {
      return val;
    }
  };

  return (
    <div className="page-container animate-fade-in">
      <div className="page-header">
        <h1 className="page-title">Audit Logs</h1>
        <div className="search-wrapper">
          <IoSearchOutline />
          <input className="search-input" placeholder="Search by action, user, entity..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
      </div>

      <div className="table-container">
        <table className="table">
          <thead><tr><th>User</th><th>Action</th><th>Entity</th><th>ID</th><th>IP Address</th><th>Time</th><th>Details</th></tr></thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="7" style={{ textAlign: 'center', padding: '2rem' }}>Loading audit logs...</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan="7" style={{ textAlign: 'center', padding: '2rem' }}>No activity logs found</td></tr>
            ) : filtered.map((log) => (
              <tr key={log.id} style={{ borderBottom: expanded === log.id ? 'none' : '' }}>
                <>
                  <td style={{ fontWeight: 600 }}>{log.user?.fullName || 'System'}</td>
                  <td><span className="badge badge-cyan">{(log.action || '').replace(/_/g, ' ')}</span></td>
                  <td>{log.entity_type}</td>
                  <td className="mono">#{log.entity_id}</td>
                  <td className="mono" style={{ fontSize: '0.8rem' }}>{log.ip_address}</td>
                  <td style={{ fontSize: '0.8rem' }}>{formatDateTime(log.createdAt)}</td>
                  <td><button className="btn btn-ghost btn-sm" onClick={() => setExpanded(expanded === log.id ? null : log.id)}>
                    {expanded === log.id ? 'Hide' : 'Show'}
                  </button></td>
                </>
              </tr>
            ))}
            {expanded && filtered.find(l => l.id === expanded) && (
              <tr>
                <td colSpan={7} style={{ background: 'var(--bg-tertiary)', padding: '16px' }}>
                  {(() => {
                    const log = filtered.find(l => l.id === expanded);
                    return (
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                        <div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>OLD VALUE</div>
                          <pre style={{ background: 'var(--bg-primary)', padding: '12px', borderRadius: '8px', fontSize: '0.8rem', color: 'var(--accent-red)', overflow: 'auto' }}>
                            {formatJson(log.old_value)}
                          </pre>
                        </div>
                        <div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>NEW VALUE</div>
                          <pre style={{ background: 'var(--bg-primary)', padding: '12px', borderRadius: '8px', fontSize: '0.8rem', color: 'var(--accent-green)', overflow: 'auto' }}>
                            {formatJson(log.new_value)}
                          </pre>
                        </div>
                      </div>
                    );
                  })()}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AuditLogs;
