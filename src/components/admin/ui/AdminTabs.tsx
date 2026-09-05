import React from 'react';

export interface AdminTabItem {
  id: string;
  label: React.ReactNode;
  icon?: React.ReactNode;
  count?: number | string;
  badgeVariant?: 'success' | 'info' | 'warning' | 'danger' | 'neutral';
}

export interface AdminTabsProps {
  tabs: AdminTabItem[];
  activeTab: string;
  onChange: (tabId: string) => void;
  variant?: 'underline' | 'pills' | 'segmented';
  size?: 'sm' | 'md';
  style?: React.CSSProperties;
}

export const AdminTabs: React.FC<AdminTabsProps> = ({
  tabs,
  activeTab,
  onChange,
  variant = 'underline',
  size = 'md',
  style,
}) => {
  if (variant === 'segmented') {
    return (
      <div
        style={{
          display: 'inline-flex',
          backgroundColor: '#F1F5F9',
          padding: '4px',
          borderRadius: '10px',
          gap: '2px',
          ...style,
        }}
      >
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onChange(tab.id)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: size === 'sm' ? '6px 12px' : '8px 16px',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: isActive ? '#FFFFFF' : 'transparent',
                color: isActive ? '#0F172A' : '#64748B',
                fontWeight: isActive ? 700 : 500,
                fontSize: size === 'sm' ? '0.8rem' : '0.875rem',
                cursor: 'pointer',
                boxShadow: isActive ? '0 1px 3px rgba(0, 0, 0, 0.08)' : 'none',
                transition: 'all 0.15s ease',
                whiteSpace: 'nowrap',
              }}
            >
              {tab.icon && <span style={{ display: 'inline-flex', alignItems: 'center' }}>{tab.icon}</span>}
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span
                  style={{
                    padding: '1px 6px',
                    borderRadius: '10px',
                    fontSize: '0.725rem',
                    fontWeight: 700,
                    backgroundColor: isActive ? '#ECFDF5' : '#E2E8F0',
                    color: isActive ? '#059669' : '#64748B',
                  }}
                >
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>
    );
  }

  if (variant === 'pills') {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', ...style }}>
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onChange(tab.id)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: size === 'sm' ? '5px 12px' : '7px 16px',
                borderRadius: '20px',
                border: isActive ? '1px solid #059669' : '1px solid #E2E8F0',
                backgroundColor: isActive ? '#ECFDF5' : '#FFFFFF',
                color: isActive ? '#059669' : '#475569',
                fontWeight: isActive ? 700 : 500,
                fontSize: size === 'sm' ? '0.8rem' : '0.85rem',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                whiteSpace: 'nowrap',
              }}
            >
              {tab.icon && <span style={{ display: 'inline-flex', alignItems: 'center' }}>{tab.icon}</span>}
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span
                  style={{
                    padding: '1px 6px',
                    borderRadius: '10px',
                    fontSize: '0.725rem',
                    fontWeight: 700,
                    backgroundColor: isActive ? '#059669' : '#F1F5F9',
                    color: isActive ? '#FFFFFF' : '#64748B',
                  }}
                >
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>
    );
  }

  // Default: underline variant
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '24px',
        borderBottom: '1px solid #E2E8F0',
        width: '100%',
        overflowX: 'auto',
        ...style,
      }}
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '12px 2px',
              border: 'none',
              borderBottom: isActive ? '2px solid #059669' : '2px solid transparent',
              backgroundColor: 'transparent',
              color: isActive ? '#059669' : '#64748B',
              fontWeight: isActive ? 700 : 500,
              fontSize: size === 'sm' ? '0.85rem' : '0.9rem',
              cursor: 'pointer',
              marginBottom: '-1px',
              transition: 'all 0.15s ease',
              whiteSpace: 'nowrap',
            }}
          >
            {tab.icon && <span style={{ display: 'inline-flex', alignItems: 'center' }}>{tab.icon}</span>}
            <span>{tab.label}</span>
            {tab.count !== undefined && (
              <span
                style={{
                  padding: '1px 6px',
                  borderRadius: '10px',
                  fontSize: '0.725rem',
                  fontWeight: 700,
                  backgroundColor: isActive ? '#ECFDF5' : '#F1F5F9',
                  color: isActive ? '#059669' : '#64748B',
                }}
              >
                {tab.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};
