import type { Task, RecurrenceConfig } from '../types';
import { calculateNextDueDate, isRecurrenceComplete } from './recurrence';

/**
 * カレンダー表示用の仮想繰り返しタスク
 */
export interface VirtualRecurringTask {
  id: string;
  originalTaskId: string;
  title: string;
  description: string;
  dueDate: string;
  isVirtual: true;
  priority: Task['priority'];
  labels: Task['labels'];
  occurrenceCount: number;
  recurrence: RecurrenceConfig;
}

/**
 * 指定期間内の繰り返しタスクのすべてのインスタンスを生成
 */
export function generateRecurringTaskInstances(
  task: Task,
  startDate: Date,
  endDate: Date,
  maxInstances: number = 50
): VirtualRecurringTask[] {
  if (!task.recurrence?.enabled || !task.dueDate) {
    return [];
  }

  const instances: VirtualRecurringTask[] = [];
  let currentDueDate = task.dueDate;
  let occurrenceCount = task.occurrenceCount || 1;

  // 最初のインスタンスが期間内にある場合はスキップ（実際のタスクが表示されるため）
  if (new Date(currentDueDate) >= startDate && new Date(currentDueDate) <= endDate) {
    currentDueDate = calculateNextDueDate(currentDueDate, task.recurrence) || '';
    occurrenceCount++;
  }

  while (instances.length < maxInstances && currentDueDate) {
    const instanceDate = new Date(currentDueDate);

    // 終了日を超えた場合は処理終了
    if (instanceDate > endDate) {
      break;
    }

    // 繰り返し条件をチェック
    if (isRecurrenceComplete(task.recurrence, occurrenceCount, currentDueDate)) {
      break;
    }

    // 開始日以降の場合はインスタンスを追加
    if (instanceDate >= startDate) {
      instances.push({
        id: `${task.id}-virtual-${occurrenceCount}`,
        originalTaskId: task.id,
        title: task.title,
        description: task.description,
        dueDate: currentDueDate,
        isVirtual: true,
        priority: task.priority,
        labels: task.labels,
        occurrenceCount,
        recurrence: task.recurrence,
      });
    }

    // 次の期限を計算
    const nextDueDate = calculateNextDueDate(currentDueDate, task.recurrence);
    if (!nextDueDate) {
      break;
    }

    currentDueDate = nextDueDate;
    occurrenceCount++;
  }

  return instances;
}

/**
 * カレンダー表示用のタスクリストを生成（実際のタスク + 仮想繰り返しタスク）
 */
export function generateCalendarTasks(
  tasks: Task[],
  startDate: Date,
  endDate: Date
): (Task | VirtualRecurringTask)[] {
  const calendarTasks: (Task | VirtualRecurringTask)[] = [];

  // 実際のタスクを追加
  tasks.forEach(task => {
    calendarTasks.push(task);

    // 繰り返しタスクの仮想インスタンスを生成
    if (task.recurrence?.enabled && !task.completedAt) {
      const virtualInstances = generateRecurringTaskInstances(task, startDate, endDate);
      calendarTasks.push(...virtualInstances);
    }
  });

  return calendarTasks;
}

/**
 * 指定日付のタスクをフィルタリング（仮想タスク対応）
 */
export function getTasksForDate(
  tasks: (Task | VirtualRecurringTask)[],
  targetDate: Date
): (Task | VirtualRecurringTask)[] {
  const targetDateString = targetDate.toISOString().split('T')[0];

  return tasks.filter(task => {
    if (!task.dueDate) {
      return false;
    }
    const taskDateString = task.dueDate.split('T')[0];
    return taskDateString === targetDateString;
  });
}

/**
 * 仮想タスクかどうかを判定
 */
export function isVirtualTask(task: Task | VirtualRecurringTask): task is VirtualRecurringTask {
  return 'isVirtual' in task && task.isVirtual === true;
}

/**
 * カレンダー表示範囲を計算（前後1ヶ月）
 */
export function getCalendarDateRange(currentDate: Date): { startDate: Date; endDate: Date } {
  const startDate = new Date(currentDate);
  startDate.setMonth(startDate.getMonth() - 1);
  startDate.setDate(1);

  const endDate = new Date(currentDate);
  endDate.setMonth(endDate.getMonth() + 2);
  endDate.setDate(0); // 前月の最終日

  return { startDate, endDate };
}