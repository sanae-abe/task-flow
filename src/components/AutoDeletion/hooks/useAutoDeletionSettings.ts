import { useState, useCallback } from "react";
import type { AutoDeletionSettings } from "../../../types/settings";
import { getAutoDeletionSettings } from "../../../utils/settingsStorage";
import type { SettingsChangeHandler } from "../types/AutoDeletionSettingsTypes";

/**
 * 自動削除設定の状態管理フック
 */
export const useAutoDeletionSettings = () => {
  const [settings, setSettings] = useState<AutoDeletionSettings>(
    getAutoDeletionSettings
  );

  const handleChange = useCallback<SettingsChangeHandler>((key, value) => {
    setSettings((prev) => ({
      ...prev,
      [key]: value,
    }));
  }, []);

  const resetSettings = useCallback(() => {
    const defaultSettings: AutoDeletionSettings = {
      enabled: false,
      retentionDays: 30,
      notifyBeforeDeletion: true,
      notificationDays: 7,
      excludeLabelIds: [],
      excludePriorities: ["critical"],
      autoExportBeforeDeletion: true,
      enableSoftDeletion: true,
      softDeletionRetentionDays: 7,
    };
    setSettings(defaultSettings);
  }, []);

  return {
    settings,
    handleChange,
    resetSettings,
  };
};
