import { UploadIcon } from '@primer/octicons-react';
import { Box, Text, Button } from '@primer/react';
import React from 'react';

import type { ImportMode } from '../types';

interface UniversalDropZoneProps {
  isDragOver: boolean;
  isLoading?: boolean;
  maxFileSize: number;
  allowedTypes: string[];
  multiple?: boolean;
  onDragOver: (e: React.DragEvent) => void;
  onDragEnter?: (e: React.DragEvent) => void;
  onDragLeave: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
  onClick: () => void;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  onFileInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  importMode?: ImportMode;
  
  // カスタマイズ可能なプロパティ
  title?: string;
  dragTitle?: string;
  subtitle?: string;
  buttonText?: string;
  loadingText?: string;
  showButton?: boolean;
  minHeight?: string;
  ariaLabel?: string;
}

const UniversalDropZone: React.FC<UniversalDropZoneProps> = ({
  isDragOver,
  isLoading = false,
  maxFileSize,
  allowedTypes,
  multiple = true,
  onDragOver,
  onDragEnter,
  onDragLeave,
  onDrop,
  onClick,
  fileInputRef,
  onFileInputChange,
  importMode = 'both',
  
  // カスタマイズ可能なプロパティ
  title,
  dragTitle,
  subtitle,
  buttonText,
  loadingText,
  showButton = false,
  minHeight = '120px',
  ariaLabel
}) => {
  const getDefaultTitle = () => {
    const fileTypeText = multiple ? 'ファイル' : 'ファイル';
    switch (importMode) {
      case 'drag-drop':
        return `${fileTypeText}をここにドラッグ＆ドロップ`;
      case 'file-select':
        return `クリックして${fileTypeText}を選択`;
      case 'both':
        return `${fileTypeText}をここにドラッグ＆ドロップするか、クリックして選択`;
      default:
        return `${fileTypeText}をここにドラッグ＆ドロップするか、クリックして選択`;
    }
  };

  const getDisplayTitle = () => {
    if (isDragOver && dragTitle) {
      return dragTitle;
    }
    if (title) {
      return title;
    }
    return getDefaultTitle();
  };

  const getDefaultSubtitle = () => {
    const sizeText = `最大${Math.round(maxFileSize / 1024 / 1024)}MB`;
    if (allowedTypes.length > 0 && !allowedTypes.includes('*/*')) {
      const extensions = allowedTypes
        .map(type => type.startsWith('.') ? type : type.split('/')[1] ?? type)
        .join(', ');
      return `${sizeText} (${extensions})`;
    }
    return sizeText;
  };

  const shouldShowDropZone = importMode === 'drag-drop' || importMode === 'both';
  const shouldAllowClick = importMode === 'file-select' || importMode === 'both';

  const getBorderColor = () => {
    if (isLoading) {
      return 'border.muted';
    }
    if (isDragOver) {
      return 'accent.emphasis';
    }
    return 'border.default';
  };

  const getBackgroundColor = () => {
    if (isLoading) {
      return 'canvas.inset';
    }
    if (isDragOver) {
      return 'accent.subtle';
    }
    return 'canvas.subtle';
  };

  const getCursor = () => {
    if (isLoading) {
      return 'not-allowed';
    }
    if (shouldAllowClick) {
      return 'pointer';
    }
    return 'default';
  };

  const getAriaLabel = () => {
    if (ariaLabel) {
      return ariaLabel;
    }
    if (allowedTypes.includes('application/json') || allowedTypes.includes('.json')) {
      return 'JSONファイルを選択';
    }
    return multiple ? 'ファイルを選択' : 'ファイルを選択';
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 2,
        border: shouldShowDropZone ? '2px dashed' : '2px solid',
        borderColor: getBorderColor(),
        borderRadius: 2,
        p: 4,
        textAlign: 'center',
        bg: getBackgroundColor(),
        cursor: getCursor(),
        transition: 'all 0.2s ease',
        minHeight,
        opacity: isLoading ? 0.7 : 1
      }}
      onDragOver={!isLoading && shouldShowDropZone ? onDragOver : undefined}
      onDragEnter={!isLoading && shouldShowDropZone ? onDragEnter : undefined}
      onDragLeave={!isLoading && shouldShowDropZone ? onDragLeave : undefined}
      onDrop={!isLoading && shouldShowDropZone ? onDrop : undefined}
      onClick={!isLoading && shouldAllowClick ? onClick : undefined}
      role="button"
      tabIndex={isLoading ? -1 : 0}
      aria-label={getAriaLabel()}
    >
      <Box sx={{ color: isDragOver ? 'accent.emphasis' : 'fg.muted' }}>
        <UploadIcon size={24} />
      </Box>
      <Text 
        sx={{ 
          display: 'block', 
          color: isDragOver ? 'accent.emphasis' : 'fg.default',
          fontWeight: 'normal',
          letterSpacing: '-0.04em'
        }}
      >
        {getDisplayTitle()}
      </Text>
      <Text sx={{ fontSize: 0, color: 'fg.muted' }}>
        {subtitle ?? getDefaultSubtitle()}
      </Text>
      {showButton && !isDragOver && (
        <Button 
          onClick={(e) => {
            e.stopPropagation();
            onClick();
          }} 
          disabled={isLoading}
          size="small"
        >
          {isLoading ? (loadingText ?? 'アップロード中...') : (buttonText ?? 'ファイルを選択')}
        </Button>
      )}

      <input
        ref={fileInputRef}
        type="file"
        multiple={multiple}
        accept={allowedTypes.join(',')}
        onChange={onFileInputChange}
        style={{ display: 'none' }}
        disabled={isLoading}
        aria-hidden="true"
      />
    </Box>
  );
};

export default UniversalDropZone;