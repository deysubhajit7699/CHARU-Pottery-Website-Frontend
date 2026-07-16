import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import { FiPlus, FiEdit2, FiTrash2, FiSearch, FiStar } from 'react-icons/fi';
import './AdminProductsPage.css';

export default function AdminProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [deleting, setDeleting] = useState(null);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 10, sort: '-createdAt' });
      if (search) params.set('keyword', search);
      const { data } = await api.get(`/products?${params}`);
      setProducts(data.data || []);
      setTotalPages(data.pages || 1);
      setTotal(data.total || 0);
    } catch { toast.error('Failed to load products'); }
    finally { setLoading(false); }
  }, [page, search]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete "${name}"? This cannot be undone.`)) return;
    setDeleting(id);
    try {
      await api.delete(`/products/${id}`);
      toast.success('Product deleted');
      fetchProducts();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete');
    } finally {
      setDeleting(null);
    }
  };

  const handleToggleFeatured = async (id, current) => {
    try {
      await api.put(`/products/${id}`, { isFeatured: !current });
      setProducts((prev) => prev.map((p) => p._id === id ? { ...p, isFeatured: !current } : p));
      toast.success(current ? 'Removed from featured' : 'Added to featured');
    } catch { toast.error('Failed'); }
  };

  return (
    <div className="admin-products">
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title display">Products</h1>
          <p className="admin-page-sub">{total} total products</p>
        </div>
        <Link to="/admin/products/new" className="btn btn-primary">
          <FiPlus size={16} /> Add Product
        </Link>
      </div>

      {/* Search */}
      <div className="admin-search-bar">
        <FiSearch size={16} color="var(--stone-light)" />
        <input
          type="text"
          placeholder="Search products…"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          className="admin-search-input"
        />
      </div>

      {/* Table */}
      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Product</th>
              <th>Category</th>
              <th>Price</th>
              <th>Stock</th>
              <th>Featured</th>
              <th>Rating</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <tr key={i}>
                  {Array.from({ length: 7 }).map((_, j) => (
                    <td key={j}><div className="skeleton" style={{ height: 16, borderRadius: 4 }} /></td>
                  ))}
                </tr>
              ))
            ) : products.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: '40px', color: 'var(--stone-light)' }}>
                  No products found
                </td>
              </tr>
            ) : (
              products.map((p) => (
                <tr key={p._id}>
                  <td>
                    <div className="product-cell">
                      <img src={p.images?.[0]?.url || '/placeholder.jpg'} alt={p.name} className="product-cell-img" />
                      <div>
                        <p className="product-cell-name">{p.name}</p>
                        <p className="product-cell-clay">{p.clayType}</p>
                      </div>
                    </div>
                  </td>
                  <td className="td-sm">{p.category?.name || '—'}</td>
                  <td className="td-sm">
                    <span>₹{(p.discountPrice || p.price)?.toLocaleString('en-IN')}</span>
                    {p.discountPrice && <span className="original-price">₹{p.price?.toLocaleString('en-IN')}</span>}
                  </td>
                  <td className="td-sm">
                    <span className={`stock-badge${p.stock === 0 ? ' out' : p.stock <= 5 ? ' low' : ''}`}>
                      {p.stock}
                    </span>
                  </td>
                  <td className="td-sm">
                    <button
                      className={`featured-toggle${p.isFeatured ? ' on' : ''}`}
                      onClick={() => handleToggleFeatured(p._id, p.isFeatured)}
                      title={p.isFeatured ? 'Remove from featured' : 'Mark as featured'}
                    >
                      <FiStar size={15} fill={p.isFeatured ? 'currentColor' : 'none'} />
                    </button>
                  </td>
                  <td className="td-sm">
                    {p.ratingsQuantity > 0 ? `${p.ratingsAverage} (${p.ratingsQuantity})` : '—'}
                  </td>
                  <td>
                    <div className="action-btns">
                      <Link to={`/admin/products/${p._id}/edit`} className="action-btn-icon edit" title="Edit">
                        <FiEdit2 size={15} />
                      </Link>
                      <button
                        className="action-btn-icon delete"
                        onClick={() => handleDelete(p._id, p.name)}
                        disabled={deleting === p._id}
                        title="Delete"
                      >
                        <FiTrash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="pagination" style={{ marginTop: 20 }}>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button key={p} className={`page-btn${page === p ? ' active' : ''}`} onClick={() => setPage(p)}>{p}</button>
          ))}
        </div>
      )}
    </div>
  );
}
