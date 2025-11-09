/**
 * Template Resources for MCP
 * Provides URI-based access to template data
 */
import type { Resource } from '@modelcontextprotocol/sdk/types.js';
/**
 * Template Resource Schemas
 */
export declare const templateResourceSchemas: Resource[];
/**
 * Handler for template://list resource
 */
export declare function handleTemplateListResource(): Promise<{
    contents: Array<{
        uri: string;
        mimeType: string;
        text: string;
    }>;
}>;
/**
 * Handler for template://{id} resource
 */
export declare function handleTemplateDetailResource(id: string): Promise<{
    contents: Array<{
        uri: string;
        mimeType: string;
        text: string;
    }>;
}>;
/**
 * Handler for template://categories resource
 */
export declare function handleTemplateCategoriesResource(): Promise<{
    contents: Array<{
        uri: string;
        mimeType: string;
        text: string;
    }>;
}>;
/**
 * Main resource handler
 */
export declare function handleTemplateResource(uri: string): Promise<{
    contents: Array<{
        uri: string;
        mimeType: string;
        text: string;
    }>;
}>;
//# sourceMappingURL=template-resources.d.ts.map