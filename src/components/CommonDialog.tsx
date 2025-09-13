import { XIcon } from '@primer/octicons-react';
import { Box, Text, Button, ThemeProvider, BaseStyles, useTheme } from '@primer/react';
import React, { useCallback, memo } from 'react';
import { createPortal } from 'react-dom';

import type { DialogActionsProps } from '../types/dialog';
import IconButton from './shared/IconButton';

const DIALOG_STYLES = {
  backdrop: {
    position: 'fixed' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    bg: 'primer.canvas.backdrop',
    zIndex: 1050,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    animation: 'dialog-backdrop-fade-in 200ms cubic-bezier(0.33, 1, 0.68, 1)'
  },
  container: {
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    boxShadow: 'shadow.large',
    width: '100%',
    overflowY: 'auto',
    bg: 'canvas.default',
    borderRadius: 'var(--borderRadius-large, var(--borderRadius-large, .75rem))',
    animation: 'dialog-scale-fade-in 200ms cubic-bezier(0.33, 1, 0.68, 1)'
  },
  content: {
    p: '16px',
    bg: 'canvas.default',
    position: 'relative'
  },
  smallContainer: {
    overflow: 'hidden',
    bg: 'canvas.default',
    minWidth: '460px',
    maxWidth: '640px',
    maxHeight: '90vh',
    borderRadius: 'var(--borderRadius-large, var(--borderRadius-large, .75rem))'
  },
  largeContainer: {
    overflow: 'hidden',
    bg: 'canvas.default',
    minWidth: '600px',
    maxWidth: '640px',
    maxHeight: '90vh',
    borderRadius: 'var(--borderRadius-large, var(--borderRadius-large, .75rem))'
  },
  smallContent: {
    bg: 'canvas.default',
    p: '16px',
    minWidth: '300px',
    maxWidth: '460px',
    maxHeight: '90vh',
    overflowY: 'auto',
  },
  largeContent: {
    bg: 'canvas.default',
    p: '16px',
    minWidth: '600px',
    maxWidth: '640px',
    maxHeight: '90vh',
    overflowY: 'auto'
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    position: 'relative',
    p: '0.5rem ',
    bg: 'white',
    boxShadow: '0 1px 0 var(--borderColor-default,var(--color-border-default))',  
    zIndex: 1
  },
  title: {
    fontSize: 'var(--text-body-size-medium,.875rem)', fontWeight: '600',
    px: '8px',
    py: '6px',
    lineHeight: 'var(--text-body-line-height-medium,1.5)'
  },
  actions: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: 2
  }
} as const;

interface CommonDialogProps {
  isOpen: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  actions?: React.ReactNode;
  ariaLabelledBy?: string;
  size?: 'small' | 'default' | 'large';
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
      sx={DIALOG_STYLES.title}
    >
      {title}
    </Text>
    <IconButton
      icon={XIcon}
      onClick={onClose}
      ariaLabel="ダイアログを閉じる"
      variant="muted"
      size="medium"
    />
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

const CommonDialog = memo<CommonDialogProps>(({ 
  isOpen, 
  title, 
  onClose, 
  children, 
  actions,
  ariaLabelledBy,
  size = 'default'
}) => {
  const theme = useTheme();
  const handleBackdropClick = useCallback((event: React.MouseEvent) => {
    if (event.target === event.currentTarget) {
      onClose();
    }
  }, [onClose]);

  const handleContainerClick = useCallback((event: React.MouseEvent) => {
    event.stopPropagation();
  }, []);

  if (!isOpen) {
    return null;
  }

  const dialogContent = (
    <ThemeProvider theme={theme}>
      <BaseStyles>
        <Box
          sx={DIALOG_STYLES.backdrop}
          onClick={handleBackdropClick}
          role="dialog"
          aria-modal="true"
          aria-labelledby={ariaLabelledBy}
        >
          <Box sx={size === 'large' ? DIALOG_STYLES.largeContainer :
                  size === 'small' ? DIALOG_STYLES.smallContainer :
                  DIALOG_STYLES.container}
              onClick={handleContainerClick}
          >
            <DialogHeader 
              title={title} 
              onClose={onClose} 
              titleId={ariaLabelledBy}
            />
            <Box
              sx={size === 'large' ? DIALOG_STYLES.largeContent :
                  size === 'small' ? DIALOG_STYLES.smallContent :
                  DIALOG_STYLES.content}
            >
              {children}
              <div style={{marginTop: '24px'}}>
                {actions}
              </div>
            </Box>
          </Box>
        </Box>
      </BaseStyles>
    </ThemeProvider>
  );

  return createPortal(dialogContent, document.body);
});

export default CommonDialog;
export { DIALOG_STYLES };