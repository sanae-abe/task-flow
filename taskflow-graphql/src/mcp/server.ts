/**
 * TaskFlow MCP Server
 * Model Context Protocol server for TaskFlow GraphQL API
 * Week 5 Day 32-35: Extended with AI, Template, Webhook, and Export tools
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ListResourcesRequestSchema,
  ReadResourceRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';

import { allTools, toolHandlers, type ToolName } from './tools/index.js';
import { allResources, readResource } from './resources/index.js';

/**
 * Create and initialize MCP Server
 */
export async function createMCPServer() {
  const server = new Server(
    {
      name: 'taskflow-mcp-server',
      version: '2.0.0', // Updated for Week 5 Day 32-35 extended features
    },
    {
      capabilities: {
        tools: {},
        resources: {},
      },
    }
  );

  // List all available tools
  server.setRequestHandler(ListToolsRequestSchema, async () => {
    console.error('[MCP] Listing tools...');
    console.error(`[MCP] Total tools available: ${allTools.length}`);
    console.error('[MCP] Tool categories:');
    console.error('  - Task tools: 6');
    console.error('  - Board tools: 4');
    console.error('  - AI tools: 4 (NEW)');
    console.error('  - Template tools: 5 (NEW)');
    console.error('  - Webhook tools: 6 (NEW)');
    console.error('  - Export tools: 1 (NEW)');
    return { tools: allTools };
  });

  // Handle tool execution
  server.setRequestHandler(CallToolRequestSchema, async request => {
    const toolName = request.params.name as ToolName;
    const args = request.params.arguments || {};

    console.error(`[MCP] Calling tool: ${toolName}`);

    const handler = toolHandlers[toolName];
    if (!handler) {
      throw new Error(`Unknown tool: ${toolName}`);
    }

    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const result = await handler(args as any);
      console.error(`[MCP] Tool ${toolName} completed successfully`);
      return result;
    } catch (error) {
      console.error(`[MCP] Tool ${toolName} failed:`, error);
      return {
        content: [
          {
            type: 'text',
            text: `Error executing ${toolName}: ${error instanceof Error ? error.message : 'Unknown error'}`,
          },
        ],
        isError: true,
      };
    }
  });

  // List all available resources
  server.setRequestHandler(ListResourcesRequestSchema, async () => {
    console.error('[MCP] Listing resources...');
    console.error(`[MCP] Total resources available: ${allResources.length}`);
    console.error('[MCP] Resource categories:');
    console.error('  - Task resources: task://');
    console.error('  - Board resources: board://');
    console.error('  - Template resources: template:// (NEW)');
    console.error('  - Webhook resources: webhook:// (NEW)');
    return { resources: allResources };
  });

  // Handle resource reading
  server.setRequestHandler(ReadResourceRequestSchema, async request => {
    const uri = request.params.uri;
    console.error(`[MCP] Reading resource: ${uri}`);

    try {
      const result = await readResource(uri);
      console.error(`[MCP] Resource ${uri} read successfully`);
      return result;
    } catch (error) {
      console.error(`[MCP] Resource ${uri} read failed:`, error);
      throw error;
    }
  });

  // Connect to transport
  const transport = new StdioServerTransport();
  await server.connect(transport);

  console.error('[MCP] ====================================');
  console.error('[MCP] TaskFlow MCP Server v2.0.0 started');
  console.error('[MCP] ====================================');
  console.error(`[MCP] Available tools: ${allTools.length}`);
  console.error(`[MCP] Available resources: ${allResources.length}`);
  console.error('[MCP] Extended features (Week 5 Day 32-35):');
  console.error('[MCP]   ✓ AI-powered task breakdown');
  console.error('[MCP]   ✓ Natural language task creation');
  console.error('[MCP]   ✓ Schedule optimization');
  console.error('[MCP]   ✓ Task recommendations');
  console.error('[MCP]   ✓ Template management');
  console.error('[MCP]   ✓ Webhook integration');
  console.error('[MCP]   ✓ Markdown export');
  console.error('[MCP] ====================================');

  return server;
}

/**
 * Start MCP server (for standalone execution)
 */
if (import.meta.url === `file://${process.argv[1]}`) {
  createMCPServer().catch(error => {
    console.error('Failed to start MCP server:', error);
    process.exit(1);
  });
}
