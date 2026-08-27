'use client';

import Link from 'next/link';

export default function Home() {
  return (
    <>
      {/* ─── Header (Navy #1B3B6F) ─── */}
      <nav className="navbar">
        <div className="navbar-inner">
          <Link href="/" className="navbar-brand">
            <span className="emblem">🏛️</span>
            <div>
              <div>Birth Certificate Portal</div>
              <span className="navbar-brand-subtitle">Civil Registration System</span>
            </div>
          </Link>
          <div className="navbar-nav">
            <Link href="/track" className="nav-link">
              🔍 <span>Track Application</span>
            </Link>
            <Link href="/apply" className="btn btn-primary" style={{ padding: '8px 16px', fontSize: '14px' }}>
              📋 Apply Online
            </Link>
            <Link href="/login" className="btn btn-header-ghost" style={{ padding: '8px 16px', fontSize: '14px' }}>
              🔐 Staff Login
            </Link>
          </div>
        </div>
      </nav>

      {/* ─── Hero Section (Warm Gray #F8F9FA) ─── */}
      <section className="hero">
        <div className="hero-grid">
          {/* Left Column */}
          <div>
            <div className="hero-badge">
              🇮🇳 Government of India — Civic Public Service
            </div>
            <h1>
              Register Birth Certificates{' '}
              <span>Online</span> with Trust & Ease
            </h1>
            <p>
              An official, transparent, and secure digital service for registering child births. Submit applications in minutes, track progress in real-time, and receive official certificates.
            </p>
            <div className="hero-actions">
              <Link href="/apply" className="btn btn-primary btn-lg">
                📋 Register Birth Certificate
              </Link>
              <Link href="/track" className="btn btn-ghost btn-lg">
                🔍 Track Status
              </Link>
            </div>

            {/* Quick Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginTop: '36px' }}>
              {[
                { label: 'Applications Handled', value: '10,000+' },
                { label: 'Approval Rate', value: '98.4%' },
                { label: 'Standard SLA', value: '3–5 Days' },
              ].map(s => (
                <div key={s.label} style={{
                  backgroundColor: '#FFFFFF',
                  border: '1px solid var(--color-border)',
                  borderTop: '3px solid var(--color-teal)',
                  borderRadius: 'var(--r-md)',
                  padding: '16px',
                  boxShadow: 'var(--shadow-sm)',
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: '22px', fontWeight: '800', color: 'var(--color-navy)', fontFamily: 'var(--font-display)' }}>
                    {s.value}
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--color-gray-text)', marginTop: '2px', fontWeight: 500 }}>
                    {s.label}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column — How It Works Card */}
          <div className="hero-card">
            <h2 style={{ fontSize: '18px', marginBottom: '20px', color: 'var(--color-navy)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>⚙️</span> How the Process Works
            </h2>
            <div className="hero-steps">
              {[
                { icon: '📝', color: 'blue', title: '1. Fill Online Application', desc: 'Provide child, parental, and institution delivery details in 5 simple steps.' },
                { icon: '📬', color: 'teal', title: '2. Instant Application Number', desc: 'Get a unique reference ID (e.g. BC-2025-XXXX) immediately for tracking.' },
                { icon: '🏥', color: 'green', title: '3. Hospital Verification', desc: 'The designated hospital medical authority reviews and verifies birth records.' },
                { icon: '✅', color: 'amber', title: '4. Final Operator Approval', desc: 'Civil Registrar grants final approval and issues official certificate.' },
              ].map((step, i) => (
                <div className="hero-step" key={i}>
                  <div className={`hero-step-icon ${step.color}`}>{step.icon}</div>
                  <div>
                    <h3>{step.title}</h3>
                    <p>{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── Main Content (White #FFFFFF) ─── */}
      <section style={{ backgroundColor: '#FFFFFF', padding: '64px 24px', borderBottom: '1px solid var(--color-border)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', maxWidth: '640px', margin: '0 auto 48px' }}>
            <h2 style={{ fontSize: '28px', color: 'var(--color-navy)', marginBottom: '12px' }}>
              Official Citizen Services & Guidance
            </h2>
            <p style={{ color: 'var(--color-gray-text)', fontSize: '15px' }}>
              Everything you need for birth registration under the Registration of Births and Deaths Act.
            </p>
          </div>

          {/* Guidance Cards Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
            <div className="card">
              <div style={{ fontSize: '32px', marginBottom: '12px' }}>📋</div>
              <h3 style={{ fontSize: '18px', marginBottom: '8px', color: 'var(--color-navy)' }}>New Registration</h3>
              <p style={{ fontSize: '14px', color: 'var(--color-gray-text)', marginBottom: '16px', lineHeight: '1.6' }}>
                Register a child born at any enrolled hospital, clinic, or residence within the district jurisdiction.
              </p>
              <Link href="/apply" className="btn btn-primary btn-sm">
                Start New Application →
              </Link>
            </div>

            <div className="card">
              <div style={{ fontSize: '32px', marginBottom: '12px' }}>🔍</div>
              <h3 style={{ fontSize: '18px', marginBottom: '8px', color: 'var(--color-navy)' }}>Status Verification</h3>
              <p style={{ fontSize: '14px', color: 'var(--color-gray-text)', marginBottom: '16px', lineHeight: '1.6' }}>
                Track the current review status of your submitted application using your unique reference ID.
              </p>
              <Link href="/track" className="btn btn-ghost btn-sm">
                Check Status →
              </Link>
            </div>

            <div className="card">
              <div style={{ fontSize: '32px', marginBottom: '12px' }}>🏛️</div>
              <h3 style={{ fontSize: '18px', marginBottom: '8px', color: 'var(--color-navy)' }}>Authority & Hospital Staff</h3>
              <p style={{ fontSize: '14px', color: 'var(--color-gray-text)', marginBottom: '16px', lineHeight: '1.6' }}>
                Hospital verifying officers and registration operators can log in to process pending verification queues.
              </p>
              <Link href="/login" className="btn btn-ghost btn-sm">
                Staff Portal Login →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Footer (Navy #1B3B6F) ─── */}
      <footer className="footer">
        <div className="footer-grid">
          <div>
            <div className="footer-brand">
              <span>🏛️</span> Civil Registration System
            </div>
            <p style={{ marginBottom: '12px' }}>
              Government of India — Official Portal for the Registration of Births and Civil Records. Ensuring transparent, accessible, and timely civic public service delivery.
            </p>
            <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)' }}>
              Compliant with the Registration of Births and Deaths Act (RBD).
            </p>
          </div>

          <div>
            <div className="footer-heading">Citizen Quick Links</div>
            <ul className="footer-links">
              <li><Link href="/apply">Apply for Birth Certificate</Link></li>
              <li><Link href="/track">Track Application Status</Link></li>
              <li><Link href="/login">Hospital / Staff Login</Link></li>
              <li><Link href="/">Guidelines & FAQ</Link></li>
            </ul>
          </div>

          <div>
            <div className="footer-heading">Support & Contact</div>
            <ul className="footer-links">
              <li><span style={{ color: 'rgba(255,255,255,0.75)', fontSize: '13px' }}>📞 Helpline: 1800-11-2025</span></li>
              <li><span style={{ color: 'rgba(255,255,255,0.75)', fontSize: '13px' }}>✉️ crs-support@gov.in</span></li>
              <li><span style={{ color: 'rgba(255,255,255,0.75)', fontSize: '13px' }}>🕒 Hours: 9:00 AM – 5:30 PM</span></li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <div>© {new Date().getFullYear()} Civil Registration System, Government of India. All rights reserved.</div>
          <div>Designed for Public Trust, Accessibility & Efficiency.</div>
        </div>
      </footer>
    </>
  );
}

