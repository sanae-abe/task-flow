/**
 * Task Tools Tests
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  handleCreateTask,
  handleUpdateTask,
  handleDeleteTask,
  handleGetTask,
  handleListTasks,
  handleCompleteTask,
} from '../tools/task-tools.js';
import * as indexeddb from '../../utils/indexeddb.js';

// Mock indexeddb
vi.mock('../../utils/indexeddb.js', () => ({
  getTask: vi.fn(),
  getAllTasks: vi.fn(),
  getTasksByBoard: vi.fn(),
  createTask: vi.fn(),
  updateTask: vi.fn(),
  deleteTask: vi.fn(),
}));

describe('Task Tools', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('handleCreateTask', () => {
    it('should create a task with required fields', async () => {
      const mockTask = {
        id: 'task-1',
        title: 'Test Task',
        description: '',
        boardId: 'board-1',
        columnId: 'col-1',
        status: 'TODO' as const,
        priority: 'MEDIUM' as const,
        labels: [],
        subtasks: [],
        files: [],
        position: 0,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      };

      vi.mocked(indexeddb.createTask).mockResolvedValue(mockTask);

      const result = await handleCreateTask({
        title: 'Test Task',
        boardId: 'board-1',
        columnId: 'col-1',
      });

      expect(result.isError).toBeFalsy();
      expect(result.content[0].text).toContain('task-1');
      expect(result.content[0].text).toContain('Test Task');
    });

    it('should create a task with all optional fields', async () => {
      const mockTask = {
        id: 'task-2',
        title: 'Complex Task',
        description: 'Detailed description',
        boardId: 'board-1',
        columnId: 'col-1',
        status: 'TODO' as const,
        priority: 'HIGH' as const,
        labels: ['label-1'],
        subtasks: [],
        files: [],
        position: 0,
        dueDate: '2024-12-31T00:00:00Z',
        dueTime: '23:59',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      };

      vi.mocked(indexeddb.createTask).mockResolvedValue(mockTask);

      const result = await handleCreateTask({
        title: 'Complex Task',
        description: 'Detailed description',
        boardId: 'board-1',
        columnId: 'col-1',
        priority: 'HIGH',
        dueDate: '2024-12-31T00:00:00Z',
        dueTime: '23:59',
        labels: ['label-1'],
      });

      expect(result.isError).toBeFalsy();
      expect(result.content[0].text).toContain('Complex Task');
      expect(result.content[0].text).toContain('HIGH');
    });

    it('should handle errors gracefully', async () => {
      vi.mocked(indexeddb.createTask).mockRejectedValue(
        new Error('Database error')
      );

      const result = await handleCreateTask({
        title: 'Error Task',
        boardId: 'board-1',
        columnId: 'col-1',
      });

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('Error creating task');
    });
  });

  describe('handleUpdateTask', () => {
    it('should update task fields', async () => {
      const mockTask = {
        id: 'task-1',
        title: 'Updated Task',
        description: 'Updated description',
        boardId: 'board-1',
        columnId: 'col-1',
        status: 'IN_PROGRESS' as const,
        priority: 'HIGH' as const,
        labels: [],
        subtasks: [],
        files: [],
        position: 0,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-02T00:00:00Z',
      };

      vi.mocked(indexeddb.updateTask).mockResolvedValue(mockTask);

      const result = await handleUpdateTask({
        id: 'task-1',
        title: 'Updated Task',
        status: 'IN_PROGRESS',
        priority: 'HIGH',
      });

      expect(result.isError).toBeFalsy();
      expect(result.content[0].text).toContain('Updated Task');
      expect(result.content[0].text).toContain('IN_PROGRESS');
    });

    it('should return error when task not found', async () => {
      vi.mocked(indexeddb.updateTask).mockResolvedValue(null);

      const result = await handleUpdateTask({
        id: 'nonexistent',
        title: 'Updated',
      });

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('not found');
    });

    it('should handle errors gracefully', async () => {
      vi.mocked(indexeddb.updateTask).mockRejectedValue(
        new Error('Update failed')
      );

      const result = await handleUpdateTask({
        id: 'task-1',
        title: 'Error',
      });

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('Error updating task');
    });
  });

  describe('handleDeleteTask', () => {
    it('should soft delete a task', async () => {
      const mockTask = {
        id: 'task-1',
        title: 'Deleted Task',
        description: '',
        boardId: 'board-1',
        columnId: 'col-1',
        status: 'DELETED' as const,
        priority: 'MEDIUM' as const,
        labels: [],
        subtasks: [],
        files: [],
        position: 0,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-02T00:00:00Z',
        deletedAt: '2024-01-02T00:00:00Z',
      };

      vi.mocked(indexeddb.updateTask).mockResolvedValue(mockTask);

      const result = await handleDeleteTask({ id: 'task-1' });

      expect(result.isError).toBeFalsy();
      expect(result.content[0].text).toContain('success');
      expect(indexeddb.updateTask).toHaveBeenCalledWith(
        'task-1',
        expect.objectContaining({
          status: 'DELETED',
          deletedAt: expect.any(String),
        })
      );
    });

    it('should return error when task not found', async () => {
      vi.mocked(indexeddb.updateTask).mockResolvedValue(null);

      const result = await handleDeleteTask({ id: 'nonexistent' });

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('not found');
    });
  });

  describe('handleGetTask', () => {
    it('should get a task by ID', async () => {
      const mockTask = {
        id: 'task-1',
        title: 'Test Task',
        description: '',
        boardId: 'board-1',
        columnId: 'col-1',
        status: 'TODO' as const,
        priority: 'MEDIUM' as const,
        labels: [],
        subtasks: [],
        files: [],
        position: 0,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      };

      vi.mocked(indexeddb.getTask).mockResolvedValue(mockTask);

      const result = await handleGetTask({ id: 'task-1' });

      expect(result.isError).toBeFalsy();
      expect(result.content[0].text).toContain('task-1');
      expect(result.content[0].text).toContain('Test Task');
    });

    it('should return error when task not found', async () => {
      vi.mocked(indexeddb.getTask).mockResolvedValue(null);

      const result = await handleGetTask({ id: 'nonexistent' });

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('not found');
    });
  });

  describe('handleListTasks', () => {
    const mockTasks = [
      {
        id: 'task-1',
        title: 'Task 1',
        description: '',
        boardId: 'board-1',
        columnId: 'col-1',
        status: 'TODO' as const,
        priority: 'HIGH' as const,
        labels: [],
        subtasks: [],
        files: [],
        position: 0,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      },
      {
        id: 'task-2',
        title: 'Task 2',
        description: '',
        boardId: 'board-1',
        columnId: 'col-1',
        status: 'IN_PROGRESS' as const,
        priority: 'MEDIUM' as const,
        labels: [],
        subtasks: [],
        files: [],
        position: 1,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      },
    ];

    it('should list all tasks', async () => {
      vi.mocked(indexeddb.getAllTasks).mockResolvedValue(mockTasks);

      const result = await handleListTasks({});

      expect(result.isError).toBeFalsy();
      expect(result.content[0].text).toContain('"total": 2');
      expect(result.content[0].text).toContain('task-1');
      expect(result.content[0].text).toContain('task-2');
    });

    it('should filter tasks by board', async () => {
      vi.mocked(indexeddb.getTasksByBoard).mockResolvedValue([mockTasks[0]]);

      const result = await handleListTasks({ boardId: 'board-1' });

      expect(result.isError).toBeFalsy();
      expect(result.content[0].text).toContain('"total": 1');
    });

    it('should filter tasks by status', async () => {
      vi.mocked(indexeddb.getAllTasks).mockResolvedValue(mockTasks);

      const result = await handleListTasks({ status: 'TODO' });

      expect(result.isError).toBeFalsy();
      const parsed = JSON.parse(result.content[0].text);
      expect(parsed.total).toBe(1);
      expect(parsed.tasks[0].status).toBe('TODO');
    });

    it('should filter tasks by priority', async () => {
      vi.mocked(indexeddb.getAllTasks).mockResolvedValue(mockTasks);

      const result = await handleListTasks({ priority: 'HIGH' });

      expect(result.isError).toBeFalsy();
      const parsed = JSON.parse(result.content[0].text);
      expect(parsed.total).toBe(1);
      expect(parsed.tasks[0].priority).toBe('HIGH');
    });

    it('should limit the number of tasks', async () => {
      vi.mocked(indexeddb.getAllTasks).mockResolvedValue(mockTasks);

      const result = await handleListTasks({ limit: 1 });

      expect(result.isError).toBeFalsy();
      const parsed = JSON.parse(result.content[0].text);
      expect(parsed.total).toBe(1);
    });
  });

  describe('handleCompleteTask', () => {
    it('should mark task as completed', async () => {
      const mockTask = {
        id: 'task-1',
        title: 'Completed Task',
        description: '',
        boardId: 'board-1',
        columnId: 'col-1',
        status: 'COMPLETED' as const,
        priority: 'MEDIUM' as const,
        labels: [],
        subtasks: [],
        files: [],
        position: 0,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-02T00:00:00Z',
        completedAt: '2024-01-02T00:00:00Z',
      };

      vi.mocked(indexeddb.updateTask).mockResolvedValue(mockTask);

      const result = await handleCompleteTask({ id: 'task-1' });

      expect(result.isError).toBeFalsy();
      expect(result.content[0].text).toContain('COMPLETED');
      expect(indexeddb.updateTask).toHaveBeenCalledWith(
        'task-1',
        expect.objectContaining({
          status: 'COMPLETED',
          completedAt: expect.any(String),
        })
      );
    });
  });
});
