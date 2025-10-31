import { useState } from 'react';
import type { DeleteConfirmState } from '../types';

/**
 * 削除確認ダイアログ管理カスタムフック
 *
 * 削除確認ダイアログの開閉とタスク選択状態を管理します。
 */
export const useDeleteConfirm = () => {
  const [deleteConfirmDialog, setDeleteConfirmDialog] =
    useState<DeleteConfirmState>({
      isOpen: false,
      task: null,
    });

  return {
    deleteConfirmDialog,
    setDeleteConfirmDialog,
  };
};
