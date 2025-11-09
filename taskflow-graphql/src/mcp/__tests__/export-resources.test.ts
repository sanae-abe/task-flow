/**
 * Export Tools and Extended Resources Test Suite
 * Week 5 Day 34-35: Markdown export and resource extensions
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { handleExportBoardAsMarkdown } from '../tools/export-tools.js';
import {
  handleTemplateResource,
  handleTemplateListResource,
  handleTemplateCategoriesResource,
} from '../resources/template-resources.js';
import {
  handleWebhookResource,
  handleWebhookListResource,
  handleWebhookStatsResource,
} from '../resources/webhook-resources.js';
import { db } from '../../utils/indexeddb.js';

describe('Export Tools', () => {
  let testBoardId: string;

  beforeEach(async () => {
    // Create test board with tasks
    const board = await db.addBoard({
      id: crypto.randomUUID(),
      name: 'Test Project Board',
      description: 'Project board for testing export',
      columns: [
        { id: crypto.randomUUID(), name: 'To Do', position: 0 },
        { id: crypto.randomUUID(), name: 'In Progress', position: 1 },
        { id: crypto.randomUUID(), name: 'Done', position: 2 },
      ],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
    testBoardId = board.id;

    // Add test tasks
    await db.addTask({
      id: crypto.randomUUID(),
      title: 'Implement authentication',
      description: 'Add JWT-based authentication',
      boardId: testBoardId,
      columnId: board.columns[0].id,
      status: 'PENDING',
      priority: 'HIGH',
      dueDate: new Date(Date.now() + 86400000).toISOString(),
      labels: [],
      subtasks: [
        {
          id: crypto.randomUUID(),
          title: 'Setup JWT library',
          completed: true,
          position: 0,
        },
        {
          id: crypto.randomUUID(),
          title: 'Create auth endpoints',
          completed: false,
          position: 1,
        },
      ],
      files: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    await db.addTask({
      id: crypto.randomUUID(),
      title: 'Write documentation',
      boardId: testBoardId,
      columnId: board.columns[2].id,
      status: 'COMPLETED',
      priority: 'MEDIUM',
      labels: [],
      subtasks: [],
      files: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  });

  describe('export_board_as_markdown', () => {
    it('should export board as standard markdown', async () => {
      const result = await handleExportBoardAsMarkdown({
        boardId: testBoardId,
        format: 'STANDARD',
      });

      expect(result.content).toBeDefined();
      const data = JSON.parse(result.content[0].text);
      expect(data.success).toBe(true);
      expect(data.export.format).toBe('STANDARD');
      expect(data.markdown).toContain('# Test Project Board');
      expect(data.markdown).toContain('## To Do');
      expect(data.markdown).toContain('Implement authentication');
    });

    it('should export as GitHub-flavored markdown', async () => {
      const result = await handleExportBoardAsMarkdown({
        boardId: testBoardId,
        format: 'GITHUB_FLAVORED',
      });

      const data = JSON.parse(result.content[0].text);
      expect(data.success).toBe(true);
      expect(data.export.format).toBe('GITHUB_FLAVORED');
      expect(data.markdown).toContain('- [ ]'); // GitHub task list syntax
    });

    it('should export as Obsidian markdown', async () => {
      const result = await handleExportBoardAsMarkdown({
        boardId: testBoardId,
        format: 'OBSIDIAN',
      });

      const data = JSON.parse(result.content[0].text);
      expect(data.success).toBe(true);
      expect(data.export.format).toBe('OBSIDIAN');
      expect(data.markdown).toContain('---'); // Frontmatter
      expect(data.markdown).toContain('board:');
    });

    it('should use default STANDARD format', async () => {
      const result = await handleExportBoardAsMarkdown({
        boardId: testBoardId,
      });

      const data = JSON.parse(result.content[0].text);
      expect(data.success).toBe(true);
      expect(data.export.format).toBe('STANDARD');
    });

    it('should respect export options', async () => {
      const result = await handleExportBoardAsMarkdown({
        boardId: testBoardId,
        options: {
          includeSubtasks: false,
          includeLabels: false,
          includeAttachments: false,
          includeMetadata: false,
        },
      });

      const data = JSON.parse(result.content[0].text);
      expect(data.success).toBe(true);
    });

    it('should include export statistics', async () => {
      const result = await handleExportBoardAsMarkdown({
        boardId: testBoardId,
      });

      const data = JSON.parse(result.content[0].text);
      expect(data.export.taskCount).toBe(2);
      expect(data.export.columnCount).toBe(3);
      expect(data.export.sizeBytes).toBeGreaterThan(0);
    });

    it('should handle non-existent board', async () => {
      const result = await handleExportBoardAsMarkdown({
        boardId: 'non-existent-id',
      });

      const data = JSON.parse(result.content[0].text);
      expect(data.success).toBe(false);
      expect(data.error).toContain('not found');
    });
  });
});

describe('Template Resources', () => {
  let testTemplateId: string;

  beforeEach(async () => {
    const template = await db.addTemplate({
      id: crypto.randomUUID(),
      name: 'Bug Fix Template',
      description: 'Standard bug fix workflow',
      category: 'Development',
      isFavorite: true,
      taskData: {
        title: 'Fix: [Bug]',
        priority: 'HIGH',
      },
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
    testTemplateId = template.id;
  });

  describe('template://list resource', () => {
    it('should return list of templates', async () => {
      const result = await handleTemplateListResource();

      expect(result.contents).toBeDefined();
      expect(result.contents[0].uri).toBe('template://list');
      expect(result.contents[0].mimeType).toBe('application/json');

      const data = JSON.parse(result.contents[0].text);
      expect(data.count).toBeGreaterThan(0);
      expect(data.templates).toBeInstanceOf(Array);
    });
  });

  describe('template://{id} resource', () => {
    it('should return template details', async () => {
      const result = await handleTemplateResource(
        `template://${testTemplateId}`
      );

      expect(result.contents).toBeDefined();
      const data = JSON.parse(result.contents[0].text);
      expect(data.id).toBe(testTemplateId);
      expect(data.name).toBe('Bug Fix Template');
      expect(data.taskData).toBeDefined();
    });

    it('should handle non-existent template', async () => {
      const result = await handleTemplateResource('template://non-existent-id');

      const data = JSON.parse(result.contents[0].text);
      expect(data.error).toContain('not found');
    });
  });

  describe('template://categories resource', () => {
    it('should return template categories', async () => {
      const result = await handleTemplateCategoriesResource();

      expect(result.contents).toBeDefined();
      const data = JSON.parse(result.contents[0].text);
      expect(data.count).toBeGreaterThan(0);
      expect(data.categories).toBeInstanceOf(Array);
      expect(data.categories[0]).toHaveProperty('name');
      expect(data.categories[0]).toHaveProperty('count');
      expect(data.categories[0]).toHaveProperty('favorites');
    });
  });
});

describe('Webhook Resources', () => {
  let testWebhookId: string;

  beforeEach(async () => {
    const webhook = await db.addWebhook({
      id: crypto.randomUUID(),
      url: 'https://example.com/webhook',
      events: ['TASK_CREATED', 'TASK_UPDATED'],
      secret: 'test-secret',
      active: true,
      deliveryCount: 10,
      failureCount: 2,
      lastDelivery: Date.now() - 3600000,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
    testWebhookId = webhook.id;
  });

  describe('webhook://list resource', () => {
    it('should return list of webhooks', async () => {
      const result = await handleWebhookListResource();

      expect(result.contents).toBeDefined();
      const data = JSON.parse(result.contents[0].text);
      expect(data.count).toBeGreaterThan(0);
      expect(data.webhooks).toBeInstanceOf(Array);
    });
  });

  describe('webhook://{id} resource', () => {
    it('should return webhook details', async () => {
      const result = await handleWebhookResource(`webhook://${testWebhookId}`);

      expect(result.contents).toBeDefined();
      const data = JSON.parse(result.contents[0].text);
      expect(data.id).toBe(testWebhookId);
      expect(data.url).toBe('https://example.com/webhook');
      expect(data.hasSecret).toBe(true);
      expect(data.successRate).toBeDefined();
    });

    it('should calculate success rate', async () => {
      const result = await handleWebhookResource(`webhook://${testWebhookId}`);

      const data = JSON.parse(result.contents[0].text);
      expect(data.successRate).toBe('80.00'); // (10-2)/10 * 100
    });
  });

  describe('webhook://{id}/deliveries resource', () => {
    it('should return delivery history', async () => {
      const result = await handleWebhookResource(
        `webhook://${testWebhookId}/deliveries`
      );

      expect(result.contents).toBeDefined();
      const data = JSON.parse(result.contents[0].text);
      expect(data.webhook.id).toBe(testWebhookId);
      expect(data.statistics).toBeDefined();
      expect(data.recentDeliveries).toBeInstanceOf(Array);
    });
  });

  describe('webhook://stats resource', () => {
    it('should return webhook statistics', async () => {
      const result = await handleWebhookStatsResource();

      expect(result.contents).toBeDefined();
      const data = JSON.parse(result.contents[0].text);
      expect(data.statistics).toBeDefined();
      expect(data.statistics.totalWebhooks).toBeGreaterThan(0);
      expect(data.statistics.overallSuccessRate).toBeDefined();
      expect(data.topWebhooks).toBeInstanceOf(Array);
    });
  });
});
