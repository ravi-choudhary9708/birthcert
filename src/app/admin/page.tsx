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
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
      <div style={{ textAlign: 'center', color: 'white' }}>
        <div className="spinner" style={{ width: '50px', height: '50px', borderWidth: '4px', borderColor: 'white', borderTopColor: 'transparent', margin: '0 auto 20px' }} />
        <div style={{ fontSize: '18px', fontWeight: 600 }}>Loading Analytics...</div>
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
    pending: '#f59e0b',
    verifier_approved: '#3b82f6',
    operator_approved: '#10b981',
    rejected: '#ef4444'
  };

  // Calculate key insights
  const getInsights = () => {
    if (!analytics) return null;
    
    const total = analytics.totalApplications;
    const approved = analytics.statusCounts.find(s => s._id === 'operator_approved')?.count || 0;
    const rejected = analytics.statusCounts.find(s => s._id === 'rejected')?.count || 0;
    const pending = analytics.statusCounts.find(s => s._id === 'pending')?.count || 0;
    
    const successRate = total > 0 ? ((approved / total) * 100).toFixed(1) : 0;
    const rejectionRate = total > 0 ? ((rejected / total) * 100).toFixed(1) : 0;
    const avgDays = (analytics.turnaroundStats.averageTurnaroundHours / 24).toFixed(1);
    
    // Find busiest hospital
    const busiestHospital = analytics.hospitalCounts[0];
    
    // Find slowest processing
    const isSlow = analytics.turnaroundStats.averageTurnaroundHours > 72; // > 3 days
    
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
      {/* Header with gradient */}
      <div style={{ 
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: '32px 24px',
        color: 'white',
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
      }}>
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h1 style={{ fontSize: '28px', fontWeight: '800', marginBottom: '8px', color: 'white' }}>
              📊 Madhubani District Analytics
            </h1>
            <p style={{ opacity: 0.9, fontSize: '14px' }}>Birth Certificate Registration System - Administrative Dashboard</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '12px', opacity: 0.8 }}>Logged in as</div>
              <div style={{ fontSize: '14px', fontWeight: 600 }}>{user?.name}</div>
            </div>
            <button onClick={logout} style={{
              background: 'rgba(255,255,255,0.2)',
              border: '1px solid rgba(255,255,255,0.3)',
              color: 'white',
              padding: '8px 16px',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: 500
            }}>
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div style={{ background: 'white', borderBottom: '2px solid #e5e7eb', position: 'sticky', top: 0, zIndex: 100 }}>
        <div className="container" style={{ display: 'flex', gap: '0', padding: '0 24px' }}>
          {[
            { id: 'overview', label: '📈 Overview', icon: '📈' },
            { id: 'hospitals', label: '🏥 Hospitals', icon: '🏥' },
            { id: 'performance', label: '⚡ Performance', icon: '⚡' },
            { id: 'applications', label: '📋 Applications', icon: '📋' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              style={{
                padding: '16px 24px',
                background: activeTab === tab.id ? 'white' : 'transparent',
                border: 'none',
                borderBottom: activeTab === tab.id ? '3px solid #667eea' : '3px solid transparent',
                color: activeTab === tab.id ? '#667eea' : '#6b7280',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 600,
                transition: 'all 0.2s'
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
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    borderRadius: '12px',
                    padding: '24px',
                    color: 'white',
                    boxShadow: '0 4px 6px rgba(102,126,234,0.4)'
                  }}>
                    <div style={{ fontSize: '14px', opacity: 0.9, marginBottom: '8px', fontWeight: 500 }}>Total Applications</div>
                    <div style={{ fontSize: '42px', fontWeight: '800', marginBottom: '8px' }}>{analytics.totalApplications}</div>
                    <div style={{ fontSize: '12px', opacity: 0.8 }}>Across {analytics.totalHospitals} hospitals</div>
                  </div>

                  <div style={{
                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                    borderRadius: '12px',
                    padding: '24px',
                    color: 'white',
                    boxShadow: '0 4px 6px rgba(16,185,129,0.4)'
                  }}>
                    <div style={{ fontSize: '14px', opacity: 0.9, marginBottom: '8px', fontWeight: 500 }}>Success Rate</div>
                    <div style={{ fontSize: '42px', fontWeight: '800', marginBottom: '8px' }}>{insights?.successRate}%</div>
                    <div style={{ fontSize: '12px', opacity: 0.8 }}>
                      {analytics.statusCounts.find(s => s._id === 'operator_approved')?.count || 0} certificates issued
                    </div>
                  </div>

                  <div style={{
                    background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                    borderRadius: '12px',
                    padding: '24px',
                    color: 'white',
                    boxShadow: '0 4px 6px rgba(59,130,246,0.4)'
                  }}>
                    <div style={{ fontSize: '14px', opacity: 0.9, marginBottom: '8px', fontWeight: 500 }}>Avg. Processing Time</div>
                    <div style={{ fontSize: '42px', fontWeight: '800', marginBottom: '8px' }}>
                      {insights?.avgDays} <span style={{ fontSize: '24px' }}>days</span>
                    </div>
                    <div style={{ fontSize: '12px', opacity: 0.8 }}>
                      {insights?.isSlow ? '⚠️ Slower than target' : '✅ Within target'}
                    </div>
                  </div>

                  <div style={{
                    background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                    borderRadius: '12px',
                    padding: '24px',
                    color: 'white',
                    boxShadow: '0 4px 6px rgba(245,158,11,0.4)'
                  }}>
                    <div style={{ fontSize: '14px', opacity: 0.9, marginBottom: '8px', fontWeight: 500 }}>Pending Review</div>
                    <div style={{ fontSize: '42px', fontWeight: '800', marginBottom: '8px' }}>{insights?.pending || 0}</div>
                    <div style={{ fontSize: '12px', opacity: 0.8 }}>
                      {((insights?.pending || 0) / (insights?.total || 1) * 100).toFixed(0)}% of total
                    </div>
                  </div>
                </div>

                {/* Key Insights Alert Box */}
                <div className="card" style={{ 
                  marginBottom: '32px',
                  background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
                  border: '2px solid #f59e0b',
                  padding: '20px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'start', gap: '16px' }}>
                    <div style={{ fontSize: '32px' }}>💡</div>
                    <div style={{ flex: 1 }}>
                      <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '12px', color: '#92400e' }}>
                        Key Insights & Recommendations
                      </h3>
                      <ul style={{ fontSize: '14px', color: '#78350f', lineHeight: '1.8', paddingLeft: '20px' }}>
                        <li>
                          <strong>Busiest Hospital:</strong> {insights?.busiestHospital?._id.hospitalName} (H{insights?.busiestHospital?._id.hospitalNo.toString().padStart(2, '0')}) 
                          with {insights?.busiestHospital?.count} applications
                        </li>
                        <li>
                          <strong>Rejection Rate:</strong> {insights?.rejectionRate}% - 
                          {parseFloat(insights?.rejectionRate || '0') > 10 
                            ? ' Consider training hospitals on common rejection reasons' 
                            : ' Within acceptable range'}
                        </li>
                        <li>
                          <strong>Processing Speed:</strong> Average of {insights?.avgDays} days - 
                          {insights?.isSlow ? ' Action needed to reduce turnaround time' : ' Meeting service standards'}
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Status Distribution with Visual Bars */}
                <div className="card" style={{ marginBottom: '32px' }}>
                  <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '20px' }}>
                    📊 Application Status Distribution
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {analytics.statusCounts.map(item => {
                      const percentage = (item.count / analytics.totalApplications) * 100;
                      return (
                        <div key={item._id}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                            <span style={{ fontSize: '14px', fontWeight: 600, color: statusColors[item._id] }}>
                              {statusLabels[item._id] || item._id}
                            </span>
                            <span style={{ fontSize: '14px', fontWeight: 700 }}>
                              {item.count} ({percentage.toFixed(1)}%)
                            </span>
                          </div>
                          <div style={{ 
                            background: '#e5e7eb', 
                            height: '12px', 
                            borderRadius: '6px', 
                            overflow: 'hidden' 
                          }}>
                            <div style={{
                              width: `${percentage}%`,
                              height: '100%',
                              background: statusColors[item._id],
                              transition: 'width 0.5s ease',
                              borderRadius: '6px'
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
                    <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '20px' }}>
                      📈 Monthly Issuance Trend (Last 12 Months)
                    </h3>
                    <div style={{ display: 'flex', alignItems: 'end', gap: '8px', height: '200px' }}>
                      {analytics.monthlyIssuance.map(item => {
                        const maxCount = Math.max(...analytics.monthlyIssuance.map(i => i.count));
                        const height = (item.count / maxCount) * 100;
                        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                        
                        return (
                          <div key={`${item._id.year}-${item._id.month}`} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                            <div style={{ fontSize: '12px', fontWeight: 600 }}>{item.count}</div>
                            <div style={{
                              width: '100%',
                              height: `${height}%`,
                              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                              borderRadius: '4px 4px 0 0',
                              minHeight: '20px'
                            }} />
                            <div style={{ fontSize: '11px', color: '#6b7280' }}>
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
                    <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '20px' }}>
                      ❌ Top Rejection Reasons
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {analytics.rejectionReasons.slice(0, 5).map((item, index) => {
                        const maxCount = analytics.rejectionReasons[0].count;
                        const percentage = (item.count / maxCount) * 100;
                        
                        return (
                          <div key={item._id} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{
                              width: '32px',
                              height: '32px',
                              borderRadius: '50%',
                              background: index === 0 ? '#ef4444' : index === 1 ? '#f59e0b' : '#6b7280',
                              color: 'white',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '14px',
                              fontWeight: 700,
                              flexShrink: 0
                            }}>
                              {index + 1}
                            </div>
                            <div style={{ flex: 1 }}>
                              <div style={{ fontSize: '14px', fontWeight: 600, marginBottom: '4px' }}>{item._id}</div>
                              <div style={{ background: '#e5e7eb', height: '8px', borderRadius: '4px', overflow: 'hidden' }}>
                                <div style={{
                                  width: `${percentage}%`,
                                  height: '100%',
                                  background: '#ef4444',
                                  borderRadius: '4px'
                                }} />
                              </div>
                            </div>
                            <div style={{ fontSize: '16px', fontWeight: 700, color: '#ef4444', minWidth: '40px', textAlign: 'right' }}>
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
                  <h2 style={{ fontSize: '22px', fontWeight: '700', marginBottom: '8px' }}>
                    🏥 Hospital Performance Analysis
                  </h2>
                  <p style={{ color: '#6b7280', fontSize: '14px' }}>
                    Detailed breakdown of applications across all {analytics.totalHospitals} hospitals in Madhubani district
                  </p>
                </div>

                {/* Hospital Stats Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
                  {analytics.hospitalCounts.map((item, index) => {
                    const isTopPerformer = index < 3;
                    const maxCount = analytics.hospitalCounts[0].count;
                    const relativePerformance = (item.count / maxCount) * 100;
                    
                    return (
                      <div 
                        key={item._id.hospitalId} 
                        className="card"
                        style={{
                          border: isTopPerformer ? '2px solid #10b981' : '1px solid #e5e7eb',
                          position: 'relative',
                          padding: '20px'
                        }}
                      >
                        {isTopPerformer && (
                          <div style={{
                            position: 'absolute',
                            top: '12px',
                            right: '12px',
                            background: '#10b981',
                            color: 'white',
                            padding: '4px 8px',
                            borderRadius: '4px',
                            fontSize: '11px',
                            fontWeight: 600
                          }}>
                            TOP {index + 1}
                          </div>
                        )}
                        
                        <div style={{ marginBottom: '12px' }}>
                          <div style={{ fontSize: '18px', fontWeight: 700, color: '#667eea' }}>
                            H{item._id.hospitalNo.toString().padStart(2, '0')}
                          </div>
                          <div style={{ fontSize: '14px', fontWeight: 600, color: '#1f2937', marginTop: '4px', lineHeight: '1.4' }}>
                            {item._id.hospitalName}
                          </div>
                        </div>

                        <div style={{ marginBottom: '12px' }}>
                          <div style={{ fontSize: '32px', fontWeight: 800, color: '#667eea' }}>
                            {item.count}
                          </div>
                          <div style={{ fontSize: '12px', color: '#6b7280' }}>applications processed</div>
                        </div>

                        <div>
                          <div style={{ fontSize: '11px', color: '#6b7280', marginBottom: '4px' }}>
                            Relative Volume
                          </div>
                          <div style={{ background: '#e5e7eb', height: '8px', borderRadius: '4px', overflow: 'hidden' }}>
                            <div style={{
                              width: `${relativePerformance}%`,
                              height: '100%',
                              background: 'linear-gradient(90deg, #667eea, #764ba2)',
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
                  <h2 style={{ fontSize: '22px', fontWeight: '700', marginBottom: '8px' }}>
                    ⚡ System Performance Metrics
                  </h2>
                  <p style={{ color: '#6b7280', fontSize: '14px' }}>
                    Key performance indicators and operational efficiency metrics
                  </p>
                </div>

                {/* Performance Cards */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginBottom: '32px' }}>
                  <div className="card" style={{ padding: '24px' }}>
                    <div style={{ fontSize: '14px', fontWeight: 600, color: '#6b7280', marginBottom: '12px' }}>
                      Average Turnaround Time
                    </div>
                    <div style={{ fontSize: '48px', fontWeight: 800, color: '#3b82f6', marginBottom: '8px' }}>
                      {analytics.turnaroundStats.averageTurnaroundHours > 0 
                        ? Math.round(analytics.turnaroundStats.averageTurnaroundHours) 
                        : 0}
                      <span style={{ fontSize: '24px' }}>h</span>
                    </div>
                    <div style={{ fontSize: '12px', color: '#6b7280' }}>
                      Min: {Math.round(analytics.turnaroundStats.minTurnaroundHours)}h | 
                      Max: {Math.round(analytics.turnaroundStats.maxTurnaroundHours)}h
                    </div>
                  </div>

                  <div className="card" style={{ padding: '24px' }}>
                    <div style={{ fontSize: '14px', fontWeight: 600, color: '#6b7280', marginBottom: '12px' }}>
                      Approval Rate
                    </div>
                    <div style={{ fontSize: '48px', fontWeight: 800, color: '#10b981', marginBottom: '8px' }}>
                      {insights?.successRate}%
                    </div>
                    <div style={{ fontSize: '12px', color: '#6b7280' }}>
                      {analytics.statusCounts.find(s => s._id === 'operator_approved')?.count || 0} out of {analytics.totalApplications} applications
                    </div>
                  </div>

                  <div className="card" style={{ padding: '24px' }}>
                    <div style={{ fontSize: '14px', fontWeight: 600, color: '#6b7280', marginBottom: '12px' }}>
                      Rejection Rate
                    </div>
                    <div style={{ fontSize: '48px', fontWeight: 800, color: '#ef4444', marginBottom: '8px' }}>
                      {insights?.rejectionRate}%
                    </div>
                    <div style={{ fontSize: '12px', color: '#6b7280' }}>
                      {analytics.statusCounts.find(s => s._id === 'rejected')?.count || 0} applications rejected
                    </div>
                  </div>

                  <div className="card" style={{ padding: '24px' }}>
                    <div style={{ fontSize: '14px', fontWeight: 600, color: '#6b7280', marginBottom: '12px' }}>
                      Pending Processing
                    </div>
                    <div style={{ fontSize: '48px', fontWeight: 800, color: '#f59e0b', marginBottom: '8px' }}>
                      {analytics.statusCounts.find(s => s._id === 'pending')?.count || 0}
                    </div>
                    <div style={{ fontSize: '12px', color: '#6b7280' }}>
                      {((analytics.statusCounts.find(s => s._id === 'pending')?.count || 0) / analytics.totalApplications * 100).toFixed(1)}% of total workload
                    </div>
                  </div>
                </div>

                {/* Performance Indicators */}
                <div className="card" style={{ marginBottom: '24px', padding: '24px' }}>
                  <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '20px' }}>
                    📊 Efficiency Indicators
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    {[
                      {
                        label: 'Overall Efficiency',
                        value: parseFloat(insights?.successRate || '0') > 90 ? 95 : parseFloat(insights?.successRate || '0'),
                        color: '#10b981',
                        target: 90,
                        status: parseFloat(insights?.successRate || '0') >= 90 ? 'Excellent' : 'Good'
                      },
                      {
                        label: 'Processing Speed',
                        value: analytics.turnaroundStats.averageTurnaroundHours < 72 ? 85 : 60,
                        color: '#3b82f6',
                        target: 80,
                        status: analytics.turnaroundStats.averageTurnaroundHours < 72 ? 'Good' : 'Needs Improvement'
                      },
                      {
                        label: 'Quality Score',
                        value: 100 - parseFloat(insights?.rejectionRate || '0') * 2,
                        color: '#8b5cf6',
                        target: 85,
                        status: parseFloat(insights?.rejectionRate || '0') < 8 ? 'Excellent' : 'Good'
                      }
                    ].map((indicator, index) => (
                      <div key={index}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                          <span style={{ fontSize: '14px', fontWeight: 600 }}>{indicator.label}</span>
                          <span style={{ fontSize: '14px', fontWeight: 700, color: indicator.color }}>
                            {indicator.value.toFixed(0)}% - {indicator.status}
                          </span>
                        </div>
                        <div style={{ position: 'relative', background: '#e5e7eb', height: '16px', borderRadius: '8px', overflow: 'hidden' }}>
                          <div style={{
                            width: `${indicator.value}%`,
                            height: '100%',
                            background: indicator.color,
                            transition: 'width 0.5s ease',
                            borderRadius: '8px'
                          }} />
                          <div style={{
                            position: 'absolute',
                            left: `${indicator.target}%`,
                            top: 0,
                            bottom: 0,
                            width: '2px',
                            background: '#374151',
                            opacity: 0.5
                          }} />
                        </div>
                        <div style={{ fontSize: '11px', color: '#6b7280', marginTop: '4px' }}>
                          Target: {indicator.target}%
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
                  <h2 style={{ fontSize: '22px', fontWeight: '700', marginBottom: '8px' }}>
                    📋 Application Management
                  </h2>
                  <p style={{ color: '#6b7280', fontSize: '14px' }}>
                    Search, filter, and manage all applications across the system
                  </p>
                </div>

                <div className="card">
                  <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="🔍 Search by application number..."
                      value={searchTerm}
                      onChange={e => setSearchTerm(e.target.value)}
                      style={{ flex: 1, minWidth: '200px' }}
                    />
                    <select 
                      className="form-select" 
                      value={selectedStatus} 
                      onChange={e => setSelectedStatus(e.target.value)}
                      style={{ minWidth: '180px' }}
                    >
                      <option value="">All Status</option>
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
                          <th>Application No.</th>
                          <th>Child Name</th>
                          <th>Hospital</th>
                          <th>Status</th>
                          <th>Submitted</th>
                          <th>Processing Time</th>
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
                                <code style={{ color: '#667eea', fontSize: '13px', fontWeight: 600 }}>
                                  {app.applicationNumber}
                                </code>
                              </td>
                              <td style={{ fontWeight: 500 }}>
                                {app.childName || <em style={{ color: '#9ca3af' }}>Not named</em>}
                              </td>
                              <td>
                                <div style={{ fontSize: '13px' }}>
                                  {app.hospitalId ? (
                                    <>
                                      <span style={{ fontWeight: 600, color: '#667eea' }}>
                                        H{app.hospitalId.hospitalNo.toString().padStart(2, '0')}
                                      </span>
                                      {' '}{app.hospitalId.name}
                                    </>
                                  ) : (
                                    <em style={{ color: '#9ca3af' }}>No hospital</em>
                                  )}
                                </div>
                              </td>
                              <td>
                                <span style={{
                                  display: 'inline-block',
                                  padding: '4px 12px',
                                  borderRadius: '12px',
                                  fontSize: '12px',
                                  fontWeight: 600,
                                  background: `${statusColors[app.status]}20`,
                                  color: statusColors[app.status]
                                }}>
                                  {statusLabels[app.status] || app.status}
                                </span>
                              </td>
                              <td style={{ fontSize: '13px', color: '#6b7280' }}>
                                {createdAt.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                              </td>
                              <td style={{ fontSize: '13px', color: '#6b7280', fontWeight: 500 }}>
                                {app.status === 'pending' ? (
                                  <span style={{ color: '#f59e0b' }}>⏳ In progress...</span>
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
                    <div style={{ textAlign: 'center', padding: '60px 20px', color: '#9ca3af' }}>
                      <div style={{ fontSize: '48px', marginBottom: '16px' }}>📋</div>
                      <div style={{ fontSize: '16px', fontWeight: 600 }}>No applications found</div>
                      <div style={{ fontSize: '14px', marginTop: '8px' }}>Try adjusting your search or filter criteria</div>
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
