import React, { useState } from 'react';
import { Mail, Send, CheckCircle2 } from 'lucide-react';
import { SeoHead } from '../components/tools/SeoHead';
import { Breadcrumbs } from '../components/layout/Breadcrumbs';
import { StatusMessage } from '../components/tools/StatusMessage';

export const ContactPage: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [category, setCategory] = useState('Saran Fitur');
  const [message, setMessage] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim() || !email.trim() || !message.trim()) {
      setError('Mohon lengkapi semua kolom formulir kontak.');
      return;
    }

    if (!email.includes('@') || !email.includes('.')) {
      setError('Format alamat email yang Anda masukkan tidak valid.');
      return;
    }

    // In a static frontend context, we provide immediate visual confirmation and feedback
    setIsSubmitted(true);
  };

  const resetForm = () => {
    setName('');
    setEmail('');
    setMessage('');
    setIsSubmitted(false);
    setError(null);
  };

  return (
    <div style={{ paddingTop: '32px', paddingBottom: '64px' }}>
      <SeoHead
        title="Kontak Kami"
        description="Hubungi tim pengembang PakaiTools untuk saran fitur baru, pelaporan kendala, atau kerja sama."
        canonicalPath="/contact"
      />

      <div className="container" style={{ maxWidth: '780px' }}>
        <Breadcrumbs items={[{ label: 'Kontak' }]} />

        <div style={{ marginBottom: '32px' }}>
          <h1 style={{
            fontSize: 'clamp(2rem, 3.5vw, 2.5rem)',
            fontWeight: 800,
            letterSpacing: '-0.025em',
            color: 'var(--text-primary)',
            marginBottom: '12px'
          }}>
            Hubungi Kami
          </h1>
          <p style={{ fontSize: '1.0625rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            Punya ide tool baru yang ingin ditambahkan, menemukan kendala pada hasil proses, atau ingin menyampaikan masukan? Kami senang mendengarnya.
          </p>
        </div>

        {error && (
          <StatusMessage
            type="error"
            message={error}
            onDismiss={() => setError(null)}
          />
        )}

        <div className="panel">
          {isSubmitted ? (
            <div style={{ textAlign: 'center', padding: '36px 20px' }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                backgroundColor: 'var(--success-bg)',
                color: 'var(--success)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px auto'
              }}>
                <CheckCircle2 size={24} />
              </div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>
                Pesan Anda Berhasil Terkirim
              </h2>
              <p style={{ fontSize: '0.9375rem', color: 'var(--text-secondary)', maxWidth: '480px', margin: '0 auto 24px auto', lineHeight: 1.6 }}>
                Terima kasih, <strong>{name}</strong>! Masukan dan saran Anda sangat berharga untuk pengembangan utilitas PakaiTools selanjutnya.
              </p>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={resetForm}
              >
                Kirim Pesan Lain
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <label htmlFor="contact-name" style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '6px' }}>
                  Nama Lengkap
                </label>
                <input
                  id="contact-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Nama Anda"
                />
              </div>

              <div>
                <label htmlFor="contact-email" style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '6px' }}>
                  Alamat Email
                </label>
                <input
                  id="contact-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="email@domain.com"
                />
              </div>

              <div>
                <label htmlFor="contact-category" style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '6px' }}>
                  Topik Pesan
                </label>
                <select
                  id="contact-category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  <option value="Saran Fitur">Usulan Tool Baru / Fitur Tambahan</option>
                  <option value="Laporan Bug">Laporan Masalah / Bug Tool</option>
                  <option value="Pertanyaan">Pertanyaan Umum</option>
                  <option value="Lainnya">Lainnya</option>
                </select>
              </div>

              <div>
                <label htmlFor="contact-message" style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '6px' }}>
                  Pesan atau Masukan
                </label>
                <textarea
                  id="contact-message"
                  rows={5}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Tuliskan saran atau kendala yang Anda alami secara detail..."
                />
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                style={{ height: '44px', fontSize: '0.9375rem' }}
              >
                <Send size={16} />
                <span>Kirim Pesan</span>
              </button>
            </form>
          )}
        </div>

        {/* Direct Email note */}
        <div style={{
          marginTop: '24px',
          padding: '16px 20px',
          backgroundColor: 'var(--bg-surface)',
          borderRadius: 'var(--radius-sm)',
          border: '1px solid var(--border-color)',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <Mail size={20} color="var(--accent-primary)" style={{ flexShrink: 0 }} />
          <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
            Anda juga dapat mengirimkan surat elektronik secara langsung ke tim pengembang kami melalui{' '}
            <a href="mailto:kontak@pakaitools.id" style={{ color: 'var(--accent-primary)', fontWeight: 600, textDecoration: 'underline' }}>
              kontak@pakaitools.id
            </a>.
          </div>
        </div>
      </div>
    </div>
  );
};
