import { EventEmitter } from 'events';
import { MarkdownParser } from './markdown-parser';
import { MarkdownGenerator } from './markdown-generator';
import { FileWatcher } from './file-system/file-watcher';
import type { SyncConfig, FileWatcherEvent, SyncHistory, SyncState } from './types';
import type { Database } from './interfaces/database.interface';
/**
 * SyncOrchestrator Events
 */
export interface SyncOrchestratorEvents {
    'sync:start': {
        direction: 'file_to_db' | 'db_to_file';
        timestamp: Date;
    };
    'sync:complete': {
        history: SyncHistory;
    };
    'sync:error': {
        error: Error;
        context: string;
    };
    'file:changed': {
        event: FileWatcherEvent;
    };
    'db:changed': {
        taskIds: string[];
    };
    'state:updated': {
        state: SyncState;
    };
}
/**
 * SyncOrchestrator - Bidirectional TODO.md ↔ TaskFlow DB synchronization
 *
 * Orchestrates file-to-database and database-to-file synchronization with:
 * - Automatic file watching and debounced sync
 * - Retry logic with exponential backoff
 * - Comprehensive error handling
 * - Event emission for monitoring
 * - State tracking and history
 *
 * @example
 * ```typescript
 * const orchestrator = new SyncOrchestrator(
 *   parser,
 *   generator,
 *   watcher,
 *   database,
 *   config
 * );
 *
 * orchestrator.on('sync:complete', (event) => {
 *   console.log('Sync completed:', event.history);
 * });
 *
 * await orchestrator.start();
 * ```
 */
export declare class SyncOrchestrator extends EventEmitter {
    private parser;
    private generator;
    private watcher;
    private database;
    private config;
    private pathValidator;
    private logger;
    private isRunning;
    private syncState;
    private retryConfig;
    private activeOperations;
    private syncHistory;
    /**
     * @param parser Markdown parser for file → task conversion
     * @param generator Markdown generator for task → file conversion
     * @param watcher File watcher for TODO.md changes
     * @param database Database interface for task operations
     * @param config Synchronization configuration
     */
    constructor(parser: MarkdownParser, generator: MarkdownGenerator, watcher: FileWatcher, database: Database, config: SyncConfig);
    /**
     * Setup event handlers for file watcher and database
     */
    private setupEventHandlers;
    /**
     * Start synchronization orchestrator
     */
    start(): Promise<void>;
    /**
     * Stop synchronization orchestrator
     */
    stop(): Promise<void>;
    /**
     * Handle file change events
     */
    private handleFileChange;
    /**
     * Sync file to database with retry logic
     */
    private syncFileToDb;
    /**
     * Sync database to file
     */
    private syncDbToFile;
    /**
     * Update database tasks with parsed data
     */
    private updateDatabaseTasks;
    /**
     * Perform initial sync on startup
     */
    private performInitialSync;
    /**
     * Validate configuration
     */
    private validateConfig;
    /**
     * Calculate retry delay with exponential backoff
     */
    private calculateRetryDelay;
    /**
     * Sleep utility
     */
    private sleep;
    /**
     * Wait for pending operations to complete
     */
    private waitForPendingOperations;
    /**
     * Update sync state and emit event
     */
    private updateSyncState;
    /**
     * Emit sync complete event
     */
    private emitSyncComplete;
    /**
     * Emit sync error event
     */
    private emitSyncError;
    /**
     * Record sync history
     */
    private recordSyncHistory;
    /**
     * Get current sync state
     */
    getSyncState(): SyncState;
    /**
     * Get sync history
     */
    getSyncHistory(limit?: number): SyncHistory[];
    /**
     * Get orchestrator status
     */
    isActive(): boolean;
    /**
     * Manually trigger DB-to-file sync
     */
    triggerDbToFileSync(): Promise<void>;
    /**
     * Manually trigger file-to-DB sync
     */
    triggerFileToDbSync(): Promise<void>;
    /**
     * Convert TaskRecord to Task type (helper method)
     */
    private convertTaskRecordToTask;
    /**
     * Clean up resources
     */
    dispose(): Promise<void>;
}
//# sourceMappingURL=sync-orchestrator.d.ts.map