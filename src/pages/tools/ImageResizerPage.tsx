import React, { useState } from 'react';
import { Lock, Unlock, Download, RefreshCw, Trash2, AlertTriangle } from 'lucide-react';
import { ToolLayout } from '../../components/layout/ToolLayout';
import { Dropzone } from '../../components/tools/Dropzone';
import { StatusMessage } from '../../components/tools/StatusMessage';
import { TOOLS } from '../../data/tools';
import { formatBytes, downloadBlob } from '../../lib/format';
import { resizeImage, RESIZE_PRESETS } from '../../lib/imageResizer';
import type { ResizeResult } from '../../lib/imageResizer';

export const ImageResizerPage: React.FC = () => {
  const tool = TOOLS.find(t => t.id === 'image-resizer')!;

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [originalWidth, setOriginalWidth] = useState<number>(0);
  const [originalHeight, setOriginalHeight] = useState<number>(0);

  const [width, setWidth] = useState<number>(0);
  const [height, setHeight] = useState<number>(0);
  const [lockAspectRatio, setLockAspectRatio] = useState<boolean>(true);
  const [fitMode, setFitMode] = useState<'stretch' | 'contain' | 'cover'>('stretch');
  const [targetFormat, setTargetFormat] = useState<'original' | 'image/jpeg' | 'image/png' | 'image/webp'>('original');
  const [quality, setQuality] = useState<number>(90);
  const [percentage, setPercentage] = useState<number>(100);

  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<ResizeResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleFile = (files: File[]) => {
    if (files.length === 0) return;
    const file = files[0];

    const valid = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!valid.includes(file.type.toLowerCase())) {
      setErrorMessage(`Format "${file.type}" tidak didukung. Harap pilih JPEG, PNG, atau WebP.`);
      return;
    }

    if (previewUrl) URL.revokeObjectURL(previewUrl);
    if (result?.url) URL.revokeObjectURL(result.url);

    setErrorMessage(null);
    setResult(null);
    setSelectedFile(file);

    const objUrl = URL.createObjectURL(file);
    setPreviewUrl(objUrl);

    const img = new Image();
    img.onload = () => {
      setOriginalWidth(img.naturalWidth);
      setOriginalHeight(img.naturalHeight);
      setWidth(img.naturalWidth);
      setHeight(img.naturalHeight);
      setPercentage(100);
    };
    img.src = objUrl;
  };

  const handleWidthChange = (newWidth: number) => {
    setWidth(newWidth);
    if (lockAspectRatio && originalWidth > 0) {
      const calculatedHeight = Math.round((newWidth * originalHeight) / originalWidth);
      setHeight(calculatedHeight);
      setPercentage(Math.round((newWidth / originalWidth) * 100));
    }
  };

  const handleHeightChange = (newHeight: number) => {
    setHeight(newHeight);
    if (lockAspectRatio && originalHeight > 0) {
      const calculatedWidth = Math.round((newHeight * originalWidth) / originalHeight);
      setWidth(calculatedWidth);
      setPercentage(Math.round((calculatedWidth / originalWidth) * 100));
    }
  };

  const applyPercentage = (pct: number) => {
    setPercentage(pct);
    if (originalWidth > 0 && originalHeight > 0) {
      setWidth(Math.round((originalWidth * pct) / 100));
      setHeight(Math.round((originalHeight * pct) / 100));
    }
  };

  const applyPreset = (presetWidth: number, presetHeight: number) => {
    setWidth(presetWidth);
    setHeight(presetHeight);
    setLockAspectRatio(false); // Presets may have different aspect ratios
    if (originalWidth > 0) {
      setPercentage(Math.round((presetWidth / originalWidth) * 100));
    }
  };

  const resetToOriginal = () => {
    setWidth(originalWidth);
    setHeight(originalHeight);
    setPercentage(100);
    setLockAspectRatio(true);
    setErrorMessage(null);
    setResult(null);
  };

  const clearSelection = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    if (result?.url) URL.revokeObjectURL(result.url);
    setSelectedFile(null);
    setPreviewUrl(null);
    setResult(null);
    setErrorMessage(null);
  };

  const handleResize = async () => {
    if (!selectedFile) return;

    if (width <= 0 || height <= 0) {
      setErrorMessage('Lebar dan tinggi gambar harus lebih besar dari 0 piksel.');
      return;
    }

    if (width > 8192 || height > 8192) {
      setErrorMessage('Dimensi melebihi batas maksimum 8192 x 8192 piksel demi mencegah crash memori browser.');
      return;
    }

    setIsProcessing(true);
    setErrorMessage(null);

    try {
      const res = await resizeImage(selectedFile, {
        width,
        height,
        fitMode,
        format: targetFormat,
        quality: quality / 100
      });
      setResult(res);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Terjadi kegagalan saat mengubah ukuran gambar.';
      setErrorMessage(msg);
    } finally {
      setIsProcessing(false);
    }
  };

  const isUpscaling = width > originalWidth || height > originalHeight;

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
          label="Pilih atau seret gambar yang ingin diubah ukurannya"
          hint="Mendukung format JPEG, PNG, dan WebP"
        />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
          {/* Controls Column */}
          <div className="panel">
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '20px',
              paddingBottom: '12px',
              borderBottom: '1px solid var(--border-color)'
            }}>
              <div>
                <h2 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                  Dimensi & Pengaturan
                </h2>
                <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }} className="tabular-nums">
                  Ukuran Asli: {originalWidth} × {originalHeight} px ({formatBytes(selectedFile.size)})
                </div>
              </div>
              <button
                type="button"
                className="btn btn-outline btn-sm"
                onClick={clearSelection}
              >
                <Trash2 size={14} color="var(--error)" />
                <span>Ganti File</span>
              </button>
            </div>

            {/* Percentage Scale Buttons */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: '8px' }}>
                Skala Cepat Persentase:
              </label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {[25, 50, 75, 100, 150, 200].map((pct) => (
                  <button
                    key={pct}
                    type="button"
                    className={`btn btn-sm ${percentage === pct ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => applyPercentage(pct)}
                  >
                    {pct}%
                  </button>
                ))}
              </div>
            </div>

            {/* Width and Height Inputs */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: '12px', alignItems: 'center', marginBottom: '20px' }}>
              <div>
                <label htmlFor="width-input" style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 500, marginBottom: '6px' }}>
                  Lebar (px)
                </label>
                <input
                  id="width-input"
                  type="number"
                  min="1"
                  max="8192"
                  value={width || ''}
                  onChange={(e) => handleWidthChange(parseInt(e.target.value) || 0)}
                  className="tabular-nums"
                />
              </div>

              <div style={{ paddingTop: '22px' }}>
                <button
                  type="button"
                  className={`btn btn-sm ${lockAspectRatio ? 'btn-primary' : 'btn-outline'}`}
                  onClick={() => setLockAspectRatio(!lockAspectRatio)}
                  title={lockAspectRatio ? 'Rasio Terkunci (Klik untuk melepas)' : 'Rasio Bebas (Klik untuk mengunci)'}
                  style={{ padding: '8px' }}
                >
                  {lockAspectRatio ? <Lock size={16} /> : <Unlock size={16} />}
                </button>
              </div>

              <div>
                <label htmlFor="height-input" style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 500, marginBottom: '6px' }}>
                  Tinggi (px)
                </label>
                <input
                  id="height-input"
                  type="number"
                  min="1"
                  max="8192"
                  value={height || ''}
                  onChange={(e) => handleHeightChange(parseInt(e.target.value) || 0)}
                  className="tabular-nums"
                />
              </div>
            </div>

            {/* Fit mode selector */}
            {!lockAspectRatio && (
              <div style={{ marginBottom: '20px' }}>
                <label htmlFor="fit-mode" style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 500, marginBottom: '6px' }}>
                  Mode Penyesuaian Aspek (Fit Mode):
                </label>
                <select
                  id="fit-mode"
                  value={fitMode}
                  onChange={(e) => setFitMode(e.target.value as any)}
                >
                  <option value="stretch">Regangkan Penuh (Stretch to fill)</option>
                  <option value="contain">Muat di Tengah dg Batas (Contain)</option>
                  <option value="cover">Penuhi Kanvas (Cover / Potong Sisi)</option>
                </select>
              </div>
            )}

            {/* Upscaling Warning */}
            {isUpscaling && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 12px',
                backgroundColor: 'var(--warning-bg)',
                border: '1px solid #FEDF89',
                borderRadius: 'var(--radius-sm)',
                color: 'var(--warning)',
                fontSize: '0.8125rem',
                marginBottom: '20px'
              }}>
                <AlertTriangle size={16} style={{ flexShrink: 0 }} />
                <span>
                  Perhatian: Dimensi baru lebih besar dari foto asli (upscaling). Hasil gambar mungkin terlihat sedikit pecah atau buram.
                </span>
              </div>
            )}

            {/* Social Media & Common Presets */}
            <div style={{ marginBottom: '20px' }}>
              <label htmlFor="preset-select" style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 500, marginBottom: '6px' }}>
                Gunakan Preset Siap Pakai:
              </label>
              <select
                id="preset-select"
                defaultValue=""
                onChange={(e) => {
                  if (e.target.value) {
                    const [w, h] = e.target.value.split('x').map(Number);
                    applyPreset(w, h);
                  }
                }}
              >
                <option value="" disabled>Pilih Preset (Instagram, YouTube, Pas Foto)...</option>
                {RESIZE_PRESETS.map((p, idx) => (
                  <option key={idx} value={`${p.width}x${p.height}`}>
                    {p.name} ({p.width} × {p.height} px)
                  </option>
                ))}
              </select>
            </div>

            {/* Format and Quality */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '24px' }}>
              <div>
                <label htmlFor="format-resize" style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 500, marginBottom: '6px' }}>
                  Format Output
                </label>
                <select
                  id="format-resize"
                  value={targetFormat}
                  onChange={(e) => setTargetFormat(e.target.value as any)}
                >
                  <option value="original">Format Asli</option>
                  <option value="image/png">PNG</option>
                  <option value="image/jpeg">JPEG</option>
                  <option value="image/webp">WebP</option>
                </select>
              </div>

              <div>
                <label htmlFor="quality-resize" style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 500, marginBottom: '6px' }}>
                  Kualitas: {quality}%
                </label>
                <input
                  id="quality-resize"
                  type="range"
                  min="50"
                  max="100"
                  value={quality}
                  onChange={(e) => setQuality(Number(e.target.value))}
                  style={{ accentColor: 'var(--accent-primary)', width: '100%' }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleResize}
                disabled={isProcessing}
                style={{ flex: 1, height: '42px' }}
              >
                <RefreshCw size={15} />
                <span>{isProcessing ? 'Memproses...' : 'Ubah Ukuran Sekarang'}</span>
              </button>
              <button
                type="button"
                className="btn btn-outline"
                onClick={resetToOriginal}
                disabled={isProcessing}
              >
                Reset
              </button>
            </div>
          </div>

          {/* Preview & Result Column */}
          <div className="panel" style={{ display: 'flex', flexDirection: 'column' }}>
            <h2 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '16px' }}>
              Pratinjau Hasil
            </h2>

            <div style={{
              flex: 1,
              minHeight: '260px',
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-sm)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '16px',
              overflow: 'hidden'
            }}>
              {result ? (
                <img
                  src={result.url}
                  alt="Hasil resize"
                  style={{
                    maxWidth: '100%',
                    maxHeight: '340px',
                    objectFit: 'contain',
                    border: '1px solid var(--border-color)'
                  }}
                />
              ) : previewUrl ? (
                <img
                  src={previewUrl}
                  alt="Pratinjau asli"
                  style={{
                    maxWidth: '100%',
                    maxHeight: '340px',
                    objectFit: 'contain',
                    border: '1px solid var(--border-color)'
                  }}
                />
              ) : null}
            </div>

            {result ? (
              <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid var(--border-color)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', fontSize: '0.875rem' }} className="tabular-nums">
                  <span style={{ color: 'var(--text-secondary)' }}>Hasil Dimensi:</span>
                  <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                    {result.width} × {result.height} px
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px', fontSize: '0.875rem' }} className="tabular-nums">
                  <span style={{ color: 'var(--text-secondary)' }}>Ukuran File Baru:</span>
                  <span style={{ fontWeight: 600, color: 'var(--accent-primary)' }}>
                    {formatBytes(result.size)}
                  </span>
                </div>

                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => {
                    const ext = result.mimeType.split('/')[1] === 'jpeg' ? 'jpg' : result.mimeType.split('/')[1];
                    downloadBlob(result.blob, `resized-${result.width}x${result.height}.${ext}`);
                  }}
                  style={{ width: '100%', height: '42px' }}
                >
                  <Download size={16} />
                  <span>Unduh Gambar ({result.width}×{result.height} px)</span>
                </button>
              </div>
            ) : (
              <div style={{ marginTop: '16px', fontSize: '0.8125rem', color: 'var(--text-muted)', textAlign: 'center' }}>
                Tekan tombol &quot;Ubah Ukuran Sekarang&quot; untuk memproses dan mengunduh gambar.
              </div>
            )}
          </div>
        </div>
      )}
    </ToolLayout>
  );
};
