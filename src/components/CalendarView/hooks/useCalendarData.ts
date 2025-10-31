import { useMemo } from 'react';
import type { Task, Column } from '../../../types';
import { sortTasks } from '../../../utils/taskSort';
import { filterTasks } from '../../../utils/taskFilter';
import {
  generateCalendarTasks,
  getCalendarDateRange,
  type VirtualRecurringTask,
} from '../../../utils/calendarRecurrence';

interface KanbanState {
  boards: import('../../../types').KanbanBoard[];
  currentBoard: import('../../../types').KanbanBoard | null;
  labels: import('../../../types').Label[];
  isLoading: boolean;
  viewMode: import('../../../types').ViewMode;
  taskFilter: import('../../../types').TaskFilter;
  sortOption: import('../../../types').SortOption;
  isTaskDetailOpen: boolean;
  selectedTaskId: string | null;
  isTaskFormOpen: boolean;
  taskFormDefaultDate: Date | null;
  taskFormDefaultStatus?: string;
}

interface UseCalendarDataParams {
  currentDate: Date;
  state: KanbanState;
}

interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
}

interface UseCalendarDataReturn {
  year: number;
  month: number;
  calendarDays: CalendarDay[];
  tasksGroupedByDate: Map<string, (Task | VirtualRecurringTask)[]>;
  monthNames: string[];
  weekDays: string[];
}

export const useCalendarData = ({
  currentDate,
  state,
}: UseCalendarDataParams): UseCalendarDataReturn => {
  const { year, month } = useMemo(
    () => ({
      year: currentDate.getFullYear(),
      month: currentDate.getMonth(),
    }),
    [currentDate]
  );

  const firstDayOfMonth = useMemo(
    () => new Date(year, month, 1),
    [year, month]
  );
  const lastDayOfMonth = useMemo(
    () => new Date(year, month + 1, 0),
    [year, month]
  );
  const firstDayOfWeek = useMemo(
    () => firstDayOfMonth.getDay(),
    [firstDayOfMonth]
  );
  const daysInMonth = useMemo(() => lastDayOfMonth.getDate(), [lastDayOfMonth]);

  const calendarDays = useMemo(() => {
    const days = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // 前月の末尾の日付
    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
      const date = new Date(year, month, -i);
      days.push({ date, isCurrentMonth: false });
    }

    // 当月の日付
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      days.push({ date, isCurrentMonth: true });
    }

    // 次月の最初の日付（42日になるまで）
    const remainingDays = 42 - days.length;
    for (let day = 1; day <= remainingDays; day++) {
      const date = new Date(year, month + 1, day);
      days.push({ date, isCurrentMonth: false });
    }

    return days.map(({ date, isCurrentMonth }) => ({
      date,
      isCurrentMonth,
      isToday: date.getTime() === today.getTime(),
    }));
  }, [year, month, firstDayOfWeek, daysInMonth]);

  const tasksGroupedByDate = useMemo(() => {
    if (!state.currentBoard) {
      return new Map();
    }

    const taskMap = new Map<string, (Task | VirtualRecurringTask)[]>();

    // 全カラムからタスクを収集
    const allTasks: Task[] = [];
    state.currentBoard.columns.forEach((column: Column) => {
      allTasks.push(...column.tasks);
    });

    const filteredTasks = filterTasks(allTasks, state.taskFilter);
    const sortedTasks = sortTasks(filteredTasks, state.sortOption);

    // カレンダー表示範囲を取得
    const { startDate, endDate } = getCalendarDateRange(currentDate);

    // 実際のタスクと仮想繰り返しタスクを生成
    const calendarTasks = generateCalendarTasks(
      sortedTasks,
      startDate,
      endDate
    );

    // タスクを日付ごとにグループ化
    calendarTasks.forEach(task => {
      if (task.dueDate) {
        const dateKey = new Date(task.dueDate).toDateString();
        const existingTasks = taskMap.get(dateKey) || [];
        taskMap.set(dateKey, [...existingTasks, task]);
      }
    });

    return taskMap;
  }, [state.currentBoard, state.taskFilter, state.sortOption, currentDate]);

  const monthNames = useMemo(
    () => [
      '1月',
      '2月',
      '3月',
      '4月',
      '5月',
      '6月',
      '7月',
      '8月',
      '9月',
      '10月',
      '11月',
      '12月',
    ],
    []
  );

  const weekDays = useMemo(
    () => ['日', '月', '火', '水', '木', '金', '土'],
    []
  );

  return {
    year,
    month,
    calendarDays,
    tasksGroupedByDate,
    monthNames,
    weekDays,
  };
};
