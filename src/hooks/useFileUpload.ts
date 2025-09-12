import { useState, useCallback, useRef } from 'react';

import type { FileAttachment } from '../types';

// 定数の定義
export const DEFAULT_MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
export const DEFAULT_ALLOWED_TYPES = [
  'image/*',
  'text/*',
  'application/pdf',
  '.doc',
  '.docx',
  '.xlsx',
  '.xls'
];

export interface UseFileUploadOptions {
  maxFileSize?: number;
  allowedTypes?: string[];
}

export interface UseFileUploadReturn {
  isDragOver: boolean;
  error: string | null;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  handleDragOver: (e: React.DragEvent) => void;
  handleDragLeave: (e: React.DragEvent) => void;
  handleDrop: (e: React.DragEvent) => void;
  handleFileSelect: () => void;
  handleFileInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleFiles: (files: FileList) => Promise<void>;
  setError: (error: string | null) => void;
}

export const useFileUpload = (
  attachments: FileAttachment[],
  onAttachmentsChange: (attachments: FileAttachment[]) => void,
  options: UseFileUploadOptions = {}
): UseFileUploadReturn => {
  const {
    maxFileSize = DEFAULT_MAX_FILE_SIZE,
    allowedTypes = DEFAULT_ALLOWED_TYPES
  } = options;

  const [isDragOver, setIsDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const generateFileId = useCallback((): string => Date.now().toString() + Math.random().toString(36).substr(2, 9), []);

  const validateFile = useCallback((file: File): string | null => {
    if (file.size > maxFileSize) {
      return `ファイルサイズが制限を超えています（${Math.round(maxFileSize / 1024 / 1024)}MB以下）`;
    }

    const isValidType = allowedTypes.some(type => {
      if (type.endsWith('/*')) {
        return file.type.startsWith(type.slice(0, -1));
      }
      if (type.startsWith('.')) {
        return file.name.toLowerCase().endsWith(type.toLowerCase());
      }
      return file.type === type;
    });

    if (!isValidType) {
      return 'サポートされていないファイル形式です';
    }

    return null;
  }, [maxFileSize, allowedTypes]);

  const processFile = useCallback((file: File): Promise<FileAttachment> => new Promise((resolve, reject) => {
      const validationError = validateFile(file);
      if (validationError) {
        reject(new Error(validationError));
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        const base64Data = result.split(',')[1] ?? '';

        resolve({
          id: generateFileId(),
          name: file.name,
          type: file.type,
          size: file.size,
          data: base64Data,
          uploadedAt: new Date()
        });
      };
      reader.onerror = () => reject(new Error('ファイルの読み込みに失敗しました'));
      reader.readAsDataURL(file);
    }), [validateFile, generateFileId]);

  const handleFiles = useCallback(async (files: FileList): Promise<void> => {
    setError(null);
    const fileArray = Array.from(files);

    try {
      const newAttachments = await Promise.all(
        fileArray.map(file => processFile(file))
      );
      onAttachmentsChange([...attachments, ...newAttachments]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'ファイルの処理中にエラーが発生しました');
    }
  }, [attachments, onAttachmentsChange, processFile]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    if (e.dataTransfer.files) {
      void handleFiles(e.dataTransfer.files);
    }
  }, [handleFiles]);

  const handleFileSelect = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      void handleFiles(e.target.files);
    }
  }, [handleFiles]);

  return {
    isDragOver,
    error,
    fileInputRef,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    handleFileSelect,
    handleFileInputChange,
    handleFiles,
    setError
  };
};