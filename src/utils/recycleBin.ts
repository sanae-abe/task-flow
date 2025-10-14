import type { Task, KanbanBoard } from "../types";
import type { RecycleBinSettings } from "../types/settings";
import { logger } from "./logger";

/**
 * シンプルなゴミ箱自動削除システム
 * 複雑なAutoDeleteionシステムを置き換える新しい設計
 */

/**
 * ゴミ箱のタスクを取得
 */
export const getRecycleBinTasks = (
  boards: KanbanBoard[],
): (Task & { boardId: string; columnId: string })[] => {
  const deletedTasks: (Task & { boardId: string; columnId: string })[] = [];

  boards.forEach((board) => {
    board.columns.forEach((column) => {
      column.tasks.forEach((task) => {
        if (task.deletionState === "deleted") {
          deletedTasks.push({
            ...task,
            boardId: board.id,
            columnId: column.id,
          });
        }
      });
    });
  });

  // 削除日時順でソート（新しいものから）
  return deletedTasks.sort((a, b) => {
    const aTime = new Date(a.deletedAt || 0).getTime();
    const bTime = new Date(b.deletedAt || 0).getTime();
    return bTime - aTime;
  });
};

/**
 * 自動削除対象のタスクを取得
 */
export const getExpiredTasks = (
  boards: KanbanBoard[],
  settings: RecycleBinSettings,
): (Task & { boardId: string; columnId: string })[] => {
  // 無制限の場合は期限切れタスクなし
  if (settings.retentionDays === null) {
    return [];
  }

  const deletedTasks = getRecycleBinTasks(boards);
  const now = new Date();
  const expirationDate = new Date(
    now.getTime() - settings.retentionDays * 24 * 60 * 60 * 1000,
  );

  return deletedTasks.filter((task) => {
    if (!task.deletedAt) {
      return false;
    }
    const deletedDate = new Date(task.deletedAt);
    return deletedDate < expirationDate;
  });
};

/**
 * 期限切れタスクを完全削除
 */
export const deleteExpiredTasks = (
  boards: KanbanBoard[],
  settings: RecycleBinSettings,
): { updatedBoards: KanbanBoard[]; deletedCount: number } => {
  const expiredTasks = getExpiredTasks(boards, settings);

  if (expiredTasks.length === 0) {
    return { updatedBoards: boards, deletedCount: 0 };
  }

  const expiredTaskIds = new Set(expiredTasks.map((task) => task.id));

  const updatedBoards = boards.map((board) => ({
    ...board,
    columns: board.columns.map((column) => ({
      ...column,
      tasks: column.tasks.filter((task) => !expiredTaskIds.has(task.id)),
    })),
  }));

  logger.info(
    `🗑️ Auto-deleted ${expiredTasks.length} expired tasks from recycle bin`,
  );

  return { updatedBoards, deletedCount: expiredTasks.length };
};

/**
 * ゴミ箱を完全に空にする
 */
export const emptyRecycleBin = (
  boards: KanbanBoard[],
): { updatedBoards: KanbanBoard[]; deletedCount: number } => {
  const deletedTasks = getRecycleBinTasks(boards);

  if (deletedTasks.length === 0) {
    return { updatedBoards: boards, deletedCount: 0 };
  }

  const deletedTaskIds = new Set(deletedTasks.map((task) => task.id));

  const updatedBoards = boards.map((board) => ({
    ...board,
    columns: board.columns.map((column) => ({
      ...column,
      tasks: column.tasks.filter((task) => !deletedTaskIds.has(task.id)),
    })),
  }));

  logger.info(
    `🗑️ Manually emptied recycle bin: ${deletedTasks.length} tasks permanently deleted`,
  );

  return { updatedBoards, deletedCount: deletedTasks.length };
};

/**
 * タスクをゴミ箱から復元
 */
export const restoreTaskFromRecycleBin = (
  boards: KanbanBoard[],
  taskId: string,
): KanbanBoard[] | null => {
  const updatedBoards = boards.map((board) => ({
    ...board,
    columns: board.columns.map((column) => ({
      ...column,
      tasks: column.tasks.map((task) => {
        if (task.id === taskId && task.deletionState === "deleted") {
          const restoredTask: Task = {
            ...task,
            deletionState: "active",
            deletedAt: null,
            updatedAt: new Date().toISOString(),
          };
          return restoredTask;
        }
        return task;
      }),
    })),
  }));

  return updatedBoards;
};

/**
 * ゴミ箱の削除予定時刻を計算
 */
export const calculateDeletionTime = (
  deletedAt: string,
  retentionDays: number | null,
): Date | null => {
  // 無制限の場合は削除予定なし
  if (retentionDays === null) {
    return null;
  }

  const deletedDate = new Date(deletedAt);
  return new Date(deletedDate.getTime() + retentionDays * 24 * 60 * 60 * 1000);
};

/**
 * 削除までの残り時間をフォーマット
 */
export const formatTimeUntilDeletion = (
  deletedAt: string,
  retentionDays: number | null,
): string => {
  // 無制限の場合
  if (retentionDays === null) {
    return "無制限（自動削除されません）";
  }

  const deletionTime = calculateDeletionTime(deletedAt, retentionDays);
  const now = new Date();

  // deletionTime が null の場合（理論的にはありえないが安全のため）
  if (!deletionTime) {
    return "無制限（自動削除されません）";
  }

  if (deletionTime <= now) {
    return "削除予定時刻を過ぎています";
  }

  const diffMs = deletionTime.getTime() - now.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffHours / 24);

  if (diffDays > 0) {
    return `約${diffDays}日後`;
  }
  if (diffHours > 0) {
    return `約${diffHours}時間後`;
  }
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  return `約${diffMinutes}分後`;
};
