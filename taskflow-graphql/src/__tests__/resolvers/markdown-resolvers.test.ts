/**
 * Markdown Resolvers Unit Tests
 * Comprehensive test coverage for Markdown export queries and mutations
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { GraphQLError } from 'graphql';
import {
  markdownQueries,
  markdownMutations,
} from '../../resolvers/markdown-resolvers.js';
import type { GraphQLContext } from '../../context.js';
import * as indexeddb from '../../utils/indexeddb.js';

// ============================================================================
// Mock Setup
// ============================================================================

vi.mock('../../utils/indexeddb.js', () => ({
  getTask: vi.fn(),
  getBoard: vi.fn(),
  getTasksByBoard: vi.fn(),
  getLabelsByBoard: vi.fn(),
  getAllLabels: vi.fn(),
  getAllWebhooks: vi.fn(() => Promise.resolve([])), // Week 7: Add missing mock
  getAllTemplates: vi.fn(() => Promise.resolve([])), // Week 7: Add missing mock
}));

// ============================================================================
// Test Data
// ============================================================================

const mockBoard = {
  id: 'board-1',
  name: 'Test Board',
  description: 'Test board for markdown export',
  columns: [
    { id: 'col-1', name: 'To Do', position: 0, taskIds: [] },
    { id: 'col-2', name: 'In Progress', position: 1, taskIds: [] },
    { id: 'col-3', name: 'Done', position: 2, taskIds: [] },
  ],
  settings: { defaultColumn: 'col-1' },
  isShared: false,
  createdAt: '2025-01-01T00:00:00Z',
  updatedAt: '2025-01-01T00:00:00Z',
};

const mockTask1 = {
  id: 'task-1',
  boardId: 'board-1',
  columnId: 'col-1',
  title: 'Task 1',
  description: 'First task',
  status: 'TODO' as const,
  priority: 'HIGH' as const,
  dueDate: '2025-12-31T23:59:00Z',
  dueTime: '23:59',
  labels: ['label-1'],
  subtasks: [
    {
      id: 'subtask-1',
      title: 'Subtask 1',
      completed: false,
      position: 0,
      createdAt: '2025-01-01T00:00:00Z',
    },
  ],
  files: [],
  position: 0,
  createdAt: '2025-01-01T00:00:00Z',
  updatedAt: '2025-01-01T00:00:00Z',
};

const mockTask2 = {
  id: 'task-2',
  boardId: 'board-1',
  columnId: 'col-3',
  title: 'Task 2',
  description: 'Second task',
  status: 'COMPLETED' as const,
  priority: 'MEDIUM' as const,
  labels: ['label-2'],
  subtasks: [],
  files: [
    {
      id: 'file-1',
      name: 'document.pdf',
      type: 'application/pdf',
      size: 2048,
      data: 'base64data',
      uploadedAt: '2025-01-01T00:00:00Z',
    },
  ],
  position: 0,
  createdAt: '2025-01-01T00:00:00Z',
  updatedAt: '2025-01-01T00:00:00Z',
  completedAt: '2025-01-02T00:00:00Z',
};

const mockLabels = [
  {
    id: 'label-1',
    name: 'Bug',
    color: '#ff0000',
    boardId: 'board-1',
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z',
  },
  {
    id: 'label-2',
    name: 'Feature',
    color: '#00ff00',
    boardId: 'board-1',
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z',
  },
];

const mockContext: GraphQLContext = {
  headers: {},
};

// ============================================================================
// Test Suites
// ============================================================================

describe('Markdown Resolvers - Queries', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('exportBoardAsMarkdown', () => {
    it('should export board as markdown successfully', async () => {
      vi.mocked(indexeddb.getBoard).mockResolvedValue(mockBoard);
      vi.mocked(indexeddb.getTasksByBoard).mockResolvedValue([
        mockTask1,
        mockTask2,
      ]);
      vi.mocked(indexeddb.getLabelsByBoard).mockResolvedValue(mockLabels);

      const result = await markdownQueries.exportBoardAsMarkdown!(
        {},
        { boardId: 'board-1', filters: null },
        mockContext,
        {} as any
      );

      expect(result).toBeDefined();
      expect(typeof result).toBe('string');
      expect(result).toContain('# Test Board');
      expect(result).toContain('## To Do');
      expect(result).toContain('## Done');
      expect(result).toContain('Task 1');
      expect(result).toContain('Task 2');
    });

    it('should throw error for non-existent board', async () => {
      vi.mocked(indexeddb.getBoard).mockResolvedValue(null);

      await expect(
        markdownQueries.exportBoardAsMarkdown!(
          {},
          { boardId: 'invalid-board', filters: null },
          mockContext,
          {} as any
        )
      ).rejects.toThrow(GraphQLError);
    });

    it('should apply status filter correctly', async () => {
      vi.mocked(indexeddb.getBoard).mockResolvedValue(mockBoard);
      vi.mocked(indexeddb.getTasksByBoard).mockResolvedValue([
        mockTask1,
        mockTask2,
      ]);
      vi.mocked(indexeddb.getLabelsByBoard).mockResolvedValue(mockLabels);

      const result = await markdownQueries.exportBoardAsMarkdown!(
        {},
        { boardId: 'board-1', filters: { status: 'COMPLETED' } },
        mockContext,
        {} as any
      );

      expect(result).toContain('Task 2');
      expect(result).not.toContain('## To Do');
    });

    it('should apply priority filter correctly', async () => {
      vi.mocked(indexeddb.getBoard).mockResolvedValue(mockBoard);
      vi.mocked(indexeddb.getTasksByBoard).mockResolvedValue([
        mockTask1,
        mockTask2,
      ]);
      vi.mocked(indexeddb.getLabelsByBoard).mockResolvedValue(mockLabels);

      const result = await markdownQueries.exportBoardAsMarkdown!(
        {},
        { boardId: 'board-1', filters: { priority: 'HIGH' } },
        mockContext,
        {} as any
      );

      expect(result).toContain('Task 1');
      expect(result).not.toContain('Task 2');
    });

    it('should apply search filter correctly', async () => {
      vi.mocked(indexeddb.getBoard).mockResolvedValue(mockBoard);
      vi.mocked(indexeddb.getTasksByBoard).mockResolvedValue([
        mockTask1,
        mockTask2,
      ]);
      vi.mocked(indexeddb.getLabelsByBoard).mockResolvedValue(mockLabels);

      const result = await markdownQueries.exportBoardAsMarkdown!(
        {},
        { boardId: 'board-1', filters: { search: 'First' } },
        mockContext,
        {} as any
      );

      expect(result).toContain('Task 1');
      expect(result).not.toContain('Task 2');
    });
  });

  describe('exportTaskAsMarkdown', () => {
    it('should export single task as markdown successfully', async () => {
      vi.mocked(indexeddb.getTask).mockResolvedValue(mockTask1);
      vi.mocked(indexeddb.getAllLabels).mockResolvedValue(mockLabels);

      const result = await markdownQueries.exportTaskAsMarkdown!(
        {},
        { taskId: 'task-1' },
        mockContext,
        {} as any
      );

      expect(result).toBeDefined();
      expect(typeof result).toBe('string');
      expect(result).toContain('Task 1');
      expect(result).toContain('First task');
      expect(result).toContain('Subtask 1');
    });

    it('should throw error for non-existent task', async () => {
      vi.mocked(indexeddb.getTask).mockResolvedValue(null);

      await expect(
        markdownQueries.exportTaskAsMarkdown!(
          {},
          { taskId: 'invalid-task' },
          mockContext,
          {} as any
        )
      ).rejects.toThrow(GraphQLError);
    });

    it('should include labels in task export', async () => {
      vi.mocked(indexeddb.getTask).mockResolvedValue(mockTask1);
      vi.mocked(indexeddb.getAllLabels).mockResolvedValue(mockLabels);

      const result = await markdownQueries.exportTaskAsMarkdown!(
        {},
        { taskId: 'task-1' },
        mockContext,
        {} as any
      );

      expect(result).toContain('Bug');
    });

    it('should include attachments in task export', async () => {
      vi.mocked(indexeddb.getTask).mockResolvedValue(mockTask2);
      vi.mocked(indexeddb.getAllLabels).mockResolvedValue(mockLabels);

      const result = await markdownQueries.exportTaskAsMarkdown!(
        {},
        { taskId: 'task-2' },
        mockContext,
        {} as any
      );

      expect(result).toContain('document.pdf');
      expect(result).toContain('2.0 KB');
    });
  });

  describe('exportTasksAsMarkdown', () => {
    it('should export filtered tasks as markdown successfully', async () => {
      vi.mocked(indexeddb.getBoard).mockResolvedValue(mockBoard);
      vi.mocked(indexeddb.getTasksByBoard).mockResolvedValue([
        mockTask1,
        mockTask2,
      ]);
      vi.mocked(indexeddb.getLabelsByBoard).mockResolvedValue(mockLabels);

      const result = await markdownQueries.exportTasksAsMarkdown!(
        {},
        { boardId: 'board-1', filters: null },
        mockContext,
        {} as any
      );

      expect(result).toBeDefined();
      expect(result).toContain('## To Do');
      expect(result).toContain('## Done');
      expect(result).toContain('Task 1');
      expect(result).toContain('Task 2');
    });

    it('should throw error for non-existent board', async () => {
      vi.mocked(indexeddb.getBoard).mockResolvedValue(null);

      await expect(
        markdownQueries.exportTasksAsMarkdown!(
          {},
          { boardId: 'invalid-board', filters: null },
          mockContext,
          {} as any
        )
      ).rejects.toThrow(GraphQLError);
    });

    it('should apply label filter correctly', async () => {
      vi.mocked(indexeddb.getBoard).mockResolvedValue(mockBoard);
      vi.mocked(indexeddb.getTasksByBoard).mockResolvedValue([
        mockTask1,
        mockTask2,
      ]);
      vi.mocked(indexeddb.getLabelsByBoard).mockResolvedValue(mockLabels);

      const result = await markdownQueries.exportTasksAsMarkdown!(
        {},
        { boardId: 'board-1', filters: { labels: ['label-1'] } },
        mockContext,
        {} as any
      );

      expect(result).toContain('Task 1');
      expect(result).not.toContain('Task 2');
    });
  });
});

describe('Markdown Resolvers - Mutations', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('generateMarkdownReport', () => {
    it('should generate markdown report with STANDARD format', async () => {
      vi.mocked(indexeddb.getBoard).mockResolvedValue(mockBoard);
      vi.mocked(indexeddb.getTasksByBoard).mockResolvedValue([
        mockTask1,
        mockTask2,
      ]);
      vi.mocked(indexeddb.getLabelsByBoard).mockResolvedValue(mockLabels);

      const result = await markdownMutations.generateMarkdownReport!(
        {},
        {
          input: {
            boardId: 'board-1',
            format: 'STANDARD',
            includeCompleted: true,
            includeSubtasks: true,
            includeLabels: true,
            includeAttachments: true,
          },
        },
        mockContext,
        {} as any
      );

      expect(result).toBeDefined();
      expect(result.content).toBeDefined();
      expect(result.format).toBe('STANDARD');
      expect(result.generatedAt).toBeDefined();
      expect(result.metadata.boardName).toBe('Test Board');
      expect(result.metadata.taskCount).toBe(2);
      expect(result.metadata.completedCount).toBe(1);
    });

    it('should exclude completed tasks when includeCompleted is false', async () => {
      vi.mocked(indexeddb.getBoard).mockResolvedValue(mockBoard);
      vi.mocked(indexeddb.getTasksByBoard).mockResolvedValue([
        mockTask1,
        mockTask2,
      ]);
      vi.mocked(indexeddb.getLabelsByBoard).mockResolvedValue(mockLabels);

      const result = await markdownMutations.generateMarkdownReport!(
        {},
        {
          input: {
            boardId: 'board-1',
            includeCompleted: false,
          },
        },
        mockContext,
        {} as any
      );

      expect(result.content).toContain('Task 1');
      expect(result.content).not.toContain('Task 2');
      expect(result.metadata.taskCount).toBe(1);
      expect(result.metadata.completedCount).toBe(0);
    });

    it('should generate markdown report with GITHUB_FLAVORED format', async () => {
      vi.mocked(indexeddb.getBoard).mockResolvedValue(mockBoard);
      vi.mocked(indexeddb.getTasksByBoard).mockResolvedValue([
        mockTask1,
        mockTask2,
      ]);
      vi.mocked(indexeddb.getLabelsByBoard).mockResolvedValue(mockLabels);

      const result = await markdownMutations.generateMarkdownReport!(
        {},
        {
          input: {
            boardId: 'board-1',
            format: 'GITHUB_FLAVORED',
          },
        },
        mockContext,
        {} as any
      );

      expect(result.format).toBe('GITHUB_FLAVORED');
      expect(result.content).toBeDefined();
    });

    it('should generate markdown report with OBSIDIAN format', async () => {
      vi.mocked(indexeddb.getBoard).mockResolvedValue(mockBoard);
      vi.mocked(indexeddb.getTasksByBoard).mockResolvedValue([
        mockTask1,
        mockTask2,
      ]);
      vi.mocked(indexeddb.getLabelsByBoard).mockResolvedValue(mockLabels);

      const result = await markdownMutations.generateMarkdownReport!(
        {},
        {
          input: {
            boardId: 'board-1',
            format: 'OBSIDIAN',
          },
        },
        mockContext,
        {} as any
      );

      expect(result.format).toBe('OBSIDIAN');
      expect(result.content).toContain('---'); // Frontmatter
    });

    it('should throw error for non-existent board', async () => {
      vi.mocked(indexeddb.getBoard).mockResolvedValue(null);

      await expect(
        markdownMutations.generateMarkdownReport!(
          {},
          {
            input: {
              boardId: 'invalid-board',
            },
          },
          mockContext,
          {} as any
        )
      ).rejects.toThrow(GraphQLError);
    });

    it('should respect includeSubtasks option', async () => {
      vi.mocked(indexeddb.getBoard).mockResolvedValue(mockBoard);
      vi.mocked(indexeddb.getTasksByBoard).mockResolvedValue([mockTask1]);
      vi.mocked(indexeddb.getLabelsByBoard).mockResolvedValue(mockLabels);

      const result = await markdownMutations.generateMarkdownReport!(
        {},
        {
          input: {
            boardId: 'board-1',
            includeSubtasks: true,
          },
        },
        mockContext,
        {} as any
      );

      expect(result.content).toContain('Subtask 1');
      expect(result.metadata.includeSubtasks).toBe(true);
    });

    it('should respect includeLabels option', async () => {
      vi.mocked(indexeddb.getBoard).mockResolvedValue(mockBoard);
      vi.mocked(indexeddb.getTasksByBoard).mockResolvedValue([mockTask1]);
      vi.mocked(indexeddb.getLabelsByBoard).mockResolvedValue(mockLabels);

      const result = await markdownMutations.generateMarkdownReport!(
        {},
        {
          input: {
            boardId: 'board-1',
            includeLabels: true,
          },
        },
        mockContext,
        {} as any
      );

      expect(result.metadata.includeLabels).toBe(true);
    });

    it('should respect includeAttachments option', async () => {
      vi.mocked(indexeddb.getBoard).mockResolvedValue(mockBoard);
      vi.mocked(indexeddb.getTasksByBoard).mockResolvedValue([mockTask2]);
      vi.mocked(indexeddb.getLabelsByBoard).mockResolvedValue(mockLabels);

      const result = await markdownMutations.generateMarkdownReport!(
        {},
        {
          input: {
            boardId: 'board-1',
            includeAttachments: true,
          },
        },
        mockContext,
        {} as any
      );

      expect(result.content).toContain('document.pdf');
      expect(result.metadata.includeAttachments).toBe(true);
    });

    it('should apply filters in markdown report', async () => {
      vi.mocked(indexeddb.getBoard).mockResolvedValue(mockBoard);
      vi.mocked(indexeddb.getTasksByBoard).mockResolvedValue([
        mockTask1,
        mockTask2,
      ]);
      vi.mocked(indexeddb.getLabelsByBoard).mockResolvedValue(mockLabels);

      const result = await markdownMutations.generateMarkdownReport!(
        {},
        {
          input: {
            boardId: 'board-1',
            filters: {
              status: 'TODO',
            },
          },
        },
        mockContext,
        {} as any
      );

      expect(result.content).toContain('Task 1');
      expect(result.content).not.toContain('Task 2');
      expect(result.metadata.taskCount).toBe(1);
    });
  });
});

describe('Markdown Generation - Edge Cases', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should handle empty task list', async () => {
    vi.mocked(indexeddb.getBoard).mockResolvedValue(mockBoard);
    vi.mocked(indexeddb.getTasksByBoard).mockResolvedValue([]);
    vi.mocked(indexeddb.getLabelsByBoard).mockResolvedValue([]);

    const result = await markdownQueries.exportBoardAsMarkdown!(
      {},
      { boardId: 'board-1', filters: null },
      mockContext,
      {} as any
    );

    expect(result).toContain('# Test Board');
    expect(result).toContain('Total Tasks: 0');
  });

  it('should handle tasks without labels', async () => {
    const taskWithoutLabels = { ...mockTask1, labels: [] };
    vi.mocked(indexeddb.getTask).mockResolvedValue(taskWithoutLabels);
    vi.mocked(indexeddb.getAllLabels).mockResolvedValue([]);

    const result = await markdownQueries.exportTaskAsMarkdown!(
      {},
      { taskId: 'task-1' },
      mockContext,
      {} as any
    );

    expect(result).toBeDefined();
    expect(result).toContain('Task 1');
  });

  it('should handle tasks without subtasks', async () => {
    const taskWithoutSubtasks = { ...mockTask1, subtasks: [] };
    vi.mocked(indexeddb.getTask).mockResolvedValue(taskWithoutSubtasks);
    vi.mocked(indexeddb.getAllLabels).mockResolvedValue(mockLabels);

    const result = await markdownQueries.exportTaskAsMarkdown!(
      {},
      { taskId: 'task-1' },
      mockContext,
      {} as any
    );

    expect(result).toBeDefined();
    expect(result).toContain('Task 1');
  });

  it('should handle tasks without due date', async () => {
    const taskWithoutDueDate = { ...mockTask1 };
    delete taskWithoutDueDate.dueDate;
    delete taskWithoutDueDate.dueTime;
    vi.mocked(indexeddb.getTask).mockResolvedValue(taskWithoutDueDate);
    vi.mocked(indexeddb.getAllLabels).mockResolvedValue(mockLabels);

    const result = await markdownQueries.exportTaskAsMarkdown!(
      {},
      { taskId: 'task-1' },
      mockContext,
      {} as any
    );

    expect(result).toBeDefined();
    expect(result).not.toContain('Due:');
  });
});
