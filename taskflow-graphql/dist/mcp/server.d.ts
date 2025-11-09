/**
 * TaskFlow MCP Server
 * Model Context Protocol server for TaskFlow GraphQL API
 * Week 5 Day 32-35: Extended with AI, Template, Webhook, and Export tools
 */
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
/**
 * Create and initialize MCP Server
 */
export declare function createMCPServer(): Promise<Server<{
    method: string;
    params?: {
        [x: string]: unknown;
        _meta?: {
            [x: string]: unknown;
            progressToken?: string | number | undefined;
        } | undefined;
    } | undefined;
}, {
    method: string;
    params?: {
        [x: string]: unknown;
        _meta?: {
            [x: string]: unknown;
        } | undefined;
    } | undefined;
}, {
    [x: string]: unknown;
    _meta?: {
        [x: string]: unknown;
    } | undefined;
}>>;
//# sourceMappingURL=server.d.ts.map