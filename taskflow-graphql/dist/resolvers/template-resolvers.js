/**
 * Template Resolvers for TaskFlow GraphQL
 * Handles all Template-related queries and mutations
 */
import { GraphQLError } from 'graphql';
import { getTemplate, getAllTemplates, createTemplate as createTemplateDB, updateTemplate as updateTemplateDB, deleteTemplate as deleteTemplateDB, } from '../utils/indexeddb.js';
// ============================================================================
// Query Resolvers
// ============================================================================
export const templateQueries = {
    /**
     * Get single template by ID
     */
    template: async (_parent, { id }, context) => await context.loaders.templateLoader.load(id),
    /**
     * Get templates with optional filtering
     */
    templates: async (_parent, { category, isFavorite }) => {
        let templates = await getAllTemplates();
        // Filter by category
        if (category !== undefined) {
            templates = templates.filter(t => t.category === category);
        }
        // Filter by favorite status
        if (isFavorite !== undefined) {
            templates = templates.filter(t => t.isFavorite === isFavorite);
        }
        return templates;
    },
};
// ============================================================================
// Mutation Resolvers
// ============================================================================
export const templateMutations = {
    /**
     * Create a new template
     */
    createTemplate: async (_parent, { input }, _context) => {
        const taskTemplate = {
            title: input.taskTemplate.title,
            description: input.taskTemplate.description ?? undefined,
            priority: input.taskTemplate.priority ?? undefined,
            labels: input.taskTemplate.labels ?? [],
            dueDate: input.taskTemplate.dueDate ?? undefined,
            recurrence: input.taskTemplate.recurrence
                ? input.taskTemplate.recurrence
                : undefined,
            subtasks: (input.taskTemplate.subtasks ?? []).map((st, index) => ({
                id: crypto.randomUUID(),
                title: st.title,
                completed: false,
                position: st.position ?? index,
                createdAt: new Date().toISOString(),
            })),
        };
        const templateData = {
            name: input.name,
            category: input.category ?? undefined,
            taskTemplate,
            isFavorite: input.isFavorite ?? false,
        };
        return await createTemplateDB(templateData);
    },
    /**
     * Update an existing template
     */
    updateTemplate: async (_parent, { id, input }, _context) => {
        const updates = {};
        if (input.name !== undefined)
            updates.name = input.name ?? undefined;
        if (input.category !== undefined)
            updates.category = input.category ?? undefined;
        if (input.isFavorite !== undefined)
            updates.isFavorite = input.isFavorite ?? undefined;
        if (input.taskTemplate !== undefined && input.taskTemplate !== null) {
            const tt = input.taskTemplate;
            updates.taskTemplate = {
                title: tt.title,
                description: tt.description ?? undefined,
                priority: tt.priority ?? undefined,
                labels: tt.labels ?? [],
                dueDate: tt.dueDate ?? undefined,
                recurrence: tt.recurrence
                    ? tt.recurrence
                    : undefined,
                subtasks: (tt.subtasks ?? []).map((st, index) => ({
                    id: st.id || crypto.randomUUID(),
                    title: st.title,
                    completed: st.completed ?? false,
                    position: st.position ?? index,
                    createdAt: st.createdAt || new Date().toISOString(),
                })),
            };
        }
        const updated = await updateTemplateDB(id, updates);
        if (!updated) {
            throw new GraphQLError('Template not found', {
                extensions: { code: 'NOT_FOUND' },
            });
        }
        return updated;
    },
    /**
     * Delete a template
     */
    deleteTemplate: async (_parent, { id }, _context) => {
        const template = await getTemplate(id);
        if (!template) {
            throw new GraphQLError('Template not found', {
                extensions: { code: 'NOT_FOUND' },
            });
        }
        await deleteTemplateDB(id);
        return true;
    },
};
// ============================================================================
// Field Resolvers
// ============================================================================
export const templateFieldResolvers = {
    /**
     * Return taskTemplate as-is (labels are already IDs in the database)
     * The labels field resolver in TaskTemplateData will handle the conversion to Label objects
     */
    taskTemplate: async (parent, _args, _context) => parent.taskTemplate,
};
//# sourceMappingURL=template-resolvers.js.map