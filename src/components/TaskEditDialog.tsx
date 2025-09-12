import { memo } from 'react';

import { useTaskEdit } from '../hooks/useTaskEdit';
import type { Task } from '../types';

import BaseDialog from './BaseDialog';
import ConfirmDialog from './ConfirmDialog';
import TaskEditActions from './TaskEditActions';
import TaskEditForm from './TaskEditForm';

interface TaskEditDialogProps {
  task: Task | null;
  isOpen: boolean;
  onSave: (updatedTask: Task) => void;
  onDelete: (taskId: string) => void;
  onCancel: () => void;
}

const TaskEditDialog = memo<TaskEditDialogProps>(({ 
  task,
  isOpen,
  onSave, 
  onDelete,
  onCancel 
}) => {
  const {
    title,
    setTitle,
    description,
    setDescription,
    dueDate,
    setDueDate,
    labels,
    setLabels,
    attachments,
    setAttachments,
    showDeleteConfirm,
    setShowDeleteConfirm,
    handleSave,
    handleDelete,
    handleConfirmDelete,
    handleKeyPress,
    isValid
  } = useTaskEdit({
    task,
    isOpen,
    onSave,
    onDelete,
    onCancel
  });

  if (!isOpen || !task) {
    return null;
  }

  return (
    <>
      <BaseDialog
        isOpen={isOpen}
        title="タスクを編集"
        onClose={onCancel}
        size="large"
        ariaLabelledBy="task-edit-dialog-title"
      >
        <TaskEditForm
          title={title}
          setTitle={setTitle}
          description={description}
          setDescription={setDescription}
          dueDate={dueDate}
          setDueDate={setDueDate}
          labels={labels}
          setLabels={setLabels}
          attachments={attachments}
          setAttachments={setAttachments}
          onKeyPress={handleKeyPress}
        />
        
        <TaskEditActions
          onSave={handleSave}
          onDelete={handleDelete}
          onCancel={onCancel}
          isValid={isValid}
        />
      </BaseDialog>

      <ConfirmDialog
        isOpen={showDeleteConfirm}
        title="タスクを削除"
        message={`「${task?.title}」を削除しますか？この操作は元に戻せません。`}
        onConfirm={handleConfirmDelete}
        onCancel={() => setShowDeleteConfirm(false)}
      />
    </>
  );
});

export default TaskEditDialog;