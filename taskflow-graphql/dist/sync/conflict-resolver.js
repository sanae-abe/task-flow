/**
 * Conflict Resolution Strategy for Bidirectional Sync
 *
 * This is a convenience wrapper around the full ConflictResolver implementation
 * located in sync/merge/conflict-resolver.ts
 *
 * @see /Users/sanae.abe/workspace/taskflow-app/taskflow-graphql/src/sync/merge/conflict-resolver.ts
 * @see /Users/sanae.abe/workspace/taskflow-app/taskflow-graphql/src/sync/merge/__tests__/conflict-resolver.test.ts
 */
export { ConflictResolver, } from './merge/conflict-resolver';
/**
 * ConflictStrategy enum for easier usage
 *
 * Maps to ConflictResolutionPolicy internally
 */
export var ConflictStrategy;
(function (ConflictStrategy) {
    /**
     * Compare timestamps, use newer version
     * Maps to intelligent resolution based on updatedAt
     */
    ConflictStrategy["LastWriteWins"] = "last_write_wins";
    /**
     * Always prefer file version
     * Maps to 'prefer_file' policy
     */
    ConflictStrategy["FileWins"] = "file_wins";
    /**
     * Always prefer DB/app version
     * Maps to 'prefer_app' policy
     */
    ConflictStrategy["DbWins"] = "db_wins";
    /**
     * Intelligent field-level merge
     * Maps to 'merge' policy
     */
    ConflictStrategy["Merge"] = "merge";
})(ConflictStrategy || (ConflictStrategy = {}));
/**
 * Convert ConflictStrategy enum to ConflictResolutionPolicy
 */
export function strategyToPolicy(strategy) {
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
//# sourceMappingURL=conflict-resolver.js.map