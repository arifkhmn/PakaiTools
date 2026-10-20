import React, { useState } from 'react';
import { Download, RefreshCw, FileType, CheckCircle2, Eye, EyeOff } from 'lucide-react';
import { ToolLayout } from '../../components/layout/ToolLayout';
import { Dropzone } from '../../components/tools/Dropzone';
import { StatusMessage } from '../../components/tools/StatusMessage';
import { TOOLS } from '../../data/tools';
import { formatBytes, downloadBlob } from '../../lib/format';
import { docxToPdf } from '../../lib/pdfHelpers';

export const WordToPdfPage: React.FC = () => {
  const tool = TOOLS.find(t => t.id === 'word-to-pdf')!;
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [pageSize, setPageSize] = useState<'a4' | 'letter'>('a4');
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusText, setStatusText] = useState<string>('');
  const [showPreview, setShowPreview] = useState(false);
  const [previewHtml, setPreviewHtml] = useState<string | null>(null);
  const [result, setResult] = useState<{
    blob: Blob;
    pageCount: number;
    fileName: string;
    fileSize: number;
  } | null>(null);
  const [globalError, setGlobalError] = useState<string | null>(null);

  const handleFiles = (files: File[]) => {
    setGlobalError(null);
    setResult(null);
    setPreviewHtml(null);
    setShowPreview(false);

    const file = files[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.docx')) {
      setGlobalError('Hanya file dokumen format Microsoft Word (.docx) yang didukung.');
      return;
    }

    if (file.size > 25 * 1024 * 1024) {
      setGlobalError('File dokumen Word melebihi batas maksimal 25 MB.');
      return;
    }

    setSelectedFile(file);
  };

  const handleConvert = async () => {
    if (!selectedFile) return;

    setIsProcessing(true);
    setGlobalError(null);
    setStatusText('Membaca dokumen Word...');

    try {
      const res = await docxToPdf(selectedFile, {
        pageSize,
        onProgress: (status) => setStatusText(status)
      });

      const baseName = selectedFile.name.replace(/\.docx$/i, '');
      const outName = `${baseName}.pdf`;

      setPreviewHtml(res.htmlPreview);
      setResult({
        blob: res.blob,
        pageCount: res.pageCount,
        fileName: outName,
        fileSize: res.blob.size
      });
    } catch (err: unknown) {
      setGlobalError(err instanceof Error ? err.message : 'Terjadi kegagalan saat mengonversi dokumen Word ke PDF.');
    } finally {
      setIsProcessing(false);
      setStatusText('');
    }
  };

  const resetAll = () => {
    setSelectedFile(null);
    setResult(null);
    setPreviewHtml(null);
    setShowPreview(false);
    setStatusText('');
    setGlobalError(null);
  };

  const handleDownload = () => {
    if (result) {
      downloadBlob(result.blob, result.fileName);
    }
  };

  return (
    <ToolLayout
      tool={tool}
      howToSteps={[
        'Pilih atau seret satu file dokumen Microsoft Word berformat .docx ke area kerja.',
        'Pilih ukuran kertas target PDF (A4 standar atau Letter).',
        'Klik tombol "Konversi ke PDF" dan sistem akan merender dokumen Anda secara lokal.',
        'Unduh file PDF hasil konversi yang siap dikirim, dilampirkan, atau dicetak.'
      ]}
      faqItems={[
        {
          question: 'Apakah saya membutuhkan aplikasi Microsoft Word untuk menggunakan tool ini?',
          answer: 'Tidak sama sekali. Anda tidak perlu menginstal Microsoft Office atau aplikasi pihak ketiga lainnya. Konversi berjalan langsung di browser modern Anda.'
        },
        {
          question: 'Format Word apa saja yang didukung?',
          answer: 'Tool ini mendukung dokumen .docx standar modern yang dibuat dari Microsoft Word 2007 ke atas, WPS Office, Google Docs, maupun LibreOffice.'
        },
        {
          question: 'Apakah keamanan dan kerahasiaan isi dokumen terjamin?',
          answer: 'Sangat terjamin. Semua parsing dokumen dan perenderan PDF diproses 100% di memori komputer Anda secara client-side, tanpa pernah diunggah ke internet.'
        }
      ]}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
        {/* Dropzone */}
        {!selectedFile && (
          <Dropzone
            onFilesSelected={handleFiles}
            accept=".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            multiple={false}
            maxSizeMB={25}
            label="Pilih atau seret file dokumen Word (.docx) ke sini"
            hint="Mendukung file .docx standar • Pemrosesan 100% lokal & privat"
          />
        )}

        {globalError && (
          <StatusMessage
            type="error"
            title="Gagal Memproses Dokumen"
            message={globalError}
            onDismiss={() => setGlobalError(null)}
          />
        )}

        {/* Selected File & Settings */}
        {selectedFile && !result && (
          <div
            style={{
              backgroundColor: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-lg)',
              padding: 'var(--space-5)'
            }}
          >
            {/* File info bar */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                backgroundColor: 'var(--surface-hover)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-md)',
                padding: 'var(--space-3) var(--space-4)',
                marginBottom: 'var(--space-5)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
                <div
                  style={{
                    backgroundColor: 'rgba(37, 99, 235, 0.1)',
                    color: 'var(--accent-primary)',
                    padding: '8px',
                    borderRadius: 'var(--radius-md)'
                  }}
                >
                  <FileType size={24} />
                </div>
                <div style={{ minWidth: 0 }}>
                  <div
                    style={{
                      fontWeight: 600,
                      fontSize: '0.9375rem',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    {selectedFile.name}
                  </div>
                  <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                    Ukuran Dokumen: {formatBytes(selectedFile.size)}
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={resetAll}
                disabled={isProcessing}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-muted)',
                  fontSize: '0.8125rem',
                  cursor: isProcessing ? 'not-allowed' : 'pointer',
                  padding: '6px 12px'
                }}
              >
                Ganti File
              </button>
            </div>

            {/* Options */}
            <div style={{ marginBottom: 'var(--space-5)' }}>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '8px' }}>
                Ukuran Kertas Target PDF
              </label>
              <select
                value={pageSize}
                onChange={(e) => setPageSize(e.target.value as 'a4' | 'letter')}
                disabled={isProcessing}
                style={{
                  width: '100%',
                  maxWidth: '320px',
                  padding: '8px 12px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border)',
                  backgroundColor: 'var(--surface)',
                  color: 'var(--text-primary)',
                  fontSize: '0.875rem'
                }}
              >
                <option value="a4">A4 (210 × 297 mm) — Standar Indonesia</option>
                <option value="letter">Letter (216 × 279 mm)</option>
              </select>
            </div>

            {/* Action Bar */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'flex-end',
                alignItems: 'center',
                borderTop: '1px solid var(--border)',
                paddingTop: 'var(--space-4)'
              }}
            >
              <button
                type="button"
                onClick={handleConvert}
                disabled={isProcessing}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  backgroundColor: 'var(--accent-primary)',
                  color: '#FFFFFF',
                  padding: '10px 24px',
                  borderRadius: 'var(--radius-md)',
                  border: 'none',
                  fontWeight: 600,
                  fontSize: '0.9375rem',
                  cursor: isProcessing ? 'wait' : 'pointer'
                }}
              >
                {isProcessing ? (
                  <>
                    <RefreshCw size={18} className="animate-spin" />
                    {statusText || 'Sedang Mengonversi...'}
                  </>
                ) : (
                  <>
                    <FileType size={18} />
                    Konversi ke PDF
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Conversion Result */}
        {result && (
          <div
            style={{
              backgroundColor: 'var(--surface)',
              border: '2px solid var(--status-success)',
              borderRadius: 'var(--radius-lg)',
              padding: 'var(--space-6)',
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--space-5)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div
                style={{
                  backgroundColor: 'rgba(34, 197, 94, 0.1)',
                  color: 'var(--status-success)',
                  padding: '12px',
                  borderRadius: 'var(--radius-md)'
                }}
              >
                <CheckCircle2 size={32} />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                  Dokumen PDF Berhasil Dibuat!
                </h3>
                <p style={{ margin: '4px 0 0 0', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                  {result.fileName} • {result.pageCount} Halaman • Ukuran file {formatBytes(result.fileSize)}
                </p>
              </div>
            </div>

            {/* Preview toggle */}
            {previewHtml && (
              <div>
                <button
                  type="button"
                  onClick={() => setShowPreview(!showPreview)}
                  style={{
                    background: 'none',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-md)',
                    padding: '6px 14px',
                    fontSize: '0.8125rem',
                    color: 'var(--text-secondary)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  {showPreview ? <EyeOff size={14} /> : <Eye size={14} />}
                  {showPreview ? 'Sembunyikan Pratinjau Teks' : 'Lihat Pratinjau Teks'}
                </button>

                {showPreview && (
                  <div
                    style={{
                      marginTop: 'var(--space-3)',
                      maxHeight: '300px',
                      overflowY: 'auto',
                      padding: 'var(--space-4)',
                      backgroundColor: '#FFFFFF',
                      color: '#1E293B',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border)',
                      fontSize: '0.875rem',
                      lineHeight: '1.6'
                    }}
                    dangerouslySetInnerHTML={{ __html: previewHtml }}
                  />
                )}
              </div>
            )}

            <div
              style={{
                display: 'flex',
                gap: 'var(--space-3)',
                borderTop: '1px solid var(--border)',
                paddingTop: 'var(--space-4)'
              }}
            >
              <button
                type="button"
                onClick={handleDownload}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  backgroundColor: 'var(--status-success)',
                  color: '#FFFFFF',
                  padding: '10px 24px',
                  borderRadius: 'var(--radius-md)',
                  border: 'none',
                  fontWeight: 600,
                  fontSize: '0.9375rem',
                  cursor: 'pointer'
                }}
              >
                <Download size={18} /> Unduh File PDF
              </button>

              <button
                type="button"
                onClick={resetAll}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  backgroundColor: 'transparent',
                  color: 'var(--text-secondary)',
                  padding: '10px 18px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border)',
                  fontWeight: 500,
                  fontSize: '0.875rem',
                  cursor: 'pointer'
                }}
              >
                Konversi File Lain
              </button>
            </div>
          </div>
        )}
      </div>
    </ToolLayout>
  );
};
