import React, { useCallback } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { useTranslation } from 'react-i18next';

import type { Task } from '../../../types';
import type { VirtualRecurringTask } from '../../../utils/calendarRecurrence';
import CalendarTask from './CalendarTask';

interface CalendarDayProps {
  date: Date;
  tasks: (Task | VirtualRecurringTask)[];
  isToday: boolean;
  isCurrentMonth: boolean;
  onTaskClick: (task: Task | VirtualRecurringTask) => void;
  onDateClick: (date: Date) => void;
}

const CalendarDay: React.FC<CalendarDayProps> = React.memo(
  ({ date, tasks, isToday, isCurrentMonth, onTaskClick, onDateClick }) => {
    const { t } = useTranslation();
    const { setNodeRef, isOver } = useDroppable({
      id: `calendar-day-${date.toISOString()}`,
      data: {
        type: 'calendar-date',
        date,
      },
    });

    // Dynamic className generation for day container
    const dayClassName = `
      min-h-[120px] rounded-none p-2 relative overflow-hidden transition-colors duration-200 ease
      ${isCurrentMonth ? 'bg-background' : 'bg-gray-100'}
      ${
        isOver
          ? 'border border-border border-dashed border-primary'
          : 'border border-border border-transparent'
      }
    `
      .trim()
      .replace(/\s+/g, ' ');

    // Dynamic className generation for day number
    const dayNumberClassName = `
      text-xs font-normal
      ${
        isToday
          ? 'text-white bg-primary rounded-full w-6 h-6 flex items-center justify-center'
          : isCurrentMonth
            ? 'text-foreground'
            : 'text-zinc-700'
      }
    `
      .trim()
      .replace(/\s+/g, ' ');

    const handleTaskClick = useCallback(
      (task: Task | VirtualRecurringTask) => {
        onTaskClick(task);
      },
      [onTaskClick]
    );

    const handleDateClick = useCallback(
      (e: React.MouseEvent) => {
        // タスクのクリックイベントではない場合のみ日付クリックを処理
        if (e.target === e.currentTarget) {
          onDateClick(date);
        }
      },
      [onDateClick, date]
    );

    return (
      <div ref={setNodeRef} className={dayClassName} onClick={handleDateClick}>
        <div className='flex justify-between items-center min-h-6 mb-2'>
          <span className={dayNumberClassName}>{date.getDate()}</span>
          {tasks.length > 3 && (
            <span className='text-xs text-zinc-700'>
              {t('calendar.moreTasksCount', { count: tasks.length - 3 })}
            </span>
          )}
        </div>
        <div className='flex flex-col gap-0.5 max-h-20 overflow-hidden'>
          {tasks.slice(0, 3).map(task => (
            <CalendarTask
              key={task.id}
              task={task}
              onTaskClick={handleTaskClick}
            />
          ))}
        </div>
      </div>
    );
  }
);

CalendarDay.displayName = 'CalendarDay';

export default CalendarDay;
