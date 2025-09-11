import React, { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Button, TextInput, Textarea, Box, Text, Heading } from '@primer/react';
import { CalendarIcon } from '@primer/octicons-react';
import type { Task } from '../types';
import { useKanban } from '../contexts/KanbanContext';

interface TaskCardProps {
  task: Task;
  columnId: string;
  onTaskClick?: (task: Task) => void;
}

const TaskCard: React.FC<TaskCardProps> = ({ task, columnId, onTaskClick }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(task.title);
  const [editDescription, setEditDescription] = useState(task.description);
  const [editDueDate, setEditDueDate] = useState(
    task.dueDate ? task.dueDate.toISOString().split('T')[0] : ''
  );
  const { updateTask, deleteTask } = useKanban();
  
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
  
  const handleSave = () => {
    const dueDate = editDueDate ? new Date(editDueDate) : undefined;
    updateTask(task.id, {
      title: editTitle,
      description: editDescription,
      dueDate,
      updatedAt: new Date(),
    });
    setIsEditing(false);
  };
  
  const handleCancel = () => {
    setEditTitle(task.title);
    setEditDescription(task.description);
    setEditDueDate(task.dueDate ? task.dueDate.toISOString().split('T')[0] : '');
    setIsEditing(false);
  };
  
  const handleDelete = () => {
    if (window.confirm('このタスクを削除しますか？')) {
      deleteTask(task.id, columnId);
    }
  };

  const isOverdue = () => {
    if (!task.dueDate) {
      return false;
    }
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dueDate = new Date(task.dueDate);
    dueDate.setHours(0, 0, 0, 0);
    return dueDate < today;
  };

  const isDueSoon = () => {
    if (!task.dueDate) {
      return false;
    }
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dueDate = new Date(task.dueDate);
    today.setHours(0, 0, 0, 0);
    tomorrow.setHours(0, 0, 0, 0);
    dueDate.setHours(0, 0, 0, 0);
    return dueDate >= today && dueDate <= tomorrow;
  };

  const formatDueDate = (date: Date) => {
    return date.toLocaleDateString('ja-JP', {
      month: 'short',
      day: 'numeric'
    });
  };

  const handleTaskClick = () => {
    if (!isEditing && onTaskClick) {
      onTaskClick(task);
    }
  };
  
  if (isEditing) {
    return (
      <Box 
        bg="canvas.default" 
        borderRadius={2} 
        p={3} 
        border="1px solid" 
        borderColor="border.default"
      >
        <TextInput
          value={editTitle}
          onChange={(e) => setEditTitle(e.target.value)}
          placeholder="タスクタイトル"
          sx={{ mb: 2 }}
        />
        <Textarea
          value={editDescription}
          onChange={(e) => setEditDescription(e.target.value)}
          placeholder="タスクの説明"
          sx={{ mb: 3, resize: 'none', height: '80px' }}
        />
        <Box mb={3}>
          <Text fontSize={1} fontWeight="bold" display="block" mb={1}>
            期限（任意）
          </Text>
          <TextInput
            type="date"
            value={editDueDate}
            onChange={(e) => setEditDueDate(e.target.value)}
            id="edit-due-date"
          />
        </Box>
        <Box display="flex" gap={2}>
          <Button onClick={handleSave} size="small">
            保存
          </Button>
          <Button onClick={handleCancel} size="small">
            キャンセル
          </Button>
        </Box>
      </Box>
    );
  }
  
  return (
    <Box
      ref={setNodeRef}
      bg="canvas.default"
      borderRadius={2}
      p={3}
      border="1px solid"
      borderColor={
        isOverdue() 
          ? 'danger.emphasis' 
          : isDueSoon() 
          ? 'attention.emphasis' 
          : 'border.default'
      }
      sx={{
        ...style,
        cursor: 'grab',
        '&:hover': {
          boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
          transform: 'translateY(-2px)'
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
      <Box>
        <Heading sx={{ fontSize: 2, margin: 0, mb: 2 }}>
          {task.title}
        </Heading>
        {task.description && (
          <Text fontSize={1} color="fg.muted" sx={{ mb: 3 }}>
            {task.description}
          </Text>
        )}
        {task.dueDate && (
          <Box 
            display="flex" 
            alignItems="center" 
            gap={1}
            mb={2}
            bg={
              isOverdue() 
                ? 'danger.subtle' 
                : isDueSoon() 
                ? 'attention.subtle' 
                : 'neutral.subtle'
            }
            color={
              isOverdue() 
                ? 'danger.fg' 
                : isDueSoon() 
                ? 'attention.fg' 
                : 'fg.muted'
            }
            px={2}
            py={1}
            borderRadius={1}
            fontSize={0}
            fontWeight="bold"
          >
            <CalendarIcon size={12} />
            期限: {formatDueDate(task.dueDate)}
            {isOverdue() && ' (期限切れ)'}
            {isDueSoon() && !isOverdue() && ' (明日まで)'}
          </Box>
        )}
        <Text fontSize={0} color="fg.muted">
          作成: {task.createdAt.toLocaleDateString('ja-JP')}
        </Text>
      </Box>
      <Box display="flex" gap={2} mt={3}>
        <Button
          onClick={(e) => {
            e.stopPropagation();
            setIsEditing(true);
          }}
          size="small"
          variant="secondary"
        >
          編集
        </Button>
        <Button
          onClick={(e) => {
            e.stopPropagation();
            handleDelete();
          }}
          size="small"
          variant="danger"
        >
          削除
        </Button>
      </Box>
    </Box>
  );
};

export default TaskCard;