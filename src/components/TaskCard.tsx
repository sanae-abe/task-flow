import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Box } from '@primer/react';
import React from 'react';

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
}

const getCardStyles = (isRightmostColumn: boolean, isDragging: boolean, transform: { x: number; y: number; scaleX: number; scaleY: number } | null, transition: string | undefined) => ({
  ...{
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : (isRightmostColumn ? 0.6 : 1),
  },
  borderRadius: 2,
  borderColor: 'border.default',
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

const TaskCard: React.FC<TaskCardProps> = ({ task, columnId, onTaskClick }) => {
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

  const handleTaskClick = () => {
    if (onTaskClick) {
      onTaskClick(task);
    }
  };
  
  return (
    <>
      {/* タスクの上にドロップインジケーターを表示 */}
      <DropIndicator isVisible={isOver && !isDragging} />
      
      <Box
        ref={setNodeRef}
        bg="canvas.default"
        p={3}
        border="1px solid"
        sx={getCardStyles(taskCardData.isRightmostColumn, isDragging, transform, transition)}
        {...attributes}
        {...listeners}
        onClick={handleTaskClick}
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
};

export default TaskCard;