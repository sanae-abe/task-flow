import {
  type Task,
  type KanbanBoard,
  type DeletionCandidate,
  type DeletionCheckResult,
  type DeletionStatistics,
  type DeletionBackup,
} from "../types";
import { type AutoDeletionSettings } from "../types/settings";
import { logger } from "./logger";
import { v4 as uuidv4 } from "uuid";

// LocalStorageキー定義
export const DELETION_STORAGE_KEYS = {
  BACKUPS: "taskflow-deletion-backups",
  STATISTICS: "taskflow-deletion-statistics",
  ARCHIVED_TASKS: "taskflow-archived-tasks",
} as const;

/**
 * 削除候補タスクをチェック
 */
export const checkTasksForDeletion = (
  boards: KanbanBoard[],
  settings: AutoDeletionSettings,
): DeletionCheckResult => {
  if (!settings.enabled) {
    return {
      softDeletedTasks: [],
      notificationTasks: [],
      archivedTasks: [],
      processedTaskCount: 0,
      storageFreed: 0,
    };
  }

  const now = new Date();
  const deletionThreshold = new Date(
    now.getTime() - settings.retentionDays * 24 * 60 * 60 * 1000,
  );
  const notificationThreshold = new Date(
    now.getTime() -
      (settings.retentionDays - settings.notificationDays) *
        24 *
        60 *
        60 *
        1000,
  );

  const softDeletedTasks: Task[] = [];
  const notificationTasks: Task[] = [];
  const archivedTasks: Task[] = [];
  let processedTaskCount = 0;
  let storageFreed = 0;

  boards.forEach((board) => {
    board.columns.forEach((column) => {
      column.tasks.forEach((task) => {
        processedTaskCount++;

        // 既に削除済みまたは保護されたタスクはスキップ
        if (
          task.deletionState === "soft-deleted" ||
          task.protectedFromDeletion
        ) {
          return;
        }

        // 完了していないタスクはスキップ
        if (!task.completedAt) {
          return;
        }

        // 除外条件をチェック
        if (isTaskExcludedFromDeletion(task, settings)) {
          return;
        }

        const completedDate = new Date(task.completedAt);

        // ソフトデリート対象
        if (completedDate < deletionThreshold) {
          const deletedTask: Task = {
            ...task,
            deletionState: "soft-deleted" as const,
            softDeletedAt: now.toISOString(),
            scheduledDeletionAt: new Date(
              now.getTime() +
                settings.softDeletionRetentionDays * 24 * 60 * 60 * 1000,
            ).toISOString(),
          };

          softDeletedTasks.push(deletedTask);
          storageFreed += estimateTaskSize(task);

          // バックアップ作成
          if (settings.autoExportBeforeDeletion) {
            createTaskBackup(task, board.id, column.id);
          }
        }
        // 通知対象
        else if (completedDate < notificationThreshold) {
          notificationTasks.push(task);
        }
      });
    });
  });

  return {
    softDeletedTasks,
    notificationTasks,
    archivedTasks,
    processedTaskCount,
    storageFreed,
  };
};

/**
 * タスクが削除対象から除外されるかチェック
 */
export const isTaskExcludedFromDeletion = (
  task: Task,
  settings: AutoDeletionSettings,
): boolean => {
  // 優先度による除外
  if (task.priority && settings.excludePriorities.includes(task.priority)) {
    return true;
  }

  // ラベルによる除外
  if (
    settings.excludeLabelIds.length > 0 &&
    task.labels.some((label) => settings.excludeLabelIds.includes(label.id))
  ) {
    return true;
  }

  // 繰り返しタスクの特別処理（将来的に設定で制御可能にする）
  if (task.recurrence) {
    return true;
  }

  return false;
};

/**
 * タスクのサイズを推定（バイト単位）
 */
export const estimateTaskSize = (task: Task): number => {
  const jsonString = JSON.stringify(task);
  return new Blob([jsonString]).size;
};

/**
 * タスクのバックアップを作成
 */
export const createTaskBackup = (
  task: Task,
  boardId: string,
  columnId: string,
): DeletionBackup => {
  const backup: DeletionBackup = {
    id: uuidv4(),
    taskId: task.id,
    task: JSON.parse(JSON.stringify(task)), // Deep copy
    boardId,
    columnId,
    backedUpAt: new Date().toISOString(),
    expiresAt: new Date(
      Date.now() + 30 * 24 * 60 * 60 * 1000, // 30日後に期限切れ
    ).toISOString(),
    estimatedSize: estimateTaskSize(task),
  };

  saveBackup(backup);
  return backup;
};

/**
 * バックアップを保存
 */
export const saveBackup = (backup: DeletionBackup): void => {
  try {
    const existingBackups = loadBackups();
    const updatedBackups = [...existingBackups, backup];

    // 最大50件のバックアップを保持
    const maxBackups = 50;
    if (updatedBackups.length > maxBackups) {
      updatedBackups.sort(
        (a, b) =>
          new Date(b.backedUpAt).getTime() - new Date(a.backedUpAt).getTime(),
      );
      updatedBackups.splice(maxBackups);
    }

    localStorage.setItem(
      DELETION_STORAGE_KEYS.BACKUPS,
      JSON.stringify(updatedBackups),
    );
  } catch (error) {
    logger.error("Failed to save backup:", error);
  }
};

/**
 * バックアップを読み込み
 */
export const loadBackups = (): DeletionBackup[] => {
  try {
    const stored = localStorage.getItem(DELETION_STORAGE_KEYS.BACKUPS);
    if (!stored) {
      return [];
    }

    const backups = JSON.parse(stored);
    if (!Array.isArray(backups)) {
      return [];
    }

    // 期限切れのバックアップを除外
    const now = new Date();
    return backups.filter((backup) => new Date(backup.expiresAt) > now);
  } catch (error) {
    logger.error("Failed to load backups:", error);
    return [];
  }
};

/**
 * 削除候補タスクを取得（UI表示用）
 */
export const getDeletionCandidates = (
  boards: KanbanBoard[],
  settings: AutoDeletionSettings,
): DeletionCandidate[] => {
  if (!settings.enabled) {
    return [];
  }

  const candidates: DeletionCandidate[] = [];
  const now = new Date();

  boards.forEach((board) => {
    board.columns.forEach((column) => {
      column.tasks.forEach((task) => {
        if (
          !task.completedAt ||
          task.deletionState === "soft-deleted" ||
          task.protectedFromDeletion ||
          isTaskExcludedFromDeletion(task, settings)
        ) {
          return;
        }

        const completedDate = new Date(task.completedAt);
        const deletionDate = new Date(
          completedDate.getTime() +
            settings.retentionDays * 24 * 60 * 60 * 1000,
        );
        const daysUntilDeletion = Math.ceil(
          (deletionDate.getTime() - now.getTime()) / (24 * 60 * 60 * 1000),
        );

        if (daysUntilDeletion <= settings.notificationDays) {
          candidates.push({
            task,
            daysUntilDeletion,
            boardId: board.id,
            columnId: column.id,
          });
        }
      });
    });
  });

  return candidates.sort((a, b) => a.daysUntilDeletion - b.daysUntilDeletion);
};

/**
 * ソフトデリートされたタスクを復元
 */
export const restoreTask = (
  boards: KanbanBoard[],
  taskId: string,
): KanbanBoard[] | null => {
  const updatedBoards = boards.map((board) => ({
    ...board,
    columns: board.columns.map((column) => ({
      ...column,
      tasks: column.tasks.map((task) => {
        if (task.id === taskId && task.deletionState === "soft-deleted") {
          const restoredTask: Task = {
            ...task,
            deletionState: "active",
            softDeletedAt: null,
            scheduledDeletionAt: null,
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
 * 削除統計を更新
 */
export const updateDeletionStatistics = (
  deletedTasksCount: number,
  freedSpace: number,
): void => {
  try {
    const stats = loadDeletionStatistics();

    stats.totalDeletedTasks += deletedTasksCount;
    stats.totalFreedSpace += freedSpace;
    stats.lastCleanupAt = new Date().toISOString();

    // 期間別統計を更新
    stats.deletionsByPeriod.last24Hours += deletedTasksCount;
    stats.deletionsByPeriod.last7Days += deletedTasksCount;
    stats.deletionsByPeriod.last30Days += deletedTasksCount;

    localStorage.setItem(
      DELETION_STORAGE_KEYS.STATISTICS,
      JSON.stringify(stats),
    );
  } catch (error) {
    logger.error("Failed to update deletion statistics:", error);
  }
};

/**
 * 削除統計を読み込み
 */
export const loadDeletionStatistics = (): DeletionStatistics => {
  try {
    const stored = localStorage.getItem(DELETION_STORAGE_KEYS.STATISTICS);
    if (!stored) {
      return {
        totalDeletedTasks: 0,
        totalArchivedTasks: 0,
        totalFreedSpace: 0,
        lastCleanupAt: null,
        deletionsByPeriod: {
          last24Hours: 0,
          last7Days: 0,
          last30Days: 0,
        },
        averageTaskLifetime: 0,
      };
    }

    return JSON.parse(stored);
  } catch (error) {
    logger.error("Failed to load deletion statistics:", error);
    return {
      totalDeletedTasks: 0,
      totalArchivedTasks: 0,
      totalFreedSpace: 0,
      lastCleanupAt: null,
      deletionsByPeriod: {
        last24Hours: 0,
        last7Days: 0,
        last30Days: 0,
      },
      averageTaskLifetime: 0,
    };
  }
};

/**
 * 削除処理を実行
 */
export const executeDeletion = (
  boards: KanbanBoard[],
  settings: AutoDeletionSettings,
): KanbanBoard[] => {
  const checkResult = checkTasksForDeletion(boards, settings);

  if (checkResult.softDeletedTasks.length === 0) {
    return boards;
  }

  // タスクを削除状態に更新
  const updatedBoards = boards.map((board) => ({
    ...board,
    columns: board.columns.map((column) => ({
      ...column,
      tasks: column.tasks.map((task) => {
        const deletedTask = checkResult.softDeletedTasks.find(
          (dt) => dt.id === task.id,
        );
        return deletedTask || task;
      }),
    })),
  }));

  // 統計を更新
  updateDeletionStatistics(
    checkResult.softDeletedTasks.length,
    checkResult.storageFreed,
  );

  logger.info(
    `🗑️ Soft deleted ${checkResult.softDeletedTasks.length} tasks, freed ${checkResult.storageFreed} bytes`,
  );

  return updatedBoards;
};

/**
 * 完了タスクをソフトデリートする関数
 */
export const softDeleteCompletedTasks = (
  boards: KanbanBoard[],
  settings: AutoDeletionSettings,
): {
  updatedBoards: KanbanBoard[];
  deletedCount: number;
  storageFreed: number;
} => {
  let deletedCount = 0;
  let storageFreed = 0;
  const now = new Date();

  // デバッグ: 処理対象のタスクを調査
  logger.info("🔍 softDeleteCompletedTasks: Starting analysis");
  logger.info("📋 Boards count:", boards.length);

  let totalTasks = 0;
  let completedTasks = 0;
  let activeTasks = 0;
  let excludedTasks = 0;

  boards.forEach((board, boardIndex) => {
    logger.info(
      `📂 Board ${boardIndex + 1}: "${board.title}" (${board.columns.length} columns)`,
    );

    board.columns.forEach((column, columnIndex) => {
      logger.info(
        `  📁 Column ${columnIndex + 1}: "${column.title}" (${column.tasks.length} tasks)`,
      );

      column.tasks.forEach((task, taskIndex) => {
        totalTasks++;

        const isCompleted = !!task.completedAt;
        const isActive = !task.deletionState || task.deletionState === "active"; // 修正: undefined を active として扱う
        const isExcluded = isTaskExcludedFromDeletion(task, settings);

        if (isCompleted) {
          completedTasks++;
        }
        if (isActive) {
          activeTasks++;
        }
        if (isExcluded) {
          excludedTasks++;
        }

        logger.info(`    📝 Task ${taskIndex + 1}: "${task.title}"`);
        logger.info(
          `      - Completed: ${isCompleted} (completedAt: ${task.completedAt})`,
        );
        logger.info(
          `      - Active: ${isActive} (deletionState: ${task.deletionState})`,
        );
        logger.info(`      - Excluded: ${isExcluded}`);

        if (isExcluded) {
          logger.info(`      - Exclusion reasons:`);
          if (
            task.priority &&
            settings.excludePriorities.includes(task.priority)
          ) {
            logger.info(`        * Priority "${task.priority}" is excluded`);
          }
          if (
            settings.excludeLabelIds.length > 0 &&
            task.labels.some((label) =>
              settings.excludeLabelIds.includes(label.id),
            )
          ) {
            logger.info(`        * Has excluded label`);
          }
          if (task.recurrence) {
            logger.info(`        * Is recurring task`);
          }
        }
      });
    });
  });

  logger.info(`📊 Analysis summary:`);
  logger.info(`  - Total tasks: ${totalTasks}`);
  logger.info(`  - Completed tasks: ${completedTasks}`);
  logger.info(`  - Active tasks: ${activeTasks}`);
  logger.info(`  - Excluded tasks: ${excludedTasks}`);
  logger.info(`⚙️ Settings:`, settings);

  const updatedBoards = boards.map((board) => ({
    ...board,
    columns: board.columns.map((column) => {
      const updatedTasks = column.tasks.map((task) => {
        // 完了済みかつソフトデリートされていないタスクのみを対象（修正）
        if (!task.completedAt || task.deletionState === "soft-deleted") {
          return task;
        }

        // 除外対象チェック
        if (isTaskExcludedFromDeletion(task, settings)) {
          return task;
        }

        logger.info(`🗑️ Deleting task: "${task.title}"`);

        // タスクサイズを計算
        const taskSize = estimateTaskSize(task);
        storageFreed += taskSize;
        deletedCount++;

        // ソフトデリート状態に更新
        const deletedTask: Task = {
          ...task,
          deletionState: "soft-deleted",
          softDeletedAt: now.toISOString(),
          scheduledDeletionAt: new Date(
            now.getTime() +
              settings.softDeletionRetentionDays * 24 * 60 * 60 * 1000,
          ).toISOString(),
          updatedAt: now.toISOString(),
        };

        // バックアップ作成（設定が有効な場合）
        if (settings.autoExportBeforeDeletion) {
          try {
            createTaskBackup(deletedTask, board.id, column.id);
          } catch (error) {
            logger.warn("Failed to create backup for task:", task.id, error);
          }
        }

        return deletedTask;
      });

      return {
        ...column,
        tasks: updatedTasks,
      };
    }),
  }));

  logger.info(
    `✅ softDeleteCompletedTasks completed: ${deletedCount} tasks deleted`,
  );

  // 統計更新
  if (deletedCount > 0) {
    updateDeletionStatistics(deletedCount, storageFreed);
    logger.info(
      `🗑️ Soft deleted ${deletedCount} completed tasks, freed ${storageFreed} bytes`,
    );
  }

  return {
    updatedBoards,
    deletedCount,
    storageFreed,
  };
};
