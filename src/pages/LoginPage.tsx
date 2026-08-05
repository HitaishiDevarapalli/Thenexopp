import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  FaEnvelope, 
  FaShieldAlt, 
  FaCheckCircle, 
  FaArrowRight, 
  FaLock,
  FaArrowLeft,
  FaRedoAlt,
  FaSpinner
} from 'react-icons/fa';
import { FcGoogle } from 'react-icons/fc';

interface LoginPageProps {
  onClose?: () => void;
  isModal?: boolean;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onClose, isModal = false }) => {
  const { sendEmailOtp, verifyEmailOtp, loginWithGoogle } = useAuth();

  // Step state: 'email' or 'otp'
  const [step, setStep] = useState<'email' | 'otp'>('email');

  // Input states
  const [email, setEmail] = useState('');
  const [otpDigits, setOtpDigits] = useState<string[]>(['', '', '', '', '', '']);
  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Countdown timer state (60 seconds)
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);

  // UI state
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Load Google OAuth GSI Script dynamically
  useEffect(() => {
    const existingScript = document.getElementById('google-gsi-script');
    if (!existingScript) {
      const script = document.createElement('script');
      script.id = 'google-gsi-script';
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      document.body.appendChild(script);
    }
  }, []);

  // 60-second Countdown Timer effect
  useEffect(() => {
    let interval: any = null;
    if (step === 'otp' && timer > 0) {
      setCanResend(false);
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else if (step === 'otp' && timer === 0) {
      setCanResend(true);
      if (interval) clearInterval(interval);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [step, timer]);

  // Focus first OTP input box on entering OTP step
  useEffect(() => {
    if (step === 'otp') {
      setTimeout(() => {
        otpInputRefs.current[0]?.focus();
      }, 150);
    }
  }, [step]);

  // Step 1: Submit Email -> Call POST /api/auth/send-email-otp
  const handleSendOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      setError('Please enter a valid email address');
      return;
    }

    setLoading(true);
    try {
      const res = await sendEmailOtp(cleanEmail);
      setLoading(false);

      if (!res.success) {
        setError(res.message || 'Failed to send Email OTP. Please try again.');
        return;
      }

      setStep('otp');
      setTimer(60);
      setCanResend(false);
      setOtpDigits(['', '', '', '', '', '']);
      setSuccess(res.message || `OTP code sent to ${cleanEmail}`);
    } catch (err: any) {
      setLoading(false);
      setError(err.message || 'An error occurred while sending OTP.');
    }
  };

  // Google OAuth Login Action
  const handleGoogleLogin = async () => {
    setError('');
    setGoogleLoading(true);

    const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

    // Check if Google GSI client library is loaded
    if (typeof window !== 'undefined' && (window as any).google?.accounts?.id && googleClientId) {
      try {
        (window as any).google.accounts.id.initialize({
          client_id: googleClientId,
          callback: async (response: any) => {
            if (response.credential) {
              const res = await loginWithGoogle({ credential: response.credential, email: '', name: '' });
              setGoogleLoading(false);
              if (res.success) {
                onClose?.();
              } else {
                setError(res.message || 'Google authentication failed');
              }
            } else {
              setGoogleLoading(false);
            }
          },
        });
        (window as any).google.accounts.id.prompt();
        setTimeout(() => setGoogleLoading(false), 3000);
        return;
      } catch (e) {
        console.warn('Google GSI prompt error:', e);
      }
    }

    // Direct Google Simulation / Fallback prompt if OAuth Client ID is in test mode
    try {
      const promptEmail = prompt('Enter your Google Email address for Google OAuth Simulation:');
      if (!promptEmail) {
        setGoogleLoading(false);
        return;
      }
      const cleanEmail = promptEmail.trim().toLowerCase();
      const userName = cleanEmail.split('@')[0].replace(/[\.\-_]/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
      const mockGoogleId = `google-uid-${Math.random().toString(36).substring(2, 10)}`;
      const avatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&background=007A55&color=fff`;

      const res = await loginWithGoogle({
        googleId: mockGoogleId,
        email: cleanEmail,
        name: userName,
        profilePhoto: avatar,
      });

      setGoogleLoading(false);
      if (res.success) {
        onClose?.();
      } else {
        setError(res.message || 'Google Login failed');
      }
    } catch (err: any) {
      setGoogleLoading(false);
      setError(err.message || 'Google Login error');
    }
  };

  // OTP Box Change Handler
  const handleOtpBoxChange = (index: number, value: string) => {
    const cleanVal = value.replace(/\D/g, '');
    if (!cleanVal) {
      const updated = [...otpDigits];
      updated[index] = '';
      setOtpDigits(updated);
      return;
    }

    const lastChar = cleanVal.slice(-1);
    const updated = [...otpDigits];
    updated[index] = lastChar;
    setOtpDigits(updated);
    setError('');

    // Focus next box if available
    if (index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  // OTP KeyDown Handler (Backspace & Arrow Navigation)
  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      if (!otpDigits[index] && index > 0) {
        const updated = [...otpDigits];
        updated[index - 1] = '';
        setOtpDigits(updated);
        otpInputRefs.current[index - 1]?.focus();
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  // OTP Paste Support
  const handleOtpPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pastedData) {
      const digits = pastedData.split('');
      const updated = ['', '', '', '', '', ''];
      digits.forEach((d, i) => {
        if (i < 6) updated[i] = d;
      });
      setOtpDigits(updated);
      setError('');
      const nextFocus = Math.min(digits.length, 5);
      otpInputRefs.current[nextFocus]?.focus();
    }
  };

  // Resend OTP Action
  const handleResendOtp = async () => {
    if (!canResend || loading) return;
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      const res = await sendEmailOtp(email.trim().toLowerCase());
      setLoading(false);
      if (res.success) {
        setTimer(60);
        setCanResend(false);
        setOtpDigits(['', '', '', '', '', '']);
        setSuccess('A new 6-digit OTP code has been sent to your email!');
        otpInputRefs.current[0]?.focus();
      } else {
        setError(res.message || 'Failed to resend OTP.');
      }
    } catch (err: any) {
      setLoading(false);
      setError(err.message || 'Error resending OTP.');
    }
  };

  // Step 2: Verify OTP -> Call POST /api/auth/verify-email-otp
  const handleVerifyOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const fullOtp = otpDigits.join('');
    if (fullOtp.length !== 6) {
      setError('Please enter complete 6-digit OTP code');
      return;
    }

    setLoading(true);
    try {
      const cleanEmail = email.trim().toLowerCase();
      const res = await verifyEmailOtp(cleanEmail, fullOtp);
      setLoading(false);

      if (!res.success) {
        setError(res.message || 'Verification failed. Please check the OTP code.');
        return;
      }

      setSuccess('Verification successful! Logging in...');
      setTimeout(() => {
        onClose?.();
      }, 400);
    } catch (err: any) {
      setLoading(false);
      setError(err.message || 'Verification failed');
    }
  };

  // Back Button to Step 1
  const handleBackToEmail = () => {
    setStep('email');
    setError('');
    setSuccess('');
  };

  return (
    <div style={{
      minHeight: isModal ? 'auto' : '100vh',
      width: isModal ? '100%' : '100vw',
      backgroundColor: isModal ? 'transparent' : '#F8FAFC',
      backgroundImage: isModal ? 'none' : 'radial-gradient(at 0% 0%, rgba(13, 148, 136, 0.08) 0px, transparent 50%), radial-gradient(at 100% 100%, rgba(6, 78, 59, 0.06) 0px, transparent 50%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: isModal ? '0' : '24px 16px',
      fontFamily: "'Outfit', 'Inter', system-ui, -apple-system, sans-serif"
    }}>
      {/* Main Container Card */}
      <div style={{
        width: '100%',
        maxWidth: '1040px',
        backgroundColor: '#FFFFFF',
        borderRadius: '24px',
        boxShadow: '0 25px 60px -15px rgba(15, 23, 42, 0.12), 0 0 1px 1px rgba(0, 0, 0, 0.05)',
        display: 'flex',
        flexDirection: 'row',
        overflow: 'hidden',
        minHeight: '620px'
      }}>

        {/* LEFT PANEL - Emerald Branding Banner */}
        <div style={{
          flex: '1 1 45%',
          background: 'linear-gradient(145deg, #004D34 0%, #0B5D43 50%, #064E3B 100%)',
          padding: '44px 40px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          position: 'relative',
          color: '#FFFFFF',
          overflow: 'hidden'
        }}>
          {/* Subtle Ambient Background Lighting Circles */}
          <div style={{
            position: 'absolute',
            top: '-80px',
            left: '-80px',
            width: '240px',
            height: '240px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(16, 185, 129, 0.25) 0%, transparent 70%)',
            pointerEvents: 'none'
          }} />

          {/* Top Brand Header */}
          <div style={{ position: 'relative', zIndex: 2 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '28px' }}>
              <div style={{
                width: '44px',
                height: '44px',
                borderRadius: '12px',
                backgroundColor: 'rgba(255, 255, 255, 0.15)',
                backdropFilter: 'blur(8px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px solid rgba(255, 255, 255, 0.2)'
              }}>
                <span style={{ fontSize: '22px', fontWeight: 800, color: '#34D399' }}>N</span>
              </div>
              <span style={{ fontSize: '24px', fontWeight: 800, letterSpacing: '-0.5px' }}>TheNexOpp</span>
            </div>

            <h2 style={{ fontSize: '30px', fontWeight: 700, lineHeight: 1.25, marginBottom: '16px' }}>
              India's Trusted Platform for Verified Listings
            </h2>
            <p style={{ color: 'rgba(255, 255, 255, 0.82)', fontSize: '15px', lineHeight: 1.6 }}>
              Access premium properties, franchise resales, and business opportunities with seamless Email & Google authentication.
            </p>
          </div>

          {/* Core Highlights List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', margin: '32px 0', position: 'relative', zIndex: 2 }}>
            {[
              { icon: <FaShieldAlt style={{ color: '#34D399' }} />, text: 'Verified Profiles & Direct Connections' },
              { icon: <FaCheckCircle style={{ color: '#34D399' }} />, text: 'Cross-Device Automatic Session Sync' },
              { icon: <FaLock style={{ color: '#34D399' }} />, text: 'Encrypted Hashed Email OTP Security' }
            ].map((item, idx) => (
              <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '14px'
                }}>
                  {item.icon}
                </div>
                <span style={{ fontSize: '14px', fontWeight: 500, color: '#ECFDF5' }}>{item.text}</span>
              </div>
            ))}
          </div>

          {/* Footer badge */}
          <div style={{ position: 'relative', zIndex: 2, paddingTop: '16px', borderTop: '1px solid rgba(255, 255, 255, 0.12)' }}>
            <span style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.65)' }}>
              © 2026 TheNexOpp. Secure HTTP-Only Cookie Authentication.
            </span>
          </div>
        </div>

        {/* RIGHT PANEL - Form & Auth Area */}
        <div style={{
          flex: '1 1 55%',
          padding: '44px 48px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          backgroundColor: '#FFFFFF',
          position: 'relative'
        }}>
          {/* Close Modal Button */}
          {isModal && onClose && (
            <button
              onClick={onClose}
              style={{
                position: 'absolute',
                top: '20px',
                right: '24px',
                background: '#F1F5F9',
                border: 'none',
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                cursor: 'pointer',
                fontSize: '18px',
                color: '#64748B',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s ease'
              }}
              title="Close Modal"
            >
              ✕
            </button>
          )}

          {/* STEP 1: LOGIN CHOICE (GOOGLE OR EMAIL) */}
          {step === 'email' && (
            <div>
              <div style={{ marginBottom: '28px' }}>
                <span style={{
                  fontSize: '12px',
                  fontWeight: 700,
                  color: '#007A55',
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                  backgroundColor: '#ECFDF5',
                  padding: '4px 10px',
                  borderRadius: '6px',
                  display: 'inline-block',
                  marginBottom: '10px'
                }}>
                  Sign In / Register
                </span>
                <h3 style={{ fontSize: '26px', fontWeight: 700, color: '#0F172A', margin: '0 0 8px 0' }}>
                  Welcome to TheNexOpp
                </h3>
                <p style={{ fontSize: '14px', color: '#64748B', margin: 0 }}>
                  Log in to your account using Google or your Email Address.
                </p>
              </div>

              {error && (
                <div style={{
                  backgroundColor: '#FEF2F2',
                  border: '1px solid #FCA5A5',
                  color: '#991B1B',
                  padding: '12px 16px',
                  borderRadius: '12px',
                  fontSize: '13px',
                  marginBottom: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <span>⚠️</span>
                  <span>{error}</span>
                </div>
              )}

              {/* GOOGLE LOGIN BUTTON */}
              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={googleLoading}
                style={{
                  width: '100%',
                  padding: '14px 20px',
                  borderRadius: '12px',
                  backgroundColor: '#FFFFFF',
                  border: '1.5px solid #E2E8F0',
                  color: '#0F172A',
                  fontSize: '15px',
                  fontWeight: 600,
                  cursor: googleLoading ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '12px',
                  boxShadow: '0 2px 6px rgba(0, 0, 0, 0.04)',
                  transition: 'all 0.2s ease',
                  marginBottom: '24px'
                }}
                onMouseEnter={(e) => (e.currentTarget.style.borderColor = '#CBD5E1')}
                onMouseLeave={(e) => (e.currentTarget.style.borderColor = '#E2E8F0')}
              >
                {googleLoading ? (
                  <>
                    <FaSpinner style={{ animation: 'spin 1s linear infinite' }} />
                    <span>Connecting with Google...</span>
                  </>
                ) : (
                  <>
                    <FcGoogle style={{ fontSize: '22px' }} />
                    <span>Continue with Google</span>
                  </>
                )}
              </button>

              {/* DIVIDER: OR */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                margin: '24px 0',
                color: '#94A3B8',
                fontSize: '13px',
                fontWeight: 600
              }}>
                <div style={{ flex: 1, height: '1px', backgroundColor: '#E2E8F0' }} />
                <span style={{ padding: '0 16px' }}>OR</span>
                <div style={{ flex: 1, height: '1px', backgroundColor: '#E2E8F0' }} />
              </div>

              {/* EMAIL ADDRESS FORM */}
              <form onSubmit={handleSendOtpSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                    Email Address <span style={{ color: '#EF4444' }}>*</span>
                  </label>
                  <div style={{ position: 'relative' }}>
                    <FaEnvelope style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8', fontSize: '14px' }} />
                    <input
                      type="email"
                      placeholder="name@example.com"
                      value={email}
                      onChange={(e) => { setEmail(e.target.value); setError(''); }}
                      style={{
                        width: '100%',
                        padding: '12px 16px 12px 44px',
                        borderRadius: '12px',
                        border: '1.5px solid #E2E8F0',
                        fontSize: '14px',
                        color: '#0F172A',
                        outline: 'none',
                        boxSizing: 'border-box',
                        transition: 'border-color 0.2s ease'
                      }}
                      onFocus={(e) => (e.target.style.borderColor = '#007A55')}
                      onBlur={(e) => (e.target.style.borderColor = '#E2E8F0')}
                    />
                  </div>
                </div>

                {/* CONTINUE BUTTON */}
                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    width: '100%',
                    padding: '14px 24px',
                    borderRadius: '12px',
                    backgroundColor: '#007A55',
                    color: '#FFFFFF',
                    fontSize: '15px',
                    fontWeight: 600,
                    border: 'none',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '10px',
                    boxShadow: '0 4px 14px rgba(0, 122, 85, 0.3)',
                    transition: 'all 0.2s ease',
                    opacity: loading ? 0.7 : 1
                  }}
                >
                  {loading ? (
                    <>
                      <FaSpinner style={{ animation: 'spin 1s linear infinite' }} />
                      <span>Sending OTP...</span>
                    </>
                  ) : (
                    <>
                      <span>Continue</span>
                      <FaArrowRight style={{ fontSize: '13px' }} />
                    </>
                  )}
                </button>
              </form>
            </div>
          )}

          {/* STEP 2: OUR OWN CUSTOM EMAIL OTP SCREEN */}
          {step === 'otp' && (
            <div>
              {/* Back to email button */}
              <button
                type="button"
                onClick={handleBackToEmail}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#007A55',
                  fontSize: '13px',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  cursor: 'pointer',
                  padding: '0',
                  marginBottom: '20px'
                }}
              >
                <FaArrowLeft style={{ fontSize: '12px' }} />
                <span>Change Email Address</span>
              </button>

              <div style={{ marginBottom: '24px' }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '16px',
                  backgroundColor: '#ECFDF5',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#007A55',
                  fontSize: '20px',
                  marginBottom: '16px'
                }}>
                  <FaEnvelope />
                </div>
                <h3 style={{ fontSize: '24px', fontWeight: 700, color: '#0F172A', margin: '0 0 6px 0' }}>
                  Verify your Email
                </h3>
                <p style={{ fontSize: '14px', color: '#64748B', margin: 0, lineHeight: 1.5 }}>
                  Enter the 6 digit code sent to{' '}
                  <strong style={{ color: '#0F172A', fontWeight: 600 }}>{email.trim().toLowerCase()}</strong>
                </p>
              </div>

              {error && (
                <div style={{
                  backgroundColor: '#FEF2F2',
                  border: '1px solid #FCA5A5',
                  color: '#991B1B',
                  padding: '12px 16px',
                  borderRadius: '12px',
                  fontSize: '13px',
                  marginBottom: '20px'
                }}>
                  ⚠️ {error}
                </div>
              )}

              {success && (
                <div style={{
                  backgroundColor: '#ECFDF5',
                  border: '1px solid #A7F3D0',
                  color: '#065F46',
                  padding: '12px 16px',
                  borderRadius: '12px',
                  fontSize: '13px',
                  marginBottom: '20px'
                }}>
                  ✅ {success}
                </div>
              )}

              <form onSubmit={handleVerifyOtpSubmit}>
                {/* 6 SEPARATE OTP INPUT BOXES */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  gap: '10px',
                  marginBottom: '28px'
                }}>
                  {otpDigits.map((digit, index) => (
                    <input
                      key={index}
                      ref={(el) => (otpInputRefs.current[index] = el)}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpBoxChange(index, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(index, e)}
                      onPaste={handleOtpPaste}
                      style={{
                        width: '100%',
                        maxWidth: '54px',
                        height: '58px',
                        borderRadius: '14px',
                        border: digit ? '2px solid #007A55' : '1.5px solid #CBD5E1',
                        backgroundColor: digit ? '#F0FDF4' : '#FFFFFF',
                        fontSize: '22px',
                        fontWeight: 700,
                        color: '#0F172A',
                        textAlign: 'center',
                        outline: 'none',
                        boxShadow: digit ? '0 0 0 3px rgba(0, 122, 85, 0.12)' : 'none',
                        transition: 'all 0.15s ease'
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = '#007A55';
                        e.target.style.boxShadow = '0 0 0 3px rgba(0, 122, 85, 0.15)';
                      }}
                      onBlur={(e) => {
                        if (!digit) {
                          e.target.style.borderColor = '#CBD5E1';
                          e.target.style.boxShadow = 'none';
                        }
                      }}
                    />
                  ))}
                </div>

                {/* VERIFY BUTTON */}
                <button
                  type="submit"
                  disabled={loading || otpDigits.join('').length !== 6}
                  style={{
                    width: '100%',
                    padding: '14px 24px',
                    borderRadius: '12px',
                    backgroundColor: '#007A55',
                    color: '#FFFFFF',
                    fontSize: '15px',
                    fontWeight: 600,
                    border: 'none',
                    cursor: (loading || otpDigits.join('').length !== 6) ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '10px',
                    boxShadow: '0 4px 14px rgba(0, 122, 85, 0.3)',
                    opacity: (loading || otpDigits.join('').length !== 6) ? 0.6 : 1,
                    transition: 'all 0.2s ease',
                    marginBottom: '20px'
                  }}
                >
                  {loading ? (
                    <>
                      <FaSpinner style={{ animation: 'spin 1s linear infinite' }} />
                      <span>Verifying Code...</span>
                    </>
                  ) : (
                    <>
                      <span>Verify & Login</span>
                      <FaCheckCircle />
                    </>
                  )}
                </button>

                {/* COUNTDOWN TIMER & RESEND OTP SECTION */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  paddingTop: '16px',
                  borderTop: '1px solid #F1F5F9'
                }}>
                  <div style={{ fontSize: '13px', color: '#64748B' }}>
                    {timer > 0 ? (
                      <span>Resend code in <strong style={{ color: '#007A55' }}>{timer}s</strong></span>
                    ) : (
                      <span>Didn't receive the OTP code?</span>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={!canResend || loading}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: canResend ? '#007A55' : '#94A3B8',
                      fontSize: '13px',
                      fontWeight: 600,
                      cursor: canResend ? 'pointer' : 'not-allowed',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '4px 8px',
                      borderRadius: '6px'
                    }}
                  >
                    <FaRedoAlt style={{ fontSize: '12px' }} />
                    <span>Resend OTP</span>
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
