/**
 * MCP Board Resources Implementation
 * Provides read-only access to board data via MCP resources
 */
/**
 * Board resource definitions
 */
export declare const boardResources: {
    uri: string;
    name: string;
    description: string;
    mimeType: string;
}[];
/**
 * Read board resource by URI
 */
export declare function readBoardResource(uri: string): Promise<{
    contents: Array<{
        uri: string;
        mimeType: string;
        text: string;
    }>;
}>;
//# sourceMappingURL=board-resources.d.ts.map