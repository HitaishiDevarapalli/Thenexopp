import React from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  dark?: boolean;
  showTagline?: boolean;
  style?: React.CSSProperties;
  className?: string;
}

export const Logo: React.FC<LogoProps> = ({
  size = 'md',
  dark = false,
  showTagline = true,
  style,
  className = '',
}) => {
  const heightConfig = {
    sm: 36,
    md: 48,
    lg: 60,
    xl: 76,
  };

  const h = heightConfig[size] || heightConfig.md;

  return (
    <div
      className={`nexopp-logo-container ${className}`}
      style={{
        display: 'inline-flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        textDecoration: 'none',
        userSelect: 'none',
        cursor: 'pointer',
        ...style,
      }}
    >
      {/* Official Brand Logo SVG */}
      <svg
        viewBox="0 0 480 230"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ height: `${h}px`, width: 'auto', display: 'block' }}
      >
        {/* Dark Blue Primary House Roof */}
        <path
          d="M 135 90 L 205 28 L 275 90 H 260 L 205 42 L 150 90 Z"
          fill="#002B66"
        />

        {/* 4-Pane Window on Blue House */}
        <rect x="194" y="65" width="10" height="10" fill="#002B66" />
        <rect x="207" y="65" width="10" height="10" fill="#002B66" />
        <rect x="194" y="78" width="10" height="10" fill="#002B66" />
        <rect x="207" y="78" width="10" height="10" fill="#002B66" />

        {/* Gold/Yellow Secondary House Roof */}
        <path
          d="M 270 72 L 300 45 L 335 90 H 322 L 300 58 L 278 80 Z"
          fill="#D97706"
        />

        {/* Text "The" (Black / White for dark mode) */}
        <text
          x="30"
          y="155"
          fill={dark ? "#FFFFFF" : "#000000"}
          fontFamily="'Plus Jakarta Sans', 'Inter', 'Roboto', sans-serif"
          fontWeight="900"
          fontSize="66"
          letterSpacing="-1px"
        >
          The
        </text>

        {/* Text "Nex" (Green #059669) */}
        <text
          x="152"
          y="155"
          fill="#059669"
          fontFamily="'Plus Jakarta Sans', 'Inter', 'Roboto', sans-serif"
          fontWeight="800"
          fontSize="66"
          letterSpacing="-1px"
        >
          Nex
        </text>

        {/* Magnifying Glass 'O' */}
        <circle cx="318" cy="132" r="22" stroke="#059669" strokeWidth="10" fill="none" />
        <line x1="332" y1="147" x2="348" y2="168" stroke="#059669" strokeWidth="10" strokeLinecap="round" />
        <circle cx="312" cy="125" r="14" stroke="#059669" strokeWidth="3" fill="none" strokeDasharray="16 8" />

        {/* Text "pp" (Green #059669) */}
        <text
          x="354"
          y="155"
          fill="#059669"
          fontFamily="'Plus Jakarta Sans', 'Inter', 'Roboto', sans-serif"
          fontWeight="800"
          fontSize="66"
          letterSpacing="-1px"
        >
          pp
        </text>

        {/* Dynamic Curved Green Swoop Underline */}
        <path
          d="M 40 188 Q 240 162 430 188 Q 240 174 40 188 Z"
          fill="#059669"
        />
      </svg>

      {/* Optional Tagline */}
      {showTagline && (
        <span
          style={{
            fontSize: `${Math.max(9, Math.round(h * 0.2))}px`,
            fontWeight: 700,
            color: dark ? '#94A3B8' : '#475569',
            letterSpacing: '0.04em',
            marginTop: '-4px',
            marginLeft: '12px',
            fontFamily: "'Inter', -apple-system, sans-serif",
          }}
        >
          — Find. Invest. Grow.
        </span>
      )}
    </div>
  );
};
