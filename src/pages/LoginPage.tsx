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
  FaArrowLeft, 
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

  // Mode: 'signin' | 'otp_verify'
  const [step, setStep] = useState<'details' | 'otp'>('details');
  const [isRegistering, setIsRegistering] = useState(false);

  // Form Fields
  const [fullName, setFullName] = useState('');
  const [gender, setGender] = useState('Male');
  const [mobile, setMobile] = useState('');
  const [district, setDistrict] = useState('Hyderabad');
  const [rememberMe, setRememberMe] = useState(true);

  // OTP Verification
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [otpInput, setOtpInput] = useState('');
  const [resendTimer, setResendTimer] = useState(0);

  // UI notifications & states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [simulatedSms, setSimulatedSms] = useState<{ mobile: string; otp: string } | null>(null);

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

  // OTP Countdown timer
  useEffect(() => {
    if (resendTimer > 0) {
      const interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [resendTimer]);

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

  // Handle Send OTP
  const handleSendOtp = (e: React.FormEvent) => {
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

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      setGeneratedOtp(code);
      setResendTimer(30);

      if (rememberMe) {
        localStorage.setItem('nexopp_remembered_mobile', mobile);
      } else {
        localStorage.removeItem('nexopp_remembered_mobile');
      }

      setSimulatedSms({ mobile, otp: code });
      setStep('otp');
    }, 800);
  };

  // Handle Verify OTP
  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!otpInput || otpInput.trim() !== generatedOtp) {
      setError('Incorrect OTP code. Please enter the code shown in the simulation header.');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);

      // Save to registered list
      saveRegisteredUser({
        fullName: fullName.trim(),
        gender,
        mobile,
        district
      });

      // Login into App AuthContext
      const mockEmail = `${mobile}@nexopp.in`;
      loginWithGmail(mockEmail, 'Verified Investor', fullName.trim(), mobile, gender, district);
      onClose?.();
    }, 600);
  };

  // Quick Demo Login helper
  const handleQuickDemoLogin = (demoName: string, demoMobile: string, demoGender: string, demoDistrict: string) => {
    setFullName(demoName);
    setMobile(demoMobile);
    setGender(demoGender);
    setDistrict(demoDistrict);
    
    const mockEmail = `${demoMobile}@nexopp.in`;
    saveRegisteredUser({ fullName: demoName, mobile: demoMobile, gender: demoGender, district: demoDistrict });
    loginWithGmail(mockEmail, 'Verified Investor', demoName, demoMobile, demoGender, demoDistrict);
    onClose?.();
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

      {/* Simulated Live SMS Notification Banner */}
      {simulatedSms && (
        <div style={{
          position: 'fixed',
          top: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 99999,
          backgroundColor: '#0F172A',
          color: '#FFFFFF',
          padding: '14px 24px',
          borderRadius: '16px',
          boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          border: '1px solid #334155',
          animation: 'slideDown 0.4s cubic-bezier(0.16, 1, 0.3, 1)'
        }}>
          <div style={{
            width: '38px',
            height: '38px',
            borderRadius: '12px',
            backgroundColor: '#007A55',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '18px',
            color: '#FFFFFF'
          }}>
            📱
          </div>
          <div>
            <div style={{ fontSize: '0.82rem', color: '#94A3B8', fontWeight: 600 }}>SMS Verification Code Received</div>
            <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#F8FAFC' }}>
              OTP for +91 {simulatedSms.mobile}: <span style={{ color: '#34D399', letterSpacing: '2px', fontSize: '1.1rem' }}>{simulatedSms.otp}</span>
            </div>
          </div>
          <button 
            onClick={() => setOtpInput(simulatedSms.otp)} 
            style={{
              marginLeft: '12px',
              padding: '6px 14px',
              backgroundColor: '#34D399',
              color: '#064E3B',
              border: 'none',
              borderRadius: '8px',
              fontWeight: 800,
              fontSize: '0.82rem',
              cursor: 'pointer'
            }}
          >
            Auto-fill
          </button>
        </div>
      )}

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
              {/* Custom 3D Cube Icon */}
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
              {step === 'otp' ? 'Enter OTP Code' : (isRegistering ? 'Create Account' : 'Sign In')}
            </h2>
            <p style={{ fontSize: '0.92rem', color: '#64748B', margin: 0 }}>
              {step === 'otp'
                ? `Verification code sent to +91 ${mobile}`
                : (isRegistering
                    ? 'Fill in your details to register & receive OTP'
                    : 'Please enter your mobile number to sign in')}
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

          {/* STEP 1: DETAILS & MOBILE INPUT */}
          {step === 'details' && (
            <form onSubmit={handleSendOtp} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

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
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Enter your full name"
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
                      transition: 'border-color 0.2s'
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
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                  {['Male', 'Female', 'Other'].map((g) => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => setGender(g)}
                      style={{
                        padding: '12px',
                        borderRadius: '12px',
                        border: gender === g ? '2px solid #007A55' : '1.5px solid #E2E8F0',
                        backgroundColor: gender === g ? '#ECFDF5' : '#F8FAFC',
                        color: gender === g ? '#007A55' : '#475569',
                        fontWeight: gender === g ? 800 : 600,
                        fontSize: '0.9rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <FaVenusMars style={{ fontSize: '13px' }} />
                      {g}
                    </button>
                  ))}
                </div>
              </div>

              {/* 3. Phone Number */}
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: '8px' }}>
                  Phone Number <span style={{ color: '#DC2626' }}>*</span>
                </label>
                <div style={{ display: 'flex', gap: '10px' }}>
                  {/* Country Code Prefix */}
                  <div style={{
                    padding: '14px 16px',
                    borderRadius: '12px',
                    border: '1.5px solid #E2E8F0',
                    backgroundColor: '#F1F5F9',
                    fontSize: '0.95rem',
                    fontWeight: 700,
                    color: '#334155',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}>
                    <FaPhoneAlt style={{ fontSize: '13px', color: '#007A55' }} />
                    +91
                  </div>
                  {/* Input */}
                  <div style={{ flex: 1, position: 'relative' }}>
                    <input
                      type="tel"
                      value={mobile}
                      onChange={(e) => handleMobileChange(e.target.value)}
                      placeholder="Enter 10-digit phone number"
                      maxLength={10}
                      style={{
                        width: '100%',
                        padding: '14px 16px',
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

              {/* Primary Action Button */}
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
                {loading ? 'Sending OTP...' : 'Send OTP'} <FaArrowRight style={{ fontSize: '14px' }} />
              </button>

              {/* Divider */}
              <div style={{ display: 'flex', alignItems: 'center', margin: '8px 0', gap: '12px' }}>
                <div style={{ flex: 1, height: '1px', backgroundColor: '#E2E8F0' }} />
                <span style={{ fontSize: '0.78rem', color: '#94A3B8', fontWeight: 600, textTransform: 'lowercase' }}>or continue with</span>
                <div style={{ flex: 1, height: '1px', backgroundColor: '#E2E8F0' }} />
              </div>

              {/* Social Login Buttons */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                {/* Google Button */}
                <button
                  type="button"
                  onClick={() => loginWithGmail('user@gmail.com', 'Verified Investor', fullName || 'Google User', mobile || '9876543210', gender, district)}
                  style={{
                    padding: '12px',
                    borderRadius: '12px',
                    border: '1.5px solid #E2E8F0',
                    backgroundColor: '#FFFFFF',
                    color: '#334155',
                    fontWeight: 700,
                    fontSize: '0.9rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '10px',
                    transition: 'background-color 0.2s'
                  }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                  </svg>
                  Google
                </button>

                {/* Microsoft Button */}
                <button
                  type="button"
                  onClick={() => loginWithGmail('user@microsoft.com', 'Verified Investor', fullName || 'Microsoft User', mobile || '9876543210', gender, district)}
                  style={{
                    padding: '12px',
                    borderRadius: '12px',
                    border: '1.5px solid #E2E8F0',
                    backgroundColor: '#FFFFFF',
                    color: '#334155',
                    fontWeight: 700,
                    fontSize: '0.9rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '10px',
                    transition: 'background-color 0.2s'
                  }}
                >
                  <svg width="18" height="18" viewBox="0 0 23 23">
                    <path fill="#f35325" d="M1 1h10v10H1z"/>
                    <path fill="#81bc06" d="M12 1h10v10H12z"/>
                    <path fill="#05a6f0" d="M1 12h10v10H1z"/>
                    <path fill="#ffba08" d="M12 12h10v10H12z"/>
                  </svg>
                  Microsoft
                </button>
              </div>

              {/* Demo Account Quick Pickers */}
              <div style={{ marginTop: '10px', textAlign: 'center' }}>
                <span style={{ fontSize: '0.78rem', color: '#94A3B8' }}>Quick Demo Fill: </span>
                <button
                  type="button"
                  onClick={() => handleQuickDemoLogin('Rahul Sharma', '9876543210', 'Male', 'Hyderabad')}
                  style={{ background: 'none', border: 'none', color: '#007A55', fontWeight: 700, fontSize: '0.78rem', cursor: 'pointer', textDecoration: 'underline' }}
                >
                  Rahul (Hyderabad)
                </button>
                <span style={{ color: '#CBD5E1', margin: '0 6px' }}>•</span>
                <button
                  type="button"
                  onClick={() => handleQuickDemoLogin('Priya Reddy', '9988776655', 'Female', 'Guntur')}
                  style={{ background: 'none', border: 'none', color: '#007A55', fontWeight: 700, fontSize: '0.78rem', cursor: 'pointer', textDecoration: 'underline' }}
                >
                  Priya (Guntur)
                </button>
              </div>

            </form>
          )}

          {/* STEP 2: OTP VERIFICATION INPUT */}
          {step === 'otp' && (
            <form onSubmit={handleVerifyOtp} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{
                backgroundColor: '#ECFDF5',
                border: '1px solid #A7F3D0',
                borderRadius: '14px',
                padding: '16px',
                color: '#064E3B',
                fontSize: '0.9rem'
              }}>
                <div style={{ fontWeight: 800, marginBottom: '4px' }}>Name: {fullName} ({gender})</div>
                <div>Mobile: +91 {mobile} • District: {district}</div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: '8px' }}>
                  Enter 6-Digit OTP Code
                </label>
                <input
                  type="text"
                  value={otpInput}
                  onChange={(e) => setOtpInput(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="e.g. 684219"
                  maxLength={6}
                  style={{
                    width: '100%',
                    padding: '16px',
                    borderRadius: '12px',
                    border: '2px solid #007A55',
                    fontSize: '1.3rem',
                    fontWeight: 900,
                    color: '#0F172A',
                    backgroundColor: '#F8FAFC',
                    letterSpacing: '8px',
                    textAlign: 'center',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                  autoFocus
                  required
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <button
                  type="button"
                  onClick={() => setStep('details')}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#64748B',
                    fontWeight: 700,
                    fontSize: '0.88rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <FaArrowLeft /> Edit Details
                </button>

                <button
                  type="button"
                  disabled={resendTimer > 0}
                  onClick={() => {
                    const code = Math.floor(100000 + Math.random() * 900000).toString();
                    setGeneratedOtp(code);
                    setResendTimer(30);
                    setSimulatedSms({ mobile, otp: code });
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: resendTimer > 0 ? '#94A3B8' : '#007A55',
                    fontWeight: 700,
                    fontSize: '0.88rem',
                    cursor: resendTimer > 0 ? 'not-allowed' : 'pointer'
                  }}
                >
                  {resendTimer > 0 ? `Resend code in ${resendTimer}s` : 'Resend OTP'}
                </button>
              </div>

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
                  transition: 'all 0.2s ease'
                }}
              >
                {loading ? 'Verifying...' : 'Verify OTP & Sign In'} <FaArrowRight style={{ fontSize: '14px' }} />
              </button>
            </form>
          )}

        </div>
      </div>
    </div>
  );
};

export default LoginPage;
