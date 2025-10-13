import { useMemo } from "react";
import type { AutoDeletionSettings } from "../../../types/settings";

/**
 * 設定値のバリデーション
 */
export const useSettingsValidation = (settings: AutoDeletionSettings) => {
  const validationErrors = useMemo(() => {
    const errors: string[] = [];

    // 保持期間のバリデーション
    if (settings.retentionDays < 1 || settings.retentionDays > 365) {
      errors.push("保持期間は1〜365日の範囲で設定してください");
    }

    // 通知日数のバリデーション
    if (
      settings.notifyBeforeDeletion &&
      settings.notificationDays >= settings.retentionDays
    ) {
      errors.push("通知タイミングは保持期間より短く設定してください");
    }

    // ソフトデリート期間のバリデーション
    if (
      settings.enableSoftDeletion &&
      (settings.softDeletionRetentionDays < 1 ||
        settings.softDeletionRetentionDays > 30)
    ) {
      errors.push("ソフトデリート期間は1〜30日の範囲で設定してください");
    }

    return errors;
  }, [settings]);

  const isValid = validationErrors.length === 0;

  return {
    isValid,
    validationErrors,
  };
};
