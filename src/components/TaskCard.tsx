import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Box } from '@primer/react';
import type { Task } from '../types';
import { useTaskCard } from '../hooks/useTaskCard';
import TaskEditForm from './TaskEditForm';
import TaskDisplay from './TaskDisplay';

interface TaskCardProps {
  task: Task;
  columnId: string;
  onTaskClick?: (task: Task) => void;
}

const TaskCard: React.FC<TaskCardProps> = ({ task, columnId, onTaskClick }) => {
  const {
    isEditing,
    editTitle,
    editDescription,
    editDueDate,
    setEditTitle,
    setEditDescription,
    setEditDueDate,
    handleEdit,
    handleSave,
    handleCancel,
    handleDelete,
    isOverdue,
    isDueSoon,
    formatDueDate
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
    if (!isEditing && onTaskClick) {
      onTaskClick(task);
    }
  };
  
  if (isEditing) {
    return (
      <TaskEditForm
        editTitle={editTitle}
        editDescription={editDescription}
        editDueDate={editDueDate}
        onTitleChange={setEditTitle}
        onDescriptionChange={setEditDescription}
        onDueDateChange={setEditDueDate}
        onSave={handleSave}
        onCancel={handleCancel}
      />
    );
  }
  
  return (
    <Box
      ref={setNodeRef}
      bg="canvas.default"
      p={4}
      border="1px solid"
      sx={{
        ...style,
        borderRadius: 2,
        borderColor: isOverdue() 
          ? 'danger.emphasis' 
          : isDueSoon() 
          ? 'attention.emphasis' 
          : 'border.default',
        cursor: 'grab',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
        transition: 'all 0.2s ease',
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
        isDueSoon={isDueSoon}
        formatDueDate={formatDueDate}
        onEdit={(e: React.MouseEvent) => {
          e.stopPropagation();
          handleEdit();
        }}
        onDelete={(e: React.MouseEvent) => {
          e.stopPropagation();
          handleDelete();
        }}
      />
    </Box>
  );
};

export default TaskCard;