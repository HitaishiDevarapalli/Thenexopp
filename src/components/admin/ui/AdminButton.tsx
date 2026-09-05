import React from 'react';
import { Loader2 } from 'lucide-react';

export interface AdminButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost' | 'success';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  loading?: boolean;
  fullWidth?: boolean;
}

export const AdminButton: React.FC<AdminButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  icon,
  iconPosition = 'left',
  loading = false,
  fullWidth = false,
  disabled,
  style,
  className = '',
  ...props
}) => {
  const sizeStyles: Record<string, React.CSSProperties> = {
    sm: { height: '32px', padding: '0 12px', fontSize: '0.8rem', gap: '6px' },
    md: { height: '40px', padding: '0 16px', fontSize: '0.875rem', gap: '8px' },
    lg: { height: '46px', padding: '0 22px', fontSize: '0.95rem', gap: '10px' },
  };

  const variantStyles: Record<string, React.CSSProperties> = {
    primary: {
      backgroundColor: '#059669',
      color: '#FFFFFF',
      border: '1px solid #059669',
      boxShadow: '0 1px 2px rgba(5, 150, 105, 0.2)',
    },
    secondary: {
      backgroundColor: '#0F172A',
      color: '#FFFFFF',
      border: '1px solid #0F172A',
      boxShadow: '0 1px 2px rgba(15, 23, 42, 0.15)',
    },
    outline: {
      backgroundColor: '#FFFFFF',
      color: '#334155',
      border: '1px solid #CBD5E1',
      boxShadow: '0 1px 2px rgba(0, 0, 0, 0.03)',
    },
    ghost: {
      backgroundColor: 'transparent',
      color: '#475569',
      border: '1px solid transparent',
    },
    danger: {
      backgroundColor: '#DC2626',
      color: '#FFFFFF',
      border: '1px solid #DC2626',
      boxShadow: '0 1px 2px rgba(220, 38, 38, 0.2)',
    },
    success: {
      backgroundColor: '#10B981',
      color: '#FFFFFF',
      border: '1px solid #10B981',
      boxShadow: '0 1px 2px rgba(16, 185, 129, 0.2)',
    }
  };

  const baseStyle: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '8px',
    fontWeight: 600,
    fontFamily: "'Plus Jakarta Sans', 'Inter', -apple-system, sans-serif",
    cursor: disabled || loading ? 'not-allowed' : 'pointer',
    opacity: disabled || loading ? 0.65 : 1,
    transition: 'all 0.15s ease',
    width: fullWidth ? '100%' : 'auto',
    whiteSpace: 'nowrap',
    userSelect: 'none',
    boxSizing: 'border-box',
    ...sizeStyles[size],
    ...variantStyles[variant],
    ...style,
  };

  return (
    <button
      disabled={disabled || loading}
      style={baseStyle}
      className={`admin-btn admin-btn-${variant} ${className}`}
      {...props}
    >
      {loading ? (
        <Loader2 className="animate-spin" size={size === 'sm' ? 14 : 16} />
      ) : (
        <>
          {icon && iconPosition === 'left' && <span style={{ display: 'inline-flex', alignItems: 'center' }}>{icon}</span>}
          {children}
          {icon && iconPosition === 'right' && <span style={{ display: 'inline-flex', alignItems: 'center' }}>{icon}</span>}
        </>
      )}
    </button>
  );
};
