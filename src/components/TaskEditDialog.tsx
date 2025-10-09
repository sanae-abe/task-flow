import { TrashIcon } from '@primer/octicons-react';
import { memo, useMemo } from 'react';

import { useTaskEdit } from '../hooks/useTaskEdit';
import type { Task } from '../types';
import type { DialogAction } from '../types/unified-dialog';

import UnifiedDialog from './shared/Dialog/UnifiedDialog';
import ConfirmDialog from './ConfirmDialog';
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
    dueTime,
    setDueTime,
    hasTime,
    setHasTime,
    labels,
    setLabels,
    attachments,
    setAttachments,
    columnId,
    setColumnId,
    statusOptions,
    recurrence,
    setRecurrence,
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

  const actions = useMemo<DialogAction[]>(() => [
    {
      label: '削除',
      onClick: handleDelete,
      variant: 'danger' as const,
      icon: TrashIcon,
      position: 'left'
    },
    {
      label: 'キャンセル',
      onClick: onCancel,
      variant: 'default' as const,
      position: 'right'
    },
    {
      label: '保存',
      onClick: handleSave,
      variant: 'primary' as const,
      disabled: !isValid,
      position: 'right'
    }
  ], [handleDelete, onCancel, handleSave, isValid]);

  if (!isOpen || !task) {
    return null;
  }

  return (
    <>
      <UnifiedDialog
        variant="modal"
        isOpen={isOpen}
        title="タスクを編集"
        onClose={onCancel}
        size="xl"
        ariaLabelledBy="task-edit-dialog-title"
        actions={actions}
        actionsLayout="split"
      >
        <TaskEditForm
          title={title}
          setTitle={setTitle}
          description={description}
          setDescription={setDescription}
          dueDate={dueDate}
          setDueDate={setDueDate}
          dueTime={dueTime}
          setDueTime={setDueTime}
          hasTime={hasTime}
          setHasTime={setHasTime}
          labels={labels}
          setLabels={setLabels}
          attachments={attachments}
          setAttachments={setAttachments}
          columnId={columnId}
          setColumnId={setColumnId}
          statusOptions={statusOptions}
          recurrence={recurrence}
          setRecurrence={setRecurrence}
          onKeyPress={handleKeyPress}
        />
      </UnifiedDialog>

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