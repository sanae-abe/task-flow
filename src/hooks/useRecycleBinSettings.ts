import { useState, useCallback, useEffect } from 'react';
import {
  DEFAULT_RECYCLE_BIN_SETTINGS,
  type RecycleBinSettings,
} from '../types/settings';
import {
  RECYCLE_BIN_STORAGE_KEY,
  RECYCLE_BIN_SETTINGS_CHANGED_EVENT,
} from '../constants/recycleBin';
import { logger } from '../utils/logger';

const STORAGE_KEY = RECYCLE_BIN_STORAGE_KEY;

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
        if (
          typeof parsed.retentionDays === 'number' ||
          parsed.retentionDays === null
        ) {
          return parsed;
        }
      }
    } catch (_error) {
      logger.warn('ゴミ箱設定の読み込みに失敗:', _error);
    }
    return DEFAULT_RECYCLE_BIN_SETTINGS;
  });

  const [isLoading, setIsLoading] = useState(false);
  const [_error, setError] = useState<string | null>(null);

  /**
   * 設定をLocalStorageに保存
   */
  const saveSettings = useCallback(
    async (newSettings: RecycleBinSettings): Promise<boolean> => {
      setIsLoading(true);
      setError(null);

      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newSettings));
        setSettings(newSettings);

        // 同一タブ内での更新通知のためカスタムイベントを発行
        const customEvent = new CustomEvent(
          RECYCLE_BIN_SETTINGS_CHANGED_EVENT,
          {
            detail: newSettings,
          }
        );
        window.dispatchEvent(customEvent);

        logger.info('ゴミ箱設定を保存しました:', newSettings);
        return true;
      } catch (_error) {
        const errorMessage = 'ゴミ箱設定の保存に失敗しました';
        logger._error(errorMessage, _error);
        setError(errorMessage);
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  /**
   * 設定を更新（LocalStorageへの保存は行わない）
   */
  const updateSettings = useCallback((newSettings: RecycleBinSettings) => {
    setSettings(newSettings);
  }, []);

  /**
   * 設定をリセット
   */
  const resetSettings = useCallback(
    async (): Promise<boolean> => saveSettings(DEFAULT_RECYCLE_BIN_SETTINGS),
    [saveSettings]
  );

  /**
   * LocalStorageの変更を監視してリアルタイム更新
   */
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY && e.newValue) {
        try {
          const newSettings = JSON.parse(e.newValue) as RecycleBinSettings;
          setSettings(newSettings);
        } catch (_error) {
          logger.warn('設定の同期に失敗:', _error);
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
    _error,
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
        if (
          typeof parsed.retentionDays === 'number' ||
          parsed.retentionDays === null
        ) {
          return parsed;
        }
      }
    } catch (_error) {
      logger.warn('ゴミ箱設定の読み込みに失敗:', _error);
    }
    return DEFAULT_RECYCLE_BIN_SETTINGS;
  });

  useEffect(() => {
    // LocalStorageの変更を監視（他のタブから）
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY && e.newValue) {
        try {
          const newSettings = JSON.parse(e.newValue) as RecycleBinSettings;
          setSettings(newSettings);
        } catch (_error) {
          logger.warn('設定の同期に失敗:', _error);
        }
      }
    };

    // カスタムイベントを監視（同一タブ内から）
    const handleCustomEvent = (e: CustomEvent<RecycleBinSettings>) => {
      try {
        setSettings(e.detail);
      } catch (_error) {
        logger.warn('設定の同期に失敗:', _error);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener(
      RECYCLE_BIN_SETTINGS_CHANGED_EVENT,
      handleCustomEvent as EventListener
    );

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener(
        RECYCLE_BIN_SETTINGS_CHANGED_EVENT,
        handleCustomEvent as EventListener
      );
    };
  }, []);

  return settings;
};
