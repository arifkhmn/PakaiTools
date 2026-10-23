import { jsPDF } from 'jspdf';
import mammoth from 'mammoth';
import { pdfjsLib } from './pdfWorkerSetup';

// --- Types ---

export interface ImageToPdfItem {
  id: string;
  file: File;
  dataUrl: string;
  width: number;
  height: number;
  name: string;
}

export interface ImageToPdfOptions {
  pageSize: 'a4' | 'letter' | 'fit';
  orientation: 'portrait' | 'landscape' | 'auto';
  margin: number; // in mm: 0, 10, 20
  quality: number; // 0.6 to 1.0
}

export interface CompressPdfOptions {
  level: 'super-extreme' | 'extreme' | 'recommended' | 'light';
  customScale?: number;
  customQuality?: number;
  onProgress?: (current: number, total: number) => void;
}

export interface PdfToDocxOptions {
  includeImages?: boolean;
  preserveFormatting?: boolean;
  pageBreakPerPage?: boolean;
  onProgress?: (current: number, total: number, message?: string) => void;
}

export interface DocxToPdfOptions {
  pageSize?: 'a4' | 'letter';
  margin?: number; // mm
  onProgress?: (status: string) => void;
}

// --- Image to PDF ---

const PAGE_DIMENSIONS_MM = {
  a4: { width: 210, height: 297 },
  letter: { width: 215.9, height: 279.4 }
};

export async function imagesToPdf(
  images: ImageToPdfItem[],
  options: ImageToPdfOptions,
  onProgress?: (current: number, total: number) => void
): Promise<{ blob: Blob; size: number; pageCount: number }> {
  if (images.length === 0) {
    throw new Error('Pilih minimal satu gambar untuk dikonversi ke PDF.');
  }

  // Helper to determine page size and orientation for an image
  const getPageConfig = (img: ImageToPdfItem) => {
    let orientation: 'portrait' | 'landscape' = 'portrait';
    if (options.orientation === 'auto') {
      orientation = img.width > img.height ? 'landscape' : 'portrait';
    } else {
      orientation = options.orientation;
    }

    if (options.pageSize === 'fit') {
      // Calculate mm from px (approx 72 dpi or 96 dpi standard, 0.264583 mm per px)
      const pxToMm = 0.264583;
      return {
        orientation,
        width: Math.max(50, Math.round(img.width * pxToMm)),
        height: Math.max(50, Math.round(img.height * pxToMm)),
        margin: 0
      };
    }

    const baseDim = PAGE_DIMENSIONS_MM[options.pageSize];
    const width = orientation === 'landscape' ? baseDim.height : baseDim.width;
    const height = orientation === 'landscape' ? baseDim.width : baseDim.height;

    return {
      orientation,
      width,
      height,
      margin: options.margin
    };
  };

  const firstConfig = getPageConfig(images[0]);
  const doc = new jsPDF({
    orientation: firstConfig.orientation,
    unit: 'mm',
    format: options.pageSize === 'fit' ? [firstConfig.width, firstConfig.height] : options.pageSize
  });

  for (let i = 0; i < images.length; i++) {
    const img = images[i];
    const config = getPageConfig(img);

    if (i > 0) {
      doc.addPage(
        options.pageSize === 'fit' ? [config.width, config.height] : options.pageSize,
        config.orientation
      );
    }

    const margin = config.margin;
    const availWidth = Math.max(10, config.width - margin * 2);
    const availHeight = Math.max(10, config.height - margin * 2);

    // Calculate aspect ratio
    const imgAspect = img.width / img.height;
    const availAspect = availWidth / availHeight;

    let renderW = availWidth;
    let renderH = availHeight;

    if (options.pageSize === 'fit') {
      renderW = config.width;
      renderH = config.height;
    } else {
      if (imgAspect > availAspect) {
        renderW = availWidth;
        renderH = availWidth / imgAspect;
      } else {
        renderH = availHeight;
        renderW = availHeight * imgAspect;
      }
    }

    const posX = margin + (availWidth - renderW) / 2;
    const posY = margin + (availHeight - renderH) / 2;

    doc.addImage(
      img.dataUrl,
      'JPEG',
      posX,
      posY,
      renderW,
      renderH,
      undefined,
      options.quality < 0.8 ? 'FAST' : 'MEDIUM'
    );

    if (onProgress) {
      onProgress(i + 1, images.length);
    }
  }

  const arrayBuffer = doc.output('arraybuffer');
  const blob = new Blob([arrayBuffer], { type: 'application/pdf' });

  return {
    blob,
    size: blob.size,
    pageCount: images.length
  };
}

// --- Compress PDF ---

export async function compressPdfDocument(
  pdfFile: File,
  options: CompressPdfOptions
): Promise<{
  blob: Blob;
  originalSize: number;
  compressedSize: number;
  pageCount: number;
  savedPercent: number;
}> {
  const fileBuffer = await pdfFile.arrayBuffer();
  const loadingTask = pdfjsLib.getDocument({
    data: fileBuffer,
    cMapUrl: `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/cmaps/`,
    cMapPacked: true,
    standardFontDataUrl: `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/standard_fonts/`
  });
  const pdfDoc = await loadingTask.promise;
  const numPages = pdfDoc.numPages;

  if (numPages === 0) {
    throw new Error('Dokumen PDF tidak memiliki halaman.');
  }

  // Optimized compression presets for genuine size reduction
  let scale = 0.95;
  let quality = 0.58;

  if (options.level === 'super-extreme') {
    scale = 0.65;
    quality = 0.28;
  } else if (options.level === 'extreme') {
    scale = 0.78;
    quality = 0.38;
  } else if (options.level === 'light') {
    scale = 1.30;
    quality = 0.78;
  }

  // Allow custom override
  if (options.customScale && options.customQuality) {
    scale = options.customScale;
    quality = options.customQuality;
  }

  // Get first page dimension to initialize jsPDF
  const firstPage = await pdfDoc.getPage(1);
  const firstViewport = firstPage.getViewport({ scale: 1.0 });

  const newDoc = new jsPDF({
    unit: 'pt',
    format: [firstViewport.width, firstViewport.height],
    orientation: firstViewport.width > firstViewport.height ? 'landscape' : 'portrait'
  });

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('Browser tidak mendukung Canvas 2D.');
  }

  for (let pageNum = 1; pageNum <= numPages; pageNum++) {
    const page = pageNum === 1 ? firstPage : await pdfDoc.getPage(pageNum);
    const unscaledViewport = page.getViewport({ scale: 1.0 });
    const renderViewport = page.getViewport({ scale });

    canvas.width = renderViewport.width;
    canvas.height = renderViewport.height;

    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Render page into canvas
    // Note: TypeScript might check RenderParameters compatibility with CanvasRenderingContext2D
    await page.render({
      canvasContext: ctx as unknown as CanvasRenderingContext2D,
      viewport: renderViewport
    }).promise;

    const imgData = canvas.toDataURL('image/jpeg', quality);

    if (pageNum > 1) {
      newDoc.addPage(
        [unscaledViewport.width, unscaledViewport.height],
        unscaledViewport.width > unscaledViewport.height ? 'landscape' : 'portrait'
      );
    }

    newDoc.addImage(
      imgData,
      'JPEG',
      0,
      0,
      unscaledViewport.width,
      unscaledViewport.height,
      undefined,
      'FAST'
    );

    if (options.onProgress) {
      options.onProgress(pageNum, numPages);
    }
  }

  const blob = newDoc.output('blob');
  const originalSize = pdfFile.size;
  const compressedSize = blob.size;
  const savedPercent = originalSize > compressedSize
    ? Math.max(0, Math.round(((originalSize - compressedSize) / originalSize) * 100))
    : 0;

  return {
    blob,
    originalSize,
    compressedSize,
    pageCount: numPages,
    savedPercent
  };
}

// --- PDF to Word (.docx) ---

export {
  convertPdfToDocx,
  inspectPdfDocument,
  type ConversionMode,
  type ConversionOptions,
  type ConversionProgress,
  type ConversionResult,
  type PdfInspectionResult,
  PasswordProtectedPdfError,
  CorruptedPdfError,
  ConversionCancelledError
} from './pdfDocxEngine';

import { convertPdfToDocx } from './pdfDocxEngine';




export async function pdfToDocx(
  pdfFile: File,
  options: PdfToDocxOptions = {}
): Promise<{ blob: Blob; wordCount: number; pageCount: number; tableCount?: number }> {
  const res = await convertPdfToDocx(pdfFile, {
    mode: 'layout_preserving',
    includeImages: options.includeImages !== false,
    preserveFormatting: options.preserveFormatting !== false,
    pageBreakPerPage: options.pageBreakPerPage !== false,
    onProgress: (p) => {
      if (options.onProgress) {
        options.onProgress(p.current, p.total, p.message);
      }
    }
  });

  return {
    blob: res.blob,
    wordCount: res.wordCount,
    pageCount: res.pageCount,
    tableCount: res.tableCount
  };
}

// --- Word (.docx) to PDF ---

export async function docxToPdf(
  docxFile: File,
  options: DocxToPdfOptions = {}
): Promise<{ blob: Blob; pageCount: number; htmlPreview: string }> {
  const arrayBuffer = await docxFile.arrayBuffer();
  
  if (options.onProgress) {
    options.onProgress('Membaca struktur dokumen Word...');
  }

  const result = await mammoth.convertToHtml({ arrayBuffer });
  const rawHtml = result.value;

  if (!rawHtml || !rawHtml.trim()) {
    throw new Error('Dokumen Word tidak memuat konten teks yang dapat dibaca.');
  }

  if (options.onProgress) {
    options.onProgress('Menyusun tata letak halaman PDF...');
  }

  // Create isolated container for rendering to PDF
  const container = document.createElement('div');
  container.style.position = 'fixed';
  container.style.left = '-9999px';
  container.style.top = '0';
  container.style.width = '794px'; // standard A4 width in px at 96 DPI
  container.style.padding = '48px';
  container.style.boxSizing = 'border-box';
  container.style.fontFamily = "'Times New Roman', Times, serif";
  container.style.fontSize = '14px';
  container.style.lineHeight = '1.6';
  container.style.color = '#111111';
  container.style.backgroundColor = '#FFFFFF';

  // Inject styles for headings, tables, blockquotes, lists
  const styledHtml = `
    <style>
      .docx-content h1 { font-size: 24px; margin-top: 20px; margin-bottom: 10px; color: #111; font-weight: bold; }
      .docx-content h2 { font-size: 20px; margin-top: 16px; margin-bottom: 8px; color: #222; font-weight: bold; }
      .docx-content h3 { font-size: 16px; margin-top: 12px; margin-bottom: 6px; color: #333; font-weight: bold; }
      .docx-content p { margin: 0 0 12px 0; text-align: justify; }
      .docx-content table { width: 100%; border-collapse: collapse; margin-bottom: 16px; }
      .docx-content th, .docx-content td { border: 1px solid #ccc; padding: 6px 10px; text-align: left; }
      .docx-content ul, .docx-content ol { margin: 0 0 12px 24px; padding: 0; }
      .docx-content li { margin-bottom: 4px; }
      .docx-content blockquote { border-left: 3px solid #ccc; margin: 12px 0; padding-left: 12px; font-style: italic; color: #555; }
    </style>
    <div class="docx-content">${rawHtml}</div>
  `;

  container.innerHTML = styledHtml;
  document.body.appendChild(container);

  try {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'pt',
      format: options.pageSize === 'letter' ? 'letter' : 'a4'
    });

    // Use jsPDF html method
    await new Promise<void>((resolve, reject) => {
      doc.html(container, {
        callback: () => {
          resolve();
        },
        x: 0,
        y: 0,
        width: 595.28, // A4 pt width
        windowWidth: 794,
        margin: [30, 30, 30, 30],
        autoPaging: 'text'
      }).catch(reject);
    });

    const pageCount = doc.getNumberOfPages();
    const pdfBuffer = doc.output('arraybuffer');
    const blob = new Blob([pdfBuffer], { type: 'application/pdf' });

    return {
      blob,
      pageCount,
      htmlPreview: rawHtml
    };
  } catch (renderError) {
    // In case doc.html encounters HTML canvas limitation, use clean fallback vector text generation
    const rawTextResult = await mammoth.extractRawText({ arrayBuffer });
    const text = rawTextResult.value;

    const fallbackDoc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const margin = 20;
    const pageWidth = 210;
    const pageHeight = 297;
    const maxLineWidth = pageWidth - margin * 2;
    const lineHeight = 6;
    let cursorY = margin;

    fallbackDoc.setFont('helvetica', 'normal');
    fallbackDoc.setFontSize(11);

    const paragraphs = text.split(/\n\s*\n/);

    for (let pIdx = 0; pIdx < paragraphs.length; pIdx++) {
      const paragraph = paragraphs[pIdx].trim();
      if (!paragraph) continue;

      const lines = fallbackDoc.splitTextToSize(paragraph, maxLineWidth);

      for (let lIdx = 0; lIdx < lines.length; lIdx++) {
        if (cursorY + lineHeight > pageHeight - margin) {
          fallbackDoc.addPage();
          cursorY = margin;
        }
        fallbackDoc.text(lines[lIdx], margin, cursorY);
        cursorY += lineHeight;
      }

      cursorY += 4; // Space between paragraphs
    }

    const pageCount = fallbackDoc.getNumberOfPages();
    const pdfBuffer = fallbackDoc.output('arraybuffer');
    const blob = new Blob([pdfBuffer], { type: 'application/pdf' });

    return {
      blob,
      pageCount,
      htmlPreview: rawHtml
    };
  } finally {
    if (document.body.contains(container)) {
      document.body.removeChild(container);
    }
  }
}
