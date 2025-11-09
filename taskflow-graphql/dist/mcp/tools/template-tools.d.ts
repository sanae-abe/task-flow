/**
 * Template management MCP tools
 * Integrates with existing template resolvers
 */
import type { Tool } from '@modelcontextprotocol/sdk/types.js';
/**
 * Template Tools Schema Definitions
 */
export declare const templateTools: Tool[];
/**
 * Handler for create_template tool
 */
export declare function handleCreateTemplate(args: {
    name: string;
    description?: string;
    category?: string;
    isFavorite?: boolean;
    taskData: Record<string, unknown>;
}): Promise<{
    content: Array<{
        type: string;
        text: string;
    }>;
}>;
/**
 * Handler for list_templates tool
 */
export declare function handleListTemplates(args: {
    category?: string;
    isFavorite?: boolean;
}): Promise<{
    content: Array<{
        type: string;
        text: string;
    }>;
}>;
/**
 * Handler for create_task_from_template tool
 */
export declare function handleCreateTaskFromTemplate(args: {
    templateId: string;
    boardId: string;
    columnId: string;
    overrides?: Record<string, unknown>;
}): Promise<{
    content: Array<{
        type: string;
        text: string;
    }>;
}>;
/**
 * Handler for update_template tool
 */
export declare function handleUpdateTemplate(args: {
    id: string;
    name?: string;
    description?: string;
    category?: string;
    isFavorite?: boolean;
    taskData?: Record<string, unknown>;
}): Promise<{
    content: Array<{
        type: string;
        text: string;
    }>;
}>;
/**
 * Handler for delete_template tool
 */
export declare function handleDeleteTemplate(args: {
    id: string;
}): Promise<{
    content: Array<{
        type: string;
        text: string;
    }>;
}>;
/**
 * Main handler that routes tool calls
 */
export declare function handleTemplateTool(toolName: string, args: Record<string, unknown>): Promise<{
    content: Array<{
        type: string;
        text: string;
    }>;
}>;
//# sourceMappingURL=template-tools.d.ts.map