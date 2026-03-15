import { useState, useEffect } from 'react';
import useAuthStore from '../../store/authStore';
import { walletsAPI, transactionsAPI } from '../../services/api';
import { formatINR, formatDateTime, getStatusBadgeClass } from '../../data/mockData';
import './InvestorPages.css';

const Wallet = () => {
  const { user } = useAuthStore();
  const [wallet, setWallet] = useState({ balance: 0, reservedBalance: 0 });
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [showDeposit, setShowDeposit] = useState(false);
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [filterType, setFilterType] = useState('ALL');
  const [depositAmount, setDepositAmount] = useState('');
  const [depositRef, setDepositRef] = useState('');
  const [depositMethod, setDepositMethod] = useState('UPI');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawMethod, setWithdrawMethod] = useState('NEFT');
  const [processing, setProcessing] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    if (user?.id) fetchWalletData();
  }, [user]);

  const fetchWalletData = async () => {
    try {
      setLoading(true);
      const res = await walletsAPI.getByUser(user.id);
      if (res.data.success) {
        setWallet(res.data.data);
        fetchTransactions(res.data.data.id);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const fetchTransactions = async (walletId) => {
    try {
      const res = await transactionsAPI.getByWallet(walletId);
      if (res.data.success) setTransactions(res.data.data);
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeposit = async (quickAmount) => {
    const amount = quickAmount || depositAmount;
    if (!amount || parseFloat(amount) <= 0) return;
    try {
      setProcessing(true);
      const ref = depositRef || `${depositMethod}-${Date.now()}`;
      await walletsAPI.deposit({ amount, referenceId: ref });
      setSuccessMsg(`₹${parseFloat(amount).toLocaleString('en-IN')} deposited successfully via ${depositMethod}!`);
      setTimeout(() => setSuccessMsg(''), 4000);
      setShowDeposit(false);
      setDepositAmount('');
      setDepositRef('');
      fetchWalletData();
    } catch (e) {
      alert(e.response?.data?.message || "Deposit failed");
    } finally {
      setProcessing(false);
    }
  };

  const handleWithdraw = async () => {
    if (!withdrawAmount || parseFloat(withdrawAmount) <= 0) return;
    try {
      setProcessing(true);
      await walletsAPI.withdraw({ amount: withdrawAmount });
      setSuccessMsg(`₹${parseFloat(withdrawAmount).toLocaleString('en-IN')} withdrawn to bank via ${withdrawMethod}!`);
      setTimeout(() => setSuccessMsg(''), 4000);
      setShowWithdraw(false);
      setWithdrawAmount('');
      fetchWalletData();
    } catch (e) {
      alert(e.response?.data?.message || "Withdrawal failed");
    } finally {
      setProcessing(false);
    }
  };

  const txTypes = ['ALL', 'DEPOSIT', 'WITHDRAWAL', 'TRADE_BUY', 'TRADE_SELL', 'DIVIDEND', 'FEE'];
  const filtered = filterType === 'ALL' ? transactions : transactions.filter(t => (t.transactionType || t.transaction_type) === filterType);

  const txTypeColors = {
    DEPOSIT: 'badge-green', WITHDRAWAL: 'badge-red', TRADE_BUY: 'badge-cyan',
    TRADE_SELL: 'badge-orange', DIVIDEND: 'badge-gold', FEE: 'badge-gray',
  };

  const paymentMethods = [
    { id: 'UPI', label: '📱 UPI', desc: 'Google Pay, PhonePe, Paytm' },
    { id: 'NEFT', label: '🏦 NEFT', desc: 'Bank Transfer (1-2 hrs)' },
    { id: 'IMPS', label: '⚡ IMPS', desc: 'Instant Bank Transfer' },
  ];

  const withdrawMethods = [
    { id: 'NEFT', label: '🏦 NEFT', desc: 'Free, 1-2 hours' },
    { id: 'IMPS', label: '⚡ IMPS', desc: 'Instant, ₹5 fee' },
    { id: 'UPI', label: '📱 UPI', desc: 'Instant, No fee' },
  ];

  return (
    <div className="page-container animate-fade-in">
      {/* Success Banner */}
      {successMsg && (
        <div style={{ background: 'rgba(0,212,170,0.15)', border: '1px solid rgba(0,212,170,0.3)', borderRadius: '12px', padding: '12px 20px', marginBottom: '20px', color: '#00D4AA', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
          ✅ {successMsg}
        </div>
      )}

      <div className="page-header">
        <h1 className="page-title">Wallet</h1>
        <div className="wallet-actions">
          <button className="btn btn-primary" onClick={() => { setShowDeposit(!showDeposit); setShowWithdraw(false); }}>+ Add Money</button>
          <button className="btn btn-secondary" onClick={() => { setShowWithdraw(!showWithdraw); setShowDeposit(false); }}>Withdraw</button>
        </div>
      </div>

      {/* Balance Cards */}
      <div className="balance-display">
        <div className="card card-stat">
          <div className="stat-label">Available Balance</div>
          <div className="stat-value mono text-cyan">{formatINR(wallet.balance)}</div>
        </div>
        <div className="card card-stat">
          <div className="stat-label">Reserved (In Orders)</div>
          <div className="stat-value mono text-amber">{formatINR(wallet.reservedBalance)}</div>
        </div>
        <div className="card card-stat">
          <div className="stat-label">Total Balance</div>
          <div className="stat-value mono">{formatINR((wallet.balance || 0) + (wallet.reservedBalance || 0))}</div>
        </div>
      </div>

      {/* Add Money Panel */}
      {showDeposit && (
        <div className="card" style={{ marginBottom: '24px' }}>
          <div className="card-header">
            <span className="card-title">💰 Add Money</span>
            <button className="modal-close" onClick={() => setShowDeposit(false)}>×</button>
          </div>

          {/* Quick Amounts */}
          <div style={{ marginBottom: '16px' }}>
            <label className="form-label" style={{ marginBottom: '8px' }}>Quick Add</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
              {[5000, 10000, 50000, 100000].map(amt => (
                <button key={amt} className="btn btn-ghost" onClick={() => handleDeposit(amt)} disabled={processing}>
                  + ₹{amt.toLocaleString('en-IN')}
                </button>
              ))}
            </div>
          </div>

          <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', margin: '16px 0', position: 'relative' }}>
            <span style={{ position: 'absolute', top: '-10px', left: '50%', transform: 'translateX(-50%)', background: 'var(--bg-card)', padding: '0 12px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>OR</span>
          </div>

          {/* Payment Method Selection */}
          <div style={{ marginBottom: '16px' }}>
            <label className="form-label">Payment Method</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
              {paymentMethods.map(m => (
                <button
                  key={m.id}
                  onClick={() => setDepositMethod(m.id)}
                  style={{
                    padding: '12px 8px', borderRadius: '10px', cursor: 'pointer', textAlign: 'center',
                    background: depositMethod === m.id ? 'rgba(0,212,255,0.1)' : 'rgba(255,255,255,0.03)',
                    border: depositMethod === m.id ? '1px solid rgba(0,212,255,0.4)' : '1px solid rgba(255,255,255,0.06)',
                    color: 'inherit', transition: 'all 0.2s',
                  }}
                >
                  <div style={{ fontSize: '1.1rem', marginBottom: '4px' }}>{m.label}</div>
                  <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>{m.desc}</div>
                </button>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Amount (₹)</label>
            <input type="number" className="form-input mono" placeholder="Enter amount" value={depositAmount} onChange={(e) => setDepositAmount(e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">{depositMethod === 'UPI' ? 'UPI Transaction ID' : 'Reference Number'}</label>
            <input type="text" className="form-input" placeholder={depositMethod === 'UPI' ? 'e.g., 123456789012' : 'e.g., NEFT-REF-001'} value={depositRef} onChange={(e) => setDepositRef(e.target.value)} />
          </div>
          <button className="btn btn-primary btn-block" disabled={!depositAmount || processing} onClick={() => handleDeposit()}>
            {processing ? '⏳ Processing...' : `Add ₹${depositAmount ? parseFloat(depositAmount).toLocaleString('en-IN') : '0'} via ${depositMethod}`}
          </button>
          <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '8px', textAlign: 'center' }}>
            This is a simulated deposit for demonstration purposes.
          </p>
        </div>
      )}

      {/* Withdraw Panel */}
      {showWithdraw && (
        <div className="card" style={{ marginBottom: '24px' }}>
          <div className="card-header">
            <span className="card-title">💸 Withdraw Funds</span>
            <button className="modal-close" onClick={() => setShowWithdraw(false)}>×</button>
          </div>

          {/* Withdraw Method Selection */}
          <div style={{ marginBottom: '16px' }}>
            <label className="form-label">Withdrawal Method</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
              {withdrawMethods.map(m => (
                <button
                  key={m.id}
                  onClick={() => setWithdrawMethod(m.id)}
                  style={{
                    padding: '12px 8px', borderRadius: '10px', cursor: 'pointer', textAlign: 'center',
                    background: withdrawMethod === m.id ? 'rgba(0,212,255,0.1)' : 'rgba(255,255,255,0.03)',
                    border: withdrawMethod === m.id ? '1px solid rgba(0,212,255,0.4)' : '1px solid rgba(255,255,255,0.06)',
                    color: 'inherit', transition: 'all 0.2s',
                  }}
                >
                  <div style={{ fontSize: '1.1rem', marginBottom: '4px' }}>{m.label}</div>
                  <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>{m.desc}</div>
                </button>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Amount (₹)</label>
            <input type="number" className="form-input mono" placeholder="Enter amount" value={withdrawAmount} onChange={(e) => setWithdrawAmount(e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Bank Account</label>
            <input type="text" className="form-input" value="HDFC Bank ****6789 (Linked)" readOnly style={{ opacity: 0.6 }} />
          </div>
          {parseFloat(withdrawAmount) > wallet.balance && (
            <div style={{ background: 'rgba(255,68,68,0.1)', border: '1px solid rgba(255,68,68,0.3)', borderRadius: '8px', padding: '8px 12px', marginBottom: '12px', color: '#FF4444', fontSize: '0.85rem' }}>
              ⚠️ Insufficient available balance
            </div>
          )}
          <button className="btn btn-primary btn-block" disabled={!withdrawAmount || parseFloat(withdrawAmount) > wallet.balance || processing} onClick={handleWithdraw}>
            {processing ? '⏳ Processing...' : `Withdraw ₹${withdrawAmount ? parseFloat(withdrawAmount).toLocaleString('en-IN') : '0'} via ${withdrawMethod}`}
          </button>
          <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '8px', textAlign: 'center' }}>
            Funds will be credited to your linked bank account.
          </p>
        </div>
      )}

      {/* Transaction Filter */}
      <div className="filter-chips">
        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Filter:</span>
        {txTypes.map((t) => (
          <button key={t} className={`chip ${filterType === t ? 'active' : ''}`} onClick={() => setFilterType(t)}>{t.replace('TRADE_', '')}</button>
        ))}
      </div>

      {/* Transactions Table */}
      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>Type</th>
              <th>Amount</th>
              <th>Before</th>
              <th>After</th>
              <th>Description</th>
              <th>Status</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan="7" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>No transactions found</td></tr>
            ) : filtered.map((t) => (
              <tr key={t.id}>
                <td><span className={`badge ${txTypeColors[t.transactionType || t.transaction_type] || 'badge-gray'}`}>{(t.transactionType || t.transaction_type || '').replace('TRADE_', '')}</span></td>
                <td className={`mono tabular-nums ${t.amount >= 0 ? 'text-green' : 'text-red'}`} style={{ fontWeight: 600 }}>
                  {t.amount >= 0 ? '+' : ''}₹{Math.abs(t.amount).toLocaleString('en-IN')}
                </td>
                <td className="mono tabular-nums" style={{ fontSize: '0.8rem' }}>₹{(t.balanceBefore || 0).toLocaleString('en-IN')}</td>
                <td className="mono tabular-nums" style={{ fontSize: '0.8rem' }}>₹{(t.balanceAfter || 0).toLocaleString('en-IN')}</td>
                <td style={{ fontSize: '0.85rem' }}>{t.description}</td>
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

export default Wallet;
