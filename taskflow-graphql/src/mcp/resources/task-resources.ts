/**
 * MCP Task Resources Implementation
 * Provides read-only access to task data via MCP resources
 */

import {
  getTask,
  getAllTasks,
  getTasksByBoard,
} from '../../utils/indexeddb.js';

/**
 * Task resource definitions
 */
export const taskResources = [
  {
    uri: 'task://list',
    name: 'All Tasks',
    description: 'List of all tasks in the system',
    mimeType: 'application/json',
  },
  {
    uri: 'task://{id}',
    name: 'Task Details',
    description: 'Detailed information for a specific task',
    mimeType: 'application/json',
  },
  {
    uri: 'task://board/{boardId}',
    name: 'Board Tasks',
    description: 'List of tasks for a specific board',
    mimeType: 'application/json',
  },
];

/**
 * Read task resource by URI
 */
export async function readTaskResource(uri: string): Promise<{
  contents: Array<{ uri: string; mimeType: string; text: string }>;
}> {
  // Parse URI
  if (uri === 'task://list') {
    const tasks = await getAllTasks();
    return {
      contents: [
        {
          uri,
          mimeType: 'application/json',
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
  }

  // Match task://{id} pattern
  const taskIdMatch = uri.match(/^task:\/\/([^/]+)$/);
  if (taskIdMatch) {
    const taskId = taskIdMatch[1];
    const task = await getTask(taskId);

    if (!task) {
      throw new Error(`Task with ID ${taskId} not found`);
    }

    return {
      contents: [
        {
          uri,
          mimeType: 'application/json',
          text: JSON.stringify(task, null, 2),
        },
      ],
    };
  }

  // Match task://board/{boardId} pattern
  const boardMatch = uri.match(/^task:\/\/board\/(.+)$/);
  if (boardMatch) {
    const boardId = boardMatch[1];
    const tasks = await getTasksByBoard(boardId);

    return {
      contents: [
        {
          uri,
          mimeType: 'application/json',
          text: JSON.stringify(
            {
              boardId,
              total: tasks.length,
              tasks,
            },
            null,
            2
          ),
        },
      ],
    };
  }

  throw new Error(`Invalid task resource URI: ${uri}`);
}
