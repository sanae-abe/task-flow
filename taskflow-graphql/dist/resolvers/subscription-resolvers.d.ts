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
import type { Task, Board, AISuggestion } from '../types/index.js';
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
export declare const subscriptionResolvers: {
    Subscription: {
        /**
         * Subscribe to task creation events
         * @param boardId - Optional filter by board ID
         */
        taskCreated: {
            subscribe: import("graphql-subscriptions").ResolverFn;
            resolve: (payload: TaskSubscriptionPayload) => Task | undefined;
        };
        /**
         * Subscribe to task update events
         * @param boardId - Optional filter by board ID
         */
        taskUpdated: {
            subscribe: import("graphql-subscriptions").ResolverFn;
            resolve: (payload: TaskSubscriptionPayload) => Task | undefined;
        };
        /**
         * Subscribe to task completion events
         * @param boardId - Optional filter by board ID
         */
        taskCompleted: {
            subscribe: import("graphql-subscriptions").ResolverFn;
            resolve: (payload: TaskSubscriptionPayload) => Task | undefined;
        };
        /**
         * Subscribe to task deletion events
         * @param boardId - Optional filter by board ID
         */
        taskDeleted: {
            subscribe: import("graphql-subscriptions").ResolverFn;
            resolve: (payload: TaskSubscriptionPayload) => Task | undefined;
        };
        /**
         * Subscribe to board update events
         * @param boardId - Optional filter by board ID
         */
        boardUpdated: {
            subscribe: import("graphql-subscriptions").ResolverFn;
            resolve: (payload: BoardSubscriptionPayload) => Board;
        };
        /**
         * Subscribe to AI suggestion events
         * @param boardId - Required filter by board ID (per schema)
         */
        aiSuggestionAvailable: {
            subscribe: import("graphql-subscriptions").ResolverFn;
            resolve: (payload: AISuggestionSubscriptionPayload) => AISuggestion;
        };
    };
};
/**
 * Publish task created event
 */
export declare const publishTaskCreated: (task: Task) => void;
/**
 * Publish task updated event
 */
export declare const publishTaskUpdated: (task: Task) => void;
/**
 * Publish task completed event
 */
export declare const publishTaskCompleted: (task: Task) => void;
/**
 * Publish task deleted event
 */
export declare const publishTaskDeleted: (task: Task) => void;
/**
 * Publish board updated event
 */
export declare const publishBoardUpdated: (board: Board) => void;
/**
 * Publish AI suggestion available event
 */
export declare const publishAISuggestion: (suggestion: AISuggestion, boardId: string) => void;
export {};
//# sourceMappingURL=subscription-resolvers.d.ts.map