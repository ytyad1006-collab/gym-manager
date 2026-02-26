import React, { useState } from 'react';
import './LandingPage.css';

// Simple SVG icons for features
const icons = {
  member: (
    <svg width="36" height="36" fill="none" viewBox="0 0 36 36"><circle cx="18" cy="12" r="7" fill="#8b5cf6"/><rect x="6" y="23" width="24" height="9" rx="4.5" fill="#e0e7ff"/></svg>
  ),
  payment: (
    <svg width="36" height="36" fill="none" viewBox="0 0 36 36"><rect x="4" y="10" width="28" height="18" rx="4" fill="#8b5cf6"/><rect x="8" y="18" width="12" height="4" rx="2" fill="#e0e7ff"/></svg>
  ),
  reminder: (
    <svg width="36" height="36" fill="none" viewBox="0 0 36 36"><circle cx="18" cy="18" r="16" fill="#e0e7ff"/><path d="M18 10v8l6 3" stroke="#8b5cf6" strokeWidth="2.5" strokeLinecap="round"/></svg>
  ),
  mobile: (
    <svg width="36" height="36" fill="none" viewBox="0 0 36 36"><rect x="10" y="4" width="16" height="28" rx="4" fill="#8b5cf6"/><rect x="14" y="30" width="8" height="2" rx="1" fill="#e0e7ff"/></svg>
  ),
};

export default function LandingPage({ onGetStarted }) {
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const plans = [
    { name: "Free Trial", price: "0", note: "7 Days Full Access" },
    { name: "Monthly", price: "499", note: "Flexible Monthly billing" },
    { name: "6 Months", price: "2599", note: "Save 15% - Most Popular", popular: true },
    { name: "Annual", price: "4599", note: "Save 25% - Best Value" },
  ];
  const features = [
    { icon: icons.member, title: "Member Management", desc: "Add, edit, and track all your gym members with ease." },
    { icon: icons.payment, title: "Payment Tracking", desc: "Record payments, view history, and manage plans." },
    { icon: icons.reminder, title: "Expiry Reminders", desc: "Send WhatsApp and email reminders for expiring memberships." },
    { icon: icons.mobile, title: "Mobile Friendly", desc: "Access your dashboard from any device, anywhere." },
  ];

  return (
    <div className="landing-wrapper">
      <header className="landing-header">
        <div className="container header-flex">
          <div className="landing-logo">GymManager</div>
          <nav className="landing-nav">
            <a href="#features">Features</a>
            <a href="#pricing">Pricing</a>
            <button type="button" className="btn-get-started" onClick={onGetStarted}>Get Started</button>
          </nav>
        </div>
      </header>

      <section className="hero">
        <div className="container">
          <div className="hero-tag">All-in-one Management</div>
          <h1>
            <span className="gradient-text">Modern Gym</span> Management<br/>
            <span style={{fontWeight:700}}>Simplified.</span>
          </h1>
          <p style={{fontSize:'1.3rem',maxWidth:600,margin:'20px auto 40px'}}>Manage members, record payments, and send automatic WhatsApp reminders. Built for growth.</p>
          <div style={{display:'flex',justifyContent:'center',gap:16,flexWrap:'wrap'}}>
            <button className="btn-hero" onClick={onGetStarted}>Start Free Trial</button>
            <a href="#features" className="btn-hero btn-outline">See Features</a>
          </div>
        </div>
      </section>

      <section id="features" className="features-section">
        <div className="container">
          <h2 className="section-title">Features</h2>
          <div className="features-grid">
            {features.map((f, i) => (
              <div className="feature-card" key={i}>
                <div className="feature-icon">{f.icon}</div>
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="pricing" className="pricing-section">
        <div className="container">
          <h2 className="section-title">Choose Your Plan</h2>
          <div className="pricing-grid">
            {plans.map((p, i) => (
              <div key={i} className={`pricing-card ${p.popular ? 'featured' : ''}`}>
                {p.popular && <span className="popular-label">Popular Choice</span>}
                <h3>{p.name}</h3>
                <div className="price">
  {p.price === "0" ? "Free" : `₹${Number(p.price).toLocaleString("en-IN")}`}
</div>
                <p className="note">{p.note}</p>
                <button 
                  className={p.popular ? "btn-plan-primary" : "btn-plan-outline"} 
                  onClick={onGetStarted}
                >
                  Choose Plan
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="footer">
        <div className="container">
          <div className="footer-links">
            <a href="mailto:support@gymmanager.com">Contact</a>
            <button className="footer-link-btn" onClick={() => setShowPrivacy(true)}>Privacy Policy</button>
            <button className="footer-link-btn" onClick={() => setShowTerms(true)}>Terms &amp; Conditions</button>
          </div>
          <p>&copy; 2026 GymManager</p>
        </div>
        {/* Privacy Policy Modal */}
        {showPrivacy && (
          <div className="legal-modal" onClick={() => setShowPrivacy(false)}>
            <div className="legal-modal-content" onClick={e => e.stopPropagation()}>
              <h2>Privacy Policy</h2>
              <p>Your privacy is important to us. We only collect necessary information to provide our services. We do not sell or share your data with third parties except as required by law. For more details, contact support@gymmanager.com.</p>
              <button className="btn-hero" onClick={() => setShowPrivacy(false)}>Close</button>
            </div>
          </div>
        )}
        {/* Terms & Conditions Modal */}
        {showTerms && (
          <div className="legal-modal" onClick={() => setShowTerms(false)}>
            <div className="legal-modal-content" onClick={e => e.stopPropagation()}>
              <h2>Terms &amp; Conditions</h2>
              <p>By using GymManager, you agree to use the service lawfully and not misuse the platform. All content is for informational purposes only. We reserve the right to update these terms at any time. For questions, contact support@gymmanager.com.</p>
              <button className="btn-hero" onClick={() => setShowTerms(false)}>Close</button>
            </div>
          </div>
        )}
      </footer>
    </div>
  );
}
