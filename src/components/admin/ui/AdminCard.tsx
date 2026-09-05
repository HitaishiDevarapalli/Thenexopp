import React from 'react';

export interface AdminCardProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'> {
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  action?: React.ReactNode;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  headerBorder?: boolean;
}

export const AdminCard: React.FC<AdminCardProps> = ({
  title,
  subtitle,
  action,
  children,
  padding = 'md',
  headerBorder = true,
  style,
  className = '',
  ...props
}) => {
  const paddingValues: Record<string, string> = {
    none: '0',
    sm: '16px',
    md: '24px',
    lg: '32px',
  };

  return (
    <div
      className={`admin-card ${className}`}
      style={{
        backgroundColor: '#FFFFFF',
        borderRadius: '12px',
        border: '1px solid #E2E8F0',
        boxShadow: '0 1px 3px rgba(15, 23, 42, 0.03)',
        overflow: 'hidden',
        transition: 'all 0.15s ease',
        ...style,
      }}
      {...props}
    >
      {(title || subtitle || action) && (
        <div
          style={{
            padding: '18px 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px',
            borderBottom: headerBorder ? '1px solid #F1F5F9' : 'none',
          }}
        >
          <div>
            {title && (
              <h3
                style={{
                  margin: 0,
                  fontSize: '1.05rem',
                  fontWeight: 700,
                  color: '#0F172A',
                  letterSpacing: '-0.01em',
                }}
              >
                {title}
              </h3>
            )}
            {subtitle && (
              <p
                style={{
                  margin: '4px 0 0 0',
                  fontSize: '0.85rem',
                  color: '#64748B',
                }}
              >
                {subtitle}
              </p>
            )}
          </div>
          {action && <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>{action}</div>}
        </div>
      )}
      <div style={{ padding: paddingValues[padding] }}>{children}</div>
    </div>
  );
};

export interface StatMetricCardProps {
  title: string;
  value: string | number;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  icon?: React.ReactNode;
  iconBg?: string;
  iconColor?: string;
  description?: string;
  onClick?: () => void;
  style?: React.CSSProperties;
}

export const StatMetricCard: React.FC<StatMetricCardProps> = ({
  title,
  value,
  change,
  changeType = 'positive',
  icon,
  iconBg = '#ECFDF5',
  iconColor = '#059669',
  description,
  onClick,
  style,
}) => {
  const changeColors = {
    positive: { bg: '#ECFDF5', text: '#059669' },
    negative: { bg: '#FEF2F2', text: '#DC2626' },
    neutral: { bg: '#F1F5F9', text: '#64748B' },
  };

  return (
    <div
      onClick={onClick}
      style={{
        backgroundColor: '#FFFFFF',
        borderRadius: '12px',
        border: '1px solid #E2E8F0',
        padding: '20px 22px',
        boxShadow: '0 1px 3px rgba(15, 23, 42, 0.03)',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'all 0.15s ease',
        ...style,
      }}
      onMouseEnter={(e) => {
        if (onClick) e.currentTarget.style.borderColor = '#CBD5E1';
      }}
      onMouseLeave={(e) => {
        if (onClick) e.currentTarget.style.borderColor = '#E2E8F0';
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#64748B' }}>{title}</span>
        {icon && (
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '8px',
              backgroundColor: iconBg,
              color: iconColor,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '18px',
              flexShrink: 0,
            }}
          >
            {icon}
          </div>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: '8px' }}>
        <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.02em', lineHeight: 1 }}>
          {value}
        </div>
        {change && (
          <span
            style={{
              fontSize: '0.75rem',
              fontWeight: 700,
              padding: '2px 8px',
              borderRadius: '6px',
              backgroundColor: changeColors[changeType].bg,
              color: changeColors[changeType].text,
            }}
          >
            {change}
          </span>
        )}
      </div>

      {description && (
        <div style={{ fontSize: '0.8rem', color: '#94A3B8', marginTop: '-4px' }}>
          {description}
        </div>
      )}
    </div>
  );
};
