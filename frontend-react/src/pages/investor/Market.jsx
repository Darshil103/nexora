import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { IoSearchOutline, IoFunnelOutline } from 'react-icons/io5';
import { stocksAPI } from '../../services/api';
import { getStatusBadgeClass } from '../../data/mockData';
import './InvestorPages.css';

const Market = () => {
  const [stocks, setStocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [industry, setIndustry] = useState('ALL');
  const [stage, setStage] = useState('ALL');
  const [sortBy, setSortBy] = useState('name');

  useEffect(() => {
    const fetchStocks = async () => {
      try {
        setLoading(true);
        const res = await stocksAPI.getAll();
        if (res.data?.success) {
          setStocks(res.data.data);
        }
      } catch (err) {
        console.error("Failed to fetch stocks", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStocks();
  }, []);

  const industries = ['ALL', 'TECH', 'HEALTHCARE', 'FINTECH', 'EDTECH', 'AI', 'ECOMMERCE'];
  const stages = ['ALL', 'SEED', 'SERIES_A', 'SERIES_B', 'GROWTH', 'LATE_STAGE'];

  let filtered = stocks.filter((s) => {
    const matchSearch = (s.name || '').toLowerCase().includes(search.toLowerCase()) || 
                      (s.symbol || '').toLowerCase().includes(search.toLowerCase());
    const matchIndustry = industry === 'ALL' || s.industry === industry;
    const matchStage = stage === 'ALL' || s.stage === stage;
    return matchSearch && matchIndustry && matchStage;
  });

  if (sortBy === 'price') filtered.sort((a, b) => (b.currentPrice || 0) - (a.currentPrice || 0));
  else if (sortBy === 'change') filtered.sort((a, b) => (b.change || 0) - (a.change || 0));
  else if (sortBy === 'volume') filtered.sort((a, b) => (b.day_volume || 0) - (a.day_volume || 0));
  else filtered.sort((a, b) => (a.name || '').localeCompare(b.name || ''));

  return (
    <div className="page-container animate-fade-in">
      <div className="page-header">
        <h1 className="page-title">Market</h1>
        <div className="search-wrapper">
          <IoSearchOutline />
          <input className="search-input" placeholder="Search stocks by name or symbol..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
      </div>

      <div className="filter-chips">
        <span className="text-muted" style={{ fontSize: '0.8rem', marginRight: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}><IoFunnelOutline /> Industry:</span>
        {industries.map((i) => (
          <button key={i} className={`chip ${industry === i ? 'active' : ''}`} onClick={() => setIndustry(i)}>{i}</button>
        ))}
        <span className="text-muted" style={{ fontSize: '0.8rem', marginLeft: '12px', marginRight: '4px' }}>Stage:</span>
        {stages.map((s) => (
          <button key={s} className={`chip ${stage === s ? 'active' : ''}`} onClick={() => setStage(s)}>{s.replace('_', ' ')}</button>
        ))}
      </div>

      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
        <span className="text-muted" style={{ fontSize: '0.8rem', display: 'flex', alignItems: 'center' }}>Sort:</span>
        {['name', 'price', 'change', 'volume'].map((s) => (
          <button key={s} className={`chip ${sortBy === s ? 'active' : ''}`} onClick={() => setSortBy(s)} style={{ textTransform: 'capitalize' }}>{s}</button>
        ))}
      </div>

      {loading ? (
        <div className="empty-state"><p>Loading live market data...</p></div>
      ) : (
        <div className="stock-cards-grid">
          {filtered.map((stock) => (
            <Link to={`/investor/stock/${stock.symbol}`} key={stock.id} className="market-stock-card">
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                <div className="stock-mini-logo" style={{ width: '44px', height: '44px', fontSize: '1rem', borderRadius: '12px' }}>{stock.symbol?.[0]}</div>
                <div style={{ flex: 1 }}>
                  <div className="mono" style={{ fontWeight: 700, fontSize: '1rem' }}>{stock.symbol}</div>
                  <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>{stock.name}</div>
                </div>
                <span className={`badge ${(stock.change || 0) >= 0 ? 'badge-green' : 'badge-red'}`}>
                  {(stock.change || 0) >= 0 ? '+' : ''}{stock.change || 0}%
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '12px' }}>
                <span className="mono tabular-nums" style={{ fontSize: '1.5rem', fontWeight: 700 }}>₹{(stock.currentPrice || 0).toFixed(2)}</span>
              </div>

              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '12px' }}>
                <span className="badge badge-cyan">{stock.stage?.replace('_', ' ')}</span>
                <span className="badge badge-purple">{stock.industry}</span>
              </div>

              <div className="range-bar" style={{ marginBottom: '8px' }}>
                <div className="range-fill" style={{ width: `${(((stock.currentPrice || 0) - (stock.dayLow || 0)) / ((stock.dayHigh || 0) - (stock.dayLow || 0) || 1)) * 100}%` }}></div>
              </div>
              <div className="range-labels">
                <span>L: ₹{(stock.dayLow || 0).toFixed(2)}</span>
                <span>Vol: {((stock.day_volume || 0) / 1000).toFixed(0)}K</span>
                <span>H: ₹{(stock.dayHigh || 0).toFixed(2)}</span>
              </div>
            </Link>
          ))}
        </div>
      )}

      {!loading && filtered.length === 0 && (
        <div className="empty-state">
          <p>No stocks found matching your criteria</p>
        </div>
      )}
    </div>
  );
};

export default Market;
