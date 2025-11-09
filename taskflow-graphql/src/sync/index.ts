/**
 * Sync module entry point
 *
 * Exports all synchronization components for TODO.md ↔ TaskFlow DB sync
 */

// Core sync orchestrator
export { SyncOrchestrator } from './sync-orchestrator';
export type { SyncOrchestratorEvents } from './sync-orchestrator';

// Markdown parsing and generation
export { MarkdownParser } from './markdown-parser';
export { MarkdownGenerator } from './markdown-generator';

// File system watching
export { FileWatcher, createFileWatcher } from './file-system/file-watcher';
export type {
  FileWatcherOptions,
  WatcherStatistics,
} from './file-system/file-watcher';

// Security components
export { PathValidator } from './security/path-validator';
export { MarkdownSanitizer } from './security/sanitizer';

// Conflict Resolution
export {
  ConflictResolver,
  ConflictStrategy,
  strategyToPolicy,
  type ResolverOptions,
  type ResolutionResult,
  type ManualResolutionRecord,
  type ResolutionSuggestion,
  type BatchResolutionResult,
  type ResolutionStatistics,
} from './conflict-resolver';

// Merge utilities
export {
  ThreeWayMerger,
  createThreeWayMerger,
  performThreeWayMerge,
  detectTaskConflicts,
  type MergeResult,
  type MergeReport,
} from './merge';

// Types
export type {
  Task,
  TaskStatus,
  TaskPriority,
  SyncConfig,
  SyncDirection,
  SyncStrategy,
  ConflictResolutionPolicy,
  SyncOperation,
  SyncBatch,
  Conflict,
  ConflictResolution,
  SyncState,
  SyncHistory,
  SyncStatistics,
  FileWatcherEvent,
  BackupInfo,
  RestoreResult,
} from './types';

// Interfaces
export type {
  Database,
  DatabaseStats,
  BatchOperationResult,
  TransactionContext,
  QueryOptions,
  QueryResult,
} from './interfaces/database.interface';

export type { FileSystem } from './interfaces/file-system.interface';
