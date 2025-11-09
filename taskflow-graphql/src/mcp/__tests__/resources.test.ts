/**
 * MCP Resources Tests
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { readTaskResource } from '../resources/task-resources.js';
import { readBoardResource } from '../resources/board-resources.js';
import { readResource } from '../resources/index.js';
import * as indexeddb from '../../utils/indexeddb.js';

// Mock indexeddb
vi.mock('../../utils/indexeddb.js', () => ({
  getTask: vi.fn(),
  getAllTasks: vi.fn(),
  getTasksByBoard: vi.fn(),
  getBoard: vi.fn(),
  getAllBoards: vi.fn(),
}));

describe('MCP Resources', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Task Resources', () => {
    describe('task://list', () => {
      it('should list all tasks', async () => {
        const mockTasks = [
          {
            id: 'task-1',
            title: 'Task 1',
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
          },
        ];

        vi.mocked(indexeddb.getAllTasks).mockResolvedValue(mockTasks);

        const result = await readTaskResource('task://list');

        expect(result.contents).toHaveLength(1);
        expect(result.contents[0].uri).toBe('task://list');
        expect(result.contents[0].mimeType).toBe('application/json');
        expect(result.contents[0].text).toContain('"total": 1');
        expect(result.contents[0].text).toContain('task-1');
      });
    });

    describe('task://{id}', () => {
      it('should get a specific task', async () => {
        const mockTask = {
          id: 'task-1',
          title: 'Test Task',
          description: 'Test description',
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
        };

        vi.mocked(indexeddb.getTask).mockResolvedValue(mockTask);

        const result = await readTaskResource('task://task-1');

        expect(result.contents).toHaveLength(1);
        expect(result.contents[0].uri).toBe('task://task-1');
        expect(result.contents[0].text).toContain('task-1');
        expect(result.contents[0].text).toContain('Test Task');
      });

      it('should throw error when task not found', async () => {
        vi.mocked(indexeddb.getTask).mockResolvedValue(null);

        await expect(readTaskResource('task://nonexistent')).rejects.toThrow(
          'not found'
        );
      });
    });

    describe('task://board/{boardId}', () => {
      it('should get tasks by board', async () => {
        const mockTasks = [
          {
            id: 'task-1',
            title: 'Board Task',
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
          },
        ];

        vi.mocked(indexeddb.getTasksByBoard).mockResolvedValue(mockTasks);

        const result = await readTaskResource('task://board/board-1');

        expect(result.contents).toHaveLength(1);
        expect(result.contents[0].text).toContain('"boardId": "board-1"');
        expect(result.contents[0].text).toContain('"total": 1');
      });
    });

    describe('Invalid URI', () => {
      it('should throw error for invalid task URI', async () => {
        await expect(
          readTaskResource('task://invalid/format/here')
        ).rejects.toThrow('Invalid task resource URI');
      });
    });
  });

  describe('Board Resources', () => {
    describe('board://list', () => {
      it('should list all boards', async () => {
        const mockBoards = [
          {
            id: 'board-1',
            name: 'Board 1',
            description: '',
            columns: [],
            settings: {},
            isShared: false,
            createdAt: '2024-01-01T00:00:00Z',
            updatedAt: '2024-01-01T00:00:00Z',
          },
        ];

        vi.mocked(indexeddb.getAllBoards).mockResolvedValue(mockBoards);

        const result = await readBoardResource('board://list');

        expect(result.contents).toHaveLength(1);
        expect(result.contents[0].uri).toBe('board://list');
        expect(result.contents[0].mimeType).toBe('application/json');
        expect(result.contents[0].text).toContain('"total": 1');
        expect(result.contents[0].text).toContain('board-1');
      });
    });

    describe('board://{id}', () => {
      it('should get a specific board', async () => {
        const mockBoard = {
          id: 'board-1',
          name: 'Test Board',
          description: 'Test description',
          columns: [{ id: 'col-1', name: 'To Do', position: 0, taskIds: [] }],
          settings: { defaultColumn: 'col-1' },
          isShared: false,
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z',
        };

        vi.mocked(indexeddb.getBoard).mockResolvedValue(mockBoard);

        const result = await readBoardResource('board://board-1');

        expect(result.contents).toHaveLength(1);
        expect(result.contents[0].uri).toBe('board://board-1');
        expect(result.contents[0].text).toContain('board-1');
        expect(result.contents[0].text).toContain('Test Board');
      });

      it('should throw error when board not found', async () => {
        vi.mocked(indexeddb.getBoard).mockResolvedValue(null);

        await expect(readBoardResource('board://nonexistent')).rejects.toThrow(
          'not found'
        );
      });
    });

    describe('Invalid URI', () => {
      it('should throw error for invalid board URI', async () => {
        await expect(
          readBoardResource('board://invalid/format')
        ).rejects.toThrow('Invalid board resource URI');
      });
    });
  });

  describe('Resource Index', () => {
    it('should route task resources correctly', async () => {
      const mockTasks = [
        {
          id: 'task-1',
          title: 'Task',
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
        },
      ];

      vi.mocked(indexeddb.getAllTasks).mockResolvedValue(mockTasks);

      const result = await readResource('task://list');

      expect(result.contents[0].uri).toBe('task://list');
    });

    it('should route board resources correctly', async () => {
      const mockBoards = [
        {
          id: 'board-1',
          name: 'Board',
          description: '',
          columns: [],
          settings: {},
          isShared: false,
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z',
        },
      ];

      vi.mocked(indexeddb.getAllBoards).mockResolvedValue(mockBoards);

      const result = await readResource('board://list');

      expect(result.contents[0].uri).toBe('board://list');
    });

    it('should throw error for unknown URI scheme', async () => {
      await expect(readResource('unknown://resource')).rejects.toThrow(
        'Unknown resource URI scheme'
      );
    });
  });
});
