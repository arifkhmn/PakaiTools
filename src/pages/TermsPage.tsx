import React from 'react';
import { SeoHead } from '../components/tools/SeoHead';
import { Breadcrumbs } from '../components/layout/Breadcrumbs';

export const TermsPage: React.FC = () => {
  return (
    <div style={{ paddingTop: '32px', paddingBottom: '64px' }}>
      <SeoHead
        title="Syarat dan Ketentuan"
        description="Syarat dan ketentuan penggunaan platform utilitas web gratis PakaiTools."
        canonicalPath="/terms"
      />

      <div className="container" style={{ maxWidth: '860px' }}>
        <Breadcrumbs items={[{ label: 'Syarat & Ketentuan' }]} />

        <div style={{ marginBottom: '32px' }}>
          <h1 style={{
            fontSize: 'clamp(2rem, 3.5vw, 2.5rem)',
            fontWeight: 800,
            letterSpacing: '-0.025em',
            color: 'var(--text-primary)',
            marginBottom: '12px'
          }}>
            Syarat dan Ketentuan Penggunaan
          </h1>
          <p style={{ fontSize: '1.0625rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            Terakhir diperbarui: {new Date().getFullYear()}
          </p>
        </div>

        <div className="panel" style={{ lineHeight: 1.7, color: 'var(--text-secondary)', fontSize: '0.9375rem' }}>
          <p style={{ marginBottom: '16px' }}>
            Selamat datang di PakaiTools. Dengan mengakses dan menggunakan platform ini, Anda menyetujui untuk terikat oleh syarat dan ketentuan penggunaan berikut:
          </p>

          <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '12px' }}>
            1. Hak Penggunaan Layanan
          </h2>
          <p style={{ marginBottom: '16px' }}>
            PakaiTools memberikan Anda lisensi non-eksklusif, bebas royalti, dan dapat dicabut sewaktu-waktu untuk menggunakan utilitas web yang kami sediakan untuk keperluan pribadi, pendidikan, maupun komersial yang sah sesuai dengan hukum yang berlaku di Republik Indonesia.
          </p>

          <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-primary)', marginTop: '24px', marginBottom: '12px' }}>
            2. Larangan Penggunaan
          </h2>
          <p style={{ marginBottom: '16px' }}>
            Anda dilarang menggunakan platform ini untuk:
          </p>
          <ul style={{ paddingLeft: '20px', marginBottom: '16px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <li>Menghasilkan kode QR atau konten yang mengarahkan ke situs berbahaya, phishing, malware, atau penipuan.</li>
            <li>Melakukan tindakan yang merusak, mengganggu, atau membebani integritas infrastruktur web kami.</li>
            <li>Mencoba merekayasa balik sistem dengan tujuan melanggar hukum atau merugikan pihak lain.</li>
          </ul>

          <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-primary)', marginTop: '24px', marginBottom: '12px' }}>
            3. Kepemilikan dan Hak Cipta File
          </h2>
          <p style={{ marginBottom: '16px' }}>
            Anda tetap memiliki hak cipta dan kepemilikan penuh atas setiap berkas gambar, dokumen, teks, atau konten lain yang Anda proses menggunakan PakaiTools. Kami tidak mengklaim hak kepemilikan apa pun atas file Anda.
          </p>

          <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-primary)', marginTop: '24px', marginBottom: '12px' }}>
            4. Ketersediaan Layanan
          </h2>
          <p>
            Kami berusaha menjaga agar platform selalu dapat diakses secara optimal, namun kami tidak menjamin bahwa layanan akan bebas dari gangguan teknis atau selalu tersedia tanpa jeda pemeliharaan.
          </p>
        </div>
      </div>
    </div>
  );
};
