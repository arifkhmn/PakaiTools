import React, { useState, useMemo } from 'react';
import { Copy, Check, Trash2 } from 'lucide-react';
import { ToolLayout } from '../../components/layout/ToolLayout';
import { TOOLS } from '../../data/tools';
import { cleanText } from '../../lib/textHelpers';
import type { CleanOptions } from '../../lib/textHelpers';

export const TextCleanerPage: React.FC = () => {
  const tool = TOOLS.find(t => t.id === 'text-cleaner')!;

  const [rawText, setRawText] = useState<string>('');
  const [options, setOptions] = useState<CleanOptions>({
    trimEdges: true,
    removeDuplicateSpaces: true,
    removeBlankLines: true,
    removeDuplicateLines: false,
    normalizeLineEndings: true
  });
  const [isCopied, setIsCopied] = useState<boolean>(false);

  const cleanedText = useMemo(() => {
    return cleanText(rawText, options);
  }, [rawText, options]);

  const handleCopy = async () => {
    if (!cleanedText) return;
    try {
      await navigator.clipboard.writeText(cleanedText);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch {
      // ignore
    }
  };

  const handleClear = () => {
    setRawText('');
  };

  return (
    <ToolLayout tool={tool}>
      {/* Options Bar */}
      <div className="panel" style={{ marginBottom: '20px' }}>
        <h2 style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '14px' }}>
          Pilihan Pembersihan Teks
        </h2>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '12px'
        }}>
          <label style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.875rem' }}>
            <input
              type="checkbox"
              checked={options.trimEdges}
              onChange={(e) => setOptions({ ...options, trimEdges: e.target.checked })}
              style={{ width: 'auto', accentColor: 'var(--accent-primary)' }}
            />
            <span>Trim spasi di awal & akhir baris</span>
          </label>

          <label style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.875rem' }}>
            <input
              type="checkbox"
              checked={options.removeDuplicateSpaces}
              onChange={(e) => setOptions({ ...options, removeDuplicateSpaces: e.target.checked })}
              style={{ width: 'auto', accentColor: 'var(--accent-primary)' }}
            />
            <span>Hapus spasi ganda berulang</span>
          </label>

          <label style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.875rem' }}>
            <input
              type="checkbox"
              checked={options.removeBlankLines}
              onChange={(e) => setOptions({ ...options, removeBlankLines: e.target.checked })}
              style={{ width: 'auto', accentColor: 'var(--accent-primary)' }}
            />
            <span>Hapus baris kosong</span>
          </label>

          <label style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.875rem' }}>
            <input
              type="checkbox"
              checked={options.removeDuplicateLines}
              onChange={(e) => setOptions({ ...options, removeDuplicateLines: e.target.checked })}
              style={{ width: 'auto', accentColor: 'var(--accent-primary)' }}
            />
            <span>Hapus baris duplikat</span>
          </label>

          <label style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.875rem' }}>
            <input
              type="checkbox"
              checked={options.normalizeLineEndings}
              onChange={(e) => setOptions({ ...options, normalizeLineEndings: e.target.checked })}
              style={{ width: 'auto', accentColor: 'var(--accent-primary)' }}
            />
            <span>Normalisasi baris baru (LF)</span>
          </label>
        </div>
      </div>

      {/* Editor Columns */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
        {/* Input Text */}
        <div className="panel" style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <label htmlFor="raw-text-input" style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>
              Teks Asli
            </label>
            {rawText && (
              <button
                type="button"
                className="btn btn-outline btn-sm"
                onClick={handleClear}
              >
                <Trash2 size={13} color="var(--error)" />
                <span>Hapus</span>
              </button>
            )}
          </div>

          <textarea
            id="raw-text-input"
            rows={12}
            value={rawText}
            onChange={(e) => setRawText(e.target.value)}
            placeholder="Tempelkan draf teks mentah yang berantakan di sini..."
            style={{
              flex: 1,
              minHeight: '260px',
              lineHeight: 1.6,
              fontSize: '0.875rem',
              resize: 'vertical'
            }}
          />
        </div>

        {/* Cleaned Result */}
        <div className="panel" style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>
              Hasil Teks Bersih
            </span>
            {cleanedText && (
              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={handleCopy}
              >
                {isCopied ? <Check size={14} /> : <Copy size={14} />}
                <span>{isCopied ? 'Tersalin' : 'Salin Hasil'}</span>
              </button>
            )}
          </div>

          <textarea
            readOnly
            rows={12}
            value={cleanedText}
            placeholder="Teks bersih akan muncul di sini secara otomatis..."
            style={{
              flex: 1,
              minHeight: '260px',
              lineHeight: 1.6,
              fontSize: '0.875rem',
              backgroundColor: 'var(--bg-surface)',
              resize: 'vertical'
            }}
          />
        </div>
      </div>
    </ToolLayout>
  );
};
