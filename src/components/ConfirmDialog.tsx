import React from 'react';
import { Box, Text, Button } from '@primer/react';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  title,
  message,
  confirmText = '削除',
  cancelText = 'キャンセル',
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) {
    return null;
  }

  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        bg: 'primer.canvas.backdrop',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
      }}
      onClick={onCancel}
    >
      <Box
        sx={{
          bg: 'canvas.default',
          border: '1px solid',
          borderColor: 'border.default',
          borderRadius: 2,
          p: 4,
          maxWidth: '400px',
          width: '90%',
          boxShadow: 'shadow.large'
        }}
        onClick={(e: React.MouseEvent) => e.stopPropagation()}
      >
        <Text sx={{ fontSize: 2, fontWeight: 'bold', mb: 2, display: 'block' }}>
          {title}
        </Text>
        <Text sx={{ color: 'fg.muted', mb: 3, display: 'block' }}>
          {message}
        </Text>
        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
          <Button
            size="small"
            onClick={onCancel}
          >
            {cancelText}
          </Button>
          <Button
            size="small"
            variant="danger"
            onClick={onConfirm}
          >
            {confirmText}
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default ConfirmDialog;