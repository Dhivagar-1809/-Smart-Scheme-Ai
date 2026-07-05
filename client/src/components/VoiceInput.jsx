import React, { useState, useEffect } from 'react';
import { Mic, MicOff } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

const VoiceInput = ({ onTranscript, placeholder = "Speak now..." }) => {
  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState(null);
  const { lang } = useLanguage();

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = false;
      
      // Select correct BCP-47 language tag
      if (lang === 'hi') {
        rec.lang = 'hi-IN';
      } else if (lang === 'ta') {
        rec.lang = 'ta-IN';
      } else {
        rec.lang = 'en-IN';
      }

      rec.onstart = () => setIsListening(true);
      rec.onend = () => setIsListening(false);
      rec.onerror = (e) => {
        console.error('Speech recognition error:', e.error);
        setIsListening(false);
      };
      
      rec.onresult = (event) => {
        const transcriptText = event.results[0][0].transcript;
        if (onTranscript) {
          onTranscript(transcriptText);
        }
      };

      setRecognition(rec);
    }
  }, [lang, onTranscript]);

  const toggleListening = () => {
    if (!recognition) {
      alert("Speech recognition is not supported in this browser. Please use Google Chrome or Microsoft Edge.");
      return;
    }

    if (isListening) {
      recognition.stop();
    } else {
      recognition.start();
    }
  };

  return (
    <button
      type="button"
      onClick={toggleListening}
      className={`btn-icon ${isListening ? 'listening-pulse' : ''}`}
      style={{
        background: isListening ? '#EF4444' : 'var(--bg-card)',
        color: isListening ? '#FFFFFF' : 'var(--text-primary)',
        border: '1px solid var(--border-color)',
        position: 'relative'
      }}
      title={isListening ? "Stop listening" : "Start voice typing"}
    >
      {isListening ? <MicOff size={20} /> : <Mic size={20} />}
      {isListening && (
        <span style={{
          position: 'absolute',
          top: '-5px',
          right: '-5px',
          width: '10px',
          height: '10px',
          borderRadius: '50%',
          background: '#EF4444',
          animation: 'pulse 1s infinite'
        }} />
      )}
    </button>
  );
};

export default VoiceInput;
