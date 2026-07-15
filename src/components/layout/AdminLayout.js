import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FiGrid, FiPackage, FiShoppingBag, FiLogOut, FiMenu, FiX } from 'react-icons/fi';
import './AdminLayout.css';

const navItems = [
  { to: '/admin', label: 'Dashboard', Icon: FiGrid, end: true },
  { to: '/admin/products', label: 'Products', Icon: FiShoppingBag },
  { to: '/admin/orders', label: 'Orders', Icon: FiPackage },
];

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <div className={`admin-layout${sidebarOpen ? '' : ' collapsed'}`}>
      <aside className="admin-sidebar">
        <div className="sidebar-header">
          <span className="sidebar-logo display">🏺 Admin</span>
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="sidebar-toggle">
            {sidebarOpen ? <FiX size={18} /> : <FiMenu size={18} />}
          </button>
        </div>
        <nav className="sidebar-nav">
          {navItems.map(({ to, label, Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}
            >
              <Icon size={18} />
              {sidebarOpen && <span>{label}</span>}
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-footer">
          {sidebarOpen && <p className="sidebar-user">{user?.name}</p>}
          <button onClick={handleLogout} className="sidebar-link logout">
            <FiLogOut size={18} />
            {sidebarOpen && <span>Sign Out</span>}
          </button>
        </div>
      </aside>
      <main className="admin-main">
        <Outlet />
      </main>
    </div>
  );
}
