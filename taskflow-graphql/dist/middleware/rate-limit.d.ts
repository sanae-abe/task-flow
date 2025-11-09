/**
 * Rate Limiting Middleware
 * Week 8: Express middleware for rate limiting GraphQL requests
 */
import type { Request, Response, NextFunction } from 'express';
import { type RateLimitResult } from '../utils/rate-limiter.js';
export interface RateLimitOptions {
    /**
     * Maximum number of requests allowed in the window
     */
    maxRequests?: number;
    /**
     * Time window in seconds
     */
    windowSeconds?: number;
    /**
     * Key prefix for Redis keys
     */
    keyPrefix?: string;
    /**
     * Whether to skip rate limiting (for development)
     */
    skip?: boolean;
    /**
     * Custom identifier function (default: uses client IP)
     */
    identifierFn?: (req: Request) => string;
    /**
     * Custom error message
     */
    message?: string;
    /**
     * Custom handler for rate limit exceeded
     */
    onLimitExceeded?: (req: Request, res: Response, result: RateLimitResult) => void;
}
/**
 * Create rate limiting middleware
 */
export declare function rateLimitMiddleware(options?: RateLimitOptions): (req: Request, res: Response, next: NextFunction) => Promise<void>;
/**
 * Create GraphQL-specific rate limiting middleware
 * More lenient for introspection queries
 */
export declare function graphqlRateLimitMiddleware(options?: RateLimitOptions): (req: Request, res: Response, next: NextFunction) => Promise<void>;
/**
 * Create strict rate limiting for mutations
 */
export declare function mutationRateLimitMiddleware(options?: RateLimitOptions): (req: Request, res: Response, next: NextFunction) => Promise<void>;
/**
 * Rate limit by API key or user ID
 */
export declare function userBasedRateLimitMiddleware(options?: RateLimitOptions): (req: Request, res: Response, next: NextFunction) => Promise<void>;
//# sourceMappingURL=rate-limit.d.ts.map