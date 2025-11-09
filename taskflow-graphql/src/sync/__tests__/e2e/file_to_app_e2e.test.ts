/**
 * E2E Tests: File → App Sync Workflow
 *
 * Tests the complete workflow of synchronizing TODO.md file changes to IndexedDB.
 * Covers parsing, change detection, batch writing, and incremental updates.
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import type { E2ETestContext } from './helpers/e2e-setup';
import {
  setupE2ETest,
  createTestCoordinator,
  writeTodoFile,
  readTasksFromDB,
  clearTasksFromDB,
  waitForSyncComplete,
  assertTasksEqual,
  getTaskCountByStatus,
  writeTasksToDB,
} from './helpers/e2e-setup';
import {
  createMockTasks,
  createTasksWithStatuses,
  createTasksWithPriorities,
  createTasksWithSections,
  createTasksWithTags,
  generateTodoMarkdown,
  createLargeTaskDataset,
  sleep,
} from './helpers/test-fixtures';

describe('E2E: File → App Sync Workflow', () => {
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

  describe('Basic File Parsing and Sync', () => {
    it('should parse TODO.md and create tasks in IndexedDB', async () => {
      // Arrange
      const tasks = createMockTasks(5);
      const markdown = generateTodoMarkdown(tasks);
      await writeTodoFile(context.todoPath, markdown);

      const coordinator = await createTestCoordinator(context);
      await coordinator.start();

      // Act
      await coordinator.syncFileToApp();

      // Assert
      const dbTasks = await readTasksFromDB(context.database);
      expect(dbTasks.length).toBe(5);
      assertTasksEqual(dbTasks, tasks, ['id', 'createdAt', 'updatedAt']);
    });

    it('should handle empty TODO.md file', async () => {
      // Arrange
      await writeTodoFile(context.todoPath, '# TODO\n\n');

      const coordinator = await createTestCoordinator(context);
      await coordinator.start();

      // Act
      await coordinator.syncFileToApp();

      // Assert
      const dbTasks = await readTasksFromDB(context.database);
      expect(dbTasks.length).toBe(0);
    });

    it('should parse tasks with various statuses', async () => {
      // Arrange
      const tasks = createTasksWithStatuses();
      const markdown = generateTodoMarkdown(tasks);
      await writeTodoFile(context.todoPath, markdown);

      const coordinator = await createTestCoordinator(context);
      await coordinator.start();

      // Act
      await coordinator.syncFileToApp();

      // Assert
      const pendingCount = await getTaskCountByStatus(context.database, 'pending');
      const inProgressCount = await getTaskCountByStatus(context.database, 'in_progress');
      const completedCount = await getTaskCountByStatus(context.database, 'completed');

      expect(pendingCount).toBe(1);
      expect(inProgressCount).toBe(1);
      expect(completedCount).toBe(1);
    });

    it('should parse tasks with priorities', async () => {
      // Arrange
      const tasks = createTasksWithPriorities();
      const markdown = generateTodoMarkdown(tasks);
      await writeTodoFile(context.todoPath, markdown);

      const coordinator = await createTestCoordinator(context);
      await coordinator.start();

      // Act
      await coordinator.syncFileToApp();

      // Assert
      const dbTasks = await readTasksFromDB(context.database);
      const priorities = dbTasks.map(t => t.priority);

      expect(priorities).toContain('low');
      expect(priorities).toContain('medium');
      expect(priorities).toContain('high');
    });
  });

  describe('Section and Tag Support', () => {
    it('should parse tasks with sections', async () => {
      // Arrange
      const tasks = createTasksWithSections();
      const markdown = generateTodoMarkdown(tasks);
      await writeTodoFile(context.todoPath, markdown);

      const coordinator = await createTestCoordinator(context);
      await coordinator.start();

      // Act
      await coordinator.syncFileToApp();

      // Assert
      const dbTasks = await readTasksFromDB(context.database);
      const sections = dbTasks.map(t => t.section).filter(Boolean);

      expect(sections).toContain('Work');
      expect(sections).toContain('Personal');
      expect(sections).toContain('Shopping');
    });

    it('should parse tasks with tags', async () => {
      // Arrange
      const tasks = createTasksWithTags();
      const markdown = generateTodoMarkdown(tasks);
      await writeTodoFile(context.todoPath, markdown);

      const coordinator = await createTestCoordinator(context);
      await coordinator.start();

      // Act
      await coordinator.syncFileToApp();

      // Assert
      const dbTasks = await readTasksFromDB(context.database);
      const allTags = dbTasks.flatMap(t => t.tags || []);

      expect(allTags).toContain('frontend');
      expect(allTags).toContain('backend');
      expect(allTags).toContain('react');
      expect(allTags).toContain('node');
    });

    it('should handle multiple sections with multiple tasks', async () => {
      // Arrange
      const workTasks = createMockTasks(3, { section: 'Work' });
      const personalTasks = createMockTasks(2, { section: 'Personal' });
      const allTasks = [...workTasks, ...personalTasks];
      const markdown = generateTodoMarkdown(allTasks);
      await writeTodoFile(context.todoPath, markdown);

      const coordinator = await createTestCoordinator(context);
      await coordinator.start();

      // Act
      await coordinator.syncFileToApp();

      // Assert
      const dbTasks = await readTasksFromDB(context.database);
      const workTasksInDb = dbTasks.filter(t => t.section === 'Work');
      const personalTasksInDb = dbTasks.filter(t => t.section === 'Personal');

      expect(workTasksInDb.length).toBe(3);
      expect(personalTasksInDb.length).toBe(2);
    });
  });

  describe('Incremental Updates', () => {
    it('should detect and sync only changed tasks', async () => {
      // Arrange - Initial sync
      const initialTasks = createMockTasks(5);
      const initialMarkdown = generateTodoMarkdown(initialTasks);
      await writeTodoFile(context.todoPath, initialMarkdown);

      const coordinator = await createTestCoordinator(context);
      await coordinator.start();
      await coordinator.syncFileToApp();

      // Act - Update one task
      const updatedTasks = [...initialTasks];
      updatedTasks[2] = { ...updatedTasks[2], status: 'completed' as const };
      const updatedMarkdown = generateTodoMarkdown(updatedTasks);
      await writeTodoFile(context.todoPath, updatedMarkdown);

      await coordinator.syncFileToApp();

      // Assert
      const dbTasks = await readTasksFromDB(context.database);
      const completedTasks = dbTasks.filter(t => t.status === 'completed');

      expect(dbTasks.length).toBe(5);
      expect(completedTasks.length).toBe(1);
    });

    it('should handle task additions', async () => {
      // Arrange - Initial sync
      const initialTasks = createMockTasks(3);
      const initialMarkdown = generateTodoMarkdown(initialTasks);
      await writeTodoFile(context.todoPath, initialMarkdown);

      const coordinator = await createTestCoordinator(context);
      await coordinator.start();
      await coordinator.syncFileToApp();

      // Act - Add new tasks
      const newTasks = createMockTasks(2);
      const allTasks = [...initialTasks, ...newTasks];
      const updatedMarkdown = generateTodoMarkdown(allTasks);
      await writeTodoFile(context.todoPath, updatedMarkdown);

      await coordinator.syncFileToApp();

      // Assert
      const dbTasks = await readTasksFromDB(context.database);
      expect(dbTasks.length).toBe(5);
    });

    it('should handle task deletions', async () => {
      // Arrange - Initial sync
      const initialTasks = createMockTasks(5);
      const initialMarkdown = generateTodoMarkdown(initialTasks);
      await writeTodoFile(context.todoPath, initialMarkdown);

      const coordinator = await createTestCoordinator(context);
      await coordinator.start();
      await coordinator.syncFileToApp();

      // Act - Remove 2 tasks
      const remainingTasks = initialTasks.slice(0, 3);
      const updatedMarkdown = generateTodoMarkdown(remainingTasks);
      await writeTodoFile(context.todoPath, updatedMarkdown);

      await coordinator.syncFileToApp();

      // Assert
      const dbTasks = await readTasksFromDB(context.database);
      expect(dbTasks.length).toBe(3);
    });

    it('should handle simultaneous additions and deletions', async () => {
      // Arrange - Initial sync
      const initialTasks = createMockTasks(5);
      const initialMarkdown = generateTodoMarkdown(initialTasks);
      await writeTodoFile(context.todoPath, initialMarkdown);

      const coordinator = await createTestCoordinator(context);
      await coordinator.start();
      await coordinator.syncFileToApp();

      // Act - Remove 2, add 3
      const remainingTasks = initialTasks.slice(0, 3);
      const newTasks = createMockTasks(3);
      const updatedTasks = [...remainingTasks, ...newTasks];
      const updatedMarkdown = generateTodoMarkdown(updatedTasks);
      await writeTodoFile(context.todoPath, updatedMarkdown);

      await coordinator.syncFileToApp();

      // Assert
      const dbTasks = await readTasksFromDB(context.database);
      expect(dbTasks.length).toBe(6);
    });
  });

  describe('Batch Operations', () => {
    it('should batch write multiple tasks efficiently', async () => {
      // Arrange
      const tasks = createMockTasks(50);
      const markdown = generateTodoMarkdown(tasks);
      await writeTodoFile(context.todoPath, markdown);

      const coordinator = await createTestCoordinator(context);
      await coordinator.start();

      // Act
      const startTime = Date.now();
      await coordinator.syncFileToApp();
      const duration = Date.now() - startTime;

      // Assert
      const dbTasks = await readTasksFromDB(context.database);
      expect(dbTasks.length).toBe(50);
      expect(duration).toBeLessThan(5000); // Should complete within 5s
    });

    it('should handle large file sync (1000+ tasks)', async () => {
      // Arrange
      const tasks = createLargeTaskDataset(1000);
      const markdown = generateTodoMarkdown(tasks);
      await writeTodoFile(context.todoPath, markdown);

      const coordinator = await createTestCoordinator(context);
      await coordinator.start();

      // Act
      await coordinator.syncFileToApp();

      // Assert
      const dbTasks = await readTasksFromDB(context.database);
      expect(dbTasks.length).toBe(1000);

      const stats = coordinator.getStats();
      expect(stats.totalSyncs).toBe(1);
      expect(stats.successfulSyncs).toBe(1);
    });

    it('should track sync statistics accurately', async () => {
      // Arrange
      const tasks = createMockTasks(10);
      const markdown = generateTodoMarkdown(tasks);
      await writeTodoFile(context.todoPath, markdown);

      const coordinator = await createTestCoordinator(context);
      await coordinator.start();

      // Act
      await coordinator.syncFileToApp();

      // Assert
      const stats = coordinator.getStats();
      expect(stats.totalSyncs).toBe(1);
      expect(stats.successfulSyncs).toBe(1);
      expect(stats.failedSyncs).toBe(0);
      expect(stats.totalTasksChanged).toBe(10);
      expect(stats.lastSyncAt).toBeInstanceOf(Date);
    });
  });

  describe('Error Handling and Edge Cases', () => {
    it('should handle malformed TODO.md gracefully', async () => {
      // Arrange
      const malformedMarkdown = '# TODO\n\n- [ ] Task 1\n- Invalid line\n- [x Broken checkbox';
      await writeTodoFile(context.todoPath, malformedMarkdown);

      const coordinator = await createTestCoordinator(context);
      await coordinator.start();

      // Act & Assert
      // Should not throw, but may skip invalid lines
      await expect(coordinator.syncFileToApp()).resolves.not.toThrow();
    });

    it('should skip sync when file content has not changed', async () => {
      // Arrange
      const tasks = createMockTasks(3);
      const markdown = generateTodoMarkdown(tasks);
      await writeTodoFile(context.todoPath, markdown);

      const coordinator = await createTestCoordinator(context);
      await coordinator.start();

      // Act - First sync
      await coordinator.syncFileToApp();
      const stats1 = coordinator.getStats();

      // Second sync with no changes
      await coordinator.syncFileToApp();
      const stats2 = coordinator.getStats();

      // Assert - Should skip second sync
      expect(stats2.totalSyncs).toBe(stats1.totalSyncs);
    });

    it('should handle empty database gracefully', async () => {
      // Arrange
      await clearTasksFromDB(context.database);
      const tasks = createMockTasks(3);
      const markdown = generateTodoMarkdown(tasks);
      await writeTodoFile(context.todoPath, markdown);

      const coordinator = await createTestCoordinator(context);
      await coordinator.start();

      // Act
      await coordinator.syncFileToApp();

      // Assert
      const dbTasks = await readTasksFromDB(context.database);
      expect(dbTasks.length).toBe(3);
    });

    it('should handle Unicode and special characters', async () => {
      // Arrange
      const tasks = [
        { ...createMockTasks(1)[0], title: '日本語タスク 🎌' },
        { ...createMockTasks(1)[0], title: 'Emoji Task 🚀✨' },
        { ...createMockTasks(1)[0], title: 'Special chars: @#$%^&*()' },
      ];
      const markdown = generateTodoMarkdown(tasks);
      await writeTodoFile(context.todoPath, markdown);

      const coordinator = await createTestCoordinator(context);
      await coordinator.start();

      // Act
      await coordinator.syncFileToApp();

      // Assert
      const dbTasks = await readTasksFromDB(context.database);
      expect(dbTasks.length).toBe(3);
      expect(dbTasks.some(t => t.title.includes('日本語'))).toBe(true);
      expect(dbTasks.some(t => t.title.includes('🚀'))).toBe(true);
    });
  });

  describe('Sync History and Reporting', () => {
    it('should record sync history', async () => {
      // Arrange
      const tasks = createMockTasks(5);
      const markdown = generateTodoMarkdown(tasks);
      await writeTodoFile(context.todoPath, markdown);

      const coordinator = await createTestCoordinator(context);
      await coordinator.start();

      // Act
      await coordinator.syncFileToApp();

      // Assert
      const history = coordinator.getSyncHistory(1);
      expect(history.length).toBe(1);
      expect(history[0].direction).toBe('file_to_app');
      expect(history[0].success).toBe(true);
      expect(history[0].tasksCreated).toBe(5);
      expect(history[0].durationMs).toBeGreaterThan(0);
    });

    it('should track multiple sync operations', async () => {
      // Arrange
      const coordinator = await createTestCoordinator(context);
      await coordinator.start();

      // Act - Perform 3 syncs
      for (let i = 0; i < 3; i++) {
        const tasks = createMockTasks(2 + i);
        const markdown = generateTodoMarkdown(tasks);
        await writeTodoFile(context.todoPath, markdown);
        await coordinator.syncFileToApp();
        await sleep(100);
      }

      // Assert
      const history = coordinator.getSyncHistory(10);
      expect(history.length).toBe(3);
      expect(history.every(h => h.success)).toBe(true);
    });
  });
});
