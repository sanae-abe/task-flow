/**
 * Template Resources for MCP
 * Provides URI-based access to template data
 */
import { getAllTemplates, getTemplate } from '../../utils/indexeddb.js';
/**
 * Template Resource Schemas
 */
export const templateResourceSchemas = [
    {
        uri: 'template://list',
        name: 'All Templates',
        description: 'List of all task templates with metadata',
        mimeType: 'application/json',
    },
    {
        uri: 'template://{id}',
        name: 'Template Details',
        description: 'Detailed information for a specific template',
        mimeType: 'application/json',
    },
    {
        uri: 'template://categories',
        name: 'Template Categories',
        description: 'List of all template categories',
        mimeType: 'application/json',
    },
];
/**
 * Handler for template://list resource
 */
export async function handleTemplateListResource() {
    try {
        const templates = await getAllTemplates();
        return {
            contents: [
                {
                    uri: 'template://list',
                    mimeType: 'application/json',
                    text: JSON.stringify({
                        count: templates.length,
                        templates: templates.map((t) => ({
                            id: t.id,
                            name: t.name,
                            description: t.description,
                            category: t.category,
                            isFavorite: t.isFavorite,
                            createdAt: t.createdAt,
                            updatedAt: t.updatedAt,
                        })),
                    }, null, 2),
                },
            ],
        };
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        return {
            contents: [
                {
                    uri: 'template://list',
                    mimeType: 'application/json',
                    text: JSON.stringify({ error: errorMessage }, null, 2),
                },
            ],
        };
    }
}
/**
 * Handler for template://{id} resource
 */
export async function handleTemplateDetailResource(id) {
    try {
        const template = await getTemplate(id);
        if (!template) {
            throw new Error(`Template not found: ${id}`);
        }
        return {
            contents: [
                {
                    uri: `template://${id}`,
                    mimeType: 'application/json',
                    text: JSON.stringify({
                        id: template.id,
                        name: template.name,
                        description: template.description,
                        category: template.category,
                        isFavorite: template.isFavorite,
                        taskTemplate: template.taskTemplate,
                        createdAt: template.createdAt,
                        updatedAt: template.updatedAt,
                    }, null, 2),
                },
            ],
        };
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        return {
            contents: [
                {
                    uri: `template://${id}`,
                    mimeType: 'application/json',
                    text: JSON.stringify({ error: errorMessage }, null, 2),
                },
            ],
        };
    }
}
/**
 * Handler for template://categories resource
 */
export async function handleTemplateCategoriesResource() {
    try {
        const templates = await getAllTemplates();
        const categories = new Map();
        templates.forEach((template) => {
            const category = template.category || 'Uncategorized';
            if (!categories.has(category)) {
                categories.set(category, { name: category, count: 0, favorites: 0 });
            }
            const cat = categories.get(category);
            cat.count++;
            if (template.isFavorite)
                cat.favorites++;
        });
        return {
            contents: [
                {
                    uri: 'template://categories',
                    mimeType: 'application/json',
                    text: JSON.stringify({
                        count: categories.size,
                        categories: Array.from(categories.values()),
                    }, null, 2),
                },
            ],
        };
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        return {
            contents: [
                {
                    uri: 'template://categories',
                    mimeType: 'application/json',
                    text: JSON.stringify({ error: errorMessage }, null, 2),
                },
            ],
        };
    }
}
/**
 * Main resource handler
 */
export async function handleTemplateResource(uri) {
    if (uri === 'template://list') {
        return handleTemplateListResource();
    }
    else if (uri === 'template://categories') {
        return handleTemplateCategoriesResource();
    }
    else if (uri.startsWith('template://')) {
        const id = uri.replace('template://', '');
        return handleTemplateDetailResource(id);
    }
    throw new Error(`Unknown template resource URI: ${uri}`);
}
//# sourceMappingURL=template-resources.js.map