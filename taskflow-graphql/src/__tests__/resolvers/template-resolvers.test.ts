/**
 * Template Resolvers Unit Tests
 * Comprehensive test coverage for all Template-related queries, mutations, and field resolvers
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GraphQLError } from 'graphql';
import {
  templateQueries,
  templateMutations,
  templateFieldResolvers,
} from '../../resolvers/template-resolvers.js';
import type { GraphQLContext } from '../../context.js';
import * as indexeddb from '../../utils/indexeddb.js';

// ============================================================================
// Mock Setup
// ============================================================================

vi.mock('../../utils/indexeddb.js', () => ({
  getTemplate: vi.fn(),
  getAllTemplates: vi.fn(),
  createTemplate: vi.fn(),
  updateTemplate: vi.fn(),
  deleteTemplate: vi.fn(),
  getAllWebhooks: vi.fn(() => Promise.resolve([])), // Week 7: Add missing mock
}));

// ============================================================================
// Test Data
// ============================================================================

const mockTemplate = {
  id: 'template-1',
  name: 'Sprint Planning Template',
  category: 'Work',
  taskTemplate: {
    title: 'Sprint Planning',
    description: 'Plan the upcoming sprint',
    priority: 'HIGH' as const,
    labels: ['label-1'],
    dueDate: '7',
    subtasks: [
      {
        id: 'subtask-1',
        title: 'Review backlog',
        completed: false,
        position: 0,
        createdAt: '2025-01-01T00:00:00Z',
      },
      {
        id: 'subtask-2',
        title: 'Set sprint goals',
        completed: false,
        position: 1,
        createdAt: '2025-01-01T00:00:00Z',
      },
    ],
  },
  isFavorite: true,
  createdAt: '2025-01-01T00:00:00Z',
  updatedAt: '2025-01-01T00:00:00Z',
};

const mockContext: GraphQLContext = {
  headers: {},
  loaders: {
    taskLoader: {
      load: vi.fn(),
      loadMany: vi.fn(),
      clear: vi.fn(),
      clearAll: vi.fn(),
      prime: vi.fn(),
    } as any,
    boardLoader: {
      load: vi.fn(),
      loadMany: vi.fn(),
      clear: vi.fn(),
      clearAll: vi.fn(),
      prime: vi.fn(),
    } as any,
    labelLoader: {
      load: vi.fn(),
      loadMany: vi.fn(),
      clear: vi.fn(),
      clearAll: vi.fn(),
      prime: vi.fn(),
    } as any,
    templateLoader: {
      load: vi.fn().mockResolvedValue(mockTemplate),
      loadMany: vi.fn(),
      clear: vi.fn(),
      clearAll: vi.fn(),
      prime: vi.fn(),
    } as any,
  },
};

// ============================================================================
// Query Resolvers Tests
// ============================================================================

describe('Template Query Resolvers', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('template', () => {
    it('should return template by id using dataloader', async () => {
      const result = await templateQueries.template(
        {},
        { id: 'template-1' },
        mockContext
      );

      expect(mockContext.loaders.templateLoader.load).toHaveBeenCalledWith(
        'template-1'
      );
      expect(result).toEqual(mockTemplate);
    });

    it('should return null for non-existent template', async () => {
      mockContext.loaders.templateLoader.load = vi.fn().mockResolvedValue(null);

      const result = await templateQueries.template(
        {},
        { id: 'non-existent' },
        mockContext
      );

      expect(result).toBeNull();
    });
  });

  describe('templates', () => {
    it('should return all templates when no filters applied', async () => {
      const templates = [mockTemplate];
      vi.mocked(indexeddb.getAllTemplates).mockResolvedValue(templates);

      const result = await templateQueries.templates({}, {}, mockContext);

      expect(indexeddb.getAllTemplates).toHaveBeenCalled();
      expect(result).toEqual(templates);
    });

    it('should filter templates by category', async () => {
      const templates = [
        mockTemplate,
        { ...mockTemplate, id: 'template-2', category: 'Personal' },
      ];
      vi.mocked(indexeddb.getAllTemplates).mockResolvedValue(templates);

      const result = await templateQueries.templates(
        {},
        { category: 'Work' },
        mockContext
      );

      expect(result).toHaveLength(1);
      expect(result[0].category).toBe('Work');
    });

    it('should filter templates by favorite status', async () => {
      const templates = [
        mockTemplate,
        { ...mockTemplate, id: 'template-2', isFavorite: false },
      ];
      vi.mocked(indexeddb.getAllTemplates).mockResolvedValue(templates);

      const result = await templateQueries.templates(
        {},
        { isFavorite: true },
        mockContext
      );

      expect(result).toHaveLength(1);
      expect(result[0].isFavorite).toBe(true);
    });

    it('should filter templates by both category and favorite', async () => {
      const templates = [
        mockTemplate,
        {
          ...mockTemplate,
          id: 'template-2',
          category: 'Personal',
          isFavorite: false,
        },
        {
          ...mockTemplate,
          id: 'template-3',
          category: 'Work',
          isFavorite: false,
        },
      ];
      vi.mocked(indexeddb.getAllTemplates).mockResolvedValue(templates);

      const result = await templateQueries.templates(
        {},
        { category: 'Work', isFavorite: true },
        mockContext
      );

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('template-1');
    });

    it('should return empty array when no templates match filters', async () => {
      const templates = [mockTemplate];
      vi.mocked(indexeddb.getAllTemplates).mockResolvedValue(templates);

      const result = await templateQueries.templates(
        {},
        { category: 'NonExistent' },
        mockContext
      );

      expect(result).toEqual([]);
    });
  });
});

// ============================================================================
// Mutation Resolvers Tests
// ============================================================================

describe('Template Mutation Resolvers', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createTemplate', () => {
    it('should create a new template', async () => {
      const input = {
        name: 'New Template',
        category: 'Work',
        taskTemplate: {
          title: 'Task Title',
          description: 'Task Description',
          priority: 'MEDIUM' as const,
          labels: [],
          subtasks: [],
        },
        isFavorite: false,
      };
      vi.mocked(indexeddb.createTemplate).mockResolvedValue(mockTemplate);

      const result = await templateMutations.createTemplate(
        {},
        { input },
        mockContext
      );

      expect(indexeddb.createTemplate).toHaveBeenCalled();
      expect(result).toEqual(mockTemplate);
    });

    it('should create template with subtasks', async () => {
      const input = {
        name: 'Template with Subtasks',
        taskTemplate: {
          title: 'Task',
          subtasks: [
            { title: 'Subtask 1', position: 0 },
            { title: 'Subtask 2', position: 1 },
          ],
        },
      };
      vi.mocked(indexeddb.createTemplate).mockResolvedValue(mockTemplate);

      await templateMutations.createTemplate({}, { input }, mockContext);

      const callArgs = vi.mocked(indexeddb.createTemplate).mock.calls[0][0];
      expect(callArgs.taskTemplate.subtasks).toHaveLength(2);
      expect(callArgs.taskTemplate.subtasks![0]).toHaveProperty('id');
      expect(callArgs.taskTemplate.subtasks![0]).toHaveProperty('createdAt');
    });

    it('should create template with recurrence', async () => {
      const input = {
        name: 'Recurring Template',
        taskTemplate: {
          title: 'Recurring Task',
          recurrence: {
            type: 'DAILY' as const,
            interval: 1,
          },
        },
      };
      vi.mocked(indexeddb.createTemplate).mockResolvedValue(mockTemplate);

      await templateMutations.createTemplate({}, { input }, mockContext);

      const callArgs = vi.mocked(indexeddb.createTemplate).mock.calls[0][0];
      expect(callArgs.taskTemplate.recurrence).toBeDefined();
    });

    it('should handle null/undefined values', async () => {
      const input = {
        name: 'Minimal Template',
        taskTemplate: {
          title: 'Task',
          description: null,
          priority: null,
          labels: null,
          dueDate: null,
          recurrence: null,
          subtasks: null,
        },
      };
      vi.mocked(indexeddb.createTemplate).mockResolvedValue(mockTemplate);

      await templateMutations.createTemplate({}, { input }, mockContext);

      const callArgs = vi.mocked(indexeddb.createTemplate).mock.calls[0][0];
      expect(callArgs.taskTemplate.description).toBeUndefined();
      expect(callArgs.taskTemplate.labels).toEqual([]);
      expect(callArgs.taskTemplate.subtasks).toEqual([]);
    });
  });

  describe('updateTemplate', () => {
    it('should update template name', async () => {
      const input = { name: 'Updated Template Name' };
      vi.mocked(indexeddb.updateTemplate).mockResolvedValue({
        ...mockTemplate,
        name: 'Updated Template Name',
      });

      const result = await templateMutations.updateTemplate(
        {},
        { id: 'template-1', input },
        mockContext
      );

      expect(indexeddb.updateTemplate).toHaveBeenCalledWith(
        'template-1',
        expect.objectContaining({
          name: 'Updated Template Name',
        })
      );
      expect(result.name).toBe('Updated Template Name');
    });

    it('should update template category', async () => {
      const input = { category: 'Personal' };
      vi.mocked(indexeddb.updateTemplate).mockResolvedValue({
        ...mockTemplate,
        category: 'Personal',
      });

      const result = await templateMutations.updateTemplate(
        {},
        { id: 'template-1', input },
        mockContext
      );

      expect(result.category).toBe('Personal');
    });

    it('should update favorite status', async () => {
      const input = { isFavorite: false };
      vi.mocked(indexeddb.updateTemplate).mockResolvedValue({
        ...mockTemplate,
        isFavorite: false,
      });

      const result = await templateMutations.updateTemplate(
        {},
        { id: 'template-1', input },
        mockContext
      );

      expect(result.isFavorite).toBe(false);
    });

    it('should update taskTemplate', async () => {
      const input = {
        taskTemplate: {
          title: 'Updated Task Title',
          description: 'Updated Description',
          priority: 'LOW' as const,
          labels: ['new-label'],
          subtasks: [{ title: 'New Subtask' }],
        },
      };
      vi.mocked(indexeddb.updateTemplate).mockResolvedValue(mockTemplate);

      await templateMutations.updateTemplate(
        {},
        { id: 'template-1', input },
        mockContext
      );

      const callArgs = vi.mocked(indexeddb.updateTemplate).mock.calls[0][1];
      expect(callArgs.taskTemplate).toBeDefined();
      expect(callArgs.taskTemplate!.title).toBe('Updated Task Title');
      expect(callArgs.taskTemplate!.subtasks).toHaveLength(1);
    });

    it('should throw error when template not found', async () => {
      const input = { name: 'Updated Name' };
      vi.mocked(indexeddb.updateTemplate).mockResolvedValue(null);

      await expect(
        templateMutations.updateTemplate(
          {},
          { id: 'non-existent', input },
          mockContext
        )
      ).rejects.toThrow(GraphQLError);
    });

    it('should preserve existing subtask IDs when updating', async () => {
      const input = {
        taskTemplate: {
          title: 'Task',
          subtasks: [
            {
              id: 'existing-id',
              title: 'Existing Subtask',
              completed: true,
              position: 0,
              createdAt: '2025-01-01T00:00:00Z',
            },
            { title: 'New Subtask' },
          ],
        },
      };
      vi.mocked(indexeddb.updateTemplate).mockResolvedValue(mockTemplate);

      await templateMutations.updateTemplate(
        {},
        { id: 'template-1', input },
        mockContext
      );

      const callArgs = vi.mocked(indexeddb.updateTemplate).mock.calls[0][1];
      expect(callArgs.taskTemplate!.subtasks![0].id).toBe('existing-id');
      expect(callArgs.taskTemplate!.subtasks![0].completed).toBe(true);
      expect(callArgs.taskTemplate!.subtasks![1]).toHaveProperty('id');
      expect(callArgs.taskTemplate!.subtasks![1].id).not.toBe('existing-id');
    });
  });

  describe('deleteTemplate', () => {
    it('should delete template successfully', async () => {
      vi.mocked(indexeddb.getTemplate).mockResolvedValue(mockTemplate);
      vi.mocked(indexeddb.deleteTemplate).mockResolvedValue(undefined);

      const result = await templateMutations.deleteTemplate(
        {},
        { id: 'template-1' },
        mockContext
      );

      expect(indexeddb.getTemplate).toHaveBeenCalledWith('template-1');
      expect(indexeddb.deleteTemplate).toHaveBeenCalledWith('template-1');
      expect(result).toBe(true);
    });

    it('should throw error when template not found', async () => {
      vi.mocked(indexeddb.getTemplate).mockResolvedValue(null);

      await expect(
        templateMutations.deleteTemplate(
          {},
          { id: 'non-existent' },
          mockContext
        )
      ).rejects.toThrow(GraphQLError);
    });
  });
});

// ============================================================================
// Field Resolvers Tests
// ============================================================================

describe('Template Field Resolvers', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('taskTemplate', () => {
    it('should return taskTemplate as-is', async () => {
      const result = await templateFieldResolvers.taskTemplate(
        mockTemplate,
        {},
        mockContext,
        {} as any
      );

      expect(result).toEqual(mockTemplate.taskTemplate);
    });

    it('should return taskTemplate with empty arrays for optional fields', async () => {
      const minimalTemplate = {
        ...mockTemplate,
        taskTemplate: {
          title: 'Minimal Task',
          labels: [],
          subtasks: [],
        },
      };

      const result = await templateFieldResolvers.taskTemplate(
        minimalTemplate,
        {},
        mockContext,
        {} as any
      );

      expect(result).toEqual(minimalTemplate.taskTemplate);
      expect(result.labels).toEqual([]);
      expect(result.subtasks).toEqual([]);
    });
  });
});
