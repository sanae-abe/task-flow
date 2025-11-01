import { useState, useCallback, useEffect } from 'react';
import { validateColumnWidth } from '../utils/columnWidth';
import type { TableColumn } from '@/contexts/TableColumnsContext';

/**
 * useTableColumnTempStateの戻り値
 */
export interface UseTableColumnTempStateReturn {
  tempColumns: TableColumn[];
  tempColumnOrder: string[];
  hasUnsavedChanges: boolean;
  handleTempToggleVisibility: (columnId: string) => void;
  handleTempWidthChange: (columnId: string, newWidth: string) => void;
  handleTempReorderColumns: (newOrder: string[]) => void;
  handleTempRemoveColumn: (columnId: string) => void;
  handleMoveUp: (columnId: string) => void;
  handleMoveDown: (columnId: string) => void;
  resetTempState: () => void;
  setHasUnsavedChanges: (hasChanges: boolean) => void;
}

/**
 * テーブルカラム設定の一時状態管理フック
 *
 * @description
 * カラム設定ダイアログでの一時的な状態管理を行う
 * - カラムの表示/非表示切り替え
 * - カラム幅の変更とバリデーション
 * - カラムの並び替え（上下移動・ドラッグ&ドロップ）
 * - カラムの削除
 *
 * @param columns - 元のカラム設定
 * @param columnOrder - 元のカラム順序
 * @param isActive - 一時状態が有効かどうか（ダイアログが開いているか）
 *
 * @example
 * const {
 *   tempColumns,
 *   tempColumnOrder,
 *   hasUnsavedChanges,
 *   handleTempToggleVisibility,
 *   // ...
 * } = useTableColumnTempState(columns, columnOrder, isSettingsOpen);
 */
export const useTableColumnTempState = (
  columns: TableColumn[],
  columnOrder: string[],
  isActive: boolean
): UseTableColumnTempStateReturn => {
  const [tempColumns, setTempColumns] = useState<TableColumn[]>([]);
  const [tempColumnOrder, setTempColumnOrder] = useState<string[]>([]);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // ダイアログが開かれた時に一時的な状態を初期化
  useEffect(() => {
    if (isActive) {
      setTempColumns(columns.map(col => ({ ...col })));
      setTempColumnOrder([...columnOrder]);
      setHasUnsavedChanges(false);
    }
  }, [isActive, columns, columnOrder]);

  // 一時状態のリセット
  const resetTempState = useCallback(() => {
    setTempColumns([]);
    setTempColumnOrder([]);
    setHasUnsavedChanges(false);
  }, []);

  // 表示/非表示切り替え
  const handleTempToggleVisibility = useCallback((columnId: string) => {
    setTempColumns(prev =>
      prev.map(col =>
        col.id === columnId ? { ...col, visible: !col.visible } : col
      )
    );
    setHasUnsavedChanges(true);
  }, []);

  // 幅変更（バリデーション付き）
  const handleTempWidthChange = useCallback(
    (columnId: string, newWidth: string) => {
      const { formattedWidth } = validateColumnWidth(newWidth);

      setTempColumns(prev =>
        prev.map(col =>
          col.id === columnId ? { ...col, width: formattedWidth } : col
        )
      );
      setHasUnsavedChanges(true);
    },
    []
  );

  // 並び替え
  const handleTempReorderColumns = useCallback((newOrder: string[]) => {
    setTempColumnOrder(newOrder);
    setHasUnsavedChanges(true);
  }, []);

  // 削除
  const handleTempRemoveColumn = useCallback((columnId: string) => {
    setTempColumns(prev => prev.filter(col => col.id !== columnId));
    setTempColumnOrder(prev => prev.filter(id => id !== columnId));
    setHasUnsavedChanges(true);
  }, []);

  // 上に移動
  const handleMoveUp = useCallback(
    (columnId: string) => {
      const currentIndex = tempColumnOrder.indexOf(columnId);
      if (currentIndex > 0 && currentIndex < tempColumnOrder.length) {
        const newOrder = [...tempColumnOrder];
        const prevItem = newOrder[currentIndex - 1];
        const currentItem = newOrder[currentIndex];
        if (prevItem !== undefined && currentItem !== undefined) {
          newOrder[currentIndex - 1] = currentItem;
          newOrder[currentIndex] = prevItem;
          handleTempReorderColumns(newOrder);
        }
      }
    },
    [tempColumnOrder, handleTempReorderColumns]
  );

  // 下に移動
  const handleMoveDown = useCallback(
    (columnId: string) => {
      const currentIndex = tempColumnOrder.indexOf(columnId);
      if (currentIndex >= 0 && currentIndex < tempColumnOrder.length - 1) {
        const newOrder = [...tempColumnOrder];
        const currentItem = newOrder[currentIndex];
        const nextItem = newOrder[currentIndex + 1];
        if (currentItem !== undefined && nextItem !== undefined) {
          newOrder[currentIndex] = nextItem;
          newOrder[currentIndex + 1] = currentItem;
          handleTempReorderColumns(newOrder);
        }
      }
    },
    [tempColumnOrder, handleTempReorderColumns]
  );

  return {
    tempColumns,
    tempColumnOrder,
    hasUnsavedChanges,
    handleTempToggleVisibility,
    handleTempWidthChange,
    handleTempReorderColumns,
    handleTempRemoveColumn,
    handleMoveUp,
    handleMoveDown,
    resetTempState,
    setHasUnsavedChanges,
  };
};
