import React, { useState, useMemo, useCallback } from 'react';
import { Box, Text, Button, IconButton } from '@primer/react';
import { ChevronLeftIcon, ChevronRightIcon } from '@primer/octicons-react';

import { useKanban } from '../contexts/KanbanContext';
import type { Task } from '../types';

import TaskDetailSidebar from './TaskDetailSidebar';

interface CalendarDayProps {
  date: Date;
  tasks: Task[];
  isToday: boolean;
  isCurrentMonth: boolean;
  onTaskClick: (task: Task) => void;
}

const CalendarDay: React.FC<CalendarDayProps> = React.memo(({ 
  date, 
  tasks, 
  isToday, 
  isCurrentMonth, 
  onTaskClick 
}) => {
  const dayStyles = {
    minHeight: '120px',
    border: '1px solid',
    borderColor: isToday ? 'accent.emphasis' : 'border.default',
    backgroundColor: isCurrentMonth ? 'canvas.default' : 'canvas.subtle',
    borderRadius: '6px',
    padding: '8px',
    position: 'relative' as const,
    overflow: 'hidden',
  };

  const headerStyles = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    mb: 1,
  };

  const dayNumberStyles = {
    fontSize: isToday ? '14px' : '12px',
    fontWeight: isToday ? 'bold' : 'normal',
    color: isCurrentMonth ? 'fg.default' : 'fg.muted',
  };

  const tasksContainerStyles = {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '2px',
    maxHeight: '80px',
    overflow: 'hidden',
  };

  const taskItemStyles = {
    fontSize: '10px',
    padding: '2px 4px',
    borderRadius: '2px',
    backgroundColor: 'accent.subtle',
    color: 'accent.fg',
    cursor: 'pointer',
    whiteSpace: 'nowrap' as const,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    '&:hover': {
      backgroundColor: 'accent.muted',
    },
  };

  return (
    <Box sx={dayStyles}>
      <Box sx={headerStyles}>
        <Text sx={dayNumberStyles}>{date.getDate()}</Text>
        {tasks.length > 3 && (
          <Text fontSize="10px" color="fg.muted">
            +{tasks.length - 3}
          </Text>
        )}
      </Box>
      <Box sx={tasksContainerStyles}>
        {tasks.slice(0, 3).map((task) => (
          <Box 
            key={task.id} 
            sx={taskItemStyles}
            onClick={(e: React.MouseEvent) => {
              e.stopPropagation();
              onTaskClick(task);
            }}
            title={task.title}
          >
            {task.title}
          </Box>
        ))}
      </Box>
    </Box>
  );
});

CalendarDay.displayName = 'CalendarDay';

const CalendarView: React.FC = () => {
  const { state } = useKanban();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isTaskDetailOpen, setIsTaskDetailOpen] = useState(false);

  const { year, month } = useMemo(() => ({
    year: currentDate.getFullYear(),
    month: currentDate.getMonth(),
  }), [currentDate]);

  const firstDayOfMonth = useMemo(() => new Date(year, month, 1), [year, month]);
  const lastDayOfMonth = useMemo(() => new Date(year, month + 1, 0), [year, month]);
  const firstDayOfWeek = useMemo(() => firstDayOfMonth.getDay(), [firstDayOfMonth]);
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
    if (!state.currentBoard) {return new Map();}

    const taskMap = new Map<string, Task[]>();

    state.currentBoard.columns.forEach(column => {
      column.tasks.forEach(task => {
        if (task.dueDate) {
          const dateKey = new Date(task.dueDate).toDateString();
          const existingTasks = taskMap.get(dateKey) || [];
          taskMap.set(dateKey, [...existingTasks, task]);
        }
      });
    });

    return taskMap;
  }, [state.currentBoard]);

  const navigateMonth = useCallback((direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + (direction === 'next' ? 1 : -1));
      return newDate;
    });
  }, []);

  const handleTaskClick = useCallback((task: Task) => {
    setSelectedTask(task);
    setIsTaskDetailOpen(true);
  }, []);

  const handleCloseTaskDetail = useCallback(() => {
    setIsTaskDetailOpen(false);
    setSelectedTask(null);
  }, []);

  const monthNames = [
    '1月', '2月', '3月', '4月', '5月', '6月',
    '7月', '8月', '9月', '10月', '11月', '12月'
  ];

  const weekDays = ['日', '月', '火', '水', '木', '金', '土'];

  const containerStyles = {
    padding: '16px',
    height: '100%',
    display: 'flex',
    flexDirection: 'column' as const,
  };

  const headerStyles = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    mb: 3,
  };

  const titleStyles = {
    fontSize: '24px',
    fontWeight: 'bold',
  };

  const navigationStyles = {
    display: 'flex',
    alignItems: 'center',
    gap: 2,
  };

  const calendarGridStyles = {
    display: 'grid',
    gridTemplateColumns: 'repeat(7, 1fr)',
    gap: '1px',
    backgroundColor: 'border.default',
    border: '1px solid',
    borderColor: 'border.default',
    borderRadius: '6px',
    overflow: 'hidden',
    flex: 1,
  };

  const weekHeaderStyles = {
    display: 'grid',
    gridTemplateColumns: 'repeat(7, 1fr)',
    gap: '1px',
    backgroundColor: 'border.default',
    border: '1px solid',
    borderColor: 'border.default',
    borderRadius: '6px 6px 0 0',
    mb: 0,
  };

  const weekDayStyles = {
    padding: '8px',
    backgroundColor: 'canvas.subtle',
    textAlign: 'center' as const,
    fontWeight: 'bold',
    fontSize: '12px',
    color: 'fg.muted',
  };

  if (!state.currentBoard) {
    return (
      <Box sx={containerStyles}>
        <Text>ボードが選択されていません</Text>
      </Box>
    );
  }

  return (
    <Box sx={containerStyles}>
      <Box sx={headerStyles}>
        <Text sx={titleStyles}>
          {year}年 {monthNames[month]}
        </Text>
        <Box sx={navigationStyles}>
          <IconButton
            icon={ChevronLeftIcon}
            aria-label="前の月"
            onClick={() => navigateMonth('prev')}
            size="small"
          />
          <Button
            size="small"
            onClick={() => setCurrentDate(new Date())}
          >
            今日
          </Button>
          <IconButton
            icon={ChevronRightIcon}
            aria-label="次の月"
            onClick={() => navigateMonth('next')}
            size="small"
          />
        </Box>
      </Box>

      <Box sx={weekHeaderStyles}>
        {weekDays.map((day) => (
          <Box key={day} sx={weekDayStyles}>
            {day}
          </Box>
        ))}
      </Box>

      <Box sx={calendarGridStyles}>
        {calendarDays.map(({ date, isCurrentMonth, isToday }, index) => {
          const dateKey = date.toDateString();
          const tasksForDate = tasksGroupedByDate.get(dateKey) || [];

          return (
            <CalendarDay
              key={index}
              date={date}
              tasks={tasksForDate}
              isToday={isToday}
              isCurrentMonth={isCurrentMonth}
              onTaskClick={handleTaskClick}
            />
          );
        })}
      </Box>

      <TaskDetailSidebar
        task={selectedTask}
        isOpen={isTaskDetailOpen}
        onClose={handleCloseTaskDetail}
      />
    </Box>
  );
};

export default CalendarView;