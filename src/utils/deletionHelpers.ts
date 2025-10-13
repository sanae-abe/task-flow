import { type Task, type DeletionCandidate } from "../types";
import { type AutoDeletionSettings } from "../types/settings";
import { logger } from "./logger";

/**
 * 日付ユーティリティ関数
 */
export const DateUtils = {
  /**
   * 日数を加算した日付を取得
   */
  addDays: (date: Date, days: number): Date => {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  },

  /**
   * 2つの日付の差を日数で取得
   */
  getDaysDifference: (date1: Date, date2: Date): number => {
    const timeDiff = Math.abs(date2.getTime() - date1.getTime());
    return Math.ceil(timeDiff / (1000 * 3600 * 24));
  },

  /**
   * 日付を日本語形式でフォーマット
   */
  formatJapanese: (date: Date): string =>
    date.toLocaleDateString("ja-JP", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }),

  /**
   * 相対的な日付表示
   */
  getRelativeDate: (date: Date): string => {
    const now = new Date();
    const days = DateUtils.getDaysDifference(now, date);

    if (days === 0) {
      return "今日";
    }
    if (days === 1) {
      return "明日";
    }
    if (days <= 7) {
      return `${days}日後`;
    }
    if (days <= 30) {
      return `約${Math.ceil(days / 7)}週間後`;
    }
    return DateUtils.formatJapanese(date);
  },
};

/**
 * タスクフィルター用ユーティリティ
 */
export const TaskFilters = {
  /**
   * 完了タスクのみをフィルター
   */
  completedOnly: (tasks: Task[]): Task[] =>
    tasks.filter((task) => task.completedAt !== null),

  /**
   * アクティブなタスクのみをフィルター（削除対象外）
   */
  activeOnly: (tasks: Task[]): Task[] =>
    tasks.filter(
      (task) => !task.deletionState || task.deletionState === "active",
    ),

  /**
   * ソフトデリートされたタスクのみをフィルター
   */
  softDeletedOnly: (tasks: Task[]): Task[] =>
    tasks.filter((task) => task.deletionState === "soft-deleted"),

  /**
   * 削除予定タスクをフィルター
   */
  scheduledForDeletion: (
    tasks: Task[],
    settings: AutoDeletionSettings,
  ): Task[] => {
    if (!settings.enabled) {
      return [];
    }

    const now = new Date();
    const notificationThreshold = new Date(
      now.getTime() -
        (settings.retentionDays - settings.notificationDays) *
          24 *
          60 *
          60 *
          1000,
    );

    return tasks.filter((task) => {
      if (!task.completedAt || task.deletionState !== "active") {
        return false;
      }

      const completedDate = new Date(task.completedAt);
      return completedDate < notificationThreshold;
    });
  },

  /**
   * 保護されたタスクをフィルター
   */
  protectedTasks: (tasks: Task[]): Task[] =>
    tasks.filter((task) => task.protectedFromDeletion === true),
};

/**
 * 削除通知用メッセージ生成
 */
export const NotificationMessages = {
  /**
   * 削除予定通知メッセージ
   */
  getDeletionWarning: (candidates: DeletionCandidate[]): string => {
    const count = candidates.length;
    if (count === 0) {
      return "";
    }

    const minDays = Math.min(...candidates.map((c) => c.daysUntilDeletion));

    if (minDays <= 0) {
      return `${count}件のタスクが削除予定です。`;
    } else if (minDays === 1) {
      return `${count}件のタスクが明日削除されます。`;
    }
    return `${count}件のタスクが${minDays}日後に削除されます。`;
  },

  /**
   * 削除完了メッセージ
   */
  getDeletionComplete: (deletedCount: number, freedSpace: number): string => {
    const spaceMB = (freedSpace / (1024 * 1024)).toFixed(2);
    return `${deletedCount}件のタスクを削除しました。${spaceMB}MBの容量が解放されました。`;
  },

  /**
   * 復元完了メッセージ
   */
  getRestoreComplete: (restoredCount: number): string =>
    `${restoredCount}件のタスクを復元しました。`,
};

/**
 * 保持期間プリセット
 */
export const RETENTION_PRESETS = {
  minimal: {
    label: "最小（7日）",
    days: 7,
  },
  standard: {
    label: "標準（30日）",
    days: 30,
    recommended: true,
  },
  extended: {
    label: "延長（90日）",
    days: 90,
  },
  long_term: {
    label: "長期（180日）",
    days: 180,
  },
  custom: {
    label: "カスタム",
    days: null,
  },
} as const;

/**
 * 削除対象の見積もりユーティリティ
 */
export const DeletionEstimator = {
  /**
   * 削除対象タスク数を推定
   */
  estimateDeletionCandidates: (
    tasks: Task[],
    retentionDays: number,
  ): { immediate: number; upcoming: number } => {
    const now = new Date();
    const deletionThreshold = DateUtils.addDays(now, -retentionDays);
    const upcomingThreshold = DateUtils.addDays(now, -(retentionDays - 7));

    let immediate = 0;
    let upcoming = 0;

    tasks.forEach((task) => {
      if (!task.completedAt || task.deletionState !== "active") {
        return;
      }

      const completedDate = new Date(task.completedAt);
      if (completedDate < deletionThreshold) {
        immediate++;
      } else if (completedDate < upcomingThreshold) {
        upcoming++;
      }
    });

    return { immediate, upcoming };
  },

  /**
   * 削除による容量削減見積もり
   */
  estimateSpaceSavings: (tasks: Task[]): number =>
    tasks.reduce((total, task) => {
      const taskSize = new Blob([JSON.stringify(task)]).size;
      return total + taskSize;
    }, 0),
};

/**
 * バリデーション用ユーティリティ
 */
export const ValidationUtils = {
  /**
   * 保持期間の妥当性チェック
   */
  isValidRetentionDays: (days: number): boolean =>
    Number.isInteger(days) && days >= 1 && days <= 365,

  /**
   * 通知期間の妥当性チェック
   */
  isValidNotificationDays: (days: number, retentionDays: number): boolean =>
    Number.isInteger(days) && days >= 0 && days < retentionDays,

  /**
   * 設定全体の妥当性チェック
   */
  validateAutoDeletionSettings: (settings: AutoDeletionSettings): string[] => {
    const errors: string[] = [];

    if (!ValidationUtils.isValidRetentionDays(settings.retentionDays)) {
      errors.push("保持期間は1〜365日の範囲で設定してください");
    }

    if (
      !ValidationUtils.isValidNotificationDays(
        settings.notificationDays,
        settings.retentionDays,
      )
    ) {
      errors.push("通知期間は0〜保持期間未満で設定してください");
    }

    if (
      settings.softDeletionRetentionDays < 1 ||
      settings.softDeletionRetentionDays > 30
    ) {
      errors.push("ソフトデリート保持期間は1〜30日の範囲で設定してください");
    }

    return errors;
  },
};

/**
 * デバッグ用ユーティリティ
 */
export const DebugUtils = {
  /**
   * タスクの削除関連状態をログ出力
   */
  logTaskDeletionState: (task: Task): void => {
    logger.debug(`Task ${task.id} (${task.title}):`);
    logger.debug(`  - Completed: ${task.completedAt}`);
    logger.debug(`  - Deletion State: ${task.deletionState || "active"}`);
    logger.debug(`  - Soft Deleted: ${task.softDeletedAt}`);
    logger.debug(`  - Scheduled Deletion: ${task.scheduledDeletionAt}`);
    logger.debug(`  - Protected: ${task.protectedFromDeletion || false}`);
  },

  /**
   * 削除チェック結果をログ出力
   */
  logDeletionCheckResult: (
    result: import("../types").DeletionCheckResult,
  ): void => {
    logger.debug("🗑️ Deletion Check Result:");
    logger.debug(`  - Soft Deleted: ${result.softDeletedTasks.length} tasks`);
    logger.debug(`  - Notification: ${result.notificationTasks.length} tasks`);
    logger.debug(`  - Processed: ${result.processedTaskCount} tasks`);
    logger.debug(
      `  - Storage Freed: ${(result.storageFreed / 1024).toFixed(2)} KB`,
    );
  },
};
