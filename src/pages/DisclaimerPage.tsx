import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { SeoHead } from '../components/tools/SeoHead';
import { Breadcrumbs } from '../components/layout/Breadcrumbs';

export const DisclaimerPage: React.FC = () => {
  return (
    <div style={{ paddingTop: '32px', paddingBottom: '64px' }}>
      <SeoHead
        title="Disclaimer Produk"
        description="Batasan tanggung jawab dan penyangkalan resmi platform utilitas PakaiTools."
        canonicalPath="/disclaimer"
      />

      <div className="container" style={{ maxWidth: '860px' }}>
        <Breadcrumbs items={[{ label: 'Disclaimer' }]} />

        <div style={{ marginBottom: '32px' }}>
          <h1 style={{
            fontSize: 'clamp(2rem, 3.5vw, 2.5rem)',
            fontWeight: 800,
            letterSpacing: '-0.025em',
            color: 'var(--text-primary)',
            marginBottom: '12px'
          }}>
            Disclaimer Produk
          </h1>
          <p style={{ fontSize: '1.0625rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            Informasi batasan tanggung jawab teknis penggunaan PakaiTools.
          </p>
        </div>

        <div className="panel" style={{ lineHeight: 1.7, color: 'var(--text-secondary)', fontSize: '0.9375rem' }}>
          <div style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '12px',
            padding: '16px',
            backgroundColor: 'var(--warning-bg)',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid #FEDF89',
            marginBottom: '24px',
            color: 'var(--warning)'
          }}>
            <AlertTriangle size={24} style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>
              <strong>Pemberitahuan Penting:</strong> Layanan di PakaiTools disediakan dengan prinsip &quot;sebagaimana adanya&quot; (as-is) tanpa jaminan apa pun, baik tersurat maupun tersirat.
            </div>
          </div>

          <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '12px' }}>
            1. Pemrosesan Sisi Klien &amp; Cadangan File Asli
          </h2>
          <p style={{ marginBottom: '16px' }}>
            Karena semua pemrosesan berkas (kompresi, pengubahan ukuran, pemotongan, dan konversi) berlangsung secara eksklusif di dalam memori browser Anda, pengguna bertanggung jawab penuh untuk senantiasa menyimpan salinan cadangan (backup) dari berkas asli Anda sebelum melakukan manipulasi gambar atau teks.
          </p>
          <p style={{ marginBottom: '16px' }}>
            PakaiTools tidak bertanggung jawab atas potensi kehilangan data, pengurangan kualitas yang tidak diinginkan, atau kerusakan file yang diakibatkan oleh keterbatasan memori peramban atau perangkat keras pengguna.
          </p>

          <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-primary)', marginTop: '24px', marginBottom: '12px' }}>
            2. Keamanan Tautan QR Code
          </h2>
          <p style={{ marginBottom: '16px' }}>
            Fitur Pemindai QR Code di PakaiTools menampilkan teks mentah yang terenkode di dalam barcode dan tidak pernah mengarahkan browser Anda ke alamat web secara otomatis. Anda bertanggung jawab penuh untuk memverifikasi keaslian dan keamanan alamat tautan sebelum membukanya di peramban Anda.
          </p>

          <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-primary)', marginTop: '24px', marginBottom: '12px' }}>
            3. Batasan Tanggung Jawab Hukum
          </h2>
          <p>
            Dalam batas maksimum yang diizinkan oleh hukum yang berlaku, tim pengembang PakaiTools tidak bertanggung jawab atas kerugian langsung, tidak langsung, insidental, atau konsekuensial yang timbul dari penggunaan atau ketidakmampuan menggunakan alat-alat dalam platform ini.
          </p>
        </div>
      </div>
    </div>
  );
};
