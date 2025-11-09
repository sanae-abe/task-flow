/**
 * Structured Logger Utility
 * Week 8: Production-ready structured logging with Pino
 */
import pino from 'pino';
/**
 * Main logger instance
 */
export declare const logger: pino.Logger<never, boolean>;
/**
 * Log types for different contexts
 */
export interface LogContext {
    requestId?: string;
    userId?: string;
    ip?: string;
    method?: string;
    url?: string;
    statusCode?: number;
    duration?: number;
    error?: Error | unknown;
    [key: string]: unknown;
}
/**
 * Debug level logging
 */
export declare function debug(message: string, context?: LogContext): void;
/**
 * Info level logging
 */
export declare function info(message: string, context?: LogContext): void;
/**
 * Warning level logging
 */
export declare function warn(message: string, context?: LogContext): void;
/**
 * Error level logging
 */
export declare function error(message: string, context?: LogContext): void;
/**
 * Fatal level logging (process will exit after logging)
 */
export declare function fatal(message: string, context?: LogContext): void;
/**
 * Log HTTP request
 */
export declare function logRequest(context: {
    method: string;
    url: string;
    ip?: string;
    userId?: string;
    requestId?: string;
}): void;
/**
 * Log HTTP response
 */
export declare function logResponse(context: {
    method: string;
    url: string;
    statusCode: number;
    duration: number;
    ip?: string;
    userId?: string;
    requestId?: string;
}): void;
/**
 * Log GraphQL operation
 */
export declare function logGraphQLOperation(context: {
    operationName?: string;
    operationType: 'query' | 'mutation' | 'subscription';
    duration?: number;
    ip?: string;
    userId?: string;
    requestId?: string;
    variables?: unknown;
    errors?: unknown[];
}): void;
/**
 * Log database query
 */
export declare function logDatabaseQuery(context: {
    operation: string;
    table?: string;
    duration?: number;
    error?: Error;
}): void;
/**
 * Log cache operation
 */
export declare function logCacheOperation(context: {
    operation: 'hit' | 'miss' | 'set' | 'delete';
    key: string;
    ttl?: number;
}): void;
/**
 * Log external API call
 */
export declare function logExternalAPI(context: {
    service: string;
    endpoint: string;
    method: string;
    statusCode?: number;
    duration?: number;
    error?: Error;
}): void;
/**
 * Log authentication event
 */
export declare function logAuth(context: {
    event: 'login' | 'logout' | 'token_refresh' | 'auth_failed';
    userId?: string;
    ip?: string;
    error?: Error;
}): void;
/**
 * Log security event
 */
export declare function logSecurity(context: {
    event: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    ip?: string;
    userId?: string;
    details?: unknown;
}): void;
/**
 * Log performance metric
 */
export declare function logPerformance(context: {
    metric: string;
    value: number;
    unit: 'ms' | 'bytes' | 'count';
    threshold?: number;
    exceeded?: boolean;
}): void;
/**
 * Create a child logger with bound context
 */
export declare function createChildLogger(context: LogContext): pino.Logger;
/**
 * Create request-scoped logger with request ID
 */
export declare function createRequestLogger(requestId: string, ip?: string): {
    debug: (message: string, context?: LogContext) => void;
    info: (message: string, context?: LogContext) => void;
    warn: (message: string, context?: LogContext) => void;
    error: (message: string, context?: LogContext) => void;
};
declare const _default: {
    logger: pino.Logger<never, boolean>;
    debug: typeof debug;
    info: typeof info;
    warn: typeof warn;
    error: typeof error;
    fatal: typeof fatal;
    logRequest: typeof logRequest;
    logResponse: typeof logResponse;
    logGraphQLOperation: typeof logGraphQLOperation;
    logDatabaseQuery: typeof logDatabaseQuery;
    logCacheOperation: typeof logCacheOperation;
    logExternalAPI: typeof logExternalAPI;
    logAuth: typeof logAuth;
    logSecurity: typeof logSecurity;
    logPerformance: typeof logPerformance;
    createChildLogger: typeof createChildLogger;
    createRequestLogger: typeof createRequestLogger;
};
export default _default;
//# sourceMappingURL=logger.d.ts.map