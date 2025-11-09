/**
 * Redis Client Utility
 * Week 8: Redis connection management for rate limiting and caching
 */

import Redis from 'ioredis';

// ============================================================================
// Configuration
// ============================================================================

const REDIS_ENABLED = process.env.REDIS_ENABLED === 'true';
const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';
const REDIS_HOST = process.env.REDIS_HOST || 'localhost';
const REDIS_PORT = parseInt(process.env.REDIS_PORT || '6379', 10);
const REDIS_PASSWORD = process.env.REDIS_PASSWORD;
const REDIS_DB = parseInt(process.env.REDIS_DB || '0', 10);

// ============================================================================
// Redis Client Instance
// ============================================================================

let redisClient: Redis | null = null;

/**
 * Get or create Redis client
 */
export function getRedisClient(): Redis | null {
  if (!REDIS_ENABLED) {
    return null;
  }

  if (redisClient) {
    return redisClient;
  }

  try {
    // If REDIS_URL is provided, use it; otherwise use individual config
    if (REDIS_URL && REDIS_URL !== 'redis://localhost:6379') {
      redisClient = new Redis(REDIS_URL, {
        maxRetriesPerRequest: 3,
        enableReadyCheck: true,
        lazyConnect: false,
      });
    } else {
      redisClient = new Redis({
        host: REDIS_HOST,
        port: REDIS_PORT,
        password: REDIS_PASSWORD,
        db: REDIS_DB,
        maxRetriesPerRequest: 3,
        enableReadyCheck: true,
        lazyConnect: false,
      });
    }

    // Event listeners
    redisClient.on('connect', () => {
      console.log('✅ Redis client connected');
    });

    redisClient.on('ready', () => {
      console.log('🟢 Redis client ready');
    });

    redisClient.on('error', error => {
      console.error('❌ Redis client error:', error);
    });

    redisClient.on('close', () => {
      console.log('🔴 Redis connection closed');
    });

    redisClient.on('reconnecting', () => {
      console.log('🔄 Redis reconnecting...');
    });

    return redisClient;
  } catch (error) {
    console.error('Failed to create Redis client:', error);
    return null;
  }
}

/**
 * Close Redis connection
 */
export async function closeRedisClient(): Promise<void> {
  if (redisClient) {
    await redisClient.quit();
    redisClient = null;
    console.log('Redis client connection closed');
  }
}

/**
 * Check if Redis is connected and ready
 */
export function isRedisConnected(): boolean {
  return redisClient?.status === 'ready';
}

/**
 * Get Redis client status
 */
export function getRedisStatus(): {
  enabled: boolean;
  connected: boolean;
  status: string | null;
} {
  return {
    enabled: REDIS_ENABLED,
    connected: isRedisConnected(),
    status: redisClient?.status || null,
  };
}

/**
 * Ping Redis to check connection
 */
export async function pingRedis(): Promise<boolean> {
  if (!redisClient) return false;

  try {
    const result = await redisClient.ping();
    return result === 'PONG';
  } catch (error) {
    console.error('Redis ping failed:', error);
    return false;
  }
}
