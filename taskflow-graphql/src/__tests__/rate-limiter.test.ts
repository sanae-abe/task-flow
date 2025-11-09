/**
 * Rate Limiter Tests
 * Week 8: Test Redis-based rate limiting functionality
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  checkRateLimit,
  resetRateLimit,
  getRateLimitStatus,
  batchCheckRateLimit,
  getRateLimitStats,
} from '../utils/rate-limiter.js';
import * as redisClient from '../utils/redis-client.js';
import type Redis from 'ioredis';

// Mock Redis client
vi.mock('../utils/redis-client.js', () => ({
  getRedisClient: vi.fn(() => null), // Default: Redis not available
  closeRedisClient: vi.fn(),
  isRedisConnected: vi.fn(() => false),
  getRedisStatus: vi.fn(() => ({ enabled: false, connected: false, status: null })),
  pingRedis: vi.fn(() => Promise.resolve(false)),
}));

describe('Rate Limiter', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('checkRateLimit - No Redis', () => {
    it('should allow all requests when Redis is not available', async () => {
      const result = await checkRateLimit('test-user');

      expect(result.allowed).toBe(true);
      expect(result.current).toBe(0);
      expect(result.limit).toBe(0);
      expect(result.remaining).toBe(0);
    });

    it('should handle custom configuration when Redis is not available', async () => {
      const result = await checkRateLimit('test-user', {
        maxRequests: 50,
        windowSeconds: 120,
      });

      expect(result.allowed).toBe(true);
      expect(result.limit).toBe(0);
    });
  });

  describe('checkRateLimit - With Redis', () => {
    let mockRedis: Partial<Redis>;

    beforeEach(() => {
      // Create a mock Redis instance
      mockRedis = {
        pipeline: vi.fn(() => ({
          zremrangebyscore: vi.fn().mockReturnThis(),
          zadd: vi.fn().mockReturnThis(),
          zcard: vi.fn().mockReturnThis(),
          expire: vi.fn().mockReturnThis(),
          exec: vi.fn().mockResolvedValue([
            [null, 0], // zremrangebyscore
            [null, 1], // zadd
            [null, 1], // zcard (count = 1)
            [null, 1], // expire
          ]),
        })) as unknown,
        status: 'ready',
      };

      // Override mock to return our Redis instance
      vi.mocked(redisClient.getRedisClient).mockReturnValue(mockRedis as Redis);
    });

    it('should allow request when under limit', async () => {
      const result = await checkRateLimit('test-user', {
        maxRequests: 10,
        windowSeconds: 60,
      });

      expect(result.allowed).toBe(true);
      expect(result.current).toBe(1);
      expect(result.limit).toBe(10);
      expect(result.remaining).toBe(9);
      expect(mockRedis.pipeline).toHaveBeenCalled();
    });

    it('should block request when limit exceeded', async () => {
      // Mock Redis to return count > maxRequests
      const pipelineExecMock = vi.fn().mockResolvedValue([
        [null, 0],
        [null, 1],
        [null, 11], // Count exceeds limit
        [null, 1],
      ]);

      mockRedis.pipeline = vi.fn(() => ({
        zremrangebyscore: vi.fn().mockReturnThis(),
        zadd: vi.fn().mockReturnThis(),
        zcard: vi.fn().mockReturnThis(),
        expire: vi.fn().mockReturnThis(),
        exec: pipelineExecMock,
      })) as unknown;

      const result = await checkRateLimit('test-user', {
        maxRequests: 10,
        windowSeconds: 60,
      });

      expect(result.allowed).toBe(false);
      expect(result.current).toBe(11);
      expect(result.limit).toBe(10);
      expect(result.remaining).toBe(0);
      expect(result.retryAfter).toBe(60);
    });

    it('should use custom key prefix', async () => {
      const pipelineInstance = {
        zremrangebyscore: vi.fn().mockReturnThis(),
        zadd: vi.fn().mockReturnThis(),
        zcard: vi.fn().mockReturnThis(),
        expire: vi.fn().mockReturnThis(),
        exec: vi.fn().mockResolvedValue([
          [null, 0],
          [null, 1],
          [null, 5],
          [null, 1],
        ]),
      };

      mockRedis.pipeline = vi.fn(() => pipelineInstance) as unknown;

      await checkRateLimit('test-user', {
        keyPrefix: 'custom:',
        maxRequests: 100,
        windowSeconds: 60,
      });

      // The key should be constructed with custom prefix
      expect(mockRedis.pipeline).toHaveBeenCalled();
    });

    it('should handle Redis errors gracefully', async () => {
      // Mock pipeline to throw error
      mockRedis.pipeline = vi.fn(() => {
        throw new Error('Redis connection error');
      }) as unknown;

      const result = await checkRateLimit('test-user');

      // Should fail open (allow request)
      expect(result.allowed).toBe(true);
    });
  });

  describe('resetRateLimit', () => {
    it('should return false when Redis is not available', async () => {
      const result = await resetRateLimit('test-user');

      expect(result).toBe(false);
    });

    it('should delete rate limit key when Redis is available', async () => {
      const mockRedis = {
        del: vi.fn().mockResolvedValue(1),
        status: 'ready',
      } as unknown as Redis;

      vi.mocked(redisClient.getRedisClient).mockReturnValue(mockRedis);

      const result = await resetRateLimit('test-user', 'custom:');

      expect(result).toBe(true);
      expect(mockRedis.del).toHaveBeenCalledWith('custom:test-user');
    });

    it('should handle deletion errors', async () => {
      const mockRedis = {
        del: vi.fn().mockRejectedValue(new Error('Delete failed')),
        status: 'ready',
      } as unknown as Redis;

      vi.mocked(redisClient.getRedisClient).mockReturnValue(mockRedis);

      const result = await resetRateLimit('test-user');

      expect(result).toBe(false);
    });
  });

  describe('getRateLimitStatus', () => {
    it('should return null when Redis is not available', async () => {
      const result = await getRateLimitStatus('test-user');

      expect(result).toBeNull();
    });

    it('should return current status without incrementing', async () => {
      const mockRedis = {
        zcount: vi.fn().mockResolvedValue(5),
        status: 'ready',
      } as unknown as Redis;

      vi.mocked(redisClient.getRedisClient).mockReturnValue(mockRedis);

      const result = await getRateLimitStatus('test-user', {
        maxRequests: 10,
        windowSeconds: 60,
      });

      expect(result).toBeTruthy();
      expect(result?.current).toBe(5);
      expect(result?.limit).toBe(10);
      expect(result?.remaining).toBe(5);
      expect(result?.allowed).toBe(true);
    });

    it('should handle errors gracefully', async () => {
      const mockRedis = {
        zcount: vi.fn().mockRejectedValue(new Error('Query failed')),
        status: 'ready',
      } as unknown as Redis;

      vi.mocked(redisClient.getRedisClient).mockReturnValue(mockRedis);

      const result = await getRateLimitStatus('test-user');

      expect(result).toBeNull();
    });
  });

  describe('batchCheckRateLimit', () => {
    it('should handle empty identifiers array', async () => {
      const results = await batchCheckRateLimit([]);

      expect(results.size).toBe(0);
    });

    it('should process multiple identifiers', async () => {
      const identifiers = ['user1', 'user2', 'user3'];

      const results = await batchCheckRateLimit(identifiers);

      expect(results.size).toBe(3);
      identifiers.forEach(id => {
        expect(results.has(id)).toBe(true);
        expect(results.get(id)?.allowed).toBe(true);
      });
    });
  });

  describe('getRateLimitStats', () => {
    it('should return empty stats when Redis is not available', async () => {
      const stats = await getRateLimitStats();

      expect(stats.totalKeys).toBe(0);
      expect(stats.activeIdentifiers).toEqual([]);
    });

    it('should return stats when Redis is available', async () => {
      const mockRedis = {
        keys: vi.fn().mockResolvedValue([
          'ratelimit:user1',
          'ratelimit:user2',
          'ratelimit:user3',
        ]),
        status: 'ready',
      } as unknown as Redis;

      vi.mocked(redisClient.getRedisClient).mockReturnValue(mockRedis);

      const stats = await getRateLimitStats('ratelimit:');

      expect(stats.totalKeys).toBe(3);
      expect(stats.activeIdentifiers).toEqual(['user1', 'user2', 'user3']);
    });

    it('should handle errors gracefully', async () => {
      const mockRedis = {
        keys: vi.fn().mockRejectedValue(new Error('Keys query failed')),
        status: 'ready',
      } as unknown as Redis;

      vi.mocked(redisClient.getRedisClient).mockReturnValue(mockRedis);

      const stats = await getRateLimitStats();

      expect(stats.totalKeys).toBe(0);
      expect(stats.activeIdentifiers).toEqual([]);
    });
  });
});
