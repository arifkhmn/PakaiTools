import React, { useState } from 'react';
import {
  Download,
  RefreshCw,
  FileArchive,
  CheckCircle2,
  Zap,
  Check,
  RotateCcw,
  Sliders
} from 'lucide-react';
import { ToolLayout } from '../../components/layout/ToolLayout';
import { Dropzone } from '../../components/tools/Dropzone';
import { StatusMessage } from '../../components/tools/StatusMessage';
import { TOOLS } from '../../data/tools';
import { formatBytes, downloadBlob } from '../../lib/format';
import { compressPdfDocument } from '../../lib/pdfHelpers';

type CompressionPreset = 'super-extreme' | 'extreme' | 'recommended' | 'light' | 'custom';

export const CompressPdfPage: React.FC = () => {
  const tool = TOOLS.find(t => t.id === 'compress-pdf')!;
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [compressLevel, setCompressLevel] = useState<CompressionPreset>('extreme');
  const [customQuality, setCustomQuality] = useState<number>(35); // 20 - 90
  const [customScale, setCustomScale] = useState<number>(75); // 50 - 120
  const [showCustomSliders, setShowCustomSliders] = useState(false);
  const [autoDownload, setAutoDownload] = useState<boolean>(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState<{ current: number; total: number } | null>(null);
  const [downloadTriggered, setDownloadTriggered] = useState(false);
  const [result, setResult] = useState<{
    blob: Blob;
    originalSize: number;
    compressedSize: number;
    pageCount: number;
    savedPercent: number;
    fileName: string;
  } | null>(null);
  const [globalError, setGlobalError] = useState<string | null>(null);

  const handleFiles = (files: File[]) => {
    setGlobalError(null);
    setResult(null);
    setDownloadTriggered(false);

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
  };

  const handleCompress = async () => {
    if (!selectedFile) return;

    setIsProcessing(true);
    setGlobalError(null);
    setProgress(null);
    setDownloadTriggered(false);

    try {
      const options = compressLevel === 'custom'
        ? {
            level: 'extreme' as const,
            customScale: customScale / 100,
            customQuality: customQuality / 100,
            onProgress: (current: number, total: number) => setProgress({ current, total })
          }
        : {
            level: compressLevel,
            onProgress: (current: number, total: number) => setProgress({ current, total })
          };

      const res = await compressPdfDocument(selectedFile, options);

      const baseName = selectedFile.name.replace(/\.pdf$/i, '');
      const outName = `${baseName}_terkompres.pdf`;

      const resultData = {
        ...res,
        fileName: outName
      };

      setResult(resultData);

      // Trigger auto download if enabled
      if (autoDownload) {
        try {
          downloadBlob(resultData.blob, resultData.fileName);
          setDownloadTriggered(true);
        } catch {
          // If browser blocked popup/auto-download, manual button is ready
        }
      }
    } catch (err: unknown) {
      setGlobalError(err instanceof Error ? err.message : 'Terjadi kegagalan saat mengompresi file PDF.');
    } finally {
      setIsProcessing(false);
      setProgress(null);
    }
  };

  const resetAll = () => {
    setSelectedFile(null);
    setResult(null);
    setProgress(null);
    setDownloadTriggered(false);
    setGlobalError(null);
  };

  const handleDownload = () => {
    if (result) {
      downloadBlob(result.blob, result.fileName);
      setDownloadTriggered(true);
    }
  };

  const savedBytes = result ? result.originalSize - result.compressedSize : 0;

  return (
    <ToolLayout
      tool={tool}
      howToSteps={[
        'Unggah dokumen PDF yang ingin Anda kecilkan ukurannya.',
        'Pilih tingkat kompresi (Super Ekstrem untuk ukuran < 500 KB, Ekstrem, Rekomendasi, atau Kustom).',
        'Klik tombol "Mulai Kompresi PDF Sekarang".',
        'File langsung otomatis terunduh atau klik tombol besar "Unduh File PDF Hasil Kompresi".'
      ]}
      faqItems={[
        {
          question: 'Bagaimana agar file PDF 7-10 MB bisa turun drastis ke bawah 1 MB?',
          answer: 'Gunakan profil "Super Ekstrem" atau "Ekstrem". Profil ini secara cerdas merender ulang gambar dan konten visual dengan resolusi teroptimasi dan kompresi JPEG agresif sehingga ukuran file turun hingga 85% - 92% tanpa membuat teks menjadi kabur.'
        },
        {
          question: 'Apakah hasil kompresi bisa langsung diunduh?',
          answer: 'Ya! Fitur "Otomatis unduh saat selesai" langsung mengunduh file PDF ke folder Downloads Anda. Selain itu, tombol unduh hijau berukuran besar selalu tersedia di layar untuk diunduh kapan saja.'
        },
        {
          question: 'Apakah saya bisa mengatur persentase kualitas dan resolusi sendiri?',
          answer: 'Tentu. Anda dapat memilih menu "Pengaturan Kustom (Slider Manual)" untuk mengatur slider kualitas gambar (20% - 90%) dan skala resolusi dokumen (50% - 120%) sesuai target ukuran berkas Anda.'
        }
      ]}
    >
      <div style={{ maxWidth: '820px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
        {/* Dropzone */}
        {!selectedFile && (
          <Dropzone
            onFilesSelected={handleFiles}
            accept="application/pdf,.pdf"
            multiple={false}
            maxSizeMB={50}
            label="Pilih atau seret dokumen PDF ke sini"
            hint="Maksimal ukuran file 50 MB • Pemrosesan 100% lokal & privat di browser"
          />
        )}

        {globalError && (
          <StatusMessage
            type="error"
            title="Gagal Memproses PDF"
            message={globalError}
            onDismiss={() => setGlobalError(null)}
          />
        )}

        {/* Selected File & Settings */}
        {selectedFile && !result && (
          <div
            style={{
              backgroundColor: 'var(--bg-primary)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-lg)',
              padding: 'var(--space-5)',
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--space-5)',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)'
            }}
          >
            {/* File info bar */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                backgroundColor: 'var(--bg-surface)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-md)',
                padding: 'var(--space-3) var(--space-4)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
                <div
                  style={{
                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                    color: '#DC2626',
                    padding: '8px',
                    borderRadius: 'var(--radius-md)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <FileArchive size={24} />
                </div>
                <div style={{ minWidth: 0 }}>
                  <div
                    style={{
                      fontWeight: 600,
                      fontSize: '0.9375rem',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      color: 'var(--text-primary)'
                    }}
                  >
                    {selectedFile.name}
                  </div>
                  <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                    Ukuran Asli: <strong style={{ color: 'var(--text-primary)' }}>{formatBytes(selectedFile.size)}</strong>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={resetAll}
                disabled={isProcessing}
                style={{
                  background: 'none',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-sm)',
                  color: 'var(--text-secondary)',
                  fontSize: '0.75rem',
                  fontWeight: 500,
                  cursor: isProcessing ? 'not-allowed' : 'pointer',
                  padding: '5px 10px',
                  backgroundColor: 'var(--bg-primary)'
                }}
              >
                Ganti File
              </button>
            </div>

            {/* Compact & Clean Compression Level Selector */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <label style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                  Pilih Tingkat Kompresi
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setShowCustomSliders(!showCustomSliders);
                    if (!showCustomSliders) setCompressLevel('custom');
                    else setCompressLevel('extreme');
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--accent-primary)',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  <Sliders size={13} />
                  <span>{showCustomSliders ? 'Gunakan Preset Standar' : 'Atur Slider Kustom'}</span>
                </button>
              </div>

              {!showCustomSliders ? (
                <div className="compression-levels-grid">
                  {/* 1. Super Ekstrem */}
                  <div
                    onClick={() => !isProcessing && setCompressLevel('super-extreme')}
                    className={`level-card ${compressLevel === 'super-extreme' ? 'active' : ''}`}
                  >
                    <div className="level-card-header">
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <div className={`radio-indicator ${compressLevel === 'super-extreme' ? 'checked' : ''}`}>
                          {compressLevel === 'super-extreme' && <Check size={12} strokeWidth={3} />}
                        </div>
                        <span className="level-title">Super Ekstrem</span>
                      </div>
                      <span className="level-badge badge-super">&lt; 500 KB</span>
                    </div>
                    <p className="level-desc">
                      Kompresi paling agresif. Cocok jika ukuran file 7-10MB ingin dipangkas habis untuk syarat CPNS/BUMN.
                    </p>
                    <div className="level-est">Hemat ~85% - 93%</div>
                  </div>

                  {/* 2. Ekstrem */}
                  <div
                    onClick={() => !isProcessing && setCompressLevel('extreme')}
                    className={`level-card ${compressLevel === 'extreme' ? 'active' : ''}`}
                  >
                    <div className="level-card-header">
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <div className={`radio-indicator ${compressLevel === 'extreme' ? 'checked' : ''}`}>
                          {compressLevel === 'extreme' && <Check size={12} strokeWidth={3} />}
                        </div>
                        <span className="level-title">Ekstrem</span>
                      </div>
                      <span className="level-badge badge-extreme">Ukuran Minim</span>
                    </div>
                    <p className="level-desc">
                      Pengurangan ukuran sangat tinggi. Gambar diperkecil dan tulisan tetap jelas dibaca.
                    </p>
                    <div className="level-est">Hemat ~75% - 85%</div>
                  </div>

                  {/* 3. Rekomendasi */}
                  <div
                    onClick={() => !isProcessing && setCompressLevel('recommended')}
                    className={`level-card ${compressLevel === 'recommended' ? 'active' : ''}`}
                  >
                    <div className="level-card-header">
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <div className={`radio-indicator ${compressLevel === 'recommended' ? 'checked' : ''}`}>
                          {compressLevel === 'recommended' && <Check size={12} strokeWidth={3} />}
                        </div>
                        <span className="level-title">Rekomendasi</span>
                      </div>
                      <span className="level-badge badge-popular">Seimbang</span>
                    </div>
                    <p className="level-desc">
                      Keseimbangan ideal antara ukuran hemat dan teks tajam untuk keperluan umum/email.
                    </p>
                    <div className="level-est">Hemat ~60% - 70%</div>
                  </div>

                  {/* 4. Ringan */}
                  <div
                    onClick={() => !isProcessing && setCompressLevel('light')}
                    className={`level-card ${compressLevel === 'light' ? 'active' : ''}`}
                  >
                    <div className="level-card-header">
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <div className={`radio-indicator ${compressLevel === 'light' ? 'checked' : ''}`}>
                          {compressLevel === 'light' && <Check size={12} strokeWidth={3} />}
                        </div>
                        <span className="level-title">Ringan</span>
                      </div>
                      <span className="level-badge badge-light">Kualitas Tinggi</span>
                    </div>
                    <p className="level-desc">
                      Mempertahankan resolusi sangat tajam untuk dokumen yang banyak gambar detail.
                    </p>
                    <div className="level-est">Hemat ~30% - 45%</div>
                  </div>
                </div>
              ) : (
                /* Custom Sliders Option */
                <div
                  style={{
                    backgroundColor: 'var(--bg-surface)',
                    border: '1.5px solid var(--accent-primary)',
                    borderRadius: 'var(--radius-md)',
                    padding: 'var(--space-4)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 'var(--space-4)'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-primary)' }}>
                      🔧 Pengaturan Kompresi Kustom (Manual)
                    </span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--accent-primary)', fontWeight: 600 }}>
                      Kustom Aktif
                    </span>
                  </div>

                  {/* Quality slider */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontSize: '0.8125rem' }}>
                      <label style={{ fontWeight: 500 }}>Kualitas Kompresi JPEG Halaman</label>
                      <strong style={{ color: 'var(--accent-primary)' }}>{customQuality}%</strong>
                    </div>
                    <input
                      type="range"
                      min="15"
                      max="90"
                      step="5"
                      value={customQuality}
                      onChange={(e) => setCustomQuality(Number(e.target.value))}
                      style={{ width: '100%', accentColor: 'var(--accent-primary)', cursor: 'pointer' }}
                    />
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.6875rem', color: 'var(--text-muted)' }}>
                      <span>15% (Ukuran sangat kecil)</span>
                      <span>50% (Standar)</span>
                      <span>90% (Maksimal)</span>
                    </div>
                  </div>

                  {/* Scale slider */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontSize: '0.8125rem' }}>
                      <label style={{ fontWeight: 500 }}>Skala Resolusi Render Dokumen</label>
                      <strong style={{ color: 'var(--accent-primary)' }}>{customScale}%</strong>
                    </div>
                    <input
                      type="range"
                      min="50"
                      max="130"
                      step="5"
                      value={customScale}
                      onChange={(e) => setCustomScale(Number(e.target.value))}
                      style={{ width: '100%', accentColor: 'var(--accent-primary)', cursor: 'pointer' }}
                    />
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.6875rem', color: 'var(--text-muted)' }}>
                      <span>50% (Downscale drastis)</span>
                      <span>80% (Direkomendasikan)</span>
                      <span>120% (Resolusi asli)</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Auto download toggle option */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '10px 14px',
                backgroundColor: 'var(--bg-surface)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-color)'
              }}
            >
              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  cursor: 'pointer',
                  fontSize: '0.8125rem',
                  fontWeight: 500,
                  color: 'var(--text-primary)',
                  userSelect: 'none'
                }}
              >
                <input
                  type="checkbox"
                  checked={autoDownload}
                  onChange={(e) => setAutoDownload(e.target.checked)}
                  disabled={isProcessing}
                  style={{ cursor: 'pointer', accentColor: 'var(--accent-primary)' }}
                />
                <span>Otomatis unduh file setelah kompresi selesai</span>
              </label>

              <span style={{ fontSize: '0.75rem', color: 'var(--accent-primary)', fontWeight: 600 }}>
                Langsung tersimpan ke laptop/HP
              </span>
            </div>

            {/* Primary Action Button */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--space-3)',
                borderTop: '1px solid var(--border-color)',
                paddingTop: 'var(--space-4)'
              }}
            >
              <button
                type="button"
                onClick={handleCompress}
                disabled={isProcessing}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '10px',
                  backgroundColor: '#26734D',
                  color: '#FFFFFF',
                  padding: '14px 24px',
                  borderRadius: 'var(--radius-md)',
                  border: 'none',
                  fontWeight: 700,
                  fontSize: '1rem',
                  cursor: isProcessing ? 'wait' : 'pointer',
                  width: '100%',
                  boxShadow: '0 2px 6px rgba(38, 115, 77, 0.25)',
                  transition: 'background-color 150ms ease'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#1D5B3C'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#26734D'}
              >
                {isProcessing ? (
                  <>
                    <RefreshCw size={20} className="animate-spin" />
                    <span>Mengompresi Halaman {progress ? `${progress.current} dari ${progress.total}` : ''}...</span>
                  </>
                ) : (
                  <>
                    <Zap size={20} />
                    <span>Mulai Kompresi PDF Sekarang</span>
                  </>
                )}
              </button>

              {isProcessing && progress && (
                <div style={{ width: '100%' }}>
                  <div
                    style={{
                      width: '100%',
                      height: '8px',
                      backgroundColor: 'var(--border-color)',
                      borderRadius: 'var(--radius-full)',
                      overflow: 'hidden'
                    }}
                  >
                    <div
                      style={{
                        height: '100%',
                        backgroundColor: '#26734D',
                        width: `${Math.round((progress.current / progress.total) * 100)}%`,
                        transition: 'width 200ms ease'
                      }}
                    />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '6px' }}>
                    <span>Sedang merender & mengompresi visual halaman...</span>
                    <strong>{Math.round((progress.current / progress.total) * 100)}%</strong>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Compression Result - PROMINENT, UNMISSABLE DOWNLOAD CARD */}
        {result && (
          <div
            style={{
              backgroundColor: 'var(--bg-primary)',
              border: '2px solid #237A4B',
              borderRadius: 'var(--radius-lg)',
              padding: 'var(--space-6)',
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--space-5)',
              boxShadow: '0 4px 20px rgba(35, 122, 75, 0.15)'
            }}
          >
            {/* Header info */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div
                style={{
                  backgroundColor: '#ECFDF3',
                  color: '#237A4B',
                  padding: '14px',
                  borderRadius: 'var(--radius-md)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <CheckCircle2 size={36} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  File PDF Berhasil Dikompresi!
                </h3>
                <p style={{ margin: '4px 0 0 0', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                  {result.fileName} • {result.pageCount} Halaman
                  {downloadTriggered && (
                    <span style={{ color: '#237A4B', fontWeight: 600, marginLeft: '8px' }}>
                      (Unduhan otomatis telah dimulai)
                    </span>
                  )}
                </p>
              </div>
            </div>

            {/* Metric Comparison Cards */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                gap: 'var(--space-3)',
                backgroundColor: 'var(--bg-surface)',
                padding: 'var(--space-4)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-color)'
              }}
            >
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Ukuran Awal
                </div>
                <div style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--text-secondary)', textDecoration: 'line-through' }}>
                  {formatBytes(result.originalSize)}
                </div>
              </div>

              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Ukuran Hasil Kompresi
                </div>
                <div style={{ fontSize: '1.375rem', fontWeight: 700, color: '#237A4B' }}>
                  {formatBytes(result.compressedSize)}
                </div>
              </div>

              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Penghematan Ukuran
                </div>
                <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#26734D' }}>
                  {result.savedPercent > 0 ? `-${result.savedPercent}% (Hemat ${formatBytes(savedBytes)})` : 'Ukuran Optimal'}
                </div>
              </div>
            </div>

            {/* BIG VIBRANT GREEN DOWNLOAD BUTTON */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--space-3)',
                borderTop: '1px solid var(--border-color)',
                paddingTop: 'var(--space-4)'
              }}
            >
              <button
                type="button"
                onClick={handleDownload}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '12px',
                  backgroundColor: '#237A4B',
                  color: '#FFFFFF',
                  padding: '16px 32px',
                  borderRadius: 'var(--radius-md)',
                  border: 'none',
                  fontWeight: 700,
                  fontSize: '1.125rem',
                  cursor: 'pointer',
                  width: '100%',
                  boxShadow: '0 4px 12px rgba(35, 122, 75, 0.35)',
                  transition: 'background-color 150ms ease, transform 100ms ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#195B38';
                  e.currentTarget.style.transform = 'translateY(-1px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#237A4B';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <Download size={24} strokeWidth={2.6} />
                <span>UNDUH FILE PDF HASIL KOMPRESI ({formatBytes(result.compressedSize)})</span>
              </button>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                  Jika file belum tersimpan di laptop/HP Anda, klik tombol hijau besar di atas.
                </span>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    type="button"
                    onClick={() => setResult(null)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      backgroundColor: 'transparent',
                      color: 'var(--text-secondary)',
                      padding: '8px 14px',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border-color)',
                      fontWeight: 500,
                      fontSize: '0.8125rem',
                      cursor: 'pointer'
                    }}
                  >
                    <RotateCcw size={14} /> Coba Kompresi Lebih Ekstrem
                  </button>

                  <button
                    type="button"
                    onClick={resetAll}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      backgroundColor: 'transparent',
                      color: 'var(--accent-primary)',
                      padding: '8px 14px',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border-color)',
                      fontWeight: 500,
                      fontSize: '0.8125rem',
                      cursor: 'pointer'
                    }}
                  >
                    Kompres File Baru
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <style>{`
        .compression-levels-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 12px;
        }

        .level-card {
          border: 1.5px solid var(--border-color);
          background-color: var(--bg-primary);
          border-radius: var(--radius-md);
          padding: 12px 14px;
          cursor: pointer;
          display: flex;
          flex-direction: column;
          justifyContent: space-between;
          transition: all 120ms ease;
          position: relative;
        }

        .level-card:hover {
          border-color: #26734D;
          background-color: var(--bg-surface);
        }

        .level-card.active {
          border-color: #26734D;
          background-color: #ECFDF3;
          box-shadow: 0 0 0 1px #26734D;
        }

        .level-card-header {
          display: flex;
          justifyContent: space-between;
          align-items: center;
          margin-bottom: 6px;
        }

        .radio-indicator {
          width: 16px;
          height: 16px;
          border-radius: 50%;
          border: 1.5px solid var(--border-color);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #FFFFFF;
          background-color: transparent;
          flex-shrink: 0;
        }

        .radio-indicator.checked {
          border-color: #26734D;
          background-color: #26734D;
        }

        .level-title {
          font-weight: 600;
          font-size: 0.875rem;
          color: var(--text-primary);
        }

        .level-badge {
          font-size: 0.6875rem;
          font-weight: 600;
          padding: 2px 6px;
          border-radius: var(--radius-sm);
        }

        .badge-super {
          background-color: #DC2626;
          color: #FFFFFF;
        }

        .badge-extreme {
          background-color: #EA580C;
          color: #FFFFFF;
        }

        .badge-popular {
          background-color: #26734D;
          color: #FFFFFF;
        }

        .badge-light {
          background-color: var(--bg-surface);
          color: var(--text-secondary);
          border: 1px solid var(--border-color);
        }

        .level-desc {
          margin: 0 0 8px 0;
          font-size: 0.78125rem;
          color: var(--text-secondary);
          line-height: 1.35;
        }

        .level-est {
          font-size: 0.75rem;
          font-weight: 600;
          color: #26734D;
        }

        @media (max-width: 640px) {
          .compression-levels-grid {
            grid-template-columns: 1fr;
            gap: 8px;
          }
        }
      `}</style>
    </ToolLayout>
  );
};
