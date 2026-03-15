import { Link } from 'react-router-dom';
import { IoRocketOutline, IoShieldCheckmarkOutline, IoTrendingUpOutline, IoFlashOutline, IoArrowForwardOutline, IoChevronForwardOutline } from 'react-icons/io5';
import { mockStocks, mockIPOs, formatINR } from '../data/mockData';
import './Landing.css';

const Landing = () => {
  const featuredStocks = mockStocks.slice(0, 4);
  const upcomingIPOs = mockIPOs.filter(i => i.status === 'UPCOMING' || i.status === 'OPEN');

  return (
    <div className="landing">
      {/* Ticker Strip */}
      <div className="ticker-strip">
        <div className="ticker-content">
          {[...mockStocks, ...mockStocks].map((stock, i) => (
            <div className="ticker-item" key={i}>
              <span className="ticker-symbol">{stock.symbol}</span>
              <span className="tabular-nums" style={{color: 'var(--text-primary)'}}>₹{stock.currentPrice.toFixed(2)}</span>
              <span className={`tabular-nums ${stock.change >= 0 ? 'price-up' : 'price-down'}`}>
                {stock.change >= 0 ? '+' : ''}{stock.change}%
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Hero Section */}
      <section className="hero">
        <div className="hero-bg-grid"></div>
        <div className="hero-glow hero-glow-1"></div>
        <div className="hero-glow hero-glow-2"></div>
        <div className="hero-content">
          <div className="hero-badge">
            <IoFlashOutline /> India's First Startup Stock Exchange
          </div>
          <h1 className="hero-title">
            Invest in India's<br />
            <span className="gradient-text">Next Unicorns</span>
          </h1>
          <p className="hero-subtitle">
            Discover, invest, and trade shares in India's most promising startups. 
            From seed-stage to IPO-ready — build your portfolio of tomorrow's giants.
          </p>
          <div className="hero-actions">
            <Link to="/register" className="btn btn-primary btn-xl">
              Start Investing <IoArrowForwardOutline />
            </Link>
            <Link to="/login" className="btn btn-secondary btn-xl">
              Login
            </Link>
          </div>
          <div className="hero-stats">
            <div className="hero-stat">
              <span className="hero-stat-value">248+</span>
              <span className="hero-stat-label">Listed Startups</span>
            </div>
            <div className="hero-stat-divider"></div>
            <div className="hero-stat">
              <span className="hero-stat-value">15K+</span>
              <span className="hero-stat-label">Active Investors</span>
            </div>
            <div className="hero-stat-divider"></div>
            <div className="hero-stat">
              <span className="hero-stat-value">₹456 Cr</span>
              <span className="hero-stat-label">Total Volume</span>
            </div>
            <div className="hero-stat-divider"></div>
            <div className="hero-stat">
              <span className="hero-stat-value">99.9%</span>
              <span className="hero-stat-label">Uptime</span>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Startups */}
      <section className="section" id="featured">
        <div className="section-container">
          <div className="section-header">
            <div>
              <h2 className="section-title">Featured Startups</h2>
              <p className="section-subtitle">Top performing companies on Nexora</p>
            </div>
            <Link to="/register" className="btn btn-ghost btn-sm">View All <IoChevronForwardOutline /></Link>
          </div>
          <div className="grid-4 stock-grid">
            {featuredStocks.map((stock) => (
              <div className="stock-card" key={stock.id}>
                <div className="stock-card-header">
                  <div className="stock-card-logo">{stock.symbol[0]}</div>
                  <div>
                    <div className="stock-card-symbol mono">{stock.symbol}</div>
                    <div className="stock-card-name">{stock.name}</div>
                  </div>
                  <span className={`badge ${stock.change >= 0 ? 'badge-green' : 'badge-red'}`}>
                    {stock.change >= 0 ? '+' : ''}{stock.change}%
                  </span>
                </div>
                <div className="stock-card-price">
                  <span className="price-value tabular-nums mono">₹{stock.currentPrice.toFixed(2)}</span>
                </div>
                <div className="stock-card-meta">
                  <span>Vol: {(stock.day_volume / 1000).toFixed(0)}K</span>
                  <span>{stock.industry}</span>
                  <span className="badge badge-cyan">{stock.stage.replace('_', ' ')}</span>
                </div>
                <div className="stock-card-range">
                  <div className="range-bar">
                    <div className="range-fill" style={{ 
                      width: `${((stock.currentPrice - stock.dayLow) / (stock.dayHigh - stock.dayLow)) * 100}%` 
                    }}></div>
                  </div>
                  <div className="range-labels">
                    <span>L: ₹{stock.dayLow.toFixed(2)}</span>
                    <span>H: ₹{stock.dayHigh.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* IPO Spotlight */}
      <section className="section section-dark">
        <div className="section-container">
          <div className="section-header">
            <div>
              <h2 className="section-title"><span className="text-gold">🚀</span> IPO Spotlight</h2>
              <p className="section-subtitle">Get in early on the next big thing</p>
            </div>
          </div>
          <div className="ipo-spotlight-grid">
            {mockIPOs.map((ipo) => (
              <div className="ipo-card" key={ipo.id}>
                <div className="ipo-card-top">
                  <div className="ipo-card-logo">{ipo.symbol[0]}</div>
                  <div>
                    <div className="ipo-card-name">{ipo.startup_name}</div>
                    <div className="ipo-card-symbol mono">{ipo.symbol}</div>
                  </div>
                  <span className={`badge ${ipo.status === 'OPEN' ? 'badge-green' : ipo.status === 'UPCOMING' ? 'badge-amber' : 'badge-blue'}`}>
                    {ipo.status}
                  </span>
                </div>
                <p className="ipo-card-desc">{ipo.description}</p>
                <div className="ipo-card-details">
                  <div className="ipo-detail">
                    <span className="ipo-detail-label">Price Band</span>
                    <span className="ipo-detail-value mono">₹{ipo.min_price} - ₹{ipo.max_price}</span>
                  </div>
                  <div className="ipo-detail">
                    <span className="ipo-detail-label">Shares Offered</span>
                    <span className="ipo-detail-value mono">{(ipo.shares_offered / 1000).toFixed(0)}K</span>
                  </div>
                  <div className="ipo-detail">
                    <span className="ipo-detail-label">{ipo.status === 'UPCOMING' ? 'Opens' : 'Closes'}</span>
                    <span className="ipo-detail-value">{ipo.status === 'UPCOMING' ? ipo.open_date : ipo.close_date}</span>
                  </div>
                </div>
                {ipo.status === 'OPEN' && (
                  <Link to="/register" className="btn btn-primary btn-block">Apply Now</Link>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="section">
        <div className="section-container">
          <div className="section-header" style={{ justifyContent: 'center', textAlign: 'center' }}>
            <div>
              <h2 className="section-title">How Nexora Works</h2>
              <p className="section-subtitle">Start investing in startups in 3 simple steps</p>
            </div>
          </div>
          <div className="steps-grid">
            <div className="step-card">
              <div className="step-number">01</div>
              <div className="step-icon"><IoPersonOutline /></div>
              <h3 className="step-title">Create Account & KYC</h3>
              <p className="step-desc">Sign up with your details and complete KYC verification with PAN and Aadhaar for secure trading.</p>
            </div>
            <div className="step-connector">
              <IoArrowForwardOutline />
            </div>
            <div className="step-card">
              <div className="step-number">02</div>
              <div className="step-icon"><IoTrendingUpOutline /></div>
              <h3 className="step-title">Discover Startups</h3>
              <p className="step-desc">Browse through 248+ listed startups across Tech, Healthcare, FinTech, and EdTech sectors.</p>
            </div>
            <div className="step-connector">
              <IoArrowForwardOutline />
            </div>
            <div className="step-card">
              <div className="step-number">03</div>
              <div className="step-icon"><IoRocketOutline /></div>
              <h3 className="step-title">Invest & Grow</h3>
              <p className="step-desc">Place buy/sell orders, track your portfolio, participate in IPOs, and earn dividends.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="section section-dark">
        <div className="section-container">
          <div className="trust-grid">
            <div className="trust-item">
              <IoShieldCheckmarkOutline className="trust-icon" />
              <h4>SEBI Compliant</h4>
              <p>Fully regulated and compliant with all SEBI guidelines for startup exchanges.</p>
            </div>
            <div className="trust-item">
              <IoFlashOutline className="trust-icon" />
              <h4>Instant Settlement</h4>
              <p>T+1 settlement cycle with instant UPI deposits and fast bank withdrawals.</p>
            </div>
            <div className="trust-item">
              <IoShieldCheckmarkOutline className="trust-icon" />
              <h4>Bank-Grade Security</h4>
              <p>256-bit encryption, 2FA authentication, and comprehensive audit trails.</p>
            </div>
            <div className="trust-item">
              <IoTrendingUpOutline className="trust-icon" />
              <h4>Real-time Data</h4>
              <p>Live market prices, candlestick charts, and comprehensive analytics.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="cta-glow"></div>
        <div className="section-container">
          <h2 className="cta-title">Ready to Invest in the Future?</h2>
          <p className="cta-subtitle">Join 15,000+ investors already building their startup portfolios on Nexora.</p>
          <div className="hero-actions" style={{ justifyContent: 'center' }}>
            <Link to="/register" className="btn btn-primary btn-xl">
              Create Free Account <IoArrowForwardOutline />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="section-container">
          <div className="footer-grid">
            <div className="footer-brand">
              <div className="navbar-logo">
                <span className="logo-icon">◇</span>
                <span className="logo-text">NEXORA</span>
              </div>
              <p className="footer-tagline">India's First Startup Stock Exchange. Invest in tomorrow's unicorns today.</p>
            </div>
            <div className="footer-links">
              <h5>Platform</h5>
              <Link to="/register">Sign Up</Link>
              <Link to="/login">Login</Link>
              <a href="#">Market</a>
              <a href="#">IPO</a>
            </div>
            <div className="footer-links">
              <h5>Company</h5>
              <a href="#">About</a>
              <a href="#">Careers</a>
              <a href="#">Blog</a>
              <a href="#">Contact</a>
            </div>
            <div className="footer-links">
              <h5>Legal</h5>
              <a href="#">Terms of Service</a>
              <a href="#">Privacy Policy</a>
              <a href="#">Disclaimer</a>
            </div>
          </div>
          <div className="footer-bottom">
            <p>© 2026 Nexora Exchange Pvt. Ltd. All rights reserved.</p>
            <p className="footer-disclaimer">Trading in startup securities involves high risk. Please read all terms and conditions before investing.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

const IoPersonOutline = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="1em" height="1em" fill="currentColor" {...props}>
    <path d="M344 144c-3.92 52.87-44 96-88 96s-84.15-43.12-88-96c-4-55 35-96 88-96s92 42 88 96z" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="32"/>
    <path d="M256 304c-87 0-175.3 48-191.64 138.6C62.39 453.52 68.57 464 80 464h352c11.44 0 17.62-10.48 15.65-21.4C431.3 352 343 304 256 304z" fill="none" stroke="currentColor" strokeMiterlimit="10" strokeWidth="32"/>
  </svg>
);

export default Landing;
