import React, { useState } from 'react';
import { Box, Text, Button } from '@primer/react';
import { EyeIcon, XIcon, FileIcon, ImageIcon } from '@primer/octicons-react';
import type { FileAttachment } from '../types';

interface FilePreviewProps {
  attachment: FileAttachment;
  showPreviewButton?: boolean;
}

const FilePreview: React.FC<FilePreviewProps> = ({ 
  attachment, 
  showPreviewButton = true 
}) => {
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const isImage = attachment.type.startsWith('image/');
  const isText = attachment.type.startsWith('text/') || 
                 attachment.type === 'application/json' ||
                 attachment.name.endsWith('.md') ||
                 attachment.name.endsWith('.txt') ||
                 attachment.name.endsWith('.csv');

  const canPreview = isImage || isText;

  const getDataUrl = () => {
    return `data:${attachment.type};base64,${attachment.data}`;
  };

  const getTextContent = () => {
    try {
      return atob(attachment.data);
    } catch (error) {
      return 'ファイルの内容を読み込めませんでした。';
    }
  };

  const renderPreviewContent = () => {
    if (isImage) {
      return (
        <Box sx={{ textAlign: 'center', maxHeight: '70vh', overflow: 'auto' }}>
          <img
            src={getDataUrl()}
            alt={attachment.name}
            style={{
              maxWidth: '100%',
              maxHeight: '60vh',
              objectFit: 'contain',
              borderRadius: '6px'
            }}
          />
        </Box>
      );
    }

    if (isText) {
      return (
        <Box 
          sx={{ 
            maxHeight: '60vh', 
            overflow: 'auto',
            bg: 'canvas.subtle',
            p: 3,
            borderRadius: 1,
            fontFamily: 'mono'
          }}
        >
          <Text 
            sx={{ 
              whiteSpace: 'pre-wrap',
              fontSize: 0,
              lineHeight: '1.5'
            }}
          >
            {getTextContent()}
          </Text>
        </Box>
      );
    }

    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <FileIcon size={48} />
        <Text sx={{ display: 'block', mt: 2, color: 'fg.muted' }}>
          このファイル形式はプレビューできません
        </Text>
      </Box>
    );
  };

  if (!canPreview && showPreviewButton) {
    return null;
  }

  return (
    <>
      {showPreviewButton && canPreview && (
        <Button
          variant="invisible"
          size="small"
          onClick={() => setIsPreviewOpen(true)}
          sx={{ p: 1 }}
          aria-label={`${attachment.name}をプレビュー`}
        >
          {isImage ? <ImageIcon size={14} /> : <EyeIcon size={14} />}
        </Button>
      )}

      {isPreviewOpen && (
        <Box
          sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            bg: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
          }}
          onClick={() => setIsPreviewOpen(false)}
        >
          <Box
            sx={{
              bg: 'canvas.default',
              borderRadius: 2,
              maxWidth: '90vw',
              maxHeight: '90vh',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: 'shadow.extra-large'
            }}
            onClick={(e: React.MouseEvent) => e.stopPropagation()}
          >
            {/* ヘッダー */}
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                p: 3,
                borderBottom: '1px solid',
                borderColor: 'border.default'
              }}
            >
              <Text sx={{ fontWeight: 'bold', fontSize: 2 }}>
                {attachment.name}
              </Text>
              <Button
                variant="invisible"
                size="small"
                onClick={() => setIsPreviewOpen(false)}
                aria-label="プレビューを閉じる"
              >
                <XIcon size={16} />
              </Button>
            </Box>
            
            {/* コンテンツ */}
            <Box sx={{ p: 3, flex: 1, overflow: 'auto' }}>
              {renderPreviewContent()}
            </Box>
            
            {/* フッター */}
            <Box sx={{ p: 3, borderTop: '1px solid', borderColor: 'border.default', bg: 'canvas.subtle' }}>
              <Text sx={{ fontSize: 0, color: 'fg.muted' }}>
                ファイルサイズ: {(attachment.size / 1024).toFixed(1)} KB
              </Text>
              <Text sx={{ fontSize: 0, color: 'fg.muted', ml: 3 }}>
                アップロード日: {new Date(attachment.uploadedAt).toLocaleDateString('ja-JP')}
              </Text>
            </Box>
          </Box>
        </Box>
      )}
    </>
  );
};

export default FilePreview;