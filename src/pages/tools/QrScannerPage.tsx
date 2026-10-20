import React, { useState, useRef, useEffect } from 'react';
import jsQR from 'jsqr';
import { Camera, CameraOff, Upload, Copy, Check, ExternalLink, ShieldCheck, AlertCircle } from 'lucide-react';
import { ToolLayout } from '../../components/layout/ToolLayout';
import { StatusMessage } from '../../components/tools/StatusMessage';
import { Dropzone } from '../../components/tools/Dropzone';
import { TOOLS } from '../../data/tools';

export const QrScannerPage: React.FC = () => {
  const tool = TOOLS.find(t => t.id === 'qr-scanner')!;

  const [scanMode, setScanMode] = useState<'upload' | 'camera'>('upload');
  const [decodedData, setDecodedData] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Camera stream state
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Clean up camera stream on unmount or mode switch
  const stopCamera = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const startCamera = async () => {
    setErrorMessage(null);
    setDecodedData(null);

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setErrorMessage('Browser ini tidak mendukung akses kamera perangkat.');
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setIsCameraActive(true);
        scanCameraFrame();
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Izin akses kamera ditolak atau kamera sedang digunakan aplikasi lain.';
      setErrorMessage(msg);
      setIsCameraActive(false);
    }
  };

  const scanCameraFrame = () => {
    if (!videoRef.current || !isCameraActive) return;

    if (videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext('2d');

      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height, {
          inversionAttempts: 'dontInvert'
        });

        if (code && code.data) {
          setDecodedData(code.data);
          stopCamera();
          return;
        }
      }
    }

    animationFrameRef.current = requestAnimationFrame(scanCameraFrame);
  };

  const handleImageFile = (files: File[]) => {
    if (files.length === 0) return;
    const file = files[0];
    setErrorMessage(null);
    setDecodedData(null);

    const objectUrl = URL.createObjectURL(file);
    const img = new Image();

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        setErrorMessage('Gagal memproses konteks kanvas untuk pemindaian gambar.');
        return;
      }

      ctx.drawImage(img, 0, 0);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const code = jsQR(imageData.data, imageData.width, imageData.height, {
        inversionAttempts: 'attemptBoth'
      });

      if (code && code.data) {
        setDecodedData(code.data);
      } else {
        setErrorMessage('Tidak ditemukan QR code yang valid pada gambar yang diunggah. Pastikan QR code terlihat jelas dan memiliki pencahayaan cukup.');
      }
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      setErrorMessage('Gagal membaca gambar. File mungkin rusak.');
    };

    img.src = objectUrl;
  };

  const handleCopy = async () => {
    if (!decodedData) return;
    try {
      await navigator.clipboard.writeText(decodedData);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch {
      // ignore
    }
  };

  const isLikelyUrl = (text: string): boolean => {
    try {
      const url = new URL(text);
      return url.protocol === 'http:' || url.protocol === 'https:';
    } catch {
      return false;
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

      {/* Mode Switcher */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
        <button
          type="button"
          className={`btn ${scanMode === 'upload' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => {
            stopCamera();
            setScanMode('upload');
            setErrorMessage(null);
          }}
        >
          <Upload size={16} />
          <span>Unggah Gambar QR</span>
        </button>

        <button
          type="button"
          className={`btn ${scanMode === 'camera' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => {
            setScanMode('camera');
            setErrorMessage(null);
          }}
        >
          <Camera size={16} />
          <span>Scan dengan Kamera</span>
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
        {/* Scanner Work Area */}
        <div className="panel">
          <h2 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '16px' }}>
            {scanMode === 'upload' ? 'Pilih Gambar Berisi QR Code' : 'Pemindai Kamera Perangkat'}
          </h2>

          {scanMode === 'upload' ? (
            <Dropzone
              onFilesSelected={handleImageFile}
              label="Pilih atau seret foto QR code ke sini"
              hint="Format JPG, PNG, atau WebP"
            />
          ) : (
            <div>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '16px', lineHeight: 1.5 }}>
                Akses kamera hanya digunakan secara lokal di browser Anda untuk membaca barcode/QR code secara langsung tanpa menyimpan rekaman.
              </p>

              {!isCameraActive ? (
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={startCamera}
                  style={{ width: '100%', height: '44px' }}
                >
                  <Camera size={16} />
                  <span>Aktifkan Kamera & Mulai Scan</span>
                </button>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div style={{
                    position: 'relative',
                    width: '100%',
                    height: '280px',
                    backgroundColor: '#000000',
                    borderRadius: 'var(--radius-sm)',
                    overflow: 'hidden'
                  }}>
                    <video
                      ref={videoRef}
                      playsInline
                      muted
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                    <div style={{
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      transform: 'translate(-50%, -50%)',
                      width: '180px',
                      height: '180px',
                      border: '2px solid var(--accent-primary)',
                      borderRadius: '8px',
                      boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.4)'
                    }} />
                  </div>

                  <button
                    type="button"
                    className="btn btn-danger"
                    onClick={stopCamera}
                    style={{ width: '100%' }}
                  >
                    <CameraOff size={16} />
                    <span>Hentikan Kamera</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Scan Result Column */}
        <div className="panel" style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h2 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)' }}>
              Hasil Pembacaan QR
            </h2>
            {decodedData && (
              <button
                type="button"
                className="btn btn-outline btn-sm"
                onClick={handleCopy}
              >
                {isCopied ? <Check size={14} color="var(--success)" /> : <Copy size={14} />}
                <span>{isCopied ? 'Tersalin' : 'Salin Hasil'}</span>
              </button>
            )}
          </div>

          <div style={{
            flex: 1,
            minHeight: '220px',
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-sm)',
            padding: '16px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: decodedData ? 'flex-start' : 'center',
            alignItems: decodedData ? 'stretch' : 'center'
          }}>
            {decodedData ? (
              <div style={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between' }}>
                <div>
                  <div style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    fontSize: '0.75rem',
                    color: 'var(--accent-text)',
                    backgroundColor: 'var(--accent-subtle)',
                    padding: '2px 8px',
                    borderRadius: '4px',
                    marginBottom: '12px'
                  }}>
                    <ShieldCheck size={14} />
                    <span>Berhasil Didekode dengan Aman</span>
                  </div>

                  <div style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.875rem',
                    color: 'var(--text-primary)',
                    backgroundColor: '#FFFFFF',
                    border: '1px solid var(--border-color)',
                    padding: '12px',
                    borderRadius: 'var(--radius-sm)',
                    wordBreak: 'break-all',
                    whiteSpace: 'pre-wrap',
                    maxHeight: '180px',
                    overflowY: 'auto'
                  }}>
                    {decodedData}
                  </div>
                </div>

                {isLikelyUrl(decodedData) && (
                  <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid var(--border-color)' }}>
                    <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                      Isi QR terdeteksi berupa tautan web:
                    </div>
                    <a
                      href={decodedData}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-primary"
                      style={{ width: '100%', height: '40px' }}
                    >
                      <span>Buka Tautan di Tab Baru</span>
                      <ExternalLink size={15} />
                    </a>
                  </div>
                )}
              </div>
            ) : (
              <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                <AlertCircle size={36} strokeWidth={1.2} style={{ margin: '0 auto 10px auto' }} />
                <div>Belum ada data QR code yang dipindai</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </ToolLayout>
  );
};
