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
  verifiedAt?: string;
  createdAt: string;
  status: string;
}

interface User { name: string; role: string; }

export default function ApprovePage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [apps, setApps] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Application | null>(null);
  const [action, setAction] = useState<'approve' | 'reject' | null>(null);
  const [reason, setReason] = useState('');
  const [acting, setActing] = useState(false);
  const [toast, setToast] = useState('');

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 3500); };

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
      if (u.role !== 'operator') { router.push('/login'); return; }
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
      showToast(action === 'approve' ? '🎉 Final certificate approved and issued to citizen!' : '❌ Application rejected.');
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
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--color-bg-light)' }}>
      <span className="spinner spinner-dark" style={{ width: '40px', height: '40px', borderWidth: '3px' }} />
    </div>
  );

  return (
    <>
      {/* Toast Notification */}
      {toast && (
        <div style={{
          position: 'fixed', top: '24px', right: '24px', zIndex: 300,
          backgroundColor: '#FFFFFF', border: '1px solid var(--color-border)',
          borderLeft: '4px solid var(--color-success)', borderRadius: 'var(--r-md)',
          padding: '12px 20px', fontSize: '14px', fontWeight: 600, color: 'var(--color-navy)',
          boxShadow: 'var(--shadow-md)'
        }}>
          {toast}
        </div>
      )}

      {/* Reject / Approve Modal */}
      {action && selected && (
        <div className="modal-overlay" onClick={() => setAction(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h3>{action === 'approve' ? '📜 Issue Official Birth Certificate' : '❌ Reject Registration Record'}</h3>
            <p style={{ marginTop: '6px', marginBottom: '16px' }}>
              Reference ID: <strong style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-navy)' }}>{selected.applicationNumber}</strong>
              {selected.childName ? ` (Child: ${selected.childName})` : ''}
            </p>
            {action === 'reject' && (
              <div className="form-group" style={{ marginBottom: '12px' }}>
                <label className="form-label">Official Rejection Reason <span className="req">*</span></label>
                <textarea
                  className="form-textarea"
                  placeholder="State the statutory reason for rejection..."
                  value={reason}
                  onChange={e => setReason(e.target.value)}
                />
              </div>
            )}
            {action === 'approve' && (
              <div className="alert alert-success" style={{ margin: '0 0 16px' }}>
                <span>📜</span>
                <span>
                  This constitutes <strong>statutory final approval</strong>. The legal birth certificate record will be generated, the applicant notified, and the record archived in the civil register.
                </span>
              </div>
            )}
            <div className="modal-actions">
              <button className="btn btn-ghost" onClick={() => { setAction(null); setReason(''); }}>Cancel</button>
              <button
                className={`btn ${action === 'approve' ? 'btn-success' : 'btn-danger'}`}
                onClick={handleAction}
                disabled={acting || (action === 'reject' && !reason.trim())}
              >
                {acting ? <span className="spinner" /> : action === 'approve' ? '✅ Authorize & Issue Certificate' : '❌ Reject'}
              </button>
            </div>
          </div>
        </div>
      )}

      <nav className="navbar">
        <div className="navbar-inner">
          <Link href="/" className="navbar-brand">
            <span className="emblem">🏛️</span>
            <div>
              <div>Birth Certificate Portal</div>
              <span className="navbar-brand-subtitle">Civil Registrar Operator Portal</span>
            </div>
          </Link>
          <div className="navbar-nav">
            <span style={{ fontSize: '14px', color: 'rgba(255,255,255,0.9)' }}>👤 {user?.name}</span>
            <span className="badge badge-operator_approved" style={{ backgroundColor: 'rgba(255,255,255,0.15)', color: '#FFFFFF', borderColor: 'rgba(255,255,255,0.3)' }}>
              Registrar Operator
            </span>
            <button className="btn btn-header-ghost btn-sm" onClick={logout}>Sign Out</button>
          </div>
        </div>
      </nav>

      <div className="container" style={{ padding: '36px 24px 80px' }}>
        <div className="page-header">
          <h1>🏛️ Final Registrar Approval Queue</h1>
          <p className="text-muted">Review hospital-verified records and grant statutory authorization for certificate generation.</p>
        </div>

        {apps.length === 0 ? (
          <div className="card-plain" style={{ textAlign: 'center', padding: '60px 24px', backgroundColor: '#FFFFFF', border: '1px solid var(--color-border)' }}>
            <div style={{ fontSize: '48px', marginBottom: '12px' }}>✨</div>
            <h3 style={{ color: 'var(--color-navy)', marginBottom: '6px' }}>All Verified Applications Processed</h3>
            <p className="text-muted">Hospital verified applications awaiting final authorization will appear in this queue.</p>
          </div>
        ) : (
          <>
            <div style={{ fontSize: '14px', color: 'var(--color-gray-text)', marginBottom: '16px', fontWeight: 600 }}>
              📋 {apps.length} application{apps.length !== 1 ? 's' : ''} awaiting registrar approval
            </div>

            {selected ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div className="flex justify-between items-center flex-wrap gap-3">
                  <button className="btn btn-ghost btn-sm" onClick={() => setSelected(null)}>← Back to Approval Queue</button>
                  <div className="flex gap-2">
                    <button className="btn btn-danger btn-sm" onClick={() => setAction('reject')}>❌ Reject Application</button>
                    <button className="btn btn-success btn-sm" onClick={() => setAction('approve')}>✅ Finalize & Issue Certificate</button>
                  </div>
                </div>

                <div className="alert alert-info">
                  <span>🏥</span>
                  <span>
                    This application was <strong>verified by the hospital medical authority</strong> on {selected.verifiedAt ? new Date(selected.verifiedAt).toLocaleDateString('en-IN') : '—'}.
                  </span>
                </div>

                <div className="app-number-display">
                  <div className="label">Application Reference Number</div>
                  <div className="number">{selected.applicationNumber}</div>
                </div>

                {[
                  { title: '👶 Child Information', fields: [['Date of Birth', new Date(selected.dateOfBirth).toLocaleDateString('en-IN')], ['Sex', selected.sex ? selected.sex.toUpperCase() : '—'], ['Name', selected.childName || 'Not yet named'], ['Place of Birth', selected.placeOfBirth], ['Delivery Method', selected.deliveryMethod], ['Birth Weight', selected.birthWeight ? `${selected.birthWeight} kg` : '—'], ['Gestation Period', selected.gestationPeriod ? `${selected.gestationPeriod} wks` : '—']] },
                  { title: '👨 Father Details', fields: [['Father\'s Name', selected.fatherName]] },
                  { title: '👩 Mother Details', fields: [['Mother\'s Name', selected.motherName], ['Age at Delivery', `${selected.motherAgeAtDelivery} years`]] },
                  { title: '📍 Location', fields: [['District', selected.district], ['State', selected.state]] },
                  { title: '📬 Contact Details', fields: [['Notification Email', selected.contactEmail], ['Informant', selected.informantName]] },
                ].map(s => (
                  <div className="form-section" key={s.title}>
                    <div className="form-section-title">{s.title}</div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '14px' }}>
                      {s.fields.map(([l, v]) => (
                        <div key={l}>
                          <div style={{ fontSize: '11px', color: 'var(--color-gray-text)', textTransform: 'uppercase', fontWeight: 700 }}>{l}</div>
                          <div style={{ fontSize: '14px', color: 'var(--color-text-primary)', fontWeight: 600, marginTop: '2px' }}>{v}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Reference No.</th>
                      <th>Child / Parents</th>
                      <th>DOB</th>
                      <th>Jurisdiction</th>
                      <th>Verified Date</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {apps.map(app => (
                      <tr key={app._id}>
                        <td><code style={{ color: 'var(--color-navy)', fontSize: '13px', fontWeight: 700 }}>{app.applicationNumber}</code></td>
                        <td>
                          <div style={{ fontWeight: 700, fontSize: '14px', color: 'var(--color-navy)' }}>{app.childName || <em style={{ color: 'var(--color-gray-text)', fontWeight: 400 }}>Not named</em>}</div>
                          <div style={{ fontSize: '12px', color: 'var(--color-gray-text)' }}>Parents: {app.fatherName} & {app.motherName}</div>
                        </td>
                        <td style={{ fontSize: '13px', fontWeight: 500 }}>{new Date(app.dateOfBirth).toLocaleDateString('en-IN')}</td>
                        <td style={{ fontSize: '13px', color: 'var(--color-gray-text)' }}>{app.district}, {app.state}</td>
                        <td style={{ fontSize: '12px', color: 'var(--color-gray-text)' }}>{app.verifiedAt ? new Date(app.verifiedAt).toLocaleDateString('en-IN') : '—'}</td>
                        <td>
                          <div className="flex gap-2">
                            <button className="btn btn-ghost btn-sm" onClick={() => setSelected(app)}>View</button>
                            <button className="btn btn-success btn-sm" onClick={() => { setSelected(app); setAction('approve'); }} title="Approve">✅</button>
                            <button className="btn btn-danger btn-sm" onClick={() => { setSelected(app); setAction('reject'); }} title="Reject">❌</button>
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

