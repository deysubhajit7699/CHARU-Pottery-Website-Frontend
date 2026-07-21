import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import ProductCard from '../components/product/ProductCard';
import './CollectionsPage.css';

const SECTION_ORDER = ['Wall Mounted', 'Spiritual', 'Vases and Pots', 'Table Lamp', 'Wild Life', 'Tribal Faces', 'Others'];

export default function CollectionsPage() {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.get('/categories'), api.get('/products?limit=100')])
      .then(([catRes, prodRes]) => {
        setCategories(catRes.data.data || []);
        setProducts(prodRes.data.data || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="page-loader"><div className="spinner" /></div>;

  const ordered = [...categories].sort(
    (a, b) => SECTION_ORDER.indexOf(a.name) - SECTION_ORDER.indexOf(b.name)
  );

  return (
    <div className="collections-page">
      <div className="container">
        <div className="collections-hero">
          <p className="hindi-accent">Every collection tells a story</p>
          <h1 className="section-title display">Our Collections</h1>
          <div className="ornament"><span /></div>
        </div>

        {ordered.map((cat) => {
          const items = products.filter((p) => p.category?._id === cat._id);
          return (
            <section key={cat._id} className="collection-section" id={cat.slug || cat._id}>
              <div className="section-header">
                <div>
                  <h2 className="collection-title display">{cat.name}</h2>
                  <p className="collection-count">{items.length} {items.length === 1 ? 'piece' : 'pieces'}</p>
                </div>
                {items.length > 0 && (
                  <Link to={`/products?category=${cat._id}`} className="btn btn-outline">View All</Link>
                )}
              </div>
              {items.length > 0 ? (
                <div className="product-grid">
                  {items.slice(0, 4).map((p) => <ProductCard key={p._id} product={p} />)}
                </div>
              ) : (
                <p className="collection-empty">New pieces coming soon from the workshop…</p>
              )}
            </section>
          );
        })}
      </div>
    </div>
  );
}
