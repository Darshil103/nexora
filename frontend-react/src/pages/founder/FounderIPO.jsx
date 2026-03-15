import { mockIPOs, formatINR, formatDate, getStatusBadgeClass } from '../../data/mockData';
import '../investor/InvestorPages.css';
import { useState } from 'react';

const FounderIPO = () => {
  const [showCreate, setShowCreate] = useState(false);

  return (
    <div className="page-container animate-fade-in">
      <div className="page-header">
        <h1 className="page-title">IPO Management</h1>
        <button className="btn btn-gold" onClick={() => setShowCreate(!showCreate)}>+ Create IPO Listing</button>
      </div>

      {showCreate && (
        <div className="card" style={{ marginBottom: '24px', maxWidth: '600px' }}>
          <div className="card-header"><span className="card-title">New IPO Listing</span><button className="modal-close" onClick={() => setShowCreate(false)}>×</button></div>
          <div className="form-row">
            <div className="form-group"><label className="form-label">IPO Price (₹)</label><input type="number" className="form-input mono" placeholder="120.00" /></div>
            <div className="form-group"><label className="form-label">Shares Offered</label><input type="number" className="form-input mono" placeholder="200000" /></div>
          </div>
          <div className="form-row">
            <div className="form-group"><label className="form-label">Min Price (₹)</label><input type="number" className="form-input mono" placeholder="110.00" /></div>
            <div className="form-group"><label className="form-label">Max Price (₹)</label><input type="number" className="form-input mono" placeholder="130.00" /></div>
          </div>
          <div className="form-row">
            <div className="form-group"><label className="form-label">Open Date</label><input type="date" className="form-input" /></div>
            <div className="form-group"><label className="form-label">Close Date</label><input type="date" className="form-input" /></div>
          </div>
          <button className="btn btn-gold btn-block">Create IPO</button>
        </div>
      )}

      <div className="table-container">
        <table className="table">
          <thead><tr><th>Startup</th><th>Symbol</th><th>Price Band</th><th>Shares</th><th>Opens</th><th>Closes</th><th>Status</th></tr></thead>
          <tbody>
            {mockIPOs.map((ipo) => (
              <tr key={ipo.id}>
                <td style={{ fontWeight: 600 }}>{ipo.startup_name}</td>
                <td className="mono">{ipo.symbol}</td>
                <td className="mono tabular-nums">₹{ipo.min_price} - ₹{ipo.max_price}</td>
                <td className="mono tabular-nums">{(ipo.shares_offered / 1000).toFixed(0)}K</td>
                <td style={{ fontSize: '0.8rem' }}>{formatDate(ipo.open_date)}</td>
                <td style={{ fontSize: '0.8rem' }}>{formatDate(ipo.close_date)}</td>
                <td><span className={`badge ${getStatusBadgeClass(ipo.status)}`}>{ipo.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default FounderIPO;
