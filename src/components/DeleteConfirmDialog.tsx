import { Text } from "@primer/react";
import React, { useMemo, useCallback } from "react";

import UnifiedDialog from "./shared/Dialog/UnifiedDialog";
import type { DialogAction } from "../types/unified-dialog";

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
        label: "キャンセル",
        onClick: onClose,
        variant: "default",
      },
      {
        label: "削除",
        onClick: handleConfirm,
        variant: "danger",
      },
    ],
    [onClose, handleConfirm],
  );

  return (
    <UnifiedDialog
      isOpen={isOpen}
      title="タスクの削除"
      onClose={onClose}
      variant="modal"
      actions={actions}
    >
      <Text>「{taskTitle}」を削除しますか？</Text>
    </UnifiedDialog>
  );
};

export default DeleteConfirmDialog;
