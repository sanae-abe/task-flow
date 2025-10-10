import { DEFAULT_SETTINGS, type AppSettings, type DefaultColumnConfig } from '../types/settings';
import { logger } from './logger';

const SETTINGS_STORAGE_KEY = 'taskflow-app-settings';

/**
 * 設定をLocalStorageに保存
 */
export const saveSettings = (settings: AppSettings): void => {
  try {
    const serialized = JSON.stringify(settings);
    localStorage.setItem(SETTINGS_STORAGE_KEY, serialized);
  } catch (error) {
    logger.error('Failed to save settings:', error);
    throw new Error('設定の保存に失敗しました');
  }
};

/**
 * 設定をLocalStorageから読み込み
 */
export const loadSettings = (): AppSettings => {
  try {
    const serialized = localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (!serialized) {
      return DEFAULT_SETTINGS;
    }

    const parsed = JSON.parse(serialized);

    // 基本的なバリデーション
    if (!parsed || typeof parsed !== 'object') {
      logger.warn('Invalid settings format, using defaults');
      return DEFAULT_SETTINGS;
    }

    // デフォルトカラム設定のバリデーション
    if (!Array.isArray(parsed.defaultColumns)) {
      logger.warn('Invalid defaultColumns format, using defaults');
      return DEFAULT_SETTINGS;
    }

    // 各カラム設定のバリデーション
    const validatedColumns = parsed.defaultColumns
      .filter((col: unknown) => col && typeof col === 'object' && col !== null &&
        'id' in col && 'name' in col &&
        typeof (col as Record<string, unknown>)['id'] === 'string' &&
        typeof (col as Record<string, unknown>)['name'] === 'string')
      .map((col: unknown) => ({
        id: (col as { id: string; name: string }).id,
        name: (col as { id: string; name: string }).name
      }));

    if (validatedColumns.length === 0) {
      logger.warn('No valid default columns found, using defaults');
      return DEFAULT_SETTINGS;
    }

    return {
      defaultColumns: validatedColumns
    };
  } catch (error) {
    logger.error('Failed to load settings:', error);
    return DEFAULT_SETTINGS;
  }
};

/**
 * デフォルトカラム設定を更新
 */
export const updateDefaultColumns = (columns: DefaultColumnConfig[]): void => {
  const currentSettings = loadSettings();
  const updatedSettings: AppSettings = {
    ...currentSettings,
    defaultColumns: columns
  };
  saveSettings(updatedSettings);
};

/**
 * 設定をリセット
 */
export const resetSettings = (): void => {
  saveSettings(DEFAULT_SETTINGS);
};