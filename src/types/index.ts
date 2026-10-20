export type ToolCategory = 'all' | 'image' | 'qr' | 'text' | 'pdf';

export interface ToolDefinition {
  id: string;
  name: string;
  slug: string;
  path: string;
  category: 'image' | 'qr' | 'text' | 'pdf';
  categoryLabel: string;
  description: string;
  shortDesc: string;
  iconName: string;
  popular: boolean;
  keywords: string[];
  features: string[];
}

export interface ProcessedFile {
  id: string;
  file: File;
  name: string;
  originalSize: number;
  originalWidth?: number;
  originalHeight?: number;
  outputSize?: number;
  outputBlob?: Blob;
  outputUrl?: string;
  outputWidth?: number;
  outputHeight?: number;
  status: 'idle' | 'processing' | 'done' | 'error';
  error?: string;
  savedBytes?: number;
  savedPercent?: number;
  isLarger?: boolean;
}
