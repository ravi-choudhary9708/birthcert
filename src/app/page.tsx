'use client';

import Link from 'next/link';

export default function Home() {
  return (
    <>
      {/* Navbar */}
      <nav className="navbar">
        <div className="navbar-inner">
          <Link href="/" className="navbar-brand">
            <span className="emblem">🏛️</span>
            <span>Birth Certificate Portal</span>
          </Link>
          <div className="navbar-nav">
            <Link href="/track" className="nav-link">
              🔍 <span>Track Application</span>
            </Link>
            <Link href="/apply" className="btn btn-primary" style={{ padding: '8px 16px', fontSize: '14px' }}>
              Apply Now
            </Link>
            <Link href="/login" className="btn btn-ghost" style={{ padding: '8px 16px', fontSize: '14px' }}>
              Staff Login
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="hero">
        <div className="hero-grid">
          {/* Left */}
          <div>
            <div className="hero-badge">
              🇮🇳 Government of India — Civil Registration
            </div>
            <h1>
              Register Your Child's{' '}
              <span>Birth Certificate</span>{' '}
              Online
            </h1>
            <p>
              Submit your birth certificate application from the comfort of your home. Get your application number instantly and track progress in real-time.
            </p>
            <div className="hero-actions">
              <Link href="/apply" className="btn btn-primary btn-lg">
                📋 Apply Now
              </Link>
              <Link href="/track" className="btn btn-ghost btn-lg">
                🔍 Track Application
              </Link>
            </div>

            {/* Stats */}
            <div className="flex gap-4 mt-6" style={{ marginTop: '40px' }}>
              {[
                { label: 'Applications', value: '10,000+' },
                { label: 'Approved', value: '98%' },
                { label: 'Processing Time', value: '3–5 Days' },
              ].map(s => (
                <div key={s.label} style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '24px', fontWeight: '800', color: 'var(--accent)' }}>{s.value}</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Right — How it works */}
          <div className="hero-card">
            <h2 style={{ fontSize: '18px', marginBottom: '20px', color: 'var(--text-muted)' }}>
              How It Works
            </h2>
            <div className="hero-steps">
              {[
                { icon: '📋', color: 'blue', title: 'Fill the Form', desc: 'Enter child, parent and birth details. Takes 5–10 minutes.' },
                { icon: '📬', color: 'green', title: 'Get Application Number', desc: 'Instantly receive your unique application number via email.' },
                { icon: '🔍', color: 'purple', title: 'Verifier Reviews', desc: 'Our verification team checks and validates your application.' },
                { icon: '✅', color: 'gold', title: 'Operator Approves', desc: 'Final approval issued. Collect certificate from office.' },
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
    </>
  );
}
