import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { FiMapPin, FiCreditCard, FiTruck, FiCheck } from 'react-icons/fi';
import './CheckoutPage.css';

const STEPS = ['Address', 'Payment', 'Review'];

export default function CheckoutPage() {
  const { user } = useAuth();
  const { cart, cartTotal, clearCart } = useCart();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [placing, setPlacing] = useState(false);

  const defaultAddr = user?.addresses?.find((a) => a.isDefault) || user?.addresses?.[0];

  const [address, setAddress] = useState({
    fullName: user?.name || '',
    street: defaultAddr?.street || '',
    city: defaultAddr?.city || '',
    state: defaultAddr?.state || '',
    postalCode: defaultAddr?.postalCode || '',
    country: defaultAddr?.country || 'India',
    phone: defaultAddr?.phone || user?.phone || '',
  });
  const [paymentMethod, setPaymentMethod] = useState('COD');
  const [addrErrors, setAddrErrors] = useState({});

  const items = cart?.items || [];
  const tax = Math.round(cartTotal * 0.05 * 100) / 100;
  const shipping = cartTotal > 2000 ? 0 : 99;
  const total = cartTotal + tax + shipping;

  const validateAddress = () => {
    const e = {};
    if (!address.fullName) e.fullName = 'Required';
    if (!address.street) e.street = 'Required';
    if (!address.city) e.city = 'Required';
    if (!address.state) e.state = 'Required';
    if (!address.postalCode) e.postalCode = 'Required';
    if (!address.phone) e.phone = 'Required';
    return e;
  };

  const handleNextStep = () => {
    if (step === 0) {
      const e = validateAddress();
      if (Object.keys(e).length) { setAddrErrors(e); return; }
    }
    setStep((s) => Math.min(s + 1, 2));
  };

  const handlePlaceOrder = async () => {
    if (items.length === 0) { toast.error('Cart is empty'); return; }
    setPlacing(true);
    try {
      const { data } = await api.post('/orders', {
        shippingAddress: address,
        paymentMethod,
        paymentResult: paymentMethod === 'COD' ? null : { status: 'pending' },
      });
      toast.success('Order placed successfully!');
      navigate(`/order-success/${data.data._id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to place order');
    } finally {
      setPlacing(false);
    }
  };

  const set = (k, v) => { setAddress((p) => ({ ...p, [k]: v })); setAddrErrors((p) => ({ ...p, [k]: '' })); };

  if (items.length === 0) {
    navigate('/cart'); return null;
  }

  return (
    <div className="checkout-page">
      <div className="container">
        <h1 className="checkout-title display">Checkout</h1>

        {/* Step indicator */}
        <div className="steps-bar">
          {STEPS.map((s, i) => (
            <div key={s} className={`step-item${i <= step ? ' done' : ''}${i === step ? ' active' : ''}`}>
              <div className="step-circle">{i < step ? <FiCheck size={14} /> : i + 1}</div>
              <span className="step-label">{s}</span>
              {i < STEPS.length - 1 && <div className="step-line" />}
            </div>
          ))}
        </div>

        <div className="checkout-layout">
          <div className="checkout-main">
            {/* Step 0: Address */}
            {step === 0 && (
              <div className="checkout-section">
                <h2 className="checkout-section-title"><FiMapPin size={18} /> Shipping Address</h2>

                {/* Saved addresses */}
                {user?.addresses?.length > 0 && (
                  <div className="saved-addresses">
                    <p className="saved-label">Saved addresses</p>
                    <div className="saved-list">
                      {user.addresses.map((addr, i) => (
                        <button key={i} className="saved-addr-btn" onClick={() => setAddress({
                          fullName: user.name, street: addr.street, city: addr.city,
                          state: addr.state, postalCode: addr.postalCode,
                          country: addr.country, phone: addr.phone,
                        })}>
                          <strong>{addr.label}</strong>
                          <span>{addr.street}, {addr.city}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="addr-grid">
                  <Field label="Full Name" value={address.fullName} onChange={(v) => set('fullName', v)} error={addrErrors.fullName} span2 />
                  <Field label="Street Address" value={address.street} onChange={(v) => set('street', v)} error={addrErrors.street} span2 />
                  <Field label="City" value={address.city} onChange={(v) => set('city', v)} error={addrErrors.city} />
                  <Field label="State" value={address.state} onChange={(v) => set('state', v)} error={addrErrors.state} />
                  <Field label="Postal Code" value={address.postalCode} onChange={(v) => set('postalCode', v)} error={addrErrors.postalCode} type="number" />
                  <Field label="Phone" value={address.phone} onChange={(v) => set('phone', v)} error={addrErrors.phone} type="tel" />
                  <Field label="Country" value={address.country} onChange={(v) => set('country', v)} />
                </div>
                <button className="btn btn-primary step-next" onClick={handleNextStep}>Continue to Payment</button>
              </div>
            )}

            {/* Step 1: Payment */}
            {step === 1 && (
              <div className="checkout-section">
                <h2 className="checkout-section-title"><FiCreditCard size={18} /> Payment Method</h2>
                <div className="payment-options">
                  {[
                    { value: 'COD', label: 'Cash on Delivery', desc: 'Pay when your order arrives', icon: '💵' },
                    { value: 'UPI', label: 'UPI', desc: 'Google Pay, PhonePe, Paytm', icon: '📱' },
                    { value: 'Stripe', label: 'Credit / Debit Card', desc: 'Powered by Stripe — secure payment', icon: '💳' },
                  ].map((opt) => (
                    <label key={opt.value} className={`payment-option${paymentMethod === opt.value ? ' selected' : ''}`}>
                      <input type="radio" name="payment" value={opt.value} checked={paymentMethod === opt.value} onChange={() => setPaymentMethod(opt.value)} />
                      <span className="payment-icon">{opt.icon}</span>
                      <div>
                        <p className="payment-label">{opt.label}</p>
                        <p className="payment-desc">{opt.desc}</p>
                      </div>
                    </label>
                  ))}
                </div>
                {paymentMethod === 'Stripe' && (
                  <div className="stripe-note">
                    <FiCreditCard size={14} />
                    Card payment flow is powered by Stripe. Your card details are never stored on our servers.
                  </div>
                )}
                <div className="step-btns">
                  <button className="btn btn-outline" onClick={() => setStep(0)}>Back</button>
                  <button className="btn btn-primary" onClick={() => setStep(2)}>Review Order</button>
                </div>
              </div>
            )}

            {/* Step 2: Review */}
            {step === 2 && (
              <div className="checkout-section">
                <h2 className="checkout-section-title"><FiCheck size={18} /> Review Order</h2>
                <div className="review-blocks">
                  <div className="review-block">
                    <div className="review-block-header">
                      <p className="review-block-title">Shipping to</p>
                      <button className="btn btn-ghost" style={{ fontSize: 12 }} onClick={() => setStep(0)}>Edit</button>
                    </div>
                    <p>{address.fullName}</p>
                    <p>{address.street}, {address.city}, {address.state} {address.postalCode}</p>
                    <p>{address.country} · {address.phone}</p>
                  </div>
                  <div className="review-block">
                    <div className="review-block-header">
                      <p className="review-block-title">Payment</p>
                      <button className="btn btn-ghost" style={{ fontSize: 12 }} onClick={() => setStep(1)}>Edit</button>
                    </div>
                    <p>{paymentMethod}</p>
                  </div>
                </div>

                <div className="review-items">
                  {items.map((item) => (
                    <div key={item.product} className="review-item">
                      <img src={item.image} alt={item.name} />
                      <div>
                        <p className="review-item-name">{item.name}</p>
                        <p className="review-item-qty">Qty: {item.quantity}</p>
                      </div>
                      <p className="review-item-price">₹{(item.price * item.quantity).toLocaleString('en-IN')}</p>
                    </div>
                  ))}
                </div>

                <div className="step-btns">
                  <button className="btn btn-outline" onClick={() => setStep(1)}>Back</button>
                  <button className="btn btn-primary" onClick={handlePlaceOrder} disabled={placing}>
                    {placing ? 'Placing order…' : `Place Order · ₹${total.toLocaleString('en-IN')}`}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Order summary sidebar */}
          <div className="checkout-sidebar">
            <h3 className="summary-title">Order Summary</h3>
            <div className="sidebar-items">
              {items.map((item) => (
                <div key={item.product} className="sidebar-item">
                  <span className="sidebar-item-name">{item.name} <span className="sidebar-item-qty">×{item.quantity}</span></span>
                  <span>₹{(item.price * item.quantity).toLocaleString('en-IN')}</span>
                </div>
              ))}
            </div>
            <hr className="divider" />
            <div className="sidebar-totals">
              <div className="sidebar-row"><span>Subtotal</span><span>₹{cartTotal.toLocaleString('en-IN')}</span></div>
              <div className="sidebar-row"><span>Tax (5%)</span><span>₹{tax.toLocaleString('en-IN')}</span></div>
              <div className="sidebar-row"><span>Shipping</span><span>{shipping === 0 ? 'Free' : `₹${shipping}`}</span></div>
              <hr className="divider" />
              <div className="sidebar-row total"><span>Total</span><span>₹{total.toLocaleString('en-IN')}</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({ label, value, onChange, error, type = 'text', span2 }) {
  return (
    <div className={`form-group${span2 ? ' span2' : ''}`}>
      <label className="form-label">{label}</label>
      <input type={type} className={`form-input${error ? ' error' : ''}`} value={value} onChange={(e) => onChange(e.target.value)} />
      {error && <span className="form-error">{error}</span>}
    </div>
  );
}
