/**
 * MCP TODO.md Synchronization Tool
 *
 * Provides Model Context Protocol interface for TODO.md file synchronization
 * with the TaskFlow application. Supports bidirectional sync, status queries,
 * backup, and restore operations.
 *
 * Week 6 Day 36-42: MCP Integration with TODO.md Sync System
 */
import type { MCPToolResult } from '../types.js';
import type { IDBPDatabase } from 'idb';
/**
 * TODO Sync Tool Input Schema
 */
export interface TodoSyncArgs {
    /** Sync action to perform */
    action: 'file_to_app' | 'app_to_file' | 'status' | 'backup' | 'restore';
    /** Optional configuration overrides */
    options?: {
        /** TODO.md file path override */
        todoPath?: string;
        /** Dry run mode (no actual changes) */
        dryRun?: boolean;
        /** Force sync even if no changes detected */
        force?: boolean;
        /** Backup file path (for restore action) */
        backupPath?: string;
        /** Conflict resolution override */
        conflictResolution?: 'prefer_file' | 'prefer_app' | 'manual';
        /** Number of history entries to return (for status) */
        historyLimit?: number;
    };
}
/**
 * Tool Definition: todo_sync
 */
export declare const todoSyncTools: {
    name: string;
    description: string;
    inputSchema: {
        type: string;
        properties: {
            action: {
                type: string;
                enum: string[];
                description: string;
            };
            options: {
                type: string;
                description: string;
                properties: {
                    todoPath: {
                        type: string;
                        description: string;
                    };
                    dryRun: {
                        type: string;
                        description: string;
                    };
                    force: {
                        type: string;
                        description: string;
                    };
                    backupPath: {
                        type: string;
                        description: string;
                    };
                    conflictResolution: {
                        type: string;
                        enum: string[];
                        description: string;
                    };
                    historyLimit: {
                        type: string;
                        description: string;
                        minimum: number;
                        maximum: number;
                    };
                };
            };
        };
        required: string[];
    };
}[];
/**
 * Main handler for todo_sync tool
 */
export declare function handleTodoSync(args: TodoSyncArgs, database?: IDBPDatabase): Promise<MCPToolResult>;
//# sourceMappingURL=todo-sync.d.ts.map