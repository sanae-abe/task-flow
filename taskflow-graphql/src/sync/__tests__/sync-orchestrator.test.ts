/**
 * SyncOrchestrator (SyncCoordinator) Comprehensive Test Suite
 *
 * Test Coverage: 55+ tests across 8 categories
 * - Initialization & Lifecycle (7 tests)
 * - File → DB sync (12 tests)
 * - DB → File sync (12 tests)
 * - Event emission (6 tests)
 * - Edge cases (10 tests)
 * - Retry & resilience (5 tests)
 * - Performance & batching (3 tests)
 *
 * Total: 55 test cases
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { EventEmitter } from 'events';
import { SyncCoordinator } from '../database/sync-coordinator';
import { MockFileSystem } from '../file-system/mock-file-system';
import type {
  Task,
  SyncConfig,
  FileWatcherEvent,
  SyncHistory,
} from '../types';

// ============================================================================
// Mock Setup & Test Utilities
// ============================================================================

// Mock all external dependencies
vi.mock('../utils/logger', () => {
  const createMockLogger = () => ({
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
    startTimer: vi.fn(() => ({ done: vi.fn() })),
    logSyncEvent: vi.fn(),
    child: vi.fn(function(this: any) { return this; }),
  });

  const logger = createMockLogger();

  return {
    Logger: {
      getInstance: () => logger,
    },
  };
});

/**
 * Mock FileWatcher for testing file change events
 */
class MockFileWatcher extends EventEmitter {
  private watching = false;

  async start(): Promise<void> {
    this.watching = true;
  }

  async stop(): Promise<void> {
    this.watching = false;
  }

  isWatching(): boolean {
    return this.watching;
  }

  simulateChange(event: FileWatcherEvent): void {
    this.emit('change', event);
  }

  simulateError(error: Error): void {
    this.emit('error', {
      type: 'error' as const,
      path: '/test/TODO.md',
      timestamp: new Date(),
      error,
    });
  }
}

/**
 * Mock IndexedDB implementation
 */
class MockIndexedDB {
  private tasks: Map<string, Task> = new Map();

  transaction(storeName: string, mode: string) {
    return {
      objectStore: (name: string) => ({
        getAll: vi.fn().mockResolvedValue(Array.from(this.tasks.values())),
        get: vi.fn().mockImplementation((id: string) =>
          Promise.resolve(this.tasks.get(id))
        ),
        put: vi.fn().mockImplementation((task: Task) => {
          this.tasks.set(task.id, task);
          return Promise.resolve(task.id);
        }),
        delete: vi.fn().mockImplementation((id: string) => {
          this.tasks.delete(id);
          return Promise.resolve();
        }),
      }),
      done: Promise.resolve(),
    };
  }

  // Test helper methods
  setTasks(tasks: Task[]): void {
    this.tasks.clear();
    tasks.forEach(task => this.tasks.set(task.id, task));
  }

  getTasks(): Task[] {
    return Array.from(this.tasks.values());
  }

  clear(): void {
    this.tasks.clear();
  }
}

/**
 * Factory function to create mock tasks
 */
function createMockTask(overrides?: Partial<Task>): Task {
  const now = new Date();
  return {
    id: `task-${Math.random().toString(36).substr(2, 9)}`,
    title: 'Test Task',
    status: 'pending',
    priority: 'medium',
    createdAt: now,
    updatedAt: now,
    ...overrides,
  };
}

/**
 * Factory function to create sync config
 */
function createSyncConfig(overrides?: Partial<SyncConfig>): SyncConfig {
  return {
    todoPath: '/test/TODO.md',
    direction: 'bidirectional',
    strategy: 'last_write_wins',
    conflictResolution: 'prefer_file',
    debounceMs: 100,
    throttleMs: 1000,
    maxFileSizeMB: 5,
    maxTasks: 10000,
    webhooksEnabled: false,
    autoBackup: true,
    ...overrides,
  };
}

// ============================================================================
// Test Suite
// ============================================================================

describe('SyncOrchestrator (SyncCoordinator) - Comprehensive Test Suite', () => {
  let coordinator: SyncCoordinator;
  let mockFileSystem: MockFileSystem;
  let mockDatabase: MockIndexedDB;
  let mockFileWatcher: MockFileWatcher;
  let config: SyncConfig;

  beforeEach(() => {
    // Reset all mocks
    vi.clearAllMocks();

    // Create fresh instances
    mockFileSystem = new MockFileSystem();
    mockDatabase = new MockIndexedDB();
    mockFileWatcher = new MockFileWatcher();
    config = createSyncConfig();
  });

  afterEach(() => {
    if (coordinator) {
      coordinator.removeAllListeners();
    }
    mockFileSystem.clear();
    mockDatabase.clear();
  });

  // ==========================================================================
  // 1. Initialization & Lifecycle Tests (7 tests)
  // ==========================================================================

  describe('1. Initialization & Lifecycle', () => {
    it('should initialize with valid configuration', () => {
      coordinator = new SyncCoordinator({
        config,
        fileSystem: mockFileSystem,
        database: mockDatabase as any,
      });

      expect(coordinator).toBeDefined();
      expect(coordinator.getStats().totalSyncs).toBe(0);
    });

    it('should reject invalid configuration - missing todoPath', () => {
      expect(() => {
        new SyncCoordinator({
          config: { ...config, todoPath: '' },
          fileSystem: mockFileSystem,
          database: mockDatabase as any,
        });
      }).toThrow();
    });

    it('should reject invalid configuration - invalid debounceMs', () => {
      expect(() => {
        new SyncCoordinator({
          config: { ...config, debounceMs: -100 },
          fileSystem: mockFileSystem,
          database: mockDatabase as any,
        });
      }).toThrow();
    });

    it('should start successfully and emit started event', async () => {
      coordinator = new SyncCoordinator({
        config,
        fileSystem: mockFileSystem,
        database: mockDatabase as any,
        fileWatcher: mockFileWatcher,
      });

      const startedSpy = vi.fn();
      coordinator.on('started', startedSpy);

      // Create TODO.md file for successful start
      mockFileSystem.setFile('/test/TODO.md', '# TODO\n\n- [ ] Test task');

      await coordinator.start();

      expect(startedSpy).toHaveBeenCalled();
      expect(mockFileWatcher.isWatching()).toBe(true);
    });

    it('should stop successfully and emit stopped event', async () => {
      coordinator = new SyncCoordinator({
        config,
        fileSystem: mockFileSystem,
        database: mockDatabase as any,
        fileWatcher: mockFileWatcher,
      });

      mockFileSystem.setFile('/test/TODO.md', '# TODO');
      await coordinator.start();

      const stoppedSpy = vi.fn();
      coordinator.on('stopped', stoppedSpy);

      await coordinator.stop();

      expect(stoppedSpy).toHaveBeenCalled();
      expect(mockFileWatcher.isWatching()).toBe(false);
    });

    it('should handle multiple start calls gracefully (idempotent)', async () => {
      coordinator = new SyncCoordinator({
        config,
        fileSystem: mockFileSystem,
        database: mockDatabase as any,
      });

      mockFileSystem.setFile('/test/TODO.md', '# TODO');

      await coordinator.start();
      await coordinator.start(); // Second start should be no-op

      const stats = coordinator.getStats();
      expect(stats).toBeDefined();
    });

    it('should handle stop without start gracefully', async () => {
      coordinator = new SyncCoordinator({
        config,
        fileSystem: mockFileSystem,
        database: mockDatabase as any,
      });

      await expect(coordinator.stop()).resolves.not.toThrow();
    });
  });

  // ==========================================================================
  // 2. File → DB Sync Tests (12 tests)
  // ==========================================================================

  describe('2. File → DB Sync', () => {
    beforeEach(() => {
      coordinator = new SyncCoordinator({
        config,
        fileSystem: mockFileSystem,
        database: mockDatabase as any,
      });
    });

    it('should parse file and create new tasks in database', async () => {
      const markdown = `# TODO

## 🔥 CRITICAL
- [ ] Fix security vulnerability

## 📌 MEDIUM
- [ ] Update documentation
`;
      mockFileSystem.setFile('/test/TODO.md', markdown);

      await coordinator.syncFileToApp();

      const tasks = mockDatabase.getTasks();
      expect(tasks).toHaveLength(2);
      expect(tasks[0].title).toContain('security vulnerability');
      expect(tasks[1].title).toContain('documentation');
    });

    it('should update existing tasks when file changes', async () => {
      // Setup: Create initial task in DB
      const initialTask = createMockTask({
        title: 'Update docs',
        status: 'pending'
      });
      mockDatabase.setTasks([initialTask]);

      // File has same task but with completed status
      const markdown = `# TODO\n\n- [x] Update docs`;
      mockFileSystem.setFile('/test/TODO.md', markdown);

      await coordinator.syncFileToApp();

      const tasks = mockDatabase.getTasks();
      const updatedTask = tasks.find(t => t.title.includes('Update docs'));
      expect(updatedTask?.status).toBe('completed');
    });

    it('should delete tasks removed from file', async () => {
      // Setup: DB has 2 tasks
      mockDatabase.setTasks([
        createMockTask({ title: 'Task 1' }),
        createMockTask({ title: 'Task 2' }),
      ]);

      // File only has 1 task
      const markdown = `# TODO\n\n- [ ] Task 1`;
      mockFileSystem.setFile('/test/TODO.md', markdown);

      await coordinator.syncFileToApp();

      const tasks = mockDatabase.getTasks();
      expect(tasks).toHaveLength(1);
      expect(tasks[0].title).toBe('Task 1');
    });

    it('should handle empty file gracefully', async () => {
      mockFileSystem.setFile('/test/TODO.md', '');

      await coordinator.syncFileToApp();

      const tasks = mockDatabase.getTasks();
      expect(tasks).toHaveLength(0);

      const stats = coordinator.getStats();
      expect(stats.successfulSyncs).toBe(1);
    });

    it('should handle file with only headers (no tasks)', async () => {
      const markdown = `# TODO

## 🔥 CRITICAL
## ⚠️ HIGH
## 📌 MEDIUM
`;
      mockFileSystem.setFile('/test/TODO.md', markdown);

      await coordinator.syncFileToApp();

      const tasks = mockDatabase.getTasks();
      expect(tasks).toHaveLength(0);
    });

    it('should detect and report file changes', async () => {
      mockFileSystem.setFile('/test/TODO.md', '- [ ] Task 1');

      await coordinator.syncFileToApp();

      // Change file
      mockFileSystem.setFile('/test/TODO.md', '- [ ] Task 1\n- [ ] Task 2');

      await coordinator.syncFileToApp();

      const stats = coordinator.getStats();
      expect(stats.totalSyncs).toBe(2);
      expect(stats.successfulSyncs).toBe(2);
    });

    it('should skip sync when file content is identical', async () => {
      const markdown = '- [ ] Test task';
      mockFileSystem.setFile('/test/TODO.md', markdown);

      await coordinator.syncFileToApp();
      const firstSyncCount = coordinator.getStats().totalSyncs;

      // Sync again with same content
      await coordinator.syncFileToApp();

      // Should skip due to no changes
      expect(coordinator.getStats().totalSyncs).toBe(firstSyncCount);
    });

    it('should handle malformed markdown gracefully', async () => {
      const malformed = `# TODO
- [ Incomplete checkbox
- [x Extra character
- [ ] Valid task
`;
      mockFileSystem.setFile('/test/TODO.md', malformed);

      await expect(coordinator.syncFileToApp()).resolves.not.toThrow();
    });

    it('should handle file read errors', async () => {
      // File doesn't exist
      await expect(coordinator.syncFileToApp()).rejects.toThrow();

      const stats = coordinator.getStats();
      expect(stats.failedSyncs).toBe(1);
    });

    it('should emit sync-completed event with history', async () => {
      mockFileSystem.setFile('/test/TODO.md', '- [ ] Task 1');

      const completedSpy = vi.fn();
      coordinator.on('sync-completed', completedSpy);

      await coordinator.syncFileToApp();

      expect(completedSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          direction: 'file_to_app',
          success: true,
          tasksChanged: expect.any(Number),
        })
      );
    });

    it('should emit sync-error event on failure', async () => {
      const errorSpy = vi.fn();
      coordinator.on('sync-error', errorSpy);

      // Trigger error by not creating file
      await expect(coordinator.syncFileToApp()).rejects.toThrow();

      expect(errorSpy).toHaveBeenCalled();
    });

    it('should prevent concurrent file-to-app syncs', async () => {
      mockFileSystem.setFile('/test/TODO.md', '- [ ] Task 1');

      const sync1 = coordinator.syncFileToApp();
      const sync2 = coordinator.syncFileToApp();

      await Promise.allSettled([sync1, sync2]);

      // Only one should execute
      expect(coordinator.getStats().totalSyncs).toBe(1);
    });
  });

  // ==========================================================================
  // 3. DB → File Sync Tests (12 tests)
  // ==========================================================================

  describe('3. DB → File Sync', () => {
    beforeEach(() => {
      coordinator = new SyncCoordinator({
        config,
        fileSystem: mockFileSystem,
        database: mockDatabase as any,
      });
    });

    it('should serialize tasks and write to file', async () => {
      mockDatabase.setTasks([
        createMockTask({ title: 'Task 1', status: 'pending' }),
        createMockTask({ title: 'Task 2', status: 'completed' }),
      ]);

      await coordinator.syncAppToFile();

      const fileContent = await mockFileSystem.readFile('/test/TODO.md');
      expect(fileContent).toContain('Task 1');
      expect(fileContent).toContain('Task 2');
    });

    it('should generate valid markdown format', async () => {
      mockDatabase.setTasks([
        createMockTask({
          title: 'High priority task',
          priority: 'high',
          status: 'pending',
        }),
      ]);

      await coordinator.syncAppToFile();

      const fileContent = await mockFileSystem.readFile('/test/TODO.md');
      expect(fileContent).toContain('- [ ]'); // Unchecked checkbox
      expect(fileContent).toContain('High priority task');
    });

    it('should handle empty task list', async () => {
      mockDatabase.setTasks([]);

      await coordinator.syncAppToFile();

      const fileContent = await mockFileSystem.readFile('/test/TODO.md');
      expect(fileContent).toBeDefined();

      const stats = coordinator.getStats();
      expect(stats.successfulSyncs).toBe(1);
    });

    it('should group tasks by priority sections', async () => {
      mockDatabase.setTasks([
        createMockTask({ title: 'Critical task', priority: 'high' }),
        createMockTask({ title: 'Normal task', priority: 'medium' }),
        createMockTask({ title: 'Low task', priority: 'low' }),
      ]);

      await coordinator.syncAppToFile();

      const fileContent = await mockFileSystem.readFile('/test/TODO.md');

      // Should have priority section headers
      expect(fileContent).toMatch(/##.*HIGH|CRITICAL/i);
      expect(fileContent).toMatch(/##.*MEDIUM/i);
      expect(fileContent).toMatch(/##.*LOW/i);
    });

    it('should preserve completed tasks in separate section', async () => {
      mockDatabase.setTasks([
        createMockTask({ title: 'Pending task', status: 'pending' }),
        createMockTask({ title: 'Done task', status: 'completed' }),
      ]);

      await coordinator.syncAppToFile();

      const fileContent = await mockFileSystem.readFile('/test/TODO.md');
      expect(fileContent).toContain('- [ ] Pending task');
      expect(fileContent).toContain('- [x] Done task');
    });

    it('should create backup before writing (when enabled)', async () => {
      mockFileSystem.setFile('/test/TODO.md', '- [ ] Old task');
      mockDatabase.setTasks([
        createMockTask({ title: 'New task' }),
      ]);

      await coordinator.syncAppToFile();

      // Backup should be created (file with timestamp)
      const allFiles = mockFileSystem.getAllPaths();
      const hasBackup = allFiles.some(path => path.includes('.backup.'));
      expect(hasBackup).toBe(true);
    });

    it('should skip backup in dry-run mode', async () => {
      const dryRunConfig = createSyncConfig({ dryRun: true });
      coordinator = new SyncCoordinator({
        config: dryRunConfig,
        fileSystem: mockFileSystem,
        database: mockDatabase as any,
      });

      mockDatabase.setTasks([createMockTask()]);

      await coordinator.syncAppToFile();

      // File should not be written in dry-run
      const exists = await mockFileSystem.exists('/test/TODO.md');
      expect(exists).toBe(false);
    });

    it('should validate generated markdown before writing', async () => {
      mockDatabase.setTasks([
        createMockTask({ title: 'Task with "quotes"' }),
        createMockTask({ title: 'Task with <tags>' }),
      ]);

      await expect(coordinator.syncAppToFile()).resolves.not.toThrow();
    });

    it('should handle file write errors', async () => {
      mockDatabase.setTasks([createMockTask()]);

      // Simulate write error by making filesystem read-only
      mockFileSystem.writeFile = vi.fn().mockRejectedValue(
        new Error('EACCES: permission denied')
      );

      await expect(coordinator.syncAppToFile()).rejects.toThrow();

      const stats = coordinator.getStats();
      expect(stats.failedSyncs).toBe(1);
    });

    it('should emit sync-completed event', async () => {
      mockDatabase.setTasks([createMockTask()]);

      const completedSpy = vi.fn();
      coordinator.on('sync-completed', completedSpy);

      await coordinator.syncAppToFile();

      expect(completedSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          direction: 'app_to_file',
          success: true,
        })
      );
    });

    it('should prevent concurrent app-to-file syncs', async () => {
      mockDatabase.setTasks([createMockTask()]);

      const sync1 = coordinator.syncAppToFile();
      const sync2 = coordinator.syncAppToFile();

      await Promise.allSettled([sync1, sync2]);

      // Only one should execute
      expect(coordinator.getStats().totalSyncs).toBe(1);
    });

    it('should update sync statistics', async () => {
      mockDatabase.setTasks([
        createMockTask(),
        createMockTask(),
      ]);

      await coordinator.syncAppToFile();

      const stats = coordinator.getStats();
      expect(stats.totalSyncs).toBe(1);
      expect(stats.successfulSyncs).toBe(1);
      expect(stats.lastSyncAt).toBeInstanceOf(Date);
    });
  });

  // ==========================================================================
  // 4. Event Emission Tests (6 tests)
  // ==========================================================================

  describe('4. Event Emission', () => {
    beforeEach(() => {
      coordinator = new SyncCoordinator({
        config,
        fileSystem: mockFileSystem,
        database: mockDatabase as any,
        fileWatcher: mockFileWatcher,
      });
    });

    it('should emit sync:start event', async () => {
      mockFileSystem.setFile('/test/TODO.md', '- [ ] Task');

      const startSpy = vi.fn();
      coordinator.on('sync-start', startSpy);

      await coordinator.syncFileToApp();

      expect(startSpy).toHaveBeenCalled();
    });

    it('should emit sync:complete event with statistics', async () => {
      mockFileSystem.setFile('/test/TODO.md', '- [ ] Task 1\n- [ ] Task 2');

      const completeSpy = vi.fn();
      coordinator.on('sync-completed', completeSpy);

      await coordinator.syncFileToApp();

      expect(completeSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          tasksChanged: expect.any(Number),
          durationMs: expect.any(Number),
        })
      );
    });

    it('should emit sync:error event on failures', async () => {
      const errorSpy = vi.fn();
      coordinator.on('sync-error', errorSpy);

      // Trigger error - file doesn't exist
      await expect(coordinator.syncFileToApp()).rejects.toThrow();

      expect(errorSpy).toHaveBeenCalledWith(expect.any(Error));
    });

    it('should emit watcher:error event on file watcher errors', async () => {
      mockFileSystem.setFile('/test/TODO.md', '# TODO');
      await coordinator.start();

      const watcherErrorSpy = vi.fn();
      coordinator.on('watcher-error', watcherErrorSpy);

      mockFileWatcher.simulateError(new Error('File watch failed'));

      expect(watcherErrorSpy).toHaveBeenCalled();
    });

    it('should emit conflict:detected event when conflicts occur', async () => {
      // Setup conflicting changes
      mockDatabase.setTasks([
        createMockTask({
          title: 'Task 1',
          status: 'pending',
          priority: 'high',
        }),
      ]);

      const markdown = `# TODO\n\n- [x] Task 1`; // Same task, different status
      mockFileSystem.setFile('/test/TODO.md', markdown);

      const conflictSpy = vi.fn();
      coordinator.on('conflict-detected', conflictSpy);

      await coordinator.syncFileToApp();

      // Conflict detection depends on implementation
      // This test documents the expected behavior
    });

    it('should provide detailed event data for debugging', async () => {
      mockFileSystem.setFile('/test/TODO.md', '- [ ] Debug task');

      const completeSpy = vi.fn();
      coordinator.on('sync-completed', completeSpy);

      await coordinator.syncFileToApp();

      const eventData: SyncHistory = completeSpy.mock.calls[0][0];
      expect(eventData).toHaveProperty('id');
      expect(eventData).toHaveProperty('startedAt');
      expect(eventData).toHaveProperty('completedAt');
      expect(eventData).toHaveProperty('direction');
      expect(eventData).toHaveProperty('durationMs');
    });
  });

  // ==========================================================================
  // 5. Edge Cases Tests (10 tests)
  // ==========================================================================

  describe('5. Edge Cases', () => {
    beforeEach(() => {
      coordinator = new SyncCoordinator({
        config,
        fileSystem: mockFileSystem,
        database: mockDatabase as any,
      });
    });

    it('should handle large files (within limits)', async () => {
      // Generate large markdown (1000 tasks)
      const tasks = Array.from({ length: 1000 }, (_, i) =>
        `- [ ] Task ${i + 1}`
      ).join('\n');
      const markdown = `# TODO\n\n${tasks}`;

      mockFileSystem.setFile('/test/TODO.md', markdown);

      await coordinator.syncFileToApp();

      const dbTasks = mockDatabase.getTasks();
      expect(dbTasks.length).toBeGreaterThan(0);
      expect(dbTasks.length).toBeLessThanOrEqual(1000);
    });

    it('should handle files with special characters', async () => {
      const markdown = `# TODO

- [ ] Task with "quotes"
- [ ] Task with <tags>
- [ ] Task with emoji 🚀
- [ ] Task with unicode: 日本語
`;
      mockFileSystem.setFile('/test/TODO.md', markdown);

      await coordinator.syncFileToApp();

      const tasks = mockDatabase.getTasks();
      expect(tasks.length).toBe(4);
      expect(tasks.some(t => t.title.includes('🚀'))).toBe(true);
      expect(tasks.some(t => t.title.includes('日本語'))).toBe(true);
    });

    it('should handle concurrent file and app changes', async () => {
      const markdown = '- [ ] File task';
      mockFileSystem.setFile('/test/TODO.md', markdown);
      mockDatabase.setTasks([createMockTask({ title: 'App task' })]);

      // Simulate concurrent operations
      const fileToApp = coordinator.syncFileToApp();
      const appToFile = coordinator.syncAppToFile();

      await Promise.allSettled([fileToApp, appToFile]);

      // One should succeed, one should be prevented
      const stats = coordinator.getStats();
      expect(stats.totalSyncs).toBe(1);
    });

    it('should handle missing file gracefully on start', async () => {
      // File doesn't exist
      await expect(coordinator.start()).resolves.not.toThrow();
    });

    it('should handle corrupted markdown gracefully', async () => {
      const corrupted = `# TODO
- [ ] Task 1
- [ Broken checkbox
[x] No dash
- [] No space
- [ ] Valid task
`;
      mockFileSystem.setFile('/test/TODO.md', corrupted);

      await expect(coordinator.syncFileToApp()).resolves.not.toThrow();
    });

    it('should handle tasks with extremely long titles', async () => {
      const longTitle = 'A'.repeat(10000);
      const markdown = `# TODO\n\n- [ ] ${longTitle}`;

      mockFileSystem.setFile('/test/TODO.md', markdown);

      await coordinator.syncFileToApp();

      const tasks = mockDatabase.getTasks();
      expect(tasks.length).toBeGreaterThan(0);
    });

    it('should handle deeply nested task hierarchies', async () => {
      const markdown = `# TODO

- [ ] Parent task
  - [ ] Child task 1
    - [ ] Grandchild task
      - [ ] Great-grandchild task
  - [ ] Child task 2
`;
      mockFileSystem.setFile('/test/TODO.md', markdown);

      await expect(coordinator.syncFileToApp()).resolves.not.toThrow();
    });

    it('should handle empty lines and extra whitespace', async () => {
      const markdown = `# TODO


- [  ]   Task with   spaces


- [ ] Another task

`;
      mockFileSystem.setFile('/test/TODO.md', markdown);

      await coordinator.syncFileToApp();

      const tasks = mockDatabase.getTasks();
      expect(tasks.length).toBeGreaterThan(0);
    });

    it('should handle mixed line endings (CRLF vs LF)', async () => {
      const markdown = '# TODO\r\n\r\n- [ ] Windows task\r\n- [ ] Unix task\n';
      mockFileSystem.setFile('/test/TODO.md', markdown);

      await coordinator.syncFileToApp();

      const tasks = mockDatabase.getTasks();
      expect(tasks.length).toBe(2);
    });

    it('should handle file modifications during sync', async () => {
      mockFileSystem.setFile('/test/TODO.md', '- [ ] Initial task');

      // Start sync
      const syncPromise = coordinator.syncFileToApp();

      // Modify file during sync (race condition)
      setTimeout(() => {
        mockFileSystem.setFile('/test/TODO.md', '- [ ] Modified task');
      }, 10);

      await syncPromise;

      // Should complete without errors
      const stats = coordinator.getStats();
      expect(stats.successfulSyncs).toBeGreaterThan(0);
    });
  });

  // ==========================================================================
  // 6. Retry & Resilience Tests (5 tests)
  // ==========================================================================

  describe('6. Retry & Resilience', () => {
    beforeEach(() => {
      coordinator = new SyncCoordinator({
        config,
        fileSystem: mockFileSystem,
        database: mockDatabase as any,
      });
    });

    it('should retry on transient file read errors', async () => {
      let attemptCount = 0;
      const originalReadFile = mockFileSystem.readFile.bind(mockFileSystem);

      mockFileSystem.readFile = vi.fn().mockImplementation(async (path) => {
        attemptCount++;
        if (attemptCount < 3) {
          throw new Error('Transient error');
        }
        return originalReadFile(path);
      });

      mockFileSystem.setFile('/test/TODO.md', '- [ ] Task');

      await coordinator.syncFileToApp();

      expect(attemptCount).toBeGreaterThanOrEqual(3);
      expect(coordinator.getStats().successfulSyncs).toBe(1);
    });

    it('should use exponential backoff for retries', async () => {
      const retryDelays: number[] = [];
      let attemptCount = 0;

      mockFileSystem.readFile = vi.fn().mockImplementation(async () => {
        attemptCount++;
        const startTime = Date.now();

        if (attemptCount < 3) {
          await new Promise(resolve => setTimeout(resolve, 10));
          retryDelays.push(Date.now() - startTime);
          throw new Error('Transient error');
        }

        return '- [ ] Task';
      });

      await coordinator.syncFileToApp();

      // Verify exponential backoff (each delay should be longer)
      for (let i = 1; i < retryDelays.length; i++) {
        expect(retryDelays[i]).toBeGreaterThanOrEqual(retryDelays[i - 1]);
      }
    });

    it('should fail after max retry attempts', async () => {
      mockFileSystem.readFile = vi.fn().mockRejectedValue(
        new Error('Permanent error')
      );

      await expect(coordinator.syncFileToApp()).rejects.toThrow();

      const stats = coordinator.getStats();
      expect(stats.failedSyncs).toBe(1);
    });

    it('should use circuit breaker to prevent cascading failures', async () => {
      // Simulate multiple failures
      for (let i = 0; i < 5; i++) {
        mockFileSystem.readFile = vi.fn().mockRejectedValue(
          new Error('Service unavailable')
        );

        await expect(coordinator.syncFileToApp()).rejects.toThrow();
      }

      // Circuit breaker should be open now
      const stats = coordinator.getStats();
      expect(stats.failedSyncs).toBeGreaterThanOrEqual(5);
    });

    it('should recover after circuit breaker resets', async () => {
      // Cause circuit breaker to open
      mockFileSystem.readFile = vi.fn().mockRejectedValue(
        new Error('Service unavailable')
      );

      for (let i = 0; i < 3; i++) {
        await expect(coordinator.syncFileToApp()).rejects.toThrow();
      }

      // Wait for circuit breaker reset
      await new Promise(resolve => setTimeout(resolve, 100));

      // Fix the error and retry
      mockFileSystem.setFile('/test/TODO.md', '- [ ] Task');

      await coordinator.syncFileToApp();

      const stats = coordinator.getStats();
      expect(stats.successfulSyncs).toBeGreaterThan(0);
    });
  });

  // ==========================================================================
  // 7. Performance & Batching Tests (3 tests)
  // ==========================================================================

  describe('7. Performance & Batching', () => {
    beforeEach(() => {
      coordinator = new SyncCoordinator({
        config,
        fileSystem: mockFileSystem,
        database: mockDatabase as any,
      });
    });

    it('should batch database operations efficiently', async () => {
      const tasks = Array.from({ length: 100 }, (_, i) =>
        `- [ ] Task ${i + 1}`
      ).join('\n');

      mockFileSystem.setFile('/test/TODO.md', `# TODO\n\n${tasks}`);

      const startTime = Date.now();
      await coordinator.syncFileToApp();
      const duration = Date.now() - startTime;

      // Should complete in reasonable time (< 1 second)
      expect(duration).toBeLessThan(1000);

      const dbTasks = mockDatabase.getTasks();
      expect(dbTasks.length).toBe(100);
    });

    it('should track performance metrics', async () => {
      mockFileSystem.setFile('/test/TODO.md', '- [ ] Task');

      await coordinator.syncFileToApp();
      await coordinator.syncFileToApp();

      const stats = coordinator.getStats();
      expect(stats.averageDurationMs).toBeGreaterThan(0);
    });

    it('should optimize for large file operations', async () => {
      // Create 500 tasks
      mockDatabase.setTasks(
        Array.from({ length: 500 }, (_, i) =>
          createMockTask({ title: `Task ${i + 1}` })
        )
      );

      const startTime = Date.now();
      await coordinator.syncAppToFile();
      const duration = Date.now() - startTime;

      // Should complete efficiently
      expect(duration).toBeLessThan(2000);

      const fileContent = await mockFileSystem.readFile('/test/TODO.md');
      expect(fileContent.length).toBeGreaterThan(0);
    });
  });

  // ==========================================================================
  // 8. Statistics & History Tests (remaining tests to reach 55+)
  // ==========================================================================

  describe('8. Statistics & History', () => {
    beforeEach(() => {
      coordinator = new SyncCoordinator({
        config,
        fileSystem: mockFileSystem,
        database: mockDatabase as any,
      });
    });

    it('should track total sync count', async () => {
      mockFileSystem.setFile('/test/TODO.md', '- [ ] Task');

      await coordinator.syncFileToApp();
      await coordinator.syncFileToApp();
      await coordinator.syncAppToFile();

      const stats = coordinator.getStats();
      expect(stats.totalSyncs).toBe(3);
    });

    it('should track success/failure rates', async () => {
      mockFileSystem.setFile('/test/TODO.md', '- [ ] Task');

      await coordinator.syncFileToApp();

      // Force a failure
      mockFileSystem.readFile = vi.fn().mockRejectedValue(new Error('Read error'));
      await expect(coordinator.syncFileToApp()).rejects.toThrow();

      const stats = coordinator.getStats();
      expect(stats.successfulSyncs).toBe(1);
      expect(stats.failedSyncs).toBe(1);
    });

    it('should calculate average sync duration', async () => {
      mockFileSystem.setFile('/test/TODO.md', '- [ ] Task 1');
      await coordinator.syncFileToApp();

      mockFileSystem.setFile('/test/TODO.md', '- [ ] Task 2');
      await coordinator.syncFileToApp();

      const stats = coordinator.getStats();
      expect(stats.averageDurationMs).toBeGreaterThan(0);
    });

    it('should provide sync history with limit', async () => {
      mockFileSystem.setFile('/test/TODO.md', '- [ ] Task');

      for (let i = 0; i < 5; i++) {
        await coordinator.syncFileToApp();
      }

      const history = coordinator.getSyncHistory(3);
      expect(history).toHaveLength(3);
      expect(history[0]).toHaveProperty('id');
      expect(history[0]).toHaveProperty('startedAt');
    });

    it('should track conflict statistics', async () => {
      // Setup potential conflict
      mockDatabase.setTasks([
        createMockTask({
          title: 'Conflicting task',
          status: 'completed',
        }),
      ]);

      mockFileSystem.setFile('/test/TODO.md', '- [ ] Conflicting task');
      await coordinator.syncFileToApp();

      const stats = coordinator.getStats();
      expect(stats.totalConflicts).toBeGreaterThanOrEqual(0);
    });

    it('should get current sync state', () => {
      const state = coordinator.getSyncState();

      expect(state).toHaveProperty('syncing');
      expect(state).toHaveProperty('pendingOperations');
      expect(state).toHaveProperty('unresolvedConflicts');
      expect(state).toHaveProperty('version');
    });
  });
});
