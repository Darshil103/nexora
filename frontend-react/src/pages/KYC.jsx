import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { IoShieldCheckmarkOutline, IoCheckmarkCircleOutline, IoCloseCircleOutline, IoTimeOutline } from 'react-icons/io5';
import './Auth.css';

const KYC = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ pan_number: '', aadhaar_number: '', address_proof: null });
  const [status, setStatus] = useState('FORM'); // FORM, SUBMITTED, APPROVED, REJECTED
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.pan_number || !form.aadhaar_number) return;
    setLoading(true);
    setTimeout(() => {
      setStatus('SUBMITTED');
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="auth-page">
      <div className="auth-bg-grid"></div>
      <div className="auth-glow"></div>
      <div className="auth-container" style={{ justifyContent: 'center' }}>
        <div className="auth-card" style={{ maxWidth: '520px', width: '100%' }}>
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <IoShieldCheckmarkOutline style={{ fontSize: '3rem', color: 'var(--accent-primary)', marginBottom: '16px' }} />
            <h2 className="auth-title" style={{ textAlign: 'center' }}>KYC Verification</h2>
            <p className="auth-subtitle" style={{ textAlign: 'center' }}>Complete your identity verification to start trading on Nexora</p>
          </div>

          {/* Status Tracker */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '24px', marginBottom: '32px' }}>
            {['Submit', 'Review', 'Approved'].map((s, i) => (
              <div key={s} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{
                  width: '28px', height: '28px', borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '0.75rem', fontWeight: '700',
                  background: i === 0 || (i === 1 && status === 'SUBMITTED') ? 'var(--accent-primary)' : 'var(--bg-tertiary)',
                  color: i === 0 || (i === 1 && status === 'SUBMITTED') ? 'var(--text-inverse)' : 'var(--text-muted)',
                }}>{i + 1}</div>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{s}</span>
                {i < 2 && <div style={{ width: '40px', height: '2px', background: 'var(--border)' }}></div>}
              </div>
            ))}
          </div>

          {status === 'FORM' && (
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">PAN Card Number</label>
                <input type="text" className="form-input" placeholder="ABCDE1234F" maxLength={10}
                  value={form.pan_number} onChange={(e) => setForm({ ...form, pan_number: e.target.value.toUpperCase() })} />
              </div>
              <div className="form-group">
                <label className="form-label">Aadhaar Number</label>
                <input type="text" className="form-input" placeholder="1234 5678 9012" maxLength={14}
                  value={form.aadhaar_number} onChange={(e) => setForm({ ...form, aadhaar_number: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Address Proof (PDF/Image)</label>
                <input type="file" className="form-input" accept=".pdf,.jpg,.png"
                  onChange={(e) => setForm({ ...form, address_proof: e.target.files[0] })} />
              </div>
              <button type="submit" className="btn btn-primary btn-block btn-lg" disabled={loading}>
                {loading ? 'Submitting...' : 'Submit KYC Documents'}
              </button>
            </form>
          )}

          {status === 'SUBMITTED' && (
            <div style={{ textAlign: 'center', padding: '32px 0' }}>
              <IoTimeOutline style={{ fontSize: '4rem', color: 'var(--accent-amber)', marginBottom: '16px' }} />
              <h3 style={{ marginBottom: '12px' }}>KYC Under Review</h3>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>
                Your documents have been submitted. Our team will review them within 24-48 hours.
              </p>
              <Link to="/login" className="btn btn-primary">Go to Login</Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default KYC;
