/**
 * Rate Limiter Utility
 * Week 8: Redis-based rate limiting with sliding window algorithm
 */

import { getRedisClient } from './redis-client.js';

// ============================================================================
// Types
// ============================================================================

export interface RateLimitConfig {
  /**
   * Maximum number of requests allowed in the window
   */
  maxRequests: number;

  /**
   * Time window in seconds
   */
  windowSeconds: number;

  /**
   * Key prefix for Redis keys
   */
  keyPrefix?: string;
}

export interface RateLimitResult {
  /**
   * Whether the request is allowed
   */
  allowed: boolean;

  /**
   * Current request count in window
   */
  current: number;

  /**
   * Maximum requests allowed
   */
  limit: number;

  /**
   * Remaining requests in window
   */
  remaining: number;

  /**
   * Unix timestamp when the rate limit resets (in seconds)
   */
  resetAt: number;

  /**
   * Retry after (in seconds) if rate limited
   */
  retryAfter: number;
}

// ============================================================================
// Configuration
// ============================================================================

const DEFAULT_CONFIG: RateLimitConfig = {
  maxRequests: 100, // 100 requests
  windowSeconds: 60, // per minute
  keyPrefix: 'ratelimit:',
};

// ============================================================================
// Rate Limiting Functions
// ============================================================================

/**
 * Check and increment rate limit for a given identifier
 * Uses sliding window algorithm with Redis
 */
export async function checkRateLimit(
  identifier: string,
  config: Partial<RateLimitConfig> = {}
): Promise<RateLimitResult> {
  const redis = getRedisClient();

  // If Redis is not available, allow all requests (fail open)
  if (!redis) {
    return {
      allowed: true,
      current: 0,
      limit: 0,
      remaining: 0,
      resetAt: 0,
      retryAfter: 0,
    };
  }

  const {
    maxRequests,
    windowSeconds,
    keyPrefix,
  } = { ...DEFAULT_CONFIG, ...config };

  const key = `${keyPrefix}${identifier}`;
  const now = Date.now();
  const windowStart = now - windowSeconds * 1000;

  try {
    // Use Redis pipeline for atomic operations
    const pipeline = redis.pipeline();

    // Remove old entries outside the window
    pipeline.zremrangebyscore(key, '-inf', windowStart);

    // Add current request
    pipeline.zadd(key, now, `${now}-${Math.random()}`);

    // Count requests in current window
    pipeline.zcard(key);

    // Set expiry on the key
    pipeline.expire(key, windowSeconds * 2);

    // Execute pipeline
    const results = await pipeline.exec();

    if (!results) {
      throw new Error('Pipeline execution failed');
    }

    // Get count from ZCARD result (3rd command, index 2)
    const countResult = results[2];
    if (!countResult || countResult[0]) {
      throw new Error('Failed to get request count');
    }

    const current = countResult[1] as number;
    const allowed = current <= maxRequests;
    const remaining = Math.max(0, maxRequests - current);

    // Calculate reset time
    const resetAt = Math.ceil((now + windowSeconds * 1000) / 1000);
    const retryAfter = allowed ? 0 : windowSeconds;

    return {
      allowed,
      current,
      limit: maxRequests,
      remaining,
      resetAt,
      retryAfter,
    };
  } catch (error) {
    console.error('Rate limit check error:', error);
    // On error, fail open (allow request)
    return {
      allowed: true,
      current: 0,
      limit: maxRequests,
      remaining: maxRequests,
      resetAt: Math.ceil((now + windowSeconds * 1000) / 1000),
      retryAfter: 0,
    };
  }
}

/**
 * Reset rate limit for a specific identifier
 */
export async function resetRateLimit(
  identifier: string,
  keyPrefix: string = 'ratelimit:'
): Promise<boolean> {
  const redis = getRedisClient();

  if (!redis) {
    return false;
  }

  const key = `${keyPrefix}${identifier}`;

  try {
    await redis.del(key);
    return true;
  } catch (error) {
    console.error('Rate limit reset error:', error);
    return false;
  }
}

/**
 * Get current rate limit status without incrementing
 */
export async function getRateLimitStatus(
  identifier: string,
  config: Partial<RateLimitConfig> = {}
): Promise<RateLimitResult | null> {
  const redis = getRedisClient();

  if (!redis) {
    return null;
  }

  const {
    maxRequests,
    windowSeconds,
    keyPrefix,
  } = { ...DEFAULT_CONFIG, ...config };

  const key = `${keyPrefix}${identifier}`;
  const now = Date.now();
  const windowStart = now - windowSeconds * 1000;

  try {
    // Count requests in current window without modifying
    const current = await redis.zcount(key, windowStart, '+inf');
    const allowed = current < maxRequests;
    const remaining = Math.max(0, maxRequests - current);

    const resetAt = Math.ceil((now + windowSeconds * 1000) / 1000);
    const retryAfter = allowed ? 0 : windowSeconds;

    return {
      allowed,
      current,
      limit: maxRequests,
      remaining,
      resetAt,
      retryAfter,
    };
  } catch (error) {
    console.error('Get rate limit status error:', error);
    return null;
  }
}

/**
 * Batch check rate limits for multiple identifiers
 */
export async function batchCheckRateLimit(
  identifiers: string[],
  config: Partial<RateLimitConfig> = {}
): Promise<Map<string, RateLimitResult>> {
  const results = new Map<string, RateLimitResult>();

  // Process in parallel
  const promises = identifiers.map(async identifier => {
    const result = await checkRateLimit(identifier, config);
    return { identifier, result };
  });

  const settledResults = await Promise.all(promises);

  settledResults.forEach(({ identifier, result }) => {
    results.set(identifier, result);
  });

  return results;
}

/**
 * Get rate limit statistics
 */
export async function getRateLimitStats(
  keyPrefix: string = 'ratelimit:'
): Promise<{
  totalKeys: number;
  activeIdentifiers: string[];
}> {
  const redis = getRedisClient();

  if (!redis) {
    return { totalKeys: 0, activeIdentifiers: [] };
  }

  try {
    const pattern = `${keyPrefix}*`;
    const keys = await redis.keys(pattern);

    const activeIdentifiers = keys.map(key =>
      key.replace(keyPrefix, '')
    );

    return {
      totalKeys: keys.length,
      activeIdentifiers,
    };
  } catch (error) {
    console.error('Get rate limit stats error:', error);
    return { totalKeys: 0, activeIdentifiers: [] };
  }
}
