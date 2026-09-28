import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Sprout,
  SunMedium,
  Droplets,
  Wind,
  ArrowRight,
  ShieldCheck,
  Wheat,
  Activity,
  Thermometer,
  Clock,
  Compass,
  CheckCircle2,
  Cpu,
  Lock,
  X,
  LogIn,
  Sparkles
} from 'lucide-react';

export default function Home() {
  const navigate = useNavigate();
  const { user, login } = useAuth();
  const [activeHeroStyle, setActiveHeroStyle] = useState('radar'); // 'radar' | 'horizon' | 'bento' | 'luxury'
  
  // Sign In requirement modal states
  const [isSignInModalOpen, setIsSignInModalOpen] = useState(false);
  const [modalReason, setModalReason] = useState('access this feature');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const requireSignIn = (reason, callback) => {
    if (user) {
      if (callback) callback();
      else navigate('/dashboard');
    } else {
      setModalReason(reason || 'access the smart farmer workspace');
      setIsSignInModalOpen(true);
    }
  };

  const handle1ClickDemoLogin = async () => {
    setIsLoggingIn(true);
    try {
      await login('+919876543210', 'Password123!', '123456');
      setIsSignInModalOpen(false);
      navigate('/dashboard');
    } catch (err) {
      console.error('Demo login error:', err);
      navigate('/login');
    } finally {
      setIsLoggingIn(false);
    }
  };

  // Color grading precisely tuned to Fieldnote's signature palette from the dashboard
  const getCanvasBackground = () => {
    switch (activeHeroStyle) {
      case 'horizon':
        return 'linear-gradient(135deg, #1B4533 0%, #183D2D 45%, #0F2B1E 100%)';
      case 'bento':
        return 'linear-gradient(135deg, #183D2D 0%, #143526 50%, #0D261A 100%)';
      case 'luxury':
        return 'radial-gradient(ellipse at 80% 25%, #204E3A 0%, #183D2D 50%, #0F2B1E 100%)';
      case 'radar':
      default:
        // Signature British Racing Forest Green gradient from the Fieldnote Dashboard
        return 'linear-gradient(135deg, #183D2D 0%, #133526 50%, #0F2B1E 100%)';
    }
  };

  return (
    <div
      style={{
        width: '100vw',
        height: '100vh',
        maxHeight: '100vh',
        overflow: 'hidden',
        background: getCanvasBackground(),
        color: '#FFFFFF',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        boxSizing: 'border-box',
        transition: 'background 0.4s ease'
      }}
    >
      {/* =========================================================================
          AMBIENT ORGANIC GRAPHICS & ACCENT GLOW (MATCHING DASHBOARD BANNER)
          ========================================================================= */}
      {/* Concentric Organic Elevation Rings */}
      <div
        style={{
          position: 'absolute',
          right: '-80px',
          top: '-80px',
          width: '580px',
          height: '580px',
          borderRadius: '50%',
          border: '1px solid rgba(255, 255, 255, 0.05)',
          pointerEvents: 'none',
          zIndex: 1
        }}
      />
      <div
        style={{
          position: 'absolute',
          right: '40px',
          top: '20px',
          width: '380px',
          height: '380px',
          borderRadius: '50%',
          border: '1px solid rgba(162, 203, 181, 0.08)',
          pointerEvents: 'none',
          zIndex: 1
        }}
      />
      <div
        style={{
          position: 'absolute',
          right: '140px',
          top: '100px',
          width: '220px',
          height: '220px',
          borderRadius: '50%',
          border: '1px solid rgba(162, 203, 181, 0.06)',
          pointerEvents: 'none',
          zIndex: 1
        }}
      />

      {/* Warm Ambient Sage/Mint Lighting */}
      <div
        style={{
          position: 'absolute',
          top: '15%',
          right: '25%',
          width: '500px',
          height: '500px',
          background: 'radial-gradient(circle, rgba(162, 203, 181, 0.12) 0%, rgba(162, 203, 181, 0.02) 60%, transparent 70%)',
          pointerEvents: 'none',
          zIndex: 1
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: '0%',
          left: '5%',
          width: '450px',
          height: '450px',
          background: 'radial-gradient(circle, rgba(230, 242, 235, 0.06) 0%, transparent 65%)',
          pointerEvents: 'none',
          zIndex: 1
        }}
      />

      {/* =========================================================================
          FULL-BLEED TRANSLUCENT TOP NAVBAR (MATCHING FIELDNOTE BRANDING)
          ========================================================================= */}
      <header
        style={{
          flexShrink: 0,
          background: 'rgba(24, 61, 45, 0.75)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.09)',
          padding: '0.85rem 2.5rem',
          position: 'relative',
          zIndex: 50
        }}
      >
        <div style={{ maxWidth: '1440px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          {/* Brand Logo matching Dashboard Sidebar */}
          <div
            style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', cursor: 'pointer' }}
            onClick={() => navigate('/')}
          >
            <div style={{ background: '#E6F2EB', padding: '0.5rem', borderRadius: '10px', display: 'flex', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
              <Sprout size={22} color="#183D2D" />
            </div>
            <div>
              <div style={{ fontSize: '1.35rem', color: '#FFFFFF', fontWeight: 800, lineHeight: 1.05, letterSpacing: '-0.02em' }}>fieldnote</div>
              <div style={{ fontSize: '0.64rem', color: '#A2CBB5', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase' }}>
                SMART FARMER PLATFORM
              </div>
            </div>
          </div>

          {/* Style Switcher Bar in Header — requires sign in if unauthenticated */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              background: 'rgba(255, 255, 255, 0.08)',
              padding: '0.3rem 0.45rem',
              borderRadius: '9999px',
              border: '1px solid rgba(255, 255, 255, 0.12)'
            }}
            className="hidden-mobile"
          >
            <button
              type="button"
              onClick={() => {
                if (!user) {
                  requireSignIn('switch to the AgroPulse Radar agronomy theme');
                } else {
                  setActiveHeroStyle('radar');
                }
              }}
              style={{
                padding: '0.35rem 0.85rem',
                borderRadius: '9999px',
                fontSize: '0.75rem',
                fontWeight: 700,
                cursor: 'pointer',
                border: 'none',
                background: activeHeroStyle === 'radar' ? '#E6F2EB' : 'transparent',
                color: activeHeroStyle === 'radar' ? '#183D2D' : '#C2DEC8',
                transition: 'all 0.18s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem'
              }}
            >
              <Activity size={12} color={activeHeroStyle === 'radar' ? '#183D2D' : '#A2CBB5'} />
              <span>AgroPulse Radar</span>
            </button>

            <button
              type="button"
              onClick={() => {
                if (!user) {
                  requireSignIn('switch to the Topographic Horizon theme');
                } else {
                  setActiveHeroStyle('horizon');
                }
              }}
              style={{
                padding: '0.35rem 0.85rem',
                borderRadius: '9999px',
                fontSize: '0.75rem',
                fontWeight: 700,
                cursor: 'pointer',
                border: 'none',
                background: activeHeroStyle === 'horizon' ? '#E6F2EB' : 'transparent',
                color: activeHeroStyle === 'horizon' ? '#183D2D' : '#C2DEC8',
                transition: 'all 0.18s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem'
              }}
            >
              <SunMedium size={12} color={activeHeroStyle === 'horizon' ? '#183D2D' : '#A2CBB5'} />
              <span>Topographic Horizon</span>
            </button>

            <button
              type="button"
              onClick={() => {
                if (!user) {
                  requireSignIn('switch to the Bento Command cockpit theme');
                } else {
                  setActiveHeroStyle('bento');
                }
              }}
              style={{
                padding: '0.35rem 0.85rem',
                borderRadius: '9999px',
                fontSize: '0.75rem',
                fontWeight: 700,
                cursor: 'pointer',
                border: 'none',
                background: activeHeroStyle === 'bento' ? '#E6F2EB' : 'transparent',
                color: activeHeroStyle === 'bento' ? '#183D2D' : '#C2DEC8',
                transition: 'all 0.18s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem'
              }}
            >
              <Cpu size={12} color={activeHeroStyle === 'bento' ? '#183D2D' : '#A2CBB5'} />
              <span>Bento Command</span>
            </button>

            <button
              type="button"
              onClick={() => {
                if (!user) {
                  requireSignIn('switch to the Botanical Luxury estate theme');
                } else {
                  setActiveHeroStyle('luxury');
                }
              }}
              style={{
                padding: '0.35rem 0.85rem',
                borderRadius: '9999px',
                fontSize: '0.75rem',
                fontWeight: 700,
                cursor: 'pointer',
                border: 'none',
                background: activeHeroStyle === 'luxury' ? '#E6F2EB' : 'transparent',
                color: activeHeroStyle === 'luxury' ? '#183D2D' : '#C2DEC8',
                transition: 'all 0.18s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem'
              }}
            >
              <Sprout size={12} color={activeHeroStyle === 'luxury' ? '#183D2D' : '#A2CBB5'} />
              <span>Botanical Luxury</span>
            </button>
          </div>

          {/* Auth Actions with Mint and Dark Green Accents */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            {user ? (
              <button
                type="button"
                onClick={() => navigate('/dashboard')}
                style={{
                  background: '#E6F2EB',
                  color: '#183D2D',
                  border: '1px solid #C8E2D3',
                  padding: '0.6rem 1.4rem',
                  borderRadius: '12px',
                  fontWeight: 800,
                  fontSize: '0.86rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  boxShadow: '0 4px 12px rgba(15, 43, 30, 0.25)'
                }}
              >
                <span>Go to Dashboard</span>
                <ArrowRight size={15} color="#183D2D" />
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => requireSignIn('sign in to your farmer dashboard')}
                  style={{
                    background: 'rgba(255, 255, 255, 0.08)',
                    color: '#FFFFFF',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    padding: '0.55rem 1.15rem',
                    borderRadius: '12px',
                    fontWeight: 700,
                    fontSize: '0.86rem',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/register')}
                  style={{
                    background: '#E6F2EB',
                    color: '#183D2D',
                    border: '1px solid #C8E2D3',
                    padding: '0.6rem 1.35rem',
                    borderRadius: '12px',
                    fontWeight: 800,
                    fontSize: '0.86rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.45rem',
                    boxShadow: '0 4px 14px rgba(15, 43, 30, 0.25)'
                  }}
                >
                  <span>Get Started</span>
                  <ArrowRight size={14} color="#183D2D" />
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* =========================================================================
          FULL-SCREEN HERO VIEWPORT
          ========================================================================= */}
      <main
        style={{
          flex: 1,
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '1.5rem 3rem',
          maxWidth: '1440px',
          width: '100%',
          margin: '0 auto',
          position: 'relative',
          zIndex: 10,
          boxSizing: 'border-box'
        }}
      >
        {/* =========================================================================
            VARIANT 1: AGROPULSE RADAR (EXACT DASHBOARD GRADING)
            ========================================================================= */}
        {activeHeroStyle === 'radar' && (
          <div
            style={{
              width: '100%',
              display: 'grid',
              gridTemplateColumns: 'minmax(0, 1.35fr) minmax(0, 1fr)',
              gap: 'clamp(2rem, 4vw, 4.5rem)',
              alignItems: 'center',
              boxSizing: 'border-box'
            }}
          >
            {/* Left Column: Vision & CTAs */}
            <div>
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.55rem',
                  background: 'rgba(230, 242, 235, 0.12)',
                  padding: '0.45rem 1rem',
                  borderRadius: '9999px',
                  border: '1px solid rgba(162, 203, 181, 0.3)',
                  marginBottom: '1.25rem',
                  cursor: 'pointer'
                }}
                onClick={() => requireSignIn('view live parcel telemetry')}
              >
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#A2CBB5', boxShadow: '0 0 8px #A2CBB5' }} />
                <span style={{ fontSize: '0.76rem', fontWeight: 800, color: '#A2CBB5', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
                  FIELD PULSE • GREEN VALLEY AGRO
                </span>
              </div>

              <h1
                style={{
                  fontSize: 'clamp(2.5rem, 4.2vw, 3.85rem)',
                  fontWeight: 800,
                  color: '#FFFFFF',
                  lineHeight: 1.08,
                  marginBottom: '1.1rem',
                  letterSpacing: '-0.03em'
                }}
              >
                Smarter soil, <br />
                <span style={{ color: '#A2CBB5' }}>resilient harvest.</span>
              </h1>

              <p
                style={{
                  fontSize: 'clamp(0.98rem, 1.25vw, 1.15rem)',
                  color: '#C2DEC8',
                  lineHeight: 1.6,
                  marginBottom: '2.25rem',
                  maxWidth: '560px'
                }}
              >
                Small signals become better decisions when they are all in one place. Real-time soil telemetry, microclimate forecasts, and autonomous agronomy recommendations in one unified cockpit.
              </p>

              {/* Primary Action Buttons */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.9rem', flexWrap: 'wrap', marginBottom: '1.75rem' }}>
                <button
                  type="button"
                  onClick={() => requireSignIn('launch the live demo farm')}
                  style={{
                    background: '#E6F2EB',
                    color: '#183D2D',
                    fontWeight: 800,
                    fontSize: '0.98rem',
                    padding: '0.9rem 1.85rem',
                    borderRadius: '14px',
                    border: '1px solid #C8E2D3',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    boxShadow: '0 8px 24px rgba(15, 43, 30, 0.35)',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <span>Launch Live Demo</span>
                  <ArrowRight size={17} color="#183D2D" />
                </button>

                <button
                  type="button"
                  onClick={() => navigate('/register')}
                  style={{
                    background: 'rgba(255, 255, 255, 0.08)',
                    backdropFilter: 'blur(10px)',
                    color: '#FFFFFF',
                    fontWeight: 700,
                    fontSize: '0.98rem',
                    padding: '0.9rem 1.65rem',
                    borderRadius: '14px',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <Compass size={17} color="#A2CBB5" />
                  <span>Create Farm Account</span>
                </button>
              </div>

              {/* Trust Badges */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '1.75rem', color: '#C2DEC8', fontSize: '0.84rem', fontWeight: 600 }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                  <ShieldCheck size={17} color="#A2CBB5" />
                  Offline Built-in Engine
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                  <Lock size={16} color="#A2CBB5" />
                  Native Agro Telemetry
                </span>
              </div>
            </div>

            {/* Right Column: Sleek Frosted HUD Widget */}
            <div
              style={{ cursor: 'pointer' }}
              onClick={() => requireSignIn('view live sensor metrics and health indicators')}
              title="Click to sign in and inspect full telemetry"
            >
              <div
                style={{
                  background: 'rgba(255, 255, 255, 0.08)',
                  backdropFilter: 'blur(20px)',
                  WebkitBackdropFilter: 'blur(20px)',
                  borderRadius: '24px',
                  border: '1px solid rgba(255, 255, 255, 0.16)',
                  padding: 'clamp(1.5rem, 3vh, 2.25rem) clamp(1.6rem, 2.5vw, 2.25rem)',
                  boxShadow: '0 20px 45px rgba(15, 43, 30, 0.3)',
                  transition: 'transform 0.2s ease, border-color 0.2s ease'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.35rem', borderBottom: '1px solid rgba(255, 255, 255, 0.1)', paddingBottom: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                    <div style={{ background: '#E6F2EB', padding: '0.45rem', borderRadius: '10px', display: 'flex' }}>
                      <Wheat size={18} color="#183D2D" />
                    </div>
                    <div>
                      <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#FFFFFF' }}>Field Health Index</div>
                      <div style={{ fontSize: '0.76rem', color: '#C2DEC8' }}>Green Valley Agro • Plot A & B</div>
                    </div>
                  </div>
                  <span style={{ background: '#E6F2EB', color: '#183D2D', fontSize: '0.78rem', fontWeight: 800, padding: '0.3rem 0.8rem', borderRadius: '9999px', border: '1px solid #C8E2D3' }}>
                    Healthy
                  </span>
                </div>

                {/* Micro Telemetry Metrics */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.9rem', marginBottom: '1.25rem' }}>
                  <div style={{ background: 'rgba(255, 255, 255, 0.07)', padding: '0.95rem', borderRadius: '14px', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#D97706', fontSize: '0.74rem', fontWeight: 700 }}>
                      <Droplets size={14} />
                      <span>Moisture</span>
                    </div>
                    <div style={{ fontSize: '1.45rem', fontWeight: 800, color: '#FFFFFF', margin: '0.3rem 0 0.1rem 0' }}>18.5%</div>
                    <span style={{ fontSize: '0.72rem', color: '#F8DFDB', background: 'rgba(224, 83, 60, 0.25)', padding: '0.15rem 0.45rem', borderRadius: '4px', fontWeight: 600 }}>Needs drip</span>
                  </div>

                  <div style={{ background: 'rgba(255, 255, 255, 0.07)', padding: '0.95rem', borderRadius: '14px', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#A2CBB5', fontSize: '0.74rem', fontWeight: 700 }}>
                      <Thermometer size={14} />
                      <span>Air Temp</span>
                    </div>
                    <div style={{ fontSize: '1.45rem', fontWeight: 800, color: '#FFFFFF', margin: '0.3rem 0 0.1rem 0' }}>24.8°C</div>
                    <span style={{ fontSize: '0.72rem', color: '#C2DEC8' }}>Normal</span>
                  </div>

                  <div style={{ background: 'rgba(255, 255, 255, 0.07)', padding: '0.95rem', borderRadius: '14px', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#A2CBB5', fontSize: '0.74rem', fontWeight: 700 }}>
                      <Wind size={14} />
                      <span>Humidity</span>
                    </div>
                    <div style={{ fontSize: '1.45rem', fontWeight: 800, color: '#FFFFFF', margin: '0.3rem 0 0.1rem 0' }}>64%</div>
                    <span style={{ fontSize: '0.72rem', color: '#C2DEC8' }}>Stable</span>
                  </div>
                </div>

                {/* Golden Window Advice */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', background: 'rgba(255, 255, 255, 0.07)', border: '1px solid rgba(162, 203, 181, 0.25)', padding: '0.9rem 1.15rem', borderRadius: '14px' }}>
                  <Clock size={18} color="#A2CBB5" />
                  <span style={{ fontSize: '0.84rem', color: '#C2DEC8', lineHeight: 1.45 }}>
                    <strong style={{ color: '#FFFFFF' }}>Next action:</strong> 35mm drip cycle recommended at <strong style={{ color: '#E6F2EB' }}>4:30 PM</strong> before peak evaporative loss.
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            VARIANT 2: TOPOGRAPHIC HORIZON
            ========================================================================= */}
        {activeHeroStyle === 'horizon' && (
          <div style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '3rem', boxSizing: 'border-box' }}>
            <div style={{ maxWidth: '720px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
                <span style={{ background: '#E6F2EB', color: '#183D2D', fontSize: '0.75rem', fontWeight: 800, padding: '0.3rem 0.75rem', borderRadius: '6px', border: '1px solid #C8E2D3' }}>
                  SEASON PROGRESS
                </span>
                <span style={{ color: '#C2DEC8', fontSize: '0.86rem', fontWeight: 600 }}>
                  🌾 Maize & Tomato Harvest Cycle • Day 48 of 120
                </span>
              </div>

              <h1 style={{ fontSize: 'clamp(2.4rem, 4vw, 3.6rem)', fontWeight: 800, color: '#FFFFFF', lineHeight: 1.12, marginBottom: '1rem', letterSpacing: '-0.025em' }}>
                Wake up to clarity across <br />
                <span style={{ color: '#A2CBB5' }}>every acre you steward.</span>
              </h1>

              <p style={{ fontSize: 'clamp(0.95rem, 1.2vw, 1.1rem)', color: '#C2DEC8', lineHeight: 1.6, marginBottom: '2rem' }}>
                Precision farming built for actual fieldwork. Monitor microclimates, plan irrigation timing, and shield crops against early infestations.
              </p>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.9rem', marginBottom: '1.75rem', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  onClick={() => requireSignIn('enter the demo farm')}
                  style={{
                    background: '#E6F2EB',
                    color: '#183D2D',
                    fontWeight: 800,
                    fontSize: '0.95rem',
                    padding: '0.85rem 1.75rem',
                    borderRadius: '14px',
                    border: '1px solid #C8E2D3',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.45rem',
                    boxShadow: '0 6px 20px rgba(15, 43, 30, 0.35)'
                  }}
                >
                  <span>Enter Demo Farm</span>
                  <ArrowRight size={16} color="#183D2D" />
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/register')}
                  style={{
                    background: 'rgba(255, 255, 255, 0.08)',
                    color: '#FFFFFF',
                    fontWeight: 700,
                    fontSize: '0.95rem',
                    padding: '0.85rem 1.6rem',
                    borderRadius: '14px',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    cursor: 'pointer'
                  }}
                >
                  Register Farm
                </button>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', background: 'rgba(255, 255, 255, 0.08)', padding: '0.45rem 0.95rem', borderRadius: '9999px', fontSize: '0.82rem', color: '#E4F2E9' }}>
                  <CheckCircle2 size={16} color="#A2CBB5" />
                  <span>2 Managed Parcels</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', background: 'rgba(255, 255, 255, 0.08)', padding: '0.45rem 0.95rem', borderRadius: '9999px', fontSize: '0.82rem', color: '#E4F2E9' }}>
                  <SunMedium size={16} color="#A2CBB5" />
                  <span>+24.8°C Clear Sunlight</span>
                </div>
              </div>
            </div>

            {/* Climate Widget */}
            <div
              style={{
                background: 'rgba(255, 255, 255, 0.08)',
                backdropFilter: 'blur(20px)',
                borderRadius: '24px',
                border: '1px solid rgba(255, 255, 255, 0.16)',
                padding: '2rem 2.5rem',
                minWidth: '280px',
                textAlign: 'center',
                boxShadow: '0 16px 40px rgba(15, 43, 30, 0.3)',
                cursor: 'pointer'
              }}
              onClick={() => requireSignIn('view real-time atmospheric telemetry')}
            >
              <div style={{ fontSize: '0.78rem', fontWeight: 800, color: '#A2CBB5', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                ATMOSPHERIC TELEMETRY
              </div>
              <div style={{ fontSize: '3.4rem', fontWeight: 800, color: '#FFFFFF', lineHeight: 1 }}>
                24.8°C
              </div>
              <div style={{ fontSize: '0.9rem', color: '#C2DEC8', margin: '0.5rem 0 1.5rem 0' }}>
                Fresno, CA • Humidity 64%
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  requireSignIn('explore interactive weather radar');
                }}
                style={{
                  width: '100%',
                  background: '#E6F2EB',
                  color: '#183D2D',
                  border: '1px solid #C8E2D3',
                  borderRadius: '12px',
                  padding: '0.75rem 1rem',
                  fontSize: '0.88rem',
                  fontWeight: 800,
                  cursor: 'pointer'
                }}
              >
                Explore Weather Radar
              </button>
            </div>
          </div>
        )}

        {/* =========================================================================
            VARIANT 3: BENTO COMMAND
            ========================================================================= */}
        {activeHeroStyle === 'bento' && (
          <div style={{ width: '100%', display: 'grid', gridTemplateColumns: 'minmax(0, 1.8fr) minmax(0, 1.2fr)', gap: '1.75rem', boxSizing: 'border-box' }}>
            <div
              style={{
                background: 'rgba(255, 255, 255, 0.08)',
                backdropFilter: 'blur(20px)',
                borderRadius: '24px',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                padding: '2.75rem',
                color: '#FFFFFF',
                boxShadow: '0 20px 45px rgba(15, 43, 30, 0.25)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between'
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                  <span style={{ background: '#E6F2EB', color: '#183D2D', fontSize: '0.75rem', fontWeight: 800, padding: '0.25rem 0.7rem', borderRadius: '6px' }}>
                    SMART COCKPIT
                  </span>
                  <span style={{ fontSize: '0.82rem', color: '#A2CBB5' }}>Fieldnote Engine v2.4</span>
                </div>

                <h1 style={{ fontSize: 'clamp(2.2rem, 3.2vw, 3rem)', fontWeight: 800, color: '#FFFFFF', lineHeight: 1.15, marginBottom: '0.85rem', letterSpacing: '-0.02em' }}>
                  Precision farming, simplified.
                </h1>
                <p style={{ fontSize: '1.02rem', color: '#C2DEC8', lineHeight: 1.6, maxWidth: '500px' }}>
                  Connect soil moisture sensors, manage plot boundaries, and leverage AI agronomy models to elevate yield efficiency.
                </p>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.9rem', marginTop: '2.25rem' }}>
                <button
                  type="button"
                  onClick={() => requireSignIn('launch demo farm dashboard')}
                  style={{
                    background: '#E6F2EB',
                    color: '#183D2D',
                    fontWeight: 800,
                    fontSize: '0.92rem',
                    padding: '0.8rem 1.6rem',
                    borderRadius: '12px',
                    border: '1px solid #C8E2D3',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.45rem'
                  }}
                >
                  <Wheat size={16} />
                  <span>Launch Demo Farm</span>
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/register')}
                  style={{
                    background: 'rgba(255, 255, 255, 0.08)',
                    color: '#FFFFFF',
                    fontWeight: 700,
                    fontSize: '0.92rem',
                    padding: '0.8rem 1.45rem',
                    borderRadius: '12px',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    cursor: 'pointer'
                  }}
                >
                  Sign Up Free
                </button>
              </div>
            </div>

            <div
              style={{
                background: 'rgba(255, 255, 255, 0.08)',
                backdropFilter: 'blur(20px)',
                borderRadius: '24px',
                padding: '2.5rem',
                border: '1px solid rgba(255, 255, 255, 0.16)',
                boxShadow: '0 20px 45px rgba(15, 43, 30, 0.25)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                cursor: 'pointer'
              }}
              onClick={() => requireSignIn('inspect active moisture notifications')}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#A2CBB5', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                    ACTIVE NOTICE
                  </span>
                  <span style={{ background: '#FFF1F0', color: '#E0533C', fontSize: '0.75rem', fontWeight: 800, padding: '0.25rem 0.65rem', borderRadius: '9999px', border: '1px solid #F8DFDB' }}>
                    HIGH PRIORITY
                  </span>
                </div>

                <h3 style={{ fontSize: '1.4rem', color: '#FFFFFF', fontWeight: 800, marginBottom: '0.5rem' }}>
                  Low Moisture in North Plot A
                </h3>
                <p style={{ fontSize: '0.92rem', color: '#C2DEC8', lineHeight: 1.55 }}>
                  Sensor IOT-SM-001 reading is 18.5%. Tasseling stage requires 35mm irrigation immediately.
                </p>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '1.75rem', paddingTop: '1.25rem', borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', color: '#FFFFFF', fontWeight: 700, fontSize: '0.95rem' }}>
                  <Droplets size={18} color="#A2CBB5" />
                  <span>35mm Drip Cycle</span>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    requireSignIn('review in-app irrigation actions');
                  }}
                  style={{
                    background: '#E6F2EB',
                    color: '#183D2D',
                    border: '1px solid #C8E2D3',
                    borderRadius: '10px',
                    padding: '0.55rem 1.15rem',
                    fontSize: '0.84rem',
                    fontWeight: 800,
                    cursor: 'pointer'
                  }}
                >
                  Review In App
                </button>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            VARIANT 4: BOTANICAL LUXURY
            ========================================================================= */}
        {activeHeroStyle === 'luxury' && (
          <div style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative', zIndex: 1, flexWrap: 'wrap', gap: '3rem', boxSizing: 'border-box' }}>
            <div style={{ position: 'absolute', right: '5%', top: '-10%', opacity: 0.08, pointerEvents: 'none' }}>
              <Sprout size={320} color="#A2CBB5" />
            </div>

            <div style={{ maxWidth: '680px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.1rem' }}>
                <span style={{ color: '#A2CBB5', fontSize: '0.82rem', fontWeight: 800, letterSpacing: '0.15em', textTransform: 'uppercase' }}>
                  FIELDNOTE AGRONOMY SUITE
                </span>
                <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#A2CBB5' }} />
                <span style={{ color: '#C2DEC8', fontSize: '0.82rem', fontWeight: 600 }}>Estate Edition</span>
              </div>

              <h1 style={{ fontSize: 'clamp(2.5rem, 4vw, 3.8rem)', fontWeight: 700, color: '#FFFFFF', lineHeight: 1.12, marginBottom: '1rem', letterSpacing: '-0.02em', fontFamily: 'serif' }}>
                Cultivating wisdom <br />
                <span style={{ color: '#A2CBB5', fontStyle: 'italic' }}>from seed to harvest.</span>
              </h1>

              <p style={{ fontSize: 'clamp(0.95rem, 1.2vw, 1.15rem)', color: '#D2E3D8', lineHeight: 1.6, maxWidth: '560px', marginBottom: '2.25rem' }}>
                Empowering regenerative growth across 45 pristine acres with closed-loop telemetry and continuous biological modeling.
              </p>

              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <button
                  type="button"
                  onClick={() => requireSignIn('launch agronomic dossier')}
                  style={{
                    background: '#E6F2EB',
                    color: '#183D2D',
                    fontWeight: 800,
                    fontSize: '0.95rem',
                    padding: '0.85rem 1.85rem',
                    borderRadius: '12px',
                    border: '1px solid #C8E2D3',
                    cursor: 'pointer',
                    boxShadow: '0 8px 24px rgba(15, 43, 30, 0.35)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}
                >
                  <span>Launch Agronomic Dossier</span>
                  <ArrowRight size={16} color="#183D2D" />
                </button>
              </div>
            </div>

            <div
              style={{
                borderLeft: '1px solid rgba(162, 203, 181, 0.25)',
                paddingLeft: '3rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '2rem',
                cursor: 'pointer'
              }}
              onClick={() => requireSignIn('view estate parcel biomass')}
            >
              <div>
                <span style={{ color: '#A2CBB5', fontSize: '0.78rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase' }}>ESTATE PARCELS</span>
                <div style={{ fontSize: '2.6rem', fontWeight: 800, color: '#FFFFFF' }}>2 Properties</div>
              </div>
              <div>
                <span style={{ color: '#A2CBB5', fontSize: '0.78rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase' }}>BIOMASS STATUS</span>
                <div style={{ fontSize: '2.6rem', fontWeight: 800, color: '#E6F2EB' }}>Optimal</div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* =========================================================================
          FULL-BLEED TRANSLUCENT BOTTOM BAR
          ========================================================================= */}
      <footer
        style={{
          flexShrink: 0,
          background: 'rgba(15, 43, 30, 0.85)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          padding: '0.7rem 2.5rem',
          position: 'relative',
          zIndex: 50
        }}
      >
        <div style={{ maxWidth: '1440px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            {/* Matches Image 2's signature badge */}
            <span style={{ background: '#E6F2EB', color: '#183D2D', fontSize: '0.72rem', fontWeight: 800, padding: '0.2rem 0.65rem', borderRadius: '6px', border: '1px solid #C8E2D3' }}>
              EVALUATION ACCESS
            </span>
            <span style={{ fontSize: '0.82rem', color: '#C2DEC8' }}>
              Demo Farmer: <strong style={{ color: '#FFFFFF' }}>+91 98765 43210</strong> &nbsp;•&nbsp; Password: <strong style={{ color: '#FFFFFF' }}>Password123!</strong>
            </span>
            <button
              type="button"
              onClick={() => requireSignIn('sign in with demo farmer credentials')}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#A2CBB5',
                fontSize: '0.82rem',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.3rem',
                textDecoration: 'underline'
              }}
            >
              <span>1-Click Sign In</span>
              <ArrowRight size={13} color="#A2CBB5" />
            </button>
          </div>

          <div style={{ fontSize: '0.78rem', color: '#A2CBB5', display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
            <Sprout size={14} color="#A2CBB5" />
            <span>fieldnote © 2026 Intelligent Agronomy OS</span>
          </div>
        </div>
      </footer>

      {/* =========================================================================
          SIGN IN PROMPT MODAL (SHOWN WHEN USER CLICKS ANY THEME / ACTION)
          ========================================================================= */}
      {isSignInModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(8, 24, 16, 0.75)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1.5rem',
            zIndex: 9999
          }}
          onClick={() => setIsSignInModalOpen(false)}
        >
          <div
            style={{
              width: '100%',
              maxWidth: 480,
              background: 'linear-gradient(145deg, rgba(24, 61, 45, 0.95) 0%, rgba(15, 43, 30, 0.98) 100%)',
              border: '1px solid rgba(162, 203, 181, 0.28)',
              borderRadius: '24px',
              padding: '2.5rem 2.25rem',
              boxShadow: '0 24px 60px rgba(0, 0, 0, 0.5)',
              position: 'relative',
              color: '#FFFFFF'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              type="button"
              onClick={() => setIsSignInModalOpen(false)}
              style={{
                position: 'absolute',
                top: '1.25rem',
                right: '1.25rem',
                background: 'rgba(255, 255, 255, 0.08)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                borderRadius: '50%',
                width: 32,
                height: 32,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#C2DEC8',
                cursor: 'pointer'
              }}
            >
              <X size={16} />
            </button>

            {/* Modal Header */}
            <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
              <div
                style={{
                  display: 'inline-flex',
                  background: '#E6F2EB',
                  padding: '0.8rem',
                  borderRadius: '16px',
                  marginBottom: '1rem',
                  boxShadow: '0 4px 14px rgba(0,0,0,0.2)'
                }}
              >
                <Sprout size={32} color="#183D2D" />
              </div>
              <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#FFFFFF', letterSpacing: '-0.02em', marginBottom: '0.35rem' }}>
                Farmer Sign In Required
              </h2>
              <p style={{ color: '#C2DEC8', fontSize: '0.88rem', lineHeight: 1.5 }}>
                Please sign in to {modalReason}, interact with telemetry feeds, and access farm fields.
              </p>
            </div>

            {/* Quick 1-Click Demo Login Button */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <button
                type="button"
                onClick={handle1ClickDemoLogin}
                disabled={isLoggingIn}
                style={{
                  width: '100%',
                  background: '#E6F2EB',
                  color: '#183D2D',
                  border: '1px solid #C8E2D3',
                  borderRadius: '14px',
                  padding: '0.9rem',
                  fontSize: '0.95rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  boxShadow: '0 6px 20px rgba(15, 43, 30, 0.35)',
                  transition: 'all 0.15s ease'
                }}
              >
                <Sparkles size={18} color="#183D2D" />
                <span>{isLoggingIn ? 'Authenticating Session...' : '⚡ 1-Click Demo Sign In (Instant Access)'}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsSignInModalOpen(false);
                  navigate('/login');
                }}
                style={{
                  width: '100%',
                  background: 'rgba(255, 255, 255, 0.08)',
                  color: '#FFFFFF',
                  border: '1px solid rgba(255, 255, 255, 0.22)',
                  borderRadius: '14px',
                  padding: '0.85rem',
                  fontSize: '0.92rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem'
                }}
              >
                <LogIn size={16} color="#A2CBB5" />
                <span>Sign In with Phone Number (+91)</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsSignInModalOpen(false);
                  navigate('/register');
                }}
                style={{
                  width: '100%',
                  background: 'transparent',
                  color: '#A2CBB5',
                  border: 'none',
                  padding: '0.55rem',
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  textDecoration: 'underline'
                }}
              >
                Don't have an account? Create Farm Account
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
