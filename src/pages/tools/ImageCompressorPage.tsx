import React, { useState } from 'react';
import { Download, Trash2, ArrowRight, AlertCircle, RefreshCw, Archive } from 'lucide-react';
import JSZip from 'jszip';
import { ToolLayout } from '../../components/layout/ToolLayout';
import { Dropzone } from '../../components/tools/Dropzone';
import { StatusMessage } from '../../components/tools/StatusMessage';
import { TOOLS } from '../../data/tools';
import { formatBytes, downloadBlob } from '../../lib/format';
import { compressImage } from '../../lib/imageCompressor';
import type { CompressionResult } from '../../lib/imageCompressor';

interface CompressItem {
  id: string;
  file: File;
  previewUrl: string;
  originalSize: number;
  status: 'idle' | 'processing' | 'done' | 'error';
  result?: CompressionResult;
  error?: string;
}

export const ImageCompressorPage: React.FC = () => {
  const tool = TOOLS.find(t => t.id === 'image-compressor')!;
  const [items, setItems] = useState<CompressItem[]>([]);
  const [quality, setQuality] = useState<number>(80);
  const [format, setFormat] = useState<'original' | 'image/jpeg' | 'image/webp' | 'image/png'>('original');
  const [isProcessing, setIsProcessing] = useState(false);
  const [globalError, setGlobalError] = useState<string | null>(null);

  const handleFiles = (files: File[]) => {
    setGlobalError(null);
    const validExtensions = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    const newItems: CompressItem[] = [];

    for (const file of files) {
      if (!validExtensions.includes(file.type.toLowerCase())) {
        setGlobalError(`File "${file.name}" dilewati karena format ${file.type || 'tidak dikenal'} belum didukung.`);
        continue;
      }
      if (file.size > 25 * 1024 * 1024) {
        setGlobalError(`File "${file.name}" melebihi batas ukuran maksimal 25 MB.`);
        continue;
      }

      newItems.push({
        id: Math.random().toString(36).substring(2, 9),
        file,
        previewUrl: URL.createObjectURL(file),
        originalSize: file.size,
        status: 'idle'
      });
    }

    setItems(prev => [...prev, ...newItems]);
  };

  const removeItem = (id: string) => {
    setItems(prev => {
      const target = prev.find(item => item.id === id);
      if (target) {
        URL.revokeObjectURL(target.previewUrl);
        if (target.result?.url) URL.revokeObjectURL(target.result.url);
      }
      return prev.filter(item => item.id !== id);
    });
  };

  const clearAll = () => {
    items.forEach(item => {
      URL.revokeObjectURL(item.previewUrl);
      if (item.result?.url) URL.revokeObjectURL(item.result.url);
    });
    setItems([]);
    setGlobalError(null);
  };

  const processAll = async () => {
    if (items.length === 0) return;
    setIsProcessing(true);
    setGlobalError(null);

    const updatedItems = [...items];

    for (let i = 0; i < updatedItems.length; i++) {
      const item = updatedItems[i];
      updatedItems[i] = { ...item, status: 'processing', error: undefined };
      setItems([...updatedItems]);

      try {
        const result = await compressImage(item.file, {
          quality: quality / 100,
          format
        });
        updatedItems[i] = { ...item, status: 'done', result };
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Terjadi kegagalan saat mengompresi gambar.';
        updatedItems[i] = { ...item, status: 'error', error: msg };
      }
      setItems([...updatedItems]);
    }

    setIsProcessing(false);
  };

  const downloadSingle = (item: CompressItem) => {
    if (!item.result) return;
    const originalExt = item.file.name.substring(item.file.name.lastIndexOf('.'));
    const baseName = item.file.name.substring(0, item.file.name.lastIndexOf('.')) || item.file.name;
    let targetExt = originalExt;

    if (item.result.mimeType === 'image/jpeg') targetExt = '.jpg';
    else if (item.result.mimeType === 'image/webp') targetExt = '.webp';
    else if (item.result.mimeType === 'image/png') targetExt = '.png';

    downloadBlob(item.result.blob, `${baseName}-pakaitools-min${targetExt}`);
  };

  const downloadAllZip = async () => {
    const doneItems = items.filter(i => i.status === 'done' && i.result);
    if (doneItems.length === 0) return;

    const zip = new JSZip();
    doneItems.forEach((item) => {
      if (!item.result) return;
      const originalExt = item.file.name.substring(item.file.name.lastIndexOf('.'));
      const baseName = item.file.name.substring(0, item.file.name.lastIndexOf('.')) || item.file.name;
      let targetExt = originalExt;

      if (item.result.mimeType === 'image/jpeg') targetExt = '.jpg';
      else if (item.result.mimeType === 'image/webp') targetExt = '.webp';
      else if (item.result.mimeType === 'image/png') targetExt = '.png';

      zip.file(`${baseName}-pakaitools-min${targetExt}`, item.result.blob);
    });

    const zipBlob = await zip.generateAsync({ type: 'blob', mimeType: 'application/zip' });
    downloadBlob(zipBlob, 'pakaitools-kompresi.zip');
  };

  const doneCount = items.filter(i => i.status === 'done').length;

  return (
    <ToolLayout tool={tool}>
      {globalError && (
        <StatusMessage
          type="warning"
          message={globalError}
          onDismiss={() => setGlobalError(null)}
        />
      )}

      {/* Upload Dropzone */}
      <Dropzone
        multiple
        onFilesSelected={handleFiles}
        label="Pilih atau seret satu atau banyak gambar di sini"
        hint="Format JPEG, PNG, dan WebP hingga 25 MB per file"
      />

      {/* Options Panel if files are selected */}
      {items.length > 0 && (
        <div className="panel" style={{ marginTop: '24px' }}>
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '16px',
            marginBottom: '20px',
            paddingBottom: '16px',
            borderBottom: '1px solid var(--border-color)'
          }}>
            <div style={{ fontWeight: 600, fontSize: '1rem', color: 'var(--text-primary)' }}>
              Pengaturan Kompresi ({items.length} file dipilih)
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                type="button"
                className="btn btn-outline btn-sm"
                onClick={clearAll}
                disabled={isProcessing}
              >
                <Trash2 size={14} />
                <span>Hapus Semua</span>
              </button>
              {doneCount > 1 && (
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={downloadAllZip}
                >
                  <Archive size={14} />
                  <span>Unduh Semua (ZIP)</span>
                </button>
              )}
            </div>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: '24px',
            marginBottom: '24px'
          }}>
            {/* Quality Slider */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <label htmlFor="quality-slider" style={{ fontSize: '0.875rem', fontWeight: 500 }}>
                  Tingkat Kualitas Kompresi
                </label>
                <span className="tabular-nums" style={{ fontWeight: 600, color: 'var(--accent-primary)' }}>
                  {quality}%
                </span>
              </div>
              <input
                id="quality-slider"
                type="range"
                min="10"
                max="100"
                step="5"
                value={quality}
                onChange={(e) => setQuality(Number(e.target.value))}
                style={{ width: '100%', accentColor: 'var(--accent-primary)', cursor: 'pointer' }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                <span>File Lebih Kecil (10%)</span>
                <span>Rekomendasi (80%)</span>
                <span>Kualitas Tinggi (100%)</span>
              </div>
            </div>

            {/* Target Format */}
            <div>
              <label htmlFor="format-select" style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '8px' }}>
                Format Output
              </label>
              <select
                id="format-select"
                value={format}
                onChange={(e) => setFormat(e.target.value as any)}
                style={{ width: '100%' }}
              >
                <option value="original">Pertahankan Format Asli</option>
                <option value="image/webp">Konversi ke WebP (Sangat Efisien)</option>
                <option value="image/jpeg">Konversi ke JPEG (Standar Kompatibel)</option>
                <option value="image/png">Konversi ke PNG (Lossless)</option>
              </select>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                {format === 'original' && 'Format asli dipertahankan. Untuk PNG, kualitas canvas browser bersifat lossless.'}
                {format === 'image/webp' && 'Format WebP memberikan penghematan ukuran paling signifikan untuk foto.'}
                {format === 'image/jpeg' && 'JPEG sangat kompatibel namun tidak mendukung transparansi.'}
                {format === 'image/png' && 'PNG bersifat lossless; slider kualitas tidak mempengaruhi kompresi PNG.'}
              </div>
            </div>
          </div>

          <button
            type="button"
            className="btn btn-primary"
            onClick={processAll}
            disabled={isProcessing}
            style={{ width: '100%', height: '44px', fontSize: '0.9375rem' }}
          >
            {isProcessing ? (
              <>
                <RefreshCw size={16} className="animate-spin" />
                <span>Sedang Mengompresi File...</span>
              </>
            ) : (
              <>
                <RefreshCw size={16} />
                <span>Mulai Kompresi Semua Gambar</span>
              </>
            )}
          </button>
        </div>
      )}

      {/* Selected Items List */}
      {items.length > 0 && (
        <div style={{ marginTop: '24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {items.map((item) => (
            <div
              key={item.id}
              className="panel"
              style={{
                padding: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '16px'
              }}
            >
              {/* File Info */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', minWidth: '240px', flex: '1 1 auto' }}>
                <img
                  src={item.previewUrl}
                  alt={item.file.name}
                  style={{
                    width: '56px',
                    height: '56px',
                    objectFit: 'cover',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border-color)',
                    backgroundColor: 'var(--bg-surface)'
                  }}
                />
                <div>
                  <div style={{
                    fontWeight: 600,
                    fontSize: '0.875rem',
                    color: 'var(--text-primary)',
                    maxWidth: '280px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}>
                    {item.file.name}
                  </div>
                  <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }} className="tabular-nums">
                    Ukuran Asli: {formatBytes(item.originalSize)}
                  </div>
                </div>
              </div>

              {/* Status and Results */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
                {item.status === 'idle' && (
                  <span className="badge">Siap dikompres</span>
                )}

                {item.status === 'processing' && (
                  <span className="badge badge-accent">Memproses...</span>
                )}

                {item.status === 'error' && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--error)', fontSize: '0.8125rem' }}>
                    <AlertCircle size={15} />
                    <span>{item.error || 'Gagal'}</span>
                  </div>
                )}

                {item.status === 'done' && item.result && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.875rem' }} className="tabular-nums">
                        <span style={{ color: 'var(--text-muted)', textDecoration: 'line-through' }}>
                          {formatBytes(item.originalSize)}
                        </span>
                        <ArrowRight size={13} color="var(--text-muted)" />
                        <span style={{ fontWeight: 600, color: item.result.isLarger ? 'var(--warning)' : 'var(--success)' }}>
                          {formatBytes(item.result.outputSize)}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.75rem' }}>
                        {item.result.isLarger ? (
                          <span style={{ color: 'var(--warning)' }}>
                            Hasil lebih besar (+{formatBytes(item.result.outputSize - item.originalSize)})
                          </span>
                        ) : (
                          <span style={{ color: 'var(--success)', fontWeight: 500 }}>
                            Hemat {item.result.savedPercent}% ({formatBytes(item.result.savedBytes)})
                          </span>
                        )}
                      </div>
                    </div>

                    <button
                      type="button"
                      className="btn btn-primary btn-sm"
                      onClick={() => downloadSingle(item)}
                    >
                      <Download size={14} />
                      <span>Unduh</span>
                    </button>
                  </div>
                )}

                <button
                  type="button"
                  className="btn btn-outline btn-sm"
                  onClick={() => removeItem(item.id)}
                  aria-label={`Hapus file ${item.file.name}`}
                  style={{ padding: '6px' }}
                >
                  <Trash2 size={14} color="var(--error)" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </ToolLayout>
  );
};
