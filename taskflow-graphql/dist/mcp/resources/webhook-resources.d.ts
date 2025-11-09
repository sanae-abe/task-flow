/**
 * Webhook Resources for MCP
 * Provides URI-based access to webhook data and delivery history
 */
import type { Resource } from '@modelcontextprotocol/sdk/types.js';
/**
 * Webhook Resource Schemas
 */
export declare const webhookResourceSchemas: Resource[];
/**
 * Handler for webhook://list resource
 */
export declare function handleWebhookListResource(): Promise<{
    contents: Array<{
        uri: string;
        mimeType: string;
        text: string;
    }>;
}>;
/**
 * Handler for webhook://{id} resource
 */
export declare function handleWebhookDetailResource(id: string): Promise<{
    contents: Array<{
        uri: string;
        mimeType: string;
        text: string;
    }>;
}>;
/**
 * Handler for webhook://{id}/deliveries resource
 */
export declare function handleWebhookDeliveriesResource(id: string): Promise<{
    contents: Array<{
        uri: string;
        mimeType: string;
        text: string;
    }>;
}>;
/**
 * Handler for webhook://stats resource
 */
export declare function handleWebhookStatsResource(): Promise<{
    contents: Array<{
        uri: string;
        mimeType: string;
        text: string;
    }>;
}>;
/**
 * Main resource handler
 */
export declare function handleWebhookResource(uri: string): Promise<{
    contents: Array<{
        uri: string;
        mimeType: string;
        text: string;
    }>;
}>;
//# sourceMappingURL=webhook-resources.d.ts.map