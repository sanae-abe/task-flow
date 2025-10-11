import type { TaskTemplate, TemplateFormData } from '../types/template';
import { logger } from './logger';
import { v4 as uuidv4 } from 'uuid';

const STORAGE_KEY = 'taskflow-templates';
const STORAGE_VERSION = '1.0.0';

/**
 * ストレージデータのスキーマ
 */
export interface TemplateStorageSchema {
  version: string;
  templates: TaskTemplate[];
  updatedAt: string;
}

/**
 * ストレージエラーの種類
 */
export type TemplateStorageErrorType =
  | 'STORAGE_UNAVAILABLE'
  | 'PARSE_ERROR'
  | 'VALIDATION_ERROR'
  | 'QUOTA_EXCEEDED'
  | 'UNKNOWN_ERROR';

/**
 * ストレージエラークラス
 */
export class TemplateStorageError extends Error {
  constructor(
    public type: TemplateStorageErrorType,
    message: string,
    public originalError?: unknown
  ) {
    super(message);
    this.name = 'TemplateStorageError';
  }
}

/**
 * ストレージが利用可能かチェック
 */
const isStorageAvailable = (): boolean => {
  try {
    const testKey = '__storage_test__';
    localStorage.setItem(testKey, 'test');
    localStorage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
};

/**
 * テンプレートデータのバリデーション
 */
const validateTemplate = (template: unknown): template is TaskTemplate => {
  if (!template || typeof template !== 'object') {
    return false;
  }

  const t = template as Partial<TaskTemplate>;

  // 必須フィールドのチェック
  if (
    typeof t.id !== 'string' ||
    typeof t.name !== 'string' ||
    typeof t.description !== 'string' ||
    typeof t.category !== 'string' ||
    typeof t.taskTitle !== 'string' ||
    typeof t.taskDescription !== 'string' ||
    typeof t.priority !== 'string' ||
    !Array.isArray(t.labels) ||
    typeof t.createdAt !== 'string' ||
    typeof t.updatedAt !== 'string' ||
    typeof t.usageCount !== 'number' ||
    typeof t.isFavorite !== 'boolean'
  ) {
    return false;
  }

  // カテゴリーの値チェック
  const validCategories = ['work', 'personal', 'project', 'meeting', 'routine', 'other'];
  if (!validCategories.includes(t.category)) {
    return false;
  }

  // プライオリティの値チェック
  const validPriorities = ['low', 'medium', 'high'];
  if (!validPriorities.includes(t.priority)) {
    return false;
  }

  // dueDateの型チェック
  if (t.dueDate !== null && t.dueDate !== undefined && typeof t.dueDate !== 'string') {
    return false;
  }

  return true;
};

/**
 * ストレージデータのバリデーション
 */
const validateStorageData = (data: unknown): data is TemplateStorageSchema => {
  if (!data || typeof data !== 'object') {
    return false;
  }

  const d = data as Partial<TemplateStorageSchema>;

  if (
    typeof d.version !== 'string' ||
    !Array.isArray(d.templates) ||
    typeof d.updatedAt !== 'string'
  ) {
    return false;
  }

  // 全てのテンプレートをバリデート
  return d.templates.every(validateTemplate);
};

/**
 * テンプレートストレージクラス
 */
export class TemplateStorage {
  /**
   * 全テンプレートを読み込む
   */
  static load(): TaskTemplate[] {
    if (!isStorageAvailable()) {
      logger.warn('LocalStorage is not available');
      throw new TemplateStorageError(
        'STORAGE_UNAVAILABLE',
        'LocalStorageが利用できません'
      );
    }

    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      logger.debug('📖 Loading templates from localStorage:', stored ? 'found data' : 'no data');

      if (!stored) {
        return [];
      }

      const data = JSON.parse(stored) as unknown;

      // データバリデーション
      if (!validateStorageData(data)) {
        logger.warn('Invalid template storage data, resetting to empty');
        this.save([]);
        return [];
      }

      // バージョンマイグレーション
      if (data.version !== STORAGE_VERSION) {
        logger.info(`Migrating template data from ${data.version} to ${STORAGE_VERSION}`);
        const migrated = this.migrate(data);
        this.save(migrated.templates);
        return migrated.templates;
      }

      logger.debug('📖 Loaded', data.templates.length, 'templates from localStorage');
      return data.templates;
    } catch (error) {
      if (error instanceof SyntaxError) {
        logger.error('Failed to parse template data:', error);
        throw new TemplateStorageError(
          'PARSE_ERROR',
          'テンプレートデータの解析に失敗しました',
          error
        );
      }
      throw new TemplateStorageError(
        'UNKNOWN_ERROR',
        'テンプレートの読み込み中にエラーが発生しました',
        error
      );
    }
  }

  /**
   * テンプレートを保存する
   */
  static save(templates: TaskTemplate[]): void {
    if (!isStorageAvailable()) {
      throw new TemplateStorageError(
        'STORAGE_UNAVAILABLE',
        'LocalStorageが利用できません'
      );
    }

    // 各テンプレートをバリデート
    const invalidTemplates = templates.filter(t => !validateTemplate(t));
    if (invalidTemplates.length > 0) {
      logger.error('Invalid templates found:', invalidTemplates);
      throw new TemplateStorageError(
        'VALIDATION_ERROR',
        `${invalidTemplates.length}個の無効なテンプレートが見つかりました`
      );
    }

    const data: TemplateStorageSchema = {
      version: STORAGE_VERSION,
      templates,
      updatedAt: new Date().toISOString(),
    };

    try {
      logger.debug('💾 Saving templates to localStorage:', templates.length, 'templates');
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      if (error instanceof Error && error.name === 'QuotaExceededError') {
        logger.error('LocalStorage quota exceeded:', error);
        throw new TemplateStorageError(
          'QUOTA_EXCEEDED',
          'ストレージの容量制限を超えました',
          error
        );
      }
      throw new TemplateStorageError(
        'UNKNOWN_ERROR',
        'テンプレートの保存中にエラーが発生しました',
        error
      );
    }
  }

  /**
   * テンプレートを作成する
   */
  static create(formData: TemplateFormData): TaskTemplate {
    const now = new Date().toISOString();
    const template: TaskTemplate = {
      id: uuidv4(),
      ...formData,
      createdAt: now,
      updatedAt: now,
      usageCount: 0,
    };

    const templates = this.load();
    templates.push(template);
    this.save(templates);

    logger.info('Template created:', template.name);
    return template;
  }

  /**
   * テンプレートを更新する
   */
  static update(id: string, updates: Partial<TemplateFormData>): TaskTemplate | null {
    const templates = this.load();
    const index = templates.findIndex(t => t.id === id);

    if (index === -1) {
      logger.warn('Template not found:', id);
      return null;
    }

    const updatedTemplate: TaskTemplate = {
      ...templates[index]!,
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    templates[index] = updatedTemplate;
    this.save(templates);

    logger.info('Template updated:', updatedTemplate.name);
    return updatedTemplate;
  }

  /**
   * テンプレートを削除する
   */
  static delete(id: string): boolean {
    const templates = this.load();
    const filtered = templates.filter(t => t.id !== id);

    if (filtered.length === templates.length) {
      logger.warn('Template not found:', id);
      return false;
    }

    this.save(filtered);
    logger.info('Template deleted:', id);
    return true;
  }

  /**
   * テンプレートの使用回数をインクリメント
   */
  static incrementUsage(id: string): void {
    const templates = this.load();
    const template = templates.find(t => t.id === id);

    if (!template) {
      logger.warn('Template not found:', id);
      return;
    }

    template.usageCount += 1;
    template.updatedAt = new Date().toISOString();
    this.save(templates);

    logger.debug('Template usage incremented:', template.name, template.usageCount);
  }

  /**
   * お気に入りの切り替え
   */
  static toggleFavorite(id: string): boolean {
    const templates = this.load();
    const template = templates.find(t => t.id === id);

    if (!template) {
      logger.warn('Template not found:', id);
      return false;
    }

    template.isFavorite = !template.isFavorite;
    template.updatedAt = new Date().toISOString();
    this.save(templates);

    logger.info('Template favorite toggled:', template.name, template.isFavorite);
    return template.isFavorite;
  }

  /**
   * ストレージをクリア
   */
  static clear(): void {
    if (!isStorageAvailable()) {
      throw new TemplateStorageError(
        'STORAGE_UNAVAILABLE',
        'LocalStorageが利用できません'
      );
    }

    try {
      localStorage.removeItem(STORAGE_KEY);
      logger.info('Template storage cleared');
    } catch (error) {
      throw new TemplateStorageError(
        'UNKNOWN_ERROR',
        'ストレージのクリア中にエラーが発生しました',
        error
      );
    }
  }

  /**
   * データをエクスポート
   */
  static export(): TemplateStorageSchema {
    const templates = this.load();
    return {
      version: STORAGE_VERSION,
      templates,
      updatedAt: new Date().toISOString(),
    };
  }

  /**
   * データをインポート
   */
  static import(data: unknown, options: { merge?: boolean; replaceAll?: boolean } = {}): void {
    const { merge = false, replaceAll = false } = options;

    // データバリデーション
    if (!validateStorageData(data)) {
      throw new TemplateStorageError(
        'VALIDATION_ERROR',
        'インポートデータが無効です'
      );
    }

    let templates = data.templates;

    // マイグレーション
    if (data.version !== STORAGE_VERSION) {
      logger.info(`Migrating imported data from ${data.version} to ${STORAGE_VERSION}`);
      const migrated = this.migrate(data);
      templates = migrated.templates;
    }

    if (replaceAll) {
      // 既存データを完全に置き換え
      this.save(templates);
      logger.info('Templates replaced with imported data:', templates.length);
    } else if (merge) {
      // 既存データとマージ
      const existing = this.load();
      const existingIds = new Set(existing.map(t => t.id));

      // IDが重複する場合は新しいIDを生成
      const newTemplates = templates.map(template => {
        if (existingIds.has(template.id)) {
          return {
            ...template,
            id: uuidv4(),
            name: `${template.name} (インポート)`,
            updatedAt: new Date().toISOString(),
          };
        }
        return template;
      });

      this.save([...existing, ...newTemplates]);
      logger.info('Templates merged with imported data:', newTemplates.length);
    } else {
      // 新しいIDで追加
      const existing = this.load();
      const newTemplates = templates.map(template => ({
        ...template,
        id: uuidv4(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }));

      this.save([...existing, ...newTemplates]);
      logger.info('Templates imported:', newTemplates.length);
    }
  }

  /**
   * データマイグレーション
   */
  private static migrate(data: TemplateStorageSchema): TemplateStorageSchema {
    // 現在はバージョン1.0.0のみなので、将来の拡張用
    logger.info('No migration needed for version:', data.version);
    return {
      ...data,
      version: STORAGE_VERSION,
    };
  }

  /**
   * ストレージサイズを取得（バイト単位）
   */
  static getStorageSize(): number {
    if (!isStorageAvailable()) {
      return 0;
    }

    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? new Blob([stored]).size : 0;
    } catch {
      return 0;
    }
  }

  /**
   * ストレージ情報を取得
   */
  static getStorageInfo(): {
    templatesCount: number;
    storageSize: number;
    version: string;
    lastUpdated: string | null;
  } {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) {
        return {
          templatesCount: 0,
          storageSize: 0,
          version: STORAGE_VERSION,
          lastUpdated: null,
        };
      }

      const data = JSON.parse(stored) as TemplateStorageSchema;
      return {
        templatesCount: data.templates.length,
        storageSize: new Blob([stored]).size,
        version: data.version,
        lastUpdated: data.updatedAt,
      };
    } catch {
      return {
        templatesCount: 0,
        storageSize: 0,
        version: STORAGE_VERSION,
        lastUpdated: null,
      };
    }
  }
}
