import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import ProductCard from '../components/product/ProductCard';
import useReveal from '../hooks/useReveal';
import './HomePage.css';

/* Placeholder imagery — replace with your own artisan/workshop photos */
const HERO_SLIDES = [
  'https://images.unsplash.com/photo-1590422749897-47036da0b0ff?q=80&w=1200&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1610701596007-11502861dcfa?q=80&w=1200&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1525974160448-038dacadcc71?q=80&w=1200&auto=format&fit=crop',
];

const STORY_IMAGE =
  'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?q=80&w=1200&auto=format&fit=crop';

/* Hand-drawn craft badge icons */
const CraftIcons = {
  hands: (
    <svg viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round">
      <circle cx="20" cy="20" r="13" strokeDasharray="3 3" opacity=".5" />
      <path d="M14 24c0-5 2.5-8 6-8s6 3 6 8" />
      <path d="M13 24h14M16 13.5l1.5 2M24 13.5l-1.5 2M20 11v2.5" />
    </svg>
  ),
  brush: (
    <svg viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round">
      <path d="M26 10 15 21m11-11 3 3-11 11m-3-3-2.5 5.5L18 24" />
      <path d="M11 29c2-1 4-1 6 0s4 1 6 0 4-1 6 0" opacity=".55" />
    </svg>
  ),
  kiln: (
    <svg viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round">
      <path d="M20 9c3 3.5 5.5 6.5 5.5 10a5.5 5.5 0 1 1-11 0c0-3.5 2.5-6.5 5.5-10Z" />
      <path d="M20 17c1.3 1.6 2.3 3 2.3 4.6a2.3 2.3 0 1 1-4.6 0c0-1.6 1-3 2.3-4.6Z" opacity=".55" />
      <path d="M12 31h16" />
    </svg>
  ),
};

export default function HomePage() {
  const [featured, setFeatured] = useState([]);
  const [newArrivals, setNewArrivals] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [slide, setSlide] = useState(0);

  useEffect(() => {
    const load = async () => {
      try {
        const [featRes, newRes, catRes] = await Promise.all([
          api.get('/products/featured'),
          api.get('/products?isNewArrival=true&limit=4'),
          api.get('/categories'),
        ]);
        setFeatured(featRes.data.data?.slice(0, 4) || []);
        setNewArrivals(newRes.data.data || []);
        setCategories(catRes.data.data || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  useEffect(() => {
    const t = setInterval(() => setSlide((s) => (s + 1) % HERO_SLIDES.length), 5000);
    return () => clearInterval(t);
  }, []);

  useReveal([loading]);

  return (
    <div className="home">
      {/* ── Hero ─────────────────────────────────────────── */}
      <section className="hero">
        <div className="toran" aria-hidden="true" />
        <div className="hero-grid container">
          <div className="hero-content">
            <p className="hindi-accent">गाँव की मिट्टी, हाथों का हुनर</p>
            <p className="hero-eyebrow">Handcrafted · Time-Honored · Since 2004</p>
            <h1 className="hero-title display">
              CHARU: Crafting Handmade Clay Art for Over Two Decades.
            </h1>
            <p className="hero-subtitle">
              Discover the soul of clay, shaped by experienced hands in our
              traditional workshop. Every piece tells a story of Indian heritage.
            </p>
            <div className="hero-cta">
              <Link to="/products" className="btn btn-primary">Shop Collection</Link>
              <Link to="/#story" className="btn btn-outline">Meet the Artisan</Link>
            </div>
          </div>

          <div className="hero-visual">
            {HERO_SLIDES.map((src, i) => (
              <img
                key={src}
                src={src}
                alt="Artisan shaping clay pottery on the wheel"
                className={`hero-img${i === slide ? ' active' : ''}`}
                loading={i === 0 ? 'eager' : 'lazy'}
              />
            ))}
            <div className="hero-dots">
              {HERO_SLIDES.map((_, i) => (
                <button
                  key={i}
                  className={`hero-dot${i === slide ? ' active' : ''}`}
                  onClick={() => setSlide(i)}
                  aria-label={`Slide ${i + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Artisan story ────────────────────────────────── */}
      <section className="story section" id="story">
        <div className="container story-grid">
          <div className="story-content reveal">
            <p className="hindi-accent">हमारी विरासत</p>
            <p className="section-eyebrow">Our Craft &amp; Heritage</p>
            <h2 className="story-title display">
              The Artisan's Journey: Over Two Decades of Masterful Craftsmanship
            </h2>
            <p className="story-text">
              Our master artisans, with more than 20 years of experience, hand-throw
              every piece on a traditional kick-wheel in our workshop. Natural clays,
              mineral glazes and a wood-fired kiln give each creation its warmth and character.
            </p>
            <Link to="/products" className="btn btn-primary">Shop Now</Link>
          </div>
          <div className="story-visual reveal">
            <img src={STORY_IMAGE} alt="Master artisan at the pottery wheel in the workshop" loading="lazy" />
            <span className="story-est display">est. 2004</span>
          </div>
        </div>
      </section>

      <div className="village-divider container" aria-hidden="true" />

      {/* ── Craft badges ─────────────────────────────────── */}
      <section className="craft-badges">
        <div className="container craft-badges-inner">
          {[
            { icon: CraftIcons.hands, label: 'Traditionally Made' },
            { icon: CraftIcons.brush, label: 'Hand-painted Designs' },
            { icon: CraftIcons.kiln, label: 'Kiln-Fired Clay' },
          ].map((b) => (
            <div key={b.label} className="craft-badge reveal">
              <span className="craft-badge-icon">{b.icon}</span>
              <p>{b.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Featured collections ─────────────────────────── */}
      <section className="section collections" id="collections">
        <div className="container">
          <div className="section-center reveal">
            <h2 className="section-title display">Featured Collections</h2>
            <div className="ornament"><span /></div>
          </div>

          {categories.length > 0 && (
            <div className="category-grid">
              {categories.map((cat) => (
                <Link key={cat._id} to={`/products?category=${cat._id}`} className="category-card reveal">
                  {cat.image?.url && <img src={cat.image.url} alt={cat.name} loading="lazy" />}
                  <div className="category-overlay">
                    <h3 className="display">{cat.name}</h3>
                    <span>Explore →</span>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {!loading && featured.length > 0 && (
            <>
              <div className="section-header" style={{ marginTop: 56 }}>
                <div>
                  <p className="section-eyebrow">Curated Selection</p>
                  <h2 className="section-title display">Bestsellers</h2>
                </div>
                <Link to="/products?isFeatured=true" className="btn btn-outline">View All</Link>
              </div>
              <div className="product-grid">
                {featured.map((p) => <ProductCard key={p._id} product={p} />)}
              </div>
            </>
          )}
        </div>
      </section>

      {/* ── New arrivals ─────────────────────────────────── */}
      {!loading && newArrivals.length > 0 && (
        <section className="section workshop-section">
          <div className="container">
            <div className="section-center reveal">
              <p className="section-eyebrow">Just In</p>
              <h2 className="section-title display">From the Artisan's Workshop</h2>
              <div className="ornament"><span /></div>
            </div>
            <div className="product-grid">
              {newArrivals.map((p) => <ProductCard key={p._id} product={p} />)}
            </div>
            <div className="section-center" style={{ marginTop: 36 }}>
              <Link to="/products?isNewArrival=true" className="btn btn-outline">See All New Arrivals</Link>
            </div>
          </div>
        </section>
      )}

      <div className="village-divider container" aria-hidden="true" />

      {/* ── CTA banner ───────────────────────────────────── */}
      <section className="cta-banner">
        <div className="container cta-inner">
          <div>
            <h2 className="display cta-title">Made to order, made for you</h2>
            <p className="cta-sub">Many of our pieces can be custom-made. Reach out to discuss a commission.</p>
          </div>
          <a href="mailto:hello@charu.in" className="btn btn-light">Get in Touch</a>
        </div>
      </section>
    </div>
  );
}
