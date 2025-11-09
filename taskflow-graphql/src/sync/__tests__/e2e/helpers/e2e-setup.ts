/**
 * E2E Test Setup Utilities
 *
 * Common setup and teardown functions for E2E integration tests.
 */

import { promises as fs } from 'fs';
import path from 'path';
import { openDB, deleteDB, type IDBPDatabase } from 'idb';
import type { Task, SyncConfig } from '../../../types';
import { SyncCoordinator } from '../../../database/sync-coordinator';
import { createDefaultSyncConfig } from './test-fixtures';
import 'fake-indexeddb/auto';

/**
 * E2E Test Context
 */
export interface E2ETestContext {
  tempDir: string;
  todoPath: string;
  database: IDBPDatabase;
  config: SyncConfig;
  coordinator?: SyncCoordinator;
  cleanup: () => Promise<void>;
}

/**
 * Setup E2E test environment
 */
export async function setupE2ETest(): Promise<E2ETestContext> {
  // Create temporary directory
  const tempDir = path.join(process.cwd(), `.test-e2e-${Date.now()}`);
  await fs.mkdir(tempDir, { recursive: true });

  const todoPath = path.join(tempDir, 'TODO.md');

  // Create IndexedDB
  const dbName = `taskflow-test-${Date.now()}`;
  const database = await openDB(dbName, 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains('tasks')) {
        const taskStore = db.createObjectStore('tasks', { keyPath: 'id' });
        taskStore.createIndex('status', 'status', { unique: false });
        taskStore.createIndex('priority', 'priority', { unique: false });
        taskStore.createIndex('section', 'section', { unique: false });
        taskStore.createIndex('createdAt', 'createdAt', { unique: false });
      }

      if (!db.objectStoreNames.contains('syncState')) {
        db.createObjectStore('syncState', { keyPath: 'id' });
      }

      if (!db.objectStoreNames.contains('baseVersions')) {
        db.createObjectStore('baseVersions', { keyPath: 'taskId' });
      }
    },
  });

  const config = createDefaultSyncConfig(todoPath);

  // Cleanup function
  const cleanup = async () => {
    // Close database
    database.close();
    await deleteDB(dbName);

    // Remove temp directory
    try {
      await fs.rm(tempDir, { recursive: true, force: true });
    } catch (error) {
      // Ignore cleanup errors
    }
  };

  return {
    tempDir,
    todoPath,
    database,
    config,
    cleanup,
  };
}

/**
 * Create SyncCoordinator instance for testing
 */
export async function createTestCoordinator(
  context: E2ETestContext
): Promise<SyncCoordinator> {
  const coordinator = new SyncCoordinator({
    config: context.config,
    database: context.database,
  });

  context.coordinator = coordinator;
  return coordinator;
}

/**
 * Write tasks to IndexedDB
 */
export async function writeTasksToDB(
  database: IDBPDatabase,
  tasks: Task[]
): Promise<void> {
  const tx = database.transaction('tasks', 'readwrite');
  const store = tx.objectStore('tasks');

  for (const task of tasks) {
    await store.put(task);
  }

  await tx.done;
}

/**
 * Read all tasks from IndexedDB
 */
export async function readTasksFromDB(database: IDBPDatabase): Promise<Task[]> {
  const tx = database.transaction('tasks', 'readonly');
  const store = tx.objectStore('tasks');
  const tasks = await store.getAll();
  await tx.done;

  return tasks;
}

/**
 * Clear all tasks from IndexedDB
 */
export async function clearTasksFromDB(database: IDBPDatabase): Promise<void> {
  const tx = database.transaction('tasks', 'readwrite');
  const store = tx.objectStore('tasks');
  await store.clear();
  await tx.done;
}

/**
 * Write TODO.md file
 */
export async function writeTodoFile(
  todoPath: string,
  content: string
): Promise<void> {
  await fs.writeFile(todoPath, content, 'utf-8');
}

/**
 * Read TODO.md file
 */
export async function readTodoFile(todoPath: string): Promise<string> {
  return await fs.readFile(todoPath, 'utf-8');
}

/**
 * Check if TODO.md exists
 */
export async function todoFileExists(todoPath: string): Promise<boolean> {
  try {
    await fs.access(todoPath);
    return true;
  } catch {
    return false;
  }
}

/**
 * Get TODO.md file stats
 */
export async function getTodoFileStats(todoPath: string) {
  return await fs.stat(todoPath);
}

/**
 * Create backup of TODO.md
 */
export async function backupTodoFile(todoPath: string): Promise<string> {
  const backupPath = `${todoPath}.backup-${Date.now()}`;
  await fs.copyFile(todoPath, backupPath);
  return backupPath;
}

/**
 * Restore TODO.md from backup
 */
export async function restoreTodoFile(
  todoPath: string,
  backupPath: string
): Promise<void> {
  await fs.copyFile(backupPath, todoPath);
}

/**
 * Wait for file to be modified
 */
export async function waitForFileModification(
  todoPath: string,
  originalMtime: Date,
  timeoutMs: number = 5000
): Promise<void> {
  const startTime = Date.now();

  while (Date.now() - startTime < timeoutMs) {
    try {
      const stats = await fs.stat(todoPath);
      if (stats.mtime.getTime() > originalMtime.getTime()) {
        return;
      }
    } catch {
      // File might not exist yet
    }

    await new Promise(resolve => setTimeout(resolve, 100));
  }

  throw new Error(`File not modified within ${timeoutMs}ms`);
}

/**
 * Wait for sync to complete
 */
export async function waitForSyncComplete(
  coordinator: SyncCoordinator,
  timeoutMs: number = 10000
): Promise<void> {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      reject(new Error(`Sync not completed within ${timeoutMs}ms`));
    }, timeoutMs);

    coordinator.once('sync-completed', () => {
      clearTimeout(timeout);
      resolve();
    });

    coordinator.once('sync-error', error => {
      clearTimeout(timeout);
      reject(error);
    });
  });
}

/**
 * Trigger file change and wait for sync
 */
export async function triggerFileChangeAndSync(
  todoPath: string,
  content: string,
  coordinator: SyncCoordinator
): Promise<void> {
  const syncPromise = waitForSyncComplete(coordinator);
  await writeTodoFile(todoPath, content);
  await syncPromise;
}

/**
 * Assert tasks are equal (ignoring timestamps)
 */
export function assertTasksEqual(
  actual: Task[],
  expected: Task[],
  ignoreFields: (keyof Task)[] = ['createdAt', 'updatedAt']
): void {
  const normalize = (task: Task) => {
    const normalized = { ...task };
    ignoreFields.forEach(field => delete (normalized as any)[field]);
    return normalized;
  };

  const normalizedActual = actual.map(normalize).sort((a, b) => a.title.localeCompare(b.title));
  const normalizedExpected = expected.map(normalize).sort((a, b) => a.title.localeCompare(b.title));

  expect(normalizedActual).toEqual(normalizedExpected);
}

/**
 * Get task count by status
 */
export async function getTaskCountByStatus(
  database: IDBPDatabase,
  status: string
): Promise<number> {
  const tx = database.transaction('tasks', 'readonly');
  const store = tx.objectStore('tasks');
  const index = store.index('status');
  const count = await index.count(status);
  await tx.done;

  return count;
}

/**
 * Simulate concurrent file edits
 */
export async function simulateConcurrentEdits(
  todoPath: string,
  edits: string[],
  delayMs: number = 50
): Promise<void> {
  for (const edit of edits) {
    await writeTodoFile(todoPath, edit);
    await new Promise(resolve => setTimeout(resolve, delayMs));
  }
}

/**
 * Measure sync performance
 */
export async function measureSyncPerformance(
  syncFn: () => Promise<void>
): Promise<{ durationMs: number }> {
  const startTime = Date.now();
  await syncFn();
  const durationMs = Date.now() - startTime;

  return { durationMs };
}

/**
 * Create test database schema
 */
export async function createTestDatabaseSchema(database: IDBPDatabase): Promise<void> {
  // Schema is created in setupE2ETest, this is a no-op
  // Kept for explicit schema creation in future tests
}

/**
 * Verify database integrity
 */
export async function verifyDatabaseIntegrity(database: IDBPDatabase): Promise<boolean> {
  try {
    const tasks = await readTasksFromDB(database);

    // Check all tasks have required fields
    for (const task of tasks) {
      if (!task.id || !task.title || !task.status || !task.priority) {
        return false;
      }
    }

    return true;
  } catch {
    return false;
  }
}

/**
 * Get sync statistics from coordinator
 */
export function getSyncStats(coordinator: SyncCoordinator) {
  return coordinator.getStats();
}

/**
 * Get sync history from coordinator
 */
export function getSyncHistory(coordinator: SyncCoordinator, limit: number = 10) {
  return coordinator.getSyncHistory(limit);
}
