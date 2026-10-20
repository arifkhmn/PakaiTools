import React from 'react';
import { AlertCircle, AlertTriangle, CheckCircle, Info } from 'lucide-react';

interface StatusMessageProps {
  type: 'error' | 'warning' | 'success' | 'info';
  title?: string;
  message: string;
  onDismiss?: () => void;
}

export const StatusMessage: React.FC<StatusMessageProps> = ({
  type,
  title,
  message,
  onDismiss
}) => {
  const getStyles = () => {
    switch (type) {
      case 'error':
        return {
          bg: 'var(--error-bg)',
          border: '#FECDCA',
          color: 'var(--error)',
          icon: <AlertCircle size={18} style={{ flexShrink: 0 }} />
        };
      case 'warning':
        return {
          bg: 'var(--warning-bg)',
          border: '#FEDF89',
          color: 'var(--warning)',
          icon: <AlertTriangle size={18} style={{ flexShrink: 0 }} />
        };
      case 'success':
        return {
          bg: 'var(--success-bg)',
          border: '#A6F4C5',
          color: 'var(--success)',
          icon: <CheckCircle size={18} style={{ flexShrink: 0 }} />
        };
      case 'info':
      default:
        return {
          bg: 'var(--accent-subtle)',
          border: '#C3E2D0',
          color: 'var(--accent-text)',
          icon: <Info size={18} style={{ flexShrink: 0 }} />
        };
    }
  };

  const style = getStyles();

  return (
    <div
      role={type === 'error' ? 'alert' : 'status'}
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: '12px',
        padding: '12px 16px',
        borderRadius: 'var(--radius-sm)',
        backgroundColor: style.bg,
        border: `1px solid ${style.border}`,
        color: style.color,
        fontSize: '0.875rem',
        margin: '12px 0'
      }}
    >
      <div style={{ marginTop: '2px' }}>{style.icon}</div>
      <div style={{ flex: 1 }}>
        {title && <div style={{ fontWeight: 600, marginBottom: '2px' }}>{title}</div>}
        <div style={{ lineHeight: 1.5 }}>{message}</div>
      </div>
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          style={{
            color: style.color,
            fontSize: '0.75rem',
            padding: '2px 6px',
            borderRadius: '4px',
            border: `1px solid ${style.border}`
          }}
        >
          Tutup
        </button>
      )}
    </div>
  );
};
