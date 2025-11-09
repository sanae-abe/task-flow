/**
 * PubSub for TaskFlow GraphQL Subscriptions
 * Event-driven real-time updates
 */
import { PubSub } from 'graphql-subscriptions';
export declare const pubsub: PubSub;
export declare const SUBSCRIPTION_TOPICS: {
    readonly TASK_CREATED: "TASK_CREATED";
    readonly TASK_UPDATED: "TASK_UPDATED";
    readonly TASK_COMPLETED: "TASK_COMPLETED";
    readonly TASK_DELETED: "TASK_DELETED";
    readonly BOARD_UPDATED: "BOARD_UPDATED";
    readonly AI_SUGGESTION_AVAILABLE: "AI_SUGGESTION_AVAILABLE";
};
export type SubscriptionTopic = (typeof SUBSCRIPTION_TOPICS)[keyof typeof SUBSCRIPTION_TOPICS];
/**
 * Publish event to subscription topic
 */
export declare function publishEvent<T>(topic: SubscriptionTopic, payload: T): Promise<void>;
/**
 * Subscribe to topic
 * Returns AsyncIterable for GraphQL subscriptions
 */
export declare function subscribe(topic: SubscriptionTopic): AsyncIterable<any>;
//# sourceMappingURL=pubsub.d.ts.map