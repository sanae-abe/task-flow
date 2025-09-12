import { XIcon } from '@primer/octicons-react';
import { Box, Text, Button } from '@primer/react';
import React, { useCallback, memo } from 'react';

import type { DialogActionsProps } from '../types/dialog';

const DIALOG_STYLES = {
  backdrop: {
    position: 'fixed' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    bg: 'primer.canvas.backdrop',
    zIndex: 1000,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  content: {
    bg: 'canvas.default',
    border: '1px solid',
    borderColor: 'border.default',
    borderRadius: 2,
    boxShadow: 'shadow.large',
    p: 4,
    minWidth: '400px',
    maxWidth: '500px',
    maxHeight: '90vh',
    overflowY: 'auto'
  },
  largeContent: {
    bg: 'canvas.default',
    border: '1px solid',
    borderColor: 'border.default',
    borderRadius: 2,
    boxShadow: 'shadow.large',
    p: 4,
    minWidth: '500px',
    maxWidth: '600px',
    maxHeight: '90vh',
    overflowY: 'auto'
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    mb: 3
  },
  actions: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: 2
  }
} as const;

interface BaseDialogProps {
  isOpen: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  actions?: React.ReactNode;
  ariaLabelledBy?: string;
  size?: 'default' | 'large';
}

interface DialogHeaderProps {
  title: string;
  onClose: () => void;
  titleId?: string;
}


export const DialogHeader = memo<DialogHeaderProps>(({ 
  title, 
  onClose, 
  titleId 
}) => (
  <Box sx={DIALOG_STYLES.header}>
    <Text 
      id={titleId}
      sx={{ fontSize: 2, fontWeight: 'bold' }}
    >
      {title}
    </Text>
    <Button
      variant="invisible"
      onClick={onClose}
      sx={{ p: 1 }}
      aria-label="ダイアログを閉じる"
    >
      <XIcon size={16} />
    </Button>
  </Box>
));

export const DialogActions = memo<DialogActionsProps>(({ 
  onCancel, 
  onConfirm, 
  confirmText,
  cancelText = 'キャンセル',
  isConfirmDisabled = false,
  confirmVariant = 'primary'
}) => (
  <Box sx={DIALOG_STYLES.actions}>
    <Button onClick={onCancel}>
      {cancelText}
    </Button>
    <Button
      variant={confirmVariant}
      onClick={onConfirm}
      disabled={isConfirmDisabled}
      sx={{ color: 'fg.onEmphasis !important' }}
    >
      {confirmText}
    </Button>
  </Box>
));

const BaseDialog = memo<BaseDialogProps>(({ 
  isOpen, 
  title, 
  onClose, 
  children, 
  actions,
  ariaLabelledBy,
  size = 'default'
}) => {
  const handleBackdropClick = useCallback((event: React.MouseEvent) => {
    if (event.target === event.currentTarget) {
      onClose();
    }
  }, [onClose]);

  const handleContentClick = useCallback((event: React.MouseEvent) => {
    event.stopPropagation();
  }, []);

  if (!isOpen) {
    return null;
  }

  return (
    <Box
      sx={DIALOG_STYLES.backdrop}
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby={ariaLabelledBy}
    >
      <Box
        sx={size === 'large' ? DIALOG_STYLES.largeContent : DIALOG_STYLES.content}
        onClick={handleContentClick}
      >
        <DialogHeader 
          title={title} 
          onClose={onClose} 
          titleId={ariaLabelledBy}
        />
        {children}
        {actions}
      </Box>
    </Box>
  );
});

export default BaseDialog;
export { DIALOG_STYLES };