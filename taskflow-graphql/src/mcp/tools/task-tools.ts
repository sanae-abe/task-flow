/**
 * MCP Task Tools Implementation
 * Provides CRUD operations for tasks via MCP
 */

import {
  getTask,
  getAllTasks,
  getTasksByBoard,
  createTask as createTaskDB,
  updateTask as updateTaskDB,
} from '../../utils/indexeddb.js';
import type {
  MCPToolResult,
  CreateTaskArgs,
  UpdateTaskArgs,
  ListTasksArgs,
} from '../types.js';

/**
 * Tool definitions for Task operations
 */
export const taskTools = [
  {
    name: 'create_task',
    description: 'Create a new task in TaskFlow',
    inputSchema: {
      type: 'object',
      properties: {
        title: {
          type: 'string',
          description: 'Task title (required)',
        },
        description: {
          type: 'string',
          description: 'Task description (optional)',
        },
        boardId: {
          type: 'string',
          description: 'Board ID where the task will be created (required)',
        },
        columnId: {
          type: 'string',
          description: 'Column ID where the task will be placed (required)',
        },
        priority: {
          type: 'string',
          enum: ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'],
          description: 'Task priority (default: MEDIUM)',
        },
        dueDate: {
          type: 'string',
          format: 'date-time',
          description: 'Due date in ISO format (optional)',
        },
        dueTime: {
          type: 'string',
          description: 'Due time in HH:mm format (optional)',
        },
        labels: {
          type: 'array',
          items: { type: 'string' },
          description: 'Array of label IDs (optional)',
        },
      },
      required: ['title', 'boardId', 'columnId'],
    },
  },
  {
    name: 'update_task',
    description: 'Update an existing task',
    inputSchema: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
          description: 'Task ID (required)',
        },
        title: {
          type: 'string',
          description: 'New task title (optional)',
        },
        description: {
          type: 'string',
          description: 'New task description (optional)',
        },
        status: {
          type: 'string',
          enum: ['TODO', 'IN_PROGRESS', 'COMPLETED'],
          description: 'New task status (optional)',
        },
        priority: {
          type: 'string',
          enum: ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'],
          description: 'New task priority (optional)',
        },
        columnId: {
          type: 'string',
          description: 'New column ID (optional)',
        },
        dueDate: {
          type: 'string',
          format: 'date-time',
          description: 'New due date in ISO format (optional)',
        },
        dueTime: {
          type: 'string',
          description: 'New due time in HH:mm format (optional)',
        },
        labels: {
          type: 'array',
          items: { type: 'string' },
          description: 'New array of label IDs (optional)',
        },
      },
      required: ['id'],
    },
  },
  {
    name: 'delete_task',
    description: 'Delete a task (soft delete)',
    inputSchema: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
          description: 'Task ID to delete (required)',
        },
      },
      required: ['id'],
    },
  },
  {
    name: 'get_task',
    description: 'Get a specific task by ID',
    inputSchema: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
          description: 'Task ID (required)',
        },
      },
      required: ['id'],
    },
  },
  {
    name: 'list_tasks',
    description: 'List tasks with optional filters',
    inputSchema: {
      type: 'object',
      properties: {
        boardId: {
          type: 'string',
          description: 'Filter by board ID (optional)',
        },
        status: {
          type: 'string',
          enum: ['TODO', 'IN_PROGRESS', 'COMPLETED', 'DELETED'],
          description: 'Filter by status (optional)',
        },
        priority: {
          type: 'string',
          enum: ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'],
          description: 'Filter by priority (optional)',
        },
        limit: {
          type: 'number',
          description: 'Maximum number of tasks to return (optional)',
        },
      },
    },
  },
  {
    name: 'complete_task',
    description: 'Mark a task as completed',
    inputSchema: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
          description: 'Task ID to complete (required)',
        },
      },
      required: ['id'],
    },
  },
  {
    name: 'batch_update_tasks',
    description:
      'Update multiple tasks in a single batch operation (Week 7 Performance optimization)',
    inputSchema: {
      type: 'object',
      properties: {
        updates: {
          type: 'array',
          description: 'Array of task updates to perform',
          items: {
            type: 'object',
            properties: {
              taskId: {
                type: 'string',
                description: 'Task ID to update (required)',
              },
              updates: {
                type: 'object',
                description: 'Fields to update (same as update_task)',
                properties: {
                  title: { type: 'string' },
                  description: { type: 'string' },
                  status: {
                    type: 'string',
                    enum: ['TODO', 'IN_PROGRESS', 'COMPLETED'],
                  },
                  priority: {
                    type: 'string',
                    enum: ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'],
                  },
                  columnId: { type: 'string' },
                  dueDate: { type: 'string', format: 'date-time' },
                  dueTime: { type: 'string' },
                  labels: {
                    type: 'array',
                    items: { type: 'string' },
                  },
                },
              },
            },
            required: ['taskId', 'updates'],
          },
        },
      },
      required: ['updates'],
    },
  },
];

/**
 * Handle create_task tool call
 */
export async function handleCreateTask(
  args: CreateTaskArgs
): Promise<MCPToolResult> {
  try {
    const task = await createTaskDB({
      boardId: args.boardId,
      columnId: args.columnId,
      title: args.title,
      description: args.description || '',
      status: 'TODO',
      priority: args.priority || 'MEDIUM',
      labels: args.labels || [],
      subtasks: [],
      files: [],
      position: 0,
      dueDate: args.dueDate,
      dueTime: args.dueTime,
    });

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(task, null, 2),
        },
      ],
    };
  } catch (error) {
    return {
      content: [
        {
          type: 'text',
          text: `Error creating task: ${error instanceof Error ? error.message : 'Unknown error'}`,
        },
      ],
      isError: true,
    };
  }
}

/**
 * Handle update_task tool call
 */
export async function handleUpdateTask(
  args: UpdateTaskArgs
): Promise<MCPToolResult> {
  try {
    const updates: Record<string, unknown> = {};

    if (args.title !== undefined) updates.title = args.title;
    if (args.description !== undefined) updates.description = args.description;
    if (args.status !== undefined) updates.status = args.status;
    if (args.priority !== undefined) updates.priority = args.priority;
    if (args.columnId !== undefined) updates.columnId = args.columnId;
    if (args.dueDate !== undefined) updates.dueDate = args.dueDate;
    if (args.dueTime !== undefined) updates.dueTime = args.dueTime;
    if (args.labels !== undefined) updates.labels = args.labels;

    const task = await updateTaskDB(args.id, updates);

    if (!task) {
      return {
        content: [
          {
            type: 'text',
            text: `Task with ID ${args.id} not found`,
          },
        ],
        isError: true,
      };
    }

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(task, null, 2),
        },
      ],
    };
  } catch (error) {
    return {
      content: [
        {
          type: 'text',
          text: `Error updating task: ${error instanceof Error ? error.message : 'Unknown error'}`,
        },
      ],
      isError: true,
    };
  }
}

/**
 * Handle delete_task tool call
 */
export async function handleDeleteTask(args: {
  id: string;
}): Promise<MCPToolResult> {
  try {
    // Soft delete by updating status
    const task = await updateTaskDB(args.id, {
      status: 'DELETED',
      deletedAt: new Date().toISOString(),
    });

    if (!task) {
      return {
        content: [
          {
            type: 'text',
            text: `Task with ID ${args.id} not found`,
          },
        ],
        isError: true,
      };
    }

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({ success: true, task }, null, 2),
        },
      ],
    };
  } catch (error) {
    return {
      content: [
        {
          type: 'text',
          text: `Error deleting task: ${error instanceof Error ? error.message : 'Unknown error'}`,
        },
      ],
      isError: true,
    };
  }
}

/**
 * Handle get_task tool call
 */
export async function handleGetTask(args: {
  id: string;
}): Promise<MCPToolResult> {
  try {
    const task = await getTask(args.id);

    if (!task) {
      return {
        content: [
          {
            type: 'text',
            text: `Task with ID ${args.id} not found`,
          },
        ],
        isError: true,
      };
    }

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(task, null, 2),
        },
      ],
    };
  } catch (error) {
    return {
      content: [
        {
          type: 'text',
          text: `Error getting task: ${error instanceof Error ? error.message : 'Unknown error'}`,
        },
      ],
      isError: true,
    };
  }
}

/**
 * Handle list_tasks tool call
 */
export async function handleListTasks(
  args: ListTasksArgs
): Promise<MCPToolResult> {
  try {
    let tasks = args.boardId
      ? await getTasksByBoard(args.boardId)
      : await getAllTasks();

    // Apply filters
    if (args.status) {
      tasks = tasks.filter(t => t.status === args.status);
    }
    if (args.priority) {
      tasks = tasks.filter(t => t.priority === args.priority);
    }

    // Apply limit
    if (args.limit && args.limit > 0) {
      tasks = tasks.slice(0, args.limit);
    }

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(
            {
              total: tasks.length,
              tasks,
            },
            null,
            2
          ),
        },
      ],
    };
  } catch (error) {
    return {
      content: [
        {
          type: 'text',
          text: `Error listing tasks: ${error instanceof Error ? error.message : 'Unknown error'}`,
        },
      ],
      isError: true,
    };
  }
}

/**
 * Handle complete_task tool call
 */
export async function handleCompleteTask(args: {
  id: string;
}): Promise<MCPToolResult> {
  try {
    const task = await updateTaskDB(args.id, {
      status: 'COMPLETED',
      completedAt: new Date().toISOString(),
    });

    if (!task) {
      return {
        content: [
          {
            type: 'text',
            text: `Task with ID ${args.id} not found`,
          },
        ],
        isError: true,
      };
    }

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(task, null, 2),
        },
      ],
    };
  } catch (error) {
    return {
      content: [
        {
          type: 'text',
          text: `Error completing task: ${error instanceof Error ? error.message : 'Unknown error'}`,
        },
      ],
      isError: true,
    };
  }
}

/**
 * Handle batch_update_tasks tool call
 * Week 7 Day 43-49: Performance optimization
 * Parallel batch processing for multiple task updates
 */
export async function handleBatchUpdateTasks(args: {
  updates: Array<{ taskId: string; updates: Record<string, unknown> }>;
}): Promise<MCPToolResult> {
  try {
    // Validate input
    if (
      !args.updates ||
      !Array.isArray(args.updates) ||
      args.updates.length === 0
    ) {
      return {
        content: [
          {
            type: 'text',
            text: 'Error: updates array is required and must not be empty',
          },
        ],
        isError: true,
      };
    }

    // Execute all updates in parallel
    const results = await Promise.allSettled(
      args.updates.map(({ taskId, updates }) => updateTaskDB(taskId, updates))
    );

    // Separate successful and failed updates
    const successful: any[] = [];
    const failed: Array<{ taskId: string; error: string }> = [];

    results.forEach((result, index) => {
      if (result.status === 'fulfilled' && result.value) {
        successful.push(result.value);
      } else {
        const error =
          result.status === 'rejected'
            ? result.reason instanceof Error
              ? result.reason.message
              : 'Unknown error'
            : 'Task not found';
        failed.push({
          taskId: args.updates[index].taskId,
          error,
        });
      }
    });

    const summary = {
      total: args.updates.length,
      successful: successful.length,
      failed: failed.length,
      successfulTasks: successful,
      failedUpdates: failed,
    };

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(summary, null, 2),
        },
      ],
      isError: failed.length > 0,
    };
  } catch (error) {
    return {
      content: [
        {
          type: 'text',
          text: `Error in batch update: ${error instanceof Error ? error.message : 'Unknown error'}`,
        },
      ],
      isError: true,
    };
  }
}
