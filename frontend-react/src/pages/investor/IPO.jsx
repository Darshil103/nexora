import { useState, useEffect } from 'react';
import { mockIPOs, formatINR, formatDate, getStatusBadgeClass } from '../../data/mockData';
import './InvestorPages.css';

const IPO = () => {
  const [tab, setTab] = useState('all');
  const [applyingId, setApplyingId] = useState(null);
  const [shares, setShares] = useState('');

  const filtered = tab === 'all' ? mockIPOs
    : tab === 'applications' ? []
    : mockIPOs.filter((i) => i.status === tab.toUpperCase());

  const CountdownTimer = ({ targetDate }) => {
    const [timeLeft, setTimeLeft] = useState('');
    useEffect(() => {
      const timer = setInterval(() => {
        const diff = new Date(targetDate) - new Date();
        if (diff <= 0) { setTimeLeft('Opening Now!'); return; }
        const d = Math.floor(diff / 86400000);
        const h = Math.floor((diff % 86400000) / 3600000);
        const m = Math.floor((diff % 3600000) / 60000);
        const s = Math.floor((diff % 60000) / 1000);
        setTimeLeft(`${d}d ${h}h ${m}m ${s}s`);
      }, 1000);
      return () => clearInterval(timer);
    }, [targetDate]);
    return <div className="ipo-countdown">{timeLeft}</div>;
  };

  return (
    <div className="page-container animate-fade-in">
      <div className="page-header"><h1 className="page-title">IPO Listings</h1></div>

      <div className="tabs">
        {['all', 'UPCOMING', 'OPEN', 'CLOSED', 'LISTED', 'applications'].map((t) => (
          <button key={t} className={`tab ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)} style={{ textTransform: 'capitalize' }}>
            {t === 'applications' ? 'My Applications' : t}
          </button>
        ))}
      </div>

      {tab === 'applications' ? (
        <div className="empty-state"><p>No IPO applications yet</p></div>
      ) : (
        <div className="ipo-cards">
          {filtered.map((ipo) => (
            <div key={ipo.id} className="ipo-apply-card">
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                <div style={{ width: '48px', height: '48px', background: 'linear-gradient(135deg, var(--accent-gold), #CC9200)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '1.1rem', color: 'white' }}>
                  {ipo.symbol[0]}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: '1.05rem' }}>{ipo.startup_name}</div>
                  <div className="mono text-muted" style={{ fontSize: '0.8rem' }}>{ipo.symbol}</div>
                </div>
                <span className={`badge ${getStatusBadgeClass(ipo.status)}`}>{ipo.status}</span>
              </div>

              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '16px', lineHeight: 1.5 }}>{ipo.description}</p>

              {ipo.status === 'UPCOMING' && <CountdownTimer targetDate={ipo.open_date} />}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                <div className="info-item"><div className="info-label">Price Band</div><div className="info-value">₹{ipo.min_price} - ₹{ipo.max_price}</div></div>
                <div className="info-item"><div className="info-label">Shares Offered</div><div className="info-value">{(ipo.shares_offered / 1000).toFixed(0)}K</div></div>
                <div className="info-item"><div className="info-label">Opens</div><div className="info-value">{formatDate(ipo.open_date)}</div></div>
                <div className="info-item"><div className="info-label">Closes</div><div className="info-value">{formatDate(ipo.close_date)}</div></div>
              </div>

              {ipo.status === 'OPEN' && applyingId !== ipo.id && (
                <button className="btn btn-gold btn-block" onClick={() => setApplyingId(ipo.id)}>Apply for IPO</button>
              )}

              {applyingId === ipo.id && (
                <div style={{ background: 'var(--bg-tertiary)', padding: '16px', borderRadius: '12px' }}>
                  <div className="form-group">
                    <label className="form-label">Number of Shares</label>
                    <input type="number" className="form-input mono" placeholder="100" value={shares} onChange={(e) => setShares(e.target.value)} />
                  </div>
                  <div className="order-summary">
                    <div className="order-summary-row"><span className="label">Price</span><span className="value">₹{ipo.ipo_price}</span></div>
                    <div className="order-summary-row"><span className="label">Shares</span><span className="value">{shares || 0}</span></div>
                    <div className="order-summary-row"><span className="label">Total Amount</span><span className="value text-gold">₹{((parseInt(shares) || 0) * ipo.ipo_price).toLocaleString('en-IN')}</span></div>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button className="btn btn-gold" style={{ flex: 1 }}>Submit Application</button>
                    <button className="btn btn-ghost" onClick={() => setApplyingId(null)}>Cancel</button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default IPO;
