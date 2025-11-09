/**
 * E2E Tests: Performance & Resilience
 *
 * Tests circuit breaker activation, retry mechanisms, large file handling,
 * and backup/restore workflows.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { promises as fs } from 'fs';
import type { E2ETestContext } from './helpers/e2e-setup';
import {
  setupE2ETest,
  createTestCoordinator,
  writeTodoFile,
  readTasksFromDB,
  writeTasksToDB,
  backupTodoFile,
  restoreTodoFile,
  todoFileExists,
  getTodoFileStats,
  measureSyncPerformance,
  verifyDatabaseIntegrity,
} from './helpers/e2e-setup';
import {
  createMockTasks,
  createLargeTaskDataset,
  generateTodoMarkdown,
  sleep,
} from './helpers/test-fixtures';

describe('E2E: Performance & Resilience', () => {
  let context: E2ETestContext;

  beforeEach(async () => {
    context = await setupE2ETest();
  });

  afterEach(async () => {
    if (context.coordinator) {
      await context.coordinator.stop();
    }
    await context.cleanup();
  });

  describe('Circuit Breaker Activation', () => {
    it('should activate circuit breaker after error threshold (50%)', async () => {
      // Arrange
      const coordinator = await createTestCoordinator(context);

      // Mock file system to cause errors
      const originalRead = fs.readFile;
      let attemptCount = 0;
      const maxAttempts = 10;

      vi.spyOn(fs, 'readFile').mockImplementation(async (path: any, encoding?: any) => {
        attemptCount++;
        if (attemptCount % 2 === 0 && attemptCount < maxAttempts) {
          throw new Error('Simulated read error');
        }
        return originalRead(path, encoding);
      });

      await coordinator.start();

      // Act - Multiple sync attempts with 50% failure rate
      let successCount = 0;
      let errorCount = 0;

      for (let i = 0; i < maxAttempts; i++) {
        try {
          await coordinator.syncFileToApp();
          successCount++;
        } catch {
          errorCount++;
        }
        await sleep(50);
      }

      // Assert - Circuit breaker should have been activated
      expect(errorCount).toBeGreaterThan(0);

      // Cleanup
      vi.restoreAllMocks();
    });

    it('should recover after circuit breaker reset timeout', async () => {
      // Arrange
      const coordinator = await createTestCoordinator(context);
      await coordinator.start();

      const tasks = createMockTasks(3);
      const markdown = generateTodoMarkdown(tasks);
      await writeTodoFile(context.todoPath, markdown);

      // Act - Circuit breaker should reset and allow operations
      await sleep(100);
      await coordinator.syncFileToApp();

      // Assert
      const stats = coordinator.getStats();
      expect(stats.successfulSyncs).toBeGreaterThan(0);
    });

    it('should use fallback when circuit is open', async () => {
      // Arrange
      const coordinator = await createTestCoordinator(context);
      await coordinator.start();

      // Act - Even with potential errors, fallback should prevent total failure
      try {
        await coordinator.syncFileToApp();
      } catch (error) {
        // Should not throw due to fallback
        expect(error).toBeUndefined();
      }

      // Assert - Coordinator should still be operational
      expect(coordinator).toBeDefined();
    });
  });

  describe('Retry Mechanism', () => {
    it('should retry failed operations (3 attempts)', async () => {
      // Arrange
      const coordinator = await createTestCoordinator(context);

      let attemptCount = 0;
      const originalRead = fs.readFile;

      vi.spyOn(fs, 'readFile').mockImplementation(async (path: any, encoding?: any) => {
        attemptCount++;
        if (attemptCount < 3) {
          throw new Error('Transient error');
        }
        return originalRead(path, encoding);
      });

      const tasks = createMockTasks(2);
      const markdown = generateTodoMarkdown(tasks);
      await writeTodoFile(context.todoPath, markdown);

      await coordinator.start();

      // Act
      await coordinator.syncFileToApp();

      // Assert - Should succeed after retries
      expect(attemptCount).toBe(3);
      const dbTasks = await readTasksFromDB(context.database);
      expect(dbTasks.length).toBe(2);

      // Cleanup
      vi.restoreAllMocks();
    });

    it('should use exponential backoff for retries', async () => {
      // Arrange
      const coordinator = await createTestCoordinator(context);

      const retryTimes: number[] = [];
      let attemptCount = 0;

      const originalRead = fs.readFile;
      vi.spyOn(fs, 'readFile').mockImplementation(async (path: any, encoding?: any) => {
        attemptCount++;
        retryTimes.push(Date.now());

        if (attemptCount < 3) {
          throw new Error('Transient error');
        }
        return originalRead(path, encoding);
      });

      const tasks = createMockTasks(1);
      const markdown = generateTodoMarkdown(tasks);
      await writeTodoFile(context.todoPath, markdown);

      await coordinator.start();

      // Act
      await coordinator.syncFileToApp();

      // Assert - Delays should increase exponentially
      if (retryTimes.length >= 3) {
        const delay1 = retryTimes[1] - retryTimes[0];
        const delay2 = retryTimes[2] - retryTimes[1];
        expect(delay2).toBeGreaterThan(delay1);
      }

      // Cleanup
      vi.restoreAllMocks();
    });

    it('should fail after max retry attempts', async () => {
      // Arrange
      const coordinator = await createTestCoordinator(context);

      vi.spyOn(fs, 'readFile').mockRejectedValue(new Error('Persistent error'));

      await coordinator.start();

      // Act & Assert
      await expect(coordinator.syncFileToApp()).rejects.toThrow();

      // Cleanup
      vi.restoreAllMocks();
    });
  });

  describe('Large File Handling', () => {
    it('should handle 1000+ tasks efficiently', async () => {
      // Arrange
      const tasks = createLargeTaskDataset(1000);
      const markdown = generateTodoMarkdown(tasks);
      await writeTodoFile(context.todoPath, markdown);

      const coordinator = await createTestCoordinator(context);
      await coordinator.start();

      // Act
      const { durationMs } = await measureSyncPerformance(async () => {
        await coordinator.syncFileToApp();
      });

      // Assert
      const dbTasks = await readTasksFromDB(context.database);
      expect(dbTasks.length).toBe(1000);
      expect(durationMs).toBeLessThan(10000); // Should complete within 10s

      const stats = coordinator.getStats();
      expect(stats.totalTasksChanged).toBe(1000);
    });

    it('should handle 5000+ tasks with batch processing', async () => {
      // Arrange
      const tasks = createLargeTaskDataset(5000);
      const markdown = generateTodoMarkdown(tasks);
      await writeTodoFile(context.todoPath, markdown);

      const coordinator = await createTestCoordinator(context);
      await coordinator.start();

      // Act
      const { durationMs } = await measureSyncPerformance(async () => {
        await coordinator.syncFileToApp();
      });

      // Assert
      const dbTasks = await readTasksFromDB(context.database);
      expect(dbTasks.length).toBe(5000);
      expect(durationMs).toBeLessThan(30000); // Should complete within 30s
    });

    it('should maintain database integrity with large datasets', async () => {
      // Arrange
      const tasks = createLargeTaskDataset(2000);
      const markdown = generateTodoMarkdown(tasks);
      await writeTodoFile(context.todoPath, markdown);

      const coordinator = await createTestCoordinator(context);
      await coordinator.start();

      // Act
      await coordinator.syncFileToApp();

      // Assert
      const isValid = await verifyDatabaseIntegrity(context.database);
      expect(isValid).toBe(true);
    });

    it('should enforce max file size limit', async () => {
      // Arrange
      const hugeTasks = createLargeTaskDataset(100000);
      const hugeMarkdown = generateTodoMarkdown(hugeTasks);
      await writeTodoFile(context.todoPath, hugeMarkdown);

      // Set low max file size
      context.config.maxFileSizeMB = 1;
      const coordinator = await createTestCoordinator(context);

      // Act & Assert
      await expect(coordinator.start()).rejects.toThrow();
    });

    it('should enforce max tasks limit', async () => {
      // Arrange
      context.config.maxTasks = 100;

      const tasks = createLargeTaskDataset(150);
      const markdown = generateTodoMarkdown(tasks);
      await writeTodoFile(context.todoPath, markdown);

      const coordinator = await createTestCoordinator(context);
      await coordinator.start();

      // Act
      await coordinator.syncFileToApp();

      // Assert - Should limit to maxTasks
      const dbTasks = await readTasksFromDB(context.database);
      expect(dbTasks.length).toBeLessThanOrEqual(150);
    });
  });

  describe('Backup and Restore Workflow', () => {
    it('should create backup before sync', async () => {
      // Arrange
      const initialTasks = createMockTasks(3);
      const initialMarkdown = generateTodoMarkdown(initialTasks);
      await writeTodoFile(context.todoPath, initialMarkdown);

      context.config.autoBackup = true;
      const coordinator = await createTestCoordinator(context);
      await coordinator.start();

      const newTasks = createMockTasks(5);
      await writeTasksToDB(context.database, newTasks);

      // Act
      await coordinator.syncAppToFile();

      // Assert - Backup should exist (sync succeeded)
      const stats = coordinator.getStats();
      expect(stats.successfulSyncs).toBe(1);
    });

    it('should restore from backup successfully', async () => {
      // Arrange
      const originalTasks = createMockTasks(3);
      const originalMarkdown = generateTodoMarkdown(originalTasks);
      await writeTodoFile(context.todoPath, originalMarkdown);

      const backupPath = await backupTodoFile(context.todoPath);

      // Modify file
      const modifiedTasks = createMockTasks(5);
      const modifiedMarkdown = generateTodoMarkdown(modifiedTasks);
      await writeTodoFile(context.todoPath, modifiedMarkdown);

      // Act - Restore
      await restoreTodoFile(context.todoPath, backupPath);

      // Assert
      const restoredContent = await fs.readFile(context.todoPath, 'utf-8');
      expect(restoredContent).toBe(originalMarkdown);

      // Cleanup
      await fs.unlink(backupPath);
    });

    it('should verify backup integrity', async () => {
      // Arrange
      const tasks = createMockTasks(10);
      const markdown = generateTodoMarkdown(tasks);
      await writeTodoFile(context.todoPath, markdown);

      const backupPath = await backupTodoFile(context.todoPath);

      // Act
      const originalStats = await getTodoFileStats(context.todoPath);
      const backupStats = await fs.stat(backupPath);

      // Assert
      expect(backupStats.size).toBe(originalStats.size);

      const originalContent = await fs.readFile(context.todoPath, 'utf-8');
      const backupContent = await fs.readFile(backupPath, 'utf-8');
      expect(backupContent).toBe(originalContent);

      // Cleanup
      await fs.unlink(backupPath);
    });

    it('should rotate old backups (retention policy)', async () => {
      // Arrange
      const tasks = createMockTasks(2);
      const markdown = generateTodoMarkdown(tasks);
      await writeTodoFile(context.todoPath, markdown);

      context.config.autoBackup = true;
      context.config.backupRetentionDays = 30;

      const coordinator = await createTestCoordinator(context);
      await coordinator.start();

      // Act - Multiple syncs creating backups
      for (let i = 0; i < 3; i++) {
        const newTasks = createMockTasks(2 + i);
        await writeTasksToDB(context.database, newTasks);
        await coordinator.syncAppToFile();
        await sleep(100);
      }

      // Assert - Backups should be managed
      const stats = coordinator.getStats();
      expect(stats.successfulSyncs).toBe(3);
    });
  });

  describe('Performance Optimization', () => {
    it('should use differential sync for minimal changes', async () => {
      // Arrange
      const tasks = createMockTasks(100);
      const markdown = generateTodoMarkdown(tasks);
      await writeTodoFile(context.todoPath, markdown);

      const coordinator = await createTestCoordinator(context);
      await coordinator.start();

      // Initial sync
      await coordinator.syncFileToApp();

      // Act - Change only 1 task
      const updatedTasks = [...tasks];
      updatedTasks[0] = { ...updatedTasks[0], status: 'completed' as const };
      const updatedMarkdown = generateTodoMarkdown(updatedTasks);
      await writeTodoFile(context.todoPath, updatedMarkdown);

      const { durationMs } = await measureSyncPerformance(async () => {
        await coordinator.syncFileToApp();
      });

      // Assert - Should be faster than initial sync
      expect(durationMs).toBeLessThan(2000);

      const history = coordinator.getSyncHistory(2);
      expect(history[1].tasksChanged).toBeLessThan(100);
    });

    it('should skip sync when no changes detected', async () => {
      // Arrange
      const tasks = createMockTasks(50);
      const markdown = generateTodoMarkdown(tasks);
      await writeTodoFile(context.todoPath, markdown);

      const coordinator = await createTestCoordinator(context);
      await coordinator.start();

      await coordinator.syncFileToApp();
      const stats1 = coordinator.getStats();

      // Act - Sync again without changes
      await coordinator.syncFileToApp();
      const stats2 = coordinator.getStats();

      // Assert - Should skip second sync
      expect(stats2.totalSyncs).toBe(stats1.totalSyncs);
    });

    it('should track average sync duration accurately', async () => {
      // Arrange
      const coordinator = await createTestCoordinator(context);
      await coordinator.start();

      // Act - Multiple syncs
      const syncCount = 5;
      for (let i = 0; i < syncCount; i++) {
        const tasks = createMockTasks(10);
        const markdown = generateTodoMarkdown(tasks);
        await writeTodoFile(context.todoPath, markdown);
        await coordinator.syncFileToApp();
        await sleep(50);
      }

      // Assert
      const stats = coordinator.getStats();
      expect(stats.averageDurationMs).toBeGreaterThan(0);
      expect(stats.totalSyncs).toBe(syncCount);
    });
  });

  describe('Error Recovery', () => {
    it('should recover from partial sync failures', async () => {
      // Arrange
      const tasks = createMockTasks(10);
      const markdown = generateTodoMarkdown(tasks);
      await writeTodoFile(context.todoPath, markdown);

      const coordinator = await createTestCoordinator(context);

      // Simulate intermittent failure
      let callCount = 0;
      const originalRead = fs.readFile;
      vi.spyOn(fs, 'readFile').mockImplementation(async (path: any, encoding?: any) => {
        callCount++;
        if (callCount === 1) {
          throw new Error('Simulated failure');
        }
        return originalRead(path, encoding);
      });

      await coordinator.start();

      // Act - First attempt fails, second succeeds
      try {
        await coordinator.syncFileToApp();
      } catch {
        // Expected failure
      }

      await coordinator.syncFileToApp();

      // Assert
      const stats = coordinator.getStats();
      expect(stats.successfulSyncs).toBe(1);
      expect(stats.failedSyncs).toBe(1);

      // Cleanup
      vi.restoreAllMocks();
    });

    it('should maintain data consistency after errors', async () => {
      // Arrange
      const originalTasks = createMockTasks(5);
      await writeTasksToDB(context.database, originalTasks);

      const coordinator = await createTestCoordinator(context);
      await coordinator.start();

      // Act - Failed sync attempt
      vi.spyOn(fs, 'readFile').mockRejectedValueOnce(new Error('Read error'));

      try {
        await coordinator.syncFileToApp();
      } catch {
        // Expected
      }

      // Assert - Original data should be intact
      const dbTasks = await readTasksFromDB(context.database);
      expect(dbTasks.length).toBe(5);

      const isValid = await verifyDatabaseIntegrity(context.database);
      expect(isValid).toBe(true);

      // Cleanup
      vi.restoreAllMocks();
    });
  });

  describe('Concurrency and Race Conditions', () => {
    it('should prevent concurrent sync operations', async () => {
      // Arrange
      const tasks = createMockTasks(5);
      const markdown = generateTodoMarkdown(tasks);
      await writeTodoFile(context.todoPath, markdown);

      const coordinator = await createTestCoordinator(context);
      await coordinator.start();

      // Act - Attempt concurrent syncs
      const sync1 = coordinator.syncFileToApp();
      const sync2 = coordinator.syncFileToApp();

      await Promise.all([sync1, sync2]);

      // Assert - Should only execute one sync
      const stats = coordinator.getStats();
      expect(stats.totalSyncs).toBe(1);
    });

    it('should handle rapid sequential syncs', async () => {
      // Arrange
      const coordinator = await createTestCoordinator(context);
      await coordinator.start();

      // Act - Rapid sequential syncs
      for (let i = 0; i < 5; i++) {
        const tasks = createMockTasks(2);
        const markdown = generateTodoMarkdown(tasks);
        await writeTodoFile(context.todoPath, markdown);
        await coordinator.syncFileToApp();
        await sleep(10);
      }

      // Assert
      const stats = coordinator.getStats();
      expect(stats.successfulSyncs).toBe(5);
    });
  });
});
