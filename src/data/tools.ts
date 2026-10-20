import type { ToolDefinition, ToolCategory } from '../types';

export const TOOLS: ToolDefinition[] = [
  {
    id: 'image-compressor',
    name: 'Kompres Gambar',
    slug: 'image-compressor',
    path: '/tools/image-compressor',
    category: 'image',
    categoryLabel: 'Gambar',
    shortDesc: 'Kecilkan ukuran file JPEG, PNG, dan WebP tanpa mengorbankan kualitas secara drastis.',
    description: 'Kompres foto dan gambar langsung di browser dengan pengaturan kualitas yang fleksibel. Tidak ada file yang diunggah ke server.',
    iconName: 'Minimize2',
    popular: true,
    keywords: ['kompres foto', 'kecilkan ukuran foto', 'compress image', 'jpg', 'png', 'webp', 'hemat kuota', 'kecilkan kb'],
    features: [
      'Mendukung format JPEG, PNG, dan WebP',
      'Pengaturan tingkat kualitas kompresi real-time',
      'Pemrosesan 100% lokal di browser (privasi terjaga)',
      'Perbandingan ukuran sebelum dan sesudah secara transparan',
      'Unduh satuan atau semua file sekaligus'
    ]
  },
  {
    id: 'image-resizer',
    name: 'Ubah Ukuran Gambar',
    slug: 'image-resizer',
    path: '/tools/image-resizer',
    category: 'image',
    categoryLabel: 'Gambar',
    shortDesc: 'Ubah resolusi lebar dan tinggi gambar dalam piksel atau persentase dengan kunci rasio.',
    description: 'Atur dimensi gambar dengan presisi. Dilengkapi preset media sosial populer seperti Instagram, YouTube, dan Twitter.',
    iconName: 'Maximize2',
    popular: true,
    keywords: ['ubah ukuran gambar', 'resize foto', 'ubah resolusi', 'skala gambar', 'rasio', 'preset sosial media'],
    features: [
      'Ubah piksel (lebar x tinggi) atau persentase',
      'Fitur kunci rasio aspek otomatis',
      'Preset ukuran media sosial siap pakai',
      'Pilihan format ekspor (PNG, JPEG, WebP)',
      'Pratinjau langsung hasil dimensi'
    ]
  },
  {
    id: 'image-converter',
    name: 'Konversi Format Gambar',
    slug: 'image-converter',
    path: '/tools/image-converter',
    category: 'image',
    categoryLabel: 'Gambar',
    shortDesc: 'Ubah format gambar antara JPG, PNG, dan WebP secara instan dengan deteksi MIME nyata.',
    description: 'Konversi file gambar ke format yang kamu butuhkan. Dilengkapi opsi warna latar belakang untuk transparansi saat konversi ke JPEG.',
    iconName: 'RefreshCw',
    popular: true,
    keywords: ['konversi jpg', 'png ke webp', 'jpg ke png', 'ubah format foto', 'webp converter'],
    features: [
      'Konversi antar format JPEG, PNG, dan WebP',
      'Mempertahankan transparansi pada format yang mendukung',
      'Pilihan warna background saat mengekspor ke JPEG',
      'Encoding MIME nyata, bukan sekadar mengubah nama ekstensi',
      'Mendukung proses beberapa file sekaligus'
    ]
  },
  {
    id: 'qr-generator',
    name: 'Buat QR Code',
    slug: 'qr-generator',
    path: '/tools/qr-generator',
    category: 'qr',
    categoryLabel: 'QR Code',
    shortDesc: 'Buat QR code instan untuk link URL, teks biasa, sandi Wi-Fi, email, atau nomor telepon.',
    description: 'Generator QR code serbaguna dengan pengaturan warna latar dan modul kontras tinggi, opsi ukuran, dan unduh format PNG atau SVG.',
    iconName: 'QrCode',
    popular: true,
    keywords: ['buat qr code', 'qr wifi', 'qr url', 'qr text', 'generator qr', 'bikin barcode'],
    features: [
      'Pilihan tipe data: URL, Teks, Wi-Fi, Email, dan Telepon',
      'Format Wi-Fi standar (WPA/WPA2/WEP) siap scan',
      'Kustomisasi warna modul dan background dengan kontras aman',
      'Unduh resolusi tinggi dalam format PNG atau SVG vektor',
      'Pratinjau langsung saat mengetik'
    ]
  },
  {
    id: 'image-cropper',
    name: 'Potong Gambar (Crop)',
    slug: 'image-cropper',
    path: '/tools/image-cropper',
    category: 'image',
    categoryLabel: 'Gambar',
    shortDesc: 'Potong bagian gambar tertentu dengan rasio tetap 1:1, 4:5, 16:9, 9:16, atau bebas.',
    description: 'Alat pemotong gambar interaktif di browser. Sesuaikan area bingkai foto untuk profil, postingan feed, story, maupun banner.',
    iconName: 'Crop',
    popular: false,
    keywords: ['potong foto', 'crop gambar', 'rasio 1:1', '16:9', 'pas foto', 'crop foto profil'],
    features: [
      'Rasio aspek instan: 1:1 (persegi), 4:5, 16:9, 9:16, dan bebas (freeform)',
      'Kontrol sentuh dan drag yang responsif',
      'Pratinjau hasil crop secara real-time',
      'Ekspor hasil crop ke PNG, JPEG, atau WebP',
      'Fitur reset area crop kapan saja'
    ]
  },
  {
    id: 'qr-scanner',
    name: 'Scan QR Code',
    slug: 'qr-scanner',
    path: '/tools/qr-scanner',
    category: 'qr',
    categoryLabel: 'QR Code',
    shortDesc: 'Pindai dan baca isi QR code melalui unggahan file gambar atau langsung dari kamera perangkat.',
    description: 'Pembaca QR code yang aman. Menampilkan teks yang terenkapsulasi secara aman tanpa navigasi otomatis berbahaya.',
    iconName: 'ScanLine',
    popular: false,
    keywords: ['scan qr', 'baca qr code', 'kamera qr', 'pindai barcode', 'decode qr'],
    features: [
      'Dua metode: unggah foto QR atau gunakan kamera perangkat',
      'Akses kamera hanya diminta jika pengguna secara eksplisit mengaktifkannya',
      'Stream kamera langsung dihentikan saat keluar/selesai',
      'Keamanan tinggi: tidak ada navigasi otomatis ke link sembarangan',
      'Salin hasil baca atau buka link secara sadar'
    ]
  },
  {
    id: 'favicon-generator',
    name: 'Buat Favicon Website',
    slug: 'favicon-generator',
    path: '/tools/favicon-generator',
    category: 'image',
    categoryLabel: 'Gambar',
    shortDesc: 'Hasilkan paket favicon lengkap (16px, 32px, 48px, Apple Touch Icon) dan file .ICO asli.',
    description: 'Generator favicon khusus untuk developer dan pemilik website. Menghasilkan format PNG berbagai dimensi serta file ICO biner asli.',
    iconName: 'Globe',
    popular: false,
    keywords: ['buat favicon', 'favicon ico', 'icon website', 'png to ico', 'apple touch icon'],
    features: [
      'Hasilkan ukuran standar: 16x16, 32x32, 48x48, 64x64, 180x180, dan 512x512',
      'Format .ICO nyata biner multi-resolusi',
      'Unduh seluruh paket dalam satu file ZIP atau unduh satuan',
      'Dilengkapi cuplikan kode HTML siap tempel ke website',
      'Pratinjau tampilan di bilah tab browser simulasi'
    ]
  },
  {
    id: 'word-counter',
    name: 'Hitung Kata & Karakter',
    slug: 'word-counter',
    path: '/tools/word-counter',
    category: 'text',
    categoryLabel: 'Teks',
    shortDesc: 'Analisis teks instan: jumlah kata, karakter dengan/tanpa spasi, baris, paragraf, dan estimasi waktu baca.',
    description: 'Utility hitung statistik teks yang akurat dan mendukung penanganan multibyte Unicode. Sangat cocok untuk esai, artikel, atau caption media sosial.',
    iconName: 'FileText',
    popular: false,
    keywords: ['hitung kata', 'word count', 'karakter', 'paragraf', 'estimasi baca', 'jumlah karakter twitter'],
    features: [
      'Metrik lengkap: kata, karakter, karakter tanpa spasi',
      'Perhitungan jumlah baris dan paragraf nyata',
      'Estimasi waktu baca (reading time) rata-rata',
      'Pembersihan dan salin teks dengan sekali klik',
      'Unicode-aware, bekerja akurat untuk berbagai simbol'
    ]
  },
  {
    id: 'case-converter',
    name: 'Ubah Huruf Besar / Kecil',
    slug: 'case-converter',
    path: '/tools/case-converter',
    category: 'text',
    categoryLabel: 'Teks',
    shortDesc: 'Ubah kapitalisasi teks ke UPPERCASE, lowercase, Title Case, Sentence case, camelCase, dan lainnya.',
    description: 'Konversi gaya penulisan huruf secara instan. Menjaga struktur baris baru dan paragraf tetap utuh.',
    iconName: 'Type',
    popular: false,
    keywords: ['uppercase', 'lowercase', 'title case', 'sentence case', 'kapital', 'huruf besar kecil', 'camelcase'],
    features: [
      'Pilihan: UPPERCASE, lowercase, Title Case, Sentence case',
      'Format kode: camelCase, snake_case, kebab-case',
      'Mempertahankan format baris baru (line breaks)',
      'Salin hasil konversi ke papan klip dengan satu klik',
      'Tombol bersihkan teks seketika'
    ]
  },
  {
    id: 'text-cleaner',
    name: 'Pembersih Teks',
    slug: 'text-cleaner',
    path: '/tools/text-cleaner',
    category: 'text',
    categoryLabel: 'Teks',
    shortDesc: 'Hapus spasi berlebih, baris kosong, baris duplikat, dan rapikan spasi teks secara otomatis.',
    description: 'Alat sanitasi teks untuk merapikan draf dokumen, daftar data, atau teks hasil salinan yang berantakan.',
    iconName: 'Eraser',
    popular: false,
    keywords: ['bersihkan teks', 'hapus spasi ganda', 'hapus baris kosong', 'trim', 'hapus duplikat'],
    features: [
      'Trim spasi di awal dan akhir teks',
      'Hapus spasi ganda yang berulang',
      'Hapus baris-baris kosong (empty lines)',
      'Hapus baris duplikat unik',
      'Normalisasi pemisah baris (line endings)'
    ]
  },
  {
    id: 'url-encoder',
    name: 'URL Encoder & Decoder',
    slug: 'url-encoder',
    path: '/tools/url-encoder',
    category: 'text',
    categoryLabel: 'Teks',
    shortDesc: 'Encode dan decode string URL komponen atau alamat web lengkap dengan aman dan teruji.',
    description: 'Ubah karakter khusus menjadi format persen (%) URL yang aman atau kembalikan URL terenkripsi ke teks asli yang dapat dibaca manusia.',
    iconName: 'Link',
    popular: false,
    keywords: ['encode url', 'decode url', 'url component', 'link escape', 'percent encoding'],
    features: [
      'Pilihan Encode & Decode untuk URL Component (encodeURIComponent)',
      'Pilihan Encode & Decode untuk Full URI (encodeURI)',
      'Validasi error untuk format URL yang rusak atau cacat',
      'Salin teks hasil ke clipboard instan',
      'Penjelasan teknis perbedaan kedua mode encoding'
    ]
  },
  {
    id: 'image-to-pdf',
    name: 'JPG / Gambar ke PDF',
    slug: 'image-to-pdf',
    path: '/tools/image-to-pdf',
    category: 'pdf',
    categoryLabel: 'PDF',
    shortDesc: 'Ubah atau gabungkan banyak gambar JPG, PNG, dan WebP menjadi satu dokumen PDF rapi.',
    description: 'Konversi kumpulan file foto atau scan gambar menjadi dokumen PDF. Atur tata letak A4, Letter, atau ukuran asli (Fit), orientasi halaman, serta margin sesuai kebutuhan.',
    iconName: 'FileImage',
    popular: true,
    keywords: ['jpg ke pdf', 'gambar ke pdf', 'png to pdf', 'convert image to pdf', 'gabung foto jadi pdf', 'buat pdf dari gambar'],
    features: [
      'Mendukung format JPG, JPEG, PNG, dan WebP',
      'Pilihan ukuran halaman: A4, Letter, atau Fit to Image',
      'Orientasi fleksibel: Otomatis, Portrait, atau Landscape',
      'Pengaturan margin (Tanpa margin, Sempit, Normal)',
      'Bisa atur ulang urutan foto dan unduh instan tanpa batas'
    ]
  },
  {
    id: 'compress-pdf',
    name: 'Kompres PDF',
    slug: 'compress-pdf',
    path: '/tools/compress-pdf',
    category: 'pdf',
    categoryLabel: 'PDF',
    shortDesc: 'Kecilkan ukuran file PDF langsung di browser tanpa mengunggah dokumen rahasiamu ke server.',
    description: 'Kompres dokumen PDF agar mudah dikirim melalui email atau WhatsApp. Mengoptimalkan halaman langsung di perangkat dengan transparansi persentase penghematan ukuran.',
    iconName: 'FileArchive',
    popular: true,
    keywords: ['kompres pdf', 'kecilkan ukuran pdf', 'compress pdf', 'pdf 300kb', 'kecilkan file pdf', 'hemat ukuran pdf'],
    features: [
      'Pilihan profil kompresi: Ekstrem, Rekomendasi, dan Ringan',
      '100% pemrosesan lokal di browser (privasi dokumen terjamin)',
      'Perbandingan ukuran file asli vs hasil kompresi secara nyata',
      'Pratinjau progres kompresi per halaman',
      'Unduh langsung tanpa watermark atau pembatasan kuota'
    ]
  },
  {
    id: 'pdf-to-word',
    name: 'PDF ke Word (.docx)',
    slug: 'pdf-to-word',
    path: '/tools/pdf-to-word',
    category: 'pdf',
    categoryLabel: 'PDF',
    shortDesc: 'Ekstrak dan ubah dokumen PDF menjadi file Microsoft Word (.docx) yang bisa diedit.',
    description: 'Konversi file PDF menjadi dokumen Word (.docx) nyata. Ekstrak teks digital secara rapi per paragraf dan halaman tanpa mengirim file ke internet.',
    iconName: 'FileEdit',
    popular: true,
    keywords: ['pdf ke word', 'pdf to docx', 'convert pdf to word', 'ubah pdf jadi docx', 'edit file pdf', 'ekstrak teks pdf'],
    features: [
      'Menghasilkan file Microsoft Word (.docx) asli yang kompatibel dengan Word, WPS, dan Google Docs',
      'Menjaga struktur baris, paragraf, dan batas halaman',
      'Pemrosesan 100% di browser pengguna tanpa upload ke server',
      'Dilengkapi pendeteksi halaman teks digital vs gambar scan',
      'Unduh gratis tanpa batasan halaman'
    ]
  },
  {
    id: 'word-to-pdf',
    name: 'Word (.docx) ke PDF',
    slug: 'word-to-pdf',
    path: '/tools/word-to-pdf',
    category: 'pdf',
    categoryLabel: 'PDF',
    shortDesc: 'Konversi file dokumen Microsoft Word (.docx) menjadi file PDF siap cetak atau siap kirim.',
    description: 'Ubah file dokumen .docx menjadi format PDF dengan tata letak dokumen yang rapi. Tidak memerlukan Microsoft Word atau instalasi aplikasi tambahan.',
    iconName: 'FileType',
    popular: true,
    keywords: ['word ke pdf', 'docx to pdf', 'convert word to pdf', 'ubah docx jadi pdf', 'bikin pdf dari word'],
    features: [
      'Mendukung file dokumen Microsoft Word .docx standar',
      'Mempertahankan format judul, paragraf, cetak tebal, miring, dan daftar (list)',
      'Pilihan ukuran halaman A4 atau Letter dengan margin proporsional',
      'Pratinjau HTML isi dokumen sebelum konversi',
      '100% aman dan privat, dokumen tidak pernah meninggalkan komputermu'
    ]
  }
];

export const POPULAR_TOOLS = TOOLS.filter(t => t.popular);

export function getToolBySlug(slug: string): ToolDefinition | undefined {
  return TOOLS.find(t => t.slug === slug);
}

export function searchTools(query: string, category: ToolCategory = 'all'): ToolDefinition[] {
  const cleanQ = query.trim().toLowerCase();
  
  return TOOLS.filter(tool => {
    // Filter by category
    if (category !== 'all' && tool.category !== category) {
      return false;
    }
    
    if (!cleanQ) return true;
    
    // Match against name, description, category, and keywords
    const matchesName = tool.name.toLowerCase().includes(cleanQ);
    const matchesDesc = tool.shortDesc.toLowerCase().includes(cleanQ) || tool.description.toLowerCase().includes(cleanQ);
    const matchesCat = tool.categoryLabel.toLowerCase().includes(cleanQ);
    const matchesKeywords = tool.keywords.some(k => k.toLowerCase().includes(cleanQ));
    
    return matchesName || matchesDesc || matchesCat || matchesKeywords;
  });
}
