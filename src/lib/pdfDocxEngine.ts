import {
  Document,
  Paragraph,
  TextRun,
  Packer,
  ImageRun,
  AlignmentType,
  SectionType,
  Table,
  TableRow,
  TableCell,
  WidthType,
  BorderStyle
} from 'docx';
import { pdfjsLib } from './pdfWorkerSetup';

// --- Interfaces & Types ---

export type ConversionMode = 'layout_preserving' | 'visual_fidelity';

export interface PdfInspectionResult {
  pageCount: number;
  totalWords: number;
  totalImages: number;
  hasSelectableText: boolean;
  isScanned: boolean;
  documentType: 'digital_text' | 'scanned' | 'mixed' | 'complex_layout';
  detectedColumns: number;
  detectedTablesEstimate: number;
  recommendedMode: ConversionMode;
  pageSizeLabel: string;
  isEncrypted?: boolean;
}

export interface ConversionProgress {
  stage: 'inspecting' | 'extracting' | 'analyzing' | 'building' | 'packing';
  current: number;
  total: number;
  message: string;
}

export interface ConversionOptions {
  mode?: ConversionMode;
  detectTables?: boolean;
  preserveFormatting?: boolean;
  includeImages?: boolean;
  pageBreakPerPage?: boolean;
  signal?: AbortSignal;
  onProgress?: (progress: ConversionProgress) => void;
}

export interface ConversionResult {
  blob: Blob;
  wordCount: number;
  pageCount: number;
  tableCount: number;
  imageCount: number;
  modeUsed: ConversionMode;
  fileName: string;
  fileSize: number;
  diagnostics: {
    scannedPages: number[];
    multiColumnPages: number[];
    tablesDetected: number;
  };
}

export interface ExtractedTextItem {
  str: string;
  x: number;
  y: number;
  width: number;
  height: number;
  fontSize: number;
  fontFamily: string;
  isBold: boolean;
  isItalic: boolean;
  color?: string;
}

export interface ExtractedPdfImage {
  x: number;
  y: number;
  widthPt: number;
  heightPt: number;
  pngBytes: Uint8Array;
}

export interface TextCell {
  text: string;
  minX: number;
  maxX: number;
  fontSize: number;
  isBold: boolean;
  isItalic: boolean;
}

export interface DetectedTable {
  y: number;
  rows: TextCell[][];
  columnBounds: { minX: number; maxX: number }[];
  totalWidth: number;
}

export interface FormattedLine {
  text: string;
  items: ExtractedTextItem[];
  minX: number;
  maxX: number;
  lineWidth: number;
  maxFontSize: number;
  isBold: boolean;
  isItalic: boolean;
  alignment: (typeof AlignmentType)[keyof typeof AlignmentType];
  isHeading: boolean;
  isLargeHeading: boolean;
  isMediumHeading: boolean;
  isListItem: boolean;
  listBullet?: string;
  y: number;
}

export type PageBlock =
  | { type: 'paragraph'; data: FormattedLine[] }
  | { type: 'table'; data: DetectedTable }
  | { type: 'image'; data: ExtractedPdfImage };

// --- Error Classes ---

export class PasswordProtectedPdfError extends Error {
  constructor(message = 'Dokumen PDF ini dilindungi kata sandi (password). Harap buka kunci dokumen terlebih dahulu.') {
    super(message);
    this.name = 'PasswordProtectedPdfError';
  }
}

export class CorruptedPdfError extends Error {
  constructor(message = 'File PDF rusak atau format file tidak valid. Pastikan file dapat dibuka di PDF viewer biasa.') {
    super(message);
    this.name = 'CorruptedPdfError';
  }
}

export class ConversionCancelledError extends Error {
  constructor(message = 'Proses konversi dibatalkan oleh pengguna.') {
    super(message);
    this.name = 'ConversionCancelledError';
  }
}

// --- Image Processing Helpers ---

export async function rawPdfImageToPngBytes(imgObj: {
  width: number;
  height: number;
  kind?: number;
  data: Uint8Array | Uint8ClampedArray;
}): Promise<Uint8Array | null> {
  if (typeof document === 'undefined') return null;
  try {
    const canvas = document.createElement('canvas');
    canvas.width = imgObj.width;
    canvas.height = imgObj.height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    const imgData = ctx.createImageData(imgObj.width, imgObj.height);
    const src = imgObj.data;
    const dest = imgData.data;
    const totalPixels = imgObj.width * imgObj.height;

    if (imgObj.kind === 2) {
      // RGB (24bpp)
      let s = 0;
      let d = 0;
      for (let i = 0; i < totalPixels; i++) {
        dest[d] = src[s];
        dest[d + 1] = src[s + 1];
        dest[d + 2] = src[s + 2];
        dest[d + 3] = 255;
        s += 3;
        d += 4;
      }
    } else if (imgObj.kind === 3) {
      // RGBA (32bpp)
      dest.set(src.subarray(0, totalPixels * 4));
    } else if (imgObj.kind === 1) {
      // Grayscale (8bpp)
      let s = 0;
      let d = 0;
      for (let i = 0; i < totalPixels; i++) {
        const v = src[s];
        dest[d] = v;
        dest[d + 1] = v;
        dest[d + 2] = v;
        dest[d + 3] = 255;
        s += 1;
        d += 4;
      }
    } else {
      if (src.length >= totalPixels * 4) {
        dest.set(src.subarray(0, totalPixels * 4));
      } else if (src.length >= totalPixels * 3) {
        let s = 0;
        let d = 0;
        for (let i = 0; i < totalPixels; i++) {
          dest[d] = src[s];
          dest[d + 1] = src[s + 1];
          dest[d + 2] = src[s + 2];
          dest[d + 3] = 255;
          s += 3;
          d += 4;
        }
      } else {
        return null;
      }
    }

    ctx.putImageData(imgData, 0, 0);

    return new Promise<Uint8Array | null>((resolve) => {
      canvas.toBlob((blob) => {
        if (!blob) return resolve(null);
        blob
          .arrayBuffer()
          .then((buf) => resolve(new Uint8Array(buf)))
          .catch(() => resolve(null));
      }, 'image/png');
    });
  } catch (err) {
    console.warn('Gagal memproses bitmap gambar PDF:', err);
    return null;
  }
}

// Render full PDF page to crisp PNG bytes (for Mode C or scanned pages)
export async function renderPageToPng(page: any, scale = 1.75): Promise<Uint8Array | null> {
  if (typeof document === 'undefined') return null;
  try {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    const viewport = page.getViewport({ scale });
    canvas.width = viewport.width;
    canvas.height = viewport.height;

    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    await page.render({
      canvasContext: ctx as unknown as CanvasRenderingContext2D,
      viewport
    }).promise;

    return new Promise<Uint8Array | null>((resolve) => {
      canvas.toBlob((blob) => {
        if (!blob) return resolve(null);
        blob
          .arrayBuffer()
          .then((buf) => resolve(new Uint8Array(buf)))
          .catch(() => resolve(null));
      }, 'image/png');
    });
  } catch (err) {
    console.warn('Gagal merender halaman ke PNG:', err);
    return null;
  }
}

// --- Pre-flight Document Inspection ---

export async function inspectPdfDocument(
  fileInput: File | ArrayBuffer | Uint8Array,
  signal?: AbortSignal
): Promise<PdfInspectionResult> {
  if (signal?.aborted) throw new ConversionCancelledError();

  let dataBuffer: ArrayBuffer;
  if (fileInput instanceof File) {
    dataBuffer = await fileInput.arrayBuffer();
  } else if (fileInput instanceof Uint8Array) {
    dataBuffer = fileInput.buffer.slice(
      fileInput.byteOffset,
      fileInput.byteOffset + fileInput.byteLength
    ) as ArrayBuffer;
  } else {
    dataBuffer = fileInput;
  }

  let pdfDoc: any;
  try {
    const loadingTask = pdfjsLib.getDocument({ data: dataBuffer });
    pdfDoc = await loadingTask.promise;
  } catch (err: any) {
    if (err && (err.name === 'PasswordException' || err.code === 1)) {
      throw new PasswordProtectedPdfError();
    }
    throw new CorruptedPdfError(err?.message || 'File PDF tidak dapat dibaca.');
  }

  const pageCount = pdfDoc.numPages;
  if (pageCount === 0) {
    throw new CorruptedPdfError('Dokumen PDF kosong.');
  }

  let totalWords = 0;
  let totalImages = 0;
  let samplePagesScanned = 0;
  let detectedMultiColumns = 0;
  let estimatedTables = 0;

  // Sample up to first 8 pages for quick, accurate pre-flight inspection
  const pagesToSample = Math.min(pageCount, 8);
  let firstPageWidth = 595;
  let firstPageHeight = 842;

  for (let p = 1; p <= pagesToSample; p++) {
    if (signal?.aborted) throw new ConversionCancelledError();

    const page = await pdfDoc.getPage(p);
    const viewport = page.getViewport({ scale: 1.0 });
    if (p === 1) {
      firstPageWidth = Math.round(viewport.width);
      firstPageHeight = Math.round(viewport.height);
    }

    const textContent = await page.getTextContent();
    const rawItems = (textContent.items || []) as any[];
    const pageText = rawItems
      .filter((it) => it.str && it.str.trim().length > 0)
      .map((it) => it.str)
      .join(' ');

    const words = pageText.split(/\s+/).filter(Boolean);
    totalWords += words.length;

    // Check operators for images
    try {
      const opList = await page.getOperatorList();
      for (const fn of opList.fnArray) {
        if (fn === pdfjsLib.OPS.paintImageXObject) {
          totalImages++;
        }
      }
    } catch {
      // ignore operator errors in pre-flight
    }

    if (words.length < 8) {
      samplePagesScanned++;
    }

    // Quick heuristic for 2-column or tabular layout
    const textPositions = rawItems
      .filter((it) => it.str && it.str.trim().length > 1)
      .map((it) => it.transform?.[4])
      .filter((x): x is number => typeof x === 'number');

    if (textPositions.length > 20) {
      const mid = viewport.width / 2;
      const leftColItems = textPositions.filter((x) => x > 40 && x < mid - 20).length;
      const rightColItems = textPositions.filter((x) => x > mid + 20 && x < viewport.width - 40).length;
      if (leftColItems > 8 && rightColItems > 8) {
        detectedMultiColumns++;
      }
    }
  }

  // Extrapolate words for large documents
  if (pageCount > pagesToSample) {
    totalWords = Math.round((totalWords / pagesToSample) * pageCount);
    totalImages = Math.round((totalImages / pagesToSample) * pageCount);
  }

  const isScanned = samplePagesScanned >= Math.ceil(pagesToSample * 0.8) && totalWords < 20 * pageCount;
  const hasSelectableText = totalWords >= 15 * pageCount;

  let documentType: PdfInspectionResult['documentType'] = 'digital_text';
  if (isScanned) {
    documentType = 'scanned';
  } else if (samplePagesScanned > 0 && samplePagesScanned < pagesToSample) {
    documentType = 'mixed';
  } else if (detectedMultiColumns > 0) {
    documentType = 'complex_layout';
  }

  // Recommended Mode
  const recommendedMode: ConversionMode = isScanned ? 'visual_fidelity' : 'layout_preserving';

  let pageSizeLabel = 'A4';
  if (Math.abs(firstPageWidth - 612) < 20 && Math.abs(firstPageHeight - 792) < 20) {
    pageSizeLabel = 'US Letter';
  } else if (Math.abs(firstPageWidth - 595) < 20 && Math.abs(firstPageHeight - 842) < 20) {
    pageSizeLabel = 'A4';
  } else {
    pageSizeLabel = `${firstPageWidth} × ${firstPageHeight} pt`;
  }

  return {
    pageCount,
    totalWords,
    totalImages,
    hasSelectableText,
    isScanned,
    documentType,
    detectedColumns: detectedMultiColumns > 0 ? 2 : 1,
    detectedTablesEstimate: estimatedTables,
    recommendedMode,
    pageSizeLabel
  };
}

// --- Layout Parsing Algorithms ---

// Extract text items with accurate typography and font family mappings
export function parsePageTextItems(
  textContent: any
): ExtractedTextItem[] {
  const rawItems = (textContent.items || []) as any[];
  const styles = (textContent.styles || {}) as Record<string, { fontFamily?: string }>;

  return rawItems
    .filter((it) => it.str && it.str.trim().length > 0)
    .map((it) => {
      const fontName = it.fontName || '';
      const styleInfo = styles[fontName] || {};
      const fontDesc = `${fontName} ${styleInfo.fontFamily || ''}`.toLowerCase();

      // Normalize font size from transform matrix
      const matrixSize = Math.hypot(it.transform?.[0] || 0, it.transform?.[1] || 0);
      const fontSize = Math.round(matrixSize) || Math.round(it.height) || 11;

      const isBold = /bold|black|heavy|700|800|900/i.test(fontDesc);
      const isItalic = /italic|oblique/i.test(fontDesc);

      // Map standard font family
      let fontFamily = 'Calibri';
      if (/times|roman/i.test(fontDesc)) fontFamily = 'Times New Roman';
      else if (/arial|helvetica|sans/i.test(fontDesc)) fontFamily = 'Arial';
      else if (/courier|mono/i.test(fontDesc)) fontFamily = 'Courier New';
      else if (/georgia/i.test(fontDesc)) fontFamily = 'Georgia';

      return {
        str: it.str,
        x: it.transform?.[4] ?? 0,
        y: it.transform?.[5] ?? 0,
        width: it.width ?? 0,
        height: it.height || fontSize,
        fontSize,
        fontFamily,
        isBold,
        isItalic
      };
    });
}

// Re-order text items to preserve reading order when 2-column layout is detected
export function orderItemsByColumns(
  items: ExtractedTextItem[],
  pageWidthPt: number
): ExtractedTextItem[] {
  if (items.length < 15) return items;

  const mid = pageWidthPt / 2;
  const gutterLeft = mid - 25;
  const gutterRight = mid + 25;

  // Find items strictly in left column vs strictly in right column
  const leftColItems = items.filter((it) => it.x + it.width <= gutterRight && it.x < gutterLeft);
  const rightColItems = items.filter((it) => it.x >= gutterLeft && it.x + it.width > gutterRight);
  const spanningItems = items.filter(
    (it) => (it.x < gutterLeft && it.x + it.width > gutterRight) || it.width > pageWidthPt * 0.65
  );

  // If both columns have significant content, partition into logical blocks
  if (leftColItems.length >= 10 && rightColItems.length >= 10) {
    const minYCol = Math.min(
      Math.min(...leftColItems.map((i) => i.y)),
      Math.min(...rightColItems.map((i) => i.y))
    );
    const maxYCol = Math.max(
      Math.max(...leftColItems.map((i) => i.y)),
      Math.max(...rightColItems.map((i) => i.y))
    );

    const headerItems = spanningItems.filter((i) => i.y > maxYCol - 20);
    const footerItems = spanningItems.filter((i) => i.y < minYCol + 20);
    const middleSpanning = spanningItems.filter((i) => i.y <= maxYCol - 20 && i.y >= minYCol + 20);

    // Sort sections
    headerItems.sort((a, b) => b.y - a.y || a.x - b.x);
    leftColItems.sort((a, b) => b.y - a.y || a.x - b.x);
    rightColItems.sort((a, b) => b.y - a.y || a.x - b.x);
    footerItems.sort((a, b) => b.y - a.y || a.x - b.x);
    middleSpanning.sort((a, b) => b.y - a.y || a.x - b.x);

    return [...headerItems, ...middleSpanning, ...leftColItems, ...rightColItems, ...footerItems];
  }

  // Default: natural reading order
  return [...items].sort((a, b) => b.y - a.y || a.x - b.x);
}

// Group text items into lines
export function groupItemsIntoLines(
  items: ExtractedTextItem[],
  pageWidthPt: number,
  docMarginPt = 36
): FormattedLine[] {
  const rawLines: { y: number; items: ExtractedTextItem[] }[] = [];

  for (const item of items) {
    const tolerance = Math.max(3.5, item.height * 0.45);
    const existing = rawLines.find((l) => Math.abs(l.y - item.y) <= tolerance);
    if (existing) {
      existing.items.push(item);
    } else {
      rawLines.push({ y: item.y, items: [item] });
    }
  }

  // Sort top to bottom
  rawLines.sort((a, b) => b.y - a.y);

  const formattedLines: FormattedLine[] = [];

  for (const line of rawLines) {
    line.items.sort((a, b) => a.x - b.x);

    let assembledText = '';
    let maxFontSize = 11;
    let isLineBold = false;
    let isLineItalic = false;

    for (let i = 0; i < line.items.length; i++) {
      const it = line.items[i];
      if (it.fontSize > maxFontSize) maxFontSize = it.fontSize;
      if (it.isBold) isLineBold = true;
      if (it.isItalic) isLineItalic = true;

      if (i === 0) {
        assembledText = it.str;
      } else {
        const prev = line.items[i - 1];
        const prevEnd = prev.x + prev.width;
        const gap = it.x - prevEnd;
        const avgCharWidth = prev.width / (prev.str.length || 1);

        if (/\s$/.test(assembledText) || /^\s/.test(it.str)) {
          assembledText += it.str;
        } else if (gap > Math.max(2.5, avgCharWidth * 0.35)) {
          assembledText += ' ' + it.str;
        } else {
          assembledText += it.str;
        }
      }
    }

    assembledText = assembledText.trim();
    if (!assembledText) continue;

    const minX = line.items[0]?.x ?? 0;
    const lastItem = line.items[line.items.length - 1];
    const maxX = lastItem ? lastItem.x + lastItem.width : minX;
    const lineWidth = maxX - minX;
    const lineCenter = minX + lineWidth / 2;
    const pageCenter = pageWidthPt / 2;

    let alignment: (typeof AlignmentType)[keyof typeof AlignmentType] = AlignmentType.LEFT;
    const isCentered = Math.abs(lineCenter - pageCenter) < 35 && lineWidth < pageWidthPt * 0.75;
    const isRightAligned = pageWidthPt - maxX < docMarginPt + 40 && minX > pageWidthPt * 0.35;

    if (isCentered) {
      alignment = AlignmentType.CENTER;
    } else if (isRightAligned) {
      alignment = AlignmentType.RIGHT;
    }

    const isLargeHeading = maxFontSize >= 17;
    const isMediumHeading = maxFontSize >= 13.5 && maxFontSize < 17;
    const isHeading =
      isLargeHeading ||
      isMediumHeading ||
      (isLineBold && assembledText.length < 90 && (isCentered || maxFontSize >= 12));

    const listMatch = assembledText.match(/^([•\u2022\u2013\u2014\-*]|\d+[\.\)]|[a-zA-Z][\.\)])\s+/);
    const isListItem = Boolean(listMatch);
    const listBullet = listMatch ? listMatch[1] : undefined;

    formattedLines.push({
      text: assembledText,
      items: line.items,
      minX,
      maxX,
      lineWidth,
      maxFontSize,
      isBold: isLineBold,
      isItalic: isLineItalic,
      alignment,
      isHeading,
      isLargeHeading,
      isMediumHeading,
      isListItem,
      listBullet,
      y: line.y
    });
  }

  return formattedLines;
}

// Detect and reconstruct grid-aligned table structures from lines of text
export function detectTablesInLines(
  lines: FormattedLine[],
  pageWidthPt: number
): { remainingLines: FormattedLine[]; detectedTables: DetectedTable[] } {
  const detectedTables: DetectedTable[] = [];
  const usedLineIndices = new Set<number>();

  // Helper to split a line's items into cell candidates based on column spacing
  const extractCellsFromLine = (line: FormattedLine): TextCell[] => {
    const cells: TextCell[] = [];
    let currentCellItems: ExtractedTextItem[] = [];

    for (let i = 0; i < line.items.length; i++) {
      const it = line.items[i];
      if (currentCellItems.length === 0) {
        currentCellItems.push(it);
        continue;
      }

      const prev = currentCellItems[currentCellItems.length - 1];
      const gap = it.x - (prev.x + prev.width);

      // Significant horizontal gap indicates a new column cell
      if (gap > 18) {
        const text = currentCellItems.map((c) => c.str).join(' ').trim();
        if (text) {
          cells.push({
            text,
            minX: currentCellItems[0].x,
            maxX: prev.x + prev.width,
            fontSize: currentCellItems[0].fontSize,
            isBold: currentCellItems.some((c) => c.isBold),
            isItalic: currentCellItems.some((c) => c.isItalic)
          });
        }
        currentCellItems = [it];
      } else {
        currentCellItems.push(it);
      }
    }

    if (currentCellItems.length > 0) {
      const prev = currentCellItems[currentCellItems.length - 1];
      const text = currentCellItems.map((c) => c.str).join(' ').trim();
      if (text) {
        cells.push({
          text,
          minX: currentCellItems[0].x,
          maxX: prev.x + prev.width,
          fontSize: currentCellItems[0].fontSize,
          isBold: currentCellItems.some((c) => c.isBold),
          isItalic: currentCellItems.some((c) => c.isItalic)
        });
      }
    }

    return cells;
  };

  const lineCellMap = lines.map((l) => extractCellsFromLine(l));

  let i = 0;
  while (i < lines.length) {
    const rowCells = lineCellMap[i];

    // Candidate table row must have >= 2 columns and not be a massive paragraph
    if (rowCells.length >= 2 && !lines[i].isHeading) {
      const tableRows: TextCell[][] = [rowCells];
      const tableLineIndices: number[] = [i];

      let j = i + 1;
      while (j < lines.length) {
        const nextCells = lineCellMap[j];
        const prevRow = tableRows[tableRows.length - 1];
        const vGap = Math.abs(lines[j - 1].y - lines[j].y);

        // Check if row has similar number of columns and vertical proximity
        const colCountMatch = Math.abs(nextCells.length - prevRow.length) <= 1 && nextCells.length >= 2;
        const vGapReasonable = vGap < 35;

        // Check column alignment tolerance
        let alignedCols = 0;
        for (const nc of nextCells) {
          const match = prevRow.some((pr) => Math.abs(pr.minX - nc.minX) < 25);
          if (match) alignedCols++;
        }

        if (colCountMatch && vGapReasonable && alignedCols >= 1) {
          tableRows.push(nextCells);
          tableLineIndices.push(j);
          j++;
        } else {
          break;
        }
      }

      // If at least 2 consecutive rows matched, it's a genuine table!
      if (tableRows.length >= 2) {
        const maxCols = Math.max(...tableRows.map((r) => r.length));
        const columnBounds: { minX: number; maxX: number }[] = [];

        // Estimate bounds for each column
        for (let c = 0; c < maxCols; c++) {
          const colCells = tableRows.map((r) => r[c]).filter(Boolean);
          if (colCells.length > 0) {
            columnBounds.push({
              minX: Math.min(...colCells.map((cell) => cell.minX)),
              maxX: Math.max(...colCells.map((cell) => cell.maxX))
            });
          }
        }

        detectedTables.push({
          y: lines[i].y,
          rows: tableRows,
          columnBounds,
          totalWidth: pageWidthPt * 0.9
        });

        for (const idx of tableLineIndices) {
          usedLineIndices.add(idx);
        }
        i = j;
        continue;
      }
    }
    i++;
  }

  const remainingLines = lines.filter((_, idx) => !usedLineIndices.has(idx));
  return { remainingLines, detectedTables };
}

// Convert a DetectedTable into a real, editable Word Table
export function createDocxTable(table: DetectedTable): Table {
  const maxCols = Math.max(1, ...table.rows.map((r) => r.length));

  const docxRows = table.rows.map((rowCells, rowIndex) => {
    const isHeader = rowIndex === 0;

    const cells: TableCell[] = [];
    for (let c = 0; c < maxCols; c++) {
      const cellData = rowCells[c];
      const cellText = cellData ? cellData.text : '';

      cells.push(
        new TableCell({
          shading: isHeader ? { fill: 'F6F8FA' } : undefined,
          children: [
            new Paragraph({
              alignment: AlignmentType.LEFT,
              children: [
                new TextRun({
                  text: cellText,
                  bold: isHeader || (cellData?.isBold ?? false),
                  italics: cellData?.isItalic ?? false,
                  size: Math.round(Math.max(9, Math.min(12, cellData?.fontSize || 10)) * 2),
                  font: 'Calibri'
                })
              ],
              spacing: { before: 50, after: 50, line: 240 }
            })
          ],
          margins: {
            top: 100,
            bottom: 100,
            left: 120,
            right: 120
          }
        })
      );
    }

    return new TableRow({
      tableHeader: isHeader,
      children: cells
    });
  });

  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: {
      top: { style: BorderStyle.SINGLE, size: 1, color: 'D0D7DE' },
      bottom: { style: BorderStyle.SINGLE, size: 1, color: 'D0D7DE' },
      left: { style: BorderStyle.SINGLE, size: 1, color: 'D0D7DE' },
      right: { style: BorderStyle.SINGLE, size: 1, color: 'D0D7DE' },
      insideHorizontal: { style: BorderStyle.SINGLE, size: 1, color: 'E1E4E8' },
      insideVertical: { style: BorderStyle.SINGLE, size: 1, color: 'E1E4E8' }
    },
    rows: docxRows
  });
}

// Create a Paragraph from a group of FormattedLines, preserving word-level formatting
export function createDocxParagraph(group: FormattedLine[]): Paragraph {
  const primary = group[0];
  const runs: TextRun[] = [];

  for (let lIdx = 0; lIdx < group.length; lIdx++) {
    const line = group[lIdx];
    if (lIdx > 0) {
      runs.push(new TextRun({ text: ' ', font: 'Calibri' }));
    }

    // Segment line items into distinct runs by formatting
    let currentRunText = '';
    let currBold = false;
    let currItalic = false;
    let currSize = 11;
    let currFont = 'Calibri';

    const flushRun = () => {
      if (!currentRunText) return;
      let finalSize = Math.round(Math.max(9, Math.min(14, currSize)) * 2);
      let isBold = currBold;

      if (primary.isLargeHeading) {
        finalSize = Math.min(48, Math.max(32, Math.round(primary.maxFontSize * 2)));
        isBold = true;
      } else if (primary.isMediumHeading) {
        finalSize = Math.min(32, Math.max(26, Math.round(primary.maxFontSize * 2)));
        isBold = true;
      }

      runs.push(
        new TextRun({
          text: currentRunText,
          bold: isBold,
          italics: currItalic,
          size: finalSize,
          font: currFont
        })
      );
      currentRunText = '';
    };

    for (let i = 0; i < line.items.length; i++) {
      const it = line.items[i];
      if (i === 0) {
        currentRunText = it.str;
        currBold = it.isBold;
        currItalic = it.isItalic;
        currSize = it.fontSize;
        currFont = it.fontFamily;
      } else {
        const isSameFormat =
          it.isBold === currBold &&
          it.isItalic === currItalic &&
          Math.abs(it.fontSize - currSize) <= 1 &&
          it.fontFamily === currFont;

        const prev = line.items[i - 1];
        const gap = it.x - (prev.x + prev.width);
        const space = gap > 3 && !/\s$/.test(currentRunText) && !/^\s/.test(it.str) ? ' ' : '';

        if (isSameFormat) {
          currentRunText += space + it.str;
        } else {
          flushRun();
          currentRunText = space + it.str;
          currBold = it.isBold;
          currItalic = it.isItalic;
          currSize = it.fontSize;
          currFont = it.fontFamily;
        }
      }
    }
    flushRun();
  }

  let spacingBefore = 0;
  let spacingAfter = 90;
  if (primary.isLargeHeading) {
    spacingBefore = 240;
    spacingAfter = 120;
  } else if (primary.isMediumHeading) {
    spacingBefore = 160;
    spacingAfter = 80;
  } else if (primary.isHeading) {
    spacingBefore = 120;
    spacingAfter = 60;
  }

  return new Paragraph({
    alignment: primary.alignment,
    children: runs,
    indent: primary.isListItem ? { left: 720, hanging: 360 } : undefined,
    spacing: {
      before: spacingBefore,
      after: spacingAfter,
      line: primary.isHeading ? 240 : 276
    }
  });
}

// --- Main Engine: PDF to DOCX Conversion ---

export async function convertPdfToDocx(
  fileInput: File | ArrayBuffer | Uint8Array,
  options: ConversionOptions = {}
): Promise<ConversionResult> {
  const signal = options.signal;
  if (signal?.aborted) throw new ConversionCancelledError();

  let dataBuffer: ArrayBuffer;
  let originalFileName = 'dokumen.pdf';

  if (fileInput instanceof File) {
    originalFileName = fileInput.name;
    dataBuffer = await fileInput.arrayBuffer();
  } else if (fileInput instanceof Uint8Array) {
    dataBuffer = fileInput.buffer.slice(
      fileInput.byteOffset,
      fileInput.byteOffset + fileInput.byteLength
    ) as ArrayBuffer;
  } else {
    dataBuffer = fileInput;
  }

  options.onProgress?.({
    stage: 'inspecting',
    current: 0,
    total: 100,
    message: 'Membaca dan memverifikasi dokumen PDF...'
  });

  let pdfDoc: any;
  try {
    const loadingTask = pdfjsLib.getDocument({ data: dataBuffer });
    pdfDoc = await loadingTask.promise;
  } catch (err: any) {
    if (err && (err.name === 'PasswordException' || err.code === 1)) {
      throw new PasswordProtectedPdfError();
    }
    throw new CorruptedPdfError(err?.message || 'File PDF tidak dapat dibaca.');
  }

  const numPages = pdfDoc.numPages;
  if (numPages === 0) {
    throw new CorruptedPdfError('Dokumen PDF kosong.');
  }

  const conversionMode: ConversionMode = options.mode || 'layout_preserving';
  const docxSections: any[] = [];
  let totalWordCount = 0;
  let totalTableCount = 0;
  let totalImageCount = 0;
  const scannedPages: number[] = [];
  const multiColumnPages: number[] = [];

  for (let pageNum = 1; pageNum <= numPages; pageNum++) {
    if (signal?.aborted) throw new ConversionCancelledError();

    options.onProgress?.({
      stage: 'extracting',
      current: pageNum,
      total: numPages,
      message: `Memproses lembar ${pageNum} dari ${numPages}...`
    });

    const page = await pdfDoc.getPage(pageNum);
    const unscaledViewport = page.getViewport({ scale: 1.0 });
    const pageWidthPt = unscaledViewport.width;
    const pageHeightPt = unscaledViewport.height;

    // --- Mode C: Visual Fidelity Fallback ---
    if (conversionMode === 'visual_fidelity') {
      const pngBytes = await renderPageToPng(page, 1.75);
      const pageChildren: any[] = [];

      if (pngBytes) {
        totalImageCount++;
        const availWidthPx = Math.round(pageWidthPt * (96 / 72));
        const availHeightPx = Math.round(pageHeightPt * (96 / 72));

        pageChildren.push(
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new ImageRun({
                data: pngBytes,
                transformation: {
                  width: availWidthPx,
                  height: availHeightPx
                },
                type: 'png'
              })
            ]
          })
        );
      }

      docxSections.push({
        properties: {
          type:
            pageNum === 1 || options.pageBreakPerPage === false
              ? SectionType.CONTINUOUS
              : SectionType.NEXT_PAGE,
          page: {
            size: {
              width: Math.round(pageWidthPt * 20),
              height: Math.round(pageHeightPt * 20)
            },
            margin: { top: 0, bottom: 0, left: 0, right: 0 }
          }
        },
        children: pageChildren
      });

      continue;
    }

    // --- Mode A: Layout-Preserving Editable Conversion ---

    // 1. Extract text content
    const textContent = await page.getTextContent();
    const rawItems = parsePageTextItems(textContent);

    // 2. Extract embedded images (logos, signatures, diagrams)
    const extractedImages: ExtractedPdfImage[] = [];
    if (options.includeImages !== false) {
      try {
        const opList = await page.getOperatorList();
        let currentMatrix = [1, 0, 0, 1, 0, 0];

        for (let i = 0; i < opList.fnArray.length; i++) {
          if (signal?.aborted) throw new ConversionCancelledError();

          const fn = opList.fnArray[i];
          const args = opList.argsArray[i];

          if (fn === pdfjsLib.OPS.transform) {
            currentMatrix = args;
          } else if (fn === pdfjsLib.OPS.paintImageXObject) {
            const imgId = args[0];
            try {
              const imgObj = await new Promise<any>((resolve) => {
                page.objs.get(imgId, (res: any) => resolve(res));
              });

              if (imgObj && imgObj.width > 0 && imgObj.height > 0) {
                const pngBytes = await rawPdfImageToPngBytes(imgObj);
                if (pngBytes) {
                  const widthPt = Math.abs(currentMatrix[0]) || imgObj.width * 0.75;
                  const heightPt = Math.abs(currentMatrix[3]) || imgObj.height * 0.75;
                  extractedImages.push({
                    x: currentMatrix[4],
                    y: currentMatrix[5],
                    widthPt,
                    heightPt,
                    pngBytes
                  });
                  totalImageCount++;
                }
              }
            } catch (err) {
              console.warn('Gagal membaca gambar PDF:', err);
            }
          }
        }
      } catch (opErr) {
        console.warn('Gagal membaca operator list halaman:', opErr);
      }
    }

    const pageChildren: any[] = [];
    let docMarginPt = 36; // 0.5 inch default

    if (rawItems.length === 0) {
      // Scanned page fallback: Render page cleanly as high-res graphic so it's not blank
      scannedPages.push(pageNum);
      const pngBytes = await renderPageToPng(page, 1.75);
      if (pngBytes) {
        totalImageCount++;
        const availWidthPt = pageWidthPt - docMarginPt * 2;
        const availWidthPx = Math.round(availWidthPt * (96 / 72));
        const availHeightPx = Math.round(availWidthPx * (pageHeightPt / pageWidthPt));

        pageChildren.push(
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new ImageRun({
                data: pngBytes,
                transformation: {
                  width: availWidthPx,
                  height: availHeightPx
                },
                type: 'png'
              })
            ]
          })
        );
      }
    } else {
      // Determine page margins from text bounds
      const minX = Math.min(...rawItems.map((it) => it.x));
      if (Number.isFinite(minX) && minX > 10) {
        docMarginPt = Math.max(28, Math.min(54, Math.round(minX)));
      }

      // Check for multi-column layout
      const orderedItems = orderItemsByColumns(rawItems, pageWidthPt);
      if (orderedItems !== rawItems) {
        multiColumnPages.push(pageNum);
      }

      // Group into formatted lines
      const formattedLines = groupItemsIntoLines(orderedItems, pageWidthPt, docMarginPt);

      // Detect tables if enabled
      let remainingLines = formattedLines;
      let detectedTables: DetectedTable[] = [];

      if (options.detectTables !== false) {
        const tableResult = detectTablesInLines(formattedLines, pageWidthPt);
        remainingLines = tableResult.remainingLines;
        detectedTables = tableResult.detectedTables;
        totalTableCount += detectedTables.length;
      }

      // Merge paragraphs, tables, and images by vertical coordinates
      type InterleavedItem =
        | { type: 'line'; y: number; data: FormattedLine }
        | { type: 'table'; y: number; data: DetectedTable }
        | { type: 'image'; y: number; data: ExtractedPdfImage };

      const flowItems: InterleavedItem[] = [
        ...remainingLines.map((l) => ({ type: 'line' as const, y: l.y, data: l })),
        ...detectedTables.map((t) => ({ type: 'table' as const, y: t.y, data: t })),
        ...extractedImages.map((img) => ({ type: 'image' as const, y: img.y, data: img }))
      ];

      flowItems.sort((a, b) => b.y - a.y);

      let currentParagraphGroup: FormattedLine[] = [];

      const flushParagraphGroup = () => {
        if (currentParagraphGroup.length === 0) return;
        const p = createDocxParagraph(currentParagraphGroup);
        const groupWords = currentParagraphGroup
          .map((l) => l.text)
          .join(' ')
          .split(/\s+/)
          .filter(Boolean).length;
        totalWordCount += groupWords;
        pageChildren.push(p);
        currentParagraphGroup = [];
      };

      for (const item of flowItems) {
        if (item.type === 'table') {
          flushParagraphGroup();
          pageChildren.push(createDocxTable(item.data));
        } else if (item.type === 'image') {
          flushParagraphGroup();
          const img = item.data;
          let widthPx = Math.round(img.widthPt * (96 / 72));
          let heightPx = Math.round(img.heightPt * (96 / 72));
          const availWidthPx = Math.round((pageWidthPt - docMarginPt * 2) * (96 / 72));

          if (widthPx > availWidthPx) {
            const scale = availWidthPx / widthPx;
            widthPx = availWidthPx;
            heightPx = Math.max(20, Math.round(heightPx * scale));
          }
          widthPx = Math.max(16, widthPx);
          heightPx = Math.max(16, heightPx);

          let alignment: (typeof AlignmentType)[keyof typeof AlignmentType] = AlignmentType.LEFT;
          const imgCenterX = img.x + img.widthPt / 2;
          const pageCenter = pageWidthPt / 2;

          if (Math.abs(imgCenterX - pageCenter) < 40) {
            alignment = AlignmentType.CENTER;
          } else if (
            pageWidthPt - (img.x + img.widthPt) < docMarginPt + 40 &&
            img.x > pageWidthPt * 0.35
          ) {
            alignment = AlignmentType.RIGHT;
          }

          pageChildren.push(
            new Paragraph({
              alignment,
              children: [
                new ImageRun({
                  data: img.pngBytes,
                  transformation: { width: widthPx, height: heightPx },
                  type: 'png'
                })
              ],
              spacing: { before: 80, after: 120 }
            })
          );
        } else {
          // item.type === 'line'
          const curr = item.data;
          const prev = currentParagraphGroup[currentParagraphGroup.length - 1];

          if (!prev) {
            currentParagraphGroup = [curr];
            continue;
          }

          const vGap = Math.abs(prev.y - curr.y);
          const isPrevStandalone =
            prev.isHeading ||
            prev.alignment !== AlignmentType.LEFT ||
            /:$/.test(prev.text) ||
            prev.lineWidth < (pageWidthPt - docMarginPt * 2) * 0.55;

          const isCurrStandalone =
            curr.isHeading ||
            curr.alignment !== AlignmentType.LEFT ||
            curr.isListItem ||
            vGap > curr.maxFontSize * 2.1;

          if (isPrevStandalone || isCurrStandalone) {
            flushParagraphGroup();
            currentParagraphGroup = [curr];
          } else {
            currentParagraphGroup.push(curr);
          }
        }
      }

      flushParagraphGroup();
    }

    const marginTwips = Math.round(docMarginPt * 20);

    docxSections.push({
      properties: {
        type:
          pageNum === 1 || options.pageBreakPerPage === false
            ? SectionType.CONTINUOUS
            : SectionType.NEXT_PAGE,
        page: {
          size: {
            width: Math.round(pageWidthPt * 20),
            height: Math.round(pageHeightPt * 20)
          },
          margin: {
            top: marginTwips,
            bottom: marginTwips,
            left: marginTwips,
            right: marginTwips
          }
        }
      },
      children: pageChildren
    });
  }

  options.onProgress?.({
    stage: 'packing',
    current: numPages,
    total: numPages,
    message: 'Menyusun arsip file Word (.docx)...'
  });

  const baseTitle = originalFileName.replace(/\.pdf$/i, '');
  const doc = new Document({
    creator: 'PakaiTools (pakaitools.id)',
    title: baseTitle,
    description: 'Dikonversi dari PDF melalui PakaiTools. 100% lokal & privat di browser.',
    sections: docxSections
  });

  const blob = await Packer.toBlob(doc);

  return {
    blob,
    wordCount: Math.max(1, totalWordCount),
    pageCount: numPages,
    tableCount: totalTableCount,
    imageCount: totalImageCount,
    modeUsed: conversionMode,
    fileName: `${baseTitle}.docx`,
    fileSize: blob.size,
    diagnostics: {
      scannedPages,
      multiColumnPages,
      tablesDetected: totalTableCount
    }
  };
}
