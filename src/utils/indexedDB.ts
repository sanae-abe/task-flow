import { Task, Column, KanbanBoard, Label } from '../types';

const DB_NAME = 'TodoAppDB';
const DB_VERSION = 1;

interface TodoAppDB {
  tasks: Task;
  columns: Column;
  boards: KanbanBoard;
  labels: Label;
}

class IndexedDBManager {
  private db: IDBDatabase | null = null;

  isInitialized(): boolean {
    return this.db !== null;
  }

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => {
        reject(new Error('IndexedDB を開けませんでした'));
      };

      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Tasks store
        if (!db.objectStoreNames.contains('tasks')) {
          const taskStore = db.createObjectStore('tasks', { keyPath: 'id' });
          taskStore.createIndex('columnId', 'columnId', { unique: false });
          taskStore.createIndex('createdAt', 'createdAt', { unique: false });
        }

        // Columns store
        if (!db.objectStoreNames.contains('columns')) {
          const columnStore = db.createObjectStore('columns', { keyPath: 'id' });
          columnStore.createIndex('boardId', 'boardId', { unique: false });
          columnStore.createIndex('position', 'position', { unique: false });
        }

        // Boards store
        if (!db.objectStoreNames.contains('boards')) {
          const boardStore = db.createObjectStore('boards', { keyPath: 'id' });
          boardStore.createIndex('name', 'name', { unique: false });
          boardStore.createIndex('createdAt', 'createdAt', { unique: false });
        }

        // Labels store
        if (!db.objectStoreNames.contains('labels')) {
          const labelStore = db.createObjectStore('labels', { keyPath: 'id' });
          labelStore.createIndex('name', 'name', { unique: false });
        }
      };
    });
  }

  private getStore(storeName: keyof TodoAppDB, mode: IDBTransactionMode = 'readonly'): IDBObjectStore {
    if (!this.db) {
      throw new Error('Database not initialized');
    }
    const transaction = this.db.transaction([storeName], mode);
    return transaction.objectStore(storeName);
  }

  // Tasks CRUD operations
  async getAllTasks(): Promise<Task[]> {
    const store = this.getStore('tasks');
    return new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async getTask(id: string): Promise<Task | undefined> {
    const store = this.getStore('tasks');
    return new Promise((resolve, reject) => {
      const request = store.get(id);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async saveTask(task: Task): Promise<void> {
    const store = this.getStore('tasks', 'readwrite');
    return new Promise((resolve, reject) => {
      const request = store.put(task);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async deleteTask(id: string): Promise<void> {
    const store = this.getStore('tasks', 'readwrite');
    return new Promise((resolve, reject) => {
      const request = store.delete(id);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // Columns CRUD operations
  async getAllColumns(): Promise<Column[]> {
    const store = this.getStore('columns');
    return new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async saveColumn(column: Column): Promise<void> {
    const store = this.getStore('columns', 'readwrite');
    return new Promise((resolve, reject) => {
      const request = store.put(column);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async deleteColumn(id: string): Promise<void> {
    const store = this.getStore('columns', 'readwrite');
    return new Promise((resolve, reject) => {
      const request = store.delete(id);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // Boards CRUD operations
  async getAllBoards(): Promise<KanbanBoard[]> {
    const store = this.getStore('boards');
    return new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async saveBoard(board: KanbanBoard): Promise<void> {
    const store = this.getStore('boards', 'readwrite');
    return new Promise((resolve, reject) => {
      const request = store.put(board);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async deleteBoard(id: string): Promise<void> {
    const store = this.getStore('boards', 'readwrite');
    return new Promise((resolve, reject) => {
      const request = store.delete(id);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // Labels CRUD operations
  async getAllLabels(): Promise<Label[]> {
    const store = this.getStore('labels');
    return new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async saveLabel(label: Label): Promise<void> {
    const store = this.getStore('labels', 'readwrite');
    return new Promise((resolve, reject) => {
      const request = store.put(label);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async deleteLabel(id: string): Promise<void> {
    const store = this.getStore('labels', 'readwrite');
    return new Promise((resolve, reject) => {
      const request = store.delete(id);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // Bulk operations for initial data sync
  async saveAllData(data: {
    tasks: Task[];
    columns: Column[];
    boards: KanbanBoard[];
    labels: Label[];
  }): Promise<void> {
    if (!this.db) {
      throw new Error('Database not initialized');
    }

    const transaction = this.db.transaction(['tasks', 'columns', 'boards', 'labels'], 'readwrite');

    return new Promise((resolve, reject) => {
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);

      // Clear existing data
      transaction.objectStore('tasks').clear();
      transaction.objectStore('columns').clear();
      transaction.objectStore('boards').clear();
      transaction.objectStore('labels').clear();

      // Save new data
      data.tasks.forEach(task => transaction.objectStore('tasks').add(task));
      data.columns.forEach(column => transaction.objectStore('columns').add(column));
      data.boards.forEach(board => transaction.objectStore('boards').add(board));
      data.labels.forEach(label => transaction.objectStore('labels').add(label));
    });
  }

  async getAllData(): Promise<{
    tasks: Task[];
    columns: Column[];
    boards: KanbanBoard[];
    labels: Label[];
  }> {
    const [tasks, columns, boards, labels] = await Promise.all([
      this.getAllTasks(),
      this.getAllColumns(),
      this.getAllBoards(),
      this.getAllLabels()
    ]);

    return { tasks, columns, boards, labels };
  }

  async clearAllData(): Promise<void> {
    if (!this.db) {
      throw new Error('Database not initialized');
    }

    const transaction = this.db.transaction(['tasks', 'columns', 'boards', 'labels'], 'readwrite');

    return new Promise((resolve, reject) => {
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);

      transaction.objectStore('tasks').clear();
      transaction.objectStore('columns').clear();
      transaction.objectStore('boards').clear();
      transaction.objectStore('labels').clear();
    });
  }
}

export const indexedDBManager = new IndexedDBManager();