import React from 'react';
import { Link } from 'react-router-dom';
import { FiHeart, FiShoppingBag, FiStar } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import './ProductCard.css';

export default function ProductCard({ product }) {
  const { user } = useAuth();
  const { addToCart } = useCart();
  const isWishlisted = user?.wishlist?.includes(product._id);

  const handleAddToCart = async (e) => {
    e.preventDefault();
    if (!user) { toast.error('Please sign in to add items to cart'); return; }
    try {
      await addToCart(product._id, 1);
      toast.success('Added to cart!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add to cart');
    }
  };

  const handleWishlist = async (e) => {
    e.preventDefault();
    if (!user) { toast.error('Please sign in'); return; }
    try {
      await api.put(`/auth/wishlist/${product._id}`);
      toast.success(isWishlisted ? 'Removed from wishlist' : 'Added to wishlist');
    } catch {
      toast.error('Failed to update wishlist');
    }
  };

  const finalPrice = product.discountPrice || product.price;
  const hasDiscount = product.discountPrice && product.discountPrice < product.price;

  return (
    <Link to={`/products/${product.slug}`} className="product-card">
      <div className="product-card-image-wrap">
        <img
          src={product.images?.[0]?.url || '/placeholder.jpg'}
          alt={product.images?.[0]?.altText || product.name}
          className="product-card-image"
          loading="lazy"
        />
        {product.isNewArrival && <span className="product-badge new">New</span>}
        {hasDiscount && (
          <span className="product-badge sale">
            -{Math.round(((product.price - product.discountPrice) / product.price) * 100)}%
          </span>
        )}
        <button className="card-wishlist-btn" onClick={handleWishlist} title="Wishlist">
          <FiHeart size={16} fill={isWishlisted ? 'currentColor' : 'none'} />
        </button>
        <button
          className="card-cart-bar"
          onClick={handleAddToCart}
          disabled={product.stock === 0}
        >
          <FiShoppingBag size={15} /> {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
        </button>
      </div>
      <div className="product-card-body">
        {product.category?.name && (
          <p className="product-card-category">{product.category.name}</p>
        )}
        <h3 className="product-card-name display">{product.name}</h3>
        <div className="product-card-meta">
          {product.ratingsQuantity > 0 && (
            <span className="product-card-rating">
              <FiStar size={12} fill="currentColor" /> {product.ratingsAverage}
              <span className="rating-count">({product.ratingsQuantity})</span>
            </span>
          )}
          {product.clayType && <span className="product-card-clay">{product.clayType}</span>}
        </div>
        <div className="product-card-price">
          <span className="price-final">₹{finalPrice.toLocaleString('en-IN')}</span>
          {hasDiscount && (
            <span className="price-original">₹{product.price.toLocaleString('en-IN')}</span>
          )}
        </div>
        {product.stock === 0 && <p className="out-of-stock">Out of stock</p>}
        {product.stock > 0 && product.stock <= 5 && (
          <p className="low-stock">Only {product.stock} left</p>
        )}
      </div>
    </Link>
  );
}
