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
    <div className="bg-background border border-border rounded-md p-4 mb-3 hover:bg-accent/50 transition-colors">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-medium text-foreground m-0 line-clamp-2 break-words">
            {task.title}
          </h3>
        </div>
        <RecycleBinTaskActions
          taskId={task.id}
          restoringTaskId={restoringTaskId}
          deletingTaskId={deletingTaskId}
          onRestore={onRestore}
          onDeleteConfirm={onDeleteConfirm}
        />
      </div>

      <div className="flex flex-col gap-2 mb-3">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <FolderKanban size={12} />
          <span>
            {task.boardTitle} <ArrowRight size={12} /> {task.columnTitle}
          </span>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Clock size={12} />
          <span>
            {UI_TEXT.VIEW.DELETION_SCHEDULE}{" "}
            {task.deletedAt
              ? formatTimeUntilDeletion(task.deletedAt, settings.retentionDays)
              : MESSAGES.RETENTION.UNKNOWN
            }
          </span>
        </div>
      </div>

      {task.description && (
        <div className="mt-2 pt-2 border-t border-border">
          <p className="text-xs text-muted-foreground m-0 line-clamp-3 whitespace-pre-wrap">
            {task.description.replace(/<[^>]*>/g, "")} {/* HTMLタグを除去 */}
          </p>
        </div>
      )}
    </div>
  );