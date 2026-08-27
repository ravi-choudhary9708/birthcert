'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

type AppStatus = 'pending' | 'verifier_approved' | 'operator_approved' | 'rejected';

interface TrackData {
  applicationNumber: string;
  status: AppStatus;
  childName?: string;
  dateOfBirth: string;
  sex: string;
  fatherName: string;
  motherName: string;
  district: string;
  state: string;
  createdAt: string;
  verifiedAt?: string;
  approvedAt?: string;
  rejectionReason?: string;
}

const STATUS_LABELS: Record<AppStatus, string> = {
  pending: 'Pending Review',
  verifier_approved: 'Hospital Verified — Awaiting Final Approval',
  operator_approved: 'Certificate Approved & Ready ✓',
  rejected: 'Application Rejected',
};

const STATUS_BORDER_COLORS: Record<AppStatus, string> = {
  pending: 'var(--color-alert)',
  verifier_approved: 'var(--color-teal)',
  operator_approved: 'var(--color-success)',
  rejected: 'var(--color-danger)',
};

function fmt(d?: string) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

function TrackContent() {
  const params = useSearchParams();
  const [appNum, setAppNum] = useState(params.get('app') ?? '');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<TrackData | null>(null);
  const [error, setError] = useState('');

  async function handleTrack(num?: string) {
    const query = (num ?? appNum).trim().toUpperCase();
    if (!query) { setError('Please enter an application number'); return; }
    setLoading(true); setError(''); setData(null);
    try {
      const res = await fetch(`/api/track?app=${encodeURIComponent(query)}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Application record not found');
      setData(json.application);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Application not found');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const a = params.get('app');
    if (a) { setAppNum(a); handleTrack(a); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const steps = data ? [
    { label: 'Application Submitted', done: true, date: data.createdAt, icon: '📋' },
    { label: 'Hospital Verification', done: data.status !== 'pending', active: data.status === 'pending', date: data.verifiedAt, icon: '🏥' },
    { label: 'Registrar Final Approval', done: data.status === 'operator_approved', active: data.status === 'verifier_approved', date: data.approvedAt, icon: '🏛️' },
    { label: 'Official Certificate Issuance', done: data.status === 'operator_approved', icon: '📜' },
  ] : [];

  return (
    <div className="container-xs" style={{ padding: '48px 24px 80px' }}>
      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <div style={{
          width: '56px', height: '56px', margin: '0 auto 12px',
          backgroundColor: 'var(--color-navy)',
          color: '#FFFFFF',
          borderRadius: 'var(--r-lg)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px',
          boxShadow: '0 4px 12px rgba(27, 59, 111, 0.2)'
        }}>🔍</div>
        <h1 style={{ fontSize: '26px', marginBottom: '6px', color: 'var(--color-navy)' }}>Track Application Status</h1>
        <p className="text-muted" style={{ fontSize: '14px' }}>
          Enter your unique Application Reference Number (e.g., <code style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>BC-2025-XXXX</code>)
        </p>
      </div>

      {/* Search Input */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '28px' }}>
        <input
          type="text"
          className="form-input"
          placeholder="Enter BC-2025-XXXXXXXX"
          value={appNum}
          onChange={e => setAppNum(e.target.value.toUpperCase())}
          onKeyDown={e => e.key === 'Enter' && handleTrack()}
          style={{ fontFamily: 'var(--font-mono)', fontSize: '15px', letterSpacing: '1px', flex: 1 }}
          id="track-input"
        />
        <button className="btn btn-primary" onClick={() => handleTrack()} disabled={loading} style={{ flexShrink: 0 }}>
          {loading ? <span className="spinner" /> : '🔍 Check Status'}
        </button>
      </div>

      {error && <div className="alert alert-danger mb-4"><span>⚠️</span> {error}</div>}

      {data && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Status Banner */}
          <div className="card" style={{ borderLeft: `6px solid ${STATUS_BORDER_COLORS[data.status]}` }}>
            <div className="flex justify-between items-center flex-wrap gap-3">
              <div>
                <div style={{ fontSize: '11px', color: 'var(--color-gray-text)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.05em', marginBottom: '4px' }}>Application Number</div>
                <div style={{ fontSize: '22px', fontWeight: '800', fontFamily: 'var(--font-mono)', letterSpacing: '2px', color: 'var(--color-navy)' }}>{data.applicationNumber}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '11px', color: 'var(--color-gray-text)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.05em', marginBottom: '4px' }}>Current Status</div>
                <span className={`badge badge-${data.status}`} style={{ fontSize: '13px', padding: '6px 14px' }}>
                  {STATUS_LABELS[data.status]}
                </span>
              </div>
            </div>
          </div>

          {/* Rejection Notice */}
          {data.status === 'rejected' && data.rejectionReason && (
            <div className="alert alert-danger">
              <span style={{ fontSize: '20px' }}>❌</span>
              <div>
                <strong>Application Action Required:</strong>
                <p style={{ marginTop: '4px', marginBottom: '8px' }}>{data.rejectionReason}</p>
                <Link href="/apply" className="btn btn-primary btn-sm">Submit New Registration</Link>
              </div>
            </div>
          )}

          {/* Approval Notice */}
          {data.status === 'operator_approved' && (
            <div className="alert alert-success">
              <span style={{ fontSize: '20px' }}>🏛️</span>
              <div>
                <strong>Official Birth Certificate Approved & Generated</strong>
                <p style={{ marginTop: '4px' }}>
                  Your birth certificate registration has been officially approved. You may collect your physical certificate from the designated Municipal Civil Registration Office or download the digital signed record.
                </p>
              </div>
            </div>
          )}

          {/* Timeline */}
          <div className="card-plain" style={{ backgroundColor: '#FFFFFF', border: '1px solid var(--color-border)', borderRadius: 'var(--r-md)', padding: '24px' }}>
            <h3 style={{ fontSize: '16px', marginBottom: '20px', color: 'var(--color-navy)' }}>Application Verification Workflow</h3>
            <div className="timeline">
              {steps.map((s, i) => (
                <div key={i} className={`timeline-item ${s.done ? 'done' : ''} ${s.active && !s.done ? 'active' : ''} ${data.status === 'rejected' && i === 1 ? 'rejected' : ''}`}>
                  {i < steps.length - 1 && <div className="timeline-line" />}
                  <div className="timeline-dot">{s.done ? '✓' : s.icon}</div>
                  <div className="timeline-content">
                    <h4>{s.label}</h4>
                    <p>{s.date ? fmt(s.date) : s.done || s.active ? 'In progress...' : 'Pending'}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Application Details */}
          <div className="card">
            <h3 style={{ fontSize: '16px', marginBottom: '16px', color: 'var(--color-navy)' }}>Registered Application Summary</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              {[
                ['Child Name', data.childName || 'Not provided (unnamed at birth)'],
                ['Date of Birth', fmt(data.dateOfBirth)],
                ['Sex', data.sex ? data.sex.toUpperCase() : '—'],
                ['Father\'s Name', data.fatherName],
                ['Mother\'s Name', data.motherName],
                ['District', data.district],
                ['State', data.state],
                ['Date Applied', fmt(data.createdAt)],
              ].map(([l, v]) => (
                <div key={l}>
                  <div style={{ fontSize: '11px', color: 'var(--color-gray-text)', textTransform: 'uppercase', fontWeight: 700, marginBottom: '2px' }}>{l}</div>
                  <div style={{ fontSize: '14px', color: 'var(--color-text-primary)', fontWeight: 600 }}>{v}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function TrackPage() {
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
            <Link href="/apply" className="btn btn-primary" style={{ padding: '8px 16px', fontSize: '14px' }}>
              📋 Apply Online
            </Link>
          </div>
        </div>
      </nav>

      <main style={{ flex: 1, backgroundColor: 'var(--color-bg-light)' }}>
        <Suspense fallback={<div style={{ textAlign: 'center', padding: '80px', color: 'var(--color-gray-text)' }}>Loading application tracking...</div>}>
          <TrackContent />
        </Suspense>
      </main>

      <footer className="footer">
        <div className="footer-bottom" style={{ borderTop: 'none', paddingTop: 0 }}>
          <div>© {new Date().getFullYear()} Civil Registration System, Government of India.</div>
          <div><Link href="/" style={{ color: 'rgba(255,255,255,0.75)' }}>← Back to Public Portal</Link></div>
        </div>
      </footer>
    </>
  );
}

