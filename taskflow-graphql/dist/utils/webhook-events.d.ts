/**
 * Webhook Event Integration
 * Triggers webhook deliveries when events occur in the system
 */
import type { WebhookEvent } from '../types/database.js';
/**
 * Trigger webhook event to all subscribed webhooks
 */
export declare function triggerWebhookEvent(event: WebhookEvent, data: Record<string, unknown>): Promise<void>;
export declare function triggerTaskCreated(task: Record<string, unknown>): Promise<void>;
export declare function triggerTaskUpdated(task: Record<string, unknown>): Promise<void>;
export declare function triggerTaskCompleted(task: Record<string, unknown>): Promise<void>;
export declare function triggerTaskDeleted(task: Record<string, unknown>): Promise<void>;
export declare function triggerBoardCreated(board: Record<string, unknown>): Promise<void>;
export declare function triggerBoardUpdated(board: Record<string, unknown>): Promise<void>;
export declare function triggerBoardDeleted(board: Record<string, unknown>): Promise<void>;
//# sourceMappingURL=webhook-events.d.ts.map