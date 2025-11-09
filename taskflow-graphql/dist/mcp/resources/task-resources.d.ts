/**
 * MCP Task Resources Implementation
 * Provides read-only access to task data via MCP resources
 */
/**
 * Task resource definitions
 */
export declare const taskResources: {
    uri: string;
    name: string;
    description: string;
    mimeType: string;
}[];
/**
 * Read task resource by URI
 */
export declare function readTaskResource(uri: string): Promise<{
    contents: Array<{
        uri: string;
        mimeType: string;
        text: string;
    }>;
}>;
//# sourceMappingURL=task-resources.d.ts.map