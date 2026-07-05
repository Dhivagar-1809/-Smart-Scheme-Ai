import React, { useState, useEffect } from 'react';
import { 
  Bookmark, 
  Trash2, 
  Search, 
  ExternalLink, 
  ChevronDown, 
  ChevronUp,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { API_URL } from '../context/AuthContext';

const SavedSchemes = () => {
  const { token } = useAuth();
  const { t } = useLanguage();

  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);

  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedState, setSelectedState] = useState('All');

  useEffect(() => {
    fetchBookmarks();
  }, [token]);

  const fetchBookmarks = async () => {
    if (!token) return;
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/bookmarks`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setBookmarks(data);
      }
    } catch (err) {
      console.error('Error fetching bookmarks:', err);
    } finally {
      setLoading(false);
    }
  };

  const removeBookmark = async (schemeId) => {
    if (!window.confirm("Are you sure you want to remove this bookmark?")) return;
    try {
      const res = await fetch(`${API_URL}/bookmarks/${schemeId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setBookmarks(prev => prev.filter(b => b.scheme?._id !== schemeId));
        if (expandedId === schemeId) setExpandedId(null);
      }
    } catch (err) {
      console.error('Error deleting bookmark:', err);
    }
  };

  // Derive filter options
  const categories = ['All', ...new Set(bookmarks.map(b => b.scheme?.category).filter(Boolean))];
  const states = ['All', 'Central', ...new Set(bookmarks.map(b => b.scheme?.state).filter(s => s && s !== 'Central'))];

  // Filtering Logic
  const filteredBookmarks = bookmarks.filter(b => {
    const scheme = b.scheme;
    if (!scheme) return false;

    const matchesSearch = 
      scheme.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      scheme.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = selectedCategory === 'All' || scheme.category === selectedCategory;
    const matchesState = selectedState === 'All' || scheme.state === selectedState;

    return matchesSearch && matchesCategory && matchesState;
  });

  return (
    <div className="animate-fade" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Page Header */}
      <div>
        <h2 style={{ fontSize: '1.75rem', fontWeight: 800 }}>{t('sidebarSaved')}</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
          Manage your saved government welfare programs and review application checklists.
        </p>
      </div>

      {/* Filter Toolbar */}
      <div className="glass-card" style={{
        display: 'flex',
        gap: '1rem',
        flexWrap: 'wrap',
        alignItems: 'center',
        padding: '1rem 1.5rem'
      }}>
        {/* Search */}
        <div style={{ flex: 1, minWidth: '240px', position: 'relative' }}>
          <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>
            <Search size={16} />
          </span>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="form-control"
            placeholder="Search saved schemes..."
            style={{ paddingLeft: '2.5rem', width: '100%' }}
          />
        </div>

        {/* Category */}
        <div style={{ minWidth: '150px' }}>
          <select 
            value={selectedCategory} 
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="form-control"
            style={{ width: '100%' }}
          >
            {categories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        {/* State */}
        <div style={{ minWidth: '150px' }}>
          <select 
            value={selectedState} 
            onChange={(e) => setSelectedState(e.target.value)}
            className="form-control"
            style={{ width: '100%' }}
          >
            {states.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>

      {/* Bookmarks Grid/List */}
      {loading ? (
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="skeleton" style={{ height: '70px', width: '100%' }} />
          <div className="skeleton" style={{ height: '70px', width: '100%' }} />
        </div>
      ) : filteredBookmarks.length === 0 ? (
        <div className="glass-card" style={{ textAlign: 'center', padding: '3rem 2rem', color: 'var(--text-secondary)' }}>
          <AlertCircle size={48} style={{ color: 'var(--text-muted)', margin: '0 auto 1rem auto' }} />
          <h3>No Saved Schemes Found</h3>
          <p style={{ marginTop: '0.5rem', fontSize: '0.95rem' }}>
            {searchTerm || selectedCategory !== 'All' || selectedState !== 'All' 
              ? 'No bookmarked schemes match your current filters.' 
              : 'You have not bookmarked any welfare schemes yet. Fill out the Eligibility Checker to find and save schemes.'}
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {filteredBookmarks.map((bookmark) => {
            const scheme = bookmark.scheme;
            const isExpanded = expandedId === scheme._id;

            return (
              <div key={bookmark._id} className="glass-card" style={{ padding: '1.25rem 1.5rem' }}>
                <div 
                  onClick={() => setExpandedId(isExpanded ? null : scheme._id)}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    cursor: 'pointer'
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.25rem' }}>
                      <span className="badge badge-primary">{scheme.category}</span>
                      <span className="badge badge-warning">{scheme.state}</span>
                    </div>
                    <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>{scheme.name}</h3>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }} onClick={(e) => e.stopPropagation()}>
                    {/* Delete bookmark button */}
                    <button 
                      onClick={() => removeBookmark(scheme._id)}
                      className="btn-icon" 
                      style={{ width: '32px', height: '32px', color: '#DC2626', borderColor: 'rgba(220,38,38,0.2)' }}
                      title="Remove Bookmark"
                    >
                      <Trash2 size={14} />
                    </button>
                    {/* Expand button */}
                    <button 
                      onClick={() => setExpandedId(isExpanded ? null : scheme._id)}
                      className="btn-icon" 
                      style={{ width: '32px', height: '32px' }}
                    >
                      {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </button>
                  </div>
                </div>

                {/* Expanded Section */}
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
                    <div>
                      <strong style={{ color: 'var(--text-primary)' }}>Description:</strong>
                      <p style={{ color: 'var(--text-secondary)', marginTop: '0.15rem' }}>{scheme.description}</p>
                    </div>

                    <div>
                      <strong style={{ color: 'var(--text-primary)' }}>Expected Benefits:</strong>
                      <p style={{ color: 'var(--text-secondary)', marginTop: '0.15rem' }}>{scheme.benefits}</p>
                    </div>

                    <div>
                      <strong style={{ color: 'var(--text-primary)' }}>Required Documents Checklist:</strong>
                      <ul style={{ paddingLeft: '1.25rem', color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.25rem' }}>
                        {scheme.documents.map((doc, dIdx) => (
                          <li key={dIdx} style={{ marginBottom: '0.25rem' }}>{doc}</li>
                        ))}
                      </ul>
                    </div>

                    {scheme.department && (
                      <div>
                        <strong style={{ color: 'var(--text-primary)' }}>Administering Department:</strong>
                        <p style={{ color: 'var(--text-secondary)', marginTop: '0.15rem' }}>{scheme.department}</p>
                      </div>
                    )}

                    <div style={{
                      display: 'flex',
                      gap: '1rem',
                      borderTop: '1px solid var(--border-color)',
                      paddingTop: '1rem',
                      marginTop: '0.5rem'
                    }}>
                      <a 
                        href={scheme.officialWebsite} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="btn btn-primary"
                        style={{ padding: '0.5rem 1.25rem', fontSize: '0.85rem' }}
                      >
                        <ExternalLink size={14} /> Official Website
                      </a>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default SavedSchemes;
