/**
 * PubSub Implementation for GraphQL Subscriptions
 * Uses a simple in-memory event emitter for development
 * For production, consider Redis-based PubSub
 */

import { EventEmitter } from 'events';

// Event types
export enum PubSubEvent {
  TASK_CREATED = 'TASK_CREATED',
  TASK_UPDATED = 'TASK_UPDATED',
  TASK_COMPLETED = 'TASK_COMPLETED',
  TASK_DELETED = 'TASK_DELETED',
  BOARD_UPDATED = 'BOARD_UPDATED',
  AI_SUGGESTION_AVAILABLE = 'AI_SUGGESTION_AVAILABLE',
}

// Payload types
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

type EventPayload =
  | TaskEventPayload
  | BoardEventPayload
  | AISuggestionEventPayload;

/**
 * Simple PubSub implementation using EventEmitter
 */
class PubSub {
  private eventEmitter: EventEmitter;

  constructor() {
    this.eventEmitter = new EventEmitter();
    // Increase max listeners to avoid warnings
    this.eventEmitter.setMaxListeners(100);
  }

  /**
   * Publish an event with payload
   */
  publish(event: PubSubEvent, payload: EventPayload): void {
    this.eventEmitter.emit(event, payload);
  }

  /**
   * Subscribe to an event and return an AsyncIterator
   */
  asyncIterator<T = any>(
    events: PubSubEvent | PubSubEvent[]
  ): AsyncIterator<T> {
    const eventArray = Array.isArray(events) ? events : [events];
    const pullQueue: Array<(value: IteratorResult<T>) => void> = [];
    const pushQueue: T[] = [];
    let listening = true;

    const pushValue = (payload: T) => {
      if (pullQueue.length !== 0) {
        const resolver = pullQueue.shift();
        if (resolver) {
          resolver({ value: payload, done: false });
        }
      } else {
        pushQueue.push(payload);
      }
    };

    const pullValue = (): Promise<IteratorResult<T>> =>
      new Promise(resolve => {
        if (pushQueue.length !== 0) {
          const value = pushQueue.shift();
          if (value) {
            resolve({ value, done: false });
          }
        } else {
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

    const iterator: AsyncIterator<T> = {
      next(): Promise<IteratorResult<T>> {
        return listening ? pullValue() : iterator.return!();
      },
      return(): Promise<IteratorResult<T>> {
        emptyQueue();
        return Promise.resolve({ value: undefined, done: true });
      },
      throw(error: Error): Promise<IteratorResult<T>> {
        emptyQueue();
        return Promise.reject(error);
      },
    };

    return {
      ...iterator,
      [Symbol.asyncIterator]() {
        return this;
      },
    } as AsyncIterator<T>;
  }

  /**
   * Remove all listeners for specific events
   */
  private removeAllListeners(events: PubSubEvent[]): void {
    events.forEach(event => {
      this.eventEmitter.removeAllListeners(event);
    });
  }

  /**
   * Get current listener count for debugging
   */
  listenerCount(event: PubSubEvent): number {
    return this.eventEmitter.listenerCount(event);
  }
}

// Singleton instance
export const pubsub = new PubSub();
