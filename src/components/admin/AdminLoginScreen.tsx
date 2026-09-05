import React, { useState, useEffect, useRef } from 'react';
import {
  ShieldCheck,
  Lock,
  ArrowRight,
  ArrowLeft,
  AlertCircle,
  Smartphone,
  KeyRound,
  CheckCircle2,
  RefreshCw,
  QrCode,
} from 'lucide-react';
import { Logo } from '../common/Logo';
import { AdminButton } from './ui/AdminButton';

const ALLOWED_ADMIN_EMAILS = [
  'thenexopptech@gmail.com',
  'talatalareddy870@gmail.com',
  'mk0081709@gmail.com'
];

interface AdminLoginScreenProps {
  onLoginSuccess: (user: { role: string; fullName: string; email: string }) => void;
  employeeUsersDb: any[];
  rolesDb: any[];
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
  const [googleInitialised, setGoogleInitialised] = useState(false);

  const otpInputRef = useRef<HTMLInputElement>(null);

  // Focus OTP input when entering 2FA stage
  useEffect(() => {
    if (authStage === '2fa_verify' || authStage === '2fa_setup') {
      setTimeout(() => {
        otpInputRef.current?.focus();
      }, 100);
    }
  }, [authStage]);

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
          setGoogleInitialised(true);
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

  // Handle Google Credential Callback (GIS)
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
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center px-4 py-12 sm:px-6 lg:px-8 relative overflow-hidden font-sans">
      {/* Background Subtle Gradient Mesh */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.15),rgba(255,255,255,0))]" />
      <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Main Authentication Card */}
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200/80 p-8 sm:p-10 relative z-10 transition-all">
        {/* Header Branding */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="mb-4">
            <Logo size="lg" showTagline={false} />
          </div>
          <div className="flex items-center gap-1.5 mb-1">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
              Control Center Access
            </h1>
          </div>
          <p className="text-xs text-slate-500 max-w-xs">
            Restricted to authorized administrators via Google SSO and Google Authenticator 2FA.
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-5 p-3.5 rounded-xl bg-rose-50 border border-rose-200/80 flex items-start gap-2.5 text-xs text-rose-700 animate-in fade-in duration-200">
            <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
            <span className="leading-relaxed font-semibold">{error}</span>
          </div>
        )}

        {/* ================= STAGE 1: GOOGLE SIGN-IN ================= */}
        {authStage === 'google_signin' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 text-center">
              <p className="text-xs font-semibold text-slate-800 mb-1">
                Authorized Administrator Accounts
              </p>
              <p className="text-[11px] text-slate-500 mb-4">
                Select your verified Google account to initiate 2-factor authentication:
              </p>

              <div className="space-y-2.5">
                {ALLOWED_ADMIN_EMAILS.map((adminEmail) => (
                  <button
                    key={adminEmail}
                    type="button"
                    disabled={loading}
                    onClick={() => handleDirectGoogleLogin(adminEmail)}
                    className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-800 transition-all hover:border-indigo-400 hover:shadow-xs disabled:opacity-50 cursor-pointer group"
                  >
                    <div className="flex items-center gap-2.5">
                      <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
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
                      <span className="truncate">{adminEmail}</span>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-600 transition-colors" />
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-center gap-2 pt-2 text-slate-500 text-xs">
              <Lock className="w-3.5 h-3.5 text-emerald-600" />
              <span>Step 1 of 2: Google Identity Verification</span>
            </div>
          </div>
        )}

        {/* ================= STAGE 2A: GOOGLE AUTHENTICATOR SETUP (FIRST TIME) ================= */}
        {authStage === '2fa_setup' && (
          <form onSubmit={handleTotpSubmit} className="space-y-4 animate-in fade-in duration-200">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 text-center">
              <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-600 mb-2">
                <QrCode className="w-5 h-5" />
              </div>
              <h2 className="text-sm font-bold text-slate-900 mb-1">
                Set Up Google Authenticator
              </h2>
              <p className="text-[11px] text-slate-500 mb-4 leading-relaxed">
                Scan this QR code with the <strong>Google Authenticator</strong> app on your mobile device:
              </p>

              {qrCodeUrl && (
                <div className="flex justify-center mb-3">
                  <div className="p-2 bg-white rounded-xl border border-slate-200 shadow-xs">
                    <img src={qrCodeUrl} alt="Google Authenticator QR Code" className="w-48 h-48 rounded-lg" />
                  </div>
                </div>
              )}

              {totpSecret && (
                <div className="bg-white p-2 rounded-lg border border-slate-200 text-[10px] text-slate-600 font-mono select-all">
                  Manual Key: <span className="font-bold text-slate-900">{totpSecret}</span>
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5 text-center">
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
                placeholder="123456"
                className="w-full text-center tracking-[0.4em] text-xl font-bold py-3 bg-slate-50 hover:bg-slate-100/80 focus:bg-white border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
              />
            </div>

            <AdminButton
              type="submit"
              variant="primary"
              size="lg"
              loading={loading}
              className="w-full justify-center shadow-md shadow-indigo-600/20"
            >
              Verify and continue
            </AdminButton>

            <button
              type="button"
              onClick={handleResetAuth}
              className="w-full text-center text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors pt-1 cursor-pointer"
            >
              ← Back to Google Sign-In
            </button>
          </form>
        )}

        {/* ================= STAGE 2B: GOOGLE AUTHENTICATOR LOGIN ================= */}
        {authStage === '2fa_verify' && (
          <form onSubmit={handleTotpSubmit} className="space-y-4 animate-in fade-in duration-200">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 text-center">
              <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-600 mb-2">
                <Smartphone className="w-5 h-5" />
              </div>
              <h2 className="text-sm font-bold text-slate-900 mb-1">
                Two-factor authentication
              </h2>
              <p className="text-xs text-slate-500 mb-2">
                Enter the 6-digit code from your Google Authenticator app.
              </p>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white border border-slate-200 text-[11px] font-semibold text-slate-700">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span className="truncate max-w-[200px]">{selectedAdminEmail}</span>
              </div>
            </div>

            <div>
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
                className="w-full text-center tracking-[0.4em] text-2xl font-extrabold py-3 bg-slate-50 hover:bg-slate-100/80 focus:bg-white border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
              />
            </div>

            <AdminButton
              type="submit"
              variant="primary"
              size="lg"
              loading={loading}
              className="w-full justify-center shadow-md shadow-indigo-600/20"
            >
              Verify and continue
            </AdminButton>

            <button
              type="button"
              onClick={handleResetAuth}
              className="w-full text-center text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors pt-1 cursor-pointer"
            >
              ← Back to Google Sign-In
            </button>
          </form>
        )}

        {/* Footer Navigation */}
        <div className="mt-8 pt-5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <a
            href="/"
            className="inline-flex items-center gap-1.5 font-semibold text-slate-600 hover:text-indigo-600 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Public Website</span>
          </a>
          <span className="text-[11px] text-slate-400 font-mono">2FA Security</span>
        </div>
      </div>
    </div>
  );
};
