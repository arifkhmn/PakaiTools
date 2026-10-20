import React, { useState, useMemo } from 'react';
import { Copy, Check, Trash2, Clock } from 'lucide-react';
import { ToolLayout } from '../../components/layout/ToolLayout';
import { TOOLS } from '../../data/tools';
import { formatNumber } from '../../lib/format';
import { analyzeText } from '../../lib/textHelpers';

export const WordCounterPage: React.FC = () => {
  const tool = TOOLS.find(t => t.id === 'word-counter')!;

  const [text, setText] = useState<string>('');
  const [isCopied, setIsCopied] = useState<boolean>(false);

  const stats = useMemo(() => analyzeText(text), [text]);

  const handleCopy = async () => {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch {
      // ignore
    }
  };

  const handleClear = () => {
    setText('');
  };

  return (
    <ToolLayout tool={tool}>
      {/* Metric Cards Banner */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
        gap: '12px',
        marginBottom: '20px'
      }}>
        <div className="panel" style={{ padding: '16px', textAlign: 'center' }}>
          <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>
            Jumlah Kata
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--accent-primary)' }} className="tabular-nums">
            {formatNumber(stats.words)}
          </div>
        </div>

        <div className="panel" style={{ padding: '16px', textAlign: 'center' }}>
          <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>
            Karakter (dg Spasi)
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--text-primary)' }} className="tabular-nums">
            {formatNumber(stats.characters)}
          </div>
        </div>

        <div className="panel" style={{ padding: '16px', textAlign: 'center' }}>
          <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>
            Karakter (Tanpa Spasi)
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--text-primary)' }} className="tabular-nums">
            {formatNumber(stats.charactersNoSpaces)}
          </div>
        </div>

        <div className="panel" style={{ padding: '16px', textAlign: 'center' }}>
          <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>
            Paragraf
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--text-primary)' }} className="tabular-nums">
            {formatNumber(stats.paragraphs)}
          </div>
        </div>

        <div className="panel" style={{ padding: '16px', textAlign: 'center' }}>
          <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>
            Baris Teks
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--text-primary)' }} className="tabular-nums">
            {formatNumber(stats.lines)}
          </div>
        </div>

        <div className="panel" style={{ padding: '16px', textAlign: 'center' }}>
          <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>
            Estimasi Waktu Baca
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--accent-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }} className="tabular-nums">
            <Clock size={18} />
            <span>~{stats.readingTimeMinutes} mnt</span>
          </div>
        </div>
      </div>

      {/* Text Area Work Panel */}
      <div className="panel">
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '12px'
        }}>
          <label htmlFor="text-counter-input" style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>
            Ketik atau Tempel Teks Kamu di Sini
          </label>
          <div style={{ display: 'flex', gap: '8px' }}>
            {text && (
              <>
                <button
                  type="button"
                  className="btn btn-outline btn-sm"
                  onClick={handleCopy}
                >
                  {isCopied ? <Check size={14} color="var(--success)" /> : <Copy size={14} />}
                  <span>{isCopied ? 'Tersalin' : 'Salin Teks'}</span>
                </button>
                <button
                  type="button"
                  className="btn btn-outline btn-sm"
                  onClick={handleClear}
                >
                  <Trash2 size={14} color="var(--error)" />
                  <span>Hapus</span>
                </button>
              </>
            )}
          </div>
        </div>

        <textarea
          id="text-counter-input"
          rows={12}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Mulai mengetik atau tempelkan draf esai, artikel, tugas, atau caption di sini..."
          style={{
            lineHeight: 1.6,
            fontSize: '0.9375rem',
            padding: '14px',
            resize: 'vertical'
          }}
        />

        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginTop: '10px',
          fontSize: '0.8125rem',
          color: 'var(--text-muted)'
        }}>
          <span>Mendukung teks Unicode multibyte (Indonesia, Arab, CJK, Emoji, dll.)</span>
          <span className="tabular-nums">{formatNumber(stats.words)} kata · {formatNumber(stats.characters)} karakter</span>
        </div>
      </div>
    </ToolLayout>
  );
};
