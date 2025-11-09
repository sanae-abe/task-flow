/**
 * Board Resolvers Unit Tests
 * Comprehensive test coverage for all Board-related queries, mutations, and field resolvers
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GraphQLError } from 'graphql';
import {
  boardQueries,
  boardMutations,
  boardFieldResolvers,
  boardSubscriptions,
} from '../../resolvers/board-resolvers.js';
import type { GraphQLContext } from '../../context.js';
import * as indexeddb from '../../utils/indexeddb.js';
import * as pubsub from '../../utils/pubsub.js';

// ============================================================================
// Mock Setup
// ============================================================================

vi.mock('../../utils/indexeddb.js', () => ({
  getBoard: vi.fn(),
  getAllBoards: vi.fn(),
  createBoard: vi.fn(),
  updateBoard: vi.fn(),
  deleteBoard: vi.fn(),
  getTasksByBoard: vi.fn(),
  getAllWebhooks: vi.fn(() => Promise.resolve([])), // Week 7: Add missing mock
  getAllTemplates: vi.fn(() => Promise.resolve([])), // Week 7: Add missing mock
}));

vi.mock('../../utils/pubsub.js', () => ({
  publishEvent: vi.fn(),
  subscribe: vi.fn(),
  SUBSCRIPTION_TOPICS: {
    BOARD_UPDATED: 'BOARD_UPDATED',
  },
}));

// ============================================================================
// Test Data
// ============================================================================

const mockBoard = {
  id: 'board-1',
  name: 'Test Board',
  description: 'Test board description',
  columns: [
    { id: 'column-1', name: 'To Do', position: 0, taskIds: [] },
    { id: 'column-2', name: 'In Progress', position: 1, taskIds: [] },
    { id: 'column-3', name: 'Done', position: 2, taskIds: [] },
  ],
  settings: {
    defaultColumn: 'column-1',
    completedColumnId: 'column-3',
    autoArchiveCompleted: false,
    recycleBinRetentionDays: 30,
  },
  isShared: false,
  createdAt: '2025-01-01T00:00:00Z',
  updatedAt: '2025-01-01T00:00:00Z',
};

const mockTask = {
  id: 'task-1',
  boardId: 'board-1',
  columnId: 'column-1',
  title: 'Test Task',
  status: 'TODO' as const,
};

const mockContext: GraphQLContext = {
  headers: {},
  loaders: {
    taskLoader: {
      load: vi.fn(),
      loadMany: vi.fn(),
      clear: vi.fn(),
      clearAll: vi.fn(),
      prime: vi.fn(),
    } as any,
    boardLoader: {
      load: vi.fn().mockResolvedValue(mockBoard),
      loadMany: vi.fn(),
      clear: vi.fn(),
      clearAll: vi.fn(),
      prime: vi.fn(),
    } as any,
    labelLoader: {
      load: vi.fn(),
      loadMany: vi.fn(),
      clear: vi.fn(),
      clearAll: vi.fn(),
      prime: vi.fn(),
    } as any,
    templateLoader: {
      load: vi.fn(),
      loadMany: vi.fn(),
      clear: vi.fn(),
      clearAll: vi.fn(),
      prime: vi.fn(),
    } as any,
  },
};

// ============================================================================
// Query Resolvers Tests
// ============================================================================

describe('Board Query Resolvers', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('board', () => {
    it('should return board by id using dataloader', async () => {
      const result = await boardQueries.board(
        {},
        { id: 'board-1' },
        mockContext
      );

      expect(mockContext.loaders.boardLoader.load).toHaveBeenCalledWith(
        'board-1'
      );
      expect(result).toEqual(mockBoard);
    });

    it('should return null for non-existent board', async () => {
      mockContext.loaders.boardLoader.load = vi.fn().mockResolvedValue(null);

      const result = await boardQueries.board(
        {},
        { id: 'non-existent' },
        mockContext
      );

      expect(result).toBeNull();
    });
  });

  describe('boards', () => {
    it('should return all boards', async () => {
      const boards = [mockBoard];
      vi.mocked(indexeddb.getAllBoards).mockResolvedValue(boards);

      const result = await boardQueries.boards({}, {}, mockContext);

      expect(indexeddb.getAllBoards).toHaveBeenCalled();
      expect(result).toEqual(boards);
    });

    it('should return empty array when no boards exist', async () => {
      vi.mocked(indexeddb.getAllBoards).mockResolvedValue([]);

      const result = await boardQueries.boards({}, {}, mockContext);

      expect(result).toEqual([]);
    });
  });

  describe('currentBoard', () => {
    it('should return first board as current board', async () => {
      const boards = [mockBoard];
      vi.mocked(indexeddb.getAllBoards).mockResolvedValue(boards);

      const result = await boardQueries.currentBoard({}, {}, mockContext);

      expect(result).toEqual(mockBoard);
    });

    it('should return null when no boards exist', async () => {
      vi.mocked(indexeddb.getAllBoards).mockResolvedValue([]);

      const result = await boardQueries.currentBoard({}, {}, mockContext);

      expect(result).toBeNull();
    });
  });
});

// ============================================================================
// Mutation Resolvers Tests
// ============================================================================

describe('Board Mutation Resolvers', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createBoard', () => {
    it('should create board with default columns', async () => {
      const input = {
        name: 'New Board',
        description: 'New board description',
      };
      vi.mocked(indexeddb.createBoard).mockResolvedValue(mockBoard);

      const result = await boardMutations.createBoard(
        {},
        { input },
        mockContext
      );

      expect(indexeddb.createBoard).toHaveBeenCalled();
      const callArgs = vi.mocked(indexeddb.createBoard).mock.calls[0][0];
      expect(callArgs.columns).toHaveLength(3);
      expect(callArgs.columns[0].name).toBe('To Do');
      expect(pubsub.publishEvent).toHaveBeenCalledWith(
        pubsub.SUBSCRIPTION_TOPICS.BOARD_UPDATED,
        { boardUpdated: mockBoard }
      );
      expect(result).toEqual(mockBoard);
    });

    it('should create board with custom columns', async () => {
      const input = {
        name: 'Custom Board',
        columns: [
          { title: 'Backlog', position: 0 },
          { title: 'Active', position: 1 },
        ],
      };
      vi.mocked(indexeddb.createBoard).mockResolvedValue(mockBoard);

      await boardMutations.createBoard({}, { input }, mockContext);

      const callArgs = vi.mocked(indexeddb.createBoard).mock.calls[0][0];
      expect(callArgs.columns).toHaveLength(2);
      expect(callArgs.columns[0].name).toBe('Backlog');
    });

    it('should handle null description', async () => {
      const input = {
        name: 'Board without description',
        description: null,
      };
      vi.mocked(indexeddb.createBoard).mockResolvedValue(mockBoard);

      await boardMutations.createBoard({}, { input }, mockContext);

      const callArgs = vi.mocked(indexeddb.createBoard).mock.calls[0][0];
      expect(callArgs.description).toBeUndefined();
    });
  });

  describe('updateBoard', () => {
    it('should update board name', async () => {
      const input = { name: 'Updated Board Name' };
      vi.mocked(indexeddb.updateBoard).mockResolvedValue({
        ...mockBoard,
        name: 'Updated Board Name',
      });

      const result = await boardMutations.updateBoard(
        {},
        { id: 'board-1', input },
        mockContext
      );

      expect(indexeddb.updateBoard).toHaveBeenCalledWith(
        'board-1',
        expect.objectContaining({
          name: 'Updated Board Name',
        })
      );
      expect(result.name).toBe('Updated Board Name');
    });

    it('should update board columns', async () => {
      const input = {
        columns: [
          { title: 'New Column 1', position: 0 },
          { title: 'New Column 2', position: 1 },
        ],
      };
      vi.mocked(indexeddb.updateBoard).mockResolvedValue(mockBoard);

      await boardMutations.updateBoard(
        {},
        { id: 'board-1', input },
        mockContext
      );

      const callArgs = vi.mocked(indexeddb.updateBoard).mock.calls[0][1];
      expect(callArgs.columns).toHaveLength(2);
      expect(callArgs.columns![0].name).toBe('New Column 1');
    });

    it('should update board settings', async () => {
      const input = {
        settings: {
          defaultColumnId: 'column-2',
          autoArchiveCompleted: true,
        },
      };
      vi.mocked(indexeddb.getBoard).mockResolvedValue(mockBoard);
      vi.mocked(indexeddb.updateBoard).mockResolvedValue({
        ...mockBoard,
        settings: {
          ...mockBoard.settings,
          defaultColumn: 'column-2',
          autoArchiveCompleted: true,
        },
      });

      const result = await boardMutations.updateBoard(
        {},
        { id: 'board-1', input },
        mockContext
      );

      expect(result.settings.defaultColumn).toBe('column-2');
      expect(result.settings.autoArchiveCompleted).toBe(true);
    });

    it('should throw error when board not found', async () => {
      const input = { name: 'Updated Name' };
      vi.mocked(indexeddb.updateBoard).mockResolvedValue(null);

      await expect(
        boardMutations.updateBoard(
          {},
          { id: 'non-existent', input },
          mockContext
        )
      ).rejects.toThrow(GraphQLError);
    });

    it('should throw error when board not found for settings update', async () => {
      const input = {
        settings: {
          defaultColumnId: 'column-2',
        },
      };
      vi.mocked(indexeddb.getBoard).mockResolvedValue(null);

      await expect(
        boardMutations.updateBoard(
          {},
          { id: 'non-existent', input },
          mockContext
        )
      ).rejects.toThrow(GraphQLError);
    });
  });

  describe('deleteBoard', () => {
    it('should delete board successfully', async () => {
      vi.mocked(indexeddb.getBoard).mockResolvedValue(mockBoard);
      vi.mocked(indexeddb.getTasksByBoard).mockResolvedValue([]);
      vi.mocked(indexeddb.deleteBoard).mockResolvedValue(undefined);

      const result = await boardMutations.deleteBoard(
        {},
        { id: 'board-1' },
        mockContext
      );

      expect(indexeddb.getTasksByBoard).toHaveBeenCalledWith('board-1');
      expect(indexeddb.deleteBoard).toHaveBeenCalledWith('board-1');
      expect(result).toBe(true);
    });

    it('should throw error when board not found', async () => {
      vi.mocked(indexeddb.getBoard).mockResolvedValue(null);

      await expect(
        boardMutations.deleteBoard({}, { id: 'non-existent' }, mockContext)
      ).rejects.toThrow(GraphQLError);
    });

    it('should throw error when board has tasks', async () => {
      vi.mocked(indexeddb.getBoard).mockResolvedValue(mockBoard);
      vi.mocked(indexeddb.getTasksByBoard).mockResolvedValue([mockTask] as any);

      await expect(
        boardMutations.deleteBoard({}, { id: 'board-1' }, mockContext)
      ).rejects.toThrow(GraphQLError);
      await expect(
        boardMutations.deleteBoard({}, { id: 'board-1' }, mockContext)
      ).rejects.toThrow('Cannot delete board with tasks');
    });
  });
});

// ============================================================================
// Field Resolvers Tests
// ============================================================================

describe('Board Field Resolvers', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('columns', () => {
    it('should return columns with task counts', async () => {
      const tasks = [
        { ...mockTask, columnId: 'column-1' },
        { ...mockTask, id: 'task-2', columnId: 'column-1' },
        { ...mockTask, id: 'task-3', columnId: 'column-2' },
      ];
      vi.mocked(indexeddb.getTasksByBoard).mockResolvedValue(tasks as any);

      const result = await boardFieldResolvers.columns(
        mockBoard,
        {},
        mockContext,
        {} as any
      );

      expect(result).toHaveLength(3);
      expect(result[0]).toHaveProperty('title', 'To Do');
      expect(result[0]).toHaveProperty('taskCount', 2);
      expect(result[1]).toHaveProperty('taskCount', 1);
      expect(result[2]).toHaveProperty('taskCount', 0);
    });

    it('should handle board with no tasks', async () => {
      vi.mocked(indexeddb.getTasksByBoard).mockResolvedValue([]);

      const result = await boardFieldResolvers.columns(
        mockBoard,
        {},
        mockContext,
        {} as any
      );

      expect(result).toHaveLength(3);
      result.forEach(column => {
        expect(column.taskCount).toBe(0);
      });
    });
  });

  describe('taskCount', () => {
    it('should count total tasks excluding deleted', async () => {
      const tasks = [
        { ...mockTask, status: 'TODO' as const },
        { ...mockTask, id: 'task-2', status: 'COMPLETED' as const },
        { ...mockTask, id: 'task-3', status: 'DELETED' as const },
      ];
      vi.mocked(indexeddb.getTasksByBoard).mockResolvedValue(tasks as any);

      const result = await boardFieldResolvers.taskCount(
        mockBoard,
        {},
        mockContext,
        {} as any
      );

      expect(result).toBe(2);
    });

    it('should return 0 when no tasks', async () => {
      vi.mocked(indexeddb.getTasksByBoard).mockResolvedValue([]);

      const result = await boardFieldResolvers.taskCount(
        mockBoard,
        {},
        mockContext,
        {} as any
      );

      expect(result).toBe(0);
    });
  });

  describe('completedTaskCount', () => {
    it('should count only completed tasks', async () => {
      const tasks = [
        { ...mockTask, status: 'TODO' as const },
        { ...mockTask, id: 'task-2', status: 'COMPLETED' as const },
        { ...mockTask, id: 'task-3', status: 'COMPLETED' as const },
      ];
      vi.mocked(indexeddb.getTasksByBoard).mockResolvedValue(tasks as any);

      const result = await boardFieldResolvers.completedTaskCount(
        mockBoard,
        {},
        mockContext,
        {} as any
      );

      expect(result).toBe(2);
    });

    it('should return 0 when no completed tasks', async () => {
      const tasks = [
        { ...mockTask, status: 'TODO' as const },
        { ...mockTask, id: 'task-2', status: 'IN_PROGRESS' as const },
      ];
      vi.mocked(indexeddb.getTasksByBoard).mockResolvedValue(tasks as any);

      const result = await boardFieldResolvers.completedTaskCount(
        mockBoard,
        {},
        mockContext,
        {} as any
      );

      expect(result).toBe(0);
    });
  });
});

// ============================================================================
// Subscription Resolvers Tests
// ============================================================================

describe('Board Subscription Resolvers', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('boardUpdated', () => {
    it('should subscribe to board updated events', () => {
      vi.mocked(pubsub.subscribe).mockReturnValue({} as any);

      boardSubscriptions.boardUpdated.subscribe(
        {},
        { boardId: 'board-1' },
        mockContext,
        {} as any
      );

      expect(pubsub.subscribe).toHaveBeenCalledWith(
        pubsub.SUBSCRIPTION_TOPICS.BOARD_UPDATED
      );
    });

    it('should subscribe without boardId filter', () => {
      vi.mocked(pubsub.subscribe).mockReturnValue({} as any);

      boardSubscriptions.boardUpdated.subscribe({}, {}, mockContext, {} as any);

      expect(pubsub.subscribe).toHaveBeenCalledWith(
        pubsub.SUBSCRIPTION_TOPICS.BOARD_UPDATED
      );
    });
  });
});
