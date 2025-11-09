import type { Task, Conflict, ConflictResolution, ConflictResolutionPolicy } from '../types';
/**
 * Manual resolution record
 */
export interface ManualResolutionRecord {
    /** Conflict ID */
    conflictId: string;
    /** Task ID */
    taskId: string;
    /** Conflicting fields */
    conflictingFields: string[];
    /** Field values from both versions */
    fieldValues: {
        [field: string]: {
            fileValue: any;
            appValue: any;
            baseValue?: any;
        };
    };
    /** Suggested resolution */
    suggestedResolution: 'prefer_file' | 'prefer_app' | 'merge';
    /** Resolution reason */
    reason: string;
    /** Created timestamp */
    createdAt: Date;
}
/**
 * Resolution suggestion
 */
export interface ResolutionSuggestion {
    /** Suggested policy */
    suggestedPolicy: ConflictResolutionPolicy;
    /** Confidence score (0-1) */
    confidence: number;
    /** Reason for suggestion */
    reason: string;
    /** Alternative policies */
    alternatives: Array<{
        policy: ConflictResolutionPolicy;
        reason: string;
    }>;
    /** Merge preview (if merge suggested) */
    mergePreview?: Task;
}
/**
 * Batch resolution result
 */
export interface BatchResolutionResult {
    /** Total conflicts */
    total: number;
    /** Successfully resolved */
    resolved: number;
    /** Failed resolutions */
    failed: number;
    /** Manual resolutions required */
    manualRequired: number;
    /** Resolution results */
    results: Array<{
        conflict: Conflict;
        resolution?: ConflictResolution;
        error?: Error;
    }>;
    /** Statistics */
    statistics: ResolutionStatistics;
}
/**
 * Resolution statistics
 */
export interface ResolutionStatistics {
    /** Resolutions by method */
    byMethod: {
        use_file: number;
        use_app: number;
        manual_merge: number;
        auto_merge: number;
    };
    /** Resolutions by conflict type */
    byConflictType: {
        content: number;
        deletion: number;
        creation: number;
    };
    /** Average resolution time (ms) */
    averageResolutionTimeMs: number;
    /** Total fields merged */
    totalFieldsMerged: number;
    /** Total conflicts detected */
    totalConflictsDetected: number;
    /** Auto-resolved percentage */
    autoResolvedPercentage: number;
}
/**
 * ConflictResolver - Handles merge conflicts with multiple strategies
 *
 * Provides intelligent conflict resolution using various strategies:
 * - prefer_file: Use file version
 * - prefer_app: Use app version
 * - manual: Mark for manual resolution
 * - merge: Intelligent field-level merge
 *
 * Features:
 * - Field-level merge for non-conflicting fields
 * - Latest timestamp for conflicting fields
 * - Conflict metadata tracking
 * - Resolution suggestions
 * - Batch resolution
 * - Statistics tracking
 */
export interface ResolverOptions {
    policy: ConflictResolutionPolicy;
    attemptAutoMerge?: boolean;
    preferLatestTimestamp?: boolean;
}
export interface ResolutionResult {
    success: boolean;
    resolvedTask?: Task;
    resolution?: ConflictResolution;
    requiresManualResolution?: boolean;
    error?: string;
}
export declare class ConflictResolver {
    private logger;
    private merger;
    private statistics;
    private defaultPolicy;
    constructor(options?: ResolverOptions);
    /**
     * Resolve single conflict (synchronous version for backward compatibility)
     */
    resolve(conflict: Conflict, policy?: ConflictResolutionPolicy): ResolutionResult;
    /**
     * Resolve single conflict (async version)
     */
    resolveAsync(conflict: Conflict, policy?: ConflictResolutionPolicy): Promise<ConflictResolution>;
    /**
     * Internal synchronous resolution
     */
    private resolveSync;
    /**
     * Resolve multiple conflicts in batch
     */
    resolveBatch(conflicts: Conflict[], policy: ConflictResolutionPolicy): Promise<BatchResolutionResult>;
    /**
     * Create manual resolution record
     */
    createManualResolutionRecord(conflict: Conflict): ManualResolutionRecord;
    /**
     * Get resolution suggestion
     */
    getResolutionSuggestion(conflict: Conflict): ResolutionSuggestion;
    getStatistics(): ResolutionStatistics;
    resetStatistics(): void;
    private resolvePreferFile;
    private resolvePreferApp;
    private resolveManual;
    private resolveMerge;
    private updateStatistics;
    private initializeStatistics;
    private valuesEqual;
}
declare const _default: ConflictResolver;
export default _default;
//# sourceMappingURL=conflict-resolver.d.ts.map