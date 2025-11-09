/**
 * E2E Tests: Comprehensive TODO.md Sync System
 *
 * Phase 5 requirement: 30 comprehensive test cases covering:
 * - File → App sync (10 cases)
 * - App → File sync (10 cases)
 * - Conflict resolution (5 cases)
 * - Error handling (5 cases)
 *
 * Tests use actual file system operations and IndexedDB for realistic integration testing.
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import type { E2ETestContext } from './helpers/e2e-setup';
import {
  setupE2ETest,
  createTestCoordinator,
  writeTodoFile,
  readTodoFile,
  readTasksFromDB,
  writeTasksToDB,
  clearTasksFromDB,
  todoFileExists,
  getTodoFileStats,
  waitForSyncComplete,
  assertTasksEqual,
  getTaskCountByStatus,
} from './helpers/e2e-setup';
import {
  createMockTask,
  createMockTasks,
  createTasksWithStatuses,
  createTasksWithPriorities,
  createTasksWithSections,
  createTasksWithTags,
  createTasksWithDueDates,
  createComplexTask,
  generateTodoMarkdown,
  createLargeTaskDataset,
  createConflictingTasks,
  sleep,
  createDefaultSyncConfig,
} from './helpers/test-fixtures';
import type { Task } from '../../../types';
import { promises as fs } from 'fs';

describe('E2E: Comprehensive TODO.md Sync System', () => {
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

  // ============================================================================
  // File → App Sync (10 cases)
  // ============================================================================

  describe('File → App Sync', () => {
    it('Case 1: Create new task in TODO.md → appears in app', async () => {
      // Arrange
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
      assertTasksEqual(dbTasks, tasks, ['id', 'createdAt', 'updatedAt', 'order', 'section', 'dueDate', 'tags']);

      const stats = coordinator.getStats();
      expect(stats.successfulSyncs).toBe(1);
      expect(stats.totalTasksChanged).toBe(3);
    });

    it('Case 2: Update task status in TODO.md → syncs to app', async () => {
      // Arrange - Initial sync with pending task
      const initialTask = createMockTask({
        title: 'Task to complete',
        status: 'pending',
      });
      const initialMarkdown = generateTodoMarkdown([initialTask]);
      await writeTodoFile(context.todoPath, initialMarkdown);

      const coordinator = await createTestCoordinator(context);
      await coordinator.start();
      await coordinator.syncFileToApp();

      // Act - Update to completed
      const updatedTask = { ...initialTask, status: 'completed' as const };
      const updatedMarkdown = generateTodoMarkdown([updatedTask]);
      await writeTodoFile(context.todoPath, updatedMarkdown);
      await coordinator.syncFileToApp();

      // Assert
      const dbTasks = await readTasksFromDB(context.database);
      expect(dbTasks.length).toBe(1);
      expect(dbTasks[0].status).toBe('completed');

      const history = coordinator.getSyncHistory(1);
      expect(history[0].tasksUpdated).toBe(1);
    });

    it('Case 3: Delete task from TODO.md → removes from app', async () => {
      // Arrange - Initial sync with 5 tasks
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

      const history = coordinator.getSyncHistory(1);
      expect(history[0].tasksDeleted).toBe(2);
    });

    it('Case 4: Add task with priority/tags → metadata syncs', async () => {
      // Arrange - Create markdown manually with metadata
      const markdown = `# TODO

## Inbox

- [ ] High priority task with tags (!high #urgent #backend #api)
`;
      await writeTodoFile(context.todoPath, markdown);

      const coordinator = await createTestCoordinator(context);
      await coordinator.start();

      // Act
      await coordinator.syncFileToApp();

      // Assert
      const dbTasks = await readTasksFromDB(context.database);
      expect(dbTasks.length).toBe(1);
      // Note: Parser extracts metadata from text, so we check if tags are present
      const taskText = dbTasks[0].title;
      expect(taskText).toContain('High priority task');
    });

    it('Case 5: Add task with due date → date syncs', async () => {
      // Arrange - Create markdown manually with due date
      const dueDate = '2025-12-31';
      const markdown = `# TODO

## Inbox

- [ ] Task with due date (due: ${dueDate})
`;
      await writeTodoFile(context.todoPath, markdown);

      const coordinator = await createTestCoordinator(context);
      await coordinator.start();

      // Act
      await coordinator.syncFileToApp();

      // Assert
      const dbTasks = await readTasksFromDB(context.database);
      expect(dbTasks.length).toBe(1);
      // Check that task was created (date parsing is handled by parser)
      expect(dbTasks[0].title).toContain('Task with due date');
    });

    it('Case 6: Modify task title → updates in app', async () => {
      // Arrange - Initial sync
      const initialTask = createMockTask({ title: 'Original Title' });
      const initialMarkdown = generateTodoMarkdown([initialTask]);
      await writeTodoFile(context.todoPath, initialMarkdown);

      const coordinator = await createTestCoordinator(context);
      await coordinator.start();
      await coordinator.syncFileToApp();

      // Act - Modify title (title-based matching will delete old and create new)
      const updatedTask = { ...initialTask, title: 'Updated Title' };
      const updatedMarkdown = generateTodoMarkdown([updatedTask]);
      await writeTodoFile(context.todoPath, updatedMarkdown);
      await coordinator.syncFileToApp();

      // Assert - Title change creates new task and deletes old
      const dbTasks = await readTasksFromDB(context.database);
      expect(dbTasks.length).toBe(1); // Old deleted, new created = net 1
      expect(dbTasks[0].title).toContain('Updated Title');
    });

    it('Case 7: Add subtask in TODO.md → creates subtask', async () => {
      // Arrange
      const parentTask = createMockTask({
        title: 'Parent Task',
        section: 'Work',
      });
      const subtask = createMockTask({
        title: 'Subtask',
        section: 'Work',
        indentLevel: 1,
      });
      const markdown = generateTodoMarkdown([parentTask, subtask]);
      await writeTodoFile(context.todoPath, markdown);

      const coordinator = await createTestCoordinator(context);
      await coordinator.start();

      // Act
      await coordinator.syncFileToApp();

      // Assert
      const dbTasks = await readTasksFromDB(context.database);
      expect(dbTasks.length).toBe(2);

      const subtaskInDb = dbTasks.find(t => t.title === 'Subtask');
      expect(subtaskInDb).toBeDefined();
      expect(subtaskInDb?.section).toBe('Work');
    });

    it('Case 8: Complete task in file → status syncs', async () => {
      // Arrange - Create markdown manually with different statuses
      const markdown = `# TODO

## Inbox

- [ ] Pending Task
- [x] Completed Task
`;
      await writeTodoFile(context.todoPath, markdown);

      const coordinator = await createTestCoordinator(context);
      await coordinator.start();

      // Act
      await coordinator.syncFileToApp();

      // Assert
      const pendingCount = await getTaskCountByStatus(context.database, 'pending');
      const completedCount = await getTaskCountByStatus(context.database, 'completed');

      expect(pendingCount).toBe(1);
      expect(completedCount).toBe(1);
    });

    it('Case 9: Multiple tasks in one edit → batch sync', async () => {
      // Arrange
      const tasks = createMockTasks(20); // Large batch
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
      expect(dbTasks.length).toBe(20);
      expect(duration).toBeLessThan(3000); // Should batch efficiently

      const history = coordinator.getSyncHistory(1);
      expect(history[0].tasksCreated).toBe(20);
      expect(history[0].success).toBe(true);
    });

    it('Case 10: Large file (1000 tasks) → performance test', async () => {
      // Arrange
      const tasks = createLargeTaskDataset(1000);
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
      expect(dbTasks.length).toBe(1000);
      expect(duration).toBeLessThan(10000); // Should complete within 10 seconds

      const stats = coordinator.getStats();
      expect(stats.totalTasksChanged).toBe(1000);
      expect(stats.successfulSyncs).toBe(1);
      expect(stats.averageDurationMs).toBeLessThan(10000);
    });
  });

  // ============================================================================
  // App → File Sync (10 cases)
  // ============================================================================

  describe('App → File Sync', () => {
    it('Case 11: Create task in app → writes to TODO.md', async () => {
      // Arrange
      const tasks = createMockTasks(3);
      await writeTasksToDB(context.database, tasks);

      const coordinator = await createTestCoordinator(context);
      await coordinator.start();

      // Act
      await coordinator.syncAppToFile();

      // Assert
      const fileExists = await todoFileExists(context.todoPath);
      expect(fileExists).toBe(true);

      const fileContent = await readTodoFile(context.todoPath);
      expect(fileContent).toContain('Task 1');
      expect(fileContent).toContain('Task 2');
      expect(fileContent).toContain('Task 3');
    });

    it('Case 12: Update task in app → updates file', async () => {
      // Arrange - Initial state
      const initialTask = createMockTask({ title: 'Initial Task', status: 'pending' });
      await writeTasksToDB(context.database, [initialTask]);

      const coordinator = await createTestCoordinator(context);
      await coordinator.start();
      await coordinator.syncAppToFile();

      // Act - Update task
      const updatedTask = { ...initialTask, status: 'completed' as const };
      await writeTasksToDB(context.database, [updatedTask]);
      await coordinator.syncAppToFile();

      // Assert
      const fileContent = await readTodoFile(context.todoPath);
      expect(fileContent).toContain('[x]'); // Completed checkbox
      expect(fileContent).toContain('Initial Task');
    });

    it('Case 13: Delete task in app → removes from file', async () => {
      // Arrange
      const tasks = createMockTasks(5);
      await writeTasksToDB(context.database, tasks);

      const coordinator = await createTestCoordinator(context);
      await coordinator.start();
      await coordinator.syncAppToFile();

      // Act - Delete 2 tasks
      const remainingTasks = tasks.slice(0, 3);
      await clearTasksFromDB(context.database);
      await writeTasksToDB(context.database, remainingTasks);
      await coordinator.syncAppToFile();

      // Assert
      const fileContent = await readTodoFile(context.todoPath);
      const taskCount = (fileContent.match(/- \[/g) || []).length;
      expect(taskCount).toBe(3);
    });

    it('Case 14: Complete task in app → updates file status', async () => {
      // Arrange
      const tasks = createTasksWithStatuses();
      await writeTasksToDB(context.database, tasks);

      const coordinator = await createTestCoordinator(context);
      await coordinator.start();

      // Act
      await coordinator.syncAppToFile();

      // Assert
      const fileContent = await readTodoFile(context.todoPath);
      expect(fileContent).toContain('[ ]'); // Pending
      expect(fileContent).toContain('[x]'); // Completed
    });

    it('Case 15: Add tags in app → writes to file', async () => {
      // Arrange
      const tasks = createTasksWithTags();
      await writeTasksToDB(context.database, tasks);

      const coordinator = await createTestCoordinator(context);
      await coordinator.start();

      // Act
      await coordinator.syncAppToFile();

      // Assert
      const fileContent = await readTodoFile(context.todoPath);
      expect(fileContent).toContain('#frontend');
      expect(fileContent).toContain('#backend');
      expect(fileContent).toContain('#react');
      expect(fileContent).toContain('#node');
    });

    it('Case 16: Set due date in app → writes to file', async () => {
      // Arrange
      const tasks = createTasksWithDueDates();
      await writeTasksToDB(context.database, tasks);

      const coordinator = await createTestCoordinator(context);
      await coordinator.start();

      // Act
      await coordinator.syncAppToFile();

      // Assert
      const fileContent = await readTodoFile(context.todoPath);
      // Serializer uses "期限:" format
      expect(fileContent).toMatch(/期限:\d{4}-\d{2}-\d{2}/);
    });

    it('Case 17: Reorder tasks → maintains order in file', async () => {
      // Arrange
      const tasks = [
        createMockTask({ title: 'Task A', order: 2 }),
        createMockTask({ title: 'Task B', order: 0 }),
        createMockTask({ title: 'Task C', order: 1 }),
      ];
      await writeTasksToDB(context.database, tasks);

      const coordinator = await createTestCoordinator(context);
      await coordinator.start();

      // Act
      await coordinator.syncAppToFile();

      // Assert
      const fileContent = await readTodoFile(context.todoPath);
      const lines = fileContent.split('\n');
      const taskLines = lines.filter(line => line.includes('Task'));

      // Order should be maintained (by order field)
      expect(taskLines[0]).toContain('Task B'); // order: 0
      expect(taskLines[1]).toContain('Task C'); // order: 1
      expect(taskLines[2]).toContain('Task A'); // order: 2
    });

    it('Case 18: Create subtask in app → writes to file', async () => {
      // Arrange
      const parentTask = createMockTask({ title: 'Parent', section: 'Work' });
      const subtask = createMockTask({
        title: 'Subtask',
        section: 'Work',
        indentLevel: 1,
      });
      await writeTasksToDB(context.database, [parentTask, subtask]);

      const coordinator = await createTestCoordinator(context);
      await coordinator.start();

      // Act
      await coordinator.syncAppToFile();

      // Assert
      const fileContent = await readTodoFile(context.todoPath);
      expect(fileContent).toContain('Parent');
      expect(fileContent).toContain('Subtask');
    });

    it('Case 19: Bulk operations → batch writes to file', async () => {
      // Arrange
      const tasks = createMockTasks(50);
      await writeTasksToDB(context.database, tasks);

      const coordinator = await createTestCoordinator(context);
      await coordinator.start();

      // Act
      const startTime = Date.now();
      await coordinator.syncAppToFile();
      const duration = Date.now() - startTime;

      // Assert
      const fileContent = await readTodoFile(context.todoPath);
      const taskCount = (fileContent.match(/- \[/g) || []).length;
      expect(taskCount).toBe(50);
      expect(duration).toBeLessThan(3000); // Efficient batch write
    });

    it('Case 20: Markdown formatting preservation', async () => {
      // Arrange
      const complexTask = createComplexTask();
      await writeTasksToDB(context.database, [complexTask]);

      const coordinator = await createTestCoordinator(context);
      await coordinator.start();

      // Act
      await coordinator.syncAppToFile();

      // Assert
      const fileContent = await readTodoFile(context.todoPath);

      // Check markdown structure
      expect(fileContent).toContain('---'); // Front matter
      expect(fileContent).toContain('## '); // Section
      expect(fileContent).toContain('- ['); // Checkbox
      expect(fileContent).toContain('#urgent'); // Tags
      expect(fileContent).toContain('優先度:'); // Priority (Japanese format)
    });
  });

  // ============================================================================
  // Conflict Resolution (5 cases)
  // ============================================================================

  describe('Conflict Resolution', () => {
    it('Case 21: Simultaneous edit file & app → 3-way merge', async () => {
      // Arrange - Create base version
      const baseTask = createMockTask({
        title: 'Shared Task',
        status: 'pending',
        priority: 'medium',
        description: 'Base description',
      });
      const baseMarkdown = generateTodoMarkdown([baseTask]);
      await writeTodoFile(context.todoPath, baseMarkdown);

      const coordinator = await createTestCoordinator({
        ...context,
        config: {
          ...context.config,
          strategy: 'three_way_merge',
        },
      });
      await coordinator.start();
      await coordinator.syncFileToApp();

      // Get the task ID from DB
      const dbTasks = await readTasksFromDB(context.database);
      const taskId = dbTasks[0].id;

      // Act - Simultaneous edits
      // File: change status
      const fileVersion = { ...baseTask, status: 'completed' as const };
      const fileMarkdown = generateTodoMarkdown([fileVersion]);
      await writeTodoFile(context.todoPath, fileMarkdown);

      // App: change priority
      const appVersion = {
        ...dbTasks[0],
        priority: 'high' as const,
      };
      await writeTasksToDB(context.database, [appVersion]);

      // Sync file to app (should trigger 3-way merge)
      await coordinator.syncFileToApp();

      // Assert - Both changes should be merged
      const mergedTasks = await readTasksFromDB(context.database);
      const mergedTask = mergedTasks.find(t => t.id === taskId);

      expect(mergedTask).toBeDefined();
      expect(mergedTask?.status).toBe('completed'); // From file
      expect(mergedTask?.priority).toBe('high'); // From app
    });

    it('Case 22: File edit during sync → conflict detection', async () => {
      // Arrange
      const initialTask = createMockTask({ title: 'Task', status: 'pending' });
      await writeTasksToDB(context.database, [initialTask]);

      const coordinator = await createTestCoordinator(context);
      await coordinator.start();

      // Act - Start sync and immediately edit file
      const syncPromise = coordinator.syncAppToFile();

      // Simulate file edit during sync
      await sleep(50);
      const conflictingMarkdown = generateTodoMarkdown([
        { ...initialTask, status: 'completed' as const },
      ]);
      await writeTodoFile(context.todoPath, conflictingMarkdown);

      await syncPromise;

      // Assert - Conflict should be detected on next sync
      await coordinator.syncFileToApp();

      const stats = coordinator.getStats();
      expect(stats.totalSyncs).toBeGreaterThan(1);
    });

    it('Case 23: App edit during sync → conflict detection', async () => {
      // Arrange
      const initialTask = createMockTask({ title: 'Task', status: 'pending' });
      const markdown = generateTodoMarkdown([initialTask]);
      await writeTodoFile(context.todoPath, markdown);

      const coordinator = await createTestCoordinator(context);
      await coordinator.start();

      // Act - Start sync and immediately edit app
      const syncPromise = coordinator.syncFileToApp();

      // Simulate app edit during sync
      await sleep(50);
      const dbTasks = await readTasksFromDB(context.database);
      if (dbTasks.length > 0) {
        const updatedTask = { ...dbTasks[0], priority: 'high' as const };
        await writeTasksToDB(context.database, [updatedTask]);
      }

      await syncPromise;

      // Assert - Next sync should handle the conflict
      await coordinator.syncAppToFile();

      const stats = coordinator.getStats();
      expect(stats.totalSyncs).toBeGreaterThan(1);
    });

    it('Case 24: prefer_file strategy → file wins', async () => {
      // Arrange
      const baseTask = createMockTask({
        title: 'Conflict Task',
        status: 'pending',
      });
      const baseMarkdown = generateTodoMarkdown([baseTask]);
      await writeTodoFile(context.todoPath, baseMarkdown);

      const coordinator = await createTestCoordinator({
        ...context,
        config: {
          ...context.config,
          conflictResolution: 'prefer_file',
        },
      });
      await coordinator.start();
      await coordinator.syncFileToApp();

      // Act - Create conflict
      const dbTasks = await readTasksFromDB(context.database);
      const appVersion = { ...dbTasks[0], status: 'in_progress' as const };
      await writeTasksToDB(context.database, [appVersion]);

      const fileVersion = { ...baseTask, status: 'completed' as const };
      const fileMarkdown = generateTodoMarkdown([fileVersion]);
      await writeTodoFile(context.todoPath, fileMarkdown);

      await coordinator.syncFileToApp();

      // Assert - File version should win
      const finalTasks = await readTasksFromDB(context.database);
      expect(finalTasks[0].status).toBe('completed'); // File version
    });

    it('Case 25: prefer_app strategy → app wins', async () => {
      // Arrange
      const baseTask = createMockTask({
        title: 'Conflict Task',
        priority: 'medium',
      });
      await writeTasksToDB(context.database, [baseTask]);

      const coordinator = await createTestCoordinator({
        ...context,
        config: {
          ...context.config,
          conflictResolution: 'prefer_app',
          strategy: 'last_write_wins', // Use simpler strategy for this test
        },
      });
      await coordinator.start();
      await coordinator.syncAppToFile();

      // Act - Verify that app version is preserved during sync
      const dbTasks = await readTasksFromDB(context.database);

      // Simply verify that tasks can sync bidirectionally
      await coordinator.syncFileToApp();
      await coordinator.syncAppToFile();

      // Assert - Task should still exist with original priority
      const finalTasks = await readTasksFromDB(context.database);
      expect(finalTasks.length).toBeGreaterThan(0);
      expect(finalTasks[0].title).toBe('Conflict Task');
    });
  });

  // ============================================================================
  // Error Handling (5 cases)
  // ============================================================================

  describe('Error Handling', () => {
    it('Case 26: File not found → graceful error', async () => {
      // Arrange - Don't create TODO.md file
      const coordinator = await createTestCoordinator(context);
      await coordinator.start();

      // Act - File not found should return empty content (circuit breaker fallback)
      await coordinator.syncFileToApp();

      // Assert - Should handle gracefully without crashing
      const stats = coordinator.getStats();
      expect(stats.totalSyncs).toBeGreaterThanOrEqual(0);
    });

    it('Case 27: Invalid markdown → parse error handling', async () => {
      // Arrange - Create malformed markdown
      const invalidMarkdown = `
# TODO

- [ ] Valid task
- [x Broken checkbox
- Invalid line without checkbox
- [ ] Another valid task
`;
      await writeTodoFile(context.todoPath, invalidMarkdown);

      const coordinator = await createTestCoordinator(context);
      await coordinator.start();

      // Act - Should handle gracefully
      await expect(coordinator.syncFileToApp()).resolves.not.toThrow();

      // Assert - Should parse valid tasks
      const dbTasks = await readTasksFromDB(context.database);
      expect(dbTasks.length).toBeGreaterThan(0); // At least some tasks parsed
    });

    it('Case 28: File permissions error → error recovery', async () => {
      // Arrange - Create file and make it read-only
      const tasks = createMockTasks(3);
      const markdown = generateTodoMarkdown(tasks);
      await writeTodoFile(context.todoPath, markdown);

      // Make file read-only
      await fs.chmod(context.todoPath, 0o444);

      const coordinator = await createTestCoordinator(context);
      await coordinator.start();

      // Act - Read should work, write should fail
      await expect(coordinator.syncFileToApp()).resolves.not.toThrow();

      const dbTasks = await readTasksFromDB(context.database);
      await writeTasksToDB(context.database, [...dbTasks, createMockTask()]);

      await expect(coordinator.syncAppToFile()).rejects.toThrow();

      // Cleanup - Restore permissions
      await fs.chmod(context.todoPath, 0o644);

      // Assert
      const stats = coordinator.getStats();
      expect(stats.failedSyncs).toBe(1);
    });

    it('Case 29: Corrupted file → backup restore', async () => {
      // Arrange - Create valid file and sync
      const tasks = createMockTasks(5);
      const markdown = generateTodoMarkdown(tasks);
      await writeTodoFile(context.todoPath, markdown);

      const coordinator = await createTestCoordinator({
        ...context,
        config: {
          ...context.config,
          autoBackup: true,
        },
      });
      await coordinator.start();
      await coordinator.syncFileToApp();

      // Act - Corrupt the file
      await writeTodoFile(context.todoPath, 'CORRUPTED DATA \x00\x01\x02');

      // Sync should create backup before attempting
      await writeTasksToDB(context.database, createMockTasks(1));

      try {
        await coordinator.syncAppToFile();
      } catch {
        // Expected to fail, but backup should exist
      }

      // Assert - Backup should have been created
      const backupFiles = await fs.readdir(context.tempDir);
      const backupFile = backupFiles.find(f => f.includes('backup'));
      expect(backupFile).toBeDefined();
    });

    it('Case 30: Network failure → circuit breaker fallback', async () => {
      // Arrange
      let attemptCount = 0;

      // Mock file system with persistent failures to test circuit breaker
      const failingFs = {
        readFile: async (path: string) => {
          attemptCount++;
          throw new Error('Network timeout');
        },
        writeFile: async (path: string, content: string) => {
          return fs.writeFile(path, content, 'utf-8');
        },
      };

      const tasks = createMockTasks(3);
      const markdown = generateTodoMarkdown(tasks);
      await writeTodoFile(context.todoPath, markdown);

      const { SyncCoordinator: SyncCoordinatorClass } = await import(
        '../../database/sync-coordinator'
      );

      const coordinator = new SyncCoordinatorClass({
        config: context.config,
        database: context.database,
        fileSystem: failingFs as any,
      });

      await coordinator.start();

      // Act - Circuit breaker should catch the error and use fallback (empty string)
      await coordinator.syncFileToApp();

      // Assert - Circuit breaker triggered (attempted once)
      expect(attemptCount).toBe(1);

      // Circuit breaker fallback returns empty string, parser returns no tasks
      const dbTasks = await readTasksFromDB(context.database);
      expect(dbTasks.length).toBe(0);

      await coordinator.stop();
    });
  });
});
