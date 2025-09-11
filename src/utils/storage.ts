import type { KanbanBoard } from '../types';

const STORAGE_KEY = 'kanban-boards';

interface StoredTask {
  id: string;
  title: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  dueDate?: string;
}

interface StoredColumn {
  id: string;
  title: string;
  tasks: StoredTask[];
}

interface StoredBoard {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  columns: StoredColumn[];
}

export const saveBoards = (boards: KanbanBoard[]): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(boards));
  } catch (error) {
    console.warn('Failed to save boards to localStorage:', error);
  }
};

export const loadBoards = (): KanbanBoard[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return [];
    }
    
    const boards = JSON.parse(stored);
    if (!Array.isArray(boards)) {
      console.warn('Invalid boards data in localStorage');
      return [];
    }
    
    return boards.map((board: StoredBoard) => ({
      ...board,
      createdAt: new Date(board.createdAt),
      updatedAt: new Date(board.updatedAt),
      columns: board.columns.map((column: StoredColumn) => ({
        ...column,
        tasks: column.tasks.map((task: StoredTask) => ({
          ...task,
          createdAt: new Date(task.createdAt),
          updatedAt: new Date(task.updatedAt),
          dueDate: task.dueDate ? new Date(task.dueDate) : undefined,
        })),
      })),
    }));
  } catch (error) {
    console.warn('Failed to load boards from localStorage:', error);
    return [];
  }
};

export const clearStorage = (): void => {
  try {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem('current-board-id');
  } catch (error) {
    console.warn('Failed to clear localStorage:', error);
  }
};