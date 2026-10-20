import React, { useState, useRef } from 'react';
import ReactCrop, { type Crop, type PixelCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { Download, Trash2, Crop as CropIcon, Image as ImageIcon } from 'lucide-react';
import { ToolLayout } from '../../components/layout/ToolLayout';
import { Dropzone } from '../../components/tools/Dropzone';
import { StatusMessage } from '../../components/tools/StatusMessage';
import { TOOLS } from '../../data/tools';
import { formatBytes, downloadBlob } from '../../lib/format';

type AspectChoice = 'free' | '1:1' | '4:5' | '16:9' | '9:16';

export const ImageCropperPage: React.FC = () => {
  const tool = TOOLS.find(t => t.id === 'image-cropper')!;

  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const [aspectChoice, setAspectChoice] = useState<AspectChoice>('free');
  const [aspect, setAspect] = useState<number | undefined>(undefined);
  const [exportFormat, setExportFormat] = useState<'image/png' | 'image/jpeg' | 'image/webp'>('image/png');
  const [quality, setQuality] = useState<number>(90);

  const [croppedBlob, setCroppedBlob] = useState<Blob | null>(null);
  const [croppedUrl, setCroppedUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const imgRef = useRef<HTMLImageElement>(null);

  const handleFile = (files: File[]) => {
    if (files.length === 0) return;
    const file = files[0];

    const valid = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!valid.includes(file.type.toLowerCase())) {
      setErrorMessage(`Format file "${file.type}" tidak didukung. Harap pilih JPEG, PNG, atau WebP.`);
      return;
    }

    if (imageSrc) URL.revokeObjectURL(imageSrc);
    if (croppedUrl) URL.revokeObjectURL(croppedUrl);

    setImageSrc(URL.createObjectURL(file));
    setCroppedBlob(null);
    setCroppedUrl(null);
    setErrorMessage(null);
    setCrop(undefined);
    setCompletedCrop(undefined);
  };

  const onImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const { width, height } = e.currentTarget;
    // Set initial center crop
    const minSide = Math.min(width, height);
    const initialCrop: PixelCrop = {
      unit: 'px',
      width: minSide * 0.8,
      height: minSide * 0.8,
      x: (width - minSide * 0.8) / 2,
      y: (height - minSide * 0.8) / 2
    };
    setCrop(initialCrop);
    setCompletedCrop(initialCrop);
  };

  const handleAspectChange = (choice: AspectChoice) => {
    setAspectChoice(choice);
    switch (choice) {
      case '1:1':
        setAspect(1);
        break;
      case '4:5':
        setAspect(4 / 5);
        break;
      case '16:9':
        setAspect(16 / 9);
        break;
      case '9:16':
        setAspect(9 / 16);
        break;
      case 'free':
      default:
        setAspect(undefined);
        break;
    }
  };

  const generateCroppedImage = async () => {
    if (!completedCrop || !imgRef.current) {
      setErrorMessage('Tentukan area potong (crop) terlebih dahulu.');
      return;
    }

    const image = imgRef.current;
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      setErrorMessage('Browser tidak mendukung konteks rendering Canvas 2D.');
      return;
    }

    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;

    canvas.width = Math.floor(completedCrop.width * scaleX);
    canvas.height = Math.floor(completedCrop.height * scaleY);

    if (canvas.width <= 0 || canvas.height <= 0) {
      setErrorMessage('Dimensi area potong tidak valid.');
      return;
    }

    setIsProcessing(true);
    setErrorMessage(null);

    ctx.imageSmoothingQuality = 'high';

    const cropX = completedCrop.x * scaleX;
    const cropY = completedCrop.y * scaleY;
    const cropWidth = completedCrop.width * scaleX;
    const cropHeight = completedCrop.height * scaleY;

    if (exportFormat === 'image/jpeg') {
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    ctx.drawImage(
      image,
      cropX,
      cropY,
      cropWidth,
      cropHeight,
      0,
      0,
      canvas.width,
      canvas.height
    );

    canvas.toBlob(
      (blob) => {
        setIsProcessing(false);
        if (!blob) {
          setErrorMessage('Gagal memproses pemotongan gambar.');
          return;
        }
        if (croppedUrl) URL.revokeObjectURL(croppedUrl);
        setCroppedBlob(blob);
        setCroppedUrl(URL.createObjectURL(blob));
      },
      exportFormat,
      exportFormat === 'image/png' ? undefined : quality / 100
    );
  };

  const clearSelection = () => {
    if (imageSrc) URL.revokeObjectURL(imageSrc);
    if (croppedUrl) URL.revokeObjectURL(croppedUrl);
    setImageSrc(null);
    setCroppedBlob(null);
    setCroppedUrl(null);
    setErrorMessage(null);
  };

  const handleDownload = () => {
    if (!croppedBlob) return;
    const ext = exportFormat === 'image/jpeg' ? 'jpg' : exportFormat === 'image/webp' ? 'webp' : 'png';
    downloadBlob(croppedBlob, `pakaitools-crop.${ext}`);
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

      {!imageSrc ? (
        <Dropzone
          onFilesSelected={handleFile}
          label="Pilih atau seret gambar yang ingin dipotong (crop)"
          hint="Mendukung format JPEG, PNG, dan WebP"
        />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
          {/* Crop Area Column */}
          <div className="panel">
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '16px',
              paddingBottom: '12px',
              borderBottom: '1px solid var(--border-color)'
            }}>
              <div>
                <h2 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                  Sesuaikan Area Potong
                </h2>
                <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                  Tarik sudut atau geser kotak seleksi
                </div>
              </div>
              <button
                type="button"
                className="btn btn-outline btn-sm"
                onClick={clearSelection}
              >
                <Trash2 size={14} color="var(--error)" />
                <span>Ganti Gambar</span>
              </button>
            </div>

            {/* Aspect Ratio Selector */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: '8px' }}>
                Pilihan Rasio Aspek:
              </label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {[
                  { id: 'free', label: 'Bebas (Freeform)' },
                  { id: '1:1', label: '1:1 (Persegi)' },
                  { id: '4:5', label: '4:5 (Portrait IG)' },
                  { id: '16:9', label: '16:9 (Landscape / YT)' },
                  { id: '9:16', label: '9:16 (Story / Reels)' }
                ].map(r => (
                  <button
                    key={r.id}
                    type="button"
                    className={`btn btn-sm ${aspectChoice === r.id ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => handleAspectChange(r.id as AspectChoice)}
                  >
                    {r.label}
                  </button>
                ))}
              </div>
            </div>

            {/* The Image Crop Workspace */}
            <div style={{
              maxHeight: '440px',
              overflow: 'auto',
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-sm)',
              padding: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '20px'
            }}>
              <ReactCrop
                crop={crop}
                onChange={c => setCrop(c)}
                onComplete={c => setCompletedCrop(c)}
                aspect={aspect}
              >
                <img
                  ref={imgRef}
                  src={imageSrc}
                  alt="Area crop"
                  onLoad={onImageLoad}
                  style={{ maxWidth: '100%', maxHeight: '400px', display: 'block' }}
                />
              </ReactCrop>
            </div>

            {/* Export Settings */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' }}>
              <div>
                <label htmlFor="crop-format" style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 500, marginBottom: '6px' }}>
                  Format Ekspor
                </label>
                <select
                  id="crop-format"
                  value={exportFormat}
                  onChange={(e) => setExportFormat(e.target.value as any)}
                >
                  <option value="image/png">PNG (.png)</option>
                  <option value="image/jpeg">JPEG (.jpg)</option>
                  <option value="image/webp">WebP (.webp)</option>
                </select>
              </div>

              <div>
                <label htmlFor="crop-quality" style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 500, marginBottom: '6px' }}>
                  Kualitas: {quality}%
                </label>
                <input
                  id="crop-quality"
                  type="range"
                  min="50"
                  max="100"
                  value={quality}
                  onChange={(e) => setQuality(Number(e.target.value))}
                  disabled={exportFormat === 'image/png'}
                  style={{ accentColor: 'var(--accent-primary)', width: '100%' }}
                />
              </div>
            </div>

            <button
              type="button"
              className="btn btn-primary"
              onClick={generateCroppedImage}
              disabled={isProcessing}
              style={{ width: '100%', height: '42px' }}
            >
              <CropIcon size={15} />
              <span>{isProcessing ? 'Memotong Gambar...' : 'Terapkan & Potong Gambar'}</span>
            </button>
          </div>

          {/* Result Column */}
          <div className="panel" style={{ display: 'flex', flexDirection: 'column' }}>
            <h2 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '16px' }}>
              Hasil Pemotongan
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
              {croppedUrl ? (
                <img
                  src={croppedUrl}
                  alt="Hasil crop"
                  style={{
                    maxWidth: '100%',
                    maxHeight: '340px',
                    objectFit: 'contain',
                    border: '1px solid var(--border-color)',
                    backgroundColor: '#FFFFFF'
                  }}
                />
              ) : (
                <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                  <ImageIcon size={44} strokeWidth={1.2} style={{ margin: '0 auto 10px auto' }} />
                  <div>Tentukan area seleksi lalu klik &quot;Terapkan & Potong Gambar&quot;</div>
                </div>
              )}
            </div>

            {croppedBlob && (
              <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid var(--border-color)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', fontSize: '0.875rem' }} className="tabular-nums">
                  <span style={{ color: 'var(--text-secondary)' }}>Ukuran File Hasil:</span>
                  <span style={{ fontWeight: 600, color: 'var(--accent-primary)' }}>
                    {formatBytes(croppedBlob.size)}
                  </span>
                </div>

                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleDownload}
                  style={{ width: '100%', height: '42px' }}
                >
                  <Download size={16} />
                  <span>Unduh Gambar Hasil Potong</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </ToolLayout>
  );
};
