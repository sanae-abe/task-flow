import { UploadIcon } from '@primer/octicons-react';
import { Box, Text } from '@primer/react';
import React from 'react';

interface FileDropZoneProps {
  isDragOver: boolean;
  maxFileSize: number;
  allowedTypes: string[];
  onDragOver: (e: React.DragEvent) => void;
  onDragLeave: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
  onClick: () => void;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  onFileInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const FileDropZone: React.FC<FileDropZoneProps> = ({
  isDragOver,
  maxFileSize,
  allowedTypes,
  onDragOver,
  onDragLeave,
  onDrop,
  onClick,
  fileInputRef,
  onFileInputChange
}) => (
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
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      onClick={onClick}
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
        onChange={onFileInputChange}
        style={{ display: 'none' }}
      />
    </Box>
  );

export default FileDropZone;