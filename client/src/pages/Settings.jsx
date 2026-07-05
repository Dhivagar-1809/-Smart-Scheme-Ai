import React, { useState, useEffect } from 'react';
import { 
  Settings as SettingsIcon, 
  Sun, 
  Moon, 
  Languages, 
  Bell, 
  BellOff, 
  CheckCircle,
  HelpCircle
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';

const Settings = () => {
  const { isDarkMode, toggleTheme } = useTheme();
  const { lang, changeLanguage, t } = useLanguage();

  // Notification Reminder State
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [reminderFrequency, setReminderFrequency] = useState('weekly');
  const [successMsg, setSuccessMsg] = useState('');

  // Check notification status on mount
  useEffect(() => {
    if ('Notification' in window) {
      setNotificationsEnabled(Notification.permission === 'granted');
    }
  }, []);

  const requestNotificationPermission = async () => {
    if (!('Notification' in window)) {
      alert("This browser does not support desktop notifications.");
      return;
    }

    if (Notification.permission === 'granted') {
      setNotificationsEnabled(true);
      return;
    }

    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      setNotificationsEnabled(true);
      
      // Send welcome notification
      new Notification("Smart Scheme Assistant", {
        body: "Reminders and welfare application deadline alerts successfully activated!",
        icon: "/favicon.ico"
      });
    } else {
      setNotificationsEnabled(false);
    }
  };

  const saveRemindersConfig = (e) => {
    e.preventDefault();
    setSuccessMsg(`Reminder parameters saved! You will receive desktop notifications regarding scheme updates on a ${reminderFrequency} basis.`);
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  return (
    <div className="animate-fade" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Page Header */}
      <div>
        <h2 style={{ fontSize: '1.75rem', fontWeight: 800 }}>{t('sidebarSettings')}</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
          Customize theme variables, language preference translation, and alert deadlines.
        </p>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
        gap: '2rem'
      }}>
        {/* Theme and Language Settings */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <h3 style={{ fontSize: '1.15rem', display: 'flex', alignItems: 'center', gap: '0.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
            <Languages size={18} style={{ color: 'var(--secondary)' }} />
            Display & Language Settings
          </h3>

          {/* Theme selection toggle */}
          <div>
            <label className="form-label" style={{ display: 'block', marginBottom: '0.5rem' }}>Interface Theme</label>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button 
                onClick={toggleTheme}
                className="btn btn-secondary"
                style={{
                  flex: 1,
                  background: !isDarkMode ? 'rgba(37, 99, 235, 0.08)' : 'var(--bg-card)',
                  borderColor: !isDarkMode ? 'var(--primary)' : 'var(--border-color)',
                  color: !isDarkMode ? 'var(--primary)' : 'var(--text-primary)'
                }}
              >
                <Sun size={16} /> Light Mode
              </button>
              <button 
                onClick={toggleTheme}
                className="btn btn-secondary"
                style={{
                  flex: 1,
                  background: isDarkMode ? 'rgba(124, 58, 237, 0.08)' : 'var(--bg-card)',
                  borderColor: isDarkMode ? 'var(--secondary)' : 'var(--border-color)',
                  color: isDarkMode ? 'var(--secondary)' : 'var(--text-primary)'
                }}
              >
                <Moon size={16} /> Dark Mode
              </button>
            </div>
          </div>

          {/* Language Selection */}
          <div style={{ marginTop: '0.5rem' }}>
            <label className="form-label" style={{ display: 'block', marginBottom: '0.5rem' }}>Welfare Portal Language</label>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {['en', 'hi', 'ta'].map((langKey) => {
                const isActive = lang === langKey;
                const labels = { en: 'English (US)', hi: 'हिंदी (Hindi)', ta: 'தமிழ் (Tamil)' };
                return (
                  <button
                    key={langKey}
                    onClick={() => changeLanguage(langKey)}
                    className="btn btn-secondary"
                    style={{
                      flex: 1,
                      minWidth: '100px',
                      background: isActive ? 'linear-gradient(135deg, var(--primary), var(--secondary))' : 'var(--bg-card)',
                      color: isActive ? '#FFFFFF' : 'var(--text-primary)',
                      border: isActive ? 'none' : '1px solid var(--border-color)'
                    }}
                  >
                    {labels[langKey]}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Reminders alerts card */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <h3 style={{ fontSize: '1.15rem', display: 'flex', alignItems: 'center', gap: '0.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
            <Bell size={18} style={{ color: 'var(--accent)' }} />
            Application Reminders Configuration
          </h3>

          {successMsg && (
            <div style={{
              padding: '0.75rem',
              background: 'rgba(16, 185, 129, 0.12)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              borderRadius: 'var(--radius-sm)',
              color: '#059669',
              fontSize: '0.85rem',
              display: 'flex',
              gap: '0.5rem',
              alignItems: 'flex-start'
            }}>
              <CheckCircle size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
              <span>{successMsg}</span>
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* Enable switch */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 600 }}>Deadline Push Alerts</h4>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Get desktop alerts before scheme filing deadlines close.</p>
              </div>
              <button
                onClick={requestNotificationPermission}
                className="btn-icon"
                style={{
                  background: notificationsEnabled ? 'rgba(16, 185, 129, 0.15)' : 'var(--bg-card)',
                  color: notificationsEnabled ? 'var(--accent)' : 'var(--text-muted)',
                  borderColor: notificationsEnabled ? 'var(--accent)' : 'var(--border-color)'
                }}
                title={notificationsEnabled ? "Alerts Enabled" : "Activate Alerts"}
              >
                {notificationsEnabled ? <Bell size={18} /> : <BellOff size={18} />}
              </button>
            </div>

            {/* Config options */}
            {notificationsEnabled && (
              <form onSubmit={saveRemindersConfig} className="animate-fade" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Reminder Frequency</label>
                  <select 
                    value={reminderFrequency} 
                    onChange={(e) => setReminderFrequency(e.target.value)}
                    className="form-control"
                  >
                    <option value="daily">Daily (Check deadliness daily)</option>
                    <option value="weekly">Weekly (Deadline audits on Fridays)</option>
                    <option value="monthly">Monthly (Deadline overview on 1st of month)</option>
                  </select>
                </div>
                <button type="submit" className="btn btn-accent" style={{ width: '100%' }}>
                  Save Reminders Config
                </button>
              </form>
            )}

            {!notificationsEnabled && (
              <div style={{
                padding: '0.75rem',
                background: 'var(--bg-main)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.82rem',
                color: 'var(--text-secondary)',
                display: 'flex',
                gap: '0.5rem'
              }}>
                <HelpCircle size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
                <span>Please click the bell icon above to request browser notifications permission, to trigger deadlines configuration alerts.</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
