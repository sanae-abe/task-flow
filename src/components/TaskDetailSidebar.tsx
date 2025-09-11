import React, { useEffect } from 'react';
import { Button, Box, Text, Heading } from '@primer/react';
import { CalendarIcon, TrashIcon, XIcon } from '@primer/octicons-react';
import type { Task } from '../types';
import { useKanban } from '../contexts/KanbanContext';

interface TaskDetailSidebarProps {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
}

const TaskDetailSidebar: React.FC<TaskDetailSidebarProps> = ({ task, isOpen, onClose }) => {
  const { deleteTask, state } = useKanban();

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  const handleDelete = () => {
    if (!task || !state.currentBoard) {
      return;
    }
    
    if (window.confirm('Are you sure you want to delete this task?')) {
      const column = state.currentBoard.columns.find(col => 
      col.tasks.some(t => t.id === task.id)
      );
      
      if (column) {
      deleteTask(task.id, column.id);
      onClose();
      }
    }
  };

  const isOverdue = () => {
    if (!task?.dueDate) {
      return false;
    }
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dueDate = new Date(task.dueDate);
    dueDate.setHours(0, 0, 0, 0);
    return dueDate < today;
  };

  const isDueSoon = () => {
    if (!task?.dueDate) {
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
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long'
    });
  };

  const formatDateTime = (date: Date) => {
    return date.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!isOpen || !task) {
    return null;
  }

  return (
    <Box
      sx={{ 
        position: "fixed",
        top: 0,
        right: 0,
        width: "450px",
        height: "100vh",
        bg: "canvas.default",
        boxShadow: '0 16px 32px rgba(0, 0, 0, 0.24)',
        borderLeft: '1px solid',
        borderColor: 'border.default',
        zIndex: 1000,
        overflowY: 'auto'
      }}
    >
      <Box sx={{ display: "flex", height: "100%", flexDirection: "column" }}>
        {/* Header */}
        <Box
          sx={{ 
            display: "flex",
            p: 4,
            alignItems: "center",
            justifyContent: "space-between",
            borderBottom: "1px solid",
            borderColor: "border.default",
            flexShrink: 0 
          }}
        >
          <Heading sx={{ fontSize: 3, margin: 0, pr: 3, wordBreak: 'break-word' }}>
            {task.title}
          </Heading>
          <Button
            onClick={onClose}
            variant="invisible"
            size="small"
            leadingVisual={XIcon}
            aria-label="Close details"
            sx={{ flexShrink: 0 }}
          />
        </Box>

        {/* Content */}
        <Box sx={{ flex: "1", p: 4, overflowY: 'auto' }}>
          <Box sx={{ mb: 4 }}>
            <Heading sx={{ fontSize: 1, margin: 0, mb: 2, fontWeight: 'bold' }}>Description</Heading>
            <Box
              sx={{
                p: 3,
                bg: "canvas.subtle",
                border: "1px solid",
                borderRadius: 2,
                borderColor: "border.default"
              }}
            >
              {task.description ? (
                <Text sx={{ fontSize: 1 }}>{task.description}</Text>
              ) : (
                <Text sx={{ fontSize: 1, color: "fg.muted", fontStyle: "italic" }}>
                  No description set
                </Text>
              )}
            </Box>
          </Box>

          {task.dueDate && (
            <Box sx={{ mb: 4 }}>
              <Heading sx={{ fontSize: 1, margin: 0, mb: 2, fontWeight: 'bold' }}>Due Date</Heading>
              <Box
                sx={{
                  p: 3,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2,
                  bg: isOverdue() 
                    ? 'danger.subtle' 
                    : isDueSoon() 
                    ? 'attention.subtle' 
                    : 'canvas.subtle',
                  borderRadius: 2,
                  border: '1px solid',
                  borderColor: isOverdue() 
                    ? 'danger.emphasis' 
                    : isDueSoon() 
                    ? 'attention.emphasis' 
                    : 'border.default'
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1 }}>
                  <CalendarIcon size={16} />
                  <Text sx={{ fontSize: 1 }}>{formatDueDate(task.dueDate)}</Text>
                </Box>
                {isOverdue() && (
                  <Text
                    sx={{
                      fontSize: 0,
                      fontWeight: "bold",
                      color: "danger.fg",
                      bg: "danger.emphasis",
                      px: 2,
                      py: 1,
                      borderRadius: 2,
                      textTransform: 'uppercase',
                      letterSpacing: '0.025em'
                    }}
                  >
                    Overdue
                  </Text>
                )}
                {isDueSoon() && !isOverdue() && (
                  <Text
                    sx={{
                      fontSize: 0,
                      fontWeight: "bold",
                      color: "attention.fg",
                      bg: "attention.emphasis",
                      px: 2,
                      py: 1,
                      borderRadius: 2,
                      textTransform: 'uppercase',
                      letterSpacing: '0.025em'
                    }}
                  >
                    Due Tomorrow
                  </Text>
                )}
              </Box>
            </Box>
          )}

          <Box sx={{ mb: 4 }}>
            <Heading sx={{ fontSize: 1, margin: 0, mb: 2, fontWeight: 'bold' }}>Created/Updated Info</Heading>
            <Box
              sx={{
                p: 3,
                display: 'flex',
                flexDirection: 'column',
                gap: 2,
                bg: 'canvas.subtle',
                borderRadius: 2,
                border: '1px solid',
                borderColor: 'border.default'
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text sx={{ fontSize: 0, color: "fg.muted" }}>Created At:</Text>
                <Text sx={{ fontSize: 1 }}>{formatDateTime(task.createdAt)}</Text>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text sx={{ fontSize: 0, color: "fg.muted" }}>Updated At:</Text>
                <Text sx={{ fontSize: 1 }}>{formatDateTime(task.updatedAt)}</Text>
              </Box>
            </Box>
          </Box>
        </Box>

        {/* Actions */}
        <Box
          sx={{
            p: 4,
            borderTop: '1px solid',
            borderColor: 'border.default',
            flexShrink: 0
          }}
        >
          <Button
            onClick={handleDelete}
            variant="danger"
            size="medium"
            leadingVisual={TrashIcon}
            sx={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2 }}
          >
            Delete Task
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default TaskDetailSidebar;