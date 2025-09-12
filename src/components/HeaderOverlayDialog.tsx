import { XIcon } from '@primer/octicons-react';
import { Box, Text, Button } from '@primer/react';
import React, { useCallback, memo } from 'react';

import type { DialogActionsProps } from '../types/dialog';

/**
 * ヘッダー全面に表示されるオーバーレイダイアログのスタイル定義
 */
const HEADER_OVERLAY_STYLES = {
  backdrop: {
    position: 'fixed' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    bg: 'primer.canvas.backdrop',
    zIndex: 1050, // ヘッダーのz-index(1000)より十分に上
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'center',
    pt: 0 // ヘッダーに合わせて上端から開始
  },
  overlay: {
    bg: 'canvas.default',
    borderBottom: '1px solid',
    borderColor: 'border.default',
    boxShadow: 'shadow.large',
    width: '100%',
    minHeight: '112px', // ヘッダー(67px) + サブヘッダー(56px) をカバー
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    py: 4, // 縦方向のパディングを増加
    position: 'relative' as const // 子要素の絶対配置の基準点
  },
  content: {
    maxWidth: '1440px', // ヘッダーの最大幅に合わせる
    width: '100%',
    px: 4,
    py: 0, // オーバーレイでパディングを設定しているので削除
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: '100%' // 全高を使用
  },
  formSection: {
    display: 'flex',
    alignItems: 'center',
    gap: 4, // ギャップを大きくして間隔を改善
    flex: 1,
    minWidth: 0 // flex子要素の縮小を許可
  },
  actions: {
    display: 'flex',
    gap: 2
  }
} as const;

/**
 * ヘッダーオーバーレイダイアログのプロパティ
 */
interface HeaderOverlayDialogProps {
  /** ダイアログの表示状態 */
  isOpen: boolean;
  /** ダイアログのタイトル */
  title: string;
  /** ダイアログを閉じる際のコールバック */
  onClose: () => void;
  /** ダイアログのメインコンテンツ */
  children: React.ReactNode;
  /** アクションボタン群 */
  actions?: React.ReactNode;
  /** アクセシビリティ用のlabelledBy属性 */
  ariaLabelledBy?: string;
}

/**
 * ヘッダーオーバーレイダイアログのアクションボタン群
 */
export const HeaderOverlayActions = memo<DialogActionsProps>(({ 
  onCancel, 
  onConfirm, 
  confirmText,
  cancelText = 'キャンセル',
  isConfirmDisabled = false,
  confirmVariant = 'primary'
}) => (
  <Box sx={HEADER_OVERLAY_STYLES.actions}>
    <Button 
      onClick={onCancel}
      sx={{
        fontSize: 2,
        py: 2,
        px: 3,
        minHeight: '44px'
      }}
    >
      {cancelText}
    </Button>
    <Button
      variant={confirmVariant}
      onClick={onConfirm}
      disabled={isConfirmDisabled}
      sx={{ 
        color: 'fg.onEmphasis !important',
        fontSize: 2,
        py: 2,
        px: 3,
        minHeight: '44px'
      }}
    >
      {confirmText}
    </Button>
  </Box>
));

/**
 * ヘッダー全面に表示されるオーバーレイダイアログコンポーネント
 * ヘッダーの真下に展開されるオーバーレイ形式のダイアログを提供
 */
const HeaderOverlayDialog = memo<HeaderOverlayDialogProps>(({ 
  isOpen, 
  title, 
  onClose, 
  children, 
  actions,
  ariaLabelledBy
}) => {
  const handleBackdropClick = useCallback((event: React.MouseEvent) => {
    if (event.target === event.currentTarget) {
      onClose();
    }
  }, [onClose]);

  const handleOverlayClick = useCallback((event: React.MouseEvent) => {
    event.stopPropagation();
  }, []);

  if (!isOpen) {
    return null;
  }

  return (
    <Box
      sx={HEADER_OVERLAY_STYLES.backdrop}
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby={ariaLabelledBy}
    >
      <Box
        sx={HEADER_OVERLAY_STYLES.overlay}
        onClick={handleOverlayClick}
      >
        <Box sx={HEADER_OVERLAY_STYLES.content}>
          <Box sx={HEADER_OVERLAY_STYLES.formSection}>
            <Text 
              id={ariaLabelledBy}
              sx={{ 
                fontSize: 3, 
                fontWeight: '700', 
                whiteSpace: 'nowrap',
                color: 'fg.emphasis',
                flexShrink: 0 // タイトルの縮小を防ぐ
              }}
            >
              {title}
            </Text>
            {children}
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {actions}
            <Button
              variant="invisible"
              onClick={onClose}
              sx={{ p: 1 }}
              aria-label="ダイアログを閉じる"
            >
              <XIcon size={16} />
            </Button>
          </Box>
        </Box>
      </Box>
    </Box>
  );
});

export default HeaderOverlayDialog;
export { HEADER_OVERLAY_STYLES };