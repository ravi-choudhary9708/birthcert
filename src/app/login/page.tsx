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
      if (data.role === 'verifier') router.push('/verify');
      else if (data.role === 'operator') router.push('/approve');
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
            <span className="emblem">🏛️</span><span>Birth Certificate Portal</span>
          </Link>
        </div>
      </nav>

      <div style={{ minHeight: 'calc(100vh - 64px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
        <div style={{ width: '100%', maxWidth: '420px' }}>
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <div style={{
              width: '64px', height: '64px', margin: '0 auto 16px',
              background: 'linear-gradient(135deg, var(--primary), #8b5cf6)',
              borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px'
            }}>🔐</div>
            <h1 style={{ fontSize: '26px', marginBottom: '6px' }}>Staff Login</h1>
            <p className="text-muted text-sm">Sign in to access the review dashboard</p>
          </div>

          {/* Form */}
          <div className="card-glass" style={{ padding: '32px' }}>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              <div className="form-group">
                <label className="form-label" htmlFor="email">Email Address</label>
                <input
                  id="email"
                  type="email"
                  className="form-input"
                  placeholder="staff@example.com"
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

              <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading} style={{ marginTop: '4px' }}>
                {loading ? <><span className="spinner" /> Signing in...</> : '→ Sign In'}
              </button>
            </form>
          </div>

          {/* Dev hint */}
          <div className="card" style={{ marginTop: '16px', padding: '14px 18px' }}>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '6px', fontWeight: 600 }}>
              🛠️ Development — Default Accounts
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-faint)', lineHeight: '1.8' }}>
              Run <code style={{ background: 'rgba(255,255,255,0.08)', padding: '1px 6px', borderRadius: '4px' }}>/api/seed</code> once to create:<br />
              Verifier: <code>verifier@example.com</code> / <code>Verifier@123</code><br />
              Operator: <code>operator@example.com</code> / <code>Operator@123</code>
            </div>
          </div>

          <p className="text-center text-sm text-muted" style={{ marginTop: '20px' }}>
            <Link href="/">← Back to Public Portal</Link>
          </p>
        </div>
      </div>
    </>
  );
}
