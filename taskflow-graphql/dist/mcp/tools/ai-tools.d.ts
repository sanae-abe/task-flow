/**
 * AI-powered MCP tools for task management
 * Integrates with existing AI utilities
 */
import type { Tool } from '@modelcontextprotocol/sdk/types.js';
import type { BreakdownStrategy } from '../../utils/ai-client.js';
/**
 * AI Tools Schema Definitions
 */
export declare const aiTools: Tool[];
/**
 * Handler for breakdown_task tool
 */
export declare function handleBreakdownTask(args: {
    taskId: string;
    strategy?: BreakdownStrategy;
}): Promise<{
    content: Array<{
        type: string;
        text: string;
    }>;
}>;
/**
 * Handler for create_task_from_natural_language tool
 */
export declare function handleCreateTaskFromNaturalLanguage(args: {
    query: string;
    boardId: string;
    columnId?: string;
}): Promise<{
    content: Array<{
        type: string;
        text: string;
    }>;
}>;
/**
 * Handler for optimize_schedule tool
 * Week 7 Day 43-49: Performance optimization with parallel data fetching
 */
export declare function handleOptimizeSchedule(args: {
    boardId: string;
    workHoursPerDay?: number;
    teamSize?: number;
}): Promise<{
    content: Array<{
        type: string;
        text: string;
    }>;
}>;
/**
 * Handler for get_recommended_task tool
 * Week 7 Day 43-49: Performance optimization with parallel data fetching
 */
export declare function handleGetRecommendedTask(args: {
    boardId: string;
    context?: string;
}): Promise<{
    content: Array<{
        type: string;
        text: string;
    }>;
}>;
/**
 * Main handler that routes tool calls
 */
export declare function handleAITool(toolName: string, args: Record<string, unknown>): Promise<{
    content: Array<{
        type: string;
        text: string;
    }>;
}>;
//# sourceMappingURL=ai-tools.d.ts.map