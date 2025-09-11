import { useMemo } from 'react';
import type { Task } from '../types';
import { getDateStatus } from '../utils/dateHelpers';

export interface TaskStats {
  totalTasks: number;
  overdueTasks: number;
  dueTodayTasks: number;
  dueTomorrowTasks: number;
  hasUrgentTasks: boolean;
}

export const useTaskStats = (tasks: Task[]): TaskStats => {
  return useMemo(() => {
    const stats = tasks.reduce(
      (acc, task) => {
        acc.totalTasks++;
        
        if (task.dueDate) {
          const { isOverdue, isDueToday, isDueTomorrow } = getDateStatus(new Date(task.dueDate));
          
          if (isOverdue) {
            acc.overdueTasks++;
          } else if (isDueToday) {
            acc.dueTodayTasks++;
          } else if (isDueTomorrow) {
            acc.dueTomorrowTasks++;
          }
        }
        
        return acc;
      },
      {
        totalTasks: 0,
        overdueTasks: 0,
        dueTodayTasks: 0,
        dueTomorrowTasks: 0,
        hasUrgentTasks: false,
      }
    );

    stats.hasUrgentTasks = stats.overdueTasks > 0 || stats.dueTodayTasks > 0;

    return stats;
  }, [tasks]);
};