/**
 * E2E Test Fixtures and Mock Data Generators
 *
 * Provides reusable test data and mock generators for E2E tests.
 */
import type { Task, SyncConfig } from '../../../types';
/**
 * Generate a mock Task with customizable fields
 */
export declare function createMockTask(overrides?: Partial<Task>): Task;
/**
 * Generate multiple mock tasks
 */
export declare function createMockTasks(count: number, overrides?: Partial<Task>): Task[];
/**
 * Generate tasks with various statuses
 */
export declare function createTasksWithStatuses(): Task[];
/**
 * Generate tasks with various priorities
 */
export declare function createTasksWithPriorities(): Task[];
/**
 * Generate tasks with sections
 */
export declare function createTasksWithSections(): Task[];
/**
 * Generate tasks with tags
 */
export declare function createTasksWithTags(): Task[];
/**
 * Generate tasks with due dates
 */
export declare function createTasksWithDueDates(): Task[];
/**
 * Generate a complex task with all fields populated
 */
export declare function createComplexTask(): Task;
/**
 * Generate TODO.md content from tasks
 */
export declare function generateTodoMarkdown(tasks: Task[]): string;
/**
 * Default sync configuration for testing
 */
export declare function createDefaultSyncConfig(todoPath: string): SyncConfig;
/**
 * Create sync config with custom debounce/throttle
 */
export declare function createSyncConfigWithRateLimits(todoPath: string, debounceMs: number, throttleMs: number): SyncConfig;
/**
 * Generate large task dataset for performance testing
 */
export declare function createLargeTaskDataset(count?: number): Task[];
/**
 * Create conflicting task versions for merge testing
 */
export interface ConflictingTaskSet {
    base: Task;
    fileVersion: Task;
    appVersion: Task;
}
export declare function createConflictingTasks(): ConflictingTaskSet;
/**
 * Create multiple conflicting task sets
 */
export declare function createMultipleConflictingTasks(count: number): ConflictingTaskSet[];
/**
 * Sleep utility for async tests
 */
export declare function sleep(ms: number): Promise<void>;
/**
 * Wait for condition with timeout
 */
export declare function waitForCondition(condition: () => boolean | Promise<boolean>, timeoutMs?: number, intervalMs?: number): Promise<void>;
/**
 * Generate incremental task updates
 */
export declare function generateTaskUpdates(original: Task, updateCount: number): Task[];
//# sourceMappingURL=test-fixtures.d.ts.map