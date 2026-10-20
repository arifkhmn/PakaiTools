export type TargetFormat = 'image/jpeg' | 'image/png' | 'image/webp';

export interface ConverterOptions {
  targetFormat: TargetFormat;
  quality: number; // 0.1 to 1.0 (for JPEG & WebP)
  jpegBackgroundColor?: string; // default #FFFFFF
}

export interface ConvertedResult {
  blob: Blob;
  url: string;
  originalSize: number;
  outputSize: number;
  extension: string;
  mimeType: string;
}

export function getExtensionFromMime(mime: string): string {
  switch (mime) {
    case 'image/jpeg':
    case 'image/jpg':
      return 'jpg';
    case 'image/png':
      return 'png';
    case 'image/webp':
      return 'webp';
    default:
      return 'bin';
  }
}

export async function convertImage(file: File, options: ConverterOptions): Promise<ConvertedResult> {
  const supportedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  if (!supportedTypes.includes(file.type.toLowerCase())) {
    throw new Error(`Format file "${file.type || 'tidak dikenal'}" tidak didukung.`);
  }

  const objectUrl = URL.createObjectURL(file);
  const img = new Image();

  try {
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = () => reject(new Error('Gagal membaca gambar. File mungkin rusak atau korup.'));
      img.src = objectUrl;
    });

    const canvas = document.createElement('canvas');
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Browser tidak mendukung konteks rendering Canvas 2D.');
    }

    // Handle transparency fill for JPEG
    if (options.targetFormat === 'image/jpeg') {
      ctx.fillStyle = options.jpegBackgroundColor || '#FFFFFF';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    ctx.drawImage(img, 0, 0);

    const blob = await new Promise<Blob>((resolve, reject) => {
      const qualityParam = options.targetFormat === 'image/png' ? undefined : options.quality;
      canvas.toBlob(
        (b) => {
          if (b) resolve(b);
          else reject(new Error('Gagal mengekspor format kanvas baru.'));
        },
        options.targetFormat,
        qualityParam
      );
    });

    return {
      blob,
      url: URL.createObjectURL(blob),
      originalSize: file.size,
      outputSize: blob.size,
      extension: getExtensionFromMime(options.targetFormat),
      mimeType: options.targetFormat
    };
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}
