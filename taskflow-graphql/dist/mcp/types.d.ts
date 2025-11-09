/**
 * MCP Type Definitions for TaskFlow
 */
export interface MCPToolResult {
    content: Array<{
        type: string;
        text: string;
    }>;
    isError?: boolean;
}
export interface CreateTaskArgs {
    title: string;
    description?: string;
    boardId: string;
    columnId: string;
    priority?: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
    dueDate?: string;
    dueTime?: string;
    labels?: string[];
}
export interface UpdateTaskArgs {
    id: string;
    title?: string;
    description?: string;
    status?: 'TODO' | 'IN_PROGRESS' | 'COMPLETED';
    priority?: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
    columnId?: string;
    dueDate?: string;
    dueTime?: string;
    labels?: string[];
}
export interface ListTasksArgs {
    boardId?: string;
    status?: 'TODO' | 'IN_PROGRESS' | 'COMPLETED' | 'DELETED';
    priority?: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
    limit?: number;
}
export interface CreateBoardArgs {
    name: string;
    description?: string;
}
export interface UpdateBoardArgs {
    id: string;
    name?: string;
    description?: string;
}
export interface TodoSyncArgs {
    action: 'file_to_app' | 'app_to_file' | 'status' | 'backup' | 'restore';
    options?: {
        todoPath?: string;
        dryRun?: boolean;
        force?: boolean;
        backupPath?: string;
        conflictResolution?: 'prefer_file' | 'prefer_app' | 'manual';
        historyLimit?: number;
    };
}
//# sourceMappingURL=types.d.ts.map