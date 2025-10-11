import type { TaskTemplate } from '../types/template';
import type { Task } from '../types';
import { v4 as uuidv4 } from 'uuid';
import { logger } from './logger';

/**
 * 相対的な日付文字列をパース
 * 例: "+1d" -> 1日後, "+2w" -> 2週間後, "+3m" -> 3ヶ月後, "+1y" -> 1年後
 */
const parseRelativeDate = (relativeDateStr: string | null): string | null => {
  if (!relativeDateStr) {
    return null;
  }

  // 絶対日付の場合はそのまま返す
  if (!relativeDateStr.startsWith('+') && !relativeDateStr.startsWith('-')) {
    return relativeDateStr;
  }

  const regex = /^([+-])(\d+)([dwmy])$/i;
  const match = relativeDateStr.match(regex);

  if (!match) {
    logger.warn('Invalid relative date format:', relativeDateStr);
    return null;
  }

  const [, sign, amountStr, unit] = match;
  const amount = parseInt(amountStr!, 10);
  const isPositive = sign === '+';

  const now = new Date();
  const targetDate = new Date(now);

  // デフォルト時刻を23:59に設定
  targetDate.setHours(23, 59, 0, 0);

  switch (unit!.toLowerCase()) {
    case 'd': // 日
      targetDate.setDate(now.getDate() + (isPositive ? amount : -amount));
      break;
    case 'w': // 週
      targetDate.setDate(now.getDate() + (isPositive ? amount * 7 : -amount * 7));
      break;
    case 'm': // 月
      targetDate.setMonth(now.getMonth() + (isPositive ? amount : -amount));
      break;
    case 'y': // 年
      targetDate.setFullYear(now.getFullYear() + (isPositive ? amount : -amount));
      break;
    default:
      logger.warn('Unknown date unit:', unit);
      return null;
  }

  return targetDate.toISOString();
};

/**
 * テンプレートの相対日付設定例
 */
export const RELATIVE_DATE_PRESETS = [
  { label: '今日', value: '+0d' },
  { label: '明日', value: '+1d' },
  { label: '3日後', value: '+3d' },
  { label: '1週間後', value: '+1w' },
  { label: '2週間後', value: '+2w' },
  { label: '1ヶ月後', value: '+1m' },
  { label: '3ヶ月後', value: '+3m' },
  { label: '6ヶ月後', value: '+6m' },
  { label: '1年後', value: '+1y' },
] as const;

/**
 * テンプレートからタスクを作成
 */
export interface TemplateToTaskOptions {
  columnId?: string; // 作成先のカラムID
  boardId?: string; // 作成先のボードID
  overrides?: Partial<Task>; // タスクのフィールドを上書き
}

/**
 * テンプレートからタスクを生成
 */
export const templateToTask = (
  template: TaskTemplate,
  options: TemplateToTaskOptions = {}
): Task => {
  const { columnId, boardId, overrides = {} } = options;
  const now = new Date().toISOString();

  // 相対的な期限を絶対日付に変換
  const dueDate = parseRelativeDate(template.dueDate);

  const task: Task = {
    id: uuidv4(),
    title: template.taskTitle,
    description: template.taskDescription,
    priority: template.priority,
    labels: [...template.labels], // ラベルをコピー
    dueDate,
    createdAt: now,
    updatedAt: now,
    completedAt: null,
    files: [],
    subTasks: [],
    recurrence: template.recurrence ? { ...template.recurrence } : undefined,
    ...overrides, // 上書き設定を適用
  };

  logger.info('Task created from template:', {
    templateName: template.name,
    taskTitle: task.title,
    dueDate: task.dueDate,
    columnId,
    boardId,
  });

  return task;
};

/**
 * 複数のテンプレートから一括でタスクを生成
 */
export const templatestoTasks = (
  templates: TaskTemplate[],
  options: TemplateToTaskOptions = {}
): Task[] => templates.map(template => templateToTask(template, options));

/**
 * 既存のタスクからテンプレートを作成
 */
export const taskToTemplate = (
  task: Task,
  templateData: {
    name: string;
    description: string;
    category: TaskTemplate['category'];
    isFavorite?: boolean;
    boardId?: string;
    columnId?: string;
  }
): Omit<TaskTemplate, 'id' | 'createdAt' | 'updatedAt' | 'usageCount'> => ({
    name: templateData.name,
    description: templateData.description,
    category: templateData.category,
    taskTitle: task.title,
    taskDescription: task.description,
    priority: task.priority,
    labels: [...task.labels],
    dueDate: null, // テンプレートでは相対日付として設定する必要があるため、nullにする
    recurrence: task.recurrence ? { ...task.recurrence } : undefined,
    isFavorite: templateData.isFavorite ?? false,
    boardId: templateData.boardId,
    columnId: templateData.columnId,
  });

/**
 * 相対日付の表示用ラベルを取得
 */
export const getRelativeDateLabel = (relativeDateStr: string | null): string => {
  if (!relativeDateStr) {
    return '期限なし';
  }

  const preset = RELATIVE_DATE_PRESETS.find(p => p.value === relativeDateStr);
  if (preset) {
    return preset.label;
  }

  const regex = /^([+-])(\d+)([dwmy])$/i;
  const match = relativeDateStr.match(regex);

  if (!match) {
    return relativeDateStr;
  }

  const [, sign, amount, unit] = match;
  const direction = sign === '+' ? '後' : '前';

  const unitLabel: Record<string, string> = {
    d: '日',
    w: '週間',
    m: 'ヶ月',
    y: '年',
  };

  return `${amount}${unitLabel[unit!.toLowerCase()] || unit}${direction}`;
};

/**
 * 相対日付が有効かチェック
 */
export const isValidRelativeDate = (dateStr: string): boolean => {
  const regex = /^([+-])(\d+)([dwmy])$/i;
  return regex.test(dateStr);
};

/**
 * 相対日付を生成
 */
export const createRelativeDate = (
  amount: number,
  unit: 'd' | 'w' | 'm' | 'y',
  direction: '+' | '-' = '+'
): string => `${direction}${amount}${unit}`;

/**
 * テンプレートのプレビュー用データを生成
 * テンプレートからどのようなタスクが生成されるかを確認できる
 */
export const previewTemplateTask = (template: TaskTemplate): Task => templateToTask(template);

/**
 * テンプレートの検証
 */
export const validateTemplate = (template: Partial<TaskTemplate>): {
  isValid: boolean;
  errors: string[];
} => {
  const errors: string[] = [];

  if (!template.name || template.name.trim() === '') {
    errors.push('テンプレート名は必須です');
  }

  if (!template.taskTitle || template.taskTitle.trim() === '') {
    errors.push('タスクタイトルは必須です');
  }

  if (!template.category) {
    errors.push('カテゴリーは必須です');
  }

  if (!template.priority) {
    errors.push('優先度は必須です');
  }

  if (template.dueDate && !isValidRelativeDate(template.dueDate)) {
    // 絶対日付の場合はISO形式かチェック
    try {
      new Date(template.dueDate);
    } catch {
      errors.push('期限の形式が不正です');
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};
