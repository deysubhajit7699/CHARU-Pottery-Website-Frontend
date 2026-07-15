import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import { FiUpload, FiX, FiSave } from 'react-icons/fi';
import './AdminProductFormPage.css';

const CLAY_TYPES = ['Stoneware', 'Earthenware', 'Porcelain', 'Terracotta', 'Bone China', 'Raku', 'Other'];
const TECHNIQUES = ['Wheel-thrown', 'Hand-built', 'Slip-cast', 'Coiled', 'Other'];
const GLAZE_TYPES = ['Matte', 'Glossy', 'Satin', 'Crystalline', 'Celadon', 'Unglazed', 'Other'];
const FIRING = ['Bisque', 'Glaze-fired', 'Raku-fired', 'Pit-fired', 'Wood-fired', 'Anagama'];

const initialForm = {
  name: '', description: '', shortDescription: '', price: '', discountPrice: '',
  stock: '', category: '', clayType: '', technique: '', glazeType: '',
  firingTechnique: '', careInstructions: '', processingTime: '5-7 business days',
  isFoodSafe: false, isMicrowaveSafe: false, isDishwasherSafe: false,
  isHandmade: true, isFeatured: false, isNewArrival: false, madeToOrder: false,
  'dimensions.height': '', 'dimensions.width': '', 'dimensions.diameter': '', 'dimensions.weight': '',
  'artisan.name': '', 'artisan.location': '', 'artisan.bio': '',
};

export default function AdminProductFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  const [form, setForm] = useState(initialForm);
  const [categories, setCategories] = useState([]);
  const [images, setImages] = useState([]); // existing image objects
  const [newImages, setNewImages] = useState([]); // File objects
  const [newImagePreviews, setNewImagePreviews] = useState([]);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(isEdit);

  useEffect(() => {
    api.get('/categories').then(({ data }) => setCategories(data.data || []));
  }, []);

  useEffect(() => {
    if (!isEdit) return;
    api.get(`/products/id/${id}`)
      .then(({ data }) => {
        const p = data.data;
        setForm({
          name: p.name || '', description: p.description || '', shortDescription: p.shortDescription || '',
          price: p.price || '', discountPrice: p.discountPrice || '',
          stock: p.stock || '', category: p.category?._id || '',
          clayType: p.clayType || '', technique: p.technique || '',
          glazeType: p.glazeType || '', firingTechnique: p.firingTechnique || '',
          careInstructions: p.careInstructions || '', processingTime: p.processingTime || '5-7 business days',
          isFoodSafe: p.isFoodSafe || false, isMicrowaveSafe: p.isMicrowaveSafe || false,
          isDishwasherSafe: p.isDishwasherSafe || false, isHandmade: p.isHandmade !== false,
          isFeatured: p.isFeatured || false, isNewArrival: p.isNewArrival || false,
          madeToOrder: p.madeToOrder || false,
          'dimensions.height': p.dimensions?.height || '', 'dimensions.width': p.dimensions?.width || '',
          'dimensions.diameter': p.dimensions?.diameter || '', 'dimensions.weight': p.dimensions?.weight || '',
          'artisan.name': p.artisan?.name || '', 'artisan.location': p.artisan?.location || '',
          'artisan.bio': p.artisan?.bio || '',
        });
        setImages(p.images || []);
      })
      .catch(() => toast.error('Failed to load product'))
      .finally(() => setLoading(false));
  }, [id, isEdit]);

  const set = (key, val) => setForm((prev) => ({ ...prev, [key]: val }));

  const handleImagePick = (e) => {
    const files = Array.from(e.target.files);
    setNewImages((prev) => [...prev, ...files]);
    const previews = files.map((f) => URL.createObjectURL(f));
    setNewImagePreviews((prev) => [...prev, ...previews]);
  };

  const removeExistingImage = (idx) => setImages((prev) => prev.filter((_, i) => i !== idx));
  const removeNewImage = (idx) => {
    setNewImages((prev) => prev.filter((_, i) => i !== idx));
    setNewImagePreviews((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.price || !form.stock) { toast.error('Name, price and stock are required'); return; }
    setSaving(true);
    try {
      const formData = new FormData();
      // Basic fields
      const fields = ['name', 'description', 'shortDescription', 'price', 'discountPrice', 'stock', 'category',
        'clayType', 'technique', 'glazeType', 'firingTechnique', 'careInstructions', 'processingTime'];
      fields.forEach((k) => { if (form[k] !== '') formData.append(k, form[k]); });

      // Booleans
      ['isFoodSafe', 'isMicrowaveSafe', 'isDishwasherSafe', 'isHandmade', 'isFeatured', 'isNewArrival', 'madeToOrder']
        .forEach((k) => formData.append(k, form[k]));

      // Dimensions & artisan
      ['dimensions.height', 'dimensions.width', 'dimensions.diameter', 'dimensions.weight',
       'artisan.name', 'artisan.location', 'artisan.bio']
        .forEach((k) => { if (form[k]) formData.append(k, form[k]); });

      // Existing images to keep
      formData.append('existingImages', JSON.stringify(images));

      // New images
      newImages.forEach((file) => formData.append('images', file));

      if (isEdit) {
        await api.put(`/products/${id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
        toast.success('Product updated!');
      } else {
        await api.post('/products', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
        toast.success('Product created!');
      }
      navigate('/admin/products');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save product');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="page-loader"><div className="spinner" /></div>;

  return (
    <div className="admin-product-form-page">
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title display">{isEdit ? 'Edit Product' : 'Add New Product'}</h1>
          <p className="admin-page-sub">{isEdit ? 'Update product details' : 'Create a new pottery listing'}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="apf-layout">
        {/* Main column */}
        <div className="apf-main">

          {/* Basic info */}
          <div className="apf-card">
            <h2 className="apf-card-title">Basic Information</h2>
            <div className="apf-grid">
              <div className="form-group span2">
                <label className="form-label">Product Name *</label>
                <input className="form-input" value={form.name} onChange={(e) => set('name', e.target.value)} required />
              </div>
              <div className="form-group span2">
                <label className="form-label">Short Description</label>
                <input className="form-input" value={form.shortDescription} onChange={(e) => set('shortDescription', e.target.value)} placeholder="1-2 line summary shown on cards" />
              </div>
              <div className="form-group span2">
                <label className="form-label">Full Description</label>
                <textarea className="form-input" rows={5} value={form.description} onChange={(e) => set('description', e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Category</label>
                <select className="form-input" value={form.category} onChange={(e) => set('category', e.target.value)}>
                  <option value="">— Select —</option>
                  {categories.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Processing Time</label>
                <input className="form-input" value={form.processingTime} onChange={(e) => set('processingTime', e.target.value)} />
              </div>
            </div>
          </div>

          {/* Pricing & Stock */}
          <div className="apf-card">
            <h2 className="apf-card-title">Pricing & Stock</h2>
            <div className="apf-grid">
              <div className="form-group">
                <label className="form-label">Price (₹) *</label>
                <input className="form-input" type="number" min="0" value={form.price} onChange={(e) => set('price', e.target.value)} required />
              </div>
              <div className="form-group">
                <label className="form-label">Discount Price (₹)</label>
                <input className="form-input" type="number" min="0" value={form.discountPrice} onChange={(e) => set('discountPrice', e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Stock Quantity *</label>
                <input className="form-input" type="number" min="0" value={form.stock} onChange={(e) => set('stock', e.target.value)} required />
              </div>
            </div>
          </div>

          {/* Craft details */}
          <div className="apf-card">
            <h2 className="apf-card-title">Craft Details</h2>
            <div className="apf-grid">
              {[
                { key: 'clayType', label: 'Clay Type', options: CLAY_TYPES },
                { key: 'technique', label: 'Technique', options: TECHNIQUES },
                { key: 'glazeType', label: 'Glaze Type', options: GLAZE_TYPES },
                { key: 'firingTechnique', label: 'Firing Technique', options: FIRING },
              ].map(({ key, label, options }) => (
                <div className="form-group" key={key}>
                  <label className="form-label">{label}</label>
                  <select className="form-input" value={form[key]} onChange={(e) => set(key, e.target.value)}>
                    <option value="">— Select —</option>
                    {options.map((o) => <option key={o} value={o}>{o}</option>)}
                  </select>
                </div>
              ))}
            </div>
          </div>

          {/* Dimensions */}
          <div className="apf-card">
            <h2 className="apf-card-title">Dimensions</h2>
            <div className="apf-grid">
              {[
                { key: 'dimensions.height', label: 'Height (cm)' },
                { key: 'dimensions.width', label: 'Width (cm)' },
                { key: 'dimensions.diameter', label: 'Diameter (cm)' },
                { key: 'dimensions.weight', label: 'Weight (g)' },
              ].map(({ key, label }) => (
                <div className="form-group" key={key}>
                  <label className="form-label">{label}</label>
                  <input className="form-input" type="number" min="0" value={form[key]} onChange={(e) => set(key, e.target.value)} />
                </div>
              ))}
            </div>
          </div>

          {/* Artisan */}
          <div className="apf-card">
            <h2 className="apf-card-title">Artisan Info</h2>
            <div className="apf-grid">
              <div className="form-group">
                <label className="form-label">Artisan Name</label>
                <input className="form-input" value={form['artisan.name']} onChange={(e) => set('artisan.name', e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Location</label>
                <input className="form-input" value={form['artisan.location']} onChange={(e) => set('artisan.location', e.target.value)} placeholder="e.g. Jaipur, Rajasthan" />
              </div>
              <div className="form-group span2">
                <label className="form-label">Bio</label>
                <textarea className="form-input" rows={3} value={form['artisan.bio']} onChange={(e) => set('artisan.bio', e.target.value)} />
              </div>
            </div>
          </div>

          {/* Care instructions */}
          <div className="apf-card">
            <h2 className="apf-card-title">Care Instructions</h2>
            <textarea className="form-input" rows={4} value={form.careInstructions} onChange={(e) => set('careInstructions', e.target.value)} placeholder="How to care for this piece…" />
          </div>
        </div>

        {/* Right column */}
        <div className="apf-sidebar">
          {/* Images */}
          <div className="apf-card">
            <h2 className="apf-card-title">Product Images</h2>
            <div className="image-grid">
              {images.map((img, i) => (
                <div key={i} className="image-preview">
                  <img src={img.url} alt={img.altText || ''} />
                  <button type="button" className="remove-img-btn" onClick={() => removeExistingImage(i)}><FiX size={13} /></button>
                </div>
              ))}
              {newImagePreviews.map((src, i) => (
                <div key={'new-' + i} className="image-preview new">
                  <img src={src} alt="preview" />
                  <button type="button" className="remove-img-btn" onClick={() => removeNewImage(i)}><FiX size={13} /></button>
                </div>
              ))}
              <label className="image-upload-btn">
                <FiUpload size={20} />
                <span>Add Images</span>
                <input type="file" accept="image/*" multiple onChange={handleImagePick} style={{ display: 'none' }} />
              </label>
            </div>
          </div>

          {/* Flags */}
          <div className="apf-card">
            <h2 className="apf-card-title">Properties</h2>
            <div className="flags-grid">
              {[
                { key: 'isHandmade', label: 'Handmade' },
                { key: 'isFoodSafe', label: 'Food Safe' },
                { key: 'isMicrowaveSafe', label: 'Microwave Safe' },
                { key: 'isDishwasherSafe', label: 'Dishwasher Safe' },
                { key: 'isFeatured', label: 'Featured' },
                { key: 'isNewArrival', label: 'New Arrival' },
                { key: 'madeToOrder', label: 'Made to Order' },
              ].map(({ key, label }) => (
                <label key={key} className="flag-toggle">
                  <input type="checkbox" checked={form[key]} onChange={(e) => set(key, e.target.checked)} />
                  <span className="flag-slider" />
                  <span className="flag-label">{label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Submit */}
          <button type="submit" className="btn btn-primary apf-submit" disabled={saving}>
            <FiSave size={16} /> {saving ? 'Saving…' : isEdit ? 'Update Product' : 'Create Product'}
          </button>
        </div>
      </form>
    </div>
  );
}
