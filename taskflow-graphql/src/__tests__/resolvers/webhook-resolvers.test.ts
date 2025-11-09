/**
 * Webhook Resolvers Tests
 * Comprehensive test suite for webhook functionality
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import type { WebhookRecord } from '../../types/database.js';
import {
  createWebhook,
  getAllWebhooks,
  getWebhook,
  updateWebhook,
  deleteWebhook,
} from '../../utils/indexeddb.js';
import {
  deliverWebhook,
  testWebhookDelivery,
  verifyWebhookSignature,
} from '../../utils/webhook-delivery.js';
import {
  webhookQueries,
  webhookMutations,
} from '../../resolvers/webhook-resolvers.js';

// Mock fetch globally
const originalFetch = global.fetch;

describe('Webhook Resolvers', () => {
  let mockFetch: ReturnType<typeof vi.fn>;
  let testWebhook: WebhookRecord;

  beforeEach(async () => {
    // Create a test webhook
    testWebhook = await createWebhook({
      url: 'https://example.com/webhook',
      events: ['TASK_CREATED', 'TASK_UPDATED'],
      active: true,
      secret: 'test-secret-key',
    });

    // Setup mock fetch
    mockFetch = vi.fn();
    global.fetch = mockFetch;
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  describe('Query: webhook', () => {
    it('should retrieve a webhook by ID', async () => {
      const result = await webhookQueries.webhook!(
        null,
        { id: testWebhook.id },
        {} as any,
        {} as any
      );

      expect(result).toBeDefined();
      expect(result!.id).toBe(testWebhook.id);
      expect(result!.url).toBe('https://example.com/webhook');
      expect(result!.events).toContain('TASK_CREATED');
    });

    it('should throw error for non-existent webhook', async () => {
      await expect(
        webhookQueries.webhook!(
          null,
          { id: 'non-existent-id' },
          {} as any,
          {} as any
        )
      ).rejects.toThrow('Webhook not found');
    });
  });

  describe('Query: webhooks', () => {
    it('should retrieve all webhooks', async () => {
      // Create additional webhook
      await createWebhook({
        url: 'https://example.com/webhook2',
        events: ['BOARD_CREATED'],
        active: true,
      });

      const result = await webhookQueries.webhooks!(
        null,
        {},
        {} as any,
        {} as any
      );

      expect(result).toBeDefined();
      expect(result.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe('Mutation: createWebhook', () => {
    it('should create a new webhook', async () => {
      const input = {
        url: 'https://example.com/new-webhook',
        events: ['TASK_DELETED', 'BOARD_UPDATED'],
        secret: 'new-secret',
      };

      const result = await webhookMutations.createWebhook!(
        null,
        { input: input as any },
        {} as any,
        {} as any
      );

      expect(result).toBeDefined();
      expect(result.url).toBe(input.url);
      expect(result.events).toEqual(input.events);
      expect(result.active).toBe(true);
      expect(result.secret).toBe(input.secret);
    });

    it('should reject invalid URL', async () => {
      const input = {
        url: 'not-a-valid-url',
        events: ['TASK_CREATED'],
      };

      await expect(
        webhookMutations.createWebhook!(
          null,
          { input: input as any },
          {} as any,
          {} as any
        )
      ).rejects.toThrow('Invalid webhook URL');
    });

    it('should reject empty events array', async () => {
      const input = {
        url: 'https://example.com/webhook',
        events: [],
      };

      await expect(
        webhookMutations.createWebhook!(
          null,
          { input: input as any },
          {} as any,
          {} as any
        )
      ).rejects.toThrow('At least one event must be specified');
    });
  });

  describe('Mutation: updateWebhook', () => {
    it('should update webhook URL', async () => {
      const input = {
        url: 'https://example.com/updated-webhook',
      };

      const result = await webhookMutations.updateWebhook!(
        null,
        { id: testWebhook.id, input: input as any },
        {} as any,
        {} as any
      );

      expect(result).toBeDefined();
      expect(result.url).toBe(input.url);
    });

    it('should update webhook events', async () => {
      const input = {
        events: ['BOARD_CREATED', 'BOARD_DELETED'],
      };

      const result = await webhookMutations.updateWebhook!(
        null,
        { id: testWebhook.id, input: input as any },
        {} as any,
        {} as any
      );

      expect(result).toBeDefined();
      expect(result.events).toEqual(input.events);
    });

    it('should deactivate webhook', async () => {
      const input = {
        active: false,
      };

      const result = await webhookMutations.updateWebhook!(
        null,
        { id: testWebhook.id, input: input as any },
        {} as any,
        {} as any
      );

      expect(result).toBeDefined();
      expect(result.active).toBe(false);
    });

    it('should throw error for non-existent webhook', async () => {
      await expect(
        webhookMutations.updateWebhook!(
          null,
          { id: 'non-existent-id', input: { active: false } as any },
          {} as any,
          {} as any
        )
      ).rejects.toThrow('Webhook not found');
    });
  });

  describe('Mutation: deleteWebhook', () => {
    it('should delete a webhook', async () => {
      const result = await webhookMutations.deleteWebhook!(
        null,
        { id: testWebhook.id },
        {} as any,
        {} as any
      );

      expect(result).toBe(true);

      // Verify deletion
      const deleted = await getWebhook(testWebhook.id);
      expect(deleted).toBeNull();
    });

    it('should throw error for non-existent webhook', async () => {
      await expect(
        webhookMutations.deleteWebhook!(
          null,
          { id: 'non-existent-id' },
          {} as any,
          {} as any
        )
      ).rejects.toThrow('Webhook not found');
    });
  });

  describe('Mutation: testWebhook', () => {
    it('should successfully test webhook with mock server', async () => {
      // Mock successful response
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Map([['content-type', 'application/json']]),
        json: async () => ({ success: true }),
        text: async () => '{"success":true}',
      } as any);

      const result = await webhookMutations.testWebhook!(
        null,
        { id: testWebhook.id },
        {} as any,
        {} as any
      );

      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(result.webhookId).toBe(testWebhook.id);
      expect(result.event).toBe('TASK_CREATED');
      expect(mockFetch).toHaveBeenCalledWith(
        testWebhook.url,
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            'X-Webhook-Event': 'TASK_CREATED',
          }),
        })
      );
    });

    it('should include HMAC signature when secret is set', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Map([['content-type', 'application/json']]),
        json: async () => ({ success: true }),
        text: async () => '{"success":true}',
      } as any);

      await webhookMutations.testWebhook!(
        null,
        { id: testWebhook.id },
        {} as any,
        {} as any
      );

      expect(mockFetch).toHaveBeenCalledWith(
        testWebhook.url,
        expect.objectContaining({
          headers: expect.objectContaining({
            'X-Webhook-Signature': expect.stringContaining('sha256='),
          }),
        })
      );
    });

    it('should throw error for inactive webhook', async () => {
      // Deactivate webhook
      await updateWebhook(testWebhook.id, { active: false });

      await expect(
        webhookMutations.testWebhook!(
          null,
          { id: testWebhook.id },
          {} as any,
          {} as any
        )
      ).rejects.toThrow('Cannot test an inactive webhook');
    });

    it('should throw error when webhook delivery fails', async () => {
      // Mock failed response
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        headers: new Map([['content-type', 'application/json']]),
        json: async () => ({ error: 'Internal Server Error' }),
        text: async () => '{"error":"Internal Server Error"}',
      } as any);

      await expect(
        webhookMutations.testWebhook!(
          null,
          { id: testWebhook.id },
          {} as any,
          {} as any
        )
      ).rejects.toThrow('Webhook test failed');
    });
  });
});

describe('Webhook Delivery System', () => {
  let mockFetch: ReturnType<typeof vi.fn>;
  let testWebhook: WebhookRecord;

  beforeEach(async () => {
    testWebhook = await createWebhook({
      url: 'https://example.com/webhook',
      events: ['TASK_CREATED'],
      active: true,
      secret: 'test-secret',
    });

    mockFetch = vi.fn();
    global.fetch = mockFetch;
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  describe('deliverWebhook', () => {
    it('should deliver webhook successfully', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Map([['content-type', 'application/json']]),
        json: async () => ({ received: true }),
        text: async () => '{"received":true}',
      } as any);

      const payload = {
        event: 'TASK_CREATED' as const,
        data: { task: { id: '123', title: 'Test Task' } },
        timestamp: new Date().toISOString(),
      };

      const result = await deliverWebhook(testWebhook, payload);

      expect(result.success).toBe(true);
      expect(result.status).toBe(200);
      expect(result.attempts).toBe(1);
    });

    it('should retry on failure', async () => {
      // Mock 2 failures then success
      mockFetch
        .mockRejectedValueOnce(new Error('Network error'))
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          headers: new Map([['content-type', 'application/json']]),
          json: async () => ({ success: true }),
          text: async () => '{"success":true}',
        } as any);

      const payload = {
        event: 'TASK_CREATED' as const,
        data: { task: { id: '123' } },
        timestamp: new Date().toISOString(),
      };

      const result = await deliverWebhook(testWebhook, payload, {
        timeout: 5000,
        maxRetries: 3,
        retryDelays: [10, 20, 30], // Shorter delays for testing
      });

      expect(result.success).toBe(true);
      expect(result.attempts).toBe(3);
      expect(mockFetch).toHaveBeenCalledTimes(3);
    });

    it('should fail after max retries', async () => {
      mockFetch.mockRejectedValue(new Error('Persistent error'));

      const payload = {
        event: 'TASK_CREATED' as const,
        data: { task: { id: '123' } },
        timestamp: new Date().toISOString(),
      };

      const result = await deliverWebhook(testWebhook, payload, {
        timeout: 5000,
        maxRetries: 3,
        retryDelays: [10, 20, 30],
      });

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.attempts).toBe(3);
    });

    it('should handle timeout', async () => {
      // Mock fetch to reject with timeout error
      mockFetch.mockRejectedValueOnce(
        Object.assign(new Error('The operation was aborted'), {
          name: 'AbortError',
        })
      );

      const payload = {
        event: 'TASK_CREATED' as const,
        data: { task: { id: '123' } },
        timestamp: new Date().toISOString(),
      };

      const result = await deliverWebhook(testWebhook, payload, {
        timeout: 50, // Very short timeout
        maxRetries: 1,
        retryDelays: [10],
      });

      // The delivery should fail due to timeout
      expect(result.success).toBe(false);
      expect(result.attempts).toBe(1);
    });
  });

  describe('HMAC Signature', () => {
    it('should verify valid signature', () => {
      const payload = JSON.stringify({ test: 'data' });
      const secret = 'test-secret';

      // Generate signature
      const crypto = require('crypto');
      const hmac = crypto.createHmac('sha256', secret);
      hmac.update(payload);
      const signature = `sha256=${hmac.digest('hex')}`;

      const isValid = verifyWebhookSignature(payload, signature, secret);
      expect(isValid).toBe(true);
    });

    it('should reject invalid signature', () => {
      const payload = JSON.stringify({ test: 'data' });
      const secret = 'test-secret';
      const invalidSignature = 'sha256=invalid';

      const isValid = verifyWebhookSignature(payload, invalidSignature, secret);
      expect(isValid).toBe(false);
    });

    it('should reject tampered payload', () => {
      const originalPayload = JSON.stringify({ test: 'data' });
      const tamperedPayload = JSON.stringify({ test: 'tampered' });
      const secret = 'test-secret';

      const crypto = require('crypto');
      const hmac = crypto.createHmac('sha256', secret);
      hmac.update(originalPayload);
      const signature = `sha256=${hmac.digest('hex')}`;

      const isValid = verifyWebhookSignature(
        tamperedPayload,
        signature,
        secret
      );
      expect(isValid).toBe(false);
    });
  });
});
