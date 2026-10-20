export interface ResizePreset {
  name: string;
  width: number;
  height: number;
  category: 'social' | 'common';
}

export const RESIZE_PRESETS: ResizePreset[] = [
  { name: 'Instagram Persegi (1:1)', width: 1080, height: 1080, category: 'social' },
  { name: 'Instagram Portrait (4:5)', width: 1080, height: 1350, category: 'social' },
  { name: 'Instagram / WA Story (9:16)', width: 1080, height: 1920, category: 'social' },
  { name: 'YouTube Thumbnail (16:9)', width: 1280, height: 720, category: 'social' },
  { name: 'Twitter / X Banner', width: 1500, height: 500, category: 'social' },
  { name: 'Facebook Post', width: 1200, height: 630, category: 'social' },
  { name: 'Pas Foto 3x4 (300 DPI)', width: 354, height: 472, category: 'common' },
  { name: 'Pas Foto 4x6 (300 DPI)', width: 472, height: 709, category: 'common' },
  { name: 'Full HD (1080p)', width: 1920, height: 1080, category: 'common' },
  { name: 'HD (720p)', width: 1280, height: 720, category: 'common' }
];

export interface ResizeOptions {
  width: number;
  height: number;
  fitMode: 'stretch' | 'contain' | 'cover';
  format: 'original' | 'image/jpeg' | 'image/png' | 'image/webp';
  quality: number; // 0.1 to 1.0
  backgroundColor?: string;
}

export interface ResizeResult {
  blob: Blob;
  url: string;
  width: number;
  height: number;
  size: number;
  mimeType: string;
}

export async function resizeImage(file: File, options: ResizeOptions): Promise<ResizeResult> {
  const supportedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  if (!supportedTypes.includes(file.type.toLowerCase())) {
    throw new Error(`Format file "${file.type || 'tidak dikenal'}" belum didukung.`);
  }

  // Validate bounds
  if (options.width <= 0 || options.height <= 0 || !Number.isInteger(options.width) || !Number.isInteger(options.height)) {
    throw new Error('Lebar dan tinggi gambar harus berupa bilangan bulat positif.');
  }

  const MAX_DIMENSION = 8192;
  if (options.width > MAX_DIMENSION || options.height > MAX_DIMENSION) {
    throw new Error(`Dimensi maksimal yang diizinkan adalah ${MAX_DIMENSION} x ${MAX_DIMENSION} piksel.`);
  }

  const objectUrl = URL.createObjectURL(file);
  const img = new Image();

  try {
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = () => reject(new Error('Gagal memproses data gambar.'));
      img.src = objectUrl;
    });

    const canvas = document.createElement('canvas');
    canvas.width = options.width;
    canvas.height = options.height;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Browser tidak mendukung konteks rendering Canvas 2D.');
    }

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    let targetMime = options.format === 'original' ? file.type : options.format;
    if (targetMime === 'image/jpg') targetMime = 'image/jpeg';

    // If JPEG or background color specified, fill background
    if (targetMime === 'image/jpeg' || options.backgroundColor) {
      ctx.fillStyle = options.backgroundColor || '#FFFFFF';
      ctx.fillRect(0, 0, options.width, options.height);
    }

    if (options.fitMode === 'stretch') {
      ctx.drawImage(img, 0, 0, options.width, options.height);
    } else if (options.fitMode === 'contain') {
      const scale = Math.min(options.width / img.naturalWidth, options.height / img.naturalHeight);
      const w = Math.round(img.naturalWidth * scale);
      const h = Math.round(img.naturalHeight * scale);
      const x = Math.round((options.width - w) / 2);
      const y = Math.round((options.height - h) / 2);
      ctx.drawImage(img, x, y, w, h);
    } else if (options.fitMode === 'cover') {
      const scale = Math.max(options.width / img.naturalWidth, options.height / img.naturalHeight);
      const w = Math.round(img.naturalWidth * scale);
      const h = Math.round(img.naturalHeight * scale);
      const x = Math.round((options.width - w) / 2);
      const y = Math.round((options.height - h) / 2);
      ctx.drawImage(img, x, y, w, h);
    }

    const blob = await new Promise<Blob>((resolve, reject) => {
      const qualityParam = targetMime === 'image/png' ? undefined : options.quality;
      canvas.toBlob(
        (b) => {
          if (b) resolve(b);
          else reject(new Error('Gagal mengekspor kanvas hasil pengubahan ukuran.'));
        },
        targetMime,
        qualityParam
      );
    });

    return {
      blob,
      url: URL.createObjectURL(blob),
      width: options.width,
      height: options.height,
      size: blob.size,
      mimeType: targetMime
    };
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}
