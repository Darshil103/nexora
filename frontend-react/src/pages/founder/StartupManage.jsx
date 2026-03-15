import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { mockStocks, mockPriceHistory, mockDividends, formatINR, formatDate, getStatusBadgeClass } from '../../data/mockData';
import '../investor/InvestorPages.css';

const StartupManage = () => {
  const { id } = useParams();
  const stock = mockStocks[0];
  const [editing, setEditing] = useState(false);
  const [showDividendForm, setShowDividendForm] = useState(false);
  const chartData = mockPriceHistory.slice(-30);

  return (
    <div className="page-container animate-fade-in">
      <div className="page-header">
        <h1 className="page-title">Manage: {stock.name}</h1>
        <button className="btn btn-secondary" onClick={() => setEditing(!editing)}>{editing ? 'Cancel' : 'Edit Details'}</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' }}>
        <div className="card">
          <div className="card-header"><span className="card-title">Startup Details</span></div>
          <div className="form-group"><label className="form-label">Description</label><textarea className="form-textarea" defaultValue={stock.description} disabled={!editing}></textarea></div>
          <div className="form-row">
            <div className="form-group"><label className="form-label">Industry</label><input className="form-input" defaultValue={stock.industry} disabled={!editing} /></div>
            <div className="form-group"><label className="form-label">Stage</label><input className="form-input" defaultValue={stock.stage} disabled={!editing} /></div>
          </div>
          <div className="form-row">
            <div className="form-group"><label className="form-label">Employees</label><input className="form-input mono" type="number" defaultValue={stock.employee_count} disabled={!editing} /></div>
            <div className="form-group"><label className="form-label">Revenue (₹)</label><input className="form-input mono" type="number" defaultValue={stock.revenue} disabled={!editing} /></div>
          </div>
          <div className="form-group"><label className="form-label">Valuation (₹)</label><input className="form-input mono" type="number" defaultValue={stock.valuation} disabled={!editing} /></div>
          {editing && <button className="btn btn-primary btn-block">Save Changes</button>}
        </div>

        <div className="card">
          <div className="card-header"><span className="card-title">Stock Information</span></div>
          <div className="info-grid">
            <div className="info-item"><div className="info-label">Symbol</div><div className="info-value">{stock.symbol}</div></div>
            <div className="info-item"><div className="info-label">Current Price</div><div className="info-value">₹{stock.currentPrice.toFixed(2)}</div></div>
            <div className="info-item"><div className="info-label">Total Shares</div><div className="info-value">{(stock.total_shares / 1000).toFixed(0)}K</div></div>
            <div className="info-item"><div className="info-label">Circulating</div><div className="info-value">{(stock.circulating_shares / 1000).toFixed(0)}K</div></div>
            <div className="info-item"><div className="info-label">Status</div><div className="info-value"><span className={`badge ${getStatusBadgeClass(stock.status)}`}>{stock.status}</span></div></div>
            <div className="info-item"><div className="info-label">Volume</div><div className="info-value">{(stock.day_volume / 1000).toFixed(0)}K</div></div>
          </div>
        </div>
      </div>

      {/* Price Chart */}
      <div className="card" style={{ marginBottom: '24px' }}>
        <div className="card-header"><span className="card-title">Price History</span></div>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="colorPriceF" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#00D4FF" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#00D4FF" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#1E2A45" />
            <XAxis dataKey="date" stroke="#5A6A8A" fontSize={11} tickFormatter={(v) => v.slice(5)} />
            <YAxis stroke="#5A6A8A" fontSize={11} />
            <Tooltip contentStyle={{ background: '#141D35', border: '1px solid #1E2A45', borderRadius: '8px' }} />
            <Area type="monotone" dataKey="close_price" stroke="#00D4FF" fill="url(#colorPriceF)" name="Price" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Dividends */}
      <div className="card">
        <div className="card-header">
          <span className="card-title">Dividends</span>
          <button className="btn btn-gold btn-sm" onClick={() => setShowDividendForm(!showDividendForm)}>+ Announce Dividend</button>
        </div>

        {showDividendForm && (
          <div style={{ background: 'var(--bg-tertiary)', padding: '20px', borderRadius: '12px', marginBottom: '16px' }}>
            <div className="form-row">
              <div className="form-group"><label className="form-label">Per Share (₹)</label><input type="number" className="form-input mono" placeholder="5.00" step="0.01" /></div>
              <div className="form-group"><label className="form-label">Total Amount (₹)</label><input type="number" className="form-input mono" placeholder="500000" /></div>
            </div>
            <div className="form-row">
              <div className="form-group"><label className="form-label">Announcement Date</label><input type="date" className="form-input" /></div>
              <div className="form-group"><label className="form-label">Payment Date</label><input type="date" className="form-input" /></div>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button className="btn btn-gold">Announce</button>
              <button className="btn btn-ghost" onClick={() => setShowDividendForm(false)}>Cancel</button>
            </div>
          </div>
        )}

        <div className="table-container">
          <table className="table">
            <thead><tr><th>Per Share</th><th>Total</th><th>Announced</th><th>Payment</th><th>Status</th></tr></thead>
            <tbody>
              {mockDividends.map((d) => (
                <tr key={d.id}>
                  <td className="mono tabular-nums text-gold">₹{d.dividend_per_share.toFixed(2)}</td>
                  <td className="mono tabular-nums">{formatINR(d.total_amount)}</td>
                  <td style={{ fontSize: '0.8rem' }}>{formatDate(d.announcement_date)}</td>
                  <td style={{ fontSize: '0.8rem' }}>{formatDate(d.payment_date)}</td>
                  <td><span className={`badge ${getStatusBadgeClass(d.status)}`}>{d.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default StartupManage;
