/**
 * Subscription Resolvers Unit Tests
 * Comprehensive test coverage for all GraphQL subscription resolvers
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { subscriptionResolvers } from '../../resolvers/subscription-resolvers.js';
import { pubsub, PubSubEvent } from '../../pubsub.js';

// ============================================================================
// Mock Setup
// ============================================================================

vi.mock('../../pubsub.js', () => ({
  pubsub: {
    asyncIterator: vi.fn(),
    publish: vi.fn(),
  },
  PubSubEvent: {
    TASK_CREATED: 'TASK_CREATED',
    TASK_UPDATED: 'TASK_UPDATED',
    TASK_COMPLETED: 'TASK_COMPLETED',
    TASK_DELETED: 'TASK_DELETED',
    BOARD_UPDATED: 'BOARD_UPDATED',
    AI_SUGGESTION_AVAILABLE: 'AI_SUGGESTION_AVAILABLE',
  },
}));

// ============================================================================
// Test Data
// ============================================================================

const mockTask = {
  id: 'task-1',
  boardId: 'board-1',
  columnId: 'column-1',
  title: 'Test Task',
  description: 'Test description',
  status: 'TODO' as const,
  priority: 'MEDIUM' as const,
  labels: [],
  subtasks: [],
  files: [],
  position: 0,
  createdAt: '2025-01-01T00:00:00Z',
  updatedAt: '2025-01-01T00:00:00Z',
};

const mockBoard = {
  id: 'board-1',
  name: 'Test Board',
  description: 'Test board description',
  columns: [],
  settings: {
    defaultColumn: 'column-1',
    recycleBinRetentionDays: 30,
  },
  isShared: false,
  createdAt: '2025-01-01T00:00:00Z',
  updatedAt: '2025-01-01T00:00:00Z',
};

const mockAISuggestion = {
  id: 'suggestion-1',
  type: 'TASK_BREAKDOWN' as const,
  content: 'Break this task down',
  confidence: 0.95,
  metadata: {},
  createdAt: '2025-01-01T00:00:00Z',
};

// ============================================================================
// Subscription Resolver Tests
// ============================================================================

describe('Subscription Resolvers', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('taskCreated', () => {
    it('should have subscription resolver', () => {
      const subscription = subscriptionResolvers.Subscription.taskCreated;

      expect(subscription).toBeDefined();
      expect(subscription.resolve).toBeDefined();
    });

    it('should resolve task from payload', () => {
      const payload = {
        taskCreated: mockTask,
        boardId: 'board-1',
      };

      const subscription = subscriptionResolvers.Subscription.taskCreated;
      const result = subscription.resolve(payload);

      expect(result).toEqual(mockTask);
    });
  });

  describe('taskUpdated', () => {
    it('should have subscription resolver', () => {
      const subscription = subscriptionResolvers.Subscription.taskUpdated;

      expect(subscription).toBeDefined();
      expect(subscription.resolve).toBeDefined();
    });

    it('should resolve task from payload', () => {
      const payload = {
        taskUpdated: mockTask,
        boardId: 'board-1',
      };

      const subscription = subscriptionResolvers.Subscription.taskUpdated;
      const result = subscription.resolve(payload);

      expect(result).toEqual(mockTask);
    });
  });

  describe('taskCompleted', () => {
    it('should have subscription resolver', () => {
      const subscription = subscriptionResolvers.Subscription.taskCompleted;

      expect(subscription).toBeDefined();
      expect(subscription.resolve).toBeDefined();
    });

    it('should resolve task from payload', () => {
      const completedTask = { ...mockTask, status: 'COMPLETED' as const };
      const payload = {
        taskCompleted: completedTask,
        boardId: 'board-1',
      };

      const subscription = subscriptionResolvers.Subscription.taskCompleted;
      const result = subscription.resolve(payload);

      expect(result).toEqual(completedTask);
    });
  });

  describe('taskDeleted', () => {
    it('should have subscription resolver', () => {
      const subscription = subscriptionResolvers.Subscription.taskDeleted;

      expect(subscription).toBeDefined();
      expect(subscription.resolve).toBeDefined();
    });

    it('should resolve task from payload', () => {
      const deletedTask = { ...mockTask, status: 'DELETED' as const };
      const payload = {
        taskDeleted: deletedTask,
        boardId: 'board-1',
      };

      const subscription = subscriptionResolvers.Subscription.taskDeleted;
      const result = subscription.resolve(payload);

      expect(result).toEqual(deletedTask);
    });
  });

  describe('boardUpdated', () => {
    it('should have subscription resolver', () => {
      const subscription = subscriptionResolvers.Subscription.boardUpdated;

      expect(subscription).toBeDefined();
      expect(subscription.resolve).toBeDefined();
    });

    it('should resolve board from payload', () => {
      const payload = {
        boardUpdated: mockBoard,
        boardId: 'board-1',
      };

      const subscription = subscriptionResolvers.Subscription.boardUpdated;
      const result = subscription.resolve(payload);

      expect(result).toEqual(mockBoard);
    });
  });

  describe('aiSuggestionAvailable', () => {
    it('should have subscription resolver', () => {
      const subscription =
        subscriptionResolvers.Subscription.aiSuggestionAvailable;

      expect(subscription).toBeDefined();
      expect(subscription.resolve).toBeDefined();
    });

    it('should resolve AI suggestion from payload', () => {
      const payload = {
        aiSuggestionAvailable: mockAISuggestion,
        boardId: 'board-1',
      };

      const subscription =
        subscriptionResolvers.Subscription.aiSuggestionAvailable;
      const result = subscription.resolve(payload);

      expect(result).toEqual(mockAISuggestion);
    });
  });
});

// ============================================================================
// Helper Function Tests
// ============================================================================

describe('Subscription Helper Functions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should be exported from subscription-resolvers module', async () => {
    const module = await import('../../resolvers/subscription-resolvers.js');

    expect(module.publishTaskCreated).toBeDefined();
    expect(module.publishTaskUpdated).toBeDefined();
    expect(module.publishTaskCompleted).toBeDefined();
    expect(module.publishTaskDeleted).toBeDefined();
    expect(module.publishBoardUpdated).toBeDefined();
    expect(module.publishAISuggestion).toBeDefined();
  });

  describe('publishTaskCreated', () => {
    it('should publish task created event with correct payload', async () => {
      const { publishTaskCreated } = await import(
        '../../resolvers/subscription-resolvers.js'
      );

      publishTaskCreated(mockTask as any);

      expect(pubsub.publish).toHaveBeenCalledWith(PubSubEvent.TASK_CREATED, {
        taskCreated: mockTask,
        boardId: mockTask.boardId,
      });
    });
  });

  describe('publishTaskUpdated', () => {
    it('should publish task updated event with correct payload', async () => {
      const { publishTaskUpdated } = await import(
        '../../resolvers/subscription-resolvers.js'
      );

      publishTaskUpdated(mockTask as any);

      expect(pubsub.publish).toHaveBeenCalledWith(PubSubEvent.TASK_UPDATED, {
        taskUpdated: mockTask,
        boardId: mockTask.boardId,
      });
    });
  });

  describe('publishTaskCompleted', () => {
    it('should publish task completed event with correct payload', async () => {
      const { publishTaskCompleted } = await import(
        '../../resolvers/subscription-resolvers.js'
      );
      const completedTask = { ...mockTask, status: 'COMPLETED' as const };

      publishTaskCompleted(completedTask as any);

      expect(pubsub.publish).toHaveBeenCalledWith(PubSubEvent.TASK_COMPLETED, {
        taskCompleted: completedTask,
        boardId: completedTask.boardId,
      });
    });
  });

  describe('publishTaskDeleted', () => {
    it('should publish task deleted event with correct payload', async () => {
      const { publishTaskDeleted } = await import(
        '../../resolvers/subscription-resolvers.js'
      );
      const deletedTask = { ...mockTask, status: 'DELETED' as const };

      publishTaskDeleted(deletedTask as any);

      expect(pubsub.publish).toHaveBeenCalledWith(PubSubEvent.TASK_DELETED, {
        taskDeleted: deletedTask,
        boardId: deletedTask.boardId,
      });
    });
  });

  describe('publishBoardUpdated', () => {
    it('should publish board updated event with correct payload', async () => {
      const { publishBoardUpdated } = await import(
        '../../resolvers/subscription-resolvers.js'
      );

      publishBoardUpdated(mockBoard as any);

      expect(pubsub.publish).toHaveBeenCalledWith(PubSubEvent.BOARD_UPDATED, {
        boardUpdated: mockBoard,
        boardId: mockBoard.id,
      });
    });
  });

  describe('publishAISuggestion', () => {
    it('should publish AI suggestion event with correct payload', async () => {
      const { publishAISuggestion } = await import(
        '../../resolvers/subscription-resolvers.js'
      );

      publishAISuggestion(mockAISuggestion as any, 'board-1');

      expect(pubsub.publish).toHaveBeenCalledWith(
        PubSubEvent.AI_SUGGESTION_AVAILABLE,
        {
          aiSuggestionAvailable: mockAISuggestion,
          boardId: 'board-1',
        }
      );
    });
  });
});
