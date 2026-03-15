import { useState } from 'react';
import { mockOrders, formatINR, formatDateTime, getStatusBadgeClass } from '../../data/mockData';
import './InvestorPages.css';

const Orders = () => {
  const [tab, setTab] = useState('all');
  const orders = mockOrders;

  const filtered = tab === 'all' ? orders
    : tab === 'active' ? orders.filter((o) => ['PENDING', 'PARTIALLY_FILLED'].includes(o.status))
    : orders.filter((o) => ['EXECUTED', 'CANCELLED'].includes(o.status));

  return (
    <div className="page-container animate-fade-in">
      <div className="page-header">
        <h1 className="page-title">Orders</h1>
      </div>

      <div className="tabs">
        <button className={`tab ${tab === 'all' ? 'active' : ''}`} onClick={() => setTab('all')}>All Orders ({orders.length})</button>
        <button className={`tab ${tab === 'active' ? 'active' : ''}`} onClick={() => setTab('active')}>Active ({orders.filter(o => ['PENDING', 'PARTIALLY_FILLED'].includes(o.status)).length})</button>
        <button className={`tab ${tab === 'history' ? 'active' : ''}`} onClick={() => setTab('history')}>History ({orders.filter(o => ['EXECUTED', 'CANCELLED'].includes(o.status)).length})</button>
      </div>

      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>Type</th>
              <th>Stock</th>
              <th>Price Type</th>
              <th>Quantity</th>
              <th>Filled</th>
              <th>Price</th>
              <th>Total</th>
              <th>Status</th>
              <th>Date</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((o) => (
              <tr key={o.id}>
                <td><span className={`badge ${getStatusBadgeClass(o.order_type)}`}>{o.order_type}</span></td>
                <td className="mono" style={{ fontWeight: 600 }}>{o.symbol}</td>
                <td><span className={`badge ${getStatusBadgeClass(o.price_type)}`}>{o.price_type}</span></td>
                <td className="mono tabular-nums">{o.quantity}</td>
                <td className="mono tabular-nums">{o.filled_quantity}</td>
                <td className="mono tabular-nums">₹{o.price.toFixed(2)}</td>
                <td className="mono tabular-nums">{formatINR(o.total_value)}</td>
                <td><span className={`badge ${getStatusBadgeClass(o.status)}`}>{o.status}</span></td>
                <td style={{ fontSize: '0.8rem' }}>{formatDateTime(o.createdAt)}</td>
                <td>
                  {o.status === 'PENDING' && (
                    <button className="btn btn-danger btn-sm">Cancel</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filtered.length === 0 && (
        <div className="empty-state"><p>No orders found</p></div>
      )}
    </div>
  );
};

export default Orders;
