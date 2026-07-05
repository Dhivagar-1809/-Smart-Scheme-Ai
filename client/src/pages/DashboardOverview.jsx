import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  UserCheck, 
  Bookmark, 
  Download, 
  ArrowRight, 
  Search,
  MessageSquare,
  Sparkles,
  Calendar
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { API_URL } from '../context/AuthContext';

const DashboardOverview = () => {
  const { user, token } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  // Summary Counts
  const [stats, setStats] = useState({
    bookmarksCount: 0,
    reportsCount: 0,
    searchesCount: 0
  });
  
  const [recentSearches, setRecentSearches] = useState([]);
  const [recentReports, setRecentReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!token) return;
      try {
        setLoading(true);
        // Fetch bookmarks
        const bRes = await fetch(`${API_URL}/bookmarks`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const bData = bRes.ok ? await bRes.json() : [];

        // Fetch reports
        const rRes = await fetch(`${API_URL}/reports`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const rData = rRes.ok ? await rRes.json() : [];

        // Fetch history
        const hRes = await fetch(`${API_URL}/history`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const hData = hRes.ok ? await hRes.json() : [];

        setStats({
          bookmarksCount: bData.length,
          reportsCount: rData.length,
          searchesCount: hData.length
        });
        setRecentSearches(hData.slice(0, 5));
        setRecentReports(rData.slice(0, 3));
      } catch (err) {
        console.error('Error fetching dashboard summary:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [token]);

  const handleDownloadPDF = (reportId) => {
    window.open(`${API_URL}/reports/${reportId}/pdf?token=${token}`, '_blank');
  };

  // Check if profile is complete
  const isProfileComplete = user && user.state && user.age && user.annualIncome;

  return (
    <div className="animate-fade" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Welcome Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '1.5rem',
        background: 'linear-gradient(135deg, rgba(37, 99, 235, 0.05), rgba(124, 58, 237, 0.05))',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border-color)'
      }}>
        <div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800 }}>
            {t('welcomeUser')}, {user?.name || 'Citizen'}!
          </h2>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.25rem', fontSize: '0.95rem' }}>
            Discover and manage your eligible government welfare programs contextually.
          </p>
        </div>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          fontSize: '0.85rem',
          color: 'var(--primary)',
          fontWeight: 600,
          background: 'var(--bg-card)',
          padding: '0.5rem 1rem',
          borderRadius: 'var(--radius-full)',
          border: '1px solid var(--border-color)'
        }}>
          <Calendar size={14} />
          {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </div>
      </div>

      {/* Metrics Row */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: '1.5rem'
      }}>
        {/* Profile Completion Card */}
        <div className="glass-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Profile Status</span>
            <h3 style={{ fontSize: '1.5rem', margin: '0.25rem 0' }}>
              {isProfileComplete ? '100% Complete' : 'Profile Incomplete'}
            </h3>
            <Link to="/dashboard/profile" style={{ fontSize: '0.85rem', color: 'var(--primary)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              {isProfileComplete ? 'Update parameters' : 'Complete details'} <ArrowRight size={14} />
            </Link>
          </div>
          <div style={{ width: '48px', height: '48px', borderRadius: 'var(--radius-md)', background: 'rgba(37, 99, 235, 0.1)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContext: 'center', justifyContent: 'center' }}>
            <UserCheck size={24} />
          </div>
        </div>

        {/* Bookmarked Schemes Card */}
        <div className="glass-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Bookmarked Schemes</span>
            <h3 style={{ fontSize: '1.85rem', margin: '0.25rem 0' }}>{stats.bookmarksCount}</h3>
            <Link to="/dashboard/saved" style={{ fontSize: '0.85rem', color: 'var(--secondary)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              View bookmarks <ArrowRight size={14} />
            </Link>
          </div>
          <div style={{ width: '48px', height: '48px', borderRadius: 'var(--radius-md)', background: 'rgba(124, 58, 237, 0.1)', color: 'var(--secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Bookmark size={24} />
          </div>
        </div>

        {/* Completed Audits Card */}
        <div className="glass-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Audits Performed</span>
            <h3 style={{ fontSize: '1.85rem', margin: '0.25rem 0' }}>{stats.searchesCount}</h3>
            <Link to="/dashboard/eligibility" style={{ fontSize: '0.85rem', color: 'var(--accent)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              Run fresh check <ArrowRight size={14} />
            </Link>
          </div>
          <div style={{ width: '48px', height: '48px', borderRadius: 'var(--radius-md)', background: 'rgba(16, 185, 129, 0.1)', color: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Search size={24} />
          </div>
        </div>
      </div>

      {/* Main Panels Row */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
        gap: '2rem'
      }}>
        {/* Quick Audits List */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <h3 style={{ fontSize: '1.15rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Sparkles size={18} style={{ color: 'var(--secondary)' }} />
            {t('recentSearches')}
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', flex: 1 }}>
            {loading ? (
              <div className="skeleton" style={{ height: '80px', width: '100%' }} />
            ) : recentSearches.length === 0 ? (
              <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem 0', fontSize: '0.9rem' }}>
                {t('noRecords')} Submit parameters in the eligibility tab.
              </div>
            ) : (
              recentSearches.map((search, sIdx) => (
                <div key={sIdx} style={{
                  padding: '0.75rem 1rem',
                  background: 'var(--bg-main)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-color)',
                  fontSize: '0.88rem'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                    <span style={{ fontWeight: 600 }}>State: {search.criteria.state || 'N/A'}</span>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                      {new Date(search.timestamp).toLocaleDateString('en-IN')}
                    </span>
                  </div>
                  <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                    Age: {search.criteria.age || 'N/A'} | Income: Rs. {search.criteria.annualIncome?.toLocaleString('en-IN') || '0'} | Occupation: {search.criteria.occupation || 'N/A'}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Generated PDF Reports list */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <h3 style={{ fontSize: '1.15rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Download size={18} style={{ color: 'var(--primary)' }} />
            {t('recentReports')}
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', flex: 1 }}>
            {loading ? (
              <div className="skeleton" style={{ height: '80px', width: '100%' }} />
            ) : recentReports.length === 0 ? (
              <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem 0', fontSize: '0.9rem' }}>
                No PDF reports generated yet.
              </div>
            ) : (
              recentReports.map((report, rIdx) => (
                <div key={rIdx} style={{
                  padding: '0.75rem 1rem',
                  background: 'var(--bg-main)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-color)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div>
                    <h4 style={{ fontSize: '0.9rem', fontWeight: 600 }}>Welfare Audit Summary</h4>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {new Date(report.createdAt).toLocaleDateString('en-IN')} | {report.eligibleSchemes.length} Schemes Match
                    </span>
                  </div>
                  <button 
                    onClick={() => handleDownloadPDF(report._id)}
                    className="btn btn-secondary" 
                    style={{ padding: '0.4rem 0.85rem', fontSize: '0.8rem', display: 'flex', gap: '0.25rem', alignItems: 'center' }}
                  >
                    <Download size={14} /> PDF
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Floating Prompt Teaser Card */}
      <div className="glass-card" style={{
        background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
        color: '#FFFFFF',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '2rem',
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow-lg)'
      }}>
        <div style={{ maxWidth: '60%' }}>
          <h3 style={{ fontSize: '1.35rem', fontWeight: 700, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <MessageSquare size={20} />
            Need assistance with application filing?
          </h3>
          <p style={{ opacity: 0.9, fontSize: '0.95rem' }}>
            Chat contextually with the Smart Scheme AI agent. Clarify document demands, translation details, and guidelines in English, Hindi, and Tamil.
          </p>
        </div>
        <button 
          onClick={() => navigate('/dashboard/chat')}
          className="btn" 
          style={{ background: '#FFFFFF', color: 'var(--primary)', fontWeight: 700, padding: '0.75rem 1.5rem' }}
        >
          Ask Assistant
        </button>
      </div>
    </div>
  );
};

export default DashboardOverview;
