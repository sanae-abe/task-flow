/**
 * IndexedDB Manager tests
 * IndexedDB管理クラスの包括的テスト
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { indexedDBManager } from './indexedDB';
import type { Task, Column, KanbanBoard, Label } from '../types';

// Mock IndexedDB
class MockIDBDatabase {
  objectStoreNames = {
    contains: vi.fn((_name: string) => false),
  };
  transaction = vi.fn();
  createObjectStore = vi.fn(() => ({
    createIndex: vi.fn(),
  }));
}

class MockIDBRequest {
  result: any = null;
  error: any = null;
  onsuccess: ((event: any) => void) | null = null;
  onerror: ((event: any) => void) | null = null;

  simulateSuccess(result: any) {
    this.result = result;
    if (this.onsuccess) {
      this.onsuccess({ target: this } as any);
    }
  }

  simulateError(error: any) {
    this.error = error;
    if (this.onerror) {
      this.onerror({ target: this } as any);
    }
  }
}

class MockIDBObjectStore {
  private data: Map<string, any> = new Map();

  get(key: string): MockIDBRequest {
    const request = new MockIDBRequest();
    setTimeout(() => request.simulateSuccess(this.data.get(key)), 0);
    return request;
  }

  getAll(): MockIDBRequest {
    const request = new MockIDBRequest();
    setTimeout(
      () => request.simulateSuccess(Array.from(this.data.values())),
      0
    );
    return request;
  }

  put(value: any): MockIDBRequest {
    const request = new MockIDBRequest();
    this.data.set(value.id, value);
    setTimeout(() => request.simulateSuccess(value.id), 0);
    return request;
  }

  add(value: any): MockIDBRequest {
    const request = new MockIDBRequest();
    this.data.set(value.id, value);
    setTimeout(() => request.simulateSuccess(value.id), 0);
    return request;
  }

  delete(key: string): MockIDBRequest {
    const request = new MockIDBRequest();
    this.data.delete(key);
    setTimeout(() => request.simulateSuccess(undefined), 0);
    return request;
  }

  clear(): MockIDBRequest {
    const request = new MockIDBRequest();
    this.data.clear();
    setTimeout(() => request.simulateSuccess(undefined), 0);
    return request;
  }

  createIndex = vi.fn();
}

class MockIDBTransaction {
  objectStore = vi.fn((_name: string) => new MockIDBObjectStore());
  oncomplete: (() => void) | null = null;
  onerror: ((event: any) => void) | null = null;
  error: any = null;

  simulateComplete() {
    if (this.oncomplete) {
      this.oncomplete();
    }
  }

  simulateError(error: any) {
    this.error = error;
    if (this.onerror) {
      this.onerror({ target: this } as any);
    }
  }
}

describe('IndexedDB Manager', () => {
  let mockDB: MockIDBDatabase;
  let mockStores: Map<string, MockIDBObjectStore>;

  beforeEach(() => {
    mockDB = new MockIDBDatabase();
    mockStores = new Map();

    // Mock global indexedDB
    global.indexedDB = {
      open: vi.fn(() => {
        const request = new MockIDBRequest();
        setTimeout(() => {
          request.result = mockDB;
          request.simulateSuccess(mockDB);
        }, 0);
        return request as any;
      }),
    } as any;

    // Mock transaction to return consistent object stores
    mockDB.transaction = vi.fn((_storeNames: string[], _mode: string) => {
      const transaction = new MockIDBTransaction();
      transaction.objectStore = vi.fn((storeName: string) => {
        if (!mockStores.has(storeName)) {
          mockStores.set(storeName, new MockIDBObjectStore());
        }
        return mockStores.get(storeName)!;
      });
      return transaction as any;
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Initialization', () => {
    it('should initialize successfully', async () => {
      await indexedDBManager.init();
      expect(indexedDBManager.isInitialized()).toBe(true);
    });

    it('should handle initialization errors', async () => {
      global.indexedDB.open = vi.fn(() => {
        const request = new MockIDBRequest();
        setTimeout(() => request.simulateError(new Error('Failed to open')), 0);
        return request as any;
      });

      await expect(indexedDBManager.init()).rejects.toThrow(
        'IndexedDB を開けませんでした'
      );
    });
  });

  describe('Task Operations', () => {
    let mockTask: Task;

    beforeEach(async () => {
      await indexedDBManager.init();
      mockTask = {
        id: 'task-1',
        title: 'Test Task',
        description: 'Test Description',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      } as Task;
    });

    it('should save a task', async () => {
      await expect(
        indexedDBManager.saveTask(mockTask)
      ).resolves.toBeUndefined();
    });

    it('should get a task by id', async () => {
      await indexedDBManager.saveTask(mockTask);
      const retrieved = await indexedDBManager.getTask('task-1');
      expect(retrieved).toEqual(mockTask);
    });

    it('should get all tasks', async () => {
      const task2 = { ...mockTask, id: 'task-2', title: 'Task 2' } as Task;
      await indexedDBManager.saveTask(mockTask);
      await indexedDBManager.saveTask(task2);

      const allTasks = await indexedDBManager.getAllTasks();
      expect(allTasks).toHaveLength(2);
    });

    it('should delete a task', async () => {
      await indexedDBManager.saveTask(mockTask);
      await indexedDBManager.deleteTask('task-1');

      const retrieved = await indexedDBManager.getTask('task-1');
      expect(retrieved).toBeUndefined();
    });

    it('should throw error when database not initialized', async () => {
      const uninitializedManager = Object.create(
        Object.getPrototypeOf(indexedDBManager)
      );
      // getAllTasks returns a promise, so we need to await the rejection
      await expect(uninitializedManager.getAllTasks()).rejects.toThrow(
        'Database not initialized'
      );
    });
  });

  describe('Column Operations', () => {
    let mockColumn: Column;

    beforeEach(async () => {
      await indexedDBManager.init();
      mockColumn = {
        id: 'col-1',
        title: 'Test Column',
        tasks: [],
        deletionState: 'active',
        deletedAt: null,
      } as Column;
    });

    it('should save a column', async () => {
      await expect(
        indexedDBManager.saveColumn(mockColumn)
      ).resolves.toBeUndefined();
    });

    it('should get all columns', async () => {
      const col2 = { ...mockColumn, id: 'col-2', title: 'Column 2' } as Column;
      await indexedDBManager.saveColumn(mockColumn);
      await indexedDBManager.saveColumn(col2);

      const allColumns = await indexedDBManager.getAllColumns();
      expect(allColumns).toHaveLength(2);
    });

    it('should delete a column', async () => {
      await indexedDBManager.saveColumn(mockColumn);
      await indexedDBManager.deleteColumn('col-1');

      const allColumns = await indexedDBManager.getAllColumns();
      expect(allColumns).toHaveLength(0);
    });
  });

  describe('Board Operations', () => {
    let mockBoard: KanbanBoard;

    beforeEach(async () => {
      await indexedDBManager.init();
      mockBoard = {
        id: 'board-1',
        title: 'Test Board',
        columns: [],
        deletionState: 'active',
        deletedAt: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      } as KanbanBoard;
    });

    it('should save a board', async () => {
      await expect(
        indexedDBManager.saveBoard(mockBoard)
      ).resolves.toBeUndefined();
    });

    it('should get all boards', async () => {
      const board2 = {
        ...mockBoard,
        id: 'board-2',
        title: 'Board 2',
      } as KanbanBoard;
      await indexedDBManager.saveBoard(mockBoard);
      await indexedDBManager.saveBoard(board2);

      const allBoards = await indexedDBManager.getAllBoards();
      expect(allBoards).toHaveLength(2);
    });

    it('should delete a board', async () => {
      await indexedDBManager.saveBoard(mockBoard);
      await indexedDBManager.deleteBoard('board-1');

      const allBoards = await indexedDBManager.getAllBoards();
      expect(allBoards).toHaveLength(0);
    });
  });

  describe('Label Operations', () => {
    let mockLabel: Label;

    beforeEach(async () => {
      await indexedDBManager.init();
      mockLabel = {
        id: 'label-1',
        name: 'Test Label',
        color: '#ff0000',
      } as Label;
    });

    it('should save a label', async () => {
      await expect(
        indexedDBManager.saveLabel(mockLabel)
      ).resolves.toBeUndefined();
    });

    it('should get all labels', async () => {
      const label2 = { ...mockLabel, id: 'label-2', name: 'Label 2' } as Label;
      await indexedDBManager.saveLabel(mockLabel);
      await indexedDBManager.saveLabel(label2);

      const allLabels = await indexedDBManager.getAllLabels();
      expect(allLabels).toHaveLength(2);
    });

    it('should delete a label', async () => {
      await indexedDBManager.saveLabel(mockLabel);
      await indexedDBManager.deleteLabel('label-1');

      const allLabels = await indexedDBManager.getAllLabels();
      expect(allLabels).toHaveLength(0);
    });
  });

  describe('Bulk Operations', () => {
    beforeEach(async () => {
      // Clear mockStores before each test to ensure isolation
      mockStores.clear();
      await indexedDBManager.init();
    });

    it('should save all data', async () => {
      const data = {
        tasks: [{ id: 'task-1', title: 'Task 1' } as Task],
        columns: [{ id: 'col-1', title: 'Col 1' } as Column],
        boards: [{ id: 'board-1', title: 'Board 1' } as KanbanBoard],
        labels: [{ id: 'label-1', name: 'Label 1' } as Label],
      };

      const transaction = new MockIDBTransaction();
      mockDB.transaction = vi.fn(() => transaction as any);
      transaction.objectStore = vi.fn((name: string) => {
        const store = new MockIDBObjectStore();
        mockStores.set(name, store);
        return store as any;
      });

      const promise = indexedDBManager.saveAllData(data);
      transaction.simulateComplete();
      await promise;

      // Transaction should have been created with all store names
      expect(mockDB.transaction).toHaveBeenCalledWith(
        ['tasks', 'columns', 'boards', 'labels'],
        'readwrite'
      );
    });

    it('should get all data', async () => {
      const mockTask = { id: 'task-1', title: 'Task 1' } as Task;
      const mockColumn = { id: 'col-1', title: 'Col 1' } as Column;
      const mockBoard = { id: 'board-1', title: 'Board 1' } as KanbanBoard;
      const mockLabel = { id: 'label-1', name: 'Label 1' } as Label;

      await indexedDBManager.saveTask(mockTask);
      await indexedDBManager.saveColumn(mockColumn);
      await indexedDBManager.saveBoard(mockBoard);
      await indexedDBManager.saveLabel(mockLabel);

      const allData = await indexedDBManager.getAllData();

      expect(allData.tasks).toHaveLength(1);
      expect(allData.columns).toHaveLength(1);
      expect(allData.boards).toHaveLength(1);
      expect(allData.labels).toHaveLength(1);
    });

    it('should clear all data', async () => {
      await indexedDBManager.saveTask({ id: 'task-1', title: 'Task' } as Task);
      await indexedDBManager.saveColumn({
        id: 'col-1',
        title: 'Col',
      } as Column);

      const transaction = new MockIDBTransaction();
      mockDB.transaction = vi.fn(() => transaction as any);
      transaction.objectStore = vi.fn((name: string) => {
        const store = mockStores.get(name) || new MockIDBObjectStore();
        return store as any;
      });

      const promise = indexedDBManager.clearAllData();
      transaction.simulateComplete();
      await promise;

      expect(mockDB.transaction).toHaveBeenCalledWith(
        ['tasks', 'columns', 'boards', 'labels'],
        'readwrite'
      );
    });

    it('should throw error when clearing data without initialization', async () => {
      const uninitializedManager = Object.create(
        Object.getPrototypeOf(indexedDBManager)
      );
      await expect(uninitializedManager.clearAllData()).rejects.toThrow(
        'Database not initialized'
      );
    });
  });
});
