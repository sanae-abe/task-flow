/**
 * Logging Middleware
 * Week 8: HTTP request/response logging with request ID
 */

import type { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { logRequest, logResponse, createRequestLogger } from '../utils/logger.js';
import { extractClientIP } from '../utils/ip-geolocation.js';

// ============================================================================
// Types
// ============================================================================

declare module 'express-serve-static-core' {
  interface Request {
    /**
     * Unique request ID
     */
    requestId?: string;

    /**
     * Request-scoped logger
     */
    log?: ReturnType<typeof createRequestLogger>;

    /**
     * Request start time (high-resolution)
     */
    startTime?: [number, number];
  }
}

// ============================================================================
// Middleware Functions
// ============================================================================

/**
 * Request ID middleware
 * Adds unique request ID to each request
 */
export function requestIdMiddleware(
  req: Request,
  _res: Response,
  next: NextFunction
): void {
  // Generate or extract request ID
  req.requestId =
    (req.headers['x-request-id'] as string) ||
    (req.headers['x-correlation-id'] as string) ||
    uuidv4();

  next();
}

/**
 * Request logger middleware
 * Creates request-scoped logger
 */
export function requestLoggerMiddleware(
  req: Request,
  _res: Response,
  next: NextFunction
): void {
  if (!req.requestId) {
    req.requestId = uuidv4();
  }

  const clientIP = extractClientIP(req.headers as Record<string, string | string[] | undefined>);

  // Create request-scoped logger
  req.log = createRequestLogger(req.requestId, clientIP || undefined);

  next();
}

/**
 * HTTP logging middleware
 * Logs all HTTP requests and responses
 */
export function httpLoggingMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  // Set start time for duration calculation
  req.startTime = process.hrtime();

  if (!req.requestId) {
    req.requestId = uuidv4();
  }

  const clientIP = extractClientIP(req.headers as Record<string, string | string[] | undefined>);

  // Log request
  logRequest({
    method: req.method,
    url: req.url,
    ip: clientIP || undefined,
    requestId: req.requestId,
  });

  // Intercept response finish
  const originalSend = res.send;

  res.send = function (body): Response {
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
export function errorLoggingMiddleware(
  error: Error,
  req: Request,
  _res: Response,
  next: NextFunction
): void {
  const clientIP = extractClientIP(req.headers as Record<string, string | string[] | undefined>);

  // Use request-scoped logger if available
  if (req.log) {
    req.log.error('Unhandled error', {
      error,
      method: req.method,
      url: req.url,
      ip: clientIP || undefined,
    });
  } else {
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
export function graphqlOperationLoggingMiddleware(
  req: Request,
  _res: Response,
  next: NextFunction
): void {
  // Only process GraphQL requests
  if (req.url !== '/graphql' || req.method !== 'POST') {
    return next();
  }

  const body = req.body as {
    query?: string;
    operationName?: string;
    variables?: unknown;
  };

  if (body.query) {
    // Extract operation type
    const trimmedQuery = body.query.trim();
    const operationType: 'query' | 'mutation' | 'subscription' = trimmedQuery.startsWith('mutation')
      ? 'mutation'
      : trimmedQuery.startsWith('subscription')
      ? 'subscription'
      : 'query';

    // Store for later use
    (req as unknown as Record<string, unknown>).graphqlOperation = {
      operationType,
      operationName: body.operationName,
      variables: body.variables,
    };
  }

  next();
}
