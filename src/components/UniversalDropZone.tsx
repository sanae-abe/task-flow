import { Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';

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
  fileInputRef: React.RefObject<HTMLInputElement>;
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
  ariaLabel,
}) => {
  const { t } = useTranslation();

  const getDefaultTitle = () => {
    switch (importMode) {
      case 'drag-drop':
        return t('attachment.dragDrop');
      case 'file-select':
        return t('attachment.addAttachment');
      case 'both':
        return t('attachment.dragDropOrClick');
      default:
        return t('attachment.dragDropOrClick');
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
    const sizeText = t('attachment.maxSizeLabel', {
      size: Math.round(maxFileSize / 1024 / 1024),
    });
    if (allowedTypes.length > 0 && !allowedTypes.includes('*/*')) {
      const extensions = allowedTypes
        .map(type =>
          type.startsWith('.') ? type : (type.split('/')[1] ?? type)
        )
        .join(', ');
      return `${sizeText} (${extensions})`;
    }
    return sizeText;
  };

  const shouldShowDropZone =
    importMode === 'drag-drop' || importMode === 'both';
  const shouldAllowClick =
    importMode === 'file-select' || importMode === 'both';

  const getAriaLabel = () => {
    if (ariaLabel) {
      return ariaLabel;
    }
    if (
      allowedTypes.includes('application/json') ||
      allowedTypes.includes('.json')
    ) {
      return 'JSONファイルを選択';
    }
    return multiple ? 'ファイルを選択' : 'ファイルを選択';
  };

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-2 p-4 text-center transition-all duration-200 rounded-md',
        shouldShowDropZone ? 'border-2 border-dashed' : 'border-2 border-solid',
        isLoading && 'opacity-70 cursor-not-allowed',
        isDragOver && 'border-primary bg-blue-50',
        !isDragOver && !isLoading && 'border-gray-300 bg-gray-50',
        isLoading && 'border-gray-200 bg-gray-100',
        shouldAllowClick && !isLoading && 'cursor-pointer'
      )}
      style={{ minHeight }}
      onDragOver={!isLoading && shouldShowDropZone ? onDragOver : undefined}
      onDragEnter={!isLoading && shouldShowDropZone ? onDragEnter : undefined}
      onDragLeave={!isLoading && shouldShowDropZone ? onDragLeave : undefined}
      onDrop={!isLoading && shouldShowDropZone ? onDrop : undefined}
      onClick={!isLoading && shouldAllowClick ? onClick : undefined}
      role='button'
      tabIndex={isLoading ? -1 : 0}
      aria-label={getAriaLabel()}
    >
      <div className={cn(isDragOver ? 'text-primary' : 'text-zinc-500')}>
        <Upload size={24} />
      </div>
      <p
        className={cn(
          'block font-normal tracking-tight text-sm',
          isDragOver ? 'text-primary' : 'text-foreground'
        )}
      >
        {getDisplayTitle()}
      </p>
      <p className='text-xs text-zinc-700'>
        {subtitle ?? getDefaultSubtitle()}
      </p>
      {showButton && !isDragOver && (
        <Button
          onClick={e => {
            e.stopPropagation();
            onClick();
          }}
          disabled={isLoading}
          size='sm'
          variant='default'
        >
          {isLoading
            ? (loadingText ?? 'アップロード中...')
            : (buttonText ?? 'ファイルを選択')}
        </Button>
      )}

      <input
        ref={fileInputRef}
        type='file'
        multiple={multiple}
        accept={allowedTypes.join(',')}
        onChange={onFileInputChange}
        disabled={isLoading}
        aria-hidden='true'
        className='hidden'
      />
    </div>
  );
};

export default UniversalDropZone;
