import React, { useState, useRef, useEffect } from 'react';
import { useFarm } from '../context/FarmContext';
import { api } from '../services/api';
import PestIncidentModal from './pests/PestIncidentModal';
import { 
  Bot, MessageSquare, X, Send, Sparkles, ShieldAlert, 
  ChevronRight, Camera, FileText, HelpCircle, CheckCircle2 
} from 'lucide-react';

export default function ChatBot() {
  const { selectedFarm } = useFarm();
  const [isOpen, setIsOpen] = useState(false);
  const [isIncidentModalOpen, setIsIncidentModalOpen] = useState(false);
  
  const [crops, setCrops] = useState([]);
  const [fields, setFields] = useState([]);

  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      sender: 'bot',
      text: `Hello! I'm your **Fieldnote AI Agronomist Assistant**. How can I help you manage your fields today?`,
      quickActions: [
        { label: '🚨 Report Pest Incident', action: 'report_incident' },
        { label: '🌾 Fall Armyworm Diagnosis', action: 'armyworm' },
        { label: '🌧️ Weather Crop Risk', action: 'weather_risk' },
        { label: '🧪 Soil Moisture Advice', action: 'moisture' }
      ]
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const messagesEndRef = useRef(null);

  // Load farm context for incident modal
  useEffect(() => {
    if (selectedFarm) {
      Promise.all([
        api.getCrops(selectedFarm._id).catch(() => []),
        api.getFieldsByFarm(selectedFarm._id).catch(() => [])
      ]).then(([cData, fData]) => {
        setCrops(cData || []);
        setFields(fData || []);
      });
    }
  }, [selectedFarm]);

  // Listen for global open event
  useEffect(() => {
    const handleGlobalOpen = () => {
      setIsIncidentModalOpen(true);
    };
    window.addEventListener('open-incident-modal', handleGlobalOpen);
    return () => window.removeEventListener('open-incident-modal', handleGlobalOpen);
  }, []);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const handleQuickAction = (actionKey) => {
    if (actionKey === 'report_incident') {
      setIsIncidentModalOpen(true);
      addMessage('user', 'I want to report a pest/disease incident.');
      setTimeout(() => {
        addMessage('bot', 'Opening the AI-assisted **Pest & Disease Incident Reporting** wizard now. You can upload photos, inspection PDFs, or enter symptoms directly!', [
          { label: '🚨 Open Incident Reporter', action: 'report_incident' }
        ]);
      }, 500);
      return;
    }

    if (actionKey === 'armyworm') {
      addMessage('user', 'How do I identify and treat Fall Armyworm?');
      setIsTyping(true);
      setTimeout(() => {
        setIsTyping(false);
        addMessage('bot', '🍂 **Fall Armyworm (Spodoptera frugiperda)**:\n- **Symptoms**: Pin-hole feeding damage, ragged leaves, frass in leaf whorls.\n- **Treatment**: Apply *Bacillus thuringiensis* (Bt) or Neem seed kernel extract directly into whorls.\n- **Action**: Click **Report Incident** below if you suspect an outbreak in your fields.', [
          { label: '🚨 Report Incident Now', action: 'report_incident' }
        ]);
      }, 800);
      return;
    }

    if (actionKey === 'weather_risk') {
      addMessage('user', 'What weather risks should I watch out for?');
      setIsTyping(true);
      setTimeout(() => {
        setIsTyping(false);
        addMessage('bot', '🌧️ High humidity (>80%) accompanied by warm temperatures (24-28°C) creates high risk for **Fungal Rust** and **Leaf Blight**.\n- **Tip**: Ensure proper field drainage and monitor sensor moisture levels.');
      }, 800);
      return;
    }

    if (actionKey === 'moisture') {
      addMessage('user', 'Optimal soil moisture levels?');
      setIsTyping(true);
      setTimeout(() => {
        setIsTyping(false);
        addMessage('bot', '💧 **Soil Moisture Standards**:\n- **Maize/Corn**: 25% - 40% optimal VWC.\n- **Wheat**: 20% - 35%.\nIf moisture drops below 20%, an automated low-moisture alert is triggered.');
      }, 800);
    }
  };

  const addMessage = (sender, text, quickActions = null) => {
    setMessages((prev) => [
      ...prev,
      { id: Date.now().toString(), sender, text, quickActions }
    ]);
  };

  const handleSend = (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const query = inputText.trim();
    setInputText('');
    addMessage('user', query);

    setIsTyping(true);

    // AI Response generation
    setTimeout(() => {
      setIsTyping(false);
      const lower = query.toLowerCase();

      if (lower.includes('report') || lower.includes('incident') || lower.includes('pest') || lower.includes('disease') || lower.includes('bug') || lower.includes('worm')) {
        addMessage('bot', `I can help you analyze and report pest/disease outbreaks using AI vision & text analysis.\n\nClick **Report Incident** to launch the multi-modal camera & document scanner.`, [
          { label: '🚨 Launch Report Incident Wizard', action: 'report_incident' }
        ]);
      } else if (lower.includes('weather') || lower.includes('rain') || lower.includes('temp')) {
        addMessage('bot', `Current weather conditions are synced with your farm sensors. High humidity increases blight risk.`);
      } else {
        addMessage('bot', `I've analyzed your query against **${selectedFarm?.name || 'your farm'}** context. For accurate diagnostic assessments, please use our **AI Pest & Disease Incident Workflow**.`, [
          { label: '🚨 Report Incident Workflow', action: 'report_incident' }
        ]);
      }
    }, 1000);
  };

  return (
    <>
      {/* Floating Widget Container at Bottom Right */}
      <div
        style={{
          position: 'fixed',
          bottom: '1.5rem',
          right: '1.5rem',
          zIndex: 9999,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-end',
          gap: '0.75rem'
        }}
      >
        {/* Expanded Chat Box */}
        {isOpen && (
          <div
            className="glass-card"
            style={{
              width: '380px',
              maxWidth: 'calc(100vw - 2rem)',
              height: '520px',
              maxHeight: 'calc(100vh - 6rem)',
              display: 'flex',
              flexDirection: 'column',
              padding: 0,
              overflow: 'hidden',
              boxShadow: '0 20px 40px rgba(24, 61, 45, 0.25)',
              border: '1px solid #C8DCD0',
              borderRadius: 'var(--radius-md)',
              background: '#FFFFFF',
              animation: 'fadeInUp 0.25s ease-out'
            }}
          >
            {/* Header */}
            <div
              style={{
                background: 'linear-gradient(135deg, var(--color-forest-dark) 0%, #204B38 100%)',
                color: '#FFFFFF',
                padding: '1rem 1.2rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}
            >
              <div className="flex items-center gap-3">
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    background: 'rgba(255,255,255,0.18)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '1px solid rgba(255,255,255,0.3)',
                    position: 'relative'
                  }}
                >
                  <Bot size={20} color="#FFFFFF" />
                  <span
                    style={{
                      position: 'absolute',
                      bottom: '0',
                      right: '0',
                      width: '9px',
                      height: '9px',
                      borderRadius: '50%',
                      background: '#10B981',
                      border: '2px solid #183D2D'
                    }}
                  />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.02rem', fontWeight: 700, color: '#FFFFFF', margin: 0, lineHeight: 1.2 }}>
                    AI Agronomist Bot
                  </h3>
                  <span style={{ fontSize: '0.73rem', color: 'rgba(255,255,255,0.85)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Sparkles size={11} /> 24/7 Smart Farm Assistant
                  </span>
                </div>
              </div>

              <button
                onClick={() => setIsOpen(false)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'rgba(255,255,255,0.8)',
                  cursor: 'pointer',
                  padding: '4px',
                  borderRadius: '4px'
                }}
                title="Close Chat"
              >
                <X size={18} />
              </button>
            </div>

            {/* Direct Incident Trigger Banner */}
            <div
              style={{
                background: '#FEF3C7',
                borderBottom: '1px solid #FCD34D',
                padding: '0.55rem 0.85rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                fontSize: '0.82rem',
                color: '#92400E'
              }}
            >
              <div className="flex items-center gap-1.5" style={{ fontWeight: 600 }}>
                <ShieldAlert size={15} color="#D97706" />
                <span>Pest or Disease Outbreak?</span>
              </div>
              <button
                className="btn btn-primary btn-sm"
                onClick={() => {
                  setIsIncidentModalOpen(true);
                }}
                style={{
                  padding: '0.25rem 0.65rem',
                  fontSize: '0.78rem',
                  background: '#D97706',
                  color: '#FFFFFF'
                }}
              >
                + Report Incident
              </button>
            </div>

            {/* Chat Messages Body */}
            <div
              style={{
                flex: 1,
                padding: '1rem',
                overflowY: 'auto',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.85rem',
                background: '#F8FAF8'
              }}
            >
              {messages.map((m) => (
                <div
                  key={m.id}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: m.sender === 'user' ? 'flex-end' : 'flex-start'
                  }}
                >
                  <div
                    style={{
                      maxWidth: '85%',
                      padding: '0.75rem 0.95rem',
                      borderRadius: m.sender === 'user' ? '14px 14px 2px 14px' : '14px 14px 14px 2px',
                      background: m.sender === 'user' ? 'var(--color-forest-dark)' : '#FFFFFF',
                      color: m.sender === 'user' ? '#FFFFFF' : 'var(--text-main)',
                      fontSize: '0.87rem',
                      lineHeight: 1.45,
                      boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                      border: m.sender === 'user' ? 'none' : '1px solid #E2ECE5',
                      whiteSpace: 'pre-line'
                    }}
                  >
                    {m.text}
                  </div>

                  {/* Quick action pill buttons */}
                  {m.quickActions && m.quickActions.length > 0 && (
                    <div
                      style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: '0.4rem',
                        marginTop: '0.5rem',
                        maxWidth: '92%'
                      }}
                    >
                      {m.quickActions.map((qa, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleQuickAction(qa.action)}
                          style={{
                            background: qa.action === 'report_incident' ? '#E6F2EB' : '#FFFFFF',
                            border: qa.action === 'report_incident' ? '1px solid #9BD5B3' : '1px solid #D9E4DD',
                            color: qa.action === 'report_incident' ? '#183D2D' : 'var(--text-main)',
                            fontWeight: qa.action === 'report_incident' ? 700 : 500,
                            padding: '0.35rem 0.75rem',
                            borderRadius: 'var(--radius-full)',
                            fontSize: '0.78rem',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.25rem',
                            transition: 'var(--transition-fast)'
                          }}
                        >
                          <span>{qa.label}</span>
                          <ChevronRight size={12} />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}

              {isTyping && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                  <Bot size={14} /> AI is thinking...
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Bar */}
            <form
              onSubmit={handleSend}
              style={{
                padding: '0.75rem 0.85rem',
                background: '#FFFFFF',
                borderTop: '1px solid #E2ECE5',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              <input
                type="text"
                className="form-control"
                placeholder="Ask AI or type symptoms..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                style={{
                  padding: '0.55rem 0.85rem',
                  fontSize: '0.85rem',
                  borderRadius: 'var(--radius-full)'
                }}
              />
              <button
                type="submit"
                className="btn btn-primary"
                style={{
                  width: '36px',
                  height: '36px',
                  padding: 0,
                  borderRadius: '50%',
                  flexShrink: 0
                }}
                title="Send Message"
              >
                <Send size={16} />
              </button>
            </form>
          </div>
        )}

        {/* Floating Toggle Button (Right Side Down Corner) */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          style={{
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            padding: 0,
            background: 'linear-gradient(135deg, var(--color-forest-dark) 0%, #204B38 100%)',
            color: '#FFFFFF',
            border: '2px solid rgba(255, 255, 255, 0.4)',
            boxShadow: '0 8px 24px rgba(24, 61, 45, 0.35)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s ease',
            transform: isOpen ? 'scale(0.95)' : 'scale(1)'
          }}
          title={isOpen ? "Close Assistant" : "AI Farm Assistant"}
        >
          <div
            style={{
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            {isOpen ? <X size={24} /> : <Bot size={24} />}
            {!isOpen && (
              <span
                style={{
                  position: 'absolute',
                  top: '-2px',
                  right: '-2px',
                  width: '10px',
                  height: '10px',
                  borderRadius: '50%',
                  background: '#10B981',
                  border: '1.5px solid #183D2D'
                }}
              />
            )}
          </div>
        </button>
      </div>

      {/* Global AI Incident Reporting Modal Triggered via ChatBot */}
      <PestIncidentModal
        isOpen={isIncidentModalOpen}
        onClose={() => setIsIncidentModalOpen(false)}
        farm={selectedFarm}
        crops={crops}
        fields={fields}
        onSaved={() => {
          setIsIncidentModalOpen(false);
          // Notify pests page if mounted
          window.dispatchEvent(new CustomEvent('pest-record-saved'));
        }}
      />
    </>
  );
}
