import { useMemo } from 'react';

import type { Task, KanbanBoard } from '../types';

interface UseTaskFinderReturn {
  findTaskById: (taskId: string) => Task | null;
  findTaskColumnId: (taskId: string) => string | null;
  findTaskWithColumn: (
    taskId: string
  ) => { task: Task; columnId: string } | null;
}

export const useTaskFinder = (board: KanbanBoard | null): UseTaskFinderReturn =>
  useMemo(() => {
    const findTaskWithColumn = (
      taskId: string
    ): { task: Task; columnId: string } | null => {
      if (!board) {
        return null;
      }

      for (const column of board.columns) {
        const task = column.tasks.find(task => task.id === taskId);
        if (task) {
          return { task, columnId: column.id };
        }
      }
      return null;
    };

    const findTaskById = (taskId: string): Task | null => {
      const result = findTaskWithColumn(taskId);
      return result?.task ?? null;
    };

    const findTaskColumnId = (taskId: string): string | null => {
      const result = findTaskWithColumn(taskId);
      return result?.columnId ?? null;
    };

    return {
      findTaskById,
      findTaskColumnId,
      findTaskWithColumn,
    };
  }, [board]);
