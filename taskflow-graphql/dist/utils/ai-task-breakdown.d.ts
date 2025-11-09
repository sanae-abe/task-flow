/**
 * AI Task Breakdown Utility
 * Breaks down complex tasks into manageable subtasks
 */
import type { TaskRecord } from './indexeddb.js';
import type { BreakdownStrategy } from './ai-client.js';
export interface BreakdownOptions {
    strategy?: BreakdownStrategy;
    maxSubtasks?: number;
    minSubtasks?: number;
    includeEstimates?: boolean;
}
export interface BreakdownResult {
    subtasks: string[];
    strategy: BreakdownStrategy;
    confidence: number;
    reasoning?: string;
}
/**
 * Break down a task into subtasks using AI
 */
export declare function breakdownTaskWithAI(task: TaskRecord, options?: BreakdownOptions): Promise<BreakdownResult>;
/**
 * Determine optimal breakdown strategy for a task
 */
export declare function determineOptimalStrategy(task: TaskRecord): BreakdownStrategy;
/**
 * Validate breakdown result
 */
export declare function validateBreakdown(result: BreakdownResult): boolean;
/**
 * Estimate effort for each subtask (in hours)
 */
export declare function estimateSubtaskEffort(subtask: string, parentTask: TaskRecord): number;
//# sourceMappingURL=ai-task-breakdown.d.ts.map