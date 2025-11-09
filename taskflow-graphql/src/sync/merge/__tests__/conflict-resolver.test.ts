import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ConflictResolver } from '../conflict-resolver';
import type { Conflict, Task, ConflictResolutionPolicy } from '../../types';

describe('ConflictResolver', () => {
  let resolver: ConflictResolver;

  // Test fixture tasks
  const createTask = (overrides: Partial<Task> = {}): Task => ({
    id: 'task-123',
    title: 'Test Task',
    status: 'pending',
    priority: 'medium',
    createdAt: new Date('2025-01-01T10:00:00Z'),
    updatedAt: new Date('2025-01-01T10:00:00Z'),
    ...overrides,
  });

  const createConflict = (
    fileVersion: Task,
    appVersion: Task,
    baseVersion?: Task
  ): Conflict => ({
    id: 'conflict-123',
    taskId: 'task-123',
    fileVersion,
    appVersion,
    baseVersion,
    detectedAt: new Date(),
    conflictType: 'content',
    resolved: false,
  });

  beforeEach(() => {
    resolver = new ConflictResolver();
  });

  describe('Strategy: LastWriteWins (prefer newer timestamp)', () => {
    it('should use file version when file is newer', () => {
      const fileTask = createTask({
        title: 'File Task',
        updatedAt: new Date('2025-01-01T12:00:00Z'),
      });
      const appTask = createTask({
        title: 'App Task',
        updatedAt: new Date('2025-01-01T10:00:00Z'),
      });
      const conflict = createConflict(fileTask, appTask);

      const result = resolver.resolve(conflict);

      expect(result.success).toBe(true);
      expect(result.resolvedTask?.title).toBe('File Task');
    });

    it('should use app version when app is newer', () => {
      const fileTask = createTask({
        title: 'File Task',
        updatedAt: new Date('2025-01-01T10:00:00Z'),
      });
      const appTask = createTask({
        title: 'App Task',
        updatedAt: new Date('2025-01-01T12:00:00Z'),
      });
      const conflict = createConflict(fileTask, appTask);

      const result = resolver.resolve(conflict);

      expect(result.success).toBe(true);
      expect(result.resolvedTask?.title).toBe('App Task');
    });

    it('should update the updatedAt timestamp on resolution', () => {
      const fileTask = createTask({
        updatedAt: new Date('2025-01-01T12:00:00Z'),
      });
      const appTask = createTask({
        updatedAt: new Date('2025-01-01T10:00:00Z'),
      });
      const conflict = createConflict(fileTask, appTask);

      const beforeResolve = new Date();
      const result = resolver.resolve(conflict);
      const afterResolve = new Date();

      expect(result.resolvedTask?.updatedAt.getTime()).toBeGreaterThanOrEqual(
        beforeResolve.getTime()
      );
      expect(result.resolvedTask?.updatedAt.getTime()).toBeLessThanOrEqual(
        afterResolve.getTime()
      );
    });
  });

  describe('Strategy: FileWins (prefer file)', () => {
    it('should always use file version', () => {
      const fileTask = createTask({
        title: 'File Task',
        status: 'in_progress',
        priority: 'high',
      });
      const appTask = createTask({
        title: 'App Task',
        status: 'completed',
        priority: 'low',
      });
      const conflict = createConflict(fileTask, appTask);

      const result = resolver.resolve(conflict, 'prefer_file');

      expect(result.success).toBe(true);
      expect(result.resolvedTask?.title).toBe('File Task');
      expect(result.resolvedTask?.status).toBe('in_progress');
      expect(result.resolvedTask?.priority).toBe('high');
      expect(result.resolution?.method).toBe('use_file');
    });

    it('should use file version even when app is newer', () => {
      const fileTask = createTask({
        title: 'File Task',
        updatedAt: new Date('2025-01-01T10:00:00Z'),
      });
      const appTask = createTask({
        title: 'App Task',
        updatedAt: new Date('2025-01-01T12:00:00Z'),
      });
      const conflict = createConflict(fileTask, appTask);

      const result = resolver.resolve(conflict, 'prefer_file');

      expect(result.success).toBe(true);
      expect(result.resolvedTask?.title).toBe('File Task');
    });
  });

  describe('Strategy: DbWins (prefer app)', () => {
    it('should always use app version', () => {
      const fileTask = createTask({
        title: 'File Task',
        status: 'pending',
        priority: 'low',
      });
      const appTask = createTask({
        title: 'App Task',
        status: 'completed',
        priority: 'high',
      });
      const conflict = createConflict(fileTask, appTask);

      const result = resolver.resolve(conflict, 'prefer_app');

      expect(result.success).toBe(true);
      expect(result.resolvedTask?.title).toBe('App Task');
      expect(result.resolvedTask?.status).toBe('completed');
      expect(result.resolvedTask?.priority).toBe('high');
      expect(result.resolution?.method).toBe('use_app');
    });

    it('should use app version even when file is newer', () => {
      const fileTask = createTask({
        title: 'File Task',
        updatedAt: new Date('2025-01-01T12:00:00Z'),
      });
      const appTask = createTask({
        title: 'App Task',
        updatedAt: new Date('2025-01-01T10:00:00Z'),
      });
      const conflict = createConflict(fileTask, appTask);

      const result = resolver.resolve(conflict, 'prefer_app');

      expect(result.success).toBe(true);
      expect(result.resolvedTask?.title).toBe('App Task');
    });
  });

  describe('Strategy: Merge (intelligent merge)', () => {
    it('should merge non-conflicting fields', () => {
      const baseTask = createTask({
        title: 'Original Title',
        status: 'pending',
        priority: 'medium',
        description: 'Original description',
        tags: ['tag1'],
      });
      const fileTask = createTask({
        ...baseTask,
        title: 'Updated Title',
        status: 'in_progress',
        updatedAt: new Date('2025-01-01T11:00:00Z'),
      });
      const appTask = createTask({
        ...baseTask,
        priority: 'high',
        tags: ['tag1', 'tag2'],
        updatedAt: new Date('2025-01-01T11:00:00Z'),
      });
      const conflict = createConflict(fileTask, appTask, baseTask);

      const result = resolver.resolve(conflict, 'merge');

      expect(result.success).toBe(true);
      expect(result.resolvedTask?.title).toBe('Updated Title');
      expect(result.resolvedTask?.status).toBe('in_progress');
      expect(result.resolvedTask?.priority).toBe('high');
      expect(result.resolvedTask?.tags).toEqual(['tag1', 'tag2']);
    });

    it('should use newer timestamp for conflicting fields', () => {
      const fileTask = createTask({
        title: 'File Title',
        status: 'in_progress',
        updatedAt: new Date('2025-01-01T10:00:00Z'),
      });
      const appTask = createTask({
        title: 'App Title',
        status: 'completed',
        updatedAt: new Date('2025-01-01T12:00:00Z'),
      });
      const conflict = createConflict(fileTask, appTask);

      const result = resolver.resolve(conflict, 'merge');

      expect(result.success).toBe(true);
      // App is newer, so app values should win for conflicting fields
      expect(result.resolvedTask?.title).toBe('App Title');
      expect(result.resolvedTask?.status).toBe('completed');
    });

    it('should merge arrays intelligently', () => {
      const baseTask = createTask({
        tags: ['tag1', 'tag2'],
      });
      const fileTask = createTask({
        ...baseTask,
        tags: ['tag1', 'tag2', 'tag3'],
        updatedAt: new Date('2025-01-01T11:00:00Z'),
      });
      const appTask = createTask({
        ...baseTask,
        tags: ['tag1', 'tag2', 'tag4'],
        updatedAt: new Date('2025-01-01T11:00:00Z'),
      });
      const conflict = createConflict(fileTask, appTask, baseTask);

      const result = resolver.resolve(conflict, 'merge');

      expect(result.success).toBe(true);
      // Should merge unique tags from both versions
      const tags = result.resolvedTask?.tags || [];
      expect(tags).toContain('tag1');
      expect(tags).toContain('tag2');
    });

    it('should handle missing base version gracefully', () => {
      const fileTask = createTask({
        title: 'File Title',
        status: 'in_progress',
      });
      const appTask = createTask({
        title: 'App Title',
        status: 'completed',
      });
      const conflict = createConflict(fileTask, appTask);

      const result = resolver.resolve(conflict, 'merge');

      expect(result.success).toBe(true);
      expect(result.resolvedTask).toBeDefined();
    });
  });

  describe('Conflict detection', () => {
    it('should detect title conflicts', () => {
      const fileTask = createTask({ title: 'File Title' });
      const appTask = createTask({ title: 'App Title' });
      const conflict = createConflict(fileTask, appTask);

      const record = resolver.createManualResolutionRecord(conflict);

      expect(record.conflictingFields).toContain('title');
      expect(record.fieldValues.title).toEqual({
        fileValue: 'File Title',
        appValue: 'App Title',
        baseValue: undefined,
      });
    });

    it('should detect status conflicts', () => {
      const fileTask = createTask({ status: 'in_progress' });
      const appTask = createTask({ status: 'completed' });
      const conflict = createConflict(fileTask, appTask);

      const record = resolver.createManualResolutionRecord(conflict);

      expect(record.conflictingFields).toContain('status');
    });

    it('should detect priority conflicts', () => {
      const fileTask = createTask({ priority: 'high' });
      const appTask = createTask({ priority: 'low' });
      const conflict = createConflict(fileTask, appTask);

      const record = resolver.createManualResolutionRecord(conflict);

      expect(record.conflictingFields).toContain('priority');
    });

    it('should detect label conflicts', () => {
      const fileTask = createTask({ tags: ['tag1', 'tag2'] });
      const appTask = createTask({ tags: ['tag3', 'tag4'] });
      const conflict = createConflict(fileTask, appTask);

      const record = resolver.createManualResolutionRecord(conflict);

      expect(record.conflictingFields).toContain('tags');
    });

    it('should detect dueDate conflicts', () => {
      const fileTask = createTask({ dueDate: '2025-01-15' });
      const appTask = createTask({ dueDate: '2025-01-20' });
      const conflict = createConflict(fileTask, appTask);

      const record = resolver.createManualResolutionRecord(conflict);

      expect(record.conflictingFields).toContain('dueDate');
    });

    it('should not detect conflicts for equal values', () => {
      const fileTask = createTask({ title: 'Same Title', status: 'pending' });
      const appTask = createTask({ title: 'Same Title', status: 'pending' });
      const conflict = createConflict(fileTask, appTask);

      const record = resolver.createManualResolutionRecord(conflict);

      expect(record.conflictingFields).not.toContain('title');
      expect(record.conflictingFields).not.toContain('status');
    });
  });

  describe('Resolution suggestions', () => {
    it('should suggest merge when base version exists and no conflicts', () => {
      const baseTask = createTask({ title: 'Base' });
      const fileTask = createTask({ ...baseTask, status: 'in_progress' });
      const appTask = createTask({ ...baseTask, priority: 'high' });
      const conflict = createConflict(fileTask, appTask, baseTask);

      const suggestion = resolver.getResolutionSuggestion(conflict);

      expect(suggestion.suggestedPolicy).toBe('merge');
      expect(suggestion.confidence).toBeGreaterThan(0.9);
    });

    it('should suggest prefer_file when file is significantly newer', () => {
      const fileTask = createTask({
        title: 'File',
        updatedAt: new Date('2025-01-01T12:00:00Z'),
      });
      const appTask = createTask({
        title: 'App',
        updatedAt: new Date('2025-01-01T10:00:00Z'),
      });
      const conflict = createConflict(fileTask, appTask);

      const suggestion = resolver.getResolutionSuggestion(conflict);

      expect(suggestion.suggestedPolicy).toBe('prefer_file');
      expect(suggestion.reason).toContain('newer');
    });

    it('should suggest prefer_app when app is significantly newer', () => {
      const fileTask = createTask({
        title: 'File',
        updatedAt: new Date('2025-01-01T10:00:00Z'),
      });
      const appTask = createTask({
        title: 'App',
        updatedAt: new Date('2025-01-01T12:00:00Z'),
      });
      const conflict = createConflict(fileTask, appTask);

      const suggestion = resolver.getResolutionSuggestion(conflict);

      expect(suggestion.suggestedPolicy).toBe('prefer_app');
      expect(suggestion.reason).toContain('newer');
    });

    it('should suggest manual for deletion conflicts', () => {
      const fileTask = createTask({ title: 'File' });
      const appTask = createTask({ title: 'App' });
      const conflict: Conflict = {
        ...createConflict(fileTask, appTask),
        conflictType: 'deletion',
      };

      const suggestion = resolver.getResolutionSuggestion(conflict);

      expect(suggestion.suggestedPolicy).toBe('manual');
      expect(suggestion.reason.toLowerCase()).toContain('deletion');
    });

    it('should provide alternative policies', () => {
      const fileTask = createTask({ title: 'File' });
      const appTask = createTask({ title: 'App' });
      const conflict = createConflict(fileTask, appTask);

      const suggestion = resolver.getResolutionSuggestion(conflict);

      expect(suggestion.alternatives.length).toBeGreaterThan(0);
      expect(suggestion.alternatives[0]).toHaveProperty('policy');
      expect(suggestion.alternatives[0]).toHaveProperty('reason');
    });
  });

  describe('Batch resolution', () => {
    it('should resolve multiple conflicts', async () => {
      const conflicts: Conflict[] = [
        createConflict(
          createTask({ id: 'task-1', title: 'File 1' }),
          createTask({ id: 'task-1', title: 'App 1' })
        ),
        createConflict(
          createTask({ id: 'task-2', title: 'File 2' }),
          createTask({ id: 'task-2', title: 'App 2' })
        ),
      ];

      const result = await resolver.resolveBatch(conflicts, 'prefer_file');

      expect(result.total).toBe(2);
      expect(result.resolved).toBeGreaterThan(0);
      expect(result.results.length).toBe(2);
    });

    it('should track failed resolutions', async () => {
      const invalidConflict = {
        id: 'invalid',
        taskId: 'task-invalid',
        fileVersion: null as any,
        appVersion: null as any,
        detectedAt: new Date(),
        conflictType: 'content' as const,
        resolved: false,
      };

      const result = await resolver.resolveBatch([invalidConflict], 'merge');

      expect(result.total).toBe(1);
      expect(result.failed).toBe(1);
    });

    it('should provide statistics', async () => {
      const conflicts: Conflict[] = [
        createConflict(
          createTask({ title: 'File 1' }),
          createTask({ title: 'App 1' })
        ),
      ];

      const result = await resolver.resolveBatch(conflicts, 'prefer_file');

      expect(result.statistics).toBeDefined();
      expect(result.statistics.byMethod).toBeDefined();
      expect(result.statistics.totalConflictsDetected).toBeGreaterThan(0);
    });
  });

  describe('Statistics tracking', () => {
    it('should track resolution methods', async () => {
      const conflict = createConflict(
        createTask({ title: 'File' }),
        createTask({ title: 'App' })
      );

      await resolver.resolveAsync(conflict, 'prefer_file');
      const stats = resolver.getStatistics();

      expect(stats.byMethod.use_file).toBe(1);
      expect(stats.totalConflictsDetected).toBe(1);
    });

    it('should track conflict types', async () => {
      const conflict: Conflict = {
        ...createConflict(
          createTask({ title: 'File' }),
          createTask({ title: 'App' })
        ),
        conflictType: 'deletion',
      };

      await resolver.resolveAsync(conflict, 'prefer_file');
      const stats = resolver.getStatistics();

      expect(stats.byConflictType.deletion).toBe(1);
    });

    it('should calculate auto-resolved percentage', async () => {
      const conflicts = [
        createConflict(
          createTask({ title: 'File 1' }),
          createTask({ title: 'App 1' })
        ),
        createConflict(
          createTask({ title: 'File 2' }),
          createTask({ title: 'App 2' })
        ),
      ];

      await resolver.resolveAsync(conflicts[0], 'prefer_file');
      await resolver.resolveAsync(conflicts[1], 'manual');

      const stats = resolver.getStatistics();
      expect(stats.autoResolvedPercentage).toBe(50);
    });

    it('should reset statistics', () => {
      resolver.resetStatistics();
      const stats = resolver.getStatistics();

      expect(stats.totalConflictsDetected).toBe(0);
      expect(stats.byMethod.use_file).toBe(0);
      expect(stats.byMethod.use_app).toBe(0);
    });
  });

  describe('Edge cases', () => {
    it('should handle undefined optional fields', () => {
      const fileTask = createTask({ description: undefined, tags: undefined });
      const appTask = createTask({ description: 'New desc', tags: ['tag1'] });
      const conflict = createConflict(fileTask, appTask);

      const result = resolver.resolve(conflict, 'merge');

      expect(result.success).toBe(true);
    });

    it('should handle empty arrays', () => {
      const fileTask = createTask({ tags: [] });
      const appTask = createTask({ tags: ['tag1'] });
      const conflict = createConflict(fileTask, appTask);

      const result = resolver.resolve(conflict, 'merge');

      expect(result.success).toBe(true);
    });

    it('should handle same timestamps', () => {
      const timestamp = new Date('2025-01-01T10:00:00Z');
      const fileTask = createTask({ title: 'File', updatedAt: timestamp });
      const appTask = createTask({ title: 'App', updatedAt: timestamp });
      const conflict = createConflict(fileTask, appTask);

      const result = resolver.resolve(conflict);

      expect(result.success).toBe(true);
    });

    it('should handle unknown policy gracefully', () => {
      const fileTask = createTask({ title: 'File' });
      const appTask = createTask({ title: 'App' });
      const conflict = createConflict(fileTask, appTask);

      const result = resolver.resolve(conflict, 'unknown' as ConflictResolutionPolicy);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.requiresManualResolution).toBe(true);
    });
  });

  describe('Async resolution', () => {
    it('should resolve asynchronously', async () => {
      const fileTask = createTask({ title: 'File' });
      const appTask = createTask({ title: 'App' });
      const conflict = createConflict(fileTask, appTask);

      const resolution = await resolver.resolveAsync(conflict, 'prefer_file');

      expect(resolution).toBeDefined();
      expect(resolution.method).toBe('use_file');
      expect(resolution.mergedTask.title).toBe('File');
    });

    it('should throw on invalid conflict', async () => {
      const invalidConflict = {
        id: 'invalid',
        taskId: 'task-invalid',
        fileVersion: null as any,
        appVersion: null as any,
        detectedAt: new Date(),
        conflictType: 'content' as const,
        resolved: false,
      };

      await expect(
        resolver.resolveAsync(invalidConflict, 'merge')
      ).rejects.toThrow();
    });
  });

  describe('Manual resolution record', () => {
    it('should create detailed resolution record', () => {
      const fileTask = createTask({
        title: 'File Title',
        status: 'in_progress',
        priority: 'high',
      });
      const appTask = createTask({
        title: 'App Title',
        status: 'completed',
        priority: 'low',
      });
      const conflict = createConflict(fileTask, appTask);

      const record = resolver.createManualResolutionRecord(conflict);

      expect(record.conflictId).toBe(conflict.id);
      expect(record.taskId).toBe(conflict.taskId);
      expect(record.conflictingFields.length).toBeGreaterThan(0);
      expect(record.suggestedResolution).toMatch(/prefer_file|prefer_app|merge/);
      expect(record.reason).toBeTruthy();
      expect(record.createdAt).toBeInstanceOf(Date);
    });

    it('should include base version in field values when available', () => {
      const baseTask = createTask({ title: 'Base Title' });
      const fileTask = createTask({ title: 'File Title' });
      const appTask = createTask({ title: 'App Title' });
      const conflict = createConflict(fileTask, appTask, baseTask);

      const record = resolver.createManualResolutionRecord(conflict);

      expect(record.fieldValues.title.baseValue).toBe('Base Title');
      expect(record.fieldValues.title.fileValue).toBe('File Title');
      expect(record.fieldValues.title.appValue).toBe('App Title');
    });
  });
});
