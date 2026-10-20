import React, { useRef, useState } from 'react';
import { UploadCloud, Image as ImageIcon } from 'lucide-react';

interface DropzoneProps {
  onFilesSelected: (files: File[]) => void;
  accept?: string;
  multiple?: boolean;
  maxSizeMB?: number;
  label?: string;
  hint?: string;
}

export const Dropzone: React.FC<DropzoneProps> = ({
  onFilesSelected,
  accept = 'image/jpeg,image/png,image/webp',
  multiple = false,
  maxSizeMB = 25,
  label = 'Pilih atau seret gambar ke sini',
  hint = 'Mendukung JPG, PNG, dan WebP hingga 25 MB'
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const selected = Array.from(e.dataTransfer.files);
      onFilesSelected(multiple ? selected : [selected[0]]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selected = Array.from(e.target.files);
      onFilesSelected(multiple ? selected : [selected[0]]);
      // Reset input value so re-selecting same file triggers change
      e.target.value = '';
    }
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={() => fileInputRef.current?.click()}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          fileInputRef.current?.click();
        }
      }}
      tabIndex={0}
      role="button"
      aria-label="Area unggah file. Tekan Enter untuk memilih file dari komputer."
      style={{
        border: `2px dashed ${isDragOver ? 'var(--accent-primary)' : 'var(--border-color)'}`,
        backgroundColor: isDragOver ? 'var(--accent-subtle)' : 'var(--bg-surface)',
        borderRadius: 'var(--radius-lg)',
        padding: '36px 20px',
        textAlign: 'center',
        cursor: 'pointer',
        transition: 'all var(--transition-fast)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '12px'
      }}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        onChange={handleFileChange}
        style={{ display: 'none' }}
        aria-hidden="true"
      />

      <div style={{
        width: '48px',
        height: '48px',
        borderRadius: '50%',
        backgroundColor: '#FFFFFF',
        border: '1px solid var(--border-color)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: isDragOver ? 'var(--accent-primary)' : 'var(--text-secondary)'
      }}>
        {isDragOver ? <UploadCloud size={24} /> : <ImageIcon size={24} />}
      </div>

      <div>
        <div style={{ fontWeight: 600, fontSize: '0.9375rem', color: 'var(--text-primary)', marginBottom: '4px' }}>
          {label}
        </div>
        <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
          {hint}
        </div>
      </div>

      <button
        type="button"
        className="btn btn-secondary btn-sm"
        onClick={(e) => {
          e.stopPropagation();
          fileInputRef.current?.click();
        }}
        style={{ marginTop: '4px' }}
      >
        Telusuri File
      </button>

      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
        Batas ukuran: {maxSizeMB} MB · Diproses secara privat di perangkat Anda
      </div>
    </div>
  );
};
