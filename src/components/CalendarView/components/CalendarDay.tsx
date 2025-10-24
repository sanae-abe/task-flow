import React, { useMemo, useCallback } from "react";
import { Text } from "@primer/react";
import { useDroppable } from "@dnd-kit/core";

import type { Task } from "../../../types";
import type { VirtualRecurringTask } from "../../../utils/calendarRecurrence";
import CalendarTask from "./CalendarTask";

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
    const { setNodeRef, isOver } = useDroppable({
      id: `calendar-day-${date.toISOString()}`,
      data: {
        type: "calendar-date",
        date,
      },
    });

    const dayStyles = useMemo(
      () => ({
        minHeight: "120px",
        backgroundColor: isCurrentMonth
          ? "var(--background)"
          : "var(--color-neutral-100)",
        borderRadius: 0,
        padding: "8px",
        position: "relative" as const,
        overflow: "hidden",
        border: isOver
          ? "1px dashed var(--fgColor-accent)"
          : "1px solid transparent",
        transition: "border-color 200ms ease",
      }),
      [isCurrentMonth, isOver],
    );

    const headerStyles = useMemo(
      () => ({
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        minHeight: "24px",
        marginBottom: "8px",
      }),
      [],
    );

    const dayNumberStyles = useMemo(
      () => ({
        fontSize: "12px",
        fontWeight: "400",
        color: isToday
          ? "white"
          : isCurrentMonth
            ? "var(--fg-default)"
            : "var(--fg-muted)",
        ...(isToday && {
          backgroundColor: "var(--primary)",
          borderRadius: "50%",
          width: "24px",
          height: "24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }),
      }),
      [isToday, isCurrentMonth],
    );

    const tasksContainerStyles = useMemo(
      () => ({
        display: "flex",
        flexDirection: "column" as const,
        gap: "2px",
        maxHeight: "80px",
        overflow: "hidden",
      }),
      [],
    );

    const handleTaskClick = useCallback(
      (task: Task | VirtualRecurringTask) => {
        onTaskClick(task);
      },
      [onTaskClick],
    );

    const handleDateClick = useCallback(
      (e: React.MouseEvent) => {
        // タスクのクリックイベントではない場合のみ日付クリックを処理
        if (e.target === e.currentTarget) {
          onDateClick(date);
        }
      },
      [onDateClick, date],
    );

    return (
      <div ref={setNodeRef} style={dayStyles} onClick={handleDateClick}>
        <div style={headerStyles}>
          <span style={dayNumberStyles}>{date.getDate()}</span>
          {tasks.length > 3 && (
            <Text fontSize="12px" color="fg.muted">
              他 {tasks.length - 3} 件
            </Text>
          )}
        </div>
        <div style={tasksContainerStyles}>
          {tasks.slice(0, 3).map((task) => (
            <CalendarTask
              key={task.id}
              task={task}
              onTaskClick={handleTaskClick}
            />
          ))}
        </div>
      </div>
    );
  },
);

CalendarDay.displayName = "CalendarDay";

export default CalendarDay;
