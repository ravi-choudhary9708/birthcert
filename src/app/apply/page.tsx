'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

const STEPS = ['Child Info', 'Father Details', 'Mother Details', 'Address & Birth', 'Review & Submit'];

const RELIGIONS = ['Hindu', 'Muslim', 'Christian', 'Sikh', 'Buddhist', 'Jain', 'Other'];
const EDUCATION = ['Illiterate', 'Primary (1–5)', 'Middle (6–8)', 'Secondary (9–10)', 'Higher Secondary (11–12)', 'Graduate', 'Post Graduate', 'Other'];

type FormData = Record<string, string | number>;

const initialForm: FormData = {
  dateOfBirth: '',
  sex: '',
  childName: '',
  hospitalId: '',  // NEW: Hospital selection
  fatherName: '',
  fatherMobile: '',
  fatherEmail: '',
  fatherAadhaar: '',
  fatherReligion: '',
  fatherEducation: '',
  fatherOccupation: '',
  motherName: '',
  motherMobile: '',
  motherEmail: '',
  motherAadhaar: '',
  motherReligion: '',
  motherEducation: '',
  motherOccupation: '',
  motherAgeAtDelivery: '',
  contactEmail: '',
  addressAtBirth: '',
  permanentAddress: '',
  village: '',
  subDistrict: '',
  district: '',
  state: '',
  pinCode: '',
  placeOfBirth: '',
  institutionName: '',
  institutionAddress: '',
  informantName: '',
  informantMobile: '',
  birthWeight: '',
  gestationPeriod: '',
  deliveryMethod: '',
};

export default function ApplyPage() {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FormData>(initialForm);
  const [hospitals, setHospitals] = useState<Array<{ _id: string; hospitalNo: number; name: string; district: string }>>([]);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [appNumber, setAppNumber] = useState('');
  const [error, setError] = useState('');

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  // Load hospitals on component mount
  useEffect(() => {
    async function loadHospitals() {
      try {
        const res = await fetch('/api/hospitals');
        const data = await res.json();
        setHospitals(data.hospitals || []);
      } catch (err) {
        console.error('Failed to load hospitals:', err);
      }
    }
    loadHospitals();
  }, []);

  async function handleSubmit() {
    setSubmitting(true);
    setError('');
    try {
      const res = await fetch('/api/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Submission failed');
      setAppNumber(data.applicationNumber);
      setSubmitted(true);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Something went wrong');
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <>
        <nav className="navbar">
          <div className="navbar-inner">
            <Link href="/" className="navbar-brand">
              <span className="emblem">🏛️</span><span>Birth Certificate Portal</span>
            </Link>
          </div>
        </nav>
        <div className="container-xs" style={{ padding: '80px 24px', textAlign: 'center' }}>
          <div style={{ fontSize: '64px', marginBottom: '16px' }}>🎉</div>
          <h1 style={{ fontSize: '28px', marginBottom: '8px' }}>Application Submitted!</h1>
          <p className="text-muted" style={{ marginBottom: '32px' }}>
            A confirmation email has been sent to <strong>{form.contactEmail}</strong>
          </p>

          <div className="app-number-display" style={{ marginBottom: '32px' }}>
            <div className="label">Your Application Number</div>
            <div className="number">{appNumber}</div>
            <div className="text-muted text-sm mt-2">Save this number to track your application</div>
          </div>

          <div className="alert alert-info" style={{ marginBottom: '24px', textAlign: 'left' }}>
            <span>📩</span>
            <div>
              <strong>What happens next?</strong><br />
              Your application will be reviewed by our verification team. You&apos;ll receive email updates at each step. Final approval typically takes 3–5 business days.
            </div>
          </div>

          <div className="flex gap-3 justify-center flex-wrap">
            <Link href={`/track?app=${appNumber}`} className="btn btn-primary btn-lg">
              🔍 Track Your Application
            </Link>
            <Link href="/" className="btn btn-ghost">
              Back to Home
            </Link>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <nav className="navbar">
        <div className="navbar-inner">
          <Link href="/" className="navbar-brand">
            <span className="emblem">🏛️</span><span>Birth Certificate Portal</span>
          </Link>
          <div className="navbar-nav">
            <Link href="/track" className="nav-link">🔍 Track</Link>
          </div>
        </div>
      </nav>

      <div className="container-sm" style={{ padding: '40px 24px 80px' }}>
        <div className="page-header">
          <h1>📋 Birth Certificate Application</h1>
          <p className="text-muted">Fill all required fields. You will receive your application number by email.</p>
        </div>

        {/* Steps */}
        <div className="steps" style={{ gap: '24px' }}>
          {STEPS.map((s, i) => (
            <div key={s} className={`step-item ${i < step ? 'done' : i === step ? 'active' : ''}`}>
              <div className="step-dot">{i < step ? '✓' : i + 1}</div>
              <div className="step-label">{s}</div>
            </div>
          ))}
        </div>

        {/* ── Step 0: Child Info ── */}
        {step === 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="form-section">
              <div className="form-section-title">🏥 Hospital Selection</div>
              <div className="form-group">
                <label className="form-label">Select Hospital <span className="req">*</span></label>
                <select className="form-select" value={form.hospitalId as string} onChange={e => set('hospitalId', e.target.value)}>
                  <option value="">Choose the hospital where birth occurred</option>
                  {hospitals.map(h => (
                    <option key={h._id} value={h._id}>
                      H{h.hospitalNo.toString().padStart(2, '0')} - {h.name} ({h.district})
                    </option>
                  ))}
                </select>
                <span className="form-hint">Select the hospital that will verify your application</span>
              </div>
            </div>

            <div className="form-section">
              <div className="form-section-title">👶 Child Information</div>
              <div className="form-row form-row-2">
                <div className="form-group">
                  <label className="form-label">Date of Birth <span className="req">*</span></label>
                  <input type="date" className="form-input" value={form.dateOfBirth as string} onChange={e => set('dateOfBirth', e.target.value)} max={new Date().toISOString().split('T')[0]} />
                </div>
                <div className="form-group">
                  <label className="form-label">Sex <span className="req">*</span></label>
                  <select className="form-select" value={form.sex as string} onChange={e => set('sex', e.target.value)}>
                    <option value="">Select</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="transgender">Transgender</option>
                  </select>
                </div>
              </div>
              <div className="form-group mt-4">
                <label className="form-label">Child&apos;s Name <span className="form-hint">(Optional — if not named yet, leave blank)</span></label>
                <input type="text" className="form-input" placeholder="Enter child's name" value={form.childName as string} onChange={e => set('childName', e.target.value)} />
              </div>
            </div>

            <div className="form-section">
              <div className="form-section-title">📍 Place of Birth</div>
              <div className="form-group">
                <label className="form-label">Place of Birth <span className="req">*</span></label>
                <select className="form-select" value={form.placeOfBirth as string} onChange={e => set('placeOfBirth', e.target.value)}>
                  <option value="">Select</option>
                  <option value="hospital">Hospital / Institution</option>
                  <option value="home">Home</option>
                  <option value="other">Other</option>
                </select>
              </div>
              {form.placeOfBirth === 'hospital' && (
                <div className="form-row form-row-2 mt-4">
                  <div className="form-group">
                    <label className="form-label">Institution Name</label>
                    <input type="text" className="form-input" placeholder="Hospital / Clinic name" value={form.institutionName as string} onChange={e => set('institutionName', e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Institution Address</label>
                    <input type="text" className="form-input" placeholder="Address" value={form.institutionAddress as string} onChange={e => set('institutionAddress', e.target.value)} />
                  </div>
                </div>
              )}
            </div>

            <div className="form-section">
              <div className="form-section-title">🏥 Medical Information</div>
              <div className="form-row form-row-3">
                <div className="form-group">
                  <label className="form-label">Birth Weight (kg)</label>
                  <input type="number" className="form-input" placeholder="e.g. 3.2" step="0.1" min="0.5" max="6" value={form.birthWeight as string} onChange={e => set('birthWeight', e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Gestation (weeks)</label>
                  <input type="number" className="form-input" placeholder="e.g. 40" min="20" max="45" value={form.gestationPeriod as string} onChange={e => set('gestationPeriod', e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Delivery Method <span className="req">*</span></label>
                  <select className="form-select" value={form.deliveryMethod as string} onChange={e => set('deliveryMethod', e.target.value)}>
                    <option value="">Select</option>
                    <option value="normal">Normal</option>
                    <option value="caesarean">Caesarean (C-Section)</option>
                    <option value="forceps">Forceps / Assisted</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex justify-between mt-4">
              <div />
              <button className="btn btn-primary" onClick={() => {
                if (!form.hospitalId || !form.dateOfBirth || !form.sex || !form.placeOfBirth || !form.deliveryMethod) {
                  setError('Please fill all required fields including hospital selection'); return;
                }
                setError(''); setStep(1);
              }}>Next: Father Details →</button>
            </div>
            {error && <div className="alert alert-danger">{error}</div>}
          </div>
        )}

        {/* ── Step 1: Father ── */}
        {step === 1 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="form-section">
              <div className="form-section-title">👨 Father&apos;s Details</div>
              <div className="form-row form-row-2">
                <div className="form-group">
                  <label className="form-label">Full Name <span className="req">*</span></label>
                  <input type="text" className="form-input" placeholder="Father's full name" value={form.fatherName as string} onChange={e => set('fatherName', e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Aadhaar Number <span className="form-hint">(Optional)</span></label>
                  <input type="text" className="form-input" placeholder="XXXX XXXX XXXX" maxLength={14} value={form.fatherAadhaar as string} onChange={e => set('fatherAadhaar', e.target.value)} />
                </div>
              </div>
              <div className="form-row form-row-2 mt-4">
                <div className="form-group">
                  <label className="form-label">Mobile <span className="req">*</span></label>
                  <input type="tel" className="form-input" placeholder="10-digit mobile" maxLength={10} value={form.fatherMobile as string} onChange={e => set('fatherMobile', e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Email <span className="req">*</span></label>
                  <input type="email" className="form-input" placeholder="email@example.com" value={form.fatherEmail as string} onChange={e => set('fatherEmail', e.target.value)} />
                </div>
              </div>
              <div className="form-row form-row-3 mt-4">
                <div className="form-group">
                  <label className="form-label">Religion <span className="req">*</span></label>
                  <select className="form-select" value={form.fatherReligion as string} onChange={e => set('fatherReligion', e.target.value)}>
                    <option value="">Select</option>
                    {RELIGIONS.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Education <span className="req">*</span></label>
                  <select className="form-select" value={form.fatherEducation as string} onChange={e => set('fatherEducation', e.target.value)}>
                    <option value="">Select</option>
                    {EDUCATION.map(e => <option key={e} value={e}>{e}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Occupation <span className="req">*</span></label>
                  <input type="text" className="form-input" placeholder="e.g. Teacher, Farmer" value={form.fatherOccupation as string} onChange={e => set('fatherOccupation', e.target.value)} />
                </div>
              </div>
            </div>

            <div className="flex justify-between mt-4">
              <button className="btn btn-ghost" onClick={() => { setError(''); setStep(0); }}>← Back</button>
              <button className="btn btn-primary" onClick={() => {
                if (!form.fatherName || !form.fatherMobile || !form.fatherEmail || !form.fatherReligion || !form.fatherEducation || !form.fatherOccupation) {
                  setError('Please fill all required father details'); return;
                }
                setError(''); setStep(2);
              }}>Next: Mother Details →</button>
            </div>
            {error && <div className="alert alert-danger">{error}</div>}
          </div>
        )}

        {/* ── Step 2: Mother ── */}
        {step === 2 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="form-section">
              <div className="form-section-title">👩 Mother&apos;s Details</div>
              <div className="form-row form-row-2">
                <div className="form-group">
                  <label className="form-label">Full Name <span className="req">*</span></label>
                  <input type="text" className="form-input" placeholder="Mother's full name" value={form.motherName as string} onChange={e => set('motherName', e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Aadhaar Number <span className="form-hint">(Optional)</span></label>
                  <input type="text" className="form-input" placeholder="XXXX XXXX XXXX" maxLength={14} value={form.motherAadhaar as string} onChange={e => set('motherAadhaar', e.target.value)} />
                </div>
              </div>
              <div className="form-row form-row-2 mt-4">
                <div className="form-group">
                  <label className="form-label">Mobile <span className="req">*</span></label>
                  <input type="tel" className="form-input" placeholder="10-digit mobile" maxLength={10} value={form.motherMobile as string} onChange={e => set('motherMobile', e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Email <span className="req">*</span></label>
                  <input type="email" className="form-input" placeholder="email@example.com" value={form.motherEmail as string} onChange={e => set('motherEmail', e.target.value)} />
                </div>
              </div>
              <div className="form-row form-row-3 mt-4">
                <div className="form-group">
                  <label className="form-label">Religion <span className="req">*</span></label>
                  <select className="form-select" value={form.motherReligion as string} onChange={e => set('motherReligion', e.target.value)}>
                    <option value="">Select</option>
                    {RELIGIONS.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Education <span className="req">*</span></label>
                  <select className="form-select" value={form.motherEducation as string} onChange={e => set('motherEducation', e.target.value)}>
                    <option value="">Select</option>
                    {EDUCATION.map(e => <option key={e} value={e}>{e}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Occupation <span className="req">*</span></label>
                  <input type="text" className="form-input" placeholder="e.g. Teacher, Homemaker" value={form.motherOccupation as string} onChange={e => set('motherOccupation', e.target.value)} />
                </div>
              </div>
              <div className="form-row form-row-2 mt-4">
                <div className="form-group">
                  <label className="form-label">Age at Delivery (years) <span className="req">*</span></label>
                  <input type="number" className="form-input" placeholder="e.g. 28" min="15" max="55" value={form.motherAgeAtDelivery as string} onChange={e => set('motherAgeAtDelivery', e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Notification Email <span className="req">*</span></label>
                  <input type="email" className="form-input" placeholder="Best email for updates" value={form.contactEmail as string} onChange={e => set('contactEmail', e.target.value)} />
                  <span className="form-hint">All status notifications will be sent here</span>
                </div>
              </div>
            </div>

            <div className="form-section">
              <div className="form-section-title">👤 Informant Details</div>
              <div className="form-row form-row-2">
                <div className="form-group">
                  <label className="form-label">Informant&apos;s Name <span className="req">*</span></label>
                  <input type="text" className="form-input" placeholder="Person providing information" value={form.informantName as string} onChange={e => set('informantName', e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Informant&apos;s Mobile <span className="req">*</span></label>
                  <input type="tel" className="form-input" placeholder="10-digit mobile" maxLength={10} value={form.informantMobile as string} onChange={e => set('informantMobile', e.target.value)} />
                </div>
              </div>
            </div>

            <div className="flex justify-between mt-4">
              <button className="btn btn-ghost" onClick={() => { setError(''); setStep(1); }}>← Back</button>
              <button className="btn btn-primary" onClick={() => {
                if (!form.motherName || !form.motherMobile || !form.motherEmail || !form.motherReligion || !form.motherEducation || !form.motherOccupation || !form.motherAgeAtDelivery || !form.contactEmail || !form.informantName || !form.informantMobile) {
                  setError('Please fill all required mother details'); return;
                }
                setError(''); setStep(3);
              }}>Next: Address →</button>
            </div>
            {error && <div className="alert alert-danger">{error}</div>}
          </div>
        )}

        {/* ── Step 3: Address ── */}
        {step === 3 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="form-section">
              <div className="form-section-title">🏠 Address Details</div>
              <div className="form-group">
                <label className="form-label">Address at Time of Birth <span className="req">*</span></label>
                <textarea className="form-textarea" placeholder="Full address where parents resided at time of birth" value={form.addressAtBirth as string} onChange={e => set('addressAtBirth', e.target.value)} />
              </div>
              <div className="form-group mt-4">
                <label className="form-label">Permanent Address <span className="req">*</span></label>
                <textarea className="form-textarea" placeholder="Permanent address of parents" value={form.permanentAddress as string} onChange={e => set('permanentAddress', e.target.value)} />
              </div>
              <div className="form-row form-row-2 mt-4">
                <div className="form-group">
                  <label className="form-label">Village / Town <span className="req">*</span></label>
                  <input type="text" className="form-input" placeholder="Village or Town" value={form.village as string} onChange={e => set('village', e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Sub-District <span className="req">*</span></label>
                  <input type="text" className="form-input" placeholder="Sub-District / Tehsil" value={form.subDistrict as string} onChange={e => set('subDistrict', e.target.value)} />
                </div>
              </div>
              <div className="form-row form-row-3 mt-4">
                <div className="form-group">
                  <label className="form-label">District <span className="req">*</span></label>
                  <input type="text" className="form-input" placeholder="District" value={form.district as string} onChange={e => set('district', e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">State <span className="req">*</span></label>
                  <input type="text" className="form-input" placeholder="State" value={form.state as string} onChange={e => set('state', e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">PIN Code <span className="req">*</span></label>
                  <input type="text" className="form-input" placeholder="6-digit PIN" maxLength={6} value={form.pinCode as string} onChange={e => set('pinCode', e.target.value)} />
                </div>
              </div>
            </div>

            <div className="flex justify-between mt-4">
              <button className="btn btn-ghost" onClick={() => { setError(''); setStep(2); }}>← Back</button>
              <button className="btn btn-primary" onClick={() => {
                if (!form.addressAtBirth || !form.permanentAddress || !form.village || !form.subDistrict || !form.district || !form.state || !form.pinCode) {
                  setError('Please fill all required address fields'); return;
                }
                setError(''); setStep(4);
              }}>Review & Submit →</button>
            </div>
            {error && <div className="alert alert-danger">{error}</div>}
          </div>
        )}

        {/* ── Step 4: Review ── */}
        {step === 4 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="alert alert-info">
              <span>ℹ️</span>
              <span>Please review your information carefully before submitting. Once submitted, you cannot edit the application.</span>
            </div>

            {[
              { title: '👶 Child Information', fields: [
                ['Date of Birth', form.dateOfBirth],
                ['Sex', form.sex],
                ['Child\'s Name', form.childName || '—'],
                ['Place of Birth', form.placeOfBirth],
                ['Institution', form.institutionName || '—'],
                ['Delivery Method', form.deliveryMethod],
                ['Birth Weight', form.birthWeight ? `${form.birthWeight} kg` : '—'],
                ['Gestation', form.gestationPeriod ? `${form.gestationPeriod} weeks` : '—'],
              ]},
              { title: '👨 Father', fields: [
                ['Name', form.fatherName], ['Mobile', form.fatherMobile], ['Email', form.fatherEmail],
                ['Religion', form.fatherReligion], ['Education', form.fatherEducation], ['Occupation', form.fatherOccupation],
              ]},
              { title: '👩 Mother', fields: [
                ['Name', form.motherName], ['Mobile', form.motherMobile], ['Email', form.motherEmail],
                ['Religion', form.motherReligion], ['Education', form.motherEducation], ['Occupation', form.motherOccupation],
                ['Age at Delivery', form.motherAgeAtDelivery],
              ]},
              { title: '🏠 Address', fields: [
                ['Village/Town', form.village], ['Sub-District', form.subDistrict],
                ['District', form.district], ['State', form.state], ['PIN', form.pinCode],
              ]},
            ].map(section => (
              <div className="form-section" key={section.title}>
                <div className="form-section-title">{section.title}</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  {section.fields.map(([label, value]) => (
                    <div key={label as string}>
                      <div style={{ fontSize: '11px', color: 'var(--text-faint)', textTransform: 'uppercase', fontWeight: 600 }}>{label as string}</div>
                      <div style={{ fontSize: '14px', color: 'var(--text)', fontWeight: 500 }}>{value as string || '—'}</div>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            <div className="alert alert-warning">
              <span>📧</span>
              <span>Confirmation & status updates will be sent to: <strong>{form.contactEmail}</strong></span>
            </div>

            {error && <div className="alert alert-danger">{error}</div>}

            <div className="flex justify-between mt-4">
              <button className="btn btn-ghost" onClick={() => { setError(''); setStep(3); }}>← Back</button>
              <button className="btn btn-primary btn-lg" onClick={handleSubmit} disabled={submitting}>
                {submitting ? <><span className="spinner" /> Submitting...</> : '✅ Submit Application'}
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
