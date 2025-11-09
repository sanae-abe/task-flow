/**
 * MCP Server Integration Tests
 * Week 6 Day 40-41: Comprehensive integration testing
 */

import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { spawn, ChildProcess } from 'child_process';
import { EventEmitter } from 'events';

interface JSONRPCRequest {
  jsonrpc: '2.0';
  id: number;
  method: string;
  params?: Record<string, unknown>;
}

interface JSONRPCResponse {
  jsonrpc: '2.0';
  id: number;
  result?: unknown;
  error?: {
    code: number;
    message: string;
    data?: unknown;
  };
}

describe('MCP Server Integration Tests', () => {
  let mcpProcess: ChildProcess;
  let requestId = 0;

  beforeAll(async () => {
    // Start MCP Server
    console.log('Starting MCP Server...');
    mcpProcess = spawn('node', ['dist/mcp/server.js'], {
      stdio: ['pipe', 'pipe', 'pipe'],
      env: {
        ...process.env,
        NODE_ENV: 'test',
        AI_API_ENABLED: 'false',
      },
    });

    // Wait for server to be ready
    await new Promise<void>((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('MCP Server startup timeout'));
      }, 5000);

      mcpProcess.stderr?.on('data', (data: Buffer) => {
        const message = data.toString();
        if (message.includes('TaskFlow MCP Server')) {
          clearTimeout(timeout);
          resolve();
        }
      });

      mcpProcess.on('error', error => {
        clearTimeout(timeout);
        reject(error);
      });
    });

    console.log('MCP Server started successfully');
  });

  afterAll(() => {
    if (mcpProcess) {
      mcpProcess.kill();
      console.log('MCP Server stopped');
    }
  });

  beforeEach(() => {
    requestId = 0;
  });

  /**
   * Helper function to send JSON-RPC request and get response
   */
  async function sendRequest(
    method: string,
    params?: Record<string, unknown>
  ): Promise<JSONRPCResponse> {
    requestId++;
    const request: JSONRPCRequest = {
      jsonrpc: '2.0',
      id: requestId,
      method,
      params,
    };

    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error(`Request timeout: ${method}`));
      }, 3000);

      const responseHandler = (data: Buffer) => {
        try {
          const response = JSON.parse(data.toString()) as JSONRPCResponse;
          if (response.id === requestId) {
            clearTimeout(timeout);
            mcpProcess.stdout?.off('data', responseHandler);
            resolve(response);
          }
        } catch (error) {
          // Ignore parse errors, might be partial data
        }
      };

      mcpProcess.stdout?.on('data', responseHandler);

      mcpProcess.stdin?.write(`${JSON.stringify(request)}\n`);
    });
  }

  describe('Tool Discovery', () => {
    it('should list all available tools', async () => {
      const response = await sendRequest('tools/list', {});

      expect(response.result).toBeDefined();
      const result = response.result as { tools: unknown[] };
      expect(result.tools).toBeDefined();
      expect(Array.isArray(result.tools)).toBe(true);
      expect(result.tools.length).toBe(26);
    });

    it('should have all required task tools', async () => {
      const response = await sendRequest('tools/list', {});

      const result = response.result as { tools: Array<{ name: string }> };
      const toolNames = result.tools.map(t => t.name);

      const taskTools = [
        'create_task',
        'list_tasks',
        'get_task',
        'update_task',
        'delete_task',
        'complete_task',
      ];

      taskTools.forEach(tool => {
        expect(toolNames).toContain(tool);
      });
    });

    it('should have all required board tools', async () => {
      const response = await sendRequest('tools/list', {});

      const result = response.result as { tools: Array<{ name: string }> };
      const toolNames = result.tools.map(t => t.name);

      const boardTools = [
        'create_board',
        'list_boards',
        'get_board',
        'delete_board',
      ];

      boardTools.forEach(tool => {
        expect(toolNames).toContain(tool);
      });
    });

    it('should have all AI tools', async () => {
      const response = await sendRequest('tools/list', {});

      const result = response.result as { tools: Array<{ name: string }> };
      const toolNames = result.tools.map(t => t.name);

      const aiTools = [
        'ai_breakdown_task',
        'ai_create_from_natural_language',
        'ai_optimize_schedule',
        'ai_recommend_next_task',
      ];

      aiTools.forEach(tool => {
        expect(toolNames).toContain(tool);
      });
    });

    it('should have all template tools', async () => {
      const response = await sendRequest('tools/list', {});

      const result = response.result as { tools: Array<{ name: string }> };
      const toolNames = result.tools.map(t => t.name);

      const templateTools = [
        'create_template',
        'list_templates',
        'get_template',
        'create_task_from_template',
        'delete_template',
      ];

      templateTools.forEach(tool => {
        expect(toolNames).toContain(tool);
      });
    });

    it('should have all webhook tools', async () => {
      const response = await sendRequest('tools/list', {});

      const result = response.result as { tools: Array<{ name: string }> };
      const toolNames = result.tools.map(t => t.name);

      const webhookTools = [
        'create_webhook',
        'list_webhooks',
        'delete_webhook',
        'test_webhook',
        'get_webhook_stats',
        'get_webhook_deliveries',
      ];

      webhookTools.forEach(tool => {
        expect(toolNames).toContain(tool);
      });
    });

    it('should have export tool', async () => {
      const response = await sendRequest('tools/list', {});

      const result = response.result as { tools: Array<{ name: string }> };
      const toolNames = result.tools.map(t => t.name);

      expect(toolNames).toContain('export_board_markdown');
    });
  });

  describe('Resource Discovery', () => {
    it('should list all available resources', async () => {
      const response = await sendRequest('resources/list', {});

      expect(response.result).toBeDefined();
      const result = response.result as { resources: unknown[] };
      expect(result.resources).toBeDefined();
      expect(Array.isArray(result.resources)).toBe(true);
      expect(result.resources.length).toBeGreaterThanOrEqual(10);
    });

    it('should have task resources', async () => {
      const response = await sendRequest('resources/list', {});

      const result = response.result as {
        resources: Array<{ uri: string }>;
      };
      const resourceUris = result.resources.map(r => r.uri);

      expect(resourceUris).toContain('task://list');
    });

    it('should have board resources', async () => {
      const response = await sendRequest('resources/list', {});

      const result = response.result as {
        resources: Array<{ uri: string }>;
      };
      const resourceUris = result.resources.map(r => r.uri);

      expect(resourceUris).toContain('board://list');
    });
  });

  describe('Task Management Integration', () => {
    let createdTaskId: string;
    let createdBoardId: string;

    it('should create a board', async () => {
      const response = await sendRequest('tools/call', {
        name: 'create_board',
        arguments: {
          name: 'Integration Test Board',
          description: 'Created by integration tests',
        },
      });

      expect(response.result).toBeDefined();
      const result = response.result as {
        content: Array<{ text: string }>;
      };
      const board = JSON.parse(result.content[0].text);
      expect(board.id).toBeDefined();
      expect(board.name).toBe('Integration Test Board');

      createdBoardId = board.id;
    });

    it('should create a task via MCP', async () => {
      const response = await sendRequest('tools/call', {
        name: 'create_task',
        arguments: {
          title: 'Integration Test Task',
          description: 'This task was created by integration tests',
          boardId: createdBoardId,
          columnId: 'col-1',
          priority: 'HIGH',
        },
      });

      expect(response.result).toBeDefined();
      const result = response.result as {
        content: Array<{ text: string }>;
      };
      const task = JSON.parse(result.content[0].text);

      expect(task.id).toBeDefined();
      expect(task.title).toBe('Integration Test Task');
      expect(task.priority).toBe('HIGH');

      createdTaskId = task.id;
    });

    it('should list tasks', async () => {
      const response = await sendRequest('tools/call', {
        name: 'list_tasks',
        arguments: {},
      });

      expect(response.result).toBeDefined();
      const result = response.result as {
        content: Array<{ text: string }>;
      };
      const tasks = JSON.parse(result.content[0].text);

      expect(Array.isArray(tasks)).toBe(true);
      expect(tasks.length).toBeGreaterThan(0);
      expect(tasks.some((t: { id: string }) => t.id === createdTaskId)).toBe(
        true
      );
    });

    it('should get task details', async () => {
      const response = await sendRequest('tools/call', {
        name: 'get_task',
        arguments: {
          taskId: createdTaskId,
        },
      });

      expect(response.result).toBeDefined();
      const result = response.result as {
        content: Array<{ text: string }>;
      };
      const task = JSON.parse(result.content[0].text);

      expect(task.id).toBe(createdTaskId);
      expect(task.title).toBe('Integration Test Task');
    });

    it('should update task', async () => {
      const response = await sendRequest('tools/call', {
        name: 'update_task',
        arguments: {
          taskId: createdTaskId,
          title: 'Updated Integration Test Task',
          priority: 'CRITICAL',
        },
      });

      expect(response.result).toBeDefined();
      const result = response.result as {
        content: Array<{ text: string }>;
      };
      const task = JSON.parse(result.content[0].text);

      expect(task.title).toBe('Updated Integration Test Task');
      expect(task.priority).toBe('CRITICAL');
    });

    it('should complete task', async () => {
      const response = await sendRequest('tools/call', {
        name: 'complete_task',
        arguments: {
          taskId: createdTaskId,
        },
      });

      expect(response.result).toBeDefined();
      const result = response.result as {
        content: Array<{ text: string }>;
      };
      const task = JSON.parse(result.content[0].text);

      expect(task.status).toBe('DONE');
      expect(task.completed).toBe(true);
    });

    it('should delete task', async () => {
      const response = await sendRequest('tools/call', {
        name: 'delete_task',
        arguments: {
          taskId: createdTaskId,
        },
      });

      expect(response.result).toBeDefined();
      const result = response.result as {
        content: Array<{ text: string }>;
      };
      expect(result.content[0].text).toContain('deleted');
    });

    it('should delete board', async () => {
      const response = await sendRequest('tools/call', {
        name: 'delete_board',
        arguments: {
          boardId: createdBoardId,
        },
      });

      expect(response.result).toBeDefined();
    });
  });

  describe('Resource Reading', () => {
    it('should read task list resource', async () => {
      const response = await sendRequest('resources/read', {
        uri: 'task://list',
      });

      expect(response.result).toBeDefined();
      const result = response.result as {
        contents: Array<{ text: string }>;
      };
      expect(result.contents).toBeDefined();
      expect(Array.isArray(result.contents)).toBe(true);

      const tasks = JSON.parse(result.contents[0].text);
      expect(Array.isArray(tasks)).toBe(true);
    });

    it('should read board list resource', async () => {
      const response = await sendRequest('resources/read', {
        uri: 'board://list',
      });

      expect(response.result).toBeDefined();
      const result = response.result as {
        contents: Array<{ text: string }>;
      };
      expect(result.contents).toBeDefined();

      const boards = JSON.parse(result.contents[0].text);
      expect(Array.isArray(boards)).toBe(true);
    });
  });

  describe('Template Management', () => {
    let templateId: string;

    it('should create a template', async () => {
      const response = await sendRequest('tools/call', {
        name: 'create_template',
        arguments: {
          name: 'Test Template',
          description: 'Template for testing',
          category: 'testing',
          taskTemplate: {
            title: 'Template Task',
            priority: 'MEDIUM',
          },
        },
      });

      expect(response.result).toBeDefined();
      const result = response.result as {
        content: Array<{ text: string }>;
      };
      const template = JSON.parse(result.content[0].text);

      expect(template.id).toBeDefined();
      expect(template.name).toBe('Test Template');

      templateId = template.id;
    });

    it('should list templates', async () => {
      const response = await sendRequest('tools/call', {
        name: 'list_templates',
        arguments: {},
      });

      expect(response.result).toBeDefined();
      const result = response.result as {
        content: Array<{ text: string }>;
      };
      const templates = JSON.parse(result.content[0].text);

      expect(Array.isArray(templates)).toBe(true);
      expect(templates.some((t: { id: string }) => t.id === templateId)).toBe(
        true
      );
    });

    it('should delete template', async () => {
      const response = await sendRequest('tools/call', {
        name: 'delete_template',
        arguments: {
          templateId,
        },
      });

      expect(response.result).toBeDefined();
    });
  });

  describe('Error Handling', () => {
    it('should handle unknown tool', async () => {
      const response = await sendRequest('tools/call', {
        name: 'unknown_tool',
        arguments: {},
      });

      expect(response.result).toBeDefined();
      const result = response.result as {
        content: Array<{ text: string }>;
        isError?: boolean;
      };
      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('Unknown tool');
    });

    it('should handle invalid task ID', async () => {
      const response = await sendRequest('tools/call', {
        name: 'get_task',
        arguments: {
          taskId: 'invalid-task-id',
        },
      });

      expect(response.result).toBeDefined();
      const result = response.result as {
        content: Array<{ text: string }>;
        isError?: boolean;
      };
      expect(result.isError).toBe(true);
    });

    it('should handle missing required arguments', async () => {
      const response = await sendRequest('tools/call', {
        name: 'create_task',
        arguments: {},
      });

      expect(response.result).toBeDefined();
      const result = response.result as {
        content: Array<{ text: string }>;
        isError?: boolean;
      };
      expect(result.isError).toBe(true);
    });
  });

  describe('Performance Tests', () => {
    it('should handle rapid requests', async () => {
      const promises = [];

      for (let i = 0; i < 10; i++) {
        promises.push(sendRequest('tools/list', {}));
      }

      const results = await Promise.all(promises);

      expect(results.length).toBe(10);
      results.forEach(result => {
        expect(result.result).toBeDefined();
      });
    });

    it('should respond within acceptable time', async () => {
      const startTime = Date.now();

      await sendRequest('tools/list', {});

      const duration = Date.now() - startTime;

      // Should respond within 1 second
      expect(duration).toBeLessThan(1000);
    });
  });
});
