import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { SeoHead } from '../components/tools/SeoHead';
import { Breadcrumbs } from '../components/layout/Breadcrumbs';

export const AboutPage: React.FC = () => {
  return (
    <div style={{ paddingTop: '32px', paddingBottom: '64px' }}>
      <SeoHead
        title="Tentang PakaiTools"
        description="Pelajari visi, misi, dan prinsip rekayasa di balik platform utilitas PakaiTools — cepat, gratis, dan privat."
        canonicalPath="/about"
      />

      <div className="container" style={{ maxWidth: '860px' }}>
        <Breadcrumbs items={[{ label: 'Tentang Kami' }]} />

        <div style={{ marginBottom: '32px' }}>
          <h1 style={{
            fontSize: 'clamp(2rem, 3.5vw, 2.5rem)',
            fontWeight: 800,
            letterSpacing: '-0.025em',
            color: 'var(--text-primary)',
            marginBottom: '12px'
          }}>
            Tentang PakaiTools
          </h1>
          <p style={{ fontSize: '1.125rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            Platform utilitas digital independen yang dibangun untuk menyelesaikan kebutuhan praktis harian secara gratis, cepat, dan mengutamakan privasi pengguna.
          </p>
        </div>

        <div className="panel" style={{ marginBottom: '32px', lineHeight: 1.7, color: 'var(--text-secondary)', fontSize: '0.9375rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '12px' }}>
            Visi Produk
          </h2>
          <p style={{ marginBottom: '16px' }}>
            Di era digital saat ini, banyak tugas sederhana — seperti mengecilkan ukuran foto untuk formulir pendaftaran, mengubah format gambar untuk marketplace, atau membuat QR code untuk kafe — dipersulit oleh aplikasi yang mewajibkan pembuatan akun, dipenuhi iklan popup invasif, atau meminta langganan berbayar.
          </p>
          <p style={{ marginBottom: '16px' }}>
            <strong>PakaiTools</strong> hadir dengan prinsip berbeda: alat bantu online harus langsung bekerja ketika dibutuhkan, tanpa hambatan, dan tanpa mengambil keuntungan dari data pribadi pengguna.
          </p>

          <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-primary)', marginTop: '24px', marginBottom: '12px' }}>
            Prinsip Inti Desain &amp; Rekayasa
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', marginTop: '16px' }}>
            <div style={{ padding: '16px', backgroundColor: 'var(--bg-surface)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
              <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>1. Berguna Sebelum Dekoratif</div>
              <p style={{ fontSize: '0.8125rem' }}>Fokus pada fungsionalitas nyata dan hasil yang presisi daripada animasi yang berlebihan.</p>
            </div>
            <div style={{ padding: '16px', backgroundColor: 'var(--bg-surface)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
              <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>2. Cepat Sebelum Mencolok</div>
              <p style={{ fontSize: '0.8125rem' }}>Antarmuka yang bersih, waktu muat instan, dan bebas dari pelacak berat.</p>
            </div>
            <div style={{ padding: '16px', backgroundColor: 'var(--bg-surface)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
              <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>3. Jelas Sebelum Pintar</div>
              <p style={{ fontSize: '0.8125rem' }}>Setiap tombol, slider, dan opsi dijelaskan dengan bahasa Indonesia yang natural.</p>
            </div>
            <div style={{ padding: '16px', backgroundColor: 'var(--bg-surface)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
              <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>4. Privasi Penuh (Client-Side)</div>
              <p style={{ fontSize: '0.8125rem' }}>File diolah langsung di peramban web pengguna dan tidak pernah dikirim ke server luar.</p>
            </div>
          </div>

          <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-primary)', marginTop: '28px', marginBottom: '12px' }}>
            Untuk Siapa PakaiTools Dibuat?
          </h2>
          <ul style={{ paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <li><strong>Pelajar &amp; Mahasiswa:</strong> Mempersiapkan berkas administrasi kuliah, beasiswa, atau tugas karya ilmiah.</li>
            <li><strong>Penjual Online &amp; UMKM:</strong> Menyesuaikan foto katalog produk marketplace dan membuat QR pembayaran atau link toko.</li>
            <li><strong>Kreator Konten &amp; Freelancer:</strong> Merapikan teks draf, menyiapkan format favicon, dan crop gambar media sosial.</li>
            <li><strong>Pekerja Kantoran &amp; Profesional:</strong> Memproses dokumen teks dan kompresi lampiran email harian secara cepat.</li>
          </ul>
        </div>

        <div style={{ textAlign: 'center', marginTop: '36px' }}>
          <Link to="/" className="btn btn-primary btn-lg">
            <span>Mulai Gunakan Tools</span>
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </div>
  );
};
