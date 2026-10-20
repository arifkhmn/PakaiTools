import React from 'react';

interface AdSlotProps {
  slotId?: string;
  format?: 'horizontal' | 'rectangle';
  enabled?: boolean; // Default false as per product specification
}

/**
 * Reusable advertising container component.
 * By default disabled (returns null) to ensure zero interference,
 * zero layout shift, and zero fabricated placeholder ad content.
 */
export const AdSlot: React.FC<AdSlotProps> = ({
  slotId = 'default-slot',
  format = 'horizontal',
  enabled = false
}) => {
  if (!enabled) {
    return null;
  }

  return (
    <div
      id={`ad-${slotId}`}
      aria-label="Sponsor / Iklan"
      style={{
        margin: '24px 0',
        padding: '12px',
        backgroundColor: 'var(--bg-surface)',
        border: '1px dashed var(--border-color)',
        borderRadius: 'var(--radius-sm)',
        textAlign: 'center',
        minHeight: format === 'horizontal' ? '90px' : '250px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '0.75rem',
        color: 'var(--text-muted)'
      }}
    >
      <span style={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}>Iklan</span>
    </div>
  );
};
