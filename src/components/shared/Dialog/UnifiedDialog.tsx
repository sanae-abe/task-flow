import { X } from 'lucide-react';
import React, { useCallback, useEffect, memo } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '@/lib/utils';

import type {
  UnifiedDialogProps,
  DialogVariant,
  DialogSize,
} from '../../../types/unified-dialog';
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
        zIndex: 300,
      },
      container: {
        display: 'flex',
        flexDirection: 'column' as const,
        boxShadow: 'shadow.large',
        width: '90vw',
        maxHeight: '90vh',
        borderRadius: '0.75rem',
        animation: 'dialog-scale-fade-in 200ms cubic-bezier(0.33, 1, 0.68, 1)',
      },
      content: {
        padding: '16px',
        borderRadius: '0.75rem',
        overflowY: 'auto',
      },
    },
    overlay: {
      backdrop: {
        zIndex: 300,
      },
      container: {
        display: 'flex',
        flexDirection: 'column' as const,
        boxShadow: 'shadow.large',
        padding: '0.5rem',
        maxHeight: '90vh',
        overflowY: 'auto',
        borderRadius: '0.75rem',
        animation: 'dialog-scale-fade-in 200ms cubic-bezier(0.33, 1, 0.68, 1)',
      },
      content: {
        width: '100%',
        minHeight: '120px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        paddingBlock: '4px',
      },
    },
    inline: {
      backdrop: {
        position: 'relative' as const,
        backgroundColor: 'transparent',
        zIndex: 1,
        display: 'block',
      },
      container: {
        display: 'flex',
        flexDirection: 'column' as const,
        boxShadow: 'shadow.large',
        padding: '0.5rem',
        width: '90vw',
        maxHeight: '90vh',
        overflowY: 'auto',
        borderRadius: '0.75rem',
      },
      content: {
        backgroundColor: 'var(--muted)',
        borderRadius: '0.5rem',
        padding: '12px',
      },
    },
  };

  // サイズ別のスタイル
  const sizeStyles = {
    small: { minWidth: '296px', maxWidth: '320px' },
    medium: { minWidth: '320px', maxWidth: '480px' },
    large: { minWidth: '480px', maxWidth: '640px' },
    xl: { minWidth: '640px', maxWidth: '800px' },
  };

  return {
    backdrop: variantStyles[variant].backdrop,
    container: {
      ...variantStyles[variant].container,
      ...sizeStyles[size],
    },
    content: {
      ...variantStyles[variant].content,
      ...sizeStyles[size],
    },
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
  <div
    style={{
      position: 'relative',
      padding: '0.5rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: 'var(--background)',
      borderRadius: '0.75rem 0.75rem 0 0',
      boxShadow: '0 1px 0 var(--border)',
    }}
  >
    <h2 id={titleId} className='text-sm font-semibold px-2 py-1.5 leading-6'>
      {title}
    </h2>

    {!hideCloseButton && (
      <IconButton
        icon={X}
        onClick={onClose}
        ariaLabel='ダイアログを閉じる'
        variant='muted'
        size='medium'
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
  <div className='flex justify-end gap-2 p-3'>{children}</div>
));

/**
 * 統合ダイアログコンポーネント
 *
 * 様々な形式のダイアログを統一されたAPIで提供します。
 * モーダル、オーバーレイ、インライン表示に対応し、
 * 一貫したユーザー体験を提供します。
 */
const UnifiedDialog = memo<UnifiedDialogProps>(
  ({
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
    closeOnEscape = true,
  }) => {
    const mouseDownTargetRef = React.useRef<EventTarget | null>(null);

    const handleBackdropMouseDown = useCallback((event: React.MouseEvent) => {
      if (event.target === event.currentTarget) {
        mouseDownTargetRef.current = event.target;
      }
    }, []);

    const handleBackdropClick = useCallback(
      (event: React.MouseEvent) => {
        if (
          closeOnBackdropClick &&
          event.target === event.currentTarget &&
          event.target === mouseDownTargetRef.current
        ) {
          onClose();
        }
        mouseDownTargetRef.current = null;
      },
      [onClose, closeOnBackdropClick]
    );

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
    const titleId =
      ariaLabelledBy ??
      `dialog-title-${Math.random().toString(36).slice(2, 11)}`;

    const dialogContent = (
      <div
        onMouseDown={handleBackdropMouseDown}
        onClick={handleBackdropClick}
        onMouseUp={handleBackdropMouseUp}
        role='dialog'
        aria-modal={variant !== 'inline' ? 'true' : undefined}
        aria-labelledby={titleId}
        data-state={isOpen ? 'open' : 'closed'}
        className={cn(
          // ベースアニメーション - Shadcn/UI Dialog準拠
          'data-[state=open]:animate-in data-[state=closed]:animate-out',
          'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
          'data-[state=closed]:duration-300 data-[state=open]:duration-300',
          // ベースレイアウト
          'fixed inset-0 z-400 bg-black/50 flex',
          // バリアント別のレイアウト
          variant === 'overlay' && 'items-start justify-center pt-0',
          variant === 'modal' && 'items-center justify-center',
          variant === 'inline' && 'relative bg-transparent z-auto block'
        )}
        style={styles.backdrop as React.CSSProperties}
      >
        <div
          style={styles.container as React.CSSProperties}
          onClick={handleContainerClick}
          data-state={isOpen ? 'open' : 'closed'}
          className={cn(
            // Shadcn/UI Dialog準拠の豊富なアニメーション
            'data-[state=open]:animate-in data-[state=closed]:animate-out',
            'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
            'data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95',
            'data-state=closed]:slide-out-to-top-[48% data-[state=open]:slide-in-from-top-[48%]',
            'data-[state=closed]:duration-300 data-[state=open]:duration-300',
            // ベースレイアウト
            'flex flex-col bg-white rounded-lg shadow-lg',
            // サイズ別のクラス
            size === 'small' && 'min-w-[296px] max-w-[320px]',
            size === 'medium' && 'min-w-[320px] max-w-[480px]',
            size === 'large' && 'min-w-[480px] max-w-[640px]',
            size === 'xl' && 'min-w-[640px] max-w-[800px]',
            // バリアント別のクラス
            variant === 'modal' && 'w-[90vw] max-h-[90vh]',
            variant === 'overlay' && 'max-h-[90vh] overflow-y-auto p-2',
            variant === 'inline' && 'w-[90vw] max-h-[90vh] overflow-y-auto p-2'
          )}
        >
          {!hideHeader && (
            <DialogHeader
              title={title}
              onClose={onClose}
              titleId={titleId}
              hideCloseButton={variant === 'overlay'}
            />
          )}
          <div
            style={styles.content as React.CSSProperties}
            className={cn(
              // 基本スタイル
              'bg-white rounded-lg overflow-y-auto',
              // バリアント別のクラス
              variant === 'modal' && 'p-4',
              variant === 'overlay' &&
                'w-full min-h-[120px] flex items-center justify-center py-1',
              variant === 'inline' && 'bg-gray-50 rounded-md p-3'
            )}
          >
            {children}
          </div>

          {!hideFooter && actions && actions.length > 0 && (
            <DialogFooter>
              <DialogActions actions={actions} layout={actionsLayout} />
            </DialogFooter>
          )}
        </div>
      </div>
    );

    // modal と overlay バリアントの場合はポータル化
    if (variant === 'modal' || variant === 'overlay') {
      const portalContainer =
        document.getElementById('portal-root') || document.body;
      return createPortal(dialogContent, portalContainer);
    }

    // inline バリアントの場合は通常のレンダリング
    return dialogContent;
  }
);

UnifiedDialog.displayName = 'UnifiedDialog';
DialogHeader.displayName = 'DialogHeader';
DialogFooter.displayName = 'DialogFooter';

export default UnifiedDialog;
export { DialogHeader, DialogFooter };
