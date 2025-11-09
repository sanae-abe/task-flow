/**
 * Integration Test Setup Utilities
 * Provides Apollo Server test instance and utilities for GraphQL testing
 */

import { ApolloServer } from '@apollo/server';
import { makeExecutableSchema } from '@graphql-tools/schema';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { resolvers } from '../../resolvers/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load GraphQL schema
const typeDefs = readFileSync(
  join(__dirname, '../../schema/schema.graphql'),
  'utf-8'
);

// Create executable schema
const schema = makeExecutableSchema({ typeDefs, resolvers });

/**
 * Create test Apollo Server instance
 */
export function createTestServer() {
  return new ApolloServer({
    schema,
    includeStacktraceInErrorResponses: true,
  });
}

/**
 * Test data generators
 */
export const testData = {
  /**
   * Generate test board data
   */
  createBoard: (overrides?: Record<string, unknown>) => ({
    name: 'Test Board',
    description: 'Test board description',
    columns: [
      { id: 'col-1', title: 'To Do', color: '#e2e8f0', position: 0 },
      { id: 'col-2', title: 'In Progress', color: '#cbd5e1', position: 1 },
      { id: 'col-3', title: 'Done', color: '#94a3b8', position: 2 },
    ],
    ...overrides,
  }),

  /**
   * Generate test task data
   */
  createTask: (overrides?: Record<string, unknown>) => ({
    boardId: 'board-1',
    columnId: 'col-1',
    title: 'Test Task',
    description: 'Test task description',
    priority: 'MEDIUM',
    dueDate: '2025-12-31T23:59:59Z',
    dueTime: '23:59',
    labels: [],
    subtasks: [],
    files: [],
    ...overrides,
  }),

  /**
   * Generate test label data
   */
  createLabel: (overrides?: Record<string, unknown>) => ({
    name: 'Test Label',
    color: '#3b82f6',
    boardId: 'board-1',
    ...overrides,
  }),

  /**
   * Generate test template data
   */
  createTemplate: (overrides?: Record<string, unknown>) => ({
    name: 'Test Template',
    category: 'General',
    isFavorite: false,
    taskTemplate: {
      title: 'Template Task',
      description: 'Template description',
      priority: 'MEDIUM',
      labels: [],
      subtasks: [],
    },
    ...overrides,
  }),

  /**
   * Generate subtask data
   */
  createSubTask: (overrides?: Record<string, unknown>) => ({
    title: 'Test Subtask',
    position: 0,
    ...overrides,
  }),
};

/**
 * GraphQL query builders
 */
export const queries = {
  // Task queries
  GET_TASK: `
    query GetTask($id: ID!) {
      task(id: $id) {
        id
        title
        description
        status
        priority
        dueDate
        dueTime
        createdAt
        updatedAt
      }
    }
  `,

  GET_TASKS: `
    query GetTasks($boardId: ID, $status: TaskStatus, $priority: Priority) {
      tasks(boardId: $boardId, status: $status, priority: $priority) {
        id
        title
        status
        priority
      }
    }
  `,

  // Board queries
  GET_BOARD: `
    query GetBoard($id: ID!) {
      board(id: $id) {
        id
        name
        description
        columns {
          id
          title
          color
          position
        }
      }
    }
  `,

  GET_BOARDS: `
    query GetBoards {
      boards {
        id
        name
        taskCount
        completedTaskCount
      }
    }
  `,

  // Label queries
  GET_LABEL: `
    query GetLabel($id: ID!) {
      label(id: $id) {
        id
        name
        color
        taskCount
      }
    }
  `,

  GET_LABELS: `
    query GetLabels($boardId: ID) {
      labels(boardId: $boardId) {
        id
        name
        color
        taskCount
      }
    }
  `,

  // Template queries
  GET_TEMPLATE: `
    query GetTemplate($id: ID!) {
      template(id: $id) {
        id
        name
        category
        isFavorite
        taskTemplate {
          title
          description
          priority
        }
      }
    }
  `,

  GET_TEMPLATES: `
    query GetTemplates($category: String, $isFavorite: Boolean) {
      templates(category: $category, isFavorite: $isFavorite) {
        id
        name
        category
        isFavorite
      }
    }
  `,

  // Statistics queries
  GET_TASK_STATISTICS: `
    query GetTaskStatistics($boardId: ID) {
      taskStatistics(boardId: $boardId) {
        total
        byStatus {
          todo
          inProgress
          completed
          deleted
        }
        byPriority {
          critical
          high
          medium
          low
        }
        completionRate
        overdueCount
      }
    }
  `,

  // AI queries
  GET_NEXT_RECOMMENDED_TASK: `
    query GetNextRecommendedTask($boardId: ID!) {
      nextRecommendedTask(boardId: $boardId) {
        id
        title
        priority
      }
    }
  `,
};

/**
 * GraphQL mutation builders
 */
export const mutations = {
  // Task mutations
  CREATE_TASK: `
    mutation CreateTask($input: CreateTaskInput!) {
      createTask(input: $input) {
        id
        title
        description
        status
        priority
        dueDate
        dueTime
      }
    }
  `,

  UPDATE_TASK: `
    mutation UpdateTask($id: ID!, $input: UpdateTaskInput!) {
      updateTask(id: $id, input: $input) {
        id
        title
        description
        status
        priority
      }
    }
  `,

  DELETE_TASK: `
    mutation DeleteTask($id: ID!) {
      deleteTask(id: $id)
    }
  `,

  RESTORE_TASK: `
    mutation RestoreTask($id: ID!) {
      restoreTask(id: $id) {
        id
        title
        status
      }
    }
  `,

  MOVE_TASK: `
    mutation MoveTask($id: ID!, $targetColumnId: ID!, $targetPosition: Int!) {
      moveTask(id: $id, targetColumnId: $targetColumnId, targetPosition: $targetPosition) {
        id
        columnId
        position
      }
    }
  `,

  DUPLICATE_TASK: `
    mutation DuplicateTask($id: ID!) {
      duplicateTask(id: $id) {
        id
        title
        description
      }
    }
  `,

  // Batch mutations
  CREATE_TASKS: `
    mutation CreateTasks($inputs: [CreateTaskInput!]!) {
      createTasks(inputs: $inputs) {
        id
        title
      }
    }
  `,

  UPDATE_TASKS: `
    mutation UpdateTasks($ids: [ID!]!, $input: UpdateTaskInput!) {
      updateTasks(ids: $ids, input: $input) {
        id
        title
        status
      }
    }
  `,

  DELETE_TASKS: `
    mutation DeleteTasks($ids: [ID!]!) {
      deleteTasks(ids: $ids)
    }
  `,

  // Board mutations
  CREATE_BOARD: `
    mutation CreateBoard($input: CreateBoardInput!) {
      createBoard(input: $input) {
        id
        name
        description
        columns {
          id
          title
        }
      }
    }
  `,

  UPDATE_BOARD: `
    mutation UpdateBoard($id: ID!, $input: UpdateBoardInput!) {
      updateBoard(id: $id, input: $input) {
        id
        name
        description
      }
    }
  `,

  DELETE_BOARD: `
    mutation DeleteBoard($id: ID!) {
      deleteBoard(id: $id)
    }
  `,

  // Label mutations
  CREATE_LABEL: `
    mutation CreateLabel($input: CreateLabelInput!) {
      createLabel(input: $input) {
        id
        name
        color
      }
    }
  `,

  UPDATE_LABEL: `
    mutation UpdateLabel($id: ID!, $input: UpdateLabelInput!) {
      updateLabel(id: $id, input: $input) {
        id
        name
        color
      }
    }
  `,

  DELETE_LABEL: `
    mutation DeleteLabel($id: ID!) {
      deleteLabel(id: $id)
    }
  `,

  // Template mutations
  CREATE_TEMPLATE: `
    mutation CreateTemplate($input: CreateTemplateInput!) {
      createTemplate(input: $input) {
        id
        name
        category
        isFavorite
      }
    }
  `,

  UPDATE_TEMPLATE: `
    mutation UpdateTemplate($id: ID!, $input: UpdateTemplateInput!) {
      updateTemplate(id: $id, input: $input) {
        id
        name
        category
      }
    }
  `,

  DELETE_TEMPLATE: `
    mutation DeleteTemplate($id: ID!) {
      deleteTemplate(id: $id)
    }
  `,

  // AI mutations
  CREATE_TASK_FROM_NL: `
    mutation CreateTaskFromNL($query: String!, $context: AIContextInput) {
      createTaskFromNaturalLanguage(query: $query, context: $context) {
        id
        title
        description
        priority
      }
    }
  `,

  BREAKDOWN_TASK: `
    mutation BreakdownTask($taskId: ID!, $strategy: BreakdownStrategy) {
      breakdownTask(taskId: $taskId, strategy: $strategy) {
        id
        title
      }
    }
  `,

  OPTIMIZE_SCHEDULE: `
    mutation OptimizeSchedule($boardId: ID!, $constraints: ScheduleConstraints) {
      optimizeTaskSchedule(boardId: $boardId, constraints: $constraints) {
        optimizedTasks {
          id
          title
        }
        estimatedCompletionDate
        suggestions
      }
    }
  `,
};

/**
 * GraphQL subscription builders
 */
export const subscriptions = {
  TASK_CREATED: `
    subscription TaskCreated($boardId: ID) {
      taskCreated(boardId: $boardId) {
        id
        title
        status
      }
    }
  `,

  TASK_UPDATED: `
    subscription TaskUpdated($boardId: ID) {
      taskUpdated(boardId: $boardId) {
        id
        title
        status
      }
    }
  `,

  TASK_COMPLETED: `
    subscription TaskCompleted($boardId: ID) {
      taskCompleted(boardId: $boardId) {
        id
        title
        completedAt
      }
    }
  `,

  TASK_DELETED: `
    subscription TaskDeleted($boardId: ID) {
      taskDeleted(boardId: $boardId) {
        id
        title
      }
    }
  `,

  BOARD_UPDATED: `
    subscription BoardUpdated($boardId: ID) {
      boardUpdated(boardId: $boardId) {
        id
        name
      }
    }
  `,

  AI_SUGGESTION_AVAILABLE: `
    subscription AISuggestionAvailable($boardId: ID!) {
      aiSuggestionAvailable(boardId: $boardId) {
        type
        message
        confidence
      }
    }
  `,
};
