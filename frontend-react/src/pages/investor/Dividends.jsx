import { mockDividends, mockHoldings, formatINR, formatDate, getStatusBadgeClass } from '../../data/mockData';
import './InvestorPages.css';

const Dividends = () => {
  return (
    <div className="page-container animate-fade-in">
      <div className="page-header"><h1 className="page-title">Dividends</h1></div>

      <div className="grid-3 mb-lg">
        <div className="card card-stat">
          <div className="stat-label">Total Received</div>
          <div className="stat-value mono text-gold">₹1,225.00</div>
        </div>
        <div className="card card-stat">
          <div className="stat-label">Upcoming</div>
          <div className="stat-value mono text-amber">₹500.00</div>
        </div>
        <div className="card card-stat">
          <div className="stat-label">Eligible Holdings</div>
          <div className="stat-value mono">{mockHoldings.length}</div>
        </div>
      </div>

      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>Startup</th>
              <th>Symbol</th>
              <th>Per Share</th>
              <th>My Shares</th>
              <th>Total Receivable</th>
              <th>Announced</th>
              <th>Payment Date</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {mockDividends.map((d) => {
              const holding = mockHoldings.find((h) => h.symbol === d.symbol);
              const myShares = holding?.quantity || 0;
              const receivable = myShares * d.dividend_per_share;
              return (
                <tr key={d.id}>
                  <td style={{ fontWeight: 600 }}>{d.startup_name}</td>
                  <td className="mono">{d.symbol}</td>
                  <td className="mono tabular-nums text-gold">₹{d.dividend_per_share.toFixed(2)}</td>
                  <td className="mono tabular-nums">{myShares}</td>
                  <td className="mono tabular-nums" style={{ fontWeight: 600 }}>{formatINR(receivable)}</td>
                  <td style={{ fontSize: '0.8rem' }}>{formatDate(d.announcement_date)}</td>
                  <td style={{ fontSize: '0.8rem' }}>{formatDate(d.payment_date)}</td>
                  <td><span className={`badge ${getStatusBadgeClass(d.status)}`}>{d.status}</span></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Dividends;
