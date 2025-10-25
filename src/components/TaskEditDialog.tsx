import { Trash2 } from "lucide-react";
import { memo, useMemo, useCallback } from "react";

import { useTaskEdit } from "../hooks/useTaskEdit";
import { useFormChangeDetector } from "../hooks/useFormChangeDetector";
import type { Task } from "../types";
import type { DialogAction } from "../types/unified-dialog";

import UnifiedDialog from "./shared/Dialog/UnifiedDialog";
import ConfirmDialog from "./ConfirmDialog";
import TaskEditForm from "./TaskEditForm";

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

    // フォーム変更検知のためのデータ
    const formDataForDetection = useMemo(() => ({
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
    }), [title, description, dueDate, dueTime, hasTime, labels, attachments, columnId, recurrence, priority]);

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
          label: "削除",
          onClick: handleDelete,
          variant: "destructive" as const,
          icon: Trash2,
          position: "left",
        },
        {
          label: "キャンセル",
          onClick: handleDialogClose,
          variant: "outline" as const,
          position: "right",
        },
        {
          label: "保存",
          onClick: handleSave,
          variant: "default" as const,
          disabled: !isValid,
          position: "right",
        },
      ],
      [handleDelete, handleDialogClose, handleSave, isValid],
    );

    if (!isOpen || !task) {
      return null;
    }

    return (
      <>
        <UnifiedDialog
          variant="modal"
          isOpen={isOpen}
          title="タスクを編集"
          onClose={handleDialogClose}
          size="large"
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
            priority={priority}
            setPriority={setPriority}
            onKeyPress={handleKeyPress}
          />
        </UnifiedDialog>

        <ConfirmDialog
          isOpen={showDeleteConfirm}
          title="タスクを削除"
          message={`「${task?.title}」を削除しますか？`}
          onConfirm={handleConfirmDelete}
          onCancel={() => setShowDeleteConfirm(false)}
        />

        <ConfirmDialog
          isOpen={showCloseConfirm}
          title="変更を破棄しますか？"
          message="編集した内容が失われますが、よろしいですか？"
          confirmText="破棄する"
          cancelText="戻る"
          onConfirm={handleConfirmClose}
          onCancel={handleCancelClose}
        />
      </>
    );
  },
);

export default TaskEditDialog;
