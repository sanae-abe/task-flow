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
// ============================================================================
// Filter Functions
// ============================================================================
/**
 * Filter function for task subscriptions
 * Filters by boardId if provided in subscription args
 */
const taskBoardFilter = (payload, variables) => {
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
const boardFilter = (payload, variables) => {
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
const aiSuggestionFilter = (payload, variables) => 
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
            subscribe: withFilter(() => pubsub.asyncIterator(PubSubEvent.TASK_CREATED), taskBoardFilter),
            resolve: (payload) => payload.taskCreated,
        },
        /**
         * Subscribe to task update events
         * @param boardId - Optional filter by board ID
         */
        taskUpdated: {
            subscribe: withFilter(() => pubsub.asyncIterator(PubSubEvent.TASK_UPDATED), taskBoardFilter),
            resolve: (payload) => payload.taskUpdated,
        },
        /**
         * Subscribe to task completion events
         * @param boardId - Optional filter by board ID
         */
        taskCompleted: {
            subscribe: withFilter(() => pubsub.asyncIterator(PubSubEvent.TASK_COMPLETED), taskBoardFilter),
            resolve: (payload) => payload.taskCompleted,
        },
        /**
         * Subscribe to task deletion events
         * @param boardId - Optional filter by board ID
         */
        taskDeleted: {
            subscribe: withFilter(() => pubsub.asyncIterator(PubSubEvent.TASK_DELETED), taskBoardFilter),
            resolve: (payload) => payload.taskDeleted,
        },
        /**
         * Subscribe to board update events
         * @param boardId - Optional filter by board ID
         */
        boardUpdated: {
            subscribe: withFilter(() => pubsub.asyncIterator(PubSubEvent.BOARD_UPDATED), boardFilter),
            resolve: (payload) => payload.boardUpdated,
        },
        /**
         * Subscribe to AI suggestion events
         * @param boardId - Required filter by board ID (per schema)
         */
        aiSuggestionAvailable: {
            subscribe: withFilter(() => pubsub.asyncIterator(PubSubEvent.AI_SUGGESTION_AVAILABLE), aiSuggestionFilter),
            resolve: (payload) => payload.aiSuggestionAvailable,
        },
    },
};
// ============================================================================
// Helper Functions for Publishing Events (to be used by mutations)
// ============================================================================
/**
 * Publish task created event
 */
export const publishTaskCreated = (task) => {
    pubsub.publish(PubSubEvent.TASK_CREATED, {
        taskCreated: task,
        boardId: task.boardId,
    });
};
/**
 * Publish task updated event
 */
export const publishTaskUpdated = (task) => {
    pubsub.publish(PubSubEvent.TASK_UPDATED, {
        taskUpdated: task,
        boardId: task.boardId,
    });
};
/**
 * Publish task completed event
 */
export const publishTaskCompleted = (task) => {
    pubsub.publish(PubSubEvent.TASK_COMPLETED, {
        taskCompleted: task,
        boardId: task.boardId,
    });
};
/**
 * Publish task deleted event
 */
export const publishTaskDeleted = (task) => {
    pubsub.publish(PubSubEvent.TASK_DELETED, {
        taskDeleted: task,
        boardId: task.boardId,
    });
};
/**
 * Publish board updated event
 */
export const publishBoardUpdated = (board) => {
    pubsub.publish(PubSubEvent.BOARD_UPDATED, {
        boardUpdated: board,
        boardId: board.id,
    });
};
/**
 * Publish AI suggestion available event
 */
export const publishAISuggestion = (suggestion, boardId) => {
    pubsub.publish(PubSubEvent.AI_SUGGESTION_AVAILABLE, {
        aiSuggestionAvailable: suggestion,
        boardId,
    });
};
//# sourceMappingURL=subscription-resolvers.js.map