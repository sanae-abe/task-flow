import type { Task, Priority } from "../../../types";
import type { TaskWithColumn } from "../../../types/table";

/**
 * 型ガード関数：TaskWithColumn型かどうかを判定
 */
export const isTaskWithColumn = (task: Task): task is TaskWithColumn =>
  "columnId" in task && "columnTitle" in task && "status" in task;

/**
 * 優先度を日本語テキストに変換
 * @param priority 優先度
 * @returns 日本語の優先度テキスト
 */
export const getPriorityText = (priority: Priority): string => {
  switch (priority) {
    case "low":
      return "低";
    case "medium":
      return "中";
    case "high":
      return "高";
    case "critical":
      return "緊急";
    default:
      return "";
  }
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
  const completed = task.subTasks.filter((sub) => sub.completed).length;
  return Math.round((completed / task.subTasks.length) * 100);
};

/**
 * 期限日の色を取得
 * @param isOverdue 期限切れかどうか
 * @param isDueToday 今日が期限かどうか
 * @param isDueTomorrow 明日が期限かどうか
 * @returns カラープロパティ
 */
export const getDateColor = (
  isOverdue: boolean,
  isDueToday: boolean,
  isDueTomorrow: boolean,
): string => {
  if (isOverdue) {
    return "danger.emphasis";
  }
  if (isDueToday) {
    return "attention.emphasis";
  }
  if (isDueTomorrow) {
    return "accent.emphasis";
  }
  return "fg.default";
};
