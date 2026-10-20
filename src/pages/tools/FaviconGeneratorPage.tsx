import React, { useState } from 'react';
import { Download, Copy, Check, Archive, Trash2 } from 'lucide-react';
import { ToolLayout } from '../../components/layout/ToolLayout';
import { Dropzone } from '../../components/tools/Dropzone';
import { StatusMessage } from '../../components/tools/StatusMessage';
import { TOOLS } from '../../data/tools';
import { downloadBlob } from '../../lib/format';
import { generateFaviconPackage } from '../../lib/faviconBuilder';
import type { FaviconPackageResult, FaviconItem } from '../../lib/faviconBuilder';

export const FaviconGeneratorPage: React.FC = () => {
  const tool = TOOLS.find(t => t.id === 'favicon-generator')!;

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [packageResult, setPackageResult] = useState<FaviconPackageResult | null>(null);
  const [isCopiedHtml, setIsCopiedHtml] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleFile = async (files: File[]) => {
    if (files.length === 0) return;
    const file = files[0];

    const valid = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/svg+xml'];
    if (!valid.includes(file.type.toLowerCase())) {
      setErrorMessage(`Format file "${file.type}" tidak didukung. Harap pilih PNG, JPG, WebP, atau SVG.`);
      return;
    }

    setSelectedFile(file);
    setErrorMessage(null);

    try {
      const res = await generateFaviconPackage(file);
      setPackageResult(res);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Gagal menghasilkan paket favicon.';
      setErrorMessage(msg);
    }
  };

  const clearSelection = () => {
    if (packageResult) {
      URL.revokeObjectURL(packageResult.icoUrl);
      packageResult.items.forEach(i => URL.revokeObjectURL(i.url));
    }
    setSelectedFile(null);
    setPackageResult(null);
    setErrorMessage(null);
  };

  const handleCopyHtml = async () => {
    if (!packageResult?.htmlCode) return;
    try {
      await navigator.clipboard.writeText(packageResult.htmlCode);
      setIsCopiedHtml(true);
      setTimeout(() => setIsCopiedHtml(false), 2000);
    } catch {
      // ignore
    }
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

      {!selectedFile ? (
        <Dropzone
          onFilesSelected={handleFile}
          label="Pilih gambar logo atau ikon untuk membuat favicon"
          hint="Rekomendasi gunakan logo persegi transparan (minimal 512x512 px) format PNG atau SVG"
        />
      ) : (
        <div>
          {/* Header Actions */}
          <div className="panel" style={{ marginBottom: '24px' }}>
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '16px'
            }}>
              <div>
                <h2 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                  Paket Favicon Berhasil Dibuat
                </h2>
                <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                  Sumber: {selectedFile.name}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  type="button"
                  className="btn btn-outline btn-sm"
                  onClick={clearSelection}
                >
                  <Trash2 size={14} color="var(--error)" />
                  <span>Ganti Gambar</span>
                </button>
                {packageResult && (
                  <button
                    type="button"
                    className="btn btn-primary btn-sm"
                    onClick={() => downloadBlob(packageResult.zipBlob, 'favicon-package.zip')}
                  >
                    <Archive size={14} />
                    <span>Unduh Paket Lengkap (.ZIP)</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {packageResult && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
              {/* Previews and Individual Downloads */}
              <div className="panel">
                <h3 style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '16px' }}>
                  Daftar Ukuran Favicon Siap Pakai
                </h3>

                {/* Simulated Browser Tab */}
                <div style={{
                  backgroundColor: '#ECEEEC',
                  padding: '8px 12px',
                  borderRadius: 'var(--radius-sm)',
                  marginBottom: '20px',
                  border: '1px solid var(--border-color)'
                }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                    Simulasi Tampilan Tab Browser:
                  </div>
                  <div style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    backgroundColor: '#FFFFFF',
                    padding: '6px 14px',
                    borderRadius: '6px 6px 0 0',
                    fontSize: '0.8125rem',
                    fontWeight: 500,
                    border: '1px solid var(--border-color)',
                    borderBottom: 'none'
                  }}>
                    <img
                      src={packageResult.items.find(i => i.size === 16)?.url}
                      alt="16px tab icon"
                      style={{ width: '16px', height: '16px' }}
                    />
                    <span>Website Saya — Tab Baru</span>
                  </div>
                </div>

                {/* ICO File Item */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid #C3E2D0',
                  backgroundColor: 'var(--accent-subtle)',
                  marginBottom: '12px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{
                      width: '36px',
                      height: '36px',
                      backgroundColor: '#FFFFFF',
                      borderRadius: '4px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 700,
                      fontSize: '0.75rem',
                      color: 'var(--accent-primary)'
                    }}>
                      ICO
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-primary)' }}>
                        favicon.ico (Multi-Resolusi Asli)
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                        Biner Windows ICO (16x16, 32x32, 48x48)
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="btn btn-primary btn-sm"
                    onClick={() => downloadBlob(packageResult.icoBlob, 'favicon.ico')}
                  >
                    <Download size={14} />
                    <span>Unduh ICO</span>
                  </button>
                </div>

                {/* PNG Items */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {packageResult.items.map((item: FaviconItem) => (
                    <div
                      key={item.size}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '10px 12px',
                        borderRadius: 'var(--radius-sm)',
                        border: '1px solid var(--border-color)',
                        backgroundColor: '#FFFFFF'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{
                          width: '36px',
                          height: '36px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          backgroundColor: 'var(--bg-surface)',
                          borderRadius: '4px',
                          border: '1px solid var(--border-color)'
                        }}>
                          <img
                            src={item.url}
                            alt={item.name}
                            style={{
                              maxWidth: '30px',
                              maxHeight: '30px',
                              objectFit: 'contain'
                            }}
                          />
                        </div>
                        <div>
                          <div style={{ fontWeight: 500, fontSize: '0.8125rem', color: 'var(--text-primary)' }}>
                            {item.name}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            {item.label}
                          </div>
                        </div>
                      </div>

                      <button
                        type="button"
                        className="btn btn-outline btn-sm"
                        onClick={() => downloadBlob(item.blob, item.name)}
                      >
                        <Download size={13} />
                        <span>PNG</span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* HTML Snippet Column */}
              <div className="panel" style={{ display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                  <h3 style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                    Kode HTML untuk Website
                  </h3>
                  <button
                    type="button"
                    className="btn btn-outline btn-sm"
                    onClick={handleCopyHtml}
                  >
                    {isCopiedHtml ? <Check size={14} color="var(--success)" /> : <Copy size={14} />}
                    <span>{isCopiedHtml ? 'Tersalin' : 'Salin Kode'}</span>
                  </button>
                </div>

                <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginBottom: '12px', lineHeight: 1.5 }}>
                  Tempelkan tag berikut ke dalam bagian <code>&lt;head&gt;</code> file HTML utama website kamu:
                </p>

                <pre style={{
                  backgroundColor: 'var(--bg-surface)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '14px',
                  fontSize: '0.75rem',
                  fontFamily: 'var(--font-mono)',
                  color: 'var(--text-primary)',
                  overflowX: 'auto',
                  lineHeight: 1.6,
                  flex: 1
                }}>
                  {packageResult.htmlCode}
                </pre>

                <div style={{
                  marginTop: '16px',
                  padding: '12px',
                  backgroundColor: 'var(--bg-subtle)',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-color)',
                  fontSize: '0.75rem',
                  color: 'var(--text-secondary)',
                  lineHeight: 1.5
                }}>
                  <strong>Petunjuk Pemasangan:</strong> Letakkan file <code>favicon.ico</code> dan file ikon lainnya di direktori root publik website Anda (seperti folder <code>public/</code> atau <code>public_html</code>).
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </ToolLayout>
  );
};
