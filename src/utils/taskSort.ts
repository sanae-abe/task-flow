import type { Task, SortOption } from '../types';

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
        
      default:
        return 0;
    }
  });
};