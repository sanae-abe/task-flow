import { useState, useCallback, useEffect } from 'react';
import type {
  EditDialogState,
  DeleteDialogState,
  LabelWithInfo,
  LabelFormData,
} from '../../../types/labelManagement';
import { useLabel } from '../../../contexts/LabelContext';

interface UseLabelDialogsOptions {
  onMessage?: (message: {
    type:
      | 'success'
      | 'danger'
      | 'warning'
      | 'critical'
      | 'default'
      | 'info'
      | 'upsell';
    text: string;
  }) => void;
}

export const useLabelDialogs = (
  onMessage?: UseLabelDialogsOptions['onMessage']
) => {
  const {
    createLabel,
    createLabelInBoard,
    updateLabel,
    deleteLabelFromAllBoards,
    setMessageCallback,
  } = useLabel();

  // LabelContextのメッセージコールバックを設定
  useEffect(() => {
    if (onMessage) {
      setMessageCallback(onMessage);
    }

    // クリーンアップ: コンポーネントがアンマウントされたときにコールバックをクリア
    return () => {
      setMessageCallback(null);
    };
  }, [onMessage, setMessageCallback]);

  const [editDialog, setEditDialog] = useState<EditDialogState>({
    isOpen: false,
    label: null,
    mode: 'create',
  });

  const [deleteDialog, setDeleteDialog] = useState<DeleteDialogState>({
    isOpen: false,
    label: null,
  });

  // 編集ダイアログを開く
  const handleEdit = useCallback((label: LabelWithInfo) => {
    setEditDialog({
      isOpen: true,
      label,
      mode: 'edit',
    });
  }, []);

  // 作成ダイアログを開く
  const handleCreate = useCallback(() => {
    setEditDialog({
      isOpen: true,
      label: null,
      mode: 'create',
    });
  }, []);

  // 削除ダイアログを開く
  const handleDelete = useCallback((label: LabelWithInfo) => {
    setDeleteDialog({
      isOpen: true,
      label,
    });
  }, []);

  // ダイアログを閉じる
  const handleCloseEditDialog = useCallback(() => {
    setEditDialog({
      isOpen: false,
      label: null,
      mode: 'create',
    });
  }, []);

  const handleCloseDeleteDialog = useCallback(() => {
    setDeleteDialog({
      isOpen: false,
      label: null,
    });
  }, []);

  // ラベル保存（作成・編集）
  const handleSave = useCallback(
    (labelData: LabelFormData) => {
      if (editDialog.mode === 'create') {
        if (labelData.boardId) {
          // 指定されたボードに作成
          createLabelInBoard(
            labelData.name,
            labelData.color,
            labelData.boardId
          );
        } else {
          // 現在のボードに作成（従来通り）
          createLabel(labelData.name, labelData.color);
        }
      } else if (editDialog.label) {
        updateLabel(editDialog.label.id, labelData);
      }
      handleCloseEditDialog();
    },
    [
      editDialog.mode,
      editDialog.label,
      createLabel,
      createLabelInBoard,
      updateLabel,
      handleCloseEditDialog,
    ]
  );

  // ラベル削除確認（全ボードから削除）
  const handleConfirmDelete = useCallback(() => {
    if (deleteDialog.label) {
      deleteLabelFromAllBoards(deleteDialog.label.id);
      handleCloseDeleteDialog();
    }
  }, [deleteDialog.label, deleteLabelFromAllBoards, handleCloseDeleteDialog]);

  const returnMethods = {
    editDialog,
    deleteDialog,
    handleEdit,
    handleCreate,
    handleDelete,
    handleCloseEditDialog,
    handleCloseDeleteDialog,
    handleSave,
    handleConfirmDelete,
  };

  return returnMethods;
};
