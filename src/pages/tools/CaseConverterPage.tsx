import React, { useState } from 'react';
import { Copy, Check, Trash2 } from 'lucide-react';
import { ToolLayout } from '../../components/layout/ToolLayout';
import { TOOLS } from '../../data/tools';
import {
  toUpperCase,
  toLowerCase,
  toTitleCase,
  toSentenceCase,
  toCamelCase,
  toSnakeCase,
  toKebabCase
} from '../../lib/textHelpers';

export const CaseConverterPage: React.FC = () => {
  const tool = TOOLS.find(t => t.id === 'case-converter')!;

  const [inputText, setInputText] = useState<string>('');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleCopy = async (text: string, key: string) => {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2000);
    } catch {
      // ignore
    }
  };

  const applyTransformation = (fn: (t: string) => string) => {
    setInputText(fn(inputText));
  };

  return (
    <ToolLayout tool={tool}>
      {/* Transformation Quick Buttons */}
      <div className="panel" style={{ marginBottom: '20px' }}>
        <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '12px' }}>
          Pilih Format Kapitalisasi:
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => applyTransformation(toUpperCase)}
            disabled={!inputText}
          >
            UPPERCASE (HURUF BESAR)
          </button>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => applyTransformation(toLowerCase)}
            disabled={!inputText}
          >
            lowercase (huruf kecil)
          </button>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => applyTransformation(toTitleCase)}
            disabled={!inputText}
          >
            Title Case (Huruf Kapital Tiap Kata)
          </button>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => applyTransformation(toSentenceCase)}
            disabled={!inputText}
          >
            Sentence case (Awal kalimat besar)
          </button>
          <button
            type="button"
            className="btn btn-outline"
            onClick={() => applyTransformation(toCamelCase)}
            disabled={!inputText}
          >
            camelCase
          </button>
          <button
            type="button"
            className="btn btn-outline"
            onClick={() => applyTransformation(toSnakeCase)}
            disabled={!inputText}
          >
            snake_case
          </button>
          <button
            type="button"
            className="btn btn-outline"
            onClick={() => applyTransformation(toKebabCase)}
            disabled={!inputText}
          >
            kebab-case
          </button>
        </div>
      </div>

      {/* Main Text Editor */}
      <div className="panel">
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '12px'
        }}>
          <label htmlFor="case-input" style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>
            Teks Editor (Format Baris Tetap Dipertahankan)
          </label>
          <div style={{ display: 'flex', gap: '8px' }}>
            {inputText && (
              <>
                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  onClick={() => handleCopy(inputText, 'main')}
                >
                  {copiedKey === 'main' ? <Check size={14} /> : <Copy size={14} />}
                  <span>{copiedKey === 'main' ? 'Tersalin' : 'Salin Hasil'}</span>
                </button>
                <button
                  type="button"
                  className="btn btn-outline btn-sm"
                  onClick={() => setInputText('')}
                >
                  <Trash2 size={14} color="var(--error)" />
                  <span>Hapus</span>
                </button>
              </>
            )}
          </div>
        </div>

        <textarea
          id="case-input"
          rows={12}
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Ketik atau tempelkan teks yang ingin diubah kapitalisasinya di sini..."
          style={{
            lineHeight: 1.6,
            fontSize: '0.9375rem',
            padding: '14px',
            resize: 'vertical'
          }}
        />

        <div style={{
          marginTop: '12px',
          padding: '10px 14px',
          backgroundColor: 'var(--bg-surface)',
          borderRadius: 'var(--radius-sm)',
          fontSize: '0.8125rem',
          color: 'var(--text-secondary)',
          lineHeight: 1.5
        }}>
          <strong>Catatan Title Case:</strong> Kata hubung pendek Bahasa Indonesia dan Inggris (seperti <em>dan, atau, di, ke, dari, yang, untuk, in, on, at, the</em>) secara otomatis tidak dikapitalisasi kecuali jika berada di awal baris/kalimat.
        </div>
      </div>
    </ToolLayout>
  );
};
