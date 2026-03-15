import { useState, useEffect } from 'react';
import useAuthStore from '../../store/authStore';
import { usersAPI } from '../../services/api';
import './InvestorPages.css';

const Profile = () => {
  const { user: authUser, setUser: setAuthUser } = useAuthStore();
  const [user, setUser] = useState(authUser);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    full_name: user?.fullName || '',
    phone: user?.phone || '',
  });
  const [passwordForm, setPasswordForm] = useState({ current: '', newPass: '', confirm: '' });
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await usersAPI.getById('me');
      if (res.data.success) {
        setUser(res.data.data);
        setAuthUser(res.data.data);
        setForm({ full_name: res.data.data.fullName, phone: res.data.data.phone });
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      const res = await usersAPI.update('me', form);
      if (res.data.success) {
        setUser(res.data.data);
        setAuthUser(res.data.data);
        setEditing(false);
      }
    } catch (e) {
      alert("Error updating profile");
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (passwordForm.newPass !== passwordForm.confirm) return alert("Passwords do not match");
    try {
      setLoading(true);
      const res = await usersAPI.changePassword({ oldPassword: passwordForm.current, newPassword: passwordForm.newPass });
      if (res.data.success) {
        alert("Password changed successfully");
        setShowPassword(false);
        setPasswordForm({ current: '', newPass: '', confirm: '' });
      }
    } catch (e) {
      alert(e.response?.data?.message || "Error changing password");
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadgeClass = (status) => {
    if (status === 'INVESTOR') return 'badge-cyan';
    if (status === 'STARTUP_FOUNDER') return 'badge-gold';
    if (status === 'ADMIN') return 'badge-purple';
    return 'badge-gray';
  };

  return (
    <div className="page-container animate-fade-in">
      <div className="page-header"><h1 className="page-title">Profile</h1></div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        {/* Personal Info */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">Personal Information</span>
            <button className="btn btn-ghost btn-sm" onClick={() => setEditing(!editing)}>
              {editing ? 'Cancel' : 'Edit'}
            </button>
          </div>

          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input type="text" className="form-input" value={form.fullName} onChange={(e) => setForm({ ...form, full_name: e.target.value })} disabled={!editing} />
          </div>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input type="email" className="form-input" value={user?.email || ''} disabled style={{ opacity: 0.6 }} />
          </div>
          <div className="form-group">
            <label className="form-label">Username</label>
            <input type="text" className="form-input" value={user?.username || ''} disabled style={{ opacity: 0.6 }} />
          </div>
          <div className="form-group">
            <label className="form-label">Phone</label>
            <input type="tel" className="form-input" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} disabled={!editing} />
          </div>
          <div className="form-group">
            <label className="form-label">Account Type</label>
            <span className={`badge ${getStatusBadgeClass(user?.userType || user?.user_type)}`}>{(user?.userType || user?.user_type)?.replace('_', ' ')}</span>
          </div>

          {editing && <button className="btn btn-primary btn-block" disabled={loading} onClick={handleSave}>
             {loading ? 'Saving...' : 'Save Changes'}
          </button>}
        </div>

        <div>
          {/* KYC Status */}
          <div className="card" style={{ marginBottom: '24px' }}>
            <div className="card-header"><span className="card-title">KYC Status</span></div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <span style={{ fontSize: '2rem' }}>{user?.kycStatus === 'APPROVED' ? '✅' : user?.kycStatus === 'REJECTED' ? '❌' : '⏳'}</span>
              <div>
                <div style={{ fontWeight: 600, fontSize: '1.1rem' }}>{user?.kycStatus}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  {user?.kycStatus === 'APPROVED' ? 'Your identity has been verified' : 'Verification pending'}
                </div>
              </div>
            </div>
            <div className="info-grid">
              <div className="info-item"><div className="info-label">PAN</div><div className="info-value">{user?.pan_number || '****'}</div></div>
              <div className="info-item"><div className="info-label">Aadhaar</div><div className="info-value">****{user?.aadhaar_number?.slice(-4) || '****'}</div></div>
            </div>
          </div>

          {/* Change Password */}
          <div className="card">
            <div className="card-header">
              <span className="card-title">Change Password</span>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? 'Cancel' : 'Change'}
              </button>
            </div>
            {showPassword && (
              <>
                <div className="form-group">
                  <label className="form-label">Current Password</label>
                  <input type="password" className="form-input" value={passwordForm.current} onChange={(e) => setPasswordForm({ ...passwordForm, current: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">New Password</label>
                  <input type="password" className="form-input" value={passwordForm.newPass} onChange={(e) => setPasswordForm({ ...passwordForm, newPass: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Confirm New Password</label>
                  <input type="password" className="form-input" value={passwordForm.confirm} onChange={(e) => setPasswordForm({ ...passwordForm, confirm: e.target.value })} />
                </div>
                <button className="btn btn-primary btn-block" disabled={loading} onClick={handleChangePassword}>
                  {loading ? 'Updating...' : 'Update Password'}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
