/**
 * Markdown Export Resolvers for TaskFlow GraphQL
 * Handles all Markdown generation queries and mutations
 */

import { GraphQLError } from 'graphql';
import type {
  QueryResolvers,
  MutationResolvers,
  MarkdownFormat,
  TaskFilters,
} from '../generated/graphql.js';
import {
  getBoard,
  getTask,
  getTasksByBoard,
  getLabelsByBoard,
  getAllLabels,
  TaskRecord,
} from '../utils/indexeddb.js';
import {
  generateTaskMarkdown,
  generateTasksMarkdown,
  generateBoardMarkdown,
  MarkdownFormat as MdFormat,
  type MarkdownGeneratorOptions,
} from '../utils/markdown-generator.js';

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Convert GraphQL MarkdownFormat to internal enum
 */
function convertMarkdownFormat(format?: MarkdownFormat | null): MdFormat {
  if (!format) return MdFormat.STANDARD;

  switch (format) {
    case 'GITHUB_FLAVORED':
      return MdFormat.GITHUB_FLAVORED;
    case 'OBSIDIAN':
      return MdFormat.OBSIDIAN;
    case 'STANDARD':
    default:
      return MdFormat.STANDARD;
  }
}

/**
 * Apply filters to tasks
 */
function applyTaskFilters(
  tasks: TaskRecord[],
  filters?: TaskFilters | null
): TaskRecord[] {
  if (!filters) return tasks;

  let filteredTasks = [...tasks];

  // Filter by status
  if (filters.status) {
    filteredTasks = filteredTasks.filter(
      task => task.status === filters.status
    );
  }

  // Filter by priority
  if (filters.priority) {
    filteredTasks = filteredTasks.filter(
      task => task.priority === filters.priority
    );
  }

  // Filter by labels
  if (filters.labels && filters.labels.length > 0) {
    filteredTasks = filteredTasks.filter(task =>
      filters.labels!.some(labelId => task.labels.includes(labelId))
    );
  }

  // Filter by due date range
  if (filters.dueBefore) {
    filteredTasks = filteredTasks.filter(
      task =>
        task.dueDate && new Date(task.dueDate) <= new Date(filters.dueBefore!)
    );
  }

  if (filters.dueAfter) {
    filteredTasks = filteredTasks.filter(
      task =>
        task.dueDate && new Date(task.dueDate) >= new Date(filters.dueAfter!)
    );
  }

  // Filter by search query
  if (filters.search) {
    const searchLower = filters.search.toLowerCase();
    filteredTasks = filteredTasks.filter(
      task =>
        task.title.toLowerCase().includes(searchLower) ||
        task.description?.toLowerCase().includes(searchLower)
    );
  }

  return filteredTasks;
}

// ============================================================================
// Query Resolvers
// ============================================================================

export const markdownQueries: Pick<
  QueryResolvers,
  'exportBoardAsMarkdown' | 'exportTaskAsMarkdown' | 'exportTasksAsMarkdown'
> = {
  /**
   * Export entire board as Markdown
   */
  exportBoardAsMarkdown: async (_parent, { boardId, filters }) => {
    // Get board
    const board = await getBoard(boardId);
    if (!board) {
      throw new GraphQLError(`Board not found: ${boardId}`, {
        extensions: { code: 'NOT_FOUND' },
      });
    }

    // Get all tasks for the board
    let tasks = await getTasksByBoard(boardId);

    // Apply filters
    tasks = applyTaskFilters(tasks, filters);

    // Get labels
    const labels = await getLabelsByBoard(boardId);

    // Generate markdown
    const options: MarkdownGeneratorOptions = {
      format: MdFormat.STANDARD,
      includeSubtasks: true,
      includeLabels: true,
      includeAttachments: true,
      includeMetadata: true,
    };

    return generateBoardMarkdown(board, tasks, labels, options);
  },

  /**
   * Export single task as Markdown
   */
  exportTaskAsMarkdown: async (_parent, { taskId }) => {
    // Get task
    const task = await getTask(taskId);
    if (!task) {
      throw new GraphQLError(`Task not found: ${taskId}`, {
        extensions: { code: 'NOT_FOUND' },
      });
    }

    // Get labels for this task
    const allLabels = await getAllLabels();
    const taskLabels = allLabels.filter(label =>
      task.labels.includes(label.id)
    );

    // Generate markdown
    const options: MarkdownGeneratorOptions = {
      format: MdFormat.STANDARD,
      includeSubtasks: true,
      includeLabels: true,
      includeAttachments: true,
    };

    return generateTaskMarkdown(task, taskLabels, options);
  },

  /**
   * Export filtered tasks as Markdown
   */
  exportTasksAsMarkdown: async (_parent, { boardId, filters }) => {
    // Get board for column information
    const board = await getBoard(boardId);
    if (!board) {
      throw new GraphQLError(`Board not found: ${boardId}`, {
        extensions: { code: 'NOT_FOUND' },
      });
    }

    // Get all tasks for the board
    let tasks = await getTasksByBoard(boardId);

    // Apply filters
    tasks = applyTaskFilters(tasks, filters);

    // Get labels
    const labels = await getLabelsByBoard(boardId);

    // Generate markdown
    const options: MarkdownGeneratorOptions = {
      format: MdFormat.STANDARD,
      includeSubtasks: true,
      includeLabels: true,
      includeAttachments: true,
    };

    return generateTasksMarkdown(tasks, board.columns, labels, options);
  },
};

// ============================================================================
// Mutation Resolvers
// ============================================================================

export const markdownMutations: Pick<
  MutationResolvers,
  'generateMarkdownReport'
> = {
  /**
   * Generate comprehensive Markdown report with custom options
   */
  generateMarkdownReport: async (_parent, { input }) => {
    const {
      boardId,
      includeCompleted = true,
      includeSubtasks = true,
      includeLabels = true,
      includeAttachments = true,
      format,
      filters,
    } = input;

    // Get board
    const board = await getBoard(boardId);
    if (!board) {
      throw new GraphQLError(`Board not found: ${boardId}`, {
        extensions: { code: 'NOT_FOUND' },
      });
    }

    // Get all tasks for the board
    let tasks = await getTasksByBoard(boardId);

    // Filter out completed tasks if requested
    if (!includeCompleted) {
      tasks = tasks.filter(task => task.status !== 'COMPLETED');
    }

    // Apply additional filters
    tasks = applyTaskFilters(tasks, filters);

    // Get labels
    const labels = await getLabelsByBoard(boardId);

    // Generate markdown
    const markdownFormat = convertMarkdownFormat(format);
    const options: MarkdownGeneratorOptions = {
      format: markdownFormat,
      includeSubtasks: includeSubtasks ?? true,
      includeLabels: includeLabels ?? true,
      includeAttachments: includeAttachments ?? true,
      includeMetadata: true,
    };

    const content = generateBoardMarkdown(board, tasks, labels, options);

    // Calculate metadata
    const completedCount = tasks.filter(
      task => task.status === 'COMPLETED'
    ).length;

    return {
      content,
      generatedAt: new Date(),
      format: (format || 'STANDARD') as MarkdownFormat,
      metadata: {
        boardName: board.name,
        taskCount: tasks.length,
        completedCount,
        includeSubtasks: includeSubtasks ?? true,
        includeLabels: includeLabels ?? true,
        includeAttachments: includeAttachments ?? true,
      },
    };
  },
};

// ============================================================================
// Exports
// ============================================================================

export default {
  Query: markdownQueries,
  Mutation: markdownMutations,
};
