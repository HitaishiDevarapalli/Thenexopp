import React from 'react';
import { Inbox } from 'lucide-react';
import { AdminButton } from './AdminButton';

export interface AdminEmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  style?: React.CSSProperties;
}

export const AdminEmptyState: React.FC<AdminEmptyStateProps> = ({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  style,
}) => {
  return (
    <div
      style={{
        padding: '48px 24px',
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#FFFFFF',
        borderRadius: '12px',
        border: '1px dashed #CBD5E1',
        ...style,
      }}
    >
      <div
        style={{
          width: '48px',
          height: '48px',
          borderRadius: '12px',
          backgroundColor: '#F1F5F9',
          color: '#94A3B8',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '14px',
        }}
      >
        {icon || <Inbox size={24} />}
      </div>
      <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: '#0F172A' }}>{title}</h4>
      {description && (
        <p style={{ margin: '6px 0 0 0', fontSize: '0.85rem', color: '#64748B', maxWidth: '380px' }}>
          {description}
        </p>
      )}
      {actionLabel && onAction && (
        <div style={{ marginTop: '18px' }}>
          <AdminButton variant="outline" size="sm" onClick={onAction}>
            {actionLabel}
          </AdminButton>
        </div>
      )}
    </div>
  );
};
