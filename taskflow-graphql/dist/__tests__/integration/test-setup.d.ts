/**
 * Integration Test Setup Utilities
 * Provides Apollo Server test instance and utilities for GraphQL testing
 */
import { ApolloServer } from '@apollo/server';
/**
 * Create test Apollo Server instance
 */
export declare function createTestServer(): ApolloServer<import("@apollo/server").BaseContext>;
/**
 * Test data generators
 */
export declare const testData: {
    /**
     * Generate test board data
     */
    createBoard: (overrides?: Record<string, unknown>) => {
        name: string;
        description: string;
        columns: {
            id: string;
            title: string;
            color: string;
            position: number;
        }[];
    };
    /**
     * Generate test task data
     */
    createTask: (overrides?: Record<string, unknown>) => {
        boardId: string;
        columnId: string;
        title: string;
        description: string;
        priority: string;
        dueDate: string;
        dueTime: string;
        labels: never[];
        subtasks: never[];
        files: never[];
    };
    /**
     * Generate test label data
     */
    createLabel: (overrides?: Record<string, unknown>) => {
        name: string;
        color: string;
        boardId: string;
    };
    /**
     * Generate test template data
     */
    createTemplate: (overrides?: Record<string, unknown>) => {
        name: string;
        category: string;
        isFavorite: boolean;
        taskTemplate: {
            title: string;
            description: string;
            priority: string;
            labels: never[];
            subtasks: never[];
        };
    };
    /**
     * Generate subtask data
     */
    createSubTask: (overrides?: Record<string, unknown>) => {
        title: string;
        position: number;
    };
};
/**
 * GraphQL query builders
 */
export declare const queries: {
    GET_TASK: string;
    GET_TASKS: string;
    GET_BOARD: string;
    GET_BOARDS: string;
    GET_LABEL: string;
    GET_LABELS: string;
    GET_TEMPLATE: string;
    GET_TEMPLATES: string;
    GET_TASK_STATISTICS: string;
    GET_NEXT_RECOMMENDED_TASK: string;
};
/**
 * GraphQL mutation builders
 */
export declare const mutations: {
    CREATE_TASK: string;
    UPDATE_TASK: string;
    DELETE_TASK: string;
    RESTORE_TASK: string;
    MOVE_TASK: string;
    DUPLICATE_TASK: string;
    CREATE_TASKS: string;
    UPDATE_TASKS: string;
    DELETE_TASKS: string;
    CREATE_BOARD: string;
    UPDATE_BOARD: string;
    DELETE_BOARD: string;
    CREATE_LABEL: string;
    UPDATE_LABEL: string;
    DELETE_LABEL: string;
    CREATE_TEMPLATE: string;
    UPDATE_TEMPLATE: string;
    DELETE_TEMPLATE: string;
    CREATE_TASK_FROM_NL: string;
    BREAKDOWN_TASK: string;
    OPTIMIZE_SCHEDULE: string;
};
/**
 * GraphQL subscription builders
 */
export declare const subscriptions: {
    TASK_CREATED: string;
    TASK_UPDATED: string;
    TASK_COMPLETED: string;
    TASK_DELETED: string;
    BOARD_UPDATED: string;
    AI_SUGGESTION_AVAILABLE: string;
};
//# sourceMappingURL=test-setup.d.ts.map