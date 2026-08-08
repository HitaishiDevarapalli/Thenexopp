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
  showTagline = false,
  style,
  className = '',
}) => {
  const heightConfig = {
    sm: 38,
    md: 52,
    lg: 66,
    xl: 82,
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

        {/* Golden Yellow Secondary Buildings */}
        <rect x="284" y="20" width="16" height="70" fill="#D97706" />
        <rect x="305" y="42" width="14" height="48" fill="#D97706" />
        <rect x="323" y="60" width="12" height="30" fill="#D97706" />

        {/* Text "The" (Golden Yellow #D97706) */}
        <text
          x="30"
          y="155"
          fill="#D97706"
          fontFamily="'Plus Jakarta Sans', 'Inter', 'Roboto', sans-serif"
          fontWeight="900"
          fontSize="68"
          letterSpacing="-1px"
        >
          The
        </text>

        {/* Text "Nex" (Deep Navy Blue #002B66 / White for dark mode) */}
        <text
          x="156"
          y="155"
          fill={dark ? "#FFFFFF" : "#002B66"}
          fontFamily="'Plus Jakarta Sans', 'Inter', 'Roboto', sans-serif"
          fontWeight="900"
          fontSize="68"
          letterSpacing="-1px"
        >
          Nex
        </text>

        {/* Magnifying Glass 'O' */}
        <circle cx="320" cy="132" r="22" stroke="#059669" strokeWidth="10" fill="none" />
        <line x1="334" y1="147" x2="350" y2="168" stroke="#059669" strokeWidth="10" strokeLinecap="round" />

        {/* Text "pp" (Emerald Green #059669) */}
        <text
          x="356"
          y="155"
          fill="#059669"
          fontFamily="'Plus Jakarta Sans', 'Inter', 'Roboto', sans-serif"
          fontWeight="800"
          fontSize="68"
          letterSpacing="-1px"
        >
          pp
        </text>

        {/* Dynamic Curved Green Swoop Underline */}
        <path
          d="M 38 188 Q 240 162 432 188 Q 240 174 38 188 Z"
          fill="#059669"
        />
      </svg>

      {/* Optional Tagline */}
      {showTagline && null}
    </div>
  );
};

export default Logo;
