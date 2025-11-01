import React, { useState } from 'react';
import { useTableColumns } from '../contexts/TableColumnsContext';
import {
  ColumnDropdownMenu,
  ColumnSettingsDialog,
} from './TableColumnManager/components';
import {
  useTableColumnTempState,
  useTableColumnDragDrop,
  useTableColumnActions,
} from './TableColumnManager/hooks';

/**
 * テーブルカラムの表示・非表示・順序・幅を管理するコンポーネント
 */
const TableColumnManager: React.FC = () => {
  const {
    columns,
    columnOrder,
    toggleColumnVisibility,
    updateColumnWidth,
    reorderColumns,
    removeColumn,
    resetToDefaults,
  } = useTableColumns();

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // 一時状態管理フック
  const {
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
  } = useTableColumnTempState(columns, columnOrder, isSettingsOpen);

  // 保存・キャンセル処理フック
  const { handleSave, handleCancel } = useTableColumnActions({
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
  });

  // ドラッグ&ドロップ処理フック
  const {
    draggedColumnId,
    handleDragStart,
    handleDragOver,
    handleDrop,
    handleDragEnd,
  } = useTableColumnDragDrop(tempColumnOrder, handleTempReorderColumns);

  return (
    <>
      {/* カラム表示切り替えドロップダウンメニュー */}
      <ColumnDropdownMenu
        columns={columns}
        onToggleVisibility={toggleColumnVisibility}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onResetToDefaults={resetToDefaults}
      />

      {/* カラム詳細設定ダイアログ */}
      <ColumnSettingsDialog
        isOpen={isSettingsOpen}
        tempColumns={tempColumns}
        tempColumnOrder={tempColumnOrder}
        draggedColumnId={draggedColumnId}
        hasUnsavedChanges={hasUnsavedChanges}
        onSave={handleSave}
        onCancel={handleCancel}
        onToggleVisibility={handleTempToggleVisibility}
        onWidthChange={handleTempWidthChange}
        onMoveUp={handleMoveUp}
        onMoveDown={handleMoveDown}
        onRemove={handleTempRemoveColumn}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onDragEnd={handleDragEnd}
      />
    </>
  );
};

export default TableColumnManager;
