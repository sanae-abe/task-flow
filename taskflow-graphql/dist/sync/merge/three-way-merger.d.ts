/**
 * 3-Way Merge Algorithm for TODO.md Synchronization
 *
 * Implements sophisticated conflict detection and resolution for synchronizing
 * between TODO.md file and IndexedDB app state.
 *
 * Algorithm:
 * 1. Compare base (common ancestor) with file version
 * 2. Compare base with app version
 * 3. Detect conflicts when both sides modified same field
 * 4. Auto-merge when only one side changed
 * 5. Apply conflict resolution policy when conflicts detected
 *
 * @module ThreeWayMerger
 */
import type { Task, ConflictResolutionPolicy } from '../types';
/**
 * Detailed conflict information for a specific field
 */
interface FieldConflict {
    /** Field name with conflict */
    field: keyof Task;
    /** Value in base version */
    baseValue: any;
    /** Value in file version */
    fileValue: any;
    /** Value in app version */
    appValue: any;
    /** Conflict severity */
    severity: 'low' | 'medium' | 'high';
}
/**
 * Merge result containing merged task and metadata
 */
export interface MergeResult {
    /** Successfully merged task */
    mergedTask: Task;
    /** Whether conflicts were detected */
    hasConflicts: boolean;
    /** List of conflicts detected */
    conflicts: FieldConflict[];
    /** Merge strategy used */
    strategy: 'auto' | 'file_preferred' | 'app_preferred' | 'manual';
    /** Detailed merge report */
    report: MergeReport;
}
/**
 * Detailed merge operation report
 */
export interface MergeReport {
    /** Total fields compared */
    totalFields: number;
    /** Fields changed in file only */
    fileOnlyChanges: string[];
    /** Fields changed in app only */
    appOnlyChanges: string[];
    /** Fields changed in both (conflicts) */
    conflictingFields: string[];
    /** Fields unchanged */
    unchangedFields: string[];
    /** Auto-merged fields */
    autoMergedFields: string[];
    /** Timestamp of merge operation */
    timestamp: Date;
}
/**
 * 3-way merge algorithm implementation
 *
 * Performs intelligent merging between base, file, and app versions of tasks
 * with automatic conflict detection and resolution.
 */
export declare class ThreeWayMerger {
    /**
     * Fields that are considered for conflict detection
     */
    private static readonly MERGEABLE_FIELDS;
    /**
     * Fields with high conflict severity
     */
    private static readonly HIGH_SEVERITY_FIELDS;
    /**
     * Fields with medium conflict severity
     */
    private static readonly MEDIUM_SEVERITY_FIELDS;
    /**
     * Perform 3-way merge between base, file, and app versions
     *
     * @param base - Common ancestor (last synchronized state)
     * @param file - Current TODO.md file state
     * @param app - Current IndexedDB app state
     * @param policy - Conflict resolution policy to apply
     * @returns Merge result with merged task and conflict information
     *
     * @example
     * ```typescript
     * const merger = new ThreeWayMerger();
     * const result = merger.merge(baseTask, fileTask, appTask, 'merge');
     *
     * if (result.hasConflicts) {
     *   console.log('Conflicts detected:', result.conflicts);
     *   console.log('Using strategy:', result.strategy);
     * }
     *
     * const mergedTask = result.mergedTask;
     * ```
     */
    merge(base: Task, file: Task, app: Task, policy?: ConflictResolutionPolicy): MergeResult;
    /**
     * Detect conflicts between base, file, and app versions
     *
     * A conflict occurs when the same field is modified differently in both
     * file and app versions compared to the base.
     *
     * @param base - Common ancestor version
     * @param file - File version
     * @param app - App version
     * @returns Array of field-level conflicts
     */
    detectConflicts(base: Task, file: Task, app: Task): FieldConflict[];
    /**
     * Resolve a single conflict using specified policy
     *
     * @param conflict - Conflict to resolve
     * @param policy - Resolution policy
     * @returns Resolved value for the conflicting field
     */
    resolveConflict(conflict: FieldConflict, policy: ConflictResolutionPolicy): any;
    /**
     * Auto-merge when no conflicts exist
     *
     * Merges changes from both file and app versions when they don't conflict.
     * - If only file changed: use file value
     * - If only app changed: use app value
     * - If neither changed: use base value
     * - If both changed same way: use either value
     *
     * @param base - Base version
     * @param file - File version
     * @param app - App version
     * @returns Auto-merged task
     */
    autoMerge(base: Task, file: Task, app: Task): Task;
    /**
     * Merge with file preference for conflicts
     */
    private mergeWithFilePreference;
    /**
     * Merge with app preference for conflicts
     */
    private mergeWithAppPreference;
    /**
     * Intelligent merge attempting to combine both changes
     */
    private intelligentMerge;
    /**
     * Intelligent merge for a single field based on type and semantics
     */
    private intelligentFieldMerge;
    /**
     * Create task marked with conflicts for manual resolution
     */
    private createConflictMarkedTask;
    /**
     * Deep equality check for task field values
     */
    private areValuesEqual;
    /**
     * Determine conflict severity based on field importance
     */
    private determineConflictSeverity;
    /**
     * Merge arrays by combining unique elements
     */
    private mergeArrays;
    /**
     * Merge status by preferring more progressed state
     */
    private mergeStatus;
    /**
     * Merge priority by preferring higher priority
     */
    private mergePriority;
    /**
     * Merge dates by preferring the earlier date (more urgent)
     */
    private mergeDates;
    /**
     * Generate detailed merge report
     */
    private generateMergeReport;
    /**
     * Generate human-readable conflict report
     */
    generateConflictReport(conflicts: FieldConflict[]): string;
    /**
     * Format value for display in reports
     */
    private formatValue;
}
/**
 * Create ThreeWayMerger instance
 */
export declare function createThreeWayMerger(): ThreeWayMerger;
/**
 * Convenience function to perform 3-way merge
 */
export declare function performThreeWayMerge(base: Task, file: Task, app: Task, policy?: ConflictResolutionPolicy): MergeResult;
/**
 * Convenience function to detect conflicts only
 */
export declare function detectTaskConflicts(base: Task, file: Task, app: Task): FieldConflict[];
export {};
//# sourceMappingURL=three-way-merger.d.ts.map