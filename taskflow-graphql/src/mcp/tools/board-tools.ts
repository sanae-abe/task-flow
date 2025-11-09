/**
 * MCP Board Tools Implementation
 * Provides board management operations via MCP
 */

import {
  getBoard,
  getAllBoards,
  createBoard as createBoardDB,
  updateBoard as updateBoardDB,
} from '../../utils/indexeddb.js';
import type {
  MCPToolResult,
  CreateBoardArgs,
  UpdateBoardArgs,
} from '../types.js';

/**
 * Tool definitions for Board operations
 */
export const boardTools = [
  {
    name: 'create_board',
    description: 'Create a new board in TaskFlow',
    inputSchema: {
      type: 'object',
      properties: {
        name: {
          type: 'string',
          description: 'Board name (required)',
        },
        description: {
          type: 'string',
          description: 'Board description (optional)',
        },
      },
      required: ['name'],
    },
  },
  {
    name: 'list_boards',
    description: 'List all boards',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: 'get_board',
    description: 'Get a specific board by ID',
    inputSchema: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
          description: 'Board ID (required)',
        },
      },
      required: ['id'],
    },
  },
  {
    name: 'update_board',
    description: 'Update an existing board',
    inputSchema: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
          description: 'Board ID (required)',
        },
        name: {
          type: 'string',
          description: 'New board name (optional)',
        },
        description: {
          type: 'string',
          description: 'New board description (optional)',
        },
      },
      required: ['id'],
    },
  },
];

/**
 * Handle create_board tool call
 */
export async function handleCreateBoard(
  args: CreateBoardArgs
): Promise<MCPToolResult> {
  try {
    const board = await createBoardDB({
      name: args.name,
      description: args.description || '',
      columns: [
        { id: `col-${Date.now()}-1`, name: 'To Do', position: 0, taskIds: [] },
        {
          id: `col-${Date.now()}-2`,
          name: 'In Progress',
          position: 1,
          taskIds: [],
        },
        { id: `col-${Date.now()}-3`, name: 'Done', position: 2, taskIds: [] },
      ],
      settings: {
        defaultColumn: `col-${Date.now()}-1`,
      },
      isShared: false,
    });

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(board, null, 2),
        },
      ],
    };
  } catch (error) {
    return {
      content: [
        {
          type: 'text',
          text: `Error creating board: ${error instanceof Error ? error.message : 'Unknown error'}`,
        },
      ],
      isError: true,
    };
  }
}

/**
 * Handle list_boards tool call
 */
export async function handleListBoards(): Promise<MCPToolResult> {
  try {
    const boards = await getAllBoards();

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(
            {
              total: boards.length,
              boards,
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
          text: `Error listing boards: ${error instanceof Error ? error.message : 'Unknown error'}`,
        },
      ],
      isError: true,
    };
  }
}

/**
 * Handle get_board tool call
 */
export async function handleGetBoard(args: {
  id: string;
}): Promise<MCPToolResult> {
  try {
    const board = await getBoard(args.id);

    if (!board) {
      return {
        content: [
          {
            type: 'text',
            text: `Board with ID ${args.id} not found`,
          },
        ],
        isError: true,
      };
    }

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(board, null, 2),
        },
      ],
    };
  } catch (error) {
    return {
      content: [
        {
          type: 'text',
          text: `Error getting board: ${error instanceof Error ? error.message : 'Unknown error'}`,
        },
      ],
      isError: true,
    };
  }
}

/**
 * Handle update_board tool call
 */
export async function handleUpdateBoard(
  args: UpdateBoardArgs
): Promise<MCPToolResult> {
  try {
    const updates: Record<string, unknown> = {};

    if (args.name !== undefined) updates.name = args.name;
    if (args.description !== undefined) updates.description = args.description;

    const board = await updateBoardDB(args.id, updates);

    if (!board) {
      return {
        content: [
          {
            type: 'text',
            text: `Board with ID ${args.id} not found`,
          },
        ],
        isError: true,
      };
    }

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(board, null, 2),
        },
      ],
    };
  } catch (error) {
    return {
      content: [
        {
          type: 'text',
          text: `Error updating board: ${error instanceof Error ? error.message : 'Unknown error'}`,
        },
      ],
      isError: true,
    };
  }
}
