/**
 * Export MCP tools for TaskFlow
 * Provides Markdown export functionality for boards and tasks
 */

import type { Tool } from '@modelcontextprotocol/sdk/types.js';
import {
  getBoard,
  getAllLabels,
  getTasksByBoard,
} from '../../utils/indexeddb.js';
import {
  generateBoardMarkdown,
  MarkdownFormat,
  type MarkdownGeneratorOptions,
} from '../../utils/markdown-generator.js';

/**
 * Export Tools Schema Definitions
 */
export const exportTools: Tool[] = [
  {
    name: 'export_board_as_markdown',
    description:
      'Export a board as Markdown document. Supports multiple formats including Standard Markdown, GitHub-flavored Markdown, and Obsidian-compatible Markdown.',
    inputSchema: {
      type: 'object',
      properties: {
        boardId: {
          type: 'string',
          description: 'The board ID to export',
        },
        format: {
          type: 'string',
          enum: ['STANDARD', 'GITHUB_FLAVORED', 'OBSIDIAN'],
          description: 'Markdown format to use',
          default: 'STANDARD',
        },
        options: {
          type: 'object',
          description: 'Export options',
          properties: {
            includeSubtasks: {
              type: 'boolean',
              description: 'Include subtasks in export',
              default: true,
            },
            includeLabels: {
              type: 'boolean',
              description: 'Include labels in export',
              default: true,
            },
            includeAttachments: {
              type: 'boolean',
              description: 'Include attachment information',
              default: true,
            },
            includeMetadata: {
              type: 'boolean',
              description: 'Include statistics and metadata',
              default: true,
            },
          },
        },
      },
      required: ['boardId'],
    },
  },
];

/**
 * Handler for export_board_as_markdown tool
 */
export async function handleExportBoardAsMarkdown(args: {
  boardId: string;
  format?: string;
  options?: MarkdownGeneratorOptions;
}): Promise<{ content: Array<{ type: string; text: string }> }> {
  try {
    const board = await getBoard(args.boardId);
    if (!board) {
      throw new Error(`Board not found: ${args.boardId}`);
    }

    const tasks = await getTasksByBoard(args.boardId);
    const labels = await getAllLabels();

    // Convert format string to enum
    const format =
      args.format && args.format in MarkdownFormat
        ? (MarkdownFormat[
            args.format as keyof typeof MarkdownFormat
          ] as MarkdownFormat)
        : MarkdownFormat.STANDARD;

    const options: MarkdownGeneratorOptions = {
      format,
      includeSubtasks: args.options?.includeSubtasks ?? true,
      includeLabels: args.options?.includeLabels ?? true,
      includeAttachments: args.options?.includeAttachments ?? true,
      includeMetadata: args.options?.includeMetadata ?? true,
    };

    const markdown = generateBoardMarkdown(board, tasks, labels, options);

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(
            {
              success: true,
              board: {
                id: board.id,
                name: board.name,
              },
              export: {
                format: args.format || 'STANDARD',
                taskCount: tasks.length,
                columnCount: board.columns.length,
                labelCount: labels.length,
                sizeBytes: new Blob([markdown]).size,
              },
              markdown,
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
export async function handleExportTool(
  toolName: string,
  args: Record<string, unknown>
): Promise<{ content: Array<{ type: string; text: string }> }> {
  switch (toolName) {
    case 'export_board_as_markdown':
      return handleExportBoardAsMarkdown(
        args as {
          boardId: string;
          format?: string;
          options?: MarkdownGeneratorOptions;
        }
      );
    default:
      throw new Error(`Unknown export tool: ${toolName}`);
  }
}
