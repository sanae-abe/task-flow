import type { Task, KanbanBoard } from "../types";
import type { RecycleBinSettings } from "../types/settings";
import type { RecycleBinItemWithMeta } from "../types/recycleBin";
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
 * 特定のタスクを完全に削除する
 */
export const permanentlyDeleteTask = (
  boards: KanbanBoard[],
  taskId: string,
): { updatedBoards: KanbanBoard[]; success: boolean } => {
  const updatedBoards = boards.map((board) => ({
    ...board,
    columns: board.columns.map((column) => ({
      ...column,
      tasks: column.tasks.filter((task) => task.id !== taskId),
    })),
  }));

  // タスクが実際に削除されたかチェック
  const taskStillExists = updatedBoards.some(board =>
    board.columns.some(column =>
      column.tasks.some(task => task.id === taskId)
    )
  );

  const success = !taskStillExists;

  if (success) {
    logger.info(`🗑️ Permanently deleted task: ${taskId}`);
  }

  return { updatedBoards, success };
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

/**
 * ボード用ゴミ箱機能
 */

/**
 * ゴミ箱のボードを取得
 */
export const getRecycleBinBoards = (
  boards: KanbanBoard[],
): KanbanBoard[] => {
  const deletedBoards = boards.filter(board => board.deletionState === "deleted");

  // 削除日時順でソート（新しいものから）
  return deletedBoards.sort((a, b) => {
    const aTime = new Date(a.deletedAt || 0).getTime();
    const bTime = new Date(b.deletedAt || 0).getTime();
    return bTime - aTime;
  });
};

/**
 * 自動削除対象のボードを取得
 */
export const getExpiredBoards = (
  boards: KanbanBoard[],
  settings: RecycleBinSettings,
): KanbanBoard[] => {
  // 無制限の場合は期限切れボードなし
  if (settings.retentionDays === null) {
    return [];
  }

  const deletedBoards = getRecycleBinBoards(boards);
  const now = new Date();
  const expirationDate = new Date(
    now.getTime() - settings.retentionDays * 24 * 60 * 60 * 1000,
  );

  return deletedBoards.filter((board) => {
    if (!board.deletedAt) {
      return false;
    }
    const deletedDate = new Date(board.deletedAt);
    return deletedDate < expirationDate;
  });
};

/**
 * 期限切れボードを完全削除
 */
export const deleteExpiredBoards = (
  boards: KanbanBoard[],
  settings: RecycleBinSettings,
): { updatedBoards: KanbanBoard[]; deletedCount: number } => {
  const expiredBoards = getExpiredBoards(boards, settings);

  if (expiredBoards.length === 0) {
    return { updatedBoards: boards, deletedCount: 0 };
  }

  const expiredBoardIds = new Set(expiredBoards.map((board) => board.id));

  const updatedBoards = boards.filter(board => !expiredBoardIds.has(board.id));

  logger.info(
    `🗑️ Auto-deleted ${expiredBoards.length} expired boards from recycle bin`,
  );

  return { updatedBoards, deletedCount: expiredBoards.length };
};

/**
 * ボードをソフトデリート（ゴミ箱に移動）
 */
export const moveBoardToRecycleBin = (
  boards: KanbanBoard[],
  boardId: string,
): KanbanBoard[] =>
  boards.map(board => {
    if (board.id === boardId) {
      return {
        ...board,
        deletionState: "deleted" as const,
        deletedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    }
    return board;
  });

/**
 * ボードをゴミ箱から復元
 */
export const restoreBoardFromRecycleBin = (
  boards: KanbanBoard[],
  boardId: string,
): KanbanBoard[] =>
  boards.map(board => {
    if (board.id === boardId && board.deletionState === "deleted") {
      return {
        ...board,
        deletionState: "active" as const,
        deletedAt: null,
        updatedAt: new Date().toISOString(),
      };
    }
    return board;
  });

/**
 * 特定のボードを完全削除
 */
export const permanentlyDeleteBoard = (
  boards: KanbanBoard[],
  boardId: string,
): { updatedBoards: KanbanBoard[]; success: boolean } => {
  const updatedBoards = boards.filter(board => board.id !== boardId);
  const success = updatedBoards.length < boards.length;

  if (success) {
    logger.info(`🗑️ Permanently deleted board: ${boardId}`);
  }

  return { updatedBoards, success };
};

/**
 * ゴミ箱のボードを完全に空にする
 */
export const emptyBoardRecycleBin = (
  boards: KanbanBoard[],
): { updatedBoards: KanbanBoard[]; deletedCount: number } => {
  const deletedBoards = getRecycleBinBoards(boards);

  if (deletedBoards.length === 0) {
    return { updatedBoards: boards, deletedCount: 0 };
  }

  const deletedBoardIds = new Set(deletedBoards.map(board => board.id));
  const updatedBoards = boards.filter(board => !deletedBoardIds.has(board.id));

  logger.info(
    `🗑️ Manually emptied board recycle bin: ${deletedBoards.length} boards permanently deleted`,
  );

  return { updatedBoards, deletedCount: deletedBoards.length };
};

/**
 * 統合されたゴミ箱アイテムを取得
 * タスクとボードの両方を含む統合されたリストを返す
 */
export const getAllRecycleBinItems = (
  boards: KanbanBoard[],
  settings: RecycleBinSettings,
): RecycleBinItemWithMeta[] => {
  const allItems: RecycleBinItemWithMeta[] = [];

  // 削除されたタスクを追加
  const deletedTasks = getRecycleBinTasks(boards);
  deletedTasks.forEach((task) => {
    const board = boards.find(b => b.id === task.boardId);
    const column = board?.columns.find(c => c.id === task.columnId);

    allItems.push({
      id: task.id,
      type: 'task',
      title: task.title,
      description: task.description,
      deletedAt: task.deletedAt,
      boardId: task.boardId,
      columnId: task.columnId,
      boardTitle: board?.title || "不明なボード",
      columnTitle: column?.title || "不明なカラム",
      canRestore: true,
      timeUntilDeletion: task.deletedAt
        ? formatTimeUntilDeletion(task.deletedAt, settings.retentionDays)
        : undefined,
    });
  });

  // 削除されたボードを追加
  const deletedBoards = getRecycleBinBoards(boards);
  deletedBoards.forEach((board) => {
    // ボード内の全タスク数を計算
    const taskCount = board.columns.reduce((total, column) => total + column.tasks.length, 0);

    allItems.push({
      id: board.id,
      type: 'board',
      title: board.title,
      description: `${board.columns.length}個のカラムを含むボード`,
      deletedAt: board.deletedAt,
      columnsCount: board.columns.length,
      taskCount,
      canRestore: true,
      timeUntilDeletion: board.deletedAt
        ? formatTimeUntilDeletion(board.deletedAt, settings.retentionDays)
        : undefined,
    });
  });

  // 削除日時順でソート（新しいものから）
  return allItems.sort((a, b) => {
    const aTime = new Date(a.deletedAt || 0).getTime();
    const bTime = new Date(b.deletedAt || 0).getTime();
    return bTime - aTime;
  });
};
