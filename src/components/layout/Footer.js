import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiInstagram, FiFacebook, FiYoutube, FiTwitter, FiSend } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { PotMark } from './Navbar';
import './Footer.css';

export default function Footer() {
  const [email, setEmail] = useState('');

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    toast.success('Thank you for subscribing!');
    setEmail('');
  };

  return (
    <footer className="footer" id="contact">
      <div className="village-divider light" style={{ marginTop: 28 }} aria-hidden="true" />
      <div className="container footer-inner">
        <div className="footer-brand">
          <span className="footer-logo">
            <PotMark size={30} />
            <span className="footer-logo-stack">
              <span className="footer-logo-text display">CHARU</span>
              <span className="footer-logo-tag">Handcrafted Pottery</span>
            </span>
          </span>
          <p className="footer-tagline">
            Crafting handmade clay art for over two decades. Every piece carries the
            soul of Indian pottery traditions, shaped by experienced hands.
          </p>
          <div className="footer-social">
            <a href="https://instagram.com" target="_blank" rel="noreferrer" aria-label="Instagram"><FiInstagram size={17} /></a>
            <a href="https://facebook.com" target="_blank" rel="noreferrer" aria-label="Facebook"><FiFacebook size={17} /></a>
            <a href="https://youtube.com" target="_blank" rel="noreferrer" aria-label="YouTube"><FiYoutube size={17} /></a>
            <a href="https://twitter.com" target="_blank" rel="noreferrer" aria-label="Twitter"><FiTwitter size={17} /></a>
          </div>
        </div>

        <div className="footer-links-group">
          <h4 className="footer-heading">Company</h4>
          <ul>
            <li><Link to="/#story">Artisan Story</Link></li>
            <li><Link to="/products">Shop All</Link></li>
            <li><a href="mailto:hello@charu.in">Contact Us</a></li>
          </ul>
        </div>

        <div className="footer-links-group">
          <h4 className="footer-heading">Collections</h4>
          <ul>
            <li><Link to="/products?isNewArrival=true">New Arrivals</Link></li>
            <li><Link to="/products?isFeatured=true">Bestsellers</Link></li>
            <li><Link to="/products?clayType=Terracotta">Terracotta</Link></li>
            <li><Link to="/products?clayType=Stoneware">Stoneware</Link></li>
          </ul>
        </div>

        <div className="footer-links-group">
          <h4 className="footer-heading">Support</h4>
          <ul>
            <li><Link to="/my-orders">My Orders</Link></li>
            <li><Link to="/wishlist">Wishlist</Link></li>
            <li><span>Free shipping above ₹999</span></li>
            <li><span>Secure payments</span></li>
          </ul>
        </div>

        <div className="footer-links-group footer-newsletter">
          <h4 className="footer-heading">Newsletter</h4>
          <p>Stories from the workshop, new collections & artisan offers.</p>
          <form className="newsletter-form" onSubmit={handleSubscribe}>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Your email address"
              aria-label="Email address"
              required
            />
            <button type="submit" aria-label="Subscribe"><FiSend size={16} /></button>
          </form>
        </div>
      </div>

      <div className="footer-bottom">
        <div className="container footer-bottom-inner">
          <p>© {new Date().getFullYear()} CHARU. All rights reserved.</p>
          <div className="footer-payments">
            <span>Visa</span><span>Mastercard</span><span>UPI</span><span>RuPay</span><span>COD</span>
          </div>
          <p className="made-in-india">Handmade in India 🇮🇳</p>
        </div>
      </div>
    </footer>
  );
}
