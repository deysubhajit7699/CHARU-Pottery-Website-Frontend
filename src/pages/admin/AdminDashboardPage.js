import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import { FiShoppingBag, FiPackage, FiDollarSign, FiTrendingUp, FiAlertCircle } from 'react-icons/fi';
import './AdminDashboardPage.css';

const STATUS_COLOR = {
  Pending: '#E65100',
  Processing: '#1565C0',
  Shipped: '#6A1B9A',
  Delivered: '#2E7D32',
  Cancelled: '#C62828',
};

export default function AdminDashboardPage() {
  const [analytics, setAnalytics] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [lowStock, setLowStock] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [analyticsRes, ordersRes, stockRes] = await Promise.all([
          api.get('/orders/analytics/summary'),
          api.get('/orders?limit=6&sort=-createdAt'),
          api.get('/products?stock[lte]=5&limit=5&sort=stock'),
        ]);
        setAnalytics(analyticsRes.data.data);
        setRecentOrders(ordersRes.data.data || []);
        setLowStock(stockRes.data.data || []);
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    load();
  }, []);

  if (loading) return <div className="page-loader"><div className="spinner" /></div>;

  const stats = [
    { label: 'Total Revenue', value: `₹${analytics?.totalRevenue?.toLocaleString('en-IN') || 0}`, Icon: FiDollarSign, color: '#B65A2F' },
    { label: 'Total Orders', value: analytics?.totalOrders || 0, Icon: FiPackage, color: '#1565C0' },
    { label: 'Avg Order Value', value: `₹${Math.round(analytics?.avgOrderValue || 0).toLocaleString('en-IN')}`, Icon: FiTrendingUp, color: '#2E7D32' },
    { label: 'Pending Orders', value: analytics?.statusCounts?.find((s) => s._id === 'Pending')?.count || 0, Icon: FiShoppingBag, color: '#E65100' },
  ];

  return (
    <div className="admin-dashboard">
      <div className="admin-page-header">
        <h1 className="admin-page-title display">Dashboard</h1>
        <p className="admin-page-sub">Welcome back! Here's what's happening.</p>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        {stats.map((s) => (
          <div key={s.label} className="stat-card">
            <div className="stat-icon" style={{ background: s.color + '18', color: s.color }}>
              <s.Icon size={22} />
            </div>
            <div>
              <p className="stat-value">{s.value}</p>
              <p className="stat-label">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Status breakdown */}
      {analytics?.statusCounts?.length > 0 && (
        <div className="dashboard-section">
          <h2 className="dash-section-title">Order Status Breakdown</h2>
          <div className="status-breakdown">
            {analytics.statusCounts.map((s) => (
              <div key={s._id} className="status-chip">
                <span className="status-dot" style={{ background: STATUS_COLOR[s._id] || 'var(--stone)' }} />
                <span className="status-name">{s._id}</span>
                <span className="status-count">{s.count}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="dashboard-cols">
        {/* Recent orders */}
        <div className="dashboard-section">
          <div className="dash-section-header">
            <h2 className="dash-section-title">Recent Orders</h2>
            <Link to="/admin/orders" className="btn btn-ghost" style={{ fontSize: 12 }}>View All</Link>
          </div>
          <div className="recent-orders-table">
            <div className="table-head">
              <span>Order</span><span>Customer</span><span>Amount</span><span>Status</span>
            </div>
            {recentOrders.map((o) => (
              <div key={o._id} className="table-row">
                <span className="mono">#{o._id.slice(-6).toUpperCase()}</span>
                <span>{o.user?.name || '—'}</span>
                <span>₹{o.totalPrice?.toLocaleString('en-IN')}</span>
                <span>
                  <span className="status-pill" style={{ background: (STATUS_COLOR[o.orderStatus] || 'var(--stone)') + '22', color: STATUS_COLOR[o.orderStatus] || 'var(--stone)' }}>
                    {o.orderStatus}
                  </span>
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Low stock */}
        <div className="dashboard-section">
          <div className="dash-section-header">
            <h2 className="dash-section-title"><FiAlertCircle size={16} color="#E65100" /> Low Stock</h2>
            <Link to="/admin/products" className="btn btn-ghost" style={{ fontSize: 12 }}>Manage</Link>
          </div>
          {lowStock.length === 0 ? (
            <p style={{ color: 'var(--stone-light)', fontSize: 14 }}>All products are well stocked ✓</p>
          ) : (
            <div className="low-stock-list">
              {lowStock.map((p) => (
                <div key={p._id} className="low-stock-item">
                  <img src={p.images?.[0]?.url} alt={p.name} className="low-stock-img" />
                  <div>
                    <p className="low-stock-name">{p.name}</p>
                    <p className="low-stock-qty" style={{ color: p.stock === 0 ? 'var(--error)' : '#E65100' }}>
                      {p.stock === 0 ? 'Out of stock' : `${p.stock} left`}
                    </p>
                  </div>
                  <Link to={`/admin/products/${p._id}/edit`} className="btn btn-ghost" style={{ fontSize: 12, marginLeft: 'auto' }}>Edit</Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
