/**
 * Rate Limiter Utility
 * Week 8: Redis-based rate limiting with sliding window algorithm
 */
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
/**
 * Check and increment rate limit for a given identifier
 * Uses sliding window algorithm with Redis
 */
export declare function checkRateLimit(identifier: string, config?: Partial<RateLimitConfig>): Promise<RateLimitResult>;
/**
 * Reset rate limit for a specific identifier
 */
export declare function resetRateLimit(identifier: string, keyPrefix?: string): Promise<boolean>;
/**
 * Get current rate limit status without incrementing
 */
export declare function getRateLimitStatus(identifier: string, config?: Partial<RateLimitConfig>): Promise<RateLimitResult | null>;
/**
 * Batch check rate limits for multiple identifiers
 */
export declare function batchCheckRateLimit(identifiers: string[], config?: Partial<RateLimitConfig>): Promise<Map<string, RateLimitResult>>;
/**
 * Get rate limit statistics
 */
export declare function getRateLimitStats(keyPrefix?: string): Promise<{
    totalKeys: number;
    activeIdentifiers: string[];
}>;
//# sourceMappingURL=rate-limiter.d.ts.map