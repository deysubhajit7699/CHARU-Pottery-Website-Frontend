import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { FiPackage, FiMapPin, FiCreditCard, FiAlertCircle } from 'react-icons/fi';
import './OrderDetailPage.css';

const STATUS_STEPS = ['Pending', 'Processing', 'Shipped', 'Delivered'];

export default function OrderDetailPage() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    api.get(`/orders/${id}`)
      .then(({ data }) => setOrder(data.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  const handleCancel = async () => {
    if (!window.confirm('Are you sure you want to cancel this order?')) return;
    setCancelling(true);
    try {
      const { data } = await api.put(`/orders/${id}/cancel`, { reason: 'Cancelled by customer' });
      setOrder(data.data);
      toast.success('Order cancelled');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to cancel');
    } finally {
      setCancelling(false);
    }
  };

  if (loading) return <div className="page-loader"><div className="spinner" /></div>;
  if (!order) return <div className="container section"><p>Order not found. <Link to="/my-orders">Back to orders</Link></p></div>;

  const currentStep = STATUS_STEPS.indexOf(order.orderStatus);
  const isCancelled = order.orderStatus === 'Cancelled';
  const canCancel = ['Pending', 'Processing'].includes(order.orderStatus);

  return (
    <div className="orderdetail-page">
      <div className="container">
        <div className="orderdetail-header">
          <div>
            <Link to="/my-orders" className="back-link">← My Orders</Link>
            <h1 className="display orderdetail-title">
              Order #{order._id.slice(-8).toUpperCase()}
            </h1>
            <p className="orderdetail-date">
              Placed on {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          </div>
          {canCancel && (
            <button className="btn btn-outline" style={{ borderColor: 'var(--error)', color: 'var(--error)' }} onClick={handleCancel} disabled={cancelling}>
              <FiAlertCircle size={15} /> {cancelling ? 'Cancelling…' : 'Cancel Order'}
            </button>
          )}
        </div>

        {/* Status tracker */}
        {!isCancelled ? (
          <div className="status-tracker">
            {STATUS_STEPS.map((s, i) => (
              <div key={s} className={`tracker-step${i <= currentStep ? ' done' : ''}${i === currentStep ? ' active' : ''}`}>
                <div className="tracker-circle">
                  {i < currentStep ? '✓' : i + 1}
                </div>
                <span className="tracker-label">{s}</span>
                {i < STATUS_STEPS.length - 1 && <div className="tracker-line" />}
              </div>
            ))}
          </div>
        ) : (
          <div className="cancelled-banner">
            <FiAlertCircle size={18} /> Order Cancelled
            {order.cancelReason && <span> · {order.cancelReason}</span>}
          </div>
        )}

        {/* Tracking info */}
        {order.trackingNumber && (
          <div className="tracking-info">
            <FiPackage size={15} /> Tracking: <strong>{order.trackingNumber}</strong>
            {order.carrier && <span> via {order.carrier}</span>}
          </div>
        )}

        <div className="orderdetail-grid">
          {/* Items */}
          <div className="orderdetail-main">
            <div className="od-section">
              <h3 className="od-section-title">Items Ordered</h3>
              {order.orderItems?.map((item, i) => (
                <div key={i} className="od-item">
                  <img src={item.image} alt={item.name} className="od-item-img" />
                  <div className="od-item-info">
                    <p className="od-item-name">{item.name}</p>
                    <p className="od-item-qty">Quantity: {item.quantity}</p>
                    <p className="od-item-price">₹{item.price?.toLocaleString('en-IN')} each</p>
                  </div>
                  <p className="od-item-total">₹{(item.price * item.quantity)?.toLocaleString('en-IN')}</p>
                </div>
              ))}
            </div>

            {/* Status history */}
            {order.statusHistory?.length > 0 && (
              <div className="od-section">
                <h3 className="od-section-title">Status History</h3>
                <div className="status-history">
                  {[...order.statusHistory].reverse().map((h, i) => (
                    <div key={i} className="history-item">
                      <div className="history-dot" />
                      <div>
                        <p className="history-status">{h.status}</p>
                        {h.note && <p className="history-note">{h.note}</p>}
                        <p className="history-date">{new Date(h.changedAt).toLocaleString('en-IN')}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="orderdetail-sidebar">
            <div className="od-info-card">
              <h3 className="od-info-title"><FiMapPin size={15} /> Shipping Address</h3>
              <p>{order.shippingAddress?.fullName}</p>
              <p>{order.shippingAddress?.street}</p>
              <p>{order.shippingAddress?.city}, {order.shippingAddress?.state} {order.shippingAddress?.postalCode}</p>
              <p>{order.shippingAddress?.country}</p>
              <p>{order.shippingAddress?.phone}</p>
            </div>

            <div className="od-info-card">
              <h3 className="od-info-title"><FiCreditCard size={15} /> Payment</h3>
              <p>{order.paymentMethod}</p>
              <p style={{ color: order.isPaid ? 'var(--success)' : 'var(--error)', fontWeight: 500, marginTop: 4 }}>
                {order.isPaid ? `Paid on ${new Date(order.paidAt).toLocaleDateString('en-IN')}` : 'Payment pending'}
              </p>
            </div>

            <div className="od-info-card">
              <h3 className="od-info-title">Order Summary</h3>
              <div className="od-totals">
                <div className="od-total-row"><span>Subtotal</span><span>₹{order.itemsPrice?.toLocaleString('en-IN')}</span></div>
                <div className="od-total-row"><span>Tax</span><span>₹{order.taxPrice?.toLocaleString('en-IN')}</span></div>
                <div className="od-total-row"><span>Shipping</span><span>{order.shippingPrice === 0 ? 'Free' : `₹${order.shippingPrice}`}</span></div>
                {order.discountAmount > 0 && (
                  <div className="od-total-row" style={{ color: 'var(--success)' }}><span>Discount</span><span>-₹{order.discountAmount?.toLocaleString('en-IN')}</span></div>
                )}
                <hr className="divider" />
                <div className="od-total-row grand"><span>Total</span><span>₹{order.totalPrice?.toLocaleString('en-IN')}</span></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
