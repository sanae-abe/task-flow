import React, { useEffect } from 'react';
import { Button, Box, Heading } from '@primer/react';
import { TrashIcon, XIcon, PencilIcon } from '@primer/octicons-react';
import type { Task } from '../types';
import { useKanban } from '../contexts/KanbanContext';
import { useTaskDetailEdit } from '../hooks/useTaskDetailEdit';
import TaskDetailEditForm from './TaskDetailEditForm';
import TaskDisplayContent from './TaskDisplayContent';
import TaskMetadata from './TaskMetadata';
import ConfirmDialog from './ConfirmDialog';

interface TaskDetailSidebarProps {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
}

const TaskDetailSidebar: React.FC<TaskDetailSidebarProps> = ({ task, isOpen, onClose }) => {
  const { deleteTask, updateTask, state } = useKanban();
  const {
    isEditing,
    editTitle,
    editDescription,
    editDueDate,
    editLabels,
    setEditTitle,
    setEditDescription,
    setEditDueDate,
    setEditLabels,
    handleEdit,
    handleCancelEdit,
    canSave
  } = useTaskDetailEdit(task);
  const [showDeleteConfirm, setShowDeleteConfirm] = React.useState(false);

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (isEditing) {
          handleCancelEdit();
        } else {
          onClose();
        }
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose, isEditing, handleCancelEdit]);

  const handleSaveEdit = () => {
    if (!task || !state.currentBoard || !canSave) {
      return;
    }

    const column = state.currentBoard.columns.find(col => 
      col.tasks.some(t => t.id === task.id)
    );

    if (column) {
      const updatedTask = {
        ...task,
        title: editTitle.trim(),
        description: editDescription.trim() || undefined,
        dueDate: editDueDate ? new Date(editDueDate) : undefined,
        labels: editLabels,
        updatedAt: new Date()
      };

      updateTask(task.id, updatedTask);
      handleCancelEdit();
    }
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
          {isEditing ? (
            <TaskDetailEditForm
              editTitle={editTitle}
              editDescription={editDescription}
              editDueDate={editDueDate}
              editLabels={editLabels}
              onTitleChange={setEditTitle}
              onDescriptionChange={setEditDescription}
              onDueDateChange={setEditDueDate}
              onLabelsChange={setEditLabels}
            />
          ) : (
            <>
              <TaskDisplayContent task={task} />
              <TaskMetadata task={task} />
            </>
          )}
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
          {isEditing ? (
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                onClick={handleSaveEdit}
                variant="primary"
                size="medium"
                sx={{ flex: 1 }}
                disabled={!canSave}
              >
                Save
              </Button>
              <Button
                onClick={handleCancelEdit}
                size="medium"
                sx={{ flex: 1 }}
              >
                Cancel
              </Button>
            </Box>
          ) : (
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                onClick={handleEdit}
                size="medium"
                leadingVisual={PencilIcon}
                sx={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2 }}
              >
                Edit Task
              </Button>
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
          )}
        </Box>
      </Box>

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