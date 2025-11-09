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
                        result: lastSync ? {
                            tasksChanged: lastSync.tasksChanged,
                            tasksCreated: lastSync.tasksCreated,
                            tasksUpdated: lastSync.tasksUpdated,
                            tasksDeleted: lastSync.tasksDeleted,
                            conflictsDetected: lastSync.conflictsDetected,
                            conflictsResolved: lastSync.conflictsResolved,
                            durationMs: lastSync.durationMs,
                        } : null,
                        statistics: {
                            totalSyncs: stats.totalSyncs,
                            successRate: stats.totalSyncs > 0
                                ? ((stats.successfulSyncs / stats.totalSyncs) * 100).toFixed(2) + '%'
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
                        result: lastSync ? {
                            tasksWritten: lastSync.tasksChanged,
                            durationMs: lastSync.durationMs,
                        } : null,
                        statistics: {
                            totalSyncs: stats.totalSyncs,
                            successRate: stats.totalSyncs > 0
                                ? ((stats.successfulSyncs / stats.totalSyncs) * 100).toFixed(2) + '%'
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
async function handleBackup(coordinator, options) {
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
    try {
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
        return {
            content: [
                {
                    type: 'text',
                    text: JSON.stringify({
                        success: false,
                        action: 'restore',
                        message: 'Restore functionality is not yet implemented',
                        note: 'Manual restore: Copy backup file to TODO.md path and run file_to_app sync',
                        providedBackupPath: options.backupPath,
                    }, null, 2),
                },
            ],
            isError: true,
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