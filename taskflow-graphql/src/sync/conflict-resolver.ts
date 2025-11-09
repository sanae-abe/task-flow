/**
 * Conflict Resolution Strategy for Bidirectional Sync
 *
 * This is a convenience wrapper around the full ConflictResolver implementation
 * located in sync/merge/conflict-resolver.ts
 *
 * @see /Users/sanae.abe/workspace/taskflow-app/taskflow-graphql/src/sync/merge/conflict-resolver.ts
 * @see /Users/sanae.abe/workspace/taskflow-app/taskflow-graphql/src/sync/merge/__tests__/conflict-resolver.test.ts
 */

export {
  ConflictResolver,
  type ResolverOptions,
  type ResolutionResult,
  type ManualResolutionRecord,
  type ResolutionSuggestion,
  type BatchResolutionResult,
  type ResolutionStatistics,
} from './merge/conflict-resolver';

// Re-export conflict resolution policy from types for convenience
export type { ConflictResolutionPolicy } from './types';

/**
 * ConflictStrategy enum for easier usage
 *
 * Maps to ConflictResolutionPolicy internally
 */
export enum ConflictStrategy {
  /**
   * Compare timestamps, use newer version
   * Maps to intelligent resolution based on updatedAt
   */
  LastWriteWins = 'last_write_wins',

  /**
   * Always prefer file version
   * Maps to 'prefer_file' policy
   */
  FileWins = 'file_wins',

  /**
   * Always prefer DB/app version
   * Maps to 'prefer_app' policy
   */
  DbWins = 'db_wins',

  /**
   * Intelligent field-level merge
   * Maps to 'merge' policy
   */
  Merge = 'merge',
}

/**
 * Convert ConflictStrategy enum to ConflictResolutionPolicy
 */
export function strategyToPolicy(
  strategy: ConflictStrategy
): 'prefer_file' | 'prefer_app' | 'merge' | 'manual' {
  switch (strategy) {
    case ConflictStrategy.LastWriteWins:
      return 'manual'; // Will use timestamp-based resolution
    case ConflictStrategy.FileWins:
      return 'prefer_file';
    case ConflictStrategy.DbWins:
      return 'prefer_app';
    case ConflictStrategy.Merge:
      return 'merge';
    default:
      return 'manual';
  }
}
