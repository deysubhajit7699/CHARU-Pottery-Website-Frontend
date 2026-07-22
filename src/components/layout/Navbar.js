import React, { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { FiShoppingBag, FiHeart, FiUser, FiMenu, FiX, FiSearch, FiLogOut, FiPackage, FiSettings, FiHome, FiGrid } from 'react-icons/fi';
import './Navbar.css';

const MESSAGES = [
  '🚚 Free Shipping Above ₹999',
  '🏺 Handmade by Indian Artisans',
  '⭐ 20+ Years of Craftsmanship',
  '🪔 From Our Village Workshop to Your Home',
  '🇮🇳 Made in India',
];

/* Hand-drawn clay pot mark */
export function PotMark({ size = 30, color = 'currentColor' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round">
      <path d="M12 5h8M13 5c.5 2-.5 3.5-2.5 5C7.5 12.5 6 15.5 6 19c0 5 4.5 8 10 8s10-3 10-8c0-3.5-1.5-6.5-4.5-9-2-1.5-3-3-2.5-5" />
      <path d="M10 19c0 3 2.5 5 6 5" opacity=".55" />
      <path d="M9 13.5h14" opacity=".4" strokeDasharray="1.5 2.5" />
    </svg>
  );
}

export default function Navbar() {
  const { user, logout } = useAuth();
  const { cartCount } = useCart();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [search, setSearch] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const [msgIndex, setMsgIndex] = useState(0);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const t = setInterval(() => setMsgIndex((i) => (i + 1) % MESSAGES.length), 3500);
    return () => clearInterval(t);
  }, []);

  const handleLogout = async () => {
    await logout();
    setUserOpen(false);
    navigate('/');
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (search.trim()) {
      navigate(`/products?keyword=${encodeURIComponent(search.trim())}`);
      setSearch('');
      setSearchOpen(false);
    }
  };

  const navClass = ({ isActive }) => (isActive ? 'nav-link active' : 'nav-link');

  return (
    <>
      {/* Announcement bar */}
      <div className="announce-bar">
        <span key={msgIndex} className="announce-msg">{MESSAGES[msgIndex]}</span>
      </div>

      <header className={`navbar${scrolled ? ' scrolled' : ''}`}>
        {/* Top row: hamburger | logo | actions */}
        <div className="container navbar-top">
          <button className="hamburger" onClick={() => setMenuOpen(!menuOpen)} aria-label="Menu">
            {menuOpen ? <FiX size={22} /> : <FiMenu size={22} />}
          </button>

          <Link to="/" className="navbar-logo">
            <span className="logo-mark"><PotMark size={34} /></span>
            <span className="logo-stack">
              <span className="logo-text display">CHARU</span>
              <span className="logo-tag">Handcrafted Pottery</span>
            </span>
          </Link>

          <div className="navbar-actions">
            <button className="action-btn" onClick={() => setSearchOpen(!searchOpen)} aria-label="Search">
              <FiSearch size={19} />
            </button>
            {user && (
              <Link to="/wishlist" className="action-btn hide-mobile" aria-label="Wishlist">
                <FiHeart size={19} />
              </Link>
            )}
            <Link to="/cart" className="action-btn cart-btn" aria-label="Cart">
              <FiShoppingBag size={19} />
              {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
            </Link>
            {user ? (
              <div className="user-menu-wrap">
                <button className="action-btn" onClick={() => setUserOpen(!userOpen)} aria-label="Account">
                  {user.avatar?.url
                    ? <img src={user.avatar.url} alt={user.name} className="avatar-sm" />
                    : <FiUser size={19} />}
                </button>
                {userOpen && (
                  <div className="user-dropdown">
                    <div className="dropdown-header">
                      <p className="dropdown-name">{user.name}</p>
                      <p className="dropdown-email">{user.email}</p>
                    </div>
                    <hr className="divider" style={{ margin: '8px 0' }} />
                    <Link to="/profile" className="dropdown-item" onClick={() => setUserOpen(false)}>
                      <FiSettings size={14} /> Profile
                    </Link>
                    <Link to="/my-orders" className="dropdown-item" onClick={() => setUserOpen(false)}>
                      <FiPackage size={14} /> My Orders
                    </Link>
                    {user.role === 'admin' && (
                      <Link to="/admin" className="dropdown-item" onClick={() => setUserOpen(false)}>
                        <FiSettings size={14} /> Admin Panel
                      </Link>
                    )}
                    <hr className="divider" style={{ margin: '8px 0' }} />
                    <button className="dropdown-item logout" onClick={handleLogout}>
                      <FiLogOut size={14} /> Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link to="/login" className="btn btn-primary signin-btn">Sign In</Link>
            )}
          </div>
        </div>

        {/* Nav row */}
        <nav className="navbar-links">
          <NavLink to="/products" end className={navClass}>Shop All</NavLink>
          <NavLink to="/products?isNewArrival=true" className={() => 'nav-link'}>New Arrivals</NavLink>
          <NavLink to="/products?isFeatured=true" className={() => 'nav-link'}>Bestsellers</NavLink>
          <Link to="/collections" className="nav-link">Category</Link>
          <Link to="/contact" className="nav-link">Contact</Link>
        </nav>

        {/* Search bar */}
        {searchOpen && (
          <div className="search-bar">
            <form onSubmit={handleSearch} className="search-form container">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search pottery, clay art, terracotta…"
                className="search-input"
                autoFocus
              />
              <button type="submit" className="btn btn-primary" style={{ padding: '11px 22px' }}>Search</button>
            </form>
          </div>
        )}

        {/* Mobile slide menu */}
        <div className={`mobile-menu${menuOpen ? ' open' : ''}`}>
          <NavLink to="/" end className="mobile-link" onClick={() => setMenuOpen(false)}>Home</NavLink>
          <NavLink to="/products" className="mobile-link" onClick={() => setMenuOpen(false)}>Shop All</NavLink>
          <NavLink to="/products?isNewArrival=true" className="mobile-link" onClick={() => setMenuOpen(false)}>New Arrivals</NavLink>
          <NavLink to="/products?isFeatured=true" className="mobile-link" onClick={() => setMenuOpen(false)}>Bestsellers</NavLink>
          <Link to="/collections" className="mobile-link" onClick={() => setMenuOpen(false)}>Category</Link>
          <Link to="/contact" className="mobile-link" onClick={() => setMenuOpen(false)}>Contact</Link>
          {user ? (
            <button className="mobile-link" onClick={handleLogout} style={{ textAlign: 'left', width: '100%', color: 'var(--error)' }}>Sign Out</button>
          ) : (
            <NavLink to="/login" className="mobile-link" onClick={() => setMenuOpen(false)}>Sign In</NavLink>
          )}
        </div>
      </header>

      {/* Mobile sticky bottom nav */}
      <nav className="bottom-nav">
        <NavLink to="/" end className={({ isActive }) => `bottom-link${isActive ? ' active' : ''}`}>
          <FiHome size={20} /><span>Home</span>
        </NavLink>
        <NavLink to="/products" className={({ isActive }) => `bottom-link${isActive ? ' active' : ''}`}>
          <FiGrid size={20} /><span>Shop</span>
        </NavLink>
        <NavLink to="/wishlist" className={({ isActive }) => `bottom-link${isActive ? ' active' : ''}`}>
          <FiHeart size={20} /><span>Wishlist</span>
        </NavLink>
        <NavLink to="/cart" className={({ isActive }) => `bottom-link${isActive ? ' active' : ''}`}>
          <span className="bottom-cart">
            <FiShoppingBag size={20} />
            {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
          </span>
          <span>Cart</span>
        </NavLink>
        <NavLink to={user ? '/profile' : '/login'} className={({ isActive }) => `bottom-link${isActive ? ' active' : ''}`}>
          <FiUser size={20} /><span>Profile</span>
        </NavLink>
      </nav>
    </>
  );
}
