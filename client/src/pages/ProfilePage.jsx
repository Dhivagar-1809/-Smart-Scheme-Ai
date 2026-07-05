import React, { useState, useEffect } from 'react';
import { 
  User, 
  Mail, 
  MapPin, 
  Briefcase, 
  Calendar,
  IndianRupee,
  BookOpen,
  History,
  FileText,
  Download,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { API_URL } from '../context/AuthContext';

const ProfilePage = () => {
  const { user, token, updateProfile } = useAuth();
  const { t } = useLanguage();

  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    gender: 'Male',
    state: 'Tamil Nadu',
    district: '',
    occupation: 'None',
    annualIncome: '',
    education: 'Secondary School',
    category: 'General'
  });

  const [reports, setReports] = useState([]);
  const [history, setHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [saving, setSaving] = useState(false);

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
        category: user.category || 'General'
      });
    }
  }, [user]);

  useEffect(() => {
    const fetchProfileData = async () => {
      if (!token) return;
      try {
        setLoadingHistory(true);
        // Fetch generated reports
        const repRes = await fetch(`${API_URL}/reports`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const repData = repRes.ok ? await repRes.json() : [];
        setReports(repData);

        // Fetch search history
        const histRes = await fetch(`${API_URL}/history`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const histData = histRes.ok ? await histRes.json() : [];
        setHistory(histData);
      } catch (err) {
        console.error('Error fetching profile sub-records:', err);
      } finally {
        setLoadingHistory(false);
      }
    };

    fetchProfileData();
  }, [token]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateProfile({
        name: formData.name,
        age: Number(formData.age),
        gender: formData.gender,
        state: formData.state,
        district: formData.district,
        occupation: formData.occupation,
        annualIncome: Number(formData.annualIncome),
        education: formData.education,
        category: formData.category
      });
      setEditMode(false);
    } catch (err) {
      console.error(err);
      alert('Failed to update profile information.');
    } finally {
      setSaving(false);
    }
  };

  const handleDownloadReport = (reportId) => {
    window.open(`${API_URL}/reports/${reportId}/pdf?token=${token}`, '_blank');
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
        <h2 style={{ fontSize: '1.75rem', fontWeight: 800 }}>{t('sidebarProfile')}</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
          Manage your personal credential profile and review past welfare audit history logs.
        </p>
      </div>

      {/* Main Container Row */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
        gap: '2rem'
      }}>
        {/* Profile Card */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '1.15rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <User size={18} style={{ color: 'var(--primary)' }} />
              Personal Credentials
            </h3>
            {!editMode && (
              <button 
                onClick={() => setEditMode(true)}
                className="btn btn-secondary"
                style={{ padding: '0.4rem 0.85rem', fontSize: '0.8rem' }}
              >
                Edit Profile
              </button>
            )}
          </div>

          {editMode ? (
            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input type="text" name="name" value={formData.name} onChange={handleInputChange} className="form-control" required />
              </div>
              <div className="form-group">
                <label className="form-label">Age</label>
                <input type="number" name="age" value={formData.age} onChange={handleInputChange} className="form-control" min="1" max="120" required />
              </div>
              <div className="form-group">
                <label className="form-label">Gender</label>
                <select name="gender" value={formData.gender} onChange={handleInputChange} className="form-control">
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">State</label>
                <select name="state" value={formData.state} onChange={handleInputChange} className="form-control">
                  {statesOfIndia.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">District</label>
                <input type="text" name="district" value={formData.district} onChange={handleInputChange} className="form-control" required />
              </div>
              <div className="form-group">
                <label className="form-label">Occupation</label>
                <select name="occupation" value={formData.occupation} onChange={handleInputChange} className="form-control">
                  <option value="None">None (Unemployed/Other)</option>
                  <option value="Farmer">Farmer / Agriculture</option>
                  <option value="Student">Student</option>
                  <option value="Laborer">Manual Laborer / Worker</option>
                  <option value="Artisan">Traditional Artisan / Craftsman</option>
                  <option value="Business">Small Business Owner / Vendor</option>
                  <option value="Salaried">Salaried Employee</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Annual Income (Rs.)</label>
                <input type="number" name="annualIncome" value={formData.annualIncome} onChange={handleInputChange} className="form-control" required />
              </div>
              <div className="form-group">
                <label className="form-label">Education Level</label>
                <select name="education" value={formData.education} onChange={handleInputChange} className="form-control">
                  <option value="Illiterate">Below 8th Grade</option>
                  <option value="8th Pass">8th Grade Pass</option>
                  <option value="Secondary School">10th Grade / Secondary</option>
                  <option value="Higher Secondary">12th Grade / HSC</option>
                  <option value="Graduate">Bachelor's Degree / Graduate</option>
                  <option value="Postgraduate">Post Graduate or above</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Social Category</label>
                <select name="category" value={formData.category} onChange={handleInputChange} className="form-control">
                  <option value="General">General / Unreserved</option>
                  <option value="OBC">OBC (Other Backward Classes)</option>
                  <option value="SC">SC (Scheduled Caste)</option>
                  <option value="ST">ST (Scheduled Tribe)</option>
                </select>
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
                <button type="submit" disabled={saving} className="btn btn-primary" style={{ flex: 1 }}>
                  {saving ? 'Saving...' : t('btnSaveProfile')}
                </button>
                <button type="button" onClick={() => setEditMode(false)} className="btn btn-secondary">
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {/* Display Fields */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <Mail size={16} style={{ color: 'var(--text-muted)' }} />
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Email Address</div>
                  <div style={{ fontSize: '0.92rem' }}>{user?.email}</div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <Calendar size={16} style={{ color: 'var(--text-muted)' }} />
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Age & Gender</div>
                  <div style={{ fontSize: '0.92rem' }}>{user?.age ? `${user.age} Years` : 'Not Specified'} ({user?.gender || 'Other'})</div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <MapPin size={16} style={{ color: 'var(--text-muted)' }} />
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Location</div>
                  <div style={{ fontSize: '0.92rem' }}>{user?.state ? `${user.district ? user.district + ', ' : ''}${user.state}` : 'Not Specified'}</div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <Briefcase size={16} style={{ color: 'var(--text-muted)' }} />
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Occupation & Education</div>
                  <div style={{ fontSize: '0.92rem' }}>{user?.occupation || 'None'} | {user?.education || 'Secondary School'}</div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <IndianRupee size={16} style={{ color: 'var(--text-muted)' }} />
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Annual Income</div>
                  <div style={{ fontSize: '0.92rem' }}>{user?.annualIncome ? `Rs. ${user.annualIncome.toLocaleString('en-IN')}` : 'Not Specified'}</div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <BookOpen size={16} style={{ color: 'var(--text-muted)' }} />
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Social Category</div>
                  <div style={{ fontSize: '0.92rem' }}>{user?.category || 'General'}</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* History and PDF Lists */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {/* Recent Reports List */}
          <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <h3 style={{ fontSize: '1.15rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <FileText size={18} style={{ color: 'var(--accent)' }} />
              Generated PDF Reports
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '200px', overflowY: 'auto' }}>
              {loadingHistory ? (
                <div className="skeleton" style={{ height: '50px', width: '100%' }} />
              ) : reports.length === 0 ? (
                <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', textAlign: 'center', padding: '1rem 0' }}>
                  No reports generated yet.
                </div>
              ) : (
                reports.map(rep => (
                  <div key={rep._id} style={{
                    padding: '0.5rem 0.75rem',
                    background: 'var(--bg-main)',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border-color)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <div>
                      <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Welfare Audit Guide</span>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                        {new Date(rep.createdAt).toLocaleDateString('en-IN')} | {rep.eligibleSchemes.length} Schemes Match
                      </div>
                    </div>
                    <button 
                      onClick={() => handleDownloadReport(rep._id)}
                      className="btn btn-secondary" 
                      style={{ padding: '0.35rem 0.65rem', fontSize: '0.75rem', display: 'flex', gap: '0.25rem', alignItems: 'center' }}
                    >
                      <Download size={12} /> Get PDF
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Search History List */}
          <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <h3 style={{ fontSize: '1.15rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <History size={18} style={{ color: 'var(--secondary)' }} />
              Recent Audits Log
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '200px', overflowY: 'auto' }}>
              {loadingHistory ? (
                <div className="skeleton" style={{ height: '50px', width: '100%' }} />
              ) : history.length === 0 ? (
                <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', textAlign: 'center', padding: '1rem 0' }}>
                  No search logs available.
                </div>
              ) : (
                history.map(hist => (
                  <div key={hist._id} style={{
                    padding: '0.5rem 0.75rem',
                    background: 'var(--bg-main)',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border-color)',
                    fontSize: '0.8rem'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
                      <span>State: {hist.criteria.state || 'N/A'} | Income: Rs. {hist.criteria.annualIncome?.toLocaleString('en-IN') || '0'}</span>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                        {new Date(hist.timestamp).toLocaleDateString('en-IN')}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
