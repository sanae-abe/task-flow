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
          ? "var(--bgColor-neutral-muted)"
          : "var(--bgColor-accent-muted)",
        color: isVirtual ? "var(--fgColor-muted)" : "var(--fgColor-accent)",
        cursor: isVirtual ? "pointer" : isDragging ? "grabbing" : "grab",
        whiteSpace: "nowrap" as const,
        overflow: "hidden",
        textOverflow: "ellipsis",
        opacity: isDragging ? 0.5 : isVirtual ? 0.7 : 1,
        transition: "opacity 200ms, transform 200ms",
        border: isVirtual ? "1px dashed var(--borderColor-muted)" : "none",
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
        <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
          {task.recurrence?.enabled && <RotateCcw size={10} />}
          <span style={{ flex: 1, minWidth: 0 }}>{task.title}</span>
        </div>
      </div>
    );
  },
);

CalendarTask.displayName = "CalendarTask";

export default CalendarTask;
