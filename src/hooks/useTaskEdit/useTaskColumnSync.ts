/**
 * Task column synchronization hook
 *
 * This hook manages column synchronization and automatic
 * completedAt updates based on task status changes.
 */

import { useEffect, useMemo } from 'react';
import type { Task } from '../../types';
import { useKanban } from '../../contexts/KanbanContext';
import { toDateTimeLocalString } from '../../utils/dateHelpers';
import type { UseTaskFormStateReturn } from './useTaskFormState';

export interface UseTaskColumnSyncProps {
  task: Task | null;
  isOpen: boolean;
  formState: UseTaskFormStateReturn;
}

export interface UseTaskColumnSyncReturn {
  isCompleted: boolean;
  statusOptions: Array<{ value: string; label: string }>;
}

export const useTaskColumnSync = ({
  task,
  isOpen: _isOpen, // eslint-disable-line @typescript-eslint/no-unused-vars
  formState,
}: UseTaskColumnSyncProps): UseTaskColumnSyncReturn => {
  const { state } = useKanban();

  // ステータス変更時の完了日時の自動更新
  useEffect(() => {
    if (state.currentBoard?.columns && formState.columnId) {
      const targetColumn = state.currentBoard.columns.find(
        col => col.id === formState.columnId
      );
      const isLastColumn =
        targetColumn &&
        state.currentBoard.columns.indexOf(targetColumn) ===
          state.currentBoard.columns.length - 1;

      // 関数型更新を使って現在の値を取得し、必要な場合のみ更新
      formState.setCompletedAt((currentCompletedAt: string) => {
        // 完了カラムに移動した場合で、現在完了日時が空の場合
        if (isLastColumn && !currentCompletedAt) {
          const now = new Date();
          now.setHours(23, 59, 59, 999);
          return toDateTimeLocalString(now);
        }
        // 完了カラム以外に移動した場合で、完了日時が設定されている場合
        else if (!isLastColumn && currentCompletedAt) {
          return '';
        }
        // 変更が不要な場合は現在の値をそのまま返す
        return currentCompletedAt;
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formState.columnId, state.currentBoard?.columns?.length]);

  // 期限が削除された場合、繰り返し設定を無効化
  useEffect(() => {
    if (!formState.dueDate) {
      formState.setRecurrence(
        (
          currentRecurrence: import('../../types').RecurrenceConfig | undefined
        ) => {
          if (currentRecurrence && currentRecurrence.enabled) {
            return {
              ...currentRecurrence,
              enabled: false,
            };
          }
          return currentRecurrence;
        }
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formState.dueDate, formState.setRecurrence]); // formState is intentionally omitted to prevent infinite loops

  // 時刻設定がオフになった場合、時刻をクリア
  useEffect(() => {
    if (!formState.hasTime) {
      formState.setDueTime('');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formState.hasTime, formState.setDueTime]); // formState is intentionally omitted to prevent infinite loops

  // タスクが完了状態（一番右のカラム）にあるかどうかを判定
  const isCompleted = useMemo(() => {
    if (!task || !state.currentBoard?.columns.length) {
      return false;
    }

    const rightmostColumn =
      state.currentBoard.columns[state.currentBoard.columns.length - 1];
    if (!rightmostColumn) {
      return false;
    }

    return rightmostColumn.tasks.some(t => t.id === task.id);
  }, [task, state.currentBoard]);

  // ステータス選択肢を生成（ゴミ箱に入っているカラムを除外）
  const statusOptions = useMemo(() => {
    if (!state.currentBoard?.columns.length) {
      return [];
    }

    return state.currentBoard.columns
      .filter(column => column.deletionState !== 'deleted')
      .map(column => ({
        value: column.id,
        label: column.title,
      }));
  }, [state.currentBoard, formState.columnId]);

  return {
    isCompleted,
    statusOptions,
  };
};
