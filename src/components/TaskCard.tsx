import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Box } from '@primer/react';
import React, { useCallback } from 'react';

import { useTaskCard } from '../hooks/useTaskCard';
import type { Task } from '../types';
import { formatDueDate } from '../utils/dateHelpers';

import ConfirmDialog from './ConfirmDialog';
import DropIndicator from './DropIndicator';
import TaskCardContent from './TaskCardContent';
import TaskEditDialog from './TaskEditDialog';

interface TaskCardProps {
  task: Task;
  columnId: string;
  onTaskClick?: (task: Task) => void;
  keyboardDragAndDrop?: {
    selectedTaskId: string | null;
    isDragMode: boolean;
    handleKeyDown: (event: React.KeyboardEvent, taskId: string) => void;
  };
}

const getCardStyles = (isRightmostColumn: boolean, isDragging: boolean, transform: { x: number; y: number; scaleX: number; scaleY: number } | null, transition: string | undefined) => ({
  ...{
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : (isRightmostColumn ? 0.6 : 1),
  },
  borderRadius: 2,
  cursor: 'grab',
  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
  transition: 'all 0.2s ease',
  width: '100%',
  maxWidth: '100%',
  minWidth: 0,
  minHeight: 'auto',
  height: 'auto',
  wordWrap: 'break-word' as const,
  overflowWrap: 'break-word' as const,
  display: 'flex',
  flexDirection: 'column' as const,
  '&:hover': {
    boxShadow: '0 2px 12px rgba(0, 0, 0, 0.15)',
  },
  '&:active': {
    cursor: 'grabbing'
  }
});

const TaskCard: React.FC<TaskCardProps> = React.memo(({ task, columnId, onTaskClick, keyboardDragAndDrop }) => {
  const taskCardData = useTaskCard(task, columnId);
  
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
    isOver,
  } = useSortable({ id: task.id });

  const handleTaskClick = useCallback(() => {
    if (onTaskClick) {
      onTaskClick(task);
    }
  }, [onTaskClick, task]);

  const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
    if (keyboardDragAndDrop) {
      keyboardDragAndDrop.handleKeyDown(event, task.id);
    }
  }, [keyboardDragAndDrop, task.id]);

  // キーボードドラッグ&ドロップ用のスタイル
  const isKeyboardSelected = keyboardDragAndDrop?.selectedTaskId === task.id;
  const isInDragMode = keyboardDragAndDrop?.isDragMode;

  const keyboardDragStyles = isKeyboardSelected && isInDragMode ? {
    outline: '2px solid #0969da',
    outlineOffset: '2px',
    boxShadow: '0 0 0 4px rgba(9, 105, 218, 0.3)'
  } : {};
  
  return (
    <>
      {/* タスクの上にドロップインジケーターを表示 */}
      <DropIndicator isVisible={isOver && !isDragging} />
      
      <Box
        ref={setNodeRef}
        sx={{
          bg: "canvas.default",
          p: 3,
          ...getCardStyles(taskCardData.isRightmostColumn, isDragging, transform, transition),
          ...keyboardDragStyles
        }}
        {...attributes}
        {...listeners}
        onClick={handleTaskClick}
        onKeyDown={handleKeyDown}
        tabIndex={0}
        role="button"
        aria-label={`タスク: ${task.title}. キーボードでの移動にはSpaceキーまたはEnterキーを押してください。`}
        aria-pressed={isKeyboardSelected}
        data-task-id={task.id}
      >
        <TaskCardContent
          task={task}
          isOverdue={taskCardData.isOverdue}
          isDueToday={taskCardData.isDueToday}
          isDueTomorrow={taskCardData.isDueTomorrow}
          formatDueDate={formatDueDate}
          onEdit={(e: React.MouseEvent) => {
            e.stopPropagation();
            taskCardData.handleEdit();
          }}
          onDelete={(e: React.MouseEvent) => {
            e.stopPropagation();
            taskCardData.handleDelete();
          }}
          onComplete={(e: React.MouseEvent) => {
            e.stopPropagation();
            taskCardData.handleComplete();
          }}
          isRightmostColumn={taskCardData.isRightmostColumn}
        />
      </Box>

      <TaskEditDialog
        task={task}
        isOpen={taskCardData.showEditDialog}
        onSave={taskCardData.handleSave}
        onDelete={taskCardData.handleDeleteFromDialog}
        onCancel={taskCardData.handleCancel}
      />

      <ConfirmDialog
        isOpen={taskCardData.showDeleteConfirm}
        title="タスクを削除"
        message={`「${task.title}」を削除しますか？この操作は元に戻せません。`}
        onConfirm={taskCardData.handleConfirmDelete}
        onCancel={taskCardData.handleCancelDelete}
      />
    </>
  );
});

TaskCard.displayName = 'TaskCard';

export default TaskCard;