/**
 * AI Helper Utilities
 * Common utilities for AI operations across the application
 */
import type { TaskRecord } from './indexeddb.js';
import type { UserContext } from './ai-client.js';
/**
 * Build user context from task history
 */
export declare function buildUserContext(completedTasks: TaskRecord[], currentTime?: Date): UserContext;
/**
 * Extract working hours from completion history
 */
export declare function extractWorkingHours(completionHistory: Array<{
    timeOfDay: number;
}>): {
    start: string;
    end: string;
} | undefined;
/**
 * Determine preferred priority from history
 */
export declare function determinePreferredPriority(completedTasks: TaskRecord[]): 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | undefined;
/**
 * Detect task complexity level
 */
export declare function detectComplexity(task: TaskRecord): 'simple' | 'moderate' | 'complex' | 'very_complex';
/**
 * Detect if task is suitable for breakdown
 */
export declare function shouldBreakdown(task: TaskRecord): {
    shouldBreak: boolean;
    reason: string;
};
/**
 * Extract keywords from task for categorization
 */
export declare function extractTaskKeywords(task: TaskRecord): string[];
/**
 * Validate AI confidence score
 */
export declare function isConfidenceAcceptable(confidence: number): boolean;
/**
 * Validate AI response quality
 */
export declare function validateAIResponse<T>(response: T | null | undefined, confidence: number): {
    valid: boolean;
    reason?: string;
};
/**
 * Format confidence score for display
 */
export declare function formatConfidence(confidence: number): string;
/**
 * Format task list for AI prompt
 */
export declare function formatTasksForPrompt(tasks: TaskRecord[]): string;
/**
 * Format time duration in human-readable format
 */
export declare function formatDuration(minutes: number): string;
/**
 * Cache AI response with TTL
 */
export declare function cacheAIResponse<T>(key: string, data: T): void;
/**
 * Get cached AI response if valid
 */
export declare function getCachedAIResponse<T>(key: string): T | null;
/**
 * Clear AI response cache
 */
export declare function clearAICache(): void;
/**
 * Generate cache key for AI operations
 */
export declare function generateCacheKey(operation: string, params: Record<string, any>): string;
/**
 * Wrap AI operation with error handling
 */
export declare function safeAIOperation<T>(operation: () => Promise<T>, fallback: T): Promise<T>;
/**
 * Retry AI operation with exponential backoff
 */
export declare function retryAIOperation<T>(operation: () => Promise<T>, maxRetries?: number, baseDelay?: number): Promise<T>;
interface AIMetrics {
    operationCount: number;
    successCount: number;
    failureCount: number;
    averageConfidence: number;
    averageLatency: number;
}
/**
 * Track AI operation metrics
 */
export declare function trackAIMetrics(success: boolean, confidence: number, latency: number): void;
/**
 * Get AI metrics
 */
export declare function getAIMetrics(): Readonly<AIMetrics>;
/**
 * Reset AI metrics
 */
export declare function resetAIMetrics(): void;
export {};
//# sourceMappingURL=ai-helpers.d.ts.map