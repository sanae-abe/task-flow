/**
 * MCP Resources Index
 * Exports all resource definitions and readers
 * Week 5 Day 32-35: Extended with Template and Webhook resources
 */
export declare const allResources: ({
    uri: string;
    name: string;
    description: string;
    mimeType: string;
} | {
    [x: string]: unknown;
    name: string;
    uri: string;
    title?: string | undefined;
    description?: string | undefined;
    _meta?: {
        [x: string]: unknown;
    } | undefined;
    icons?: {
        [x: string]: unknown;
        src: string;
        mimeType?: string | undefined;
        sizes?: string[] | undefined;
    }[] | undefined;
    mimeType?: string | undefined;
})[];
/**
 * Read resource by URI with caching (60s TTL)
 * Week 7 Day 43-49: Performance optimization
 */
export declare function readResource(uri: string): Promise<any>;
/**
 * Clear resource cache (useful for testing)
 */
export declare function clearResourceCache(): void;
//# sourceMappingURL=index.d.ts.map