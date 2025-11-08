import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import { RotateCcw } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import type { Task } from '../../../types';
import {
  isVirtualTask,
  type VirtualRecurringTask,
} from '../../../utils/calendarRecurrence';

interface CalendarTaskProps {
  task: Task | VirtualRecurringTask;
  onTaskClick: (task: Task | VirtualRecurringTask) => void;
}

const CalendarTask: React.FC<CalendarTaskProps> = React.memo(
  ({ task, onTaskClick }) => {
    const { t } = useTranslation();
    const isVirtual = isVirtualTask(task);
    const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
      id: task.id,
      data: {
        type: 'calendar-task',
        task,
      },
      disabled: isVirtual, // 仮想タスクはドラッグ無効
    });

    // Dynamic className generation for task item
    const taskItemClassName = `
      text-[13px] px-2 py-0.5 rounded-md whitespace-nowrap overflow-hidden text-ellipsis transition-opacity duration-200
      ${
        isVirtual
          ? 'bg-gray-200 text-zinc-500 border border-border border-dashed border-gray-300 opacity-70 cursor-pointer'
          : 'bg-blue-100 text-primary border-none cursor-grab'
      }
      ${isDragging && !isVirtual ? 'opacity-50 cursor-grabbing' : ''}
    `
      .trim()
      .replace(/\s+/g, ' ');

    return (
      <div
        ref={setNodeRef}
        className={taskItemClassName}
        // 仮想タスクの場合はドラッグ関連の属性を無効化
        // eslint-disable-next-line react/jsx-props-no-spreading
        {...(isVirtual ? {} : listeners)}
        // eslint-disable-next-line react/jsx-props-no-spreading
        {...(isVirtual ? {} : attributes)}
        onClick={(e: React.MouseEvent) => {
          e.stopPropagation();
          onTaskClick(task);
        }}
        title={`${task.title}${isVirtual ? ` ${t('recurrence.virtualTaskLabel')}` : ''}`}
        role='button'
        tabIndex={0}
        onKeyDown={e => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onTaskClick(task);
          }
        }}
      >
        <div className='flex items-center gap-1'>
          {task.recurrence?.enabled && <RotateCcw size={10} />}
          <span className='flex-1 min-w-0'>{task.title}</span>
        </div>
      </div>
    );
  }
);

CalendarTask.displayName = 'CalendarTask';

export default CalendarTask;
