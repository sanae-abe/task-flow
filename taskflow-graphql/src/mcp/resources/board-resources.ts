/**
 * MCP Board Resources Implementation
 * Provides read-only access to board data via MCP resources
 */

import { getBoard, getAllBoards } from '../../utils/indexeddb.js';

/**
 * Board resource definitions
 */
export const boardResources = [
  {
    uri: 'board://list',
    name: 'All Boards',
    description: 'List of all boards in the system',
    mimeType: 'application/json',
  },
  {
    uri: 'board://{id}',
    name: 'Board Details',
    description: 'Detailed information for a specific board including columns',
    mimeType: 'application/json',
  },
];

/**
 * Read board resource by URI
 */
export async function readBoardResource(uri: string): Promise<{
  contents: Array<{ uri: string; mimeType: string; text: string }>;
}> {
  // Parse URI
  if (uri === 'board://list') {
    const boards = await getAllBoards();
    return {
      contents: [
        {
          uri,
          mimeType: 'application/json',
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
  }

  // Match board://{id} pattern
  const boardIdMatch = uri.match(/^board:\/\/([^/]+)$/);
  if (boardIdMatch) {
    const boardId = boardIdMatch[1];
    const board = await getBoard(boardId);

    if (!board) {
      throw new Error(`Board with ID ${boardId} not found`);
    }

    return {
      contents: [
        {
          uri,
          mimeType: 'application/json',
          text: JSON.stringify(board, null, 2),
        },
      ],
    };
  }

  throw new Error(`Invalid board resource URI: ${uri}`);
}
