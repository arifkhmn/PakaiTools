import React, { Suspense, lazy, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';

// Eagerly loaded core page for instant hero display
import { HomePage } from './pages/HomePage';

// Lazy-loaded Informational Pages
const AboutPage = lazy(() => import('./pages/AboutPage').then(m => ({ default: m.AboutPage })));
const ContactPage = lazy(() => import('./pages/ContactPage').then(m => ({ default: m.ContactPage })));
const PrivacyPage = lazy(() => import('./pages/PrivacyPage').then(m => ({ default: m.PrivacyPage })));
const TermsPage = lazy(() => import('./pages/TermsPage').then(m => ({ default: m.TermsPage })));
const DisclaimerPage = lazy(() => import('./pages/DisclaimerPage').then(m => ({ default: m.DisclaimerPage })));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage').then(m => ({ default: m.NotFoundPage })));

// Lazy-loaded Tool Pages (Chunked to prevent huge initial bundle)
const ImageCompressorPage = lazy(() => import('./pages/tools/ImageCompressorPage').then(m => ({ default: m.ImageCompressorPage })));
const ImageResizerPage = lazy(() => import('./pages/tools/ImageResizerPage').then(m => ({ default: m.ImageResizerPage })));
const ImageConverterPage = lazy(() => import('./pages/tools/ImageConverterPage').then(m => ({ default: m.ImageConverterPage })));
const QrGeneratorPage = lazy(() => import('./pages/tools/QrGeneratorPage').then(m => ({ default: m.QrGeneratorPage })));
const ImageCropperPage = lazy(() => import('./pages/tools/ImageCropperPage').then(m => ({ default: m.ImageCropperPage })));
const QrScannerPage = lazy(() => import('./pages/tools/QrScannerPage').then(m => ({ default: m.QrScannerPage })));
const FaviconGeneratorPage = lazy(() => import('./pages/tools/FaviconGeneratorPage').then(m => ({ default: m.FaviconGeneratorPage })));
const WordCounterPage = lazy(() => import('./pages/tools/WordCounterPage').then(m => ({ default: m.WordCounterPage })));
const CaseConverterPage = lazy(() => import('./pages/tools/CaseConverterPage').then(m => ({ default: m.CaseConverterPage })));
const TextCleanerPage = lazy(() => import('./pages/tools/TextCleanerPage').then(m => ({ default: m.TextCleanerPage })));
const UrlEncoderPage = lazy(() => import('./pages/tools/UrlEncoderPage').then(m => ({ default: m.UrlEncoderPage })));

// PDF Tools
const ImageToPdfPage = lazy(() => import('./pages/tools/ImageToPdfPage').then(m => ({ default: m.ImageToPdfPage })));
const CompressPdfPage = lazy(() => import('./pages/tools/CompressPdfPage').then(m => ({ default: m.CompressPdfPage })));
const PdfToWordPage = lazy(() => import('./pages/tools/PdfToWordPage').then(m => ({ default: m.PdfToWordPage })));
const WordToPdfPage = lazy(() => import('./pages/tools/WordToPdfPage').then(m => ({ default: m.WordToPdfPage })));

// Helper to scroll to top on navigation
const ScrollToTop: React.FC = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

// Subtle non-jarring loading fallback
const PageLoader: React.FC = () => (
  <div style={{
    minHeight: '50vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'var(--text-muted)',
    fontSize: '0.875rem'
  }}>
    <div style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: '8px',
      padding: '8px 16px',
      borderRadius: 'var(--radius-sm)',
      backgroundColor: 'var(--bg-surface)',
      border: '1px solid var(--border-color)'
    }}>
      <span>Memuat halaman...</span>
    </div>
  </div>
);

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Header />
      <main style={{ flex: 1 }}>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            {/* Main Home Route */}
            <Route path="/" element={<HomePage />} />

            {/* 11 Implemented Tool Routes */}
            <Route path="/tools/image-compressor" element={<ImageCompressorPage />} />
            <Route path="/tools/image-resizer" element={<ImageResizerPage />} />
            <Route path="/tools/image-converter" element={<ImageConverterPage />} />
            <Route path="/tools/qr-generator" element={<QrGeneratorPage />} />
            <Route path="/tools/image-cropper" element={<ImageCropperPage />} />
            <Route path="/tools/qr-scanner" element={<QrScannerPage />} />
            <Route path="/tools/favicon-generator" element={<FaviconGeneratorPage />} />
            <Route path="/tools/word-counter" element={<WordCounterPage />} />
            <Route path="/tools/case-converter" element={<CaseConverterPage />} />
            <Route path="/tools/text-cleaner" element={<TextCleanerPage />} />
            <Route path="/tools/url-encoder" element={<UrlEncoderPage />} />

            {/* PDF Tools */}
            <Route path="/tools/image-to-pdf" element={<ImageToPdfPage />} />
            <Route path="/tools/compress-pdf" element={<CompressPdfPage />} />
            <Route path="/tools/pdf-to-word" element={<PdfToWordPage />} />
            <Route path="/tools/word-to-pdf" element={<WordToPdfPage />} />

            {/* Informational Pages */}
            <Route path="/about" element={<AboutPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/privacy" element={<PrivacyPage />} />
            <Route path="/terms" element={<TermsPage />} />
            <Route path="/disclaimer" element={<DisclaimerPage />} />

            {/* 404 Route */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Suspense>
      </main>
      <Footer />
    </BrowserRouter>
  );
};

export default App;
