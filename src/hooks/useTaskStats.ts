import { useMemo } from "react";

import type { Task } from "../types";
import { getDateStatus } from "../utils/dateHelpers";

export interface TaskStats {
  totalTasks: number;
  overdueTasks: number;
  dueTodayTasks: number;
  dueTomorrowTasks: number;
  hasUrgentTasks: boolean;
}

export const useTaskStats = (tasks: Task[]): TaskStats =>
  useMemo(() => {
    const initialStats = {
      totalTasks: 0,
      overdueTasks: 0,
      dueTodayTasks: 0,
      dueTomorrowTasks: 0,
      hasUrgentTasks: false,
    };

    return tasks.reduce((acc, task) => {
      acc.totalTasks++;

      if (!task.dueDate) {
        return acc;
      }

      try {
        const dueDate = new Date(task.dueDate);
        const { isOverdue, isDueToday, isDueTomorrow } = getDateStatus(dueDate);

        if (isOverdue) {
          acc.overdueTasks++;
          acc.hasUrgentTasks = true;
        } else if (isDueToday) {
          acc.dueTodayTasks++;
          acc.hasUrgentTasks = true;
        } else if (isDueTomorrow) {
          acc.dueTomorrowTasks++;
          acc.hasUrgentTasks = true;
        }
      } catch {
        // 無効な日付の場合は無視
      }

      return acc;
    }, initialStats);
  }, [tasks]);
