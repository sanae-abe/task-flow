/**
 * Rate Limiting Middleware
 * Week 8: Express middleware for rate limiting GraphQL requests
 */
import { checkRateLimit, } from '../utils/rate-limiter.js';
import { extractClientIP } from '../utils/ip-geolocation.js';
// ============================================================================
// Middleware Factory
// ============================================================================
/**
 * Create rate limiting middleware
 */
export function rateLimitMiddleware(options = {}) {
    const { maxRequests = 100, windowSeconds = 60, keyPrefix = 'ratelimit:', skip = false, identifierFn, message, onLimitExceeded, } = options;
    return async (req, res, next) => {
        // Skip rate limiting if disabled
        if (skip) {
            return next();
        }
        try {
            // Get identifier (IP address by default)
            const identifier = identifierFn
                ? identifierFn(req)
                : extractClientIP(req.headers) || 'unknown';
            // Check rate limit
            const config = {
                maxRequests,
                windowSeconds,
                keyPrefix,
            };
            const result = await checkRateLimit(identifier, config);
            // Set rate limit headers
            res.setHeader('X-RateLimit-Limit', result.limit.toString());
            res.setHeader('X-RateLimit-Remaining', result.remaining.toString());
            res.setHeader('X-RateLimit-Reset', result.resetAt.toString());
            // If rate limit exceeded
            if (!result.allowed) {
                res.setHeader('Retry-After', result.retryAfter.toString());
                // Call custom handler if provided
                if (onLimitExceeded) {
                    onLimitExceeded(req, res, result);
                    return;
                }
                // Default response
                res.status(429).json({
                    error: 'Too Many Requests',
                    message: message ||
                        `Rate limit exceeded. Maximum ${result.limit} requests per ${windowSeconds} seconds.`,
                    limit: result.limit,
                    current: result.current,
                    remaining: result.remaining,
                    resetAt: result.resetAt,
                    retryAfter: result.retryAfter,
                });
                return;
            }
            // Request allowed, continue
            next();
        }
        catch (error) {
            // On error, log and allow request (fail open)
            console.error('Rate limit middleware error:', error);
            next();
        }
    };
}
/**
 * Create GraphQL-specific rate limiting middleware
 * More lenient for introspection queries
 */
export function graphqlRateLimitMiddleware(options = {}) {
    return rateLimitMiddleware({
        maxRequests: 100,
        windowSeconds: 60,
        keyPrefix: 'ratelimit:graphql:',
        ...options,
    });
}
/**
 * Create strict rate limiting for mutations
 */
export function mutationRateLimitMiddleware(options = {}) {
    return rateLimitMiddleware({
        maxRequests: 20,
        windowSeconds: 60,
        keyPrefix: 'ratelimit:mutation:',
        identifierFn: (req) => {
            // Extract IP
            const ip = extractClientIP(req.headers);
            // Check if request contains mutation
            const body = req.body;
            const isMutation = body.query?.trim().startsWith('mutation');
            // Only apply to mutations
            return isMutation ? `${ip || 'unknown'}:mutation` : `${ip || 'unknown'}:query`;
        },
        ...options,
    });
}
/**
 * Rate limit by API key or user ID
 */
export function userBasedRateLimitMiddleware(options = {}) {
    return rateLimitMiddleware({
        maxRequests: 1000,
        windowSeconds: 3600, // 1 hour
        keyPrefix: 'ratelimit:user:',
        identifierFn: (req) => {
            // Try to get API key from header
            const apiKey = req.headers['x-api-key'];
            if (apiKey) {
                return `apikey:${apiKey}`;
            }
            // Try to get user ID from header or context (future implementation)
            const userId = req.headers['x-user-id'];
            if (userId) {
                return `user:${userId}`;
            }
            // Fallback to IP
            const ip = extractClientIP(req.headers);
            return `ip:${ip || 'unknown'}`;
        },
        ...options,
    });
}
//# sourceMappingURL=rate-limit.js.map