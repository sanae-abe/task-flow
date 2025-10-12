import { CheckCircleIcon, CheckCircleFillIcon } from "@primer/octicons-react";
import { Heading } from "@primer/react";
import React from "react";

import type { TaskDisplayProps } from "../types/task";
import IconButton from "./shared/IconButton";

import DueDateBadge from "./DueDateBadge";
import PriorityBadge from "./PriorityBadge";
import TaskIndicators from "./TaskIndicators";
import TaskLabels from "./TaskLabels";

const TaskCardContent: React.FC<TaskDisplayProps> = ({
  task,
  isOverdue,
  isDueToday,
  isDueTomorrow,
  formatDueDate,
  onComplete,
  isRightmostColumn = false,
}) => (
  <div
    style={{
      flex: 1,
      display: "flex",
      flexDirection: "column",
      minHeight: 0,
      gap: "8px",
    }}
  >
    {/* タイトル行 */}
    <div style={{ display: "flex", alignItems: "flex-start", margin: "4px 0" }}>
      {onComplete && (
        <IconButton
          icon={isRightmostColumn ? CheckCircleFillIcon : CheckCircleIcon}
          onClick={onComplete}
          ariaLabel={
            isRightmostColumn ? "タスクを未完了にする" : "タスクを完了にする"
          }
          variant="success"
          size="small"
          sx={{
            pl: 0,
            pt: 0,
            width: "26px",
            height: "20px",
            flexShrink: 0,
            "&:hover": {
              bg: "transparent",
              color: "success.fg",
            },
          }}
        />
      )}
      <Heading
        sx={{
          fontSize: 1,
          margin: 0,
          fontWeight: "500",
          color: "fg.default",
          lineHeight: "1.4",
          flex: 1,
          wordBreak: "break-word",
        }}
      >
        {task.title}
      </Heading>
    </div>

    {/* 優先度とラベル行 */}
    {(task.priority || (task.labels && task.labels.length > 0)) && (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          flexWrap: "wrap",
        }}
      >
        <PriorityBadge priority={task.priority} showIcon showLabel />
        <TaskLabels labels={task.labels} />
      </div>
    )}

    {/* 下部情報行 */}
    {(task.dueDate ||
      (task.subTasks && task.subTasks.length > 0) ||
      (task.files && task.files.length > 0)) && (
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "8px",
          flexWrap: "wrap",
        }}
      >
        <div style={{ flex: 1, minWidth: 0 }}>
          {task.dueDate && (
            <DueDateBadge
              dueDate={new Date(task.dueDate)}
              isOverdue={isOverdue}
              isDueToday={isDueToday}
              isDueTomorrow={isDueTomorrow}
              formatDueDate={formatDueDate}
              isRecurrence={task.recurrence?.enabled}
            />
          )}
        </div>
        <TaskIndicators subTasks={task.subTasks} attachments={task.files} />
      </div>
    )}
  </div>
);

export default TaskCardContent;
