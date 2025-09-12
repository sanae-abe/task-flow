import { EyeIcon, ImageIcon, XIcon } from '@primer/octicons-react';
import { Box, Text, Button } from '@primer/react';
import React, { useState, memo, useCallback } from 'react';

import type { FileAttachment } from '../types';
import { isImageFile, isTextFile, formatFileSize } from '../utils/fileUtils';

interface FilePreviewProps {
  attachment: FileAttachment;
  showPreviewButton?: boolean;
}

interface PreviewContentProps {
  attachment: FileAttachment;
  isImage: boolean;
  isText: boolean;
}

interface PreviewButtonProps {
  attachment: FileAttachment;
  isImage: boolean;
  onClick: () => void;
}

interface PreviewFooterProps {
  attachment: FileAttachment;
}

// プレビューボタンコンポーネント
const PreviewButton = memo<PreviewButtonProps>(({ attachment, isImage, onClick }) => (
  <Button
    variant="invisible"
    size="small"
    onClick={onClick}
    sx={{ p: 1 }}
    aria-label={`${attachment.name}をプレビュー`}
  >
    {isImage ? <ImageIcon size={14} /> : <EyeIcon size={14} />}
  </Button>
));

// プレビューフッターコンポーネント
const PreviewFooter = memo<PreviewFooterProps>(({ attachment }) => (
  <Box sx={{ 
    p: 3, 
    borderTop: '1px solid', 
    borderColor: 'border.default', 
    bg: 'canvas.subtle',
    display: 'flex',
    gap: 3
  }}>
    <Text sx={{ fontSize: 0, color: 'fg.muted' }}>
      ファイルサイズ: {formatFileSize(attachment.size)}
    </Text>
    <Text sx={{ fontSize: 0, color: 'fg.muted' }}>
      アップロード日: {new Date(attachment.uploadedAt).toLocaleDateString('ja-JP')}
    </Text>
  </Box>
));

const FilePreview: React.FC<FilePreviewProps> = ({ 
  attachment, 
  showPreviewButton = true 
}) => {
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const isImage = isImageFile(attachment.type);
  const isText = isTextFile(attachment.type, attachment.name);
  const canPreview = isImage || isText;


  const handleClosePreview = useCallback(() => {
    setIsPreviewOpen(false);
  }, []);

  const handleOpenPreview = useCallback(() => {
    setIsPreviewOpen(true);
  }, []);

// プレビューコンテンツコンポーネント
const PreviewContent = memo<PreviewContentProps>(({ attachment, isImage, isText }) => {
  const getDataUrl = () => `data:${attachment.type};base64,${attachment.data}`;
  
  const getTextContent = () => {
    try {
      return atob(attachment.data);
    } catch (error) {
      return 'ファイルの内容を読み込めませんでした。';
    }
  };

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

  return null;
});

  if (!canPreview && showPreviewButton) {
    return null;
  }

  return (
    <>
      {showPreviewButton && canPreview && (
        <PreviewButton
          attachment={attachment}
          isImage={isImage}
          onClick={handleOpenPreview}
        />
      )}

      {isPreviewOpen && (
        <Box
          sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            bg: 'primer.canvas.backdrop',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
          onClick={handleClosePreview}
        >
          <Box
            sx={{
              bg: 'canvas.default',
              border: '1px solid',
              borderColor: 'border.default',
              borderRadius: 2,
              boxShadow: 'shadow.extra-large',
              maxWidth: '90vw',
              maxHeight: '90vh',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column'
            }}
            onClick={(e: React.MouseEvent) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="file-preview-title"
          >
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                p: 3,
                borderBottom: '1px solid',
                borderColor: 'border.default'
              }}
            >
              <Text 
                id="file-preview-title"
                sx={{ fontSize: 2, fontWeight: 'bold' }}
              >
                {attachment.name}
              </Text>
              <Button
                variant="invisible"
                onClick={handleClosePreview}
                sx={{ p: 1 }}
                aria-label="プレビューを閉じる"
              >
                <XIcon size={16} />
              </Button>
            </Box>
            
            <Box sx={{ p: 3, flex: 1, overflow: 'auto' }}>
              <PreviewContent
                attachment={attachment}
                isImage={isImage}
                isText={isText}
              />
            </Box>
            
            <PreviewFooter attachment={attachment} />
          </Box>
        </Box>
      )}
    </>
  );
};

export default FilePreview;