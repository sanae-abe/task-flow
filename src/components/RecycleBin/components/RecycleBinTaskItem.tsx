import React from "react";
import {
  FolderKanban,
  Clock,
  ArrowRight,
} from "lucide-react";
import { UI_TEXT, MESSAGES } from "../../../constants/recycleBin";
import { type RecycleBinSettings } from "../../../types/settings";
import { formatTimeUntilDeletion } from "../../../utils/recycleBin";
import { RecycleBinTaskActions } from "./RecycleBinTaskActions";
import {
  TaskItemContainer,
  TaskHeader,
  TaskTitleContainer,
  TaskTitle,
  TaskMetaContainer,
  TaskMetaItem,
  TaskDescription,
  TaskDescriptionText,
} from "../RecycleBinView.styles";

export interface DeletedTaskWithMeta {
  id: string;
  title: string;
  description?: string;
  deletedAt?: string | null;
  boardId: string;
  columnId: string;
  boardTitle: string;
  columnTitle: string;
}

export interface RecycleBinTaskItemProps {
  /** タスク情報 */
  task: DeletedTaskWithMeta;
  /** ゴミ箱設定 */
  settings: RecycleBinSettings;
  /** 復元中のタスクID */
  restoringTaskId: string | null;
  /** 削除中のタスクID */
  deletingTaskId: string | null;
  /** 復元ハンドラ */
  onRestore: (taskId: string) => void;
  /** 削除確認ダイアログ表示ハンドラ */
  onDeleteConfirm: (taskId: string) => void;
}

/**
 * ゴミ箱内の個別タスクアイテムコンポーネント
 * タスクの詳細情報とアクションを表示
 */
export const RecycleBinTaskItem: React.FC<RecycleBinTaskItemProps> = ({
  task,
  settings,
  restoringTaskId,
  deletingTaskId,
  onRestore,
  onDeleteConfirm,
}) => (
    <TaskItemContainer>
      <TaskHeader>
        <TaskTitleContainer>
          <TaskTitle>
            {task.title}
          </TaskTitle>
        </TaskTitleContainer>
        <RecycleBinTaskActions
          taskId={task.id}
          restoringTaskId={restoringTaskId}
          deletingTaskId={deletingTaskId}
          onRestore={onRestore}
          onDeleteConfirm={onDeleteConfirm}
        />
      </TaskHeader>

      <TaskMetaContainer>
        <TaskMetaItem>
          <FolderKanban size={12} />
          <span>
            {task.boardTitle} <ArrowRight size={12} /> {task.columnTitle}
          </span>
        </TaskMetaItem>
        <TaskMetaItem>
          <Clock size={12} />
          <span>
            {UI_TEXT.VIEW.DELETION_SCHEDULE}{" "}
            {task.deletedAt
              ? formatTimeUntilDeletion(task.deletedAt, settings.retentionDays)
              : MESSAGES.RETENTION.UNKNOWN
            }
          </span>
        </TaskMetaItem>
      </TaskMetaContainer>

      {task.description && (
        <TaskDescription>
          <TaskDescriptionText>
            {task.description.replace(/<[^>]*>/g, "")} {/* HTMLタグを除去 */}
          </TaskDescriptionText>
        </TaskDescription>
      )}
    </TaskItemContainer>
  );