import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Sparkles, 
  Search, 
  FileCheck, 
  MessageSquare, 
  Download, 
  Bookmark, 
  UserCheck, 
  TrendingUp, 
  HelpCircle, 
  Mail, 
  CheckCircle2,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import Navbar from '../components/Navbar';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { API_URL } from '../context/AuthContext';

const LandingPage = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const navigate = useNavigate();

  // Contact / Feedback Form State
  const [feedback, setFeedback] = useState({ name: '', email: '', message: '', rating: 5 });
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  // FAQ Accordion State
  const [faqOpen, setFaqOpen] = useState({});

  const toggleFaq = (index) => {
    setFaqOpen(prev => ({ ...prev, [index]: !prev[index] }));
  };

  const handleFeedbackChange = (e) => {
    const { name, value } = e.target;
    setFeedback(prev => ({ ...prev, [name]: value }));
  };

  const handleFeedbackSubmit = async (e) => {
    e.preventDefault();
    if (!feedback.message) return;
    try {
      const res = await fetch(`${API_URL}/feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...feedback,
          userId: user ? user.id : null
        })
      });
      if (res.ok) {
        setSubmitted(true);
        setFeedback({ name: '', email: '', message: '', rating: 5 });
      } else {
        setError('Submission failed. Please try again.');
      }
    } catch (err) {
      setError('Connection error. Please try again.');
    }
  };

  const faqs = [
    { q: "What is Smart Scheme Assistant?", a: "Smart Scheme Assistant is an AI-powered welfare recommendation system that maps your demographic credentials (age, income, occupation, etc.) against dozens of government schemes to discover all matching benefits in seconds." },
    { q: "Are all schemes on this platform official?", a: "Yes, we index authentic Indian government welfare schemes like PM-KISAN, Ayushman Bharat, PMAY, and Post-Matric scholarships, and guide you directly to their official portal links." },
    { q: "How does the AI Eligibility Checker work?", a: "The checker uses the Google Gemini API to analyze your profile constraints and cross-reference them against eligibility criteria, providing a structured reason for why you qualify and generating a step-by-step application checklist." },
    { q: "Can I download my scheme recommendations?", a: "Yes! You can instantly generate and download a professional PDF report containing your profile details, eligible schemes, document checklist, and application guide." }
  ];

  return (
    <div style={{ paddingTop: '70px', minHeight: '100vh', background: 'var(--bg-main)' }}>
      <Navbar />

      {/* --- HERO SECTION --- */}
      <section id="hero" style={{
        padding: '6rem 2rem 4rem 2rem',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        background: 'radial-gradient(circle at top right, rgba(124, 58, 237, 0.08), transparent 40%), radial-gradient(circle at top left, rgba(37, 99, 235, 0.08), transparent 40%)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Decorative Floating Cards */}
        <div className="glass-card font-sans hero-decor-card" style={{
          position: 'absolute',
          top: '15%',
          left: '10%',
          transform: 'rotate(-10deg) scale(0.9)',
          opacity: 0.15,
          zIndex: 0
        }}>
          <Sparkles size={20} color="var(--secondary)" />
          <h4>AI Recommendation Match</h4>
          <span style={{ fontSize: '0.8rem' }}>PM Kisan Match 100%</span>
        </div>
        <div className="glass-card hero-decor-card" style={{
          position: 'absolute',
          bottom: '20%',
          right: '8%',
          transform: 'rotate(8deg) scale(0.95)',
          opacity: 0.15,
          zIndex: 0
        }}>
          <FileCheck size={20} color="var(--accent)" />
          <h4>Documents Checklist</h4>
          <span style={{ fontSize: '0.8rem' }}>3/3 Documents Ready</span>
        </div>

        <div style={{ maxWidth: '900px', position: 'relative', zIndex: 1 }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.4rem 1rem',
            background: 'var(--glass-bg)',
            border: '1px solid var(--glass-border)',
            borderRadius: 'var(--radius-full)',
            marginBottom: '1.5rem',
            fontSize: '0.85rem',
            fontWeight: 600
          }}>
            <Sparkles size={14} style={{ color: 'var(--secondary)' }} />
            <span style={{ background: 'linear-gradient(135deg, var(--primary), var(--secondary))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              AI-Powered Welfare Automation
            </span>
          </div>

          <h1 style={{
            fontSize: '3.75rem',
            fontWeight: 800,
            letterSpacing: '-0.025em',
            marginBottom: '1.5rem',
            lineHeight: 1.15
          }}>
            {t('heroTitle')}<br/>
            <span style={{
              background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              in Seconds.
            </span>
          </h1>

          <p style={{
            fontSize: '1.2rem',
            color: 'var(--text-secondary)',
            marginBottom: '2.5rem',
            maxWidth: '650px',
            margin: '0 auto 2.5rem auto'
          }}>
            {t('heroSubtitle')}
          </p>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <button 
              onClick={() => navigate(user ? '/dashboard/eligibility' : '/login')}
              className="btn btn-primary"
              style={{ padding: '0.85rem 2rem', fontSize: '1rem' }}
            >
              {t('btnCheckEligibility')}
            </button>
            <button 
              onClick={() => navigate(user ? '/dashboard' : '/login')}
              className="btn btn-secondary"
              style={{ padding: '0.85rem 2rem', fontSize: '1rem' }}
            >
              {t('btnExploreSchemes')}
            </button>
          </div>
        </div>
      </section>

      {/* --- STATISTICS SECTION --- */}
      <section style={{ padding: '3rem 2rem', borderY: '1px solid var(--border-color)', background: 'var(--bg-card)' }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '2rem',
          textAlign: 'center'
        }}>
          <div>
            <h3 style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--primary)' }}>1.2M+</h3>
            <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Citizens Enrolled</p>
          </div>
          <div>
            <h3 style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--secondary)' }}>30+</h3>
            <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Welfare Schemes Indexed</p>
          </div>
          <div>
            <h3 style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--accent)' }}>Rs. 450 Cr+</h3>
            <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Disbursed in Benefits</p>
          </div>
          <div>
            <h3 style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--primary)' }}>99.2%</h3>
            <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', fontWeight: 500 }}>AI Accuracy Match</p>
          </div>
        </div>
      </section>

      {/* --- FEATURES SECTION --- */}
      <section id="features" style={{ padding: '5rem 2rem', maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
          <h2 style={{ fontSize: '2.25rem', marginBottom: '0.5rem' }}>{t('sectionFeatures')}</h2>
          <p style={{ color: 'var(--text-secondary)' }}>Advanced tools helping Indian citizens secure government grants instantly.</p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '2rem'
        }}>
          <div className="glass-card">
            <div style={{ color: 'var(--primary)', marginBottom: '1rem' }}><UserCheck size={32} /></div>
            <h3 style={{ marginBottom: '0.75rem' }}>AI Eligibility Checker</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>Inputs demographic particulars and uses Gemini logic to verify qualifiers across all schemes automatically.</p>
          </div>

          <div className="glass-card">
            <div style={{ color: 'var(--secondary)', marginBottom: '1rem' }}><Search size={32} /></div>
            <h3 style={{ marginBottom: '0.75rem' }}>Semantic Vector Search</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>Search schemes using natural queries. Uses vector embeddings to find matching benefits instead of simple keyword maps.</p>
          </div>

          <div className="glass-card">
            <div style={{ color: 'var(--accent)', marginBottom: '1rem' }}><FileCheck size={32} /></div>
            <h3 style={{ marginBottom: '0.75rem' }}>Document Checklists</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>AI instantly structures the exact documentation needed for submission, saving days of manual search.</p>
          </div>

          <div className="glass-card">
            <div style={{ color: 'var(--secondary)', marginBottom: '1rem' }}><MessageSquare size={32} /></div>
            <h3 style={{ marginBottom: '0.75rem' }}>AI Chatbot Assistant</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>Ask complex eligibility questions and get instant, simple guides translated into English, Hindi, or Tamil.</p>
          </div>

          <div className="glass-card">
            <div style={{ color: 'var(--primary)', marginBottom: '1rem' }}><Download size={32} /></div>
            <h3 style={{ marginBottom: '0.75rem' }}>PDF Report Generation</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>Generate professional application summaries and checklist reports for easy offline submission.</p>
          </div>

          <div className="glass-card">
            <div style={{ color: 'var(--accent)', marginBottom: '1rem' }}><Bookmark size={32} /></div>
            <h3 style={{ marginBottom: '0.75rem' }}>Bookmarks & History</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>Save schemes to your dashboard profile, keep track of application deadliness, and review past searches.</p>
          </div>
        </div>
      </section>

      {/* --- HOW IT WORKS --- */}
      <section id="how-it-works" style={{ padding: '5rem 2rem', background: 'var(--bg-card)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
            <h2 style={{ fontSize: '2.25rem', marginBottom: '0.5rem' }}>{t('sectionHowItWorks')}</h2>
            <p style={{ color: 'var(--text-secondary)' }}>Get verified and receive benefit guidelines in 4 simple steps.</p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '2.5rem',
            position: 'relative'
          }}>
            <div style={{ textAlign: 'center', position: 'relative' }}>
              <div style={{
                width: '60px',
                height: '60px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.25rem',
                fontWeight: 700,
                margin: '0 auto 1.5rem auto'
              }}>1</div>
              <h4 style={{ marginBottom: '0.5rem' }}>Enter Profile Particulars</h4>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Fill in details such as state, age, occupation, income, and special credentials.</p>
            </div>

            <div style={{ textAlign: 'center', position: 'relative' }}>
              <div style={{
                width: '60px',
                height: '60px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.25rem',
                fontWeight: 700,
                margin: '0 auto 1.5rem auto'
              }}>2</div>
              <h4 style={{ marginBottom: '0.5rem' }}>AI Analyzes Requirements</h4>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>The engine runs eligibility matching and evaluates qualifications using Gemini.</p>
            </div>

            <div style={{ textAlign: 'center', position: 'relative' }}>
              <div style={{
                width: '60px',
                height: '60px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.25rem',
                fontWeight: 700,
                margin: '0 auto 1.5rem auto'
              }}>3</div>
              <h4 style={{ marginBottom: '0.5rem' }}>Get Matching Schemes</h4>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Review matching welfare schemes, document checklists, and application guidelines.</p>
            </div>

            <div style={{ textAlign: 'center', position: 'relative' }}>
              <div style={{
                width: '60px',
                height: '60px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.25rem',
                fontWeight: 700,
                margin: '0 auto 1.5rem auto'
              }}>4</div>
              <h4 style={{ marginBottom: '0.5rem' }}>Download PDF Report</h4>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Generate an elegant PDF guidelines summary sheet to complete offline filing easily.</p>
            </div>
          </div>
        </div>
      </section>

      {/* --- FAQ SECTION --- */}
      <section id="faq" style={{ padding: '5rem 2rem', maxWidth: '800px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
          <h2 style={{ fontSize: '2.25rem', marginBottom: '0.5rem' }}>{t('sectionFAQ')}</h2>
          <p style={{ color: 'var(--text-secondary)' }}>Clear answers regarding the Smart Scheme recommendation portal.</p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {faqs.map((faq, index) => (
            <div key={index} className="glass-card" style={{ padding: '1rem 1.5rem', cursor: 'pointer' }} onClick={() => toggleFaq(index)}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h4 style={{ fontSize: '1.05rem', fontWeight: 600 }}>{faq.q}</h4>
                {faqOpen[index] ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
              </div>
              {faqOpen[index] && (
                <p style={{ marginTop: '1rem', color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.6, borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
                  {faq.a}
                </p>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* --- CONTACT / FEEDBACK FORM --- */}
      <section id="contact" style={{ padding: '5rem 2rem', background: 'var(--bg-card)' }}>
        <div style={{ maxWidth: '550px', margin: '0 auto' }} className="glass-card">
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Share Your Feedback</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>Have questions or suggestions? Reach out and help us make welfare accessible.</p>
          </div>

          {submitted ? (
            <div style={{ textAlign: 'center', padding: '2rem 0' }}>
              <CheckCircle2 size={48} color="var(--accent)" style={{ margin: '0 auto 1rem auto' }} />
              <h3>Thank You!</h3>
              <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>Your feedback has been successfully submitted to our support queue.</p>
            </div>
          ) : (
            <form onSubmit={handleFeedbackSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {error && <div style={{ color: '#EF4444', fontSize: '0.9rem', textAlign: 'center' }}>{error}</div>}
              <div className="form-group">
                <label className="form-label">Your Name</label>
                <input 
                  type="text" 
                  name="name" 
                  value={feedback.name} 
                  onChange={handleFeedbackChange}
                  className="form-control" 
                  placeholder="Enter name"
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input 
                  type="email" 
                  name="email" 
                  value={feedback.email} 
                  onChange={handleFeedbackChange}
                  className="form-control" 
                  placeholder="Enter email"
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Rating</label>
                <select 
                  name="rating" 
                  value={feedback.rating} 
                  onChange={handleFeedbackChange}
                  className="form-control"
                >
                  <option value={5}>⭐⭐⭐⭐⭐ (Excellent)</option>
                  <option value={4}>⭐⭐⭐⭐ (Very Good)</option>
                  <option value={3}>⭐⭐⭐ (Good)</option>
                  <option value={2}>⭐⭐ (Fair)</option>
                  <option value={1}>⭐ (Poor)</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Feedback Message</label>
                <textarea 
                  name="message" 
                  value={feedback.message} 
                  onChange={handleFeedbackChange}
                  className="form-control" 
                  rows={4} 
                  placeholder="Tell us what you think..."
                  required
                />
              </div>
              <button type="submit" className="btn btn-primary" style={{ marginTop: '1rem' }}>
                <Mail size={16} /> Submit Message
              </button>
            </form>
          )}
        </div>
      </section>

      {/* --- FOOTER --- */}
      <footer style={{
        padding: '3rem 2rem',
        borderTop: '1px solid var(--border-color)',
        textAlign: 'center',
        background: 'var(--bg-main)',
        color: 'var(--text-muted)',
        fontSize: '0.85rem'
      }}>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '1.5rem', marginBottom: '1.5rem' }}>
          <a href="#hero" style={{ color: 'var(--text-secondary)' }}>Home</a>
          <a href="#features" style={{ color: 'var(--text-secondary)' }}>Features</a>
          <a href="#how-it-works" style={{ color: 'var(--text-secondary)' }}>How it Works</a>
          <a href="#faq" style={{ color: 'var(--text-secondary)' }}>FAQ</a>
        </div>
        <p style={{ marginBottom: '0.5rem' }}>© {new Date().getFullYear()} Smart Scheme Assistant. All Rights Reserved.</p>
        <p style={{ fontSize: '0.75rem' }}>Built as a modern Indian welfare discovery automation tool using Google Gemini API.</p>
      </footer>
    </div>
  );
};

export default LandingPage;
