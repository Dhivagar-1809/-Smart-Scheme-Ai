import React, { useState, useEffect, useRef } from 'react';
import { 
  MessageSquare, 
  Send, 
  Volume2, 
  VolumeX, 
  Sparkles, 
  RotateCcw,
  Languages
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { API_URL } from '../context/AuthContext';
import VoiceInput from '../components/VoiceInput';

const ChatAssistant = () => {
  const { token, user } = useAuth();
  const { t, lang } = useLanguage();

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [speakingMsgId, setSpeakingMsgId] = useState(null);

  const messagesEndRef = useRef(null);

  // Load chat history on mount
  useEffect(() => {
    const fetchChatHistory = async () => {
      if (!token) return;
      try {
        const res = await fetch(`${API_URL}/chat/history`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          if (data.length > 0) {
            setMessages(data);
          } else {
            // Default welcome message
            setMessages([
              {
                _id: 'welcome',
                sender: 'assistant',
                message: `Hello ${user?.name || 'Citizen'}! I am your AI Smart Scheme Assistant, an Indian Government Welfare expert. You can ask me questions about schemes you qualify for, required documents, or application guidelines. I support English, Hindi, and Tamil!`,
                timestamp: new Date()
              }
            ]);
          }
        }
      } catch (err) {
        console.error('Error fetching chat history:', err);
      }
    };

    fetchChatHistory();
  }, [token]);

  // Scroll to bottom on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSendMessage = async (textToSend) => {
    const queryText = textToSend || input;
    if (!queryText.trim()) return;

    setInput('');
    setLoading(true);

    // Optimistically add user message
    const tempUserMsg = {
      _id: `user-${Date.now()}`,
      sender: 'user',
      message: queryText,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, tempUserMsg]);

    try {
      const res = await fetch(`${API_URL}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ query: queryText })
      });

      if (!res.ok) {
        throw new Error('Chat failed');
      }

      const data = await res.json();
      
      const tempAssistantMsg = {
        _id: `assistant-${Date.now()}`,
        sender: 'assistant',
        message: data.response,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, tempAssistantMsg]);
    } catch (err) {
      console.error(err);
      const errorMsg = {
        _id: `error-${Date.now()}`,
        sender: 'assistant',
        message: "I apologize, but I'm having trouble connecting to the AI service. Please make sure the backend server and MONGODB / GEMINI API keys are configured.",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  // Text to Speech
  const speakText = (text, msgId) => {
    if ('speechSynthesis' in window) {
      if (speakingMsgId === msgId) {
        window.speechSynthesis.cancel();
        setSpeakingMsgId(null);
        return;
      }

      window.speechSynthesis.cancel();
      setSpeakingMsgId(msgId);
      
      const utterance = new SpeechSynthesisUtterance(text);
      
      // Determine language
      if (lang === 'hi' || text.match(/[\u0900-\u097F]/)) {
        utterance.lang = 'hi-IN';
      } else if (lang === 'ta' || text.match(/[\u0B80-\u0BFF]/)) {
        utterance.lang = 'ta-IN';
      } else {
        utterance.lang = 'en-IN';
      }

      utterance.onend = () => {
        setSpeakingMsgId(null);
      };

      utterance.onerror = () => {
        setSpeakingMsgId(null);
      };

      window.speechSynthesis.speak(utterance);
    } else {
      alert("Text to speech is not supported in this browser.");
    }
  };

  const presetQueries = [
    { label: "Which scholarship can I apply?", query: "Which scholarship can I apply based on my student status?" },
    { label: "Am I eligible for PMAY?", query: "Am I eligible for Pradhan Mantri Awas Yojana (PMAY)?" },
    { label: "How do I apply for PM Kisan?", query: "How do I apply for PM Kisan and what is the website?" },
    { label: "What documents are required?", query: "What documents are required for Ayushman Bharat PM-JAY?" },
    { label: "Explain in Tamil", query: "Explain the details of Sukanya Samriddhi Yojana in Tamil." },
    { label: "Explain simply", query: "Explain PM Vishwakarma scheme simply." }
  ];

  return (
    <div className="animate-fade" style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 4rem)', gap: '1rem' }}>
      {/* Title */}
      <div>
        <h2 style={{ fontSize: '1.75rem', fontWeight: 800 }}>{t('sidebarChat')}</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
          Consult the Indian Welfare Expert. Ask about benefits, application guidelines, and documents.
        </p>
      </div>

      {/* Main Chat Area */}
      <div className="glass-card" style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        padding: '1.5rem',
        overflow: 'hidden',
        height: '100%'
      }}>
        {/* Messages Thread Container */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          paddingRight: '0.5rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
          marginBottom: '1.5rem'
        }}>
          {messages.map((msg) => {
            const isUser = msg.sender === 'user';
            const isSpeaking = speakingMsgId === msg._id;
            return (
              <div 
                key={msg._id} 
                style={{
                  display: 'flex',
                  justifyContent: isUser ? 'flex-end' : 'flex-start',
                  alignItems: 'flex-start',
                  gap: '0.75rem'
                }}
              >
                {/* Bot Icon */}
                {!isUser && (
                  <div style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#FFFFFF',
                    flexShrink: 0
                  }}>
                    <Sparkles size={14} />
                  </div>
                )}

                {/* Message Bubble */}
                <div style={{
                  maxWidth: '70%',
                  padding: '0.75rem 1.25rem',
                  borderRadius: isUser 
                    ? 'var(--radius-md) var(--radius-md) 0 var(--radius-md)' 
                    : 'var(--radius-md) var(--radius-md) var(--radius-md) 0',
                  background: isUser 
                    ? 'linear-gradient(135deg, var(--primary), var(--secondary))' 
                    : 'var(--bg-main)',
                  color: isUser ? '#FFFFFF' : 'var(--text-primary)',
                  boxShadow: 'var(--shadow-sm)',
                  border: isUser ? 'none' : '1px solid var(--border-color)',
                  position: 'relative'
                }}>
                  <p style={{ 
                    fontSize: '0.92rem', 
                    whiteSpace: 'pre-wrap', 
                    wordBreak: 'break-word',
                    lineHeight: 1.5
                  }}>{msg.message}</p>
                  
                  {/* TTS Button for assistant messages */}
                  {!isUser && (
                    <button
                      onClick={() => speakText(msg.message, msg._id)}
                      style={{
                        position: 'absolute',
                        right: '0.5rem',
                        bottom: '-1.5rem',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        color: isSpeaking ? 'var(--secondary)' : 'var(--text-muted)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.2rem',
                        fontSize: '0.75rem',
                        fontWeight: 600
                      }}
                      title={isSpeaking ? "Stop Speaking" : "Listen to Reply"}
                    >
                      {isSpeaking ? <VolumeX size={12} /> : <Volume2 size={12} />}
                      {isSpeaking ? "Stop" : "Listen"}
                    </button>
                  )}
                </div>
              </div>
            );
          })}

          {/* Bot Typing Indicator */}
          {loading && (
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                background: 'var(--border-color)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--text-muted)'
              }}>
                ...
              </div>
              <div className="skeleton" style={{ height: '35px', width: '120px', borderRadius: 'var(--radius-md)' }} />
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Preset Teaser Queries */}
        <div style={{
          display: 'flex',
          gap: '0.5rem',
          flexWrap: 'wrap',
          marginBottom: '1rem',
          borderTop: '1px solid var(--border-color)',
          paddingTop: '1rem'
        }}>
          {presetQueries.map((item, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(item.query)}
              className="btn btn-secondary"
              style={{ padding: '0.35rem 0.75rem', fontSize: '0.78rem', borderRadius: 'var(--radius-sm)' }}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <VoiceInput onTranscript={(text) => setInput(text)} />
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
            className="form-control"
            placeholder={t('chatPlaceholder')}
            style={{ flex: 1 }}
          />
          <button 
            onClick={() => handleSendMessage()} 
            className="btn btn-primary"
            style={{ width: '42px', height: '42px', padding: 0 }}
          >
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatAssistant;
