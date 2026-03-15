import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import { authAPI } from '../services/api';
import './Auth.css';

const Login = () => {
  const navigate = useNavigate();
  const { login, getDashboardPath } = useAuthStore();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.email || !form.password) {
      setError('Please fill in all fields');
      return;
    }
    
    try {
      setLoading(true);
      const res = await authAPI.login({ email: form.email, password: form.password });
      
      if (res.data.success) {
        login(res.data.data.user, res.data.data.token);
        // The authStore gets updated asynchronously, so use the user object directly for routing
        const role = res.data.data.user.userType;
        if (role === 'ADMIN') navigate('/admin/dashboard');
        else if (role === 'STARTUP_FOUNDER') navigate('/founder/dashboard');
        else navigate('/investor/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

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
          <h1 className="auth-welcome">Welcome<br />Back</h1>
          <p className="auth-tagline">Access your trading dashboard and continue building your startup portfolio.</p>
          <div className="auth-demo-info">
            <p><strong>Secure Login</strong></p>
            <p>Enter your registered credentials to access your dashboard.</p>
          </div>
        </div>
        <div className="auth-right">
          <div className="auth-card">
            <h2 className="auth-title">Sign In</h2>
            <p className="auth-subtitle">Enter your credentials to access your account</p>

            {error && <div className="auth-error">{error}</div>}

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input
                  type="email"
                  className="form-input"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Password</label>
                <input
                  type="password"
                  className="form-input"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                />
              </div>
              <button type="submit" className="btn btn-primary btn-block btn-lg" disabled={loading}>
                {loading ? 'Signing in...' : 'Sign In'}
              </button>
            </form>

            <p className="auth-footer-text">
              Don't have an account? <Link to="/register">Create one</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
