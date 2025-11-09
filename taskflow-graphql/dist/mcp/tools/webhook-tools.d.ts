/**
 * Webhook management MCP tools
 * Integrates with existing webhook delivery system
 */
import type { Tool } from '@modelcontextprotocol/sdk/types.js';
import type { WebhookEvent } from '../../types/index.js';
/**
 * Webhook Tools Schema Definitions
 */
export declare const webhookTools: Tool[];
/**
 * Handler for create_webhook tool
 */
export declare function handleCreateWebhook(args: {
    url: string;
    events: WebhookEvent[];
    secret?: string;
    description?: string;
}): Promise<{
    content: Array<{
        type: string;
        text: string;
    }>;
}>;
/**
 * Handler for list_webhooks tool
 */
export declare function handleListWebhooks(args: {
    active?: boolean;
}): Promise<{
    content: Array<{
        type: string;
        text: string;
    }>;
}>;
/**
 * Handler for test_webhook tool
 */
export declare function handleTestWebhook(args: {
    id: string;
}): Promise<{
    content: Array<{
        type: string;
        text: string;
    }>;
}>;
/**
 * Handler for update_webhook tool
 */
export declare function handleUpdateWebhook(args: {
    id: string;
    url?: string;
    events?: WebhookEvent[];
    secret?: string;
    active?: boolean;
    description?: string;
}): Promise<{
    content: Array<{
        type: string;
        text: string;
    }>;
}>;
/**
 * Handler for delete_webhook tool
 */
export declare function handleDeleteWebhook(args: {
    id: string;
}): Promise<{
    content: Array<{
        type: string;
        text: string;
    }>;
}>;
/**
 * Handler for get_webhook_deliveries tool
 */
export declare function handleGetWebhookDeliveries(args: {
    id: string;
    limit?: number;
}): Promise<{
    content: Array<{
        type: string;
        text: string;
    }>;
}>;
/**
 * Main handler that routes tool calls
 */
export declare function handleWebhookTool(toolName: string, args: Record<string, unknown>): Promise<{
    content: Array<{
        type: string;
        text: string;
    }>;
}>;
//# sourceMappingURL=webhook-tools.d.ts.map