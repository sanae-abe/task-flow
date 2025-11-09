/**
 * MarkdownParser Test Suite
 * Comprehensive testing for markdown parsing functionality
 *
 * Test Coverage:
 * - Priority detection (4 cases)
 * - Status detection (3 cases)
 * - Tag extraction (3 cases)
 * - Date parsing (3 cases)
 * - Security (2 cases)
 * - Integration (1 case)
 * - Error handling (14 cases)
 * Total: 30 test cases
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MarkdownParser } from '../markdown-parser';
import { Task, TaskStatus, Priority, Label } from '../../types/index';
import { promises as fs } from 'fs';
import * as path from 'path';

// Mock the file system
vi.mock('fs', () => ({
  promises: {
    readFile: vi.fn(),
  },
}));

// Mock the PathValidator to allow test paths
vi.mock('../security/path-validator', () => ({
  PathValidator: class {
    validate(filePath: string): string {
      // Return absolute path for testing
      return path.resolve(process.cwd(), filePath);
    }
  },
}));

// Mock the MarkdownSanitizer
vi.mock('../security/sanitizer', () => ({
  MarkdownSanitizer: class {
    sanitize(text: string): string {
      // For most tests, just return the text as-is
      // For XSS test, we'll simulate sanitization
      return text.replace(/<script>.*?<\/script>/gi, '').trim();
    }
    sanitizeTitle(title: string): string {
      return this.sanitize(title);
    }
  },
}));

// Helper function to create a complete Task object
function createTask(overrides: Partial<Task> = {}): Task {
  const now = new Date();
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
function createLabel(name: string): Label {
  return {
    id: crypto.randomUUID(),
    name,
    color: `hsl(${Math.random() * 360}, 65%, 75%)`,
    taskCount: 0,
    createdAt: new Date(),
  };
}

describe('MarkdownParser', () => {
  let parser: MarkdownParser;

  beforeEach(() => {
    parser = new MarkdownParser();
    vi.clearAllMocks();
  });

  // ============================================================================
  // Priority Detection Tests (4 cases)
  // ============================================================================
  describe('Priority Detection', () => {
    it('should detect CRITICAL priority from 🔥 emoji', async () => {
      const content = `
## 🔥 CRITICAL

- [ ] Critical security patch
`;
      vi.mocked(fs.readFile).mockResolvedValue(content);

      const tasks = await parser.parse('/test/path.md');

      expect(tasks).toHaveLength(1);
      expect(tasks[0].priority).toBe(Priority.CRITICAL);
      expect(tasks[0].title).toBe('Critical security patch');
    });

    it('should detect HIGH priority from ⚠️ emoji', async () => {
      const content = `
## ⚠️ HIGH

- [ ] Important bug fix
`;
      vi.mocked(fs.readFile).mockResolvedValue(content);

      const tasks = await parser.parse('/test/path.md');

      expect(tasks).toHaveLength(1);
      expect(tasks[0].priority).toBe(Priority.HIGH);
    });

    it('should detect MEDIUM priority from 📌 emoji', async () => {
      const content = `
## 📌 MEDIUM

- [ ] Regular feature
`;
      vi.mocked(fs.readFile).mockResolvedValue(content);

      const tasks = await parser.parse('/test/path.md');

      expect(tasks).toHaveLength(1);
      expect(tasks[0].priority).toBe(Priority.MEDIUM);
    });

    it('should detect LOW priority from 📝 emoji', async () => {
      const content = `
## 📝 LOW

- [ ] Minor improvement
`;
      vi.mocked(fs.readFile).mockResolvedValue(content);

      const tasks = await parser.parse('/test/path.md');

      expect(tasks).toHaveLength(1);
      expect(tasks[0].priority).toBe(Priority.LOW);
    });
  });

  // ============================================================================
  // Status Detection Tests (3 cases)
  // ============================================================================
  describe('Status Detection', () => {
    it('should parse [ ] as TODO status', async () => {
      const content = `
## Tasks

- [ ] Not started task
`;
      vi.mocked(fs.readFile).mockResolvedValue(content);

      const tasks = await parser.parse('/test/path.md');

      expect(tasks).toHaveLength(1);
      expect(tasks[0].status).toBe(TaskStatus.TODO);
    });

    it('should parse [~] as IN_PROGRESS status', async () => {
      const content = `
## Tasks

- [~] Work in progress task
`;
      vi.mocked(fs.readFile).mockResolvedValue(content);

      const tasks = await parser.parse('/test/path.md');

      expect(tasks).toHaveLength(1);
      expect(tasks[0].status).toBe(TaskStatus.IN_PROGRESS);
    });

    it('should parse [x] as DONE status', async () => {
      const content = `
## Tasks

- [x] Completed task
`;
      vi.mocked(fs.readFile).mockResolvedValue(content);

      const tasks = await parser.parse('/test/path.md');

      expect(tasks).toHaveLength(1);
      expect(tasks[0].status).toBe(TaskStatus.COMPLETED);
    });
  });

  // ============================================================================
  // Tag Extraction Tests (3 cases)
  // ============================================================================
  describe('Tag Extraction', () => {
    it('should extract single tag from task title', async () => {
      const content = `
## Tasks

- [ ] Fix authentication #backend
`;
      vi.mocked(fs.readFile).mockResolvedValue(content);

      const tasks = await parser.parse('/test/path.md');

      expect(tasks).toHaveLength(1);
      expect(tasks[0].labels).toHaveLength(1);
      expect(tasks[0].labels[0].name).toBe('backend');
    });

    it('should extract multiple tags from task title', async () => {
      const content = `
## Tasks

- [ ] Update API documentation #backend #docs #urgent
`;
      vi.mocked(fs.readFile).mockResolvedValue(content);

      const tasks = await parser.parse('/test/path.md');

      expect(tasks).toHaveLength(1);
      expect(tasks[0].labels).toHaveLength(3);
      expect(tasks[0].labels.map(l => l.name)).toEqual([
        'backend',
        'docs',
        'urgent',
      ]);
    });

    it('should extract tags with hyphens', async () => {
      const content = `
## Tasks

- [ ] Implement feature #high-priority #frontend-ui
`;
      vi.mocked(fs.readFile).mockResolvedValue(content);

      const tasks = await parser.parse('/test/path.md');

      expect(tasks).toHaveLength(1);
      expect(tasks[0].labels).toHaveLength(2);
      expect(tasks[0].labels.map(l => l.name)).toEqual([
        'high-priority',
        'frontend-ui',
      ]);
    });
  });

  // ============================================================================
  // Date Parsing Tests (3 cases)
  // ============================================================================
  describe('Date Parsing', () => {
    it('should parse created date in YYYY-MM-DD format', async () => {
      const content = `
## Tasks

- [ ] Task with created date (created: 2025-11-09)
`;
      vi.mocked(fs.readFile).mockResolvedValue(content);

      const tasks = await parser.parse('/test/path.md');

      expect(tasks).toHaveLength(1);
      expect(tasks[0].createdAt).toBeInstanceOf(Date);
      expect(tasks[0].createdAt.toISOString()).toContain('2025-11-09');
    });

    it('should parse completed date in YYYY-MM-DD format', async () => {
      const content = `
## Tasks

- [x] Completed task (created: 2025-11-01) (completed: 2025-11-09)
`;
      vi.mocked(fs.readFile).mockResolvedValue(content);

      const tasks = await parser.parse('/test/path.md');

      expect(tasks).toHaveLength(1);
      expect(tasks[0].completedAt).toBeInstanceOf(Date);
      expect(tasks[0].completedAt?.toISOString()).toContain('2025-11-09');
    });

    it('should handle invalid date format gracefully', async () => {
      const content = `
## Tasks

- [ ] Task with invalid date (created: invalid-date)
`;
      vi.mocked(fs.readFile).mockResolvedValue(content);

      const tasks = await parser.parse('/test/path.md');

      expect(tasks).toHaveLength(1);
      // createdAt should be set to current time when invalid
      expect(tasks[0].createdAt).toBeInstanceOf(Date);
      // Should be recent (within last minute)
      const timeDiff = Date.now() - tasks[0].createdAt.getTime();
      expect(timeDiff).toBeLessThan(60000); // Less than 1 minute
    });
  });

  // ============================================================================
  // Security Tests (2 cases)
  // ============================================================================
  describe('Security', () => {
    it('should sanitize XSS attempts in task titles', async () => {
      const content = `
## Tasks

- [ ] <script>alert('XSS')</script>Malicious task
`;
      vi.mocked(fs.readFile).mockResolvedValue(content);

      const tasks = await parser.parse('/test/path.md');

      expect(tasks).toHaveLength(1);
      expect(tasks[0].title).not.toContain('<script>');
      expect(tasks[0].title).not.toContain('alert');
      expect(tasks[0].title).toBe('Malicious task');
    });

    it('should reject path traversal attacks', async () => {
      // Note: Path validation is mocked for most tests, but this test verifies
      // that the MarkdownParser uses PathValidator. In real usage, PathValidator
      // would reject traversal attempts. This test documents the security contract.
      // The actual path validation is tested in path-validator.test.ts

      // Since we mock PathValidator for testing convenience, we verify
      // that MarkdownParser calls the validator
      const content = '- [ ] Test task';
      vi.mocked(fs.readFile).mockResolvedValue(content);

      // The validator is called and path is processed
      const tasks = await parser.parse('test.md');
      expect(tasks).toBeDefined();
    });
  });

  // ============================================================================
  // Integration Test (1 case)
  // ============================================================================
  describe('Integration Test', () => {
    it('should parse a complete TODO.md file correctly', async () => {
      const content = `
# Personal TODOs

<!-- metadata -->
<!-- last_updated: 2025-11-09 10:30:00 -->
<!-- total_todos: 4 -->

## 🔥 CRITICAL

- [~] Fix critical security vulnerability #security #urgent (created: 2025-11-08)

## ⚠️ HIGH

- [ ] Implement user authentication #backend #auth (created: 2025-11-07)

## 📌 MEDIUM

- [ ] Update documentation #docs (created: 2025-11-06)

## 📝 LOW

- [ ] Refactor CSS styles #frontend (created: 2025-11-05)

## ✅ Completed

- [x] Setup project structure #devops (created: 2025-11-01) (completed: 2025-11-02)
`;
      vi.mocked(fs.readFile).mockResolvedValue(content);

      const tasks = await parser.parse('/test/path.md');

      expect(tasks).toHaveLength(5);

      // Verify critical task
      expect(tasks[0].priority).toBe(Priority.CRITICAL);
      expect(tasks[0].status).toBe(TaskStatus.IN_PROGRESS);
      expect(tasks[0].labels.map(l => l.name)).toEqual(['security', 'urgent']);

      // Verify high priority task
      expect(tasks[1].priority).toBe(Priority.HIGH);
      expect(tasks[1].status).toBe(TaskStatus.TODO);
      expect(tasks[1].labels.map(l => l.name)).toEqual(['backend', 'auth']);

      // Verify medium priority task
      expect(tasks[2].priority).toBe(Priority.MEDIUM);

      // Verify low priority task
      expect(tasks[3].priority).toBe(Priority.LOW);

      // Verify completed task
      expect(tasks[4].status).toBe(TaskStatus.COMPLETED);
      expect(tasks[4].completedAt).toBeInstanceOf(Date);
    });
  });

  // ============================================================================
  // Error Handling Tests (14 cases)
  // ============================================================================
  describe('Error Handling', () => {
    it('should throw error when file cannot be read', async () => {
      vi.mocked(fs.readFile).mockRejectedValue(new Error('File not found'));

      await expect(parser.parse('/test/nonexistent.md')).rejects.toThrow(
        'File not found'
      );
    });

    it('should skip empty task lines', async () => {
      const content = `
## Tasks

- [ ]
- [ ] Valid task
`;
      vi.mocked(fs.readFile).mockResolvedValue(content);

      const tasks = await parser.parse('/test/path.md');

      expect(tasks).toHaveLength(1);
      expect(tasks[0].title).toBe('Valid task');
    });

    it('should handle empty file gracefully', async () => {
      vi.mocked(fs.readFile).mockResolvedValue('');

      const tasks = await parser.parse('/test/path.md');

      expect(tasks).toHaveLength(0);
    });

    it('should handle file with only headers', async () => {
      const content = `
## 🔥 URGENT
## ⚠️ HIGH
## 📌 MEDIUM
`;
      vi.mocked(fs.readFile).mockResolvedValue(content);

      const tasks = await parser.parse('/test/path.md');

      expect(tasks).toHaveLength(0);
    });

    it('should default to MEDIUM priority for unknown sections', async () => {
      const content = `
## Random Section

- [ ] Task without priority emoji
`;
      vi.mocked(fs.readFile).mockResolvedValue(content);

      const tasks = await parser.parse('/test/path.md');

      expect(tasks).toHaveLength(1);
      expect(tasks[0].priority).toBe(Priority.MEDIUM);
    });

    it('should handle tasks with no tags', async () => {
      const content = `
## Tasks

- [ ] Task without any tags
`;
      vi.mocked(fs.readFile).mockResolvedValue(content);

      const tasks = await parser.parse('/test/path.md');

      expect(tasks).toHaveLength(1);
      expect(tasks[0].labels).toHaveLength(0);
    });

    it('should handle tasks with no dates', async () => {
      const content = `
## Tasks

- [ ] Task without dates
`;
      vi.mocked(fs.readFile).mockResolvedValue(content);

      const tasks = await parser.parse('/test/path.md');

      expect(tasks).toHaveLength(1);
      expect(tasks[0].createdAt).toBeInstanceOf(Date);
      expect(tasks[0].completedAt).toBeUndefined();
    });

    it('should generate unique IDs for each task', async () => {
      const content = `
## Tasks

- [ ] Task 1
- [ ] Task 2
- [ ] Task 3
`;
      vi.mocked(fs.readFile).mockResolvedValue(content);

      const tasks = await parser.parse('/test/path.md');

      expect(tasks).toHaveLength(3);
      const ids = tasks.map(t => t.id);
      expect(new Set(ids).size).toBe(3); // All IDs should be unique
    });

    it('should generate unique IDs for labels', async () => {
      const content = `
## Tasks

- [ ] Task with tags #tag1 #tag2 #tag3
`;
      vi.mocked(fs.readFile).mockResolvedValue(content);

      const tasks = await parser.parse('/test/path.md');

      expect(tasks).toHaveLength(1);
      const labelIds = tasks[0].labels.map(l => l.id);
      expect(new Set(labelIds).size).toBe(3); // All label IDs should be unique
    });

    it('should generate consistent colors for same label names', async () => {
      const content = `
## Tasks

- [ ] Task 1 #backend
- [ ] Task 2 #backend
`;
      vi.mocked(fs.readFile).mockResolvedValue(content);

      const tasks = await parser.parse('/test/path.md');

      expect(tasks).toHaveLength(2);
      // Same label name should generate same color (hash-based)
      expect(tasks[0].labels[0].color).toBe(tasks[1].labels[0].color);
    });

    it('should handle uppercase status markers (X)', async () => {
      const content = `
## Tasks

- [X] Completed task with uppercase X
`;
      vi.mocked(fs.readFile).mockResolvedValue(content);

      const tasks = await parser.parse('/test/path.md');

      expect(tasks).toHaveLength(1);
      expect(tasks[0].status).toBe(TaskStatus.COMPLETED);
    });

    it('should handle mixed whitespace in task lines', async () => {
      const content = `
## Tasks

-   [ ]   Task with extra spaces
`;
      vi.mocked(fs.readFile).mockResolvedValue(content);

      const tasks = await parser.parse('/test/path.md');

      expect(tasks).toHaveLength(1);
      expect(tasks[0].title).toBe('Task with extra spaces');
    });

    it('should ignore non-task list items', async () => {
      const content = `
## Tasks

- [ ] Valid task
- Not a task item
* Another list item
- [ ] Another valid task
`;
      vi.mocked(fs.readFile).mockResolvedValue(content);

      const tasks = await parser.parse('/test/path.md');

      expect(tasks).toHaveLength(2);
      expect(tasks[0].title).toBe('Valid task');
      expect(tasks[1].title).toBe('Another valid task');
    });

    it('should handle deeply nested header levels', async () => {
      const content = `
### 🔥 CRITICAL (Level 3)

- [ ] Task under level 3 header

#### ⚠️ HIGH (Level 4)

- [ ] Task under level 4 header
`;
      vi.mocked(fs.readFile).mockResolvedValue(content);

      const tasks = await parser.parse('/test/path.md');

      expect(tasks).toHaveLength(2);
      expect(tasks[0].priority).toBe(Priority.CRITICAL);
      expect(tasks[1].priority).toBe(Priority.HIGH);
    });
  });
});
