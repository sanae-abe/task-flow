/**
 * Label Resolvers Unit Tests
 * Comprehensive test coverage for all Label-related queries, mutations, and field resolvers
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GraphQLError } from 'graphql';
import {
  labelQueries,
  labelMutations,
  labelFieldResolvers,
} from '../../resolvers/label-resolvers.js';
import type { GraphQLContext } from '../../context.js';
import * as indexeddb from '../../utils/indexeddb.js';

// ============================================================================
// Mock Setup
// ============================================================================

vi.mock('../../utils/indexeddb.js', () => ({
  getLabel: vi.fn(),
  getAllLabels: vi.fn(),
  getLabelsByBoard: vi.fn(),
  createLabel: vi.fn(),
  updateLabel: vi.fn(),
  deleteLabel: vi.fn(),
  getAllTasks: vi.fn(),
  getAllWebhooks: vi.fn(() => Promise.resolve([])), // Week 7: Add missing mock
  getAllTemplates: vi.fn(() => Promise.resolve([])), // Week 7: Add missing mock
}));

// ============================================================================
// Test Data
// ============================================================================

const mockLabel = {
  id: 'label-1',
  name: 'Important',
  color: '#ff0000',
  boardId: 'board-1',
  createdAt: '2025-01-01T00:00:00Z',
  updatedAt: '2025-01-01T00:00:00Z',
};

const mockTask = {
  id: 'task-1',
  boardId: 'board-1',
  columnId: 'column-1',
  title: 'Test Task',
  labels: ['label-1'],
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
      load: vi.fn(),
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

describe('Label Query Resolvers', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('label', () => {
    it('should return label by id', async () => {
      vi.mocked(indexeddb.getLabel).mockResolvedValue(mockLabel);

      const result = await labelQueries.label(
        {},
        { id: 'label-1' },
        mockContext
      );

      expect(indexeddb.getLabel).toHaveBeenCalledWith('label-1');
      expect(result).toEqual(mockLabel);
    });

    it('should return null for non-existent label', async () => {
      vi.mocked(indexeddb.getLabel).mockResolvedValue(null);

      const result = await labelQueries.label(
        {},
        { id: 'non-existent' },
        mockContext
      );

      expect(result).toBeNull();
    });
  });

  describe('labels', () => {
    it('should return all labels when no boardId provided', async () => {
      const labels = [mockLabel];
      vi.mocked(indexeddb.getAllLabels).mockResolvedValue(labels);

      const result = await labelQueries.labels({}, {}, mockContext);

      expect(indexeddb.getAllLabels).toHaveBeenCalled();
      expect(result).toEqual(labels);
    });

    it('should filter labels by boardId', async () => {
      const labels = [mockLabel];
      vi.mocked(indexeddb.getLabelsByBoard).mockResolvedValue(labels);

      const result = await labelQueries.labels(
        {},
        { boardId: 'board-1' },
        mockContext
      );

      expect(indexeddb.getLabelsByBoard).toHaveBeenCalledWith('board-1');
      expect(result).toEqual(labels);
    });

    it('should return empty array when no labels exist', async () => {
      vi.mocked(indexeddb.getAllLabels).mockResolvedValue([]);

      const result = await labelQueries.labels({}, {}, mockContext);

      expect(result).toEqual([]);
    });

    it('should handle null boardId', async () => {
      const labels = [mockLabel];
      vi.mocked(indexeddb.getAllLabels).mockResolvedValue(labels);

      const result = await labelQueries.labels(
        {},
        { boardId: null },
        mockContext
      );

      expect(indexeddb.getAllLabels).toHaveBeenCalled();
      expect(result).toEqual(labels);
    });
  });
});

// ============================================================================
// Mutation Resolvers Tests
// ============================================================================

describe('Label Mutation Resolvers', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createLabel', () => {
    it('should create a new label', async () => {
      const input = {
        name: 'New Label',
        color: '#00ff00',
        boardId: 'board-1',
      };
      vi.mocked(indexeddb.createLabel).mockResolvedValue(mockLabel);

      const result = await labelMutations.createLabel(
        {},
        { input },
        mockContext
      );

      expect(indexeddb.createLabel).toHaveBeenCalledWith({
        name: 'New Label',
        color: '#00ff00',
        boardId: 'board-1',
      });
      expect(result).toEqual(mockLabel);
    });

    it('should create label without boardId', async () => {
      const input = {
        name: 'Global Label',
        color: '#0000ff',
      };
      const globalLabel = { ...mockLabel, boardId: undefined };
      vi.mocked(indexeddb.createLabel).mockResolvedValue(globalLabel);

      const result = await labelMutations.createLabel(
        {},
        { input },
        mockContext
      );

      const callArgs = vi.mocked(indexeddb.createLabel).mock.calls[0][0];
      expect(callArgs.boardId).toBeUndefined();
      expect(result).toEqual(globalLabel);
    });

    it('should handle null boardId', async () => {
      const input = {
        name: 'Label',
        color: '#ffffff',
        boardId: null,
      };
      vi.mocked(indexeddb.createLabel).mockResolvedValue(mockLabel);

      await labelMutations.createLabel({}, { input }, mockContext);

      const callArgs = vi.mocked(indexeddb.createLabel).mock.calls[0][0];
      expect(callArgs.boardId).toBeUndefined();
    });
  });

  describe('updateLabel', () => {
    it('should update label name', async () => {
      const input = { name: 'Updated Label' };
      vi.mocked(indexeddb.updateLabel).mockResolvedValue({
        ...mockLabel,
        name: 'Updated Label',
      });

      const result = await labelMutations.updateLabel(
        {},
        { id: 'label-1', input },
        mockContext
      );

      expect(indexeddb.updateLabel).toHaveBeenCalledWith(
        'label-1',
        expect.objectContaining({
          name: 'Updated Label',
        })
      );
      expect(result.name).toBe('Updated Label');
    });

    it('should update label color', async () => {
      const input = { color: '#00ff00' };
      vi.mocked(indexeddb.updateLabel).mockResolvedValue({
        ...mockLabel,
        color: '#00ff00',
      });

      const result = await labelMutations.updateLabel(
        {},
        { id: 'label-1', input },
        mockContext
      );

      expect(result.color).toBe('#00ff00');
    });

    it('should update both name and color', async () => {
      const input = { name: 'Updated', color: '#123456' };
      vi.mocked(indexeddb.updateLabel).mockResolvedValue({
        ...mockLabel,
        name: 'Updated',
        color: '#123456',
      });

      const result = await labelMutations.updateLabel(
        {},
        { id: 'label-1', input },
        mockContext
      );

      expect(result.name).toBe('Updated');
      expect(result.color).toBe('#123456');
    });

    it('should throw error when label not found', async () => {
      const input = { name: 'Updated Label' };
      vi.mocked(indexeddb.updateLabel).mockResolvedValue(null);

      await expect(
        labelMutations.updateLabel(
          {},
          { id: 'non-existent', input },
          mockContext
        )
      ).rejects.toThrow(GraphQLError);
    });

    it('should handle null updates', async () => {
      const input = { name: null, color: null };
      vi.mocked(indexeddb.updateLabel).mockResolvedValue(mockLabel);

      await labelMutations.updateLabel(
        {},
        { id: 'label-1', input },
        mockContext
      );

      const callArgs = vi.mocked(indexeddb.updateLabel).mock.calls[0][1];
      expect(callArgs.name).toBeUndefined();
      expect(callArgs.color).toBeUndefined();
    });
  });

  describe('deleteLabel', () => {
    it('should delete label successfully', async () => {
      vi.mocked(indexeddb.getLabel).mockResolvedValue(mockLabel);
      vi.mocked(indexeddb.deleteLabel).mockResolvedValue(undefined);

      const result = await labelMutations.deleteLabel(
        {},
        { id: 'label-1' },
        mockContext
      );

      expect(indexeddb.getLabel).toHaveBeenCalledWith('label-1');
      expect(indexeddb.deleteLabel).toHaveBeenCalledWith('label-1');
      expect(result).toBe(true);
    });

    it('should throw error when label not found', async () => {
      vi.mocked(indexeddb.getLabel).mockResolvedValue(null);

      await expect(
        labelMutations.deleteLabel({}, { id: 'non-existent' }, mockContext)
      ).rejects.toThrow(GraphQLError);
    });
  });
});

// ============================================================================
// Field Resolvers Tests
// ============================================================================

describe('Label Field Resolvers', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('taskCount', () => {
    it('should count tasks using this label', async () => {
      const tasks = [
        { ...mockTask, labels: ['label-1'] },
        { ...mockTask, id: 'task-2', labels: ['label-1', 'label-2'] },
        { ...mockTask, id: 'task-3', labels: ['label-2'] },
      ];
      vi.mocked(indexeddb.getAllTasks).mockResolvedValue(tasks as any);

      const result = await labelFieldResolvers.taskCount(
        mockLabel,
        {},
        mockContext,
        {} as any
      );

      expect(result).toBe(2);
    });

    it('should return 0 when no tasks use this label', async () => {
      const tasks = [
        { ...mockTask, labels: ['label-2'] },
        { ...mockTask, id: 'task-2', labels: [] },
      ];
      vi.mocked(indexeddb.getAllTasks).mockResolvedValue(tasks as any);

      const result = await labelFieldResolvers.taskCount(
        mockLabel,
        {},
        mockContext,
        {} as any
      );

      expect(result).toBe(0);
    });

    it('should return 0 when no tasks exist', async () => {
      vi.mocked(indexeddb.getAllTasks).mockResolvedValue([]);

      const result = await labelFieldResolvers.taskCount(
        mockLabel,
        {},
        mockContext,
        {} as any
      );

      expect(result).toBe(0);
    });

    it('should handle tasks with multiple labels', async () => {
      const tasks = [
        { ...mockTask, labels: ['label-1', 'label-2', 'label-3'] },
        { ...mockTask, id: 'task-2', labels: ['label-1'] },
      ];
      vi.mocked(indexeddb.getAllTasks).mockResolvedValue(tasks as any);

      const result = await labelFieldResolvers.taskCount(
        mockLabel,
        {},
        mockContext,
        {} as any
      );

      expect(result).toBe(2);
    });
  });
});
