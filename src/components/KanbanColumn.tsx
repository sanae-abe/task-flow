import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Box } from '@primer/react';
import React from 'react';

import { useColumnState } from '../hooks/useColumnState';
import type { Column, Task } from '../types';

import ColumnEditDialog from './ColumnEditDialog';
import ColumnHeader from './ColumnHeader';
import ConfirmDialog from './ConfirmDialog';
import TaskCard from './TaskCard';
import TaskCreateDialog from './TaskCreateDialog';

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
  readonly showCreateDialog: boolean;
  readonly showEditDialog: boolean;
  readonly showDeleteConfirm: boolean;
  readonly onAddTask: (title: string, description: string, dueDate?: Date) => void;
  readonly onCancelCreateTask: () => void;
  readonly onTitleSave: (newTitle: string) => void;
  readonly onTitleCancel: () => void;
  readonly onConfirmDeleteColumn: () => void;
  readonly onCancelDeleteColumn: () => void;
}

const ColumnDialogs: React.FC<ColumnDialogsProps> = ({
  column,
  showCreateDialog,
  showEditDialog,
  showDeleteConfirm,
  onAddTask,
  onCancelCreateTask,
  onTitleSave,
  onTitleCancel,
  onConfirmDeleteColumn,
  onCancelDeleteColumn
}) => (
  <>
    <TaskCreateDialog
      isOpen={showCreateDialog}
      onSave={onAddTask}
      onCancel={onCancelCreateTask}
    />

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

const KanbanColumn: React.FC<KanbanColumnProps> = ({ column, onTaskClick }) => {
  const {
    showCreateDialog,
    setShowCreateDialog,
    showEditDialog,
    showDeleteConfirm,
    handleTitleEdit,
    handleTitleSave,
    handleTitleCancel,
    handleDeleteColumn,
    handleConfirmDeleteColumn,
    handleCancelDeleteColumn,
    handleAddTask,
    handleCancelCreateTask
  } = useColumnState(column);
  
  const { setNodeRef } = useDroppable({
    id: column.id,
  });

  const taskIds = column.tasks.map(task => task.id);
  
  return (
    <Box sx={COLUMN_STYLES.container}>
      <ColumnHeader
        column={column}
        onTitleEdit={handleTitleEdit}
        onDeleteColumn={handleDeleteColumn}
        onAddTask={() => setShowCreateDialog(true)}
      />
      
      <Box ref={setNodeRef} sx={COLUMN_STYLES.taskList}>
        <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
          {column.tasks.map((task) => (
            <TaskCard 
              key={task.id} 
              task={task} 
              columnId={column.id}
              onTaskClick={onTaskClick}
            />
          ))}
        </SortableContext>
      </Box>

      <ColumnDialogs
        column={column}
        showCreateDialog={showCreateDialog}
        showEditDialog={showEditDialog}
        showDeleteConfirm={showDeleteConfirm}
        onAddTask={handleAddTask}
        onCancelCreateTask={handleCancelCreateTask}
        onTitleSave={handleTitleSave}
        onTitleCancel={handleTitleCancel}
        onConfirmDeleteColumn={handleConfirmDeleteColumn}
        onCancelDeleteColumn={handleCancelDeleteColumn}
      />
    </Box>
  );
};

export default KanbanColumn;