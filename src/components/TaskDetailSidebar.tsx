import React, { useEffect, useState } from 'react';
import { Button, Box, Heading } from '@primer/react';
import { TrashIcon, XIcon, PencilIcon } from '@primer/octicons-react';
import type { Task } from '../types';
import { useKanban } from '../contexts/KanbanContext';
import TaskDisplayContent from './TaskDisplayContent';
import TaskMetadata from './TaskMetadata';
import ConfirmDialog from './ConfirmDialog';
import TaskEditDialog from './TaskEditDialog';
import SubTaskList from './SubTaskList';

interface TaskDetailSidebarProps {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
}

const TaskDetailSidebar: React.FC<TaskDetailSidebarProps> = ({ task, isOpen, onClose }) => {
  const { deleteTask, updateTask, state, addSubTask, toggleSubTask, deleteSubTask } = useKanban();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  
  // タスクが属するカラム名を取得
  const columnName = task && state.currentBoard ? 
    state.currentBoard.columns.find(column => 
      column.tasks.some(t => t.id === task.id)
    )?.title : undefined;

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

  const handleEdit = () => {
    setShowEditDialog(true);
  };

  const handleDelete = () => {
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = () => {
    if (!task || !state.currentBoard) {
      return;
    }
    
    const column = state.currentBoard.columns.find(col => 
      col.tasks.some(t => t.id === task.id)
    );
    
    if (column) {
      deleteTask(task.id, column.id);
      onClose();
    }
    setShowDeleteConfirm(false);
  };

  const handleSaveEdit = (updatedTask: Task) => {
    updateTask(updatedTask.id, updatedTask);
    setShowEditDialog(false);
  };

  const handleDeleteFromDialog = (taskId: string) => {
    if (!task || !state.currentBoard) {
      return;
    }
    
    const column = state.currentBoard.columns.find(col => 
      col.tasks.some(t => t.id === task.id)
    );
    
    if (column) {
      deleteTask(taskId, column.id);
      onClose();
    }
    setShowEditDialog(false);
  };

  const handleAddSubTask = (title: string) => {
    if (task) {
      addSubTask(task.id, title);
    }
  };

  const handleToggleSubTask = (subTaskId: string) => {
    if (task) {
      toggleSubTask(task.id, subTaskId);
    }
  };

  const handleDeleteSubTask = (subTaskId: string) => {
    if (task) {
      deleteSubTask(task.id, subTaskId);
    }
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
          <TaskDisplayContent task={task} columnName={columnName} />
          <SubTaskList
            subTasks={task.subTasks || []}
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