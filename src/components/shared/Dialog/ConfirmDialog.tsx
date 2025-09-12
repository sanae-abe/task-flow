import { Text } from '@primer/react';
import { memo } from 'react';

import type { ConfirmDialogProps } from '../../../types/unified-dialog';

import UnifiedDialog from './UnifiedDialog';

/**
 * 確認ダイアログコンポーネント
 * 
 * 危険な操作や重要な確認が必要な場合に使用します。
 * Enterキーによる誤操作を防止し、安全な操作を促します。
 */
const ConfirmDialog = memo<ConfirmDialogProps>(({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
  confirmText = '確認',
  cancelText = 'キャンセル',
  confirmVariant = 'primary',
  ...dialogProps
}) => {
  const actions = [
    {
      label: cancelText,
      onClick: onCancel,
      variant: 'default' as const
    },
    {
      label: confirmText,
      onClick: onConfirm,
      variant: confirmVariant
    }
  ];

  return (
    <UnifiedDialog
      {...dialogProps}
      isOpen={isOpen}
      title={title}
      onClose={onCancel}
      actions={actions}
      size="medium"
      closeOnEscape
      closeOnBackdropClick
    >
      <Text sx={{ 
        color: 'fg.muted', 
        mb: 3, 
        display: 'block', 
        lineHeight: 1.5 
      }}>
        {message}
      </Text>
    </UnifiedDialog>
  );
});

ConfirmDialog.displayName = 'ConfirmDialog';

export default ConfirmDialog;