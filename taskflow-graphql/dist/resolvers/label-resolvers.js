/**
 * Label Resolvers for TaskFlow GraphQL
 * Handles all Label-related queries and mutations
 */
import { GraphQLError } from 'graphql';
import { getLabel, getAllLabels, getLabelsByBoard, createLabel as createLabelDB, updateLabel as updateLabelDB, deleteLabel as deleteLabelDB, getAllTasks, } from '../utils/indexeddb.js';
// ============================================================================
// Query Resolvers
// ============================================================================
export const labelQueries = {
    /**
     * Get single label by ID
     */
    label: async (_parent, { id }, _context) => await getLabel(id),
    /**
     * Get labels, optionally filtered by board
     */
    labels: async (_parent, { boardId }) => {
        if (boardId) {
            return await getLabelsByBoard(boardId);
        }
        return await getAllLabels();
    },
};
// ============================================================================
// Mutation Resolvers
// ============================================================================
export const labelMutations = {
    /**
     * Create a new label
     */
    createLabel: async (_parent, { input }, _context) => {
        const labelData = {
            name: input.name,
            color: input.color,
            boardId: input.boardId ?? undefined, // Convert null to undefined
        };
        return await createLabelDB(labelData);
    },
    /**
     * Update an existing label
     */
    updateLabel: async (_parent, { id, input }, _context) => {
        const updates = {};
        if (input.name !== undefined)
            updates.name = input.name ?? undefined;
        if (input.color !== undefined)
            updates.color = input.color ?? undefined;
        const updated = await updateLabelDB(id, updates);
        if (!updated) {
            throw new GraphQLError('Label not found', {
                extensions: { code: 'NOT_FOUND' },
            });
        }
        return updated;
    },
    /**
     * Delete a label
     */
    deleteLabel: async (_parent, { id }, _context) => {
        const label = await getLabel(id);
        if (!label) {
            throw new GraphQLError('Label not found', {
                extensions: { code: 'NOT_FOUND' },
            });
        }
        // Note: Tasks referencing this label will keep the label ID
        // but it won't resolve to a label object (will be filtered out)
        await deleteLabelDB(id);
        return true;
    },
};
// ============================================================================
// Field Resolvers
// ============================================================================
export const labelFieldResolvers = {
    /**
     * Count tasks using this label
     */
    taskCount: async (parent) => {
        const tasks = await getAllTasks();
        return tasks.filter(task => task.labels.includes(parent.id)).length;
    },
};
//# sourceMappingURL=label-resolvers.js.map