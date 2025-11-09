/**
 * GraphQL Subscription Resolvers
 * Real-time event subscriptions for TaskFlow
 *
 * Features:
 * - Task lifecycle events (created, updated, completed, deleted)
 * - Board update events
 * - AI suggestion notifications
 * - Optional boardId filtering for all subscriptions
 */

import { withFilter } from 'graphql-subscriptions';
import { pubsub, PubSubEvent } from '../pubsub.js';
import type { Task, Board, AISuggestion } from '../types/index.js';

// ============================================================================
// Subscription Payload Types
// ============================================================================

interface TaskSubscriptionPayload {
  taskCreated?: Task;
  taskUpdated?: Task;
  taskCompleted?: Task;
  taskDeleted?: Task;
  boardId: string;
}

interface BoardSubscriptionPayload {
  boardUpdated: Board;
  boardId: string;
}

interface AISuggestionSubscriptionPayload {
  aiSuggestionAvailable: AISuggestion;
  boardId: string;
}

// ============================================================================
// Filter Functions
// ============================================================================

/**
 * Filter function for task subscriptions
 * Filters by boardId if provided in subscription args
 */
const taskBoardFilter = (
  payload: TaskSubscriptionPayload,
  variables: { boardId?: string }
): boolean => {
  // If no boardId filter specified, allow all events
  if (!variables.boardId) {
    return true;
  }
  // Filter by boardId
  return payload.boardId === variables.boardId;
};

/**
 * Filter function for board subscriptions
 * Filters by boardId if provided in subscription args
 */
const boardFilter = (
  payload: BoardSubscriptionPayload,
  variables: { boardId?: string }
): boolean => {
  // If no boardId filter specified, allow all events
  if (!variables.boardId) {
    return true;
  }
  // Filter by boardId
  return payload.boardId === variables.boardId;
};

/**
 * Filter function for AI suggestion subscriptions
 * ALWAYS requires boardId (per schema requirement)
 */
const aiSuggestionFilter = (
  payload: AISuggestionSubscriptionPayload,
  variables: { boardId: string }
): boolean =>
  // boardId is required for AI suggestions
  payload.boardId === variables.boardId;
// ============================================================================
// Subscription Resolvers
// ============================================================================

export const subscriptionResolvers = {
  Subscription: {
    /**
     * Subscribe to task creation events
     * @param boardId - Optional filter by board ID
     */
    taskCreated: {
      subscribe: withFilter(
        () =>
          pubsub.asyncIterator<TaskSubscriptionPayload>(
            PubSubEvent.TASK_CREATED
          ),
        taskBoardFilter
      ),
      resolve: (payload: TaskSubscriptionPayload) => payload.taskCreated,
    },

    /**
     * Subscribe to task update events
     * @param boardId - Optional filter by board ID
     */
    taskUpdated: {
      subscribe: withFilter(
        () =>
          pubsub.asyncIterator<TaskSubscriptionPayload>(
            PubSubEvent.TASK_UPDATED
          ),
        taskBoardFilter
      ),
      resolve: (payload: TaskSubscriptionPayload) => payload.taskUpdated,
    },

    /**
     * Subscribe to task completion events
     * @param boardId - Optional filter by board ID
     */
    taskCompleted: {
      subscribe: withFilter(
        () =>
          pubsub.asyncIterator<TaskSubscriptionPayload>(
            PubSubEvent.TASK_COMPLETED
          ),
        taskBoardFilter
      ),
      resolve: (payload: TaskSubscriptionPayload) => payload.taskCompleted,
    },

    /**
     * Subscribe to task deletion events
     * @param boardId - Optional filter by board ID
     */
    taskDeleted: {
      subscribe: withFilter(
        () =>
          pubsub.asyncIterator<TaskSubscriptionPayload>(
            PubSubEvent.TASK_DELETED
          ),
        taskBoardFilter
      ),
      resolve: (payload: TaskSubscriptionPayload) => payload.taskDeleted,
    },

    /**
     * Subscribe to board update events
     * @param boardId - Optional filter by board ID
     */
    boardUpdated: {
      subscribe: withFilter(
        () =>
          pubsub.asyncIterator<BoardSubscriptionPayload>(
            PubSubEvent.BOARD_UPDATED
          ),
        boardFilter
      ),
      resolve: (payload: BoardSubscriptionPayload) => payload.boardUpdated,
    },

    /**
     * Subscribe to AI suggestion events
     * @param boardId - Required filter by board ID (per schema)
     */
    aiSuggestionAvailable: {
      subscribe: withFilter(
        () =>
          pubsub.asyncIterator<AISuggestionSubscriptionPayload>(
            PubSubEvent.AI_SUGGESTION_AVAILABLE
          ),
        aiSuggestionFilter
      ),
      resolve: (payload: AISuggestionSubscriptionPayload) =>
        payload.aiSuggestionAvailable,
    },
  },
};

// ============================================================================
// Helper Functions for Publishing Events (to be used by mutations)
// ============================================================================

/**
 * Publish task created event
 */
export const publishTaskCreated = (task: Task): void => {
  pubsub.publish(PubSubEvent.TASK_CREATED, {
    taskCreated: task,
    boardId: task.boardId,
  });
};

/**
 * Publish task updated event
 */
export const publishTaskUpdated = (task: Task): void => {
  pubsub.publish(PubSubEvent.TASK_UPDATED, {
    taskUpdated: task,
    boardId: task.boardId,
  });
};

/**
 * Publish task completed event
 */
export const publishTaskCompleted = (task: Task): void => {
  pubsub.publish(PubSubEvent.TASK_COMPLETED, {
    taskCompleted: task,
    boardId: task.boardId,
  });
};

/**
 * Publish task deleted event
 */
export const publishTaskDeleted = (task: Task): void => {
  pubsub.publish(PubSubEvent.TASK_DELETED, {
    taskDeleted: task,
    boardId: task.boardId,
  });
};

/**
 * Publish board updated event
 */
export const publishBoardUpdated = (board: Board): void => {
  pubsub.publish(PubSubEvent.BOARD_UPDATED, {
    boardUpdated: board,
    boardId: board.id,
  });
};

/**
 * Publish AI suggestion available event
 */
export const publishAISuggestion = (
  suggestion: AISuggestion,
  boardId: string
): void => {
  pubsub.publish(PubSubEvent.AI_SUGGESTION_AVAILABLE, {
    aiSuggestionAvailable: suggestion,
    boardId,
  });
};
