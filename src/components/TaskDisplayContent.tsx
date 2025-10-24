import React from "react";

import type { Task, Priority } from "../types";
import type { VirtualRecurringTask } from "../utils/calendarRecurrence";

import { formatDateTime } from "../utils/dateHelpers";
import { getRecurrenceDescription } from "../utils/recurrence";
import ContentBox from "./ContentBox";
import DueDateDisplay from "./DueDateDisplay";
import FileList from "./FileList";
import LinkifiedText from "./LinkifiedText";
import TaskDisplaySection from "./TaskDisplaySection";
import TaskLabels from "./TaskLabels";

// 優先度を日本語テキストに変換
const getPriorityText = (priority: Priority): string => {
  switch (priority) {
    case "low":
      return "低";
    case "medium":
      return "中";
    case "high":
      return "高";
    case "critical":
      return "緊急";
    default:
      return "";
  }
};

interface TaskDisplayContentProps {
  task: Task;
  columnName?: string;
  virtualTaskInfo?: VirtualRecurringTask | null;
}

const TaskDisplayContent = React.memo<TaskDisplayContentProps>(
  ({ task, columnName, virtualTaskInfo }) => {
    // 仮想タスクの場合は仮想タスクの期限を使用、そうでなければ元のタスクの期限を使用
    const displayDueDate = virtualTaskInfo?.dueDate || task.dueDate;

    return (
      <>
        <TaskDisplaySection title="説明">
          <ContentBox
            isEmpty={!task.description}
            emptyText="説明が設定されていません"
          >
            {task.description && (
              <LinkifiedText
                sx={{
                  fontSize: 1,
                  whiteSpace: "pre-wrap",
                  overflowWrap: "anywhere",
                }}
              >
                {task.description}
              </LinkifiedText>
            )}
          </ContentBox>
        </TaskDisplaySection>

        {displayDueDate && (
          <TaskDisplaySection title="期限">
            <ContentBox>
              <DueDateDisplay dueDate={new Date(displayDueDate)} showYear />
            </ContentBox>
          </TaskDisplaySection>
        )}

        {task.recurrence && (
          <TaskDisplaySection title="繰り返し設定">
            <ContentBox>
              <span className="text-sm">
                {getRecurrenceDescription(task.recurrence)}
              </span>
            </ContentBox>
          </TaskDisplaySection>
        )}

        {columnName && (
          <TaskDisplaySection title="ステータス">
            <ContentBox>
              <span className="text-sm">{columnName}</span>
            </ContentBox>
          </TaskDisplaySection>
        )}

        {task.priority && (
          <TaskDisplaySection title="優先度">
            <ContentBox>
              <span className="text-sm">{getPriorityText(task.priority)}</span>
            </ContentBox>
          </TaskDisplaySection>
        )}

        {task.completedAt && (
          <TaskDisplaySection title="完了日時">
            <ContentBox>
              <span className="text-sm">
                {formatDateTime(task.completedAt)}
              </span>
            </ContentBox>
          </TaskDisplaySection>
        )}

        {task.labels && task.labels.length > 0 && (
          <TaskDisplaySection title="ラベル">
            <TaskLabels labels={task.labels} />
          </TaskDisplaySection>
        )}

        {task.files && task.files.length > 0 && (
          <TaskDisplaySection title="ファイル添付">
            <FileList attachments={task.files} />
          </TaskDisplaySection>
        )}
      </>
    );
  },
);

export default TaskDisplayContent;
