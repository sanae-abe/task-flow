import { memo } from "react";

import { ConfirmDialog as UnifiedConfirmDialog } from "./shared/Dialog";

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

const ConfirmDialog = memo<ConfirmDialogProps>(
  ({
    isOpen,
    title,
    message,
    confirmText = "削除",
    cancelText = "キャンセル",
    onConfirm,
    onCancel,
  }) => (
    <UnifiedConfirmDialog
      isOpen={isOpen}
      title={title}
      message={message}
      onConfirm={onConfirm}
      onCancel={onCancel}
      onClose={onCancel}
      confirmText={confirmText}
      cancelText={cancelText}
      confirmVariant="danger"
    />
  ),
);

export default ConfirmDialog;
