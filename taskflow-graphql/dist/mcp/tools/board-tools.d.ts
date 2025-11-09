/**
 * MCP Board Tools Implementation
 * Provides board management operations via MCP
 */
import type { MCPToolResult, CreateBoardArgs, UpdateBoardArgs } from '../types.js';
/**
 * Tool definitions for Board operations
 */
export declare const boardTools: ({
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
})[];
/**
 * Handle create_board tool call
 */
export declare function handleCreateBoard(args: CreateBoardArgs): Promise<MCPToolResult>;
/**
 * Handle list_boards tool call
 */
export declare function handleListBoards(): Promise<MCPToolResult>;
/**
 * Handle get_board tool call
 */
export declare function handleGetBoard(args: {
    id: string;
}): Promise<MCPToolResult>;
/**
 * Handle update_board tool call
 */
export declare function handleUpdateBoard(args: UpdateBoardArgs): Promise<MCPToolResult>;
//# sourceMappingURL=board-tools.d.ts.map