import React from 'react';
import { Box, Text, Button } from '@primer/react';
import { FileIcon, ImageIcon, DownloadIcon } from '@primer/octicons-react';
import type { FileAttachment } from '../types';
import FilePreview from './FilePreview';

interface FileListProps {
  attachments: FileAttachment[];
  showDownload?: boolean;
  showPreview?: boolean;
  maxFiles?: number;
}

const FileList: React.FC<FileListProps> = ({ 
  attachments, 
  showDownload = true,
  showPreview = true,
  maxFiles 
}) => {
  if (!attachments || attachments.length === 0) {
    return null;
  }

  const displayAttachments = maxFiles ? attachments.slice(0, maxFiles) : attachments;
  const remainingCount = maxFiles && attachments.length > maxFiles ? attachments.length - maxFiles : 0;

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
      return <ImageIcon size={14} />;
    }
    return <FileIcon size={14} />;
  };

  const downloadFile = (attachment: FileAttachment) => {
    try {
      const dataUrl = `data:${attachment.type};base64,${attachment.data}`;
      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = attachment.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('ファイルのダウンロードに失敗しました:', error);
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
      {displayAttachments.map((attachment) => (
        <Box
          key={attachment.id}
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            p: 2,
            bg: 'canvas.subtle',
            border: '1px solid',
            borderColor: 'border.default',
            borderRadius: 1,
            fontSize: 0
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1, minWidth: 0 }}>
            {getFileIcon(attachment.type)}
            <Box sx={{ minWidth: 0, flex: 1, gap: 2, display: 'flex', alignItems: 'center' }}>
              <Text sx={{ fontSize: 0, fontWeight: 'bold', wordBreak: 'break-word' }}>
                {attachment.name}
              </Text>
              <Text sx={{ fontSize: '10px', color: 'fg.muted' }}>
                {formatFileSize(attachment.size)}
              </Text>
            </Box>
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            {showPreview && (
              <FilePreview attachment={attachment} />
            )}
            {showDownload && (
              <Button
                variant="invisible"
                size="small"
                onClick={() => downloadFile(attachment)}
                sx={{ p: 1 }}
                aria-label={`${attachment.name}をダウンロード`}
              >
                <DownloadIcon size={14} />
              </Button>
            )}
          </Box>
        </Box>
      ))}
      
      {remainingCount > 0 && (
        <Text sx={{ fontSize: '10px', color: 'fg.muted', textAlign: 'center', mt: 1 }}>
          他{remainingCount}個のファイル
        </Text>
      )}
    </Box>
  );
};

export default FileList;