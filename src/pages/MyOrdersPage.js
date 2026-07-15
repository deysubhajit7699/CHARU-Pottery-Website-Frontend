import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { FiPackage, FiChevronRight } from 'react-icons/fi';
import './MyOrdersPage.css';

const STATUS_COLOR = {
  Pending: 'badge-clay',
  Processing: 'badge-clay',
  Shipped: 'badge-success',
  Delivered: 'badge-success',
  Cancelled: 'badge-error',
};

export default function MyOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/orders/my-orders')
      .then(({ data }) => setOrders(data.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="page-loader"><div className="spinner" /></div>;

  return (
    <div className="myorders-page">
      <div className="container">
        <h1 className="myorders-title display">My Orders</h1>

        {orders.length === 0 ? (
          <div className="myorders-empty">
            <FiPackage size={52} color="var(--stone-light)" />
            <h2 className="display" style={{ fontSize: 26, marginTop: 16 }}>No orders yet</h2>
            <p style={{ color: 'var(--stone-light)', marginTop: 8 }}>Your pottery purchases will appear here.</p>
            <Link to="/products" className="btn btn-primary" style={{ marginTop: 24 }}>Shop Now</Link>
          </div>
        ) : (
          <div className="orders-list">
            {orders.map((order) => (
              <Link key={order._id} to={`/my-orders/${order._id}`} className="order-card">
                <div className="order-card-left">
                  <div className="order-thumbs">
                    {order.orderItems?.slice(0, 3).map((item, i) => (
                      <img key={i} src={item.image} alt={item.name} className="order-thumb" />
                    ))}
                  </div>
                  <div className="order-info">
                    <p className="order-id">Order #{order._id.slice(-8).toUpperCase()}</p>
                    <p className="order-date">{new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                    <p className="order-items-count">
                      {order.orderItems?.length} item{order.orderItems?.length !== 1 ? 's' : ''} · ₹{order.totalPrice?.toLocaleString('en-IN')}
                    </p>
                  </div>
                </div>
                <div className="order-card-right">
                  <span className={`badge ${STATUS_COLOR[order.orderStatus] || 'badge-clay'}`}>{order.orderStatus}</span>
                  <FiChevronRight size={18} color="var(--stone-light)" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
