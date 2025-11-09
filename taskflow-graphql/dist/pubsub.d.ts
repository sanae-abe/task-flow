/**
 * PubSub Implementation for GraphQL Subscriptions
 * Uses a simple in-memory event emitter for development
 * For production, consider Redis-based PubSub
 */
export declare enum PubSubEvent {
    TASK_CREATED = "TASK_CREATED",
    TASK_UPDATED = "TASK_UPDATED",
    TASK_COMPLETED = "TASK_COMPLETED",
    TASK_DELETED = "TASK_DELETED",
    BOARD_UPDATED = "BOARD_UPDATED",
    AI_SUGGESTION_AVAILABLE = "AI_SUGGESTION_AVAILABLE"
}
export interface TaskEventPayload {
    taskCreated?: any;
    taskUpdated?: any;
    taskCompleted?: any;
    taskDeleted?: any;
    boardId: string;
}
export interface BoardEventPayload {
    boardUpdated: any;
    boardId: string;
}
export interface AISuggestionEventPayload {
    aiSuggestionAvailable: any;
    boardId: string;
}
type EventPayload = TaskEventPayload | BoardEventPayload | AISuggestionEventPayload;
/**
 * Simple PubSub implementation using EventEmitter
 */
declare class PubSub {
    private eventEmitter;
    constructor();
    /**
     * Publish an event with payload
     */
    publish(event: PubSubEvent, payload: EventPayload): void;
    /**
     * Subscribe to an event and return an AsyncIterator
     */
    asyncIterator<T = any>(events: PubSubEvent | PubSubEvent[]): AsyncIterator<T>;
    /**
     * Remove all listeners for specific events
     */
    private removeAllListeners;
    /**
     * Get current listener count for debugging
     */
    listenerCount(event: PubSubEvent): number;
}
export declare const pubsub: PubSub;
export {};
//# sourceMappingURL=pubsub.d.ts.map