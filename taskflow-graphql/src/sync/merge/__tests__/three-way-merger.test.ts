import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { ThreeWayMerger } from '../three-way-merger';
import type { Task, TaskStatus, TaskPriority } from '../../types/task';

// Mock logger to suppress output during tests
vi.mock('../../../utils/logger', () => ({
  info: vi.fn(),
  warn: vi.fn(),
  error: vi.fn(),
  debug: vi.fn(),
}));

describe('ThreeWayMerger - Comprehensive Test Suite', () => {
  let merger: ThreeWayMerger;

  beforeEach(() => {
    merger = new ThreeWayMerger();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  /**
   * Helper to create a test task
   */
  const createTask = (overrides: Partial<Task> = {}): Task => ({
    id: 'test-task-1',
    title: 'Test Task',
    status: 'pending' as TaskStatus,
    priority: 'medium' as TaskPriority,
    createdAt: new Date('2025-01-01T00:00:00Z'),
    updatedAt: new Date('2025-01-01T00:00:00Z'),
    ...overrides,
  });

  describe('No Conflict Scenarios', () => {
    describe('Test 1-2: Both Unchanged', () => {
      it('Test 1: should auto-merge when all fields are unchanged', () => {
        const base = createTask({ title: 'Unchanged' });
        const file = createTask({ title: 'Unchanged' });
        const app = createTask({ title: 'Unchanged' });

        const result = merger.merge(base, file, app, 'merge');

        expect(result.hasConflicts).toBe(false);
        expect(result.mergedTask.title).toBe('Unchanged');
        expect(result.strategy).toBe('auto');
      });

      it('Test 2: should handle all fields unchanged with complex data', () => {
        const base = createTask({
          title: 'Complex Task',
          status: 'in_progress',
          priority: 'high',
          dueDate: '2025-12-31',
          description: 'Test description',
          tags: ['tag1', 'tag2'],
        });
        const file = { ...base };
        const app = { ...base };

        const result = merger.merge(base, file, app, 'merge');

        expect(result.hasConflicts).toBe(false);
        expect(result.mergedTask).toMatchObject({
          title: 'Complex Task',
          status: 'in_progress',
          priority: 'high',
        });
      });
    });

    describe('Test 3-7: Only File Changed', () => {
      it('Test 3: should use file version when only file changed title', () => {
        const base = createTask({ title: 'Original' });
        const file = createTask({ title: 'File Modified' });
        const app = createTask({ title: 'Original' });

        const result = merger.merge(base, file, app, 'merge');

        expect(result.hasConflicts).toBe(false);
        expect(result.mergedTask.title).toBe('File Modified');
        expect(result.report.fileOnlyChanges).toContain('title');
      });

      it('Test 4: should use file version when only file changed status', () => {
        const base = createTask({ status: 'pending' });
        const file = createTask({ status: 'completed' });
        const app = createTask({ status: 'pending' });

        const result = merger.merge(base, file, app, 'merge');

        expect(result.hasConflicts).toBe(false);
        expect(result.mergedTask.status).toBe('completed');
      });

      it('Test 5: should use file version when only file changed priority', () => {
        const base = createTask({ priority: 'low' });
        const file = createTask({ priority: 'high' });
        const app = createTask({ priority: 'low' });

        const result = merger.merge(base, file, app, 'merge');

        expect(result.hasConflicts).toBe(false);
        expect(result.mergedTask.priority).toBe('high');
      });

      it('Test 6: should use file version when only file changed dueDate', () => {
        const base = createTask({ dueDate: '2025-01-01' });
        const file = createTask({ dueDate: '2025-12-31' });
        const app = createTask({ dueDate: '2025-01-01' });

        const result = merger.merge(base, file, app, 'merge');

        expect(result.hasConflicts).toBe(false);
        expect(result.mergedTask.dueDate).toBe('2025-12-31');
      });

      it('Test 7: should use file version when only file changed description', () => {
        const base = createTask({ description: 'Original' });
        const file = createTask({ description: 'File description' });
        const app = createTask({ description: 'Original' });

        const result = merger.merge(base, file, app, 'merge');

        expect(result.hasConflicts).toBe(false);
        expect(result.mergedTask.description).toBe('File description');
      });
    });

    describe('Test 8-10: Only App Changed', () => {
      it('Test 8: should use app version when only app changed title', () => {
        const base = createTask({ title: 'Original' });
        const file = createTask({ title: 'Original' });
        const app = createTask({ title: 'App Modified' });

        const result = merger.merge(base, file, app, 'merge');

        expect(result.hasConflicts).toBe(false);
        expect(result.mergedTask.title).toBe('App Modified');
        expect(result.report.appOnlyChanges).toContain('title');
      });

      it('Test 9: should use app version when only app changed status', () => {
        const base = createTask({ status: 'pending' });
        const file = createTask({ status: 'pending' });
        const app = createTask({ status: 'in_progress' });

        const result = merger.merge(base, file, app, 'merge');

        expect(result.hasConflicts).toBe(false);
        expect(result.mergedTask.status).toBe('in_progress');
      });

      it('Test 10: should use app version when only app changed priority', () => {
        const base = createTask({ priority: 'medium' });
        const file = createTask({ priority: 'medium' });
        const app = createTask({ priority: 'high' });

        const result = merger.merge(base, file, app, 'merge');

        expect(result.hasConflicts).toBe(false);
        expect(result.mergedTask.priority).toBe('high');
      });
    });

    describe('Test 11-13: Both Changed to Same Value', () => {
      it('Test 11: should auto-merge when both changed title to same value', () => {
        const base = createTask({ title: 'Original' });
        const file = createTask({ title: 'Same Update' });
        const app = createTask({ title: 'Same Update' });

        const result = merger.merge(base, file, app, 'merge');

        expect(result.hasConflicts).toBe(false);
        expect(result.mergedTask.title).toBe('Same Update');
      });

      it('Test 12: should auto-merge when both changed status to same value', () => {
        const base = createTask({ status: 'pending' });
        const file = createTask({ status: 'completed' });
        const app = createTask({ status: 'completed' });

        const result = merger.merge(base, file, app, 'merge');

        expect(result.hasConflicts).toBe(false);
        expect(result.mergedTask.status).toBe('completed');
      });

      it('Test 13: should auto-merge when both changed priority to same value', () => {
        const base = createTask({ priority: 'low' });
        const file = createTask({ priority: 'high' });
        const app = createTask({ priority: 'high' });

        const result = merger.merge(base, file, app, 'merge');

        expect(result.hasConflicts).toBe(false);
        expect(result.mergedTask.priority).toBe('high');
      });
    });

    describe('Test 14-16: Different Fields Changed on Each Side', () => {
      it('Test 14: should auto-merge when file changed title and app changed status', () => {
        const base = createTask({ title: 'Original', status: 'pending' });
        const file = createTask({ title: 'Updated', status: 'pending' });
        const app = createTask({ title: 'Original', status: 'completed' });

        const result = merger.merge(base, file, app, 'merge');

        expect(result.hasConflicts).toBe(false);
        expect(result.mergedTask.title).toBe('Updated');
        expect(result.mergedTask.status).toBe('completed');
        expect(result.report.fileOnlyChanges).toContain('title');
        expect(result.report.appOnlyChanges).toContain('status');
      });

      it('Test 15: should auto-merge when file changed priority and app changed dueDate', () => {
        const base = createTask({ priority: 'medium', dueDate: '2025-01-01' });
        const file = createTask({ priority: 'high', dueDate: '2025-01-01' });
        const app = createTask({ priority: 'medium', dueDate: '2025-12-31' });

        const result = merger.merge(base, file, app, 'merge');

        expect(result.hasConflicts).toBe(false);
        expect(result.mergedTask.priority).toBe('high');
        expect(result.mergedTask.dueDate).toBe('2025-12-31');
      });

      it('Test 16: should auto-merge when file changed description and app changed tags', () => {
        const base = createTask({ description: 'Original', tags: ['tag1'] });
        const file = createTask({ description: 'Updated', tags: ['tag1'] });
        const app = createTask({ description: 'Original', tags: ['tag1', 'tag2'] });

        const result = merger.merge(base, file, app, 'merge');

        expect(result.hasConflicts).toBe(false);
        expect(result.mergedTask.description).toBe('Updated');
        expect(result.mergedTask.tags).toEqual(['tag1', 'tag2']);
      });
    });
  });

  describe('Conflict Scenarios', () => {
    describe('Test 17-18: Title Conflicts', () => {
      it('Test 17: should detect conflict when both changed title', () => {
        const base = createTask({ title: 'Original' });
        const file = createTask({ title: 'File Version' });
        const app = createTask({ title: 'App Version' });

        const result = merger.merge(base, file, app, 'merge');

        expect(result.hasConflicts).toBe(true);
        expect(result.conflicts).toHaveLength(1);
        expect(result.conflicts[0].field).toBe('title');
      });

      it('Test 18: should use file preference when policy is prefer_file', () => {
        const base = createTask({ title: 'Original' });
        const file = createTask({ title: 'File Version' });
        const app = createTask({ title: 'App Version' });

        const result = merger.merge(base, file, app, 'prefer_file');

        expect(result.strategy).toBe('file_preferred');
        expect(result.mergedTask.title).toBe('File Version');
      });
    });

    describe('Test 19-20: Status Conflicts', () => {
      it('Test 19: should detect conflict when both changed status', () => {
        const base = createTask({ status: 'pending' });
        const file = createTask({ status: 'completed' });
        const app = createTask({ status: 'in_progress' });

        const result = merger.merge(base, file, app, 'merge');

        expect(result.hasConflicts).toBe(true);
        expect(result.conflicts[0].field).toBe('status');
      });

      it('Test 20: should use app preference when policy is prefer_app', () => {
        const base = createTask({ status: 'pending' });
        const file = createTask({ status: 'completed' });
        const app = createTask({ status: 'in_progress' });

        const result = merger.merge(base, file, app, 'prefer_app');

        expect(result.strategy).toBe('app_preferred');
        expect(result.mergedTask.status).toBe('in_progress');
      });
    });

    describe('Test 21-22: Priority Conflicts', () => {
      it('Test 21: should detect conflict when both changed priority', () => {
        const base = createTask({ priority: 'medium' });
        const file = createTask({ priority: 'high' });
        const app = createTask({ priority: 'low' });

        const result = merger.merge(base, file, app, 'merge');

        expect(result.hasConflicts).toBe(true);
        expect(result.conflicts[0].field).toBe('priority');
      });

      it('Test 22: should mark for manual resolution when policy is manual', () => {
        const base = createTask({ priority: 'medium' });
        const file = createTask({ priority: 'high' });
        const app = createTask({ priority: 'low' });

        const result = merger.merge(base, file, app, 'manual');

        expect(result.strategy).toBe('manual');
        expect(result.hasConflicts).toBe(true);
      });
    });

    describe('Test 23-24: Due Date Conflicts', () => {
      it('Test 23: should detect conflict when both changed dueDate', () => {
        const base = createTask({ dueDate: '2025-01-01' });
        const file = createTask({ dueDate: '2025-06-01' });
        const app = createTask({ dueDate: '2025-12-31' });

        const result = merger.merge(base, file, app, 'merge');

        expect(result.hasConflicts).toBe(true);
        expect(result.conflicts[0].field).toBe('dueDate');
      });

      it('Test 24: should detect conflict when one sets and other removes dueDate', () => {
        const base = createTask({ dueDate: '2025-01-01' });
        const file = createTask({ dueDate: undefined });
        const app = createTask({ dueDate: '2025-12-31' });

        const result = merger.merge(base, file, app, 'merge');

        expect(result.hasConflicts).toBe(true);
      });
    });

    describe('Test 25-26: Description Conflicts', () => {
      it('Test 25: should detect conflict when both changed description', () => {
        const base = createTask({ description: 'Original' });
        const file = createTask({ description: 'File description' });
        const app = createTask({ description: 'App description' });

        const result = merger.merge(base, file, app, 'merge');

        expect(result.hasConflicts).toBe(true);
        expect(result.conflicts[0].field).toBe('description');
      });

      it('Test 26: should handle empty description conflicts', () => {
        const base = createTask({ description: 'Original' });
        const file = createTask({ description: '' });
        const app = createTask({ description: 'Updated' });

        const result = merger.merge(base, file, app, 'merge');

        expect(result.hasConflicts).toBe(true);
      });
    });

    describe('Test 27-28: Multiple Field Conflicts', () => {
      it('Test 27: should detect multiple conflicts', () => {
        const base = createTask({
          title: 'Original',
          status: 'pending',
          priority: 'medium',
        });
        const file = createTask({
          title: 'File Title',
          status: 'completed',
          priority: 'high',
        });
        const app = createTask({
          title: 'App Title',
          status: 'in_progress',
          priority: 'low',
        });

        const result = merger.merge(base, file, app, 'merge');

        expect(result.hasConflicts).toBe(true);
        expect(result.conflicts.length).toBe(3);
        expect(result.report.conflictingFields).toContain('title');
        expect(result.report.conflictingFields).toContain('status');
        expect(result.report.conflictingFields).toContain('priority');
      });

      it('Test 28: should handle mixed conflicts and auto-merges', () => {
        const base = createTask({
          title: 'Original',
          status: 'pending',
          priority: 'medium',
          dueDate: '2025-01-01',
        });
        const file = createTask({
          title: 'File Title',
          status: 'completed',
          priority: 'medium',
          dueDate: '2025-01-01',
        });
        const app = createTask({
          title: 'App Title',
          status: 'pending',
          priority: 'high',
          dueDate: '2025-12-31',
        });

        const result = merger.merge(base, file, app, 'merge');

        expect(result.hasConflicts).toBe(true);
        expect(result.report.conflictingFields).toContain('title');
        expect(result.report.appOnlyChanges).toContain('priority');
        expect(result.report.fileOnlyChanges).toContain('status');
      });
    });
  });

  describe('Edge Cases', () => {
    describe('Test 29-31: Null and Undefined Values', () => {
      it('Test 29: should handle undefined vs null as equivalent', () => {
        const base = createTask({ description: undefined });
        const file = createTask({ description: null as any });
        const app = createTask({ description: undefined });

        const result = merger.merge(base, file, app, 'merge');

        expect(result.hasConflicts).toBe(false);
      });

      it('Test 30: should auto-merge when both set to undefined', () => {
        const base = createTask({ description: 'Original' });
        const file = createTask({ description: undefined });
        const app = createTask({ description: undefined });

        const result = merger.merge(base, file, app, 'merge');

        expect(result.hasConflicts).toBe(false);
      });

      it('Test 31: should detect conflict when one sets value and other removes it', () => {
        const base = createTask({ description: 'Original' });
        const file = createTask({ description: 'New value' });
        const app = createTask({ description: undefined });

        const result = merger.merge(base, file, app, 'merge');

        expect(result.hasConflicts).toBe(true);
      });
    });

    describe('Test 32-34: Array Fields (Tags)', () => {
      it('Test 32: should handle identical tag arrays', () => {
        const base = createTask({ tags: ['tag1', 'tag2'] });
        const file = createTask({ tags: ['tag1', 'tag2'] });
        const app = createTask({ tags: ['tag1', 'tag2'] });

        const result = merger.merge(base, file, app, 'merge');

        expect(result.hasConflicts).toBe(false);
      });

      it('Test 33: should detect conflict when both modify tags differently', () => {
        const base = createTask({ tags: ['tag1'] });
        const file = createTask({ tags: ['tag1', 'tag2'] });
        const app = createTask({ tags: ['tag1', 'tag3'] });

        const result = merger.merge(base, file, app, 'merge');

        expect(result.hasConflicts).toBe(true);
      });

      it('Test 34: should auto-merge when only one side adds tags', () => {
        const base = createTask({ tags: ['tag1'] });
        const file = createTask({ tags: ['tag1', 'tag2'] });
        const app = createTask({ tags: ['tag1'] });

        const result = merger.merge(base, file, app, 'merge');

        expect(result.hasConflicts).toBe(false);
        expect(result.mergedTask.tags).toEqual(['tag1', 'tag2']);
      });
    });

    describe('Test 35-36: Missing Optional Fields', () => {
      it('Test 35: should handle tasks with minimal fields', () => {
        const base = createTask({
          title: 'Task',
          status: 'pending',
          priority: 'medium',
        });
        const file = createTask({
          title: 'Task',
          status: 'pending',
          priority: 'medium',
        });
        const app = createTask({
          title: 'Task',
          status: 'pending',
          priority: 'medium',
        });

        const result = merger.merge(base, file, app, 'merge');

        expect(result.hasConflicts).toBe(false);
        expect(result.mergedTask).toBeDefined();
      });

      it('Test 36: should add optional field from one side', () => {
        const base = createTask({ section: undefined });
        const file = createTask({ section: undefined });
        const app = createTask({ section: 'New Section' });

        const result = merger.merge(base, file, app, 'merge');

        expect(result.hasConflicts).toBe(false);
        expect(result.mergedTask.section).toBe('New Section');
      });
    });

    describe('Test 37-38: Timestamp Handling', () => {
      it('Test 37: should preserve createdAt from base', () => {
        const baseCreated = new Date('2024-01-01T00:00:00Z');
        const base = createTask({ createdAt: baseCreated });
        const file = createTask({ createdAt: new Date('2025-01-01T00:00:00Z') });
        const app = createTask({ createdAt: new Date('2025-01-02T00:00:00Z') });

        const result = merger.merge(base, file, app, 'merge');

        expect(result.mergedTask.createdAt).toEqual(baseCreated);
      });

      it('Test 38: should have updatedAt timestamp', () => {
        const base = createTask();
        const file = createTask();
        const app = createTask();

        const result = merger.merge(base, file, app, 'merge');

        expect(result.mergedTask.updatedAt).toBeInstanceOf(Date);
        expect(result.mergedTask.updatedAt).toBeDefined();
      });
    });
  });

  describe('Complex Real-World Scenarios', () => {
    it('Test 39: should handle task completion workflow', () => {
      const base = createTask({
        title: 'Implement feature',
        status: 'pending',
        priority: 'high',
        dueDate: '2025-12-31',
      });
      const file = createTask({
        title: 'Implement feature',
        status: 'completed',
        priority: 'high',
        dueDate: '2025-12-31',
      });
      const app = createTask({
        title: 'Implement feature',
        status: 'pending',
        priority: 'high',
        dueDate: '2025-12-31',
        description: 'Added notes',
      });

      const result = merger.merge(base, file, app, 'merge');

      expect(result.hasConflicts).toBe(false);
      expect(result.mergedTask.status).toBe('completed');
      expect(result.mergedTask.description).toBe('Added notes');
    });

    it('Test 40: should handle complex multi-field scenario', () => {
      const base = createTask({
        title: 'Project Task',
        status: 'pending',
        priority: 'medium',
        dueDate: '2025-03-01',
        description: 'Initial',
        tags: ['project'],
      });
      const file = createTask({
        title: 'Project Task - Updated',
        status: 'pending',
        priority: 'high',
        dueDate: '2025-03-01',
        description: 'Initial',
        tags: ['project', 'urgent'],
      });
      const app = createTask({
        title: 'Project Task',
        status: 'in_progress',
        priority: 'medium',
        dueDate: '2025-02-15',
        description: 'Updated desc',
        tags: ['project'],
      });

      const result = merger.merge(base, file, app, 'merge');

      expect(result.hasConflicts).toBe(false);
      expect(result.mergedTask.title).toBe('Project Task - Updated');
      expect(result.mergedTask.status).toBe('in_progress');
      expect(result.mergedTask.priority).toBe('high');
      expect(result.mergedTask.dueDate).toBe('2025-02-15');
      expect(result.mergedTask.description).toBe('Updated desc');
      expect(result.mergedTask.tags).toEqual(['project', 'urgent']);
    });
  });

  describe('Merge Report Generation', () => {
    it('Test 41: should generate comprehensive merge report', () => {
      const base = createTask({ title: 'Original', status: 'pending' });
      const file = createTask({ title: 'File Updated', status: 'pending' });
      const app = createTask({ title: 'Original', status: 'completed' });

      const result = merger.merge(base, file, app, 'merge');

      expect(result.report).toBeDefined();
      expect(result.report.timestamp).toBeInstanceOf(Date);
      expect(result.report.totalFields).toBeGreaterThan(0);
      expect(result.report.fileOnlyChanges).toContain('title');
      expect(result.report.appOnlyChanges).toContain('status');
      expect(result.report.autoMergedFields.length).toBeGreaterThan(0);
    });
  });
});
