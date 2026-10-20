import React, { useState } from 'react';
import { Copy, Check, Trash2, ArrowRightLeft, Info } from 'lucide-react';
import { ToolLayout } from '../../components/layout/ToolLayout';
import { StatusMessage } from '../../components/tools/StatusMessage';
import { TOOLS } from '../../data/tools';
import {
  encodeUrlComponent,
  decodeUrlComponent,
  encodeFullUrl,
  decodeFullUrl
} from '../../lib/textHelpers';

type EncodingMode = 'component' | 'full';

export const UrlEncoderPage: React.FC = () => {
  const tool = TOOLS.find(t => t.id === 'url-encoder')!;

  const [input, setInput] = useState<string>('');
  const [output, setOutput] = useState<string>('');
  const [mode, setMode] = useState<EncodingMode>('component');
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleEncode = () => {
    setErrorMessage(null);
    if (!input) {
      setOutput('');
      return;
    }

    try {
      if (mode === 'component') {
        setOutput(encodeUrlComponent(input));
      } else {
        setOutput(encodeFullUrl(input));
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Gagal melakukan encode pada teks input.';
      setErrorMessage(msg);
    }
  };

  const handleDecode = () => {
    setErrorMessage(null);
    if (!input) {
      setOutput('');
      return;
    }

    try {
      if (mode === 'component') {
        setOutput(decodeUrlComponent(input));
      } else {
        setOutput(decodeFullUrl(input));
      }
    } catch {
      setErrorMessage('Teks input tidak valid untuk didecode. Format persentase URL cacat atau karakter tidak lengkap (misalnya tanda % yang berdiri sendiri).');
    }
  };

  const handleSwap = () => {
    if (!output) return;
    setInput(output);
    setOutput('');
    setErrorMessage(null);
  };

  const handleCopy = async () => {
    if (!output) return;
    try {
      await navigator.clipboard.writeText(output);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch {
      // ignore
    }
  };

  const handleClear = () => {
    setInput('');
    setOutput('');
    setErrorMessage(null);
  };

  return (
    <ToolLayout tool={tool}>
      {errorMessage && (
        <StatusMessage
          type="error"
          message={errorMessage}
          onDismiss={() => setErrorMessage(null)}
        />
      )}

      {/* Mode Switcher and Options */}
      <div className="panel" style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: '8px' }}>
              Pilih Lingkup Karakter:
            </label>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                type="button"
                className={`btn btn-sm ${mode === 'component' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setMode('component')}
              >
                Komponen URL (Query String / Nilai Parameter)
              </button>
              <button
                type="button"
                className={`btn btn-sm ${mode === 'full' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setMode('full')}
              >
                URL Utuh (Full URI)
              </button>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleEncode}
              disabled={!input}
            >
              Encode (Ubah ke %XX)
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={handleDecode}
              disabled={!input}
            >
              Decode (Kembalikan ke Teks Asli)
            </button>
          </div>
        </div>

        {/* Technical Explanation Callout */}
        <div style={{
          marginTop: '16px',
          padding: '12px 14px',
          backgroundColor: 'var(--bg-surface)',
          borderRadius: 'var(--radius-sm)',
          fontSize: '0.8125rem',
          color: 'var(--text-secondary)',
          lineHeight: 1.5,
          border: '1px solid var(--border-color)',
          display: 'flex',
          gap: '10px'
        }}>
          <Info size={16} color="var(--accent-primary)" style={{ flexShrink: 0, marginTop: '2px' }} />
          <div>
            {mode === 'component' ? (
              <span>
                <strong>Mode Komponen (encodeURIComponent):</strong> Meng-escape semua karakter khusus termasuk <code>? &amp; = : / #</code>. Ideal untuk teks yang ingin disematkan sebagai nilai parameter URL.
              </span>
            ) : (
              <span>
                <strong>Mode URL Utuh (encodeURI):</strong> Membiarkan karakter protokol dan struktur alamat web seperti <code>https://</code>, <code>/</code>, <code>?</code>, dan <code>&amp;</code> tetap utuh, hanya meng-escape spasi dan karakter non-ASCII.
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Editor Columns */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
        {/* Input Text */}
        <div className="panel" style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <label htmlFor="url-input" style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>
              Teks Input
            </label>
            {input && (
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
            id="url-input"
            rows={10}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ketik atau tempelkan teks / URL di sini..."
            style={{
              flex: 1,
              minHeight: '220px',
              fontFamily: 'var(--font-mono)',
              lineHeight: 1.6,
              fontSize: '0.875rem',
              resize: 'vertical'
            }}
          />
        </div>

        {/* Output Text */}
        <div className="panel" style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>
              Hasil Konversi
            </span>
            <div style={{ display: 'flex', gap: '6px' }}>
              {output && (
                <>
                  <button
                    type="button"
                    className="btn btn-outline btn-sm"
                    onClick={handleSwap}
                    title="Gunakan hasil ini sebagai input baru"
                  >
                    <ArrowRightLeft size={13} />
                    <span>Jadikan Input</span>
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary btn-sm"
                    onClick={handleCopy}
                  >
                    {isCopied ? <Check size={14} /> : <Copy size={14} />}
                    <span>{isCopied ? 'Tersalin' : 'Salin Hasil'}</span>
                  </button>
                </>
              )}
            </div>
          </div>

          <textarea
            readOnly
            rows={10}
            value={output}
            placeholder="Hasil encode atau decode akan muncul di sini..."
            style={{
              flex: 1,
              minHeight: '220px',
              fontFamily: 'var(--font-mono)',
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
