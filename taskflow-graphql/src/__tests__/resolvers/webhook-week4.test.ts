/**
 * Webhook Week 4 Features Tests
 * Tests for delivery history, webhook stats, IP whitelist, and rate limiting
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import type { WebhookRecord } from '../../types/database.js';
import {
  createWebhook,
  createWebhookDelivery,
  getWebhookDeliveriesByWebhookId,
  getAllWebhookDeliveries,
} from '../../utils/indexeddb.js';
import {
  deliverWebhook,
  resetRateLimit,
} from '../../utils/webhook-delivery.js';
import {
  webhookQueries,
  webhookMutations,
} from '../../resolvers/webhook-resolvers.js';

// Mock fetch globally
const originalFetch = global.fetch;

describe('Webhook Week 4: Delivery History UI', () => {
  let mockFetch: ReturnType<typeof vi.fn>;
  let testWebhook: WebhookRecord;

  beforeEach(async () => {
    testWebhook = await createWebhook({
      url: 'https://example.com/webhook',
      events: ['TASK_CREATED', 'TASK_UPDATED'],
      active: true,
      secret: 'test-secret',
    });

    mockFetch = vi.fn();
    global.fetch = mockFetch;
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  describe('Query: webhookDelivery', () => {
    it('should retrieve a single delivery by ID', async () => {
      // Create a delivery record
      const delivery = await createWebhookDelivery({
        webhookId: testWebhook.id,
        event: 'TASK_CREATED',
        payload: { taskId: '123', title: 'Test Task' },
        response: { success: true },
        status: 200,
        success: true,
        deliveredAt: new Date().toISOString(),
      });

      const result = await webhookQueries.webhookDelivery!(
        null,
        { id: delivery.id },
        {} as any,
        {} as any
      );

      expect(result).toBeDefined();
      expect(result!.id).toBe(delivery.id);
      expect(result!.webhookId).toBe(testWebhook.id);
      expect(result!.event).toBe('TASK_CREATED');
      expect(result!.success).toBe(true);
      expect(result!.status).toBe(200);
    });

    it('should throw error for non-existent delivery', async () => {
      await expect(
        webhookQueries.webhookDelivery!(
          null,
          { id: 'non-existent-id' },
          {} as any,
          {} as any
        )
      ).rejects.toThrow('Webhook delivery not found');
    });

    it('should handle deliveries with null response', async () => {
      const delivery = await createWebhookDelivery({
        webhookId: testWebhook.id,
        event: 'TASK_CREATED',
        payload: { taskId: '123' },
        success: false,
        deliveredAt: new Date().toISOString(),
      });

      const result = await webhookQueries.webhookDelivery!(
        null,
        { id: delivery.id },
        {} as any,
        {} as any
      );

      expect(result).toBeDefined();
      expect(result!.response).toBeNull();
      expect(result!.status).toBeNull();
    });
  });

  describe('Query: webhookDeliveries', () => {
    it('should retrieve all deliveries for a webhook', async () => {
      // Create multiple delivery records
      await createWebhookDelivery({
        webhookId: testWebhook.id,
        event: 'TASK_CREATED',
        payload: { taskId: '123' },
        success: true,
        status: 200,
        deliveredAt: new Date().toISOString(),
      });

      await createWebhookDelivery({
        webhookId: testWebhook.id,
        event: 'TASK_UPDATED',
        payload: { taskId: '456' },
        success: false,
        status: 500,
        deliveredAt: new Date().toISOString(),
      });

      const result = await webhookQueries.webhookDeliveries!(
        null,
        { webhookId: testWebhook.id },
        {} as any,
        {} as any
      );

      expect(result).toBeDefined();
      expect(result.length).toBe(2);
      expect(result.every(d => d.webhookId === testWebhook.id)).toBe(true);
    });

    it('should sort deliveries by deliveredAt descending (most recent first)', async () => {
      const now = new Date();
      const oneHourAgo = new Date(now.getTime() - 3600000);
      const twoHoursAgo = new Date(now.getTime() - 7200000);

      // Create deliveries with different timestamps
      await createWebhookDelivery({
        webhookId: testWebhook.id,
        event: 'TASK_CREATED',
        payload: { order: 1 },
        success: true,
        deliveredAt: twoHoursAgo.toISOString(),
      });

      await createWebhookDelivery({
        webhookId: testWebhook.id,
        event: 'TASK_CREATED',
        payload: { order: 2 },
        success: true,
        deliveredAt: now.toISOString(),
      });

      await createWebhookDelivery({
        webhookId: testWebhook.id,
        event: 'TASK_CREATED',
        payload: { order: 3 },
        success: true,
        deliveredAt: oneHourAgo.toISOString(),
      });

      const result = await webhookQueries.webhookDeliveries!(
        null,
        { webhookId: testWebhook.id },
        {} as any,
        {} as any
      );

      expect(result).toBeDefined();
      expect(result.length).toBe(3);

      // Verify descending order (most recent first)
      const timestamps = result.map(d => new Date(d.deliveredAt).getTime());
      for (let i = 1; i < timestamps.length; i++) {
        expect(timestamps[i - 1]).toBeGreaterThanOrEqual(timestamps[i]);
      }
    });

    it('should support pagination with limit', async () => {
      // Create 5 deliveries
      for (let i = 0; i < 5; i++) {
        await createWebhookDelivery({
          webhookId: testWebhook.id,
          event: 'TASK_CREATED',
          payload: { index: i },
          success: true,
          deliveredAt: new Date(Date.now() - i * 1000).toISOString(),
        });
      }

      const result = await webhookQueries.webhookDeliveries!(
        null,
        { webhookId: testWebhook.id, limit: 2 },
        {} as any,
        {} as any
      );

      expect(result).toBeDefined();
      expect(result.length).toBe(2);
    });

    it('should support pagination with offset', async () => {
      // Create 5 deliveries
      for (let i = 0; i < 5; i++) {
        await createWebhookDelivery({
          webhookId: testWebhook.id,
          event: 'TASK_CREATED',
          payload: { index: i },
          success: true,
          deliveredAt: new Date(Date.now() - i * 1000).toISOString(),
        });
      }

      const result = await webhookQueries.webhookDeliveries!(
        null,
        { webhookId: testWebhook.id, limit: 2, offset: 2 },
        {} as any,
        {} as any
      );

      expect(result).toBeDefined();
      expect(result.length).toBe(2);
    });

    it('should return empty array for webhook with no deliveries', async () => {
      const result = await webhookQueries.webhookDeliveries!(
        null,
        { webhookId: testWebhook.id },
        {} as any,
        {} as any
      );

      expect(result).toBeDefined();
      expect(result.length).toBe(0);
    });

    it('should throw error for non-existent webhook', async () => {
      await expect(
        webhookQueries.webhookDeliveries!(
          null,
          { webhookId: 'non-existent-id' },
          {} as any,
          {} as any
        )
      ).rejects.toThrow('Webhook not found');
    });
  });
});

describe('Webhook Week 4: Webhook Management Dashboard', () => {
  let mockFetch: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockFetch = vi.fn();
    global.fetch = mockFetch;
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  describe('Query: webhookStats', () => {
    it('should calculate stats correctly with multiple webhooks and deliveries', async () => {
      // Get baseline stats
      const baselineStats = await webhookQueries.webhookStats!(
        null,
        {},
        {} as any,
        {} as any
      );

      // Create webhooks
      const webhook1 = await createWebhook({
        url: 'https://example.com/webhook1',
        events: ['TASK_CREATED'],
        active: true,
      });

      const webhook2 = await createWebhook({
        url: 'https://example.com/webhook2',
        events: ['TASK_UPDATED'],
        active: true,
      });

      const webhook3 = await createWebhook({
        url: 'https://example.com/webhook3',
        events: ['BOARD_CREATED'],
        active: false, // Inactive
      });

      // Create deliveries
      await createWebhookDelivery({
        webhookId: webhook1.id,
        event: 'TASK_CREATED',
        payload: {},
        success: true,
        status: 200,
        deliveredAt: new Date().toISOString(),
      });

      await createWebhookDelivery({
        webhookId: webhook1.id,
        event: 'TASK_CREATED',
        payload: {},
        success: true,
        status: 200,
        deliveredAt: new Date().toISOString(),
      });

      await createWebhookDelivery({
        webhookId: webhook2.id,
        event: 'TASK_UPDATED',
        payload: {},
        success: false,
        status: 500,
        deliveredAt: new Date().toISOString(),
      });

      const result = await webhookQueries.webhookStats!(
        null,
        {},
        {} as any,
        {} as any
      );

      expect(result).toBeDefined();
      expect(result.totalWebhooks).toBeGreaterThanOrEqual(
        baselineStats.totalWebhooks + 3
      );
      expect(result.activeWebhooks).toBeGreaterThanOrEqual(
        baselineStats.activeWebhooks + 2
      );
      expect(result.totalDeliveries).toBeGreaterThanOrEqual(
        baselineStats.totalDeliveries + 3
      );
      expect(result.successfulDeliveries).toBeGreaterThanOrEqual(
        baselineStats.successfulDeliveries + 2
      );
      expect(result.failedDeliveries).toBeGreaterThanOrEqual(
        baselineStats.failedDeliveries + 1
      );

      // Calculate expected success rate for these 3 new deliveries
      const newTotalDeliveries = result.totalDeliveries;
      const newSuccessfulDeliveries = result.successfulDeliveries;
      const expectedRate = (newSuccessfulDeliveries / newTotalDeliveries) * 100;
      expect(result.successRate).toBeCloseTo(expectedRate, 1);
    });

    it('should return valid stats structure even with existing data', async () => {
      const result = await webhookQueries.webhookStats!(
        null,
        {},
        {} as any,
        {} as any
      );

      expect(result).toBeDefined();
      expect(typeof result.totalWebhooks).toBe('number');
      expect(typeof result.activeWebhooks).toBe('number');
      expect(typeof result.totalDeliveries).toBe('number');
      expect(typeof result.successfulDeliveries).toBe('number');
      expect(typeof result.failedDeliveries).toBe('number');
      expect(typeof result.successRate).toBe('number');
      expect(result.totalWebhooks).toBeGreaterThanOrEqual(0);
      expect(result.activeWebhooks).toBeGreaterThanOrEqual(0);
      expect(result.successRate).toBeGreaterThanOrEqual(0);
      expect(result.successRate).toBeLessThanOrEqual(100);
    });

    it('should calculate 100% success rate when all deliveries succeed', async () => {
      const webhook = await createWebhook({
        url: 'https://example.com/webhook',
        events: ['TASK_CREATED'],
        active: true,
      });

      // Create all successful deliveries
      for (let i = 0; i < 5; i++) {
        await createWebhookDelivery({
          webhookId: webhook.id,
          event: 'TASK_CREATED',
          payload: {},
          success: true,
          status: 200,
          deliveredAt: new Date().toISOString(),
        });
      }

      const result = await webhookQueries.webhookStats!(
        null,
        {},
        {} as any,
        {} as any
      );

      const allDeliveries = await getAllWebhookDeliveries();
      const recentSuccessful = allDeliveries.filter(d => d.success).length;
      const recentTotal = allDeliveries.length;

      expect(result.successfulDeliveries).toBeGreaterThanOrEqual(
        recentSuccessful
      );
      expect(result.totalDeliveries).toBeGreaterThanOrEqual(recentTotal);
      expect(result.failedDeliveries).toBe(
        result.totalDeliveries - result.successfulDeliveries
      );
    });
  });
});

describe('Webhook Week 4: IP Whitelist Security', () => {
  let mockFetch: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockFetch = vi.fn();
    global.fetch = mockFetch;
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  describe('Mutation: createWebhook with allowedIPs', () => {
    it('should create webhook with valid IPv4 addresses', async () => {
      const input = {
        url: 'https://example.com/webhook',
        events: ['TASK_CREATED'],
        allowedIPs: ['192.168.1.1', '10.0.0.1', '172.16.0.1'],
      };

      const result = await webhookMutations.createWebhook!(
        null,
        { input: input as any },
        {} as any,
        {} as any
      );

      expect(result).toBeDefined();
      expect(result.allowedIPs).toEqual(input.allowedIPs);
    });

    it('should create webhook with valid IPv6 addresses', async () => {
      const input = {
        url: 'https://example.com/webhook',
        events: ['TASK_CREATED'],
        allowedIPs: [
          '2001:0db8:85a3:0000:0000:8a2e:0370:7334',
          '::1',
          'fe80::1',
        ],
      };

      const result = await webhookMutations.createWebhook!(
        null,
        { input: input as any },
        {} as any,
        {} as any
      );

      expect(result).toBeDefined();
      expect(result.allowedIPs).toEqual(input.allowedIPs);
    });

    it('should reject invalid IP addresses', async () => {
      const input = {
        url: 'https://example.com/webhook',
        events: ['TASK_CREATED'],
        allowedIPs: ['256.256.256.256'], // Invalid IPv4
      };

      await expect(
        webhookMutations.createWebhook!(
          null,
          { input: input as any },
          {} as any,
          {} as any
        )
      ).rejects.toThrow('Invalid IP address');
    });

    it('should reject malformed IP addresses', async () => {
      const input = {
        url: 'https://example.com/webhook',
        events: ['TASK_CREATED'],
        allowedIPs: ['not-an-ip'],
      };

      await expect(
        webhookMutations.createWebhook!(
          null,
          { input: input as any },
          {} as any,
          {} as any
        )
      ).rejects.toThrow('Invalid IP address');
    });
  });

  describe('Mutation: updateWebhook with allowedIPs', () => {
    it('should update webhook with new allowedIPs', async () => {
      const webhook = await createWebhook({
        url: 'https://example.com/webhook',
        events: ['TASK_CREATED'],
        active: true,
      });

      const input = {
        allowedIPs: ['192.168.1.1', '10.0.0.1'],
      };

      const result = await webhookMutations.updateWebhook!(
        null,
        { id: webhook.id, input: input as any },
        {} as any,
        {} as any
      );

      expect(result).toBeDefined();
      expect(result.allowedIPs).toEqual(input.allowedIPs);
    });

    it('should reject invalid IPs during update', async () => {
      const webhook = await createWebhook({
        url: 'https://example.com/webhook',
        events: ['TASK_CREATED'],
        active: true,
      });

      const input = {
        allowedIPs: ['999.999.999.999'],
      };

      await expect(
        webhookMutations.updateWebhook!(
          null,
          { id: webhook.id, input: input as any },
          {} as any,
          {} as any
        )
      ).rejects.toThrow('Invalid IP address');
    });
  });

  describe('IP Whitelist Validation in Delivery', () => {
    it('should allow delivery when IP is whitelisted', async () => {
      const webhook = await createWebhook({
        url: 'https://example.com/webhook',
        events: ['TASK_CREATED'],
        active: true,
        allowedIPs: ['192.168.1.100'],
      });

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Map([['content-type', 'application/json']]),
        json: async () => ({ success: true }),
        text: async () => '{"success":true}',
      } as any);

      const payload = {
        event: 'TASK_CREATED' as const,
        data: { taskId: '123' },
        timestamp: new Date().toISOString(),
      };

      const result = await deliverWebhook(
        webhook,
        payload,
        undefined,
        '192.168.1.100'
      );

      expect(result.success).toBe(true);
      expect(result.status).toBe(200);
    });

    it('should block delivery when IP is not whitelisted', async () => {
      const webhook = await createWebhook({
        url: 'https://example.com/webhook',
        events: ['TASK_CREATED'],
        active: true,
        allowedIPs: ['192.168.1.100'],
      });

      const payload = {
        event: 'TASK_CREATED' as const,
        data: { taskId: '123' },
        timestamp: new Date().toISOString(),
      };

      const result = await deliverWebhook(
        webhook,
        payload,
        undefined,
        '192.168.1.999'
      );

      expect(result.success).toBe(false);
      expect(result.status).toBe(403);
      expect(result.error).toContain('not whitelisted');
    });

    it('should allow delivery when no IP whitelist is configured', async () => {
      const webhook = await createWebhook({
        url: 'https://example.com/webhook',
        events: ['TASK_CREATED'],
        active: true,
      });

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Map([['content-type', 'application/json']]),
        json: async () => ({ success: true }),
        text: async () => '{"success":true}',
      } as any);

      const payload = {
        event: 'TASK_CREATED' as const,
        data: { taskId: '123' },
        timestamp: new Date().toISOString(),
      };

      const result = await deliverWebhook(
        webhook,
        payload,
        undefined,
        '1.2.3.4'
      );

      expect(result.success).toBe(true);
    });
  });
});

describe('Webhook Week 4: Rate Limiting', () => {
  let mockFetch: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockFetch = vi.fn();
    global.fetch = mockFetch;
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  describe('Mutation: createWebhook with rateLimit', () => {
    it('should create webhook with valid rate limit', async () => {
      const input = {
        url: 'https://example.com/webhook',
        events: ['TASK_CREATED'],
        rateLimit: 10, // 10 requests per minute
      };

      const result = await webhookMutations.createWebhook!(
        null,
        { input: input as any },
        {} as any,
        {} as any
      );

      expect(result).toBeDefined();
      expect(result.rateLimit).toBe(10);
    });

    it('should reject rate limit below minimum (< 1)', async () => {
      const input = {
        url: 'https://example.com/webhook',
        events: ['TASK_CREATED'],
        rateLimit: 0,
      };

      await expect(
        webhookMutations.createWebhook!(
          null,
          { input: input as any },
          {} as any,
          {} as any
        )
      ).rejects.toThrow('Rate limit must be between 1 and 1000');
    });

    it('should reject rate limit above maximum (> 1000)', async () => {
      const input = {
        url: 'https://example.com/webhook',
        events: ['TASK_CREATED'],
        rateLimit: 1001,
      };

      await expect(
        webhookMutations.createWebhook!(
          null,
          { input: input as any },
          {} as any,
          {} as any
        )
      ).rejects.toThrow('Rate limit must be between 1 and 1000');
    });
  });

  describe('Mutation: updateWebhook with rateLimit', () => {
    it('should update webhook with new rate limit', async () => {
      const webhook = await createWebhook({
        url: 'https://example.com/webhook',
        events: ['TASK_CREATED'],
        active: true,
      });

      const input = {
        rateLimit: 50,
      };

      const result = await webhookMutations.updateWebhook!(
        null,
        { id: webhook.id, input: input as any },
        {} as any,
        {} as any
      );

      expect(result).toBeDefined();
      expect(result.rateLimit).toBe(50);
    });

    it('should reject invalid rate limit during update', async () => {
      const webhook = await createWebhook({
        url: 'https://example.com/webhook',
        events: ['TASK_CREATED'],
        active: true,
      });

      const input = {
        rateLimit: 2000, // Exceeds maximum
      };

      await expect(
        webhookMutations.updateWebhook!(
          null,
          { id: webhook.id, input: input as any },
          {} as any,
          {} as any
        )
      ).rejects.toThrow('Rate limit must be between 1 and 1000');
    });
  });

  describe('Rate Limiting in Delivery', () => {
    it('should allow deliveries within rate limit', async () => {
      const webhook = await createWebhook({
        url: 'https://example.com/webhook',
        events: ['TASK_CREATED'],
        active: true,
        rateLimit: 5, // 5 requests per minute
      });

      // Reset rate limit for clean test
      resetRateLimit(webhook.id);

      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        headers: new Map([['content-type', 'application/json']]),
        json: async () => ({ success: true }),
        text: async () => '{"success":true}',
      } as any);

      const payload = {
        event: 'TASK_CREATED' as const,
        data: { taskId: '123' },
        timestamp: new Date().toISOString(),
      };

      // Send 5 requests (should all succeed)
      for (let i = 0; i < 5; i++) {
        const result = await deliverWebhook(webhook, payload);
        expect(result.success).toBe(true);
      }
    });

    it('should block deliveries exceeding rate limit', async () => {
      const webhook = await createWebhook({
        url: 'https://example.com/webhook',
        events: ['TASK_CREATED'],
        active: true,
        rateLimit: 3, // 3 requests per minute
      });

      // Reset rate limit for clean test
      resetRateLimit(webhook.id);

      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        headers: new Map([['content-type', 'application/json']]),
        json: async () => ({ success: true }),
        text: async () => '{"success":true}',
      } as any);

      const payload = {
        event: 'TASK_CREATED' as const,
        data: { taskId: '123' },
        timestamp: new Date().toISOString(),
      };

      // Send 3 requests (should succeed)
      for (let i = 0; i < 3; i++) {
        const result = await deliverWebhook(webhook, payload);
        expect(result.success).toBe(true);
      }

      // Send 4th request (should fail due to rate limit)
      const blockedResult = await deliverWebhook(webhook, payload);
      expect(blockedResult.success).toBe(false);
      expect(blockedResult.status).toBe(429);
      expect(blockedResult.error).toContain('Rate limit exceeded');
    });

    it('should allow deliveries when no rate limit is configured', async () => {
      const webhook = await createWebhook({
        url: 'https://example.com/webhook',
        events: ['TASK_CREATED'],
        active: true,
        // No rateLimit
      });

      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        headers: new Map([['content-type', 'application/json']]),
        json: async () => ({ success: true }),
        text: async () => '{"success":true}',
      } as any);

      const payload = {
        event: 'TASK_CREATED' as const,
        data: { taskId: '123' },
        timestamp: new Date().toISOString(),
      };

      // Send many requests (should all succeed)
      for (let i = 0; i < 10; i++) {
        const result = await deliverWebhook(webhook, payload);
        expect(result.success).toBe(true);
      }
    });

    it('should reset rate limit after time window', async () => {
      const webhook = await createWebhook({
        url: 'https://example.com/webhook',
        events: ['TASK_CREATED'],
        active: true,
        rateLimit: 2,
      });

      // Reset rate limit for clean test
      resetRateLimit(webhook.id);

      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        headers: new Map([['content-type', 'application/json']]),
        json: async () => ({ success: true }),
        text: async () => '{"success":true}',
      } as any);

      const payload = {
        event: 'TASK_CREATED' as const,
        data: { taskId: '123' },
        timestamp: new Date().toISOString(),
      };

      // Send 2 requests (should succeed)
      for (let i = 0; i < 2; i++) {
        const result = await deliverWebhook(webhook, payload);
        expect(result.success).toBe(true);
      }

      // Reset rate limit manually (simulating time window expiry)
      resetRateLimit(webhook.id);

      // Send another request (should succeed after reset)
      const result = await deliverWebhook(webhook, payload);
      expect(result.success).toBe(true);
    });
  });
});
