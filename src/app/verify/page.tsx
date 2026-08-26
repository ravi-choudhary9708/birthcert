'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Application {
  _id: string;
  applicationNumber: string;
  childName?: string;
  dateOfBirth: string;
  sex: string;
  fatherName: string;
  motherName: string;
  district: string;
  state: string;
  contactEmail: string;
  placeOfBirth: string;
  deliveryMethod: string;
  birthWeight?: number;
  gestationPeriod?: number;
  motherAgeAtDelivery: number;
  informantName: string;
  createdAt: string;
  status: string;
}

interface User { name: string; role: string; }

export default function VerifyPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [apps, setApps] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Application | null>(null);
  const [action, setAction] = useState<'approve' | 'reject' | null>(null);
  const [reason, setReason] = useState('');
  const [acting, setActing] = useState(false);
  const [toast, setToast] = useState('');

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const fetchApps = useCallback(async () => {
    const res = await fetch('/api/applications');
    if (res.status === 401) { router.push('/login'); return; }
    const data = await res.json();
    setApps(data.applications ?? []);
  }, [router]);

  useEffect(() => {
    (async () => {
      const res = await fetch('/api/auth/me');
      if (!res.ok) { router.push('/login'); return; }
      const u = await res.json();
      if (u.role !== 'verifier') { router.push('/login'); return; }
      setUser(u);
      await fetchApps();
      setLoading(false);
    })();
  }, [router, fetchApps]);

  async function handleAction() {
    if (!selected || !action) return;
    if (action === 'reject' && !reason.trim()) return;
    setActing(true);
    try {
      const res = await fetch(`/api/applications/${selected._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, rejectionReason: reason }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      showToast(action === 'approve' ? '✅ Application verified & forwarded to Operator' : '❌ Application rejected');
      setSelected(null); setAction(null); setReason('');
      await fetchApps();
    } catch (e: unknown) {
      showToast(e instanceof Error ? e.message : 'Error');
    } finally {
      setActing(false);
    }
  }

  async function logout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
  }

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <span className="spinner" style={{ width: '40px', height: '40px', borderWidth: '3px' }} />
    </div>
  );

  return (
    <>
      {/* Toast */}
      {toast && (
        <div style={{ position: 'fixed', top: '20px', right: '20px', zIndex: 300, background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '10px', padding: '12px 20px', fontSize: '14px', boxShadow: 'var(--shadow)', animation: 'fadeIn 0.2s ease' }}>
          {toast}
        </div>
      )}

      {/* Reject / Approve Modal */}
      {action && selected && (
        <div className="modal-overlay" onClick={() => setAction(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h3>{action === 'approve' ? '✅ Approve Application' : '❌ Reject Application'}</h3>
            <p>
              Application <strong>{selected.applicationNumber}</strong>
              {selected.childName ? ` for ${selected.childName}` : ''}
            </p>
            {action === 'reject' && (
              <div className="form-group" style={{ marginBottom: '4px' }}>
                <label className="form-label">Rejection Reason <span className="req">*</span></label>
                <textarea
                  className="form-textarea"
                  placeholder="Explain the reason for rejection so the parent can resubmit correctly..."
                  value={reason}
                  onChange={e => setReason(e.target.value)}
                />
              </div>
            )}
            {action === 'approve' && (
              <div className="alert alert-info" style={{ margin: '0 0 8px' }}>
                This will mark the application as verified and notify the parent. It will then appear in the Operator&apos;s queue for final approval.
              </div>
            )}
            <div className="modal-actions">
              <button className="btn btn-ghost" onClick={() => { setAction(null); setReason(''); }}>Cancel</button>
              <button
                className={`btn ${action === 'approve' ? 'btn-success' : 'btn-danger'}`}
                onClick={handleAction}
                disabled={acting || (action === 'reject' && !reason.trim())}
              >
                {acting ? <span className="spinner" /> : action === 'approve' ? '✅ Confirm Approval' : '❌ Confirm Rejection'}
              </button>
            </div>
          </div>
        </div>
      )}

      <nav className="navbar">
        <div className="navbar-inner">
          <Link href="/" className="navbar-brand">
            <span className="emblem">🏛️</span><span>Birth Certificate Portal</span>
          </Link>
          <div className="navbar-nav">
            <span style={{ fontSize: '14px', color: 'var(--text-muted)' }}>👋 {user?.name}</span>
            <span className="badge badge-verifier_approved">Verifier</span>
            <button className="btn btn-ghost btn-sm" onClick={logout}>Logout</button>
          </div>
        </div>
      </nav>

      <div className="container" style={{ padding: '32px 24px 80px' }}>
        <div className="page-header">
          <h1>🔍 Verification Queue</h1>
          <p className="text-muted">Review and verify pending birth certificate applications. Approved applications move to the Operator queue.</p>
        </div>

        {apps.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '60px' }}>
            <div style={{ fontSize: '48px', marginBottom: '12px' }}>🎉</div>
            <h3>All caught up!</h3>
            <p className="text-muted">No pending applications to review.</p>
          </div>
        ) : (
          <>
            <div style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '16px' }}>
              {apps.length} application{apps.length !== 1 ? 's' : ''} pending review
            </div>

            {/* Selected Detail View */}
            {selected ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div className="flex justify-between items-center flex-wrap gap-3">
                  <button className="btn btn-ghost btn-sm" onClick={() => setSelected(null)}>← Back to List</button>
                  <div className="flex gap-2">
                    <button className="btn btn-danger btn-sm" onClick={() => setAction('reject')}>❌ Reject</button>
                    <button className="btn btn-success" onClick={() => setAction('approve')}>✅ Verify & Forward</button>
                  </div>
                </div>

                <div className="app-number-display">
                  <div className="label">Application Number</div>
                  <div className="number">{selected.applicationNumber}</div>
                </div>

                {[
                  { title: '👶 Child', fields: [['Date of Birth', new Date(selected.dateOfBirth).toLocaleDateString('en-IN')], ['Sex', selected.sex], ['Name', selected.childName || '—'], ['Place of Birth', selected.placeOfBirth], ['Delivery', selected.deliveryMethod], ['Birth Weight', selected.birthWeight ? `${selected.birthWeight} kg` : '—'], ['Gestation', selected.gestationPeriod ? `${selected.gestationPeriod} wks` : '—']] },
                  { title: '👨 Father', fields: [['Name', selected.fatherName]] },
                  { title: '👩 Mother', fields: [['Name', selected.motherName], ['Age at Delivery', `${selected.motherAgeAtDelivery} yrs`]] },
                  { title: '📍 Location', fields: [['District', selected.district], ['State', selected.state]] },
                  { title: '📬 Contact', fields: [['Notification Email', selected.contactEmail], ['Informant', selected.informantName]] },
                ].map(s => (
                  <div className="form-section" key={s.title}>
                    <div className="form-section-title">{s.title}</div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '12px' }}>
                      {s.fields.map(([l, v]) => (
                        <div key={l}>
                          <div style={{ fontSize: '11px', color: 'var(--text-faint)', textTransform: 'uppercase', fontWeight: 600 }}>{l}</div>
                          <div style={{ fontSize: '14px', color: 'var(--text)', fontWeight: 500 }}>{v}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              /* List View */
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Application No.</th>
                      <th>Child / Parents</th>
                      <th>DOB</th>
                      <th>Location</th>
                      <th>Submitted</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {apps.map(app => (
                      <tr key={app._id}>
                        <td>
                          <code style={{ color: 'var(--accent)', fontSize: '13px' }}>{app.applicationNumber}</code>
                        </td>
                        <td>
                          <div style={{ fontWeight: 600, fontSize: '14px' }}>{app.childName || <em style={{ color: 'var(--text-faint)' }}>Not named</em>}</div>
                          <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{app.fatherName} & {app.motherName}</div>
                        </td>
                        <td style={{ fontSize: '13px' }}>{new Date(app.dateOfBirth).toLocaleDateString('en-IN')}</td>
                        <td style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{app.district}, {app.state}</td>
                        <td style={{ fontSize: '12px', color: 'var(--text-faint)' }}>{new Date(app.createdAt).toLocaleDateString('en-IN')}</td>
                        <td>
                          <div className="flex gap-2">
                            <button className="btn btn-ghost btn-sm" onClick={() => setSelected(app)}>View</button>
                            <button className="btn btn-success btn-sm" onClick={() => { setSelected(app); setAction('approve'); }}>✅</button>
                            <button className="btn btn-danger btn-sm" onClick={() => { setSelected(app); setAction('reject'); }}>❌</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}
