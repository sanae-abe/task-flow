import React, { useEffect } from 'react';
import { Button, Box, Text, Heading, Overlay } from '@primer/react';
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
    
    if (window.confirm('このタスクを削除しますか？')) {
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
    <Overlay
      position="fixed"
      top={0}
      right={0}
      width="450px"
      height="100vh"
      bg="canvas.default"
      sx={{ 
        boxShadow: '0 16px 32px rgba(0, 0, 0, 0.24)',
        borderLeft: '1px solid',
        borderColor: 'border.default',
        zIndex: 1000,
        overflowY: 'auto'
      }}
    >
      <Box display="flex" flexDirection="column" height="100%">
        {/* Header */}
        <Box
          display="flex"
          alignItems="center"
          justifyContent="space-between"
          p={4}
          borderBottom="1px solid"
          borderColor="border.default"
          sx={{ flexShrink: 0 }}
        >
          <Heading sx={{ fontSize: 3, margin: 0, pr: 3, wordBreak: 'break-word' }}>
            {task.title}
          </Heading>
          <Button
            onClick={onClose}
            variant="invisible"
            size="small"
            leadingVisual={XIcon}
            aria-label="詳細を閉じる"
            sx={{ flexShrink: 0 }}
          />
        </Box>

        {/* Content */}
        <Box flex="1" p={4} sx={{ overflowY: 'auto' }}>
          <Box mb={4}>
            <Heading sx={{ fontSize: 1, margin: 0, mb: 2, fontWeight: 'bold' }}>説明</Heading>
            <Box
              p={3}
              bg="canvas.subtle"
              borderRadius={2}
              border="1px solid"
              borderColor="border.default"
            >
              {task.description ? (
                <Text fontSize={1}>{task.description}</Text>
              ) : (
                <Text fontSize={1} color="fg.muted" fontStyle="italic">
                  説明が設定されていません
                </Text>
              )}
            </Box>
          </Box>

          {task.dueDate && (
            <Box mb={4}>
              <Heading sx={{ fontSize: 1, margin: 0, mb: 2, fontWeight: 'bold' }}>期限</Heading>
              <Box
                display="flex"
                alignItems="center"
                gap={2}
                p={3}
                bg={
                  isOverdue() 
                    ? 'danger.subtle' 
                    : isDueSoon() 
                    ? 'attention.subtle' 
                    : 'canvas.subtle'
                }
                borderRadius={2}
                border="1px solid"
                borderColor={
                  isOverdue() 
                    ? 'danger.emphasis' 
                    : isDueSoon() 
                    ? 'attention.emphasis' 
                    : 'border.default'
                }
              >
                <Box display="flex" alignItems="center" gap={2} flex="1">
                  <CalendarIcon size={16} />
                  <Text fontSize={1}>{formatDueDate(task.dueDate)}</Text>
                </Box>
                {isOverdue() && (
                  <Text
                    fontSize={0}
                    fontWeight="bold"
                    color="danger.fg"
                    bg="danger.emphasis"
                    px={2}
                    py={1}
                    borderRadius={1}
                    sx={{ textTransform: 'uppercase', letterSpacing: '0.025em' }}
                  >
                    期限切れ
                  </Text>
                )}
                {isDueSoon() && !isOverdue() && (
                  <Text
                    fontSize={0}
                    fontWeight="bold"
                    color="attention.fg"
                    bg="attention.emphasis"
                    px={2}
                    py={1}
                    borderRadius={1}
                    sx={{ textTransform: 'uppercase', letterSpacing: '0.025em' }}
                  >
                    明日まで
                  </Text>
                )}
              </Box>
            </Box>
          )}

          <Box mb={4}>
            <Heading sx={{ fontSize: 1, margin: 0, mb: 2, fontWeight: 'bold' }}>作成・更新情報</Heading>
            <Box
              display="flex"
              flexDirection="column"
              gap={2}
              p={3}
              bg="canvas.subtle"
              borderRadius={2}
              border="1px solid"
              borderColor="border.default"
            >
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Text fontSize={0} color="fg.muted">作成日時:</Text>
                <Text fontSize={1}>{formatDateTime(task.createdAt)}</Text>
              </Box>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Text fontSize={0} color="fg.muted">更新日時:</Text>
                <Text fontSize={1}>{formatDateTime(task.updatedAt)}</Text>
              </Box>
            </Box>
          </Box>
        </Box>

        {/* Actions */}
        <Box
          p={4}
          borderTop="1px solid"
          borderColor="border.default"
          sx={{ flexShrink: 0 }}
        >
          <Button
            onClick={handleDelete}
            variant="danger"
            size="medium"
            leadingVisual={TrashIcon}
            sx={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2 }}
          >
            タスクを削除
          </Button>
        </Box>
      </Box>
    </Overlay>
  );
};

export default TaskDetailSidebar;