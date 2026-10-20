import React, { useState, useRef } from 'react';
import {
  Download,
  RefreshCw,
  FileEdit,
  CheckCircle2,
  Sliders,
  XCircle,
  AlertTriangle,
  FileText,
  Layers,
  Table as TableIcon,
  Eye,
  ShieldCheck
} from 'lucide-react';
import { ToolLayout } from '../../components/layout/ToolLayout';
import { Dropzone } from '../../components/tools/Dropzone';
import { StatusMessage } from '../../components/tools/StatusMessage';
import { TOOLS } from '../../data/tools';
import { formatBytes, downloadBlob } from '../../lib/format';
import {
  inspectPdfDocument,
  convertPdfToDocx,
  type ConversionMode,
  type ConversionProgress,
  type ConversionResult,
  type PdfInspectionResult,
  PasswordProtectedPdfError,
  CorruptedPdfError,
  ConversionCancelledError
} from '../../lib/pdfDocxEngine';

export const PdfToWordPage: React.FC = () => {
  const tool = TOOLS.find((t) => t.id === 'pdf-to-word')!;
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [inspection, setInspection] = useState<PdfInspectionResult | null>(null);
  const [isInspecting, setIsInspecting] = useState<boolean>(false);

  // Conversion options
  const [mode, setMode] = useState<ConversionMode>('layout_preserving');
  const [detectTables, setDetectTables] = useState<boolean>(true);
  const [preserveFormatting, setPreserveFormatting] = useState<boolean>(true);
  const [includeImages, setIncludeImages] = useState<boolean>(true);
  const [pageBreakPerPage, setPageBreakPerPage] = useState<boolean>(true);

  // Processing state
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [progress, setProgress] = useState<ConversionProgress | null>(null);
  const [result, setResult] = useState<ConversionResult | null>(null);
  const [globalError, setGlobalError] = useState<string | null>(null);

  const abortControllerRef = useRef<AbortController | null>(null);

  const handleFiles = async (files: File[]) => {
    setGlobalError(null);
    setResult(null);
    setInspection(null);

    const file = files[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.pdf') && file.type !== 'application/pdf') {
      setGlobalError('File yang dipilih bukan dokumen PDF yang valid.');
      return;
    }

    if (file.size > 50 * 1024 * 1024) {
      setGlobalError('File PDF melebihi batas maksimal 50 MB.');
      return;
    }

    setSelectedFile(file);
    setIsInspecting(true);

    try {
      const insp = await inspectPdfDocument(file);
      setInspection(insp);
      setMode(insp.recommendedMode);
    } catch (err: unknown) {
      if (err instanceof PasswordProtectedPdfError) {
        setGlobalError(
          'File PDF ini dilindungi kata sandi (password). Harap buka kunci dokumen terlebih dahulu sebelum mengonversinya.'
        );
      } else if (err instanceof CorruptedPdfError) {
        setGlobalError('File PDF ini rusak atau memiliki struktur yang tidak dapat dibaca.');
      } else {
        setGlobalError(
          err instanceof Error
            ? err.message
            : 'Gagal menganalisis dokumen PDF. Pastikan file valid.'
        );
      }
      setSelectedFile(null);
    } finally {
      setIsInspecting(false);
    }
  };

  const handleConvert = async () => {
    if (!selectedFile) return;

    setIsProcessing(true);
    setGlobalError(null);
    setProgress({
      stage: 'inspecting',
      current: 0,
      total: inspection?.pageCount || 1,
      message: 'Mempersiapkan ekstraksi dokumen...'
    });

    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      const res = await convertPdfToDocx(selectedFile, {
        mode,
        detectTables,
        preserveFormatting,
        includeImages,
        pageBreakPerPage,
        signal: controller.signal,
        onProgress: (p) => setProgress(p)
      });

      setResult(res);
    } catch (err: unknown) {
      if (err instanceof ConversionCancelledError) {
        setGlobalError('Konversi dibatalkan oleh pengguna.');
      } else if (err instanceof PasswordProtectedPdfError) {
        setGlobalError(
          'Dokumen PDF ini dilindungi kata sandi. Silakan gunakan PDF yang tidak terenkripsi.'
        );
      } else if (err instanceof CorruptedPdfError) {
        setGlobalError('File PDF rusak atau tidak dapat diproses.');
      } else {
        setGlobalError(
          err instanceof Error
            ? err.message
            : 'Terjadi kegagalan teknis saat mengonversi dokumen ke Word.'
        );
      }
    } finally {
      setIsProcessing(false);
      setProgress(null);
      abortControllerRef.current = null;
    }
  };

  const handleCancel = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  };

  const resetAll = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setSelectedFile(null);
    setInspection(null);
    setResult(null);
    setProgress(null);
    setIsProcessing(false);
    setGlobalError(null);
  };

  const handleDownload = () => {
    if (result) {
      downloadBlob(result.blob, result.fileName);
    }
  };

  // Progress percentage calculation
  const progressPercent =
    progress && progress.total > 0
      ? Math.round(
          progress.stage === 'packing'
            ? 96
            : (progress.current / Math.max(1, progress.total)) * 90
        )
      : 5;

  return (
    <ToolLayout
      tool={tool}
      howToSteps={[
        'Unggah dokumen PDF yang ingin diubah menjadi Microsoft Word (.docx).',
        'Sistem akan menganalisis apakah dokumen bertipe teks digital atau hasil pindaian (scanned).',
        'Pilih mode konversi: Mode Teks (dapat diedit penuh) atau Mode Preservasi Visual (tata letak kompleks).',
        'Klik tombol "Mulai Konversi ke Word" untuk memproses dokumen secara lokal di browser Anda.',
        'Unduh file dokumen .docx hasil konversi yang rapi, lengkap dengan tabel, format judul, dan gambar asli.'
      ]}
      faqItems={[
        {
          question: 'Bagaimana PakaiTools merekonstruksi tabel dari PDF ke Word?',
          answer:
            'PakaiTools mendeteksi penjajaran koordinat horizontal dan vertikal sel pada teks PDF, lalu membangun struktur tabel Microsoft Word asli (Table, TableRow, TableCell) lengkap dengan garis batas dan sel judul yang dapat diklik serta diedit seperti tabel Word biasa.'
        },
        {
          question: 'Apakah hasil file Word (.docx) bisa diedit bebas?',
          answer:
            'Ya! Pada Mode Teks & Tata Letak, dokumen yang dihasilkan adalah file Microsoft Word (.docx) standar dengan paragraf teks asli yang bebas disunting di Microsoft Word, WPS Office, LibreOffice, maupun Google Docs.'
        },
        {
          question: 'Bagaimana jika dokumen saya adalah PDF hasil scan foto?',
          answer:
            'Sistem akan otomatis mendeteksi bahwa dokumen berstatus Scanned (gambar). Anda dapat menggunakan Mode Preservasi Visual 1:1 agar setiap halaman tersimpan dengan resolusi tajam di dokumen Word Anda, atau gunakan perangkat lunak OCR jika membutuhkan pengenalan karakter foto ke teks.'
        },
        {
          question: 'Apakah dokumen rahasia saya aman diproses di sini?',
          answer:
            '100% aman dan privat. Dokumen Anda TIDAK PERNAH dikirim atau diunggah ke server cloud mana pun. Seluruh parsing PDF dan pembuatan file Word (.docx) dieksekusi murni di browser lokal perangkat Anda.'
        }
      ]}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
        {/* Dropzone */}
        {!selectedFile && (
          <Dropzone
            onFilesSelected={handleFiles}
            accept="application/pdf,.pdf"
            multiple={false}
            maxSizeMB={50}
            label="Pilih atau seret file PDF yang ingin diubah ke Word"
            hint="Rekonstruksi tabel & teks dapat diedit • Deteksi otomatis dokumen scan • 100% lokal & privat"
          />
        )}

        {globalError && (
          <StatusMessage
            type="error"
            title="Pemberitahuan"
            message={globalError}
            onDismiss={() => setGlobalError(null)}
          />
        )}

        {/* Selected file & configuration */}
        {selectedFile && !result && (
          <div
            style={{
              backgroundColor: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-lg)',
              padding: 'var(--space-5)'
            }}
          >
            {/* File Info Header */}
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
                    backgroundColor: 'rgba(38, 115, 77, 0.1)',
                    color: 'var(--accent-primary)',
                    padding: '10px',
                    borderRadius: 'var(--radius-md)'
                  }}
                >
                  <FileText size={24} />
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
                    Ukuran: {formatBytes(selectedFile.size)}
                    {inspection && (
                      <>
                        {' • '}
                        {inspection.pageCount} Halaman ({inspection.pageSizeLabel})
                      </>
                    )}
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

            {/* Document Inspection Diagnostics */}
            {isInspecting && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: 'var(--space-3)',
                  backgroundColor: 'var(--surface-hover)',
                  borderRadius: 'var(--radius-md)',
                  marginBottom: 'var(--space-5)',
                  fontSize: '0.875rem',
                  color: 'var(--text-secondary)'
                }}
              >
                <RefreshCw size={16} className="animate-spin" />
                Menganalisis struktur tata letak dokumen PDF...
              </div>
            )}

            {inspection && !isInspecting && (
              <div
                style={{
                  marginBottom: 'var(--space-5)',
                  padding: 'var(--space-3) var(--space-4)',
                  borderRadius: 'var(--radius-md)',
                  border: inspection.isScanned
                    ? '1px solid #FEDF89'
                    : '1px solid #A6F4C5',
                  backgroundColor: inspection.isScanned ? '#FFFCF5' : '#F6FEF9',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '12px'
                }}
              >
                {inspection.isScanned ? (
                  <AlertTriangle
                    size={20}
                    style={{ color: '#B54708', flexShrink: 0, marginTop: '2px' }}
                  />
                ) : (
                  <CheckCircle2
                    size={20}
                    style={{ color: '#039855', flexShrink: 0, marginTop: '2px' }}
                  />
                )}
                <div>
                  <div
                    style={{
                      fontWeight: 600,
                      fontSize: '0.875rem',
                      color: inspection.isScanned ? '#B54708' : '#027A48'
                    }}
                  >
                    {inspection.isScanned
                      ? 'Dokumen Terdeteksi Sebagai Hasil Pindaian (Scanned PDF)'
                      : inspection.documentType === 'mixed'
                        ? 'Dokumen Terdeteksi Memiliki Konten Campuran (Teks & Pindaian)'
                        : 'Dokumen Terdeteksi Memiliki Teks Digital Asli'}
                  </div>
                  <div
                    style={{
                      fontSize: '0.8125rem',
                      color: inspection.isScanned ? '#93370D' : '#067647',
                      marginTop: '2px',
                      lineHeight: 1.4
                    }}
                  >
                    {inspection.isScanned
                      ? 'File ini didominasi oleh gambar scan tanpa teks digital yang dapat diseleksi. Direkomendasikan menggunakan Mode Preservasi Visual 1:1 agar seluruh halaman tersimpan jernih di Word.'
                      : `Ditemukan perkiraan ~${inspection.totalWords.toLocaleString()} kata teks yang dapat diekstrak menjadi teks Word yang bebas diedit.`}
                  </div>
                </div>
              </div>
            )}

            {/* Mode Selection Cards */}
            <div style={{ marginBottom: 'var(--space-5)' }}>
              <div
                style={{
                  fontWeight: 600,
                  fontSize: '0.875rem',
                  marginBottom: '10px',
                  color: 'var(--text-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <Layers size={16} style={{ color: 'var(--accent-primary)' }} />
                Pilih Mode Konversi
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                  gap: '12px'
                }}
              >
                {/* Mode A Card */}
                <div
                  onClick={() => !isProcessing && setMode('layout_preserving')}
                  style={{
                    border:
                      mode === 'layout_preserving'
                        ? '2px solid var(--accent-primary)'
                        : '1px solid var(--border)',
                    backgroundColor:
                      mode === 'layout_preserving'
                        ? 'rgba(38, 115, 77, 0.04)'
                        : 'var(--surface)',
                    borderRadius: 'var(--radius-md)',
                    padding: 'var(--space-4)',
                    cursor: isProcessing ? 'not-allowed' : 'pointer',
                    transition: 'border-color 150ms ease'
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: '6px'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <FileEdit
                        size={18}
                        style={{
                          color:
                            mode === 'layout_preserving'
                              ? 'var(--accent-primary)'
                              : 'var(--text-secondary)'
                        }}
                      />
                      <span style={{ fontWeight: 600, fontSize: '0.9375rem' }}>
                        Teks & Tata Letak (Dapat Diedit)
                      </span>
                    </div>
                    <span
                      style={{
                        fontSize: '0.75rem',
                        padding: '2px 8px',
                        borderRadius: '10px',
                        backgroundColor: '#ECFDF3',
                        color: '#027A48',
                        fontWeight: 600
                      }}
                    >
                      Standar
                    </span>
                  </div>
                  <p
                    style={{
                      margin: 0,
                      fontSize: '0.8125rem',
                      color: 'var(--text-secondary)',
                      lineHeight: 1.45
                    }}
                  >
                    Mengonversi PDF ke paragraf Word asli yang bebas diedit. Tabel direkonstruksi
                    menjadi tabel Word, dan gambar/logo disisipkan di posisi yang sesuai.
                  </p>
                </div>

                {/* Mode C Card */}
                <div
                  onClick={() => !isProcessing && setMode('visual_fidelity')}
                  style={{
                    border:
                      mode === 'visual_fidelity'
                        ? '2px solid var(--accent-primary)'
                        : '1px solid var(--border)',
                    backgroundColor:
                      mode === 'visual_fidelity'
                        ? 'rgba(38, 115, 77, 0.04)'
                        : 'var(--surface)',
                    borderRadius: 'var(--radius-md)',
                    padding: 'var(--space-4)',
                    cursor: isProcessing ? 'not-allowed' : 'pointer',
                    transition: 'border-color 150ms ease'
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: '6px'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Eye
                        size={18}
                        style={{
                          color:
                            mode === 'visual_fidelity'
                              ? 'var(--accent-primary)'
                              : 'var(--text-secondary)'
                        }}
                      />
                      <span style={{ fontWeight: 600, fontSize: '0.9375rem' }}>
                        Preservasi Visual 1:1 (Fallback)
                      </span>
                    </div>
                    {inspection?.isScanned && (
                      <span
                        style={{
                          fontSize: '0.75rem',
                          padding: '2px 8px',
                          borderRadius: '10px',
                          backgroundColor: '#FFF8E5',
                          color: '#B54708',
                          fontWeight: 600
                        }}
                      >
                        Direkomendasikan
                      </span>
                    )}
                  </div>
                  <p
                    style={{
                      margin: 0,
                      fontSize: '0.8125rem',
                      color: 'var(--text-secondary)',
                      lineHeight: 1.45
                    }}
                  >
                    Menjaga tampilan 100% identik dengan PDF asli untuk dokumen scan, brosur, atau
                    poster artistik. Halaman disematkan sebagai grafik beresolusi tinggi.
                  </p>
                </div>
              </div>
            </div>

            {/* Advanced Toggles for Mode A */}
            {mode === 'layout_preserving' && (
              <div
                style={{
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-md)',
                  padding: 'var(--space-4)',
                  marginBottom: 'var(--space-5)',
                  backgroundColor: 'var(--surface-hover)'
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontWeight: 600,
                    fontSize: '0.875rem',
                    marginBottom: '12px',
                    color: 'var(--text-primary)'
                  }}
                >
                  <Sliders size={16} style={{ color: 'var(--accent-primary)' }} />
                  Opsi Rekonstruksi Dokumen
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <label
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '10px',
                      cursor: 'pointer',
                      userSelect: 'none'
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={detectTables}
                      onChange={(e) => setDetectTables(e.target.checked)}
                      disabled={isProcessing}
                      style={{ marginTop: '3px', cursor: 'pointer' }}
                    />
                    <div>
                      <div
                        style={{
                          fontWeight: 600,
                          fontSize: '0.875rem',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px'
                        }}
                      >
                        <TableIcon size={14} style={{ color: 'var(--accent-primary)' }} />
                        Deteksi & Rekonstruksi Tabel Otomatis
                      </div>
                      <div
                        style={{
                          fontSize: '0.8125rem',
                          color: 'var(--text-secondary)',
                          marginTop: '1px'
                        }}
                      >
                        Mendeteksi baris dan kolom berpenjajaran grid, lalu membangun tabel Word asli
                        dengan garis batas dan perataan yang rapi.
                      </div>
                    </div>
                  </label>

                  <label
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '10px',
                      cursor: 'pointer',
                      userSelect: 'none'
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={preserveFormatting}
                      onChange={(e) => setPreserveFormatting(e.target.checked)}
                      disabled={isProcessing}
                      style={{ marginTop: '3px', cursor: 'pointer' }}
                    />
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>
                        Pertahankan Format Huruf & Perataan (Judul, Bold, Center, Right, Lists)
                      </div>
                      <div
                        style={{
                          fontSize: '0.8125rem',
                          color: 'var(--text-secondary)',
                          marginTop: '1px'
                        }}
                      >
                        Menjaga ukuran judul, teks tebal/miring, perataan tengah/kanan, serta daftar
                        poin (bullet & numbering).
                      </div>
                    </div>
                  </label>

                  <label
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '10px',
                      cursor: 'pointer',
                      userSelect: 'none'
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={includeImages}
                      onChange={(e) => setIncludeImages(e.target.checked)}
                      disabled={isProcessing}
                      style={{ marginTop: '3px', cursor: 'pointer' }}
                    />
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>
                        Ekstrak & Sisipkan Gambar Asli (Logo, Foto, Tanda Tangan)
                      </div>
                      <div
                        style={{
                          fontSize: '0.8125rem',
                          color: 'var(--text-secondary)',
                          marginTop: '1px'
                        }}
                      >
                        Mengekstrak bitmap gambar asli PDF dan menyisipkannya di posisi vertikal yang
                        sesuai dengan skala proporsional.
                      </div>
                    </div>
                  </label>

                  <label
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '10px',
                      cursor: 'pointer',
                      userSelect: 'none'
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={pageBreakPerPage}
                      onChange={(e) => setPageBreakPerPage(e.target.checked)}
                      disabled={isProcessing}
                      style={{ marginTop: '3px', cursor: 'pointer' }}
                    />
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>
                        Sesuaikan Margin Kertas & Pemisah Halaman Sesuai PDF Asli
                      </div>
                      <div
                        style={{
                          fontSize: '0.8125rem',
                          color: 'var(--text-secondary)',
                          marginTop: '1px'
                        }}
                      >
                        Mengatur setiap section Word dengan dimensi kertas (A4/Letter) dan batas
                        margin yang selaras dengan halaman PDF aslinya.
                      </div>
                    </div>
                  </label>
                </div>
              </div>
            )}

            {/* Processing Progress Bar with Cancel Action */}
            {isProcessing && (
              <div
                style={{
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-md)',
                  padding: 'var(--space-4)',
                  marginBottom: 'var(--space-5)',
                  backgroundColor: 'var(--surface-hover)'
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '8px',
                    fontSize: '0.875rem'
                  }}
                >
                  <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                    {progress?.message || 'Sedang memproses dokumen...'}
                  </span>
                  <span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>
                    {progressPercent}%
                  </span>
                </div>

                <div
                  style={{
                    height: '8px',
                    backgroundColor: 'var(--border)',
                    borderRadius: '4px',
                    overflow: 'hidden',
                    marginBottom: '12px'
                  }}
                >
                  <div
                    style={{
                      height: '100%',
                      width: `${progressPercent}%`,
                      backgroundColor: 'var(--accent-primary)',
                      borderRadius: '4px',
                      transition: 'width 200ms ease'
                    }}
                  />
                </div>

                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                >
                  <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                    Tahap: {progress?.stage === 'packing' ? 'Penyusunan File' : 'Ekstraksi Tata Letak'}
                  </span>

                  <button
                    type="button"
                    onClick={handleCancel}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      background: 'none',
                      border: '1px solid #FDA29B',
                      color: '#B42318',
                      borderRadius: 'var(--radius-sm)',
                      padding: '4px 10px',
                      fontSize: '0.8125rem',
                      cursor: 'pointer'
                    }}
                  >
                    <XCircle size={14} /> Batalkan
                  </button>
                </div>
              </div>
            )}

            {/* Action Bar */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                borderTop: '1px solid var(--border)',
                paddingTop: 'var(--space-4)',
                flexWrap: 'wrap',
                gap: '12px'
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '0.8125rem',
                  color: 'var(--text-secondary)'
                }}
              >
                <ShieldCheck size={16} style={{ color: 'var(--accent-primary)' }} />
                <span>100% diproses langsung di perangkat Anda tanpa unggah ke server.</span>
              </div>

              <button
                type="button"
                onClick={handleConvert}
                disabled={isProcessing || isInspecting}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  backgroundColor: 'var(--accent-primary)',
                  color: '#FFFFFF',
                  padding: '11px 26px',
                  borderRadius: 'var(--radius-md)',
                  border: 'none',
                  fontWeight: 600,
                  fontSize: '0.9375rem',
                  cursor: isProcessing || isInspecting ? 'wait' : 'pointer',
                  boxShadow: '0 2px 4px rgba(38, 115, 77, 0.2)'
                }}
              >
                {isProcessing ? (
                  <>
                    <RefreshCw size={18} className="animate-spin" />
                    Sedang Mengonversi...
                  </>
                ) : (
                  <>
                    <FileEdit size={18} />
                    Mulai Konversi ke Word (.docx)
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Conversion Result Card */}
        {result && (
          <div
            style={{
              backgroundColor: 'var(--surface)',
              border: '2px solid #237A4B',
              borderRadius: 'var(--radius-lg)',
              padding: 'var(--space-6)',
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--space-5)',
              boxShadow: '0 4px 12px rgba(35, 122, 75, 0.08)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
              <div
                style={{
                  backgroundColor: '#ECFDF3',
                  color: '#237A4B',
                  padding: '12px',
                  borderRadius: 'var(--radius-md)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}
              >
                <CheckCircle2 size={36} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  <h3
                    style={{
                      margin: 0,
                      fontSize: '1.25rem',
                      fontWeight: 700,
                      color: 'var(--text-primary)'
                    }}
                  >
                    Dokumen Word Berhasil Dibuat!
                  </h3>
                  <span
                    style={{
                      backgroundColor: '#ECFDF3',
                      color: '#237A4B',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      padding: '2px 8px',
                      borderRadius: '12px',
                      border: '1px solid #A6F4C5'
                    }}
                  >
                    {result.modeUsed === 'layout_preserving'
                      ? '✓ 100% Bebas Diedit di Word'
                      : '✓ Preservasi Visual 1:1'}
                  </span>
                </div>

                <p
                  style={{
                    margin: '6px 0 12px 0',
                    fontSize: '0.875rem',
                    color: 'var(--text-secondary)'
                  }}
                >
                  File siap diunduh: <strong>{result.fileName}</strong> • {result.pageCount} Halaman PDF •{' '}
                  {formatBytes(result.fileSize)}
                </p>

                {/* Detailed Quality Badges */}
                <div
                  style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '8px',
                    fontSize: '0.8125rem',
                    color: 'var(--text-primary)'
                  }}
                >
                  <span
                    style={{
                      backgroundColor: 'var(--surface-hover)',
                      border: '1px solid var(--border)',
                      padding: '4px 10px',
                      borderRadius: 'var(--radius-sm)'
                    }}
                  >
                    ✓ {result.wordCount.toLocaleString()} Kata Teks
                  </span>
                  {result.tableCount > 0 && (
                    <span
                      style={{
                        backgroundColor: '#F6FEF9',
                        border: '1px solid #A6F4C5',
                        color: '#027A48',
                        padding: '4px 10px',
                        borderRadius: 'var(--radius-sm)',
                        fontWeight: 600
                      }}
                    >
                      ✓ {result.tableCount} Tabel Word Berhasil Direkonstruksi
                    </span>
                  )}
                  {result.imageCount > 0 && (
                    <span
                      style={{
                        backgroundColor: 'var(--surface-hover)',
                        border: '1px solid var(--border)',
                        padding: '4px 10px',
                        borderRadius: 'var(--radius-sm)'
                      }}
                    >
                      ✓ {result.imageCount} Gambar / Logo Disematkan
                    </span>
                  )}
                  <span
                    style={{
                      backgroundColor: 'var(--surface-hover)',
                      border: '1px solid var(--border)',
                      padding: '4px 10px',
                      borderRadius: 'var(--radius-sm)'
                    }}
                  >
                    ✓ Margin & Dimensi Kertas Selaras
                  </span>
                </div>
              </div>
            </div>

            <div
              style={{
                display: 'flex',
                gap: 'var(--space-3)',
                borderTop: '1px solid var(--border)',
                paddingTop: 'var(--space-4)',
                flexWrap: 'wrap'
              }}
            >
              <button
                type="button"
                onClick={handleDownload}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  backgroundColor: '#237A4B',
                  color: '#FFFFFF',
                  padding: '12px 28px',
                  borderRadius: 'var(--radius-md)',
                  border: 'none',
                  fontWeight: 600,
                  fontSize: '0.9375rem',
                  cursor: 'pointer',
                  boxShadow: '0 2px 4px rgba(35, 122, 75, 0.25)',
                  transition: 'background-color 150ms ease'
                }}
                onMouseOver={(e) =>
                  ((e.currentTarget as HTMLButtonElement).style.backgroundColor = '#1D5B3C')
                }
                onMouseOut={(e) =>
                  ((e.currentTarget as HTMLButtonElement).style.backgroundColor = '#237A4B')
                }
              >
                <Download size={20} /> Unduh File Word (.docx)
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
                  padding: '12px 20px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border)',
                  fontWeight: 500,
                  fontSize: '0.875rem',
                  cursor: 'pointer'
                }}
              >
                Konversi PDF Lain
              </button>
            </div>
          </div>
        )}
      </div>
    </ToolLayout>
  );
};
