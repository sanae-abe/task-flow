import { useCallback } from 'react';
import type { TableColumn } from '@/contexts/TableColumnsContext';

interface UseTableColumnActionsProps {
  tempColumns: TableColumn[];
  tempColumnOrder: string[];
  columns: TableColumn[];
  columnOrder: string[];
  toggleColumnVisibility: (columnId: string) => void;
  updateColumnWidth: (columnId: string, width: string) => void;
  reorderColumns: (newOrder: string[]) => void;
  removeColumn: (columnId: string) => void;
  resetTempState: () => void;
  setIsSettingsOpen: (isOpen: boolean) => void;
  setHasUnsavedChanges: (hasChanges: boolean) => void;
}

/**
 * カラムの保存・キャンセル処理を管理するフック
 */
export const useTableColumnActions = ({
  tempColumns,
  tempColumnOrder,
  columns,
  columnOrder,
  toggleColumnVisibility,
  updateColumnWidth,
  reorderColumns,
  removeColumn,
  resetTempState,
  setIsSettingsOpen,
  setHasUnsavedChanges,
}: UseTableColumnActionsProps) => {
  // 保存処理
  const handleSave = useCallback(() => {
    // 表示状態の変更を適用
    tempColumns.forEach(tempCol => {
      const originalCol = columns.find(col => col.id === tempCol.id);
      if (originalCol && originalCol.visible !== tempCol.visible) {
        toggleColumnVisibility(tempCol.id);
      }
      if (originalCol && originalCol.width !== tempCol.width) {
        updateColumnWidth(tempCol.id, tempCol.width);
      }
    });

    // カラム順序の変更を適用
    if (JSON.stringify(columnOrder) !== JSON.stringify(tempColumnOrder)) {
      reorderColumns(tempColumnOrder);
    }

    // 削除されたカラムを処理
    const removedColumns = columns.filter(
      col => !tempColumns.some(tempCol => tempCol.id === col.id)
    );
    removedColumns.forEach(col => removeColumn(col.id));

    setHasUnsavedChanges(false);
    setIsSettingsOpen(false);
  }, [
    tempColumns,
    tempColumnOrder,
    columns,
    columnOrder,
    toggleColumnVisibility,
    updateColumnWidth,
    reorderColumns,
    removeColumn,
    setHasUnsavedChanges,
    setIsSettingsOpen,
  ]);

  // キャンセル処理
  const handleCancel = useCallback(() => {
    resetTempState();
    setIsSettingsOpen(false);
  }, [resetTempState, setIsSettingsOpen]);

  return {
    handleSave,
    handleCancel,
  };
};
