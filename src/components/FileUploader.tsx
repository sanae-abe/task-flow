import { Box } from '@primer/react';
import React, { useCallback } from 'react';

import { useFileUpload, DEFAULT_MAX_FILE_SIZE, DEFAULT_ALLOWED_TYPES } from '../hooks/useFileUpload';
import type { FileAttachment } from '../types';

import AttachmentList from './AttachmentList';
import ErrorMessage from './ErrorMessage';
import FileDropZone from './FileDropZone';

interface FileUploaderProps {
  attachments: FileAttachment[];
  onAttachmentsChange: (attachments: FileAttachment[]) => void;
  maxFileSize?: number;
  allowedTypes?: string[];
}

const FileUploader: React.FC<FileUploaderProps> = ({
  attachments,
  onAttachmentsChange,
  maxFileSize = DEFAULT_MAX_FILE_SIZE,
  allowedTypes = DEFAULT_ALLOWED_TYPES
}) => {
  const {
    isDragOver,
    error,
    fileInputRef,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    handleFileSelect,
    handleFileInputChange
  } = useFileUpload(attachments, onAttachmentsChange, { maxFileSize, allowedTypes });

  const handleRemoveAttachment = useCallback((attachmentId: string) => {
    onAttachmentsChange(attachments.filter(att => att.id !== attachmentId));
  }, [attachments, onAttachmentsChange]);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <FileDropZone
        isDragOver={isDragOver}
        maxFileSize={maxFileSize}
        allowedTypes={allowedTypes}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleFileSelect}
        fileInputRef={fileInputRef}
        onFileInputChange={handleFileInputChange}
      />

      <AttachmentList
        attachments={attachments}
        onRemoveAttachment={handleRemoveAttachment}
      />

      <ErrorMessage error={error} />
    </Box>
  );
};

export default FileUploader;