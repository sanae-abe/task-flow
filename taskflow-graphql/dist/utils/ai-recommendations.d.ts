/**
 * AI Task Recommendation Utility
 * Recommends optimal tasks based on context and user patterns
 */
import type { TaskRecord } from './indexeddb.js';
import type { UserContext, CompletionHistoryItem } from './ai-client.js';
export interface RecommendationOptions {
    limit?: number;
    includeReasoning?: boolean;
    considerTimeOfDay?: boolean;
    considerHistory?: boolean;
}
export interface TaskRecommendation {
    task: TaskRecord;
    score: number;
    reasoning: string[];
    confidence: number;
}
/**
 * Get recommended task with enhanced AI reasoning
 */
export declare function getRecommendedTaskWithAI(tasks: TaskRecord[], userContext: UserContext, options?: RecommendationOptions): Promise<TaskRecommendation | null>;
/**
 * Get multiple recommended tasks (top N)
 */
export declare function getTopRecommendedTasks(tasks: TaskRecord[], userContext: UserContext, options?: RecommendationOptions): Promise<TaskRecommendation[]>;
/**
 * Analyze user work patterns from history
 */
export declare function analyzeWorkPatterns(history: CompletionHistoryItem[]): {
    peakHours: number[];
    productiveDays: number[];
    averageDuration: number;
};
//# sourceMappingURL=ai-recommendations.d.ts.map