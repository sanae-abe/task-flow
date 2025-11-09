/**
 * MCP Task Tools Implementation
 * Provides CRUD operations for tasks via MCP
 */
import type { MCPToolResult, CreateTaskArgs, UpdateTaskArgs, ListTasksArgs } from '../types.js';
/**
 * Tool definitions for Task operations
 */
export declare const taskTools: ({
    name: string;
    description: string;
    inputSchema: {
        type: string;
        properties: {
            title: {
                type: string;
                description: string;
            };
            description: {
                type: string;
                description: string;
            };
            boardId: {
                type: string;
                description: string;
            };
            columnId: {
                type: string;
                description: string;
            };
            priority: {
                type: string;
                enum: string[];
                description: string;
            };
            dueDate: {
                type: string;
                format: string;
                description: string;
            };
            dueTime: {
                type: string;
                description: string;
            };
            labels: {
                type: string;
                items: {
                    type: string;
                };
                description: string;
            };
            id?: undefined;
            status?: undefined;
            limit?: undefined;
            updates?: undefined;
        };
        required: string[];
    };
} | {
    name: string;
    description: string;
    inputSchema: {
        type: string;
        properties: {
            id: {
                type: string;
                description: string;
            };
            title: {
                type: string;
                description: string;
            };
            description: {
                type: string;
                description: string;
            };
            status: {
                type: string;
                enum: string[];
                description: string;
            };
            priority: {
                type: string;
                enum: string[];
                description: string;
            };
            columnId: {
                type: string;
                description: string;
            };
            dueDate: {
                type: string;
                format: string;
                description: string;
            };
            dueTime: {
                type: string;
                description: string;
            };
            labels: {
                type: string;
                items: {
                    type: string;
                };
                description: string;
            };
            boardId?: undefined;
            limit?: undefined;
            updates?: undefined;
        };
        required: string[];
    };
} | {
    name: string;
    description: string;
    inputSchema: {
        type: string;
        properties: {
            id: {
                type: string;
                description: string;
            };
            title?: undefined;
            description?: undefined;
            boardId?: undefined;
            columnId?: undefined;
            priority?: undefined;
            dueDate?: undefined;
            dueTime?: undefined;
            labels?: undefined;
            status?: undefined;
            limit?: undefined;
            updates?: undefined;
        };
        required: string[];
    };
} | {
    name: string;
    description: string;
    inputSchema: {
        type: string;
        properties: {
            boardId: {
                type: string;
                description: string;
            };
            status: {
                type: string;
                enum: string[];
                description: string;
            };
            priority: {
                type: string;
                enum: string[];
                description: string;
            };
            limit: {
                type: string;
                description: string;
            };
            title?: undefined;
            description?: undefined;
            columnId?: undefined;
            dueDate?: undefined;
            dueTime?: undefined;
            labels?: undefined;
            id?: undefined;
            updates?: undefined;
        };
        required?: undefined;
    };
} | {
    name: string;
    description: string;
    inputSchema: {
        type: string;
        properties: {
            updates: {
                type: string;
                description: string;
                items: {
                    type: string;
                    properties: {
                        taskId: {
                            type: string;
                            description: string;
                        };
                        updates: {
                            type: string;
                            description: string;
                            properties: {
                                title: {
                                    type: string;
                                };
                                description: {
                                    type: string;
                                };
                                status: {
                                    type: string;
                                    enum: string[];
                                };
                                priority: {
                                    type: string;
                                    enum: string[];
                                };
                                columnId: {
                                    type: string;
                                };
                                dueDate: {
                                    type: string;
                                    format: string;
                                };
                                dueTime: {
                                    type: string;
                                };
                                labels: {
                                    type: string;
                                    items: {
                                        type: string;
                                    };
                                };
                            };
                        };
                    };
                    required: string[];
                };
            };
            title?: undefined;
            description?: undefined;
            boardId?: undefined;
            columnId?: undefined;
            priority?: undefined;
            dueDate?: undefined;
            dueTime?: undefined;
            labels?: undefined;
            id?: undefined;
            status?: undefined;
            limit?: undefined;
        };
        required: string[];
    };
})[];
/**
 * Handle create_task tool call
 */
export declare function handleCreateTask(args: CreateTaskArgs): Promise<MCPToolResult>;
/**
 * Handle update_task tool call
 */
export declare function handleUpdateTask(args: UpdateTaskArgs): Promise<MCPToolResult>;
/**
 * Handle delete_task tool call
 */
export declare function handleDeleteTask(args: {
    id: string;
}): Promise<MCPToolResult>;
/**
 * Handle get_task tool call
 */
export declare function handleGetTask(args: {
    id: string;
}): Promise<MCPToolResult>;
/**
 * Handle list_tasks tool call
 */
export declare function handleListTasks(args: ListTasksArgs): Promise<MCPToolResult>;
/**
 * Handle complete_task tool call
 */
export declare function handleCompleteTask(args: {
    id: string;
}): Promise<MCPToolResult>;
/**
 * Handle batch_update_tasks tool call
 * Week 7 Day 43-49: Performance optimization
 * Parallel batch processing for multiple task updates
 */
export declare function handleBatchUpdateTasks(args: {
    updates: Array<{
        taskId: string;
        updates: Record<string, unknown>;
    }>;
}): Promise<MCPToolResult>;
//# sourceMappingURL=task-tools.d.ts.map