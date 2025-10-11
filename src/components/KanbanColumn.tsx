import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Box } from '@primer/react';
import React, { useMemo, useCallback } from 'react';

import { useUI } from '../contexts/UIContext';
import { useBoard } from '../contexts/BoardContext';
import { useColumnState } from '../hooks/useColumnState';
import type { Column, Task } from '../types';
import { sortTasks } from '../utils/taskSort';
import { filterTasks } from '../utils/taskFilter';

import ColumnEditDialog from './ColumnEditDialog';
import ColumnHeader from './ColumnHeader';
import ConfirmDialog from './ConfirmDialog';
import DropIndicator from './DropIndicator';
import TaskCard from './TaskCard';

const COLUMN_CONFIG = {
  WIDTH: '320px',
  MIN_HEIGHT: 'calc(100vh - 112px - 48px)', // ヘッダーとフッターの高さとpaddingBlockを考慮
  PADDING_BOTTOM: '100px', // 下に100pxの余白を追加
  TASK_LIST_MIN_HEIGHT: 'calc(100vh - 112px - 48px -40px)', // ヘッダーとフッターとカラムヘッダーの高さとpaddingBlockを考慮
  HORIZONTAL_PADDING: 2,
  TASK_GAP: 3
} as const;

const COLUMN_STYLES = {
  container: {
    minWidth: COLUMN_CONFIG.WIDTH,
    maxWidth: COLUMN_CONFIG.WIDTH,
    width: COLUMN_CONFIG.WIDTH,
    flexShrink: 0,
    minHeight: COLUMN_CONFIG.MIN_HEIGHT,
    backgroundColor: 'transparent',
    pt: 0,
    pb: 0, // ドロップエリア拡張のためpadding-bottomを削除
    px: COLUMN_CONFIG.HORIZONTAL_PADDING,
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column'
  },
  taskList: {
    minHeight: COLUMN_CONFIG.TASK_LIST_MIN_HEIGHT,
    display: 'flex',
    flexDirection: 'column',
    gap: COLUMN_CONFIG.TASK_GAP,
    flex: 1 // 残り空間を最大限活用
  }
} as const;

interface KanbanColumnProps {
  readonly column: Column;
  readonly columnIndex: number;
  readonly totalColumns: number;
  readonly onTaskClick?: (task: Task) => void;
  readonly keyboardDragAndDrop?: {
    selectedTaskId: string | null;
    isDragMode: boolean;
    handleKeyDown: (event: React.KeyboardEvent, taskId: string) => void;
  };
}

interface ColumnDialogsProps {
  readonly column: Column;
  readonly showEditDialog: boolean;
  readonly showDeleteConfirm: boolean;
  readonly onTitleSave: (newTitle: string) => void;
  readonly onTitleCancel: () => void;
  readonly onConfirmDeleteColumn: () => void;
  readonly onCancelDeleteColumn: () => void;
}

const ColumnDialogs: React.FC<ColumnDialogsProps> = ({
  column,
  showEditDialog,
  showDeleteConfirm,
  onTitleSave,
  onTitleCancel,
  onConfirmDeleteColumn,
  onCancelDeleteColumn
}) => (
  <>
    <ColumnEditDialog
      isOpen={showEditDialog}
      currentTitle={column.title}
      onSave={onTitleSave}
      onCancel={onTitleCancel}
    />

    <ConfirmDialog
      isOpen={showDeleteConfirm}
      title="カラムを削除"
      message={`「${column.title}」カラムを削除しますか？このカラム内のすべてのタスクも削除されます。`}
      onConfirm={onConfirmDeleteColumn}
      onCancel={onCancelDeleteColumn}
    />
  </>
);

const KanbanColumn: React.FC<KanbanColumnProps> = React.memo(({
  column,
  columnIndex,
  totalColumns,
  onTaskClick,
  keyboardDragAndDrop
}) => {
  const { taskFilter, sortOption, openTaskForm } = useUI();
  const { moveColumn } = useBoard();
  const {
    showEditDialog,
    showDeleteConfirm,
    handleTitleEdit,
    handleTitleSave,
    handleTitleCancel,
    handleDeleteColumn,
    handleConfirmDeleteColumn,
    handleCancelDeleteColumn
  } = useColumnState(column);
  
  const { setNodeRef, isOver } = useDroppable({
    id: column.id,
  });

  // フィルターを適用してからソート
  const { sortedTasks, taskIds } = useMemo(() => {
    const filteredTasks = filterTasks(column.tasks, taskFilter);
    const sortedTasks = sortTasks(filteredTasks, sortOption);
    const taskIds = sortedTasks.map(task => task.id);
    return { sortedTasks, taskIds };
  }, [column.tasks, taskFilter, sortOption]);

  const handleAddTaskClick = useCallback(() => {
    openTaskForm(undefined, column.id);
  }, [openTaskForm, column.id]);

  // カラム移動のハンドラー
  const handleMoveLeft = useCallback(() => {
    moveColumn(column.id, 'left');
  }, [moveColumn, column.id]);

  const handleMoveRight = useCallback(() => {
    moveColumn(column.id, 'right');
  }, [moveColumn, column.id]);

  // 移動可能かどうかの判定
  const canMoveLeft = columnIndex > 0;
  const canMoveRight = columnIndex < totalColumns - 1;
  
  return (
    <Box sx={COLUMN_STYLES.container}>
      <ColumnHeader
        column={column}
        onTitleEdit={handleTitleEdit}
        onDeleteColumn={handleDeleteColumn}
        onAddTask={handleAddTaskClick}
        onMoveLeft={handleMoveLeft}
        onMoveRight={handleMoveRight}
        canMoveLeft={canMoveLeft}
        canMoveRight={canMoveRight}
      />
      
      <Box ref={setNodeRef} sx={COLUMN_STYLES.taskList}>
        <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
          {/* カラムが空の場合のドロップインジケーター */}
          {sortedTasks.length === 0 && (
            <DropIndicator isVisible={isOver} />
          )}
          
          {sortedTasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              columnId={column.id}
              onTaskClick={onTaskClick}
              keyboardDragAndDrop={keyboardDragAndDrop}
            />
          ))}
          
          {/* カラムの一番下のドロップエリア - 残り空間を最大活用 */}
          {sortedTasks.length > 0 && (
            <Box
              sx={{
                flex: 1, // 残り空間を全て使用
                minHeight: '200px', // より大きな最小高さを設定
                height: 'auto', // 自動高さ調整
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 1,
                mt: 2, // 上のタスクとの間隔
                mb: '100px', // 下部マージンを追加
              }} />
          )}
        </SortableContext>
      </Box>

      <ColumnDialogs
        column={column}
        showEditDialog={showEditDialog}
        showDeleteConfirm={showDeleteConfirm}
        onTitleSave={handleTitleSave}
        onTitleCancel={handleTitleCancel}
        onConfirmDeleteColumn={handleConfirmDeleteColumn}
        onCancelDeleteColumn={handleCancelDeleteColumn}
      />
    </Box>
  );
});

KanbanColumn.displayName = 'KanbanColumn';

export default KanbanColumn;