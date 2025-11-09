/**
 * PubSub for TaskFlow GraphQL Subscriptions
 * Event-driven real-time updates
 */
import { PubSub } from 'graphql-subscriptions';
// Create singleton PubSub instance
export const pubsub = new PubSub();
// Subscription topics
export const SUBSCRIPTION_TOPICS = {
    TASK_CREATED: 'TASK_CREATED',
    TASK_UPDATED: 'TASK_UPDATED',
    TASK_COMPLETED: 'TASK_COMPLETED',
    TASK_DELETED: 'TASK_DELETED',
    BOARD_UPDATED: 'BOARD_UPDATED',
    AI_SUGGESTION_AVAILABLE: 'AI_SUGGESTION_AVAILABLE',
};
/**
 * Publish event to subscription topic
 */
export async function publishEvent(topic, payload) {
    await pubsub.publish(topic, payload);
}
/**
 * Subscribe to topic
 * Returns AsyncIterable for GraphQL subscriptions
 */
export function subscribe(topic) {
    const iterator = pubsub.asyncIterator([topic]);
    // Wrap AsyncIterator to make it AsyncIterable
    return {
        [Symbol.asyncIterator]() {
            return iterator;
        },
    };
}
//# sourceMappingURL=pubsub.js.map