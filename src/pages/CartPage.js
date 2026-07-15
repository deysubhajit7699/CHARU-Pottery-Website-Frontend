import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import toast from 'react-hot-toast';
import { FiTrash2, FiPlus, FiMinus, FiShoppingBag, FiArrowRight } from 'react-icons/fi';
import './CartPage.css';

export default function CartPage() {
  const { cart, cartLoading, updateCartItem, removeFromCart, clearCart, cartTotal } = useCart();
  const navigate = useNavigate();

  const items = cart?.items || [];

  const handleQty = async (productId, qty) => {
    if (qty < 1) return;
    try { await updateCartItem(productId, qty); }
    catch (e) { toast.error(e.response?.data?.message || 'Failed to update'); }
  };

  const handleRemove = async (productId) => {
    try { await removeFromCart(productId); toast.success('Item removed'); }
    catch { toast.error('Failed to remove'); }
  };

  const handleClear = async () => {
    try { await clearCart(); toast.success('Cart cleared'); }
    catch { toast.error('Failed to clear cart'); }
  };

  const tax = Math.round(cartTotal * 0.05 * 100) / 100;
  const shipping = cartTotal > 2000 ? 0 : 99;
  const total = cartTotal + tax + shipping;

  if (cartLoading) return <div className="page-loader"><div className="spinner" /></div>;

  return (
    <div className="cart-page">
      <div className="container">
        <h1 className="cart-title display">Your Cart</h1>

        {items.length === 0 ? (
          <div className="cart-empty">
            <FiShoppingBag size={56} color="var(--stone-light)" />
            <h2 className="display" style={{ fontSize: 28, marginTop: 16 }}>Your cart is empty</h2>
            <p style={{ color: 'var(--stone-light)', marginTop: 8 }}>Discover handcrafted pottery worth bringing home.</p>
            <Link to="/products" className="btn btn-primary" style={{ marginTop: 24 }}>Shop Now</Link>
          </div>
        ) : (
          <div className="cart-layout">
            {/* Items */}
            <div className="cart-items">
              <div className="cart-items-header">
                <span>{items.length} item{items.length !== 1 ? 's' : ''}</span>
                <button className="btn btn-ghost" style={{ fontSize: 12, padding: '4px 8px' }} onClick={handleClear}>
                  <FiTrash2 size={13} /> Clear all
                </button>
              </div>

              {items.map((item) => (
                <div key={item.product} className="cart-item">
                  <Link to={`/products/${item.slug || item.product}`}>
                    <img src={item.image} alt={item.name} className="cart-item-img" />
                  </Link>
                  <div className="cart-item-info">
                    <Link to={`/products/${item.slug || item.product}`} className="cart-item-name display">{item.name}</Link>
                    <p className="cart-item-price">₹{item.price.toLocaleString('en-IN')} each</p>
                    <div className="cart-item-actions">
                      <div className="qty-control">
                        <button onClick={() => handleQty(item.product, item.quantity - 1)} disabled={item.quantity <= 1}><FiMinus size={14} /></button>
                        <span>{item.quantity}</span>
                        <button onClick={() => handleQty(item.product, item.quantity + 1)}><FiPlus size={14} /></button>
                      </div>
                      <button className="remove-btn" onClick={() => handleRemove(item.product)}><FiTrash2 size={15} /></button>
                    </div>
                  </div>
                  <div className="cart-item-total">
                    ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                  </div>
                </div>
              ))}
            </div>

            {/* Summary */}
            <div className="cart-summary">
              <h3 className="summary-title">Order Summary</h3>
              <div className="summary-rows">
                <div className="summary-row"><span>Subtotal</span><span>₹{cartTotal.toLocaleString('en-IN')}</span></div>
                <div className="summary-row"><span>Tax (5% GST)</span><span>₹{tax.toLocaleString('en-IN')}</span></div>
                <div className="summary-row">
                  <span>Shipping</span>
                  <span>{shipping === 0 ? <span style={{ color: 'var(--success)' }}>Free</span> : `₹${shipping}`}</span>
                </div>
                {cartTotal < 2000 && (
                  <p className="free-shipping-hint">Add ₹{(2000 - cartTotal).toLocaleString('en-IN')} more for free shipping</p>
                )}
                <hr className="divider" />
                <div className="summary-row total"><span>Total</span><span>₹{total.toLocaleString('en-IN')}</span></div>
              </div>
              <button className="btn btn-primary checkout-btn" onClick={() => navigate('/checkout')}>
                Proceed to Checkout <FiArrowRight size={16} />
              </button>
              <Link to="/products" className="btn btn-ghost continue-btn">Continue Shopping</Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
