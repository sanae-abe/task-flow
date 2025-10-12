import { useCallback } from "react";
import type { Task } from "../../../types";
import {
  isVirtualTask,
  type VirtualRecurringTask,
} from "../../../utils/calendarRecurrence";

interface UseCalendarHandlersParams {
  openTaskDetail: (taskId: string) => void;
  openTaskForm: (defaultDate?: Date) => void;
  updateTask: (taskId: string, updates: Partial<Task>) => void;
}

interface UseCalendarHandlersReturn {
  handleTaskDateChange: (taskId: string, newDate: Date) => void;
  handleTaskClick: (task: Task | VirtualRecurringTask) => void;
  handleDateClick: (date: Date) => void;
}

export const useCalendarHandlers = ({
  openTaskDetail,
  openTaskForm,
  updateTask,
}: UseCalendarHandlersParams): UseCalendarHandlersReturn => {
  const handleTaskDateChange = useCallback(
    (taskId: string, newDate: Date) => {
      // 仮想タスクの場合はドラッグ不可のため、この関数は実際のタスクのみ処理
      const localDateString = new Date(
        newDate.getFullYear(),
        newDate.getMonth(),
        newDate.getDate(),
      ).toISOString();
      updateTask(taskId, { dueDate: localDateString });
    },
    [updateTask],
  );

  const handleTaskClick = useCallback(
    (task: Task | VirtualRecurringTask) => {
      if (isVirtualTask(task)) {
        // 仮想タスクの場合は元のタスクのIDを使用
        openTaskDetail(task.originalTaskId);
      } else {
        openTaskDetail(task.id);
      }
    },
    [openTaskDetail],
  );

  const handleDateClick = useCallback(
    (date: Date) => {
      // タスクのクリックと干渉しないように、日付セルの余白部分がクリックされた場合のみ処理
      openTaskForm(date);
    },
    [openTaskForm],
  );

  return {
    handleTaskDateChange,
    handleTaskClick,
    handleDateClick,
  };
};
