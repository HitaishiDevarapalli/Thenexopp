import React, { useState, useEffect, useRef } from 'react';
import {
  ShieldCheck,
  Lock,
  ArrowRight,
  ArrowLeft,
  AlertCircle,
  Smartphone,
  CheckCircle2,
  RefreshCw,
  QrCode,
} from 'lucide-react';
import { Logo } from '../common/Logo';

const ALLOWED_ADMIN_EMAILS = [
  'thenexopptech@gmail.com',
  'talatalareddy870@gmail.com',
  'mk0081709@gmail.com'
];

interface AdminLoginScreenProps {
  onLoginSuccess: (user: { role: string; fullName: string; email: string }) => void;
  employeeUsersDb?: any[];
  rolesDb?: any[];
}

export const AdminLoginScreen: React.FC<AdminLoginScreenProps> = ({
  onLoginSuccess,
}) => {
  // Authentication Stages: 'google_signin' | '2fa_verify' | '2fa_setup'
  const [authStage, setAuthStage] = useState<'google_signin' | '2fa_verify' | '2fa_setup'>('google_signin');
  const [selectedAdminEmail, setSelectedAdminEmail] = useState<string>('');
  const [tempSessionToken, setTempSessionToken] = useState<string>('');
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [totpSecret, setTotpSecret] = useState<string>('');
  const [totpCode, setTotpCode] = useState<string>('');
  
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const otpInputRef = useRef<HTMLInputElement>(null);

  // Focus OTP input when entering 2FA stage
  useEffect(() => {
    if (authStage === '2fa_verify' || authStage === '2fa_setup') {
      setTimeout(() => {
        otpInputRef.current?.focus();
      }, 100);
    }
  }, [authStage]);

  // Handle Google Credential Callback (GIS) if active
  const handleGoogleCredentialResponse = async (response: any) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/auth/admin-google-auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credential: response.credential }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        processStep1Success(data);
      } else {
        setError(data.error || 'ACCESS DENIED: Your Google account is not authorized for NexOpp Admin access.');
      }
    } catch (err) {
      setError('Connection to authentication server failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Initialize Google Identity Services if available
  useEffect(() => {
    const initGoogle = () => {
      if ((window as any).google?.accounts?.id) {
        try {
          (window as any).google.accounts.id.initialize({
            client_id: '91283838472-mock-placeholder.apps.googleusercontent.com',
            callback: handleGoogleCredentialResponse,
            auto_select: false,
            cancel_on_tap_outside: true,
          });
        } catch (e) {
          console.warn('Google Identity initialization notice:', e);
        }
      }
    };

    if ((window as any).google?.accounts?.id) {
      initGoogle();
    } else {
      const timer = setTimeout(initGoogle, 800);
      return () => clearTimeout(timer);
    }
  }, []);

  // Direct Google Sign-In with Whitelisted Admin Account
  const handleDirectGoogleLogin = async (email: string) => {
    setLoading(true);
    setError(null);

    const cleanEmail = email.trim().toLowerCase();
    if (!ALLOWED_ADMIN_EMAILS.includes(cleanEmail)) {
      setError(`ACCESS DENIED: ${cleanEmail} is not authorized for NexOpp Admin access.`);
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/auth/admin-google-auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: cleanEmail,
          name:
            cleanEmail === 'thenexopptech@gmail.com'
              ? 'NexOpp Tech Admin'
              : cleanEmail === 'mk0081709@gmail.com'
              ? 'MK Admin'
              : 'Talatalareddy Admin',
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        processStep1Success(data);
      } else {
        setError(data.error || `ACCESS DENIED: ${cleanEmail} is not authorized.`);
      }
    } catch (err) {
      setError('Connection to authentication server failed. Please ensure backend is running.');
    } finally {
      setLoading(false);
    }
  };

  const processStep1Success = (data: any) => {
    setSelectedAdminEmail(data.email);
    setTempSessionToken(data.tempSessionToken);
    setTotpCode('');

    if (data.step === '2fa_setup') {
      setQrCodeUrl(data.qrCode || '');
      setTotpSecret(data.secret || '');
      setAuthStage('2fa_setup');
    } else {
      setAuthStage('2fa_verify');
    }
  };

  // Submit 6-digit TOTP Code to Server for Verification
  const handleTotpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanCode = totpCode.trim().replace(/\s+/g, '');
    if (!/^\d{6}$/.test(cleanCode)) {
      setError('Please enter a valid 6-digit verification code.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/admin-verify-2fa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tempSessionToken,
          code: cleanCode,
        }),
      });

      const data = await res.json();

      if (res.ok && data.success && data.user) {
        // Access Granted!
        onLoginSuccess({
          role: data.user.role || 'Super Admin',
          fullName: data.user.fullName || 'Admin',
          email: data.user.email,
        });
      } else {
        setError(data.error || 'ACCESS DENIED: Incorrect 6-digit code. Check your Google Authenticator app and try again.');
      }
    } catch (err) {
      setError('Authentication server verification error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetAuth = () => {
    setAuthStage('google_signin');
    setSelectedAdminEmail('');
    setTempSessionToken('');
    setTotpCode('');
    setError(null);
  };

  return (
    <div 
      className="min-h-screen w-full flex items-center justify-center p-4 sm:p-6 font-sans select-none"
      style={{
        backgroundColor: '#090D16',
        backgroundImage: 'radial-gradient(ellipse 60% 50% at 50% 30%, rgba(16, 185, 129, 0.08) 0%, rgba(9, 13, 22, 1) 100%)',
        backgroundAttachment: 'fixed',
      }}
    >
      {/* Main Authentication Card */}
      <div 
        className="w-full relative z-10 shadow-2xl transition-all"
        style={{
          maxWidth: '450px',
          backgroundColor: '#111827',
          border: '1px solid #1F2937',
          borderRadius: '16px',
          padding: '32px 28px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7), 0 0 0 1px rgba(255, 255, 255, 0.04)',
        }}
      >
        {/* Subtle Top Accent Border */}
        <div 
          style={{
            position: 'absolute',
            top: 0,
            left: '24px',
            right: '24px',
            height: '2px',
            background: 'linear-gradient(90deg, #059669, #10B981, #059669)',
            borderRadius: '9999px',
          }} 
        />

        {/* Header Section */}
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
            <Logo size="md" dark={true} />
          </div>

          <div 
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '4px 12px',
              borderRadius: '9999px',
              backgroundColor: 'rgba(6, 78, 59, 0.5)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              color: '#34D399',
              fontSize: '12px',
              fontWeight: 600,
              marginBottom: '10px',
            }}
          >
            <ShieldCheck style={{ width: '14px', height: '14px' }} />
            <span>Admin Control Center</span>
          </div>

          <h1 
            style={{
              fontSize: '20px',
              fontWeight: 700,
              color: '#F9FAFB',
              letterSpacing: '-0.02em',
              margin: '0 0 6px 0',
            }}
          >
            Restricted Access
          </h1>
          <p 
            style={{
              fontSize: '12px',
              color: '#9CA3AF',
              lineHeight: '1.4',
              margin: '0 auto',
              maxWidth: '320px',
            }}
          >
            Restricted to authorized administrators via Google SSO and 2FA.
          </p>
        </div>

        {/* Error Notification Alert */}
        {error && (
          <div 
            style={{
              marginBottom: '18px',
              padding: '12px 14px',
              borderRadius: '10px',
              backgroundColor: 'rgba(127, 29, 29, 0.4)',
              border: '1px solid rgba(239, 68, 68, 0.4)',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '10px',
              color: '#FCA5A5',
              fontSize: '12px',
            }}
          >
            <AlertCircle style={{ width: '16px', height: '16px', color: '#F87171', flexShrink: 0, marginTop: '1px' }} />
            <span style={{ lineHeight: '1.4', fontWeight: 500 }}>{error}</span>
          </div>
        )}

        {/* ================= STAGE 1: GOOGLE SIGN-IN ================= */}
        {authStage === 'google_signin' && (
          <div>
            <div 
              style={{
                padding: '16px',
                borderRadius: '12px',
                backgroundColor: '#0F172A',
                border: '1px solid #1E293B',
                marginBottom: '14px',
              }}
            >
              <p 
                style={{
                  fontSize: '12px',
                  fontWeight: 600,
                  color: '#E2E8F0',
                  textAlign: 'center',
                  marginBottom: '4px',
                }}
              >
                Authorized Administrator Accounts
              </p>
              <p 
                style={{
                  fontSize: '11px',
                  color: '#94A3B8',
                  textAlign: 'center',
                  marginBottom: '14px',
                }}
              >
                Select your verified Google account to authenticate:
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {ALLOWED_ADMIN_EMAILS.map((adminEmail) => (
                  <button
                    key={adminEmail}
                    type="button"
                    disabled={loading}
                    onClick={() => handleDirectGoogleLogin(adminEmail)}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '10px 14px',
                      borderRadius: '10px',
                      backgroundColor: '#1E293B',
                      border: '1px solid #334155',
                      cursor: loading ? 'not-allowed' : 'pointer',
                      transition: 'all 0.15s ease',
                      textAlign: 'left',
                      boxShadow: '0 1px 2px rgba(0,0,0,0.2)',
                    }}
                    onMouseEnter={(e) => {
                      if (!loading) {
                        e.currentTarget.style.backgroundColor = '#26354A';
                        e.currentTarget.style.borderColor = '#10B981';
                      }
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = '#1E293B';
                      e.currentTarget.style.borderColor = '#334155';
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', overflow: 'hidden' }}>
                      {/* Google G Logo Badge */}
                      <div 
                        style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '8px',
                          backgroundColor: '#FFFFFF',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                          boxShadow: '0 1px 2px rgba(0,0,0,0.15)',
                        }}
                      >
                        <svg style={{ width: '16px', height: '16px' }} viewBox="0 0 24 24">
                          <path
                            fill="#4285F4"
                            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                          />
                          <path
                            fill="#34A853"
                            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                          />
                          <path
                            fill="#FBBC05"
                            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                          />
                          <path
                            fill="#EA4335"
                            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                          />
                        </svg>
                      </div>

                      <div style={{ overflow: 'hidden' }}>
                        <div 
                          style={{
                            fontSize: '13px',
                            fontWeight: 600,
                            color: '#F1F5F9',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                          }}
                        >
                          {adminEmail}
                        </div>
                        <div 
                          style={{
                            fontSize: '10px',
                            color: '#94A3B8',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '5px',
                            marginTop: '2px',
                          }}
                        >
                          <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#10B981', display: 'inline-block' }} />
                          <span>Authorized Administrator</span>
                        </div>
                      </div>
                    </div>

                    <ArrowRight style={{ width: '15px', height: '15px', color: '#64748B', flexShrink: 0, marginLeft: '8px' }} />
                  </button>
                ))}
              </div>
            </div>

            <div 
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                fontSize: '11px',
                color: '#64748B',
                marginTop: '12px',
              }}
            >
              <Lock style={{ width: '13px', height: '13px', color: '#10B981' }} />
              <span>Step 1 of 2: Google Identity Verification</span>
            </div>
          </div>
        )}

        {/* ================= STAGE 2A: GOOGLE AUTHENTICATOR SETUP (FIRST TIME) ================= */}
        {authStage === '2fa_setup' && (
          <form onSubmit={handleTotpSubmit}>
            <div 
              style={{
                padding: '16px',
                borderRadius: '12px',
                backgroundColor: '#0F172A',
                border: '1px solid #1E293B',
                textAlign: 'center',
                marginBottom: '16px',
              }}
            >
              <div 
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(6, 78, 59, 0.5)',
                  border: '1px solid rgba(16, 185, 129, 0.3)',
                  color: '#34D399',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '10px',
                }}
              >
                <QrCode style={{ width: '18px', height: '18px' }} />
              </div>

              <h2 style={{ fontSize: '14px', fontWeight: 700, color: '#F9FAFB', margin: '0 0 4px 0' }}>
                Set Up Google Authenticator
              </h2>
              <p style={{ fontSize: '11px', color: '#94A3B8', margin: '0 0 14px 0', lineHeight: '1.4' }}>
                Scan this QR code with the <strong>Google Authenticator</strong> app on your mobile device:
              </p>

              {qrCodeUrl && (
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '12px' }}>
                  <div 
                    style={{
                      padding: '8px',
                      backgroundColor: '#FFFFFF',
                      borderRadius: '10px',
                      border: '1px solid #334155',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                    }}
                  >
                    <img src={qrCodeUrl} alt="Google Authenticator QR Code" style={{ width: '160px', height: '160px', display: 'block' }} />
                  </div>
                </div>
              )}

              {totpSecret && (
                <div 
                  style={{
                    backgroundColor: '#0B0F19',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: '1px solid #1E293B',
                    fontSize: '11px',
                    color: '#94A3B8',
                    fontFamily: 'monospace',
                    userSelect: 'all',
                  }}
                >
                  <span style={{ color: '#64748B', display: 'block', fontSize: '10px', marginBottom: '2px' }}>Manual Entry Key:</span>
                  <span style={{ fontWeight: 700, color: '#34D399', letterSpacing: '0.05em' }}>{totpSecret}</span>
                </div>
              )}
            </div>

            <div style={{ marginBottom: '14px' }}>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: '#E2E8F0', marginBottom: '6px', textAlign: 'center' }}>
                Enter the 6-digit code from Google Authenticator
              </label>
              <input
                ref={otpInputRef}
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={6}
                required
                value={totpCode}
                onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, ''))}
                placeholder="000000"
                style={{
                  width: '100%',
                  textAlign: 'center',
                  letterSpacing: '0.4em',
                  fontSize: '22px',
                  fontWeight: 800,
                  padding: '12px',
                  backgroundColor: '#0F172A',
                  border: '1px solid #334155',
                  borderRadius: '10px',
                  color: '#FFFFFF',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '10px',
                backgroundColor: '#059669',
                color: '#FFFFFF',
                fontWeight: 700,
                fontSize: '13px',
                border: 'none',
                cursor: loading ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: '0 4px 14px rgba(5, 150, 105, 0.4)',
                transition: 'background-color 0.15s ease',
              }}
              onMouseEnter={(e) => {
                if (!loading) e.currentTarget.style.backgroundColor = '#10B981';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#059669';
              }}
            >
              {loading ? <RefreshCw style={{ width: '16px', height: '16px', animation: 'spin 1s linear infinite' }} /> : <CheckCircle2 style={{ width: '16px', height: '16px' }} />}
              <span>Verify and Finish Setup</span>
            </button>

            <button
              type="button"
              onClick={handleResetAuth}
              style={{
                width: '100%',
                textAlign: 'center',
                fontSize: '11px',
                fontWeight: 600,
                color: '#94A3B8',
                backgroundColor: 'transparent',
                border: 'none',
                marginTop: '12px',
                cursor: 'pointer',
              }}
            >
              ← Back to Google Sign-In
            </button>
          </form>
        )}

        {/* ================= STAGE 2B: GOOGLE AUTHENTICATOR LOGIN ================= */}
        {authStage === '2fa_verify' && (
          <form onSubmit={handleTotpSubmit}>
            <div 
              style={{
                padding: '16px',
                borderRadius: '12px',
                backgroundColor: '#0F172A',
                border: '1px solid #1E293B',
                textAlign: 'center',
                marginBottom: '16px',
              }}
            >
              <div 
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(6, 78, 59, 0.5)',
                  border: '1px solid rgba(16, 185, 129, 0.3)',
                  color: '#34D399',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '10px',
                }}
              >
                <Smartphone style={{ width: '18px', height: '18px' }} />
              </div>

              <h2 style={{ fontSize: '14px', fontWeight: 700, color: '#F9FAFB', margin: '0 0 4px 0' }}>
                Two-Factor Authentication
              </h2>
              <p style={{ fontSize: '11px', color: '#94A3B8', margin: '0 0 10px 0', lineHeight: '1.4' }}>
                Enter the 6-digit code from your Google Authenticator app.
              </p>

              <div 
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '4px 12px',
                  borderRadius: '9999px',
                  backgroundColor: '#1E293B',
                  border: '1px solid #334155',
                  fontSize: '11px',
                  fontWeight: 600,
                  color: '#34D399',
                }}
              >
                <CheckCircle2 style={{ width: '13px', height: '13px' }} />
                <span>{selectedAdminEmail}</span>
              </div>
            </div>

            <div style={{ marginBottom: '14px' }}>
              <input
                ref={otpInputRef}
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={6}
                required
                value={totpCode}
                onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, ''))}
                placeholder="000 000"
                style={{
                  width: '100%',
                  textAlign: 'center',
                  letterSpacing: '0.4em',
                  fontSize: '24px',
                  fontWeight: 800,
                  padding: '12px',
                  backgroundColor: '#0F172A',
                  border: '1px solid #334155',
                  borderRadius: '10px',
                  color: '#FFFFFF',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '10px',
                backgroundColor: '#059669',
                color: '#FFFFFF',
                fontWeight: 700,
                fontSize: '13px',
                border: 'none',
                cursor: loading ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: '0 4px 14px rgba(5, 150, 105, 0.4)',
                transition: 'background-color 0.15s ease',
              }}
              onMouseEnter={(e) => {
                if (!loading) e.currentTarget.style.backgroundColor = '#10B981';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#059669';
              }}
            >
              {loading ? <RefreshCw style={{ width: '16px', height: '16px', animation: 'spin 1s linear infinite' }} /> : <ShieldCheck style={{ width: '16px', height: '16px' }} />}
              <span>Verify & Enter Admin Console</span>
            </button>

            <button
              type="button"
              onClick={handleResetAuth}
              style={{
                width: '100%',
                textAlign: 'center',
                fontSize: '11px',
                fontWeight: 600,
                color: '#94A3B8',
                backgroundColor: 'transparent',
                border: 'none',
                marginTop: '12px',
                cursor: 'pointer',
              }}
            >
              ← Back to Google Sign-In
            </button>
          </form>
        )}

        {/* Footer Navigation */}
        <div 
          style={{
            marginTop: '20px',
            paddingTop: '16px',
            borderTop: '1px solid #1F2937',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '11px',
            color: '#64748B',
          }}
        >
          <a
            href="/"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px',
              fontWeight: 600,
              color: '#94A3B8',
              textDecoration: 'none',
              transition: 'color 0.15s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = '#34D399';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = '#94A3B8';
            }}
          >
            <ArrowLeft style={{ width: '13px', height: '13px' }} />
            <span>Public Website</span>
          </a>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontFamily: 'monospace', color: '#64748B' }}>
            <Lock style={{ width: '12px', height: '12px', color: '#10B981' }} />
            <span>2FA Security</span>
          </span>
        </div>
      </div>
    </div>
  );
};
