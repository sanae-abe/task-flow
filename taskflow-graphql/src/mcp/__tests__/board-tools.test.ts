/**
 * Board Tools Tests
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  handleCreateBoard,
  handleListBoards,
  handleGetBoard,
  handleUpdateBoard,
} from '../tools/board-tools.js';
import * as indexeddb from '../../utils/indexeddb.js';

// Mock indexeddb
vi.mock('../../utils/indexeddb.js', () => ({
  getBoard: vi.fn(),
  getAllBoards: vi.fn(),
  createBoard: vi.fn(),
  updateBoard: vi.fn(),
  deleteBoard: vi.fn(),
}));

describe('Board Tools', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('handleCreateBoard', () => {
    it('should create a board with required fields', async () => {
      const mockBoard = {
        id: 'board-1',
        name: 'Test Board',
        description: '',
        columns: [
          { id: 'col-1', name: 'To Do', position: 0, taskIds: [] },
          { id: 'col-2', name: 'In Progress', position: 1, taskIds: [] },
          { id: 'col-3', name: 'Done', position: 2, taskIds: [] },
        ],
        settings: { defaultColumn: 'col-1' },
        isShared: false,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      };

      vi.mocked(indexeddb.createBoard).mockResolvedValue(mockBoard);

      const result = await handleCreateBoard({ name: 'Test Board' });

      expect(result.isError).toBeFalsy();
      expect(result.content[0].text).toContain('board-1');
      expect(result.content[0].text).toContain('Test Board');
      expect(result.content[0].text).toContain('To Do');
    });

    it('should create a board with description', async () => {
      const mockBoard = {
        id: 'board-2',
        name: 'Project Board',
        description: 'Main project board',
        columns: [
          { id: 'col-1', name: 'To Do', position: 0, taskIds: [] },
          { id: 'col-2', name: 'In Progress', position: 1, taskIds: [] },
          { id: 'col-3', name: 'Done', position: 2, taskIds: [] },
        ],
        settings: { defaultColumn: 'col-1' },
        isShared: false,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      };

      vi.mocked(indexeddb.createBoard).mockResolvedValue(mockBoard);

      const result = await handleCreateBoard({
        name: 'Project Board',
        description: 'Main project board',
      });

      expect(result.isError).toBeFalsy();
      expect(result.content[0].text).toContain('Main project board');
    });

    it('should handle errors gracefully', async () => {
      vi.mocked(indexeddb.createBoard).mockRejectedValue(
        new Error('Database error')
      );

      const result = await handleCreateBoard({ name: 'Error Board' });

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('Error creating board');
    });
  });

  describe('handleListBoards', () => {
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
        {
          id: 'board-2',
          name: 'Board 2',
          description: '',
          columns: [],
          settings: {},
          isShared: false,
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z',
        },
      ];

      vi.mocked(indexeddb.getAllBoards).mockResolvedValue(mockBoards);

      const result = await handleListBoards();

      expect(result.isError).toBeFalsy();
      expect(result.content[0].text).toContain('"total": 2');
      expect(result.content[0].text).toContain('board-1');
      expect(result.content[0].text).toContain('board-2');
    });

    it('should handle empty board list', async () => {
      vi.mocked(indexeddb.getAllBoards).mockResolvedValue([]);

      const result = await handleListBoards();

      expect(result.isError).toBeFalsy();
      expect(result.content[0].text).toContain('"total": 0');
    });

    it('should handle errors gracefully', async () => {
      vi.mocked(indexeddb.getAllBoards).mockRejectedValue(
        new Error('Database error')
      );

      const result = await handleListBoards();

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('Error listing boards');
    });
  });

  describe('handleGetBoard', () => {
    it('should get a board by ID', async () => {
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

      const result = await handleGetBoard({ id: 'board-1' });

      expect(result.isError).toBeFalsy();
      expect(result.content[0].text).toContain('board-1');
      expect(result.content[0].text).toContain('Test Board');
    });

    it('should return error when board not found', async () => {
      vi.mocked(indexeddb.getBoard).mockResolvedValue(null);

      const result = await handleGetBoard({ id: 'nonexistent' });

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('not found');
    });

    it('should handle errors gracefully', async () => {
      vi.mocked(indexeddb.getBoard).mockRejectedValue(
        new Error('Database error')
      );

      const result = await handleGetBoard({ id: 'board-1' });

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('Error getting board');
    });
  });

  describe('handleUpdateBoard', () => {
    it('should update board name', async () => {
      const mockBoard = {
        id: 'board-1',
        name: 'Updated Board',
        description: '',
        columns: [],
        settings: {},
        isShared: false,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-02T00:00:00Z',
      };

      vi.mocked(indexeddb.updateBoard).mockResolvedValue(mockBoard);

      const result = await handleUpdateBoard({
        id: 'board-1',
        name: 'Updated Board',
      });

      expect(result.isError).toBeFalsy();
      expect(result.content[0].text).toContain('Updated Board');
    });

    it('should update board description', async () => {
      const mockBoard = {
        id: 'board-1',
        name: 'Board',
        description: 'New description',
        columns: [],
        settings: {},
        isShared: false,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-02T00:00:00Z',
      };

      vi.mocked(indexeddb.updateBoard).mockResolvedValue(mockBoard);

      const result = await handleUpdateBoard({
        id: 'board-1',
        description: 'New description',
      });

      expect(result.isError).toBeFalsy();
      expect(result.content[0].text).toContain('New description');
    });

    it('should return error when board not found', async () => {
      vi.mocked(indexeddb.updateBoard).mockResolvedValue(null);

      const result = await handleUpdateBoard({
        id: 'nonexistent',
        name: 'Updated',
      });

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('not found');
    });

    it('should handle errors gracefully', async () => {
      vi.mocked(indexeddb.updateBoard).mockRejectedValue(
        new Error('Update failed')
      );

      const result = await handleUpdateBoard({
        id: 'board-1',
        name: 'Error',
      });

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('Error updating board');
    });
  });
});
