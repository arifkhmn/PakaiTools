import { describe, it, expect } from 'vitest';
import { formatBytes, formatNumber } from '../lib/format';
import {
  escapeWifiString,
  buildWifiQrString,
  buildEmailQrString,
  buildPhoneQrString
} from '../lib/qrHelper';
import {
  analyzeText,
  toUpperCase,
  toLowerCase,
  toTitleCase,
  toSentenceCase,
  toCamelCase,
  toSnakeCase,
  toKebabCase,
  cleanText,
  encodeUrlComponent,
  decodeUrlComponent,
  encodeFullUrl,
  decodeFullUrl
} from '../lib/textHelpers';
import { TOOLS, searchTools, getToolBySlug } from '../data/tools';

describe('Format Utilities', () => {
  it('formats bytes correctly into human readable strings', () => {
    expect(formatBytes(0)).toBe('0 B');
    expect(formatBytes(512)).toBe('512 B');
    expect(formatBytes(1024)).toBe('1 KB');
    expect(formatBytes(1536)).toBe('1.5 KB');
    expect(formatBytes(1048576)).toBe('1 MB');
    expect(formatBytes(1073741824)).toBe('1 GB');
  });

  it('formats numbers with thousand separators', () => {
    expect(formatNumber(1000)).toMatch(/1[.,]000/);
    expect(formatNumber(1250000)).toMatch(/1[.,]250[.,]000/);
  });
});

describe('QR Helper Utilities', () => {
  it('escapes special characters in WiFi credentials according to spec', () => {
    expect(escapeWifiString('my;pass:word\\test"')).toBe('my\\;pass\\:word\\\\test\\"');
  });

  it('builds standard WiFi QR strings correctly', () => {
    const wifiString = buildWifiQrString({
      ssid: 'Kantor_Utama',
      password: 'rahasia;123',
      encryption: 'WPA',
      hidden: false
    });
    expect(wifiString).toBe('WIFI:S:Kantor_Utama;T:WPA;P:rahasia\\;123;;');

    const openWifi = buildWifiQrString({
      ssid: 'Free_Wifi',
      password: '',
      encryption: 'nopass',
      hidden: true
    });
    expect(openWifi).toBe('WIFI:S:Free_Wifi;T:nopass;P:;H:true;;');
  });

  it('builds email mailto strings with proper query encoding', () => {
    const emailStr = buildEmailQrString({
      address: 'halo@pakaitools.id',
      subject: 'Halo PakaiTools',
      body: 'Terima kasih atas tools gratisnya!'
    });
    expect(emailStr).toBe('mailto:halo@pakaitools.id?subject=Halo%20PakaiTools&body=Terima%20kasih%20atas%20tools%20gratisnya!');
  });

  it('builds phone tel strings cleanly', () => {
    expect(buildPhoneQrString('+62 812-3456-7890')).toBe('tel:+6281234567890');
  });
});

describe('Text Helper Utilities', () => {
  it('analyzes text statistics accurately with Unicode support', () => {
    const sample = 'PakaiTools adalah platform web praktis.\n\nSangat cepat dan privat!';
    const stats = analyzeText(sample);

    expect(stats.words).toBe(9);
    expect(stats.characters).toBe(sample.length);
    expect(stats.paragraphs).toBe(2);
    expect(stats.lines).toBe(3);
    expect(stats.readingTimeMinutes).toBe(1);
  });

  it('converts casing styles accurately', () => {
    const input = 'selamat datang di pakaitools';

    expect(toUpperCase(input)).toBe('SELAMAT DATANG DI PAKAITOOLS');
    expect(toLowerCase('PAKAI TOOLS')).toBe('pakai tools');
    expect(toTitleCase('selamat datang di pakaitools')).toBe('Selamat Datang di Pakaitools');
    expect(toSentenceCase('halo dunia. apa kabar? baik!')).toBe('Halo dunia. Apa kabar? Baik!');
    expect(toCamelCase('halo dunia cerah')).toBe('haloDuniaCerah');
    expect(toSnakeCase('halo dunia cerah')).toBe('halo_dunia_cerah');
    expect(toKebabCase('halo dunia cerah')).toBe('halo-dunia-cerah');
  });

  it('cleans and sanitizes messy text', () => {
    const messy = '   Halo    dunia!   \n\n\nBaris kedua   \nBaris kedua\n\n';
    const cleaned = cleanText(messy, {
      trimEdges: true,
      removeDuplicateSpaces: true,
      removeBlankLines: true,
      removeDuplicateLines: true,
      normalizeLineEndings: true
    });

    expect(cleaned).toBe('Halo dunia!\nBaris kedua');
  });

  it('encodes and decodes URL components and full URIs correctly', () => {
    const raw = 'nama=Budi & Andi & umur=25';
    const encodedComp = encodeUrlComponent(raw);
    expect(encodedComp).toBe('nama%3DBudi%20%26%20Andi%20%26%20umur%3D25');
    expect(decodeUrlComponent(encodedComp)).toBe(raw);

    const fullUrl = 'https://pakaitools.id/cari?q=kompres foto';
    const encodedFull = encodeFullUrl(fullUrl);
    expect(encodedFull).toBe('https://pakaitools.id/cari?q=kompres%20foto');
    expect(decodeFullUrl(encodedFull)).toBe(fullUrl);
  });
});

describe('Tool Registry and Search Engine', () => {
  it('registers all 15 required tools with valid metadata and paths', () => {
    expect(TOOLS.length).toBe(15);

    const requiredSlugs = [
      'image-compressor',
      'image-resizer',
      'image-converter',
      'qr-generator',
      'image-cropper',
      'qr-scanner',
      'favicon-generator',
      'word-counter',
      'case-converter',
      'text-cleaner',
      'url-encoder',
      'image-to-pdf',
      'compress-pdf',
      'pdf-to-word',
      'word-to-pdf'
    ];

    for (const slug of requiredSlugs) {
      const tool = getToolBySlug(slug);
      expect(tool).toBeDefined();
      expect(tool?.path).toBe(`/tools/${slug}`);
      expect(tool?.name).toBeTruthy();
      expect(tool?.description).toBeTruthy();
    }
  });

  it('filters tools by Indonesian search keywords and tasks', () => {
    const compressResults = searchTools('kompres foto');
    expect(compressResults.some(t => t.id === 'image-compressor')).toBe(true);

    const qrResults = searchTools('qr wifi');
    expect(qrResults.some(t => t.id === 'qr-generator')).toBe(true);

    const wordCountResults = searchTools('hitung kata');
    expect(wordCountResults.some(t => t.id === 'word-counter')).toBe(true);

    const pdfWordResults = searchTools('pdf to docx');
    expect(pdfWordResults.some(t => t.id === 'pdf-to-word')).toBe(true);

    const compressPdfResults = searchTools('kompres pdf');
    expect(compressPdfResults.some(t => t.id === 'compress-pdf')).toBe(true);

    // Category filter
    const textOnly = searchTools('', 'text');
    expect(textOnly.every(t => t.category === 'text')).toBe(true);
    expect(textOnly.length).toBe(4);

    const pdfOnly = searchTools('', 'pdf');
    expect(pdfOnly.every(t => t.category === 'pdf')).toBe(true);
    expect(pdfOnly.length).toBe(4);
  });
});
