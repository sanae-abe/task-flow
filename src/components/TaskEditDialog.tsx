import { Trash2 } from 'lucide-react';
import { memo, useMemo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';

import { useTaskEdit } from '../hooks/useTaskEdit';
import { useFormChangeDetector } from '../hooks/useFormChangeDetector';
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

const TaskEditDialog = memo<TaskEditDialogProps>(
  ({ task, isOpen, onSave, onDelete, onCancel }) => {
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
      priority,
      setPriority,
      showDeleteConfirm,
      setShowDeleteConfirm,
      handleSave,
      handleDelete,
      handleConfirmDelete,
      handleKeyPress,
      isValid,
    } = useTaskEdit({
      task,
      isOpen,
      onSave,
      onDelete,
      onCancel,
    });

    const { t } = useTranslation();

    // フォーム変更検知のためのデータ
    const formDataForDetection = useMemo(
      () => ({
        title,
        description,
        dueDate,
        dueTime,
        hasTime,
        labels,
        attachments,
        columnId,
        recurrence,
        priority,
      }),
      [
        title,
        description,
        dueDate,
        dueTime,
        hasTime,
        labels,
        attachments,
        columnId,
        recurrence,
        priority,
      ]
    );

    // フォーム変更検知
    const {
      showCloseConfirm,
      handleClose,
      handleConfirmClose,
      handleCancelClose,
    } = useFormChangeDetector(formDataForDetection, isOpen);

    // ダイアログが閉じられた時の処理（確認機能付き）
    const handleDialogClose = useCallback(() => {
      handleClose(onCancel);
    }, [handleClose, onCancel]);

    const actions = useMemo<DialogAction[]>(
      () => [
        {
          label: t('common.delete'),
          onClick: handleDelete,
          variant: 'destructive' as const,
          icon: Trash2,
          position: 'left',
        },
        {
          label: t('common.cancel'),
          onClick: handleDialogClose,
          variant: 'outline' as const,
          position: 'right',
        },
        {
          label: t('common.save'),
          onClick: handleSave,
          variant: 'default' as const,
          disabled: !isValid,
          position: 'right',
        },
      ],
      [handleDelete, handleDialogClose, handleSave, isValid, t]
    );

    if (!isOpen || !task) {
      return null;
    }

    return (
      <>
        <UnifiedDialog
          variant='modal'
          isOpen={isOpen}
          title={t('task.editTask')}
          onClose={handleDialogClose}
          size='large'
          ariaLabelledBy='task-edit-dialog-title'
          actions={actions}
          actionsLayout='split'
        >
          <TaskEditForm
            editorKey={`task-edit-${task.id}-${task.description?.length || 0}`}
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
            priority={priority}
            setPriority={setPriority}
            onKeyPress={handleKeyPress}
          />
        </UnifiedDialog>

        <ConfirmDialog
          isOpen={showDeleteConfirm}
          title={t('task.deleteTask')}
          message={t('task.deleteTaskConfirm', { title: task?.title })}
          onConfirm={handleConfirmDelete}
          onCancel={() => setShowDeleteConfirm(false)}
        />

        <ConfirmDialog
          isOpen={showCloseConfirm}
          title={t('common.discardChanges')}
          message={t('common.discardChangesMessage')}
          confirmText={t('common.discard')}
          cancelText={t('common.back')}
          onConfirm={handleConfirmClose}
          onCancel={handleCancelClose}
        />
      </>
    );
  }
);

export default TaskEditDialog;
