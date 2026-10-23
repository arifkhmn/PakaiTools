import React, { useState, useEffect } from 'react';
import { AlertCircle, Copy, Check, X } from 'lucide-react';
import { isInAppBrowser } from '../../lib/format';

export const InAppBrowserNotice: React.FC = () => {
  const [visible, setVisible] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (isInAppBrowser()) {
      const dismissed = sessionStorage.getItem('dismiss_inapp_notice');
      if (!dismissed) {
        setVisible(true);
      }
    }
  }, []);

  if (!visible) return null;

  const handleDismiss = () => {
    setVisible(false);
    sessionStorage.setItem('dismiss_inapp_notice', 'true');
  };

  const handleCopyLink = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      });
    }
  };

  return (
    <aside
      id="in-app-browser-alert"
      aria-label="Pemberitahuan browser internal"
      style={{
        backgroundColor: 'var(--warning-bg)',
        borderBottom: '1px solid #FDE68A',
        color: 'var(--warning)',
        padding: '10px 16px',
        fontSize: '0.8125rem',
        lineHeight: 1.5,
        position: 'relative',
        zIndex: 100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div
        style={{
          maxWidth: 'var(--container-max-width)',
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px',
          flexWrap: 'wrap'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', flex: 1, minWidth: '240px' }}>
          <AlertCircle size={18} style={{ flexShrink: 0, marginTop: '2px', color: '#B45309' }} />
          <div>
            <strong style={{ color: '#92400E' }}>Membuka dari WhatsApp / Instagram?</strong> Unduhan file di HP sering diblokir oleh browser internal medsos.
            {' '}Ketuk tombol <strong style={{ color: '#92400E' }}>titik tiga (⋮)</strong> di pojok kanan atas lalu pilih <strong style={{ color: '#92400E' }}>&quot;Buka di Chrome / Safari&quot;</strong> agar unduhan lancar.
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
          <button
            type="button"
            onClick={handleCopyLink}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              padding: '4px 10px',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid #D97706',
              backgroundColor: '#FFFFFF',
              color: '#92400E',
              fontSize: '0.75rem',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            {copied ? <Check size={14} style={{ color: '#059669' }} /> : <Copy size={14} />}
            {copied ? 'Link Disalin!' : 'Salin Link'}
          </button>

          <button
            type="button"
            onClick={handleDismiss}
            aria-label="Tutup pemberitahuan"
            style={{
              background: 'none',
              border: 'none',
              color: '#92400E',
              cursor: 'pointer',
              padding: '4px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <X size={16} />
          </button>
        </div>
      </div>
    </aside>
  );
};
