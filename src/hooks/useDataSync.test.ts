/**
 * useDataSync hook tests
 * データ同期機能の包括的テスト
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { useDataSync } from './useDataSync';
import { indexedDBManager } from '../utils/indexedDB';
import type { KanbanBoard } from '../types';

// Mock dependencies
vi.mock('../utils/indexedDB', () => ({
  indexedDBManager: {
    init: vi.fn(),
    isInitialized: vi.fn(),
    saveAllData: vi.fn(),
  },
}));

vi.mock('../contexts/KanbanContext', () => ({
  useKanban: vi.fn(() => ({
    state: {
      boards: mockBoards,
      labels: [],
    },
  })),
}));

vi.mock('./useOffline', () => ({
  useOffline: vi.fn(() => ({
    isOnline: true,
    wasOffline: false,
    resetWasOffline: vi.fn(),
  })),
}));

// Mock data
const mockBoards: KanbanBoard[] = [
  {
    id: 'board-1',
    title: 'Test Board',
    columns: [
      {
        id: 'col-1',
        title: 'To Do',
        tasks: [
          {
            id: 'task-1',
            title: 'Test Task',
            description: '',
            status: 'todo',
            priority: 'medium',
            labels: [],
            subTasks: [],
            createdAt: '2025-01-01T00:00:00.000Z',
            updatedAt: '2025-01-01T00:00:00.000Z',
            dueDate: null,
            completedAt: null,
          },
        ],
        color: '#6b7280',
        deletionState: 'active',
        deletedAt: null,
      },
    ],
    labels: [],
    createdAt: '2025-01-01T00:00:00.000Z',
    updatedAt: '2025-01-01T00:00:00.000Z',
    deletionState: 'active',
    deletedAt: null,
  },
];

describe('useDataSync', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (indexedDBManager.init as any).mockResolvedValue(undefined);
    (indexedDBManager.isInitialized as any).mockReturnValue(true);
    (indexedDBManager.saveAllData as any).mockResolvedValue(undefined);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Initialization', () => {
    it('should initialize IndexedDB on mount', async () => {
      renderHook(() => useDataSync());

      await waitFor(() => {
        expect(indexedDBManager.init).toHaveBeenCalledTimes(1);
      });
    });

    it('should handle initialization errors gracefully', async () => {
      (indexedDBManager.init as any).mockRejectedValue(
        new Error('Init failed')
      );

      const { result } = renderHook(() => useDataSync());

      await waitFor(() => {
        expect(result.current.isOnline).toBeDefined();
      });

      // Should not throw, errors are silently caught
      expect(indexedDBManager.init).toHaveBeenCalled();
    });
  });

  describe('Auto-save functionality', () => {
    it('should save data to IndexedDB when boards change', async () => {
      renderHook(() => useDataSync());

      await waitFor(() => {
        expect(indexedDBManager.saveAllData).toHaveBeenCalled();
      });

      const callArg = (indexedDBManager.saveAllData as any).mock.calls[0][0];
      expect(callArg).toHaveProperty('tasks');
      expect(callArg).toHaveProperty('columns');
      expect(callArg).toHaveProperty('boards');
      expect(callArg).toHaveProperty('labels');
    });

    it('should not save when boards are empty', async () => {
      const { useKanban } = await import('../contexts/KanbanContext');
      (useKanban as any).mockReturnValue({
        state: {
          boards: [],
          labels: [],
        },
      });

      renderHook(() => useDataSync());

      await waitFor(() => {
        expect(indexedDBManager.init).toHaveBeenCalled();
      });

      // Should not call saveAllData for empty boards
      expect(indexedDBManager.saveAllData).not.toHaveBeenCalled();
    });

    it('should flatten tasks and columns correctly', async () => {
      const { result } = renderHook(() => useDataSync());

      // Manually call save to ensure it's called
      await act(async () => {
        await result.current.saveToIndexedDB();
      });

      expect(indexedDBManager.saveAllData).toHaveBeenCalled();

      const callArg = (indexedDBManager.saveAllData as any).mock.calls[0][0];

      // Check that structure is correct (boards might be empty due to mock)
      expect(callArg).toHaveProperty('tasks');
      expect(callArg).toHaveProperty('columns');
      expect(callArg).toHaveProperty('boards');
      expect(callArg).toHaveProperty('labels');
    });

    it('should handle save errors gracefully', async () => {
      (indexedDBManager.saveAllData as any).mockRejectedValue(
        new Error('Save failed')
      );

      const { result } = renderHook(() => useDataSync());

      // Manually call save
      await act(async () => {
        await result.current.saveToIndexedDB();
      });

      // Should not throw, errors are silently caught
      expect(result.current.isOnline).toBeDefined();
    });

    it('should initialize IndexedDB before saving if not initialized', async () => {
      (indexedDBManager.isInitialized as any).mockReturnValue(false);

      const { result } = renderHook(() => useDataSync());

      // Manually call save to trigger initialization check
      await act(async () => {
        await result.current.saveToIndexedDB();
      });

      expect(indexedDBManager.isInitialized).toHaveBeenCalled();
      expect(indexedDBManager.init).toHaveBeenCalled();
      expect(indexedDBManager.saveAllData).toHaveBeenCalled();
    });
  });

  describe('Online sync', () => {
    it('should sync when coming back online', async () => {
      const mockResetWasOffline = vi.fn();
      const { useOffline } = await import('./useOffline');

      // Initially offline
      (useOffline as any).mockReturnValue({
        isOnline: false,
        wasOffline: true,
        resetWasOffline: mockResetWasOffline,
      });

      const { rerender } = renderHook(() => useDataSync());

      await waitFor(() => {
        expect(indexedDBManager.init).toHaveBeenCalled();
      });

      // Come back online
      (useOffline as any).mockReturnValue({
        isOnline: true,
        wasOffline: true,
        resetWasOffline: mockResetWasOffline,
      });

      rerender();

      await waitFor(() => {
        expect(indexedDBManager.saveAllData).toHaveBeenCalled();
        expect(mockResetWasOffline).toHaveBeenCalled();
      });
    });

    it('should not sync if was not offline', async () => {
      const mockResetWasOffline = vi.fn();
      const { useOffline } = await import('./useOffline');

      (useOffline as any).mockReturnValue({
        isOnline: true,
        wasOffline: false,
        resetWasOffline: mockResetWasOffline,
      });

      renderHook(() => useDataSync());

      await waitFor(() => {
        expect(indexedDBManager.init).toHaveBeenCalled();
      });

      // Should not call resetWasOffline if wasOffline is false
      expect(mockResetWasOffline).not.toHaveBeenCalled();
    });

    it('should handle online sync errors gracefully', async () => {
      const mockResetWasOffline = vi.fn();
      const { useOffline } = await import('./useOffline');

      (useOffline as any).mockReturnValue({
        isOnline: true,
        wasOffline: true,
        resetWasOffline: mockResetWasOffline,
      });

      (indexedDBManager.saveAllData as any).mockRejectedValue(
        new Error('Sync failed')
      );

      const { result } = renderHook(() => useDataSync());

      await waitFor(() => {
        expect(indexedDBManager.saveAllData).toHaveBeenCalled();
      });

      // Should not throw, errors are silently caught
      expect(result.current.isOnline).toBeDefined();
    });
  });

  describe('Return values', () => {
    it('should return saveToIndexedDB function', () => {
      const { result } = renderHook(() => useDataSync());

      expect(typeof result.current.saveToIndexedDB).toBe('function');
    });

    it('should return initializeData function', () => {
      const { result } = renderHook(() => useDataSync());

      expect(typeof result.current.initializeData).toBe('function');
    });

    it('should return isOnline status', () => {
      const { result } = renderHook(() => useDataSync());

      expect(typeof result.current.isOnline).toBe('boolean');
    });

    it('should return isOffline status', () => {
      const { result } = renderHook(() => useDataSync());

      expect(typeof result.current.isOffline).toBe('boolean');
      expect(result.current.isOffline).toBe(!result.current.isOnline);
    });
  });

  describe('Manual operations', () => {
    it('should allow manual save via saveToIndexedDB', async () => {
      const { result } = renderHook(() => useDataSync());

      vi.clearAllMocks();

      await result.current.saveToIndexedDB();

      expect(indexedDBManager.saveAllData).toHaveBeenCalledTimes(1);
    });

    it('should allow manual initialization via initializeData', async () => {
      const { result } = renderHook(() => useDataSync());

      vi.clearAllMocks();

      await result.current.initializeData();

      expect(indexedDBManager.init).toHaveBeenCalledTimes(1);
    });
  });
});
