import { EventEmitter } from 'events';
import { PathValidator } from './security/path-validator';
import { Logger } from './utils/logger';
import { randomUUID } from 'crypto';
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
export class SyncOrchestrator extends EventEmitter {
    parser;
    generator;
    watcher;
    database;
    config;
    pathValidator;
    logger;
    isRunning = false;
    syncState;
    retryConfig;
    activeOperations = new Map();
    syncHistory = [];
    /**
     * @param parser Markdown parser for file → task conversion
     * @param generator Markdown generator for task → file conversion
     * @param watcher File watcher for TODO.md changes
     * @param database Database interface for task operations
     * @param config Synchronization configuration
     */
    constructor(parser, generator, watcher, database, config) {
        super();
        this.parser = parser;
        this.generator = generator;
        this.watcher = watcher;
        this.database = database;
        this.config = config;
        this.pathValidator = new PathValidator(process.cwd());
        this.logger = Logger.getInstance().child({
            feature: 'sync-orchestrator',
            todoPath: config.todoPath,
        });
        // Initialize sync state
        this.syncState = {
            syncing: false,
            pendingOperations: 0,
            unresolvedConflicts: 0,
            errors: [],
            version: 1,
        };
        // Configure retry strategy
        this.retryConfig = {
            maxRetries: 3,
            initialDelayMs: 1000,
            maxDelayMs: 10000,
            backoffMultiplier: 2,
        };
        this.setupEventHandlers();
    }
    /**
     * Setup event handlers for file watcher and database
     */
    setupEventHandlers() {
        // File change events (debounced by watcher)
        this.watcher.on('change', (event) => this.handleFileChange(event));
        this.watcher.on('add', (event) => this.handleFileChange(event));
        // File watcher errors
        this.watcher.on('error', (event) => {
            this.logger.error({ err: event.error, path: event.path }, 'File watcher error');
            this.emitSyncError(event.error || new Error('File watcher error'), 'file_watcher');
        });
        this.logger.debug('Event handlers setup completed');
    }
    /**
     * Start synchronization orchestrator
     */
    async start() {
        if (this.isRunning) {
            this.logger.warn('SyncOrchestrator is already running');
            return;
        }
        try {
            this.logger.info('Starting SyncOrchestrator...');
            // Validate configuration
            this.validateConfig();
            // Ensure database is connected
            if (!this.database.isConnected()) {
                await this.database.connect();
            }
            // Start file watcher
            await this.watcher.start();
            // Perform initial sync (file → DB)
            await this.performInitialSync();
            this.isRunning = true;
            this.syncState.lastSyncAt = new Date();
            this.logger.info({
                direction: this.config.direction,
                strategy: this.config.strategy,
                todoPath: this.config.todoPath,
            }, 'SyncOrchestrator started successfully');
        }
        catch (error) {
            this.logger.error({ err: error }, 'Failed to start SyncOrchestrator');
            this.isRunning = false;
            throw error;
        }
    }
    /**
     * Stop synchronization orchestrator
     */
    async stop() {
        if (!this.isRunning) {
            this.logger.warn('SyncOrchestrator is not running');
            return;
        }
        try {
            this.logger.info('Stopping SyncOrchestrator...');
            // Wait for pending operations to complete
            if (this.activeOperations.size > 0) {
                this.logger.info({ pendingOps: this.activeOperations.size }, 'Waiting for pending operations...');
                await this.waitForPendingOperations(5000); // 5 second timeout
            }
            // Stop file watcher
            await this.watcher.stop();
            this.isRunning = false;
            this.logger.info({
                totalSyncs: this.syncHistory.length,
                lastSyncAt: this.syncState.lastSyncAt,
            }, 'SyncOrchestrator stopped successfully');
        }
        catch (error) {
            this.logger.error({ err: error }, 'Failed to stop SyncOrchestrator');
            throw error;
        }
    }
    /**
     * Handle file change events
     */
    async handleFileChange(event) {
        if (!this.isRunning) {
            this.logger.debug('Ignoring file change - orchestrator not running');
            return;
        }
        // Emit file change event
        this.emit('file:changed', { event });
        this.logger.info({
            eventType: event.type,
            path: event.path,
            size: event.stats?.size,
        }, 'File change detected, triggering sync');
        // Trigger file-to-DB sync
        await this.syncFileToDb();
    }
    /**
     * Sync file to database with retry logic
     */
    async syncFileToDb() {
        const historyId = randomUUID();
        const startedAt = new Date();
        this.emit('sync:start', { direction: 'file_to_db', timestamp: startedAt });
        this.updateSyncState({ syncing: true });
        let retries = 0;
        let lastError;
        while (retries <= this.retryConfig.maxRetries) {
            try {
                // Parse markdown file
                const validatedPath = this.pathValidator.validate(this.config.todoPath);
                const tasks = await this.parser.parse(validatedPath);
                this.logger.info({ taskCount: tasks.length, attempt: retries + 1 }, 'Parsed tasks from markdown file');
                // Dry run check
                if (this.config.dryRun) {
                    this.logger.info({ taskCount: tasks.length }, 'Dry run mode - skipping database updates');
                    this.emitSyncComplete(historyId, startedAt, tasks.length, 0, 0);
                    return;
                }
                // Update database (using batch operations for efficiency)
                const result = await this.updateDatabaseTasks(tasks);
                this.logger.info({
                    created: result.created,
                    updated: result.updated,
                    deleted: result.deleted,
                }, 'Database update completed');
                // Success - emit completion event
                this.emitSyncComplete(historyId, startedAt, tasks.length, result.created + result.updated, result.deleted);
                return;
            }
            catch (error) {
                lastError = error;
                retries++;
                this.logger.warn({
                    err: error,
                    attempt: retries,
                    maxRetries: this.retryConfig.maxRetries,
                }, 'Sync file-to-DB failed, retrying...');
                if (retries <= this.retryConfig.maxRetries) {
                    const delay = this.calculateRetryDelay(retries);
                    await this.sleep(delay);
                }
            }
        }
        // All retries exhausted
        this.emitSyncError(lastError || new Error('Sync failed after retries'), 'sync_file_to_db');
        this.recordSyncHistory(historyId, startedAt, false, lastError);
    }
    /**
     * Sync database to file
     */
    async syncDbToFile(tasks) {
        const historyId = randomUUID();
        const startedAt = new Date();
        this.emit('sync:start', { direction: 'db_to_file', timestamp: startedAt });
        this.updateSyncState({ syncing: true });
        let retries = 0;
        let lastError;
        while (retries <= this.retryConfig.maxRetries) {
            try {
                // Dry run check
                if (this.config.dryRun) {
                    this.logger.info({ taskCount: tasks.length }, 'Dry run mode - skipping file write');
                    this.emitSyncComplete(historyId, startedAt, tasks.length, 0, 0);
                    return;
                }
                // Generate markdown and write to file
                const validatedPath = this.pathValidator.validate(this.config.todoPath);
                await this.generator.generate(tasks, validatedPath);
                this.logger.info({ taskCount: tasks.length, path: validatedPath }, 'Markdown file generated successfully');
                // Success - emit completion event
                this.emitSyncComplete(historyId, startedAt, tasks.length, 0, 0);
                return;
            }
            catch (error) {
                lastError = error;
                retries++;
                this.logger.warn({
                    err: error,
                    attempt: retries,
                    maxRetries: this.retryConfig.maxRetries,
                }, 'Sync DB-to-file failed, retrying...');
                if (retries <= this.retryConfig.maxRetries) {
                    const delay = this.calculateRetryDelay(retries);
                    await this.sleep(delay);
                }
            }
        }
        // All retries exhausted
        this.emitSyncError(lastError || new Error('Sync failed after retries'), 'sync_db_to_file');
        this.recordSyncHistory(historyId, startedAt, false, lastError);
    }
    /**
     * Update database tasks with parsed data
     */
    async updateDatabaseTasks(tasks) {
        let created = 0;
        let updated = 0;
        let deleted = 0;
        // For simplicity, we'll use a basic strategy:
        // 1. Get existing tasks from database
        // 2. Compare and create/update as needed
        // 3. Mark missing tasks as deleted (soft delete)
        // Note: In production, this should use the conflict resolution
        // and three-way merge strategies from the config
        try {
            // Get existing tasks (assuming a default board)
            const boardId = 'default';
            const existingTasksResult = await this.database.getTasksByBoard(boardId);
            const existingTasks = existingTasksResult.data;
            // Create a map of existing tasks by title (simplified matching)
            const existingTaskMap = new Map(existingTasks.map(task => [task.title, task]));
            // Process parsed tasks
            for (const task of tasks) {
                const existing = existingTaskMap.get(task.title);
                if (existing) {
                    // Update existing task
                    await this.database.updateTask(existing.id, {
                        status: task.status, // Task status from parser
                        priority: task.priority, // Priority from parser
                        updatedAt: new Date().toISOString(),
                    });
                    updated++;
                    existingTaskMap.delete(task.title); // Mark as processed
                }
                else {
                    // Create new task
                    await this.database.createTask({
                        id: task.id,
                        boardId,
                        columnId: task.columnId,
                        title: task.title,
                        description: task.description,
                        status: task.status,
                        priority: task.priority,
                        position: task.position,
                        createdAt: task.createdAt.toISOString(),
                        updatedAt: task.updatedAt.toISOString(),
                    });
                    created++;
                }
            }
            // Soft delete remaining tasks (not in file)
            for (const [, existingTask] of existingTaskMap) {
                if (!existingTask.deletedAt) {
                    await this.database.updateTask(existingTask.id, {
                        deletedAt: new Date().toISOString(),
                    });
                    deleted++;
                }
            }
            return { created, updated, deleted };
        }
        catch (error) {
            this.logger.error({ err: error }, 'Failed to update database tasks');
            throw error;
        }
    }
    /**
     * Perform initial sync on startup
     */
    async performInitialSync() {
        this.logger.info('Performing initial sync...');
        try {
            const validatedPath = this.pathValidator.validate(this.config.todoPath);
            const exists = await this.pathValidator.exists(validatedPath);
            if (!exists) {
                this.logger.warn({ path: validatedPath }, 'TODO.md does not exist yet, skipping initial sync');
                return;
            }
            // Perform file → DB sync based on direction
            if (this.config.direction === 'file_to_app' ||
                this.config.direction === 'bidirectional') {
                await this.syncFileToDb();
            }
        }
        catch (error) {
            this.logger.error({ err: error }, 'Initial sync failed');
            // Don't throw - allow orchestrator to start and retry later
        }
    }
    /**
     * Validate configuration
     */
    validateConfig() {
        if (!this.config.todoPath) {
            throw new Error('Configuration error: todoPath is required');
        }
        if (!this.config.direction) {
            throw new Error('Configuration error: direction is required');
        }
        if (!this.config.strategy) {
            throw new Error('Configuration error: strategy is required');
        }
        this.logger.debug({
            todoPath: this.config.todoPath,
            direction: this.config.direction,
            strategy: this.config.strategy,
        }, 'Configuration validated');
    }
    /**
     * Calculate retry delay with exponential backoff
     */
    calculateRetryDelay(attempt) {
        const delay = Math.min(this.retryConfig.initialDelayMs *
            Math.pow(this.retryConfig.backoffMultiplier, attempt - 1), this.retryConfig.maxDelayMs);
        return delay;
    }
    /**
     * Sleep utility
     */
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    /**
     * Wait for pending operations to complete
     */
    async waitForPendingOperations(timeoutMs) {
        const startTime = Date.now();
        while (this.activeOperations.size > 0) {
            if (Date.now() - startTime > timeoutMs) {
                this.logger.warn({ pendingOps: this.activeOperations.size }, 'Timeout waiting for pending operations');
                break;
            }
            await this.sleep(100);
        }
    }
    /**
     * Update sync state and emit event
     */
    updateSyncState(updates) {
        this.syncState = {
            ...this.syncState,
            ...updates,
        };
        this.emit('state:updated', { state: this.syncState });
    }
    /**
     * Emit sync complete event
     */
    emitSyncComplete(historyId, startedAt, totalTasks, tasksChanged, tasksDeleted) {
        const completedAt = new Date();
        const durationMs = completedAt.getTime() - startedAt.getTime();
        const history = {
            id: historyId,
            startedAt,
            completedAt,
            direction: this.config.direction,
            tasksChanged,
            tasksCreated: 0, // Simplified - would need more detailed tracking
            tasksUpdated: tasksChanged,
            tasksDeleted,
            conflictsDetected: 0,
            conflictsResolved: 0,
            success: true,
            durationMs,
        };
        this.recordSyncHistory(historyId, startedAt, true);
        this.updateSyncState({
            syncing: false,
            lastSyncAt: completedAt,
            pendingOperations: 0,
        });
        this.emit('sync:complete', { history });
        this.logger.info({
            historyId,
            durationMs,
            tasksChanged,
            tasksDeleted,
        }, 'Sync completed successfully');
    }
    /**
     * Emit sync error event
     */
    emitSyncError(error, context) {
        this.updateSyncState({
            syncing: false,
            errors: [
                ...this.syncState.errors,
                {
                    timestamp: new Date(),
                    message: error.message,
                    details: { context },
                },
            ],
        });
        this.emit('sync:error', { error, context });
        this.logger.error({
            err: error,
            context,
        }, 'Sync error occurred');
    }
    /**
     * Record sync history
     */
    recordSyncHistory(id, startedAt, success, error) {
        const completedAt = new Date();
        const durationMs = completedAt.getTime() - startedAt.getTime();
        const history = {
            id,
            startedAt,
            completedAt,
            direction: this.config.direction,
            tasksChanged: 0,
            tasksCreated: 0,
            tasksUpdated: 0,
            tasksDeleted: 0,
            conflictsDetected: 0,
            conflictsResolved: 0,
            success,
            error,
            durationMs,
        };
        this.syncHistory.push(history);
        // Keep only last 100 history entries
        if (this.syncHistory.length > 100) {
            this.syncHistory = this.syncHistory.slice(-100);
        }
    }
    /**
     * Get current sync state
     */
    getSyncState() {
        return { ...this.syncState };
    }
    /**
     * Get sync history
     */
    getSyncHistory(limit) {
        const history = [...this.syncHistory].reverse();
        return limit ? history.slice(0, limit) : history;
    }
    /**
     * Get orchestrator status
     */
    isActive() {
        return this.isRunning;
    }
    /**
     * Manually trigger DB-to-file sync
     */
    async triggerDbToFileSync() {
        if (!this.isRunning) {
            throw new Error('SyncOrchestrator is not running');
        }
        const boardId = 'default';
        const tasksResult = await this.database.getTasksByBoard(boardId);
        const tasks = tasksResult.data.map(this.convertTaskRecordToTask);
        await this.syncDbToFile(tasks);
    }
    /**
     * Manually trigger file-to-DB sync
     */
    async triggerFileToDbSync() {
        if (!this.isRunning) {
            throw new Error('SyncOrchestrator is not running');
        }
        await this.syncFileToDb();
    }
    /**
     * Convert TaskRecord to Task type (helper method)
     */
    convertTaskRecordToTask(record) {
        return {
            id: record.id,
            boardId: record.boardId,
            columnId: record.columnId,
            title: record.title,
            description: record.description,
            status: record.status,
            priority: record.priority,
            dueDate: record.dueDate ? new Date(record.dueDate) : undefined,
            dueTime: record.dueTime,
            labels: [],
            subtasks: [],
            files: [],
            recurrence: undefined,
            position: record.position || 0,
            createdAt: new Date(record.createdAt),
            updatedAt: new Date(record.updatedAt),
            completedAt: record.completedAt
                ? new Date(record.completedAt)
                : undefined,
            deletedAt: record.deletedAt ? new Date(record.deletedAt) : undefined,
            isOverdue: false,
            completionPercentage: 0,
            estimatedDuration: undefined,
        };
    }
    /**
     * Clean up resources
     */
    async dispose() {
        await this.stop();
        this.removeAllListeners();
        this.logger.info('SyncOrchestrator disposed');
    }
}
//# sourceMappingURL=sync-orchestrator.js.map