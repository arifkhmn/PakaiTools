export interface CompressionOptions {
  quality: number; // 0.1 to 1.0
  format: 'original' | 'image/jpeg' | 'image/webp' | 'image/png';
  maxWidth?: number;
  maxHeight?: number;
}

export interface CompressionResult {
  blob: Blob;
  url: string;
  width: number;
  height: number;
  outputSize: number;
  savedBytes: number;
  savedPercent: number;
  isLarger: boolean;
  mimeType: string;
}

export async function compressImage(
  file: File,
  options: CompressionOptions
): Promise<CompressionResult> {
  // Validate MIME type
  const supportedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  if (!supportedTypes.includes(file.type.toLowerCase())) {
    throw new Error(`Format file "${file.type || 'tidak dikenal'}" belum didukung. Harap gunakan file JPG, PNG, atau WebP.`);
  }

  // Load image
  const objectUrl = URL.createObjectURL(file);
  const img = new Image();

  try {
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = () => reject(new Error('Gagal memproses data gambar. File mungkin rusak atau tidak valid.'));
      img.src = objectUrl;
    });

    let targetWidth = img.naturalWidth;
    let targetHeight = img.naturalHeight;

    if (options.maxWidth && targetWidth > options.maxWidth) {
      targetHeight = Math.round((targetHeight * options.maxWidth) / targetWidth);
      targetWidth = options.maxWidth;
    }
    if (options.maxHeight && targetHeight > options.maxHeight) {
      targetWidth = Math.round((targetWidth * options.maxHeight) / targetHeight);
      targetHeight = options.maxHeight;
    }

    const canvas = document.createElement('canvas');
    canvas.width = targetWidth;
    canvas.height = targetHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Browser tidak mendukung konteks rendering Canvas 2D.');
    }

    // Determine target format
    let targetMime = options.format === 'original' ? file.type : options.format;
    if (targetMime === 'image/jpg') targetMime = 'image/jpeg';

    // If target is JPEG and original had transparency, draw white background
    if (targetMime === 'image/jpeg') {
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, targetWidth, targetHeight);
    }

    ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

    // Export with quality
    const blob = await new Promise<Blob>((resolve, reject) => {
      // For PNG, browser canvas toBlob ignores quality argument
      const qualityParam = targetMime === 'image/png' ? undefined : options.quality;
      canvas.toBlob(
        (b) => {
          if (b) resolve(b);
          else reject(new Error('Gagal membuat file hasil kompresi dari kanvas.'));
        },
        targetMime,
        qualityParam
      );
    });

    const outputSize = blob.size;
    const originalSize = file.size;
    const savedBytes = originalSize - outputSize;
    const savedPercent = Math.max(0, Math.round((savedBytes / originalSize) * 100));
    const isLarger = outputSize > originalSize;

    const resultUrl = URL.createObjectURL(blob);

    return {
      blob,
      url: resultUrl,
      width: targetWidth,
      height: targetHeight,
      outputSize,
      savedBytes,
      savedPercent,
      isLarger,
      mimeType: targetMime
    };
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}
