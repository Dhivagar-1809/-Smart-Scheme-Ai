import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Sun, Moon, Sparkles, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';

const Navbar = () => {
  const { user } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();
  const { lang, changeLanguage, t } = useLanguage();
  const navigate = useNavigate();

  const handleCTA = () => {
    if (user) {
      navigate('/dashboard');
    } else {
      navigate('/login');
    }
  };

  return (
    <nav className="glass-panel" style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '70px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 2rem',
      zIndex: 999,
      borderBottom: '1px solid var(--border-color)',
      boxShadow: 'var(--shadow-sm)'
    }}>
      {/* Brand Logo */}
      <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 800, fontSize: '1.3rem', color: 'var(--primary)' }}>
        <Sparkles className="logo-icon" size={24} style={{ color: 'var(--secondary)' }} />
        <span style={{ background: 'linear-gradient(135deg, var(--primary), var(--secondary))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          SmartScheme
        </span>
      </Link>

      {/* Nav Links */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }} className="nav-links-container">
        <a href="#hero" style={{ fontWeight: 500, fontSize: '0.95rem', color: 'var(--text-secondary)' }}>{t('navHome')}</a>
        <a href="#features" style={{ fontWeight: 500, fontSize: '0.95rem', color: 'var(--text-secondary)' }}>{t('navFeatures')}</a>
        <a href="#how-it-works" style={{ fontWeight: 500, fontSize: '0.95rem', color: 'var(--text-secondary)' }}>{t('sectionHowItWorks')}</a>
        <a href="#faq" style={{ fontWeight: 500, fontSize: '0.95rem', color: 'var(--text-secondary)' }}>FAQ</a>
      </div>

      {/* Toolbar & Auth Buttons */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        {/* Language Selection */}
        <select 
          value={lang} 
          onChange={(e) => changeLanguage(e.target.value)}
          className="form-control"
          style={{
            padding: '0.4rem 0.6rem',
            fontSize: '0.85rem',
            width: 'auto',
            borderRadius: 'var(--radius-sm)',
            cursor: 'pointer',
            background: 'var(--bg-card)'
          }}
        >
          <option value="en">English</option>
          <option value="hi">हिंदी</option>
          <option value="ta">தமிழ்</option>
        </select>

        {/* Theme Toggle */}
        <button 
          onClick={toggleTheme} 
          className="btn-icon" 
          style={{ width: '36px', height: '36px' }}
          title={isDarkMode ? "Light Mode" : "Dark Mode"}
        >
          {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        {/* Action Button */}
        <button 
          onClick={handleCTA} 
          className="btn btn-primary"
          style={{ padding: '0.5rem 1.25rem', fontSize: '0.9rem' }}
        >
          {user ? (
            <>
              <User size={16} />
              Dashboard
            </>
          ) : (
            t('navLogin')
          )}
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
