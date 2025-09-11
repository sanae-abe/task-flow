import React, { useState, useCallback, useRef } from 'react';
import { Box, Text, Button } from '@primer/react';
import { UploadIcon, XIcon, FileIcon, ImageIcon } from '@primer/octicons-react';
import type { FileAttachment } from '../types';

interface FileUploaderProps {
  attachments: FileAttachment[];
  onAttachmentsChange: (attachments: FileAttachment[]) => void;
  maxFileSize?: number; // in bytes
  allowedTypes?: string[];
}

const FileUploader: React.FC<FileUploaderProps> = ({
  attachments,
  onAttachmentsChange,
  maxFileSize = 5 * 1024 * 1024, // 5MB default
  allowedTypes = ['image/*', 'text/*', 'application/pdf', '.doc', '.docx', '.xlsx', '.xls']
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const generateFileId = () => {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9);
  };

  const validateFile = (file: File): string | null => {
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
  };

  const processFile = useCallback((file: File): Promise<FileAttachment> => {
    return new Promise((resolve, reject) => {
      const validationError = validateFile(file);
      if (validationError) {
        reject(new Error(validationError));
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        const base64Data = result.split(',')[1] || ''; // Remove data:type;base64, prefix

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
    });
  }, [maxFileSize, allowedTypes]);

  const handleFiles = useCallback(async (files: FileList) => {
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
      handleFiles(e.dataTransfer.files);
    }
  }, [handleFiles]);

  const handleFileSelect = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(e.target.files);
    }
  }, [handleFiles]);

  const removeAttachment = useCallback((attachmentId: string) => {
    onAttachmentsChange(attachments.filter(att => att.id !== attachmentId));
  }, [attachments, onAttachmentsChange]);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) {
      return '0 Bytes';
    }
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) {
      return <ImageIcon size={16} />;
    }
    return <FileIcon size={16} />;
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* ドラッグ＆ドロップエリア */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 1,
          border: '2px dashed',
          borderColor: isDragOver ? 'accent.emphasis' : 'border.default',
          borderRadius: 2,
          p: 4,
          textAlign: 'center',
          bg: isDragOver ? 'accent.subtle' : 'canvas.subtle',
          cursor: 'pointer',
          transition: 'all 0.2s ease'
        }}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleFileSelect}
      >
        <Box sx={{ color: isDragOver ? 'accent.emphasis' : 'fg.muted' }}>
          <UploadIcon size={24} />
        </Box>
        <Text sx={{ display: 'block', color: isDragOver ? 'accent.emphasis' : 'fg.default' }}>
          ファイルをここにドラッグ＆ドロップするか、クリックして選択
        </Text>
        <Text sx={{ fontSize: 0, color: 'fg.muted' }}>
          最大{Math.round(maxFileSize / 1024 / 1024)}MB
        </Text>

        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={allowedTypes.join(',')}
          onChange={handleFileInputChange}
          style={{ display: 'none' }}
        />
      </Box>

      {/* 添付ファイル一覧 */}
      {attachments.length > 0 && (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          <Text sx={{ fontSize: 1, fontWeight: 'bold', color: 'fg.default' }}>
            添付ファイル ({attachments.length})
          </Text>
          {attachments.map((attachment) => (
            <Box
              key={attachment.id}
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                p: 2,
                bg: 'canvas.subtle',
                borderRadius: 2
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1, minWidth: 0 }}>
                {getFileIcon(attachment.type)}
                <Box sx={{ minWidth: 0, flex: 1, gap: 2, display: 'flex', alignItems: 'center'}}>
                  <Text sx={{ fontSize: 1, fontWeight: 'bold', wordBreak: 'break-word' }}>
                    {attachment.name}
                  </Text>
                  <Text sx={{ fontSize: 0, color: 'fg.muted' }}>
                    {formatFileSize(attachment.size)}
                  </Text>
                </Box>
              </Box>
              <Button
                variant="invisible"
                size="small"
                onClick={() => removeAttachment(attachment.id)}
                sx={{ p: 1, color: 'danger.fg' }}
                aria-label="ファイルを削除"
              >
                <XIcon size={16} />
              </Button>
            </Box>
          ))}
        </Box>
      )}

      {/* エラーメッセージ */}
      {error && (
        <Box sx={{ p: 2, bg: 'danger.subtle', border: '1px solid', borderColor: 'danger.muted', borderRadius: 1 }}>
          <Text sx={{ color: 'danger.fg', fontSize: 1 }}>
            {error}
          </Text>
        </Box>
      )}
    </Box>
  );
};

export default FileUploader;