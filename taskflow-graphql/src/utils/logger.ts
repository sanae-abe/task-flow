/**
 * Structured Logger Utility
 * Week 8: Production-ready structured logging with Pino
 */

import pino from 'pino';

// ============================================================================
// Configuration
// ============================================================================

const LOG_LEVEL = process.env.LOG_LEVEL || 'info';
const NODE_ENV = process.env.NODE_ENV || 'development';

// Pretty print in development, JSON in production
const prettyPrint = NODE_ENV === 'development';

// ============================================================================
// Logger Instance
// ============================================================================

/**
 * Main logger instance
 */
export const logger = pino({
  level: LOG_LEVEL,
  ...(prettyPrint
    ? {
        transport: {
          target: 'pino-pretty',
          options: {
            colorize: true,
            translateTime: 'HH:MM:ss Z',
            ignore: 'pid,hostname',
          },
        },
      }
    : {}),
  base: {
    env: NODE_ENV,
  },
  timestamp: pino.stdTimeFunctions.isoTime,
});

// ============================================================================
// Type-Safe Logging Functions
// ============================================================================

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
export function debug(message: string, context?: LogContext): void {
  logger.debug(context || {}, message);
}

/**
 * Info level logging
 */
export function info(message: string, context?: LogContext): void {
  logger.info(context || {}, message);
}

/**
 * Warning level logging
 */
export function warn(message: string, context?: LogContext): void {
  logger.warn(context || {}, message);
}

/**
 * Error level logging
 */
export function error(message: string, context?: LogContext): void {
  // Extract error details if Error object provided
  if (context?.error instanceof Error) {
    const errorDetails = {
      ...context,
      error: {
        message: context.error.message,
        stack: context.error.stack,
        name: context.error.name,
      },
    };
    logger.error(errorDetails, message);
  } else {
    logger.error(context || {}, message);
  }
}

/**
 * Fatal level logging (process will exit after logging)
 */
export function fatal(message: string, context?: LogContext): void {
  logger.fatal(context || {}, message);
}

// ============================================================================
// Specialized Logging Functions
// ============================================================================

/**
 * Log HTTP request
 */
export function logRequest(context: {
  method: string;
  url: string;
  ip?: string;
  userId?: string;
  requestId?: string;
}): void {
  info('HTTP Request', {
    type: 'http_request',
    ...context,
  });
}

/**
 * Log HTTP response
 */
export function logResponse(context: {
  method: string;
  url: string;
  statusCode: number;
  duration: number;
  ip?: string;
  userId?: string;
  requestId?: string;
}): void {
  const level = context.statusCode >= 500 ? 'error' : context.statusCode >= 400 ? 'warn' : 'info';

  logger[level](
    {
      type: 'http_response',
      ...context,
    },
    'HTTP Response'
  );
}

/**
 * Log GraphQL operation
 */
export function logGraphQLOperation(context: {
  operationName?: string;
  operationType: 'query' | 'mutation' | 'subscription';
  duration?: number;
  ip?: string;
  userId?: string;
  requestId?: string;
  variables?: unknown;
  errors?: unknown[];
}): void {
  if (context.errors && context.errors.length > 0) {
    error('GraphQL Operation Failed', {
      type: 'graphql_operation',
      ...context,
    });
  } else {
    info('GraphQL Operation', {
      type: 'graphql_operation',
      ...context,
    });
  }
}

/**
 * Log database query
 */
export function logDatabaseQuery(context: {
  operation: string;
  table?: string;
  duration?: number;
  error?: Error;
}): void {
  if (context.error) {
    error('Database Query Failed', {
      type: 'database_query',
      ...context,
    });
  } else {
    debug('Database Query', {
      type: 'database_query',
      ...context,
    });
  }
}

/**
 * Log cache operation
 */
export function logCacheOperation(context: {
  operation: 'hit' | 'miss' | 'set' | 'delete';
  key: string;
  ttl?: number;
}): void {
  debug('Cache Operation', {
    type: 'cache_operation',
    ...context,
  });
}

/**
 * Log external API call
 */
export function logExternalAPI(context: {
  service: string;
  endpoint: string;
  method: string;
  statusCode?: number;
  duration?: number;
  error?: Error;
}): void {
  if (context.error) {
    error('External API Call Failed', {
      type: 'external_api',
      ...context,
    });
  } else {
    info('External API Call', {
      type: 'external_api',
      ...context,
    });
  }
}

/**
 * Log authentication event
 */
export function logAuth(context: {
  event: 'login' | 'logout' | 'token_refresh' | 'auth_failed';
  userId?: string;
  ip?: string;
  error?: Error;
}): void {
  if (context.event === 'auth_failed' || context.error) {
    warn('Authentication Event', {
      type: 'auth',
      ...context,
    });
  } else {
    info('Authentication Event', {
      type: 'auth',
      ...context,
    });
  }
}

/**
 * Log security event
 */
export function logSecurity(context: {
  event: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  ip?: string;
  userId?: string;
  details?: unknown;
}): void {
  const level = context.severity === 'critical' || context.severity === 'high' ? 'error' : 'warn';

  logger[level](
    {
      type: 'security',
      ...context,
    },
    'Security Event'
  );
}

/**
 * Log performance metric
 */
export function logPerformance(context: {
  metric: string;
  value: number;
  unit: 'ms' | 'bytes' | 'count';
  threshold?: number;
  exceeded?: boolean;
}): void {
  debug('Performance Metric', {
    type: 'performance',
    ...context,
  });
}

// ============================================================================
// Child Logger Factory
// ============================================================================

/**
 * Create a child logger with bound context
 */
export function createChildLogger(context: LogContext): pino.Logger {
  return logger.child(context);
}

/**
 * Create request-scoped logger with request ID
 */
export function createRequestLogger(requestId: string, ip?: string): {
  debug: (message: string, context?: LogContext) => void;
  info: (message: string, context?: LogContext) => void;
  warn: (message: string, context?: LogContext) => void;
  error: (message: string, context?: LogContext) => void;
} {
  const child = logger.child({ requestId, ip });

  return {
    debug: (message: string, context?: LogContext) => child.debug(context || {}, message),
    info: (message: string, context?: LogContext) => child.info(context || {}, message),
    warn: (message: string, context?: LogContext) => child.warn(context || {}, message),
    error: (message: string, context?: LogContext) => {
      if (context?.error instanceof Error) {
        const errorDetails = {
          ...context,
          error: {
            message: context.error.message,
            stack: context.error.stack,
            name: context.error.name,
          },
        };
        child.error(errorDetails, message);
      } else {
        child.error(context || {}, message);
      }
    },
  };
}

// ============================================================================
// Export Default Logger
// ============================================================================

export default {
  logger,
  debug,
  info,
  warn,
  error,
  fatal,
  logRequest,
  logResponse,
  logGraphQLOperation,
  logDatabaseQuery,
  logCacheOperation,
  logExternalAPI,
  logAuth,
  logSecurity,
  logPerformance,
  createChildLogger,
  createRequestLogger,
};
