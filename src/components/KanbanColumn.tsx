import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Box } from '@primer/react';
import React, { useMemo, useCallback } from 'react';

import { useKanban } from '../contexts/KanbanContext';
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
  MIN_HEIGHT: '600px',
  TASK_LIST_MIN_HEIGHT: '320px',
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
    py: 0,
    px: COLUMN_CONFIG.HORIZONTAL_PADDING,
    overflow: 'hidden'
  },
  taskList: {
    minHeight: COLUMN_CONFIG.TASK_LIST_MIN_HEIGHT,
    display: 'flex',
    flexDirection: 'column',
    gap: COLUMN_CONFIG.TASK_GAP
  }
} as const;

interface KanbanColumnProps {
  readonly column: Column;
  readonly onTaskClick?: (task: Task) => void;
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

const KanbanColumn: React.FC<KanbanColumnProps> = React.memo(({ column, onTaskClick }) => {
  const { state, openTaskForm } = useKanban();
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
    const filteredTasks = filterTasks(column.tasks, state.taskFilter);
    const sortedTasks = sortTasks(filteredTasks, state.sortOption);
    const taskIds = sortedTasks.map(task => task.id);
    return { sortedTasks, taskIds };
  }, [column.tasks, state.taskFilter, state.sortOption]);

  const handleAddTaskClick = useCallback(() => {
    openTaskForm();
  }, [openTaskForm]);
  
  return (
    <Box sx={COLUMN_STYLES.container}>
      <ColumnHeader
        column={column}
        onTitleEdit={handleTitleEdit}
        onDeleteColumn={handleDeleteColumn}
        onAddTask={handleAddTaskClick}
      />
      
      <Box ref={setNodeRef} sx={COLUMN_STYLES.taskList}>
        <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
          {/* カラムが空の場合のドロップインジケーター */}
          {sortedTasks.length === 0 && (
            <DropIndicator isVisible={isOver} />
          )}
          
          {sortedTasks.map((task, index) => (
            <React.Fragment key={task.id}>
              <TaskCard 
                task={task} 
                columnId={column.id}
                onTaskClick={onTaskClick}
              />
              {/* 最後のタスクの後にもドロップインジケーターを表示 */}
              {index === sortedTasks.length - 1 && (
                <DropIndicator isVisible={isOver} />
              )}
            </React.Fragment>
          ))}
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