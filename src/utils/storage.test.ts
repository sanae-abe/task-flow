/**
 * Storage utility functions tests
 * ストレージユーティリティ関数の包括的テスト
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  saveBoards,
  loadBoards,
  protectDemoBoard,
  restoreDemoBoard,
  hasDemoBoard,
  clearStorage,
} from './storage';
import type { KanbanBoard } from '../types';

// Mock logger
vi.mock('./logger', () => ({
  logger: {
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}));

// Mock uuid
vi.mock('uuid', () => ({
  v4: () => `test-uuid-${Math.random().toString(36).substr(2, 9)}`,
}));

describe('Storage Utils', () => {
  let mockLocalStorage: { [key: string]: string };
  const STORAGE_KEY = 'kanban-boards';
  const DEMO_BACKUP_KEY = 'kanban-demo-backup';
  const DEMO_BOARD_FLAG = '__DEMO_BOARD__';

  beforeEach(() => {
    // Mock localStorage
    mockLocalStorage = {};
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: vi.fn(key => mockLocalStorage[key] || null),
        setItem: vi.fn((key, value) => {
          mockLocalStorage[key] = value;
        }),
        removeItem: vi.fn(key => {
          delete mockLocalStorage[key];
        }),
        clear: vi.fn(() => {
          mockLocalStorage = {};
        }),
      },
      writable: true,
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
    mockLocalStorage = {};
  });

  // Helper function to create a basic test board
  const createTestBoard = (
    id = 'test-board-1',
    title = 'Test Board'
  ): KanbanBoard => ({
    id,
    title,
    columns: [
      {
        id: 'col-1',
        title: 'Test Column',
        tasks: [],
        color: '#6b7280',
      },
    ],
    labels: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

  describe('saveBoards', () => {
    it('should save boards to localStorage', () => {
      const testBoards = [createTestBoard()];

      saveBoards(testBoards);

      expect(localStorage.setItem).toHaveBeenCalledWith(
        STORAGE_KEY,
        JSON.stringify(testBoards)
      );
    });

    it('should save current board ID when provided', () => {
      const testBoards = [createTestBoard()];
      const currentBoardId = 'test-board-1';

      saveBoards(testBoards, currentBoardId);

      expect(localStorage.setItem).toHaveBeenCalledWith(
        'current-board-id',
        currentBoardId
      );
    });

    it('should restore demo board from backup when missing', () => {
      const testBoards = [createTestBoard()];

      // Get a demo board by calling loadBoards when localStorage is empty
      const demoBoard = loadBoards()[0]; // This creates demo board when no data exists

      // デモボードのバックアップを設定
      mockLocalStorage[DEMO_BACKUP_KEY] = JSON.stringify([demoBoard]);

      saveBoards(testBoards);

      // デモボードが復元されて先頭に追加されることを確認
      expect(localStorage.setItem).toHaveBeenCalledWith(
        STORAGE_KEY,
        expect.stringContaining('TaskFlow デモプロジェクト')
      );
    });

    it('should handle localStorage errors gracefully', () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      // localStorage.setItemでエラーを発生させる
      vi.mocked(localStorage.setItem).mockImplementationOnce(() => {
        throw new Error('localStorage is full');
      });

      const testBoards = [createTestBoard()];

      // エラーが発生してもクラッシュしない
      expect(() => saveBoards(testBoards)).not.toThrow();

      consoleSpy.mockRestore();
    });

    it('should not restore demo board when already present', () => {
      const demoBoard = loadBoards()[0]; // This creates demo board when no data exists
      const testBoards = [demoBoard, createTestBoard()];

      saveBoards(testBoards);

      // 通常の保存が行われる
      expect(localStorage.setItem).toHaveBeenCalledWith(
        STORAGE_KEY,
        JSON.stringify(testBoards)
      );
    });
  });

  describe('loadBoards', () => {
    it('should load boards from localStorage', () => {
      const testBoards = [createTestBoard()];
      mockLocalStorage[STORAGE_KEY] = JSON.stringify(testBoards);

      const loadedBoards = loadBoards();

      expect(loadedBoards).toHaveLength(1);
      expect(loadedBoards[0].title).toBe('Test Board');
    });

    it('should create demo board when no data exists', () => {
      const loadedBoards = loadBoards();

      expect(loadedBoards).toHaveLength(1);
      expect(loadedBoards[0].title).toBe('TaskFlow デモプロジェクト');
    });

    it('should create demo board when data is invalid', () => {
      mockLocalStorage[STORAGE_KEY] = 'invalid json';

      const loadedBoards = loadBoards();

      expect(loadedBoards).toHaveLength(1);
      expect(loadedBoards[0].title).toBe('TaskFlow デモプロジェクト');
    });

    it('should create demo board when data is not an array', () => {
      mockLocalStorage[STORAGE_KEY] = JSON.stringify({ invalid: 'data' });

      const loadedBoards = loadBoards();

      expect(loadedBoards).toHaveLength(1);
      expect(loadedBoards[0].title).toBe('TaskFlow デモプロジェクト');
    });

    it('should normalize board data structure', () => {
      const boardWithMissingFields = {
        id: 'test-board',
        title: 'Test Board',
        columns: [
          {
            id: 'col-1',
            title: 'Test Column',
            tasks: [
              {
                id: 'task-1',
                title: 'Test Task',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                // Missing optional fields
              },
            ],
          },
        ],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        // Missing labels field
      };

      mockLocalStorage[STORAGE_KEY] = JSON.stringify([boardWithMissingFields]);

      const loadedBoards = loadBoards();

      expect(loadedBoards[0].labels).toEqual([]);
      expect(loadedBoards[0].columns[0].tasks[0].files).toEqual([]);
      expect(loadedBoards[0].columns[0].tasks[0].subTasks).toEqual([]);
      expect(loadedBoards[0].columns[0].tasks[0].labels).toEqual([]);
    });

    it('should handle date conversion for legacy data', () => {
      const boardWithDateObjects = {
        id: 'test-board',
        title: 'Test Board',
        columns: [
          {
            id: 'col-1',
            title: 'Test Column',
            tasks: [
              {
                id: 'task-1',
                title: 'Test Task',
                createdAt: new Date(),
                updatedAt: new Date(),
                dueDate: new Date(),
                // Date objects instead of strings
              },
            ],
          },
        ],
        createdAt: new Date(),
        updatedAt: new Date(),
        labels: [],
      };

      mockLocalStorage[STORAGE_KEY] = JSON.stringify([boardWithDateObjects]);

      const loadedBoards = loadBoards();

      expect(typeof loadedBoards[0].createdAt).toBe('string');
      expect(typeof loadedBoards[0].updatedAt).toBe('string');
      expect(typeof loadedBoards[0].columns[0].tasks[0].createdAt).toBe(
        'string'
      );
      expect(typeof loadedBoards[0].columns[0].tasks[0].updatedAt).toBe(
        'string'
      );
      expect(typeof loadedBoards[0].columns[0].tasks[0].dueDate).toBe('string');
    });
  });

  describe('protectDemoBoard', () => {
    it('should return boards with demo board when demo board exists', () => {
      const demoBoard = loadBoards()[0]; // This creates demo board when no data exists
      const boards = [demoBoard, createTestBoard()];
      const protectedBoards = protectDemoBoard(boards);

      expect(protectedBoards).toHaveLength(2);
      expect((protectedBoards[0] as any)[DEMO_BOARD_FLAG]).toBe(true);
    });

    it('should restore demo board when it is missing', () => {
      const regularBoards = [createTestBoard()];

      // Set up localStorage with regular board (no demo board)
      mockLocalStorage[STORAGE_KEY] = JSON.stringify(regularBoards);

      const protectedBoards = protectDemoBoard(regularBoards);

      // Should have restored demo board
      expect(protectedBoards.length).toBeGreaterThanOrEqual(1);
      expect(
        protectedBoards.some(board => (board as any)[DEMO_BOARD_FLAG] === true)
      ).toBe(true);
    });
  });

  describe('restoreDemoBoard', () => {
    it('should restore demo board when missing', () => {
      // Set up existing boards without demo board
      const testBoard = createTestBoard();
      mockLocalStorage[STORAGE_KEY] = JSON.stringify([testBoard]);

      const restoredBoards = restoreDemoBoard();

      expect(restoredBoards.length).toBeGreaterThan(1);
      expect(
        restoredBoards.some(board => (board as any)[DEMO_BOARD_FLAG] === true)
      ).toBe(true);
    });

    it('should return existing boards when demo board already exists', () => {
      const demoBoard = loadBoards()[0]; // This creates demo board when no data exists
      const testBoard = createTestBoard();
      mockLocalStorage[STORAGE_KEY] = JSON.stringify([demoBoard, testBoard]);

      const restoredBoards = restoreDemoBoard();

      expect(restoredBoards).toHaveLength(2);
      expect((restoredBoards[0] as any)[DEMO_BOARD_FLAG]).toBe(true);
    });

    it('should handle localStorage errors gracefully', () => {
      vi.mocked(localStorage.getItem).mockImplementation(() => {
        throw new Error('localStorage error');
      });

      const restoredBoards = restoreDemoBoard();

      // Should return demo board as fallback
      expect(restoredBoards).toHaveLength(1);
      expect(restoredBoards[0].title).toBe('TaskFlow デモプロジェクト');
    });

    it('should create demo board when no data exists', () => {
      const restoredBoards = restoreDemoBoard();

      expect(restoredBoards).toHaveLength(1);
      expect(restoredBoards[0].title).toBe('TaskFlow デモプロジェクト');
    });
  });

  describe('hasDemoBoard', () => {
    it('should return true when demo board exists in localStorage', () => {
      const demoBoard = loadBoards()[0]; // This creates demo board when no data exists
      const boards = [demoBoard, createTestBoard()];
      mockLocalStorage[STORAGE_KEY] = JSON.stringify(boards);

      expect(hasDemoBoard()).toBe(true);
    });

    it('should return false when no demo board exists in localStorage', () => {
      const boards = [createTestBoard()];
      mockLocalStorage[STORAGE_KEY] = JSON.stringify(boards);

      expect(hasDemoBoard()).toBe(false);
    });

    it('should return false when localStorage is empty', () => {
      expect(hasDemoBoard()).toBe(false);
    });

    it('should return false when localStorage contains invalid data', () => {
      mockLocalStorage[STORAGE_KEY] = 'invalid json';

      expect(hasDemoBoard()).toBe(false);
    });
  });

  describe('clearStorage', () => {
    it('should remove storage keys from localStorage', () => {
      mockLocalStorage[STORAGE_KEY] = 'some data';
      mockLocalStorage['current-board-id'] = 'board-1';

      clearStorage();

      expect(localStorage.removeItem).toHaveBeenCalledWith(STORAGE_KEY);
      expect(localStorage.removeItem).toHaveBeenCalledWith('current-board-id');
    });

    it('should handle localStorage errors gracefully', () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      vi.mocked(localStorage.removeItem).mockImplementation(() => {
        throw new Error('localStorage error');
      });

      expect(() => clearStorage()).not.toThrow();

      consoleSpy.mockRestore();
    });
  });

  describe('Error handling and edge cases', () => {
    it('should handle malformed JSON in localStorage', () => {
      mockLocalStorage[STORAGE_KEY] = '{"malformed": json}';

      const loadedBoards = loadBoards();

      // Should fallback to demo board
      expect(loadedBoards).toHaveLength(1);
      expect(loadedBoards[0].title).toBe('TaskFlow デモプロジェクト');
    });

    it('should handle localStorage quota exceeded error', () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      vi.mocked(localStorage.setItem).mockImplementation(() => {
        throw new DOMException('QuotaExceededError');
      });

      const testBoards = [createTestBoard()];

      expect(() => saveBoards(testBoards)).not.toThrow();

      consoleSpy.mockRestore();
    });

    it('should handle null values in localStorage gracefully', () => {
      // Simulate localStorage.getItem returning null
      vi.mocked(localStorage.getItem).mockReturnValue(null);

      const loadedBoards = loadBoards();

      expect(loadedBoards).toHaveLength(1);
      expect(loadedBoards[0].title).toBe('TaskFlow デモプロジェクト');
    });
  });
});
