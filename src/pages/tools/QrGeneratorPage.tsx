import React, { useState, useEffect } from 'react';
import { Download, Copy, Check, QrCode, Globe, Mail, Phone, Wifi, FileText } from 'lucide-react';
import { ToolLayout } from '../../components/layout/ToolLayout';
import { StatusMessage } from '../../components/tools/StatusMessage';
import { TOOLS } from '../../data/tools';
import { downloadDataUrl, downloadBlob } from '../../lib/format';
import {
  buildWifiQrString,
  buildEmailQrString,
  buildPhoneQrString,
  generateQrPngDataUrl,
  generateQrSvgString
} from '../../lib/qrHelper';
import type { QrDataType, WifiConfig, EmailConfig } from '../../lib/qrHelper';

export const QrGeneratorPage: React.FC = () => {
  const tool = TOOLS.find(t => t.id === 'qr-generator')!;

  const [dataType, setDataType] = useState<QrDataType>('url');

  // Input states
  const [urlInput, setUrlInput] = useState<string>('https://');
  const [textInput, setTextInput] = useState<string>('');
  const [wifiConfig, setWifiConfig] = useState<WifiConfig>({
    ssid: '',
    password: '',
    encryption: 'WPA',
    hidden: false
  });
  const [emailConfig, setEmailConfig] = useState<EmailConfig>({
    address: '',
    subject: '',
    body: ''
  });
  const [phoneInput, setPhoneInput] = useState<string>('');

  // Styling and configuration options
  const [fgColor, setFgColor] = useState<string>('#202321');
  const [bgColor, setBgColor] = useState<string>('#FFFFFF');
  const [size, setSize] = useState<number>(512);
  const [errorCorrection, setErrorCorrection] = useState<'L' | 'M' | 'Q' | 'H'>('M');

  // Result state
  const [pngDataUrl, setPngDataUrl] = useState<string>('');
  const [svgString, setSvgString] = useState<string>('');
  const [rawQrPayload, setRawQrPayload] = useState<string>('');
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Compute final QR payload
  const computePayload = (): string => {
    switch (dataType) {
      case 'url':
        return urlInput.trim();
      case 'text':
        return textInput.trim();
      case 'wifi':
        if (!wifiConfig.ssid.trim()) return '';
        return buildWifiQrString(wifiConfig);
      case 'email':
        if (!emailConfig.address.trim()) return '';
        return buildEmailQrString(emailConfig);
      case 'phone':
        if (!phoneInput.trim()) return '';
        return buildPhoneQrString(phoneInput);
      default:
        return '';
    }
  };

  useEffect(() => {
    const payload = computePayload();
    setRawQrPayload(payload);

    if (!payload) {
      setPngDataUrl('');
      setSvgString('');
      return;
    }

    setErrorMessage(null);

    const render = async () => {
      try {
        const png = await generateQrPngDataUrl(payload, {
          width: size,
          fgColor,
          bgColor,
          errorCorrectionLevel: errorCorrection
        });
        const svg = await generateQrSvgString(payload, {
          width: size,
          fgColor,
          bgColor,
          errorCorrectionLevel: errorCorrection
        });
        setPngDataUrl(png);
        setSvgString(svg);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Gagal menghasilkan QR code.';
        setErrorMessage(msg);
      }
    };

    render();
  }, [dataType, urlInput, textInput, wifiConfig, emailConfig, phoneInput, fgColor, bgColor, size, errorCorrection]);

  const handleCopyText = async () => {
    if (!rawQrPayload) return;
    try {
      await navigator.clipboard.writeText(rawQrPayload);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch {
      // ignore
    }
  };

  const handleDownloadPng = () => {
    if (!pngDataUrl) return;
    downloadDataUrl(pngDataUrl, 'pakaitools-qr.png');
  };

  const handleDownloadSvg = () => {
    if (!svgString) return;
    const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
    downloadBlob(blob, 'pakaitools-qr.svg');
  };

  return (
    <ToolLayout tool={tool}>
      {errorMessage && (
        <StatusMessage
          type="error"
          message={errorMessage}
          onDismiss={() => setErrorMessage(null)}
        />
      )}

      {/* Data Type Selector */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '8px',
        marginBottom: '24px'
      }}>
        {[
          { type: 'url', label: 'Tautan / URL', icon: <Globe size={16} /> },
          { type: 'text', label: 'Teks Biasa', icon: <FileText size={16} /> },
          { type: 'wifi', label: 'Jaringan Wi-Fi', icon: <Wifi size={16} /> },
          { type: 'email', label: 'Email', icon: <Mail size={16} /> },
          { type: 'phone', label: 'Nomor Telepon', icon: <Phone size={16} /> }
        ].map(item => (
          <button
            key={item.type}
            type="button"
            className={`btn ${dataType === item.type ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setDataType(item.type as QrDataType)}
          >
            {item.icon}
            <span>{item.label}</span>
          </button>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
        {/* Input Configuration Column */}
        <div className="panel">
          <h2 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '16px' }}>
            Isi Konten QR Code
          </h2>

          {/* URL Form */}
          {dataType === 'url' && (
            <div style={{ marginBottom: '20px' }}>
              <label htmlFor="url-field" style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 500, marginBottom: '6px' }}>
                Alamat Web (URL)
              </label>
              <input
                id="url-field"
                type="url"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder="https://contoh-website.com"
              />
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                Pastikan mencantumkan protokol http:// atau https://
              </div>
            </div>
          )}

          {/* Plain Text Form */}
          {dataType === 'text' && (
            <div style={{ marginBottom: '20px' }}>
              <label htmlFor="text-field" style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 500, marginBottom: '6px' }}>
                Teks Bebas / Catatan
              </label>
              <textarea
                id="text-field"
                rows={4}
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                placeholder="Tuliskan teks, pesan, atau informasi apa saja di sini..."
              />
            </div>
          )}

          {/* Wi-Fi Form */}
          {dataType === 'wifi' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '20px' }}>
              <div>
                <label htmlFor="wifi-ssid" style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 500, marginBottom: '6px' }}>
                  Nama Jaringan Wi-Fi (SSID)
                </label>
                <input
                  id="wifi-ssid"
                  type="text"
                  value={wifiConfig.ssid}
                  onChange={(e) => setWifiConfig({ ...wifiConfig, ssid: e.target.value })}
                  placeholder="Contoh: Kafe_WiFi_Gratis"
                />
              </div>

              <div>
                <label htmlFor="wifi-pass" style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 500, marginBottom: '6px' }}>
                  Kata Sandi (Password)
                </label>
                <input
                  id="wifi-pass"
                  type="text"
                  value={wifiConfig.password}
                  onChange={(e) => setWifiConfig({ ...wifiConfig, password: e.target.value })}
                  placeholder="Masukkan password Wi-Fi"
                  disabled={wifiConfig.encryption === 'nopass'}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label htmlFor="wifi-enc" style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 500, marginBottom: '6px' }}>
                    Jenis Keamanan
                  </label>
                  <select
                    id="wifi-enc"
                    value={wifiConfig.encryption}
                    onChange={(e) => setWifiConfig({ ...wifiConfig, encryption: e.target.value as any })}
                  >
                    <option value="WPA">WPA / WPA2 / WPA3</option>
                    <option value="WEP">WEP (Jadul)</option>
                    <option value="nopass">Tanpa Password (Terbuka)</option>
                  </select>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', paddingTop: '20px' }}>
                  <label style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.8125rem' }}>
                    <input
                      type="checkbox"
                      checked={wifiConfig.hidden}
                      onChange={(e) => setWifiConfig({ ...wifiConfig, hidden: e.target.checked })}
                      style={{ width: 'auto', accentColor: 'var(--accent-primary)' }}
                    />
                    <span>SSID Tersembunyi</span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Email Form */}
          {dataType === 'email' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '20px' }}>
              <div>
                <label htmlFor="email-addr" style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 500, marginBottom: '6px' }}>
                  Alamat Email Penerima
                </label>
                <input
                  id="email-addr"
                  type="email"
                  value={emailConfig.address}
                  onChange={(e) => setEmailConfig({ ...emailConfig, address: e.target.value })}
                  placeholder="tujuan@domain.com"
                />
              </div>

              <div>
                <label htmlFor="email-subj" style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 500, marginBottom: '6px' }}>
                  Subjek Email (Opsional)
                </label>
                <input
                  id="email-subj"
                  type="text"
                  value={emailConfig.subject}
                  onChange={(e) => setEmailConfig({ ...emailConfig, subject: e.target.value })}
                  placeholder="Judul pesan email"
                />
              </div>

              <div>
                <label htmlFor="email-body" style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 500, marginBottom: '6px' }}>
                  Isi Pesan (Opsional)
                </label>
                <textarea
                  id="email-body"
                  rows={2}
                  value={emailConfig.body}
                  onChange={(e) => setEmailConfig({ ...emailConfig, body: e.target.value })}
                  placeholder="Isi teks draf email..."
                />
              </div>
            </div>
          )}

          {/* Phone Form */}
          {dataType === 'phone' && (
            <div style={{ marginBottom: '20px' }}>
              <label htmlFor="phone-field" style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 500, marginBottom: '6px' }}>
                Nomor Telepon / WhatsApp
              </label>
              <input
                id="phone-field"
                type="text"
                value={phoneInput}
                onChange={(e) => setPhoneInput(e.target.value)}
                placeholder="+628123456789"
              />
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                Gunakan format internasional (contoh: +6281...)
              </div>
            </div>
          )}

          {/* Visual Customization */}
          <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '16px', marginTop: '16px' }}>
            <h3 style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '14px' }}>
              Kustomisasi Tampilan & Kualitas
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '12px', marginBottom: '16px' }}>
              <div>
                <label htmlFor="fg-color" style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 500, marginBottom: '6px' }}>
                  Warna Kode
                </label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input
                    id="fg-color"
                    type="color"
                    value={fgColor}
                    onChange={(e) => setFgColor(e.target.value)}
                    style={{ width: '36px', height: '36px', padding: 0, cursor: 'pointer', border: '1px solid var(--border-color)', borderRadius: '4px' }}
                  />
                  <span style={{ fontSize: '0.8125rem', fontFamily: 'var(--font-mono)' }}>{fgColor}</span>
                </div>
              </div>

              <div>
                <label htmlFor="bg-color" style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 500, marginBottom: '6px' }}>
                  Warna Latar
                </label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input
                    id="bg-color"
                    type="color"
                    value={bgColor}
                    onChange={(e) => setBgColor(e.target.value)}
                    style={{ width: '36px', height: '36px', padding: 0, cursor: 'pointer', border: '1px solid var(--border-color)', borderRadius: '4px' }}
                  />
                  <span style={{ fontSize: '0.8125rem', fontFamily: 'var(--font-mono)' }}>{bgColor}</span>
                </div>
              </div>

              <div>
                <label htmlFor="qr-size" style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 500, marginBottom: '6px' }}>
                  Resolusi
                </label>
                <select
                  id="qr-size"
                  value={size}
                  onChange={(e) => setSize(Number(e.target.value))}
                >
                  <option value={256}>256 × 256 px</option>
                  <option value={512}>512 × 512 px (Standar)</option>
                  <option value={1024}>1024 × 1024 px (Cetak HD)</option>
                </select>
              </div>

              <div>
                <label htmlFor="err-level" style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 500, marginBottom: '6px' }}>
                  Koreksi Error
                </label>
                <select
                  id="err-level"
                  value={errorCorrection}
                  onChange={(e) => setErrorCorrection(e.target.value as any)}
                >
                  <option value="L">L (7% Toleransi)</option>
                  <option value="M">M (15% Standar)</option>
                  <option value="Q">Q (25% Tinggi)</option>
                  <option value="H">H (30% Maksimal)</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Live Preview Column */}
        <div className="panel" style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h2 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)' }}>
              Pratinjau QR Code
            </h2>
            {rawQrPayload && (
              <button
                type="button"
                className="btn btn-outline btn-sm"
                onClick={handleCopyText}
                title="Salin teks payload"
              >
                {isCopied ? <Check size={14} color="var(--success)" /> : <Copy size={14} />}
                <span>{isCopied ? 'Tersalin' : 'Salin Isi'}</span>
              </button>
            )}
          </div>

          <div style={{
            flex: 1,
            minHeight: '260px',
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-sm)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px'
          }}>
            {pngDataUrl ? (
              <img
                src={pngDataUrl}
                alt="QR Code Preview"
                style={{
                  maxWidth: '100%',
                  width: '240px',
                  height: '240px',
                  objectFit: 'contain',
                  border: '1px solid var(--border-color)',
                  backgroundColor: bgColor,
                  borderRadius: 'var(--radius-sm)'
                }}
              />
            ) : (
              <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                <QrCode size={48} strokeWidth={1.2} style={{ margin: '0 auto 12px auto' }} />
                <div>Masukkan data di sebelah kiri untuk membuat QR Code</div>
              </div>
            )}
          </div>

          {pngDataUrl && (
            <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{
                fontSize: '0.75rem',
                color: 'var(--text-secondary)',
                backgroundColor: 'var(--bg-surface)',
                padding: '8px 12px',
                borderRadius: 'var(--radius-sm)',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                fontFamily: 'var(--font-mono)'
              }}>
                Payload: {rawQrPayload}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleDownloadPng}
                  style={{ height: '42px' }}
                >
                  <Download size={15} />
                  <span>Unduh PNG</span>
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={handleDownloadSvg}
                  style={{ height: '42px' }}
                >
                  <Download size={15} />
                  <span>Unduh Vektor SVG</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </ToolLayout>
  );
};
