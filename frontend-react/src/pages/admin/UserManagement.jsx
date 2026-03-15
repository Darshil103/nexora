import { useState, useEffect } from 'react';
import { IoSearchOutline } from 'react-icons/io5';
import { usersAPI } from '../../services/api';
import { formatDate, getStatusBadgeClass } from '../../data/mockData';
import '../investor/InvestorPages.css';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [filterKyc, setFilterKyc] = useState('ALL');
  const [selectedUser, setSelectedUser] = useState(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await usersAPI.getAll();
      if (res.data?.success) {
        setUsers(res.data.data);
      }
    } catch (err) {
      console.error("Failed to fetch users", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleStatusToggle = async (user) => {
    try {
      const newStatus = user.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
      await usersAPI.updateStatus(user.id, newStatus);
      alert(`User ${newStatus.toLowerCase()} successfully!`);
      fetchUsers(); // Refresh
    } catch (err) {
      console.error("Failed to update status", err);
      alert("Failed to update user status");
    }
  };

  const handleKycUpdate = async (user, newStatus) => {
    try {
      await usersAPI.updateKyc(user.id, newStatus);
      alert(`KYC ${newStatus.toLowerCase()} successfully!`);
      fetchUsers();
      if (selectedUser?.id === user.id) setSelectedUser(null);
    } catch (err) {
      console.error("Failed to update KYC", err);
      const msg = err.response?.data?.message || "Failed to update KYC status";
      alert(msg);
    }
  };

  const filtered = users.filter((u) => {
    const fn = u.fullName || '';
    const em = u.email || '';
    const matchSearch = fn.toLowerCase().includes(search.toLowerCase()) || em.toLowerCase().includes(search.toLowerCase());
    const matchType = filterType === 'ALL' || u.userType === filterType;
    const matchStatus = filterStatus === 'ALL' || u.status === filterStatus;
    const matchKyc = filterKyc === 'ALL' || u.kycStatus === filterKyc;
    return matchSearch && matchType && matchStatus && matchKyc;
  });

  return (
    <div className="page-container animate-fade-in">
      <div className="page-header">
        <h1 className="page-title">User Management</h1>
        <div className="search-wrapper">
          <IoSearchOutline />
          <input className="search-input" placeholder="Search users..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
      </div>

      <div className="filter-chips" style={{ marginBottom: '16px' }}>
        <span className="text-muted" style={{ fontSize: '0.8rem' }}>Type:</span>
        {['ALL', 'ADMIN', 'INVESTOR', 'STARTUP_FOUNDER'].map((t) => (
          <button key={t} className={`chip ${filterType === t ? 'active' : ''}`} onClick={() => setFilterType(t)}>{t.replace('_', ' ')}</button>
        ))}
      </div>
      <div className="filter-chips">
        <span className="text-muted" style={{ fontSize: '0.8rem' }}>Status:</span>
        {['ALL', 'ACTIVE', 'INACTIVE', 'SUSPENDED'].map((s) => (
          <button key={s} className={`chip ${filterStatus === s ? 'active' : ''}`} onClick={() => setFilterStatus(s)}>{s}</button>
        ))}
        <span className="text-muted" style={{ fontSize: '0.8rem', marginLeft: '12px' }}>KYC:</span>
        {['ALL', 'PENDING', 'APPROVED', 'REJECTED'].map((k) => (
          <button key={k} className={`chip ${filterKyc === k ? 'active' : ''}`} onClick={() => setFilterKyc(k)}>{k}</button>
        ))}
      </div>

      <div className="table-container">
        <table className="table">
          <thead>
            <tr><th>ID</th><th>Name</th><th>Email</th><th>Type</th><th>Status</th><th>KYC</th><th>Joined</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="8" style={{ textAlign: 'center', padding: '2rem' }}>Loading users...</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan="8" style={{ textAlign: 'center', padding: '2rem' }}>No users found</td></tr>
            ) : filtered.map((u) => (
              <tr key={u.id}>
                <td className="mono">{u.id}</td>
                <td style={{ fontWeight: 600 }}>{u.fullName}</td>
                <td style={{ fontSize: '0.85rem' }}>{u.email}</td>
                <td><span className={`badge ${getStatusBadgeClass(u.userType)}`}>{u.userType?.replace('_', ' ')}</span></td>
                <td><span className={`badge ${getStatusBadgeClass(u.status)}`}>{u.status}</span></td>
                <td><span className={`badge ${getStatusBadgeClass(u.kycStatus)}`}>{u.kycStatus}</span></td>
                <td style={{ fontSize: '0.8rem' }}>{formatDate(u.createdAt)}</td>
                <td>
                  <div style={{ display: 'flex', gap: '4px' }}>
                    <button className="btn btn-ghost btn-sm" onClick={() => setSelectedUser(selectedUser?.id === u.id ? null : u)}>View</button>
                    {u.status === 'ACTIVE' ? (
                      <button className="btn btn-danger btn-sm" onClick={() => handleStatusToggle(u)}>Suspend</button>
                    ) : (
                      <button className="btn btn-primary btn-sm" onClick={() => handleStatusToggle(u)}>Activate</button>
                    )}
                    {u.kycStatus === 'PENDING' && (
                      <>
                        <button className="btn btn-primary btn-sm" onClick={() => handleKycUpdate(u, 'APPROVED')}>Approve KYC</button>
                        <button className="btn btn-danger btn-sm" onClick={() => handleKycUpdate(u, 'REJECTED')}>Reject</button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* KYC Review Modal */}
      {selectedUser && (
        <div className="modal-overlay" onClick={() => setSelectedUser(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-title">User Details: {selectedUser.fullName}</span>
              <button className="modal-close" onClick={() => setSelectedUser(null)}>×</button>
            </div>
            <div className="info-grid">
              <div className="info-item"><div className="info-label">Email</div><div className="info-value">{selectedUser.email}</div></div>
              <div className="info-item"><div className="info-label">Type</div><div className="info-value"><span className={`badge ${getStatusBadgeClass(selectedUser.userType)}`}>{selectedUser.userType}</span></div></div>
              <div className="info-item"><div className="info-label">Status</div><div className="info-value"><span className={`badge ${getStatusBadgeClass(selectedUser.status)}`}>{selectedUser.status}</span></div></div>
              <div className="info-item"><div className="info-label">KYC</div><div className="info-value"><span className={`badge ${getStatusBadgeClass(selectedUser.kycStatus)}`}>{selectedUser.kycStatus}</span></div></div>
              <div className="info-item"><div className="info-label">PAN</div><div className="info-value">{selectedUser.pan_number || 'N/A'}</div></div>
              <div className="info-item"><div className="info-label">Aadhaar</div><div className="info-value">{selectedUser.aadhaar_number || 'N/A'}</div></div>
            </div>
            <div style={{ marginTop: '16px', display: 'flex', gap: '8px' }}>
              {selectedUser.kycStatus === 'PENDING' && <button className="btn btn-primary" onClick={() => handleKycUpdate(selectedUser, 'APPROVED')}>Approve KYC</button>}
              {selectedUser.kycStatus === 'PENDING' && <button className="btn btn-danger" onClick={() => handleKycUpdate(selectedUser, 'REJECTED')}>Reject KYC</button>}
              <button className="btn btn-ghost" onClick={() => setSelectedUser(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
