/**
 * Webhook Resources for MCP
 * Provides URI-based access to webhook data and delivery history
 */

import type { Resource } from '@modelcontextprotocol/sdk/types.js';
import {
  getAllWebhooks,
  getWebhook,
  getWebhookDeliveriesByWebhookId,
} from '../../utils/indexeddb.js';
import type {
  WebhookRecord,
  WebhookDeliveryRecord,
} from '../../types/database.js';

/**
 * Webhook Resource Schemas
 */
export const webhookResourceSchemas: Resource[] = [
  {
    uri: 'webhook://list',
    name: 'All Webhooks',
    description: 'List of all configured webhooks with status',
    mimeType: 'application/json',
  },
  {
    uri: 'webhook://{id}',
    name: 'Webhook Details',
    description: 'Detailed information for a specific webhook',
    mimeType: 'application/json',
  },
  {
    uri: 'webhook://{id}/deliveries',
    name: 'Webhook Delivery History',
    description: 'Delivery history and statistics for a specific webhook',
    mimeType: 'application/json',
  },
  {
    uri: 'webhook://stats',
    name: 'Webhook Statistics',
    description: 'Overall webhook delivery statistics',
    mimeType: 'application/json',
  },
];

/**
 * Handler for webhook://list resource
 */
export async function handleWebhookListResource(): Promise<{
  contents: Array<{ uri: string; mimeType: string; text: string }>;
}> {
  try {
    const webhooks = await getAllWebhooks();

    return {
      contents: [
        {
          uri: 'webhook://list',
          mimeType: 'application/json',
          text: JSON.stringify(
            {
              count: webhooks.length,
              webhooks: webhooks.map((w: WebhookRecord) => ({
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
            },
            null,
            2
          ),
        },
      ],
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return {
      contents: [
        {
          uri: 'webhook://list',
          mimeType: 'application/json',
          text: JSON.stringify({ error: errorMessage }, null, 2),
        },
      ],
    };
  }
}

/**
 * Handler for webhook://{id} resource
 */
export async function handleWebhookDetailResource(id: string): Promise<{
  contents: Array<{ uri: string; mimeType: string; text: string }>;
}> {
  try {
    const webhook = await getWebhook(id);
    if (!webhook) {
      throw new Error(`Webhook not found: ${id}`);
    }

    return {
      contents: [
        {
          uri: `webhook://${id}`,
          mimeType: 'application/json',
          text: JSON.stringify(
            {
              id: webhook.id,
              url: webhook.url,
              events: webhook.events,
              description: webhook.description,
              active: webhook.active,
              hasSecret: !!webhook.secret,
              deliveryCount: webhook.deliveryCount ?? 0,
              failureCount: webhook.failureCount ?? 0,
              successRate:
                (webhook.deliveryCount ?? 0) > 0
                  ? (
                      (((webhook.deliveryCount ?? 0) -
                        (webhook.failureCount ?? 0)) /
                        (webhook.deliveryCount ?? 0)) *
                      100
                    ).toFixed(2)
                  : 'N/A',
              lastDelivery: webhook.lastDelivery,
              createdAt: webhook.createdAt,
              updatedAt: webhook.updatedAt,
            },
            null,
            2
          ),
        },
      ],
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return {
      contents: [
        {
          uri: `webhook://${id}`,
          mimeType: 'application/json',
          text: JSON.stringify({ error: errorMessage }, null, 2),
        },
      ],
    };
  }
}

/**
 * Handler for webhook://{id}/deliveries resource
 */
export async function handleWebhookDeliveriesResource(id: string): Promise<{
  contents: Array<{ uri: string; mimeType: string; text: string }>;
}> {
  try {
    const webhook = await getWebhook(id);
    if (!webhook) {
      throw new Error(`Webhook not found: ${id}`);
    }

    const deliveries = await getWebhookDeliveriesByWebhookId(id);

    // Calculate statistics
    const successCount = deliveries.filter(d => d.success).length;
    const failureCount = deliveries.filter(d => !d.success).length;
    const avgResponseTime =
      deliveries.length > 0
        ? deliveries.reduce(
            (sum: number, d: WebhookDeliveryRecord) =>
              sum + (d.responseTime || 0),
            0
          ) / deliveries.length
        : 0;

    // Group by event type
    const byEvent = deliveries.reduce(
      (acc, d) => {
        if (!acc[d.event]) {
          acc[d.event] = { count: 0, successes: 0, failures: 0 };
        }
        acc[d.event].count++;
        if (d.success) {
          acc[d.event].successes++;
        } else {
          acc[d.event].failures++;
        }
        return acc;
      },
      {} as Record<
        string,
        { count: number; successes: number; failures: number }
      >
    );

    return {
      contents: [
        {
          uri: `webhook://${id}/deliveries`,
          mimeType: 'application/json',
          text: JSON.stringify(
            {
              webhook: {
                id: webhook.id,
                url: webhook.url,
              },
              statistics: {
                totalDeliveries: deliveries.length,
                successCount,
                failureCount,
                successRate:
                  deliveries.length > 0
                    ? `${((successCount / deliveries.length) * 100).toFixed(2)}%`
                    : 'N/A',
                avgResponseTime: `${avgResponseTime.toFixed(0)}ms`,
                byEvent,
              },
              recentDeliveries: deliveries
                .slice(0, 20)
                .map((d: WebhookDeliveryRecord) => ({
                  id: d.id,
                  event: d.event,
                  success: d.success,
                  statusCode: d.statusCode,
                  responseTime: d.responseTime,
                  timestamp: d.timestamp,
                  error: d.error,
                })),
            },
            null,
            2
          ),
        },
      ],
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return {
      contents: [
        {
          uri: `webhook://${id}/deliveries`,
          mimeType: 'application/json',
          text: JSON.stringify({ error: errorMessage }, null, 2),
        },
      ],
    };
  }
}

/**
 * Handler for webhook://stats resource
 */
export async function handleWebhookStatsResource(): Promise<{
  contents: Array<{ uri: string; mimeType: string; text: string }>;
}> {
  try {
    const webhooks = await getAllWebhooks();

    const stats = {
      totalWebhooks: webhooks.length,
      activeWebhooks: webhooks.filter(w => w.active).length,
      inactiveWebhooks: webhooks.filter(w => !w.active).length,
      totalDeliveries: webhooks.reduce(
        (sum, w) => sum + (w.deliveryCount ?? 0),
        0
      ),
      totalFailures: webhooks.reduce(
        (sum, w) => sum + (w.failureCount ?? 0),
        0
      ),
      overallSuccessRate: 0,
      byEvent: {} as Record<string, number>,
    };

    // Calculate overall success rate
    if (stats.totalDeliveries > 0) {
      stats.overallSuccessRate =
        ((stats.totalDeliveries - stats.totalFailures) /
          stats.totalDeliveries) *
        100;
    }

    // Count webhooks by event
    webhooks.forEach(webhook => {
      webhook.events.forEach(event => {
        stats.byEvent[event] = (stats.byEvent[event] || 0) + 1;
      });
    });

    return {
      contents: [
        {
          uri: 'webhook://stats',
          mimeType: 'application/json',
          text: JSON.stringify(
            {
              statistics: {
                ...stats,
                overallSuccessRate: `${stats.overallSuccessRate.toFixed(2)}%`,
              },
              topWebhooks: webhooks
                .sort((a, b) => (b.deliveryCount ?? 0) - (a.deliveryCount ?? 0))
                .slice(0, 5)
                .map(w => ({
                  id: w.id,
                  url: w.url,
                  deliveryCount: w.deliveryCount ?? 0,
                  failureCount: w.failureCount ?? 0,
                  successRate:
                    (w.deliveryCount ?? 0) > 0
                      ? `${(
                          (((w.deliveryCount ?? 0) - (w.failureCount ?? 0)) /
                            (w.deliveryCount ?? 0)) *
                          100
                        ).toFixed(2)}%`
                      : 'N/A',
                })),
            },
            null,
            2
          ),
        },
      ],
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return {
      contents: [
        {
          uri: 'webhook://stats',
          mimeType: 'application/json',
          text: JSON.stringify({ error: errorMessage }, null, 2),
        },
      ],
    };
  }
}

/**
 * Main resource handler
 */
export async function handleWebhookResource(uri: string): Promise<{
  contents: Array<{ uri: string; mimeType: string; text: string }>;
}> {
  if (uri === 'webhook://list') {
    return handleWebhookListResource();
  } else if (uri === 'webhook://stats') {
    return handleWebhookStatsResource();
  } else if (uri.includes('/deliveries')) {
    const id = uri.replace('webhook://', '').replace('/deliveries', '');
    return handleWebhookDeliveriesResource(id);
  } else if (uri.startsWith('webhook://')) {
    const id = uri.replace('webhook://', '');
    return handleWebhookDetailResource(id);
  }

  throw new Error(`Unknown webhook resource URI: ${uri}`);
}
