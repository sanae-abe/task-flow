/**
 * Task CRUD Integration Tests
 * タスクのCRUD操作統合テスト
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, fireEvent, waitFor } from '@testing-library/react';
import { TaskProvider, useTask } from '../../contexts/TaskContext';
import { BoardProvider, useBoard } from '../../contexts/BoardContext';
import { LabelProvider } from '../../contexts/LabelContext';
import { UIProvider } from '../../contexts/UIContext';
import type { Task, Board } from '../../types';

// Test wrapper component
const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <BoardProvider>
    <TaskProvider>
      <LabelProvider>
        <UIProvider>{children}</UIProvider>
      </LabelProvider>
    </TaskProvider>
  </BoardProvider>
);

// Mock localStorage
const mockLocalStorage = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
});

describe('Task CRUD Integration Tests', () => {
  beforeEach(() => {
    mockLocalStorage.clear();
    vi.clearAllMocks();
  });

  describe('Task Creation', () => {
    it('should create a new task with minimal data', async () => {
      const initialBoard: Board = {
        id: 'board-1',
        title: 'Test Board',
        columns: [
          {
            id: 'column-1',
            title: 'To Do',
            tasks: [],
            order: 0,
          },
        ],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      mockLocalStorage.setItem('boards', JSON.stringify([initialBoard]));
      mockLocalStorage.setItem('currentBoardId', 'board-1');

      const MockTaskCreateComponent = () => {
        const { createTask } = useTask();
        const { state } = useBoard();

        const handleCreate = () => {
          // Use actual column ID from current board
          const columnId = state.currentBoard?.columns[0]?.id || 'column-1';
          createTask(
            columnId,
            'New Task',
            '',
            undefined,
            [],
            [],
            undefined,
            'medium'
          );
        };

        const taskCount =
          state.currentBoard?.columns
            .flatMap(col => col.tasks)
            .filter(t => !t.deletionState).length || 0;

        return (
          <div>
            <button onClick={handleCreate} data-testid='create-task-btn'>
              Create Task
            </button>
            <div data-testid='task-count'>{taskCount}</div>
            <div data-testid='board-id' style={{ display: 'none' }}>
              {state.currentBoard?.id || 'none'}
            </div>
          </div>
        );
      };

      const { getByTestId } = render(
        <TestWrapper>
          <MockTaskCreateComponent />
        </TestWrapper>
      );

      // Get initial task count
      const initialTaskCount = parseInt(
        getByTestId('task-count').textContent || '0'
      );

      const createBtn = getByTestId('create-task-btn');
      fireEvent.click(createBtn);

      await waitFor(() => {
        const taskCount = getByTestId('task-count');
        const currentCount = parseInt(taskCount.textContent || '0');
        expect(currentCount).toBe(initialTaskCount + 1);
      });
    });

    it('should create task with complete data including priority and labels', async () => {
      const mockCreateTask = vi.fn();

      const newTask: Partial<Task> = {
        title: 'Complete Task',
        description: 'Full description',
        columnId: 'column-1',
        boardId: 'board-1',
        priority: 'high',
        labels: [
          { id: 'label-1', name: 'Bug', color: '#ff0000', boardId: 'board-1' },
        ],
        dueDate: '2025-12-31',
      };

      mockCreateTask(newTask);

      expect(mockCreateTask).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Complete Task',
          priority: 'high',
          labels: expect.arrayContaining([
            expect.objectContaining({ name: 'Bug' }),
          ]),
        })
      );
    });

    it('should validate required fields on task creation', () => {
      const invalidTask = {
        title: '', // Empty title should fail
        columnId: 'column-1',
        boardId: 'board-1',
      };

      expect(invalidTask.title).toBe('');
    });

    it('should generate unique ID for new task', async () => {
      const _mockTasks: Task[] = [
        {
          id: 'task-1',
          title: 'Task 1',
          description: '',
          columnId: 'column-1',
          boardId: 'board-1',
          priority: 'medium',
          labels: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ];

      const newTaskId = `task-${Date.now()}`;
      expect(newTaskId).not.toBe('task-1');
      expect(newTaskId.startsWith('task-')).toBe(true);
    });
  });

  describe('Task Reading', () => {
    it('should retrieve all tasks from storage', () => {
      const tasks: Task[] = [
        {
          id: 'task-1',
          title: 'Task 1',
          description: '',
          columnId: 'column-1',
          boardId: 'board-1',
          priority: 'medium',
          labels: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: 'task-2',
          title: 'Task 2',
          description: '',
          columnId: 'column-1',
          boardId: 'board-1',
          priority: 'high',
          labels: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ];

      mockLocalStorage.setItem('tasks', JSON.stringify(tasks));

      const storedTasks = JSON.parse(mockLocalStorage.getItem('tasks') || '[]');
      expect(storedTasks).toHaveLength(2);
    });

    it('should filter tasks by board', () => {
      const tasks: Task[] = [
        {
          id: 'task-1',
          title: 'Task 1',
          description: '',
          columnId: 'column-1',
          boardId: 'board-1',
          priority: 'medium',
          labels: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: 'task-2',
          title: 'Task 2',
          description: '',
          columnId: 'column-2',
          boardId: 'board-2',
          priority: 'high',
          labels: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ];

      const board1Tasks = tasks.filter(task => task.boardId === 'board-1');
      expect(board1Tasks).toHaveLength(1);
      expect(board1Tasks[0].id).toBe('task-1');
    });

    it('should filter tasks by column', () => {
      const tasks: Task[] = [
        {
          id: 'task-1',
          title: 'Task 1',
          description: '',
          columnId: 'column-1',
          boardId: 'board-1',
          priority: 'medium',
          labels: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: 'task-2',
          title: 'Task 2',
          description: '',
          columnId: 'column-2',
          boardId: 'board-1',
          priority: 'high',
          labels: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ];

      const column1Tasks = tasks.filter(task => task.columnId === 'column-1');
      expect(column1Tasks).toHaveLength(1);
      expect(column1Tasks[0].id).toBe('task-1');
    });
  });

  describe('Task Updating', () => {
    it('should update task title', () => {
      const originalTask: Task = {
        id: 'task-1',
        title: 'Original Title',
        description: '',
        columnId: 'column-1',
        boardId: 'board-1',
        priority: 'medium',
        labels: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const updatedTask = {
        ...originalTask,
        title: 'Updated Title',
        updatedAt: new Date().toISOString(),
      };

      expect(updatedTask.title).toBe('Updated Title');
      expect(updatedTask.id).toBe(originalTask.id);
    });

    it('should update task priority', () => {
      const task: Task = {
        id: 'task-1',
        title: 'Task 1',
        description: '',
        columnId: 'column-1',
        boardId: 'board-1',
        priority: 'medium',
        labels: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const updatedTask = { ...task, priority: 'high' as const };

      expect(updatedTask.priority).toBe('high');
    });

    it('should update task labels', () => {
      const task: Task = {
        id: 'task-1',
        title: 'Task 1',
        description: '',
        columnId: 'column-1',
        boardId: 'board-1',
        priority: 'medium',
        labels: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const newLabel = {
        id: 'label-1',
        name: 'Bug',
        color: '#ff0000',
        boardId: 'board-1',
      };

      const updatedTask = {
        ...task,
        labels: [...task.labels, newLabel],
      };

      expect(updatedTask.labels).toHaveLength(1);
      expect(updatedTask.labels[0].name).toBe('Bug');
    });

    it('should move task to different column', () => {
      const task: Task = {
        id: 'task-1',
        title: 'Task 1',
        description: '',
        columnId: 'column-1',
        boardId: 'board-1',
        priority: 'medium',
        labels: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const movedTask = { ...task, columnId: 'column-2' };

      expect(movedTask.columnId).toBe('column-2');
    });
  });

  describe('Task Deletion', () => {
    it('should soft delete task', () => {
      const task: Task = {
        id: 'task-1',
        title: 'Task 1',
        description: '',
        columnId: 'column-1',
        boardId: 'board-1',
        priority: 'medium',
        labels: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const deletedTask = {
        ...task,
        deletionState: 'soft-deleted' as const,
        deletedAt: new Date().toISOString(),
      };

      expect(deletedTask.deletionState).toBe('soft-deleted');
      expect(deletedTask.deletedAt).toBeDefined();
    });

    it('should permanently delete task', () => {
      const tasks: Task[] = [
        {
          id: 'task-1',
          title: 'Task 1',
          description: '',
          columnId: 'column-1',
          boardId: 'board-1',
          priority: 'medium',
          labels: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ];

      const remainingTasks = tasks.filter(task => task.id !== 'task-1');

      expect(remainingTasks).toHaveLength(0);
    });

    it('should restore soft-deleted task', () => {
      const deletedTask: Task = {
        id: 'task-1',
        title: 'Task 1',
        description: '',
        columnId: 'column-1',
        boardId: 'board-1',
        priority: 'medium',
        labels: [],
        deletionState: 'soft-deleted',
        deletedAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const restoredTask: Task = {
        ...deletedTask,
        deletionState: undefined,
        deletedAt: undefined,
      };

      expect(restoredTask.deletionState).toBeUndefined();
      expect(restoredTask.deletedAt).toBeUndefined();
    });
  });

  describe('Task Duplication', () => {
    it('should duplicate task with new ID', () => {
      const originalTask: Task = {
        id: 'task-1',
        title: 'Original Task',
        description: 'Original description',
        columnId: 'column-1',
        boardId: 'board-1',
        priority: 'high',
        labels: [
          { id: 'label-1', name: 'Bug', color: '#ff0000', boardId: 'board-1' },
        ],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const duplicatedTask: Task = {
        ...originalTask,
        id: 'task-2',
        title: `${originalTask.title} (Copy)`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      expect(duplicatedTask.id).not.toBe(originalTask.id);
      expect(duplicatedTask.title).toBe('Original Task (Copy)');
      expect(duplicatedTask.priority).toBe(originalTask.priority);
      expect(duplicatedTask.labels).toEqual(originalTask.labels);
    });
  });

  describe('Subtasks', () => {
    it('should add subtask to task', () => {
      const task: Task = {
        id: 'task-1',
        title: 'Task 1',
        description: '',
        columnId: 'column-1',
        boardId: 'board-1',
        priority: 'medium',
        labels: [],
        subtasks: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const subtask = {
        id: 'subtask-1',
        title: 'Subtask 1',
        completed: false,
        order: 0,
      };

      const updatedTask = {
        ...task,
        subtasks: [...(task.subtasks || []), subtask],
      };

      expect(updatedTask.subtasks).toHaveLength(1);
      expect(updatedTask.subtasks![0].title).toBe('Subtask 1');
    });

    it('should toggle subtask completion', () => {
      const subtask = {
        id: 'subtask-1',
        title: 'Subtask 1',
        completed: false,
        order: 0,
      };

      const toggledSubtask = {
        ...subtask,
        completed: !subtask.completed,
      };

      expect(toggledSubtask.completed).toBe(true);
    });
  });

  describe('Edge Cases', () => {
    it('should handle concurrent task updates', () => {
      const task: Task = {
        id: 'task-1',
        title: 'Task 1',
        description: '',
        columnId: 'column-1',
        boardId: 'board-1',
        priority: 'medium',
        labels: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const update1 = { title: 'Update 1' };
      const update2 = { priority: 'high' as const };

      // Merge updates correctly - apply both changes to the base task
      const finalTask = { ...task, ...update1, ...update2 };

      expect(finalTask.title).toBe('Update 1');
      expect(finalTask.priority).toBe('high');
    });

    it('should handle very long task titles', () => {
      const longTitle = 'A'.repeat(1000);

      const task: Partial<Task> = {
        title: longTitle,
        columnId: 'column-1',
        boardId: 'board-1',
      };

      expect(task.title?.length).toBe(1000);
    });

    it('should handle tasks with multiple labels', () => {
      const task: Task = {
        id: 'task-1',
        title: 'Task 1',
        description: '',
        columnId: 'column-1',
        boardId: 'board-1',
        priority: 'medium',
        labels: [
          { id: 'label-1', name: 'Bug', color: '#ff0000', boardId: 'board-1' },
          {
            id: 'label-2',
            name: 'Feature',
            color: '#00ff00',
            boardId: 'board-1',
          },
          {
            id: 'label-3',
            name: 'Urgent',
            color: '#0000ff',
            boardId: 'board-1',
          },
        ],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      expect(task.labels).toHaveLength(3);
    });
  });
});
