import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  FaUser, 
  FaPhoneAlt, 
  FaMapMarkerAlt, 
  FaVenusMars, 
  FaShieldAlt, 
  FaCheckCircle, 
  FaBriefcase, 
  FaArrowRight, 
  FaLock
} from 'react-icons/fa';

interface RegisteredUser {
  fullName: string;
  mobile: string;
  gender: string;
  district: string;
  email?: string;
}

const DISTRICT_OPTIONS = [
  'Guntur',
  'Vijayawada (NTR)',
  'Hyderabad',
  'Visakhapatnam',
  'Medchal-Malkajgiri',
  'Ranga Reddy',
  'Sangareddy',
  'Kakinada',
  'East Godavari',
  'West Godavari',
  'Eluru',
  'Bapatla',
  'Palnadu',
  'Prakasam',
  'SPS Nellore',
  'Tirupati',
  'Chittoor',
  'Anantapur',
  'Kurnool',
  'YSR Kadapa',
  'Warangal',
  'Hanamkonda',
  'Karimnagar',
  'Khammam',
  'Nalgonda',
  'Nizamabad',
  'Bengaluru Urban',
  'Mumbai City',
  'Chennai',
  'Delhi NCR'
];

interface LoginPageProps {
  onClose?: () => void;
  isModal?: boolean;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onClose, isModal = false }) => {
  const { loginWithGmail } = useAuth();

  const [isRegistering, setIsRegistering] = useState(false);

  // Form Fields
  const [fullName, setFullName] = useState('');
  const [gender, setGender] = useState('Male');
  const [mobile, setMobile] = useState('');
  const [district, setDistrict] = useState('Hyderabad');
  const [rememberMe, setRememberMe] = useState(true);

  // UI notifications & states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Load remembered credentials or previous users
  useEffect(() => {
    try {
      const remembered = localStorage.getItem('nexopp_remembered_mobile');
      if (remembered) {
        setMobile(remembered);
        const users = getRegisteredUsers();
        const found = users.find(u => u.mobile === remembered);
        if (found) {
          setFullName(found.fullName);
          setGender(found.gender || 'Male');
          setDistrict(found.district || 'Hyderabad');
        }
      }
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
      const existingIndex = users.findIndex(u => u.mobile === user.mobile);
      if (existingIndex >= 0) {
        users[existingIndex] = user;
      } else {
        users.push(user);
      }
      localStorage.setItem('nexopp_registered_users', JSON.stringify(users));
    } catch (e) {}
  };

  // Auto-detect existing mobile on change
  const handleMobileChange = (val: string) => {
    const clean = val.replace(/\D/g, '').slice(0, 10);
    setMobile(clean);
    setError('');

    if (clean.length === 10) {
      const users = getRegisteredUsers();
      const match = users.find(u => u.mobile === clean);
      if (match) {
        setFullName(match.fullName);
        setGender(match.gender || 'Male');
        setDistrict(match.district || 'Hyderabad');
        setIsRegistering(false);
      } else {
        setIsRegistering(true);
      }
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

  // Handle MSG91 OTP Widget SDK Login & Token verification
  const handleWidgetLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!fullName.trim()) {
      setError('Please enter your full name');
      return;
    }
    if (!gender) {
      setError('Please select your gender');
      return;
    }
    if (!mobile || mobile.length !== 10) {
      setError('Please enter a valid 10-digit mobile number');
      return;
    }
    if (!district) {
      setError('Please select your district');
      return;
    }

    if (rememberMe) {
      localStorage.setItem('nexopp_remembered_mobile', mobile);
    } else {
      localStorage.removeItem('nexopp_remembered_mobile');
    }

    const widgetId = import.meta.env.VITE_MSG91_WIDGET_ID || '3668635565333331313137';
    const tokenAuth = import.meta.env.VITE_MSG91_TOKEN_AUTH || '557093TbSwW47iNa86a715c45P1';
    const formattedMobile = mobile.startsWith('91') ? mobile : `91${mobile}`;

    // Verification token callback -> POST to /api/auth/widget-login
    const sendTokenToBackend = async (token: string) => {
      setLoading(true);
      try {
        const apiBase = import.meta.env.VITE_API_BASE_URL || '/api';
        const res = await fetch(`${apiBase}/auth/widget-login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            verificationToken: token,
            fullName: fullName.trim(),
            gender,
            district,
          }),
        });

        const data = await res.json();
        setLoading(false);

        if (!res.ok || !data.success) {
          throw new Error(data.error || data.message || 'Verification token validation failed');
        }

        saveRegisteredUser({
          fullName: fullName.trim(),
          gender,
          mobile,
          district,
        });

        const mockEmail = `${mobile}@nexopp.in`;
        loginWithGmail(mockEmail, 'Verified Investor', fullName.trim(), mobile, gender, district);
        onClose?.();
      } catch (err: any) {
        setLoading(false);
        setError(err.message || 'Failed to authenticate verified mobile number');
      }
    };

    // Invoke MSG91 Widget SDK if loaded on window
    if (typeof (window as any).initSendOTP === 'function') {
      try {
        const configuration = {
          widgetId: widgetId,
          tokenAuth: tokenAuth,
          identifier: formattedMobile,
          success: (data: any) => {
            console.log('MSG91 Widget success:', data);
            const token = typeof data === 'string' ? data : (data.message || data.verificationToken || data['access-token'] || data.token);
            sendTokenToBackend(token);
          },
          failure: (error: any) => {
            console.error('MSG91 Widget Error:', error);
            setError(typeof error === 'string' ? error : (error.message || 'OTP verification failed via MSG91 Widget.'));
          },
        };

        (window as any).initSendOTP(configuration);

        // If MSG91 exposed sendOTP or openOtpWidget methods, call sendOTP to trigger SMS/Modal
        if (typeof (window as any).sendOTP === 'function') {
          (window as any).sendOTP(formattedMobile);
        } else if (typeof (window as any).openOtpWidget === 'function') {
          (window as any).openOtpWidget();
        }

        setSuccess(`MSG91 OTP Widget triggered for +${formattedMobile}. Complete verification in the popup.`);
      } catch (err) {
        console.error('Widget initialization error:', err);
        setError('Failed to open MSG91 OTP Widget. Please try again.');
      }
    } else {
      setError('MSG91 Widget script is loading or blocked by browser extensions. Please refresh page.');
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
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #34D399 0%, #059669 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 8px 16px rgba(0,0,0,0.2)'
            }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
                <line x1="12" y1="22.08" x2="12" y2="12" />
              </svg>
            </div>
            <div>
              <div style={{ fontSize: '1.4rem', fontWeight: 900, letterSpacing: '-0.02em', color: '#FFFFFF' }}>
                TheNexOpp
              </div>
              <div style={{ fontSize: '0.78rem', color: '#A7F3D0', fontWeight: 600, letterSpacing: '0.04em' }}>
                Opportunities Simplified
              </div>
            </div>
          </div>

          {/* Center Content Section */}
          <div style={{ margin: '36px 0', zIndex: 2 }}>
            <h1 style={{ fontSize: '2rem', fontWeight: 800, margin: '0 0 10px 0', lineHeight: 1.25, color: '#FFFFFF' }}>
              Welcome Back! 👋
            </h1>
            <p style={{ fontSize: '0.95rem', color: '#D1FAE5', margin: 0, lineHeight: 1.6, fontWeight: 400 }}>
              Sign in to continue your journey with amazing opportunities.
            </p>

            {/* 3D Pedestal Platform Graphic */}
            <div style={{
              margin: '32px auto 0 auto',
              width: '100%',
              maxWidth: '280px',
              height: '190px',
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              {/* Glowing Pedestal Base */}
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

              {/* Main Green Shield */}
              <div style={{
                width: '100px',
                height: '115px',
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

              {/* Left Floating Profile Avatar Card */}
              <div style={{
                position: 'absolute',
                left: '0px',
                top: '50px',
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

              {/* Right Floating Passcode Card */}
              <div style={{
                position: 'absolute',
                right: '0px',
                top: '55px',
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
                <div style={{ fontSize: '0.72rem', color: '#D1FAE5' }}>Your data is safe</div>
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
                <div style={{ fontSize: '0.72rem', color: '#D1FAE5' }}>Trusted platform</div>
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
                <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#FFFFFF' }}>Professional</div>
                <div style={{ fontSize: '0.72rem', color: '#D1FAE5' }}>Expert Support</div>
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
          <div style={{ marginBottom: '28px' }}>
            <h2 style={{ fontSize: '1.85rem', fontWeight: 800, color: '#0F172A', margin: '0 0 6px 0' }}>
              {isRegistering ? 'Create Account' : 'Sign In'}
            </h2>
            <p style={{ fontSize: '0.92rem', color: '#64748B', margin: 0 }}>
              {isRegistering
                ? 'Fill in your details to register & verify with MSG91 OTP'
                : 'Please enter your details to verify with MSG91 OTP'}
            </p>
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

          {/* MSG91 OTP WIDGET FORM */}
          <form onSubmit={handleWidgetLogin} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

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

            {/* 2. Gender Selection */}
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: '8px' }}>
                Gender <span style={{ color: '#DC2626' }}>*</span>
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
                {['Male', 'Female', 'Other'].map((g) => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => setGender(g)}
                    style={{
                      padding: '10px',
                      borderRadius: '10px',
                      border: gender === g ? '2px solid #007A55' : '1.5px solid #E2E8F0',
                      backgroundColor: gender === g ? '#ECFDF5' : '#F8FAFC',
                      color: gender === g ? '#007A55' : '#475569',
                      fontWeight: 700,
                      fontSize: '0.88rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px'
                    }}
                  >
                    <FaVenusMars style={{ fontSize: '13px' }} /> {g}
                  </button>
                ))}
              </div>
            </div>

            {/* 3. Mobile Number */}
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

            {/* 4. District Selection */}
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: '8px' }}>
                District <span style={{ color: '#DC2626' }}>*</span>
              </label>
              <div style={{ position: 'relative' }}>
                <FaMapMarkerAlt style={{
                  position: 'absolute',
                  left: '16px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#007A55',
                  fontSize: '15px'
                }} />
                <select
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '14px 16px 14px 44px',
                    borderRadius: '12px',
                    border: '1.5px solid #E2E8F0',
                    fontSize: '0.95rem',
                    color: '#0F172A',
                    backgroundColor: '#F8FAFC',
                    outline: 'none',
                    boxSizing: 'border-box',
                    cursor: 'pointer'
                  }}
                >
                  {DISTRICT_OPTIONS.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Checkbox Options */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '2px' }}>
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

            {/* MSG91 Widget Action Button */}
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
              {loading ? 'Verifying Token...' : 'Continue with Mobile (MSG91 Widget)'} <FaArrowRight style={{ fontSize: '14px' }} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
