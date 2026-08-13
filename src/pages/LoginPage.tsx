import React, { useState, useEffect, useRef } from 'react';
import { Logo } from '../components/common/Logo';
import { useAuth } from '../context/AuthContext';
import { 
  FaUser, 
  FaPhoneAlt, 
  FaEnvelope, 
  FaShieldAlt, 
  FaCheckCircle, 
  FaBriefcase, 
  FaArrowRight, 
  FaLock,
  FaKey,
  FaEdit
} from 'react-icons/fa';

interface RegisteredUser {
  fullName: string;
  mobile?: string;
  email?: string;
}

interface LoginPageProps {
  onClose?: () => void;
  isModal?: boolean;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onClose, isModal = false }) => {
  const { loginWithGmail } = useAuth();

  // Auth Mode: 'email' | 'mobile'
  const [authMethod, setAuthMethod] = useState<'email' | 'mobile'>('email');

  // Form Fields (Only Name, Mobile, Email - No Gender or District)
  const [fullName, setFullName] = useState('');
  const [mobile, setMobile] = useState('');
  const [email, setEmail] = useState('');
  const [rememberMe, setRememberMe] = useState(true);

  // Email OTP Step State
  const [otpStep, setOtpStep] = useState<'input' | 'verify'>('input');
  const [otpInput, setOtpInput] = useState('');
  const [devOtpHint, setDevOtpHint] = useState('');

  // UI notifications & states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Custom Mobile OTP States
  const [mobileOtpStep, setMobileOtpStep] = useState<'input' | 'verify'>('input');
  const [mobileOtpDigits, setMobileOtpDigits] = useState<string[]>(Array(6).fill(''));
  const [resendCountdown, setResendCountdown] = useState<number>(0);
  const otpInputsRef = useRef<(HTMLInputElement | null)[]>([]);

  // Mobile OTP resend countdown timer
  useEffect(() => {
    let timer: any;
    if (resendCountdown > 0) {
      timer = setInterval(() => {
        setResendCountdown((prev) => prev - 1);
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [resendCountdown]);

  // Load remembered credentials
  useEffect(() => {
    try {
      const rememberedMobile = localStorage.getItem('nexopp_remembered_mobile');
      const rememberedEmail = localStorage.getItem('nexopp_remembered_email');
      const rememberedName = localStorage.getItem('nexopp_remembered_name');

      if (rememberedMobile) setMobile(rememberedMobile);
      if (rememberedEmail) setEmail(rememberedEmail);
      if (rememberedName) setFullName(rememberedName);
    } catch (e) {}
  }, []);

  const getRegisteredUsers = (): RegisteredUser[] => {
    try {
      const data = localStorage.getItem('nexopp_registered_users');
      return data ? JSON.parse(data) : [];
    } catch (e) {
      return [];
    }
  };

  const saveRegisteredUser = (user: RegisteredUser) => {
    try {
      const users = getRegisteredUsers();
      const existingIndex = users.findIndex(u => (u.email && u.email === user.email) || (u.mobile && u.mobile === user.mobile));
      if (existingIndex >= 0) {
        users[existingIndex] = { ...users[existingIndex], ...user };
      } else {
        users.push(user);
      }
      localStorage.setItem('nexopp_registered_users', JSON.stringify(users));

      if (rememberMe) {
        if (user.mobile) localStorage.setItem('nexopp_remembered_mobile', user.mobile);
        if (user.email) localStorage.setItem('nexopp_remembered_email', user.email);
        if (user.fullName) localStorage.setItem('nexopp_remembered_name', user.fullName);
      }
    } catch (e) {}
  };

  // Auto-detect existing user
  const handleMobileChange = (val: string) => {
    const clean = val.replace(/\D/g, '').slice(0, 10);
    setMobile(clean);
    setError('');

    if (clean.length === 10) {
      const users = getRegisteredUsers();
      const match = users.find(u => u.mobile === clean);
      if (match) {
        if (match.fullName) setFullName(match.fullName);
        if (match.email) setEmail(match.email);
      }
    }
  };

  const handleEmailChange = (val: string) => {
    setEmail(val);
    setError('');
    const users = getRegisteredUsers();
    const match = users.find(u => u.email?.toLowerCase() === val.trim().toLowerCase());
    if (match && match.fullName && !fullName) {
      setFullName(match.fullName);
    }
  };

  // Dynamically load MSG91 OTP Widget SDK script
  useEffect(() => {
    const existingScript = document.getElementById('msg91-widget-script');
    if (!existingScript) {
      const script = document.createElement('script');
      script.id = 'msg91-widget-script';
      script.src = 'https://control.msg91.com/app/assets/otp-provider/otp-provider.js';
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  // 1. SEND EMAIL OTP
  const handleSendEmailOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!fullName.trim()) {
      setError('Please enter your full name');
      return;
    }
    if (!email || !email.includes('@')) {
      setError('Please enter a valid Gmail / Email address');
      return;
    }

    setLoading(true);
    try {
      const apiBase = import.meta.env.VITE_API_BASE_URL || '/api';
      const res = await fetch(`${apiBase}/auth/send-email-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          fullName: fullName.trim(),
        }),
      });

      const data = await res.json();
      setLoading(false);

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to send OTP code to email');
      }

      setOtpStep('verify');
      if (data.otp) {
        setDevOtpHint(data.otp);
      }
      setSuccess(`6-digit OTP sent to ${email.trim()}. Please enter the verification code.`);
    } catch (err: any) {
      setLoading(false);
      setError(err.message || 'Error sending OTP. Please try again.');
    }
  };

  // 2. VERIFY EMAIL OTP
  const handleVerifyEmailOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!otpInput || otpInput.trim().length !== 6) {
      setError('Please enter the valid 6-digit OTP code');
      return;
    }

    setLoading(true);
    try {
      const apiBase = import.meta.env.VITE_API_BASE_URL || '/api';
      const res = await fetch(`${apiBase}/auth/verify-email-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          email: email.trim(),
          otp: otpInput.trim(),
          fullName: fullName.trim(),
          mobile: mobile.trim(),
        }),
      });

      const data = await res.json();
      setLoading(false);

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'OTP verification failed');
      }

      saveRegisteredUser({
        fullName: fullName.trim(),
        email: email.trim(),
        mobile: mobile.trim(),
      });

      loginWithGmail(email.trim(), 'Verified Investor', fullName.trim(), mobile.trim());
      onClose?.();
    } catch (err: any) {
      setLoading(false);
      setError(err.message || 'OTP verification failed. Please try again.');
    }
  };

  // 3. ONE-CLICK GOOGLE SIGN-IN FLOW
  const handleGoogleAccountLogin = () => {
    setError('');
    let targetEmail = email.trim();
    let targetName = fullName.trim();

    if (!targetEmail) {
      targetEmail = prompt('Enter your Gmail address to login with Google Account:', 'user@gmail.com') || '';
      if (!targetEmail || !targetEmail.includes('@')) {
        setError('Valid Gmail address is required for Google Account sign-in.');
        return;
      }
      setEmail(targetEmail);
    }

    if (!targetName) {
      const nameFromEmail = targetEmail.split('@')[0];
      targetName = nameFromEmail.charAt(0).toUpperCase() + nameFromEmail.slice(1);
      setFullName(targetName);
    }

    saveRegisteredUser({
      fullName: targetName,
      email: targetEmail,
      mobile: mobile.trim(),
    });

    loginWithGmail(targetEmail, 'Verified Investor', targetName, mobile.trim());
    onClose?.();
  };

  // 4. CUSTOM DIRECT MSG91 MOBILE OTP FLOW
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!fullName.trim()) {
      setError('Please enter your full name');
      return;
    }
    if (!mobile || mobile.length !== 10 || !/^\d+$/.test(mobile)) {
      setError('Please enter a valid 10-digit mobile number');
      return;
    }

    setLoading(true);
    try {
      const apiBase = import.meta.env.VITE_API_BASE_URL || '/api';
      const res = await fetch(`${apiBase}/auth/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mobile: mobile.trim() }),
      });

      const data = await res.json();
      setLoading(false);

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to send verification code. Please try again.');
      }

      setSuccess('Verification code sent successfully!');
      setMobileOtpStep('verify');
      setMobileOtpDigits(Array(6).fill(''));
      setResendCountdown(30);
    } catch (err: any) {
      setLoading(false);
      setError(err.message || 'Could not send OTP. Please try again.');
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const otpCode = mobileOtpDigits.join('');
    if (otpCode.length !== 6 || !/^\d+$/.test(otpCode)) {
      setError('Please enter a valid 6-digit OTP');
      return;
    }

    setLoading(true);
    try {
      const apiBase = import.meta.env.VITE_API_BASE_URL || '/api';
      const res = await fetch(`${apiBase}/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mobile: mobile.trim(),
          otp: otpCode,
          fullName: fullName.trim()
        }),
      });

      const data = await res.json();
      setLoading(false);

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Verification failed. Please check the code and try again.');
      }

      // Save to localStorage if rememberMe is enabled
      if (rememberMe) {
        localStorage.setItem('nexopp_remembered_mobile', mobile.trim());
        localStorage.setItem('nexopp_remembered_name', fullName.trim());
      } else {
        localStorage.removeItem('nexopp_remembered_mobile');
      }

      saveRegisteredUser({
        fullName: fullName.trim(),
        mobile: mobile.trim(),
      });

      const userEmail = `${mobile.trim()}@nexopp.in`;
      loginWithGmail(userEmail, 'Verified Investor', fullName.trim(), mobile.trim());
      onClose?.();
    } catch (err: any) {
      setLoading(false);
      setError(err.message || 'OTP verification failed. Please try again.');
    }
  };

  const handleResendOtp = async () => {
    if (resendCountdown > 0) return;
    setError('');
    setSuccess('');

    setLoading(true);
    try {
      const apiBase = import.meta.env.VITE_API_BASE_URL || '/api';
      const res = await fetch(`${apiBase}/auth/resend-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mobile: mobile.trim() }),
      });

      const data = await res.json();
      setLoading(false);

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to resend verification code.');
      }

      setSuccess('OTP code resent successfully!');
      setMobileOtpDigits(Array(6).fill(''));
      setResendCountdown(30);
    } catch (err: any) {
      setLoading(false);
      setError(err.message || 'Could not resend OTP. Please try again.');
    }
  };

  const handleOtpDigitChange = (value: string, index: number) => {
    // Only allow digits
    const cleanedVal = value.replace(/\D/g, '').slice(-1);
    const newDigits = [...mobileOtpDigits];
    newDigits[index] = cleanedVal;
    setMobileOtpDigits(newDigits);
    setError('');

    // Auto-focus next input
    if (cleanedVal !== '' && index < 5) {
      otpInputsRef.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === 'Backspace') {
      if (mobileOtpDigits[index] === '' && index > 0) {
        // Focus previous input and clear it
        const newDigits = [...mobileOtpDigits];
        newDigits[index - 1] = '';
        setMobileOtpDigits(newDigits);
        otpInputsRef.current[index - 1]?.focus();
        e.preventDefault();
      } else {
        const newDigits = [...mobileOtpDigits];
        newDigits[index] = '';
        setMobileOtpDigits(newDigits);
      }
      setError('');
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pastedData.length > 0) {
      const newDigits = [...mobileOtpDigits];
      for (let i = 0; i < 6; i++) {
        newDigits[i] = pastedData[i] || '';
      }
      setMobileOtpDigits(newDigits);
      setError('');
      // Focus the last filled input
      const focusIndex = Math.min(pastedData.length - 1, 5);
      otpInputsRef.current[focusIndex]?.focus();
    }
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
      {/* Main Login Card Container */}
      <div style={{
        width: '100%',
        maxWidth: '1040px',
        backgroundColor: '#FFFFFF',
        borderRadius: '24px',
        boxShadow: '0 25px 60px -15px rgba(15, 23, 42, 0.12), 0 0 1px 1px rgba(0, 0, 0, 0.05)',
        display: 'flex',
        flexDirection: 'row',
        overflow: 'hidden',
        minHeight: '580px'
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
          {/* Ambient Background Lighting */}
          <div style={{
            position: 'absolute',
            top: '-80px',
            left: '-80px',
            width: '260px',
            height: '260px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(52, 211, 153, 0.15) 0%, transparent 70%)',
            pointerEvents: 'none'
          }} />
          <div style={{
            position: 'absolute',
            bottom: '-100px',
            right: '-100px',
            width: '320px',
            height: '320px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(16, 185, 129, 0.2) 0%, transparent 70%)',
            pointerEvents: 'none'
          }} />

          {/* Top Brand Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', zIndex: 2 }}>
            <Logo size="lg" dark={true} />
          </div>

          {/* Center Content Section */}
          <div style={{ margin: '36px 0', zIndex: 2 }}>
            <h1 style={{ fontSize: '2rem', fontWeight: 800, margin: '0 0 10px 0', lineHeight: 1.25, color: '#FFFFFF' }}>
              Welcome Back! 👋
            </h1>
            <p style={{ fontSize: '0.95rem', color: '#D1FAE5', margin: 0, lineHeight: 1.6, fontWeight: 400 }}>
              Sign in with your Gmail or Mobile Number to access exclusive investment opportunities.
            </p>

            {/* 3D Shield & Passcode Pedestal */}
            <div style={{
              margin: '32px auto 0 auto',
              width: '100%',
              maxWidth: '280px',
              height: '180px',
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <div style={{
                position: 'absolute',
                bottom: '15px',
                width: '210px',
                height: '55px',
                borderRadius: '50%',
                background: 'linear-gradient(180deg, rgba(52, 211, 153, 0.35) 0%, rgba(5, 150, 105, 0.15) 100%)',
                border: '2px solid rgba(52, 211, 153, 0.5)',
                boxShadow: '0 15px 30px rgba(0,0,0,0.3), inset 0 0 15px rgba(52, 211, 153, 0.4)'
              }} />

              <div style={{
                width: '100px',
                height: '110px',
                borderRadius: '24px 24px 50px 50px',
                background: 'linear-gradient(145deg, #10B981 0%, #047857 100%)',
                border: '3px solid #6EE7B7',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 20px 35px rgba(0,0,0,0.3)',
                zIndex: 3,
                transform: 'translateY(-10px)'
              }}>
                <div style={{
                  width: '54px',
                  height: '54px',
                  borderRadius: '16px',
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                  backdropFilter: 'blur(4px)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <FaLock style={{ fontSize: '24px', color: '#FFFFFF' }} />
                </div>
              </div>

              <div style={{
                position: 'absolute',
                left: '0px',
                top: '45px',
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                padding: '10px 14px',
                borderRadius: '14px',
                boxShadow: '0 10px 25px rgba(0,0,0,0.25)',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                zIndex: 4,
                border: '1px solid rgba(255,255,255,0.4)'
              }}>
                <div style={{
                  width: '26px',
                  height: '26px',
                  borderRadius: '50%',
                  backgroundColor: '#007A55',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <FaUser style={{ fontSize: '12px', color: '#FFFFFF' }} />
                </div>
                <div style={{ width: '32px', height: '6px', borderRadius: '3px', backgroundColor: '#CBD5E1' }} />
              </div>

              <div style={{
                position: 'absolute',
                right: '0px',
                top: '50px',
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                padding: '10px 14px',
                borderRadius: '14px',
                boxShadow: '0 10px 25px rgba(0,0,0,0.25)',
                zIndex: 4,
                border: '1px solid rgba(255,255,255,0.4)',
                fontSize: '0.88rem',
                fontWeight: 900,
                color: '#007A55',
                letterSpacing: '2px'
              }}>
                ✦✦✦✦
              </div>
            </div>
          </div>

          {/* Bottom Features List */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '12px',
            borderTop: '1px solid rgba(255, 255, 255, 0.15)',
            paddingTop: '20px',
            zIndex: 2
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{
                width: '28px',
                height: '28px',
                borderRadius: '50%',
                backgroundColor: 'rgba(255,255,255,0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <FaShieldAlt style={{ fontSize: '13px', color: '#A7F3D0' }} />
              </div>
              <div>
                <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#FFFFFF' }}>Secure</div>
                <div style={{ fontSize: '0.72rem', color: '#D1FAE5' }}>Protected data</div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{
                width: '28px',
                height: '28px',
                borderRadius: '50%',
                backgroundColor: 'rgba(255,255,255,0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <FaCheckCircle style={{ fontSize: '13px', color: '#A7F3D0' }} />
              </div>
              <div>
                <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#FFFFFF' }}>Verified</div>
                <div style={{ fontSize: '0.72rem', color: '#D1FAE5' }}>OTP Login</div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{
                width: '28px',
                height: '28px',
                borderRadius: '50%',
                backgroundColor: 'rgba(255,255,255,0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <FaBriefcase style={{ fontSize: '13px', color: '#A7F3D0' }} />
              </div>
              <div>
                <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#FFFFFF' }}>Investor</div>
                <div style={{ fontSize: '0.72rem', color: '#D1FAE5' }}>Direct Access</div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT PANEL - Clean White Form Area */}
        <div style={{
          flex: '1 1 55%',
          padding: '44px 48px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          backgroundColor: '#FFFFFF',
          position: 'relative'
        }}>
          {onClose && (
            <button
              onClick={onClose}
              style={{
                position: 'absolute',
                top: '20px',
                right: '20px',
                background: '#F1F5F9',
                border: 'none',
                color: '#64748B',
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                fontSize: '16px',
                fontWeight: 700,
                transition: 'all 0.2s',
                zIndex: 10
              }}
              title="Close Login Modal"
            >
              ✕
            </button>
          )}

          {/* Form Header */}
          <div style={{ marginBottom: '24px' }}>
            <h2 style={{ fontSize: '1.85rem', fontWeight: 800, color: '#0F172A', margin: '0 0 6px 0' }}>
              Sign In
            </h2>
            <p style={{ fontSize: '0.92rem', color: '#64748B', margin: 0 }}>
              Enter your details to verify with Gmail / Google OTP or Mobile OTP
            </p>
          </div>

          {/* Authentication Method Selector Tabs */}
          <div style={{
            display: 'flex',
            backgroundColor: '#F1F5F9',
            borderRadius: '12px',
            padding: '4px',
            marginBottom: '24px'
          }}>
            <button
              type="button"
              onClick={() => {
                setAuthMethod('email');
                setError('');
                setSuccess('');
              }}
              style={{
                flex: 1,
                padding: '10px 14px',
                borderRadius: '10px',
                border: 'none',
                backgroundColor: authMethod === 'email' ? '#FFFFFF' : 'transparent',
                color: authMethod === 'email' ? '#007A55' : '#64748B',
                fontWeight: 700,
                fontSize: '0.9rem',
                cursor: 'pointer',
                boxShadow: authMethod === 'email' ? '0 2px 8px rgba(0,0,0,0.06)' : 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                transition: 'all 0.2s'
              }}
            >
              <FaEnvelope style={{ fontSize: '14px' }} /> Gmail / Email OTP
            </button>
            <button
              type="button"
              onClick={() => {
                setAuthMethod('mobile');
                setError('');
                setSuccess('');
              }}
              style={{
                flex: 1,
                padding: '10px 14px',
                borderRadius: '10px',
                border: 'none',
                backgroundColor: authMethod === 'mobile' ? '#FFFFFF' : 'transparent',
                color: authMethod === 'mobile' ? '#007A55' : '#64748B',
                fontWeight: 700,
                fontSize: '0.9rem',
                cursor: 'pointer',
                boxShadow: authMethod === 'mobile' ? '0 2px 8px rgba(0,0,0,0.06)' : 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                transition: 'all 0.2s'
              }}
            >
              <FaPhoneAlt style={{ fontSize: '13px' }} /> Mobile OTP
            </button>
          </div>

          {/* Quick Google Sign-In Button */}
          <button
            type="button"
            onClick={handleGoogleAccountLogin}
            style={{
              width: '100%',
              padding: '12px 16px',
              borderRadius: '12px',
              backgroundColor: '#FFFFFF',
              border: '1.5px solid #E2E8F0',
              color: '#1E293B',
              fontSize: '0.95rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '12px',
              boxShadow: '0 2px 6px rgba(0,0,0,0.04)',
              transition: 'all 0.2s ease',
              marginBottom: '20px'
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"/>
              <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.26v3.15C3.25 21.3 7.31 24 12 24z"/>
              <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.26C.46 8.18 0 10.02 0 12s.46 3.82 1.26 5.42l4.02-3.15z"/>
              <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.25 2.7 1.26 6.58l4.02 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
            </svg>
            Sign in with Google Account
          </button>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            marginBottom: '20px',
            color: '#94A3B8',
            fontSize: '0.8rem',
            fontWeight: 600
          }}>
            <div style={{ flex: 1, height: '1px', backgroundColor: '#E2E8F0' }} />
            <span>OR CONTINUE WITH DETAILS</span>
            <div style={{ flex: 1, height: '1px', backgroundColor: '#E2E8F0' }} />
          </div>

          {/* Error & Success Messages */}
          {error && (
            <div style={{
              backgroundColor: '#FEF2F2',
              border: '1px solid #FECACA',
              color: '#DC2626',
              padding: '12px 16px',
              borderRadius: '12px',
              fontSize: '0.88rem',
              fontWeight: 600,
              marginBottom: '20px'
            }}>
              {error}
            </div>
          )}

          {success && (
            <div style={{
              backgroundColor: '#F0FDF4',
              border: '1px solid #BBF7D0',
              color: '#16A34A',
              padding: '12px 16px',
              borderRadius: '12px',
              fontSize: '0.88rem',
              fontWeight: 600,
              marginBottom: '20px'
            }}>
              {success}
            </div>
          )}

          {/* ── EMAIL / GMAIL AUTHENTICATION FORM ── */}
          {authMethod === 'email' && (
            otpStep === 'input' ? (
              <form onSubmit={handleSendEmailOtp} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                {/* 1. Full Name */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: '8px' }}>
                    Full Name <span style={{ color: '#DC2626' }}>*</span>
                  </label>
                  <div style={{ position: 'relative' }}>
                    <FaUser style={{
                      position: 'absolute',
                      left: '16px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: '#007A55',
                      fontSize: '15px'
                    }} />
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => {
                        setFullName(e.target.value);
                        setError('');
                      }}
                      placeholder="e.g. Rahul Sharma"
                      style={{
                        width: '100%',
                        padding: '14px 16px 14px 44px',
                        borderRadius: '12px',
                        border: '1.5px solid #E2E8F0',
                        fontSize: '0.95rem',
                        color: '#0F172A',
                        backgroundColor: '#F8FAFC',
                        outline: 'none',
                        boxSizing: 'border-box'
                      }}
                      required
                    />
                  </div>
                </div>

                {/* 2. Mobile Number */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: '8px' }}>
                    Mobile Number <span style={{ color: '#DC2626' }}>*</span>
                  </label>
                  <div style={{ position: 'relative' }}>
                    <div style={{
                      position: 'absolute',
                      left: '14px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      color: '#007A55',
                      fontWeight: 700,
                      fontSize: '0.9rem'
                    }}>
                      <FaPhoneAlt style={{ fontSize: '13px' }} />
                      <span>+91</span>
                    </div>
                    <input
                      type="tel"
                      value={mobile}
                      onChange={(e) => handleMobileChange(e.target.value)}
                      placeholder="9876543210"
                      maxLength={10}
                      style={{
                        width: '100%',
                        padding: '14px 16px 14px 75px',
                        borderRadius: '12px',
                        border: '1.5px solid #E2E8F0',
                        fontSize: '0.95rem',
                        color: '#0F172A',
                        backgroundColor: '#F8FAFC',
                        outline: 'none',
                        boxSizing: 'border-box'
                      }}
                      required
                    />
                  </div>
                </div>

                {/* 3. Gmail / Email Address */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: '8px' }}>
                    Gmail / Email Address <span style={{ color: '#DC2626' }}>*</span>
                  </label>
                  <div style={{ position: 'relative' }}>
                    <FaEnvelope style={{
                      position: 'absolute',
                      left: '16px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: '#007A55',
                      fontSize: '15px'
                    }} />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => handleEmailChange(e.target.value)}
                      placeholder="name@gmail.com"
                      style={{
                        width: '100%',
                        padding: '14px 16px 14px 44px',
                        borderRadius: '12px',
                        border: '1.5px solid #E2E8F0',
                        fontSize: '0.95rem',
                        color: '#0F172A',
                        backgroundColor: '#F8FAFC',
                        outline: 'none',
                        boxSizing: 'border-box'
                      }}
                      required
                    />
                  </div>
                </div>

                {/* Checkbox Options */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.88rem', color: '#475569', fontWeight: 500 }}>
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      style={{ width: '17px', height: '17px', accentColor: '#007A55', cursor: 'pointer' }}
                    />
                    Remember me
                  </label>
                </div>

                {/* Submit Send Email OTP Button */}
                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    width: '100%',
                    padding: '14px',
                    borderRadius: '12px',
                    backgroundColor: '#007A55',
                    color: '#FFFFFF',
                    border: 'none',
                    fontSize: '1rem',
                    fontWeight: 700,
                    cursor: loading ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '10px',
                    boxShadow: '0 8px 20px rgba(0, 122, 85, 0.25)',
                    transition: 'all 0.2s ease',
                    marginTop: '4px'
                  }}
                >
                  {loading ? 'Sending OTP Code...' : 'Send OTP to Email'} <FaArrowRight style={{ fontSize: '14px' }} />
                </button>
              </form>
            ) : (
              /* OTP VERIFICATION STEP */
              <form onSubmit={handleVerifyEmailOtp} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                <div style={{
                  padding: '14px 16px',
                  borderRadius: '12px',
                  backgroundColor: '#ECFDF5',
                  border: '1px solid #A7F3D0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}>
                  <div>
                    <div style={{ fontSize: '0.78rem', color: '#065F46', fontWeight: 700 }}>OTP SENT TO</div>
                    <div style={{ fontSize: '0.95rem', color: '#047857', fontWeight: 800 }}>{email}</div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setOtpStep('input');
                      setError('');
                      setSuccess('');
                    }}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#007A55',
                      fontWeight: 700,
                      fontSize: '0.85rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    <FaEdit /> Edit
                  </button>
                </div>

                {/* Dev OTP Display Badge */}
                {devOtpHint && (
                  <div style={{
                    padding: '10px 14px',
                    borderRadius: '10px',
                    backgroundColor: '#FEF3C7',
                    border: '1px solid #FDE68A',
                    color: '#92400E',
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    textAlign: 'center'
                  }}>
                    🔑 Demo OTP Code: <span style={{ fontSize: '1.1rem', letterSpacing: '2px', color: '#B45309' }}>{devOtpHint}</span>
                  </div>
                )}

                {/* 6-Digit Passcode Input */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: '8px' }}>
                    Enter 6-Digit Email OTP <span style={{ color: '#DC2626' }}>*</span>
                  </label>
                  <div style={{ position: 'relative' }}>
                    <FaKey style={{
                      position: 'absolute',
                      left: '16px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: '#007A55',
                      fontSize: '15px'
                    }} />
                    <input
                      type="text"
                      value={otpInput}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, '').slice(0, 6);
                        setOtpInput(val);
                        setError('');
                      }}
                      placeholder="e.g. 123456"
                      maxLength={6}
                      style={{
                        width: '100%',
                        padding: '14px 16px 14px 44px',
                        borderRadius: '12px',
                        border: '1.5px solid #E2E8F0',
                        fontSize: '1.2rem',
                        fontWeight: 800,
                        letterSpacing: '4px',
                        color: '#0F172A',
                        backgroundColor: '#F8FAFC',
                        outline: 'none',
                        boxSizing: 'border-box'
                      }}
                      required
                      autoFocus
                    />
                  </div>
                </div>

                {/* Submit Verify OTP Button */}
                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    width: '100%',
                    padding: '14px',
                    borderRadius: '12px',
                    backgroundColor: '#007A55',
                    color: '#FFFFFF',
                    border: 'none',
                    fontSize: '1rem',
                    fontWeight: 700,
                    cursor: loading ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '10px',
                    boxShadow: '0 8px 20px rgba(0, 122, 85, 0.25)',
                    transition: 'all 0.2s ease',
                    marginTop: '4px'
                  }}
                >
                  {loading ? 'Verifying OTP Code...' : 'Verify Email OTP & Sign In'} <FaArrowRight style={{ fontSize: '14px' }} />
                </button>
              </form>
            )
          )}

          {/* ── MOBILE OTP (MSG91) AUTHENTICATION FORM ── */}
          {/* ── MOBILE OTP (MSG91) AUTHENTICATION FORM ── */}
          {authMethod === 'mobile' && (
            mobileOtpStep === 'input' ? (
              <form onSubmit={handleSendOtp} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                {/* 1. Full Name */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: '8px' }}>
                    Full Name <span style={{ color: '#DC2626' }}>*</span>
                  </label>
                  <div style={{ position: 'relative' }}>
                    <FaUser style={{
                      position: 'absolute',
                      left: '16px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: '#007A55',
                      fontSize: '15px'
                    }} />
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => {
                        setFullName(e.target.value);
                        setError('');
                      }}
                      placeholder="e.g. Rahul Sharma"
                      style={{
                        width: '100%',
                        padding: '14px 16px 14px 44px',
                        borderRadius: '12px',
                        border: '1.5px solid #E2E8F0',
                        fontSize: '0.95rem',
                        color: '#0F172A',
                        backgroundColor: '#F8FAFC',
                        outline: 'none',
                        boxSizing: 'border-box'
                      }}
                      required
                    />
                  </div>
                </div>

                {/* 2. Mobile Number */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: '8px' }}>
                    Mobile Number <span style={{ color: '#DC2626' }}>*</span>
                  </label>
                  <div style={{ position: 'relative' }}>
                    <div style={{
                      position: 'absolute',
                      left: '14px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      color: '#007A55',
                      fontWeight: 700,
                      fontSize: '0.9rem'
                    }}>
                      <FaPhoneAlt style={{ fontSize: '13px' }} />
                      <span>+91</span>
                    </div>
                    <input
                      type="tel"
                      value={mobile}
                      onChange={(e) => handleMobileChange(e.target.value)}
                      placeholder="9876543210"
                      maxLength={10}
                      style={{
                        width: '100%',
                        padding: '14px 16px 14px 75px',
                        borderRadius: '12px',
                        border: '1.5px solid #E2E8F0',
                        fontSize: '0.95rem',
                        color: '#0F172A',
                        backgroundColor: '#F8FAFC',
                        outline: 'none',
                        boxSizing: 'border-box'
                      }}
                      required
                    />
                  </div>
                </div>

                {/* Checkbox Options */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.88rem', color: '#475569', fontWeight: 500 }}>
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      style={{ width: '17px', height: '17px', accentColor: '#007A55', cursor: 'pointer' }}
                    />
                    Remember me
                  </label>
                </div>

                {/* Send OTP Button */}
                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    width: '100%',
                    padding: '14px',
                    borderRadius: '12px',
                    backgroundColor: '#007A55',
                    color: '#FFFFFF',
                    border: 'none',
                    fontSize: '1rem',
                    fontWeight: 700,
                    cursor: loading ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '10px',
                    boxShadow: '0 8px 20px rgba(0, 122, 85, 0.25)',
                    transition: 'all 0.2s ease',
                    marginTop: '4px'
                  }}
                >
                  {loading ? 'Sending OTP Code...' : 'Send OTP'} <FaArrowRight style={{ fontSize: '14px' }} />
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerifyOtp} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                {/* Header Information */}
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px',
                  alignItems: 'center',
                  backgroundColor: '#E6F4EA',
                  padding: '12px 16px',
                  borderRadius: '12px',
                  border: '1px solid #A3D9C9'
                }}>
                  <div style={{ fontSize: '0.78rem', color: '#065F46', fontWeight: 700, textTransform: 'uppercase' }}>Verify your mobile number</div>
                  <div style={{ fontSize: '0.9rem', color: '#047857', fontWeight: 600, textAlign: 'center' }}>
                    We sent a verification code to<br />
                    <span style={{ fontWeight: 800 }}>+91 {mobile.slice(0, 5)} {mobile.slice(5)}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setMobileOtpStep('input');
                      setError('');
                      setSuccess('');
                    }}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#007A55',
                      fontWeight: 700,
                      fontSize: '0.82rem',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '4px 8px',
                      borderRadius: '6px',
                      marginTop: '4px',
                      backgroundColor: 'rgba(0,122,85,0.08)'
                    }}
                  >
                    <FaEdit /> Edit Number
                  </button>
                </div>

                {/* 6-Digit Code Box Section */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: '8px', textAlign: 'center' }}>
                    Enter 6-Digit OTP Code <span style={{ color: '#DC2626' }}>*</span>
                  </label>
                  <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', margin: '8px 0' }}>
                    {mobileOtpDigits.map((digit, idx) => (
                      <input
                        key={idx}
                        ref={(el) => { otpInputsRef.current[idx] = el; }}
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleOtpDigitChange(e.target.value, idx)}
                        onKeyDown={(e) => handleOtpKeyDown(e, idx)}
                        onPaste={idx === 0 ? handleOtpPaste : undefined}
                        style={{
                          width: '45px',
                          height: '50px',
                          borderRadius: '8px',
                          border: '1.5px solid #E2E8F0',
                          textAlign: 'center',
                          fontSize: '1.25rem',
                          fontWeight: 800,
                          color: '#0F172A',
                          backgroundColor: '#F8FAFC',
                          outline: 'none',
                          boxSizing: 'border-box'
                        }}
                        autoFocus={idx === 0}
                        required
                      />
                    ))}
                  </div>
                </div>

                {/* Resend Cooldown Countdown */}
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '0.85rem' }}>
                  {resendCountdown > 0 ? (
                    <span style={{ color: '#64748B', fontWeight: 500 }}>
                      Resend OTP in <span style={{ color: '#007A55', fontWeight: 700 }}>{resendCountdown}s</span>
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={handleResendOtp}
                      disabled={loading}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#007A55',
                        fontWeight: 700,
                        cursor: 'pointer',
                        textDecoration: 'underline'
                      }}
                    >
                      Resend OTP
                    </button>
                  )}
                </div>

                {/* Verify OTP Button */}
                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    width: '100%',
                    padding: '14px',
                    borderRadius: '12px',
                    backgroundColor: '#007A55',
                    color: '#FFFFFF',
                    border: 'none',
                    fontSize: '1rem',
                    fontWeight: 700,
                    cursor: loading ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '10px',
                    boxShadow: '0 8px 20px rgba(0, 122, 85, 0.25)',
                    transition: 'all 0.2s ease',
                    marginTop: '4px'
                  }}
                >
                  {loading ? 'Verifying OTP Code...' : 'Verify OTP'} <FaArrowRight style={{ fontSize: '14px' }} />
                </button>
              </form>
            )
          )}
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
