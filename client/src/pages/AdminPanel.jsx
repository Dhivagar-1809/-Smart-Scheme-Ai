import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, 
  Users, 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  BarChart2, 
  Star,
  CheckCircle,
  X,
  FileText,
  Clock
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { API_URL } from '../context/AuthContext';

const AdminPanel = () => {
  const { token, user } = useAuth();

  // Admin Data states
  const [stats, setStats] = useState({ totalUsers: 0, totalSearches: 0, totalSchemes: 0, avgRating: '5.0' });
  const [popularSchemes, setPopularSchemes] = useState([]);
  const [dailyTraffic, setDailyTraffic] = useState([]);
  const [usersList, setUsersList] = useState([]);
  const [schemesList, setSchemesList] = useState([]);
  const [loading, setLoading] = useState(true);

  // Applications management state
  const [applicationsList, setApplicationsList] = useState([]);
  const [editingApplication, setEditingApplication] = useState(null);
  const [appForm, setAppForm] = useState({
    status: 'Pending Verification',
    remarks: '',
    documentStatuses: []
  });

  // CRUD Scheme Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentScheme, setCurrentScheme] = useState(null); // null for create, object for edit
  const [schemeForm, setSchemeForm] = useState({
    name: '',
    description: '',
    category: 'Agriculture',
    state: 'Central',
    benefits: '',
    documents: '', // input as comma separated string
    officialWebsite: '',
    deadline: 'Ongoing',
    department: '',
    eligibility: {
      ageMin: '',
      ageMax: '',
      incomeMax: '',
      gender: 'All',
      isFarmer: false,
      isStudent: false,
      isSeniorCitizen: false,
      isDisabled: false,
      isWidow: false
    }
  });

  useEffect(() => {
    if (user && user.role === 'admin') {
      fetchAdminData();
    }
  }, [token, user]);

  // Redirect block if not admin
  if (user && user.role !== 'admin') {
    return (
      <div style={{ textAlign: 'center', padding: '5rem 2rem', color: '#DC2626' }}>
        <ShieldAlert size={60} style={{ margin: '0 auto 1.5rem auto' }} />
        <h2>Access Denied</h2>
        <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>Only administrators can access the Smart Scheme Assistant system panel.</p>
      </div>
    );
  }

  const fetchAdminData = async () => {
    if (!token) return;
    try {
      setLoading(true);
      // Stats & Graphs
      const res = await fetch(`${API_URL}/admin/analytics`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setStats(data.stats);
        setPopularSchemes(data.popularSchemes);
        setDailyTraffic(data.dailyTraffic);
      }

      // Users List
      const uRes = await fetch(`${API_URL}/admin/users`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (uRes.ok) {
        const uData = await uRes.json();
        setUsersList(uData);
      }

      // Schemes List
      const sRes = await fetch(`${API_URL}/schemes`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (sRes.ok) {
        const sData = await sRes.json();
        setSchemesList(sData);
      }

      // Applications List
      const appRes = await fetch(`${API_URL}/admin/applications`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (appRes.ok) {
        const appData = await appRes.json();
        setApplicationsList(appData);
      }

    } catch (err) {
      console.error('Failed to load admin stats:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAppEdit = (app) => {
    setEditingApplication(app);
    setAppForm({
      status: app.status,
      remarks: app.remarks || '',
      documentStatuses: app.documents?.map(d => ({
        name: d.name,
        status: d.status,
        remarks: d.remarks || ''
      })) || []
    });
  };

  const handleDocStatusChange = (index, field, value) => {
    setAppForm(prev => {
      const nextDocs = [...prev.documentStatuses];
      nextDocs[index] = {
        ...nextDocs[index],
        [field]: value
      };
      return {
        ...prev,
        documentStatuses: nextDocs
      };
    });
  };

  const handleAppSubmit = async (e) => {
    e.preventDefault();
    if (!editingApplication) return;

    try {
      const res = await fetch(`${API_URL}/admin/applications/${editingApplication._id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(appForm)
      });

      if (res.ok) {
        setEditingApplication(null);
        fetchAdminData();
      } else {
        alert('Failed to update application status.');
      }
    } catch (err) {
      console.error(err);
      alert('Error updating application.');
    }
  };

  const handleOpenCreateModal = () => {
    setCurrentScheme(null);
    setSchemeForm({
      name: '',
      description: '',
      category: 'Agriculture',
      state: 'Central',
      benefits: '',
      documents: '',
      officialWebsite: '',
      deadline: 'Ongoing',
      department: '',
      eligibility: {
        ageMin: '', ageMax: '', incomeMax: '', gender: 'All',
        isFarmer: false, isStudent: false, isSeniorCitizen: false, isDisabled: false, isWidow: false
      }
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (scheme) => {
    setCurrentScheme(scheme);
    setSchemeForm({
      name: scheme.name,
      description: scheme.description,
      category: scheme.category,
      state: scheme.state,
      benefits: scheme.benefits,
      documents: scheme.documents?.join(', ') || '',
      officialWebsite: scheme.officialWebsite || '',
      deadline: scheme.deadline || 'Ongoing',
      department: scheme.department || '',
      eligibility: {
        ageMin: scheme.eligibility?.ageMin || '',
        ageMax: scheme.eligibility?.ageMax || '',
        incomeMax: scheme.eligibility?.incomeMax || '',
        gender: scheme.eligibility?.gender || 'All',
        isFarmer: scheme.eligibility?.isFarmer || false,
        isStudent: scheme.eligibility?.isStudent || false,
        isSeniorCitizen: scheme.eligibility?.isSeniorCitizen || false,
        isDisabled: scheme.eligibility?.isDisabled || false,
        isWidow: scheme.eligibility?.isWidow || false
      }
    });
    setIsModalOpen(true);
  };

  const handleSchemeFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name.startsWith('eligibility.')) {
      const field = name.split('.')[1];
      setSchemeForm(prev => ({
        ...prev,
        eligibility: {
          ...prev.eligibility,
          [field]: type === 'checkbox' ? checked : value
        }
      }));
    } else {
      setSchemeForm(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSchemeSubmit = async (e) => {
    e.preventDefault();
    
    // Parse documents comma-separated list into array
    const documentsArray = schemeForm.documents
      ? schemeForm.documents.split(',').map(d => d.trim()).filter(Boolean)
      : [];

    const payload = {
      ...schemeForm,
      documents: documentsArray,
      eligibility: {
        ...schemeForm.eligibility,
        ageMin: schemeForm.eligibility.ageMin ? Number(schemeForm.eligibility.ageMin) : null,
        ageMax: schemeForm.eligibility.ageMax ? Number(schemeForm.eligibility.ageMax) : null,
        incomeMax: schemeForm.eligibility.incomeMax ? Number(schemeForm.eligibility.incomeMax) : null
      }
    };

    try {
      let res;
      if (currentScheme) {
        // Edit Mode
        res = await fetch(`${API_URL}/admin/schemes/${currentScheme._id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(payload)
        });
      } else {
        // Create Mode
        res = await fetch(`${API_URL}/admin/schemes`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(payload)
        });
      }

      if (res.ok) {
        setIsModalOpen(false);
        fetchAdminData();
      } else {
        alert('Failed to save scheme. Please try again.');
      }
    } catch (err) {
      console.error(err);
      alert('Error updating scheme parameters.');
    }
  };

  const deleteScheme = async (schemeId) => {
    if (!window.confirm("Are you sure you want to permanently delete this government scheme?")) return;
    try {
      const res = await fetch(`${API_URL}/admin/schemes/${schemeId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        fetchAdminData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="animate-fade" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Header title */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Admin Dashboard</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            System metrics, citizen records database, and welfare program CRUD control.
          </p>
        </div>
        <button 
          onClick={handleOpenCreateModal}
          className="btn btn-primary"
          style={{ display: 'flex', gap: '0.25rem', alignItems: 'center' }}
        >
          <Plus size={16} /> Add Scheme
        </button>
      </div>

      {/* Analytics stats */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1.5rem'
      }}>
        <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: 'var(--radius-sm)', background: 'rgba(37, 99, 235, 0.1)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Users size={20} />
          </div>
          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Registered Citizens</span>
            <h4 style={{ fontSize: '1.25rem' }}>{stats.totalUsers}</h4>
          </div>
        </div>

        <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: 'var(--radius-sm)', background: 'rgba(124, 58, 237, 0.1)', color: 'var(--secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Search size={20} />
          </div>
          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Eligibility Audits</span>
            <h4 style={{ fontSize: '1.25rem' }}>{stats.totalSearches}</h4>
          </div>
        </div>

        <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: 'var(--radius-sm)', background: 'rgba(16, 185, 129, 0.1)', color: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ShieldAlert size={20} />
          </div>
          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Active Schemes</span>
            <h4 style={{ fontSize: '1.25rem' }}>{stats.totalSchemes}</h4>
          </div>
        </div>

        <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: 'var(--radius-sm)', background: 'rgba(245, 158, 11, 0.1)', color: '#D97706', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Star size={20} />
          </div>
          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Platform Rating</span>
            <h4 style={{ fontSize: '1.25rem' }}>{stats.avgRating} / 5.0</h4>
          </div>
        </div>
      </div>

      {/* Database Tables */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr',
        gap: '2rem'
      }}>
        {/* Schemes Manager CRUD table */}
        <div className="glass-card" style={{ overflowX: 'auto' }}>
          <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>Welfare Schemes Database ({schemesList.length})</h3>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
            <thead>
              <tr style={{ textAlign: 'left', borderBottom: '2px solid var(--border-color)', color: 'var(--text-muted)' }}>
                <th style={{ padding: '0.75rem' }}>Scheme Name</th>
                <th style={{ padding: '0.75rem' }}>Category</th>
                <th style={{ padding: '0.75rem' }}>State Scope</th>
                <th style={{ padding: '0.75rem' }}>Deadline</th>
                <th style={{ padding: '0.75rem', textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {schemesList.map(s => (
                <tr key={s._id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '0.75rem', fontWeight: 600 }}>{s.name}</td>
                  <td style={{ padding: '0.75rem' }}>{s.category}</td>
                  <td style={{ padding: '0.75rem' }}>{s.state}</td>
                  <td style={{ padding: '0.75rem' }}>{s.deadline}</td>
                  <td style={{ padding: '0.75rem', display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                    <button 
                      onClick={() => handleOpenEditModal(s)}
                      className="btn-icon" 
                      style={{ width: '28px', height: '28px', color: 'var(--primary)' }}
                      title="Edit Scheme"
                    >
                      <Edit size={12} />
                    </button>
                    <button 
                      onClick={() => deleteScheme(s._id)}
                      className="btn-icon" 
                      style={{ width: '28px', height: '28px', color: '#DC2626', borderColor: 'rgba(220,38,38,0.2)' }}
                      title="Delete Scheme"
                    >
                      <Trash2 size={12} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Citizen Applications Manager Table */}
        <div className="glass-card" style={{ overflowX: 'auto' }}>
          <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>Citizen Scheme Applications ({applicationsList.length})</h3>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
            <thead>
              <tr style={{ textAlign: 'left', borderBottom: '2px solid var(--border-color)', color: 'var(--text-muted)' }}>
                <th style={{ padding: '0.75rem' }}>Citizen</th>
                <th style={{ padding: '0.75rem' }}>Scheme</th>
                <th style={{ padding: '0.75rem' }}>Tracking ID</th>
                <th style={{ padding: '0.75rem' }}>Date</th>
                <th style={{ padding: '0.75rem' }}>Status</th>
                <th style={{ padding: '0.75rem', textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {applicationsList.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                    No citizen applications submitted yet.
                  </td>
                </tr>
              ) : (
                applicationsList.map(app => (
                  <tr key={app._id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: '0.75rem' }}>
                      <strong style={{ display: 'block', color: 'var(--text-primary)' }}>{app.user?.name || 'Citizen'}</strong>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{app.user?.email}</span>
                    </td>
                    <td style={{ padding: '0.75rem', fontWeight: 600 }}>{app.scheme?.name}</td>
                    <td style={{ padding: '0.75rem', fontFamily: 'monospace' }}>{app.trackingNumber}</td>
                    <td style={{ padding: '0.75rem' }}>{new Date(app.createdAt).toLocaleDateString('en-IN')}</td>
                    <td style={{ padding: '0.75rem' }}>
                      <span style={{
                        padding: '0.2rem 0.5rem',
                        borderRadius: '4px',
                        fontSize: '0.78rem',
                        fontWeight: 600,
                        background: app.status === 'Approved' ? 'rgba(16, 185, 129, 0.1)' : app.status === 'Rejected' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                        color: app.status === 'Approved' ? 'var(--accent)' : app.status === 'Rejected' ? '#EF4444' : '#F59E0B'
                      }}>
                        {app.status}
                      </span>
                    </td>
                    <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                      <button 
                        onClick={() => handleOpenAppEdit(app)}
                        className="btn btn-secondary" 
                        style={{ padding: '0.3rem 0.75rem', fontSize: '0.75rem' }}
                      >
                        Review
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Users list table */}
        <div className="glass-card" style={{ overflowX: 'auto' }}>
          <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>Registered Users ({usersList.length})</h3>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
            <thead>
              <tr style={{ textAlign: 'left', borderBottom: '2px solid var(--border-color)', color: 'var(--text-muted)' }}>
                <th style={{ padding: '0.75rem' }}>Citizen Name</th>
                <th style={{ padding: '0.75rem' }}>Email Address</th>
                <th style={{ padding: '0.75rem' }}>Location State</th>
                <th style={{ padding: '0.75rem' }}>Occupation</th>
                <th style={{ padding: '0.75rem' }}>Role</th>
              </tr>
            </thead>
            <tbody>
              {usersList.map(u => (
                <tr key={u._id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '0.75rem', fontWeight: 600 }}>{u.name}</td>
                  <td style={{ padding: '0.75rem' }}>{u.email}</td>
                  <td style={{ padding: '0.75rem' }}>{u.state || 'N/A'}</td>
                  <td style={{ padding: '0.75rem' }}>{u.occupation || 'N/A'}</td>
                  <td style={{ padding: '0.75rem', textTransform: 'capitalize' }}>{u.role}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- CRUD MODAL CONTAINER --- */}
      {isModalOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: 'rgba(15, 23, 42, 0.6)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1001,
          padding: '2rem'
        }}>
          <div className="glass-card" style={{
            width: '100%',
            maxWidth: '650px',
            maxHeight: '90vh',
            overflowY: 'auto',
            background: 'var(--bg-sidebar)',
            position: 'relative'
          }}>
            <button 
              onClick={() => setIsModalOpen(false)}
              className="btn-icon" 
              style={{ position: 'absolute', right: '1.5rem', top: '1.5rem', width: '32px', height: '32px' }}
            >
              <X size={16} />
            </button>

            <h3 style={{ fontSize: '1.35rem', marginBottom: '1.5rem' }}>
              {currentScheme ? 'Modify Scheme Properties' : 'Register New Government Scheme'}
            </h3>

            <form onSubmit={handleSchemeSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div className="form-group">
                <label className="form-label">Scheme Name</label>
                <input type="text" name="name" value={schemeForm.name} onChange={handleSchemeFormChange} className="form-control" placeholder="e.g. Post-Matric Scholarship" required />
              </div>

              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea name="description" value={schemeForm.description} onChange={handleSchemeFormChange} className="form-control" rows={3} placeholder="Provide details of what this scheme is..." required />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Category</label>
                  <select name="category" value={schemeForm.category} onChange={handleSchemeFormChange} className="form-control">
                    <option value="Agriculture">Agriculture</option>
                    <option value="Health">Health</option>
                    <option value="Education">Education</option>
                    <option value="Pension">Pension</option>
                    <option value="Housing">Housing</option>
                    <option value="Social Security">Social Security</option>
                    <option value="Business">Business</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">State Scope</label>
                  <input type="text" name="state" value={schemeForm.state} onChange={handleSchemeFormChange} className="form-control" placeholder="Central or specific State" required />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Expected Benefits</label>
                <input type="text" name="benefits" value={schemeForm.benefits} onChange={handleSchemeFormChange} className="form-control" placeholder="e.g. Rs. 5,000 per month" required />
              </div>

              <div className="form-group">
                <label className="form-label">Required Documents (Comma Separated)</label>
                <input type="text" name="documents" value={schemeForm.documents} onChange={handleSchemeFormChange} className="form-control" placeholder="Aadhar Card, Income Certificate, Caste Certificate" required />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Official Portal</label>
                  <input type="url" name="officialWebsite" value={schemeForm.officialWebsite} onChange={handleSchemeFormChange} className="form-control" placeholder="https://..." required />
                </div>
                <div className="form-group">
                  <label className="form-label">Deadline</label>
                  <input type="text" name="deadline" value={schemeForm.deadline} onChange={handleSchemeFormChange} className="form-control" required />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Administering Department</label>
                <input type="text" name="department" value={schemeForm.department} onChange={handleSchemeFormChange} className="form-control" placeholder="e.g. Ministry of Agriculture" required />
              </div>

              {/* Eligibility rules */}
              <div style={{ background: 'var(--bg-main)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                <h4 style={{ fontSize: '0.9rem', marginBottom: '0.75rem', fontWeight: 600 }}>Configure Eligibility Rules</h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Min Age</label>
                    <input type="number" name="eligibility.ageMin" value={schemeForm.eligibility.ageMin} onChange={handleSchemeFormChange} className="form-control" placeholder="None" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Max Age</label>
                    <input type="number" name="eligibility.ageMax" value={schemeForm.eligibility.ageMax} onChange={handleSchemeFormChange} className="form-control" placeholder="None" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Max Income</label>
                    <input type="number" name="eligibility.incomeMax" value={schemeForm.eligibility.incomeMax} onChange={handleSchemeFormChange} className="form-control" placeholder="None" />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.75rem' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.82rem', cursor: 'pointer' }}>
                    <input type="checkbox" name="eligibility.isFarmer" checked={schemeForm.eligibility.isFarmer} onChange={handleSchemeFormChange} />
                    Only Farmers
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.82rem', cursor: 'pointer' }}>
                    <input type="checkbox" name="eligibility.isStudent" checked={schemeForm.eligibility.isStudent} onChange={handleSchemeFormChange} />
                    Only Students
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.82rem', cursor: 'pointer' }}>
                    <input type="checkbox" name="eligibility.isSeniorCitizen" checked={schemeForm.eligibility.isSeniorCitizen} onChange={handleSchemeFormChange} />
                    Only Seniors
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.82rem', cursor: 'pointer' }}>
                    <input type="checkbox" name="eligibility.isDisabled" checked={schemeForm.eligibility.isDisabled} onChange={handleSchemeFormChange} />
                    Disabled Only
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.82rem', cursor: 'pointer' }}>
                    <input type="checkbox" name="eligibility.isWidow" checked={schemeForm.eligibility.isWidow} onChange={handleSchemeFormChange} />
                    Widows Only
                  </label>
                </div>
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '0.5rem' }}>
                Save Scheme Parameters
              </button>
            </form>
          </div>
        </div>
      )}

      {/* --- APPLICATION UPDATE MODAL --- */}
      {editingApplication && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
          background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1001, padding: '2rem'
        }}>
          <div className="glass-card animate-fade" style={{
            width: '100%', maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto',
            background: 'var(--bg-sidebar)', position: 'relative', padding: '2rem'
          }}>
            <button 
              onClick={() => setEditingApplication(null)}
              className="btn-icon" 
              style={{ position: 'absolute', right: '1.5rem', top: '1.5rem', width: '32px', height: '32px' }}
            >
              <X size={16} />
            </button>

            <h3 style={{ fontSize: '1.35rem', marginBottom: '1rem', color: 'var(--primary)' }}>
              Review Citizen Application
            </h3>
            
            <div style={{ background: 'var(--bg-main)', padding: '1rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', marginBottom: '1.25rem', fontSize: '0.85rem' }}>
              <h4 style={{ fontWeight: 700, marginBottom: '0.5rem' }}>Applicant Demographics:</h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.4rem' }}>
                <div>Name: <strong>{editingApplication.user?.name}</strong></div>
                <div>Email: <strong>{editingApplication.user?.email}</strong></div>
                <div>Age: <strong>{editingApplication.user?.age || 'N/A'}</strong></div>
                <div>Income: <strong>Rs. {editingApplication.user?.annualIncome?.toLocaleString('en-IN') || '0'}</strong></div>
                <div>Occupation: <strong>{editingApplication.user?.occupation || 'N/A'}</strong></div>
                <div>Category: <strong>{editingApplication.user?.category || 'N/A'}</strong></div>
                <div>State: <strong>{editingApplication.user?.state || 'N/A'}</strong></div>
                <div>Tracking ID: <strong>{editingApplication.trackingNumber}</strong></div>
              </div>
            </div>

            <form onSubmit={handleAppSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              
              {/* Document Review checklist */}
              <div>
                <h4 style={{ fontSize: '0.92rem', fontWeight: 700, marginBottom: '0.5rem' }}>Uploaded Documents Status Check</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {appForm.documentStatuses.map((doc, dIdx) => (
                    <div key={doc.name} style={{ background: 'var(--bg-main)', padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                        <div>
                          <strong style={{ fontSize: '0.85rem' }}>{doc.name}</strong>
                          <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            File: {editingApplication.documents?.[dIdx]?.fileName || 'None'}
                          </span>
                        </div>
                        <select 
                          value={doc.status} 
                          onChange={(e) => handleDocStatusChange(dIdx, 'status', e.target.value)}
                          className="form-control"
                          style={{ width: '130px', padding: '0.2rem', fontSize: '0.8rem', height: 'auto' }}
                        >
                          <option value="Pending">Pending</option>
                          <option value="Verified">Verified</option>
                          <option value="Rejected">Rejected</option>
                        </select>
                      </div>
                      <input 
                        type="text"
                        placeholder="Audit scan remark..."
                        value={doc.remarks}
                        onChange={(e) => handleDocStatusChange(dIdx, 'remarks', e.target.value)}
                        className="form-control"
                        style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem' }}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Overall status select */}
              <div className="form-group">
                <label className="form-label">Overall Application Status</label>
                <select name="status" value={appForm.status} onChange={handleAppFormChange} className="form-control">
                  <option value="Pending Verification">Pending Verification</option>
                  <option value="Documents Verified">Documents Verified</option>
                  <option value="Under Review">Under Review</option>
                  <option value="Approved">Approved</option>
                  <option value="Rejected">Rejected</option>
                </select>
              </div>

              {/* General remarks */}
              <div className="form-group">
                <label className="form-label">Review Remarks / Email Text details</label>
                <textarea name="remarks" value={appForm.remarks} onChange={handleAppFormChange} className="form-control" rows={3} placeholder="Provide details on why this application was approved or rejected..." />
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
                Update Application & Dispatch Alert Email
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
