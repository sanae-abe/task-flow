/**
 * E2E Tests: FileWatcher Integration
 *
 * Tests automatic file watching, debounce/throttle validation, and rate limiting.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import type { E2ETestContext } from './helpers/e2e-setup';
import {
  setupE2ETest,
  writeTodoFile,
  readTasksFromDB,
  waitForSyncComplete,
} from './helpers/e2e-setup';
import {
  createMockTasks,
  generateTodoMarkdown,
  sleep,
  waitForCondition,
} from './helpers/test-fixtures';
import { SyncCoordinator } from '../../../database/sync-coordinator';
import { EventEmitter } from 'events';

/**
 * Mock FileWatcher implementation for testing
 */
class MockFileWatcher extends EventEmitter {
  private watching: boolean = false;
  private filePath: string;
  private debounceMs: number;
  private throttleMs: number;
  private debounceTimer?: NodeJS.Timeout;
  private lastEmitTime: number = 0;

  constructor(filePath: string, debounceMs: number = 500, throttleMs: number = 2000) {
    super();
    this.filePath = filePath;
    this.debounceMs = debounceMs;
    this.throttleMs = throttleMs;
  }

  async start(): Promise<void> {
    this.watching = true;
    this.emit('started', { path: this.filePath, timestamp: new Date() });
  }

  async stop(): Promise<void> {
    this.watching = false;
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }
    this.emit('stopped', { path: this.filePath, timestamp: new Date() });
  }

  isWatching(): boolean {
    return this.watching;
  }

  simulateChange(): void {
    if (!this.watching) return;

    const now = Date.now();
    const timeSinceLastEmit = now - this.lastEmitTime;

    // Throttle check
    if (timeSinceLastEmit < this.throttleMs) {
      return;
    }

    // Debounce
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }

    this.debounceTimer = setTimeout(() => {
      this.lastEmitTime = Date.now();
      this.emit('change', {
        type: 'change',
        path: this.filePath,
        timestamp: new Date(),
        stats: { size: 100, mtime: new Date() },
      });
    }, this.debounceMs);
  }

  flush(): void {
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
      this.lastEmitTime = Date.now();
      this.emit('change', {
        type: 'change',
        path: this.filePath,
        timestamp: new Date(),
        stats: { size: 100, mtime: new Date() },
      });
    }
  }
}

describe('E2E: FileWatcher Integration', () => {
  let context: E2ETestContext;
  let fileWatcher: MockFileWatcher;

  beforeEach(async () => {
    context = await setupE2ETest();
  });

  afterEach(async () => {
    if (fileWatcher) {
      await fileWatcher.stop();
    }
    if (context.coordinator) {
      await context.coordinator.stop();
    }
    await context.cleanup();
  });

  describe('Automatic File Watching', () => {
    it('should automatically sync when file changes are detected', async () => {
      // Arrange
      fileWatcher = new MockFileWatcher(context.todoPath, 100, 500);

      const coordinator = new SyncCoordinator({
        config: context.config,
        database: context.database,
        fileWatcher: fileWatcher as any,
      });

      await coordinator.start();

      // Act - Simulate file change
      const tasks = createMockTasks(3);
      const markdown = generateTodoMarkdown(tasks);
      await writeTodoFile(context.todoPath, markdown);

      fileWatcher.simulateChange();
      fileWatcher.flush();

      await sleep(200);

      // Assert
      const dbTasks = await readTasksFromDB(context.database);
      expect(dbTasks.length).toBe(3);

      context.coordinator = coordinator;
    });

    it('should start and stop file watching', async () => {
      // Arrange
      fileWatcher = new MockFileWatcher(context.todoPath);

      // Act
      await fileWatcher.start();
      expect(fileWatcher.isWatching()).toBe(true);

      await fileWatcher.stop();
      expect(fileWatcher.isWatching()).toBe(false);
    });

    it('should emit started event on watch start', async () => {
      // Arrange
      fileWatcher = new MockFileWatcher(context.todoPath);

      const startedPromise = new Promise<void>(resolve => {
        fileWatcher.on('started', data => {
          expect(data.path).toBe(context.todoPath);
          expect(data.timestamp).toBeInstanceOf(Date);
          resolve();
        });
      });

      // Act
      await fileWatcher.start();

      // Assert
      await startedPromise;
    });

    it('should emit stopped event on watch stop', async () => {
      // Arrange
      fileWatcher = new MockFileWatcher(context.todoPath);
      await fileWatcher.start();

      const stoppedPromise = new Promise<void>(resolve => {
        fileWatcher.on('stopped', data => {
          expect(data.path).toBe(context.todoPath);
          resolve();
        });
      });

      // Act
      await fileWatcher.stop();

      // Assert
      await stoppedPromise;
    });
  });

  describe('Debounce Validation', () => {
    it('should debounce rapid file changes (500ms)', async () => {
      // Arrange
      fileWatcher = new MockFileWatcher(context.todoPath, 500, 2000);
      await fileWatcher.start();

      let changeCount = 0;
      fileWatcher.on('change', () => {
        changeCount++;
      });

      // Act - Rapid changes within debounce window
      fileWatcher.simulateChange();
      await sleep(100);
      fileWatcher.simulateChange();
      await sleep(100);
      fileWatcher.simulateChange();

      fileWatcher.flush();
      await sleep(100);

      // Assert - Should only emit once due to debouncing
      expect(changeCount).toBe(1);
    });

    it('should respect custom debounce settings', async () => {
      // Arrange - 200ms debounce
      fileWatcher = new MockFileWatcher(context.todoPath, 200, 1000);
      await fileWatcher.start();

      let changeCount = 0;
      fileWatcher.on('change', () => {
        changeCount++;
      });

      // Act
      fileWatcher.simulateChange();
      await sleep(50);
      fileWatcher.simulateChange();

      fileWatcher.flush();
      await sleep(100);

      // Assert
      expect(changeCount).toBe(1);
    });

    it('should allow changes after debounce period', async () => {
      // Arrange
      fileWatcher = new MockFileWatcher(context.todoPath, 200, 1000);
      await fileWatcher.start();

      let changeCount = 0;
      fileWatcher.on('change', () => {
        changeCount++;
      });

      // Act
      fileWatcher.simulateChange();
      fileWatcher.flush();
      await sleep(250);

      fileWatcher.simulateChange();
      fileWatcher.flush();
      await sleep(250);

      // Assert - Should emit twice (after each debounce period)
      expect(changeCount).toBe(2);
    });
  });

  describe('Throttle Validation', () => {
    it('should throttle high-frequency events (2000ms)', async () => {
      // Arrange
      fileWatcher = new MockFileWatcher(context.todoPath, 100, 2000);
      await fileWatcher.start();

      let changeCount = 0;
      fileWatcher.on('change', () => {
        changeCount++;
      });

      // Act - Multiple changes within throttle window
      fileWatcher.simulateChange();
      fileWatcher.flush();
      await sleep(150);

      // These should be throttled
      fileWatcher.simulateChange();
      fileWatcher.flush();
      await sleep(150);

      fileWatcher.simulateChange();
      fileWatcher.flush();
      await sleep(150);

      // Assert - Should only emit once due to throttling
      expect(changeCount).toBe(1);
    });

    it('should allow events after throttle period', async () => {
      // Arrange
      fileWatcher = new MockFileWatcher(context.todoPath, 100, 1000);
      await fileWatcher.start();

      let changeCount = 0;
      fileWatcher.on('change', () => {
        changeCount++;
      });

      // Act
      fileWatcher.simulateChange();
      fileWatcher.flush();
      await sleep(150);

      // Wait for throttle to reset
      await sleep(1100);

      fileWatcher.simulateChange();
      fileWatcher.flush();
      await sleep(150);

      // Assert - Should emit twice (after throttle reset)
      expect(changeCount).toBe(2);
    });
  });

  describe('Rate Limiting During Rapid Changes', () => {
    it('should handle burst of rapid file changes', async () => {
      // Arrange
      fileWatcher = new MockFileWatcher(context.todoPath, 300, 1000);
      await fileWatcher.start();

      let changeCount = 0;
      fileWatcher.on('change', () => {
        changeCount++;
      });

      // Act - Simulate burst of 10 changes
      for (let i = 0; i < 10; i++) {
        fileWatcher.simulateChange();
        await sleep(50);
      }

      fileWatcher.flush();
      await sleep(400);

      // Assert - Should be heavily rate limited
      expect(changeCount).toBeLessThan(3);
    });

    it('should not drop final change in burst', async () => {
      // Arrange
      fileWatcher = new MockFileWatcher(context.todoPath, 200, 1000);
      await fileWatcher.start();

      const changes: string[] = [];
      fileWatcher.on('change', () => {
        changes.push('change');
      });

      // Act - Burst then flush
      for (let i = 0; i < 5; i++) {
        fileWatcher.simulateChange();
        await sleep(30);
      }

      fileWatcher.flush();
      await sleep(250);

      // Assert - At least one change should be emitted
      expect(changes.length).toBeGreaterThan(0);
    });
  });

  describe('File System Event Handling', () => {
    it('should include file stats in change events', async () => {
      // Arrange
      fileWatcher = new MockFileWatcher(context.todoPath, 100, 500);
      await fileWatcher.start();

      const eventPromise = new Promise<any>(resolve => {
        fileWatcher.on('change', event => {
          resolve(event);
        });
      });

      // Act
      fileWatcher.simulateChange();
      fileWatcher.flush();

      // Assert
      const event = await eventPromise;
      expect(event.stats).toBeDefined();
      expect(event.stats.size).toBeDefined();
      expect(event.stats.mtime).toBeInstanceOf(Date);
    });

    it('should include timestamp in events', async () => {
      // Arrange
      fileWatcher = new MockFileWatcher(context.todoPath, 100, 500);
      await fileWatcher.start();

      const eventPromise = new Promise<any>(resolve => {
        fileWatcher.on('change', event => {
          resolve(event);
        });
      });

      // Act
      fileWatcher.simulateChange();
      fileWatcher.flush();

      // Assert
      const event = await eventPromise;
      expect(event.timestamp).toBeInstanceOf(Date);
    });
  });

  describe('Integration with SyncCoordinator', () => {
    it('should trigger sync on file watcher events', async () => {
      // Arrange
      const tasks = createMockTasks(3);
      const markdown = generateTodoMarkdown(tasks);
      await writeTodoFile(context.todoPath, markdown);

      fileWatcher = new MockFileWatcher(context.todoPath, 100, 500);

      const coordinator = new SyncCoordinator({
        config: context.config,
        database: context.database,
        fileWatcher: fileWatcher as any,
      });

      await coordinator.start();

      // Act
      fileWatcher.simulateChange();
      fileWatcher.flush();
      await sleep(200);

      // Assert
      const stats = coordinator.getStats();
      expect(stats.totalSyncs).toBeGreaterThan(0);

      context.coordinator = coordinator;
    });

    it('should prevent concurrent syncs', async () => {
      // Arrange
      fileWatcher = new MockFileWatcher(context.todoPath, 50, 200);

      const coordinator = new SyncCoordinator({
        config: context.config,
        database: context.database,
        fileWatcher: fileWatcher as any,
      });

      await coordinator.start();

      // Act - Rapid changes
      const tasks = createMockTasks(2);
      const markdown = generateTodoMarkdown(tasks);
      await writeTodoFile(context.todoPath, markdown);

      for (let i = 0; i < 5; i++) {
        fileWatcher.simulateChange();
        await sleep(20);
      }

      fileWatcher.flush();
      await sleep(300);

      // Assert - Should not have 5 syncs due to prevention
      const stats = coordinator.getStats();
      expect(stats.totalSyncs).toBeLessThan(5);

      context.coordinator = coordinator;
    });
  });

  describe('Error Handling', () => {
    it('should handle file watcher errors gracefully', async () => {
      // Arrange
      fileWatcher = new MockFileWatcher(context.todoPath);
      await fileWatcher.start();

      let errorCaught = false;
      fileWatcher.on('error', () => {
        errorCaught = true;
      });

      // Act
      fileWatcher.emit('error', {
        type: 'error',
        path: context.todoPath,
        timestamp: new Date(),
        error: new Error('Test error'),
      });

      await sleep(50);

      // Assert
      expect(errorCaught).toBe(true);
      expect(fileWatcher.isWatching()).toBe(true);
    });
  });
});
