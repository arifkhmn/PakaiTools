import QRCode from 'qrcode';

export type QrDataType = 'url' | 'text' | 'wifi' | 'email' | 'phone';

export interface WifiConfig {
  ssid: string;
  password: string;
  encryption: 'WPA' | 'WEP' | 'nopass';
  hidden: boolean;
}

export interface EmailConfig {
  address: string;
  subject: string;
  body: string;
}

export function escapeWifiString(str: string): string {
  // Escape backslash, semicolon, comma, colon, and quotes as per Wi-Fi QR spec
  return str.replace(/([\\;,":])/g, '\\$1');
}

export function buildWifiQrString(config: WifiConfig): string {
  const enc = config.encryption || 'WPA';
  const ssid = escapeWifiString(config.ssid.trim());
  const pass = config.encryption !== 'nopass' ? escapeWifiString(config.password) : '';
  const hidden = config.hidden ? 'H:true;' : '';

  return `WIFI:S:${ssid};T:${enc};P:${pass};${hidden};`;
}

export function buildEmailQrString(config: EmailConfig): string {
  const params: string[] = [];
  if (config.subject) params.push(`subject=${encodeURIComponent(config.subject)}`);
  if (config.body) params.push(`body=${encodeURIComponent(config.body)}`);
  const query = params.length > 0 ? `?${params.join('&')}` : '';
  return `mailto:${config.address.trim()}${query}`;
}

export function buildPhoneQrString(phone: string): string {
  const cleaned = phone.replace(/[^0-9+]/g, '');
  return `tel:${cleaned}`;
}

export interface QrRenderOptions {
  width: number;
  fgColor: string;
  bgColor: string;
  errorCorrectionLevel: 'L' | 'M' | 'Q' | 'H';
}

export async function generateQrPngDataUrl(content: string, options: QrRenderOptions): Promise<string> {
  if (!content.trim()) {
    throw new Error('Konten QR code tidak boleh kosong.');
  }

  return await QRCode.toDataURL(content, {
    width: options.width,
    margin: 2,
    color: {
      dark: options.fgColor,
      light: options.bgColor
    },
    errorCorrectionLevel: options.errorCorrectionLevel
  });
}

export async function generateQrSvgString(content: string, options: QrRenderOptions): Promise<string> {
  if (!content.trim()) {
    throw new Error('Konten QR code tidak boleh kosong.');
  }

  return await QRCode.toString(content, {
    type: 'svg',
    width: options.width,
    margin: 2,
    color: {
      dark: options.fgColor,
      light: options.bgColor
    },
    errorCorrectionLevel: options.errorCorrectionLevel
  });
}
