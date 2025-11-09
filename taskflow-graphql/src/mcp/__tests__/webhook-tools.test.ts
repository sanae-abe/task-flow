/**
 * Webhook Tools Test Suite
 * Week 5 Day 33-34: Webhook management tools
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  handleCreateWebhook,
  handleListWebhooks,
  handleTestWebhook,
  handleUpdateWebhook,
  handleDeleteWebhook,
  handleGetWebhookDeliveries,
} from '../tools/webhook-tools.js';
import { db } from '../../utils/indexeddb.js';

describe('Webhook Tools', () => {
  let testWebhookId: string;

  beforeEach(async () => {
    // Create test webhook
    const webhook = await db.addWebhook({
      id: crypto.randomUUID(),
      url: 'https://example.com/webhook',
      events: ['TASK_CREATED', 'TASK_UPDATED'],
      secret: 'test-secret-key-12345',
      description: 'Test webhook',
      active: true,
      deliveryCount: 0,
      failureCount: 0,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
    testWebhookId = webhook.id;
  });

  describe('create_webhook', () => {
    it('should create a new webhook with HTTPS URL', async () => {
      const result = await handleCreateWebhook({
        url: 'https://api.example.com/webhooks/taskflow',
        events: ['TASK_CREATED', 'BOARD_UPDATED'],
        secret: 'super-secret-key-123456',
        description: 'Production webhook',
      });

      expect(result.content).toBeDefined();
      const data = JSON.parse(result.content[0].text);
      expect(data.success).toBe(true);
      expect(data.webhook.url).toBe(
        'https://api.example.com/webhooks/taskflow'
      );
      expect(data.webhook.events).toEqual(['TASK_CREATED', 'BOARD_UPDATED']);
      expect(data.webhook.active).toBe(true);
      expect(data.security.hasSecret).toBe(true);
    });

    it('should reject non-HTTPS URLs', async () => {
      const result = await handleCreateWebhook({
        url: 'http://example.com/webhook',
        events: ['TASK_CREATED'],
      });

      const data = JSON.parse(result.content[0].text);
      expect(data.success).toBe(false);
      expect(data.error).toContain('HTTPS');
    });

    it('should create webhook without secret', async () => {
      const result = await handleCreateWebhook({
        url: 'https://example.com/webhook2',
        events: ['TASK_DELETED'],
      });

      const data = JSON.parse(result.content[0].text);
      expect(data.success).toBe(true);
      expect(data.security.hasSecret).toBe(false);
      expect(data.security.recommendation).toContain('secret');
    });

    it('should support all event types', async () => {
      const events = [
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
      ];

      const result = await handleCreateWebhook({
        url: 'https://example.com/all-events',
        events: events as any,
      });

      const data = JSON.parse(result.content[0].text);
      expect(data.success).toBe(true);
      expect(data.webhook.events).toHaveLength(events.length);
    });
  });

  describe('list_webhooks', () => {
    it('should list all webhooks', async () => {
      const result = await handleListWebhooks({});

      expect(result.content).toBeDefined();
      const data = JSON.parse(result.content[0].text);
      expect(data.success).toBe(true);
      expect(data.count).toBeGreaterThan(0);
      expect(data.webhooks).toBeInstanceOf(Array);
    });

    it('should filter by active status', async () => {
      // Create inactive webhook
      await db.addWebhook({
        id: crypto.randomUUID(),
        url: 'https://example.com/inactive',
        events: ['TASK_CREATED'],
        active: false,
        deliveryCount: 0,
        failureCount: 0,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });

      const result = await handleListWebhooks({
        active: true,
      });

      const data = JSON.parse(result.content[0].text);
      expect(data.success).toBe(true);
      expect(data.filters.active).toBe(true);
      expect(data.webhooks.every((w: any) => w.active === true)).toBe(true);
    });

    it('should include webhook statistics', async () => {
      const result = await handleListWebhooks({});

      const data = JSON.parse(result.content[0].text);
      expect(data.success).toBe(true);
      data.webhooks.forEach((webhook: any) => {
        expect(webhook).toHaveProperty('deliveryCount');
        expect(webhook).toHaveProperty('failureCount');
        expect(webhook).toHaveProperty('lastDelivery');
      });
    });
  });

  describe('test_webhook', () => {
    it('should test webhook delivery', async () => {
      const result = await handleTestWebhook({
        id: testWebhookId,
      });

      expect(result.content).toBeDefined();
      const data = JSON.parse(result.content[0].text);
      expect(data.webhook.id).toBe(testWebhookId);
      expect(data.test).toBeDefined();
      expect(data.test.timestamp).toBeDefined();
    });

    it('should handle non-existent webhook', async () => {
      const result = await handleTestWebhook({
        id: 'non-existent-id',
      });

      const data = JSON.parse(result.content[0].text);
      expect(data.success).toBe(false);
      expect(data.error).toContain('not found');
    });
  });

  describe('update_webhook', () => {
    it('should update webhook URL', async () => {
      const result = await handleUpdateWebhook({
        id: testWebhookId,
        url: 'https://new-endpoint.example.com/webhook',
      });

      expect(result.content).toBeDefined();
      const data = JSON.parse(result.content[0].text);
      expect(data.success).toBe(true);
      expect(data.webhook.url).toBe('https://new-endpoint.example.com/webhook');
    });

    it('should update webhook events', async () => {
      const result = await handleUpdateWebhook({
        id: testWebhookId,
        events: ['BOARD_CREATED', 'BOARD_DELETED'] as any,
      });

      const data = JSON.parse(result.content[0].text);
      expect(data.success).toBe(true);
      expect(data.webhook.events).toEqual(['BOARD_CREATED', 'BOARD_DELETED']);
    });

    it('should update active status', async () => {
      const result = await handleUpdateWebhook({
        id: testWebhookId,
        active: false,
      });

      const data = JSON.parse(result.content[0].text);
      expect(data.success).toBe(true);
      expect(data.webhook.active).toBe(false);
    });

    it('should reject non-HTTPS URL updates', async () => {
      const result = await handleUpdateWebhook({
        id: testWebhookId,
        url: 'http://insecure.com/webhook',
      });

      const data = JSON.parse(result.content[0].text);
      expect(data.success).toBe(false);
      expect(data.error).toContain('HTTPS');
    });

    it('should handle non-existent webhook', async () => {
      const result = await handleUpdateWebhook({
        id: 'non-existent-id',
        active: false,
      });

      const data = JSON.parse(result.content[0].text);
      expect(data.success).toBe(false);
      expect(data.error).toContain('not found');
    });
  });

  describe('delete_webhook', () => {
    it('should delete webhook', async () => {
      const result = await handleDeleteWebhook({
        id: testWebhookId,
      });

      expect(result.content).toBeDefined();
      const data = JSON.parse(result.content[0].text);
      expect(data.success).toBe(true);
      expect(data.deletedWebhook.id).toBe(testWebhookId);

      // Verify webhook is deleted
      const listResult = await handleListWebhooks({});
      const listData = JSON.parse(listResult.content[0].text);
      expect(
        listData.webhooks.find((w: any) => w.id === testWebhookId)
      ).toBeUndefined();
    });

    it('should handle non-existent webhook', async () => {
      const result = await handleDeleteWebhook({
        id: 'non-existent-id',
      });

      const data = JSON.parse(result.content[0].text);
      expect(data.success).toBe(false);
      expect(data.error).toContain('not found');
    });
  });

  describe('get_webhook_deliveries', () => {
    it('should get webhook delivery history', async () => {
      const result = await handleGetWebhookDeliveries({
        id: testWebhookId,
      });

      expect(result.content).toBeDefined();
      const data = JSON.parse(result.content[0].text);
      expect(data.success).toBe(true);
      expect(data.webhook.id).toBe(testWebhookId);
      expect(data.deliveries).toBeDefined();
      expect(data.deliveries.count).toBeGreaterThanOrEqual(0);
    });

    it('should respect limit parameter', async () => {
      const result = await handleGetWebhookDeliveries({
        id: testWebhookId,
        limit: 10,
      });

      const data = JSON.parse(result.content[0].text);
      expect(data.success).toBe(true);
      expect(data.deliveries.items.length).toBeLessThanOrEqual(10);
    });

    it('should handle non-existent webhook', async () => {
      const result = await handleGetWebhookDeliveries({
        id: 'non-existent-id',
      });

      const data = JSON.parse(result.content[0].text);
      expect(data.success).toBe(false);
      expect(data.error).toContain('not found');
    });
  });
});
