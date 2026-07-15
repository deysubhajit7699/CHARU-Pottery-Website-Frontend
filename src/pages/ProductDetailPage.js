import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/axios';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import ProductCard from '../components/product/ProductCard';
import toast from 'react-hot-toast';
import { FiHeart, FiShoppingBag, FiStar, FiPackage, FiDroplet, FiThermometer, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import './ProductDetailPage.css';

export default function ProductDetailPage() {
  const { slug } = useParams();
  const { addToCart } = useCart();
  const { user } = useAuth();
  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const [imgIdx, setImgIdx] = useState(0);
  const [tab, setTab] = useState('details');
  const [reviewText, setReviewText] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewSubmitting, setReviewSubmitting] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setImgIdx(0);
      try {
        const { data } = await api.get(`/products/${slug}`);
        setProduct(data.data);
        const [relRes, revRes] = await Promise.all([
          api.get(`/products/${data.data._id}/related`),
          api.get(`/products/${data.data._id}/reviews`),
        ]);
        setRelated(relRes.data.data || []);
        setReviews(revRes.data.data || []);
      } catch { } finally { setLoading(false); }
    };
    load();
  }, [slug]);

  const handleAddToCart = async () => {
    if (!user) { toast.error('Please sign in'); return; }
    try {
      await addToCart(product._id, qty);
      toast.success('Added to cart!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    }
  };

  const handleWishlist = async () => {
    if (!user) { toast.error('Please sign in'); return; }
    try {
      await api.put(`/auth/wishlist/${product._id}`);
      toast.success('Wishlist updated!');
    } catch { toast.error('Failed'); }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!user) { toast.error('Please sign in to leave a review'); return; }
    setReviewSubmitting(true);
    try {
      await api.post(`/products/${product._id}/reviews`, { rating: reviewRating, comment: reviewText });
      toast.success('Review submitted!');
      setReviewText('');
      setReviewRating(5);
      const { data } = await api.get(`/products/${product._id}/reviews`);
      setReviews(data.data || []);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit review');
    } finally {
      setReviewSubmitting(false);
    }
  };

  if (loading) return <div className="page-loader"><div className="spinner" /></div>;
  if (!product) return <div className="container" style={{ padding: '60px 0', textAlign: 'center' }}>Product not found. <Link to="/products">Back to shop</Link></div>;

  const finalPrice = product.discountPrice || product.price;
  const hasDiscount = product.discountPrice && product.discountPrice < product.price;
  const images = product.images || [];

  return (
    <div className="product-detail-page">
      <div className="container">
        {/* Breadcrumb */}
        <nav className="breadcrumb">
          <Link to="/">Home</Link> <span>/</span>
          <Link to="/products">Shop</Link> <span>/</span>
          <span>{product.name}</span>
        </nav>

        <div className="product-detail-grid">
          {/* Gallery */}
          <div className="gallery">
            <div className="gallery-main">
              {images.length > 0 ? (
                <img src={images[imgIdx]?.url} alt={images[imgIdx]?.altText || product.name} className="gallery-main-img" />
              ) : (
                <div className="gallery-placeholder" />
              )}
              {images.length > 1 && (
                <>
                  <button className="gallery-arrow prev" onClick={() => setImgIdx((imgIdx - 1 + images.length) % images.length)}>
                    <FiChevronLeft size={20} />
                  </button>
                  <button className="gallery-arrow next" onClick={() => setImgIdx((imgIdx + 1) % images.length)}>
                    <FiChevronRight size={20} />
                  </button>
                </>
              )}
            </div>
            {images.length > 1 && (
              <div className="gallery-thumbs">
                {images.map((img, i) => (
                  <button key={i} className={`gallery-thumb${imgIdx === i ? ' active' : ''}`} onClick={() => setImgIdx(i)}>
                    <img src={img.url} alt={img.altText || ''} />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="product-info">
            {product.category?.name && (
              <Link to={`/products?category=${product.category._id}`} className="product-info-category">
                {product.category.name}
              </Link>
            )}
            <h1 className="product-info-name display">{product.name}</h1>

            {/* Rating */}
            {product.ratingsQuantity > 0 && (
              <div className="product-info-rating">
                {'★'.repeat(Math.round(product.ratingsAverage))}{'☆'.repeat(5 - Math.round(product.ratingsAverage))}
                <span>{product.ratingsAverage} ({product.ratingsQuantity} reviews)</span>
              </div>
            )}

            {/* Price */}
            <div className="product-info-price">
              <span className="price-big">₹{finalPrice.toLocaleString('en-IN')}</span>
              {hasDiscount && <span className="price-struck">₹{product.price.toLocaleString('en-IN')}</span>}
            </div>

            <p className="product-info-desc">{product.shortDescription || product.description?.slice(0, 200)}</p>

            {/* Clay / Technique tags */}
            <div className="product-tags">
              {product.clayType && <span className="product-tag">{product.clayType}</span>}
              {product.technique && <span className="product-tag">{product.technique}</span>}
              {product.glazeType && <span className="product-tag">{product.glazeType}</span>}
              {product.isHandmade && <span className="product-tag">Handmade</span>}
              {product.isFoodSafe && <span className="product-tag">Food Safe</span>}
            </div>

            {/* Stock */}
            <div className="product-stock">
              {product.stock === 0 ? (
                <span className="stock-out">Out of Stock</span>
              ) : product.stock <= 5 ? (
                <span className="stock-low">Only {product.stock} left</span>
              ) : (
                <span className="stock-ok">In Stock</span>
              )}
            </div>

            {/* Quantity + Add to cart */}
            {product.stock > 0 && (
              <div className="product-actions">
                <div className="qty-control">
                  <button onClick={() => setQty(Math.max(1, qty - 1))}>−</button>
                  <span>{qty}</span>
                  <button onClick={() => setQty(Math.min(product.stock, qty + 1))}>+</button>
                </div>
                <button className="btn btn-primary add-cart-btn" onClick={handleAddToCart}>
                  <FiShoppingBag size={16} /> Add to Cart
                </button>
                <button className="btn btn-outline wishlist-btn" onClick={handleWishlist}>
                  <FiHeart size={16} />
                </button>
              </div>
            )}

            {/* Processing time */}
            <div className="product-shipping-note">
              <FiPackage size={14} />
              Processing: {product.processingTime} · {product.madeToOrder ? 'Made to Order' : 'Ready to Ship'}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="product-tabs">
          <div className="tabs-nav">
            {['details', 'care', 'reviews'].map((t) => (
              <button key={t} className={`tab-btn${tab === t ? ' active' : ''}`} onClick={() => setTab(t)}>
                {t === 'details' ? 'Details' : t === 'care' ? 'Care & Use' : `Reviews (${reviews.length})`}
              </button>
            ))}
          </div>

          {tab === 'details' && (
            <div className="tab-content">
              <p className="tab-desc">{product.description}</p>
              <div className="tab-specs">
                {product.dimensions && (
                  <div className="spec-grid">
                    {product.dimensions.height && <div className="spec-item"><span>Height</span><span>{product.dimensions.height} cm</span></div>}
                    {product.dimensions.width && <div className="spec-item"><span>Width</span><span>{product.dimensions.width} cm</span></div>}
                    {product.dimensions.diameter && <div className="spec-item"><span>Diameter</span><span>{product.dimensions.diameter} cm</span></div>}
                    {product.dimensions.weight && <div className="spec-item"><span>Weight</span><span>{product.dimensions.weight} g</span></div>}
                  </div>
                )}
                {product.firingTechnique && (
                  <p className="spec-note"><FiThermometer size={14} /> Firing: {product.firingTechnique}</p>
                )}
                {product.artisan?.name && (
                  <div className="artisan-block">
                    <p className="hindi-accent">कारीगर की कहानी</p>
                    <p className="artisan-label">Artisan</p>
                    <p className="artisan-name display">{product.artisan.name}</p>
                    {product.artisan.location && <p className="artisan-loc">📍 {product.artisan.location}</p>}
                    {product.artisan.bio && <p className="artisan-bio">{product.artisan.bio}</p>}
                  </div>
                )}
              </div>
            </div>
          )}

          {tab === 'care' && (
            <div className="tab-content">
              <p className="tab-desc">{product.careInstructions}</p>
              <div className="care-icons">
                <div className={`care-icon ${product.isMicrowaveSafe ? 'ok' : 'no'}`}>
                  <FiThermometer size={20} />
                  <span>Microwave {product.isMicrowaveSafe ? 'Safe' : 'Unsafe'}</span>
                </div>
                <div className={`care-icon ${product.isDishwasherSafe ? 'ok' : 'no'}`}>
                  <FiDroplet size={20} />
                  <span>Dishwasher {product.isDishwasherSafe ? 'Safe' : 'Unsafe'}</span>
                </div>
                <div className={`care-icon ${product.isFoodSafe ? 'ok' : 'no'}`}>
                  <span style={{ fontSize: 20 }}>🍽</span>
                  <span>Food {product.isFoodSafe ? 'Safe' : 'Unsafe'}</span>
                </div>
              </div>
            </div>
          )}

          {tab === 'reviews' && (
            <div className="tab-content">
              {/* Review form */}
              {user && (
                <form onSubmit={handleReviewSubmit} className="review-form">
                  <h4 className="review-form-title">Leave a Review</h4>
                  <div className="star-select">
                    {[1,2,3,4,5].map((s) => (
                      <button key={s} type="button" className={`star-btn${s <= reviewRating ? ' active' : ''}`} onClick={() => setReviewRating(s)}>★</button>
                    ))}
                  </div>
                  <textarea
                    className="form-input"
                    rows={4}
                    placeholder="Share your thoughts about this piece…"
                    value={reviewText}
                    onChange={(e) => setReviewText(e.target.value)}
                    required
                  />
                  <button className="btn btn-primary" type="submit" disabled={reviewSubmitting}>
                    {reviewSubmitting ? 'Submitting…' : 'Submit Review'}
                  </button>
                </form>
              )}
              {/* Review list */}
              {reviews.length === 0 ? (
                <p style={{ color: 'var(--stone-light)', marginTop: 16 }}>No reviews yet. Be the first!</p>
              ) : (
                <div className="review-list">
                  {reviews.map((r) => (
                    <div key={r._id} className="review-card">
                      <div className="review-header">
                        <div className="review-user">{r.user?.name || 'Anonymous'}</div>
                        <div className="review-stars">{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</div>
                        <div className="review-date">{new Date(r.createdAt).toLocaleDateString('en-IN')}</div>
                      </div>
                      <p className="review-comment">{r.comment}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Related products */}
        {related.length > 0 && (
          <section className="section">
            <div className="section-header">
              <div>
                <p className="section-eyebrow">You may also like</p>
                <h2 className="section-title display">Related Pieces</h2>
              </div>
            </div>
            <div className="product-grid">
              {related.slice(0, 4).map((p) => <ProductCard key={p._id} product={p} />)}
            </div>
          </section>
        )}
      </div>

      {/* Mobile sticky buy bar */}
      {product.stock > 0 && (
        <div className="mobile-buy-bar">
          <div className="mobile-buy-price">
            <span>₹{finalPrice.toLocaleString('en-IN')}</span>
            {hasDiscount && <s>₹{product.price.toLocaleString('en-IN')}</s>}
          </div>
          <button className="btn btn-primary" onClick={handleAddToCart}>
            <FiShoppingBag size={15} /> Add to Cart
          </button>
        </div>
      )}
    </div>
  );
}
