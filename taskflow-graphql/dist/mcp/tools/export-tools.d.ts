/**
 * Export MCP tools for TaskFlow
 * Provides Markdown export functionality for boards and tasks
 */
import type { Tool } from '@modelcontextprotocol/sdk/types.js';
import { type MarkdownGeneratorOptions } from '../../utils/markdown-generator.js';
/**
 * Export Tools Schema Definitions
 */
export declare const exportTools: Tool[];
/**
 * Handler for export_board_as_markdown tool
 */
export declare function handleExportBoardAsMarkdown(args: {
    boardId: string;
    format?: string;
    options?: MarkdownGeneratorOptions;
}): Promise<{
    content: Array<{
        type: string;
        text: string;
    }>;
}>;
/**
 * Main handler that routes tool calls
 */
export declare function handleExportTool(toolName: string, args: Record<string, unknown>): Promise<{
    content: Array<{
        type: string;
        text: string;
    }>;
}>;
//# sourceMappingURL=export-tools.d.ts.map