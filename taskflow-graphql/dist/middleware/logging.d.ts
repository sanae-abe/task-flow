/**
 * Logging Middleware
 * Week 8: HTTP request/response logging with request ID
 */
import type { Request, Response, NextFunction } from 'express';
import { createRequestLogger } from '../utils/logger.js';
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
/**
 * Request ID middleware
 * Adds unique request ID to each request
 */
export declare function requestIdMiddleware(req: Request, _res: Response, next: NextFunction): void;
/**
 * Request logger middleware
 * Creates request-scoped logger
 */
export declare function requestLoggerMiddleware(req: Request, _res: Response, next: NextFunction): void;
/**
 * HTTP logging middleware
 * Logs all HTTP requests and responses
 */
export declare function httpLoggingMiddleware(req: Request, res: Response, next: NextFunction): void;
/**
 * Error logging middleware
 * Logs unhandled errors
 */
export declare function errorLoggingMiddleware(error: Error, req: Request, _res: Response, next: NextFunction): void;
/**
 * GraphQL operation logging middleware
 * Logs GraphQL-specific operations
 */
export declare function graphqlOperationLoggingMiddleware(req: Request, _res: Response, next: NextFunction): void;
//# sourceMappingURL=logging.d.ts.map