/**
 * Template management MCP tools
 * Integrates with existing template resolvers
 */

import type { Tool } from '@modelcontextprotocol/sdk/types.js';
import {
  getAllTemplates,
  getTemplate,
  createTemplate,
  getBoard,
  createTask,
  updateTemplate,
  deleteTemplate,
} from '../../utils/indexeddb.js';
import type {
  TemplateRecord,
  TaskTemplateDataRecord,
} from '../../types/database.js';

/**
 * Template Tools Schema Definitions
 */
export const templateTools: Tool[] = [
  {
    name: 'create_template',
    description:
      'Create a reusable task template. Templates can be used to quickly create tasks with predefined properties.',
    inputSchema: {
      type: 'object',
      properties: {
        name: {
          type: 'string',
          description: 'Template name',
        },
        description: {
          type: 'string',
          description: 'Template description',
        },
        category: {
          type: 'string',
          description: 'Template category for organization',
        },
        isFavorite: {
          type: 'boolean',
          description: 'Mark as favorite template',
          default: false,
        },
        taskData: {
          type: 'object',
          description: 'Task properties to include in template',
          properties: {
            title: { type: 'string' },
            description: { type: 'string' },
            priority: {
              type: 'string',
              enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
            },
            labels: {
              type: 'array',
              items: { type: 'string' },
            },
            estimatedHours: { type: 'number' },
            subtasks: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  title: { type: 'string' },
                  completed: { type: 'boolean' },
                },
              },
            },
          },
        },
      },
      required: ['name', 'taskData'],
    },
  },
  {
    name: 'list_templates',
    description:
      'List all task templates. Can filter by category or favorite status.',
    inputSchema: {
      type: 'object',
      properties: {
        category: {
          type: 'string',
          description: 'Filter by category',
        },
        isFavorite: {
          type: 'boolean',
          description: 'Filter favorite templates only',
        },
      },
    },
  },
  {
    name: 'create_task_from_template',
    description:
      'Create a new task from an existing template. Applies all template properties to the new task.',
    inputSchema: {
      type: 'object',
      properties: {
        templateId: {
          type: 'string',
          description: 'The template ID to use',
        },
        boardId: {
          type: 'string',
          description: 'The board ID where task should be created',
        },
        columnId: {
          type: 'string',
          description: 'The column ID where task should be created',
        },
        overrides: {
          type: 'object',
          description: 'Optional property overrides',
          properties: {
            title: { type: 'string' },
            description: { type: 'string' },
            dueDate: { type: 'number' },
            priority: {
              type: 'string',
              enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
            },
          },
        },
      },
      required: ['templateId', 'boardId', 'columnId'],
    },
  },
  {
    name: 'update_template',
    description: 'Update an existing template',
    inputSchema: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
          description: 'Template ID',
        },
        name: { type: 'string' },
        description: { type: 'string' },
        category: { type: 'string' },
        isFavorite: { type: 'boolean' },
        taskData: { type: 'object' },
      },
      required: ['id'],
    },
  },
  {
    name: 'delete_template',
    description: 'Delete a template',
    inputSchema: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
          description: 'Template ID to delete',
        },
      },
      required: ['id'],
    },
  },
];

/**
 * Handler for create_template tool
 */
export async function handleCreateTemplate(args: {
  name: string;
  description?: string;
  category?: string;
  isFavorite?: boolean;
  taskData: Record<string, unknown>;
}): Promise<{ content: Array<{ type: string; text: string }> }> {
  try {
    const templateData: Omit<TemplateRecord, 'id' | 'createdAt' | 'updatedAt'> =
      {
        name: args.name,
        description: args.description,
        category: args.category,
        isFavorite: args.isFavorite || false,
        taskTemplate: args.taskData as unknown as TaskTemplateDataRecord,
      };

    const created = await createTemplate(templateData);

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(
            {
              success: true,
              template: {
                id: created.id,
                name: created.name,
                description: created.description,
                category: created.category,
                isFavorite: created.isFavorite,
                createdAt: created.createdAt,
              },
            },
            null,
            2
          ),
        },
      ],
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(
            {
              success: false,
              error: errorMessage,
            },
            null,
            2
          ),
        },
      ],
    };
  }
}

/**
 * Handler for list_templates tool
 */
export async function handleListTemplates(args: {
  category?: string;
  isFavorite?: boolean;
}): Promise<{ content: Array<{ type: string; text: string }> }> {
  try {
    let templates = await getAllTemplates();

    // Apply filters
    if (args.category) {
      templates = templates.filter(t => t.category === args.category);
    }
    if (args.isFavorite !== undefined) {
      templates = templates.filter(t => t.isFavorite === args.isFavorite);
    }

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(
            {
              success: true,
              count: templates.length,
              filters: {
                category: args.category,
                isFavorite: args.isFavorite,
              },
              templates: templates.map(t => ({
                id: t.id,
                name: t.name,
                description: t.description,
                category: t.category,
                isFavorite: t.isFavorite,
                createdAt: t.createdAt,
              })),
            },
            null,
            2
          ),
        },
      ],
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(
            {
              success: false,
              error: errorMessage,
            },
            null,
            2
          ),
        },
      ],
    };
  }
}

/**
 * Handler for create_task_from_template tool
 */
export async function handleCreateTaskFromTemplate(args: {
  templateId: string;
  boardId: string;
  columnId: string;
  overrides?: Record<string, unknown>;
}): Promise<{ content: Array<{ type: string; text: string }> }> {
  try {
    const template = await getTemplate(args.templateId);
    if (!template) {
      throw new Error(`Template not found: ${args.templateId}`);
    }

    const board = await getBoard(args.boardId);
    if (!board) {
      throw new Error(`Board not found: ${args.boardId}`);
    }

    const column = board.columns.find(
      (c: { id: string }) => c.id === args.columnId
    );
    if (!column) {
      throw new Error(`Column not found: ${args.columnId}`);
    }

    // Merge template data with overrides
    const taskData = {
      title: template.taskTemplate.title,
      description: template.taskTemplate.description,
      priority: template.taskTemplate.priority ?? 'MEDIUM',
      dueDate: template.taskTemplate.dueDate,
      labels: template.taskTemplate.labels ?? [],
      subtasks: template.taskTemplate.subtasks ?? [],
      recurrence: template.taskTemplate.recurrence,
      ...(args.overrides || {}),
      boardId: args.boardId,
      columnId: args.columnId,
      status: 'TODO' as const,
      position: 0,
      files: [],
    };

    const task = await createTask(taskData);

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(
            {
              success: true,
              template: {
                id: template.id,
                name: template.name,
              },
              task: {
                id: task.id,
                title: task.title,
                description: task.description,
                priority: task.priority,
                boardId: task.boardId,
                columnId: task.columnId,
              },
            },
            null,
            2
          ),
        },
      ],
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(
            {
              success: false,
              error: errorMessage,
            },
            null,
            2
          ),
        },
      ],
    };
  }
}

/**
 * Handler for update_template tool
 */
export async function handleUpdateTemplate(args: {
  id: string;
  name?: string;
  description?: string;
  category?: string;
  isFavorite?: boolean;
  taskData?: Record<string, unknown>;
}): Promise<{ content: Array<{ type: string; text: string }> }> {
  try {
    const template = await getTemplate(args.id);
    if (!template) {
      throw new Error(`Template not found: ${args.id}`);
    }

    const updates: Partial<TemplateRecord> = {};
    if (args.name !== undefined) updates.name = args.name;
    if (args.description !== undefined) updates.description = args.description;
    if (args.category !== undefined) updates.category = args.category;
    if (args.isFavorite !== undefined) updates.isFavorite = args.isFavorite;
    if (args.taskData !== undefined)
      updates.taskTemplate = args.taskData as unknown as TaskTemplateDataRecord;

    const updated = await updateTemplate(args.id, updates);

    if (!updated) {
      throw new Error(`Failed to update template: ${args.id}`);
    }

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(
            {
              success: true,
              template: {
                id: updated.id,
                name: updated.name,
                description: updated.description,
                category: updated.category,
                isFavorite: updated.isFavorite,
                updatedAt: updated.updatedAt,
              },
            },
            null,
            2
          ),
        },
      ],
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(
            {
              success: false,
              error: errorMessage,
            },
            null,
            2
          ),
        },
      ],
    };
  }
}

/**
 * Handler for delete_template tool
 */
export async function handleDeleteTemplate(args: {
  id: string;
}): Promise<{ content: Array<{ type: string; text: string }> }> {
  try {
    const template = await getTemplate(args.id);
    if (!template) {
      throw new Error(`Template not found: ${args.id}`);
    }

    await deleteTemplate(args.id);

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(
            {
              success: true,
              deletedTemplate: {
                id: template.id,
                name: template.name,
              },
            },
            null,
            2
          ),
        },
      ],
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(
            {
              success: false,
              error: errorMessage,
            },
            null,
            2
          ),
        },
      ],
    };
  }
}

/**
 * Main handler that routes tool calls
 */
export async function handleTemplateTool(
  toolName: string,
  args: Record<string, unknown>
): Promise<{ content: Array<{ type: string; text: string }> }> {
  switch (toolName) {
    case 'create_template':
      return handleCreateTemplate(
        args as {
          name: string;
          description?: string;
          category?: string;
          isFavorite?: boolean;
          taskData: Record<string, unknown>;
        }
      );
    case 'list_templates':
      return handleListTemplates(
        args as { category?: string; isFavorite?: boolean }
      );
    case 'create_task_from_template':
      return handleCreateTaskFromTemplate(
        args as {
          templateId: string;
          boardId: string;
          columnId: string;
          overrides?: Record<string, unknown>;
        }
      );
    case 'update_template':
      return handleUpdateTemplate(
        args as {
          id: string;
          name?: string;
          description?: string;
          category?: string;
          isFavorite?: boolean;
          taskData?: Record<string, unknown>;
        }
      );
    case 'delete_template':
      return handleDeleteTemplate(args as { id: string });
    default:
      throw new Error(`Unknown template tool: ${toolName}`);
  }
}
