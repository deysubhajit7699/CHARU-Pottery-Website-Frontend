import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import toast from 'react-hot-toast';
import { FiHeart, FiShoppingBag, FiTrash2 } from 'react-icons/fi';
import './WishlistPage.css';

export default function WishlistPage() {
  const { user, updateUser } = useAuth();
  const { addToCart } = useCart();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/auth/wishlist')
      .then(({ data }) => setProducts(data.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleRemove = async (productId) => {
    try {
      const { data } = await api.put(`/auth/wishlist/${productId}`);
      setProducts((prev) => prev.filter((p) => p._id !== productId));
      updateUser({ wishlist: data.data });
      toast.success('Removed from wishlist');
    } catch { toast.error('Failed'); }
  };

  const handleMoveToCart = async (productId) => {
    try {
      await addToCart(productId, 1);
      await handleRemove(productId);
      toast.success('Moved to cart!');
    } catch { toast.error('Failed to move to cart'); }
  };

  if (loading) return <div className="page-loader"><div className="spinner" /></div>;

  return (
    <div className="wishlist-page">
      <div className="container">
        <h1 className="wishlist-title display">Wishlist</h1>

        {products.length === 0 ? (
          <div className="wishlist-empty">
            <FiHeart size={52} color="var(--stone-light)" />
            <h2 className="display" style={{ fontSize: 26, marginTop: 16 }}>Your wishlist is empty</h2>
            <p style={{ color: 'var(--stone-light)', marginTop: 8 }}>Save pieces you love for later.</p>
            <Link to="/products" className="btn btn-primary" style={{ marginTop: 24 }}>Browse Collection</Link>
          </div>
        ) : (
          <>
            <p className="wishlist-count">{products.length} saved piece{products.length !== 1 ? 's' : ''}</p>
            <div className="wishlist-grid">
              {products.map((product) => {
                const finalPrice = product.discountPrice || product.price;
                const hasDiscount = product.discountPrice && product.discountPrice < product.price;
                return (
                  <div key={product._id} className="wishlist-card">
                    <Link to={`/products/${product.slug}`} className="wishlist-card-img-wrap">
                      <img src={product.images?.[0]?.url || '/placeholder.jpg'} alt={product.name} />
                      {product.stock === 0 && <span className="wishlist-oos">Out of Stock</span>}
                    </Link>
                    <div className="wishlist-card-body">
                      {product.category?.name && <p className="wishlist-category">{product.category.name}</p>}
                      <Link to={`/products/${product.slug}`} className="wishlist-name display">{product.name}</Link>
                      <div className="wishlist-price">
                        <span className="wishlist-price-final">₹{finalPrice.toLocaleString('en-IN')}</span>
                        {hasDiscount && <span className="wishlist-price-original">₹{product.price.toLocaleString('en-IN')}</span>}
                      </div>
                      <div className="wishlist-actions">
                        <button
                          className="btn btn-primary wishlist-cart-btn"
                          disabled={product.stock === 0}
                          onClick={() => handleMoveToCart(product._id)}
                        >
                          <FiShoppingBag size={14} />
                          {product.stock === 0 ? 'Out of Stock' : 'Move to Cart'}
                        </button>
                        <button className="wishlist-remove-btn" onClick={() => handleRemove(product._id)} title="Remove">
                          <FiTrash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
