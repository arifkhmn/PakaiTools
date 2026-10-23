import JSZip from 'jszip';

export interface FaviconItem {
  name: string;
  size: number;
  blob: Blob;
  url: string;
  label: string;
}

export interface FaviconPackageResult {
  items: FaviconItem[];
  icoBlob: Blob;
  icoUrl: string;
  zipBlob: Blob;
  htmlCode: string;
}

// Generate genuine binary Windows ICO file containing PNG streams (supported by all modern browsers/OS)
function buildIcoFile(pngItems: { size: number; buffer: Uint8Array }[]): Blob {
  const count = pngItems.length;
  const headerSize = 6;
  const entrySize = 16;
  let offset = headerSize + count * entrySize;

  const totalLength = offset + pngItems.reduce((acc, curr) => acc + curr.buffer.length, 0);
  const buffer = new ArrayBuffer(totalLength);
  const view = new DataView(buffer);

  // ICONDIR header
  view.setUint16(0, 0, true); // Reserved (0)
  view.setUint16(2, 1, true); // Resource Type (1 = Icon)
  view.setUint16(4, count, true); // Number of images

  // ICONDIRENTRY array
  for (let i = 0; i < count; i++) {
    const item = pngItems[i];
    const entryOffset = headerSize + i * entrySize;
    const widthByte = item.size >= 256 ? 0 : item.size;
    const heightByte = item.size >= 256 ? 0 : item.size;

    view.setUint8(entryOffset + 0, widthByte);
    view.setUint8(entryOffset + 1, heightByte);
    view.setUint8(entryOffset + 2, 0); // Color count (0 = >=8bpp)
    view.setUint8(entryOffset + 3, 0); // Reserved
    view.setUint16(entryOffset + 4, 1, true); // Color planes
    view.setUint16(entryOffset + 6, 32, true); // Bits per pixel (32-bit RGBA)
    view.setUint32(entryOffset + 8, item.buffer.length, true); // Image data size in bytes
    view.setUint32(entryOffset + 12, offset, true); // Image data offset

    // Copy PNG bytes into offset
    new Uint8Array(buffer, offset, item.buffer.length).set(item.buffer);
    offset += item.buffer.length;
  }

  return new Blob([buffer], { type: 'image/x-icon' });
}

export async function generateFaviconPackage(file: File): Promise<FaviconPackageResult> {
  const objectUrl = URL.createObjectURL(file);
  const img = new Image();

  try {
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = () => reject(new Error('Gagal memuat gambar untuk pembuatan favicon.'));
      img.src = objectUrl;
    });

    const targetSizes = [
      { size: 16, name: 'favicon-16x16.png', label: 'Tab Browser Kecil (16x16)' },
      { size: 32, name: 'favicon-32x32.png', label: 'Tab Browser Standar (32x32)' },
      { size: 48, name: 'favicon-48x48.png', label: 'Windows Shortcut (48x48)' },
      { size: 64, name: 'favicon-64x64.png', label: 'High DPI Icon (64x64)' },
      { size: 180, name: 'apple-touch-icon.png', label: 'Apple Touch Icon (180x180)' },
      { size: 192, name: 'android-chrome-192x192.png', label: 'Android Chrome (192x192)' },
      { size: 512, name: 'android-chrome-512x512.png', label: 'PWA Splash (512x512)' }
    ];

    const items: FaviconItem[] = [];
    const icoPngBuffers: { size: number; buffer: Uint8Array }[] = [];

    for (const item of targetSizes) {
      const canvas = document.createElement('canvas');
      canvas.width = item.size;
      canvas.height = item.size;
      const ctx = canvas.getContext('2d');
      if (!ctx) continue;

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';

      // Square crop centered
      const minDim = Math.min(img.naturalWidth, img.naturalHeight);
      const sx = (img.naturalWidth - minDim) / 2;
      const sy = (img.naturalHeight - minDim) / 2;

      ctx.drawImage(img, sx, sy, minDim, minDim, 0, 0, item.size, item.size);

      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob((b) => {
          if (b) resolve(b);
          else reject(new Error(`Gagal menghasilkan ukuran ${item.size}px`));
        }, 'image/png');
      });

      items.push({
        name: item.name,
        size: item.size,
        blob,
        url: URL.createObjectURL(blob),
        label: item.label
      });

      // Include 16, 32, 48 in the multi-res ICO
      if ([16, 32, 48].includes(item.size)) {
        const arrayBuf = await blob.arrayBuffer();
        icoPngBuffers.push({
          size: item.size,
          buffer: new Uint8Array(arrayBuf)
        });
      }
    }

    // Build genuine binary .ICO
    const icoBlob = buildIcoFile(icoPngBuffers);
    const icoUrl = URL.createObjectURL(icoBlob);

    // Build zip file
    const zip = new JSZip();
    zip.file('favicon.ico', icoBlob);
    for (const item of items) {
      zip.file(item.name, item.blob);
    }

    // Manifest file
    const manifest = {
      name: "My Website",
      short_name: "Website",
      icons: [
        { src: "/android-chrome-192x192.png", sizes: "192x192", type: "image/png" },
        { src: "/android-chrome-512x512.png", sizes: "512x512", type: "image/png" }
      ],
      theme_color: "#ffffff",
      background_color: "#ffffff",
      display: "standalone"
    };
    zip.file('site.webmanifest', JSON.stringify(manifest, null, 2));

    const htmlCode = `<!-- Link Favicon di dalam tag <head> HTML kamu -->
<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">
<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">
<link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png">
<link rel="manifest" href="/site.webmanifest">
<link rel="shortcut icon" href="/favicon.ico">`;

    zip.file('README.txt', `Paket Favicon Dibuat oleh PakaiTools (https://pakaitools.id)\n\nSilakan letakkan semua file ikon di folder root publik website kamu (biasanya folder /public atau public_html), lalu tempelkan kode HTML berikut ke dalam bagian <head> file HTML kamu:\n\n${htmlCode}\n`);

    const zipBlob = await zip.generateAsync({ type: 'blob', mimeType: 'application/zip' });

    return {
      items,
      icoBlob,
      icoUrl,
      zipBlob,
      htmlCode
    };
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}
