import React, { useState, useEffect } from 'react';
import { 
  FileCheck, 
  Sparkles, 
  Download, 
  Bookmark, 
  Check, 
  ExternalLink,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  Mail,
  Share2
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { API_URL } from '../context/AuthContext';
import VoiceInput from '../components/VoiceInput';

const EligibilityForm = () => {
  const { user, token, updateProfile } = useAuth();
  const { t } = useLanguage();

  // Form Fields State (pre-populated with user details if available)
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    gender: 'Male',
    state: 'Tamil Nadu',
    district: '',
    occupation: 'None',
    annualIncome: '',
    education: 'Secondary School',
    category: 'General',
    isFarmer: false,
    isStudent: false,
    isSeniorCitizen: false,
    isDisabled: false,
    isWidow: false
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        age: user.age || '',
        gender: user.gender || 'Male',
        state: user.state || 'Tamil Nadu',
        district: user.district || '',
        occupation: user.occupation || 'None',
        annualIncome: user.annualIncome || '',
        education: user.education || 'Secondary School',
        category: user.category || 'General',
        isFarmer: user.isFarmer || false,
        isStudent: user.isStudent || false,
        isSeniorCitizen: user.isSeniorCitizen || false,
        isDisabled: user.isDisabled || false,
        isWidow: user.isWidow || false
      });
    }
  }, [user]);

  // UI Flow States
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [expandedScheme, setExpandedScheme] = useState(null);
  const [bookmarkedIds, setBookmarkedIds] = useState(new Set());
  const [reportId, setReportId] = useState(null);

  // Email Sharing Simulation
  const [emailSent, setEmailSent] = useState({});

  // Application Submission States
  const [applyingScheme, setApplyingScheme] = useState(null);
  const [submissionLoading, setSubmissionLoading] = useState(false);
  const [submissionStepText, setSubmissionStepText] = useState('');
  const [submissionResult, setSubmissionResult] = useState(null);
  const [applicationFiles, setApplicationFiles] = useState({}); // { [docName]: { name: string } }

  const handleApplySubmit = async (e) => {
    e.preventDefault();
    if (!applyingScheme) return;

    // Check if all files are uploaded
    const requiredDocs = applyingScheme.documents || [];
    const missing = requiredDocs.filter(doc => !applicationFiles[doc]);
    if (missing.length > 0) {
      alert(`Please upload/simulate files for all required documents: ${missing.join(', ')}`);
      return;
    }

    setSubmissionLoading(true);
    setSubmissionStepText('Initializing Secure Connection...');

    const steps = [
      'Scanning Aadhaar Card structure...',
      'Matching applicant names on certificates...',
      'Verifying Income Certificate thresholds...',
      'Validating Land registry details...',
      'Finalizing welfare enrollment data...'
    ];

    // Visual sequence for AI Document Verification
    for (let i = 0; i < steps.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 700));
      setSubmissionStepText(steps[i]);
    }

    try {
      const payload = {
        schemeId: applyingScheme.schemeId || applyingScheme._id,
        documents: requiredDocs.map(doc => ({
          name: doc,
          fileName: applicationFiles[doc].name
        }))
      };

      const res = await fetch(`${API_URL}/applications/apply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (res.ok) {
        setSubmissionResult(data.application);
        triggerConfetti();
      } else {
        alert(data.message || 'Application submission failed');
        setSubmissionLoading(false);
      }
    } catch (err) {
      console.error(err);
      alert('Error connecting to the server');
      setSubmissionLoading(false);
    }
  };

  // Helper for voice input
  const handleVoiceFill = (field, text) => {
    // Basic formatting or regex parsing if needed
    let cleaned = text.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g,"");
    if (field === 'age' || field === 'annualIncome') {
      cleaned = cleaned.replace(/\D/g, ""); // keep only digits
    }
    setFormData(prev => ({ ...prev, [field]: cleaned }));
  };

  const handleCheckboxChange = (field) => {
    setFormData(prev => ({ ...prev, [field]: !prev[field] }));
  };

  const handleFieldChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const triggerConfetti = () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResults(null);
    setExpandedScheme(null);
    setReportId(null);

    try {
      // 1. Update user profile first in background
      await updateProfile({
        age: Number(formData.age),
        gender: formData.gender,
        state: formData.state,
        district: formData.district,
        occupation: formData.occupation,
        annualIncome: Number(formData.annualIncome),
        education: formData.education,
        category: formData.category,
        isFarmer: formData.isFarmer,
        isStudent: formData.isStudent,
        isSeniorCitizen: formData.isSeniorCitizen,
        isDisabled: formData.isDisabled,
        isWidow: formData.isWidow
      });

      // 2. Fetch eligibility recommendations
      const response = await fetch(`${API_URL}/eligibility`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        throw new Error('Eligibility checking failed');
      }

      const data = await response.json();
      setResults(data.eligibleSchemes);
      setReportId(data.reportId);

      if (data.eligibleSchemes && data.eligibleSchemes.length > 0) {
        triggerConfetti();
      }

      // Sync bookmarks checklist
      const bookRes = await fetch(`${API_URL}/bookmarks`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (bookRes.ok) {
        const bookData = await bookRes.json();
        setBookmarkedIds(new Set(bookData.map(b => b.scheme?._id)));
      }

    } catch (error) {
      console.error(error);
      alert('Error running eligibility audit. Please configure GEMINI_API_KEY for full AI evaluations.');
    } finally {
      setLoading(false);
    }
  };

  const toggleBookmark = async (schemeId) => {
    if (!schemeId) return;
    try {
      const isBookmarked = bookmarkedIds.has(schemeId);
      if (isBookmarked) {
        const res = await fetch(`${API_URL}/bookmarks/${schemeId}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          setBookmarkedIds(prev => {
            const next = new Set(prev);
            next.delete(schemeId);
            return next;
          });
        }
      } else {
        const res = await fetch(`${API_URL}/bookmarks`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ schemeId })
        });
        if (res.ok) {
          setBookmarkedIds(prev => {
            const next = new Set(prev);
            next.add(schemeId);
            return next;
          });
        }
      }
    } catch (err) {
      console.error('Failed to update bookmark status:', err);
    }
  };

  const handleDownloadPDF = () => {
    if (!reportId) return;
    window.open(`${API_URL}/reports/${reportId}/pdf?token=${token}`, '_blank');
  };

  const simulateEmailReport = (schemeIndex) => {
    setEmailSent(prev => ({ ...prev, [schemeIndex]: true }));
    setTimeout(() => {
      setEmailSent(prev => ({ ...prev, [schemeIndex]: false }));
    }, 3000);
  };

  const statesOfIndia = [
    "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", 
    "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", 
    "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram", 
    "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", 
    "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal"
  ];

  return (
    <div className="animate-fade" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Title */}
      <div>
        <h2 style={{ fontSize: '1.75rem', fontWeight: 800 }}>{t('sidebarEligibility')}</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
          Enter credentials or use voice typing. The AI auditor will cross-reference rules to recommend benefits.
        </p>
      </div>

      {/* Main Form container */}
      <div className="glass-card" style={{ padding: '2rem' }}>
        <form onSubmit={handleFormSubmit}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '1.5rem',
            marginBottom: '1.5rem'
          }}>
            {/* Full Name */}
            <div className="form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label className="form-label">{t('formName')}</label>
                <VoiceInput onTranscript={(text) => handleVoiceFill('name', text)} />
              </div>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleFieldChange}
                className="form-control"
                placeholder="Enter name"
                required
              />
            </div>

            {/* Age */}
            <div className="form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label className="form-label">{t('formAge')}</label>
                <VoiceInput onTranscript={(text) => handleVoiceFill('age', text)} />
              </div>
              <input
                type="number"
                name="age"
                value={formData.age}
                onChange={handleFieldChange}
                className="form-control"
                placeholder="e.g. 24"
                min="0"
                max="120"
                required
              />
            </div>

            {/* Gender */}
            <div className="form-group">
              <label className="form-label">{t('formGender')}</label>
              <select name="gender" value={formData.gender} onChange={handleFieldChange} className="form-control">
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>

            {/* State */}
            <div className="form-group">
              <label className="form-label">{t('formState')}</label>
              <select name="state" value={formData.state} onChange={handleFieldChange} className="form-control">
                {statesOfIndia.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            {/* District */}
            <div className="form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label className="form-label">{t('formDistrict')}</label>
                <VoiceInput onTranscript={(text) => handleVoiceFill('district', text)} />
              </div>
              <input
                type="text"
                name="district"
                value={formData.district}
                onChange={handleFieldChange}
                className="form-control"
                placeholder="Enter district name"
                required
              />
            </div>

            {/* Occupation */}
            <div className="form-group">
              <label className="form-label">{t('formOccupation')}</label>
              <select name="occupation" value={formData.occupation} onChange={handleFieldChange} className="form-control">
                <option value="None">None (Unemployed/Other)</option>
                <option value="Farmer">Farmer / Agriculture</option>
                <option value="Student">Student</option>
                <option value="Laborer">Manual Laborer / Worker</option>
                <option value="Artisan">Traditional Artisan / Craftsman</option>
                <option value="Business">Small Business Owner / Vendor</option>
                <option value="Salaried">Salaried Employee</option>
              </select>
            </div>

            {/* Annual Income */}
            <div className="form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label className="form-label">{t('formIncome')}</label>
                <VoiceInput onTranscript={(text) => handleVoiceFill('annualIncome', text)} />
              </div>
              <input
                type="number"
                name="annualIncome"
                value={formData.annualIncome}
                onChange={handleFieldChange}
                className="form-control"
                placeholder="e.g. 150000"
                min="0"
                required
              />
            </div>

            {/* Education */}
            <div className="form-group">
              <label className="form-label">{t('formEducation')}</label>
              <select name="education" value={formData.education} onChange={handleFieldChange} className="form-control">
                <option value="Illiterate">Below 8th Grade</option>
                <option value="8th Pass">8th Grade Pass</option>
                <option value="Secondary School">10th Grade / Secondary</option>
                <option value="Higher Secondary">12th Grade / HSC</option>
                <option value="Graduate">Bachelor's Degree / Graduate</option>
                <option value="Postgraduate">Post Graduate or above</option>
              </select>
            </div>

            {/* Social Category */}
            <div className="form-group">
              <label className="form-label">{t('formCategory')}</label>
              <select name="category" value={formData.category} onChange={handleFieldChange} className="form-control">
                <option value="General">General / Unreserved</option>
                <option value="OBC">OBC (Other Backward Classes)</option>
                <option value="SC">SC (Scheduled Caste)</option>
                <option value="ST">ST (Scheduled Tribe)</option>
              </select>
            </div>
          </div>

          {/* Checkbox Attributes */}
          <div style={{ marginBottom: '2rem' }}>
            <label className="form-label" style={{ display: 'block', marginBottom: '0.75rem' }}>Special Qualifications Checklist</label>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: '1rem'
            }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', cursor: 'pointer' }}>
                <input type="checkbox" checked={formData.isFarmer} onChange={() => handleCheckboxChange('isFarmer')} />
                {t('formFarmer')}
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', cursor: 'pointer' }}>
                <input type="checkbox" checked={formData.isStudent} onChange={() => handleCheckboxChange('isStudent')} />
                {t('formStudent')}
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', cursor: 'pointer' }}>
                <input type="checkbox" checked={formData.isSeniorCitizen} onChange={() => handleCheckboxChange('isSeniorCitizen')} />
                {t('formSenior')}
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', cursor: 'pointer' }}>
                <input type="checkbox" checked={formData.isDisabled} onChange={() => handleCheckboxChange('isDisabled')} />
                {t('formDisability')}
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', cursor: 'pointer' }}>
                <input type="checkbox" checked={formData.isWidow} onChange={() => handleCheckboxChange('isWidow')} />
                {t('formWidow')}
              </label>
            </div>
          </div>

          <button type="submit" disabled={loading} className="btn btn-primary" style={{ width: '100%' }}>
            {loading ? (
              <span>Running Welfare Audit...</span>
            ) : (
              <>
                <FileCheck size={18} /> {t('btnFindSchemes')}
              </>
            )}
          </button>
        </form>
      </div>

      {/* --- SKELETON LOADER OVERLAY --- */}
      {loading && (
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', padding: '2rem' }}>
          <div className="skeleton" style={{ height: '30px', width: '60%' }} />
          <div className="skeleton" style={{ height: '20px', width: '40%' }} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
            <div className="skeleton" style={{ height: '80px', width: '100%' }} />
            <div className="skeleton" style={{ height: '80px', width: '100%' }} />
          </div>
        </div>
      )}

      {/* --- RECOMMENDATIONS RESULTS --- */}
      {results !== null && !loading && (
        <div className="animate-fade" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderBottom: '1px solid var(--border-color)',
            paddingBottom: '1rem'
          }}>
            <div>
              <h3 style={{ fontSize: '1.35rem', fontWeight: 700 }}>
                Audit Results: {results.length} Eligible Scheme{results.length !== 1 ? 's' : ''} Found
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                Calculated contextually using Google Gemini AI engine.
              </p>
            </div>
            {results.length > 0 && (
              <button 
                onClick={handleDownloadPDF}
                className="btn btn-accent" 
                style={{ padding: '0.6rem 1.25rem', fontSize: '0.85rem' }}
              >
                <Download size={16} /> Download Full Report
              </button>
            )}
          </div>

          {results.length === 0 ? (
            <div className="glass-card" style={{ textAlign: 'center', padding: '3rem 2rem', color: 'var(--text-secondary)' }}>
              <AlertTriangle size={48} style={{ color: '#F59E0B', margin: '0 auto 1rem auto' }} />
              <h3>No Matches Found</h3>
              <p style={{ marginTop: '0.5rem', fontSize: '0.95rem' }}>
                Your financial profile or special categories did not trigger eligibility qualifiers. Try adjusting parameters or consult the chat assistant.
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {results.map((scheme, idx) => {
                const isExpanded = expandedScheme === idx;
                const isSaved = bookmarkedIds.has(scheme.schemeId);
                
                return (
                  <div key={idx} className="glass-card" style={{ padding: '1.25rem 1.5rem' }}>
                    <div 
                      onClick={() => setExpandedScheme(isExpanded ? null : idx)}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        cursor: 'pointer'
                      }}
                    >
                      <div>
                        <span className="badge badge-success" style={{ marginBottom: '0.5rem' }}>
                          Eligible
                        </span>
                        <h4 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--primary)' }}>
                          {scheme.name}
                        </h4>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }} onClick={(e) => e.stopPropagation()}>
                        {/* Bookmark Button */}
                        <button 
                          onClick={() => toggleBookmark(scheme.schemeId)}
                          className="btn-icon" 
                          style={{
                            width: '32px',
                            height: '32px',
                            background: isSaved ? 'rgba(124, 58, 237, 0.1)' : 'var(--bg-card)',
                            color: isSaved ? 'var(--secondary)' : 'var(--text-primary)',
                            borderColor: isSaved ? 'var(--secondary)' : 'var(--border-color)'
                          }}
                          title={isSaved ? "Remove Bookmark" : "Save Bookmark"}
                        >
                          <Bookmark size={14} fill={isSaved ? 'currentColor' : 'none'} />
                        </button>
                        
                        {/* Expand Trigger */}
                        <button 
                          onClick={() => setExpandedScheme(isExpanded ? null : idx)}
                          className="btn-icon" 
                          style={{ width: '32px', height: '32px' }}
                        >
                          {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                        </button>
                      </div>
                    </div>

                    {/* Expandable Details Container */}
                    {isExpanded && (
                      <div className="animate-fade" style={{
                        marginTop: '1.25rem',
                        borderTop: '1px solid var(--border-color)',
                        paddingTop: '1.25rem',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '1rem',
                        fontSize: '0.95rem',
                        lineHeight: 1.6
                      }}>
                        {/* Expected benefits */}
                        <div>
                          <strong style={{ color: 'var(--text-primary)' }}>Expected Benefits:</strong>
                          <p style={{ color: 'var(--text-secondary)', marginTop: '0.15rem' }}>{scheme.benefits}</p>
                        </div>

                        {/* Rationale */}
                        <div>
                          <strong style={{ color: 'var(--text-primary)' }}>Why You Qualify:</strong>
                          <p style={{ color: 'var(--text-secondary)', marginTop: '0.15rem', fontStyle: 'italic' }}>
                            {scheme.eligibilityReason}
                          </p>
                        </div>

                        {/* Documents checklist */}
                        <div>
                          <strong style={{ color: 'var(--text-primary)' }}>Required Documents Checklist:</strong>
                          <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                            gap: '0.5rem',
                            marginTop: '0.35rem'
                          }}>
                            {scheme.documents.map((doc, dIdx) => (
                              <label key={dIdx} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem', cursor: 'pointer' }}>
                                <input type="checkbox" style={{ accentColor: 'var(--accent)' }} />
                                {doc}
                              </label>
                            ))}
                          </div>
                        </div>

                        {/* Application steps */}
                        <div>
                          <strong style={{ color: 'var(--text-primary)' }}>Application Steps:</strong>
                          <ol style={{ paddingLeft: '1.25rem', color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.25rem' }}>
                            {scheme.applicationSteps.map((step, sIdx) => (
                              <li key={sIdx} style={{ marginBottom: '0.25rem' }}>{step}</li>
                            ))}
                          </ol>
                        </div>

                        {/* Action buttons */}
                        <div style={{
                          display: 'flex',
                          gap: '1rem',
                          borderTop: '1px solid var(--border-color)',
                          paddingTop: '1rem',
                          marginTop: '0.5rem'
                        }}>
                          <a 
                            href={scheme.officialLinks} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="btn btn-primary"
                            style={{ padding: '0.5rem 1.25rem', fontSize: '0.85rem' }}
                          >
                            <ExternalLink size={14} /> Official Portal
                          </a>

                          <button 
                            onClick={() => {
                              setApplyingScheme(scheme);
                              setSubmissionResult(null);
                              setSubmissionLoading(false);
                              setApplicationFiles({});
                            }}
                            className="btn btn-accent"
                            style={{ padding: '0.5rem 1.25rem', fontSize: '0.85rem' }}
                          >
                            Apply Now
                          </button>

                          <button 
                            onClick={() => simulateEmailReport(idx)}
                            className="btn btn-secondary"
                            style={{ padding: '0.5rem 1.25rem', fontSize: '0.85rem' }}
                          >
                            {emailSent[idx] ? (
                              <>
                                <Check size={14} color="var(--accent)" /> Sent to Email!
                              </>
                            ) : (
                              <>
                                <Mail size={14} /> Email Checklist
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Apply Modal */}
      {applyingScheme && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
          background: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(5px)',
          display: 'flex', alignItems: 'center', justifyContext: 'center', justifyContent: 'center',
          zIndex: 1000, padding: '2rem'
        }}>
          <style>{`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}</style>
          <div className="glass-card animate-fade" style={{
            width: '100%', maxWidth: '580px', maxHeight: '90vh', overflowY: 'auto',
            background: 'var(--bg-sidebar)', padding: '2rem', position: 'relative'
          }}>
            <button 
              onClick={() => setApplyingScheme(null)}
              className="btn-icon"
              style={{ position: 'absolute', right: '1.5rem', top: '1.5rem', width: '32px', height: '32px' }}
            >
              ✕
            </button>

            {!submissionLoading && !submissionResult ? (
              <>
                <h3 style={{ fontSize: '1.35rem', fontWeight: 800, marginBottom: '0.5rem', color: 'var(--primary)' }}>
                  Submit Welfare Application
                </h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
                  Applying for: <strong>{applyingScheme.name}</strong>
                </p>

                <form onSubmit={handleApplySubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  <div>
                    <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.75rem', color: 'var(--text-primary)' }}>
                      Upload Required Documents
                    </h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      {applyingScheme.documents.map((docName) => (
                        <div key={docName} style={{ 
                          padding: '0.75rem 1rem', background: 'var(--bg-main)', 
                          borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)',
                          display: 'flex', flexDirection: 'column', gap: '0.5rem'
                        }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: '0.88rem', fontWeight: 600 }}>{docName}</span>
                            {applicationFiles[docName] && (
                              <span style={{ fontSize: '0.75rem', color: 'var(--accent)', fontWeight: 600 }}>Ready</span>
                            )}
                          </div>
                          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                            <input 
                              type="file" 
                              onChange={(e) => {
                                if (e.target.files && e.target.files[0]) {
                                  setApplicationFiles(prev => ({
                                    ...prev,
                                    [docName]: e.target.files[0]
                                  }));
                                }
                              }}
                              style={{ display: 'none' }}
                              id={`file-${docName}`}
                            />
                            <label 
                              htmlFor={`file-${docName}`} 
                              className="btn btn-secondary" 
                              style={{ padding: '0.35rem 0.75rem', fontSize: '0.78rem', cursor: 'pointer', margin: 0 }}
                            >
                              Choose File
                            </label>
                            
                            <select 
                              onChange={(e) => {
                                if (e.target.value) {
                                  setApplicationFiles(prev => ({
                                    ...prev,
                                    [docName]: { name: e.target.value }
                                  }));
                                }
                              }}
                              className="form-control"
                              style={{ padding: '0.25rem', fontSize: '0.78rem', height: 'auto', flex: 1 }}
                              defaultValue=""
                            >
                              <option value="" disabled>Or select test simulation file</option>
                              <option value={`${docName.toLowerCase().replace(/\s+/g, '_')}_valid.pdf`}>Valid: {docName} (Passes AI)</option>
                              <option value="invalid_document.pdf">Invalid: Wrong File (Fails AI)</option>
                              <option value="corrupted_file.txt">Invalid: Corrupted (Fails AI)</option>
                            </select>
                          </div>
                          {applicationFiles[docName] && (
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                              Selected: {applicationFiles[docName].name}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  <button type="submit" className="btn btn-accent" style={{ width: '100%' }}>
                    Verify & Submit Application
                  </button>
                </form>
              </>
            ) : submissionLoading && !submissionResult ? (
              <div style={{ textAlign: 'center', padding: '3rem 1rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem' }}>
                <div style={{ 
                  width: '60px', height: '60px', borderRadius: '50%',
                  border: '4px solid var(--border-color)', borderTopColor: 'var(--primary)',
                  animation: 'spin 1s linear infinite'
                }} />
                <div>
                  <h4 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)' }}>AI Document Scanning Engine</h4>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.25rem' }}>{submissionStepText}</p>
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', textAlign: 'center', padding: '1rem 0' }}>
                <div style={{ 
                  width: '60px', height: '60px', borderRadius: '50%', background: 'rgba(16, 185, 129, 0.1)',
                  color: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto', fontSize: '1.75rem'
                }}>
                  ✓
                </div>
                <div>
                  <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--accent)' }}>Application Registered!</h3>
                  <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                    Tracking ID: <strong style={{ color: 'var(--text-primary)', fontSize: '1.05rem' }}>{submissionResult.trackingNumber}</strong>
                  </p>
                </div>

                <div style={{ 
                  background: 'var(--bg-main)', padding: '1rem', borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-color)', textAlign: 'left', fontSize: '0.85rem'
                }}>
                  <h4 style={{ fontWeight: 700, marginBottom: '0.5rem', fontSize: '0.88rem' }}>AI Scan Summary:</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                    {submissionResult.documents?.map(doc => (
                      <div key={doc.name} style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>{doc.name}:</span>
                        <strong style={{ color: doc.status === 'Verified' ? 'var(--accent)' : '#EF4444' }}>{doc.status}</strong>
                      </div>
                    ))}
                  </div>
                </div>

                <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                  A simulated email confirmation has been sent to your registered email address.
                </p>

                <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
                  <button 
                    onClick={() => {
                      setApplyingScheme(null);
                      // Navigate to applications tracking tab
                      const navLink = document.querySelector('a[href="/dashboard/applications"]');
                      if (navLink) navLink.click();
                    }}
                    className="btn btn-primary"
                    style={{ flex: 1 }}
                  >
                    Track Status
                  </button>
                  <button 
                    onClick={() => setApplyingScheme(null)}
                    className="btn btn-secondary"
                    style={{ flex: 1 }}
                  >
                    Close
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default EligibilityForm;
