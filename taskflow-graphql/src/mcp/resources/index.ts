/**
 * MCP Resources Index
 * Exports all resource definitions and readers
 * Week 5 Day 32-35: Extended with Template and Webhook resources
 */

// Base resources
import { taskResources, readTaskResource } from './task-resources.js';
import { boardResources, readBoardResource } from './board-resources.js';

// Extended resources (Week 5 Day 34-35)
import {
  templateResourceSchemas,
  handleTemplateResource,
} from './template-resources.js';
import {
  webhookResourceSchemas,
  handleWebhookResource,
} from './webhook-resources.js';

// Export all resources
export const allResources = [
  ...taskResources,
  ...boardResources,
  ...templateResourceSchemas,
  ...webhookResourceSchemas,
];

/**
 * Resource cache with 60-second TTL
 * Week 7 Day 43-49: Performance optimization
 */
interface CacheEntry {
  data: any;
  timestamp: number;
}

const resourceCache = new Map<string, CacheEntry>();
const CACHE_TTL = 60000; // 60 seconds

/**
 * Clean expired cache entries
 */
function cleanExpiredCache(): void {
  const now = Date.now();
  for (const [key, value] of resourceCache.entries()) {
    if (now - value.timestamp >= CACHE_TTL) {
      resourceCache.delete(key);
    }
  }
}

/**
 * Read resource directly (without cache)
 */
async function readResourceDirect(uri: string) {
  // Determine resource type from URI
  if (uri.startsWith('task://')) {
    return readTaskResource(uri);
  }

  if (uri.startsWith('board://')) {
    return readBoardResource(uri);
  }

  if (uri.startsWith('template://')) {
    return handleTemplateResource(uri);
  }

  if (uri.startsWith('webhook://')) {
    return handleWebhookResource(uri);
  }

  throw new Error(`Unknown resource URI scheme: ${uri}`);
}

/**
 * Read resource by URI with caching (60s TTL)
 * Week 7 Day 43-49: Performance optimization
 */
export async function readResource(uri: string) {
  const cached = resourceCache.get(uri);
  const now = Date.now();

  // Return cached data if still valid
  if (cached && now - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }

  // Fetch fresh data
  const data = await readResourceDirect(uri);

  // Store in cache
  resourceCache.set(uri, { data, timestamp: now });

  // Auto-cleanup old entries (run periodically)
  if (resourceCache.size % 10 === 0) {
    cleanExpiredCache();
  }

  return data;
}

/**
 * Clear resource cache (useful for testing)
 */
export function clearResourceCache(): void {
  resourceCache.clear();
}
