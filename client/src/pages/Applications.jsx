import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  Clock, 
  Search, 
  ChevronDown, 
  ChevronUp, 
  ArrowRight,
  ShieldCheck,
  Calendar,
  Layers,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { API_URL } from '../context/AuthContext';

const Applications = () => {
  const { token } = useAuth();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);
  const [statusFilter, setStatusFilter] = useState('All');
  
  // Tracking search box
  const [searchTrackingCode, setSearchTrackingCode] = useState('');
  const [searchedApp, setSearchedApp] = useState(null);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState('');

  const fetchApplications = async () => {
    if (!token) return;
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/applications/my-applications`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setApplications(data);
      }
    } catch (err) {
      console.error('Error fetching applications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, [token]);

  const handleSearchTracking = async (e) => {
    e.preventDefault();
    if (!searchTrackingCode.trim()) return;
    
    try {
      setSearchLoading(true);
      setSearchError('');
      setSearchedApp(null);
      
      const res = await fetch(`${API_URL}/applications/track/${searchTrackingCode.trim().toUpperCase()}`);
      if (res.ok) {
        const data = await res.json();
        setSearchedApp(data);
      } else {
        const errData = await res.json();
        setSearchError(errData.message || 'No application found with this tracking ID');
      }
    } catch (err) {
      setSearchError('Error contacting the server');
    } finally {
      setSearchLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Approved': return 'var(--accent)'; // Green
      case 'Rejected': return '#EF4444'; // Red
      case 'Under Review': return 'var(--primary)'; // Blue
      case 'Documents Verified': return 'var(--secondary)'; // Purple
      case 'Pending Verification':
      default:
        return '#F59E0B'; // Orange
    }
  };

  const getStatusStepIndex = (status) => {
    switch (status) {
      case 'Pending Verification': return 1;
      case 'Documents Verified': return 2;
      case 'Under Review': return 3;
      case 'Approved':
      case 'Rejected': 
        return 4;
      default: return 1;
    }
  };

  const filteredApps = applications.filter(app => {
    if (statusFilter === 'All') return true;
    return app.status === statusFilter;
  });

  return (
    <div className="animate-fade" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* Page Header */}
      <div>
        <h2 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Applications Tracking</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
          Monitor the real-time status of your welfare scheme applications and review automatic AI document verification audits.
        </p>
      </div>

      {/* Direct Tracking Lookup Box */}
      <div className="glass-card" style={{ padding: '1.5rem', background: 'radial-gradient(circle at bottom right, rgba(37, 99, 235, 0.04), transparent 50%), var(--bg-card)' }}>
        <h3 style={{ fontSize: '1.1rem', marginBottom: '0.75rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Search size={18} style={{ color: 'var(--primary)' }} />
          Quick Tracking Lookup
        </h3>
        <form onSubmit={handleSearchTracking} style={{ display: 'flex', gap: '0.75rem', maxWidth: '600px' }}>
          <input 
            type="text" 
            placeholder="Enter Tracking ID (e.g. SCH-XXXXXX)"
            value={searchTrackingCode}
            onChange={(e) => setSearchTrackingCode(e.target.value)}
            className="form-control"
            style={{ textTransform: 'uppercase', flex: 1 }}
          />
          <button type="submit" className="btn btn-primary" disabled={searchLoading} style={{ padding: '0.65rem 1.5rem' }}>
            {searchLoading ? 'Searching...' : 'Track'}
          </button>
        </form>

        {/* Tracking Search Result Card */}
        {searchError && (
          <div style={{ color: '#EF4444', fontSize: '0.9rem', marginTop: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <AlertCircle size={16} /> {searchError}
          </div>
        )}

        {searchedApp && (
          <div className="glass-card animate-fade" style={{ marginTop: '1.25rem', padding: '1.25rem', background: 'var(--bg-main)', border: '1px solid var(--border-color)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>SEARCH RESULT</span>
                <h4 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--primary)' }}>{searchedApp.scheme?.name}</h4>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                  Applicant: <strong style={{ color: 'var(--text-primary)' }}>{searchedApp.user?.name || 'Citizen'}</strong> | Tracking ID: <strong>{searchedApp.trackingNumber}</strong>
                </div>
              </div>
              <span className="badge" style={{ 
                background: `${getStatusColor(searchedApp.status)}15`, 
                color: getStatusColor(searchedApp.status),
                borderColor: `${getStatusColor(searchedApp.status)}30`,
                fontSize: '0.85rem',
                padding: '0.4rem 0.8rem'
              }}>
                {searchedApp.status}
              </span>
            </div>
            
            {/* Horizontal Timeline inside Quick Track */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '1.5rem 0', position: 'relative' }}>
              <div style={{ position: 'absolute', left: '10%', right: '10%', height: '2px', background: 'var(--border-color)', zIndex: 0 }} />
              <div style={{ position: 'absolute', left: '10%', width: searchedApp.status === 'Approved' || searchedApp.status === 'Rejected' ? '80%' : searchedApp.status === 'Under Review' ? '50%' : searchedApp.status === 'Documents Verified' ? '25%' : '0%', height: '2px', background: getStatusColor(searchedApp.status), zIndex: 0, transition: 'all 0.5s ease' }} />
              
              {['Submitted', 'AI Audit', 'Under Review', 'Decision'].map((label, stepIdx) => {
                const isActive = getStatusStepIndex(searchedApp.status) >= (stepIdx + 1);
                const isCurrent = getStatusStepIndex(searchedApp.status) === (stepIdx + 1);
                return (
                  <div key={label} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 1, position: 'relative' }}>
                    <div style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '50%',
                      background: isActive ? getStatusColor(searchedApp.status) : 'var(--bg-card)',
                      border: `2px solid ${isActive ? getStatusColor(searchedApp.status) : 'var(--border-color)'}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: isActive ? '#FFFFFF' : 'var(--text-muted)',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      boxShadow: isCurrent ? `0 0 12px ${getStatusColor(searchedApp.status)}50` : 'none',
                      transition: 'all 0.3s ease'
                    }}>
                      {isActive ? '✓' : stepIdx + 1}
                    </div>
                    <span style={{ fontSize: '0.75rem', marginTop: '0.4rem', fontWeight: isActive ? 600 : 500, color: isActive ? 'var(--text-primary)' : 'var(--text-muted)' }}>{label}</span>
                  </div>
                );
              })}
            </div>

            <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', background: 'var(--bg-card)', padding: '0.75rem 1rem', borderRadius: 'var(--radius-sm)', borderLeft: `3px solid ${getStatusColor(searchedApp.status)}` }}>
              <strong>AI/Admin Remarks:</strong> {searchedApp.remarks || 'No comments logged.'}
            </div>
          </div>
        )}
      </div>

      {/* Main Content Area */}
      <div className="glass-card" style={{ padding: '2rem' }}>
        
        {/* Filter Toolbar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>Submitted Applications ({filteredApps.length})</h3>
          
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {['All', 'Pending Verification', 'Documents Verified', 'Under Review', 'Approved', 'Rejected'].map(filter => (
              <button
                key={filter}
                onClick={() => setStatusFilter(filter)}
                className={`btn ${statusFilter === filter ? 'btn-primary' : 'btn-secondary'}`}
                style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem', whiteSpace: 'nowrap' }}
              >
                {filter === 'Pending Verification' ? 'Pending' : filter === 'Documents Verified' ? 'Verified' : filter}
              </button>
            ))}
          </div>
        </div>

        {/* Loading Spinner */}
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div className="skeleton" style={{ height: '100px', width: '100%' }} />
            <div className="skeleton" style={{ height: '100px', width: '100%' }} />
          </div>
        ) : filteredApps.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem 2rem', color: 'var(--text-secondary)' }}>
            <FileText size={48} style={{ color: 'var(--border-color)', margin: '0 auto 1rem auto' }} />
            <h4>No Applications Found</h4>
            <p style={{ marginTop: '0.5rem', fontSize: '0.9rem' }}>
              You haven't submitted any scheme applications yet. Navigate to the <strong>Eligibility Checker</strong> tab to discover schemes and apply.
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {filteredApps.map((app) => {
              const isExpanded = expandedId === app._id;
              const statusColor = getStatusColor(app.status);
              const currentStep = getStatusStepIndex(app.status);
              
              return (
                <div key={app._id} className="glass-card" style={{ 
                  padding: '1.5rem',
                  border: isExpanded ? `1px solid ${statusColor}30` : '1px solid var(--border-color)',
                  boxShadow: isExpanded ? `0 4px 20px ${statusColor}08` : 'none',
                  transition: 'all 0.3s ease'
                }}>
                  {/* Collapsed Header */}
                  <div 
                    onClick={() => setExpandedId(isExpanded ? null : app._id)}
                    style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', flexWrap: 'wrap', gap: '1rem' }}
                  >
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                        <span className="badge" style={{ 
                          background: `${statusColor}12`, 
                          color: statusColor,
                          borderColor: `${statusColor}25`
                        }}>
                          {app.status}
                        </span>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>ID: {app.trackingNumber}</span>
                      </div>
                      <h4 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '0.5rem' }}>
                        {app.scheme?.name}
                      </h4>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', marginTop: '0.4rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                          <Calendar size={13} />
                          Applied: {new Date(app.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                          <Layers size={13} />
                          Department: {app.scheme?.department || 'Welfare Board'}
                        </span>
                      </div>
                    </div>
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', fontSize: '0.8rem' }}>
                        <span style={{ color: 'var(--text-muted)' }}>AI Document Match</span>
                        <strong style={{ color: 'var(--accent)' }}>
                          {app.documents?.filter(d => d.status === 'Verified').length || 0} / {app.documents?.length || 0} Files
                        </strong>
                      </div>
                      <button className="btn-icon" style={{ width: '32px', height: '32px' }}>
                        {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </button>
                    </div>
                  </div>

                  {/* Expanded Tracker Panel */}
                  {isExpanded && (
                    <div className="animate-fade" style={{ 
                      marginTop: '1.5rem',
                      borderTop: '1px solid var(--border-color)',
                      paddingTop: '1.5rem',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '1.5rem'
                    }}>
                      
                      {/* Visual Stepper Timeline */}
                      <div>
                        <h5 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--text-primary)' }}>Application Pipeline Progress</h5>
                        <div style={{ 
                          display: 'grid', 
                          gridTemplateColumns: 'repeat(4, 1fr)', 
                          gap: '0.5rem',
                          background: 'var(--bg-main)',
                          padding: '1.25rem 1rem',
                          borderRadius: 'var(--radius-md)',
                          border: '1px solid var(--border-color)',
                          position: 'relative'
                        }}>
                          {/* Step 1: Submitted */}
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                            <div style={{ 
                              width: '32px', height: '32px', borderRadius: '50%',
                              background: 'var(--accent)', color: '#FFFFFF',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              fontSize: '0.9rem', fontWeight: 700, marginBottom: '0.5rem'
                            }}>
                              ✓
                            </div>
                            <span style={{ fontSize: '0.8rem', fontWeight: 700 }}>Submitted</span>
                            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>Data Saved</span>
                          </div>

                          {/* Step 2: AI Verification */}
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                            <div style={{ 
                              width: '32px', height: '32px', borderRadius: '50%',
                              background: currentStep >= 2 ? (app.status === 'Pending Verification' ? '#F59E0B' : 'var(--accent)') : 'var(--bg-card)',
                              border: currentStep >= 2 ? 'none' : '2px solid var(--border-color)',
                              color: currentStep >= 2 ? '#FFFFFF' : 'var(--text-muted)',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              fontSize: '0.9rem', fontWeight: 700, marginBottom: '0.5rem'
                            }}>
                              {currentStep > 2 ? '✓' : <ShieldCheck size={16} />}
                            </div>
                            <span style={{ fontSize: '0.8rem', fontWeight: currentStep >= 2 ? 700 : 500 }}>AI Audit Scan</span>
                            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                              {app.status === 'Pending Verification' ? 'Warning Check' : 'Verified'}
                            </span>
                          </div>

                          {/* Step 3: Under Review */}
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                            <div style={{ 
                              width: '32px', height: '32px', borderRadius: '50%',
                              background: currentStep >= 3 ? 'var(--primary)' : 'var(--bg-card)',
                              border: currentStep >= 3 ? 'none' : '2px solid var(--border-color)',
                              color: currentStep >= 3 ? '#FFFFFF' : 'var(--text-muted)',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              fontSize: '0.9rem', fontWeight: 700, marginBottom: '0.5rem'
                            }}>
                              {currentStep > 3 ? '✓' : <Clock size={16} />}
                            </div>
                            <span style={{ fontSize: '0.8rem', fontWeight: currentStep >= 3 ? 700 : 500 }}>Under Review</span>
                            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>Board Check</span>
                          </div>

                          {/* Step 4: Decision */}
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                            <div style={{ 
                              width: '32px', height: '32px', borderRadius: '50%',
                              background: app.status === 'Approved' ? 'var(--accent)' : app.status === 'Rejected' ? '#EF4444' : 'var(--bg-card)',
                              border: (app.status === 'Approved' || app.status === 'Rejected') ? 'none' : '2px solid var(--border-color)',
                              color: (app.status === 'Approved' || app.status === 'Rejected') ? '#FFFFFF' : 'var(--text-muted)',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              fontSize: '0.9rem', fontWeight: 700, marginBottom: '0.5rem'
                            }}>
                              {app.status === 'Approved' ? '✓' : app.status === 'Rejected' ? '✗' : '?'}
                            </div>
                            <span style={{ fontSize: '0.8rem', fontWeight: currentStep === 4 ? 700 : 500 }}>Decision</span>
                            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>Final Status</span>
                          </div>
                        </div>
                      </div>

                      {/* Remarks & Explanation */}
                      <div style={{ 
                        background: `${statusColor}06`, 
                        padding: '1rem 1.25rem', 
                        borderRadius: 'var(--radius-md)', 
                        borderLeft: `4px solid ${statusColor}`,
                        fontSize: '0.92rem'
                      }}>
                        <strong style={{ color: 'var(--text-primary)', display: 'block', marginBottom: '0.25rem' }}>
                          Status Remarks:
                        </strong>
                        <span style={{ color: 'var(--text-secondary)' }}>
                          {app.remarks || 'Your application files have been successfully logged in the central systems and are pending review.'}
                        </span>
                      </div>

                      {/* Document Checklist Audit */}
                      <div>
                        <h5 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          <Sparkles size={16} style={{ color: 'var(--secondary)' }} />
                          AI Document Verification Report
                        </h5>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                          {app.documents?.map((doc, dIdx) => (
                            <div key={dIdx} style={{ 
                              display: 'flex', 
                              justifyContent: 'space-between', 
                              alignItems: 'center',
                              padding: '0.75rem 1rem',
                              background: 'var(--bg-main)',
                              borderRadius: 'var(--radius-sm)',
                              border: '1px solid var(--border-color)',
                              fontSize: '0.88rem'
                            }}>
                              <div>
                                <strong style={{ color: 'var(--text-primary)' }}>{doc.name}</strong>
                                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                                  Uploaded File: <span style={{ fontFamily: 'monospace', color: 'var(--text-secondary)' }}>{doc.fileName}</span>
                                </div>
                                <div style={{ fontSize: '0.8rem', color: doc.status === 'Verified' ? 'var(--accent)' : doc.status === 'Rejected' ? '#EF4444' : '#F59E0B', marginTop: '0.25rem', fontStyle: 'italic' }}>
                                  {doc.remarks || 'Awaiting document scanner evaluation.'}
                                </div>
                              </div>
                              <span style={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                gap: '0.3rem', 
                                fontWeight: 700,
                                fontSize: '0.8rem',
                                color: doc.status === 'Verified' ? 'var(--accent)' : doc.status === 'Rejected' ? '#EF4444' : '#F59E0B'
                              }}>
                                {doc.status === 'Verified' ? <CheckCircle size={15} /> : doc.status === 'Rejected' ? <XCircle size={15} /> : <Clock size={15} />}
                                {doc.status}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
};

export default Applications;
