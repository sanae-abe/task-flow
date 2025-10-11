import type { Label, Priority, RecurrenceConfig } from '../types';

/**
 * テンプレートカテゴリー
 */
export type TemplateCategory =
  | 'work' // 仕事
  | 'personal' // 個人
  | 'project' // プロジェクト
  | 'meeting' // 会議
  | 'routine' // ルーティン
  | 'other'; // その他

/**
 * テンプレートカテゴリー情報
 */
export interface TemplateCategoryInfo {
  id: TemplateCategory;
  label: string;
  description: string;
  icon?: string;
}

/**
 * タスクテンプレート
 */
export interface TaskTemplate {
  id: string;
  name: string; // テンプレート名
  description: string; // テンプレートの説明
  category: TemplateCategory;

  // タスクデータ
  taskTitle: string;
  taskDescription: string;
  priority?: Priority;
  labels: Label[];
  dueDate: string | null; // 相対的な期限（例："+1d", "+1w", "+1m"）
  recurrence?: RecurrenceConfig;

  // メタデータ
  createdAt: string;
  updatedAt: string;
  usageCount: number; // 使用回数
  isFavorite: boolean; // お気に入り

  // ボード関連
  boardId?: string; // 特定のボードに紐付ける場合
  columnId?: string; // デフォルトのカラムID
}

/**
 * テンプレートフォームデータ
 */
export interface TemplateFormData {
  name: string;
  description: string;
  category: TemplateCategory;
  taskTitle: string;
  taskDescription: string;
  priority?: Priority;
  labels: Label[];
  dueDate: string | null;
  recurrence?: RecurrenceConfig;
  isFavorite: boolean;
  boardId?: string;
  columnId?: string;
}

/**
 * テンプレート検索フィルター
 */
export interface TemplateFilter {
  category?: TemplateCategory;
  isFavorite?: boolean;
  searchQuery?: string;
  boardId?: string;
}

/**
 * テンプレートソートオプション
 */
export type TemplateSortField = 'name' | 'category' | 'usageCount' | 'createdAt' | 'updatedAt';
export type TemplateSortDirection = 'asc' | 'desc';

export interface TemplateSortConfig {
  field: TemplateSortField;
  direction: TemplateSortDirection;
}
