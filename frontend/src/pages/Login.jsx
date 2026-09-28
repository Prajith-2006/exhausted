import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import {
  Sprout,
  Phone,
  User,
  Globe,
  AlertCircle,
  KeyRound,
  CheckCircle2,
  ArrowLeft,
  RefreshCw,
  ShieldCheck,
  ArrowRight,
  Sparkles
} from 'lucide-react';

export function Login() {
  const { sendOtp, login } = useAuth();
  const navigate = useNavigate();

  const [phoneNumber, setPhoneNumber] = useState('9876543210');
  const [otp, setOtp] = useState('');
  
  const [step, setStep] = useState(1); // 1 = Phone Number, 2 = Enter OTP
  const [error, setError] = useState('');
  const [infoMsg, setInfoMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [demoOtp, setDemoOtp] = useState('');

  const getFullPhone = () => {
    let cleanNum = phoneNumber.trim().replace(/\D/g, '');
    if (cleanNum.startsWith('91') && cleanNum.length === 12) {
      return '+' + cleanNum;
    }
    return '+91' + cleanNum;
  };

  const validateIndianPhone = (numStr) => {
    const cleanDigits = numStr.trim().replace(/\D/g, '');
    if (cleanDigits.length === 10 || (cleanDigits.length === 12 && cleanDigits.startsWith('91'))) {
      return true;
    }
    return false;
  };

  const handleSendOtp = async (e) => {
    if (e) e.preventDefault();
    setError('');
    setInfoMsg('');
    setLoading(true);

    if (!validateIndianPhone(phoneNumber)) {
      setError('Please enter a valid 10-digit Indian mobile number (e.g. 9876543210).');
      setLoading(false);
      return;
    }

    const fullPhone = getFullPhone();

    try {
      const res = await sendOtp(fullPhone);
      setDemoOtp(res.otp || '123456');
      setStep(2);
      setInfoMsg(`OTP verification code sent to Indian mobile number ${fullPhone}!`);
    } catch (err) {
      setError(err.message || 'Failed to send OTP code.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    if (e) e.preventDefault();
    setError('');
    setLoading(true);

    if (!otp || otp.length !== 6) {
      setError('Please enter the 6-digit OTP code.');
      setLoading(false);
      return;
    }

    try {
      const fullPhone = getFullPhone();
      await login(fullPhone, undefined, otp);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Invalid OTP verification code.');
    } finally {
      setLoading(false);
    }
  };

  const handleAutoFillDemo = () => {
    setPhoneNumber('9876543210');
    setError('');
  };

  return (
    <div
      style={{
        width: '100vw',
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #183D2D 0%, #133526 50%, #0F2B1E 100%)',
        color: '#FFFFFF',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem 1.5rem',
        position: 'relative',
        overflow: 'hidden',
        boxSizing: 'border-box'
      }}
    >
      {/* Background Concentric Elevation Rings matching Home & Dashboard */}
      <div
        style={{
          position: 'absolute',
          right: '-10vw',
          top: '-10vh',
          width: '60vw',
          height: '60vw',
          maxWidth: '750px',
          maxHeight: '750px',
          borderRadius: '50%',
          border: '1px solid rgba(255, 255, 255, 0.05)',
          pointerEvents: 'none',
          zIndex: 1
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: '-10vw',
          bottom: '-10vh',
          width: '50vw',
          height: '50vw',
          maxWidth: '650px',
          maxHeight: '650px',
          borderRadius: '50%',
          border: '1px solid rgba(162, 203, 181, 0.06)',
          pointerEvents: 'none',
          zIndex: 1
        }}
      />
      <div
        style={{
          position: 'absolute',
          top: '20%',
          right: '20%',
          width: '450px',
          height: '450px',
          background: 'radial-gradient(circle, rgba(162, 203, 181, 0.12) 0%, transparent 65%)',
          pointerEvents: 'none',
          zIndex: 1
        }}
      />

      {/* Top Back Link */}
      <div style={{ position: 'relative', zIndex: 10, width: '100%', maxWidth: 460, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <button
          type="button"
          onClick={() => navigate('/')}
          style={{
            background: 'rgba(255, 255, 255, 0.08)',
            border: '1px solid rgba(255, 255, 255, 0.16)',
            borderRadius: '10px',
            padding: '0.45rem 0.9rem',
            color: '#C2DEC8',
            fontSize: '0.82rem',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            transition: 'all 0.15s ease'
          }}
        >
          <ArrowLeft size={14} color="#A2CBB5" />
          <span>Back to fieldnote Home</span>
        </button>

        <span style={{ fontSize: '0.74rem', color: '#A2CBB5', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
          SECURE FARMER ACCESS
        </span>
      </div>

      {/* Frosted Glassmorphic Sign-In Card */}
      <div
        style={{
          width: '100%',
          maxWidth: 460,
          background: 'rgba(255, 255, 255, 0.08)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          border: '1px solid rgba(255, 255, 255, 0.16)',
          borderRadius: '24px',
          padding: '2.5rem 2.25rem',
          boxShadow: '0 24px 60px rgba(15, 43, 30, 0.45)',
          position: 'relative',
          zIndex: 10,
          boxSizing: 'border-box'
        }}
      >
        {/* Brand Header */}
        <div style={{ textAlign: 'center', marginBottom: '1.85rem' }}>
          <div
            style={{
              display: 'inline-flex',
              background: '#E6F2EB',
              padding: '0.85rem',
              borderRadius: '16px',
              marginBottom: '0.9rem',
              boxShadow: '0 4px 14px rgba(0, 0, 0, 0.15)'
            }}
          >
            <Sprout size={32} color="#183D2D" />
          </div>
          <h1 style={{ fontSize: '1.95rem', fontWeight: 800, color: '#FFFFFF', letterSpacing: '-0.025em', marginBottom: '0.35rem' }}>
            Farmer Sign In
          </h1>
          <p style={{ color: '#C2DEC8', fontSize: '0.88rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem' }}>
            <span>🇮🇳</span>
            <span>Indian Farmers OTP Access (+91)</span>
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div
            style={{
              background: 'rgba(224, 83, 60, 0.2)',
              border: '1px solid rgba(224, 83, 60, 0.4)',
              color: '#F8DFDB',
              padding: '0.75rem 1rem',
              borderRadius: '12px',
              marginBottom: '1.25rem',
              fontSize: '0.85rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            <AlertCircle size={17} color="#F8DFDB" />
            <span>{error}</span>
          </div>
        )}

        {/* Info & Demo OTP Box */}
        {infoMsg && step === 2 && (
          <div
            style={{
              background: 'rgba(230, 242, 235, 0.14)',
              border: '1px solid rgba(162, 203, 181, 0.35)',
              color: '#FFFFFF',
              padding: '0.85rem 1rem',
              borderRadius: '12px',
              marginBottom: '1.25rem',
              fontSize: '0.85rem'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
              <CheckCircle2 size={17} color="#A2CBB5" />
              <span>{infoMsg}</span>
            </div>
            {demoOtp && (
              <div
                style={{
                  marginTop: '0.65rem',
                  paddingTop: '0.65rem',
                  borderTop: '1px dashed rgba(162, 203, 181, 0.25)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}
              >
                <span style={{ fontSize: '0.82rem', color: '#C2DEC8' }}>
                  Demo OTP Code: <strong style={{ color: '#FFFFFF', letterSpacing: '2px', fontSize: '0.95rem' }}>{demoOtp}</strong>
                </span>
                <button
                  type="button"
                  onClick={() => setOtp(demoOtp)}
                  style={{
                    background: '#E6F2EB',
                    color: '#183D2D',
                    border: 'none',
                    padding: '0.25rem 0.65rem',
                    borderRadius: '6px',
                    fontSize: '0.75rem',
                    cursor: 'pointer',
                    fontWeight: 800
                  }}
                >
                  Auto-fill OTP
                </button>
              </div>
            )}
          </div>
        )}

        {step === 1 ? (
          <form onSubmit={handleSendOtp}>
            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 800, color: '#C2DEC8', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                Indian Mobile Number (+91)
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                {/* Prefix Badge */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    padding: '0.75rem 0.85rem',
                    background: 'rgba(230, 242, 235, 0.14)',
                    border: '1px solid rgba(162, 203, 181, 0.3)',
                    borderRadius: '12px',
                    fontWeight: 800,
                    fontSize: '0.92rem',
                    color: '#FFFFFF'
                  }}
                >
                  <span>🇮🇳</span>
                  <span>+91</span>
                </div>

                <div style={{ position: 'relative', flex: 1 }}>
                  <Phone size={17} style={{ position: 'absolute', left: '0.9rem', top: '50%', transform: 'translateY(-50%)', color: '#A2CBB5' }} />
                  <input
                    type="tel"
                    maxLength={10}
                    style={{
                      width: '100%',
                      padding: '0.75rem 1rem 0.75rem 2.6rem',
                      background: 'rgba(255, 255, 255, 0.08)',
                      border: '1px solid rgba(255, 255, 255, 0.22)',
                      borderRadius: '12px',
                      color: '#FFFFFF',
                      fontSize: '1rem',
                      fontWeight: 600,
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ''))}
                    placeholder="9876543210"
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '0.45rem', fontSize: '0.76rem', color: '#C2DEC8' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <ShieldCheck size={14} color="#A2CBB5" />
                  <span>10-digit mobile number</span>
                </span>
                <span style={{ color: '#A2CBB5', fontWeight: 700 }}>{getFullPhone()}</span>
              </div>
            </div>

            {/* Mint CTA Button matching Home Screen */}
            <button
              type="submit"
              style={{
                width: '100%',
                background: '#E6F2EB',
                color: '#183D2D',
                border: '1px solid #C8E2D3',
                borderRadius: '14px',
                padding: '0.85rem',
                fontSize: '0.95rem',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                boxShadow: '0 8px 24px rgba(15, 43, 30, 0.35)',
                transition: 'all 0.2s ease',
                marginTop: '0.5rem'
              }}
              disabled={loading}
            >
              <span>{loading ? 'Sending Verification Code...' : 'Get OTP Code'}</span>
              <ArrowRight size={16} color="#183D2D" />
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp}>
            <div style={{ marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <label style={{ fontSize: '0.76rem', fontWeight: 800, color: '#C2DEC8', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                  Enter 6-Digit OTP Code
                </label>
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#A2CBB5',
                    fontSize: '0.78rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    fontWeight: 700
                  }}
                >
                  <ArrowLeft size={12} /> Change Number
                </button>
              </div>

              <div style={{ position: 'relative' }}>
                <KeyRound size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#A2CBB5' }} />
                <input
                  type="text"
                  maxLength={6}
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem 0.75rem 2.8rem',
                    background: 'rgba(255, 255, 255, 0.08)',
                    border: '1px solid rgba(255, 255, 255, 0.22)',
                    borderRadius: '12px',
                    color: '#FFFFFF',
                    fontSize: '1.25rem',
                    fontWeight: 800,
                    letterSpacing: '6px',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  placeholder="123456"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              style={{
                width: '100%',
                background: '#E6F2EB',
                color: '#183D2D',
                border: '1px solid #C8E2D3',
                borderRadius: '14px',
                padding: '0.85rem',
                fontSize: '0.95rem',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                boxShadow: '0 8px 24px rgba(15, 43, 30, 0.35)',
                transition: 'all 0.2s ease',
                marginTop: '0.5rem'
              }}
              disabled={loading}
            >
              <span>{loading ? 'Verifying OTP Code...' : 'Verify OTP & Sign In'}</span>
              <ArrowRight size={16} color="#183D2D" />
            </button>

            <div style={{ marginTop: '1rem', textAlign: 'center' }}>
              <button
                type="button"
                onClick={handleSendOtp}
                disabled={loading}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#C2DEC8',
                  fontSize: '0.82rem',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  fontWeight: 600
                }}
              >
                <RefreshCw size={13} color="#A2CBB5" />
                <span>Resend OTP Code</span>
              </button>
            </div>
          </form>
        )}

        {/* Demo Farmer Quick Fill Banner */}
        <div
          style={{
            marginTop: '1.5rem',
            padding: '0.75rem 1rem',
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '14px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '0.75rem'
          }}
        >
          <div style={{ fontSize: '0.76rem', color: '#C2DEC8' }}>
            <span style={{ color: '#A2CBB5', fontWeight: 700 }}>Demo Farmer:</span> +91 98765 43210
          </div>
          <button
            type="button"
            onClick={handleAutoFillDemo}
            style={{
              background: 'rgba(230, 242, 235, 0.15)',
              border: '1px solid rgba(162, 203, 181, 0.3)',
              borderRadius: '8px',
              padding: '0.3rem 0.65rem',
              color: '#FFFFFF',
              fontSize: '0.74rem',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            Auto-fill
          </button>
        </div>

        {/* Registration Link */}
        <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.86rem', color: '#C2DEC8' }}>
          Don't have an Indian farmer account?{' '}
          <Link to="/register" style={{ color: '#E6F2EB', fontWeight: 800, textDecoration: 'underline' }}>
            Create Account
          </Link>
        </div>
      </div>
    </div>
  );
}

export function Register() {
  const { sendOtp, register } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [preferredLanguage, setPreferredLanguage] = useState('en');
  const [otp, setOtp] = useState('');

  const [step, setStep] = useState(1); // 1 = Details, 2 = Verify OTP
  const [error, setError] = useState('');
  const [infoMsg, setInfoMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [demoOtp, setDemoOtp] = useState('');

  const getFullPhone = () => {
    let cleanNum = phoneNumber.trim().replace(/\D/g, '');
    if (cleanNum.startsWith('91') && cleanNum.length === 12) {
      return '+' + cleanNum;
    }
    return '+91' + cleanNum;
  };

  const validateIndianPhone = (numStr) => {
    const cleanDigits = numStr.trim().replace(/\D/g, '');
    if (cleanDigits.length === 10 || (cleanDigits.length === 12 && cleanDigits.startsWith('91'))) {
      return true;
    }
    return false;
  };

  const handleSendOtp = async (e) => {
    if (e) e.preventDefault();
    setError('');
    setInfoMsg('');
    setLoading(true);

    if (!name.trim()) {
      setError('Please enter your full name.');
      setLoading(false);
      return;
    }

    if (!validateIndianPhone(phoneNumber)) {
      setError('Please enter a valid 10-digit Indian mobile number (e.g. 9876543210).');
      setLoading(false);
      return;
    }

    const fullPhone = getFullPhone();

    try {
      const res = await sendOtp(fullPhone);
      setDemoOtp(res.otp || '123456');
      setStep(2);
      setInfoMsg(`OTP code sent to Indian mobile number ${fullPhone}!`);
    } catch (err) {
      setError(err.message || 'Failed to send OTP code.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyAndRegister = async (e) => {
    if (e) e.preventDefault();
    setError('');
    setLoading(true);

    if (!otp || otp.length !== 6) {
      setError('Please enter the 6-digit OTP code.');
      setLoading(false);
      return;
    }

    try {
      const fullPhone = getFullPhone();
      await register(name, fullPhone, undefined, preferredLanguage, otp);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        width: '100vw',
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #183D2D 0%, #133526 50%, #0F2B1E 100%)',
        color: '#FFFFFF',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem 1.5rem',
        position: 'relative',
        overflow: 'hidden',
        boxSizing: 'border-box'
      }}
    >
      {/* Background Concentric Elevation Rings */}
      <div
        style={{
          position: 'absolute',
          right: '-10vw',
          top: '-10vh',
          width: '60vw',
          height: '60vw',
          maxWidth: '750px',
          maxHeight: '750px',
          borderRadius: '50%',
          border: '1px solid rgba(255, 255, 255, 0.05)',
          pointerEvents: 'none',
          zIndex: 1
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: '-10vw',
          bottom: '-10vh',
          width: '50vw',
          height: '50vw',
          maxWidth: '650px',
          maxHeight: '650px',
          borderRadius: '50%',
          border: '1px solid rgba(162, 203, 181, 0.06)',
          pointerEvents: 'none',
          zIndex: 1
        }}
      />

      {/* Top Back Link */}
      <div style={{ position: 'relative', zIndex: 10, width: '100%', maxWidth: 460, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <button
          type="button"
          onClick={() => navigate('/')}
          style={{
            background: 'rgba(255, 255, 255, 0.08)',
            border: '1px solid rgba(255, 255, 255, 0.16)',
            borderRadius: '10px',
            padding: '0.45rem 0.9rem',
            color: '#C2DEC8',
            fontSize: '0.82rem',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            transition: 'all 0.15s ease'
          }}
        >
          <ArrowLeft size={14} color="#A2CBB5" />
          <span>Back to fieldnote Home</span>
        </button>

        <span style={{ fontSize: '0.74rem', color: '#A2CBB5', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
          NEW FARMER REGISTRATION
        </span>
      </div>

      {/* Frosted Glassmorphic Register Card */}
      <div
        style={{
          width: '100%',
          maxWidth: 460,
          background: 'rgba(255, 255, 255, 0.08)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          border: '1px solid rgba(255, 255, 255, 0.16)',
          borderRadius: '24px',
          padding: '2.5rem 2.25rem',
          boxShadow: '0 24px 60px rgba(15, 43, 30, 0.45)',
          position: 'relative',
          zIndex: 10,
          boxSizing: 'border-box'
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '1.85rem' }}>
          <div
            style={{
              display: 'inline-flex',
              background: '#E6F2EB',
              padding: '0.85rem',
              borderRadius: '16px',
              marginBottom: '0.9rem',
              boxShadow: '0 4px 14px rgba(0, 0, 0, 0.15)'
            }}
          >
            <Sprout size={32} color="#183D2D" />
          </div>
          <h1 style={{ fontSize: '1.95rem', fontWeight: 800, color: '#FFFFFF', letterSpacing: '-0.025em', marginBottom: '0.35rem' }}>
            Create Account
          </h1>
          <p style={{ color: '#C2DEC8', fontSize: '0.88rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem' }}>
            <span>🇮🇳</span>
            <span>Indian Mobile OTP Registration (+91)</span>
          </p>
        </div>

        {error && (
          <div
            style={{
              background: 'rgba(224, 83, 60, 0.2)',
              border: '1px solid rgba(224, 83, 60, 0.4)',
              color: '#F8DFDB',
              padding: '0.75rem 1rem',
              borderRadius: '12px',
              marginBottom: '1.25rem',
              fontSize: '0.85rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            <AlertCircle size={17} color="#F8DFDB" />
            <span>{error}</span>
          </div>
        )}

        {infoMsg && step === 2 && (
          <div
            style={{
              background: 'rgba(230, 242, 235, 0.14)',
              border: '1px solid rgba(162, 203, 181, 0.35)',
              color: '#FFFFFF',
              padding: '0.85rem 1rem',
              borderRadius: '12px',
              marginBottom: '1.25rem',
              fontSize: '0.85rem'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
              <CheckCircle2 size={17} color="#A2CBB5" />
              <span>{infoMsg}</span>
            </div>
            {demoOtp && (
              <div
                style={{
                  marginTop: '0.65rem',
                  paddingTop: '0.65rem',
                  borderTop: '1px dashed rgba(162, 203, 181, 0.25)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}
              >
                <span style={{ fontSize: '0.82rem', color: '#C2DEC8' }}>
                  Demo OTP Code: <strong style={{ color: '#FFFFFF', letterSpacing: '2px', fontSize: '0.95rem' }}>{demoOtp}</strong>
                </span>
                <button
                  type="button"
                  onClick={() => setOtp(demoOtp)}
                  style={{
                    background: '#E6F2EB',
                    color: '#183D2D',
                    border: 'none',
                    padding: '0.25rem 0.65rem',
                    borderRadius: '6px',
                    fontSize: '0.75rem',
                    cursor: 'pointer',
                    fontWeight: 800
                  }}
                >
                  Auto-fill OTP
                </button>
              </div>
            )}
          </div>
        )}

        {step === 1 ? (
          <form onSubmit={handleSendOtp}>
            <div style={{ marginBottom: '1.15rem' }}>
              <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 800, color: '#C2DEC8', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                Full Name
              </label>
              <div style={{ position: 'relative' }}>
                <User size={18} style={{ position: 'absolute', left: '0.9rem', top: '50%', transform: 'translateY(-50%)', color: '#A2CBB5' }} />
                <input
                  type="text"
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem 0.75rem 2.6rem',
                    background: 'rgba(255, 255, 255, 0.08)',
                    border: '1px solid rgba(255, 255, 255, 0.22)',
                    borderRadius: '12px',
                    color: '#FFFFFF',
                    fontSize: '0.95rem',
                    fontWeight: 600,
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ramesh Kumar"
                  required
                />
              </div>
            </div>

            <div style={{ marginBottom: '1.15rem' }}>
              <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 800, color: '#C2DEC8', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                Indian Mobile Number (+91)
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    padding: '0.75rem 0.85rem',
                    background: 'rgba(230, 242, 235, 0.14)',
                    border: '1px solid rgba(162, 203, 181, 0.3)',
                    borderRadius: '12px',
                    fontWeight: 800,
                    fontSize: '0.92rem',
                    color: '#FFFFFF'
                  }}
                >
                  <span>🇮🇳</span>
                  <span>+91</span>
                </div>

                <div style={{ position: 'relative', flex: 1 }}>
                  <Phone size={17} style={{ position: 'absolute', left: '0.9rem', top: '50%', transform: 'translateY(-50%)', color: '#A2CBB5' }} />
                  <input
                    type="tel"
                    maxLength={10}
                    style={{
                      width: '100%',
                      padding: '0.75rem 1rem 0.75rem 2.6rem',
                      background: 'rgba(255, 255, 255, 0.08)',
                      border: '1px solid rgba(255, 255, 255, 0.22)',
                      borderRadius: '12px',
                      color: '#FFFFFF',
                      fontSize: '1rem',
                      fontWeight: 600,
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ''))}
                    placeholder="9876543210"
                    required
                  />
                </div>
              </div>
              {phoneNumber && (
                <div style={{ marginTop: '0.45rem', fontSize: '0.76rem', color: '#A2CBB5' }}>
                  Full Number: <strong>{getFullPhone()}</strong>
                </div>
              )}
            </div>

            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 800, color: '#C2DEC8', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                Preferred Language
              </label>
              <div style={{ position: 'relative' }}>
                <Globe size={18} style={{ position: 'absolute', left: '0.9rem', top: '50%', transform: 'translateY(-50%)', color: '#A2CBB5' }} />
                <select
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem 0.75rem 2.6rem',
                    background: '#133526',
                    border: '1px solid rgba(255, 255, 255, 0.22)',
                    borderRadius: '12px',
                    color: '#FFFFFF',
                    fontSize: '0.92rem',
                    fontWeight: 600,
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                  value={preferredLanguage}
                  onChange={(e) => setPreferredLanguage(e.target.value)}
                >
                  <option value="en">English</option>
                  <option value="hi">Hindi (हिंदी)</option>
                  <option value="te">Telugu (తెలుగు)</option>
                  <option value="ta">Tamil (தமிழ்)</option>
                  <option value="mr">Marathi (मराठी)</option>
                  <option value="pa">Punjabi (ਪੰਜਾਬੀ)</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              style={{
                width: '100%',
                background: '#E6F2EB',
                color: '#183D2D',
                border: '1px solid #C8E2D3',
                borderRadius: '14px',
                padding: '0.85rem',
                fontSize: '0.95rem',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                boxShadow: '0 8px 24px rgba(15, 43, 30, 0.35)',
                transition: 'all 0.2s ease',
                marginTop: '0.5rem'
              }}
              disabled={loading}
            >
              <span>{loading ? 'Sending OTP Code...' : 'Get OTP Code & Continue'}</span>
              <ArrowRight size={16} color="#183D2D" />
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyAndRegister}>
            <div style={{ marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <label style={{ fontSize: '0.76rem', fontWeight: 800, color: '#C2DEC8', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                  Enter 6-Digit OTP Code
                </label>
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#A2CBB5',
                    fontSize: '0.78rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    fontWeight: 700
                  }}
                >
                  <ArrowLeft size={12} /> Edit Details
                </button>
              </div>

              <div style={{ position: 'relative' }}>
                <KeyRound size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#A2CBB5' }} />
                <input
                  type="text"
                  maxLength={6}
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem 0.75rem 2.8rem',
                    background: 'rgba(255, 255, 255, 0.08)',
                    border: '1px solid rgba(255, 255, 255, 0.22)',
                    borderRadius: '12px',
                    color: '#FFFFFF',
                    fontSize: '1.25rem',
                    fontWeight: 800,
                    letterSpacing: '6px',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  placeholder="123456"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              style={{
                width: '100%',
                background: '#E6F2EB',
                color: '#183D2D',
                border: '1px solid #C8E2D3',
                borderRadius: '14px',
                padding: '0.85rem',
                fontSize: '0.95rem',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                boxShadow: '0 8px 24px rgba(15, 43, 30, 0.35)',
                transition: 'all 0.2s ease',
                marginTop: '0.5rem'
              }}
              disabled={loading}
            >
              <span>{loading ? 'Registering Account...' : 'Verify OTP & Complete Registration'}</span>
              <ArrowRight size={16} color="#183D2D" />
            </button>

            <div style={{ marginTop: '1rem', textAlign: 'center' }}>
              <button
                type="button"
                onClick={handleSendOtp}
                disabled={loading}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#C2DEC8',
                  fontSize: '0.82rem',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  fontWeight: 600
                }}
              >
                <RefreshCw size={13} color="#A2CBB5" />
                <span>Resend OTP Code</span>
              </button>
            </div>
          </form>
        )}

        <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.86rem', color: '#C2DEC8' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: '#E6F2EB', fontWeight: 800, textDecoration: 'underline' }}>
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
