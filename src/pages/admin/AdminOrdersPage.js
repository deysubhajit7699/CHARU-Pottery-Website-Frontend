import React, { useEffect, useState, useCallback } from 'react';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import { FiChevronDown, FiSearch } from 'react-icons/fi';
import './AdminOrdersPage.css';

const STATUS_OPTIONS = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];
const STATUS_COLOR = {
  Pending: '#E65100', Processing: '#1565C0', Shipped: '#6A1B9A',
  Delivered: '#2E7D32', Cancelled: '#C62828',
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [expanded, setExpanded] = useState(null);
  const [statusUpdating, setStatusUpdating] = useState(null);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 10, sort: '-createdAt' });
      if (statusFilter) params.set('orderStatus', statusFilter);
      const { data } = await api.get(`/orders?${params}`);
      setOrders(data.data || []);
      setTotalPages(data.pages || 1);
      setTotal(data.total || 0);
    } catch { toast.error('Failed to load orders'); }
    finally { setLoading(false); }
  }, [page, statusFilter]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  const handleStatusChange = async (orderId, newStatus, tracking = '', carrier = '') => {
    setStatusUpdating(orderId);
    try {
      const { data } = await api.put(`/orders/${orderId}/status`, { orderStatus: newStatus, trackingNumber: tracking, carrier });
      setOrders((prev) => prev.map((o) => o._id === orderId ? data.data : o));
      toast.success(`Status updated to ${newStatus}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update status');
    } finally {
      setStatusUpdating(null);
    }
  };

  const filtered = search
    ? orders.filter((o) =>
        o._id.toLowerCase().includes(search.toLowerCase()) ||
        o.user?.name?.toLowerCase().includes(search.toLowerCase()) ||
        o.user?.email?.toLowerCase().includes(search.toLowerCase()))
    : orders;

  return (
    <div className="admin-orders">
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title display">Orders</h1>
          <p className="admin-page-sub">{total} total orders</p>
        </div>
      </div>

      {/* Filters */}
      <div className="orders-filters">
        <div className="admin-search-bar" style={{ flex: 1 }}>
          <FiSearch size={16} color="var(--stone-light)" />
          <input type="text" placeholder="Search by order ID or customer…" value={search} onChange={(e) => setSearch(e.target.value)} className="admin-search-input" />
        </div>
        <select className="status-filter-select" value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}>
          <option value="">All Statuses</option>
          {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {/* Orders list */}
      <div className="orders-list-admin">
        {loading ? (
          <div className="page-loader"><div className="spinner" /></div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--stone-light)' }}>No orders found</div>
        ) : (
          filtered.map((order) => (
            <div key={order._id} className={`order-row${expanded === order._id ? ' expanded' : ''}`}>
              {/* Header */}
              <div className="order-row-header" onClick={() => setExpanded(expanded === order._id ? null : order._id)}>
                <div className="order-row-id">
                  <span className="mono">#{order._id.slice(-8).toUpperCase()}</span>
                  <span className="order-row-date">{new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                </div>
                <div className="order-row-customer">
                  <p className="order-customer-name">{order.user?.name || '—'}</p>
                  <p className="order-customer-email">{order.user?.email || ''}</p>
                </div>
                <div className="order-row-amount">₹{order.totalPrice?.toLocaleString('en-IN')}</div>
                <div>
                  <span className="status-pill" style={{ background: (STATUS_COLOR[order.orderStatus] || 'var(--stone)') + '22', color: STATUS_COLOR[order.orderStatus] || 'var(--stone)' }}>
                    {order.orderStatus}
                  </span>
                </div>
                <FiChevronDown size={16} color="var(--stone-light)" style={{ transform: expanded === order._id ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
              </div>

              {/* Expanded detail */}
              {expanded === order._id && (
                <div className="order-row-detail">
                  {/* Items */}
                  <div className="order-detail-section">
                    <p className="order-detail-label">Items</p>
                    <div className="order-detail-items">
                      {order.orderItems?.map((item, i) => (
                        <div key={i} className="order-detail-item">
                          <img src={item.image} alt={item.name} />
                          <span>{item.name}</span>
                          <span>×{item.quantity}</span>
                          <span>₹{(item.price * item.quantity)?.toLocaleString('en-IN')}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Shipping */}
                  <div className="order-detail-section">
                    <p className="order-detail-label">Ship to</p>
                    <p className="order-detail-addr">
                      {order.shippingAddress?.fullName} · {order.shippingAddress?.street}, {order.shippingAddress?.city}, {order.shippingAddress?.state} {order.shippingAddress?.postalCode}
                    </p>
                    <p className="order-detail-addr">{order.shippingAddress?.phone}</p>
                  </div>

                  {/* Breakdown */}
                  <div className="order-detail-section">
                    <p className="order-detail-label">Breakdown</p>
                    <div className="order-breakdown">
                      <span>Subtotal: ₹{order.itemsPrice?.toLocaleString('en-IN')}</span>
                      <span>Tax: ₹{order.taxPrice?.toLocaleString('en-IN')}</span>
                      <span>Shipping: {order.shippingPrice === 0 ? 'Free' : `₹${order.shippingPrice}`}</span>
                      {order.discountAmount > 0 && <span>Discount: -₹{order.discountAmount?.toLocaleString('en-IN')}</span>}
                    </div>
                  </div>

                  {/* Status update */}
                  <div className="order-detail-section">
                    <p className="order-detail-label">Update Status</p>
                    <StatusUpdateForm
                      order={order}
                      onUpdate={handleStatusChange}
                      loading={statusUpdating === order._id}
                    />
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="pagination" style={{ marginTop: 20 }}>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button key={p} className={`page-btn${page === p ? ' active' : ''}`} onClick={() => setPage(p)}>{p}</button>
          ))}
        </div>
      )}
    </div>
  );
}

function StatusUpdateForm({ order, onUpdate, loading }) {
  const [status, setStatus] = useState(order.orderStatus);
  const [tracking, setTracking] = useState(order.trackingNumber || '');
  const [carrier, setCarrier] = useState(order.carrier || '');

  return (
    <div className="status-update-form">
      <select className="form-input" value={status} onChange={(e) => setStatus(e.target.value)} style={{ fontSize: 13 }}>
        {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
      </select>
      {(status === 'Shipped' || status === 'Delivered') && (
        <>
          <input className="form-input" placeholder="Tracking Number" value={tracking} onChange={(e) => setTracking(e.target.value)} style={{ fontSize: 13 }} />
          <input className="form-input" placeholder="Carrier (e.g. BlueDart)" value={carrier} onChange={(e) => setCarrier(e.target.value)} style={{ fontSize: 13 }} />
        </>
      )}
      <button
        className="btn btn-primary"
        style={{ padding: '9px 18px', fontSize: 13 }}
        onClick={() => onUpdate(order._id, status, tracking, carrier)}
        disabled={loading || status === order.orderStatus}
      >
        {loading ? 'Updating…' : 'Update'}
      </button>
    </div>
  );
}
