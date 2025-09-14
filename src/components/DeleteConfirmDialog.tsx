import { Text } from '@primer/react';
import React from 'react';

import CommonDialog, { DialogActions } from './CommonDialog';

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
  taskTitle
}) => {
  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <CommonDialog
      isOpen={isOpen}
      title="タスクの削除"
      onClose={onClose}
      ariaLabelledBy="delete-task-dialog-title"
      size="small"
      actions={
        <DialogActions
          onCancel={onClose}
          onConfirm={handleConfirm}
          confirmText="削除"
          cancelText="キャンセル"
          confirmVariant="danger"
        />
      }
    >
      <Text sx={{ mb: 3 }}>
        「{taskTitle}」を削除しますか？
      </Text>
      <Text sx={{ fontSize: 1, color: 'fg.muted' }}>
        この操作は取り消せません。
      </Text>
    </CommonDialog>
  );
};

export default DeleteConfirmDialog;