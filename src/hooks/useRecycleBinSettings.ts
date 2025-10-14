import { useState, useCallback, useEffect } from "react";
import { DEFAULT_RECYCLE_BIN_SETTINGS, type RecycleBinSettings } from "../types/settings";
import { logger } from "../utils/logger";

const STORAGE_KEY = 'recycleBinSettings';

/**
 * ゴミ箱設定の管理を行うカスタムフック
 * LocalStorageからの読み込み、保存、リアルタイム更新を提供
 */
export const useRecycleBinSettings = () => {
  const [settings, setSettings] = useState<RecycleBinSettings>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as RecycleBinSettings;
        // 型安全性のための検証
        if (typeof parsed.retentionDays === 'number' || parsed.retentionDays === null) {
          return parsed;
        }
      }
    } catch (error) {
      logger.warn('ゴミ箱設定の読み込みに失敗:', error);
    }
    return DEFAULT_RECYCLE_BIN_SETTINGS;
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * 設定をLocalStorageに保存
   */
  const saveSettings = useCallback(async (newSettings: RecycleBinSettings): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newSettings));
      setSettings(newSettings);
      logger.info('ゴミ箱設定を保存しました:', newSettings);
      return true;
    } catch (error) {
      const errorMessage = 'ゴミ箱設定の保存に失敗しました';
      logger.error(errorMessage, error);
      setError(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * 設定を更新（LocalStorageへの保存は行わない）
   */
  const updateSettings = useCallback((newSettings: RecycleBinSettings) => {
    setSettings(newSettings);
  }, []);

  /**
   * 設定をリセット
   */
  const resetSettings = useCallback(async (): Promise<boolean> => {
    return await saveSettings(DEFAULT_RECYCLE_BIN_SETTINGS);
  }, [saveSettings]);

  /**
   * LocalStorageの変更を監視してリアルタイム更新
   */
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY && e.newValue) {
        try {
          const newSettings = JSON.parse(e.newValue) as RecycleBinSettings;
          setSettings(newSettings);
        } catch (error) {
          logger.warn('設定の同期に失敗:', error);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  return {
    settings,
    updateSettings,
    saveSettings,
    resetSettings,
    isLoading,
    error,
  };
};

/**
 * 読み取り専用のゴミ箱設定フック
 * 設定の読み込みのみを行い、保存機能は提供しない
 */
export const useRecycleBinSettingsReadOnly = (): RecycleBinSettings => {
  const [settings, setSettings] = useState<RecycleBinSettings>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as RecycleBinSettings;
        if (typeof parsed.retentionDays === 'number' || parsed.retentionDays === null) {
          return parsed;
        }
      }
    } catch (error) {
      logger.warn('ゴミ箱設定の読み込みに失敗:', error);
    }
    return DEFAULT_RECYCLE_BIN_SETTINGS;
  });

  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY && e.newValue) {
        try {
          const newSettings = JSON.parse(e.newValue) as RecycleBinSettings;
          setSettings(newSettings);
        } catch (error) {
          logger.warn('設定の同期に失敗:', error);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  return settings;
};