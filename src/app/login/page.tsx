'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Login failed');
      // Redirect based on role
      if (data.role === 'hospital_staff') router.push('/hospital');
      else if (data.role === 'operator') router.push('/approve');
      else if (data.role === 'admin') router.push('/admin');
      else router.push('/');
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
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
            <Link href="/" className="nav-link">← Back to Public Portal</Link>
          </div>
        </div>
      </nav>

      <div style={{ minHeight: 'calc(100vh - 68px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '32px 24px', backgroundColor: 'var(--color-bg-light)' }}>
        <div style={{ width: '100%', maxWidth: '440px' }}>
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '28px' }}>
            <div style={{
              width: '60px', height: '60px', margin: '0 auto 14px',
              backgroundColor: 'var(--color-navy)',
              color: '#FFFFFF',
              borderRadius: 'var(--r-lg)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '26px',
              boxShadow: '0 4px 12px rgba(27, 59, 111, 0.2)'
            }}>🔐</div>
            <h1 style={{ fontSize: '26px', marginBottom: '6px', color: 'var(--color-navy)' }}>Official Staff Sign-In</h1>
            <p className="text-muted text-sm">Authorized Hospital Verifiers, Operators & System Administrators</p>
          </div>

          {/* Form */}
          <div className="card-glass" style={{ padding: '32px', backgroundColor: '#FFFFFF', border: '1px solid var(--color-border)', borderTop: '4px solid var(--color-teal)' }}>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              <div className="form-group">
                <label className="form-label" htmlFor="email">Official Email Address</label>
                <input
                  id="email"
                  type="email"
                  className="form-input"
                  placeholder="name@hospital.gov / staff@crs.gov"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  autoFocus
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="password">Password</label>
                <input
                  id="password"
                  type="password"
                  className="form-input"
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                />
              </div>

              {error && (
                <div className="alert alert-danger">
                  <span>⚠️</span> {error}
                </div>
              )}

              <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading} style={{ marginTop: '6px' }}>
                {loading ? <><span className="spinner" /> Authenticating...</> : '🔐 Secure Sign In'}
              </button>
            </form>
          </div>

          {/* Dev credentials hint */}
          <div className="card-plain" style={{ marginTop: '16px', padding: '14px 18px', backgroundColor: '#FFFFFF', border: '1px solid var(--color-border)' }}>
            <div style={{ fontSize: '12px', color: 'var(--color-navy)', marginBottom: '6px', fontWeight: 700 }}>
              🛠️ Demo / Seed Accounts:
            </div>
            <div style={{ fontSize: '12px', color: 'var(--color-gray-text)', lineHeight: '1.8' }}>
              Hospital Staff: <code style={{ backgroundColor: '#F1F5F9', color: 'var(--color-navy)', padding: '2px 6px', borderRadius: '4px' }}>hospital1@example.com</code> / <code>Hospital@123</code><br />
              Operator: <code style={{ backgroundColor: '#F1F5F9', color: 'var(--color-navy)', padding: '2px 6px', borderRadius: '4px' }}>operator@example.com</code> / <code>Operator@123</code><br />
              Admin: <code style={{ backgroundColor: '#F1F5F9', color: 'var(--color-navy)', padding: '2px 6px', borderRadius: '4px' }}>admin@system.gov</code> / <code>Admin@System@2025</code>
            </div>
          </div>

          <p className="text-center text-sm text-muted" style={{ marginTop: '20px' }}>
            <Link href="/" style={{ color: 'var(--color-teal)', fontWeight: 500 }}>← Back to Public Portal</Link>
          </p>
        </div>
      </div>
    </>
  );
}

