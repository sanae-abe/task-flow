/**
 * MCP Tools Index
 * Exports all tool definitions and handlers
 * Week 5 Day 32-35: Extended with AI, Template, Webhook, and Export tools
 * Week 6 Day 36-42: Added TODO Sync tool
 */
import { handleCreateTask, handleUpdateTask, handleDeleteTask, handleGetTask, handleListTasks, handleCompleteTask, handleBatchUpdateTasks } from './task-tools.js';
import { handleCreateBoard, handleListBoards, handleGetBoard, handleUpdateBoard } from './board-tools.js';
import { handleBreakdownTask, handleCreateTaskFromNaturalLanguage, handleOptimizeSchedule, handleGetRecommendedTask } from './ai-tools.js';
import { handleCreateTemplate, handleListTemplates, handleCreateTaskFromTemplate, handleUpdateTemplate, handleDeleteTemplate } from './template-tools.js';
import { handleCreateWebhook, handleListWebhooks, handleTestWebhook, handleUpdateWebhook, handleDeleteWebhook, handleGetWebhookDeliveries } from './webhook-tools.js';
import { handleExportBoardAsMarkdown } from './export-tools.js';
import { handleTodoSync } from './todo-sync.js';
export declare const allTools: ({
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
} | {
    name: string;
    description: string;
    inputSchema: {
        type: string;
        properties: {
            name: {
                type: string;
                description: string;
            };
            description: {
                type: string;
                description: string;
            };
            id?: undefined;
        };
        required: string[];
    };
} | {
    name: string;
    description: string;
    inputSchema: {
        type: string;
        properties: {
            name?: undefined;
            description?: undefined;
            id?: undefined;
        };
        required?: undefined;
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
            name?: undefined;
            description?: undefined;
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
            name: {
                type: string;
                description: string;
            };
            description: {
                type: string;
                description: string;
            };
        };
        required: string[];
    };
} | {
    [x: string]: unknown;
    name: string;
    inputSchema: {
        [x: string]: unknown;
        type: "object";
        required?: string[] | undefined;
        properties?: {
            [x: string]: unknown;
        } | undefined;
    };
    title?: string | undefined;
    description?: string | undefined;
    outputSchema?: {
        [x: string]: unknown;
        type: "object";
        required?: string[] | undefined;
        properties?: {
            [x: string]: unknown;
        } | undefined;
    } | undefined;
    annotations?: {
        [x: string]: unknown;
        title?: string | undefined;
        readOnlyHint?: boolean | undefined;
        destructiveHint?: boolean | undefined;
        idempotentHint?: boolean | undefined;
        openWorldHint?: boolean | undefined;
    } | undefined;
    _meta?: {
        [x: string]: unknown;
    } | undefined;
    icons?: {
        [x: string]: unknown;
        src: string;
        mimeType?: string | undefined;
        sizes?: string[] | undefined;
    }[] | undefined;
} | {
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
})[];
export declare const toolHandlers: {
    create_task: typeof handleCreateTask;
    update_task: typeof handleUpdateTask;
    delete_task: typeof handleDeleteTask;
    get_task: typeof handleGetTask;
    list_tasks: typeof handleListTasks;
    complete_task: typeof handleCompleteTask;
    batch_update_tasks: typeof handleBatchUpdateTasks;
    create_board: typeof handleCreateBoard;
    list_boards: typeof handleListBoards;
    get_board: typeof handleGetBoard;
    update_board: typeof handleUpdateBoard;
    breakdown_task: typeof handleBreakdownTask;
    create_task_from_natural_language: typeof handleCreateTaskFromNaturalLanguage;
    optimize_schedule: typeof handleOptimizeSchedule;
    get_recommended_task: typeof handleGetRecommendedTask;
    create_template: typeof handleCreateTemplate;
    list_templates: typeof handleListTemplates;
    create_task_from_template: typeof handleCreateTaskFromTemplate;
    update_template: typeof handleUpdateTemplate;
    delete_template: typeof handleDeleteTemplate;
    create_webhook: typeof handleCreateWebhook;
    list_webhooks: typeof handleListWebhooks;
    test_webhook: typeof handleTestWebhook;
    update_webhook: typeof handleUpdateWebhook;
    delete_webhook: typeof handleDeleteWebhook;
    get_webhook_deliveries: typeof handleGetWebhookDeliveries;
    export_board_as_markdown: typeof handleExportBoardAsMarkdown;
    todo_sync: typeof handleTodoSync;
};
export type ToolName = keyof typeof toolHandlers;
//# sourceMappingURL=index.d.ts.map