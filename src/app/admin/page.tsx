'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface User { name: string; role: string; }

interface Analytics {
  totalApplications: number;
  totalHospitals: number;
  statusCounts: Array<{ _id: string; count: number }>;
  hospitalCounts: Array<{ 
    _id: { hospitalId: string; hospitalNo: number; hospitalName: string; }; 
    count: number; 
  }>;
  turnaroundStats: {
    averageTurnaroundHours: number;
    minTurnaroundHours: number;
    maxTurnaroundHours: number;
  };
  rejectionReasons: Array<{ _id: string; count: number }>;
  monthlyIssuance: Array<{ 
    _id: { year: number; month: number }; 
    count: number; 
  }>;
}

interface Application {
  _id: string;
  applicationNumber: string;
  childName?: string;
  dateOfBirth: string;
  status: string;
  hospitalId?: { name: string; hospitalNo: number; district: string };
  createdAt: string;
  verifiedAt?: string;
  approvedAt?: string;
}

export default function AdminPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [activeTab, setActiveTab] = useState<'overview' | 'hospitals' | 'performance' | 'applications'>('overview');

  const fetchAnalytics = useCallback(async () => {
    const res = await fetch('/api/admin/analytics');
    if (res.status === 403) { router.push('/login'); return; }
    const data = await res.json();
    setAnalytics(data);
  }, [router]);

  const fetchApplications = useCallback(async () => {
    let url = '/api/admin/applications?limit=20';
    if (selectedStatus) url += `&status=${selectedStatus}`;
    if (searchTerm) url += `&applicationNumber=${searchTerm}`;
    
    const res = await fetch(url);
    if (res.status === 403) { router.push('/login'); return; }
    const data = await res.json();
    setApplications(data.applications || []);
  }, [router, selectedStatus, searchTerm]);

  useEffect(() => {
    (async () => {
      const res = await fetch('/api/auth/me');
      if (!res.ok) { router.push('/login'); return; }
      const u = await res.json();
      if (u.role !== 'admin') { router.push('/login'); return; }
      setUser(u);
      await Promise.all([fetchAnalytics(), fetchApplications()]);
      setLoading(false);
    })();
  }, [router, fetchAnalytics, fetchApplications]);

  useEffect(() => {
    if (!loading) fetchApplications();
  }, [selectedStatus, searchTerm, loading, fetchApplications]);

  async function logout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
  }

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--color-bg-light)' }}>
      <div style={{ textAlign: 'center', color: 'var(--color-navy)' }}>
        <div className="spinner spinner-dark" style={{ width: '48px', height: '48px', borderWidth: '4px', margin: '0 auto 16px' }} />
        <div style={{ fontSize: '16px', fontWeight: 700 }}>Loading District Analytics...</div>
      </div>
    </div>
  );

  const statusLabels: Record<string, string> = {
    pending: 'Under Review',
    verifier_approved: 'Hospital Verified',
    operator_approved: 'Certificate Issued',
    rejected: 'Rejected'
  };

  const statusColors: Record<string, string> = {
    pending: '#F57C00',
    verifier_approved: '#0F8B8D',
    operator_approved: '#2E7D32',
    rejected: '#D32F2F'
  };

  // Calculate key insights
  const getInsights = () => {
    if (!analytics) return null;
    
    const total = analytics.totalApplications;
    const approved = analytics.statusCounts.find(s => s._id === 'operator_approved')?.count || 0;
    const rejected = analytics.statusCounts.find(s => s._id === 'rejected')?.count || 0;
    const pending = analytics.statusCounts.find(s => s._id === 'pending')?.count || 0;
    
    const successRate = total > 0 ? ((approved / total) * 100).toFixed(1) : '0';
    const rejectionRate = total > 0 ? ((rejected / total) * 100).toFixed(1) : '0';
    const avgDays = (analytics.turnaroundStats.averageTurnaroundHours / 24).toFixed(1);
    
    const busiestHospital = analytics.hospitalCounts[0];
    const isSlow = analytics.turnaroundStats.averageTurnaroundHours > 72;
    
    return {
      successRate,
      rejectionRate,
      avgDays,
      busiestHospital,
      isSlow,
      pending,
      total
    };
  };

  const insights = getInsights();

  return (
    <>
      {/* Header (Navy #1B3B6F) */}
      <div style={{ 
        backgroundColor: 'var(--color-navy)',
        padding: '24px 24px',
        color: '#FFFFFF',
        borderBottom: '3px solid var(--color-teal)',
        boxShadow: '0 2px 8px rgba(0,0,0,0.12)'
      }}>
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{
              width: '42px', height: '42px', backgroundColor: '#FFFFFF', borderRadius: 'var(--r-md)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px'
            }}>🏛️</div>
            <div>
              <h1 style={{ fontSize: '22px', fontWeight: '800', marginBottom: '2px', color: '#FFFFFF', letterSpacing: '-0.01em' }}>
                District Civil Registration Analytics
              </h1>
              <p style={{ opacity: 0.85, fontSize: '13px' }}>Government of India — Centralized Administrative Monitoring Dashboard</p>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '11px', opacity: 0.75, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Administrator</div>
              <div style={{ fontSize: '14px', fontWeight: 600 }}>{user?.name}</div>
            </div>
            <button onClick={logout} className="btn btn-header-ghost btn-sm">
              Sign Out
            </button>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div style={{ backgroundColor: '#FFFFFF', borderBottom: '1px solid var(--color-border)', position: 'sticky', top: 0, zIndex: 100, boxShadow: 'var(--shadow-sm)' }}>
        <div className="container" style={{ display: 'flex', gap: '0', padding: '0 24px' }}>
          {[
            { id: 'overview', label: '📊 System Overview', icon: '📊' },
            { id: 'hospitals', label: '🏥 Enrolled Hospitals', icon: '🏥' },
            { id: 'performance', label: '⚡ SLA Performance', icon: '⚡' },
            { id: 'applications', label: '📋 Application Master List', icon: '📋' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              style={{
                padding: '14px 20px',
                background: 'transparent',
                border: 'none',
                borderBottom: activeTab === tab.id ? '3px solid var(--color-teal)' : '3px solid transparent',
                color: activeTab === tab.id ? 'var(--color-navy)' : 'var(--color-gray-text)',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: activeTab === tab.id ? 700 : 500,
                transition: 'all 0.15s ease'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="container" style={{ padding: '32px 24px 80px' }}>
        {analytics && (
          <>
            {/* OVERVIEW TAB */}
            {activeTab === 'overview' && (
              <>
                {/* Key Metrics - Hero Cards */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginBottom: '32px' }}>
                  <div style={{
                    backgroundColor: '#FFFFFF',
                    border: '1px solid var(--color-border)',
                    borderTop: '4px solid var(--color-navy)',
                    borderRadius: 'var(--r-md)',
                    padding: '22px',
                    boxShadow: 'var(--shadow-sm)'
                  }}>
                    <div style={{ fontSize: '13px', color: 'var(--color-gray-text)', marginBottom: '8px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Total Applications</div>
                    <div style={{ fontSize: '38px', fontWeight: '800', color: 'var(--color-navy)', fontFamily: 'var(--font-display)', marginBottom: '4px' }}>{analytics.totalApplications}</div>
                    <div style={{ fontSize: '12px', color: 'var(--color-gray-text)' }}>Across {analytics.totalHospitals} enrolled institutions</div>
                  </div>

                  <div style={{
                    backgroundColor: '#FFFFFF',
                    border: '1px solid var(--color-border)',
                    borderTop: '4px solid var(--color-success)',
                    borderRadius: 'var(--r-md)',
                    padding: '22px',
                    boxShadow: 'var(--shadow-sm)'
                  }}>
                    <div style={{ fontSize: '13px', color: 'var(--color-gray-text)', marginBottom: '8px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Approval Rate</div>
                    <div style={{ fontSize: '38px', fontWeight: '800', color: 'var(--color-success)', fontFamily: 'var(--font-display)', marginBottom: '4px' }}>{insights?.successRate}%</div>
                    <div style={{ fontSize: '12px', color: 'var(--color-gray-text)' }}>
                      {analytics.statusCounts.find(s => s._id === 'operator_approved')?.count || 0} certificates issued
                    </div>
                  </div>

                  <div style={{
                    backgroundColor: '#FFFFFF',
                    border: '1px solid var(--color-border)',
                    borderTop: '4px solid var(--color-teal)',
                    borderRadius: 'var(--r-md)',
                    padding: '22px',
                    boxShadow: 'var(--shadow-sm)'
                  }}>
                    <div style={{ fontSize: '13px', color: 'var(--color-gray-text)', marginBottom: '8px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Avg Turnaround Time</div>
                    <div style={{ fontSize: '38px', fontWeight: '800', color: 'var(--color-teal)', fontFamily: 'var(--font-display)', marginBottom: '4px' }}>
                      {insights?.avgDays} <span style={{ fontSize: '20px', fontWeight: 600 }}>days</span>
                    </div>
                    <div style={{ fontSize: '12px', color: insights?.isSlow ? 'var(--color-alert)' : 'var(--color-success)', fontWeight: 600 }}>
                      {insights?.isSlow ? '⚠️ Review SLA threshold' : '✅ Within target SLA (3–5 days)'}
                    </div>
                  </div>

                  <div style={{
                    backgroundColor: '#FFFFFF',
                    border: '1px solid var(--color-border)',
                    borderTop: '4px solid var(--color-alert)',
                    borderRadius: 'var(--r-md)',
                    padding: '22px',
                    boxShadow: 'var(--shadow-sm)'
                  }}>
                    <div style={{ fontSize: '13px', color: 'var(--color-gray-text)', marginBottom: '8px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Pending In Queue</div>
                    <div style={{ fontSize: '38px', fontWeight: '800', color: 'var(--color-alert)', fontFamily: 'var(--font-display)', marginBottom: '4px' }}>{insights?.pending || 0}</div>
                    <div style={{ fontSize: '12px', color: 'var(--color-gray-text)' }}>
                      {((Number(insights?.pending || 0) / (analytics.totalApplications || 1)) * 100).toFixed(0)}% of total workload
                    </div>
                  </div>
                </div>

                {/* Key Insights Alert Box */}
                <div className="card" style={{ 
                  marginBottom: '32px',
                  backgroundColor: 'var(--color-info-bg)',
                  border: '1px solid rgba(15, 139, 141, 0.3)',
                  borderLeft: '4px solid var(--color-teal)',
                  padding: '20px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'start', gap: '16px' }}>
                    <div style={{ fontSize: '28px' }}>💡</div>
                    <div style={{ flex: 1 }}>
                      <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '8px', color: 'var(--color-navy)' }}>
                        Administrative Insights & Operating Directives
                      </h3>
                      <ul style={{ fontSize: '14px', color: 'var(--color-text-primary)', lineHeight: '1.8', paddingLeft: '20px' }}>
                        <li>
                          <strong>Busiest Institutional Center:</strong> {insights?.busiestHospital?._id.hospitalName} (H{insights?.busiestHospital?._id.hospitalNo.toString().padStart(2, '0')}) 
                          with {insights?.busiestHospital?.count} registered cases
                        </li>
                        <li>
                          <strong>Application Rejection Ratio:</strong> {insights?.rejectionRate}% — 
                          {parseFloat(insights?.rejectionRate || '0') > 10 
                            ? ' Institutional verification data errors detected; schedule hospital coordination meeting' 
                            : ' Well within operational tolerance'}
                        </li>
                        <li>
                          <strong>Average Processing Speed:</strong> {insights?.avgDays} days — 
                          {insights?.isSlow ? ' Bottleneck identified in verification stage' : ' Statutory service standards fulfilled'}
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Status Distribution with Visual Bars */}
                <div className="card" style={{ marginBottom: '32px' }}>
                  <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '20px', color: 'var(--color-navy)' }}>
                    📊 Statutory Application Status Breakdown
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {analytics.statusCounts.map(item => {
                      const percentage = (item.count / analytics.totalApplications) * 100;
                      return (
                        <div key={item._id}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                            <span style={{ fontSize: '14px', fontWeight: 700, color: statusColors[item._id] || 'var(--color-navy)' }}>
                              {statusLabels[item._id] || item._id}
                            </span>
                            <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--color-navy)' }}>
                              {item.count} ({percentage.toFixed(1)}%)
                            </span>
                          </div>
                          <div style={{ 
                            background: '#E8EAED', 
                            height: '10px', 
                            borderRadius: '5px', 
                            overflow: 'hidden' 
                          }}>
                            <div style={{
                              width: `${percentage}%`,
                              height: '100%',
                              backgroundColor: statusColors[item._id] || 'var(--color-teal)',
                              transition: 'width 0.5s ease',
                              borderRadius: '5px'
                            }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Monthly Trend */}
                {analytics.monthlyIssuance.length > 0 && (
                  <div className="card" style={{ marginBottom: '32px' }}>
                    <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '20px', color: 'var(--color-navy)' }}>
                      📈 Monthly Certificate Issuance Trend
                    </h3>
                    <div style={{ display: 'flex', alignItems: 'end', gap: '12px', height: '180px', padding: '10px 0' }}>
                      {analytics.monthlyIssuance.map(item => {
                        const maxCount = Math.max(...analytics.monthlyIssuance.map(i => i.count)) || 1;
                        const height = (item.count / maxCount) * 100;
                        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                        
                        return (
                          <div key={`${item._id.year}-${item._id.month}`} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                            <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-navy)' }}>{item.count}</div>
                            <div style={{
                              width: '100%',
                              height: `${height}%`,
                              backgroundColor: 'var(--color-teal)',
                              borderRadius: '4px 4px 0 0',
                              minHeight: '12px'
                            }} />
                            <div style={{ fontSize: '11px', color: 'var(--color-gray-text)', fontWeight: 600 }}>
                              {monthNames[item._id.month - 1]}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Rejection Analysis */}
                {analytics.rejectionReasons.length > 0 && (
                  <div className="card">
                    <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '20px', color: 'var(--color-navy)' }}>
                      ❌ Primary Rejection Reasons Breakdown
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                      {analytics.rejectionReasons.slice(0, 5).map((item, index) => {
                        const maxCount = analytics.rejectionReasons[0].count || 1;
                        const percentage = (item.count / maxCount) * 100;
                        
                        return (
                          <div key={item._id} style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                            <div style={{
                              width: '30px',
                              height: '30px',
                              borderRadius: '50%',
                              backgroundColor: index === 0 ? 'var(--color-danger)' : index === 1 ? 'var(--color-alert)' : 'var(--color-gray-text)',
                              color: 'white',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '13px',
                              fontWeight: 700,
                              flexShrink: 0
                            }}>
                              {index + 1}
                            </div>
                            <div style={{ flex: 1 }}>
                              <div style={{ fontSize: '14px', fontWeight: 600, marginBottom: '4px', color: 'var(--color-navy)' }}>{item._id}</div>
                              <div style={{ background: '#E8EAED', height: '8px', borderRadius: '4px', overflow: 'hidden' }}>
                                <div style={{
                                  width: `${percentage}%`,
                                  height: '100%',
                                  backgroundColor: 'var(--color-danger)',
                                  borderRadius: '4px'
                                }} />
                              </div>
                            </div>
                            <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--color-danger)', minWidth: '40px', textAlign: 'right' }}>
                              {item.count}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </>
            )}

            {/* HOSPITALS TAB */}
            {activeTab === 'hospitals' && (
              <>
                <div style={{ marginBottom: '24px' }}>
                  <h2 style={{ fontSize: '22px', fontWeight: '700', marginBottom: '6px', color: 'var(--color-navy)' }}>
                    🏥 Enrolled Institutional Health Centers
                  </h2>
                  <p style={{ color: 'var(--color-gray-text)', fontSize: '14px' }}>
                    Institutional workload breakdown across all {analytics.totalHospitals} enrolled hospitals
                  </p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
                  {analytics.hospitalCounts.map((item, index) => {
                    const isTopPerformer = index < 3;
                    const maxCount = analytics.hospitalCounts[0].count || 1;
                    const relativePerformance = (item.count / maxCount) * 100;
                    
                    return (
                      <div 
                        key={item._id.hospitalId} 
                        className="card"
                        style={{
                          borderLeft: isTopPerformer ? '4px solid var(--color-success)' : '4px solid var(--color-teal)',
                          position: 'relative',
                          padding: '20px'
                        }}
                      >
                        {isTopPerformer && (
                          <div style={{
                            position: 'absolute',
                            top: '12px',
                            right: '12px',
                            backgroundColor: 'var(--color-success-bg)',
                            color: 'var(--color-success)',
                            border: '1px solid rgba(46, 125, 50, 0.3)',
                            padding: '3px 8px',
                            borderRadius: 'var(--r-sm)',
                            fontSize: '11px',
                            fontWeight: 700
                          }}>
                            RANK #{index + 1}
                          </div>
                        )}
                        
                        <div style={{ marginBottom: '12px' }}>
                          <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--color-navy)', fontFamily: 'var(--font-mono)' }}>
                            H{item._id.hospitalNo.toString().padStart(2, '0')}
                          </div>
                          <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-text-primary)', marginTop: '4px', lineHeight: '1.4' }}>
                            {item._id.hospitalName}
                          </div>
                        </div>

                        <div style={{ marginBottom: '12px' }}>
                          <div style={{ fontSize: '32px', fontWeight: 800, color: 'var(--color-navy)' }}>
                            {item.count}
                          </div>
                          <div style={{ fontSize: '12px', color: 'var(--color-gray-text)' }}>birth registrations processed</div>
                        </div>

                        <div>
                          <div style={{ fontSize: '11px', color: 'var(--color-gray-text)', marginBottom: '4px', fontWeight: 600 }}>
                            Relative Volume Share
                          </div>
                          <div style={{ background: '#E8EAED', height: '8px', borderRadius: '4px', overflow: 'hidden' }}>
                            <div style={{
                              width: `${relativePerformance}%`,
                              height: '100%',
                              backgroundColor: 'var(--color-teal)',
                              borderRadius: '4px'
                            }} />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}

            {/* PERFORMANCE TAB */}
            {activeTab === 'performance' && (
              <>
                <div style={{ marginBottom: '24px' }}>
                  <h2 style={{ fontSize: '22px', fontWeight: '700', marginBottom: '6px', color: 'var(--color-navy)' }}>
                    ⚡ Service Level Agreement (SLA) & Efficiency
                  </h2>
                  <p style={{ color: 'var(--color-gray-text)', fontSize: '14px' }}>
                    Government service benchmark metrics and processing velocity
                  </p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '20px', marginBottom: '32px' }}>
                  <div className="card" style={{ padding: '24px' }}>
                    <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--color-gray-text)', marginBottom: '8px', textTransform: 'uppercase' }}>
                      Average Turnaround Time
                    </div>
                    <div style={{ fontSize: '42px', fontWeight: 800, color: 'var(--color-navy)', marginBottom: '6px' }}>
                      {analytics.turnaroundStats.averageTurnaroundHours > 0 
                        ? Math.round(analytics.turnaroundStats.averageTurnaroundHours) 
                        : 0}
                      <span style={{ fontSize: '20px', color: 'var(--color-gray-text)' }}> hours</span>
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--color-gray-text)' }}>
                      Min: {Math.round(analytics.turnaroundStats.minTurnaroundHours)}h | Max: {Math.round(analytics.turnaroundStats.maxTurnaroundHours)}h
                    </div>
                  </div>

                  <div className="card" style={{ padding: '24px', borderLeft: '4px solid var(--color-success)' }}>
                    <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--color-gray-text)', marginBottom: '8px', textTransform: 'uppercase' }}>
                      Approval Compliance
                    </div>
                    <div style={{ fontSize: '42px', fontWeight: 800, color: 'var(--color-success)', marginBottom: '6px' }}>
                      {insights?.successRate}%
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--color-gray-text)' }}>
                      {analytics.statusCounts.find(s => s._id === 'operator_approved')?.count || 0} approved out of {analytics.totalApplications} total
                    </div>
                  </div>

                  <div className="card" style={{ padding: '24px', borderLeft: '4px solid var(--color-danger)' }}>
                    <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--color-gray-text)', marginBottom: '8px', textTransform: 'uppercase' }}>
                      Rejection Rate
                    </div>
                    <div style={{ fontSize: '42px', fontWeight: 800, color: 'var(--color-danger)', marginBottom: '6px' }}>
                      {insights?.rejectionRate}%
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--color-gray-text)' }}>
                      {analytics.statusCounts.find(s => s._id === 'rejected')?.count || 0} applications rejected
                    </div>
                  </div>
                </div>

                {/* Performance Indicators */}
                <div className="card" style={{ marginBottom: '24px', padding: '24px' }}>
                  <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '20px', color: 'var(--color-navy)' }}>
                    📊 Key Quality Indicators
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    {[
                      {
                        label: 'Overall Process Compliance',
                        value: parseFloat(insights?.successRate || '0') > 90 ? 95 : parseFloat(insights?.successRate || '0'),
                        color: 'var(--color-success)',
                        target: 90,
                        status: parseFloat(insights?.successRate || '0') >= 90 ? 'Excellent' : 'Compliant'
                      },
                      {
                        label: 'Verification Turnaround Speed',
                        value: analytics.turnaroundStats.averageTurnaroundHours < 72 ? 85 : 60,
                        color: 'var(--color-teal)',
                        target: 80,
                        status: analytics.turnaroundStats.averageTurnaroundHours < 72 ? 'Optimal' : 'Needs Optimization'
                      },
                      {
                        label: 'Document Accuracy & Submission Quality',
                        value: Math.max(0, 100 - parseFloat(insights?.rejectionRate || '0') * 2),
                        color: 'var(--color-navy)',
                        target: 85,
                        status: parseFloat(insights?.rejectionRate || '0') < 8 ? 'High Precision' : 'Standard'
                      }
                    ].map((indicator, index) => (
                      <div key={index}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                          <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--color-navy)' }}>{indicator.label}</span>
                          <span style={{ fontSize: '14px', fontWeight: 700, color: indicator.color }}>
                            {indicator.value.toFixed(0)}% — {indicator.status}
                          </span>
                        </div>
                        <div style={{ position: 'relative', background: '#E8EAED', height: '12px', borderRadius: '6px', overflow: 'hidden' }}>
                          <div style={{
                            width: `${indicator.value}%`,
                            height: '100%',
                            backgroundColor: indicator.color,
                            transition: 'width 0.5s ease',
                            borderRadius: '6px'
                          }} />
                        </div>
                        <div style={{ fontSize: '12px', color: 'var(--color-gray-text)', marginTop: '4px' }}>
                          Target Benchmark: {indicator.target}%
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* APPLICATIONS TAB */}
            {activeTab === 'applications' && (
              <>
                <div style={{ marginBottom: '24px' }}>
                  <h2 style={{ fontSize: '22px', fontWeight: '700', marginBottom: '6px', color: 'var(--color-navy)' }}>
                    📋 Master Civil Registration Records
                  </h2>
                  <p style={{ color: 'var(--color-gray-text)', fontSize: '14px' }}>
                    Search, filter, and audit all birth applications across all jurisdictions
                  </p>
                </div>

                <div className="card-plain" style={{ backgroundColor: '#FFFFFF', border: '1px solid var(--color-border)', borderRadius: 'var(--r-md)', padding: '24px' }}>
                  <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="🔍 Search by reference number (e.g. BC-2025)..."
                      value={searchTerm}
                      onChange={e => setSearchTerm(e.target.value)}
                      style={{ flex: 1, minWidth: '220px' }}
                    />
                    <select 
                      className="form-select" 
                      value={selectedStatus} 
                      onChange={e => setSelectedStatus(e.target.value)}
                      style={{ minWidth: '180px' }}
                    >
                      <option value="">All Statuses</option>
                      <option value="pending">Under Review</option>
                      <option value="verifier_approved">Hospital Verified</option>
                      <option value="operator_approved">Certificate Issued</option>
                      <option value="rejected">Rejected</option>
                    </select>
                  </div>
                  
                  <div className="table-wrap">
                    <table>
                      <thead>
                        <tr>
                          <th>Reference No.</th>
                          <th>Child Name</th>
                          <th>Hospital Center</th>
                          <th>Status</th>
                          <th>Submitted</th>
                          <th>Processing SLA</th>
                        </tr>
                      </thead>
                      <tbody>
                        {applications.map(app => {
                          const createdAt = new Date(app.createdAt);
                          const processedAt = new Date(app.verifiedAt || app.approvedAt || Date.now());
                          const processingHours = Math.round((processedAt.getTime() - createdAt.getTime()) / (1000 * 60 * 60));
                          
                          return (
                            <tr key={app._id}>
                              <td>
                                <code style={{ color: 'var(--color-navy)', fontSize: '13px', fontWeight: 700 }}>
                                  {app.applicationNumber}
                                </code>
                              </td>
                              <td style={{ fontWeight: 600 }}>
                                {app.childName || <em style={{ color: 'var(--color-gray-text)', fontWeight: 400 }}>Not named</em>}
                              </td>
                              <td>
                                <div style={{ fontSize: '13px' }}>
                                  {app.hospitalId ? (
                                    <>
                                      <span style={{ fontWeight: 700, color: 'var(--color-teal)' }}>
                                        H{app.hospitalId.hospitalNo.toString().padStart(2, '0')}
                                      </span>
                                      {' '}{app.hospitalId.name}
                                    </>
                                  ) : (
                                    <em style={{ color: 'var(--color-gray-text)' }}>No hospital assigned</em>
                                  )}
                                </div>
                              </td>
                              <td>
                                <span className={`badge badge-${app.status}`}>
                                  {statusLabels[app.status] || app.status}
                                </span>
                              </td>
                              <td style={{ fontSize: '13px', color: 'var(--color-gray-text)' }}>
                                {createdAt.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                              </td>
                              <td style={{ fontSize: '13px', color: 'var(--color-gray-text)', fontWeight: 600 }}>
                                {app.status === 'pending' ? (
                                  <span style={{ color: 'var(--color-alert)' }}>⏳ In Review</span>
                                ) : (
                                  `${Math.floor(processingHours / 24)}d ${processingHours % 24}h`
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                  
                  {applications.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--color-gray-text)' }}>
                      <div style={{ fontSize: '48px', marginBottom: '12px' }}>📋</div>
                      <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--color-navy)' }}>No records match the filter</div>
                      <div style={{ fontSize: '14px', marginTop: '4px' }}>Try resetting or modifying the status filter query.</div>
                    </div>
                  )}
                </div>
              </>
            )}
          </>
        )}
      </div>
    </>
  );
}

