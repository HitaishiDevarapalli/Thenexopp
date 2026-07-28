import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { FaGoogle, FaTimes, FaShieldAlt, FaCheckCircle, FaBuilding, FaBriefcase, FaChartLine } from 'react-icons/fa';

export const LoginModal: React.FC = () => {
  const { isLoginModalOpen, closeLoginModal, loginWithGmail } = useAuth();
  const [email, setEmail] = useState('');
  const [selectedRole, setSelectedRole] = useState<'Verified Investor' | 'Franchise Partner' | 'Business Buyer'>('Verified Investor');
  const [error, setError] = useState('');

  if (!isLoginModalOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || (!email.includes('@gmail.com') && !email.includes('@googlemail.com') && !email.includes('@'))) {
      setError('Please enter a valid Gmail address (e.g. yourname@gmail.com)');
      return;
    }
    setError('');
    loginWithGmail(email, selectedRole);
  };

  const handleQuickLogin = (demoEmail: string, role: 'Verified Investor' | 'Franchise Partner' | 'Business Buyer') => {
    loginWithGmail(demoEmail, role);
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 9999999,
        backgroundColor: 'rgba(15, 23, 42, 0.85)',
        backdropFilter: 'blur(12px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        animation: 'fadeIn 0.2s ease-out',
      }}
      onClick={closeLoginModal}
    >
      <div
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '24px',
          width: '100%',
          maxWidth: '480px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.6)',
          overflow: 'hidden',
          border: '1px solid #CBD5E1',
          position: 'relative',
          animation: 'modalFadeIn 0.3s ease-out forwards',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div style={{ backgroundColor: '#0F172A', padding: '28px 24px', textAlign: 'center', position: 'relative' }}>
          <button
            onClick={closeLoginModal}
            style={{
              position: 'absolute',
              top: '16px',
              right: '16px',
              background: 'rgba(255, 255, 255, 0.1)',
              border: 'none',
              color: '#FFFFFF',
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              fontSize: '14px',
              transition: 'background 0.2s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)')}
          >
            <FaTimes />
          </button>

          <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '56px', height: '56px', borderRadius: '16px', backgroundColor: '#1E40AF', color: '#FFFFFF', fontSize: '24px', fontWeight: 900, marginBottom: '12px', boxShadow: '0 8px 20px rgba(30, 64, 175, 0.4)' }}>
            N
          </div>
          <h2 style={{ margin: '0 0 6px 0', fontSize: '1.6rem', fontWeight: 800, color: '#FFFFFF', fontFamily: "'Outfit', sans-serif", letterSpacing: '-0.5px' }}>
            Welcome to NexOpp
          </h2>
          <p style={{ margin: 0, fontSize: '0.85rem', color: '#94A3B8', lineHeight: 1.4 }}>
            Sign in or register to unlock verified investments, operational businesses & franchise rights.
          </p>
        </div>

        {/* Gmail SSO Notice */}
        <div style={{ backgroundColor: '#FEF3C7', borderBottom: '1px solid #FDE68A', padding: '12px 20px', display: 'flex', alignItems: 'center', gap: '10px', color: '#92400E', fontSize: '0.85rem', fontWeight: 700 }}>
          <FaShieldAlt style={{ fontSize: '1.1rem', color: '#D97706', flexShrink: 0 }} />
          <span>Exclusive Gmail / Google Authentication Only</span>
        </div>

        {/* Main Body */}
        <div style={{ padding: '24px' }}>
          
          {/* Role selector */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>
              Select Your Investor Profile:
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
              {[
                { id: 'Verified Investor', label: 'Investor', icon: FaChartLine },
                { id: 'Franchise Partner', label: 'Franchisee', icon: FaBuilding },
                { id: 'Business Buyer', label: 'Acquirer', icon: FaBriefcase },
              ].map((roleOption) => {
                const Icon = roleOption.icon;
                const isSelected = selectedRole === roleOption.id;
                return (
                  <button
                    key={roleOption.id}
                    type="button"
                    onClick={() => setSelectedRole(roleOption.id as any)}
                    style={{
                      padding: '10px 8px',
                      borderRadius: '10px',
                      border: isSelected ? '2px solid #2563EB' : '1px solid #E2E8F0',
                      backgroundColor: isSelected ? '#EFF6FF' : '#F8FAFC',
                      color: isSelected ? '#1E40AF' : '#475569',
                      fontWeight: isSelected ? 800 : 600,
                      fontSize: '0.8rem',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '6px',
                      transition: 'all 0.15s',
                    }}
                  >
                    <Icon style={{ fontSize: '14px', color: isSelected ? '#2563EB' : '#64748B' }} />
                    <span>{roleOption.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#1E293B', marginBottom: '6px' }}>
                Gmail Address
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="email"
                  required
                  placeholder="e.g. investor.guntur@gmail.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setError('');
                  }}
                  style={{
                    width: '100%',
                    padding: '14px 14px 14px 44px',
                    borderRadius: '12px',
                    border: error ? '2px solid #EF4444' : '2px solid #CBD5E1',
                    fontSize: '0.95rem',
                    fontWeight: 600,
                    outline: 'none',
                    color: '#0F172A',
                    boxSizing: 'border-box',
                    transition: 'border-color 0.2s',
                  }}
                  onFocus={(e) => (e.currentTarget.style.borderColor = '#2563EB')}
                  onBlur={(e) => (e.currentTarget.style.borderColor = '#CBD5E1')}
                />
                <FaGoogle style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#EA4335', fontSize: '16px' }} />
              </div>
              {error && <span style={{ color: '#EF4444', fontSize: '0.8rem', fontWeight: 600, marginTop: '4px', display: 'block' }}>{error}</span>}
            </div>

            <button
              type="submit"
              style={{
                width: '100%',
                padding: '14px',
                backgroundColor: '#2563EB',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '12px',
                fontSize: '1rem',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
                boxShadow: '0 4px 14px rgba(37, 99, 235, 0.35)',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#1D4ED8')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#2563EB')}
            >
              <FaGoogle />
              <span>Sign In / Register with Gmail</span>
            </button>
          </form>

          {/* Quick Demo Logins */}
          <div style={{ marginTop: '24px', borderTop: '1px dashed #E2E8F0', paddingTop: '16px' }}>
            <span style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#64748B', textAlign: 'center', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              ⚡ Or 1-Click Demo Testing (Gmail Accounts):
            </span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {[
                { email: 'rahul.sharma@gmail.com', name: 'Rahul Sharma', role: 'Verified Investor' as const, badge: 'High Net-Worth' },
                { email: 'priya.patel@gmail.com', name: 'Priya Patel', role: 'Franchise Partner' as const, badge: 'Multi-Unit Buyer' },
                { email: 'investor.guntur@gmail.com', name: 'Vikram Mehta', role: 'Business Buyer' as const, badge: 'Guntur Acquirer' },
              ].map((demo, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleQuickLogin(demo.email, demo.role)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 14px',
                    backgroundColor: '#F8FAFC',
                    border: '1px solid #E2E8F0',
                    borderRadius: '10px',
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                    textAlign: 'left',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#EFF6FF';
                    e.currentTarget.style.borderColor = '#BFDBFE';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#F8FAFC';
                    e.currentTarget.style.borderColor = '#E2E8F0';
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <FaGoogle style={{ color: '#EA4335', fontSize: '14px', flexShrink: 0 }} />
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#0F172A' }}>{demo.name}</div>
                      <div style={{ fontSize: '0.75rem', color: '#64748B' }}>{demo.email}</div>
                    </div>
                  </div>
                  <span style={{ fontSize: '0.7rem', fontWeight: 800, padding: '2px 8px', borderRadius: '12px', backgroundColor: '#ECFDF5', color: '#047857' }}>
                    {demo.badge}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div style={{ marginTop: '16px', textAlign: 'center', fontSize: '0.75rem', color: '#94A3B8' }}>
            🔒 Protected by Google SSO. We never share your credentials.
          </div>

        </div>
      </div>
    </div>
  );
};
