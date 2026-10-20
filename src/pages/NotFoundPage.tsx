import React from 'react';
import { Link } from 'react-router-dom';
import { Home, Search } from 'lucide-react';
import { SeoHead } from '../components/tools/SeoHead';

export const NotFoundPage: React.FC = () => {
  return (
    <div style={{ paddingTop: '80px', paddingBottom: '80px', textAlign: 'center' }}>
      <SeoHead
        title="404 — Halaman Tidak Ditemukan"
        description="Maaf, halaman yang Anda tuju tidak ditemukan di platform PakaiTools."
      />

      <div className="container" style={{ maxWidth: '580px' }}>
        <div style={{
          fontSize: '5rem',
          fontWeight: 800,
          color: 'var(--text-muted)',
          lineHeight: 1,
          marginBottom: '16px',
          letterSpacing: '-0.05em'
        }}>
          404
        </div>

        <h1 style={{
          fontSize: '1.75rem',
          fontWeight: 700,
          color: 'var(--text-primary)',
          marginBottom: '12px',
          letterSpacing: '-0.02em'
        }}>
          Halaman Tidak Ditemukan
        </h1>

        <p style={{
          fontSize: '1rem',
          color: 'var(--text-secondary)',
          lineHeight: 1.6,
          marginBottom: '32px'
        }}>
          Maaf, tautan yang Anda tuju mungkin sudah dipindahkan, dihapus, atau salah ketik. Silakan kembali ke beranda untuk menjelajahi seluruh tools yang tersedia.
        </p>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <Link to="/" className="btn btn-primary btn-lg">
            <Home size={16} />
            <span>Kembali ke Beranda</span>
          </Link>
          <Link to="/#katalog-tools" className="btn btn-secondary btn-lg">
            <Search size={16} />
            <span>Cari Tools</span>
          </Link>
        </div>
      </div>
    </div>
  );
};
