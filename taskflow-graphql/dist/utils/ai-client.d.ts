/**
 * AI Client Abstraction Layer
 * Provides unified interface for AI operations with fallback implementations
 */
import type { TaskRecord } from './indexeddb.js';
export interface AIClient {
    /**
     * Break down a task into subtasks
     */
    breakdownTask(task: TaskRecord, strategy: BreakdownStrategy): Promise<string[]>;
    /**
     * Parse natural language into structured task data
     */
    parseNaturalLanguage(query: string, context?: AIContext): Promise<ParsedTask>;
    /**
     * Optimize task schedule based on constraints
     */
    optimizeSchedule(tasks: TaskRecord[], constraints: ScheduleConstraints): Promise<OptimizationResult>;
    /**
     * Get recommended task based on context
     */
    getRecommendedTask(tasks: TaskRecord[], userContext: UserContext): Promise<TaskRecord | null>;
}
export type BreakdownStrategy = 'SEQUENTIAL' | 'PARALLEL' | 'HYBRID' | 'BY_FEATURE' | 'BY_PHASE' | 'BY_COMPONENT' | 'BY_COMPLEXITY';
export interface AIContext {
    boardId?: string;
    recentActivity?: string[];
    preferences?: UserPreferences;
}
export interface UserContext {
    currentTime: Date;
    workingHours?: {
        start: string;
        end: string;
    };
    completionHistory?: CompletionHistoryItem[];
    preferredPriority?: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
}
export interface CompletionHistoryItem {
    taskId: string;
    completedAt: Date;
    timeOfDay: number;
    dayOfWeek: number;
    duration?: number;
}
export interface UserPreferences {
    workingHours?: {
        start: string;
        end: string;
    };
    preferredPriority?: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
    autoBreakdownEnabled?: boolean;
}
export interface ParsedTask {
    title: string;
    description?: string;
    priority?: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
    dueDate?: Date;
    dueTime?: string;
    labels?: string[];
    subtasks?: string[];
}
export interface ScheduleConstraints {
    workingHoursPerDay?: number;
    deadline?: Date;
    prioritizeBy?: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
    teamSize?: number;
}
export interface OptimizationResult {
    optimizedTasks: TaskRecord[];
    estimatedCompletionDate: Date;
    suggestions: string[];
}
/**
 * Create AI client instance based on environment configuration
 */
export declare function createAIClient(): AIClient;
/**
 * Get singleton AI client instance
 */
export declare function getAIClient(): AIClient;
/**
 * Reset client instance (useful for testing)
 */
export declare function resetAIClient(): void;
//# sourceMappingURL=ai-client.d.ts.map