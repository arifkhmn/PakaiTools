import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Shield, CheckCircle2, ArrowRight } from 'lucide-react';
import type { ToolDefinition } from '../../types';
import { TOOLS } from '../../data/tools';
import { Breadcrumbs } from './Breadcrumbs';
import { SeoHead } from '../tools/SeoHead';
import { AdSlot } from './AdSlot';
import { saveRecentToolId } from '../../lib/storage';

interface ToolLayoutProps {
  tool: ToolDefinition;
  children: React.ReactNode;
  howToSteps?: string[];
  faqItems?: { question: string; answer: string }[];
}

export const ToolLayout: React.FC<ToolLayoutProps> = ({
  tool,
  children,
  howToSteps = [
    'Pilih atau seret file gambar/dokumen ke area kerja yang disediakan.',
    'Sesuaikan pengaturan (kualitas, dimensi, format, atau opsi lain) sesuai kebutuhanmu.',
    'Tekan tombol proses untuk melihat perbandingan hasil secara instan.',
    'Unduh file hasil pemrosesan langsung ke komputermu atau ponselmu.'
  ],
  faqItems = [
    {
      question: `Apakah menggunakan ${tool.name} ini benar-benar gratis?`,
      answer: 'Ya, 100% gratis tanpa batasan tersembunyi dan tanpa perlu mendaftar akun atau berlangganan.'
    },
    {
      question: 'Apakah file saya aman dan tidak bocor ke publik?',
      answer: 'Sangat aman. Semua proses manipulasi data dan gambar dilakukan langsung oleh browser di perangkat Anda (client-side) menggunakan Web Canvas & JavaScript standard. File Anda tidak pernah diunggah atau disimpan di server kami.'
    },
    {
      question: 'Apakah tool ini bisa dijalankan melalui smartphone?',
      answer: 'Tentu saja. Antarmuka PakaiTools dirancang responsif dan dapat dioperasikan dengan lancar melalui browser ponsel Android maupun iOS.'
    }
  ]
}) => {
  // Save to recent tools
  useEffect(() => {
    saveRecentToolId(tool.id);
  }, [tool.id]);

  // Related tools from same category, excluding current
  const relatedTools = TOOLS.filter(t => t.category === tool.category && t.id !== tool.id).slice(0, 3);

  return (
    <div style={{ paddingTop: '28px', paddingBottom: '64px' }}>
      <SeoHead
        title={tool.name}
        description={tool.description}
        canonicalPath={tool.path}
      />

      <div className="container">
        {/* Breadcrumb navigation */}
        <Breadcrumbs
          items={[
            { label: tool.categoryLabel, path: `/?cat=${tool.category}` },
            { label: tool.name }
          ]}
        />

        {/* Tool Header */}
        <div style={{ marginBottom: '32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <span className="badge badge-accent">{tool.categoryLabel}</span>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: '0.75rem',
              color: 'var(--accent-text)',
              fontWeight: 500
            }}>
              <Shield size={13} />
              <span>Privasi Lokal 100%</span>
            </div>
          </div>

          <h1 style={{
            fontSize: 'clamp(1.75rem, 3vw, 2.25rem)',
            fontWeight: 700,
            letterSpacing: '-0.025em',
            color: 'var(--text-primary)',
            marginBottom: '10px'
          }}>
            {tool.name}
          </h1>

          <p style={{
            fontSize: '1.0625rem',
            color: 'var(--text-secondary)',
            maxWidth: '780px',
            lineHeight: 1.6
          }}>
            {tool.description}
          </p>
        </div>

        {/* Main Work Area */}
        <div style={{ marginBottom: '48px' }}>
          {children}
        </div>

        {/* Optional Clean Ad Container (Disabled by default) */}
        <AdSlot slotId={`tool-${tool.id}`} />

        {/* Informational Editorial Sections */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '32px',
          marginTop: '48px',
          paddingTop: '32px',
          borderTop: '1px solid var(--border-color)'
        }}>
          {/* How to use */}
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '16px', color: 'var(--text-primary)' }}>
              Cara Menggunakan {tool.name}
            </h2>
            <ol style={{
              paddingLeft: '20px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              color: 'var(--text-secondary)',
              fontSize: '0.9375rem',
              lineHeight: 1.6
            }}>
              {howToSteps.map((step, idx) => (
                <li key={idx} style={{ paddingLeft: '4px' }}>
                  {step}
                </li>
              ))}
            </ol>
          </div>

          {/* Key Features */}
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '16px', color: 'var(--text-primary)' }}>
              Keunggulan Utama
            </h2>
            <ul style={{
              listStyle: 'none',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
              fontSize: '0.9375rem',
              color: 'var(--text-secondary)'
            }}>
              {tool.features.map((feat, idx) => (
                <li key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                  <CheckCircle2 size={16} color="var(--accent-primary)" style={{ marginTop: '3px', flexShrink: 0 }} />
                  <span>{feat}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* FAQ Section */}
        {faqItems.length > 0 && (
          <div style={{ marginTop: '48px', paddingTop: '32px', borderTop: '1px solid var(--border-color)' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '20px', color: 'var(--text-primary)' }}>
              Pertanyaan yang Sering Diajukan (FAQ)
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '840px' }}>
              {faqItems.map((faq, idx) => (
                <div key={idx} className="panel" style={{ padding: '18px 20px' }}>
                  <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px' }}>
                    {faq.question}
                  </h3>
                  <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                    {faq.answer}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Related Tools */}
        {relatedTools.length > 0 && (
          <div style={{ marginTop: '48px', paddingTop: '32px', borderTop: '1px solid var(--border-color)' }}>
            <h2 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '16px', color: 'var(--text-primary)' }}>
              Tools Terkait yang Mungkin Kamu Butuhkan
            </h2>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
              gap: '16px'
            }}>
              {relatedTools.map(rel => (
                <Link
                  key={rel.id}
                  to={rel.path}
                  className="panel"
                  style={{
                    padding: '16px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    textDecoration: 'none'
                  }}
                >
                  <div>
                    <h3 style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>
                      {rel.name}
                    </h3>
                    <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '12px' }}>
                      {rel.shortDesc}
                    </p>
                  </div>
                  <div style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    fontSize: '0.8125rem',
                    fontWeight: 500,
                    color: 'var(--accent-primary)'
                  }}>
                    <span>Gunakan Tool</span>
                    <ArrowRight size={14} />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
