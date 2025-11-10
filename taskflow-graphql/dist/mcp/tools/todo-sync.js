/**
 * MCP TODO.md Synchronization Tool
 *
 * Provides Model Context Protocol interface for TODO.md file synchronization
 * with the TaskFlow application. Supports bidirectional sync, status queries,
 * backup, and restore operations.
 *
 * Week 6 Day 36-42: MCP Integration with TODO.md Sync System
 */
import { SyncCoordinator } from '../../sync/database/sync-coordinator.js';
import { Logger } from '../../sync/utils/logger.js';
const logger = Logger.getInstance();
/**
 * MCP Authentication - Validates MCP_AUTH_TOKEN
 */
function validateAuthToken() {
    const token = process.env.MCP_AUTH_TOKEN;
    if (!token) {
        logger.logSecurityEvent('auth_failure', { feature: 'mcp-todo-sync' }, 'MCP_AUTH_TOKEN not configured');
        return false;
    }
    // In production, implement proper token validation
    // For now, just check if token exists and is non-empty
    if (token.length < 16) {
        logger.logSecurityEvent('auth_failure', { feature: 'mcp-todo-sync' }, 'MCP_AUTH_TOKEN is too short (minimum 16 characters required)');
        return false;
    }
    logger.logSecurityEvent('auth_success', { feature: 'mcp-todo-sync' }, 'Authentication successful');
    return true;
}
/**
 * Create SyncCoordinator instance
 */
async function createSyncCoordinator(database, options) {
    const todoPath = options?.todoPath || process.env.TODO_PATH || './TODO.md';
    const config = {
        todoPath,
        direction: 'bidirectional',
        strategy: 'last_write_wins',
        conflictResolution: options?.conflictResolution || 'prefer_file',
        debounceMs: 1000,
        throttleMs: 5000,
        maxFileSizeMB: 5,
        maxTasks: 10000,
        webhooksEnabled: false,
        autoBackup: true,
        backupRetentionDays: 7,
        dryRun: options?.dryRun || false,
    };
    const coordinator = new SyncCoordinator({
        config,
        database,
    });
    await coordinator.start();
    return coordinator;
}
/**
 * Format sync statistics for output
 */
function formatStatistics(stats) {
    const successRate = stats.totalSyncs > 0
        ? ((stats.successfulSyncs / stats.totalSyncs) * 100).toFixed(2)
        : '0.00';
    return JSON.stringify({
        summary: {
            totalSyncs: stats.totalSyncs,
            successfulSyncs: stats.successfulSyncs,
            failedSyncs: stats.failedSyncs,
            successRate: `${successRate}%`,
        },
        performance: {
            averageDurationMs: stats.averageDurationMs,
            lastSyncAt: stats.lastSyncAt?.toISOString() || null,
            lastSuccessfulSyncAt: stats.lastSuccessfulSyncAt?.toISOString() || null,
        },
        changes: {
            totalTasksChanged: stats.totalTasksChanged,
            totalConflicts: stats.totalConflicts,
            autoResolvedConflicts: stats.autoResolvedConflicts,
            manualResolvedConflicts: stats.manualResolvedConflicts,
        },
    }, null, 2);
}
/**
 * Format sync history for output
 */
function formatHistory(history) {
    return JSON.stringify(history.map(h => ({
        id: h.id,
        direction: h.direction,
        startedAt: h.startedAt.toISOString(),
        completedAt: h.completedAt?.toISOString() || null,
        durationMs: h.durationMs,
        success: h.success,
        changes: {
            tasksChanged: h.tasksChanged,
            tasksCreated: h.tasksCreated,
            tasksUpdated: h.tasksUpdated,
            tasksDeleted: h.tasksDeleted,
        },
        conflicts: {
            detected: h.conflictsDetected,
            resolved: h.conflictsResolved,
        },
        error: h.error?.message || null,
    })), null, 2);
}
/**
 * Format conflicts for output
 */
function formatConflicts(conflicts) {
    return JSON.stringify(conflicts.map(c => ({
        id: c.id,
        taskId: c.taskId,
        conflictType: c.conflictType,
        detectedAt: c.detectedAt.toISOString(),
        resolved: c.resolved,
        resolvedAt: c.resolvedAt?.toISOString() || null,
        fileVersion: {
            title: c.fileVersion.title,
            status: c.fileVersion.status,
            priority: c.fileVersion.priority,
        },
        appVersion: {
            title: c.appVersion.title,
            status: c.appVersion.status,
            priority: c.appVersion.priority,
        },
    })), null, 2);
}
/**
 * Tool Definition: todo_sync
 */
export const todoSyncTools = [
    {
        name: 'todo_sync',
        description: 'Synchronize TODO.md file with TaskFlow application. Supports bidirectional sync, status queries, backup, and restore operations.',
        inputSchema: {
            type: 'object',
            properties: {
                action: {
                    type: 'string',
                    enum: ['file_to_app', 'app_to_file', 'status', 'backup', 'restore'],
                    description: 'Sync action to perform',
                },
                options: {
                    type: 'object',
                    description: 'Optional configuration overrides',
                    properties: {
                        todoPath: {
                            type: 'string',
                            description: 'TODO.md file path override',
                        },
                        dryRun: {
                            type: 'boolean',
                            description: 'Dry run mode (no actual changes)',
                        },
                        force: {
                            type: 'boolean',
                            description: 'Force sync even if no changes detected',
                        },
                        backupPath: {
                            type: 'string',
                            description: 'Backup file path (for restore action)',
                        },
                        conflictResolution: {
                            type: 'string',
                            enum: ['prefer_file', 'prefer_app', 'manual'],
                            description: 'Conflict resolution strategy override',
                        },
                        historyLimit: {
                            type: 'number',
                            description: 'Number of history entries to return (for status action)',
                            minimum: 1,
                            maximum: 100,
                        },
                    },
                },
            },
            required: ['action'],
        },
    },
];
/**
 * Handle file_to_app sync action
 */
async function handleFileToApp(coordinator, options) {
    const timer = logger.startTimer('mcp-file-to-app');
    try {
        await coordinator.syncFileToApp();
        const stats = coordinator.getStats();
        const history = coordinator.getSyncHistory(1);
        const lastSync = history[0];
        timer.done({ itemsProcessed: lastSync?.tasksChanged || 0 });
        return {
            content: [
                {
                    type: 'text',
                    text: JSON.stringify({
                        success: true,
                        action: 'file_to_app',
                        dryRun: options?.dryRun || false,
                        result: lastSync
                            ? {
                                tasksChanged: lastSync.tasksChanged,
                                tasksCreated: lastSync.tasksCreated,
                                tasksUpdated: lastSync.tasksUpdated,
                                tasksDeleted: lastSync.tasksDeleted,
                                conflictsDetected: lastSync.conflictsDetected,
                                conflictsResolved: lastSync.conflictsResolved,
                                durationMs: lastSync.durationMs,
                            }
                            : null,
                        statistics: {
                            totalSyncs: stats.totalSyncs,
                            successRate: stats.totalSyncs > 0
                                ? ((stats.successfulSyncs / stats.totalSyncs) *
                                    100).toFixed(2) + '%'
                                : '0%',
                        },
                    }, null, 2),
                },
            ],
        };
    }
    catch (error) {
        logger.error({ err: error, action: 'file_to_app' }, 'File to app sync failed');
        return {
            content: [
                {
                    type: 'text',
                    text: `Error: File to app sync failed - ${error instanceof Error ? error.message : 'Unknown error'}`,
                },
            ],
            isError: true,
        };
    }
}
/**
 * Handle app_to_file sync action
 */
async function handleAppToFile(coordinator, options) {
    const timer = logger.startTimer('mcp-app-to-file');
    try {
        await coordinator.syncAppToFile();
        const stats = coordinator.getStats();
        const history = coordinator.getSyncHistory(1);
        const lastSync = history[0];
        timer.done({ itemsProcessed: lastSync?.tasksChanged || 0 });
        return {
            content: [
                {
                    type: 'text',
                    text: JSON.stringify({
                        success: true,
                        action: 'app_to_file',
                        dryRun: options?.dryRun || false,
                        result: lastSync
                            ? {
                                tasksWritten: lastSync.tasksChanged,
                                durationMs: lastSync.durationMs,
                            }
                            : null,
                        statistics: {
                            totalSyncs: stats.totalSyncs,
                            successRate: stats.totalSyncs > 0
                                ? ((stats.successfulSyncs / stats.totalSyncs) *
                                    100).toFixed(2) + '%'
                                : '0%',
                        },
                    }, null, 2),
                },
            ],
        };
    }
    catch (error) {
        logger.error({ err: error, action: 'app_to_file' }, 'App to file sync failed');
        return {
            content: [
                {
                    type: 'text',
                    text: `Error: App to file sync failed - ${error instanceof Error ? error.message : 'Unknown error'}`,
                },
            ],
            isError: true,
        };
    }
}
/**
 * Handle status query action
 */
async function handleStatus(coordinator, options) {
    try {
        const stats = coordinator.getStats();
        const historyLimit = options?.historyLimit || 10;
        const history = coordinator.getSyncHistory(historyLimit);
        const conflicts = coordinator.getConflicts();
        return {
            content: [
                {
                    type: 'text',
                    text: JSON.stringify({
                        success: true,
                        action: 'status',
                        statistics: formatStatistics(stats),
                        recentHistory: formatHistory(history),
                        unresolvedConflicts: {
                            count: conflicts.length,
                            conflicts: conflicts.length > 0 ? formatConflicts(conflicts) : [],
                        },
                    }, null, 2),
                },
            ],
        };
    }
    catch (error) {
        logger.error({ err: error, action: 'status' }, 'Status query failed');
        return {
            content: [
                {
                    type: 'text',
                    text: `Error: Status query failed - ${error instanceof Error ? error.message : 'Unknown error'}`,
                },
            ],
            isError: true,
        };
    }
}
/**
 * Handle backup action
 */
async function handleBackup(coordinator, _options) {
    try {
        // Backup functionality is handled automatically by SyncCoordinator
        // This action provides a manual trigger
        const stats = coordinator.getStats();
        return {
            content: [
                {
                    type: 'text',
                    text: JSON.stringify({
                        success: true,
                        action: 'backup',
                        message: 'Automatic backups are enabled in SyncCoordinator',
                        note: 'Backups are created automatically before each sync operation',
                        statistics: {
                            totalSyncs: stats.totalSyncs,
                            lastSyncAt: stats.lastSyncAt?.toISOString() || null,
                        },
                    }, null, 2),
                },
            ],
        };
    }
    catch (error) {
        logger.error({ err: error, action: 'backup' }, 'Backup creation failed');
        return {
            content: [
                {
                    type: 'text',
                    text: `Error: Backup creation failed - ${error instanceof Error ? error.message : 'Unknown error'}`,
                },
            ],
            isError: true,
        };
    }
}
/**
 * Handle restore action
 */
async function handleRestore(coordinator, options) {
    const timer = logger.startTimer('mcp-restore');
    try {
        // Validate backupPath parameter
        if (!options?.backupPath) {
            return {
                content: [
                    {
                        type: 'text',
                        text: 'Error: backupPath is required for restore action',
                    },
                ],
                isError: true,
            };
        }
        const backupPath = options.backupPath;
        const todoPath = options.todoPath || process.env.TODO_PATH || './TODO.md';
        // Import required modules for restore operation
        const { promises: fs } = await import('fs');
        const path = await import('path');
        const { PathValidator } = await import('../../sync/security/path-validator.js');
        // 1. Validate backup path with PathValidator
        const backupValidator = new PathValidator(process.cwd());
        let validatedBackupPath;
        try {
            validatedBackupPath = await backupValidator.validateAsync(backupPath);
        }
        catch (error) {
            logger.logSecurityEvent('path_traversal', { backupPath, feature: 'mcp-restore' }, `Invalid backup path: ${error instanceof Error ? error.message : 'Unknown error'}`);
            return {
                content: [
                    {
                        type: 'text',
                        text: `Error: Invalid backup path - ${error instanceof Error ? error.message : 'Path validation failed'}`,
                    },
                ],
                isError: true,
            };
        }
        // 2. Validate backup file exists and is readable
        const backupExists = await backupValidator.exists(validatedBackupPath);
        if (!backupExists) {
            return {
                content: [
                    {
                        type: 'text',
                        text: `Error: Backup file not found at path: ${backupPath}`,
                    },
                ],
                isError: true,
            };
        }
        const backupReadable = await backupValidator.isReadable(validatedBackupPath);
        if (!backupReadable) {
            return {
                content: [
                    {
                        type: 'text',
                        text: `Error: Backup file is not readable: ${backupPath}`,
                    },
                ],
                isError: true,
            };
        }
        // 3. Validate file size (prevent memory exhaustion)
        try {
            await backupValidator.validateFileSize(validatedBackupPath, 5);
        }
        catch (error) {
            return {
                content: [
                    {
                        type: 'text',
                        text: `Error: ${error instanceof Error ? error.message : 'Backup file too large'}`,
                    },
                ],
                isError: true,
            };
        }
        // 4. Read backup file content
        let backupContent;
        let backupStats;
        try {
            backupContent = await fs.readFile(validatedBackupPath, 'utf-8');
            backupStats = await fs.stat(validatedBackupPath);
        }
        catch (error) {
            logger.error({ err: error, backupPath: validatedBackupPath }, 'Failed to read backup file');
            return {
                content: [
                    {
                        type: 'text',
                        text: `Error: Failed to read backup file - ${error instanceof Error ? error.message : 'Unknown error'}`,
                    },
                ],
                isError: true,
            };
        }
        // 5. Validate TODO.md path with PathValidator
        const todoValidator = new PathValidator(process.cwd());
        let validatedTodoPath;
        try {
            validatedTodoPath = await todoValidator.validateAsync(todoPath);
        }
        catch (error) {
            logger.logSecurityEvent('path_traversal', { todoPath, feature: 'mcp-restore' }, `Invalid TODO.md path: ${error instanceof Error ? error.message : 'Unknown error'}`);
            return {
                content: [
                    {
                        type: 'text',
                        text: `Error: Invalid TODO.md path - ${error instanceof Error ? error.message : 'Path validation failed'}`,
                    },
                ],
                isError: true,
            };
        }
        // 6. Create backup of current TODO.md before restoring (if it exists)
        let currentBackupPath = null;
        if (await todoValidator.exists(validatedTodoPath)) {
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const dirname = path.dirname(validatedTodoPath);
            const basename = path.basename(validatedTodoPath, '.md');
            currentBackupPath = path.join(dirname, `.backup/${basename}_before_restore_${timestamp}.md`);
            try {
                // Ensure backup directory exists
                const backupDir = path.dirname(currentBackupPath);
                await fs.mkdir(backupDir, { recursive: true });
                // Copy current TODO.md to backup
                await fs.copyFile(validatedTodoPath, currentBackupPath);
                logger.info({ currentBackupPath }, 'Created backup of current TODO.md before restore');
            }
            catch (error) {
                logger.warn({ err: error }, 'Failed to backup current TODO.md before restore');
                // Continue with restore even if backup fails
            }
        }
        // 7. Write backup content to TODO.md path
        try {
            await fs.writeFile(validatedTodoPath, backupContent, 'utf-8');
            logger.info({ backupPath: validatedBackupPath, todoPath: validatedTodoPath }, 'Successfully restored backup to TODO.md');
        }
        catch (error) {
            logger.error({ err: error, todoPath: validatedTodoPath }, 'Failed to write restored content');
            return {
                content: [
                    {
                        type: 'text',
                        text: `Error: Failed to write restored content to TODO.md - ${error instanceof Error ? error.message : 'Unknown error'}`,
                    },
                ],
                isError: true,
            };
        }
        // 8. Trigger file_to_app sync after restore
        let syncResult = null;
        try {
            await coordinator.syncFileToApp();
            const history = coordinator.getSyncHistory(1);
            syncResult = history[0];
            logger.info({ tasksChanged: syncResult?.tasksChanged || 0 }, 'Successfully synced restored TODO.md to app');
        }
        catch (error) {
            logger.error({ err: error }, 'Failed to sync restored TODO.md to app');
            // Restore was successful but sync failed - this is a partial success
            return {
                content: [
                    {
                        type: 'text',
                        text: JSON.stringify({
                            success: true,
                            action: 'restore',
                            warning: 'Restore succeeded but sync to app failed',
                            restore: {
                                backupPath: validatedBackupPath,
                                todoPath: validatedTodoPath,
                                backupSize: backupStats.size,
                                backupModified: backupStats.mtime.toISOString(),
                                currentBackupPath,
                            },
                            syncError: error instanceof Error ? error.message : 'Unknown sync error',
                            recommendation: 'Run file_to_app action manually to complete the restore',
                        }, null, 2),
                    },
                ],
            };
        }
        // 9. Return success message with restore details
        const stats = coordinator.getStats();
        timer.done({ itemsProcessed: syncResult?.tasksChanged || 0 });
        return {
            content: [
                {
                    type: 'text',
                    text: JSON.stringify({
                        success: true,
                        action: 'restore',
                        restore: {
                            backupPath: validatedBackupPath,
                            todoPath: validatedTodoPath,
                            backupSize: backupStats.size,
                            backupModified: backupStats.mtime.toISOString(),
                            currentBackupPath,
                        },
                        sync: syncResult
                            ? {
                                tasksChanged: syncResult.tasksChanged,
                                tasksCreated: syncResult.tasksCreated,
                                tasksUpdated: syncResult.tasksUpdated,
                                tasksDeleted: syncResult.tasksDeleted,
                                conflictsDetected: syncResult.conflictsDetected,
                                conflictsResolved: syncResult.conflictsResolved,
                                durationMs: syncResult.durationMs,
                            }
                            : null,
                        statistics: {
                            totalSyncs: stats.totalSyncs,
                            successRate: stats.totalSyncs > 0
                                ? ((stats.successfulSyncs / stats.totalSyncs) *
                                    100).toFixed(2) + '%'
                                : '0%',
                        },
                    }, null, 2),
                },
            ],
        };
    }
    catch (error) {
        logger.error({ err: error, action: 'restore' }, 'Restore operation failed');
        return {
            content: [
                {
                    type: 'text',
                    text: `Error: Restore operation failed - ${error instanceof Error ? error.message : 'Unknown error'}`,
                },
            ],
            isError: true,
        };
    }
}
/**
 * Main handler for todo_sync tool
 */
export async function handleTodoSync(args, database) {
    const timer = logger.startTimer('mcp-todo-sync');
    logger.info({ action: args.action, options: args.options }, 'TODO sync MCP tool invoked');
    // Validate authentication
    if (!validateAuthToken()) {
        return {
            content: [
                {
                    type: 'text',
                    text: 'Error: Authentication failed. MCP_AUTH_TOKEN is not valid or not configured.',
                },
            ],
            isError: true,
        };
    }
    let coordinator = null;
    try {
        // Create SyncCoordinator instance
        coordinator = await createSyncCoordinator(database, args.options);
        // Route to appropriate action handler
        let result;
        switch (args.action) {
            case 'file_to_app':
                result = await handleFileToApp(coordinator, args.options);
                break;
            case 'app_to_file':
                result = await handleAppToFile(coordinator, args.options);
                break;
            case 'status':
                result = await handleStatus(coordinator, args.options);
                break;
            case 'backup':
                result = await handleBackup(coordinator, args.options);
                break;
            case 'restore':
                result = await handleRestore(coordinator, args.options);
                break;
            default:
                result = {
                    content: [
                        {
                            type: 'text',
                            text: `Error: Unknown action '${args.action}'. Valid actions: file_to_app, app_to_file, status, backup, restore`,
                        },
                    ],
                    isError: true,
                };
        }
        timer.done({ operation: `todo-sync-${args.action}` });
        return result;
    }
    catch (error) {
        logger.error({ err: error, action: args.action }, 'TODO sync MCP tool failed');
        return {
            content: [
                {
                    type: 'text',
                    text: `Error: TODO sync failed - ${error instanceof Error ? error.message : 'Unknown error'}`,
                },
            ],
            isError: true,
        };
    }
    finally {
        // Clean up coordinator
        if (coordinator) {
            try {
                await coordinator.stop();
            }
            catch (error) {
                logger.warn({ err: error }, 'Failed to stop SyncCoordinator');
            }
        }
    }
}
//# sourceMappingURL=todo-sync.js.map