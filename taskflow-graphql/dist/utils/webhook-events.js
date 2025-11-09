/**
 * Webhook Event Integration
 * Triggers webhook deliveries when events occur in the system
 */
import { getAllWebhooks } from './indexeddb.js';
import { deliverWebhook } from './webhook-delivery.js';
// ============================================================================
// Event Triggering
// ============================================================================
/**
 * Trigger webhook event to all subscribed webhooks
 */
export async function triggerWebhookEvent(event, data) {
    // Get all active webhooks subscribed to this event
    const webhooks = await getAllWebhooks();
    const subscribedWebhooks = webhooks.filter(webhook => webhook.active && webhook.events.includes(event));
    if (subscribedWebhooks.length === 0) {
        return; // No webhooks to notify
    }
    const payload = {
        event,
        data,
        timestamp: new Date().toISOString(),
    };
    // Deliver to all subscribed webhooks in parallel (fire and forget)
    const deliveryPromises = subscribedWebhooks.map(webhook => deliverWebhook(webhook, payload).catch(error => {
        console.error(`Webhook delivery failed for ${webhook.id}:`, error);
    }));
    // Don't await - webhooks are fire-and-forget to avoid blocking operations
    Promise.all(deliveryPromises).catch(error => {
        console.error('Webhook delivery batch error:', error);
    });
}
// ============================================================================
// Event-Specific Helpers
// ============================================================================
export async function triggerTaskCreated(task) {
    await triggerWebhookEvent('TASK_CREATED', { task });
}
export async function triggerTaskUpdated(task) {
    await triggerWebhookEvent('TASK_UPDATED', { task });
}
export async function triggerTaskCompleted(task) {
    await triggerWebhookEvent('TASK_COMPLETED', { task });
}
export async function triggerTaskDeleted(task) {
    await triggerWebhookEvent('TASK_DELETED', { task });
}
export async function triggerBoardCreated(board) {
    await triggerWebhookEvent('BOARD_CREATED', { board });
}
export async function triggerBoardUpdated(board) {
    await triggerWebhookEvent('BOARD_UPDATED', { board });
}
export async function triggerBoardDeleted(board) {
    await triggerWebhookEvent('BOARD_DELETED', { board });
}
//# sourceMappingURL=webhook-events.js.map