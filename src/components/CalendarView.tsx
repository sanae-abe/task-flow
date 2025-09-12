import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { Text, Button, IconButton } from '@primer/react';
import { ChevronLeftIcon, ChevronRightIcon } from '@primer/octicons-react';

import { useKanban } from '../contexts/KanbanContext';
import type { Task } from '../types';
import { sortTasks } from '../utils/taskSort';
import { filterTasks } from '../utils/taskFilter';

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
  const dayStyles = useMemo(() => ({
    minHeight: '120px',
    backgroundColor: isCurrentMonth ? 'var(--bgColor-default)' : 'var(--bgColor-muted)',
    borderRadius: 0,
    padding: '8px',
    position: 'relative' as const,
    overflow: 'hidden',
  }), [isCurrentMonth]);

  const headerStyles = useMemo(() => ({
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    minHeight: '24px',
    marginBottom: '8px',
  }), []);

  const dayNumberStyles = useMemo(() => ({
    fontSize: '12px',
    fontWeight: '400',
    color: isToday ? 'white' : (isCurrentMonth ? 'var(--fg-default)' : 'var(--fg-muted)'),
    ...(isToday && {
      backgroundColor: 'var(--bgColor-accent-emphasis)',
      borderRadius: '50%',
      width: '24px',
      height: '24px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }),
  }), [isToday, isCurrentMonth]);

  const tasksContainerStyles = useMemo(() => ({
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '2px',
    maxHeight: '80px',
    overflow: 'hidden',
  }), []);

  const taskItemStyles = useMemo(() => ({
    fontSize: '13px',
    padding: '2px 8px',
    borderRadius: '6px',
    backgroundColor: 'var(--bgColor-accent-muted)',
    color: 'var(--fgColor-accent)',
    cursor: 'pointer',
    whiteSpace: 'nowrap' as const,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  }), []);

  const handleTaskClick = useCallback((task: Task) => {
    onTaskClick(task);
  }, [onTaskClick]);

  return (
    <div style={dayStyles}>
      <div style={headerStyles}>
        <span style={dayNumberStyles}>{date.getDate()}</span>
        {tasks.length > 3 && (
          <Text fontSize="10px" color="fg.muted">
            +{tasks.length - 3}
          </Text>
        )}
      </div>
      <div style={tasksContainerStyles}>
        {tasks.slice(0, 3).map((task) => (
          <div 
            key={task.id} 
            style={taskItemStyles}
            onClick={(e: React.MouseEvent) => {
              e.stopPropagation();
              handleTaskClick(task);
            }}
            title={task.title}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleTaskClick(task);
              }
            }}
          >
            {task.title}
          </div>
        ))}
      </div>
    </div>
  );
});

CalendarDay.displayName = 'CalendarDay';

const CalendarView: React.FC = () => {
  const { state } = useKanban();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isTaskDetailOpen, setIsTaskDetailOpen] = useState(false);
  const selectedTaskIdRef = useRef<string | null>(null);

  // selectedTaskを最新の状態に同期 - 無限ループを防止
  useEffect(() => {
    if (selectedTask?.id && state.currentBoard && selectedTaskIdRef.current === selectedTask.id) {
      // 全カラムからselectedTaskのIDで最新のタスクを検索
      let updatedTask: Task | null = null;
      
      for (const column of state.currentBoard.columns) {
        const foundTask = column.tasks.find(task => task.id === selectedTask.id);
        if (foundTask) {
          updatedTask = foundTask;
          break;
        }
      }
      
      if (updatedTask && JSON.stringify(updatedTask) !== JSON.stringify(selectedTask)) {
        setSelectedTask(updatedTask);
      } else if (!updatedTask) {
        // タスクが見つからない場合（削除された場合）はサイドバーを閉じる
        setSelectedTask(null);
        setIsTaskDetailOpen(false);
        selectedTaskIdRef.current = null;
      }
    }
  }, [state.currentBoard, selectedTask?.id]);

  // selectedTaskのIDを追跡
  useEffect(() => {
    selectedTaskIdRef.current = selectedTask?.id || null;
  }, [selectedTask?.id]);

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

    // 全カラムからタスクを収集してフィルタ・ソートを適用
    const allTasks: Task[] = [];
    state.currentBoard.columns.forEach(column => {
      allTasks.push(...column.tasks);
    });

    const filteredTasks = filterTasks(allTasks, state.taskFilter);
    const sortedTasks = sortTasks(filteredTasks, state.sortOption);
    
    // ソート済みタスクを日付ごとにグループ化（ソート順を維持）
    sortedTasks.forEach(task => {
      if (task.dueDate) {
        const dateKey = new Date(task.dueDate).toDateString();
        const existingTasks = taskMap.get(dateKey) || [];
        taskMap.set(dateKey, [...existingTasks, task]);
      }
    });

    return taskMap;
  }, [state.currentBoard, state.taskFilter, state.sortOption]);

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

  const monthNames = useMemo(() => [
    '1月', '2月', '3月', '4月', '5月', '6月',
    '7月', '8月', '9月', '10月', '11月', '12月'
  ], []);

  const weekDays = useMemo(() => ['日', '月', '火', '水', '木', '金', '土'], []);

  const containerStyles = useMemo(() => ({
    padding: '24px 32px 32px',
    height: '100%',
    display: 'flex',
    flexDirection: 'column' as const,
  }), []);

  const headerStyles = useMemo(() => ({
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '16px',
  }), []);

  const titleStyles = useMemo(() => ({
    fontSize: '20px',
    fontWeight: 'bold',
  }), []);

  const navigationStyles = useMemo(() => ({
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  }), []);

  const calendarGridContainerStyles = useMemo(() => ({
    overflow: 'hidden',
    borderRadius: '6px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
  }), []);

  const calendarGridStyles = useMemo(() => ({
    display: 'grid',
    gridTemplateColumns: 'repeat(7, 1fr)',
    gap: '1px',
    backgroundColor: 'var(--borderColor-default)',
    overflow: 'hidden',
    flex: 1,
  }), []);

  const weekHeaderStyles = useMemo(() => ({
    display: 'grid',
    gridTemplateColumns: 'repeat(7, 1fr)',
    gap: '1px',
    backgroundColor: 'var(--borderColor-default)',
    borderBottom: '1px solid var(--borderColor-default)',
    borderRadius: '6px 6px 0 0',
    marginBottom: 0,
  }), []);

  const weekDayStyles = useMemo(() => ({
    padding: '8px',
    backgroundColor: 'var(--bgColor-default)',
    textAlign: 'center' as const,
    fontWeight: 'bold',
    fontSize: '12px',
    color: 'var(--fg-muted)',
  }), []);

  if (!state.currentBoard) {
    return (
      <div style={containerStyles}>
        <Text>ボードが選択されていません</Text>
      </div>
    );
  }

  return (
    <div style={containerStyles}>
      <div style={headerStyles}>
        <span style={titleStyles}>
          {year}年 {monthNames[month]}
        </span>
        <div style={navigationStyles}>
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
        </div>
      </div>

      <div style={calendarGridContainerStyles}>
        <div style={weekHeaderStyles}>
          {weekDays.map((day) => (
            <div key={day} style={weekDayStyles}>
              {day}
            </div>
          ))}
        </div>

        <div style={calendarGridStyles}>
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
        </div>
      </div>

      <TaskDetailSidebar
        task={selectedTask}
        isOpen={isTaskDetailOpen}
        onClose={handleCloseTaskDetail}
      />
    </div>
  );
};

export default CalendarView;