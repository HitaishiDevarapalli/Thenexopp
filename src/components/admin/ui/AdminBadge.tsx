import React from 'react';

export interface AdminBadgeProps {
  variant?: 'success' | 'info' | 'warning' | 'danger' | 'neutral' | 'purple';
  size?: 'sm' | 'md';
  dot?: boolean;
  icon?: React.ReactNode;
  children: React.ReactNode;
  style?: React.CSSProperties;
  className?: string;
}

export const AdminBadge: React.FC<AdminBadgeProps> = ({
  children,
  variant = 'neutral',
  size = 'md',
  dot = false,
  icon,
  style,
  className = '',
}) => {
  const variantStyles: Record<string, { bg: string; text: string; border: string; dot: string }> = {
    success: { bg: '#ECFDF5', text: '#059669', border: '#A7F3D0', dot: '#10B981' },
    info: { bg: '#EFF6FF', text: '#1D4ED8', border: '#BFDBFE', dot: '#3B82F6' },
    warning: { bg: '#FFFBEB', text: '#B45309', border: '#FDE68A', dot: '#F59E0B' },
    danger: { bg: '#FEF2F2', text: '#DC2626', border: '#FECACA', dot: '#EF4444' },
    neutral: { bg: '#F1F5F9', text: '#475569', border: '#E2E8F0', dot: '#94A3B8' },
    purple: { bg: '#FAF5FF', text: '#7E22CE', border: '#E9D5FF', dot: '#A855F7' },
  };

  const current = variantStyles[variant] || variantStyles.neutral;

  const sizeStyle: React.CSSProperties = size === 'sm' 
    ? { padding: '2px 8px', fontSize: '0.72rem', gap: '4px' } 
    : { padding: '4px 10px', fontSize: '0.78rem', gap: '6px' };

  return (
    <span
      className={`admin-badge admin-badge-${variant} ${className}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        borderRadius: '6px',
        fontWeight: 700,
        letterSpacing: '0.02em',
        backgroundColor: current.bg,
        color: current.text,
        border: `1px solid ${current.border}`,
        whiteSpace: 'nowrap',
        lineHeight: 1.2,
        ...sizeStyle,
        ...style,
      }}
    >
      {dot && (
        <span
          style={{
            width: '6px',
            height: '6px',
            borderRadius: '50%',
            backgroundColor: current.dot,
            flexShrink: 0,
          }}
        />
      )}
      {icon && <span style={{ display: 'inline-flex', alignItems: 'center' }}>{icon}</span>}
      {children}
    </span>
  );
};
