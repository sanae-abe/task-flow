/**
 * Task initialization hook
 *
 * This hook manages task data initialization including
 * form state reset when dialog opens/closes and task data population.
 */

import { useEffect, useRef } from 'react';
import type { Task } from '../../types';
import { toDateTimeLocalString } from '../../utils/dateHelpers';
import type { UseTaskFormStateReturn } from './useTaskFormState';

export interface UseTaskInitializationProps {
  task: Task | null;
  isOpen: boolean;
  formState: UseTaskFormStateReturn;
}

export interface UseTaskInitializationReturn {
  // No additional return values needed - all operations are side effects
}

export const useTaskInitialization = ({
  task,
  isOpen,
  formState,
}: UseTaskInitializationProps): UseTaskInitializationReturn => {
  // 前の値を追跡するためのref
  const prevIsOpenRef = useRef(isOpen);
  const prevTaskIdRef = useRef(task?.id);

  useEffect(() => {
    const prevIsOpen = prevIsOpenRef.current;
    const prevTaskId = prevTaskIdRef.current;

    // 値が変更された場合のみ実行
    const isOpenChanged = prevIsOpen !== isOpen;
    const taskChanged = prevTaskId !== task?.id;

    if (isOpenChanged || taskChanged) {
      if (isOpen && task) {
        // タスクデータの初期化
        formState.setTitle(task.title);
        formState.setDescription(task.description ?? "");

        // 期限の処理
        if (task.dueDate) {
          const dueDate = new Date(task.dueDate);
          const dateStr = dueDate.toISOString().split("T")[0]; // YYYY-MM-DD形式
          formState.setDueDate(dateStr || "");

          // 時刻チェック（23:59:59以外の場合は時刻を設定）
          const is23_59_59 =
            dueDate.getHours() === 23 &&
            dueDate.getMinutes() === 59 &&
            dueDate.getSeconds() === 59;
          if (!is23_59_59) {
            formState.setHasTime(true);
            const timeStr = `${String(dueDate.getHours()).padStart(2, "0")}:${String(dueDate.getMinutes()).padStart(2, "0")}`;
            formState.setDueTime(timeStr);
          } else {
            formState.setHasTime(false);
            formState.setDueTime("");
          }
        } else {
          formState.setDueDate("");
          formState.setDueTime("");
          formState.setHasTime(false);
        }

        // completedAtをdatetime-local形式（YYYY-MM-DDTHH:mm）にフォーマット
        const completedAtValue = task.completedAt
          ? toDateTimeLocalString(new Date(task.completedAt))
          : "";
        formState.setCompletedAt(completedAtValue);

        formState.setAttachments(task.files ?? []);

        // 繰り返し設定の初期化
        formState.setRecurrence(task.recurrence);

        // 優先度の初期化
        formState.setPriority(task.priority);

        // ラベルの初期化
        formState.setLabels(task.labels ?? []);
      } else if (!isOpen && prevIsOpen) {
        // ダイアログが閉じられた時にフォームをリセット（前回開いていた場合のみ）
        formState.resetFormState();
      }
    }

    // refを更新
    prevIsOpenRef.current = isOpen;
    prevTaskIdRef.current = task?.id;
  }, [isOpen, task, formState]);

  return {};
};