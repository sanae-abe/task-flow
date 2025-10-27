/**
 * Task handlers hook
 *
 * This hook manages event handlers for task operations including
 * save, delete, and other user interaction handlers.
 */

import { useCallback } from 'react';
import type { Task } from '../../types';
import type { TaskWithColumn } from '../../types/table';
import { fromDateTimeLocalString } from '../../utils/dateHelpers';
import { useKanban } from '../../contexts/KanbanContext';
import type { UseTaskFormStateReturn } from './useTaskFormState';

export interface UseTaskHandlersProps {
  task: Task | null;
  formState: UseTaskFormStateReturn;
  onSave: (task: Task) => void;
  onDelete: (taskId: string) => void;
  onCancel: () => void;
}

export interface UseTaskHandlersReturn {
  handleSave: () => void;
  handleDelete: () => void;
  handleConfirmDelete: () => void;
  handleKeyPress: (event: React.KeyboardEvent) => void;
  handleSetDueDate: (date: string | null) => void;
}

export const useTaskHandlers = ({
  task,
  formState,
  onSave,
  onDelete,
  onCancel,
}: UseTaskHandlersProps): UseTaskHandlersReturn => {
  const { state, moveTask } = useKanban();

  const handleSave = useCallback(() => {
    if (task && formState.title.trim()) {
      let dueDateObj: Date | undefined = undefined;

      if (formState.dueDate) {
        if (formState.hasTime && formState.dueTime) {
          // 日付と時刻を組み合わせ
          const dateTimeString = `${formState.dueDate}T${formState.dueTime}`;
          dueDateObj = new Date(dateTimeString);
        } else {
          // 日付のみの場合は23:59:59に設定
          dueDateObj = new Date(formState.dueDate);
          dueDateObj.setHours(23, 59, 59, 999);
        }
      }

      let completedAtObj = formState.completedAt
        ? fromDateTimeLocalString(formState.completedAt) || undefined
        : undefined;

      // カラムの変更があった場合は移動処理を実行
      const currentColumn = state.currentBoard?.columns.find((column) =>
        column.tasks.some((t) => t.id === task.id),
      );

      if (currentColumn && formState.columnId && currentColumn.id !== formState.columnId) {
        // 最後のカラム（完了カラム）への移動かどうかを判定
        const targetColumn = state.currentBoard?.columns.find(
          (col) => col.id === formState.columnId,
        );
        const isLastColumn =
          state.currentBoard?.columns &&
          targetColumn &&
          state.currentBoard.columns.indexOf(targetColumn) ===
            state.currentBoard.columns.length - 1;

        // 完了カラムに移動する場合は完了日時を23:59に設定
        if (isLastColumn && !task.completedAt) {
          completedAtObj = new Date();
          completedAtObj.setHours(23, 59, 59, 999);
        }
        // 完了カラムから他のカラムに移動する場合は完了日時をクリア
        else if (!isLastColumn && task.completedAt) {
          completedAtObj = undefined;
        }

        // タスクを移動
        moveTask(task.id, currentColumn.id, formState.columnId, 0);
      }

      const updatedTask: TaskWithColumn = {
        ...task,
        title: formState.title.trim(),
        description: formState.description.trim() || "",
        dueDate: dueDateObj?.toISOString() || null,
        completedAt: completedAtObj?.toISOString() || null,
        priority: formState.priority,
        labels: formState.labels,
        files: formState.attachments,
        recurrence: formState.recurrence?.enabled && dueDateObj ? formState.recurrence : undefined,
        columnId: formState.columnId, // ステータス（カラムID）を追加
        columnTitle: state.currentBoard?.columns.find(col => col.id === formState.columnId)?.title || '',
        status: state.currentBoard?.columns.find(col => col.id === formState.columnId)?.title || '',
        updatedAt: new Date().toISOString(),
      };

      onSave(updatedTask);
    }
  }, [
    task,
    formState.title,
    formState.description,
    formState.dueDate,
    formState.dueTime,
    formState.hasTime,
    formState.completedAt,
    formState.labels,
    formState.attachments,
    formState.recurrence,
    formState.priority,
    formState.columnId,
    state.currentBoard,
    moveTask,
    onSave,
  ]);

  const handleDelete = useCallback(() => {
    formState.setShowDeleteConfirm(true);
  }, [formState]);

  const handleConfirmDelete = useCallback(() => {
    if (task) {
      onDelete(task.id);
    }
    formState.setShowDeleteConfirm(false);
  }, [task, onDelete, formState]);

  const handleKeyPress = useCallback(
    (event: React.KeyboardEvent) => {
      if (event.key === "Escape") {
        onCancel();
      }
    },
    [onCancel],
  );

  // DatePicker対応のラッパー関数
  const handleSetDueDate = useCallback((date: string | null) => {
    formState.setDueDate(date || '');
  }, [formState]);

  return {
    handleSave,
    handleDelete,
    handleConfirmDelete,
    handleKeyPress,
    handleSetDueDate,
  };
};