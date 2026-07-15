import React, { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../api/axios';
import ProductCard from '../components/product/ProductCard';
import { FiFilter, FiX, FiChevronDown } from 'react-icons/fi';
import './ProductsPage.css';

const CLAY_TYPES = ['Stoneware', 'Earthenware', 'Porcelain', 'Terracotta', 'Bone China', 'Raku', 'Other'];
const TECHNIQUES = ['Wheel-thrown', 'Hand-built', 'Slip-cast', 'Coiled', 'Other'];
const SORT_OPTIONS = [
  { label: 'Newest', value: '-createdAt' },
  { label: 'Price: Low to High', value: 'price' },
  { label: 'Price: High to Low', value: '-price' },
  { label: 'Top Rated', value: '-ratingsAverage' },
  { label: 'Best Selling', value: '-soldCount' },
];

export default function ProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filterOpen, setFilterOpen] = useState(false);

  // Filter state from URL
  const keyword = searchParams.get('keyword') || '';
  const category = searchParams.get('category') || '';
  const clayType = searchParams.get('clayType') || '';
  const technique = searchParams.get('technique') || '';
  const sort = searchParams.get('sort') || '-createdAt';
  const isFeatured = searchParams.get('isFeatured') || '';
  const isNewArrival = searchParams.get('isNewArrival') || '';
  const priceMin = searchParams.get('price[gte]') || '';
  const priceMax = searchParams.get('price[lte]') || '';

  useEffect(() => {
    api.get('/categories').then(({ data }) => setCategories(data.data || []));
  }, []);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (keyword) params.set('keyword', keyword);
      if (category) params.set('category', category);
      if (clayType) params.set('clayType', clayType);
      if (technique) params.set('technique', technique);
      if (sort) params.set('sort', sort);
      if (isFeatured) params.set('isFeatured', isFeatured);
      if (isNewArrival) params.set('isNewArrival', isNewArrival);
      if (priceMin) params.set('price[gte]', priceMin);
      if (priceMax) params.set('price[lte]', priceMax);
      params.set('page', page);
      params.set('limit', 12);

      const { data } = await api.get(`/products?${params.toString()}`);
      setProducts(data.data || []);
      setTotal(data.total || 0);
      setTotalPages(data.pages || 1);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [keyword, category, clayType, technique, sort, isFeatured, isNewArrival, priceMin, priceMax, page]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const setFilter = (key, value) => {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value); else next.delete(key);
    next.delete('page');
    setPage(1);
    setSearchParams(next);
  };

  const clearAll = () => { setSearchParams({}); setPage(1); };

  const hasFilters = keyword || category || clayType || technique || isFeatured || isNewArrival || priceMin || priceMax;

  const skeletons = Array.from({ length: 8 });

  return (
    <div className="products-page">
      <div className="container">
        {/* Page header */}
        <div className="products-header">
          <div>
            <h1 className="display products-title">
              {keyword ? `Results for "${keyword}"` : 'Shop All Pottery'}
            </h1>
            {!loading && <p className="products-count">{total} pieces found</p>}
          </div>
          <div className="products-header-actions">
            <select
              className="sort-select"
              value={sort}
              onChange={(e) => setFilter('sort', e.target.value)}
            >
              {SORT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
            <button className="btn btn-outline filter-toggle" onClick={() => setFilterOpen(!filterOpen)}>
              <FiFilter size={15} /> Filters
            </button>
          </div>
        </div>

        <div className="products-layout">
          {/* Sidebar filters */}
          <aside className={`filters-sidebar${filterOpen ? ' open' : ''}`}>
            <div className="filters-header">
              <h3 className="filters-title">Filter</h3>
              {hasFilters && (
                <button onClick={clearAll} className="btn btn-ghost" style={{ fontSize: 12, padding: '4px 8px' }}>
                  <FiX size={13} /> Clear all
                </button>
              )}
            </div>

            {/* Category */}
            <FilterGroup title="Category">
              <div className="filter-options">
                <label className="filter-option">
                  <input type="radio" name="cat" value="" checked={!category} onChange={() => setFilter('category', '')} />
                  All
                </label>
                {categories.map((c) => (
                  <label key={c._id} className="filter-option">
                    <input type="radio" name="cat" value={c._id} checked={category === c._id} onChange={() => setFilter('category', c._id)} />
                    {c.name}
                  </label>
                ))}
              </div>
            </FilterGroup>

            {/* Clay type */}
            <FilterGroup title="Clay Type">
              <div className="filter-options">
                {CLAY_TYPES.map((t) => (
                  <label key={t} className="filter-option">
                    <input type="checkbox" checked={clayType === t} onChange={() => setFilter('clayType', clayType === t ? '' : t)} />
                    {t}
                  </label>
                ))}
              </div>
            </FilterGroup>

            {/* Technique */}
            <FilterGroup title="Technique">
              <div className="filter-options">
                {TECHNIQUES.map((t) => (
                  <label key={t} className="filter-option">
                    <input type="checkbox" checked={technique === t} onChange={() => setFilter('technique', technique === t ? '' : t)} />
                    {t}
                  </label>
                ))}
              </div>
            </FilterGroup>

            {/* Price range */}
            <FilterGroup title="Price Range (₹)">
              <div className="price-range">
                <input
                  type="number"
                  placeholder="Min"
                  value={priceMin}
                  className="form-input"
                  style={{ fontSize: 13 }}
                  onChange={(e) => setFilter('price[gte]', e.target.value)}
                />
                <span>—</span>
                <input
                  type="number"
                  placeholder="Max"
                  value={priceMax}
                  className="form-input"
                  style={{ fontSize: 13 }}
                  onChange={(e) => setFilter('price[lte]', e.target.value)}
                />
              </div>
            </FilterGroup>

            {/* Flags */}
            <FilterGroup title="Collections">
              <div className="filter-options">
                <label className="filter-option">
                  <input type="checkbox" checked={isFeatured === 'true'} onChange={() => setFilter('isFeatured', isFeatured === 'true' ? '' : 'true')} />
                  Featured
                </label>
                <label className="filter-option">
                  <input type="checkbox" checked={isNewArrival === 'true'} onChange={() => setFilter('isNewArrival', isNewArrival === 'true' ? '' : 'true')} />
                  New Arrivals
                </label>
              </div>
            </FilterGroup>
          </aside>

          {/* Product grid */}
          <div className="products-grid-area">
            {loading ? (
              <div className="products-grid">
                {skeletons.map((_, i) => (
                  <div key={i} className="card skeleton-card">
                    <div className="skeleton" style={{ height: 220 }} />
                    <div style={{ padding: 16 }}>
                      <div className="skeleton" style={{ height: 12, width: '50%', marginBottom: 10 }} />
                      <div className="skeleton" style={{ height: 18, marginBottom: 8 }} />
                      <div className="skeleton" style={{ height: 14, width: '40%' }} />
                    </div>
                  </div>
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="empty-state">
                <p className="display" style={{ fontSize: 24, color: 'var(--stone)' }}>No pieces found</p>
                <p style={{ color: 'var(--stone-light)', marginTop: 8 }}>Try adjusting your filters</p>
                <button className="btn btn-outline" style={{ marginTop: 20 }} onClick={clearAll}>Clear Filters</button>
              </div>
            ) : (
              <>
                <div className="products-grid">
                  {products.map((p) => <ProductCard key={p._id} product={p} />)}
                </div>
                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="pagination">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                      <button
                        key={p}
                        className={`page-btn${page === p ? ' active' : ''}`}
                        onClick={() => setPage(p)}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function FilterGroup({ title, children }) {
  const [open, setOpen] = useState(true);
  return (
    <div className="filter-group">
      <button className="filter-group-title" onClick={() => setOpen(!open)}>
        {title} <FiChevronDown size={15} style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
      </button>
      {open && <div className="filter-group-body">{children}</div>}
    </div>
  );
}
