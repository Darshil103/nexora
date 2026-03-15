import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import { authAPI } from '../services/api';
import './Auth.css';

const Register = () => {
  const navigate = useNavigate();
  const { login, getDashboardPath } = useAuthStore();
  const [form, setForm] = useState({
    fullName: '', username: '', email: '', phone: '',
    password: '', confirm_password: '', userType: 'INVESTOR',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.fullName || !form.username || !form.email || !form.phone || !form.password) {
      setError('Please fill in all fields');
      return;
    }
    if (form.password !== form.confirm_password) {
      setError('Passwords do not match');
      return;
    }
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    
    try {
      setLoading(true);
      // Backend Jackson is configured for SNAKE_CASE globally, so we send snake_case
      const payload = {
        full_name: form.fullName,
        username: form.username,
        email: form.email,
        phone: form.phone,
        password: form.password,
        user_type: form.userType
      };
      
      const res = await authAPI.register(payload);
      if (res.data.success) {
        login(res.data.data.user, res.data.data.token);
        navigate(getDashboardPath());
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const updateField = (field, value) => setForm({ ...form, [field]: value });

  return (
    <div className="auth-page">
      <div className="auth-bg-grid"></div>
      <div className="auth-glow"></div>
      <div className="auth-container">
        <div className="auth-left">
          <Link to="/" className="auth-logo">
            <span className="logo-icon">◇</span>
            <span className="logo-text">NEXORA</span>
          </Link>
          <h1 className="auth-welcome">Join<br />Nexora</h1>
          <p className="auth-tagline">Create your account and start investing in India's most promising startups.</p>
        </div>
        <div className="auth-right">
          <div className="auth-card">
            <h2 className="auth-title">Create Account</h2>
            <p className="auth-subtitle">Fill in your details to get started</p>

            {error && <div className="auth-error">{error}</div>}

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">I want to</label>
                <div className="user-type-selector">
                  <div
                    className={`user-type-option ${form.userType === 'INVESTOR' ? 'selected' : ''}`}
                    onClick={() => updateField('userType', 'INVESTOR')}
                  >
                    📈 Invest
                    <div className="user-type-label">Buy & sell startup shares</div>
                  </div>
                  <div
                    className={`user-type-option ${form.userType === 'STARTUP_FOUNDER' ? 'selected' : ''}`}
                    onClick={() => updateField('userType', 'STARTUP_FOUNDER')}
                  >
                    🚀 List Startup
                    <div className="user-type-label">List and manage equity</div>
                  </div>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input type="text" className="form-input" placeholder="Rahul Sharma" value={form.fullName} onChange={(e) => updateField('fullName', e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Username</label>
                  <input type="text" className="form-input" placeholder="rahulsharma" value={form.username} onChange={(e) => updateField('username', e.target.value)} />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Email</label>
                  <input type="email" className="form-input" placeholder="you@example.com" value={form.email} onChange={(e) => updateField('email', e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Mobile Number</label>
                  <input type="tel" className="form-input" placeholder="+91 98765 43210" value={form.phone} onChange={(e) => updateField('phone', e.target.value)} />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Password</label>
                  <input type="password" className="form-input" placeholder="••••••••" value={form.password} onChange={(e) => updateField('password', e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Confirm Password</label>
                  <input type="password" className="form-input" placeholder="••••••••" value={form.confirm_password} onChange={(e) => updateField('confirm_password', e.target.value)} />
                </div>
              </div>

              <button type="submit" className="btn btn-primary btn-block btn-lg" disabled={loading}>
                {loading ? 'Creating Account...' : 'Create Account'}
              </button>
            </form>

            <p className="auth-footer-text">
              Already have an account? <Link to="/login">Sign in</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
