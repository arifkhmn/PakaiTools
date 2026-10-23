export function formatBytes(bytes: number, decimals = 1): string {
  if (bytes === 0) return '0 B';
  if (!Number.isFinite(bytes) || bytes < 0) return '0 B';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));
  const safeI = Math.min(i, sizes.length - 1);

  return `${parseFloat((bytes / Math.pow(k, safeI)).toFixed(dm))} ${sizes[safeI]}`;
}

export function formatNumber(num: number): string {
  return new Intl.NumberFormat('id-ID').format(num);
}

/**
 * Checks if the current browser environment is an in-app WebView
 * (such as WhatsApp, Instagram, Facebook, TikTok, Line, etc.)
 */
export function isInAppBrowser(): boolean {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') return false;
  const ua = navigator.userAgent || navigator.vendor || '';
  return /FBAN|FBAV|Instagram|WhatsApp|Line\/|Twitter|Snapchat|MicroMessenger|TikTok|Threads/i.test(ua);
}

/**
 * Downloads a Blob reliably across desktop, mobile browsers, iOS Safari, and WebViews.
 */
export async function downloadBlob(blob: Blob, filename: string): Promise<void> {
  let mimeType = blob.type;
  if (!mimeType || mimeType === 'application/octet-stream') {
    const lowerName = filename.toLowerCase();
    if (lowerName.endsWith('.docx')) {
      mimeType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
    } else if (lowerName.endsWith('.pdf')) {
      mimeType = 'application/pdf';
    } else if (lowerName.endsWith('.zip')) {
      mimeType = 'application/zip';
    } else if (lowerName.endsWith('.jpg') || lowerName.endsWith('.jpeg')) {
      mimeType = 'image/jpeg';
    } else if (lowerName.endsWith('.png')) {
      mimeType = 'image/png';
    } else if (lowerName.endsWith('.webp')) {
      mimeType = 'image/webp';
    } else {
      mimeType = 'application/octet-stream';
    }
  }
  const safeBlob = new Blob([blob], { type: mimeType });

  const inApp = isInAppBrowser();

  // Primary standard direct file download via temporary <a> element
  // Directly downloads the file with the exact filename extension (.docx, .jpg, .pdf)
  // instead of invoking the Android Share Sheet which renames OpenXML docs to .zip.
  const url = URL.createObjectURL(safeBlob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.rel = 'noopener';
  link.style.display = 'none';
  document.body.appendChild(link);

  link.click();

  // In-App Browser fallback prompt if the WebView quietly suppressed the download
  if (inApp) {
    setTimeout(() => {
      const notice = document.getElementById('in-app-browser-alert');
      if (!notice) {
        alert(
          `File "${filename}" telah disiapkan!\n\nJika unduhan tidak muncul di HP Anda, buka link web ini melalui aplikasi Google Chrome atau Safari (ketuk titik tiga ⋮ di pojok atas lalu "Buka di Browser").`
        );
      }
    }, 800);
  }

  // Generous revoke timer (60 seconds) so mobile OS Download Managers
  // have ample time to read the blob data before cleanup
  setTimeout(() => {
    if (document.body.contains(link)) {
      document.body.removeChild(link);
    }
    URL.revokeObjectURL(url);
  }, 60000);
}

/**
 * Downloads a data URL reliably by converting to Blob
 */
export function downloadDataUrl(dataUrl: string, filename: string): void {
  try {
    const parts = dataUrl.split(',');
    const mimeMatch = parts[0].match(/:(.*?);/);
    const mime = mimeMatch ? mimeMatch[1] : 'application/octet-stream';
    const binary = atob(parts[1]);
    const len = binary.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    const blob = new Blob([bytes], { type: mime });
    downloadBlob(blob, filename);
  } catch {
    // Direct fallback if base64 conversion fails
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = filename;
    link.rel = 'noopener';
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    setTimeout(() => {
      if (document.body.contains(link)) {
        document.body.removeChild(link);
      }
    }, 60000);
  }
}
