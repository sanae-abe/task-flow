import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Box } from '@primer/react';
import type { Task } from '../types';
import { useTaskCard } from '../hooks/useTaskCard';
import TaskEditDialog from './TaskEditDialog';
import TaskDisplay from './TaskDisplay';
import ConfirmDialog from './ConfirmDialog';

interface TaskCardProps {
  task: Task;
  columnId: string;
  onTaskClick?: (task: Task) => void;
}

const TaskCard: React.FC<TaskCardProps> = ({ task, columnId, onTaskClick }) => {
  const {
    showEditDialog,
    showDeleteConfirm,
    handleEdit,
    handleSave,
    handleCancel,
    handleDelete,
    handleConfirmDelete,
    handleDeleteFromDialog,
    handleCancelDelete,
    handleComplete,
    isOverdue,
    isDueToday,
    isDueTomorrow,
    formatDueDate,
    isRightmostColumn
  } = useTaskCard(task, columnId);
  
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });
  
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const handleTaskClick = () => {
    if (onTaskClick) {
      onTaskClick(task);
    }
  };
  
  return (
    <>
      <Box
        ref={setNodeRef}
        bg="canvas.default"
        p={4}
        border="1px solid"
        sx={{
          ...style,
          borderRadius: 2,
          borderColor: 'border.default',
          cursor: 'grab',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
          transition: 'all 0.2s ease',
          opacity: isRightmostColumn ? 0.6 : 1,
          '&:hover': {
            boxShadow: '0 2px 12px rgba(0, 0, 0, 0.2)',
          },
          '&:active': {
            cursor: 'grabbing'
          }
        }}
        // eslint-disable-next-line react/jsx-props-no-spreading
        {...attributes}
        // eslint-disable-next-line react/jsx-props-no-spreading
        {...listeners}
        onClick={handleTaskClick}
      >
        <TaskDisplay
          task={task}
          isOverdue={isOverdue}
          isDueToday={isDueToday}
          isDueTomorrow={isDueTomorrow}
          formatDueDate={formatDueDate}
          onEdit={(e: React.MouseEvent) => {
            e.stopPropagation();
            handleEdit();
          }}
          onDelete={(e: React.MouseEvent) => {
            e.stopPropagation();
            handleDelete();
          }}
          onComplete={(e: React.MouseEvent) => {
            e.stopPropagation();
            handleComplete();
          }}
          isRightmostColumn={isRightmostColumn}
        />
      </Box>

      <TaskEditDialog
        task={task}
        isOpen={showEditDialog}
        onSave={handleSave}
        onDelete={handleDeleteFromDialog}
        onCancel={handleCancel}
      />

      <ConfirmDialog
        isOpen={showDeleteConfirm}
        title="タスクを削除"
        message={`「${task.title}」を削除しますか？この操作は元に戻せません。`}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />
    </>
  );
};

export default TaskCard;