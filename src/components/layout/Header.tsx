import React, { useState, useEffect, useRef } from 'react';
import { Link, NavLink, useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { Menu, X, Search, Wrench, ChevronDown, ArrowRight } from 'lucide-react';
import { TOOLS } from '../../data/tools';
import { IconRenderer } from '../tools/IconRenderer';

export const Header: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [openDropdown, setOpenDropdown] = useState<'image' | 'qr' | 'text' | 'pdf' | null>(null);
  const dropdownTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const currentCat = searchParams.get('cat');

  // Close mobile menu on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMobileMenuOpen(false);
        setOpenDropdown(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/?q=${encodeURIComponent(searchQuery.trim())}#katalog-tools`);
      setMobileMenuOpen(false);
      setTimeout(() => {
        const el = document.getElementById('katalog-tools');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 50);
    }
  };

  const handleNavCategory = (cat: 'all' | 'image' | 'qr' | 'text' | 'pdf') => {
    setMobileMenuOpen(false);
    setOpenDropdown(null);
    const targetUrl = cat === 'all' ? '/#katalog-tools' : `/?cat=${cat}#katalog-tools`;
    navigate(targetUrl);
    setTimeout(() => {
      const el = document.getElementById('katalog-tools');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }, 50);
  };

  const handleMouseEnter = (cat: 'image' | 'qr' | 'text' | 'pdf') => {
    if (dropdownTimeoutRef.current) {
      clearTimeout(dropdownTimeoutRef.current);
    }
    setOpenDropdown(cat);
  };

  const handleMouseLeave = () => {
    dropdownTimeoutRef.current = setTimeout(() => {
      setOpenDropdown(null);
    }, 150);
  };

  const imageTools = TOOLS.filter(t => t.category === 'image');
  const qrTools = TOOLS.filter(t => t.category === 'qr');
  const textTools = TOOLS.filter(t => t.category === 'text');
  const pdfTools = TOOLS.filter(t => t.category === 'pdf');

  // Determine active highlight
  const isImageActive = (location.pathname === '/' && currentCat === 'image') || imageTools.some(t => t.path === location.pathname);
  const isQrActive = (location.pathname === '/' && currentCat === 'qr') || qrTools.some(t => t.path === location.pathname);
  const isTextActive = (location.pathname === '/' && currentCat === 'text') || textTools.some(t => t.path === location.pathname);
  const isPdfActive = (location.pathname === '/' && currentCat === 'pdf') || pdfTools.some(t => t.path === location.pathname);
  const isAllActive = location.pathname === '/' && !currentCat;

  return (
    <header style={{
      borderBottom: '1px solid var(--border-color)',
      backgroundColor: 'var(--bg-primary)',
      position: 'sticky',
      top: 0,
      zIndex: 50
    }}>
      <div className="container" style={{
        height: 'var(--header-height)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '16px'
      }}>
        {/* Brand */}
        <Link to="/" style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          fontWeight: 700,
          fontSize: '1.25rem',
          letterSpacing: '-0.02em',
          color: 'var(--text-primary)'
        }}>
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: 'var(--radius-sm)',
            backgroundColor: 'var(--accent-primary)',
            color: '#FFFFFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Wrench size={18} strokeWidth={2.2} />
          </div>
          <span>PakaiTools</span>
          <span className="badge badge-accent" style={{ fontSize: '0.7rem', padding: '1px 6px' }}>Gratis</span>
        </Link>

        {/* Desktop Search */}
        <form onSubmit={handleSearchSubmit} style={{
          display: 'none',
          alignItems: 'center',
          position: 'relative',
          maxWidth: '280px',
          width: '100%'
        }} className="desktop-search">
          <Search size={16} style={{ position: 'absolute', left: '10px', color: 'var(--text-muted)' }} />
          <input
            type="text"
            placeholder="Cari tools (contoh: kompres)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              paddingLeft: '34px',
              paddingRight: '12px',
              fontSize: '0.8125rem',
              height: '36px'
            }}
          />
        </form>

        {/* Desktop Navigation */}
        <nav style={{
          display: 'none',
          alignItems: 'center',
          gap: '20px',
          fontSize: '0.875rem',
          fontWeight: 500
        }} className="desktop-nav">
          {/* Semua Tools */}
          <button
            type="button"
            onClick={() => handleNavCategory('all')}
            style={{
              color: isAllActive ? 'var(--accent-primary)' : 'var(--text-secondary)',
              borderBottom: isAllActive ? '2px solid var(--accent-primary)' : '2px solid transparent',
              padding: '6px 0',
              fontWeight: isAllActive ? 600 : 500
            }}
          >
            Semua Tools
          </button>

          {/* Gambar Dropdown */}
          <div
            style={{ position: 'relative' }}
            onMouseEnter={() => handleMouseEnter('image')}
            onMouseLeave={handleMouseLeave}
          >
            <button
              type="button"
              onClick={() => handleNavCategory('image')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                color: isImageActive ? 'var(--accent-primary)' : 'var(--text-secondary)',
                borderBottom: isImageActive ? '2px solid var(--accent-primary)' : '2px solid transparent',
                padding: '6px 0',
                fontWeight: isImageActive ? 600 : 500
              }}
            >
              <span>Gambar</span>
              <ChevronDown size={14} style={{ transform: openDropdown === 'image' ? 'rotate(180deg)' : 'none', transition: 'transform 150ms' }} />
            </button>

            {openDropdown === 'image' && (
              <div style={{
                position: 'absolute',
                top: '100%',
                left: '-20px',
                width: '320px',
                backgroundColor: '#FFFFFF',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-md)',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
                padding: '12px',
                display: 'flex',
                flexDirection: 'column',
                gap: '4px',
                zIndex: 60
              }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', padding: '4px 8px', textTransform: 'uppercase' }}>
                  Utilitas Gambar
                </div>
                {imageTools.map(t => (
                  <Link
                    key={t.id}
                    to={t.path}
                    onClick={() => setOpenDropdown(null)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '8px',
                      borderRadius: 'var(--radius-sm)',
                      color: 'var(--text-primary)',
                      fontSize: '0.8125rem',
                      textDecoration: 'none'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-surface)'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    <div style={{ color: 'var(--accent-primary)' }}>
                      <IconRenderer name={t.iconName} size={16} />
                    </div>
                    <div>
                      <div style={{ fontWeight: 600 }}>{t.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '240px' }}>
                        {t.shortDesc}
                      </div>
                    </div>
                  </Link>
                ))}
                <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '6px', marginTop: '4px' }}>
                  <button
                    type="button"
                    onClick={() => handleNavCategory('image')}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '6px 8px',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      color: 'var(--accent-primary)',
                      borderRadius: 'var(--radius-sm)'
                    }}
                  >
                    <span>Lihat Semua Tools Gambar</span>
                    <ArrowRight size={13} />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* PDF Dropdown */}
          <div
            style={{ position: 'relative' }}
            onMouseEnter={() => handleMouseEnter('pdf')}
            onMouseLeave={handleMouseLeave}
          >
            <button
              type="button"
              onClick={() => handleNavCategory('pdf')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                color: isPdfActive ? 'var(--accent-primary)' : 'var(--text-secondary)',
                borderBottom: isPdfActive ? '2px solid var(--accent-primary)' : '2px solid transparent',
                padding: '6px 0',
                fontWeight: isPdfActive ? 600 : 500
              }}
            >
              <span>PDF</span>
              <ChevronDown size={14} style={{ transform: openDropdown === 'pdf' ? 'rotate(180deg)' : 'none', transition: 'transform 150ms' }} />
            </button>

            {openDropdown === 'pdf' && (
              <div style={{
                position: 'absolute',
                top: '100%',
                left: '-20px',
                width: '320px',
                backgroundColor: '#FFFFFF',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-md)',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
                padding: '12px',
                display: 'flex',
                flexDirection: 'column',
                gap: '4px',
                zIndex: 60
              }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', padding: '4px 8px', textTransform: 'uppercase' }}>
                  Utilitas PDF & Dokumen
                </div>
                {pdfTools.map(t => (
                  <Link
                    key={t.id}
                    to={t.path}
                    onClick={() => setOpenDropdown(null)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '8px',
                      borderRadius: 'var(--radius-sm)',
                      color: 'var(--text-primary)',
                      fontSize: '0.8125rem',
                      textDecoration: 'none'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-surface)'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    <div style={{ color: 'var(--accent-primary)' }}>
                      <IconRenderer name={t.iconName} size={16} />
                    </div>
                    <div>
                      <div style={{ fontWeight: 600 }}>{t.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '240px' }}>
                        {t.shortDesc}
                      </div>
                    </div>
                  </Link>
                ))}
                <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '6px', marginTop: '4px' }}>
                  <button
                    type="button"
                    onClick={() => handleNavCategory('pdf')}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '6px 8px',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      color: 'var(--accent-primary)',
                      borderRadius: 'var(--radius-sm)'
                    }}
                  >
                    <span>Lihat Semua Tools PDF</span>
                    <ArrowRight size={13} />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* QR Code Dropdown */}
          <div
            style={{ position: 'relative' }}
            onMouseEnter={() => handleMouseEnter('qr')}
            onMouseLeave={handleMouseLeave}
          >
            <button
              type="button"
              onClick={() => handleNavCategory('qr')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                color: isQrActive ? 'var(--accent-primary)' : 'var(--text-secondary)',
                borderBottom: isQrActive ? '2px solid var(--accent-primary)' : '2px solid transparent',
                padding: '6px 0',
                fontWeight: isQrActive ? 600 : 500
              }}
            >
              <span>QR Code</span>
              <ChevronDown size={14} style={{ transform: openDropdown === 'qr' ? 'rotate(180deg)' : 'none', transition: 'transform 150ms' }} />
            </button>

            {openDropdown === 'qr' && (
              <div style={{
                position: 'absolute',
                top: '100%',
                left: '-20px',
                width: '300px',
                backgroundColor: '#FFFFFF',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-md)',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
                padding: '12px',
                display: 'flex',
                flexDirection: 'column',
                gap: '4px',
                zIndex: 60
              }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', padding: '4px 8px', textTransform: 'uppercase' }}>
                  Utilitas QR Code
                </div>
                {qrTools.map(t => (
                  <Link
                    key={t.id}
                    to={t.path}
                    onClick={() => setOpenDropdown(null)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '8px',
                      borderRadius: 'var(--radius-sm)',
                      color: 'var(--text-primary)',
                      fontSize: '0.8125rem',
                      textDecoration: 'none'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-surface)'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    <div style={{ color: 'var(--accent-primary)' }}>
                      <IconRenderer name={t.iconName} size={16} />
                    </div>
                    <div>
                      <div style={{ fontWeight: 600 }}>{t.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '220px' }}>
                        {t.shortDesc}
                      </div>
                    </div>
                  </Link>
                ))}
                <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '6px', marginTop: '4px' }}>
                  <button
                    type="button"
                    onClick={() => handleNavCategory('qr')}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '6px 8px',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      color: 'var(--accent-primary)',
                      borderRadius: 'var(--radius-sm)'
                    }}
                  >
                    <span>Lihat Semua Tools QR</span>
                    <ArrowRight size={13} />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Teks Dropdown */}
          <div
            style={{ position: 'relative' }}
            onMouseEnter={() => handleMouseEnter('text')}
            onMouseLeave={handleMouseLeave}
          >
            <button
              type="button"
              onClick={() => handleNavCategory('text')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                color: isTextActive ? 'var(--accent-primary)' : 'var(--text-secondary)',
                borderBottom: isTextActive ? '2px solid var(--accent-primary)' : '2px solid transparent',
                padding: '6px 0',
                fontWeight: isTextActive ? 600 : 500
              }}
            >
              <span>Teks</span>
              <ChevronDown size={14} style={{ transform: openDropdown === 'text' ? 'rotate(180deg)' : 'none', transition: 'transform 150ms' }} />
            </button>

            {openDropdown === 'text' && (
              <div style={{
                position: 'absolute',
                top: '100%',
                left: '-20px',
                width: '320px',
                backgroundColor: '#FFFFFF',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-md)',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
                padding: '12px',
                display: 'flex',
                flexDirection: 'column',
                gap: '4px',
                zIndex: 60
              }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', padding: '4px 8px', textTransform: 'uppercase' }}>
                  Utilitas Teks &amp; Dokumen
                </div>
                {textTools.map(t => (
                  <Link
                    key={t.id}
                    to={t.path}
                    onClick={() => setOpenDropdown(null)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '8px',
                      borderRadius: 'var(--radius-sm)',
                      color: 'var(--text-primary)',
                      fontSize: '0.8125rem',
                      textDecoration: 'none'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-surface)'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    <div style={{ color: 'var(--accent-primary)' }}>
                      <IconRenderer name={t.iconName} size={16} />
                    </div>
                    <div>
                      <div style={{ fontWeight: 600 }}>{t.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '240px' }}>
                        {t.shortDesc}
                      </div>
                    </div>
                  </Link>
                ))}
                <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '6px', marginTop: '4px' }}>
                  <button
                    type="button"
                    onClick={() => handleNavCategory('text')}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '6px 8px',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      color: 'var(--accent-primary)',
                      borderRadius: 'var(--radius-sm)'
                    }}
                  >
                    <span>Lihat Semua Tools Teks</span>
                    <ArrowRight size={13} />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Tentang */}
          <NavLink
            to="/about"
            style={({ isActive }) => ({
              color: isActive ? 'var(--accent-primary)' : 'var(--text-secondary)',
              borderBottom: isActive ? '2px solid var(--accent-primary)' : '2px solid transparent',
              padding: '6px 0',
              fontWeight: isActive ? 600 : 500
            })}
          >
            Tentang
          </NavLink>
        </nav>

        {/* Mobile menu trigger */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }} className="mobile-actions">
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? 'Tutup menu' : 'Buka menu'}
            aria-expanded={mobileMenuOpen}
            style={{ display: 'inline-flex', padding: '8px' }}
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div style={{
          borderTop: '1px solid var(--border-color)',
          backgroundColor: 'var(--bg-primary)',
          padding: '16px 20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          maxHeight: '80vh',
          overflowY: 'auto'
        }}>
          <form onSubmit={handleSearchSubmit} style={{ display: 'flex', position: 'relative' }}>
            <Search size={16} style={{ position: 'absolute', left: '10px', top: '10px', color: 'var(--text-muted)' }} />
            <input
              type="text"
              placeholder="Cari tools..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ paddingLeft: '34px', fontSize: '0.875rem' }}
            />
          </form>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.9375rem', fontWeight: 500 }}>
            <button
              type="button"
              onClick={() => handleNavCategory('all')}
              style={{ padding: '10px 0', borderBottom: '1px solid var(--border-color)', textAlign: 'left', fontWeight: isAllActive ? 600 : 500, color: isAllActive ? 'var(--accent-primary)' : 'var(--text-primary)' }}
            >
              Semua Tools
            </button>

            <button
              type="button"
              onClick={() => handleNavCategory('image')}
              style={{ padding: '10px 0', borderBottom: '1px solid var(--border-color)', textAlign: 'left', fontWeight: isImageActive ? 600 : 500, color: isImageActive ? 'var(--accent-primary)' : 'var(--text-primary)' }}
            >
              Tools Gambar ({imageTools.length})
            </button>

            <button
              type="button"
              onClick={() => handleNavCategory('pdf')}
              style={{ padding: '10px 0', borderBottom: '1px solid var(--border-color)', textAlign: 'left', fontWeight: isPdfActive ? 600 : 500, color: isPdfActive ? 'var(--accent-primary)' : 'var(--text-primary)' }}
            >
              Tools PDF ({pdfTools.length})
            </button>

            <button
              type="button"
              onClick={() => handleNavCategory('qr')}
              style={{ padding: '10px 0', borderBottom: '1px solid var(--border-color)', textAlign: 'left', fontWeight: isQrActive ? 600 : 500, color: isQrActive ? 'var(--accent-primary)' : 'var(--text-primary)' }}
            >
              Tools QR Code ({qrTools.length})
            </button>

            <button
              type="button"
              onClick={() => handleNavCategory('text')}
              style={{ padding: '10px 0', borderBottom: '1px solid var(--border-color)', textAlign: 'left', fontWeight: isTextActive ? 600 : 500, color: isTextActive ? 'var(--accent-primary)' : 'var(--text-primary)' }}
            >
              Tools Teks ({textTools.length})
            </button>

            <Link
              to="/about"
              onClick={() => setMobileMenuOpen(false)}
              style={{ padding: '10px 0', borderBottom: '1px solid var(--border-color)' }}
            >
              Tentang PakaiTools
            </Link>

            <Link
              to="/contact"
              onClick={() => setMobileMenuOpen(false)}
              style={{ padding: '10px 0' }}
            >
              Kontak Kami
            </Link>
          </div>
        </div>
      )}

      <style>{`
        @media (min-width: 769px) {
          .desktop-nav { display: flex !important; }
          .desktop-search { display: flex !important; }
          .mobile-actions { display: none !important; }
        }
      `}</style>
    </header>
  );
};
