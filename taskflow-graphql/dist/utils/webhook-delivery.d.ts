/**
 * Webhook Delivery System
 * Handles webhook HTTP delivery with retry logic, HMAC signing, IP filtering, rate limiting, and error handling
 */
import type { WebhookRecord, WebhookEvent } from '../types/database.js';
export interface WebhookPayload {
    event: WebhookEvent;
    data: Record<string, unknown>;
    timestamp: string;
}
export interface WebhookDeliveryResult {
    id: string;
    success: boolean;
    status?: number;
    response?: Record<string, unknown>;
    error?: string;
    attempts: number;
}
export interface WebhookDeliveryConfig {
    timeout: number;
    maxRetries: number;
    retryDelays: number[];
}
/**
 * Reset rate limit for a webhook (useful for testing)
 */
export declare function resetRateLimit(webhookId: string): void;
/**
 * Deliver webhook with retry logic, rate limiting, and IP validation
 */
export declare function deliverWebhook(webhook: WebhookRecord, payload: WebhookPayload, config?: WebhookDeliveryConfig, targetIP?: string): Promise<WebhookDeliveryResult>;
/**
 * Test webhook delivery with a sample payload
 */
export declare function testWebhookDelivery(webhook: WebhookRecord): Promise<WebhookDeliveryResult>;
/**
 * Verify HMAC signature from webhook payload
 * This is a utility function for webhook consumers to verify signatures
 */
export declare function verifyWebhookSignature(payload: string, signature: string, secret: string): boolean;
//# sourceMappingURL=webhook-delivery.d.ts.map