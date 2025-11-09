/**
 * Webhook management MCP tools
 * Integrates with existing webhook delivery system
 */
import { getAllWebhooks, getWebhook, createWebhook, updateWebhook, deleteWebhook, getWebhookDeliveriesByWebhookId, } from '../../utils/indexeddb.js';
import { testWebhookDelivery } from '../../utils/webhook-delivery.js';
/**
 * Webhook Tools Schema Definitions
 */
export const webhookTools = [
    {
        name: 'create_webhook',
        description: 'Create a webhook to receive real-time notifications for task and board events. Supports multiple event types and secure delivery.',
        inputSchema: {
            type: 'object',
            properties: {
                url: {
                    type: 'string',
                    format: 'uri',
                    description: 'Webhook endpoint URL (must be HTTPS)',
                    pattern: '^https://',
                },
                events: {
                    type: 'array',
                    description: 'Events to subscribe to',
                    items: {
                        type: 'string',
                        enum: [
                            'TASK_CREATED',
                            'TASK_UPDATED',
                            'TASK_COMPLETED',
                            'TASK_DELETED',
                            'BOARD_CREATED',
                            'BOARD_UPDATED',
                            'BOARD_DELETED',
                            'LABEL_CREATED',
                            'LABEL_UPDATED',
                            'LABEL_DELETED',
                        ],
                    },
                    minItems: 1,
                },
                secret: {
                    type: 'string',
                    description: 'Optional secret for HMAC signature verification (recommended for security)',
                    minLength: 16,
                },
                description: {
                    type: 'string',
                    description: 'Optional webhook description',
                },
            },
            required: ['url', 'events'],
        },
    },
    {
        name: 'list_webhooks',
        description: 'List all configured webhooks with their status and statistics',
        inputSchema: {
            type: 'object',
            properties: {
                active: {
                    type: 'boolean',
                    description: 'Filter by active status',
                },
            },
        },
    },
    {
        name: 'test_webhook',
        description: 'Test a webhook by sending a test event. Verifies endpoint connectivity and response.',
        inputSchema: {
            type: 'object',
            properties: {
                id: {
                    type: 'string',
                    description: 'Webhook ID to test',
                },
            },
            required: ['id'],
        },
    },
    {
        name: 'update_webhook',
        description: 'Update webhook configuration',
        inputSchema: {
            type: 'object',
            properties: {
                id: {
                    type: 'string',
                    description: 'Webhook ID',
                },
                url: {
                    type: 'string',
                    format: 'uri',
                    pattern: '^https://',
                },
                events: {
                    type: 'array',
                    items: {
                        type: 'string',
                    },
                },
                secret: { type: 'string' },
                active: { type: 'boolean' },
                description: { type: 'string' },
            },
            required: ['id'],
        },
    },
    {
        name: 'delete_webhook',
        description: 'Delete a webhook',
        inputSchema: {
            type: 'object',
            properties: {
                id: {
                    type: 'string',
                    description: 'Webhook ID to delete',
                },
            },
            required: ['id'],
        },
    },
    {
        name: 'get_webhook_deliveries',
        description: 'Get delivery history for a webhook',
        inputSchema: {
            type: 'object',
            properties: {
                id: {
                    type: 'string',
                    description: 'Webhook ID',
                },
                limit: {
                    type: 'number',
                    description: 'Maximum number of deliveries to return',
                    default: 50,
                    minimum: 1,
                    maximum: 100,
                },
            },
            required: ['id'],
        },
    },
];
/**
 * Handler for create_webhook tool
 */
export async function handleCreateWebhook(args) {
    try {
        // Validate URL
        const url = new URL(args.url);
        if (url.protocol !== 'https:') {
            throw new Error('Webhook URL must use HTTPS');
        }
        const webhookData = {
            url: args.url,
            events: args.events,
            secret: args.secret,
            description: args.description,
            active: true,
            deliveryCount: 0,
            failureCount: 0,
        };
        const created = await createWebhook(webhookData);
        return {
            content: [
                {
                    type: 'text',
                    text: JSON.stringify({
                        success: true,
                        webhook: {
                            id: created.id,
                            url: created.url,
                            events: created.events,
                            description: created.description,
                            active: created.active,
                            createdAt: created.createdAt,
                        },
                        security: {
                            hasSecret: !!created.secret,
                            recommendation: created.secret
                                ? 'Secret configured for HMAC verification'
                                : 'Consider adding a secret for enhanced security',
                        },
                    }, null, 2),
                },
            ],
        };
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        return {
            content: [
                {
                    type: 'text',
                    text: JSON.stringify({
                        success: false,
                        error: errorMessage,
                    }, null, 2),
                },
            ],
        };
    }
}
/**
 * Handler for list_webhooks tool
 */
export async function handleListWebhooks(args) {
    try {
        let webhooks = await getAllWebhooks();
        if (args.active !== undefined) {
            webhooks = webhooks.filter(w => w.active === args.active);
        }
        return {
            content: [
                {
                    type: 'text',
                    text: JSON.stringify({
                        success: true,
                        count: webhooks.length,
                        filters: {
                            active: args.active,
                        },
                        webhooks: webhooks.map(w => ({
                            id: w.id,
                            url: w.url,
                            events: w.events,
                            description: w.description,
                            active: w.active,
                            deliveryCount: w.deliveryCount,
                            failureCount: w.failureCount,
                            lastDelivery: w.lastDelivery,
                            createdAt: w.createdAt,
                        })),
                    }, null, 2),
                },
            ],
        };
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        return {
            content: [
                {
                    type: 'text',
                    text: JSON.stringify({
                        success: false,
                        error: errorMessage,
                    }, null, 2),
                },
            ],
        };
    }
}
/**
 * Handler for test_webhook tool
 */
export async function handleTestWebhook(args) {
    try {
        const webhook = await getWebhook(args.id);
        if (!webhook) {
            throw new Error(`Webhook not found: ${args.id}`);
        }
        const testResult = await testWebhookDelivery(webhook);
        return {
            content: [
                {
                    type: 'text',
                    text: JSON.stringify({
                        success: testResult.success,
                        webhook: {
                            id: webhook.id,
                            url: webhook.url,
                        },
                        test: {
                            id: testResult.id,
                            status: testResult.status,
                            error: testResult.error,
                            response: testResult.response,
                        },
                    }, null, 2),
                },
            ],
        };
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        return {
            content: [
                {
                    type: 'text',
                    text: JSON.stringify({
                        success: false,
                        error: errorMessage,
                    }, null, 2),
                },
            ],
        };
    }
}
/**
 * Handler for update_webhook tool
 */
export async function handleUpdateWebhook(args) {
    try {
        const webhook = await getWebhook(args.id);
        if (!webhook) {
            throw new Error(`Webhook not found: ${args.id}`);
        }
        const updates = {};
        if (args.url !== undefined) {
            const url = new URL(args.url);
            if (url.protocol !== 'https:') {
                throw new Error('Webhook URL must use HTTPS');
            }
            updates.url = args.url;
        }
        if (args.events !== undefined)
            updates.events = args.events;
        if (args.secret !== undefined)
            updates.secret = args.secret;
        if (args.active !== undefined)
            updates.active = args.active;
        if (args.description !== undefined)
            updates.description = args.description;
        const updated = await updateWebhook(args.id, updates);
        if (!updated) {
            throw new Error(`Failed to update webhook: ${args.id}`);
        }
        return {
            content: [
                {
                    type: 'text',
                    text: JSON.stringify({
                        success: true,
                        webhook: {
                            id: updated.id,
                            url: updated.url,
                            events: updated.events,
                            description: updated.description,
                            active: updated.active,
                            updatedAt: updated.updatedAt,
                        },
                    }, null, 2),
                },
            ],
        };
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        return {
            content: [
                {
                    type: 'text',
                    text: JSON.stringify({
                        success: false,
                        error: errorMessage,
                    }, null, 2),
                },
            ],
        };
    }
}
/**
 * Handler for delete_webhook tool
 */
export async function handleDeleteWebhook(args) {
    try {
        const webhook = await getWebhook(args.id);
        if (!webhook) {
            throw new Error(`Webhook not found: ${args.id}`);
        }
        await deleteWebhook(args.id);
        return {
            content: [
                {
                    type: 'text',
                    text: JSON.stringify({
                        success: true,
                        deletedWebhook: {
                            id: webhook.id,
                            url: webhook.url,
                            deliveryCount: webhook.deliveryCount,
                        },
                    }, null, 2),
                },
            ],
        };
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        return {
            content: [
                {
                    type: 'text',
                    text: JSON.stringify({
                        success: false,
                        error: errorMessage,
                    }, null, 2),
                },
            ],
        };
    }
}
/**
 * Handler for get_webhook_deliveries tool
 */
export async function handleGetWebhookDeliveries(args) {
    try {
        const webhook = await getWebhook(args.id);
        if (!webhook) {
            throw new Error(`Webhook not found: ${args.id}`);
        }
        const deliveries = await getWebhookDeliveriesByWebhookId(args.id);
        return {
            content: [
                {
                    type: 'text',
                    text: JSON.stringify({
                        success: true,
                        webhook: {
                            id: webhook.id,
                            url: webhook.url,
                        },
                        deliveries: {
                            count: deliveries.length,
                            items: deliveries.map(d => ({
                                id: d.id,
                                event: d.event,
                                success: d.success,
                                statusCode: d.statusCode,
                                responseTime: d.responseTime,
                                timestamp: d.timestamp,
                                error: d.error,
                            })),
                        },
                    }, null, 2),
                },
            ],
        };
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        return {
            content: [
                {
                    type: 'text',
                    text: JSON.stringify({
                        success: false,
                        error: errorMessage,
                    }, null, 2),
                },
            ],
        };
    }
}
/**
 * Main handler that routes tool calls
 */
export async function handleWebhookTool(toolName, args) {
    switch (toolName) {
        case 'create_webhook':
            return handleCreateWebhook(args);
        case 'list_webhooks':
            return handleListWebhooks(args);
        case 'test_webhook':
            return handleTestWebhook(args);
        case 'update_webhook':
            return handleUpdateWebhook(args);
        case 'delete_webhook':
            return handleDeleteWebhook(args);
        case 'get_webhook_deliveries':
            return handleGetWebhookDeliveries(args);
        default:
            throw new Error(`Unknown webhook tool: ${toolName}`);
    }
}
//# sourceMappingURL=webhook-tools.js.map