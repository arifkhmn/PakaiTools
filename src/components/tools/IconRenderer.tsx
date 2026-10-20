import React from 'react';
import {
  Minimize2,
  Maximize2,
  RefreshCw,
  QrCode,
  Crop,
  ScanLine,
  Globe,
  FileText,
  Type,
  Eraser,
  Link as LinkIcon,
  FileImage,
  FileArchive,
  FileEdit,
  FileType,
  HelpCircle
} from 'lucide-react';

interface IconRendererProps {
  name: string;
  size?: number;
  className?: string;
  color?: string;
}

export const IconRenderer: React.FC<IconRendererProps> = ({
  name,
  size = 20,
  className,
  color
}) => {
  const iconProps = { size, className, color };

  switch (name) {
    case 'Minimize2':
      return <Minimize2 {...iconProps} />;
    case 'Maximize2':
      return <Maximize2 {...iconProps} />;
    case 'RefreshCw':
      return <RefreshCw {...iconProps} />;
    case 'QrCode':
      return <QrCode {...iconProps} />;
    case 'Crop':
      return <Crop {...iconProps} />;
    case 'ScanLine':
      return <ScanLine {...iconProps} />;
    case 'Globe':
      return <Globe {...iconProps} />;
    case 'FileText':
      return <FileText {...iconProps} />;
    case 'Type':
      return <Type {...iconProps} />;
    case 'Eraser':
      return <Eraser {...iconProps} />;
    case 'Link':
      return <LinkIcon {...iconProps} />;
    case 'FileImage':
      return <FileImage {...iconProps} />;
    case 'FileArchive':
      return <FileArchive {...iconProps} />;
    case 'FileEdit':
      return <FileEdit {...iconProps} />;
    case 'FileType':
      return <FileType {...iconProps} />;
    default:
      return <HelpCircle {...iconProps} />;
  }
};
