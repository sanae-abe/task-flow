import type { Task, TaskFilter } from '../types';

/**
 * タスクフィルタリング関数
 * フィルター条件に基づいてタスクを絞り込む
 */
export const filterTasks = (tasks: Task[], filter: TaskFilter): Task[] => {
  if (filter.type === 'all') {
    return tasks;
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const threeDaysFromNow = new Date(today);
  threeDaysFromNow.setDate(today.getDate() + 3);

  switch (filter.type) {
    case 'due-within-3-days': {
      return tasks.filter(task => {
        if (!task.dueDate) {return false;}
        const dueDate = new Date(task.dueDate);
        dueDate.setHours(0, 0, 0, 0);
        return dueDate >= today && dueDate <= threeDaysFromNow;
      });
    }

    case 'due-today': {
      return tasks.filter(task => {
        if (!task.dueDate) {return false;}
        const dueDate = new Date(task.dueDate);
        dueDate.setHours(0, 0, 0, 0);
        return dueDate.getTime() === today.getTime();
      });
    }

    case 'overdue': {
      return tasks.filter(task => {
        if (!task.dueDate) {return false;}
        const dueDate = new Date(task.dueDate);
        dueDate.setHours(0, 0, 0, 0);
        return dueDate < today;
      });
    }

    case 'label': {
      // ラベル名ベースのフィルタリングを優先し、IDベースもサポート
      if (filter.selectedLabelNames && filter.selectedLabelNames.length > 0) {
        return tasks.filter(task => 
          task.labels?.some(label => filter.selectedLabelNames?.includes(label.name))
        );
      }
      if (filter.selectedLabels && filter.selectedLabels.length > 0) {
        return tasks.filter(task => 
          task.labels?.some(label => filter.selectedLabels?.includes(label.id))
        );
      }
      return tasks;
    }

    case 'has-labels': {
      return tasks.filter(task => 
        task.labels && task.labels.length > 0
      );
    }

    case 'priority': {
      if (filter.selectedPriorities && filter.selectedPriorities.length > 0) {
        return tasks.filter(task =>
          // 優先度が未設定のタスクを除外し、選択された優先度のみを表示
          task.priority && filter.selectedPriorities?.includes(task.priority)
        );
      }
      return tasks;
    }

    default:
      return tasks;
  }
};

/**
 * フィルター適用後のタスク数を取得
 */
export const getFilteredTaskCount = (tasks: Task[], filter: TaskFilter): number => filterTasks(tasks, filter).length;

/**
 * フィルターが有効かどうかを判定
 */
export const isFilterActive = (filter: TaskFilter): boolean => {
  if (filter.type === 'all') {return false;}
  if (filter.type === 'label') {
    return (filter.selectedLabelNames?.length ?? 0) > 0 || (filter.selectedLabels?.length ?? 0) > 0;
  }
  if (filter.type === 'priority') {
    return (filter.selectedPriorities?.length ?? 0) > 0;
  }
  return true;
};