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
  verifier_approved: 'Verified — Awaiting Final Approval',
  operator_approved: 'Approved ✓',
  rejected: 'Rejected',
};

const STATUS_COLORS: Record<AppStatus, string> = {
  pending: 'var(--warning)',
  verifier_approved: 'var(--info)',
  operator_approved: 'var(--success)',
  rejected: 'var(--danger)',
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
      if (!res.ok) throw new Error(json.error || 'Not found');
      setData(json.application);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Application not found');
    } finally {
      setLoading(false);
    }
  }

  // Auto-track if URL has ?app=...
  useEffect(() => {
    const a = params.get('app');
    if (a) { setAppNum(a); handleTrack(a); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const steps = data ? [
    { label: 'Application Submitted', done: true, date: data.createdAt, icon: '📋' },
    { label: 'Verification Review', done: data.status !== 'pending', active: data.status === 'pending', date: data.verifiedAt, icon: '🔍' },
    { label: 'Final Approval', done: data.status === 'operator_approved', active: data.status === 'verifier_approved', date: data.approvedAt, icon: '✅' },
    { label: 'Certificate Issued', done: data.status === 'operator_approved', icon: '📜' },
  ] : [];

  return (
    <div className="container-xs" style={{ padding: '60px 24px 80px' }}>
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <div style={{ fontSize: '48px', marginBottom: '12px' }}>🔍</div>
        <h1 style={{ fontSize: '28px', marginBottom: '8px' }}>Track Your Application</h1>
        <p className="text-muted">Enter your application number to check the current status</p>
      </div>

      {/* Search */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '32px' }}>
        <input
          type="text"
          className="form-input"
          placeholder="e.g. BC-2025-XXXXXXXX"
          value={appNum}
          onChange={e => setAppNum(e.target.value.toUpperCase())}
          onKeyDown={e => e.key === 'Enter' && handleTrack()}
          style={{ fontFamily: 'monospace', fontSize: '16px', letterSpacing: '1px', flex: 1 }}
          id="track-input"
        />
        <button className="btn btn-primary" onClick={() => handleTrack()} disabled={loading} style={{ flexShrink: 0 }}>
          {loading ? <span className="spinner" /> : '🔍 Search'}
        </button>
      </div>

      {error && <div className="alert alert-danger mb-4">{error}</div>}

      {data && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Status Banner */}
          <div className="card" style={{ borderColor: STATUS_COLORS[data.status], background: `${STATUS_COLORS[data.status]}10` }}>
            <div className="flex justify-between items-center flex-wrap gap-3">
              <div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600, marginBottom: '4px' }}>Application Number</div>
                <div style={{ fontSize: '22px', fontWeight: '800', fontFamily: 'monospace', letterSpacing: '2px', color: 'var(--text)' }}>{data.applicationNumber}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>Current Status</div>
                <span className={`badge badge-${data.status}`} style={{ fontSize: '13px', padding: '6px 14px' }}>
                  {STATUS_LABELS[data.status]}
                </span>
              </div>
            </div>
          </div>

          {/* Rejection Notice */}
          {data.status === 'rejected' && data.rejectionReason && (
            <div className="alert alert-danger">
              <span>❌</span>
              <div>
                <strong>Rejection Reason:</strong><br />
                {data.rejectionReason}
                <div style={{ marginTop: '8px' }}>
                  <Link href="/apply" className="btn btn-primary btn-sm">Submit New Application</Link>
                </div>
              </div>
            </div>
          )}

          {/* Approval Notice */}
          {data.status === 'operator_approved' && (
            <div className="alert alert-success">
              <span>🎉</span>
              <div>
                <strong>Congratulations! Your application has been approved.</strong><br />
                Please visit your local Registration Office with your application number to collect the physical birth certificate.
              </div>
            </div>
          )}

          {/* Timeline */}
          <div className="card">
            <h3 style={{ fontSize: '16px', marginBottom: '24px' }}>Application Progress</h3>
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
            <h3 style={{ fontSize: '16px', marginBottom: '16px' }}>Application Details</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              {[
                ['Child Name', data.childName || 'Not provided'],
                ['Date of Birth', fmt(data.dateOfBirth)],
                ['Sex', data.sex],
                ['Father\'s Name', data.fatherName],
                ['Mother\'s Name', data.motherName],
                ['District', data.district],
                ['State', data.state],
                ['Applied On', fmt(data.createdAt)],
              ].map(([l, v]) => (
                <div key={l}>
                  <div style={{ fontSize: '11px', color: 'var(--text-faint)', textTransform: 'uppercase', fontWeight: 600, marginBottom: '2px' }}>{l}</div>
                  <div style={{ fontSize: '14px', color: 'var(--text)', fontWeight: 500 }}>{v}</div>
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
            <span className="emblem">🏛️</span><span>Birth Certificate Portal</span>
          </Link>
          <div className="navbar-nav">
            <Link href="/apply" className="btn btn-primary" style={{ padding: '8px 16px', fontSize: '14px' }}>
              Apply Now
            </Link>
          </div>
        </div>
      </nav>
      <Suspense fallback={<div style={{ textAlign: 'center', padding: '80px' }}>Loading...</div>}>
        <TrackContent />
      </Suspense>
    </>
  );
}
