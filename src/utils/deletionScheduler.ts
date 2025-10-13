import {
  getAutoDeletionSettings,
  isAutoDeletionEnabled,
} from "./settingsStorage";
import { executeDeletion, loadDeletionStatistics } from "./taskDeletion";
import { saveBoards, loadBoards } from "./storage";
import { logger } from "./logger";

/**
 * 削除スケジューラークラス
 * アプリ起動時および定期的に削除チェックを実行
 */
export class DeletionScheduler {
  private intervalId: NodeJS.Timeout | null = null;
  private readonly CHECK_INTERVAL = 60 * 60 * 1000; // 1時間ごと
  private readonly MIN_CHECK_INTERVAL = 5 * 60 * 1000; // 最小5分間隔
  private lastCheckTime: Date | null = null;
  private isRunning = false;

  /**
   * スケジューラーを開始
   */
  start(): void {
    if (this.intervalId) {
      return; // 既に開始済み
    }

    logger.info("🗑️ Deletion scheduler started");

    // 初回実行（アプリ起動時）
    this.performScheduledDeletion();

    // 定期実行を設定
    this.intervalId = setInterval(() => {
      this.performScheduledDeletion();
    }, this.CHECK_INTERVAL);
  }

  /**
   * スケジューラーを停止
   */
  stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
      logger.info("🗑️ Deletion scheduler stopped");
    }
  }

  /**
   * 手動で削除チェックを実行
   */
  async runManualCheck(): Promise<boolean> {
    if (this.isRunning) {
      logger.warn("⚠️ Deletion check already in progress");
      return false;
    }

    return this.performScheduledDeletion();
  }

  /**
   * 最後のチェック時刻を取得
   */
  getLastCheckTime(): Date | null {
    return this.lastCheckTime;
  }

  /**
   * スケジューラーが実行中かどうか
   */
  getIsRunning(): boolean {
    return this.isRunning;
  }

  /**
   * 削除チェックを実行
   */
  private async performScheduledDeletion(): Promise<boolean> {
    // 機能が無効な場合はスキップ
    if (!isAutoDeletionEnabled()) {
      return false;
    }

    // 実行中の場合はスキップ
    if (this.isRunning) {
      return false;
    }

    // 最小間隔チェック
    const now = new Date();
    if (this.lastCheckTime) {
      const timeSinceLastCheck = now.getTime() - this.lastCheckTime.getTime();
      if (timeSinceLastCheck < this.MIN_CHECK_INTERVAL) {
        return false;
      }
    }

    this.isRunning = true;
    this.lastCheckTime = now;

    try {
      logger.info("🔍 Starting scheduled deletion check");

      const boards = loadBoards();
      const settings = getAutoDeletionSettings();

      // 削除処理を実行
      const updatedBoards = executeDeletion(boards, settings);

      // 変更があった場合のみ保存
      if (updatedBoards !== boards) {
        saveBoards(updatedBoards);
        logger.info("💾 Updated boards with deletion changes");
      }

      // 統計情報をログ出力（デバッグ用）
      const stats = loadDeletionStatistics();
      if (stats.totalDeletedTasks > 0) {
        logger.debug(`📊 Total deleted tasks: ${stats.totalDeletedTasks}`);
        logger.debug(
          `💾 Total freed space: ${(stats.totalFreedSpace / 1024).toFixed(2)} KB`,
        );
      }

      return true;
    } catch (error) {
      logger.error("❌ Error during scheduled deletion:", error);
      return false;
    } finally {
      this.isRunning = false;
    }
  }
}

// グローバルスケジューラーインスタンス
let globalScheduler: DeletionScheduler | null = null;

/**
 * グローバルスケジューラーを取得
 */
export const getDeletionScheduler = (): DeletionScheduler => {
  if (!globalScheduler) {
    globalScheduler = new DeletionScheduler();
  }
  return globalScheduler;
};

/**
 * スケジューラーを初期化（アプリ起動時に呼び出し）
 */
export const initializeDeletionScheduler = (): void => {
  const scheduler = getDeletionScheduler();
  scheduler.start();
};

/**
 * スケジューラーを終了（アプリ終了時に呼び出し）
 */
export const shutdownDeletionScheduler = (): void => {
  if (globalScheduler) {
    globalScheduler.stop();
    globalScheduler = null;
  }
};

/**
 * スケジューラーの状態を取得（デバッグ用）
 */
export const getSchedulerStatus = () => {
  const scheduler = getDeletionScheduler();
  return {
    isRunning: scheduler.getIsRunning(),
    lastCheckTime: scheduler.getLastCheckTime(),
    isEnabled: isAutoDeletionEnabled(),
  };
};

/**
 * React用のスケジューラーフック
 */
export const useDeletionScheduler = () => {
  const scheduler = getDeletionScheduler();

  const runManualCheck = async (): Promise<boolean> =>
    scheduler.runManualCheck();

  const getStatus = () => ({
    isRunning: scheduler.getIsRunning(),
    lastCheckTime: scheduler.getLastCheckTime(),
    isEnabled: isAutoDeletionEnabled(),
  });

  return {
    runManualCheck,
    getStatus,
  };
};

/**
 * ブラウザの可視性変更時の処理
 * ページがアクティブになった時に削除チェックを実行
 */
export const handleVisibilityChange = (): void => {
  if (document.visibilityState === "visible") {
    const scheduler = getDeletionScheduler();

    // 最後のチェックから1時間以上経過している場合のみ実行
    const lastCheck = scheduler.getLastCheckTime();
    if (!lastCheck || Date.now() - lastCheck.getTime() > 60 * 60 * 1000) {
      scheduler.runManualCheck();
    }
  }
};

/**
 * ウィンドウフォーカス時の処理
 */
export const handleWindowFocus = (): void => {
  // フォーカスが戻った時も削除チェックを実行
  handleVisibilityChange();
};

// イベントリスナーを設定
if (typeof document !== "undefined") {
  document.addEventListener("visibilitychange", handleVisibilityChange);
}

if (typeof window !== "undefined") {
  window.addEventListener("focus", handleWindowFocus);
}
