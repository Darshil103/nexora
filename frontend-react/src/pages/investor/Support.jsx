import { useState } from 'react';
import { mockSupportTickets, formatDateTime, getStatusBadgeClass } from '../../data/mockData';
import './InvestorPages.css';

const Support = () => {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ category: 'Trading', subject: '', description: '' });
  const categories = ['Trading', 'KYC', 'Wallet', 'IPO', 'Technical', 'Other'];

  return (
    <div className="page-container animate-fade-in">
      <div className="page-header">
        <h1 className="page-title">Support</h1>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>+ New Ticket</button>
      </div>

      {showForm && (
        <div className="card" style={{ marginBottom: '24px', maxWidth: '600px' }}>
          <div className="card-header">
            <span className="card-title">Create Support Ticket</span>
            <button className="modal-close" onClick={() => setShowForm(false)}>×</button>
          </div>
          <div className="form-group">
            <label className="form-label">Category</label>
            <select className="form-select" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
              {categories.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Subject</label>
            <input type="text" className="form-input" placeholder="Brief description of your issue" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} />
          </div>
          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea className="form-textarea" placeholder="Provide details about your issue..." value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}></textarea>
          </div>
          <button className="btn btn-primary btn-block" disabled={!form.subject || !form.description}>Submit Ticket</button>
        </div>
      )}

      <div className="table-container">
        <table className="table">
          <thead>
            <tr><th>Subject</th><th>Category</th><th>Priority</th><th>Status</th><th>Created</th></tr>
          </thead>
          <tbody>
            {mockSupportTickets.map((t) => (
              <tr key={t.id}>
                <td style={{ fontWeight: 600 }}>{t.subject}</td>
                <td>{t.category}</td>
                <td><span className={`badge ${getStatusBadgeClass(t.priority)}`}>{t.priority}</span></td>
                <td><span className={`badge ${getStatusBadgeClass(t.status)}`}>{t.status}</span></td>
                <td style={{ fontSize: '0.8rem' }}>{formatDateTime(t.createdAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Support;
