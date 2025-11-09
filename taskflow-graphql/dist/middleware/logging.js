/**
 * Logging Middleware
 * Week 8: HTTP request/response logging with request ID
 */
import { v4 as uuidv4 } from 'uuid';
import { logRequest, logResponse, createRequestLogger } from '../utils/logger.js';
import { extractClientIP } from '../utils/ip-geolocation.js';
// ============================================================================
// Middleware Functions
// ============================================================================
/**
 * Request ID middleware
 * Adds unique request ID to each request
 */
export function requestIdMiddleware(req, _res, next) {
    // Generate or extract request ID
    req.requestId =
        req.headers['x-request-id'] ||
            req.headers['x-correlation-id'] ||
            uuidv4();
    next();
}
/**
 * Request logger middleware
 * Creates request-scoped logger
 */
export function requestLoggerMiddleware(req, _res, next) {
    if (!req.requestId) {
        req.requestId = uuidv4();
    }
    const clientIP = extractClientIP(req.headers);
    // Create request-scoped logger
    req.log = createRequestLogger(req.requestId, clientIP || undefined);
    next();
}
/**
 * HTTP logging middleware
 * Logs all HTTP requests and responses
 */
export function httpLoggingMiddleware(req, res, next) {
    // Set start time for duration calculation
    req.startTime = process.hrtime();
    if (!req.requestId) {
        req.requestId = uuidv4();
    }
    const clientIP = extractClientIP(req.headers);
    // Log request
    logRequest({
        method: req.method,
        url: req.url,
        ip: clientIP || undefined,
        requestId: req.requestId,
    });
    // Intercept response finish
    const originalSend = res.send;
    res.send = function (body) {
        // Calculate duration
        const hrDuration = process.hrtime(req.startTime);
        const duration = hrDuration[0] * 1000 + hrDuration[1] / 1000000; // Convert to ms
        // Log response
        logResponse({
            method: req.method,
            url: req.url,
            statusCode: res.statusCode,
            duration: Math.round(duration * 100) / 100, // Round to 2 decimal places
            ip: clientIP || undefined,
            requestId: req.requestId,
        });
        // Call original send
        return originalSend.call(this, body);
    };
    next();
}
/**
 * Error logging middleware
 * Logs unhandled errors
 */
export function errorLoggingMiddleware(error, req, _res, next) {
    const clientIP = extractClientIP(req.headers);
    // Use request-scoped logger if available
    if (req.log) {
        req.log.error('Unhandled error', {
            error,
            method: req.method,
            url: req.url,
            ip: clientIP || undefined,
        });
    }
    else {
        // Fallback to global logger - import at top of file instead
        const { error: errorLogger } = require('../utils/logger.js');
        errorLogger('Unhandled error', {
            error,
            method: req.method,
            url: req.url,
            ip: clientIP || undefined,
            requestId: req.requestId,
        });
    }
    next(error);
}
/**
 * GraphQL operation logging middleware
 * Logs GraphQL-specific operations
 */
export function graphqlOperationLoggingMiddleware(req, _res, next) {
    // Only process GraphQL requests
    if (req.url !== '/graphql' || req.method !== 'POST') {
        return next();
    }
    const body = req.body;
    if (body.query) {
        // Extract operation type
        const trimmedQuery = body.query.trim();
        const operationType = trimmedQuery.startsWith('mutation')
            ? 'mutation'
            : trimmedQuery.startsWith('subscription')
                ? 'subscription'
                : 'query';
        // Store for later use
        req.graphqlOperation = {
            operationType,
            operationName: body.operationName,
            variables: body.variables,
        };
    }
    next();
}
//# sourceMappingURL=logging.js.map