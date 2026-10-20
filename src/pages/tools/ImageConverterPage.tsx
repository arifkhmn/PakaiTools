import React, { useState } from 'react';
import { Download, Trash2, RefreshCw, Archive, AlertCircle } from 'lucide-react';
import JSZip from 'jszip';
import { ToolLayout } from '../../components/layout/ToolLayout';
import { Dropzone } from '../../components/tools/Dropzone';
import { StatusMessage } from '../../components/tools/StatusMessage';
import { TOOLS } from '../../data/tools';
import { formatBytes, downloadBlob } from '../../lib/format';
import { convertImage } from '../../lib/imageConverter';
import type { TargetFormat, ConvertedResult } from '../../lib/imageConverter';

interface ConvertItem {
  id: string;
  file: File;
  previewUrl: string;
  status: 'idle' | 'processing' | 'done' | 'error';
  result?: ConvertedResult;
  error?: string;
}

export const ImageConverterPage: React.FC = () => {
  const tool = TOOLS.find(t => t.id === 'image-converter')!;

  const [items, setItems] = useState<ConvertItem[]>([]);
  const [targetFormat, setTargetFormat] = useState<TargetFormat>('image/webp');
  const [quality, setQuality] = useState<number>(90);
  const [jpegBgColor, setJpegBgColor] = useState<string>('#FFFFFF');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [globalError, setGlobalError] = useState<string | null>(null);

  const handleFiles = (files: File[]) => {
    setGlobalError(null);
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    const newItems: ConvertItem[] = [];

    for (const file of files) {
      if (!validTypes.includes(file.type.toLowerCase())) {
        setGlobalError(`Format "${file.type}" tidak didukung. Harap pilih JPEG, PNG, atau WebP.`);
        continue;
      }

      newItems.push({
        id: Math.random().toString(36).substring(2, 9),
        file,
        previewUrl: URL.createObjectURL(file),
        status: 'idle'
      });
    }

    setItems(prev => [...prev, ...newItems]);
  };

  const removeItem = (id: string) => {
    setItems(prev => {
      const target = prev.find(i => i.id === id);
      if (target) {
        URL.revokeObjectURL(target.previewUrl);
        if (target.result?.url) URL.revokeObjectURL(target.result.url);
      }
      return prev.filter(i => i.id !== id);
    });
  };

  const clearAll = () => {
    items.forEach(i => {
      URL.revokeObjectURL(i.previewUrl);
      if (i.result?.url) URL.revokeObjectURL(i.result.url);
    });
    setItems([]);
    setGlobalError(null);
  };

  const convertAll = async () => {
    if (items.length === 0) return;
    setIsProcessing(true);
    setGlobalError(null);

    const updated = [...items];

    for (let i = 0; i < updated.length; i++) {
      const item = updated[i];
      updated[i] = { ...item, status: 'processing', error: undefined };
      setItems([...updated]);

      try {
        const result = await convertImage(item.file, {
          targetFormat,
          quality: quality / 100,
          jpegBackgroundColor: jpegBgColor
        });
        updated[i] = { ...item, status: 'done', result };
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Gagal mengonversi file.';
        updated[i] = { ...item, status: 'error', error: msg };
      }
      setItems([...updated]);
    }

    setIsProcessing(false);
  };

  const downloadSingle = (item: ConvertItem) => {
    if (!item.result) return;
    const baseName = item.file.name.substring(0, item.file.name.lastIndexOf('.')) || item.file.name;
    downloadBlob(item.result.blob, `${baseName}.${item.result.extension}`);
  };

  const downloadAllZip = async () => {
    const doneItems = items.filter(i => i.status === 'done' && i.result);
    if (doneItems.length === 0) return;

    const zip = new JSZip();
    doneItems.forEach(item => {
      if (!item.result) return;
      const baseName = item.file.name.substring(0, item.file.name.lastIndexOf('.')) || item.file.name;
      zip.file(`${baseName}.${item.result.extension}`, item.result.blob);
    });

    const zipBlob = await zip.generateAsync({ type: 'blob' });
    downloadBlob(zipBlob, 'pakaitools-hasil-konversi.zip');
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

      <Dropzone
        multiple
        onFilesSelected={handleFiles}
        label="Pilih atau seret satu atau banyak gambar untuk dikonversi"
        hint="Konversi instan antar JPG, PNG, dan WebP"
      />

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
              Pilihan Konversi ({items.length} file)
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
                  <span>Unduh Semua (.ZIP)</span>
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
            {/* Target format */}
            <div>
              <label htmlFor="target-format-select" style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '8px' }}>
                Konversi Semua Ke Format:
              </label>
              <select
                id="target-format-select"
                value={targetFormat}
                onChange={(e) => setTargetFormat(e.target.value as TargetFormat)}
              >
                <option value="image/webp">WebP (.webp) — Modern & Sangat Ringan</option>
                <option value="image/png">PNG (.png) — Kualitas Lossless & Transparansi</option>
                <option value="image/jpeg">JPEG (.jpg) — Standar Kompatibilitas Tinggi</option>
              </select>
            </div>

            {/* If target is JPEG, offer background color */}
            {targetFormat === 'image/jpeg' ? (
              <div>
                <label htmlFor="bg-color-picker" style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '8px' }}>
                  Warna Latar untuk Transparansi
                </label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <input
                    id="bg-color-picker"
                    type="color"
                    value={jpegBgColor}
                    onChange={(e) => setJpegBgColor(e.target.value)}
                    style={{ width: '40px', height: '36px', padding: 0, cursor: 'pointer', border: '1px solid var(--border-color)', borderRadius: '4px' }}
                  />
                  <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                    JPEG tidak mendukung transparansi; area transparan akan diisi warna ini ({jpegBgColor}).
                  </span>
                </div>
              </div>
            ) : (
              <div>
                <label htmlFor="quality-convert" style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '8px' }}>
                  Kualitas Kompresi: {quality}%
                </label>
                <input
                  id="quality-convert"
                  type="range"
                  min="50"
                  max="100"
                  value={quality}
                  onChange={(e) => setQuality(Number(e.target.value))}
                  style={{ width: '100%', accentColor: 'var(--accent-primary)' }}
                />
              </div>
            )}
          </div>

          <button
            type="button"
            className="btn btn-primary"
            onClick={convertAll}
            disabled={isProcessing}
            style={{ width: '100%', height: '44px', fontSize: '0.9375rem' }}
          >
            {isProcessing ? (
              <>
                <RefreshCw size={16} className="animate-spin" />
                <span>Sedang Mengonversi File...</span>
              </>
            ) : (
              <>
                <RefreshCw size={16} />
                <span>Mulai Konversi Format</span>
              </>
            )}
          </button>
        </div>
      )}

      {/* File List */}
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
                    Format Awal: {item.file.type.split('/')[1]?.toUpperCase() || 'FILE'} · {formatBytes(item.file.size)}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
                {item.status === 'idle' && <span className="badge">Siap</span>}
                {item.status === 'processing' && <span className="badge badge-accent">Mengonversi...</span>}
                {item.status === 'error' && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--error)', fontSize: '0.8125rem' }}>
                    <AlertCircle size={15} />
                    <span>{item.error || 'Gagal'}</span>
                  </div>
                )}

                {item.status === 'done' && item.result && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ textAlign: 'right', fontSize: '0.8125rem' }} className="tabular-nums">
                      <div style={{ fontWeight: 600, color: 'var(--accent-primary)' }}>
                        Menjadi {item.result.extension.toUpperCase()}
                      </div>
                      <div style={{ color: 'var(--text-secondary)' }}>
                        {formatBytes(item.result.outputSize)}
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
