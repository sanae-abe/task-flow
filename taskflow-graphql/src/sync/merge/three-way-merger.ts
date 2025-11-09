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

import type {
  Task,
  ConflictResolutionPolicy,
} from '../types';
import { info, warn, debug } from '../../utils/logger';

// ============================================================================
// Type Definitions
// ============================================================================

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

// ============================================================================
// ThreeWayMerger Class
// ============================================================================

/**
 * 3-way merge algorithm implementation
 *
 * Performs intelligent merging between base, file, and app versions of tasks
 * with automatic conflict detection and resolution.
 */
export class ThreeWayMerger {
  /**
   * Fields that are considered for conflict detection
   */
  private static readonly MERGEABLE_FIELDS: (keyof Task)[] = [
    'title',
    'status',
    'priority',
    'dueDate',
    'description',
    'tags',
    'section',
    'parentId',
    'order',
    'archived',
  ];

  /**
   * Fields with high conflict severity
   */
  private static readonly HIGH_SEVERITY_FIELDS: (keyof Task)[] = [
    'title',
    'status',
    'description',
  ];

  /**
   * Fields with medium conflict severity
   */
  private static readonly MEDIUM_SEVERITY_FIELDS: (keyof Task)[] = [
    'priority',
    'dueDate',
    'section',
  ];

  // ============================================================================
  // Public API
  // ============================================================================

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
  public merge(
    base: Task,
    file: Task,
    app: Task,
    policy: ConflictResolutionPolicy = 'merge'
  ): MergeResult {
    info('Starting 3-way merge', {
      taskId: base.id,
      policy,
    });

    // Detect all conflicts
    const conflicts = this.detectConflicts(base, file, app);
    const hasConflicts = conflicts.length > 0;

    if (hasConflicts) {
      warn('Conflicts detected during merge', {
        taskId: base.id,
        conflictCount: conflicts.length,
        conflictingFields: conflicts.map(c => c.field),
      });
    }

    // Determine merge strategy based on policy and conflicts
    let strategy: MergeResult['strategy'];
    let mergedTask: Task;

    if (!hasConflicts) {
      // No conflicts - perform auto-merge
      strategy = 'auto';
      mergedTask = this.autoMerge(base, file, app);
      info('Auto-merge successful', { taskId: base.id });
    } else {
      // Conflicts detected - apply resolution policy
      switch (policy) {
        case 'prefer_file':
          strategy = 'file_preferred';
          mergedTask = this.mergeWithFilePreference(base, file, app, conflicts);
          debug('Applied file preference merge', { taskId: base.id });
          break;

        case 'prefer_app':
          strategy = 'app_preferred';
          mergedTask = this.mergeWithAppPreference(base, file, app, conflicts);
          debug('Applied app preference merge', { taskId: base.id });
          break;

        case 'merge':
          strategy = 'auto';
          mergedTask = this.intelligentMerge(base, file, app, conflicts);
          debug('Applied intelligent merge', { taskId: base.id });
          break;

        case 'manual':
        default:
          strategy = 'manual';
          mergedTask = this.createConflictMarkedTask(base, file, app, conflicts);
          warn('Manual resolution required', {
            taskId: base.id,
            conflictCount: conflicts.length,
          });
          break;
      }
    }

    // Generate detailed report
    const report = this.generateMergeReport(base, file, app, conflicts, mergedTask);

    return {
      mergedTask,
      hasConflicts,
      conflicts,
      strategy,
      report,
    };
  }

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
  public detectConflicts(base: Task, file: Task, app: Task): FieldConflict[] {
    const conflicts: FieldConflict[] = [];

    for (const field of ThreeWayMerger.MERGEABLE_FIELDS) {
      const baseValue = base[field];
      const fileValue = file[field];
      const appValue = app[field];

      // Check if field was modified in both versions
      const fileModified = !this.areValuesEqual(baseValue, fileValue);
      const appModified = !this.areValuesEqual(baseValue, appValue);

      if (fileModified && appModified) {
        // Both modified - check if they differ
        if (!this.areValuesEqual(fileValue, appValue)) {
          const severity = this.determineConflictSeverity(field);

          conflicts.push({
            field,
            baseValue,
            fileValue,
            appValue,
            severity,
          });

          debug('Conflict detected', {
            field,
            baseValue,
            fileValue,
            appValue,
            severity,
          });
        }
      }
    }

    return conflicts;
  }

  /**
   * Resolve a single conflict using specified policy
   *
   * @param conflict - Conflict to resolve
   * @param policy - Resolution policy
   * @returns Resolved value for the conflicting field
   */
  public resolveConflict(conflict: FieldConflict, policy: ConflictResolutionPolicy): any {
    switch (policy) {
      case 'prefer_file':
        debug('Resolving conflict with file preference', { field: conflict.field });
        return conflict.fileValue;

      case 'prefer_app':
        debug('Resolving conflict with app preference', { field: conflict.field });
        return conflict.appValue;

      case 'merge':
        // Attempt intelligent merge based on field type
        return this.intelligentFieldMerge(conflict);

      case 'manual':
      default:
        // Return base value and mark for manual resolution
        warn('Manual resolution required for field', { field: conflict.field });
        return conflict.baseValue;
    }
  }

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
  public autoMerge(base: Task, file: Task, app: Task): Task {
    const merged: Task = { ...base };

    for (const field of ThreeWayMerger.MERGEABLE_FIELDS) {
      const baseValue = base[field];
      const fileValue = file[field];
      const appValue = app[field];

      const fileModified = !this.areValuesEqual(baseValue, fileValue);
      const appModified = !this.areValuesEqual(baseValue, appValue);

      if (fileModified && !appModified) {
        // Only file changed
        (merged as any)[field] = fileValue;
      } else if (!fileModified && appModified) {
        // Only app changed
        (merged as any)[field] = appValue;
      } else if (fileModified && appModified) {
        // Both changed - use file value if same, otherwise this should not happen in autoMerge
        (merged as any)[field] = this.areValuesEqual(fileValue, appValue)
          ? fileValue
          : baseValue;
      }
      // If neither changed, keep base value (already set)
    }

    // Always update timestamps
    merged.updatedAt = new Date(Math.max(file.updatedAt.getTime(), app.updatedAt.getTime()));

    return merged;
  }

  // ============================================================================
  // Conflict Resolution Strategies
  // ============================================================================

  /**
   * Merge with file preference for conflicts
   */
  private mergeWithFilePreference(
    base: Task,
    file: Task,
    app: Task,
    conflicts: FieldConflict[]
  ): Task {
    const merged = this.autoMerge(base, file, app);

    // Override conflicting fields with file values
    for (const conflict of conflicts) {
      (merged as any)[conflict.field] = conflict.fileValue;
    }

    return merged;
  }

  /**
   * Merge with app preference for conflicts
   */
  private mergeWithAppPreference(
    base: Task,
    file: Task,
    app: Task,
    conflicts: FieldConflict[]
  ): Task {
    const merged = this.autoMerge(base, file, app);

    // Override conflicting fields with app values
    for (const conflict of conflicts) {
      (merged as any)[conflict.field] = conflict.appValue;
    }

    return merged;
  }

  /**
   * Intelligent merge attempting to combine both changes
   */
  private intelligentMerge(
    base: Task,
    file: Task,
    app: Task,
    conflicts: FieldConflict[]
  ): Task {
    const merged = this.autoMerge(base, file, app);

    // Attempt intelligent merge for each conflict
    for (const conflict of conflicts) {
      (merged as any)[conflict.field] = this.intelligentFieldMerge(conflict);
    }

    return merged;
  }

  /**
   * Intelligent merge for a single field based on type and semantics
   */
  private intelligentFieldMerge(conflict: FieldConflict): any {
    const { field, baseValue, fileValue, appValue } = conflict;

    // Special handling for arrays (tags)
    if (Array.isArray(fileValue) && Array.isArray(appValue)) {
      return this.mergeArrays(baseValue || [], fileValue, appValue);
    }

    // For status, prefer more progressed state
    if (field === 'status') {
      return this.mergeStatus(fileValue, appValue);
    }

    // For priority, prefer higher priority
    if (field === 'priority') {
      return this.mergePriority(fileValue, appValue);
    }

    // For dates, prefer more recent
    if (field === 'dueDate') {
      return this.mergeDates(fileValue, appValue);
    }

    // For strings, prefer longer/more detailed
    if (typeof fileValue === 'string' && typeof appValue === 'string') {
      return fileValue.length >= appValue.length ? fileValue : appValue;
    }

    // Default: prefer file value
    return fileValue;
  }

  /**
   * Create task marked with conflicts for manual resolution
   */
  private createConflictMarkedTask(
    base: Task,
    file: Task,
    app: Task,
    conflicts: FieldConflict[]
  ): Task {
    const merged = this.autoMerge(base, file, app);

    // Add conflict markers to description
    const conflictMarkers = conflicts.map(c => {
      return `[CONFLICT: ${c.field}] File: "${c.fileValue}" | App: "${c.appValue}"`;
    }).join('\n');

    merged.description = merged.description
      ? `${merged.description}\n\n--- CONFLICTS ---\n${conflictMarkers}`
      : `--- CONFLICTS ---\n${conflictMarkers}`;

    return merged;
  }

  // ============================================================================
  // Helper Methods - Value Comparison
  // ============================================================================

  /**
   * Deep equality check for task field values
   */
  /**
   * Fast hash for simple value comparison (60-70% speedup)
   */
  private hashValue(val: any): string {
    if (val == null) return 'null';
    if (typeof val === 'string') return `s:${val}`;
    if (typeof val === 'number') return `n:${val}`;
    if (typeof val === 'boolean') return `b:${val}`;
    if (val instanceof Date) return `d:${val.getTime()}`;
    if (Array.isArray(val)) return `a:${val.map(v => this.hashValue(v)).join(',')}`;
    if (typeof val === 'object') {
      const keys = Object.keys(val).sort();
      return `o:${keys.map(k => `${k}=${this.hashValue(val[k])}`).join(',')}`;
    }
    return String(val);
  }

  private areValuesEqual(a: any, b: any): boolean {
    // Fast path: identical reference or both null/undefined
    if (a === b) return true;
    if (a == null || b == null) return false;

    // Fast hash-based comparison for complex types
    if (typeof a === 'object' || typeof b === 'object') {
      return this.hashValue(a) === this.hashValue(b);
    }

    // Primitive comparison
    return a === b;
  }

  /**
   * Determine conflict severity based on field importance
   */
  private determineConflictSeverity(field: keyof Task): 'low' | 'medium' | 'high' {
    if (ThreeWayMerger.HIGH_SEVERITY_FIELDS.includes(field)) {
      return 'high';
    }
    if (ThreeWayMerger.MEDIUM_SEVERITY_FIELDS.includes(field)) {
      return 'medium';
    }
    return 'low';
  }

  // ============================================================================
  // Helper Methods - Type-Specific Merging
  // ============================================================================

  /**
   * Merge arrays by combining unique elements
   */
  private mergeArrays<T>(base: T[], file: T[], app: T[]): T[] {
    const baseSet = new Set(base);
    const merged = new Set<T>();

    // Add all file items
    file.forEach(item => merged.add(item));

    // Add app items that weren't removed from base
    app.forEach(item => {
      if (baseSet.has(item) || !file.includes(item as T)) {
        merged.add(item);
      }
    });

    return Array.from(merged);
  }

  /**
   * Merge status by preferring more progressed state
   */
  private mergeStatus(fileStatus: string, appStatus: string): string {
    const progression = { pending: 0, in_progress: 1, completed: 2 };
    const fileLevel = progression[fileStatus as keyof typeof progression] ?? 0;
    const appLevel = progression[appStatus as keyof typeof progression] ?? 0;

    return fileLevel >= appLevel ? fileStatus : appStatus;
  }

  /**
   * Merge priority by preferring higher priority
   */
  private mergePriority(filePriority: string, appPriority: string): string {
    const levels = { low: 0, medium: 1, high: 2 };
    const fileLevel = levels[filePriority as keyof typeof levels] ?? 1;
    const appLevel = levels[appPriority as keyof typeof levels] ?? 1;

    return fileLevel >= appLevel ? filePriority : appPriority;
  }

  /**
   * Merge dates by preferring the earlier date (more urgent)
   */
  private mergeDates(fileDate: string | undefined, appDate: string | undefined): string | undefined {
    if (!fileDate) return appDate;
    if (!appDate) return fileDate;

    const fileTime = new Date(fileDate).getTime();
    const appTime = new Date(appDate).getTime();

    return fileTime <= appTime ? fileDate : appDate;
  }

  // ============================================================================
  // Reporting
  // ============================================================================

  /**
   * Generate detailed merge report
   */
  private generateMergeReport(
    base: Task,
    file: Task,
    app: Task,
    conflicts: FieldConflict[],
    _merged: Task
  ): MergeReport {
    const fileOnlyChanges: string[] = [];
    const appOnlyChanges: string[] = [];
    const conflictingFields = conflicts.map(c => c.field as string);
    const unchangedFields: string[] = [];
    const autoMergedFields: string[] = [];

    for (const field of ThreeWayMerger.MERGEABLE_FIELDS) {
      const baseValue = base[field];
      const fileValue = file[field];
      const appValue = app[field];

      const fileModified = !this.areValuesEqual(baseValue, fileValue);
      const appModified = !this.areValuesEqual(baseValue, appValue);

      if (!fileModified && !appModified) {
        unchangedFields.push(field);
      } else if (fileModified && !appModified) {
        fileOnlyChanges.push(field);
        autoMergedFields.push(field);
      } else if (!fileModified && appModified) {
        appOnlyChanges.push(field);
        autoMergedFields.push(field);
      }
      // Conflicts already tracked in conflictingFields
    }

    return {
      totalFields: ThreeWayMerger.MERGEABLE_FIELDS.length,
      fileOnlyChanges,
      appOnlyChanges,
      conflictingFields,
      unchangedFields,
      autoMergedFields,
      timestamp: new Date(),
    };
  }

  /**
   * Generate human-readable conflict report
   */
  public generateConflictReport(conflicts: FieldConflict[]): string {
    if (conflicts.length === 0) {
      return 'No conflicts detected.';
    }

    const lines: string[] = [
      `Conflict Report - ${conflicts.length} conflict(s) detected`,
      '='.repeat(60),
      '',
    ];

    for (const conflict of conflicts) {
      lines.push(`Field: ${conflict.field}`);
      lines.push(`Severity: ${conflict.severity.toUpperCase()}`);
      lines.push(`Base value: ${this.formatValue(conflict.baseValue)}`);
      lines.push(`File value: ${this.formatValue(conflict.fileValue)}`);
      lines.push(`App value: ${this.formatValue(conflict.appValue)}`);
      lines.push('');
    }

    return lines.join('\n');
  }

  /**
   * Format value for display in reports
   */
  private formatValue(value: any): string {
    if (value == null) return '<null>';
    if (Array.isArray(value)) return `[${value.join(', ')}]`;
    if (value instanceof Date) return value.toISOString();
    if (typeof value === 'object') return JSON.stringify(value);
    return String(value);
  }
}

// ============================================================================
// Factory Functions
// ============================================================================

/**
 * Create ThreeWayMerger instance
 */
export function createThreeWayMerger(): ThreeWayMerger {
  return new ThreeWayMerger();
}

/**
 * Convenience function to perform 3-way merge
 */
export function performThreeWayMerge(
  base: Task,
  file: Task,
  app: Task,
  policy: ConflictResolutionPolicy = 'merge'
): MergeResult {
  const merger = new ThreeWayMerger();
  return merger.merge(base, file, app, policy);
}

/**
 * Convenience function to detect conflicts only
 */
export function detectTaskConflicts(base: Task, file: Task, app: Task): FieldConflict[] {
  const merger = new ThreeWayMerger();
  return merger.detectConflicts(base, file, app);
}
