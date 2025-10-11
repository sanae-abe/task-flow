import type { Task, SortOption } from '../types';
import { getPriorityWeight } from './priorityConfig';

export const sortTasks = (tasks: Task[], sortOption: SortOption): Task[] => {
  // manualの場合は元の順序を保持
  if (sortOption === 'manual') {
    return [...tasks];
  }
  
  return [...tasks].sort((a, b) => {
    switch (sortOption) {
      case 'title':
        return a.title.localeCompare(b.title, 'ja');
        
      case 'createdAt':
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        
      case 'updatedAt':
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
        
      case 'dueDate': {
        // 期限がないタスクは後ろに配置
        if (!a.dueDate && !b.dueDate) {return 0;}
        if (!a.dueDate) {return 1;}
        if (!b.dueDate) {return -1;}

        // 期限が近いものから順番に
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      }

      case 'priority': {
        // 優先度でソート（緊急→高→中→低→未設定の順）
        const weightA = getPriorityWeight(a.priority);
        const weightB = getPriorityWeight(b.priority);

        // 重みが同じ場合は作成日順（新しいものから）
        if (weightA === weightB) {
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        }

        return weightA - weightB;
      }

      default:
        return 0;
    }
  });
};