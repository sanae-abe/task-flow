import { XIcon } from '@primer/octicons-react';
import { Box, Text } from '@primer/react';
import React, { useCallback, useEffect, memo } from 'react';

import type { UnifiedDialogProps, DialogVariant, DialogSize } from '../../../types/unified-dialog';
import IconButton from '../IconButton';
import DialogActions from './DialogActions';

/**
 * ダイアログスタイル定義
 */
const getDialogStyles = (variant: DialogVariant, size: DialogSize) => {
  // バリアント別のスタイル
  const variantStyles = {
    modal: {
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
        maxHeight: '90vh',
        overflowY: 'auto'
      }
    },
    overlay: {
      backdrop: {
        position: 'fixed' as const,
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        bg: 'primer.canvas.backdrop',
        zIndex: 1100,
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        pt: 0
      },
      content: {
        bg: 'canvas.default',
        borderBottom: '1px solid',
        borderColor: 'border.default',
        boxShadow: 'shadow.large',
        width: '100%',
        minHeight: '112px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        py: 4,
        position: 'relative' as const
      }
    },
    inline: {
      backdrop: {
        position: 'relative' as const,
        bg: 'transparent',
        zIndex: 1,
        display: 'block'
      },
      content: {
        bg: 'canvas.subtle',
        border: '1px solid',
        borderColor: 'border.default',
        borderRadius: 2,
        p: 3
      }
    }
  };

  // サイズ別のスタイル
  const sizeStyles = {
    small: { minWidth: '300px', maxWidth: '400px' },
    medium: { minWidth: '400px', maxWidth: '500px' },
    large: { minWidth: '500px', maxWidth: '600px' },
    xl: { minWidth: '600px', maxWidth: '800px' }
  };

  return {
    backdrop: variantStyles[variant].backdrop,
    content: {
      ...variantStyles[variant].content,
      ...sizeStyles[size]
    }
  };
};

/**
 * ダイアログヘッダーコンポーネント
 */
const DialogHeader = memo<{
  title: string;
  onClose: () => void;
  titleId?: string;
  hideCloseButton?: boolean;
}>(({ title, onClose, titleId, hideCloseButton = false }) => (
  <Box sx={{
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    mb: 3
  }}>
    <Text 
      id={titleId}
      sx={{ fontSize: 2, fontWeight: '700' }}
    >
      {title}
    </Text>
    {!hideCloseButton && (
      <IconButton
        icon={XIcon}
        onClick={onClose}
        ariaLabel="ダイアログを閉じる"
        variant="muted"
        size="medium"
        style="custom"
      />
    )}
  </Box>
));

/**
 * ダイアログフッターコンポーネント
 */
const DialogFooter = memo<{
  children: React.ReactNode;
}>(({ children }) => (
  <Box sx={{
    display: 'flex',
    justifyContent: 'flex-end',
    gap: 2,
    mt: 3
  }}>
    {children}
  </Box>
));

/**
 * 統合ダイアログコンポーネント
 * 
 * 様々な形式のダイアログを統一されたAPIで提供します。
 * モーダル、オーバーレイ、インライン表示に対応し、
 * 一貫したユーザー体験を提供します。
 */
const UnifiedDialog = memo<UnifiedDialogProps>(({
  isOpen,
  title,
  onClose,
  variant = 'modal',
  size = 'medium',
  children,
  actions,
  hideFooter = false,
  hideHeader = false,
  ariaLabelledBy,
  closeOnBackdropClick = true,
  closeOnEscape = true
}) => {
  const handleBackdropClick = useCallback((event: React.MouseEvent) => {
    if (closeOnBackdropClick && event.target === event.currentTarget) {
      onClose();
    }
  }, [onClose, closeOnBackdropClick]);

  const handleContentClick = useCallback((event: React.MouseEvent) => {
    event.stopPropagation();
  }, []);

  // Escapeキーでダイアログを閉じる
  useEffect(() => {
    if (!isOpen || !closeOnEscape) {
      return undefined;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose, closeOnEscape]);

  if (!isOpen && variant !== 'inline') {
    return null;
  }

  const styles = getDialogStyles(variant, size);
  const titleId = ariaLabelledBy ?? `dialog-title-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <Box
      sx={styles.backdrop}
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal={variant !== 'inline' ? 'true' : undefined}
      aria-labelledby={titleId}
    >
      <Box
        sx={styles.content}
        onClick={handleContentClick}
      >
        {!hideHeader && (
          <DialogHeader
            title={title}
            onClose={onClose}
            titleId={titleId}
            hideCloseButton={variant === 'overlay'}
          />
        )}
        
        <Box sx={{ flex: 1 }}>
          {children}
        </Box>

        {!hideFooter && actions && actions.length > 0 && (
          <DialogFooter>
            <DialogActions actions={actions} />
          </DialogFooter>
        )}
      </Box>
    </Box>
  );
});

UnifiedDialog.displayName = 'UnifiedDialog';
DialogHeader.displayName = 'DialogHeader';
DialogFooter.displayName = 'DialogFooter';

export default UnifiedDialog;
export { DialogHeader, DialogFooter };