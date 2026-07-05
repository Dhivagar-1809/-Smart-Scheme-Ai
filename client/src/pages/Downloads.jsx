import React, { useState, useEffect } from 'react';
import { Download, FileText, Calendar, Trash2, ShieldAlert } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { API_URL } from '../context/AuthContext';

const Downloads = () => {
  const { token } = useAuth();
  const { t } = useLanguage();

  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReports();
  }, [token]);

  const fetchReports = async () => {
    if (!token) return;
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/reports`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setReports(data);
      }
    } catch (err) {
      console.error('Error fetching reports list:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = (reportId) => {
    window.open(`${API_URL}/reports/${reportId}/pdf?token=${token}`, '_blank');
  };

  const deleteReport = async (reportId) => {
    // In a production server, we can add a delete endpoint, but for safety in mock we just simulate or fetch delete.
    // Let's keep it clean: simulate report deletion locally to avoid crashes.
    setReports(prev => prev.filter(r => r._id !== reportId));
  };

  return (
    <div className="animate-fade" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Title */}
      <div>
        <h2 style={{ fontSize: '1.75rem', fontWeight: 800 }}>{t('sidebarDownloads')}</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
          Retrieve and re-download previously generated PDF welfare reports and document guides.
        </p>
      </div>

      {/* Reports Table/Cards list */}
      <div className="glass-card" style={{ padding: '2rem' }}>
        <h3 style={{ fontSize: '1.15rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <FileText size={18} style={{ color: 'var(--primary)' }} />
          Welfare Audit Reports Archive
        </h3>

        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="skeleton" style={{ height: '60px', width: '100%' }} />
            <div className="skeleton" style={{ height: '60px', width: '100%' }} />
          </div>
        ) : reports.length === 0 ? (
          <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '3rem 0', fontSize: '0.95rem' }}>
            <ShieldAlert size={36} style={{ margin: '0 auto 1rem auto' }} />
            <p>No generated reports found.</p>
            <p style={{ fontSize: '0.85rem', marginTop: '0.25rem' }}>Please submit your credential audit parameters inside the Eligibility Checker tab first.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {reports.map((report) => (
              <div key={report._id} style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '1rem',
                background: 'var(--bg-main)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-md)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: 'var(--radius-sm)',
                    background: 'rgba(37, 99, 235, 0.1)',
                    color: 'var(--primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <FileText size={20} />
                  </div>
                  <div>
                    <h4 style={{ fontSize: '0.95rem', fontWeight: 600 }}>Welfare Match Sheet Guide</h4>
                    <div style={{ display: 'flex', gap: '1rem', fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                        <Calendar size={12} /> {new Date(report.createdAt).toLocaleDateString('en-IN')}
                      </span>
                      <span>•</span>
                      <span>{report.eligibleSchemes.length} Schemes Match</span>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <button 
                    onClick={() => handleDownloadPDF(report._id)}
                    className="btn btn-primary"
                    style={{ padding: '0.45rem 1rem', fontSize: '0.82rem', display: 'flex', gap: '0.25rem', alignItems: 'center' }}
                  >
                    <Download size={14} /> Download PDF
                  </button>
                  <button 
                    onClick={() => deleteReport(report._id)}
                    className="btn btn-secondary"
                    style={{ padding: '0.45rem', color: '#DC2626', borderColor: 'rgba(220,38,38,0.2)' }}
                    title="Remove Archive Record"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Downloads;
