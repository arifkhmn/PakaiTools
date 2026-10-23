import { describe, it, expect } from 'vitest';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import {
  parsePageTextItems,
  orderItemsByColumns,
  groupItemsIntoLines,
  detectTablesInLines,
  createDocxTable,
  createDocxParagraph,
  inspectPdfDocument,
  convertPdfToDocx,
  CorruptedPdfError,
  ConversionCancelledError,
  type ExtractedTextItem,
  type FormattedLine
} from '../lib/pdfDocxEngine';

describe('PDF to Word Engine — Layout & Reconstruction Algorithms', () => {
  it('parses raw text items and normalizes typography and font sizes', () => {
    const mockTextContent = {
      items: [
        {
          str: 'Laporan Keuangan',
          transform: [18, 0, 0, 18, 50, 700],
          width: 140,
          height: 18,
          fontName: 'g_d0_f1'
        },
        {
          str: 'Periode 2026',
          transform: [12, 0, 0, 12, 50, 670],
          width: 80,
          height: 12,
          fontName: 'g_d0_f2'
        }
      ],
      styles: {
        g_d0_f1: { fontFamily: 'Times-Bold' },
        g_d0_f2: { fontFamily: 'Helvetica' }
      }
    };

    const parsed = parsePageTextItems(mockTextContent);
    expect(parsed).toHaveLength(2);
    expect(parsed[0].str).toBe('Laporan Keuangan');
    expect(parsed[0].fontSize).toBe(18);
    expect(parsed[0].isBold).toBe(true);
    expect(parsed[0].fontFamily).toBe('Times New Roman');

    expect(parsed[1].str).toBe('Periode 2026');
    expect(parsed[1].fontSize).toBe(12);
    expect(parsed[1].isBold).toBe(false);
    expect(parsed[1].fontFamily).toBe('Arial');
  });

  it('preserves natural reading order in multi-column layouts without interleaving', () => {
    const pageWidth = 600;
    // 2-column layout with header and footer
    const items: ExtractedTextItem[] = [
      // Top header spanning full width
      {
        str: 'Judul Penelitian Dua Kolom',
        x: 100,
        y: 750,
        width: 400,
        height: 20,
        fontSize: 20,
        fontFamily: 'Calibri',
        isBold: true,
        isItalic: false
      },
      // Left column lines (y: 600, 580, 560, 540, 520, 500, 480, 460, 440, 420)
      ...[600, 580, 560, 540, 520, 500, 480, 460, 440, 420].map((y, idx) => ({
        str: `Kolom Kiri Baris ${idx + 1}`,
        x: 50,
        y,
        width: 180,
        height: 11,
        fontSize: 11,
        fontFamily: 'Calibri',
        isBold: false,
        isItalic: false
      })),
      // Right column lines (y: 600, 580, 560, 540, 520, 500, 480, 460, 440, 420)
      ...[600, 580, 560, 540, 520, 500, 480, 460, 440, 420].map((y, idx) => ({
        str: `Kolom Kanan Baris ${idx + 1}`,
        x: 350,
        y,
        width: 180,
        height: 11,
        fontSize: 11,
        fontFamily: 'Calibri',
        isBold: false,
        isItalic: false
      }))
    ];

    const ordered = orderItemsByColumns(items, pageWidth);
    expect(ordered[0].str).toBe('Judul Penelitian Dua Kolom');

    // Kolom Kiri lines must all appear before Kolom Kanan lines
    const leftColIndex = ordered.findIndex((i) => i.str.includes('Kolom Kiri Baris 1'));
    const rightColIndex = ordered.findIndex((i) => i.str.includes('Kolom Kanan Baris 1'));
    const lastLeftColIndex = ordered.findIndex((i) => i.str.includes('Kolom Kiri Baris 10'));

    expect(leftColIndex).toBeLessThan(rightColIndex);
    expect(lastLeftColIndex).toBeLessThan(rightColIndex);
  });

  it('groups items into formatted lines and detects alignment and list bullet points', () => {
    const pageWidth = 600;
    const items: ExtractedTextItem[] = [
      // Centered title
      {
        str: 'SURAT KEPUTUSAN RESMI',
        x: 180,
        y: 700,
        width: 240,
        height: 18,
        fontSize: 18,
        fontFamily: 'Calibri',
        isBold: true,
        isItalic: false
      },
      // List items with bullet and number
      {
        str: '• Poin pertama dokumen',
        x: 50,
        y: 650,
        width: 200,
        height: 11,
        fontSize: 11,
        fontFamily: 'Calibri',
        isBold: false,
        isItalic: false
      },
      {
        str: '1. Ketentuan pasal kedua',
        x: 50,
        y: 620,
        width: 220,
        height: 11,
        fontSize: 11,
        fontFamily: 'Calibri',
        isBold: false,
        isItalic: false
      }
    ];

    const lines = groupItemsIntoLines(items, pageWidth);
    expect(lines).toHaveLength(3);

    // Title line
    expect(lines[0].text).toBe('SURAT KEPUTUSAN RESMI');
    expect(lines[0].isLargeHeading).toBe(true);
    expect(lines[0].alignment).toBe('center');

    // Bullet line
    expect(lines[1].isListItem).toBe(true);
    expect(lines[1].listBullet).toBe('•');

    // Numbered line
    expect(lines[2].isListItem).toBe(true);
    expect(lines[2].listBullet).toBe('1.');
  });

  it('detects resume uppercase section headings and separates right-aligned dates with tabs', () => {
    const pageWidth = 600;
    const items: ExtractedTextItem[] = [
      // Left-aligned all-caps section header with standard 11pt font
      {
        str: 'FEATURED PROJECTS',
        x: 40,
        y: 600,
        width: 130,
        height: 11,
        fontSize: 11,
        fontFamily: 'Calibri',
        isBold: true,
        isItalic: false
      },
      // Project title on left, date on right (wide horizontal gap)
      {
        str: 'E-Sekolah SaaS Platform',
        x: 40,
        y: 575,
        width: 150,
        height: 11,
        fontSize: 11,
        fontFamily: 'Calibri',
        isBold: true,
        isItalic: false
      },
      {
        str: '2026',
        x: 520,
        y: 575,
        width: 30,
        height: 11,
        fontSize: 11,
        fontFamily: 'Calibri',
        isBold: false,
        isItalic: false
      },
      // Bullet item with symbol bullet
      {
        str: '•',
        x: 40,
        y: 550,
        width: 5,
        height: 11,
        fontSize: 11,
        fontFamily: 'Calibri',
        isBold: false,
        isItalic: false
      },
      {
        str: 'Engineered real-time QR attendance verification system',
        x: 55,
        y: 550,
        width: 300,
        height: 11,
        fontSize: 11,
        fontFamily: 'Calibri',
        isBold: false,
        isItalic: false
      }
    ];

    const lines = groupItemsIntoLines(items, pageWidth);
    expect(lines).toHaveLength(3);

    // Section header
    expect(lines[0].text).toBe('FEATURED PROJECTS');
    expect(lines[0].isHeading).toBe(true);

    // Project title with tabbed date
    expect(lines[1].text).toContain('E-Sekolah SaaS Platform');
    expect(lines[1].text).toContain('\t2026');

    // Bullet item
    expect(lines[2].isListItem).toBe(true);
    expect(lines[2].text).toContain('Engineered real-time QR attendance');
  });

  it('detects grid-aligned tabular rows and extracts them as DetectedTable', () => {
    const pageWidth = 600;
    // 3 rows of 3 columns
    const lines: FormattedLine[] = [
      {
        text: 'No Produk Harga',
        items: [
          { str: 'No', x: 50, y: 500, width: 20, height: 11, fontSize: 11, fontFamily: 'Calibri', isBold: true, isItalic: false },
          { str: 'Produk', x: 150, y: 500, width: 50, height: 11, fontSize: 11, fontFamily: 'Calibri', isBold: true, isItalic: false },
          { str: 'Harga', x: 350, y: 500, width: 40, height: 11, fontSize: 11, fontFamily: 'Calibri', isBold: true, isItalic: false }
        ],
        minX: 50,
        maxX: 390,
        lineWidth: 340,
        maxFontSize: 11,
        isBold: true,
        isItalic: false,
        alignment: 'left' as any,
        isHeading: false,
        isLargeHeading: false,
        isMediumHeading: false,
        isListItem: false,
        y: 500
      },
      {
        text: '1 Kertas HVS 50.000',
        items: [
          { str: '1', x: 50, y: 480, width: 10, height: 11, fontSize: 11, fontFamily: 'Calibri', isBold: false, isItalic: false },
          { str: 'Kertas HVS', x: 150, y: 480, width: 70, height: 11, fontSize: 11, fontFamily: 'Calibri', isBold: false, isItalic: false },
          { str: '50.000', x: 350, y: 480, width: 40, height: 11, fontSize: 11, fontFamily: 'Calibri', isBold: false, isItalic: false }
        ],
        minX: 50,
        maxX: 390,
        lineWidth: 340,
        maxFontSize: 11,
        isBold: false,
        isItalic: false,
        alignment: 'left' as any,
        isHeading: false,
        isLargeHeading: false,
        isMediumHeading: false,
        isListItem: false,
        y: 480
      },
      {
        text: '2 Tinta Printer 120.000',
        items: [
          { str: '2', x: 50, y: 460, width: 10, height: 11, fontSize: 11, fontFamily: 'Calibri', isBold: false, isItalic: false },
          { str: 'Tinta Printer', x: 150, y: 460, width: 80, height: 11, fontSize: 11, fontFamily: 'Calibri', isBold: false, isItalic: false },
          { str: '120.000', x: 350, y: 460, width: 45, height: 11, fontSize: 11, fontFamily: 'Calibri', isBold: false, isItalic: false }
        ],
        minX: 50,
        maxX: 395,
        lineWidth: 345,
        maxFontSize: 11,
        isBold: false,
        isItalic: false,
        alignment: 'left' as any,
        isHeading: false,
        isLargeHeading: false,
        isMediumHeading: false,
        isListItem: false,
        y: 460
      }
    ];

    const { remainingLines, detectedTables } = detectTablesInLines(lines, pageWidth);
    expect(detectedTables).toHaveLength(1);
    expect(detectedTables[0].rows).toHaveLength(3);
    expect(detectedTables[0].rows[0][0].text).toBe('No');
    expect(detectedTables[0].rows[0][1].text).toBe('Produk');
    expect(detectedTables[0].rows[0][2].text).toBe('Harga');

    expect(remainingLines).toHaveLength(0);

    // Verify DOCX Table generation produces valid Table object
    const docxTable = createDocxTable(detectedTables[0]);
    expect(docxTable).toBeDefined();
  });

  it('creates multi-run Word paragraph preserving intra-line bold and styles', () => {
    const line: FormattedLine = {
      text: 'Catatan penting: Harap simpan dokumen ini dengan aman.',
      items: [
        { str: 'Catatan penting:', x: 50, y: 500, width: 90, height: 11, fontSize: 11, fontFamily: 'Calibri', isBold: true, isItalic: false },
        { str: 'Harap', x: 145, y: 500, width: 30, height: 11, fontSize: 11, fontFamily: 'Calibri', isBold: false, isItalic: false },
        { str: 'simpan', x: 180, y: 500, width: 40, height: 11, fontSize: 11, fontFamily: 'Calibri', isBold: false, isItalic: false },
        { str: 'dokumen ini dengan aman.', x: 225, y: 500, width: 140, height: 11, fontSize: 11, fontFamily: 'Calibri', isBold: false, isItalic: false }
      ],
      minX: 50,
      maxX: 365,
      lineWidth: 315,
      maxFontSize: 11,
      isBold: false,
      isItalic: false,
      alignment: 'left' as any,
      isHeading: false,
      isLargeHeading: false,
      isMediumHeading: false,
      isListItem: false,
      y: 500
    };

    const paragraph = createDocxParagraph([line]);
    expect(paragraph).toBeDefined();
  });
});

describe('PDF to Word Engine — Real Document Inspections & Conversions', () => {
  it('inspects a digital selectable PDF correctly', async () => {
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([595, 842]);
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

    page.drawText('Laporan Tahunan 2026', { x: 50, y: 800, size: 22, font, color: rgb(0, 0, 0) });
    page.drawText('PakaiTools adalah platform utilitas online terkemuka.', { x: 50, y: 760, size: 12, font });
    page.drawText('Dokumen ini berisi informasi penting mengenai kinerja produk.', { x: 50, y: 740, size: 12, font });

    const pdfBytes = await pdfDoc.save();
    const inspection = await inspectPdfDocument(pdfBytes);

    expect(inspection.pageCount).toBe(1);
    expect(inspection.hasSelectableText).toBe(true);
    expect(inspection.isScanned).toBe(false);
    expect(inspection.documentType).toBe('digital_text');
    expect(inspection.recommendedMode).toBe('layout_preserving');
    expect(inspection.pageSizeLabel).toBe('A4');
  });

  it('inspects a scanned (image-only / 0-text) PDF and flags isScanned', async () => {
    const pdfDoc = await PDFDocument.create();
    pdfDoc.addPage([595, 842]); // blank page without text
    const pdfBytes = await pdfDoc.save();

    const inspection = await inspectPdfDocument(pdfBytes);
    expect(inspection.pageCount).toBe(1);
    expect(inspection.totalWords).toBe(0);
    expect(inspection.hasSelectableText).toBe(false);
    expect(inspection.isScanned).toBe(true);
    expect(inspection.recommendedMode).toBe('visual_fidelity');
  });

  it('rejects corrupted or invalid file buffers with CorruptedPdfError', async () => {
    const invalidBytes = new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
    await expect(inspectPdfDocument(invalidBytes)).rejects.toThrow(CorruptedPdfError);
  });

  it('converts a multi-page PDF into a valid .docx Blob with Mode A', async () => {
    const pdfDoc = await PDFDocument.create();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

    // Page 1
    const page1 = pdfDoc.addPage([595, 842]);
    page1.drawText('Halaman Utama Laporan', { x: 50, y: 800, size: 20, font, color: rgb(0, 0, 0) });
    page1.drawText('Ini adalah isi dokumen halaman pertama yang dapat diedit.', { x: 50, y: 760, size: 12, font });

    // Page 2
    const page2 = pdfDoc.addPage([595, 842]);
    page2.drawText('Halaman Kedua - Data Tambahan', { x: 50, y: 800, size: 18, font, color: rgb(0, 0, 0) });
    page2.drawText('Informasi ringkasan data tabel dan rincian transaksi.', { x: 50, y: 760, size: 12, font });

    const pdfBytes = await pdfDoc.save();

    const result = await convertPdfToDocx(pdfBytes, {
      mode: 'layout_preserving',
      detectTables: true,
      preserveFormatting: true
    });

    expect(result.blob).toBeDefined();
    expect(result.blob.size).toBeGreaterThan(1000); // valid docx zip archive is > 1KB
    expect(result.pageCount).toBe(2);
    expect(result.wordCount).toBeGreaterThan(5);
    expect(result.modeUsed).toBe('layout_preserving');
  });

  it('supports cancellation via AbortSignal without leaking resources', async () => {
    const pdfDoc = await PDFDocument.create();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const page = pdfDoc.addPage([595, 842]);
    page.drawText('Test Dokumen Pembatalan', { x: 50, y: 800, size: 14, font });
    const pdfBytes = await pdfDoc.save();

    const controller = new AbortController();
    controller.abort(); // already aborted

    await expect(
      convertPdfToDocx(pdfBytes, { signal: controller.signal })
    ).rejects.toThrow(ConversionCancelledError);
  });
});
