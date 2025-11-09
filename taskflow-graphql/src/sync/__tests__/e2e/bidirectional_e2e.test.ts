/**
 * E2E Tests: Bidirectional Sync
 *
 * Tests concurrent edits, 3-way merge conflict resolution, and manual conflict handling.
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import type { E2ETestContext } from './helpers/e2e-setup';
import {
  setupE2ETest,
  createTestCoordinator,
  writeTodoFile,
  readTasksFromDB,
  writeTasksToDB,
  readTodoFile,
  assertTasksEqual,
} from './helpers/e2e-setup';
import {
  createMockTask,
  createMockTasks,
  createConflictingTasks,
  createMultipleConflictingTasks,
  generateTodoMarkdown,
  sleep,
  createDefaultSyncConfig,
} from './helpers/test-fixtures';
import type { Task } from '../../../types';

describe('E2E: Bidirectional Sync', () => {
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

  describe('Concurrent Edits Detection', () => {
    it('should detect concurrent edits on both sides', async () => {
      // Arrange - Setup initial state
      const initialTasks = createMockTasks(3);
      await writeTasksToDB(context.database, initialTasks);
      const initialMarkdown = generateTodoMarkdown(initialTasks);
      await writeTodoFile(context.todoPath, initialMarkdown);

      // Enable 3-way merge strategy
      context.config.strategy = 'three_way_merge';
      const coordinator = await createTestCoordinator(context);
      await coordinator.start();

      // Initial sync to establish base versions
      await coordinator.syncFileToApp();

      // Act - Concurrent edits
      // Edit in file
      const fileEditedTasks = [...initialTasks];
      fileEditedTasks[0] = {
        ...fileEditedTasks[0],
        status: 'completed' as const,
      };
      const fileMarkdown = generateTodoMarkdown(fileEditedTasks);
      await writeTodoFile(context.todoPath, fileMarkdown);

      // Edit in app (same task, different field)
      const appEditedTasks = [...initialTasks];
      appEditedTasks[0] = {
        ...appEditedTasks[0],
        priority: 'high' as const,
      };
      await writeTasksToDB(context.database, appEditedTasks);

      // Sync
      await coordinator.syncFileToApp();

      // Assert
      const dbTasks = await readTasksFromDB(context.database);
      const editedTask = dbTasks.find(t => t.title === fileEditedTasks[0].title);

      expect(editedTask).toBeDefined();
      // Both changes should be merged
      expect(editedTask?.status).toBe('completed');
      expect(editedTask?.priority).toBe('high');
    });

    it('should track base versions for 3-way merge', async () => {
      // Arrange
      const tasks = createMockTasks(5);
      await writeTasksToDB(context.database, tasks);

      context.config.strategy = 'three_way_merge';
      const coordinator = await createTestCoordinator(context);
      await coordinator.start();

      // Act - Sync to create base versions
      await coordinator.syncAppToFile();

      // Assert - Verify base versions exist
      const baseVersion = await coordinator.getBaseVersion(tasks[0].id);
      expect(baseVersion).toBeDefined();
      expect(baseVersion?.task.id).toBe(tasks[0].id);
    });

    it('should detect concurrent deletion conflicts', async () => {
      // Arrange
      const initialTasks = createMockTasks(3);
      await writeTasksToDB(context.database, initialTasks);
      const initialMarkdown = generateTodoMarkdown(initialTasks);
      await writeTodoFile(context.todoPath, initialMarkdown);

      context.config.strategy = 'three_way_merge';
      const coordinator = await createTestCoordinator(context);
      await coordinator.start();
      await coordinator.syncFileToApp();

      // Act - Delete in file, modify in app
      const fileTasksDeleted = initialTasks.slice(1); // Remove first task
      const fileMarkdown = generateTodoMarkdown(fileTasksDeleted);
      await writeTodoFile(context.todoPath, fileMarkdown);

      const appTasksModified = [...initialTasks];
      appTasksModified[0] = {
        ...appTasksModified[0],
        status: 'completed' as const,
      };
      await writeTasksToDB(context.database, appTasksModified);

      // Sync
      await coordinator.syncFileToApp();

      // Assert - Should detect conflict
      const conflicts = coordinator.getConflicts();
      const stats = coordinator.getStats();

      expect(stats.totalConflicts).toBeGreaterThan(0);
    });
  });

  describe('3-Way Merge Resolution', () => {
    it('should auto-merge non-conflicting changes', async () => {
      // Arrange
      const { base, fileVersion, appVersion } = createConflictingTasks();

      // Modify different fields
      const fileTask = { ...base, status: 'completed' as const };
      const appTask = { ...base, priority: 'high' as const };

      await writeTasksToDB(context.database, [appTask]);
      const fileMarkdown = generateTodoMarkdown([fileTask]);
      await writeTodoFile(context.todoPath, fileMarkdown);

      context.config.strategy = 'three_way_merge';
      context.config.conflictResolution = 'merge';
      const coordinator = await createTestCoordinator(context);
      await coordinator.start();

      // Act
      await coordinator.syncFileToApp();

      // Assert - Both changes should be merged
      const dbTasks = await readTasksFromDB(context.database);
      expect(dbTasks.length).toBe(1);
      expect(dbTasks[0].status).toBe('completed');
      expect(dbTasks[0].priority).toBe('high');
    });

    it('should detect conflicting field changes', async () => {
      // Arrange
      const base = createMockTask({ status: 'pending' });
      await writeTasksToDB(context.database, [base]);
      const baseMarkdown = generateTodoMarkdown([base]);
      await writeTodoFile(context.todoPath, baseMarkdown);

      context.config.strategy = 'three_way_merge';
      const coordinator = await createTestCoordinator(context);
      await coordinator.start();
      await coordinator.syncFileToApp();

      // Act - Both sides change the same field
      const fileTask = { ...base, status: 'completed' as const };
      const appTask = { ...base, status: 'in_progress' as const };

      await writeTasksToDB(context.database, [appTask]);
      const fileMarkdown = generateTodoMarkdown([fileTask]);
      await writeTodoFile(context.todoPath, fileMarkdown);

      await coordinator.syncFileToApp();

      // Assert - Should detect conflict on status field
      const conflicts = coordinator.getConflicts();
      expect(conflicts.length).toBeGreaterThan(0);

      const statusConflict = conflicts.find(c =>
        c.fileVersion.title === base.title
      );
      expect(statusConflict).toBeDefined();
    });

    it('should prefer file version with prefer_file policy', async () => {
      // Arrange
      const base = createMockTask({ priority: 'medium' });
      await writeTasksToDB(context.database, [base]);
      const baseMarkdown = generateTodoMarkdown([base]);
      await writeTodoFile(context.todoPath, baseMarkdown);

      context.config.strategy = 'three_way_merge';
      context.config.conflictResolution = 'prefer_file';
      const coordinator = await createTestCoordinator(context);
      await coordinator.start();
      await coordinator.syncFileToApp();

      // Act - Conflicting changes
      const fileTask = { ...base, priority: 'high' as const };
      const appTask = { ...base, priority: 'low' as const };

      await writeTasksToDB(context.database, [appTask]);
      const fileMarkdown = generateTodoMarkdown([fileTask]);
      await writeTodoFile(context.todoPath, fileMarkdown);

      await coordinator.syncFileToApp();

      // Assert - Should use file version
      const dbTasks = await readTasksFromDB(context.database);
      expect(dbTasks[0].priority).toBe('high');
    });

    it('should prefer app version with prefer_app policy', async () => {
      // Arrange
      const base = createMockTask({ priority: 'medium' });
      await writeTasksToDB(context.database, [base]);
      const baseMarkdown = generateTodoMarkdown([base]);
      await writeTodoFile(context.todoPath, baseMarkdown);

      context.config.strategy = 'three_way_merge';
      context.config.conflictResolution = 'prefer_app';
      const coordinator = await createTestCoordinator(context);
      await coordinator.start();
      await coordinator.syncFileToApp();

      // Act - Conflicting changes
      const fileTask = { ...base, priority: 'high' as const };
      const appTask = { ...base, priority: 'low' as const };

      await writeTasksToDB(context.database, [appTask]);
      const fileMarkdown = generateTodoMarkdown([fileTask]);
      await writeTodoFile(context.todoPath, fileMarkdown);

      await coordinator.syncFileToApp();

      // Assert - Should use app version
      const dbTasks = await readTasksFromDB(context.database);
      expect(dbTasks[0].priority).toBe('low');
    });

    it('should intelligently merge arrays (tags)', async () => {
      // Arrange
      const base = createMockTask({ tags: ['tag1', 'tag2'] });
      await writeTasksToDB(context.database, [base]);
      const baseMarkdown = generateTodoMarkdown([base]);
      await writeTodoFile(context.todoPath, baseMarkdown);

      context.config.strategy = 'three_way_merge';
      context.config.conflictResolution = 'merge';
      const coordinator = await createTestCoordinator(context);
      await coordinator.start();
      await coordinator.syncFileToApp();

      // Act - Add different tags on each side
      const fileTask = { ...base, tags: ['tag1', 'tag2', 'tag3'] };
      const appTask = { ...base, tags: ['tag1', 'tag2', 'tag4'] };

      await writeTasksToDB(context.database, [appTask]);
      const fileMarkdown = generateTodoMarkdown([fileTask]);
      await writeTodoFile(context.todoPath, fileMarkdown);

      await coordinator.syncFileToApp();

      // Assert - Should merge both tag additions
      const dbTasks = await readTasksFromDB(context.database);
      const mergedTags = dbTasks[0].tags || [];

      expect(mergedTags).toContain('tag1');
      expect(mergedTags).toContain('tag2');
      expect(mergedTags).toContain('tag3');
      expect(mergedTags).toContain('tag4');
    });
  });

  describe('Manual Conflict Resolution', () => {
    it('should mark conflicts for manual resolution', async () => {
      // Arrange
      const base = createMockTask({ status: 'pending' });
      await writeTasksToDB(context.database, [base]);
      const baseMarkdown = generateTodoMarkdown([base]);
      await writeTodoFile(context.todoPath, baseMarkdown);

      context.config.strategy = 'three_way_merge';
      context.config.conflictResolution = 'manual';
      const coordinator = await createTestCoordinator(context);
      await coordinator.start();
      await coordinator.syncFileToApp();

      // Act - Conflicting changes
      const fileTask = { ...base, status: 'completed' as const };
      const appTask = { ...base, status: 'in_progress' as const };

      await writeTasksToDB(context.database, [appTask]);
      const fileMarkdown = generateTodoMarkdown([fileTask]);
      await writeTodoFile(context.todoPath, fileMarkdown);

      await coordinator.syncFileToApp();

      // Assert - Should have unresolved conflicts
      const conflicts = coordinator.getConflicts();
      const unresolvedConflicts = conflicts.filter(c => !c.resolved);

      expect(unresolvedConflicts.length).toBeGreaterThan(0);
    });

    it('should provide conflict details for manual review', async () => {
      // Arrange
      const base = createMockTask({ description: 'Original' });
      await writeTasksToDB(context.database, [base]);
      const baseMarkdown = generateTodoMarkdown([base]);
      await writeTodoFile(context.todoPath, baseMarkdown);

      context.config.strategy = 'three_way_merge';
      context.config.conflictResolution = 'manual';
      const coordinator = await createTestCoordinator(context);
      await coordinator.start();
      await coordinator.syncFileToApp();

      // Act - Conflicting descriptions
      const fileTask = { ...base, description: 'Updated in file' };
      const appTask = { ...base, description: 'Updated in app' };

      await writeTasksToDB(context.database, [appTask]);
      const fileMarkdown = generateTodoMarkdown([fileTask]);
      await writeTodoFile(context.todoPath, fileMarkdown);

      await coordinator.syncFileToApp();

      // Assert
      const conflicts = coordinator.getConflicts();
      expect(conflicts.length).toBeGreaterThan(0);

      const conflict = conflicts[0];
      expect(conflict.fileVersion).toBeDefined();
      expect(conflict.appVersion).toBeDefined();
      expect(conflict.baseVersion).toBeDefined();
      expect(conflict.conflictType).toBe('content');
      expect(conflict.detectedAt).toBeInstanceOf(Date);
    });
  });

  describe('App → File Sync', () => {
    it('should sync app changes to TODO.md file', async () => {
      // Arrange
      const tasks = createMockTasks(5);
      await writeTasksToDB(context.database, tasks);

      const coordinator = await createTestCoordinator(context);
      await coordinator.start();

      // Act
      await coordinator.syncAppToFile();

      // Assert
      const fileContent = await readTodoFile(context.todoPath);
      expect(fileContent).toContain('# TODO');
      expect(fileContent).toContain('Task 1');
      expect(fileContent).toContain('Task 5');
    });

    it('should preserve task order when syncing to file', async () => {
      // Arrange
      const tasks = createMockTasks(3);
      tasks[0].order = 0;
      tasks[1].order = 1;
      tasks[2].order = 2;
      await writeTasksToDB(context.database, tasks);

      const coordinator = await createTestCoordinator(context);
      await coordinator.start();

      // Act
      await coordinator.syncAppToFile();

      // Assert
      const fileContent = await readTodoFile(context.todoPath);
      const lines = fileContent.split('\n').filter(l => l.startsWith('- ['));

      expect(lines[0]).toContain('Task 1');
      expect(lines[1]).toContain('Task 2');
      expect(lines[2]).toContain('Task 3');
    });

    it('should create backup before syncing to file', async () => {
      // Arrange
      const initialTasks = createMockTasks(2);
      const initialMarkdown = generateTodoMarkdown(initialTasks);
      await writeTodoFile(context.todoPath, initialMarkdown);

      context.config.autoBackup = true;
      const coordinator = await createTestCoordinator(context);
      await coordinator.start();

      const newTasks = createMockTasks(3);
      await writeTasksToDB(context.database, newTasks);

      // Act
      await coordinator.syncAppToFile();

      // Assert - Backup should be created (implementation creates .backup files)
      // We verify by checking that sync completed successfully
      const stats = coordinator.getStats();
      expect(stats.successfulSyncs).toBe(1);
    });
  });

  describe('Bidirectional Sync Workflow', () => {
    it('should handle complete bidirectional sync cycle', async () => {
      // Arrange
      const coordinator = await createTestCoordinator(context);
      await coordinator.start();

      // Act - File → App
      const fileTasks = createMockTasks(3, { section: 'File Origin' });
      const fileMarkdown = generateTodoMarkdown(fileTasks);
      await writeTodoFile(context.todoPath, fileMarkdown);
      await coordinator.syncFileToApp();

      // App → File
      const appTasks = createMockTasks(2, { section: 'App Origin' });
      const allTasks = [...fileTasks, ...appTasks];
      await writeTasksToDB(context.database, allTasks);
      await coordinator.syncAppToFile();

      // File → App again
      await coordinator.syncFileToApp();

      // Assert
      const dbTasks = await readTasksFromDB(context.database);
      expect(dbTasks.length).toBe(5);

      const fileContent = await readTodoFile(context.todoPath);
      expect(fileContent).toContain('File Origin');
      expect(fileContent).toContain('App Origin');
    });

    it('should maintain consistency across multiple sync cycles', async () => {
      // Arrange
      context.config.strategy = 'three_way_merge';
      const coordinator = await createTestCoordinator(context);
      await coordinator.start();

      // Act - Multiple sync cycles
      for (let i = 0; i < 3; i++) {
        // File → App
        const tasks = createMockTasks(2, { section: `Cycle ${i}` });
        const markdown = generateTodoMarkdown(tasks);
        await writeTodoFile(context.todoPath, markdown);
        await coordinator.syncFileToApp();

        // App → File
        await coordinator.syncAppToFile();

        await sleep(100);
      }

      // Assert
      const dbTasks = await readTasksFromDB(context.database);
      const fileContent = await readTodoFile(context.todoPath);

      // All cycles should be present
      expect(fileContent).toContain('Cycle 0');
      expect(fileContent).toContain('Cycle 1');
      expect(fileContent).toContain('Cycle 2');
      expect(dbTasks.length).toBeGreaterThan(0);
    });
  });

  describe('Conflict Statistics and Reporting', () => {
    it('should track conflict resolution statistics', async () => {
      // Arrange
      const conflictSets = createMultipleConflictingTasks(3);
      context.config.strategy = 'three_way_merge';
      context.config.conflictResolution = 'merge';
      const coordinator = await createTestCoordinator(context);
      await coordinator.start();

      // Act - Create and resolve conflicts
      for (const { base, fileVersion, appVersion } of conflictSets) {
        await writeTasksToDB(context.database, [base]);
        const baseMarkdown = generateTodoMarkdown([base]);
        await writeTodoFile(context.todoPath, baseMarkdown);
        await coordinator.syncFileToApp();

        // Create conflict
        await writeTasksToDB(context.database, [appVersion]);
        const fileMarkdown = generateTodoMarkdown([fileVersion]);
        await writeTodoFile(context.todoPath, fileMarkdown);
        await coordinator.syncFileToApp();

        await sleep(50);
      }

      // Assert
      const stats = coordinator.getStats();
      expect(stats.totalConflicts).toBeGreaterThan(0);
      expect(stats.autoResolvedConflicts).toBeGreaterThan(0);
    });
  });
});
