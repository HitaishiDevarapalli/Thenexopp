import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Logo } from '../components/common/Logo';
import { useAuth } from '../context/AuthContext';

interface LoginPageProps {
  onClose?: () => void;
  isModal?: boolean;
}

/* ─────────────── Keyframe CSS injected once ─────────────── */
const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');

  @keyframes nxFadeUp {
    from { opacity: 0; transform: translateY(28px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes nxPulseRing {
    0%   { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(5,150,105,0.45); }
    70%  { transform: scale(1);    box-shadow: 0 0 0 14px rgba(5,150,105,0); }
    100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(5,150,105,0); }
  }
  @keyframes nxShimmer {
    0%   { background-position: -400px 0; }
    100% { background-position: 400px 0; }
  }
  @keyframes nxSpin {
    to { transform: rotate(360deg); }
  }
  @keyframes nxFloatUp {
    0%,100% { transform: translateY(0px); }
    50%     { transform: translateY(-8px); }
  }
  @keyframes nxBlobMove {
    0%,100% { border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%; }
    50%     { border-radius: 30% 60% 70% 40% / 50% 60% 30% 60%; }
  }
  @keyframes nxSuccessBounce {
    0%   { transform: scale(0) rotate(-10deg); opacity:0; }
    60%  { transform: scale(1.15) rotate(4deg); opacity:1; }
    80%  { transform: scale(0.92) rotate(-2deg); }
    100% { transform: scale(1) rotate(0deg); opacity:1; }
  }
  @keyframes nxCountdown {
    from { stroke-dashoffset: 0; }
    to   { stroke-dashoffset: 113; }
  }

  .nx-login-root * { box-sizing: border-box; }

  .nx-card {
    background: #fff;
    border-radius: 28px;
    box-shadow: 0 32px 80px -12px rgba(2,44,34,.18), 0 2px 8px rgba(0,0,0,.06);
    animation: nxFadeUp .55s cubic-bezier(.22,.61,.36,1) both;
    overflow: hidden;
  }

  /* Text input & Phone input wrapper */
  .nx-input-wrap {
    display: flex;
    align-items: center;
    border: 2px solid #e2e8f0;
    border-radius: 16px;
    overflow: hidden;
    transition: border-color .2s, box-shadow .2s;
    background: #fff;
  }
  .nx-input-wrap:focus-within {
    border-color: #059669;
    box-shadow: 0 0 0 4px rgba(5,150,105,.12);
  }

  .nx-input-field {
    flex: 1;
    border: none;
    outline: none;
    padding: 0 18px;
    height: 56px;
    font-size: 1rem;
    font-weight: 600;
    color: #0f172a;
    background: transparent;
    font-family: 'Plus Jakarta Sans', sans-serif;
  }
  .nx-input-field::placeholder { color: #cbd5e1; font-weight: 400; }

  .nx-flag {
    padding: 0 14px;
    font-size: 1.35rem;
    display: flex;
    align-items: center;
    gap: 6px;
    color: #334155;
    font-weight: 700;
    border-right: 2px solid #e2e8f0;
    height: 56px;
    white-space: nowrap;
    background: #f8fafc;
    font-family: inherit;
    font-size: .94rem;
  }
  .nx-phone-input {
    flex: 1;
    border: none;
    outline: none;
    padding: 0 18px;
    height: 56px;
    font-size: 1.15rem;
    font-weight: 600;
    color: #0f172a;
    background: transparent;
    font-family: 'Plus Jakarta Sans', sans-serif;
    letter-spacing: 2px;
  }
  .nx-phone-input::placeholder { color: #cbd5e1; letter-spacing: 0; font-weight: 400; }

  /* Gender Capsules */
  .nx-gender-container {
    display: flex;
    gap: 8px;
    width: 100%;
  }
  .nx-gender-pill {
    flex: 1;
    height: 48px;
    border: 2px solid #e2e8f0;
    border-radius: 12px;
    background: #fff;
    color: #475569;
    font-size: .9rem;
    font-weight: 700;
    font-family: 'Plus Jakarta Sans', sans-serif;
    cursor: pointer;
    transition: all .2s;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
  }
  .nx-gender-pill.active {
    border-color: #059669;
    background: #ecfdf5;
    color: #047857;
  }

  /* Interest cards */
  .nx-interest-row {
    display: flex;
    gap: 12px;
    width: 100%;
  }
  .nx-interest-card {
    flex: 1;
    padding: 16px;
    border: 2px solid #e2e8f0;
    border-radius: 16px;
    background: #fff;
    cursor: pointer;
    transition: all .2s;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    text-align: center;
  }
  .nx-interest-card:hover {
    border-color: #34d399;
  }
  .nx-interest-card.active {
    border-color: #059669;
    background: #ecfdf5;
  }
  .nx-interest-title {
    font-size: .92rem;
    font-weight: 750;
    color: #1e293b;
    margin: 0;
  }
  .nx-interest-card.active .nx-interest-title {
    color: #065f46;
  }

  /* Primary CTA button */
  .nx-btn-primary {
    width: 100%;
    height: 56px;
    border: none;
    border-radius: 16px;
    background: linear-gradient(135deg, #059669 0%, #047857 100%);
    color: #fff;
    font-size: 1rem;
    font-weight: 700;
    font-family: 'Plus Jakarta Sans', sans-serif;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    transition: transform .18s, box-shadow .18s, background .2s;
    box-shadow: 0 8px 24px rgba(5,150,105,.35);
    position: relative;
    overflow: hidden;
    letter-spacing: .3px;
  }
  .nx-btn-primary:not(:disabled):hover {
    transform: translateY(-2px);
    box-shadow: 0 12px 32px rgba(5,150,105,.45);
    background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  }
  .nx-btn-primary:not(:disabled):active { transform: translateY(0); }
  .nx-btn-primary:disabled { opacity: .65; cursor: not-allowed; }

  /* OTP boxes */
  .nx-otp-box {
    width: 52px;
    height: 60px;
    border: 2px solid #e2e8f0;
    border-radius: 14px;
    font-size: 1.5rem;
    font-weight: 800;
    text-align: center;
    color: #0f172a;
    background: #f8fafc;
    outline: none;
    transition: border-color .2s, box-shadow .2s, background .2s, transform .15s;
    font-family: 'Plus Jakarta Sans', sans-serif;
    caret-color: #059669;
    -webkit-appearance: none;
  }
  .nx-otp-box:focus {
    border-color: #059669;
    background: #fff;
    box-shadow: 0 0 0 4px rgba(5,150,105,.15);
    transform: scale(1.08);
  }
  .nx-otp-box.filled {
    border-color: #059669;
    background: linear-gradient(135deg, #ecfdf5, #d1fae5);
    color: #065f46;
  }

  /* Error / success chips */
  .nx-msg {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 14px;
    border-radius: 12px;
    font-size: .875rem;
    font-weight: 500;
    animation: nxFadeUp .3s ease both;
    width: 100%;
  }
  .nx-msg.error   { background: #fef2f2; color: #dc2626; border: 1px solid #fee2e2; }
  .nx-msg.success { background: #ecfdf5; color: #059669; border: 1px solid #d1fae5; }

  /* Background blobs */
  .nx-blob {
    position: absolute;
    filter: blur(60px);
    opacity: .55;
    animation: nxBlobMove 8s ease-in-out infinite;
    pointer-events: none;
    z-index: 0;
  }

  /* Floating logo icon */
  .nx-logo-float { animation: nxFloatUp 3.5s ease-in-out infinite; }

  /* Back button */
  .nx-back-btn {
    display: flex;
    align-items: center;
    gap: 6px;
    background: none;
    border: none;
    color: #64748b;
    font-size: .88rem;
    font-weight: 600;
    cursor: pointer;
    padding: 6px 0;
    transition: color .18s;
    font-family: 'Plus Jakarta Sans', sans-serif;
  }
  .nx-back-btn:hover { color: #059669; }

  /* Resend button */
  .nx-resend {
    background: none;
    border: none;
    font-family: 'Plus Jakarta Sans', sans-serif;
    font-size: .9rem;
    font-weight: 700;
    cursor: pointer;
    transition: color .18s;
  }
  .nx-resend:disabled { color: #94a3b8; cursor: not-allowed; }
  .nx-resend:not(:disabled) { color: #059669; }
  .nx-resend:not(:disabled):hover { color: #047857; }

  /* Success state */
  .nx-success-icon {
    animation: nxSuccessBounce .6s cubic-bezier(.34,1.56,.64,1) both;
  }

  /* Mobile responsive OTP box */
  @media (max-width: 400px) {
    .nx-otp-box {
      width: 42px;
      height: 52px;
      font-size: 1.25rem;
      border-radius: 10px;
    }
  }
  @media (max-width: 340px) {
    .nx-otp-box { width: 36px; height: 48px; font-size: 1.1rem; }
  }

  /* Pulse ring for send OTP button icon */
  .nx-pulse { animation: nxPulseRing 2s ease infinite; }

  /* Spinner */
  .nx-spinner {
    width: 22px; height: 22px;
    border: 3px solid rgba(255,255,255,.35);
    border-top-color: #fff;
    border-radius: 50%;
    animation: nxSpin .75s linear infinite;
  }
`;

/* ─────────────── Helper: inject styles once ─────────────── */
function useInjectStyles(css: string) {
  useEffect(() => {
    const id = 'nx-login-styles';
    if (!document.getElementById(id)) {
      const el = document.createElement('style');
      el.id = id;
      el.textContent = css;
      document.head.appendChild(el);
    }
  }, []);
}

/* ─────────────── Sub-components ─────────────── */

const Spinner = () => <div className="nx-spinner" />;

const BackArrow = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="15 18 9 12 15 6" />
  </svg>
);

const CheckIcon = ({ size = 64 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 64 64" fill="none" className="nx-success-icon">
    <circle cx="32" cy="32" r="30" fill="#ecfdf5" stroke="#059669" strokeWidth="3" />
    <polyline points="18 33 27 42 46 22" stroke="#059669" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const DecorativeDots = () => (
  <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
    {[0, 1, 2].map(i => (
      <div key={i} style={{
        width: 8, height: 8, borderRadius: '50%',
        background: i === 0 ? '#059669' : i === 1 ? '#34d399' : '#a7f3d0'
      }} />
    ))}
  </div>
);

/* ─────────────── Main Component ─────────────── */
export const LoginPage: React.FC<LoginPageProps> = ({ onClose, isModal = false }) => {
  useInjectStyles(STYLES);
  const { setUser } = useAuth();

  type Step = 'phone' | 'otp' | 'profile' | 'success';
  const [step, setStep] = useState<Step>('phone');
  const [mobile, setMobile] = useState('');
  const [otp, setOtp] = useState<string[]>(Array(6).fill(''));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [countdown, setCountdown] = useState(0);
  const [windowW, setWindowW] = useState(window.innerWidth);

  // Profile completion states
  const [profileName, setProfileName] = useState('');
  const [profileGender, setProfileGender] = useState<'Male' | 'Female' | 'Other'>('Male');
  const [profileArea, setProfileArea] = useState('');

  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Track window width for responsive layout
  useEffect(() => {
    const handler = () => setWindowW(window.innerWidth);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);

  // Load remembered mobile
  useEffect(() => {
    try {
      const rem = localStorage.getItem('nexopp_remembered_mobile');
      if (rem) setMobile(rem);
    } catch (_) {}
  }, []);

  // Countdown timer
  useEffect(() => {
    if (countdown <= 0) return;
    const t = setInterval(() => setCountdown(c => c - 1), 1000);
    return () => clearInterval(t);
  }, [countdown]);

  /* ── OTP auto-fill via OTPCredential (mobile browsers) ── */
  useEffect(() => {
    if (step !== 'otp') return;
    if (!('OTPCredential' in window)) return;
    const ctrl = new AbortController();
    (navigator.credentials as any)
      .get({ otp: { transport: ['sms'] }, signal: ctrl.signal })
      .then((cred: any) => {
        if (cred && cred.code) {
          const digits = cred.code.replace(/\D/g, '').slice(0, 6).split('');
          const filled = [...digits, ...Array(6).fill('')].slice(0, 6);
          setOtp(filled);
          setError('');
          if (digits.length === 6) {
            submitOtp(filled.join(''));
          }
        }
      })
      .catch(() => {});
    return () => ctrl.abort();
  }, [step]);

  const isMobile = windowW < 640;
  const isTablet = windowW >= 640 && windowW < 1024;

  /* ── Layout helpers ── */
  const cardW = isMobile ? '100%' : isTablet ? '480px' : '460px';
  const cardPad = isMobile ? '32px 24px' : '48px 44px';

  /* ── API helpers ── */
  const apiBase = () => (import.meta.env.VITE_API_BASE_URL ? `${import.meta.env.VITE_API_BASE_URL}/api` : '/api');

  const safeFetchJson = async (url: string, options?: RequestInit) => {
    try {
      const res = await fetch(url, options);
      const contentType = res.headers.get('content-type') || '';
      let data: any = null;
      if (contentType.includes('application/json')) {
        try {
          data = await res.json();
        } catch (e) {
          data = null;
        }
      }
      if (!res.ok) {
        const errorMsg = data?.error || data?.message || (res.status === 502 || res.status === 504 ? 'Server is restarting or updating. Please try again in 5 seconds.' : `Server request failed (${res.status}). Please try again.`);
        throw new Error(errorMsg);
      }
      if (!data) {
        throw new Error('Connection temporary glitch. Please click Send OTP again.');
      }
      return data;
    } catch (err: any) {
      if (err.message && !err.message.includes('Unexpected token')) {
        throw err;
      }
      throw new Error('Unable to reach server. Please check your internet connection or try again in a moment.');
    }
  };

  const adoptAuthenticatedUser = useCallback((serverUser: any, fallbackPhone: string, fallbackName = 'User') => {
    const userName = serverUser?.fullName || serverUser?.name || fallbackName || 'User';
    const cleanEmail = (serverUser?.email && !serverUser.email.includes('@nexopp.in') && !serverUser.email.includes('@thenexopp')) ? serverUser.email : '';
    setUser({
      id: serverUser?.id,
      name: userName,
      email: cleanEmail,
      phone: serverUser?.mobile || serverUser?.phone || fallbackPhone,
      gender: serverUser?.gender,
      district: serverUser?.district || serverUser?.area,
      role: serverUser?.role || 'User',
      avatar: serverUser?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&background=007A55&color=fff&size=128&bold=true`,
      profileCompleted: serverUser?.profileCompleted !== false,
      propertyInterest: serverUser?.propertyInterest,
      businessInterest: serverUser?.businessInterest,
    });
  }, [setUser]);

  const sendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const clean = mobile.replace(/\D/g, '');
    if (clean.length !== 10) {
      setError('Please enter a valid 10-digit mobile number.');
      return;
    }

    setLoading(true);
    try {
      const data = await safeFetchJson(`${apiBase()}/auth/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ mobile: clean }),
      });
      setLoading(false);

      if (!data.success) throw new Error(data.error || 'Failed to send OTP.');

      localStorage.setItem('nexopp_remembered_mobile', clean);
      setOtp(Array(6).fill(''));
      setCountdown(30);
      setStep('otp');
      setSuccess(`OTP sent to +91 ${clean.slice(0, 5)}XXXXX`);
      setTimeout(() => otpRefs.current[0]?.focus(), 200);
    } catch (err: any) {
      setLoading(false);
      setError(err.message || 'Could not send OTP. Please try again.');
    }
  };

  const submitOtp = useCallback(async (code: string) => {
    setError('');
    setSuccess('');

    if (code.length !== 6 || !/^\d+$/.test(code)) {
      setError('Please enter a valid 6-digit OTP.');
      return;
    }

    setLoading(true);
    try {
      const clean = mobile.replace(/\D/g, '');
      const data = await safeFetchJson(`${apiBase()}/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ mobile: clean, otp: code, fullName: '' }),
      });
      setLoading(false);

      if (!data.success) throw new Error(data.error || 'Incorrect OTP. Please try again.');

      if (data.user?.isNewCustomer || data.user?.profileCompleted === false) {
        setStep('profile');
        setSuccess('Mobile verified! Please add your basic details.');
        return;
      }

      setStep('success');
      setTimeout(() => {
        adoptAuthenticatedUser(data.user, clean);
        onClose?.();
      }, 1600);
    } catch (err: any) {
      setLoading(false);
      setError(err.message || 'OTP verification failed.');
    }
  }, [mobile, adoptAuthenticatedUser, onClose]);

  const verifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    submitOtp(otp.join(''));
  };

  const submitProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!profileName.trim()) {
      setError('Full name is required.');
      return;
    }

    setLoading(true);
    try {
      const data = await safeFetchJson(`${apiBase()}/auth/complete-profile`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          name: profileName.trim(),
          gender: profileGender,
          area: profileArea.trim(),
          propertyInterest: true,
          businessInterest: false,
        }),
      });
      setLoading(false);

      if (!data.success) throw new Error(data.error || 'Failed to complete profile.');

      setStep('success');
      setTimeout(() => {
        const clean = mobile.replace(/\D/g, '');
        adoptAuthenticatedUser(data.user, clean, profileName.trim());
        onClose?.();
      }, 1600);
    } catch (err: any) {
      setLoading(false);
      setError(err.message || 'Failed to update profile details.');
    }
  };

  const resend = async () => {
    if (countdown > 0) return;
    setError('');
    setOtp(Array(6).fill(''));
    setLoading(true);
    try {
      const clean = mobile.replace(/\D/g, '');
      const data = await safeFetchJson(`${apiBase()}/auth/resend-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ mobile: clean }),
      });
      setLoading(false);
      if (!data.success) throw new Error(data.error || 'Failed to resend OTP.');
      setCountdown(30);
      setSuccess('New OTP sent!');
      setTimeout(() => otpRefs.current[0]?.focus(), 200);
    } catch (err: any) {
      setLoading(false);
      setError(err.message || 'Could not resend OTP.');
    }
  };

  /* OTP digit handlers */
  const onDigitChange = (val: string, idx: number) => {
    const clean = val.replace(/\D/g, '').slice(-1);
    const next = [...otp];
    next[idx] = clean;
    setOtp(next);
    setError('');
    if (clean && idx < 5) otpRefs.current[idx + 1]?.focus();
    if (next.every(d => d !== '') && next.join('').length === 6) {
      submitOtp(next.join(''));
    }
  };

  const onDigitKey = (e: React.KeyboardEvent<HTMLInputElement>, idx: number) => {
    if (e.key === 'Backspace') {
      const next = [...otp];
      if (next[idx] === '' && idx > 0) {
        next[idx - 1] = '';
        setOtp(next);
        otpRefs.current[idx - 1]?.focus();
      } else {
        next[idx] = '';
        setOtp(next);
      }
      setError('');
      e.preventDefault();
    }
  };

  const onDigitPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const paste = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!paste) return;
    const next = Array(6).fill('').map((_, i) => paste[i] || '');
    setOtp(next);
    setError('');
    const lastIdx = Math.min(paste.length - 1, 5);
    otpRefs.current[lastIdx]?.focus();
    if (paste.length === 6) submitOtp(paste);
  };

  const handleMobileInput = (val: string) => {
    const clean = val.replace(/\D/g, '').slice(0, 10);
    setMobile(clean);
    setError('');
  };

  /* ──────────────────────────────────────────────
     RENDER
  ────────────────────────────────────────────── */
  return (
    <div
      className="nx-login-root"
      style={{
        minHeight: isModal ? 'auto' : '100vh',
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: isMobile ? '0' : '24px 16px',
        fontFamily: "'Plus Jakarta Sans', 'Inter', system-ui, sans-serif",
        position: 'relative',
        overflow: isModal ? 'visible' : 'hidden',
        background: isModal ? 'transparent' : 'linear-gradient(135deg, #f0fdf4 0%, #ffffff 50%, #ecfdf5 100%)',
      }}
    >
      {/* Background decorations – only when not modal */}
      {!isModal && (
        <>
          <div className="nx-blob" style={{ width: 400, height: 400, background: 'rgba(5,150,105,.18)', top: '-10%', right: '-8%' }} />
          <div className="nx-blob" style={{ width: 350, height: 350, background: 'rgba(16,185,129,.12)', bottom: '-8%', left: '-6%', animationDelay: '4s' }} />
          <div className="nx-blob" style={{ width: 220, height: 220, background: 'rgba(52,211,153,.10)', top: '55%', right: '10%', animationDelay: '2s' }} />
          {/* Subtle grid */}
          <div style={{
            position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0,
            backgroundImage: 'radial-gradient(circle, #059669 1px, transparent 1px)',
            backgroundSize: '40px 40px',
            opacity: .04,
          }} />
        </>
      )}

      {/* Card */}
      <div
        className="nx-card"
        style={{
          width: cardW,
          maxWidth: isMobile ? '100%' : '480px',
          padding: cardPad,
          position: 'relative',
          zIndex: 1,
          borderRadius: isMobile ? (isModal ? '24px' : '0') : '28px',
          minHeight: isMobile && !isModal ? '100vh' : 'auto',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        {/* Close button for modal */}
        {isModal && onClose && (
          <button
            onClick={onClose}
            aria-label="Close"
            style={{
              position: 'absolute', top: 20, right: 20,
              width: 36, height: 36, border: 'none', borderRadius: '50%',
              background: '#f1f5f9', cursor: 'pointer', display: 'flex',
              alignItems: 'center', justifyContent: 'center', color: '#64748b',
              transition: 'background .18s',
            }}
            onMouseEnter={e => (e.currentTarget.style.background = '#e2e8f0')}
            onMouseLeave={e => (e.currentTarget.style.background = '#f1f5f9')}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
          </button>
        )}

        {/* ── LOGO ── */}
        <div className="nx-logo-float" style={{ marginBottom: step === 'success' ? 12 : 24, marginTop: isMobile ? 16 : 0 }}>
          <Logo size={isMobile ? 'lg' : 'xl'} dark={false} />
        </div>

        {/* ════════════════════════════════
            STEP 1 – Phone Number
        ════════════════════════════════ */}
        {step === 'phone' && (
          <form
            onSubmit={sendOtp}
            style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 20 }}
            autoComplete="on"
          >
            {/* Title */}
            <div style={{ textAlign: 'center', marginBottom: 4 }}>
              <h1 style={{ margin: 0, fontSize: isMobile ? '1.55rem' : '1.75rem', fontWeight: 800, color: '#0f172a', lineHeight: 1.2 }}>
                Welcome Back!
              </h1>
              <p style={{ margin: '8px 0 0', color: '#64748b', fontSize: '0.92rem', fontWeight: 500 }}>
                Enter your mobile number to continue
              </p>
              <DecorativeDots />
            </div>

            {/* Phone input */}
            <div>
              <label style={{ display: 'block', marginBottom: 8, fontSize: '.85rem', fontWeight: 700, color: '#374151', textTransform: 'uppercase', letterSpacing: '.6px' }}>
                Mobile Number
              </label>
              <div className="nx-phone-wrap">
                <div className="nx-flag">
                  🇮🇳 &nbsp;+91
                </div>
                <input
                  id="nx-mobile-input"
                  className="nx-phone-input"
                  type="tel"
                  inputMode="numeric"
                  autoComplete="tel"
                  placeholder="Enter 10-digit number"
                  value={mobile}
                  maxLength={10}
                  onChange={e => handleMobileInput(e.target.value)}
                  disabled={loading}
                  autoFocus
                />
              </div>
            </div>

            {/* Error / success */}
            {error && (
              <div className="nx-msg error">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
                {error}
              </div>
            )}

            {/* CTA */}
            <button id="nx-send-otp-btn" type="submit" className="nx-btn-primary" disabled={loading || mobile.length < 10}>
              {loading ? <Spinner /> : (
                <>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 1.18h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.91 8.96a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" /></svg>
                  Send OTP
                </>
              )}
            </button>

            <p style={{ textAlign: 'center', color: '#94a3b8', fontSize: '.78rem', margin: '4px 0 0', lineHeight: 1.6 }}>
              By continuing, you agree to our&nbsp;
              <span style={{ color: '#059669', fontWeight: 700, cursor: 'pointer' }}>Terms of Service</span>
              &nbsp;&amp;&nbsp;
              <span style={{ color: '#059669', fontWeight: 700, cursor: 'pointer' }}>Privacy Policy</span>
            </p>
          </form>
        )}

        {/* ════════════════════════════════
            STEP 2 – OTP Verification
        ════════════════════════════════ */}
        {step === 'otp' && (
          <form
            onSubmit={verifyOtp}
            style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 22, alignItems: 'center' }}
            autoComplete="one-time-code"
          >
            {/* Back */}
            <div style={{ width: '100%', display: 'flex', alignItems: 'center', marginBottom: -8 }}>
              <button type="button" className="nx-back-btn" onClick={() => { setStep('phone'); setError(''); setSuccess(''); setOtp(Array(6).fill('')); }}>
                <BackArrow /> Change Number
              </button>
            </div>

            {/* Title */}
            <div style={{ textAlign: 'center' }}>
              {/* Phone icon circle */}
              <div className="nx-pulse" style={{
                width: 72, height: 72, borderRadius: '50%',
                background: 'linear-gradient(135deg, #ecfdf5, #d1fae5)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 16px',
              }}>
                <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2.2" strokeLinecap="round">
                  <rect x="5" y="2" width="14" height="20" rx="2" /><line x1="12" y1="18" x2="12.01" y2="18" />
                </svg>
              </div>
              <h2 style={{ margin: 0, fontSize: isMobile ? '1.4rem' : '1.6rem', fontWeight: 800, color: '#0f172a' }}>
                Verify OTP
              </h2>
              <p style={{ margin: '8px 0 0', color: '#64748b', fontSize: '.9rem', fontWeight: 500 }}>
                Sent to <strong style={{ color: '#059669' }}>+91 {mobile}</strong>
              </p>
              <DecorativeDots />
            </div>

            {/* OTP boxes */}
            <div
              style={{
                display: 'flex',
                gap: isMobile ? (windowW < 360 ? 6 : 8) : 12,
                justifyContent: 'center',
                width: '100%',
              }}
            >
              {otp.map((digit, idx) => (
                <input
                  key={idx}
                  ref={el => { otpRefs.current[idx] = el; }}
                  className={`nx-otp-box${digit ? ' filled' : ''}`}
                  type="text"
                  inputMode="numeric"
                  autoComplete={idx === 0 ? 'one-time-code' : 'off'}
                  maxLength={1}
                  value={digit}
                  onChange={e => onDigitChange(e.target.value, idx)}
                  onKeyDown={e => onDigitKey(e, idx)}
                  onPaste={idx === 0 ? onDigitPaste : undefined}
                  disabled={loading}
                  aria-label={`OTP digit ${idx + 1}`}
                />
              ))}
            </div>

            {/* Success message */}
            {success && !error && (
              <div className="nx-msg success">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><polyline points="20 6 9 17 4 12" /></svg>
                {success}
              </div>
            )}

            {/* Error message */}
            {error && (
              <div className="nx-msg error">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
                {error}
              </div>
            )}

            {/* Verify CTA */}
            <button id="nx-verify-otp-btn" type="submit" className="nx-btn-primary" disabled={loading || otp.some(d => d === '')}>
              {loading ? <Spinner /> : (
                <>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><polyline points="9 11 12 14 22 4" /><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" /></svg>
                  Verify & Login
                </>
              )}
            </button>

            {/* Resend row */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#64748b', fontSize: '.88rem' }}>
              <span>Didn't receive it?</span>
              {countdown > 0 ? (
                <span style={{ color: '#94a3b8', fontWeight: 700 }}>
                  Resend in {countdown}s
                </span>
              ) : (
                <button type="button" className="nx-resend" onClick={resend} disabled={loading}>
                  Resend OTP
                </button>
              )}
            </div>

            {/* Auto-fill notice (mobile only) */}
            <p style={{ textAlign: 'center', color: '#94a3b8', fontSize: '.75rem', margin: 0, lineHeight: 1.5 }}>
              📲 OTP will auto-fill on supported mobile browsers
            </p>
          </form>
        )}

        {/* ════════════════════════════════
            STEP 3 – Complete Profile (New Users)
        ════════════════════════════════ */}
        {step === 'profile' && (
          <form
            onSubmit={submitProfile}
            style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 16 }}
          >
            {/* Title */}
            <div style={{ textAlign: 'center', marginBottom: 2 }}>
              <h2 style={{ margin: 0, fontSize: isMobile ? '1.35rem' : '1.5rem', fontWeight: 800, color: '#0f172a' }}>
                Complete Profile
              </h2>
              <p style={{ margin: '6px 0 0', color: '#64748b', fontSize: '.88rem', fontWeight: 500 }}>
                Set up your details to discover investments
              </p>
              <DecorativeDots />
            </div>

            {/* Full Name */}
            <div>
              <label style={{ display: 'block', marginBottom: 6, fontSize: '.8rem', fontWeight: 750, color: '#475569', textTransform: 'uppercase' }}>
                Full Name *
              </label>
              <div className="nx-input-wrap">
                <input
                  className="nx-input-field"
                  type="text"
                  placeholder="Enter your name"
                  value={profileName}
                  onChange={e => { setProfileName(e.target.value); setError(''); }}
                  disabled={loading}
                  autoFocus
                />
              </div>
            </div>

            {/* Gender Select */}
            <div>
              <label style={{ display: 'block', marginBottom: 6, fontSize: '.8rem', fontWeight: 750, color: '#475569', textTransform: 'uppercase' }}>
                Gender
              </label>
              <div className="nx-gender-container">
                {(['Male', 'Female', 'Other'] as const).map(g => (
                  <button
                    key={g}
                    type="button"
                    className={`nx-gender-pill${profileGender === g ? ' active' : ''}`}
                    onClick={() => setProfileGender(g)}
                    disabled={loading}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>

            {/* Location Area */}
            <div>
              <label style={{ display: 'block', marginBottom: 6, fontSize: '.8rem', fontWeight: 750, color: '#475569', textTransform: 'uppercase' }}>
                District / Area
              </label>
              <div className="nx-input-wrap">
                <input
                  className="nx-input-field"
                  type="text"
                  placeholder="e.g. Hyderabad / Guntur"
                  value={profileArea}
                  onChange={e => { setProfileArea(e.target.value); setError(''); }}
                  disabled={loading}
                />
              </div>
            </div>

            {/* Error / success */}
            {error && (
              <div className="nx-msg error">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
                {error}
              </div>
            )}

            {/* Save CTA */}
            <button id="nx-save-profile-btn" type="submit" className="nx-btn-primary" disabled={loading}>
              {loading ? <Spinner /> : 'Save & Continue'}
            </button>
          </form>
        )}

        {/* ════════════════════════════════
            STEP 4 – Success
        ════════════════════════════════ */}
        {step === 'success' && (
          <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20, paddingTop: 8 }}>
            <CheckIcon size={80} />
            <div style={{ textAlign: 'center' }}>
              <h2 style={{ margin: '0 0 8px', fontSize: '1.6rem', fontWeight: 800, color: '#0f172a' }}>
                Verified! 🎉
              </h2>
              <p style={{ margin: 0, color: '#64748b', fontSize: '.95rem', fontWeight: 500 }}>
                Logging you in to&nbsp;
                <strong style={{ color: '#059669' }}>TheNexOpp</strong>...
              </p>
            </div>
            {/* Loading bar */}
            <div style={{ width: '100%', height: 4, borderRadius: 4, background: '#e2e8f0', overflow: 'hidden' }}>
              <div style={{
                height: '100%',
                background: 'linear-gradient(90deg, #059669, #34d399)',
                borderRadius: 4,
                animation: 'nxShimmer 1.4s linear infinite',
                backgroundSize: '400px 100%',
                backgroundImage: 'linear-gradient(90deg, #059669 0%, #34d399 50%, #059669 100%)',
              }} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LoginPage;
