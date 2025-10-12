import { useCallback } from "react";
import type { Task, KanbanBoard } from "../../../types";
import type { TaskWithColumn } from "../../../types/table";
import type { TableActions, DeleteConfirmState } from "../types";

/**
 * テーブルアクション管理カスタムフック
 *
 * テーブル内でのタスク操作（クリック、ステータス変更、削除など）を管理します。
 */
export const useTableActions = (
  currentBoard: KanbanBoard | null,
  moveTask: (
    taskId: string,
    sourceColumnId: string,
    targetColumnId: string,
    targetIndex: number,
  ) => void,
  deleteTask: (taskId: string, columnId: string) => void,
  openTaskDetail: (taskId: string) => void,
  deleteConfirmDialog: DeleteConfirmState,
  setDeleteConfirmDialog: (state: DeleteConfirmState) => void,
): TableActions => {
  // タスククリック処理
  const handleTaskClick = useCallback(
    (task: Task) => {
      openTaskDetail(task.id);
    },
    [openTaskDetail],
  );

  // ステータス変更処理
  const handleStatusChange = useCallback(
    (task: TaskWithColumn, newColumnId: string) => {
      if (task.columnId === newColumnId) {
        return;
      }

      const targetColumn = currentBoard?.columns.find(
        (col) => col.id === newColumnId,
      );
      if (targetColumn) {
        moveTask(
          task.id,
          task.columnId,
          newColumnId,
          targetColumn.tasks.length,
        );
      }
    },
    [currentBoard, moveTask],
  );

  // タスク削除クリック処理
  const handleTaskDeleteClick = useCallback(
    (task: TaskWithColumn) => {
      setDeleteConfirmDialog({ isOpen: true, task });
    },
    [setDeleteConfirmDialog],
  );

  // タスク削除実行処理
  const handleTaskDelete = useCallback(() => {
    if (deleteConfirmDialog.task) {
      deleteTask(
        deleteConfirmDialog.task.id,
        deleteConfirmDialog.task.columnId,
      );
    }
  }, [deleteTask, deleteConfirmDialog.task]);

  // 削除ダイアログ閉じる処理
  const handleDeleteDialogClose = useCallback(() => {
    setDeleteConfirmDialog({ isOpen: false, task: null });
  }, [setDeleteConfirmDialog]);

  return {
    handleTaskClick,
    handleStatusChange,
    handleTaskDeleteClick,
    handleTaskDelete,
    handleDeleteDialogClose,
  };
};
