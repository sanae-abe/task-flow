/**
 * AI Schedule Optimization Utility
 * Optimizes task schedules based on constraints and priorities
 */
import type { TaskRecord } from './indexeddb.js';
import type { ScheduleConstraints, OptimizationResult } from './ai-client.js';
export interface OptimizationOptions {
    constraints?: ScheduleConstraints;
    considerDependencies?: boolean;
    balanceWorkload?: boolean;
}
export interface TaskDependency {
    taskId: string;
    dependsOn: string[];
    blockedBy?: string[];
}
export interface WorkloadDistribution {
    day: Date;
    taskCount: number;
    totalEffort: number;
    tasks: string[];
}
/**
 * Optimize task schedule using AI
 */
export declare function optimizeScheduleWithAI(tasks: TaskRecord[], options?: OptimizationOptions): Promise<OptimizationResult>;
/**
 * Estimate effort for a task (in hours)
 */
export declare function estimateTaskEffort(task: TaskRecord): number;
/**
 * Calculate workload distribution over time
 */
export declare function calculateWorkloadDistribution(tasks: TaskRecord[], startDate?: Date, days?: number): WorkloadDistribution[];
/**
 * Find optimal task order considering dependencies
 */
export declare function findOptimalTaskOrder(tasks: TaskRecord[], dependencies: TaskDependency[]): TaskRecord[];
/**
 * Identify scheduling conflicts
 */
export declare function identifyConflicts(tasks: TaskRecord[]): {
    overlappingDeadlines: TaskRecord[][];
    overloadedDays: Date[];
};
//# sourceMappingURL=ai-schedule-optimizer.d.ts.map