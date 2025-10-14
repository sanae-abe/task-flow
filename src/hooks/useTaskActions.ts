import { useState, useCallback } from "react";

import { useKanban } from "../contexts/KanbanContext";
import { useBoard } from "../contexts/BoardContext";
import type { Task } from "../types";

import { useTaskColumn } from "./useTaskColumn";

interface UseTaskActionsReturn {
  readonly showDeleteConfirm: boolean;
  readonly showEditDialog: boolean;
  readonly setShowDeleteConfirm: (show: boolean) => void;
  readonly setShowEditDialog: (show: boolean) => void;
  readonly handleEdit: () => void;
  readonly handleDelete: () => void;
  readonly handleDuplicate: () => void;
  readonly handleMoveToBoard: (targetBoardId: string) => void;
  readonly handleConfirmDelete: () => void;
  readonly handleSaveEdit: (updatedTask: Task, targetColumnId?: string) => void;
  readonly handleDeleteFromDialog: (taskId: string) => void;
  readonly handleAddSubTask: (title: string) => void;
  readonly handleToggleSubTask: (subTaskId: string) => void;
  readonly handleEditSubTask: (subTaskId: string, newTitle: string) => void;
  readonly handleDeleteSubTask: (subTaskId: string) => void;
  readonly handleReorderSubTasks: (oldIndex: number, newIndex: number) => void;
}

/**
 * タスクアクション（編集・削除）を管理するカスタムフック
 */
export const useTaskActions = (
  task: Task | null,
  onClose?: () => void,
): UseTaskActionsReturn => {
  const {
    deleteTask,
    updateTask,
    moveTask,
    duplicateTask,
    addSubTask,
    toggleSubTask,
    updateSubTask,
    deleteSubTask,
    reorderSubTasks,
    state,
  } = useKanban();
  const { moveTaskToBoard, currentBoard } = useBoard();
  const { column } = useTaskColumn(task);

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);

  const handleEdit = useCallback(() => {
    setShowEditDialog(true);
  }, []);

  const handleDelete = useCallback(() => {
    setShowDeleteConfirm(true);
  }, []);

  const handleDuplicate = useCallback(() => {
    if (!task) {
      return;
    }
    duplicateTask(task.id);
  }, [task, duplicateTask]);

  const handleConfirmDelete = useCallback(() => {
    if (!task || !column) {
      return;
    }

    deleteTask(task.id, column.id);
    onClose?.();
    setShowDeleteConfirm(false);
  }, [task, column, deleteTask, onClose]);

  const handleSaveEdit = useCallback(
    (updatedTask: Task, targetColumnId?: string) => {
      updateTask(updatedTask.id, updatedTask);

      // カラム移動が必要な場合
      if (targetColumnId && column && targetColumnId !== column.id) {
        const targetColumn = state.currentBoard?.columns.find(
          (col) => col.id === targetColumnId,
        );
        if (targetColumn) {
          moveTask(
            updatedTask.id,
            column.id,
            targetColumnId,
            targetColumn.tasks.length,
          );
        }
      }

      setShowEditDialog(false);
    },
    [updateTask, moveTask, column, state.currentBoard],
  );

  const handleDeleteEdit = useCallback(
    (taskId: string) => {
      if (!task || !column) {
        return;
      }

      deleteTask(taskId, column.id);
      onClose?.();
      setShowEditDialog(false);
    },
    [task, column, deleteTask, onClose],
  );

  const handleAddSubTask = useCallback(
    (title: string) => {
      if (!task) {
        return;
      }
      addSubTask(task.id, title);
    },
    [task, addSubTask],
  );

  const handleToggleSubTask = useCallback(
    (subTaskId: string) => {
      if (!task) {
        return;
      }
      toggleSubTask(task.id, subTaskId);
    },
    [task, toggleSubTask],
  );

  const handleEditSubTask = useCallback(
    (subTaskId: string, newTitle: string) => {
      if (!task) {
        return;
      }
      updateSubTask(task.id, subTaskId, newTitle);
    },
    [task, updateSubTask],
  );

  const handleDeleteSubTask = useCallback(
    (subTaskId: string) => {
      if (!task) {
        return;
      }
      deleteSubTask(task.id, subTaskId);
    },
    [task, deleteSubTask],
  );

  const handleReorderSubTasks = useCallback(
    (oldIndex: number, newIndex: number) => {
      if (!task) {
        return;
      }
      reorderSubTasks(task.id, oldIndex, newIndex);
    },
    [task, reorderSubTasks],
  );

  const handleMoveToBoard = useCallback(
    (targetBoardId: string) => {
      if (!task || !column || !currentBoard) {
        return;
      }

      moveTaskToBoard(task.id, currentBoard.id, column.id, targetBoardId);

      // タスク詳細サイドバーを閉じる
      onClose?.();
    },
    [task, column, currentBoard, moveTaskToBoard, onClose],
  );

  return {
    showDeleteConfirm,
    showEditDialog,
    setShowDeleteConfirm,
    setShowEditDialog,
    handleEdit,
    handleDelete,
    handleDuplicate,
    handleMoveToBoard,
    handleConfirmDelete,
    handleSaveEdit,
    handleDeleteFromDialog: handleDeleteEdit,
    handleAddSubTask,
    handleToggleSubTask,
    handleEditSubTask,
    handleDeleteSubTask,
    handleReorderSubTasks,
  };
};
