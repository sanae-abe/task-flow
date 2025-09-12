import { TrashIcon, XIcon, PencilIcon } from '@primer/octicons-react';
import { Button, Box, Heading } from '@primer/react';
import React, { useEffect } from 'react';

import { useTaskActions } from '../hooks/useTaskActions';
import { useTaskColumn } from '../hooks/useTaskColumn';
import type { Task } from '../types';

import ConfirmDialog from './ConfirmDialog';
import SubTaskList from './SubTaskList';
import TaskDisplayContent from './TaskDisplayContent';
import TaskEditDialog from './TaskEditDialog';
import TaskMetadata from './TaskMetadata';

interface TaskDetailSidebarProps {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
}

const TaskDetailSidebar: React.FC<TaskDetailSidebarProps> = ({ task, isOpen, onClose }) => {
  const { columnName } = useTaskColumn(task);
  const {
    showDeleteConfirm,
    showEditDialog,
    setShowDeleteConfirm,
    setShowEditDialog,
    handleEdit,
    handleDelete,
    handleConfirmDelete,
    handleSaveEdit,
    handleDeleteFromDialog,
    handleAddSubTask,
    handleToggleSubTask,
    handleDeleteSubTask
  } = useTaskActions(task, onClose);

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
            alignItems: "flex-start",
            justifyContent: "space-between",
            borderBottom: "1px solid",
            borderColor: "border.default",
            flexShrink: 0 
          }}
        >
          <Heading sx={{ fontSize: 2, margin: 0, pr: 3, wordBreak: 'break-word' }}>
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
          <TaskDisplayContent task={task} columnName={columnName} />
          <SubTaskList
            subTasks={task.subTasks ?? []}
            onAddSubTask={handleAddSubTask}
            onToggleSubTask={handleToggleSubTask}
            onDeleteSubTask={handleDeleteSubTask}
          />
          <TaskMetadata task={task} />
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
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              onClick={handleEdit}
              variant="primary"
              size="medium"
              leadingVisual={PencilIcon}
              sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2 }}
            >
              編集
            </Button>
            <Button
              onClick={handleDelete}
              variant="danger"
              size="medium"
              leadingVisual={TrashIcon}
              sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2 }}
            >
              削除
            </Button>
          </Box>
        </Box>
      </Box>

      <TaskEditDialog
        task={task}
        isOpen={showEditDialog}
        onSave={handleSaveEdit}
        onDelete={handleDeleteFromDialog}
        onCancel={() => setShowEditDialog(false)}
      />

      <ConfirmDialog
        isOpen={showDeleteConfirm}
        title="タスクを削除"
        message={`「${task?.title}」を削除しますか？この操作は元に戻せません。`}
        onConfirm={handleConfirmDelete}
        onCancel={() => setShowDeleteConfirm(false)}
      />
    </Box>
  );
};

export default TaskDetailSidebar;