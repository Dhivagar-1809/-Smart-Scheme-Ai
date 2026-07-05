import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  FileCheck, 
  Bookmark, 
  Download, 
  MessageSquare, 
  User, 
  Settings, 
  ShieldAlert, 
  LogOut, 
  Sparkles,
  FileText
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

const Sidebar = () => {
  const { user, logout } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navItems = [
    { to: '/dashboard', label: t('sidebarDashboard'), icon: LayoutDashboard, end: true },
    { to: '/dashboard/eligibility', label: t('sidebarEligibility'), icon: FileCheck },
    { to: '/dashboard/applications', label: t('sidebarApplications'), icon: FileText },
    { to: '/dashboard/saved', label: t('sidebarSaved'), icon: Bookmark },
    { to: '/dashboard/downloads', label: t('sidebarDownloads'), icon: Download },
    { to: '/dashboard/chat', label: t('sidebarChat'), icon: MessageSquare },
    { to: '/dashboard/profile', label: t('sidebarProfile'), icon: User },
    { to: '/dashboard/settings', label: t('sidebarSettings'), icon: Settings }
  ];

  return (
    <div className="glass-panel" style={{
      width: '260px',
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      borderRight: '1px solid var(--border-color)',
      padding: '1.5rem 1rem',
      position: 'sticky',
      top: 0
    }}>
      {/* Brand logo in Sidebar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '2rem', padding: '0 0.5rem' }}>
        <Sparkles size={22} style={{ color: 'var(--secondary)' }} />
        <span style={{ 
          fontWeight: 800, 
          fontSize: '1.25rem', 
          background: 'linear-gradient(135deg, var(--primary), var(--secondary))', 
          WebkitBackgroundClip: 'text', 
          WebkitTextFillColor: 'transparent' 
        }}>
          SmartScheme
        </span>
      </div>

      {/* User Info Capsule */}
      {user && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          padding: '0.75rem',
          background: 'var(--bg-card)',
          borderRadius: 'var(--radius-md)',
          marginBottom: '1.5rem',
          border: '1px solid var(--border-color)'
        }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#FFFFFF',
            fontWeight: 700
          }}>
            {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
          </div>
          <div style={{ overflow: 'hidden' }}>
            <h4 style={{ fontSize: '0.9rem', fontWeight: 600, whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>{user.name}</h4>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'capitalize' }}>
              {user.role} Account
            </span>
          </div>
        </div>
      )}

      {/* Nav Menu Links */}
      <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', flex: 1 }}>
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.75rem 1rem',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.95rem',
                fontWeight: isActive ? 600 : 500,
                color: isActive ? 'var(--text-white)' : 'var(--text-secondary)',
                background: isActive ? 'linear-gradient(135deg, var(--primary), var(--secondary))' : 'transparent',
                boxShadow: isActive ? '0 4px 10px rgba(37, 99, 235, 0.2)' : 'none',
                transition: 'all var(--transition-fast)'
              })}
              className="sidebar-link"
            >
              <Icon size={18} />
              {item.label}
            </NavLink>
          );
        })}

        {/* Admin Link if role is admin */}
        {user && user.role === 'admin' && (
          <NavLink
            to="/dashboard/admin"
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '0.75rem 1rem',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.95rem',
              fontWeight: isActive ? 600 : 500,
              color: isActive ? 'var(--text-white)' : '#DC2626',
              background: isActive ? '#DC2626' : 'rgba(220, 38, 38, 0.05)',
              border: isActive ? 'none' : '1px dashed rgba(220, 38, 38, 0.2)',
              marginTop: '0.5rem',
              transition: 'all var(--transition-fast)'
            })}
          >
            <ShieldAlert size={18} />
            {t('sidebarAdmin')}
          </NavLink>
        )}
      </nav>

      {/* Logout button */}
      <button
        onClick={handleLogout}
        className="btn btn-secondary"
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.5rem',
          padding: '0.65rem',
          marginTop: 'auto',
          borderColor: 'rgba(220, 38, 38, 0.2)',
          color: '#DC2626'
        }}
      >
        <LogOut size={16} />
        {t('navLogout')}
      </button>
    </div>
  );
};

export default Sidebar;
