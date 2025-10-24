import { XIcon } from '@primer/octicons-react';
import { Box, Text, ThemeProvider, BaseStyles } from '@primer/react';
import React, { useCallback, useEffect, memo } from 'react';
import { createPortal } from 'react-dom';

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
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        animation: 'dialog-backdrop-fade-in 200ms cubic-bezier(0.33, 1, 0.68, 1)'
      },
      container: {
        display: 'flex',
        flexDirection: 'column' as const,
        backgroundColor: 'var(--bgColor-default)',
        boxShadow: 'shadow.large',
        width: '90vw',
        maxHeight: '90vh',
        borderRadius: 'var(--borderRadius-large, var(--borderRadius-large, .75rem))',
        animation: 'dialog-scale-fade-in 200ms cubic-bezier(0.33, 1, 0.68, 1)'
      },
      content: {
        padding: '16px',
        backgroundColor: 'var(--bgColor-default)',
        borderRadius: 'var(--borderRadius-large, var(--borderRadius-large, .75rem))',
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
        backgroundColor: 'var(--overlay-backdrop-bgColor)',
        zIndex: 10000,
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        paddingTop: 0,
        animation: 'dialog-backdrop-fade-in 200ms cubic-bezier(0.33, 1, 0.68, 1)'
      },
      container: {
        display: 'flex',
        flexDirection: 'column' as const,
        backgroundColor: 'var(--bgColor-default)',
        boxShadow: 'shadow.large',
        padding: '0.5rem',
        maxHeight: '90vh',
        overflowY: 'auto',
        borderRadius: 'var(--borderRadius-large, var(--borderRadius-large, .75rem))',
        animation: 'dialog-scale-fade-in 200ms cubic-bezier(0.33, 1, 0.68, 1)'
      },
      content: {
        backgroundColor: 'var(--bgColor-default)',
        width: '100%',
        minHeight: '112px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        paddingBlock: '4px'
      }
    },
    inline: {
      backdrop: {
        position: 'relative' as const,
        backgroundColor: 'transparent',
        zIndex: 1,
        display: 'block'
      },
      container: {
        display: 'flex',
        flexDirection: 'column' as const,
        backgroundColor: 'var(--bgColor-default)',
        boxShadow: 'shadow.large',
        padding: '0.5rem',
        width: '90vw',
        maxHeight: '90vh',
        overflowY: 'auto',
        borderRadius: 'var(--borderRadius-large)',
      },
      content: {
        backgroundColor: 'var(--bgColor-muted)',
        borderRadius: 'var(--borderRadius-medium)',
        padding: '12px'
      }
    }
  };

  // サイズ別のスタイル
  const sizeStyles = {
    small: { minWidth: '296px', maxWidth: '320px' },
    medium: { minWidth: '320px', maxWidth: '480px' },
    large: { minWidth: '480px', maxWidth: '640px' },
    xl: { minWidth: '640px', maxWidth: '800px' }
  };

  return {
    backdrop: variantStyles[variant].backdrop,
    container: {
      ...variantStyles[variant].container,
      ...sizeStyles[size]
    },
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
  <div style={{
    position: 'relative',
    padding: '0.5rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'var(--bgColor-default)',
    borderRadius: 'var(--borderRadius-large) var(--borderRadius-large) 0 0',
    boxShadow: '0 1px 0 var(--borderColor-default,var(--borderColor-default))'
  }}>
    <Text 
      id={titleId}
      sx={{
        fontSize: 'var(--text-body-size-medium,.875rem)', fontWeight: '600',
        px: '8px',
        py: '6px',
        lineHeight: 'var(--text-body-line-height-medium,1.5)'
      }}
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
      />
    )}
  </div>
));

/**
 * ダイアログフッターコンポーネント
 */
const DialogFooter = memo<{
  children: React.ReactNode;
}>(({ children }) => (
  <div style={{
    display: 'flex',
    justifyContent: 'flex-end',
    gap: "8px",
    padding: "12px"
  }}>
    {children}
  </div>
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
  actionsLayout = 'standard',
  hideFooter = false,
  hideHeader = false,
  ariaLabelledBy,
  closeOnBackdropClick = true,
  closeOnEscape = true
}) => {
  const mouseDownTargetRef = React.useRef<EventTarget | null>(null);

  const handleBackdropMouseDown = useCallback((event: React.MouseEvent) => {
    if (event.target === event.currentTarget) {
      mouseDownTargetRef.current = event.target;
    }
  }, []);

  const handleBackdropClick = useCallback((event: React.MouseEvent) => {
    if (closeOnBackdropClick && event.target === event.currentTarget && event.target === mouseDownTargetRef.current) {
      onClose();
    }
    mouseDownTargetRef.current = null;
  }, [onClose, closeOnBackdropClick]);

  const handleBackdropMouseUp = useCallback((event: React.MouseEvent) => {
    // mouseupイベントでの閉じる動作を防止（何もしない）
    event.stopPropagation();
  }, []);

  const handleContainerClick = useCallback((event: React.MouseEvent) => {
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

  const dialogContent = (
    <ThemeProvider>
      <BaseStyles>
        <div
          style={styles.backdrop}
          onMouseDown={handleBackdropMouseDown}
          onClick={handleBackdropClick}
          onMouseUp={handleBackdropMouseUp}
          role="dialog"
          aria-modal={variant !== 'inline' ? 'true' : undefined}
          aria-labelledby={titleId}
        >
          <Box
            sx={styles.container}
            onClick={handleContainerClick}
          >
            {!hideHeader && (
              <DialogHeader
                title={title}
                onClose={onClose}
                titleId={titleId}
                hideCloseButton={variant === 'overlay'}
              />
            )}
            <Box sx={styles.content}>
              {children}
            </Box>

            {!hideFooter && actions && actions.length > 0 && (
              <DialogFooter>
                <DialogActions actions={actions} layout={actionsLayout} />
              </DialogFooter>
            )}
          </Box>
        </div>
      </BaseStyles>
    </ThemeProvider>
  );

  // modal と overlay バリアントの場合はポータル化
  if (variant === 'modal' || variant === 'overlay') {
    return createPortal(dialogContent, document.body);
  }

  // inline バリアントの場合は通常通りレンダリング（ポータル化しない）
  return dialogContent;
});

UnifiedDialog.displayName = 'UnifiedDialog';
DialogHeader.displayName = 'DialogHeader';
DialogFooter.displayName = 'DialogFooter';

export default UnifiedDialog;
export { DialogHeader, DialogFooter };