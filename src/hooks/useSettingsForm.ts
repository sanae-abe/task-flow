import { useState, useCallback } from "react";
import { type RecycleBinSettings } from "../types/settings";
import { useRecycleBinSettings } from "./useRecycleBinSettings";
import { useTemporaryMessage } from "./useTemporaryMessage";
import { validateRetentionDaysInput, getValidationMessage } from "../utils/recycleBinValidation";
import { MESSAGES } from "../constants/recycleBin";

export interface UseSettingsFormResult {
  /** 現在の設定値 */
  settings: RecycleBinSettings;
  /** ローディング状態 */
  isLoading: boolean;
  /** フックのエラー */
  hookError: string | null;
  /** バリデーションエラー */
  validationError: string | null;
  /** 一時メッセージ */
  message: { text: string; type: 'success' | '_error' | 'warning' | 'info' } | null;
  /** 保持期間の変更ハンドラ */
  handleRetentionDaysChange: (value: string) => void;
  /** プリセット選択ハンドラ */
  handlePresetSelect: (days: number | null) => void;
  /** 保存ハンドラ */
  handleSave: (onSave?: (settings: RecycleBinSettings) => void) => Promise<void>;
  /** メッセージクリアハンドラ */
  clearMessage: () => void;
}

/**
 * ゴミ箱設定フォームの状態管理を行うカスタムフック
 * バリデーション、保存、メッセージ表示を統一的に管理
 */
export const useSettingsForm = (): UseSettingsFormResult => {
  const {
    settings,
    updateSettings,
    saveSettings,
    isLoading,
    _error: hookError,
  } = useRecycleBinSettings();

  const { message, showMessage, clearMessage } = useTemporaryMessage();
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleRetentionDaysChange = useCallback((value: string) => {
    // バリデーション実行
    const validationMessage = getValidationMessage(value);
    setValidationError(validationMessage);

    // 有効な場合のみ設定を更新
    if (!validationMessage) {
      const newRetentionDays = value.trim() === "" ? null : parseInt(value, 10);
      updateSettings({ ...settings, retentionDays: newRetentionDays });
    }
  }, [settings, updateSettings]);

  const handlePresetSelect = useCallback((days: number | null) => {
    updateSettings({ ...settings, retentionDays: days });
    setValidationError(null);
  }, [settings, updateSettings]);

  const handleSave = useCallback(async (onSave?: (settings: RecycleBinSettings) => void) => {
    // バリデーション実行
    const validationResult = validateRetentionDaysInput(settings.retentionDays?.toString() || "");
    if (!validationResult.isValid) {
      setValidationError(validationResult._error || null);
      return;
    }

    try {
      const success = await saveSettings(settings);

      if (success) {
        // 親コンポーネントに通知
        onSave?.(settings);

        // 成功メッセージを表示
        showMessage({
          text: MESSAGES.SAVE.SUCCESS,
          type: 'success',
        });
      } else {
        // エラーメッセージを表示
        showMessage({
          text: hookError || MESSAGES.SAVE.FAILED,
          type: '_error',
        }, 5000);
      }
    } catch (_error) {
      // エラーメッセージを表示
      showMessage({
        text: MESSAGES.SAVE.FAILED,
        type: '_error',
      }, 5000);
    }
  }, [settings, saveSettings, hookError, showMessage]);

  return {
    settings,
    isLoading,
    hookError,
    validationError,
    message,
    handleRetentionDaysChange,
    handlePresetSelect,
    handleSave,
    clearMessage,
  };
};