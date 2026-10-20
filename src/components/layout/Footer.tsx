import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, Wrench } from 'lucide-react';

export const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer style={{
      marginTop: 'auto',
      borderTop: '1px solid var(--border-color)',
      backgroundColor: 'var(--bg-surface)',
      paddingTop: '48px',
      paddingBottom: '32px',
      color: 'var(--text-secondary)',
      fontSize: '0.875rem'
    }}>
      <div className="container">
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '32px',
          marginBottom: '40px'
        }}>
          {/* Brand Col */}
          <div style={{ maxWidth: '320px' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontWeight: 700,
              fontSize: '1.125rem',
              color: 'var(--text-primary)',
              marginBottom: '12px'
            }}>
              <div style={{
                width: '24px',
                height: '24px',
                borderRadius: '4px',
                backgroundColor: 'var(--accent-primary)',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Wrench size={14} />
              </div>
              <span>PakaiTools</span>
            </div>
            <p style={{ lineHeight: 1.6, marginBottom: '16px' }}>
              Platform utilitas digital gratis untuk menyelesaikan tugas harian dengan cepat, tanpa ribet, dan aman langsung di browser.
            </p>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '0.8125rem',
              color: 'var(--accent-text)',
              backgroundColor: 'var(--accent-subtle)',
              padding: '6px 10px',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid #C3E2D0'
            }}>
              <Shield size={14} />
              <span>Privasi terjamin: file diproses lokal</span>
            </div>
          </div>

          {/* Tools Gambar */}
          <div>
            <h4 style={{ color: 'var(--text-primary)', fontWeight: 600, marginBottom: '14px', fontSize: '0.9375rem' }}>
              Tools Gambar
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <li><Link to="/tools/image-compressor" style={{ color: 'var(--text-secondary)' }}>Kompres Gambar</Link></li>
              <li><Link to="/tools/image-resizer" style={{ color: 'var(--text-secondary)' }}>Ubah Ukuran Gambar</Link></li>
              <li><Link to="/tools/image-converter" style={{ color: 'var(--text-secondary)' }}>Konversi Format Gambar</Link></li>
              <li><Link to="/tools/image-cropper" style={{ color: 'var(--text-secondary)' }}>Potong Gambar (Crop)</Link></li>
              <li><Link to="/tools/favicon-generator" style={{ color: 'var(--text-secondary)' }}>Generator Favicon</Link></li>
            </ul>
          </div>

          {/* Tools PDF */}
          <div>
            <h4 style={{ color: 'var(--text-primary)', fontWeight: 600, marginBottom: '14px', fontSize: '0.9375rem' }}>
              Tools PDF
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <li><Link to="/tools/image-to-pdf" style={{ color: 'var(--text-secondary)' }}>JPG ke PDF</Link></li>
              <li><Link to="/tools/compress-pdf" style={{ color: 'var(--text-secondary)' }}>Kompres PDF</Link></li>
              <li><Link to="/tools/pdf-to-word" style={{ color: 'var(--text-secondary)' }}>PDF ke Word (.docx)</Link></li>
              <li><Link to="/tools/word-to-pdf" style={{ color: 'var(--text-secondary)' }}>Word ke PDF</Link></li>
            </ul>
          </div>

          {/* Tools QR & Teks */}
          <div>
            <h4 style={{ color: 'var(--text-primary)', fontWeight: 600, marginBottom: '14px', fontSize: '0.9375rem' }}>
              QR Code & Teks
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <li><Link to="/tools/qr-generator" style={{ color: 'var(--text-secondary)' }}>Buat QR Code</Link></li>
              <li><Link to="/tools/qr-scanner" style={{ color: 'var(--text-secondary)' }}>Scan QR Code</Link></li>
              <li><Link to="/tools/word-counter" style={{ color: 'var(--text-secondary)' }}>Hitung Kata & Karakter</Link></li>
              <li><Link to="/tools/case-converter" style={{ color: 'var(--text-secondary)' }}>Ubah Huruf Besar / Kecil</Link></li>
              <li><Link to="/tools/text-cleaner" style={{ color: 'var(--text-secondary)' }}>Pembersih Teks</Link></li>
              <li><Link to="/tools/url-encoder" style={{ color: 'var(--text-secondary)' }}>URL Encoder / Decoder</Link></li>
            </ul>
          </div>

          {/* Informasi & Kebijakan */}
          <div>
            <h4 style={{ color: 'var(--text-primary)', fontWeight: 600, marginBottom: '14px', fontSize: '0.9375rem' }}>
              Informasi & Kebijakan
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <li><Link to="/about" style={{ color: 'var(--text-secondary)' }}>Tentang Kami</Link></li>
              <li><Link to="/privacy" style={{ color: 'var(--text-secondary)' }}>Kebijakan Privasi</Link></li>
              <li><Link to="/terms" style={{ color: 'var(--text-secondary)' }}>Syarat & Ketentuan</Link></li>
              <li><Link to="/disclaimer" style={{ color: 'var(--text-secondary)' }}>Disclaimer</Link></li>
              <li><Link to="/contact" style={{ color: 'var(--text-secondary)' }}>Kontak Dukungan</Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div style={{
          borderTop: '1px solid var(--border-color)',
          paddingTop: '20px',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px',
          fontSize: '0.8125rem'
        }}>
          <div>
            © {currentYear} PakaiTools. Dibuat dengan standar performa dan privasi tinggi.
          </div>
          <div>
            Bahasa Indonesia · Pemrosesan Sisi Klien (Client-Side)
          </div>
        </div>
      </div>
    </footer>
  );
};
