/**
 * E2E Test Fixtures and Mock Data Generators
 *
 * Provides reusable test data and mock generators for E2E tests.
 */

import type { Task, TaskPriority, TaskStatus, SyncConfig } from '../../../types';
import { v4 as uuidv4 } from 'uuid';

/**
 * Generate a mock Task with customizable fields
 */
export function createMockTask(overrides: Partial<Task> = {}): Task {
  const now = new Date();
  return {
    id: uuidv4(),
    title: `Test Task ${Math.random().toString(36).substring(7)}`,
    status: 'pending' as TaskStatus,
    priority: 'medium' as TaskPriority,
    createdAt: now,
    updatedAt: now,
    ...overrides,
  };
}

/**
 * Generate multiple mock tasks
 */
export function createMockTasks(count: number, overrides: Partial<Task> = {}): Task[] {
  return Array.from({ length: count }, (_, i) =>
    createMockTask({
      title: `Task ${i + 1}`,
      order: i,
      ...overrides,
    })
  );
}

/**
 * Generate tasks with various statuses
 */
export function createTasksWithStatuses(): Task[] {
  return [
    createMockTask({ title: 'Pending Task', status: 'pending' }),
    createMockTask({ title: 'In Progress Task', status: 'in_progress' }),
    createMockTask({ title: 'Completed Task', status: 'completed' }),
  ];
}

/**
 * Generate tasks with various priorities
 */
export function createTasksWithPriorities(): Task[] {
  return [
    createMockTask({ title: 'Low Priority', priority: 'low' }),
    createMockTask({ title: 'Medium Priority', priority: 'medium' }),
    createMockTask({ title: 'High Priority', priority: 'high' }),
  ];
}

/**
 * Generate tasks with sections
 */
export function createTasksWithSections(): Task[] {
  return [
    createMockTask({ title: 'Work Task', section: 'Work' }),
    createMockTask({ title: 'Personal Task', section: 'Personal' }),
    createMockTask({ title: 'Shopping Task', section: 'Shopping' }),
  ];
}

/**
 * Generate tasks with tags
 */
export function createTasksWithTags(): Task[] {
  return [
    createMockTask({ title: 'Frontend Task', tags: ['frontend', 'react'] }),
    createMockTask({ title: 'Backend Task', tags: ['backend', 'node'] }),
    createMockTask({ title: 'Full Stack Task', tags: ['frontend', 'backend'] }),
  ];
}

/**
 * Generate tasks with due dates
 */
export function createTasksWithDueDates(): Task[] {
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const nextWeek = new Date(today);
  nextWeek.setDate(nextWeek.getDate() + 7);

  return [
    createMockTask({ title: 'Due Today', dueDate: today.toISOString() }),
    createMockTask({ title: 'Due Tomorrow', dueDate: tomorrow.toISOString() }),
    createMockTask({ title: 'Due Next Week', dueDate: nextWeek.toISOString() }),
  ];
}

/**
 * Generate a complex task with all fields populated
 */
export function createComplexTask(): Task {
  return createMockTask({
    title: 'Complex Task with All Fields',
    status: 'in_progress',
    priority: 'high',
    dueDate: new Date('2025-12-31').toISOString(),
    description: 'This is a detailed description of the task',
    tags: ['urgent', 'important', 'review-required'],
    section: 'Project Alpha',
    order: 1,
  });
}

/**
 * Generate TODO.md content from tasks
 */
export function generateTodoMarkdown(tasks: Task[]): string {
  const sections = new Map<string, Task[]>();

  // Group by section
  tasks.forEach(task => {
    const section = task.section || 'Inbox';
    if (!sections.has(section)) {
      sections.set(section, []);
    }
    sections.get(section)!.push(task);
  });

  const lines: string[] = ['# TODO', ''];

  // Generate markdown for each section
  for (const [sectionName, sectionTasks] of sections.entries()) {
    lines.push(`## ${sectionName}`, '');

    sectionTasks.forEach(task => {
      const checkbox = task.status === 'completed' ? '[x]' : '[ ]';
      let line = `- ${checkbox} ${task.title}`;

      // Add metadata
      const metadata: string[] = [];
      if (task.priority && task.priority !== 'medium') {
        metadata.push(`!${task.priority}`);
      }
      if (task.dueDate) {
        metadata.push(`@${task.dueDate.substring(0, 10)}`);
      }
      if (task.tags && task.tags.length > 0) {
        metadata.push(...task.tags.map(tag => `#${tag}`));
      }

      if (metadata.length > 0) {
        line += ` (${metadata.join(' ')})`;
      }

      lines.push(line);
    });

    lines.push('');
  }

  return lines.join('\n');
}

/**
 * Default sync configuration for testing
 */
export function createDefaultSyncConfig(todoPath: string): SyncConfig {
  return {
    todoPath,
    direction: 'bidirectional',
    strategy: 'three_way_merge',
    conflictResolution: 'merge',
    debounceMs: 500,
    throttleMs: 2000,
    maxFileSizeMB: 5,
    maxTasks: 10000,
    webhooksEnabled: false,
    autoBackup: true,
    backupRetentionDays: 30,
    dryRun: false,
  };
}

/**
 * Create sync config with custom debounce/throttle
 */
export function createSyncConfigWithRateLimits(
  todoPath: string,
  debounceMs: number,
  throttleMs: number
): SyncConfig {
  return {
    ...createDefaultSyncConfig(todoPath),
    debounceMs,
    throttleMs,
  };
}

/**
 * Generate large task dataset for performance testing
 */
export function createLargeTaskDataset(count: number = 1000): Task[] {
  const tasks: Task[] = [];
  const sections = ['Work', 'Personal', 'Shopping', 'Projects', 'Ideas'];
  const priorities: TaskPriority[] = ['low', 'medium', 'high'];
  const statuses: TaskStatus[] = ['pending', 'in_progress', 'completed'];

  for (let i = 0; i < count; i++) {
    tasks.push(
      createMockTask({
        title: `Task ${i + 1}`,
        section: sections[i % sections.length],
        priority: priorities[i % priorities.length],
        status: statuses[i % statuses.length],
        order: i,
        tags: [`tag${i % 10}`, `category${i % 5}`],
      })
    );
  }

  return tasks;
}

/**
 * Create conflicting task versions for merge testing
 */
export interface ConflictingTaskSet {
  base: Task;
  fileVersion: Task;
  appVersion: Task;
}

export function createConflictingTasks(): ConflictingTaskSet {
  const base = createMockTask({
    title: 'Original Task',
    status: 'pending',
    priority: 'medium',
    description: 'Original description',
  });

  const fileVersion: Task = {
    ...base,
    status: 'completed',
    description: 'Updated in file',
    updatedAt: new Date(base.updatedAt.getTime() + 1000),
  };

  const appVersion: Task = {
    ...base,
    priority: 'high',
    description: 'Updated in app',
    updatedAt: new Date(base.updatedAt.getTime() + 2000),
  };

  return { base, fileVersion, appVersion };
}

/**
 * Create multiple conflicting task sets
 */
export function createMultipleConflictingTasks(count: number): ConflictingTaskSet[] {
  return Array.from({ length: count }, () => createConflictingTasks());
}

/**
 * Sleep utility for async tests
 */
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Wait for condition with timeout
 */
export async function waitForCondition(
  condition: () => boolean | Promise<boolean>,
  timeoutMs: number = 5000,
  intervalMs: number = 100
): Promise<void> {
  const startTime = Date.now();

  while (Date.now() - startTime < timeoutMs) {
    if (await condition()) {
      return;
    }
    await sleep(intervalMs);
  }

  throw new Error(`Condition not met within ${timeoutMs}ms`);
}

/**
 * Generate incremental task updates
 */
export function generateTaskUpdates(original: Task, updateCount: number): Task[] {
  const updates: Task[] = [];

  for (let i = 0; i < updateCount; i++) {
    const updated: Task = {
      ...original,
      title: `${original.title} (v${i + 1})`,
      updatedAt: new Date(original.updatedAt.getTime() + (i + 1) * 1000),
    };
    updates.push(updated);
  }

  return updates;
}
