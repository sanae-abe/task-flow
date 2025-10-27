import { useState, useCallback } from "react";
import { useBoard } from "../contexts/BoardContext";
import {
  restoreTaskFromRecycleBin,
  emptyRecycleBin,
  permanentlyDeleteTask,
} from "../utils/recycleBin";
import { logger } from "../utils/logger";

export interface MessageCallback {
  (message: { type: 'success' | 'critical' | 'warning' | 'danger' | 'default' | 'info' | 'upsell'; text: string }): void;
}

export interface UseRecycleBinOperationsResult {
  /** 復元中のタスクID */
  restoringTaskId: string | null;
  /** 削除中のタスクID */
  deletingTaskId: string | null;
  /** ゴミ箱を空にしている最中かどうか */
  isEmptying: boolean;
  /** タスクを復元する */
  restoreTask: (taskId: string, taskTitle?: string) => Promise<void>;
  /** タスクを完全削除する */
  permanentlyDeleteTask: (taskId: string, taskTitle?: string) => Promise<void>;
  /** ゴミ箱を空にする */
  emptyRecycleBin: () => Promise<void>;
}

/**
 * ゴミ箱の操作ロジックを管理するカスタムフック
 * 復元・削除・空にする等の操作を統一的に管理
 */
export const useRecycleBinOperations = (onMessage?: MessageCallback): UseRecycleBinOperationsResult => {
  const { state, importBoards } = useBoard();
  const [restoringTaskId, setRestoringTaskId] = useState<string | null>(null);
  const [deletingTaskId, setDeletingTaskId] = useState<string | null>(null);
  const [isEmptying, setIsEmptying] = useState(false);

  const restoreTask = useCallback(async (taskId: string, taskTitle?: string) => {
    setRestoringTaskId(taskId);
    try {
      const updatedBoards = restoreTaskFromRecycleBin(state.boards, taskId);
      if (updatedBoards) {
        const message = taskTitle
          ? `タスク「${taskTitle}」を復元しました`
          : "タスクを復元しました";
        importBoards(updatedBoards, true);
        onMessage?.({ type: 'success', text: message });
      }
    } catch (_error) {
      logger._error("復元エラー:", _error);
      onMessage?.({ type: 'danger', text: '復元に失敗しました' });
      throw _error;
    } finally {
      setRestoringTaskId(null);
    }
  }, [state.boards, importBoards, onMessage]);

  const permanentlyDeleteTaskOperation = useCallback(async (taskId: string, taskTitle?: string) => {
    setDeletingTaskId(taskId);
    try {
      const { updatedBoards, success } = permanentlyDeleteTask(state.boards, taskId);
      if (success) {
        const message = taskTitle
          ? `タスク「${taskTitle}」を完全に削除しました`
          : "タスクを完全に削除しました";
        importBoards(updatedBoards, true);
        onMessage?.({ type: 'success', text: message });
      }
    } catch (_error) {
      logger._error("完全削除エラー:", _error);
      onMessage?.({ type: 'danger', text: '完全削除に失敗しました' });
      throw _error;
    } finally {
      setDeletingTaskId(null);
    }
  }, [state.boards, importBoards, onMessage]);

  const emptyRecycleBinOperation = useCallback(async () => {
    setIsEmptying(true);
    try {
      const { updatedBoards, deletedCount } = emptyRecycleBin(state.boards);
      importBoards(updatedBoards, true);
      onMessage?.({ type: 'success', text: `${deletedCount}件のタスクを完全削除しました` });
      logger.info(`${deletedCount}件のタスクを完全削除しました`);
    } catch (_error) {
      logger._error("ゴミ箱を空にする際のエラー:", _error);
      onMessage?.({ type: 'danger', text: 'ゴミ箱を空にする際にエラーが発生しました' });
      throw _error;
    } finally {
      setIsEmptying(false);
    }
  }, [state.boards, importBoards, onMessage]);

  return {
    restoringTaskId,
    deletingTaskId,
    isEmptying,
    restoreTask,
    permanentlyDeleteTask: permanentlyDeleteTaskOperation,
    emptyRecycleBin: emptyRecycleBinOperation,
  };
};