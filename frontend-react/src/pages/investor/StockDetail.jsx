import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import useAuthStore from '../../store/authStore';
import { stocksAPI, holdingsAPI, ordersAPI } from '../../services/api';
import { formatINR, formatDateTime } from '../../data/mockData';
import './InvestorPages.css';

const StockDetail = () => {
  const { symbol } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const kycApproved = user?.kycStatus === 'APPROVED';

  const [stock, setStock] = useState(null);
  const [holding, setHolding] = useState(null);
  const [priceHistory, setPriceHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [orderLoading, setOrderLoading] = useState(false);

  const [range, setRange] = useState('1M');
  const [orderType, setOrderType] = useState('BUY');
  const [priceType, setPriceType] = useState('MARKET');
  const [quantity, setQuantity] = useState('');
  const [limitPrice, setLimitPrice] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const stockRes = await stocksAPI.getBySymbol(symbol);
        if (stockRes.data?.success) {
          const stockData = stockRes.data.data;
          setStock(stockData);
          
          // Fetch price history
          const historyRes = await stocksAPI.getPriceHistory(stockData.id, { period: range });
          if (historyRes.data?.success) {
            setPriceHistory(historyRes.data.data);
          }

          if (user?.id) {
            const holdingRes = await holdingsAPI.getByUserAndStock(user.id, stockData.id);
            if (holdingRes.data?.success) setHolding(holdingRes.data.data);
          }
        }
      } catch (err) {
        console.error("Failed to fetch stock detail", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [symbol, user?.id, range]);

  // Re-fetch price history when range changes (without full reload)
  useEffect(() => {
    if (!stock?.id) return;
    const fetchHistory = async () => {
      try {
        const historyRes = await stocksAPI.getPriceHistory(stock.id, { period: range });
        if (historyRes.data?.success) {
          setPriceHistory(historyRes.data.data);
        }
      } catch (err) {
        console.error("Failed to fetch price history", err);
      }
    };
    fetchHistory();
  }, [range, stock?.id]);

  if (loading) return <div className="page-container empty-state"><p>Loading details...</p></div>;
  if (!stock) return <div className="page-container empty-state"><p>Stock not found</p></div>;

  const ranges = { '1W': 7, '1M': 30, '3M': 90, 'ALL': 90 };
  // Use real price history data for the chart, fallback to current price point
  const chartData = priceHistory.length > 0
    ? priceHistory.map(p => ({ date: p.date, close_price: p.close }))
    : [{ date: new Date().toISOString().split('T')[0], close_price: stock.currentPrice }];

  const orderPrice = priceType === 'MARKET' ? stock.currentPrice : (parseFloat(limitPrice) || 0);
  const totalValue = (parseInt(quantity) || 0) * orderPrice;

  const handlePlaceOrder = async () => {
    if (!kycApproved) return alert("Complete KYC to trade!");
    try {
      setOrderLoading(true);
      const res = await ordersAPI.create({
        stock_id: stock.id,
        order_type: orderType,
        price_type: priceType,
        quantity: parseInt(quantity),
        price: orderPrice
      });
      if (res.data?.success) {
        alert("Order placed successfully!");
        setQuantity('');
        setLimitPrice('');
      } else {
        alert(res.data?.message || "Order failed");
      }
    } catch (err) {
      alert(err.response?.data?.message || "Failed to place order");
    } finally {
      setOrderLoading(false);
    }
  };

  return (
    <div className="page-container animate-fade-in">
      {/* Stock Header */}
      <div className="stock-header">
        <div className="stock-logo-lg">{stock.symbol?.[0]}</div>
        <div className="stock-header-info">
          <h1 className="page-title" style={{ marginBottom: '2px' }}>{stock.name}</h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span className="mono text-muted">{stock.symbol}</span>
            <span className="badge badge-cyan">{stock.stage?.replace('_', ' ')}</span>
            <span className="badge badge-purple">{stock.industry}</span>
            <span className={`badge ${stock.status === 'ACTIVE' ? 'badge-active' : 'badge-halted'}`}>{stock.status}</span>
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div className="stock-detail-price">₹{(stock.currentPrice || 0).toFixed(2)}</div>
          <div className={`mono tabular-nums ${(stock.change || 0) >= 0 ? 'text-green' : 'text-red'}`} style={{ fontSize: '1rem' }}>
            {(stock.change || 0) >= 0 ? '▲' : '▼'} {Math.abs(stock.change || 0)}%
          </div>
        </div>
      </div>

      <div className="stock-detail-layout">
        <div>
          {/* Chart */}
          <div className="card" style={{ marginBottom: '24px' }}>
            <div className="card-header">
              <span className="card-title">Price Chart</span>
              <div className="chart-range-selector">
                {Object.keys(ranges).map((r) => (
                  <button key={r} className={`chart-range-btn ${range === r ? 'active' : ''}`} onClick={() => setRange(r)}>{r}</button>
                ))}
              </div>
            </div>
            <ResponsiveContainer width="100%" height={350}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00D4FF" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#00D4FF" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E2A45" />
                <XAxis dataKey="date" stroke="#5A6A8A" fontSize={11} tickFormatter={(v) => v.slice(5)} />
                <YAxis stroke="#5A6A8A" fontSize={11} domain={['auto', 'auto']} />
                <Tooltip contentStyle={{ background: '#141D35', border: '1px solid #1E2A45', borderRadius: '8px', fontSize: '0.8rem' }} />
                <Area type="monotone" dataKey="close_price" stroke="#00D4FF" strokeWidth={2} fill="url(#colorPrice)" name="Price" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="card" style={{ marginBottom: '24px' }}>
            <div className="card-header"><span className="card-title">Key Statistics</span></div>
            <div className="info-grid">
              <div className="info-item"><div className="info-label">Day High</div><div className="info-value">₹{stock.dayHigh?.toFixed(2)}</div></div>
              <div className="info-item"><div className="info-label">Day Low</div><div className="info-value">₹{stock.dayLow?.toFixed(2)}</div></div>
              <div className="info-item"><div className="info-label">52W High</div><div className="info-value">₹{stock.year_high?.toFixed(2)}</div></div>
              <div className="info-item"><div className="info-label">52W Low</div><div className="info-value">₹{stock.year_low?.toFixed(2)}</div></div>
              <div className="info-item"><div className="info-label">Volume</div><div className="info-value">{((stock.day_volume || 0) / 1000).toFixed(0)}K</div></div>
              <div className="info-item"><div className="info-label">Total Shares</div><div className="info-value">{((stock.total_shares || 0) / 1000).toFixed(0)}K</div></div>
              <div className="info-item"><div className="info-label">Valuation</div><div className="info-value">{formatINR(stock.valuation)}</div></div>
              <div className="info-item"><div className="info-label">Revenue</div><div className="info-value">{formatINR(stock.revenue)}</div></div>
            </div>
          </div>

          {holding && (
            <div className="card">
              <div className="card-header"><span className="card-title">My Position</span></div>
              <div className="info-grid">
                <div className="info-item"><div className="info-label">Shares Held</div><div className="info-value">{holding.quantity}</div></div>
                <div className="info-item"><div className="info-label">Avg Cost</div><div className="info-value">₹{(holding.averageCost || 0).toFixed(2)}</div></div>
                <div className="info-item"><div className="info-label">Current Value</div><div className="info-value">{formatINR(holding.quantity * stock.currentPrice)}</div></div>
                <div className="info-item">
                  <div className="info-label">P&L</div>
                  <div className={`info-value ${(stock.currentPrice - (holding.averageCost || 0)) >= 0 ? 'text-green' : 'text-red'}`}>
                    {formatINR((stock.currentPrice - (holding.averageCost || 0)) * holding.quantity)}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div>
          <div className="order-panel">
            <h3 style={{ marginBottom: '16px', fontSize: '1.1rem' }}>Place Order</h3>
            {stock.status === 'HALTED' ? (
              <div className="kyc-banner" style={{ background: 'var(--accent-red-dim)', borderColor: 'rgba(255,68,68,0.3)' }}>
                <span style={{ fontSize: '1.5rem' }}>🚫</span>
                <span style={{ color: 'var(--accent-red)' }}>Trading is currently <strong>halted</strong>.</span>
              </div>
            ) : (
              <>
                <div className="order-type-toggle">
                  <button className={`order-type-btn ${orderType === 'BUY' ? 'active-buy' : ''}`} onClick={() => setOrderType('BUY')}>BUY</button>
                  <button className={`order-type-btn ${orderType === 'SELL' ? 'active-sell' : ''}`} onClick={() => setOrderType('SELL')}>SELL</button>
                </div>

                <div className="order-type-toggle">
                  <button className={`order-type-btn ${priceType === 'MARKET' ? 'active-buy' : ''}`} onClick={() => setPriceType('MARKET')}>MARKET</button>
                  <button className={`order-type-btn ${priceType === 'LIMIT' ? 'active-buy' : ''}`} onClick={() => setPriceType('LIMIT')}>LIMIT</button>
                </div>

                <div className="form-group">
                  <label className="form-label">Quantity</label>
                  <input type="number" className="form-input mono" placeholder="0" value={quantity} onChange={(e) => setQuantity(e.target.value)} />
                </div>

                {priceType === 'LIMIT' && (
                  <div className="form-group">
                    <label className="form-label">Limit Price (₹)</label>
                    <input type="number" className="form-input mono" placeholder="0.00" value={limitPrice} onChange={(e) => setLimitPrice(e.target.value)} />
                  </div>
                )}

                <div className="order-summary" style={{ background: 'rgba(255,255,255,0.03)', padding: '12px', borderRadius: '8px', marginBottom: '16px' }}>
                  <div className="order-summary-row" style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    <span>Estimated Total</span>
                    <span className="mono" style={{ color: 'var(--accent-primary)', fontSize: '1rem', fontWeight: 600 }}>₹{totalValue.toLocaleString('en-IN')}</span>
                  </div>
                </div>

                <button 
                  className={`btn btn-block btn-lg ${orderType === 'BUY' ? 'btn-buy' : 'btn-sell'}`} 
                  disabled={!kycApproved || !quantity || orderLoading}
                  onClick={handlePlaceOrder}
                >
                  {!kycApproved ? '🔒 Complete KYC to Trade' : orderLoading ? 'Placing Order...' : `${orderType} ${stock.symbol}`}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StockDetail;
