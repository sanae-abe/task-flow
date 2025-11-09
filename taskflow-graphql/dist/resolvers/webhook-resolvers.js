/**
 * Webhook Resolvers for TaskFlow GraphQL
 * Handles all Webhook-related queries and mutations
 */
import { GraphQLError } from 'graphql';
import { getWebhook, getAllWebhooks, createWebhook as createWebhookDB, updateWebhook as updateWebhookDB, deleteWebhook as deleteWebhookDB, getWebhookDelivery as getWebhookDeliveryDB, getWebhookDeliveriesByWebhookId, getAllWebhookDeliveries, } from '../utils/indexeddb.js';
import { testWebhookDelivery } from '../utils/webhook-delivery.js';
// Helper to convert WebhookRecord to Webhook GraphQL type
function toWebhookType(record) {
    return {
        ...record,
        allowedIPs: record.allowedIPs || null,
        rateLimit: record.rateLimit || null,
        createdAt: new Date(record.createdAt),
        updatedAt: new Date(record.updatedAt),
    };
}
// Helper to convert WebhookDeliveryRecord to WebhookDelivery GraphQL type
function toWebhookDeliveryType(record) {
    return {
        ...record,
        response: record.response || null,
        status: record.status || null,
        deliveredAt: new Date(record.deliveredAt),
    };
}
/**
 * Validate IP address (IPv4 or IPv6)
 */
function isValidIP(ip) {
    // IPv4 pattern
    const ipv4Pattern = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    // IPv6 pattern (simplified)
    const ipv6Pattern = /^(([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:))$/;
    return ipv4Pattern.test(ip) || ipv6Pattern.test(ip);
}
// ============================================================================
// Query Resolvers
// ============================================================================
export const webhookQueries = {
    /**
     * Get single webhook by ID
     */
    webhook: async (_parent, { id }, _context) => {
        const webhook = await getWebhook(id);
        if (!webhook) {
            throw new GraphQLError('Webhook not found', {
                extensions: { code: 'NOT_FOUND' },
            });
        }
        return toWebhookType(webhook);
    },
    /**
     * Get all webhooks
     */
    webhooks: async (_parent, _args, _context) => {
        const webhooks = await getAllWebhooks();
        return webhooks.map(toWebhookType);
    },
    /**
     * Get single webhook delivery by ID
     */
    webhookDelivery: async (_parent, { id }, _context) => {
        const delivery = await getWebhookDeliveryDB(id);
        if (!delivery) {
            throw new GraphQLError('Webhook delivery not found', {
                extensions: { code: 'NOT_FOUND' },
            });
        }
        return toWebhookDeliveryType(delivery);
    },
    /**
     * Get webhook deliveries for a specific webhook with pagination
     */
    webhookDeliveries: async (_parent, { webhookId, limit, offset }, _context) => {
        // Verify webhook exists
        const webhook = await getWebhook(webhookId);
        if (!webhook) {
            throw new GraphQLError('Webhook not found', {
                extensions: { code: 'NOT_FOUND' },
            });
        }
        // Get all deliveries for this webhook
        let deliveries = await getWebhookDeliveriesByWebhookId(webhookId);
        // Sort by deliveredAt descending (most recent first)
        deliveries.sort((a, b) => new Date(b.deliveredAt).getTime() - new Date(a.deliveredAt).getTime());
        // Apply pagination
        const startIndex = offset || 0;
        const endIndex = limit ? startIndex + limit : deliveries.length;
        deliveries = deliveries.slice(startIndex, endIndex);
        return deliveries.map(toWebhookDeliveryType);
    },
    /**
     * Get webhook statistics
     */
    webhookStats: async (_parent, _args, _context) => {
        const webhooks = await getAllWebhooks();
        const deliveries = await getAllWebhookDeliveries();
        const totalWebhooks = webhooks.length;
        const activeWebhooks = webhooks.filter(w => w.active).length;
        const totalDeliveries = deliveries.length;
        const successfulDeliveries = deliveries.filter(d => d.success).length;
        const failedDeliveries = deliveries.filter(d => !d.success).length;
        const successRate = totalDeliveries > 0 ? (successfulDeliveries / totalDeliveries) * 100 : 0;
        const stats = {
            totalWebhooks,
            activeWebhooks,
            totalDeliveries,
            successfulDeliveries,
            failedDeliveries,
            successRate,
        };
        return stats;
    },
};
// ============================================================================
// Mutation Resolvers
// ============================================================================
export const webhookMutations = {
    /**
     * Create a new webhook
     */
    createWebhook: async (_parent, { input }, _context) => {
        // Validate URL
        try {
            new URL(input.url);
        }
        catch {
            throw new GraphQLError('Invalid webhook URL', {
                extensions: { code: 'BAD_REQUEST' },
            });
        }
        // Validate events
        if (!input.events || input.events.length === 0) {
            throw new GraphQLError('At least one event must be specified', {
                extensions: { code: 'BAD_REQUEST' },
            });
        }
        // Validate IPs if provided
        if (input.allowedIPs) {
            for (const ip of input.allowedIPs) {
                if (!isValidIP(ip)) {
                    throw new GraphQLError(`Invalid IP address: ${ip}`, {
                        extensions: { code: 'BAD_REQUEST' },
                    });
                }
            }
        }
        // Validate rate limit if provided
        if (input.rateLimit !== undefined && input.rateLimit !== null) {
            if (input.rateLimit < 1 || input.rateLimit > 1000) {
                throw new GraphQLError('Rate limit must be between 1 and 1000 requests per minute', {
                    extensions: { code: 'BAD_REQUEST' },
                });
            }
        }
        // Create webhook
        const webhookData = {
            url: input.url,
            events: input.events, // GraphQL codegen will handle proper typing
            active: true,
            secret: input.secret ?? undefined,
            allowedIPs: input.allowedIPs ?? undefined,
            rateLimit: input.rateLimit ?? undefined,
        };
        const webhook = await createWebhookDB(webhookData);
        return toWebhookType(webhook);
    },
    /**
     * Update an existing webhook
     */
    updateWebhook: async (_parent, { id, input }, _context) => {
        const existing = await getWebhook(id);
        if (!existing) {
            throw new GraphQLError('Webhook not found', {
                extensions: { code: 'NOT_FOUND' },
            });
        }
        // Validate URL if provided
        if (input.url) {
            try {
                new URL(input.url);
            }
            catch {
                throw new GraphQLError('Invalid webhook URL', {
                    extensions: { code: 'BAD_REQUEST' },
                });
            }
        }
        // Validate events if provided
        if (input.events && input.events.length === 0) {
            throw new GraphQLError('At least one event must be specified', {
                extensions: { code: 'BAD_REQUEST' },
            });
        }
        // Validate IPs if provided
        if (input.allowedIPs) {
            for (const ip of input.allowedIPs) {
                if (!isValidIP(ip)) {
                    throw new GraphQLError(`Invalid IP address: ${ip}`, {
                        extensions: { code: 'BAD_REQUEST' },
                    });
                }
            }
        }
        // Validate rate limit if provided
        if (input.rateLimit !== undefined && input.rateLimit !== null) {
            if (input.rateLimit < 1 || input.rateLimit > 1000) {
                throw new GraphQLError('Rate limit must be between 1 and 1000 requests per minute', {
                    extensions: { code: 'BAD_REQUEST' },
                });
            }
        }
        // Build update object
        const updates = {};
        if (input.url !== undefined && input.url !== null) {
            updates.url = input.url;
        }
        if (input.events !== undefined && input.events !== null) {
            updates.events = input.events;
        }
        if (input.active !== undefined && input.active !== null) {
            updates.active = input.active;
        }
        if (input.secret !== undefined) {
            updates.secret = input.secret ?? undefined;
        }
        if (input.allowedIPs !== undefined) {
            updates.allowedIPs = input.allowedIPs ?? undefined;
        }
        if (input.rateLimit !== undefined) {
            updates.rateLimit = input.rateLimit ?? undefined;
        }
        const updated = await updateWebhookDB(id, updates);
        if (!updated) {
            throw new GraphQLError('Failed to update webhook', {
                extensions: { code: 'INTERNAL_ERROR' },
            });
        }
        return toWebhookType(updated);
    },
    /**
     * Delete a webhook
     */
    deleteWebhook: async (_parent, { id }, _context) => {
        const webhook = await getWebhook(id);
        if (!webhook) {
            throw new GraphQLError('Webhook not found', {
                extensions: { code: 'NOT_FOUND' },
            });
        }
        const deleted = await deleteWebhookDB(id);
        return deleted;
    },
    /**
     * Test a webhook by sending a test payload
     */
    testWebhook: async (_parent, { id }, _context) => {
        const webhook = await getWebhook(id);
        if (!webhook) {
            throw new GraphQLError('Webhook not found', {
                extensions: { code: 'NOT_FOUND' },
            });
        }
        if (!webhook.active) {
            throw new GraphQLError('Cannot test an inactive webhook', {
                extensions: { code: 'BAD_REQUEST' },
            });
        }
        // Perform test delivery
        const result = await testWebhookDelivery(webhook);
        if (!result.success) {
            throw new GraphQLError(`Webhook test failed: ${result.error || 'Unknown error'}`, {
                extensions: {
                    code: 'WEBHOOK_DELIVERY_FAILED',
                    status: result.status,
                    response: result.response,
                },
            });
        }
        // Return delivery record
        return {
            id: result.id,
            webhookId: webhook.id,
            event: 'TASK_CREATED',
            payload: {
                test: true,
                message: 'This is a test webhook delivery',
                webhookId: webhook.id,
            },
            response: result.response || null,
            status: result.status || null,
            success: result.success,
            deliveredAt: new Date(),
        };
    },
};
//# sourceMappingURL=webhook-resolvers.js.map