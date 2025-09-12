import { Text } from '@primer/react';
import { useEffect, useCallback, memo } from 'react';

import BaseDialog, { DialogActions } from './BaseDialog';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

const ConfirmDialog = memo<ConfirmDialogProps>(({
  isOpen,
  title,
  message,
  confirmText = '削除',
  cancelText = 'キャンセル',
  onConfirm,
  onCancel,
}) => {
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!isOpen) {return;}

    switch (event.key) {
      case 'Escape':
        event.preventDefault();
        onCancel();
        break;
      case 'Enter':
        // デフォルトの動作を防止（誤操作防止）
        event.preventDefault();
        break;
    }
  }, [isOpen, onCancel]);

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => {
        document.removeEventListener('keydown', handleKeyDown);
      };
    }
    return undefined;
  }, [isOpen, handleKeyDown]);

  const titleId = 'confirm-dialog-title';

  return (
    <BaseDialog
      isOpen={isOpen}
      title={title}
      onClose={onCancel}
      ariaLabelledBy={titleId}
      actions={
        <DialogActions
          onCancel={onCancel}
          onConfirm={onConfirm}
          confirmText={confirmText}
          cancelText={cancelText}
          confirmVariant="danger"
        />
      }
    >
      <Text sx={{ color: 'fg.muted', mb: 3, display: 'block', lineHeight: 1.5 }}>
        {message}
      </Text>
    </BaseDialog>
  );
});

export default ConfirmDialog;