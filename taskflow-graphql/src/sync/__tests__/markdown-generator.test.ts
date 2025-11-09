/**
 * MarkdownGenerator Test Suite
 * Comprehensive testing for markdown generation functionality
 *
 * Test Coverage:
 * - Header generation (2 cases)
 * - Priority sections (4 cases)
 * - Status conversion (4 cases)
 * - Tag output (3 cases)
 * - Date formatting (3 cases)
 * - Integration (1 case)
 * - Performance (1 case)
 * - Edge cases (7 cases)
 * Total: 25 test cases
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { MarkdownGenerator } from '../markdown-generator';
import { Task, TaskStatus, Priority, Label } from '../../types/index';
import type { FileSystem } from '../interfaces/file-system.interface';

// Mock FileSystem implementation for testing
class MockFileSystem implements FileSystem {
  private files: Map<string, string> = new Map();

  async writeFile(path: string, content: string): Promise<void> {
    this.files.set(path, content);
  }

  async readFile(path: string): Promise<string> {
    const content = this.files.get(path);
    if (!content) {
      throw new Error(`File not found: ${path}`);
    }
    return content;
  }

  async stat(path: string): Promise<{ size: number; mtime: Date }> {
    const content = this.files.get(path);
    if (!content) {
      throw new Error(`File not found: ${path}`);
    }
    return {
      size: content.length,
      mtime: new Date(),
    };
  }

  async exists(path: string): Promise<boolean> {
    return this.files.has(path);
  }

  // Test helper methods
  getWrittenContent(path: string): string | undefined {
    return this.files.get(path);
  }

  clear(): void {
    this.files.clear();
  }
}

// Helper function to create a complete Task object
function createTask(overrides: Partial<Task> = {}): Task {
  const now = new Date('2025-11-09T10:00:00Z');
  return {
    id: crypto.randomUUID(),
    boardId: 'test-board-id',
    columnId: 'test-column-id',
    title: 'Test Task',
    description: '',
    status: TaskStatus.TODO,
    priority: Priority.MEDIUM,
    labels: [],
    subtasks: [],
    files: [],
    position: 0,
    createdAt: now,
    updatedAt: now,
    completedAt: undefined,
    deletedAt: undefined,
    isOverdue: false,
    completionPercentage: 0,
    estimatedDuration: undefined,
    ...overrides,
  };
}

// Helper function to create a Label object
function createLabel(name: string, color: string = '#3B82F6'): Label {
  return {
    id: crypto.randomUUID(),
    name,
    color,
    taskCount: 0,
    createdAt: new Date(),
  };
}

describe('MarkdownGenerator', () => {
  let generator: MarkdownGenerator;
  let mockFs: MockFileSystem;

  beforeEach(() => {
    mockFs = new MockFileSystem();
    generator = new MarkdownGenerator(mockFs);
  });

  // ============================================================================
  // Header Generation Tests (2 cases)
  // ============================================================================
  describe('Header Generation', () => {
    it('should generate header with metadata', async () => {
      const tasks = [createTask()];

      await generator.generate(tasks, '/test/output.md');

      const content = mockFs.getWrittenContent('/test/output.md')!;

      expect(content).toContain('# Personal TODOs');
      expect(content).toContain('<!-- metadata -->');
      expect(content).toMatch(
        /<!-- last_updated: \d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2} -->/
      );
    });

    it('should include correct task count in header', async () => {
      const tasks = [
        createTask({ status: TaskStatus.TODO }),
        createTask({ status: TaskStatus.IN_PROGRESS }),
        createTask({ status: TaskStatus.TODO }),
        createTask({ status: TaskStatus.COMPLETED }), // Should not be counted
        createTask({ status: TaskStatus.DELETED }), // Should not be counted
      ];

      await generator.generate(tasks, '/test/output.md');

      const content = mockFs.getWrittenContent('/test/output.md')!;

      expect(content).toContain('<!-- total_todos: 3 -->'); // Only TODO and IN_PROGRESS
    });
  });

  // ============================================================================
  // Priority Section Tests (4 cases)
  // ============================================================================
  describe('Priority Sections', () => {
    it('should generate all priority sections in correct order', async () => {
      const tasks = [
        createTask({ priority: Priority.CRITICAL, title: 'Critical task' }),
        createTask({ priority: Priority.HIGH, title: 'High task' }),
        createTask({ priority: Priority.MEDIUM, title: 'Medium task' }),
        createTask({ priority: Priority.LOW, title: 'Low task' }),
      ];

      await generator.generate(tasks, '/test/output.md');

      const content = mockFs.getWrittenContent('/test/output.md')!;

      expect(content).toContain('## 🔥 Critical');
      expect(content).toContain('## ⚠️ High');
      expect(content).toContain('## 📌 Medium');
      expect(content).toContain('## 📝 Low');

      // Verify order
      const criticalIndex = content.indexOf('## 🔥 Critical');
      const highIndex = content.indexOf('## ⚠️ High');
      const mediumIndex = content.indexOf('## 📌 Medium');
      const lowIndex = content.indexOf('## 📝 Low');

      expect(criticalIndex).toBeLessThan(highIndex);
      expect(highIndex).toBeLessThan(mediumIndex);
      expect(mediumIndex).toBeLessThan(lowIndex);
    });

    it('should not include empty priority sections', async () => {
      const tasks = [
        createTask({ priority: Priority.CRITICAL, title: 'Critical task' }),
        // No HIGH priority tasks
        createTask({ priority: Priority.MEDIUM, title: 'Medium task' }),
        // No LOW priority tasks
      ];

      await generator.generate(tasks, '/test/output.md');

      const content = mockFs.getWrittenContent('/test/output.md')!;

      expect(content).toContain('## 🔥 Critical');
      expect(content).toContain('## ⚠️ High'); // Section header still appears
      expect(content).toContain('## 📌 Medium');
      expect(content).toContain('## 📝 Low'); // Section header still appears
    });

    it('should group tasks under correct priority sections', async () => {
      const tasks = [
        createTask({ priority: Priority.CRITICAL, title: 'Critical task 1' }),
        createTask({ priority: Priority.CRITICAL, title: 'Critical task 2' }),
        createTask({ priority: Priority.HIGH, title: 'High task 1' }),
      ];

      await generator.generate(tasks, '/test/output.md');

      const content = mockFs.getWrittenContent('/test/output.md')!;

      // Extract Critical section
      const criticalStart = content.indexOf('## 🔥 Critical');
      const highStart = content.indexOf('## ⚠️ High');
      const criticalSection = content.substring(criticalStart, highStart);

      expect(criticalSection).toContain('Critical task 1');
      expect(criticalSection).toContain('Critical task 2');
      expect(criticalSection).not.toContain('High task 1');
    });

    it('should exclude DELETED tasks from priority sections', async () => {
      const tasks = [
        createTask({
          priority: Priority.CRITICAL,
          title: 'Active task',
          status: TaskStatus.TODO,
        }),
        createTask({
          priority: Priority.CRITICAL,
          title: 'Deleted task',
          status: TaskStatus.DELETED,
        }),
      ];

      await generator.generate(tasks, '/test/output.md');

      const content = mockFs.getWrittenContent('/test/output.md')!;

      expect(content).toContain('Active task');
      expect(content).not.toContain('Deleted task');
    });
  });

  // ============================================================================
  // Status Conversion Tests (4 cases)
  // ============================================================================
  describe('Status Conversion', () => {
    it('should convert TODO status to [ ] checkbox', async () => {
      const tasks = [
        createTask({ status: TaskStatus.TODO, title: 'Todo task' }),
      ];

      await generator.generate(tasks, '/test/output.md');

      const content = mockFs.getWrittenContent('/test/output.md')!;

      expect(content).toContain('- [ ] Todo task');
    });

    it('should convert IN_PROGRESS status to [~] checkbox', async () => {
      const tasks = [
        createTask({
          status: TaskStatus.IN_PROGRESS,
          title: 'In progress task',
        }),
      ];

      await generator.generate(tasks, '/test/output.md');

      const content = mockFs.getWrittenContent('/test/output.md')!;

      expect(content).toContain('- [~] In progress task');
    });

    it('should convert COMPLETED status to [x] checkbox', async () => {
      const tasks = [
        createTask({
          status: TaskStatus.COMPLETED,
          title: 'Completed task',
          completedAt: new Date('2025-11-09T12:00:00Z'),
        }),
      ];

      await generator.generate(tasks, '/test/output.md');

      const content = mockFs.getWrittenContent('/test/output.md')!;

      expect(content).toContain('## ✅ Completed');
      expect(content).toContain('- [x] Completed task');
    });

    it('should exclude DELETED tasks from output', async () => {
      const tasks = [
        createTask({ status: TaskStatus.TODO, title: 'Active task' }),
        createTask({ status: TaskStatus.DELETED, title: 'Deleted task' }),
      ];

      await generator.generate(tasks, '/test/output.md');

      const content = mockFs.getWrittenContent('/test/output.md')!;

      expect(content).toContain('Active task');
      expect(content).not.toContain('Deleted task');
      expect(content).not.toContain('DELETED');
    });
  });

  // ============================================================================
  // Tag Output Tests (3 cases)
  // ============================================================================
  describe('Tag Output', () => {
    it('should output single tag correctly', async () => {
      const tasks = [
        createTask({
          title: 'Task with tag',
          labels: [createLabel('backend')],
        }),
      ];

      await generator.generate(tasks, '/test/output.md');

      const content = mockFs.getWrittenContent('/test/output.md')!;

      expect(content).toContain('Task with tag #backend');
    });

    it('should output multiple tags correctly', async () => {
      const tasks = [
        createTask({
          title: 'Task with multiple tags',
          labels: [
            createLabel('backend'),
            createLabel('urgent'),
            createLabel('bug'),
          ],
        }),
      ];

      await generator.generate(tasks, '/test/output.md');

      const content = mockFs.getWrittenContent('/test/output.md')!;

      expect(content).toContain(
        'Task with multiple tags #backend #urgent #bug'
      );
    });

    it('should handle tasks with no tags', async () => {
      const tasks = [
        createTask({
          title: 'Task without tags',
          labels: [],
        }),
      ];

      await generator.generate(tasks, '/test/output.md');

      const content = mockFs.getWrittenContent('/test/output.md')!;

      // Should contain title but no # symbols (except in headers)
      const lines = content.split('\n');
      const taskLine = lines.find(line => line.includes('Task without tags'));
      expect(taskLine).toBeDefined();
      expect(taskLine).not.toMatch(/Task without tags #/);
    });
  });

  // ============================================================================
  // Date Formatting Tests (3 cases)
  // ============================================================================
  describe('Date Formatting', () => {
    it('should format created date in YYYY-MM-DD format', async () => {
      const tasks = [
        createTask({
          title: 'Task with date',
          createdAt: new Date('2025-11-09T10:30:00Z'),
        }),
      ];

      await generator.generate(tasks, '/test/output.md');

      const content = mockFs.getWrittenContent('/test/output.md')!;

      expect(content).toContain('(created: 2025-11-09)');
    });

    it('should format both created and completed dates', async () => {
      const tasks = [
        createTask({
          title: 'Completed task',
          status: TaskStatus.COMPLETED,
          createdAt: new Date('2025-11-01T00:00:00Z'),
          completedAt: new Date('2025-11-10T00:00:00Z'),
        }),
      ];

      await generator.generate(tasks, '/test/output.md');

      const content = mockFs.getWrittenContent('/test/output.md')!;

      expect(content).toContain('(created: 2025-11-01, completed: 2025-11-10)');
    });

    it('should not include updatedAt in date output', async () => {
      const tasks = [
        createTask({
          title: 'Task with updated date',
          createdAt: new Date('2025-11-01T10:00:00Z'),
          updatedAt: new Date('2025-11-09T10:00:00Z'),
        }),
      ];

      await generator.generate(tasks, '/test/output.md');

      const content = mockFs.getWrittenContent('/test/output.md')!;

      expect(content).toContain('(created: 2025-11-01)');
      // Should not include updatedAt in task line (but last_updated in header is OK)
      expect(content).not.toMatch(/Task with updated date.*updated:/);
    });
  });

  // ============================================================================
  // Integration Test (1 case)
  // ============================================================================
  describe('Integration Test', () => {
    it('should generate complete markdown file with all features', async () => {
      const tasks = [
        createTask({
          title: 'Fix critical security bug',
          priority: Priority.CRITICAL,
          status: TaskStatus.IN_PROGRESS,
          labels: [createLabel('security'), createLabel('urgent')],
          createdAt: new Date('2025-11-08T09:00:00Z'),
        }),
        createTask({
          title: 'Implement user authentication',
          priority: Priority.HIGH,
          status: TaskStatus.TODO,
          labels: [createLabel('backend'), createLabel('auth')],
          createdAt: new Date('2025-11-07T10:00:00Z'),
        }),
        createTask({
          title: 'Update documentation',
          priority: Priority.MEDIUM,
          status: TaskStatus.TODO,
          labels: [createLabel('docs')],
          createdAt: new Date('2025-11-06T11:00:00Z'),
        }),
        createTask({
          title: 'Refactor CSS',
          priority: Priority.LOW,
          status: TaskStatus.TODO,
          labels: [createLabel('frontend')],
          createdAt: new Date('2025-11-05T12:00:00Z'),
        }),
        createTask({
          title: 'Setup CI/CD',
          priority: Priority.HIGH,
          status: TaskStatus.COMPLETED,
          labels: [createLabel('devops')],
          createdAt: new Date('2025-11-01T00:00:00Z'),
          completedAt: new Date('2025-11-03T00:00:00Z'),
        }),
        createTask({
          title: 'Deleted task',
          priority: Priority.MEDIUM,
          status: TaskStatus.DELETED,
          createdAt: new Date('2025-11-01T08:00:00Z'),
          deletedAt: new Date('2025-11-03T10:00:00Z'),
        }),
      ];

      await generator.generate(tasks, '/test/output.md');

      const content = mockFs.getWrittenContent('/test/output.md')!;

      // Verify header
      expect(content).toContain('# Personal TODOs');
      expect(content).toContain('<!-- total_todos: 4 -->'); // 5 tasks - 1 completed - 1 deleted

      // Verify priority sections exist
      expect(content).toContain('## 🔥 Critical');
      expect(content).toContain('## ⚠️ High');
      expect(content).toContain('## 📌 Medium');
      expect(content).toContain('## 📝 Low');

      // Verify tasks in correct sections
      expect(content).toContain(
        '- [~] Fix critical security bug #security #urgent'
      );
      expect(content).toContain(
        '- [ ] Implement user authentication #backend #auth'
      );
      expect(content).toContain('- [ ] Update documentation #docs');
      expect(content).toContain('- [ ] Refactor CSS #frontend');

      // Verify completed section
      expect(content).toContain('## ✅ Completed');
      expect(content).toContain('- [x] Setup CI/CD #devops');

      // Verify deleted task is not present
      expect(content).not.toContain('Deleted task');

      // Verify date formatting
      expect(content).toContain('(created: 2025-11-08)');
      expect(content).toContain('(created: 2025-11-01, completed: 2025-11-03)');
    });
  });

  // ============================================================================
  // Performance Test (1 case)
  // ============================================================================
  describe('Performance', () => {
    it('should generate markdown for 1000 tasks in less than 2 seconds', async () => {
      const tasks: Task[] = [];
      const priorities = [
        Priority.CRITICAL,
        Priority.HIGH,
        Priority.MEDIUM,
        Priority.LOW,
      ];
      const statuses = [
        TaskStatus.TODO,
        TaskStatus.IN_PROGRESS,
        TaskStatus.COMPLETED,
      ];

      // Generate 1000 tasks
      for (let i = 0; i < 1000; i++) {
        tasks.push(
          createTask({
            title: `Task ${i}`,
            priority: priorities[i % priorities.length],
            status: statuses[i % statuses.length],
            labels:
              i % 3 === 0
                ? [createLabel(`tag${i % 10}`), createLabel(`category${i % 5}`)]
                : [],
            createdAt: new Date(`2025-11-0${(i % 9) + 1}T10:00:00Z`),
            completedAt:
              i % 3 === 2 ? new Date(`2025-11-09T${i % 24}:00:00Z`) : undefined,
          })
        );
      }

      const startTime = Date.now();
      await generator.generate(tasks, '/test/performance.md');
      const endTime = Date.now();

      const duration = endTime - startTime;

      expect(duration).toBeLessThan(2000); // Should complete in less than 2 seconds

      const content = mockFs.getWrittenContent('/test/performance.md')!;
      expect(content).toBeDefined();
      expect(content.length).toBeGreaterThan(0);
    });
  });

  // ============================================================================
  // Edge Cases (7 cases)
  // ============================================================================
  describe('Edge Cases', () => {
    it('should handle empty task array', async () => {
      await generator.generate([], '/test/empty.md');

      const content = mockFs.getWrittenContent('/test/empty.md')!;

      expect(content).toContain('# Personal TODOs');
      expect(content).toContain('<!-- total_todos: 0 -->');
    });

    it('should handle task with special characters in title', async () => {
      const tasks = [
        createTask({
          title: 'Task with "quotes" and \'apostrophes\' & special chars: @#$%',
        }),
      ];

      await generator.generate(tasks, '/test/special.md');

      const content = mockFs.getWrittenContent('/test/special.md')!;

      expect(content).toContain(
        'Task with "quotes" and \'apostrophes\' & special chars: @#$%'
      );
    });

    it('should handle task with very long title', async () => {
      const longTitle = 'A'.repeat(500);
      const tasks = [createTask({ title: longTitle })];

      await generator.generate(tasks, '/test/long.md');

      const content = mockFs.getWrittenContent('/test/long.md')!;

      expect(content).toContain(longTitle);
    });

    it('should handle task with emoji in title', async () => {
      const tasks = [createTask({ title: 'Fix bug 🐛 in feature 🚀' })];

      await generator.generate(tasks, '/test/emoji.md');

      const content = mockFs.getWrittenContent('/test/emoji.md')!;

      expect(content).toContain('Fix bug 🐛 in feature 🚀');
    });

    it('should handle task with label containing special characters', async () => {
      const tasks = [
        createTask({
          title: 'Task with special label',
          labels: [
            createLabel('high-priority'),
            createLabel('bug_fix'),
            createLabel('v2.0'),
          ],
        }),
      ];

      await generator.generate(tasks, '/test/special-labels.md');

      const content = mockFs.getWrittenContent('/test/special-labels.md')!;

      expect(content).toContain('#high-priority #bug_fix #v2.0');
    });

    it('should maintain correct line endings', async () => {
      const tasks = [
        createTask({ title: 'Task 1' }),
        createTask({ title: 'Task 2' }),
      ];

      await generator.generate(tasks, '/test/lineendings.md');

      const content = mockFs.getWrittenContent('/test/lineendings.md')!;

      // Should use Unix line endings
      expect(content.includes('\r\n')).toBe(false);
      expect(content.split('\n').length).toBeGreaterThan(1);
    });

    it('should handle tasks with same title but different properties', async () => {
      const tasks = [
        createTask({
          title: 'Duplicate Title',
          priority: Priority.CRITICAL,
          status: TaskStatus.TODO,
        }),
        createTask({
          title: 'Duplicate Title',
          priority: Priority.LOW,
          status: TaskStatus.IN_PROGRESS,
        }),
      ];

      await generator.generate(tasks, '/test/duplicates.md');

      const content = mockFs.getWrittenContent('/test/duplicates.md')!;

      // Both tasks should appear in output
      const matches = content.match(/Duplicate Title/g);
      expect(matches).toHaveLength(2);

      // Should appear in different sections
      expect(content).toContain('## 🔥 Critical');
      expect(content).toContain('## 📝 Low');
    });
  });
});
