import { useState, useCallback } from 'react';

/**
 * カラムのドラッグ&ドロップロジックを管理するフック
 */
export const useTableColumnDragDrop = (
  tempColumnOrder: string[],
  handleTempReorderColumns: (newOrder: string[]) => void
) => {
  const [draggedColumnId, setDraggedColumnId] = useState<string | null>(null);

  // ドラッグ開始
  const handleDragStart = useCallback(
    (e: React.DragEvent, columnId: string) => {
      setDraggedColumnId(columnId);
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/plain', columnId);
    },
    []
  );

  // ドラッグオーバー
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }, []);

  // ドロップ（詳細設定ダイアログ用）
  const handleDrop = useCallback(
    (e: React.DragEvent, targetColumnId: string) => {
      e.preventDefault();

      if (!draggedColumnId || draggedColumnId === targetColumnId) {
        setDraggedColumnId(null);
        return;
      }

      const currentOrder = [...tempColumnOrder];
      const draggedIndex = currentOrder.indexOf(draggedColumnId);
      const targetIndex = currentOrder.indexOf(targetColumnId);

      if (draggedIndex === -1 || targetIndex === -1) {
        setDraggedColumnId(null);
        return;
      }

      // 配列の要素を移動
      currentOrder.splice(draggedIndex, 1);
      currentOrder.splice(targetIndex, 0, draggedColumnId);

      handleTempReorderColumns(currentOrder);
      setDraggedColumnId(null);
    },
    [draggedColumnId, tempColumnOrder, handleTempReorderColumns]
  );

  // ドラッグ終了
  const handleDragEnd = useCallback(() => {
    setDraggedColumnId(null);
  }, []);

  return {
    draggedColumnId,
    handleDragStart,
    handleDragOver,
    handleDrop,
    handleDragEnd,
  };
};
