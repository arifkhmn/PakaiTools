import React, { useState, useEffect, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  Search,
  X,
  ArrowRight,
  Zap,
  Lock,
  Shield,
  ChevronDown,
  History
} from 'lucide-react';
import { TOOLS, POPULAR_TOOLS, searchTools } from '../data/tools';
import type { ToolCategory, ToolDefinition } from '../types';
import { IconRenderer } from '../components/tools/IconRenderer';
import { SeoHead } from '../components/tools/SeoHead';
import { getRecentToolIds } from '../lib/storage';

export const HomePage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const initialCat = (searchParams.get('cat') as ToolCategory) || 'all';
  const initialQ = searchParams.get('q') || '';

  const [activeCategory, setActiveCategory] = useState<ToolCategory>(initialCat);
  const [searchQuery, setSearchQuery] = useState<string>(initialQ);
  const [recentToolIds, setRecentToolIds] = useState<string[]>([]);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  // Sync with searchParams
  useEffect(() => {
    const cat = (searchParams.get('cat') as ToolCategory) || 'all';
    const q = searchParams.get('q') || '';
    setActiveCategory(cat);
    setSearchQuery(q);

    if (window.location.hash === '#katalog-tools' || searchParams.has('cat') || searchParams.has('q')) {
      const el = document.getElementById('katalog-tools');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }, [searchParams]);

  // Load recent tools
  useEffect(() => {
    setRecentToolIds(getRecentToolIds());
  }, []);

  const handleCategorySelect = (cat: ToolCategory) => {
    setActiveCategory(cat);
    const newParams = new URLSearchParams(searchParams);
    if (cat === 'all') {
      newParams.delete('cat');
    } else {
      newParams.set('cat', cat);
    }
    setSearchParams(newParams);
  };

  const handleSearchChange = (q: string) => {
    setSearchQuery(q);
    const newParams = new URLSearchParams(searchParams);
    if (q) {
      newParams.set('q', q);
    } else {
      newParams.delete('q');
    }
    setSearchParams(newParams);
  };

  const clearSearch = () => {
    handleSearchChange('');
  };

  // Filter tools
  const filteredTools = useMemo(() => {
    return searchTools(searchQuery, activeCategory);
  }, [searchQuery, activeCategory]);

  const recentTools = useMemo(() => {
    return recentToolIds
      .map(id => TOOLS.find(t => t.id === id))
      .filter((t): t is ToolDefinition => !!t);
  }, [recentToolIds]);

  const faqs = [
    {
      q: 'Apakah PakaiTools benar-benar gratis?',
      a: 'Ya, seluruh fitur dasar di PakaiTools dapat Anda gunakan secara gratis tanpa biaya langganan dan tanpa batasan jumlah file harian.'
    },
    {
      q: 'Apakah saya perlu membuat akun untuk menggunakan tools?',
      a: 'Tidak. Anda tidak perlu mendaftar, membuat akun, atau memasukkan alamat email untuk mulai memakai seluruh utilitas kami. Langsung buka halaman dan gunakan.'
    },
    {
      q: 'Apakah file gambar atau teks saya diunggah ke server?',
      a: 'Sama sekali tidak. Tools di PakaiTools berjalan langsung di browser (client-side) menggunakan kemampuan HTML5 Canvas dan Web APIs. File Anda tetap berada di perangkat lokal Anda dan tidak pernah dikirim ke server kami.'
    },
    {
      q: 'Format file apa saja yang saat ini didukung?',
      a: 'Untuk utilitas gambar, kami mendukung format JPEG/JPG, PNG, dan WebP. Untuk QR code, kami mendukung URL, teks bebas, Wi-Fi, email, dan nomor telepon.'
    },
    {
      q: 'Apakah tools ini bisa digunakan melalui browser HP/smartphone?',
      a: 'Bisa. Seluruh antarmuka PakaiTools dirancang responsif dan kompatibel dengan browser seluler (Chrome, Safari, Firefox, Edge di Android maupun iOS).'
    },
    {
      q: 'Mengapa hasil kompresi gambar kadang berbeda dari perkiraan?',
      a: 'Ukuran hasil kompresi bergantung pada kompleksitas visual foto awal. Gambar yang sudah sangat dikompresi sebelumnya memiliki sedikit ruang untuk pengurangan ukuran tanpa menurunkan resolusi pikselnya.'
    }
  ];

  return (
    <div style={{ paddingBottom: '80px' }}>
      <SeoHead
        title="Tools praktis. Hasil langsung."
        description="Platform utilitas web gratis untuk kompres gambar, ubah ukuran foto, buat QR code, hitung kata, dan olah teks langsung di browser tanpa upload ke server."
      />

      {/* Hero Section */}
      <section style={{
        paddingTop: '64px',
        paddingBottom: '48px',
        backgroundColor: 'var(--bg-primary)',
        borderBottom: '1px solid var(--border-color)'
      }}>
        <div className="container" style={{ textAlign: 'center', maxWidth: '820px' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '0.75rem',
            fontWeight: 600,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: 'var(--accent-primary)',
            backgroundColor: 'var(--accent-subtle)',
            padding: '4px 12px',
            borderRadius: '9999px',
            border: '1px solid #C3E2D0',
            marginBottom: '16px'
          }}>
            UTILITAS DIGITAL GRATIS
          </div>

          <h1 style={{
            fontSize: 'clamp(2rem, 4vw, 3rem)',
            fontWeight: 800,
            lineHeight: 1.15,
            letterSpacing: '-0.03em',
            color: 'var(--text-primary)',
            marginBottom: '16px'
          }}>
            Semua yang perlu kamu kerjakan, lebih praktis.
          </h1>

          <p style={{
            fontSize: '1.125rem',
            color: 'var(--text-secondary)',
            lineHeight: 1.6,
            marginBottom: '28px',
            maxWidth: '680px',
            marginLeft: 'auto',
            marginRight: 'auto'
          }}>
            Kompres gambar, ubah ukuran file, buat QR code, dan gunakan berbagai tools online langsung dari browser dengan pemrosesan lokal yang aman.
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <a href="#katalog-tools" className="btn btn-primary btn-lg">
              <span>Jelajahi Semua Tools</span>
              <ArrowRight size={16} />
            </a>
            <a href="#tools-populer" className="btn btn-secondary btn-lg">
              <span>Lihat Tools Populer</span>
            </a>
          </div>
        </div>
      </section>

      {/* Popular Tools Section */}
      <section id="tools-populer" style={{
        paddingTop: '48px',
        paddingBottom: '48px',
        borderBottom: '1px solid var(--border-color)',
        backgroundColor: 'var(--bg-surface)'
      }}>
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '24px' }}>
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>
                Tools Populer
              </h2>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                Utilitas yang paling sering digunakan untuk kebutuhan harian
              </p>
            </div>
            <a href="#katalog-tools" style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--accent-primary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span>Lihat Semua ({TOOLS.length})</span>
              <ArrowRight size={14} />
            </a>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: '16px'
          }}>
            {POPULAR_TOOLS.map(t => (
              <Link
                key={t.id}
                to={t.path}
                className="panel"
                style={{
                  padding: '20px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  textDecoration: 'none',
                  backgroundColor: '#FFFFFF',
                  transition: 'border-color var(--transition-fast)'
                }}
              >
                <div>
                  <div style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: 'var(--accent-subtle)',
                    color: 'var(--accent-primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '14px'
                  }}>
                    <IconRenderer name={t.iconName} size={20} />
                  </div>
                  <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>
                    {t.name}
                  </h3>
                  <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '16px' }}>
                    {t.shortDesc}
                  </p>
                </div>

                <div style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontSize: '0.8125rem',
                  fontWeight: 600,
                  color: 'var(--accent-primary)'
                }}>
                  <span>Mulai Gunakan</span>
                  <ArrowRight size={13} />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Catalog & Search Section */}
      <section id="katalog-tools" style={{ paddingTop: '56px', paddingBottom: '56px' }}>
        <div className="container">
          {/* Section Heading */}
          <div style={{ textAlign: 'center', maxWidth: '640px', margin: '0 auto 32px auto' }}>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.02em', marginBottom: '8px' }}>
              Katalog Lengkap Tools
            </h2>
            <p style={{ fontSize: '0.9375rem', color: 'var(--text-secondary)' }}>
              Cari dan temukan alat utilitas yang kamu butuhkan dengan cepat
            </p>
          </div>

          {/* Search Box */}
          <div style={{ maxWidth: '620px', margin: '0 auto 24px auto', position: 'relative' }}>
            <Search size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Cari tool (contoh: kompres foto, resize, buat QR, hitung kata)..."
              style={{
                width: '100%',
                height: '48px',
                paddingLeft: '44px',
                paddingRight: searchQuery ? '40px' : '14px',
                fontSize: '0.9375rem',
                borderRadius: 'var(--radius-md)'
              }}
            />
            {searchQuery && (
              <button
                type="button"
                onClick={clearSearch}
                aria-label="Hapus kata kunci pencarian"
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  padding: '6px',
                  color: 'var(--text-muted)'
                }}
              >
                <X size={16} />
              </button>
            )}
          </div>

          {/* Category Tabs */}
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            flexWrap: 'wrap',
            gap: '8px',
            marginBottom: '32px'
          }}>
            {[
              { id: 'all', label: 'Semua Tools' },
              { id: 'image', label: 'Gambar' },
              { id: 'pdf', label: 'PDF' },
              { id: 'qr', label: 'QR Code' },
              { id: 'text', label: 'Teks' }
            ].map(cat => (
              <button
                key={cat.id}
                type="button"
                className={`btn btn-sm ${activeCategory === cat.id ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => handleCategorySelect(cat.id as ToolCategory)}
                style={{ borderRadius: '20px', padding: '6px 16px' }}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Recently Used Tools (if any exist) */}
          {recentTools.length > 0 && !searchQuery && activeCategory === 'all' && (
            <div style={{
              marginBottom: '32px',
              padding: '16px 20px',
              backgroundColor: 'var(--bg-surface)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-color)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '12px' }}>
                <History size={15} />
                <span>Baru Saja Digunakan:</span>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {recentTools.map(rt => (
                  <Link
                    key={rt.id}
                    to={rt.path}
                    className="badge"
                    style={{
                      padding: '6px 12px',
                      fontSize: '0.8125rem',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      backgroundColor: '#FFFFFF',
                      textDecoration: 'none',
                      color: 'var(--text-primary)'
                    }}
                  >
                    <IconRenderer name={rt.iconName} size={14} color="var(--accent-primary)" />
                    <span>{rt.name}</span>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Tools Grid */}
          {filteredTools.length > 0 ? (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: '16px'
            }}>
              {filteredTools.map(t => (
                <Link
                  key={t.id}
                  to={t.path}
                  className="panel"
                  style={{
                    padding: '20px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    textDecoration: 'none',
                    transition: 'border-color var(--transition-fast)'
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                      <div style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: 'var(--radius-sm)',
                        backgroundColor: 'var(--bg-surface)',
                        color: 'var(--text-primary)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: '1px solid var(--border-color)'
                      }}>
                        <IconRenderer name={t.iconName} size={18} />
                      </div>
                      <span className="badge">{t.categoryLabel}</span>
                    </div>

                    <h3 style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>
                      {t.name}
                    </h3>
                    <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '16px' }}>
                      {t.shortDesc}
                    </p>
                  </div>

                  <div style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    fontSize: '0.8125rem',
                    fontWeight: 600,
                    color: 'var(--accent-primary)'
                  }}>
                    <span>Buka Tool</span>
                    <ArrowRight size={13} />
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            /* Empty State */
            <div className="panel" style={{ textAlign: 'center', padding: '48px 20px', maxWidth: '480px', margin: '0 auto' }}>
              <div style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px' }}>
                Tidak ada tools yang cocok dengan &quot;{searchQuery}&quot;
              </div>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>
                Coba gunakan kata kunci umum lainnya seperti &quot;gambar&quot;, &quot;qr&quot;, atau &quot;teks&quot;.
              </p>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={clearSearch}
              >
                Hapus Pencarian
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Why Use PakaiTools (Value Props) */}
      <section style={{
        paddingTop: '64px',
        paddingBottom: '64px',
        backgroundColor: 'var(--bg-surface)',
        borderTop: '1px solid var(--border-color)',
        borderBottom: '1px solid var(--border-color)'
      }}>
        <div className="container">
          <div style={{ textAlign: 'center', maxWidth: '640px', margin: '0 auto 40px auto' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.02em', marginBottom: '8px' }}>
              Mengapa Menggunakan PakaiTools?
            </h2>
            <p style={{ fontSize: '0.9375rem', color: 'var(--text-secondary)' }}>
              Prinsip desain dan rekayasa yang mendasari setiap alat yang kami buat.
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '24px'
          }}>
            <div className="panel" style={{ backgroundColor: '#FFFFFF' }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'var(--accent-subtle)',
                color: 'var(--accent-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '16px'
              }}>
                <Zap size={20} />
              </div>
              <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px' }}>
                Gratis untuk fungsi dasar
              </h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                Seluruh fungsi penting dapat diakses tanpa biaya tersembunyi, tanpa langganan, dan tanpa batasan yang menyulitkan pengguna harian.
              </p>
            </div>

            <div className="panel" style={{ backgroundColor: '#FFFFFF' }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'var(--accent-subtle)',
                color: 'var(--accent-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '16px'
              }}>
                <Lock size={20} />
              </div>
              <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px' }}>
                Praktis tanpa membuat akun
              </h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                Tidak perlu login, memasukkan kata sandi, ataupun memverifikasi email. Anda dapat langsung membuka website dan menyelesaikan tugas dalam hitungan detik.
              </p>
            </div>

            <div className="panel" style={{ backgroundColor: '#FFFFFF' }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'var(--accent-subtle)',
                color: 'var(--accent-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '16px'
              }}>
                <Shield size={20} />
              </div>
              <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px' }}>
                Pemrosesan lokal di browser
              </h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                File gambar dan teks diproses langsung oleh browser perangkat Anda (client-side). Dokumen pribadi Anda tidak diunggah atau disimpan di server kami.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Accordion Section */}
      <section style={{ paddingTop: '64px', paddingBottom: '32px' }}>
        <div className="container" style={{ maxWidth: '800px' }}>
          <div style={{ textAlign: 'center', marginBottom: '36px' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.02em', marginBottom: '8px' }}>
              Pertanyaan Umum (FAQ)
            </h2>
            <p style={{ fontSize: '0.9375rem', color: 'var(--text-secondary)' }}>
              Informasi transparan mengenai cara kerja dan kebijakan PakaiTools.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {faqs.map((faq, idx) => {
              const isOpen = openFaqIndex === idx;
              return (
                <div
                  key={idx}
                  className="panel"
                  style={{
                    padding: 0,
                    overflow: 'hidden',
                    borderColor: isOpen ? 'var(--accent-primary)' : 'var(--border-color)'
                  }}
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                    aria-expanded={isOpen}
                    style={{
                      width: '100%',
                      padding: '18px 20px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      textAlign: 'left',
                      fontWeight: 600,
                      fontSize: '0.9375rem',
                      color: 'var(--text-primary)'
                    }}
                  >
                    <span>{faq.q}</span>
                    <ChevronDown
                      size={18}
                      style={{
                        transform: isOpen ? 'rotate(180deg)' : 'none',
                        transition: 'transform var(--transition-fast)',
                        color: 'var(--text-secondary)',
                        flexShrink: 0
                      }}
                    />
                  </button>

                  {isOpen && (
                    <div style={{
                      padding: '0 20px 18px 20px',
                      fontSize: '0.875rem',
                      color: 'var(--text-secondary)',
                      lineHeight: 1.6,
                      borderTop: '1px solid var(--border-color)',
                      paddingTop: '12px'
                    }}>
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
};
