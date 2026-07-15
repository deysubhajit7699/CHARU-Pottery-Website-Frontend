import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { FiUser, FiLock, FiMapPin, FiPlus, FiTrash2, FiCamera } from 'react-icons/fi';
import './ProfilePage.css';

const TABS = ['Profile', 'Addresses', 'Password'];

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const [tab, setTab] = useState('Profile');
  const [saving, setSaving] = useState(false);

  // Profile form
  const [profile, setProfile] = useState({ name: user?.name || '', phone: user?.phone || '' });

  // Password form
  const [pwd, setPwd] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [pwdErrors, setPwdErrors] = useState({});

  // Address form
  const [addresses, setAddresses] = useState(user?.addresses || []);
  const [newAddr, setNewAddr] = useState({ label: 'Home', street: '', city: '', state: '', postalCode: '', country: 'India', phone: '' });
  const [showAddrForm, setShowAddrForm] = useState(false);

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data } = await api.put('/auth/update-profile', profile);
      updateUser(data.data);
      toast.success('Profile updated!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update');
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('avatar', file);
    try {
      const { data } = await api.put('/auth/update-avatar', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      updateUser(data.data);
      toast.success('Avatar updated!');
    } catch {
      toast.error('Failed to upload avatar');
    }
  };

  const handlePasswordSave = async (e) => {
    e.preventDefault();
    const errs = {};
    if (!pwd.currentPassword) errs.currentPassword = 'Required';
    if (pwd.newPassword.length < 6) errs.newPassword = 'Min. 6 characters';
    if (pwd.newPassword !== pwd.confirmPassword) errs.confirmPassword = 'Passwords do not match';
    if (Object.keys(errs).length) { setPwdErrors(errs); return; }
    setSaving(true);
    try {
      await api.put('/auth/change-password', { currentPassword: pwd.currentPassword, newPassword: pwd.newPassword });
      toast.success('Password changed successfully!');
      setPwd({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setPwdErrors({});
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change password');
    } finally {
      setSaving(false);
    }
  };

  const handleAddAddress = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data } = await api.post('/auth/address', newAddr);
      setAddresses(data.data);
      updateUser({ addresses: data.data });
      setShowAddrForm(false);
      setNewAddr({ label: 'Home', street: '', city: '', state: '', postalCode: '', country: 'India', phone: '' });
      toast.success('Address added!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add address');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAddress = async (idx) => {
    try {
      const { data } = await api.delete(`/auth/address/${idx}`);
      setAddresses(data.data);
      updateUser({ addresses: data.data });
      toast.success('Address removed');
    } catch {
      toast.error('Failed to remove address');
    }
  };

  return (
    <div className="profile-page">
      <div className="container">
        <h1 className="profile-title display">My Profile</h1>

        <div className="profile-layout">
          {/* Sidebar */}
          <aside className="profile-sidebar">
            <div className="profile-avatar-wrap">
              <img
                src={user?.avatar?.url || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'U')}&background=C9875A&color=fff`}
                alt={user?.name}
                className="profile-avatar"
              />
              <label className="avatar-upload-btn" title="Change photo">
                <FiCamera size={14} />
                <input type="file" accept="image/*" onChange={handleAvatarUpload} style={{ display: 'none' }} />
              </label>
            </div>
            <p className="profile-name display">{user?.name}</p>
            <p className="profile-email">{user?.email}</p>
            <nav className="profile-nav">
              {TABS.map((t) => (
                <button key={t} className={`profile-nav-btn${tab === t ? ' active' : ''}`} onClick={() => setTab(t)}>
                  {t === 'Profile' && <FiUser size={15} />}
                  {t === 'Addresses' && <FiMapPin size={15} />}
                  {t === 'Password' && <FiLock size={15} />}
                  {t}
                </button>
              ))}
            </nav>
          </aside>

          {/* Content */}
          <div className="profile-content">
            {/* Profile tab */}
            {tab === 'Profile' && (
              <div className="profile-card">
                <h2 className="profile-card-title">Personal Information</h2>
                <form onSubmit={handleProfileSave} className="profile-form">
                  <div className="form-group">
                    <label className="form-label">Full Name</label>
                    <input className="form-input" value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Email Address</label>
                    <input className="form-input" value={user?.email} disabled style={{ opacity: 0.6 }} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Phone Number</label>
                    <input className="form-input" type="tel" value={profile.phone} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Account Role</label>
                    <input className="form-input" value={user?.role} disabled style={{ opacity: 0.6, textTransform: 'capitalize' }} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Member Since</label>
                    <input className="form-input" value={new Date(user?.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })} disabled style={{ opacity: 0.6 }} />
                  </div>
                  <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving…' : 'Save Changes'}</button>
                </form>
              </div>
            )}

            {/* Addresses tab */}
            {tab === 'Addresses' && (
              <div className="profile-card">
                <div className="profile-card-header">
                  <h2 className="profile-card-title">Saved Addresses</h2>
                  <button className="btn btn-outline" style={{ fontSize: 12, padding: '8px 16px' }} onClick={() => setShowAddrForm(!showAddrForm)}>
                    <FiPlus size={14} /> Add New
                  </button>
                </div>

                {showAddrForm && (
                  <form onSubmit={handleAddAddress} className="addr-form">
                    <div className="addr-form-grid">
                      <div className="form-group">
                        <label className="form-label">Label</label>
                        <select className="form-input" value={newAddr.label} onChange={(e) => setNewAddr({ ...newAddr, label: e.target.value })}>
                          <option>Home</option><option>Work</option><option>Other</option>
                        </select>
                      </div>
                      <div className="form-group span2">
                        <label className="form-label">Street Address</label>
                        <input className="form-input" value={newAddr.street} onChange={(e) => setNewAddr({ ...newAddr, street: e.target.value })} required />
                      </div>
                      <div className="form-group">
                        <label className="form-label">City</label>
                        <input className="form-input" value={newAddr.city} onChange={(e) => setNewAddr({ ...newAddr, city: e.target.value })} required />
                      </div>
                      <div className="form-group">
                        <label className="form-label">State</label>
                        <input className="form-input" value={newAddr.state} onChange={(e) => setNewAddr({ ...newAddr, state: e.target.value })} required />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Postal Code</label>
                        <input className="form-input" value={newAddr.postalCode} onChange={(e) => setNewAddr({ ...newAddr, postalCode: e.target.value })} required />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Phone</label>
                        <input className="form-input" type="tel" value={newAddr.phone} onChange={(e) => setNewAddr({ ...newAddr, phone: e.target.value })} />
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
                      <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving…' : 'Save Address'}</button>
                      <button type="button" className="btn btn-ghost" onClick={() => setShowAddrForm(false)}>Cancel</button>
                    </div>
                  </form>
                )}

                {addresses.length === 0 && !showAddrForm ? (
                  <p style={{ color: 'var(--stone-light)', fontSize: 14, marginTop: 16 }}>No saved addresses yet.</p>
                ) : (
                  <div className="addr-list">
                    {addresses.map((addr, i) => (
                      <div key={i} className="addr-item">
                        <div>
                          <span className="addr-label-badge">{addr.label}</span>
                          <p className="addr-text">{addr.street}, {addr.city}, {addr.state} {addr.postalCode}</p>
                          <p className="addr-text">{addr.country} · {addr.phone}</p>
                        </div>
                        <button className="btn btn-ghost" style={{ color: 'var(--error)' }} onClick={() => handleDeleteAddress(i)}>
                          <FiTrash2 size={15} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Password tab */}
            {tab === 'Password' && (
              <div className="profile-card">
                <h2 className="profile-card-title">Change Password</h2>
                <form onSubmit={handlePasswordSave} className="profile-form">
                  {[
                    { key: 'currentPassword', label: 'Current Password' },
                    { key: 'newPassword', label: 'New Password' },
                    { key: 'confirmPassword', label: 'Confirm New Password' },
                  ].map(({ key, label }) => (
                    <div className="form-group" key={key}>
                      <label className="form-label">{label}</label>
                      <input
                        type="password"
                        className={`form-input${pwdErrors[key] ? ' error' : ''}`}
                        value={pwd[key]}
                        onChange={(e) => { setPwd({ ...pwd, [key]: e.target.value }); setPwdErrors({ ...pwdErrors, [key]: '' }); }}
                      />
                      {pwdErrors[key] && <span className="form-error">{pwdErrors[key]}</span>}
                    </div>
                  ))}
                  <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving…' : 'Update Password'}</button>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
