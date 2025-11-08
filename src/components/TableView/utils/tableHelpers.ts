import type { TFunction } from 'i18next';
import type { Task, Priority } from '../../../types';
import type { TaskWithColumn } from '../../../types/table';
import { buildPriorityConfig } from '../../../utils/priorityConfig';

/**
 * 型ガード関数：TaskWithColumn型かどうかを判定
 */
export const isTaskWithColumn = (task: Task): task is TaskWithColumn =>
  'columnId' in task && 'columnTitle' in task && 'status' in task;

/**
 * 優先度をローカライズされたテキストに変換
 * @param priority 優先度
 * @param t 翻訳関数
 * @returns ローカライズされた優先度テキスト
 */
export const getPriorityText = (priority: Priority, t: TFunction): string => {
  const priorityConfig = buildPriorityConfig(t);
  return priorityConfig[priority]?.label || '';
};

/**
 * サブタスクの完了率を計算
 * @param task タスクオブジェクト
 * @returns 完了率（0-100の整数）
 */
export const getCompletionRate = (task: Task): number => {
  if (!task.subTasks || task.subTasks.length === 0) {
    return 0;
  }
  const completed = task.subTasks.filter(sub => sub.completed).length;
  return Math.round((completed / task.subTasks.length) * 100);
};

/**
 * 期限日の色を取得
 * @param isOverdue 期限切れかどうか
 * @param isDueToday 今日が期限かどうか
 * @param isDueTomorrow 明日が期限かどうか
 * @returns カラープロパティ
 */
export const getDateColorClass = (
  isOverdue: boolean,
  isDueToday: boolean,
  isDueTomorrow: boolean
): string => {
  if (isOverdue) {
    return 'text-destructive';
  }
  if (isDueToday) {
    return 'text-warning';
  }
  if (isDueTomorrow) {
    return 'text-success';
  }
  return 'text-foreground';
};
