import React from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  dark?: boolean;
  showTagline?: boolean;
  style?: React.CSSProperties;
}

export const Logo: React.FC<LogoProps> = ({
  size = 'md',
  dark = false,
  showTagline = true,
  style,
}) => {
  const sizeConfig = {
    sm: { icon: 32, text: '18px', tagline: '9px', gap: '8px' },
    md: { icon: 42, text: '23px', tagline: '11px', gap: '10px' },
    lg: { icon: 52, text: '28px', tagline: '12.5px', gap: '12px' },
    xl: { icon: 64, text: '34px', tagline: '14px', gap: '14px' },
  };

  const config = sizeConfig[size] || sizeConfig.md;

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: config.gap,
        textDecoration: 'none',
        userSelect: 'none',
        ...style,
      }}
    >
      {/* Crisp Vector Emblem */}
      <div
        style={{
          width: `${config.icon}px`,
          height: `${config.icon}px`,
          flexShrink: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <svg
          viewBox="0 0 44 44"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          style={{ width: '100%', height: '100%', filter: 'drop-shadow(0 4px 6px rgba(22, 163, 74, 0.25))' }}
        >
          <defs>
            <linearGradient id="nexOppGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#10B981" />
              <stop offset="100%" stopColor="#059669" />
            </linearGradient>
            <linearGradient id="accentGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#6EE7B7" />
              <stop offset="100%" stopColor="#A7F3D0" />
            </linearGradient>
          </defs>

          {/* Background Circle Badge */}
          <circle cx="22" cy="22" r="22" fill="url(#nexOppGrad)" />

          {/* Inner subtle glow ring */}
          <circle cx="22" cy="22" r="20.5" stroke="#34D399" strokeWidth="0.75" strokeOpacity="0.5" fill="none" />

          {/* Ascending Investment/Franchise Bars */}
          <rect x="10.5" y="24" width="5.5" height="10" rx="1.5" fill="#FFFFFF" fillOpacity="0.85" />
          <rect x="18" y="17" width="5.5" height="17" rx="1.5" fill="#FFFFFF" />
          <rect x="25.5" y="11" width="5.5" height="23" rx="1.5" fill="#FFFFFF" />

          {/* Dynamic Upward Growth Arrow */}
          <path
            d="M 10 27 Q 19 19, 33 11"
            stroke="url(#accentGrad)"
            strokeWidth="3"
            strokeLinecap="round"
            fill="none"
          />
          <path
            d="M 26.5 11 L 33 11 L 33 17.5"
            stroke="url(#accentGrad)"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
        </svg>
      </div>

      {/* Brand Text + Tagline */}
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', lineHeight: 1 }}>
          <span
            style={{
              fontSize: config.text,
              fontWeight: 800,
              color: dark ? '#FFFFFF' : '#0F172A',
              letterSpacing: '-0.03em',
              fontFamily: "'Outfit', 'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
            }}
          >
            TheNex
          </span>
          <span
            style={{
              fontSize: config.text,
              fontWeight: 800,
              color: '#16A34A',
              letterSpacing: '-0.03em',
              fontFamily: "'Outfit', 'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
            }}
          >
            Oop
          </span>
        </div>

        {showTagline && (
          <span
            style={{
              fontSize: config.tagline,
              fontWeight: 600,
              color: dark ? '#94A3B8' : '#64748B',
              letterSpacing: '0.04em',
              marginTop: size === 'xl' ? '4px' : size === 'lg' ? '3px' : '2px',
              fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
            }}
          >
            — Find. Invest. Grow.
          </span>
        )}
      </div>
    </div>
  );
};
