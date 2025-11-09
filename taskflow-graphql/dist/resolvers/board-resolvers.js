/**
 * Board Resolvers for TaskFlow GraphQL
 * Handles all Board-related queries and mutations
 */
import { GraphQLError } from 'graphql';
import { getBoard, getAllBoards, createBoard as createBoardDB, updateBoard as updateBoardDB, deleteBoard as deleteBoardDB, getTasksByBoard, } from '../utils/indexeddb.js';
import { publishEvent, SUBSCRIPTION_TOPICS, subscribe, } from '../utils/pubsub.js';
import { triggerBoardCreated, triggerBoardUpdated, triggerBoardDeleted, } from '../utils/webhook-events.js';
// ============================================================================
// Query Resolvers
// ============================================================================
export const boardQueries = {
    /**
     * Get single board by ID
     */
    board: async (_parent, { id }, context) => await context.loaders.boardLoader.load(id),
    /**
     * Get all boards
     */
    boards: async () => await getAllBoards(),
    /**
     * Get current/default board
     */
    currentBoard: async () => {
        const boards = await getAllBoards();
        // Return first board or null
        return boards.length > 0 ? boards[0] : null;
    },
};
// ============================================================================
// Mutation Resolvers
// ============================================================================
export const boardMutations = {
    /**
     * Create a new board
     */
    createBoard: async (_parent, { input }, _context) => {
        const columns = (input.columns || [
            { title: 'To Do', position: 0 },
            { title: 'In Progress', position: 1 },
            { title: 'Done', position: 2 },
        ]).map((col, index) => ({
            id: col.id || crypto.randomUUID(),
            name: col.title, // Use 'name' field for BoardColumnRecord
            position: col.position ?? index,
            taskIds: [], // Initialize empty task list
        }));
        const settings = {
            defaultColumn: columns[0]?.id, // Use 'defaultColumn' instead of 'defaultColumnId'
            completedColumnId: columns[columns.length - 1]?.id,
            autoArchiveCompleted: false,
            recycleBinRetentionDays: 30,
        };
        const boardData = {
            name: input.name,
            description: input.description ?? undefined, // Convert null to undefined
            columns,
            settings,
            isShared: false,
        };
        const newBoard = await createBoardDB(boardData);
        await publishEvent(SUBSCRIPTION_TOPICS.BOARD_UPDATED, {
            boardUpdated: newBoard,
        });
        // Trigger webhook event
        await triggerBoardCreated(newBoard);
        return newBoard;
    },
    /**
     * Update an existing board
     */
    updateBoard: async (_parent, { id, input }, _context) => {
        const updates = {};
        if (input.name !== undefined)
            updates.name = input.name ?? undefined;
        if (input.description !== undefined)
            updates.description = input.description ?? undefined;
        if (input.columns !== undefined && input.columns !== null) {
            updates.columns = input.columns.map((col, index) => ({
                id: col.id || crypto.randomUUID(),
                name: col.title, // Use 'name' field for BoardColumnRecord
                position: col.position ?? index,
                taskIds: [], // Initialize empty task list
            }));
        }
        if (input.settings !== undefined && input.settings !== null) {
            const existing = await getBoard(id);
            if (!existing) {
                throw new GraphQLError('Board not found', {
                    extensions: { code: 'NOT_FOUND' },
                });
            }
            updates.settings = {
                ...existing.settings,
                defaultColumn: input.settings.defaultColumnId ?? existing.settings.defaultColumn,
                completedColumnId: input.settings.completedColumnId ?? undefined,
                autoArchiveCompleted: input.settings.autoArchiveCompleted ?? undefined,
                recycleBinRetentionDays: input.settings.recycleBinRetentionDays ?? undefined,
            };
        }
        const updated = await updateBoardDB(id, updates);
        if (!updated) {
            throw new GraphQLError('Board not found', {
                extensions: { code: 'NOT_FOUND' },
            });
        }
        await publishEvent(SUBSCRIPTION_TOPICS.BOARD_UPDATED, {
            boardUpdated: updated,
        });
        // Trigger webhook event
        await triggerBoardUpdated(updated);
        return updated;
    },
    /**
     * Delete a board
     */
    deleteBoard: async (_parent, { id }, _context) => {
        const board = await getBoard(id);
        if (!board) {
            throw new GraphQLError('Board not found', {
                extensions: { code: 'NOT_FOUND' },
            });
        }
        // Check if board has tasks
        const tasks = await getTasksByBoard(id);
        if (tasks.length > 0) {
            throw new GraphQLError('Cannot delete board with tasks. Please delete all tasks first.', {
                extensions: { code: 'BOARD_HAS_TASKS' },
            });
        }
        await deleteBoardDB(id);
        // Trigger webhook event
        await triggerBoardDeleted(board);
        return true;
    },
};
// ============================================================================
// Field Resolvers
// ============================================================================
export const boardFieldResolvers = {
    /**
     * Count tasks in each column
     */
    columns: async (parent, _args, _context) => {
        const tasks = await getTasksByBoard(parent.id);
        return parent.columns.map(column => ({
            ...column,
            title: column.name, // Map 'name' to 'title' for GraphQL response
            taskCount: tasks.filter(task => task.columnId === column.id).length,
        }));
    },
    /**
     * Count total tasks in board
     */
    taskCount: async (parent) => {
        const tasks = await getTasksByBoard(parent.id);
        return tasks.filter(task => task.status !== 'DELETED').length;
    },
    /**
     * Count completed tasks in board
     */
    completedTaskCount: async (parent) => {
        const tasks = await getTasksByBoard(parent.id);
        return tasks.filter(task => task.status === 'COMPLETED').length;
    },
};
// ============================================================================
// Subscription Resolvers
// ============================================================================
export const boardSubscriptions = {
    boardUpdated: {
        subscribe: (_parent, { boardId: _boardId }) => subscribe(SUBSCRIPTION_TOPICS.BOARD_UPDATED),
    },
};
//# sourceMappingURL=board-resolvers.js.map