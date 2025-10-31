import { useState, useCallback } from 'react';
import type { TaskTemplate } from '../types/template';

interface EditDialogState {
  isOpen: boolean;
  template: TaskTemplate | null;
  mode: 'create' | 'edit';
}

interface DeleteDialogState {
  isOpen: boolean;
  template: TaskTemplate | null;
}

interface UseTemplateDialogsReturn {
  // ダイアログ状態
  editDialog: EditDialogState;
  deleteDialog: DeleteDialogState;

  // 編集ダイアログ
  openCreateDialog: () => void;
  openEditDialog: (template: TaskTemplate) => void;
  closeEditDialog: () => void;

  // 削除ダイアログ
  openDeleteDialog: (template: TaskTemplate) => void;
  closeDeleteDialog: () => void;
}

/**
 * テンプレート管理のダイアログ状態を管理するカスタムフック
 */
export const useTemplateDialogs = (): UseTemplateDialogsReturn => {
  // 編集ダイアログ状態
  const [editDialog, setEditDialog] = useState<EditDialogState>({
    isOpen: false,
    template: null,
    mode: 'create',
  });

  // 削除ダイアログ状態
  const [deleteDialog, setDeleteDialog] = useState<DeleteDialogState>({
    isOpen: false,
    template: null,
  });

  // 作成ダイアログを開く
  const openCreateDialog = useCallback(() => {
    setEditDialog({
      isOpen: true,
      template: null,
      mode: 'create',
    });
  }, []);

  // 編集ダイアログを開く
  const openEditDialog = useCallback((template: TaskTemplate) => {
    setEditDialog({
      isOpen: true,
      template,
      mode: 'edit',
    });
  }, []);

  // 編集ダイアログを閉じる
  const closeEditDialog = useCallback(() => {
    setEditDialog({
      isOpen: false,
      template: null,
      mode: 'create',
    });
  }, []);

  // 削除ダイアログを開く
  const openDeleteDialog = useCallback((template: TaskTemplate) => {
    setDeleteDialog({
      isOpen: true,
      template,
    });
  }, []);

  // 削除ダイアログを閉じる
  const closeDeleteDialog = useCallback(() => {
    setDeleteDialog({
      isOpen: false,
      template: null,
    });
  }, []);

  return {
    editDialog,
    deleteDialog,
    openCreateDialog,
    openEditDialog,
    closeEditDialog,
    openDeleteDialog,
    closeDeleteDialog,
  };
};
