import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, User, Eye, EyeOff, Sparkles, CheckCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

const AuthPages = ({ initialMode = 'login' }) => {
  const [mode, setMode] = useState(initialMode); // 'login', 'signup', 'forgot'
  const { login, signup, error, loading } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  // Custom message state (for forgot password)
  const [successMsg, setSuccessMsg] = useState('');
  const [formError, setFormError] = useState('');

  // Load remembered email
  useEffect(() => {
    const rememberedEmail = localStorage.getItem('remembered_email');
    if (rememberedEmail) {
      setEmail(rememberedEmail);
      setRememberMe(true);
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setSuccessMsg('');

    if (mode === 'login') {
      if (!email || !password) {
        setFormError('Please enter both email and password');
        return;
      }
      try {
        await login(email, password);
        if (rememberMe) {
          localStorage.setItem('remembered_email', email);
        } else {
          localStorage.removeItem('remembered_email');
        }
        navigate('/dashboard');
      } catch (err) {
        // Error is set in AuthContext
      }
    } else if (mode === 'signup') {
      if (!name || !email || !password) {
        setFormError('Please fill out all fields');
        return;
      }
      if (password.length < 6) {
        setFormError('Password must be at least 6 characters long');
        return;
      }
      try {
        await signup(name, email, password);
        navigate('/dashboard');
      } catch (err) {
        // Error is handled in context
      }
    } else if (mode === 'forgot') {
      if (!email) {
        setFormError('Please enter your email address');
        return;
      }
      setSuccessMsg(`We have simulated sending a password reset link to ${email}. In a production build, this routes to an SMTP client.`);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem 1rem',
      background: 'radial-gradient(circle at bottom right, rgba(124, 58, 237, 0.08), transparent 45%), radial-gradient(circle at top left, rgba(37, 99, 235, 0.08), transparent 45%), var(--bg-main)',
      position: 'relative'
    }}>
      {/* Back to Home button */}
      <Link to="/" style={{
        position: 'absolute',
        top: '2rem',
        left: '2rem',
        fontWeight: 600,
        color: 'var(--primary)',
        display: 'flex',
        alignItems: 'center',
        gap: '0.25rem'
      }}>
        ← Back to Homepage
      </Link>

      <div style={{ width: '100%', maxWidth: '440px' }} className="glass-card">
        {/* Header logo */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '48px',
            height: '48px',
            borderRadius: 'var(--radius-md)',
            background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
            color: '#FFFFFF',
            marginBottom: '1rem'
          }}>
            <Sparkles size={24} />
          </div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800 }}>
            {mode === 'login' && 'Welcome Back'}
            {mode === 'signup' && 'Create Account'}
            {mode === 'forgot' && 'Reset Password'}
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.25rem' }}>
            {mode === 'login' && 'Discover government benefits you qualify for.'}
            {mode === 'signup' && 'Sign up to build your citizen eligibility profile.'}
            {mode === 'forgot' && 'Enter email to receive security recovery details.'}
          </p>
        </div>

        {/* Display context/form errors */}
        {(error || formError) && (
          <div style={{
            padding: '0.75rem',
            background: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: 'var(--radius-sm)',
            color: '#EF4444',
            fontSize: '0.85rem',
            marginBottom: '1.5rem',
            textAlign: 'center'
          }}>
            {formError || error}
          </div>
        )}

        {/* Success message */}
        {successMsg && (
          <div style={{
            padding: '0.75rem',
            background: 'rgba(16, 185, 129, 0.15)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            borderRadius: 'var(--radius-sm)',
            color: '#059669',
            fontSize: '0.85rem',
            marginBottom: '1.5rem',
            display: 'flex',
            gap: '0.5rem',
            alignItems: 'flex-start'
          }}>
            <CheckCircle size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Name Field (Signup only) */}
          {mode === 'signup' && (
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>
                  <User size={18} />
                </span>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="form-control"
                  placeholder="John Doe"
                  style={{ paddingLeft: '2.75rem', width: '100%' }}
                  required
                />
              </div>
            </div>
          )}

          {/* Email Field */}
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>
                <Mail size={18} />
              </span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="form-control"
                placeholder="name@example.com"
                style={{ paddingLeft: '2.75rem', width: '100%' }}
                required
              />
            </div>
          </div>

          {/* Password Field (Login / Signup only) */}
          {mode !== 'forgot' && (
            <div className="form-group">
              <label className="form-label">Password</label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>
                  <Lock size={18} />
                </span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="form-control"
                  placeholder="••••••••"
                  style={{ paddingLeft: '2.75rem', paddingRight: '2.75rem', width: '100%' }}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(prev => !prev)}
                  style={{
                    position: 'absolute',
                    right: '1rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: 'var(--text-muted)'
                  }}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
          )}

          {/* Remember me & Forgot password link */}
          {mode === 'login' && (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  style={{ cursor: 'pointer' }}
                />
                Remember Me
              </label>
              <button
                type="button"
                onClick={() => { setMode('forgot'); setFormError(''); setSuccessMsg(''); }}
                style={{ background: 'none', border: 'none', color: 'var(--primary)', fontWeight: 600, cursor: 'pointer' }}
              >
                Forgot Password?
              </button>
            </div>
          )}

          {/* Submit Button */}
          <button type="submit" disabled={loading} className="btn btn-primary" style={{ width: '100%', marginTop: '0.5rem' }}>
            {loading ? (
              <span className="skeleton" style={{ width: '80px', height: '18px', display: 'inline-block' }} />
            ) : (
              <>
                {mode === 'login' && 'Sign In'}
                {mode === 'signup' && 'Create Account'}
                {mode === 'forgot' && 'Send Reset Instructions'}
              </>
            )}
          </button>
        </form>

        {/* Footer toggles */}
        <div style={{
          textAlign: 'center',
          marginTop: '2rem',
          fontSize: '0.9rem',
          borderTop: '1px solid var(--border-color)',
          paddingTop: '1.5rem',
          color: 'var(--text-secondary)'
        }}>
          {mode === 'login' && (
            <span>
              Don't have an account?{' '}
              <button
                onClick={() => { setMode('signup'); setFormError(''); setSuccessMsg(''); }}
                style={{ background: 'none', border: 'none', color: 'var(--primary)', fontWeight: 600, cursor: 'pointer' }}
              >
                Sign Up
              </button>
            </span>
          )}
          {mode === 'signup' && (
            <span>
              Already have an account?{' '}
              <button
                onClick={() => { setMode('login'); setFormError(''); setSuccessMsg(''); }}
                style={{ background: 'none', border: 'none', color: 'var(--primary)', fontWeight: 600, cursor: 'pointer' }}
              >
                Sign In
              </button>
            </span>
          )}
          {mode === 'forgot' && (
            <button
              onClick={() => { setMode('login'); setFormError(''); setSuccessMsg(''); }}
              style={{ background: 'none', border: 'none', color: 'var(--primary)', fontWeight: 600, cursor: 'pointer' }}
            >
              Back to Sign In
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthPages;
