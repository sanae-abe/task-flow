import React, { useMemo, useCallback } from 'react';

import UnifiedDialog from './shared/Dialog/UnifiedDialog';
import type { DialogAction } from '../types/unified-dialog';

interface DeleteConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  taskTitle: string;
}

const DeleteConfirmDialog: React.FC<DeleteConfirmDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  taskTitle,
}) => {
  const handleConfirm = useCallback(() => {
    onConfirm();
    onClose();
  }, [onConfirm, onClose]);

  const actions: DialogAction[] = useMemo(
    () => [
      {
        label: 'キャンセル',
        onClick: onClose,
        variant: 'outline',
      },
      {
        label: '削除',
        onClick: handleConfirm,
        variant: 'destructive',
      },
    ],
    [onClose, handleConfirm]
  );

  return (
    <UnifiedDialog
      isOpen={isOpen}
      title='タスクの削除'
      onClose={onClose}
      variant='modal'
      actions={actions}
    >
      <p>「{taskTitle}」を削除しますか？</p>
    </UnifiedDialog>
  );
};

export default DeleteConfirmDialog;
