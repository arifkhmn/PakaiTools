import React from 'react';
import { ShieldCheck } from 'lucide-react';
import { SeoHead } from '../components/tools/SeoHead';
import { Breadcrumbs } from '../components/layout/Breadcrumbs';

export const PrivacyPage: React.FC = () => {
  return (
    <div style={{ paddingTop: '32px', paddingBottom: '64px' }}>
      <SeoHead
        title="Kebijakan Privasi"
        description="Kebijakan privasi transparan PakaiTools: bagaimana kami memproses file Anda secara lokal di browser tanpa pernah mengunggahnya ke server."
        canonicalPath="/privacy"
      />

      <div className="container" style={{ maxWidth: '860px' }}>
        <Breadcrumbs items={[{ label: 'Kebijakan Privasi' }]} />

        <div style={{ marginBottom: '32px' }}>
          <h1 style={{
            fontSize: 'clamp(2rem, 3.5vw, 2.5rem)',
            fontWeight: 800,
            letterSpacing: '-0.025em',
            color: 'var(--text-primary)',
            marginBottom: '12px'
          }}>
            Kebijakan Privasi
          </h1>
          <p style={{ fontSize: '1.0625rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            Terakhir diperbarui: {new Date().getFullYear()}
          </p>
        </div>

        <div className="panel" style={{ lineHeight: 1.7, color: 'var(--text-secondary)', fontSize: '0.9375rem' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '16px',
            backgroundColor: 'var(--accent-subtle)',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid #C3E2D0',
            marginBottom: '24px',
            color: 'var(--accent-text)'
          }}>
            <ShieldCheck size={24} style={{ flexShrink: 0 }} />
            <div>
              <strong>Prinsip Utama:</strong> Privasi Anda adalah prioritas kami. Semua pemrosesan berkas dilakukan di peramban web perangkat Anda sendiri (client-side processing).
            </div>
          </div>

          <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '12px' }}>
            1. Tidak Ada File yang Diunggah ke Server
          </h2>
          <p style={{ marginBottom: '16px' }}>
            Saat Anda menggunakan alat seperti Kompres Gambar, Ubah Ukuran Gambar, Konversi Format, Potong Foto, maupun Generator Favicon, file Anda tidak pernah ditransmisikan melalui jaringan internet ke server kami ataupun pihak ketiga mana pun.
          </p>
          <p style={{ marginBottom: '16px' }}>
            Seluruh manipulasi berkas grafis dilakukan menggunakan kemampuan peramban web modern Anda (HTML5 Canvas API, Web Workers, dan JavaScript runtime lokal). Segera setelah proses selesai atau Anda menutup halaman, data memori sementara akan dihapus secara otomatis oleh sistem peramban.
          </p>

          <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-primary)', marginTop: '24px', marginBottom: '12px' }}>
            2. Akses Kamera Perangkat (QR Scanner)
          </h2>
          <p style={{ marginBottom: '16px' }}>
            Fitur Pemindai QR Code menyediakan opsi pemindaian via kamera peramban. Kami hanya meminta izin akses kamera apabila Anda secara sadar dan eksplisit menekan tombol &quot;Aktifkan Kamera&quot;.
          </p>
          <p style={{ marginBottom: '16px' }}>
            Aliran video kamera hanya dianalisis per frame di memori lokal untuk membaca kode matriks QR. Kami tidak pernah merekam, menyimpan, atau mengirimkan gambar dari kamera Anda ke server manapun. Stream kamera langsung dihentikan sepenuhnya saat Anda menutup fitur atau beralih halaman.
          </p>

          <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-primary)', marginTop: '24px', marginBottom: '12px' }}>
            3. Penggunaan Penyimpanan Lokal (Local Storage)
          </h2>
          <p style={{ marginBottom: '16px' }}>
            PakaiTools hanya memanfaatkan penyimpanan lokal browser (<code>localStorage</code>) untuk menyimpan daftar identitas alat yang baru saja Anda buka (Recent Tools) demi kenyamanan navigasi Anda.
          </p>
          <p style={{ marginBottom: '16px' }}>
            Kami <strong>tidak pernah</strong> menyimpan isi file, gambar, teks dokumen, ataupun data sensitif apa pun di dalam localStorage Anda.
          </p>

          <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-primary)', marginTop: '24px', marginBottom: '12px' }}>
            4. Tanpa Pembuatan Akun
          </h2>
          <p style={{ marginBottom: '16px' }}>
            PakaiTools tidak mewajibkan pembuatan akun pengguna. Oleh karena itu, kami tidak mengumpulkan nama pengguna, kata sandi, ataupun profil pribadi pengguna.
          </p>

          <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-primary)', marginTop: '24px', marginBottom: '12px' }}>
            5. Perubahan Kebijakan
          </h2>
          <p style={{ marginBottom: '16px' }}>
            Jika di masa mendatang kami menambahkan fitur yang memerlukan pemrosesan cloud atau integrasi layanan pihak ketiga, perubahan tersebut akan dicantumkan secara transparan di dalam dokumen kebijakan privasi ini dengan pemberitahuan yang jelas kepada pengguna.
          </p>

          <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-primary)', marginTop: '24px', marginBottom: '12px' }}>
            6. Kontak Privasi
          </h2>
          <p>
            Jika Anda memiliki pertanyaan mengenai kebijakan privasi atau keamanan teknis di PakaiTools, silakan hubungi kami melalui email: <code>kontak@pakaitools.id</code>.
          </p>
        </div>
      </div>
    </div>
  );
};
