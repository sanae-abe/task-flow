import { useState, useEffect, useCallback, useMemo } from "react";
import type { DeletionCandidate } from "../types";
import { useBoard } from "../contexts/BoardContext";
import { getAutoDeletionSettings } from "../utils/settingsStorage";
import { logger } from "../utils/logger";

interface UseDeletionNotificationsReturn {
  candidates: DeletionCandidate[];
  urgentCandidates: DeletionCandidate[];
  shouldShowNotification: boolean;
  isDismissed: boolean;
  dismissNotification: () => void;
  restoreNotification: () => void;
  refreshCandidates: () => void;
  isEnabled: boolean;
}

export const useDeletionNotifications = (): UseDeletionNotificationsReturn => {
  const { checkDeletionCandidates } = useBoard();
  const [isDismissed, setIsDismissed] = useState(false);
  const [lastCheckTime, setLastCheckTime] = useState<Date | null>(null);

  // 削除候補を取得
  const candidates = useMemo(() => {
    try {
      return checkDeletionCandidates();
    } catch (error) {
      logger.warn("Failed to check deletion candidates:", error);
      return [];
    }
  }, [checkDeletionCandidates]);

  // 緊急削除候補（1日以内）
  const urgentCandidates = useMemo(
    () => candidates.filter((candidate) => candidate.daysUntilDeletion <= 1),
    [candidates],
  );

  // 設定状態を取得
  const settings = useMemo(() => {
    try {
      return getAutoDeletionSettings();
    } catch (error) {
      logger.warn("Failed to get auto deletion settings:", error);
      return { enabled: false, notifyBeforeDeletion: false };
    }
  }, []);

  const isEnabled = settings.enabled;
  const notificationsEnabled = settings.notifyBeforeDeletion;

  // 通知を表示すべきかどうか
  const shouldShowNotification = useMemo(
    () =>
      isEnabled &&
      notificationsEnabled &&
      candidates.length > 0 &&
      !isDismissed,
    [isEnabled, notificationsEnabled, candidates.length, isDismissed],
  );

  // 通知を閉じる
  const dismissNotification = useCallback(() => {
    setIsDismissed(true);
  }, []);

  // 通知を復元する
  const restoreNotification = useCallback(() => {
    setIsDismissed(false);
  }, []);

  // 削除候補を手動で更新
  const refreshCandidates = useCallback(() => {
    setLastCheckTime(new Date());
    // checkDeletionCandidatesは既にuseMemoで計算されているため、
    // lastCheckTimeの更新により自動的に再計算される
  }, []);

  // 定期的に削除候補をチェック（5分ごと）
  useEffect(() => {
    if (!isEnabled || !notificationsEnabled) {
      return;
    }

    const interval = setInterval(
      () => {
        refreshCandidates();
      },
      5 * 60 * 1000,
    ); // 5分ごと

    return () => clearInterval(interval);
  }, [isEnabled, notificationsEnabled, refreshCandidates]);

  // 候補が変更されたときに通知を復元
  useEffect(() => {
    if (candidates.length > 0 && isDismissed) {
      // 新しい候補が追加された場合は通知を復元
      const now = new Date();
      const hasNewUrgentTasks = urgentCandidates.some((candidate) => {
        if (!lastCheckTime) {
          return true;
        }
        if (!candidate.task.completedAt) {
          return false;
        }
        // 最後のチェック以降に新しく緊急になったタスクがあるかチェック
        const deletionDate = new Date(candidate.task.completedAt);
        const daysSinceCompletion = Math.ceil(
          (now.getTime() - deletionDate.getTime()) / (1000 * 60 * 60 * 24),
        );
        const daysAtLastCheck = lastCheckTime
          ? Math.ceil(
              (lastCheckTime.getTime() - deletionDate.getTime()) /
                (1000 * 60 * 60 * 24),
            )
          : 0;

        return daysSinceCompletion <= 1 && daysAtLastCheck > 1;
      });

      if (hasNewUrgentTasks) {
        setIsDismissed(false);
      }
    }
  }, [candidates.length, urgentCandidates, isDismissed, lastCheckTime]);

  return {
    candidates,
    urgentCandidates,
    shouldShowNotification,
    isDismissed,
    dismissNotification,
    restoreNotification,
    refreshCandidates,
    isEnabled,
  };
};

export default useDeletionNotifications;
