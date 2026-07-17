import React from 'react';
import './ContactPage.css';

const WaLogo = (props) => (
  <svg viewBox="0 0 24 24" {...props}><path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.46 1.32 4.96L2 22l5.28-1.38a9.9 9.9 0 0 0 4.76 1.21h.01c5.46 0 9.9-4.45 9.9-9.91C21.96 6.45 17.5 2 12.04 2zm5.8 14.08c-.24.68-1.4 1.3-1.93 1.38-.5.08-1.12.11-1.81-.11-.42-.13-.95-.31-1.64-.6-2.9-1.25-4.79-4.15-4.94-4.34-.14-.19-1.18-1.57-1.18-3 0-1.42.75-2.12 1.02-2.41.26-.29.58-.36.77-.36h.55c.18 0 .42-.07.65.5.24.58.82 2 .89 2.15.07.15.12.32.02.51-.1.19-.15.31-.3.48-.15.17-.31.38-.44.51-.15.15-.3.31-.13.6.17.29.76 1.26 1.64 2.04 1.13 1 2.08 1.32 2.37 1.47.29.15.46.13.63-.08.17-.2.72-.84.91-1.13.19-.29.38-.24.63-.15.26.1 1.64.77 1.92.91.29.15.48.22.55.34.07.13.07.75-.17 1.42z" /></svg>
);

export default function ContactPage() {
  return (
    <div className="contact-page">
      <div className="dotrow" />
      <div className="wrap">

        <div className="hero-c">
          <span className="tagline">Talk to us, in whatever way feels easiest</span>
          <h1 className="display">Let's talk clay.</h1>
          <p>Questions about an order, a custom piece, or bulk gifting for your brand — we read every message ourselves.</p>
        </div>

        <div className="wa-panel">
          <div className="wa-icon"><WaLogo /></div>
          <div className="wa-text">
            <span className="eyebrow">Fastest way to reach us</span>
            <h2>Message us on WhatsApp</h2>
            <p>You'll get an instant reply with store hours, order tracking and quick answers — a real person from our team follows up after that, usually within a few hours.</p>
            <a className="wa-btn" href="https://wa.me/917699258249?text=Hi%20CHARU%2C%20I%20have%20a%20question" target="_blank" rel="noopener noreferrer">
              <WaLogo width="18" height="18" style={{ fill: '#fff' }} />
              Start a chat
            </a>
            <div className="wa-meta">
              <span><span className="wa-dot" />Usually replies within 2–4 hrs</span>
              <span><span className="wa-dot" />Auto-reply is instant</span>
            </div>
          </div>
        </div>

        <div className="section-label">
          <span className="eyebrow">Other ways to reach us</span>
          <h2>Pick what works for you</h2>
        </div>

        <div className="channel-grid">
          <div className="channel-card">
            <div className="ic"><svg viewBox="0 0 24 24"><path d="M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.4.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1C10.6 21 3 13.4 3 4c0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.4 0 .8-.2 1L6.6 10.8z" /></svg></div>
            <h3>Call us</h3>
            <p><a href="tel:+917699258249">+91 76992 58249</a><br />Mon–Sun, 10am–7pm</p>
          </div>
          <div className="channel-card">
            <div className="ic"><svg viewBox="0 0 24 24"><path d="M20 4H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2zm0 4-8 5-8-5V6l8 5 8-5v2z" /></svg></div>
            <h3>Email us</h3>
            <p><a href="mailto:charuhelp2026@gmail.com">charuhelp2026@gmail.com</a><br />Replies within a day</p>
          </div>
          <div className="channel-card">
            <div className="ic"><svg viewBox="0 0 24 24"><path d="M12 2C7.6 2 4 5.6 4 10c0 5.5 8 12 8 12s8-6.5 8-12c0-4.4-3.6-8-8-8zm0 11a3 3 0 1 1 0-6 3 3 0 0 1 0 6z" /></svg></div>
            <h3>Visit the workshop</h3>
            <p>Mankar Yard, Mankar<br />Purba Bardhaman, West Bengal</p>
          </div>
          <div className="channel-card">
            <div className="ic"><svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm5 9h-4v6h-2v-6H7V9h4V7c0-1.66 1.34-3 3-3h2v2h-2c-.55 0-1 .45-1 1v2h4l-1 2z" /></svg></div>
            <h3>Follow along</h3>
            <p><a href="https://instagram.com/charupotteryart" target="_blank" rel="noopener noreferrer">@charupotteryart</a><br />Instagram — behind-the-scenes on the wheel</p>
          </div>
        </div>

        <div className="section-label">
          <span className="eyebrow">Before you write in</span>
          <h2>Quick answers</h2>
        </div>

        <div className="faq">
          <details open>
            <summary>Do you take custom orders?</summary>
            <p>Yes — send us the shape, size and glaze you have in mind on WhatsApp with a reference photo if you have one, and we'll confirm feasibility, price and timeline within a day.</p>
          </details>
          <details>
            <summary>How long does shipping take?</summary>
            <p>In-stock pieces ship within 2–3 working days and typically arrive in 5–8 days depending on your city. Custom pieces need 2–3 weeks for firing before they ship.</p>
          </details>
          <details>
            <summary>Do you do bulk or corporate gifting?</summary>
            <p>We do — mention quantity and your event date when you message us, and we'll share a gifting catalogue with volume pricing and kraft packaging options.</p>
          </details>
          <details>
            <summary>What's your return or exchange policy?</summary>
            <p>Handmade pieces are one-of-a-kind, so we only accept returns for pieces damaged in transit. Send a photo within 48 hours of delivery and we'll replace or refund it.</p>
          </details>
        </div>

        <div className="form-section">
          <div className="form-side">
            <h2>Come see the workshop</h2>
            <p>Mankar Yard, Mankar, Purba Bardhaman, West Bengal. Walk-ins are welcome during working hours — tap the map for directions.</p>
            <div className="hours">
              <h3>Workshop hours</h3>
              <p>Monday – Sunday: 10:00am – 7:00pm</p>
            </div>
            <a className="map-link" href="https://maps.app.goo.gl/K5Um1bLj9zTLzFGF9" target="_blank" rel="noopener noreferrer">Get directions →</a>
          </div>
          <div className="map-embed">
            <iframe
              title="CHARU workshop location"
              src="https://maps.google.com/maps?q=23.419214,87.543297&z=17&output=embed"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              allowFullScreen
            />
          </div>
        </div>

      </div>
      <div className="dotrow" />
    </div>
  );
}
