/**
 * E2E Test Setup Utilities
 *
 * Common setup and teardown functions for E2E integration tests.
 */
import { type IDBPDatabase } from 'idb';
import type { Task, SyncConfig } from '../../../types';
import { SyncCoordinator } from '../../../database/sync-coordinator';
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
export declare function setupE2ETest(): Promise<E2ETestContext>;
/**
 * Create SyncCoordinator instance for testing
 */
export declare function createTestCoordinator(context: E2ETestContext): Promise<SyncCoordinator>;
/**
 * Write tasks to IndexedDB
 */
export declare function writeTasksToDB(database: IDBPDatabase, tasks: Task[]): Promise<void>;
/**
 * Read all tasks from IndexedDB
 */
export declare function readTasksFromDB(database: IDBPDatabase): Promise<Task[]>;
/**
 * Clear all tasks from IndexedDB
 */
export declare function clearTasksFromDB(database: IDBPDatabase): Promise<void>;
/**
 * Write TODO.md file
 */
export declare function writeTodoFile(todoPath: string, content: string): Promise<void>;
/**
 * Read TODO.md file
 */
export declare function readTodoFile(todoPath: string): Promise<string>;
/**
 * Check if TODO.md exists
 */
export declare function todoFileExists(todoPath: string): Promise<boolean>;
/**
 * Get TODO.md file stats
 */
export declare function getTodoFileStats(todoPath: string): Promise<import("fs").Stats>;
/**
 * Create backup of TODO.md
 */
export declare function backupTodoFile(todoPath: string): Promise<string>;
/**
 * Restore TODO.md from backup
 */
export declare function restoreTodoFile(todoPath: string, backupPath: string): Promise<void>;
/**
 * Wait for file to be modified
 */
export declare function waitForFileModification(todoPath: string, originalMtime: Date, timeoutMs?: number): Promise<void>;
/**
 * Wait for sync to complete
 */
export declare function waitForSyncComplete(coordinator: SyncCoordinator, timeoutMs?: number): Promise<void>;
/**
 * Trigger file change and wait for sync
 */
export declare function triggerFileChangeAndSync(todoPath: string, content: string, coordinator: SyncCoordinator): Promise<void>;
/**
 * Assert tasks are equal (ignoring timestamps)
 */
export declare function assertTasksEqual(actual: Task[], expected: Task[], ignoreFields?: (keyof Task)[]): void;
/**
 * Get task count by status
 */
export declare function getTaskCountByStatus(database: IDBPDatabase, status: string): Promise<number>;
/**
 * Simulate concurrent file edits
 */
export declare function simulateConcurrentEdits(todoPath: string, edits: string[], delayMs?: number): Promise<void>;
/**
 * Measure sync performance
 */
export declare function measureSyncPerformance(syncFn: () => Promise<void>): Promise<{
    durationMs: number;
}>;
/**
 * Create test database schema
 */
export declare function createTestDatabaseSchema(database: IDBPDatabase): Promise<void>;
/**
 * Verify database integrity
 */
export declare function verifyDatabaseIntegrity(database: IDBPDatabase): Promise<boolean>;
/**
 * Get sync statistics from coordinator
 */
export declare function getSyncStats(coordinator: SyncCoordinator): import("../../../types").SyncStatistics;
/**
 * Get sync history from coordinator
 */
export declare function getSyncHistory(coordinator: SyncCoordinator, limit?: number): import("../../../types").SyncHistory[];
//# sourceMappingURL=e2e-setup.d.ts.map