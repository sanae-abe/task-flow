import { useState, useCallback } from "react";
import type { AutoDeletionSettings } from "../../../types/settings";
import { updateAutoDeletionSettings } from "../../../utils/settingsStorage";
import { logger } from "../../../utils/logger";
import type { SaveMessage } from "../types/AutoDeletionSettingsTypes";

const MESSAGE_DISPLAY_DURATION = 3000; // 3秒

/**
 * 設定保存処理のフック
 */
export const useSettingsSave = (settings: AutoDeletionSettings) => {
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<SaveMessage | null>(null);

  const handleSave = useCallback(async () => {
    setIsSaving(true);
    setSaveMessage(null);

    try {
      updateAutoDeletionSettings(settings);
      setSaveMessage({
        type: "success",
        text: "設定が保存されました",
      });
      logger.info("Auto-deletion settings saved successfully");
    } catch (error) {
      setSaveMessage({
        type: "error",
        text: "設定の保存に失敗しました",
      });
      logger.error("Failed to save auto-deletion settings:", error);
    } finally {
      setIsSaving(false);
      setTimeout(() => setSaveMessage(null), MESSAGE_DISPLAY_DURATION);
    }
  }, [settings]);

  return {
    isSaving,
    saveMessage,
    handleSave,
  };
};
