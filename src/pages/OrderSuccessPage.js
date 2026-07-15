import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/axios';
import { FiCheckCircle, FiPackage, FiHome } from 'react-icons/fi';
import './OrderSuccessPage.css';

export default function OrderSuccessPage() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/orders/${id}`)
      .then(({ data }) => setOrder(data.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="page-loader"><div className="spinner" /></div>;

  return (
    <div className="success-page">
      <div className="success-card">
        <div className="success-icon"><FiCheckCircle size={56} /></div>
        <h1 className="display success-title">Order Confirmed!</h1>
        <p className="success-sub">
          Thank you for your purchase. Your handcrafted pottery is on its way to being prepared with care.
        </p>

        {order && (
          <div className="success-details">
            <div className="success-row">
              <span>Order ID</span>
              <span className="mono">#{order._id.slice(-8).toUpperCase()}</span>
            </div>
            <div className="success-row">
              <span>Payment</span>
              <span>{order.paymentMethod} · {order.isPaid ? 'Paid' : 'Pay on Delivery'}</span>
            </div>
            <div className="success-row">
              <span>Total</span>
              <span style={{ fontWeight: 700 }}>₹{order.totalPrice?.toLocaleString('en-IN')}</span>
            </div>
            <div className="success-row">
              <span>Shipping to</span>
              <span>{order.shippingAddress?.city}, {order.shippingAddress?.state}</span>
            </div>
            <div className="success-row">
              <span>Status</span>
              <span className="badge badge-clay">{order.orderStatus}</span>
            </div>
          </div>
        )}

        {order && (
          <div className="success-items">
            {order.orderItems?.map((item, i) => (
              <div key={i} className="success-item">
                <img src={item.image} alt={item.name} />
                <div>
                  <p className="success-item-name">{item.name}</p>
                  <p className="success-item-qty">Qty: {item.quantity} · ₹{(item.price * item.quantity).toLocaleString('en-IN')}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="success-actions">
          <Link to={`/my-orders/${id}`} className="btn btn-primary">
            <FiPackage size={16} /> Track Order
          </Link>
          <Link to="/products" className="btn btn-outline">
            <FiHome size={16} /> Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}
