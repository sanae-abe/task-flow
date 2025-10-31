import React, { useCallback, useState } from 'react';

import {
  useFileUpload,
  DEFAULT_MAX_FILE_SIZE,
  DEFAULT_ALLOWED_TYPES,
} from '../hooks/useFileUpload';
import type { FileAttachment, ImportMode } from '../types';

import AttachmentList from './AttachmentList';
import InlineMessage from './shared/InlineMessage';
import UniversalDropZone from './UniversalDropZone';
import ImportModeSelector from './ImportModeSelector';

interface FileUploaderProps {
  attachments: FileAttachment[];
  onAttachmentsChange: (attachments: FileAttachment[]) => void;
  maxFileSize?: number;
  allowedTypes?: string[];
  showModeSelector?: boolean;
  defaultImportMode?: ImportMode;
}

const FileUploader: React.FC<FileUploaderProps> = ({
  attachments,
  onAttachmentsChange,
  maxFileSize = DEFAULT_MAX_FILE_SIZE,
  allowedTypes = DEFAULT_ALLOWED_TYPES,
  showModeSelector = true,
  defaultImportMode = 'both',
}) => {
  const [importMode, setImportMode] = useState<ImportMode>(defaultImportMode);
  const {
    isDragOver,
    _error,
    fileInputRef,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    handleFileSelect,
    handleFileInputChange,
  } = useFileUpload(attachments, onAttachmentsChange, {
    maxFileSize,
    allowedTypes,
  });

  const handleRemoveAttachment = useCallback(
    (attachmentId: string) => {
      onAttachmentsChange(attachments.filter(att => att.id !== attachmentId));
    },
    [attachments, onAttachmentsChange]
  );

  return (
    <div className='flex flex-col gap-6 w-full'>
      {showModeSelector && (
        <ImportModeSelector
          selectedMode={importMode}
          onModeChange={setImportMode}
          showModeIndicator
        />
      )}

      <UniversalDropZone
        isDragOver={isDragOver}
        maxFileSize={maxFileSize}
        allowedTypes={allowedTypes}
        multiple
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleFileSelect}
        fileInputRef={fileInputRef}
        onFileInputChange={handleFileInputChange}
        importMode={importMode}
      />

      <AttachmentList
        attachments={attachments}
        onRemoveAttachment={handleRemoveAttachment}
      />

      <InlineMessage variant='critical' message={_error} size='small' />
    </div>
  );
};

export default FileUploader;
