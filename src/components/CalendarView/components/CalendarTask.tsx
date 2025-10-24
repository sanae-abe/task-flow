import React, { useMemo } from "react";
import { useDraggable } from "@dnd-kit/core";
import { RotateCcw } from "lucide-react";

import type { Task } from "../../../types";
import {
  isVirtualTask,
  type VirtualRecurringTask,
} from "../../../utils/calendarRecurrence";

interface CalendarTaskProps {
  task: Task | VirtualRecurringTask;
  onTaskClick: (task: Task | VirtualRecurringTask) => void;
}

const CalendarTask: React.FC<CalendarTaskProps> = React.memo(
  ({ task, onTaskClick }) => {
    const isVirtual = isVirtualTask(task);
    const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
      id: task.id,
      data: {
        type: "calendar-task",
        task,
      },
      disabled: isVirtual, // 仮想タスクはドラッグ無効
    });

    const taskItemStyles = useMemo(
      () => ({
        fontSize: "13px",
        padding: "2px 8px",
        borderRadius: "6px",
        backgroundColor: isVirtual
          ? "rgb(229 231 235)"
          : "rgb(219 234 254)",
        color: isVirtual ? "rgb(107 114 128)" : "rgb(37 99 235)",
        cursor: isVirtual ? "pointer" : isDragging ? "grabbing" : "grab",
        whiteSpace: "nowrap" as const,
        overflow: "hidden",
        textOverflow: "ellipsis",
        opacity: isDragging ? 0.5 : isVirtual ? 0.7 : 1,
        transition: "opacity 200ms, transform 200ms",
        border: isVirtual ? "1px dashed rgb(209 213 219)" : "none",
      }),
      [isDragging, isVirtual],
    );

    return (
      <div
        ref={setNodeRef}
        style={taskItemStyles}
        // 仮想タスクの場合はドラッグ関連の属性を無効化
        // eslint-disable-next-line react/jsx-props-no-spreading
        {...(isVirtual ? {} : listeners)}
        // eslint-disable-next-line react/jsx-props-no-spreading
        {...(isVirtual ? {} : attributes)}
        onClick={(e: React.MouseEvent) => {
          e.stopPropagation();
          onTaskClick(task);
        }}
        title={`${task.title}${isVirtual ? " (繰り返し予定)" : ""}`}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onTaskClick(task);
          }
        }}
      >
        <div className="flex items-center gap-1">
          {task.recurrence?.enabled && <RotateCcw size={10} />}
          <span className="flex-1 min-w-0">{task.title}</span>
        </div>
      </div>
    );
  },
);

CalendarTask.displayName = "CalendarTask";

export default CalendarTask;
