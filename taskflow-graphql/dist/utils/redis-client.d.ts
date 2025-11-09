/**
 * Redis Client Utility
 * Week 8: Redis connection management for rate limiting and caching
 */
import Redis from 'ioredis';
/**
 * Get or create Redis client
 */
export declare function getRedisClient(): Redis | null;
/**
 * Close Redis connection
 */
export declare function closeRedisClient(): Promise<void>;
/**
 * Check if Redis is connected and ready
 */
export declare function isRedisConnected(): boolean;
/**
 * Get Redis client status
 */
export declare function getRedisStatus(): {
    enabled: boolean;
    connected: boolean;
    status: string | null;
};
/**
 * Ping Redis to check connection
 */
export declare function pingRedis(): Promise<boolean>;
//# sourceMappingURL=redis-client.d.ts.map