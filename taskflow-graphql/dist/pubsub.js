/**
 * PubSub Implementation for GraphQL Subscriptions
 * Uses a simple in-memory event emitter for development
 * For production, consider Redis-based PubSub
 */
import { EventEmitter } from 'events';
// Event types
export var PubSubEvent;
(function (PubSubEvent) {
    PubSubEvent["TASK_CREATED"] = "TASK_CREATED";
    PubSubEvent["TASK_UPDATED"] = "TASK_UPDATED";
    PubSubEvent["TASK_COMPLETED"] = "TASK_COMPLETED";
    PubSubEvent["TASK_DELETED"] = "TASK_DELETED";
    PubSubEvent["BOARD_UPDATED"] = "BOARD_UPDATED";
    PubSubEvent["AI_SUGGESTION_AVAILABLE"] = "AI_SUGGESTION_AVAILABLE";
})(PubSubEvent || (PubSubEvent = {}));
/**
 * Simple PubSub implementation using EventEmitter
 */
class PubSub {
    eventEmitter;
    constructor() {
        this.eventEmitter = new EventEmitter();
        // Increase max listeners to avoid warnings
        this.eventEmitter.setMaxListeners(100);
    }
    /**
     * Publish an event with payload
     */
    publish(event, payload) {
        this.eventEmitter.emit(event, payload);
    }
    /**
     * Subscribe to an event and return an AsyncIterator
     */
    asyncIterator(events) {
        const eventArray = Array.isArray(events) ? events : [events];
        const pullQueue = [];
        const pushQueue = [];
        let listening = true;
        const pushValue = (payload) => {
            if (pullQueue.length !== 0) {
                const resolver = pullQueue.shift();
                if (resolver) {
                    resolver({ value: payload, done: false });
                }
            }
            else {
                pushQueue.push(payload);
            }
        };
        const pullValue = () => new Promise(resolve => {
            if (pushQueue.length !== 0) {
                const value = pushQueue.shift();
                if (value) {
                    resolve({ value, done: false });
                }
            }
            else {
                pullQueue.push(resolve);
            }
        });
        const emptyQueue = () => {
            if (listening) {
                listening = false;
                this.removeAllListeners(eventArray);
                pullQueue.forEach(resolve => resolve({ value: undefined, done: true }));
                pullQueue.length = 0;
                pushQueue.length = 0;
            }
        };
        const addEventListeners = () => {
            eventArray.forEach(event => {
                this.eventEmitter.on(event, pushValue);
            });
        };
        addEventListeners();
        const iterator = {
            next() {
                return listening ? pullValue() : iterator.return();
            },
            return() {
                emptyQueue();
                return Promise.resolve({ value: undefined, done: true });
            },
            throw(error) {
                emptyQueue();
                return Promise.reject(error);
            },
        };
        return {
            ...iterator,
            [Symbol.asyncIterator]() {
                return this;
            },
        };
    }
    /**
     * Remove all listeners for specific events
     */
    removeAllListeners(events) {
        events.forEach(event => {
            this.eventEmitter.removeAllListeners(event);
        });
    }
    /**
     * Get current listener count for debugging
     */
    listenerCount(event) {
        return this.eventEmitter.listenerCount(event);
    }
}
// Singleton instance
export const pubsub = new PubSub();
//# sourceMappingURL=pubsub.js.map