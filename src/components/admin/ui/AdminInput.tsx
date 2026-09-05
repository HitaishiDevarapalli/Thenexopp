import React from 'react';
import { Search, ChevronDown } from 'lucide-react';

export interface AdminInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helperText?: string;
  error?: string;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
}

export const AdminInput: React.FC<AdminInputProps> = ({
  label,
  helperText,
  error,
  icon,
  iconPosition = 'left',
  fullWidth = true,
  style,
  disabled,
  ...props
}) => {
  return (
    <div style={{ width: fullWidth ? '100%' : 'auto', display: 'flex', flexDirection: 'column', gap: '6px' }}>
      {label && (
        <label
          style={{
            fontSize: '0.825rem',
            fontWeight: 600,
            color: '#334155',
            fontFamily: "'Plus Jakarta Sans', 'Inter', -apple-system, sans-serif",
          }}
        >
          {label}
        </label>
      )}
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
        {icon && iconPosition === 'left' && (
          <span
            style={{
              position: 'absolute',
              left: '12px',
              display: 'flex',
              alignItems: 'center',
              color: '#94A3B8',
              pointerEvents: 'none',
            }}
          >
            {icon}
          </span>
        )}
        <input
          disabled={disabled}
          style={{
            width: '100%',
            height: '40px',
            paddingLeft: icon && iconPosition === 'left' ? '38px' : '14px',
            paddingRight: icon && iconPosition === 'right' ? '38px' : '14px',
            borderRadius: '8px',
            border: `1px solid ${error ? '#EF4444' : '#CBD5E1'}`,
            backgroundColor: disabled ? '#F1F5F9' : '#FFFFFF',
            color: '#0F172A',
            fontSize: '0.875rem',
            fontWeight: 500,
            outline: 'none',
            boxSizing: 'border-box',
            fontFamily: "'Plus Jakarta Sans', 'Inter', -apple-system, sans-serif",
            transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
            ...style,
          }}
          onFocus={(e) => {
            if (!error && !disabled) {
              e.currentTarget.style.borderColor = '#059669';
              e.currentTarget.style.boxShadow = '0 0 0 3px rgba(5, 150, 105, 0.12)';
            }
          }}
          onBlur={(e) => {
            if (!error && !disabled) {
              e.currentTarget.style.borderColor = '#CBD5E1';
              e.currentTarget.style.boxShadow = 'none';
            }
          }}
          {...props}
        />
        {icon && iconPosition === 'right' && (
          <span
            style={{
              position: 'absolute',
              right: '12px',
              display: 'flex',
              alignItems: 'center',
              color: '#94A3B8',
              pointerEvents: 'none',
            }}
          >
            {icon}
          </span>
        )}
      </div>
      {error && <span style={{ fontSize: '0.75rem', color: '#DC2626', fontWeight: 500 }}>{error}</span>}
      {helperText && !error && <span style={{ fontSize: '0.75rem', color: '#64748B' }}>{helperText}</span>}
    </div>
  );
};

export interface AdminSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  helperText?: string;
  error?: string;
  options?: { value: string | number; label: string }[];
  fullWidth?: boolean;
}

export const AdminSelect: React.FC<AdminSelectProps> = ({
  label,
  helperText,
  error,
  options,
  children,
  fullWidth = true,
  style,
  disabled,
  ...props
}) => {
  return (
    <div style={{ width: fullWidth ? '100%' : 'auto', display: 'flex', flexDirection: 'column', gap: '6px' }}>
      {label && (
        <label
          style={{
            fontSize: '0.825rem',
            fontWeight: 600,
            color: '#334155',
            fontFamily: "'Plus Jakarta Sans', 'Inter', -apple-system, sans-serif",
          }}
        >
          {label}
        </label>
      )}
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
        <select
          disabled={disabled}
          style={{
            width: '100%',
            height: '40px',
            paddingLeft: '14px',
            paddingRight: '36px',
            borderRadius: '8px',
            border: `1px solid ${error ? '#EF4444' : '#CBD5E1'}`,
            backgroundColor: disabled ? '#F1F5F9' : '#FFFFFF',
            color: '#0F172A',
            fontSize: '0.875rem',
            fontWeight: 500,
            outline: 'none',
            appearance: 'none',
            cursor: disabled ? 'not-allowed' : 'pointer',
            boxSizing: 'border-box',
            fontFamily: "'Plus Jakarta Sans', 'Inter', -apple-system, sans-serif",
            transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
            ...style,
          }}
          onFocus={(e) => {
            if (!error && !disabled) {
              e.currentTarget.style.borderColor = '#059669';
              e.currentTarget.style.boxShadow = '0 0 0 3px rgba(5, 150, 105, 0.12)';
            }
          }}
          onBlur={(e) => {
            if (!error && !disabled) {
              e.currentTarget.style.borderColor = '#CBD5E1';
              e.currentTarget.style.boxShadow = 'none';
            }
          }}
          {...props}
        >
          {options ? options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          )) : children}
        </select>
        <span
          style={{
            position: 'absolute',
            right: '12px',
            display: 'flex',
            alignItems: 'center',
            color: '#64748B',
            pointerEvents: 'none',
          }}
        >
          <ChevronDown size={16} />
        </span>
      </div>
      {error && <span style={{ fontSize: '0.75rem', color: '#DC2626', fontWeight: 500 }}>{error}</span>}
      {helperText && !error && <span style={{ fontSize: '0.75rem', color: '#64748B' }}>{helperText}</span>}
    </div>
  );
};

export interface AdminTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  helperText?: string;
  error?: string;
  fullWidth?: boolean;
}

export const AdminTextarea: React.FC<AdminTextareaProps> = ({
  label,
  helperText,
  error,
  fullWidth = true,
  style,
  disabled,
  rows = 3,
  ...props
}) => {
  return (
    <div style={{ width: fullWidth ? '100%' : 'auto', display: 'flex', flexDirection: 'column', gap: '6px' }}>
      {label && (
        <label
          style={{
            fontSize: '0.825rem',
            fontWeight: 600,
            color: '#334155',
            fontFamily: "'Plus Jakarta Sans', 'Inter', -apple-system, sans-serif",
          }}
        >
          {label}
        </label>
      )}
      <textarea
        rows={rows}
        disabled={disabled}
        style={{
          width: '100%',
          padding: '12px 14px',
          borderRadius: '8px',
          border: `1px solid ${error ? '#EF4444' : '#CBD5E1'}`,
          backgroundColor: disabled ? '#F1F5F9' : '#FFFFFF',
          color: '#0F172A',
          fontSize: '0.875rem',
          fontWeight: 500,
          outline: 'none',
          boxSizing: 'border-box',
          fontFamily: "'Plus Jakarta Sans', 'Inter', -apple-system, sans-serif",
          resize: 'vertical',
          transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
          ...style,
        }}
        onFocus={(e) => {
          if (!error && !disabled) {
            e.currentTarget.style.borderColor = '#059669';
            e.currentTarget.style.boxShadow = '0 0 0 3px rgba(5, 150, 105, 0.12)';
          }
        }}
        onBlur={(e) => {
          if (!error && !disabled) {
            e.currentTarget.style.borderColor = '#CBD5E1';
            e.currentTarget.style.boxShadow = 'none';
          }
        }}
        {...props}
      />
      {error && <span style={{ fontSize: '0.75rem', color: '#DC2626', fontWeight: 500 }}>{error}</span>}
      {helperText && !error && <span style={{ fontSize: '0.75rem', color: '#64748B' }}>{helperText}</span>}
    </div>
  );
};

export interface AdminToggleProps {
  label?: string;
  description?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
}

export const AdminToggle: React.FC<AdminToggleProps> = ({
  label,
  description,
  checked,
  onChange,
  disabled = false,
}) => {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
      {(label || description) && (
        <div>
          {label && <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#0F172A' }}>{label}</div>}
          {description && <div style={{ fontSize: '0.775rem', color: '#64748B', marginTop: '2px' }}>{description}</div>}
        </div>
      )}
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => !disabled && onChange(!checked)}
        style={{
          width: '44px',
          height: '24px',
          borderRadius: '12px',
          backgroundColor: checked ? '#059669' : '#CBD5E1',
          border: 'none',
          padding: '2px',
          cursor: disabled ? 'not-allowed' : 'pointer',
          position: 'relative',
          transition: 'background-color 0.2s ease',
          flexShrink: 0,
        }}
      >
        <span
          style={{
            display: 'block',
            width: '20px',
            height: '20px',
            borderRadius: '50%',
            backgroundColor: '#FFFFFF',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.2)',
            transform: checked ? 'translateX(20px)' : 'translateX(0)',
            transition: 'transform 0.2s ease',
          }}
        />
      </button>
    </div>
  );
};

export interface AdminSearchBarProps {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  onClear?: () => void;
  style?: React.CSSProperties;
}

export const AdminSearchBar: React.FC<AdminSearchBarProps> = ({
  value,
  onChange,
  placeholder = 'Search...',
  onClear,
  style,
}) => {
  return (
    <div style={{ position: 'relative', display: 'flex', alignItems: 'center', width: '100%', minWidth: '240px', ...style }}>
      <Search size={16} style={{ position: 'absolute', left: '12px', color: '#94A3B8', pointerEvents: 'none' }} />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        style={{
          width: '100%',
          height: '38px',
          paddingLeft: '36px',
          paddingRight: onClear && value ? '32px' : '14px',
          borderRadius: '8px',
          border: '1px solid #CBD5E1',
          backgroundColor: '#FFFFFF',
          fontSize: '0.85rem',
          fontWeight: 500,
          color: '#0F172A',
          outline: 'none',
          boxSizing: 'border-box',
          fontFamily: "'Plus Jakarta Sans', 'Inter', -apple-system, sans-serif",
          transition: 'all 0.15s ease',
        }}
        onFocus={(e) => {
          e.currentTarget.style.borderColor = '#059669';
          e.currentTarget.style.boxShadow = '0 0 0 3px rgba(5, 150, 105, 0.12)';
        }}
        onBlur={(e) => {
          e.currentTarget.style.borderColor = '#CBD5E1';
          e.currentTarget.style.boxShadow = 'none';
        }}
      />
      {onClear && value && (
        <button
          type="button"
          onClick={onClear}
          style={{
            position: 'absolute',
            right: '8px',
            background: 'none',
            border: 'none',
            color: '#94A3B8',
            cursor: 'pointer',
            padding: '4px',
            fontSize: '14px',
            lineHeight: 1,
          }}
        >
          &times;
        </button>
      )}
    </div>
  );
};
