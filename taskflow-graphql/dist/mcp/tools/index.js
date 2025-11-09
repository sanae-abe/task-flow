/**
 * MCP Tools Index
 * Exports all tool definitions and handlers
 * Week 5 Day 32-35: Extended with AI, Template, Webhook, and Export tools
 * Week 6 Day 36-42: Added TODO Sync tool
 */
// Base tools
import { taskTools, handleCreateTask, handleUpdateTask, handleDeleteTask, handleGetTask, handleListTasks, handleCompleteTask, handleBatchUpdateTasks, } from './task-tools.js';
import { boardTools, handleCreateBoard, handleListBoards, handleGetBoard, handleUpdateBoard, } from './board-tools.js';
// Extended tools (Week 5 Day 32-35)
import { aiTools, handleBreakdownTask, handleCreateTaskFromNaturalLanguage, handleOptimizeSchedule, handleGetRecommendedTask, } from './ai-tools.js';
import { templateTools, handleCreateTemplate, handleListTemplates, handleCreateTaskFromTemplate, handleUpdateTemplate, handleDeleteTemplate, } from './template-tools.js';
import { webhookTools, handleCreateWebhook, handleListWebhooks, handleTestWebhook, handleUpdateWebhook, handleDeleteWebhook, handleGetWebhookDeliveries, } from './webhook-tools.js';
import { exportTools, handleExportBoardAsMarkdown } from './export-tools.js';
// Sync tools (Week 6 Day 36-42)
import { todoSyncTools, handleTodoSync } from './todo-sync.js';
// Export all tools
export const allTools = [
    ...taskTools,
    ...boardTools,
    ...aiTools,
    ...templateTools,
    ...webhookTools,
    ...exportTools,
    ...todoSyncTools,
];
// Export all tool handlers
export const toolHandlers = {
    // Task tools
    create_task: handleCreateTask,
    update_task: handleUpdateTask,
    delete_task: handleDeleteTask,
    get_task: handleGetTask,
    list_tasks: handleListTasks,
    complete_task: handleCompleteTask,
    batch_update_tasks: handleBatchUpdateTasks, // Week 7: Performance optimization
    // Board tools
    create_board: handleCreateBoard,
    list_boards: handleListBoards,
    get_board: handleGetBoard,
    update_board: handleUpdateBoard,
    // AI tools
    breakdown_task: handleBreakdownTask,
    create_task_from_natural_language: handleCreateTaskFromNaturalLanguage,
    optimize_schedule: handleOptimizeSchedule,
    get_recommended_task: handleGetRecommendedTask,
    // Template tools
    create_template: handleCreateTemplate,
    list_templates: handleListTemplates,
    create_task_from_template: handleCreateTaskFromTemplate,
    update_template: handleUpdateTemplate,
    delete_template: handleDeleteTemplate,
    // Webhook tools
    create_webhook: handleCreateWebhook,
    list_webhooks: handleListWebhooks,
    test_webhook: handleTestWebhook,
    update_webhook: handleUpdateWebhook,
    delete_webhook: handleDeleteWebhook,
    get_webhook_deliveries: handleGetWebhookDeliveries,
    // Export tools
    export_board_as_markdown: handleExportBoardAsMarkdown,
    // Sync tools (Week 6 Day 36-42)
    todo_sync: handleTodoSync,
};
//# sourceMappingURL=index.js.map