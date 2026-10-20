import React, { useState } from 'react';
import { Download, Trash2, ArrowUp, ArrowDown, FileImage, RefreshCw, FileCheck } from 'lucide-react';
import { ToolLayout } from '../../components/layout/ToolLayout';
import { Dropzone } from '../../components/tools/Dropzone';
import { StatusMessage } from '../../components/tools/StatusMessage';
import { TOOLS } from '../../data/tools';
import { formatBytes, downloadBlob } from '../../lib/format';
import { imagesToPdf } from '../../lib/pdfHelpers';
import type { ImageToPdfItem, ImageToPdfOptions } from '../../lib/pdfHelpers';

export const ImageToPdfPage: React.FC = () => {
  const tool = TOOLS.find(t => t.id === 'image-to-pdf')!;
  const [images, setImages] = useState<ImageToPdfItem[]>([]);
  const [pageSize, setPageSize] = useState<'a4' | 'letter' | 'fit'>('a4');
  const [orientation, setOrientation] = useState<'auto' | 'portrait' | 'landscape'>('auto');
  const [margin, setMargin] = useState<number>(10);
  const [quality, setQuality] = useState<number>(0.85);

  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState<{ current: number; total: number } | null>(null);
  const [result, setResult] = useState<{ blob: Blob; size: number; pageCount: number; fileName: string } | null>(null);
  const [globalError, setGlobalError] = useState<string | null>(null);

  const handleFiles = async (files: File[]) => {
    setGlobalError(null);
    const validMimes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    const newItems: ImageToPdfItem[] = [];

    for (const file of files) {
      if (!validMimes.includes(file.type.toLowerCase())) {
        setGlobalError(`File "${file.name}" dilewati karena hanya format JPG, PNG, atau WebP yang didukung.`);
        continue;
      }

      if (file.size > 20 * 1024 * 1024) {
        setGlobalError(`File "${file.name}" melebihi batas 20 MB.`);
        continue;
      }

      try {
        const dataUrl = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });

        const dims = await new Promise<{ width: number; height: number }>((resolve) => {
          const img = new Image();
          img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight });
          img.onerror = () => resolve({ width: 800, height: 600 });
          img.src = dataUrl;
        });

        newItems.push({
          id: Math.random().toString(36).substring(2, 9),
          file,
          dataUrl,
          width: dims.width,
          height: dims.height,
          name: file.name
        });
      } catch {
        setGlobalError(`Gagal membaca file gambar "${file.name}".`);
      }
    }

    if (newItems.length > 0) {
      setImages(prev => [...prev, ...newItems]);
      setResult(null);
    }
  };

  const removeImage = (id: string) => {
    setImages(prev => prev.filter(img => img.id !== id));
    setResult(null);
  };

  const moveImage = (index: number, direction: 'up' | 'down') => {
    setImages(prev => {
      const copy = [...prev];
      const targetIndex = direction === 'up' ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= copy.length) return prev;
      const temp = copy[index];
      copy[index] = copy[targetIndex];
      copy[targetIndex] = temp;
      return copy;
    });
    setResult(null);
  };

  const clearAll = () => {
    setImages([]);
    setResult(null);
    setProgress(null);
    setGlobalError(null);
  };

  const handleConvert = async () => {
    if (images.length === 0) return;
    setIsProcessing(true);
    setGlobalError(null);
    setProgress({ current: 0, total: images.length });

    try {
      const options: ImageToPdfOptions = {
        pageSize,
        orientation,
        margin,
        quality
      };

      const res = await imagesToPdf(images, options, (cur, tot) => {
        setProgress({ current: cur, total: tot });
      });

      const baseName = images[0].name.replace(/\.[^/.]+$/, '');
      const outFileName = images.length === 1 ? `${baseName}.pdf` : `koleksi_gambar_${images.length}_halaman.pdf`;

      setResult({
        blob: res.blob,
        size: res.size,
        pageCount: res.pageCount,
        fileName: outFileName
      });
    } catch (err: unknown) {
      setGlobalError(err instanceof Error ? err.message : 'Terjadi kesalahan saat mengonversi gambar ke PDF.');
    } finally {
      setIsProcessing(false);
      setProgress(null);
    }
  };

  const handleDownload = () => {
    if (result) {
      downloadBlob(result.blob, result.fileName);
    }
  };

  const totalInputSize = images.reduce((acc, img) => acc + img.file.size, 0);

  return (
    <ToolLayout
      tool={tool}
      howToSteps={[
        'Unggah satu atau beberapa file foto (JPG, PNG, atau WebP).',
        'Atur urutan halaman dengan tombol panah naik/turun jika ada urutan scan tertentu.',
        'Pilih ukuran kertas (A4, Letter, atau Fit), orientasi, dan batas margin yang diinginkan.',
        'Klik tombol "Konversi ke PDF" dan unduh dokumen PDF siap pakai seketika.'
      ]}
      faqItems={[
        {
          question: 'Berapa banyak foto yang bisa digabung menjadi satu PDF?',
          answer: 'Tidak ada batasan kaku. Anda dapat menggabungkan puluhan lembar tugas, kwitansi, atau scan dokumen secara bersamaan langsung di memori browser Anda.'
        },
        {
          question: 'Bagaimana cara memastikan gambar tidak terpotong saat dicetak?',
          answer: 'Pilih opsi ukuran "A4" dengan margin "Normal (20mm)" atau "Sempit (10mm)". Sistem secara otomatis menghitung skala proporsional agar seluruh foto berada di dalam area cetak aman.'
        },
        {
          question: 'Apakah urutan halaman bisa ditukar-tukar?',
          answer: 'Ya, Anda dapat menekan ikon panah ke atas atau ke bawah pada daftar gambar untuk menyusun urutan nomor halaman sebelum dikonversi.'
        }
      ]}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
        {/* Dropzone */}
        <Dropzone
          onFilesSelected={handleFiles}
          accept="image/jpeg,image/png,image/webp"
          multiple={true}
          maxSizeMB={20}
          label="Pilih atau seret file gambar JPG, PNG, atau WebP"
          hint="Bisa pilih banyak gambar sekaligus untuk digabung ke dalam satu file PDF"
        />

        {globalError && (
          <StatusMessage
            type="error"
            title="Pemberitahuan"
            message={globalError}
            onDismiss={() => setGlobalError(null)}
          />
        )}

        {/* Selected Images List */}
        {images.length > 0 && (
          <div
            style={{
              backgroundColor: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-lg)',
              padding: 'var(--space-5)'
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 'var(--space-4)',
                borderBottom: '1px solid var(--border)',
                paddingBottom: 'var(--space-3)'
              }}
            >
              <div>
                <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 600 }}>
                  Daftar Gambar ({images.length} file — Total {formatBytes(totalInputSize)})
                </h3>
                <p style={{ margin: '4px 0 0 0', fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                  Urutan di bawah mencerminkan urutan nomor halaman pada PDF hasil akhir.
                </p>
              </div>
              <button
                type="button"
                onClick={clearAll}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--status-error)',
                  fontSize: '0.8125rem',
                  fontWeight: 500,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                <Trash2 size={14} /> Hapus Semua
              </button>
            </div>

            {/* Grid list of images */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
                gap: 'var(--space-4)',
                marginBottom: 'var(--space-6)'
              }}
            >
              {images.map((img, idx) => (
                <div
                  key={img.id}
                  style={{
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-md)',
                    overflow: 'hidden',
                    backgroundColor: 'var(--surface-hover)',
                    display: 'flex',
                    flexDirection: 'column'
                  }}
                >
                  <div
                    style={{
                      height: '130px',
                      backgroundColor: '#1E293B',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      position: 'relative',
                      overflow: 'hidden'
                    }}
                  >
                    <img
                      src={img.dataUrl}
                      alt={img.name}
                      style={{
                        maxWidth: '100%',
                        maxHeight: '100%',
                        objectFit: 'contain'
                      }}
                    />
                    <span
                      style={{
                        position: 'absolute',
                        top: '6px',
                        left: '6px',
                        backgroundColor: 'rgba(0,0,0,0.75)',
                        color: '#FFFFFF',
                        padding: '2px 8px',
                        borderRadius: 'var(--radius-full)',
                        fontSize: '0.75rem',
                        fontWeight: 600
                      }}
                    >
                      #{idx + 1}
                    </span>
                  </div>

                  <div style={{ padding: '8px 10px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div style={{ marginBottom: '8px' }}>
                      <div
                        style={{
                          fontSize: '0.8125rem',
                          fontWeight: 500,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}
                        title={img.name}
                      >
                        {img.name}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {img.width}x{img.height}px • {formatBytes(img.file.size)}
                      </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border)', paddingTop: '6px' }}>
                      <div style={{ display: 'flex', gap: '2px' }}>
                        <button
                          type="button"
                          onClick={() => moveImage(idx, 'up')}
                          disabled={idx === 0}
                          title="Geser ke kiri / urutan sebelumnya"
                          style={{
                            background: 'none',
                            border: '1px solid var(--border)',
                            borderRadius: 'var(--radius-sm)',
                            padding: '3px 6px',
                            cursor: idx === 0 ? 'not-allowed' : 'pointer',
                            opacity: idx === 0 ? 0.3 : 1
                          }}
                        >
                          <ArrowUp size={12} />
                        </button>
                        <button
                          type="button"
                          onClick={() => moveImage(idx, 'down')}
                          disabled={idx === images.length - 1}
                          title="Geser ke kanan / urutan selanjutnya"
                          style={{
                            background: 'none',
                            border: '1px solid var(--border)',
                            borderRadius: 'var(--radius-sm)',
                            padding: '3px 6px',
                            cursor: idx === images.length - 1 ? 'not-allowed' : 'pointer',
                            opacity: idx === images.length - 1 ? 0.3 : 1
                          }}
                        >
                          <ArrowDown size={12} />
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => removeImage(img.id)}
                        title="Hapus foto ini"
                        style={{
                          background: 'none',
                          border: 'none',
                          color: 'var(--status-error)',
                          padding: '4px',
                          cursor: 'pointer'
                        }}
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Options bar */}
            <div
              style={{
                backgroundColor: 'var(--surface)',
                borderTop: '1px solid var(--border)',
                paddingTop: 'var(--space-4)',
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: 'var(--space-4)',
                marginBottom: 'var(--space-5)'
              }}
            >
              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '6px' }}>
                  Ukuran Halaman (Kertas)
                </label>
                <select
                  value={pageSize}
                  onChange={(e) => setPageSize(e.target.value as 'a4' | 'letter' | 'fit')}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border)',
                    backgroundColor: 'var(--surface)',
                    color: 'var(--text-primary)',
                    fontSize: '0.875rem'
                  }}
                >
                  <option value="a4">A4 (210 × 297 mm) — Standar</option>
                  <option value="letter">Letter (216 × 279 mm)</option>
                  <option value="fit">Fit to Image (Sesuai ukuran gambar)</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '6px' }}>
                  Orientasi Kertas
                </label>
                <select
                  value={orientation}
                  onChange={(e) => setOrientation(e.target.value as 'auto' | 'portrait' | 'landscape')}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border)',
                    backgroundColor: 'var(--surface)',
                    color: 'var(--text-primary)',
                    fontSize: '0.875rem'
                  }}
                >
                  <option value="auto">Otomatis (Ikuti bentuk foto)</option>
                  <option value="portrait">Portrait (Tegak)</option>
                  <option value="landscape">Landscape (Mendatar)</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '6px' }}>
                  Margin Batas Tepi
                </label>
                <select
                  value={margin}
                  onChange={(e) => setMargin(Number(e.target.value))}
                  disabled={pageSize === 'fit'}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border)',
                    backgroundColor: 'var(--surface)',
                    color: 'var(--text-primary)',
                    fontSize: '0.875rem'
                  }}
                >
                  <option value={0}>Tanpa Margin (Full tepi)</option>
                  <option value={10}>Sempit (10 mm)</option>
                  <option value={20}>Normal (20 mm)</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '6px' }}>
                  Kualitas Kompresi Foto
                </label>
                <select
                  value={quality}
                  onChange={(e) => setQuality(Number(e.target.value))}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border)',
                    backgroundColor: 'var(--surface)',
                    color: 'var(--text-primary)',
                    fontSize: '0.875rem'
                  }}
                >
                  <option value={0.75}>Sedang (Ukuran file lebih hemat)</option>
                  <option value={0.85}>Optimal (Seimbang & teks tajam)</option>
                  <option value={0.95}>Kualitas Tinggi (Maksimal)</option>
                </select>
              </div>
            </div>

            {/* Action Bar */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'flex-end',
                alignItems: 'center',
                gap: 'var(--space-3)'
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
                    Menyusun Halaman {progress ? `${progress.current}/${progress.total}` : ''}...
                  </>
                ) : (
                  <>
                    <FileImage size={18} />
                    Konversi {images.length} Gambar ke PDF
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Done / Result Card */}
        {result && (
          <div
            style={{
              backgroundColor: 'var(--surface)',
              border: '2px solid var(--status-success)',
              borderRadius: 'var(--radius-lg)',
              padding: 'var(--space-5)',
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--space-4)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div
                style={{
                  backgroundColor: 'rgba(34, 197, 94, 0.1)',
                  color: 'var(--status-success)',
                  padding: '10px',
                  borderRadius: 'var(--radius-md)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <FileCheck size={28} />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.125rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                  Dokumen PDF Berhasil Dibuat!
                </h3>
                <p style={{ margin: '4px 0 0 0', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                  {result.fileName} • {result.pageCount} Halaman • Ukuran {formatBytes(result.size)}
                </p>
              </div>
            </div>

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
                  padding: '10px 20px',
                  borderRadius: 'var(--radius-md)',
                  border: 'none',
                  fontWeight: 600,
                  fontSize: '0.875rem',
                  cursor: 'pointer'
                }}
              >
                <Download size={16} /> Unduh File PDF
              </button>

              <button
                type="button"
                onClick={clearAll}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  backgroundColor: 'transparent',
                  color: 'var(--text-secondary)',
                  padding: '10px 16px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border)',
                  fontWeight: 500,
                  fontSize: '0.875rem',
                  cursor: 'pointer'
                }}
              >
                Buat PDF Baru
              </button>
            </div>
          </div>
        )}
      </div>
    </ToolLayout>
  );
};
