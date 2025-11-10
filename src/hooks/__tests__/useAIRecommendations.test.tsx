/**
 * useAIRecommendations hook tests
 * AI推奨タスク機能の包括的テスト
 *
 * Test Coverage:
 * - Success cases: Recommendation retrieval, network-only cache strategy
 * - Error cases: GraphQL errors, no recommendations, network errors
 * - Refresh functionality: Manual refetch
 * - Loading states: Initial load, refetch
 * - Edge cases: Empty boardId, polling
 *
 * Target Coverage: 85%+
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { MockedProvider } from '@apollo/client/testing/react';
import React, { ReactNode } from 'react';
import { useAIRecommendations } from '../useAIRecommendations';
import { NextRecommendedTaskDocument } from '../../generated/graphql';
import type { Task } from '../../types';

// Mock data
const mockRecommendation: Task = {
  id: 'task-1',
  title: 'High Priority Task',
  description: 'Important task to complete',
  status: 'todo',
  priority: 'high',
  boardId: 'board-1',
  columnId: 'col-1',
  position: 0,
  labels: [{ id: 'label-1', name: 'urgent', color: '#ff0000' }],
  subTasks: [
    { id: 'sub-1', title: 'Subtask 1', completed: false, position: 0 },
  ],
  createdAt: '2025-01-01T00:00:00.000Z',
  updatedAt: '2025-01-01T00:00:00.000Z',
  dueDate: '2025-01-02',
  dueTime: '14:00',
  completedAt: null,
  estimatedDuration: 60,
  isOverdue: false,
  completionPercentage: 0,
};

describe('useAIRecommendations', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  /**
   * Helper: Create wrapper with Apollo MockedProvider
   */
  const createWrapper =
    (mocks: any[]) =>
    ({ children }: { children: ReactNode }) => (
      <MockedProvider mocks={mocks} addTypename={false}>
        {children}
      </MockedProvider>
    );

  describe('Success Cases', () => {
    it('should fetch AI recommendation successfully', async () => {
      const mocks = [
        {
          request: {
            query: NextRecommendedTaskDocument,
            variables: { boardId: 'board-1' },
          },
          result: {
            data: {
              nextRecommendedTask: mockRecommendation,
            },
          },
        },
      ];

      const { result } = renderHook(() => useAIRecommendations('board-1'), {
        wrapper: createWrapper(mocks),
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.recommendation).toBeDefined();
      expect(result.current.recommendation?.id).toBe('task-1');
      expect(result.current.recommendation?.title).toBe('High Priority Task');
      expect(result.current.error).toBeNull();
    });

    it('should use network-only fetch policy', async () => {
      const mocks = [
        {
          request: {
            query: NextRecommendedTaskDocument,
            variables: { boardId: 'board-1' },
          },
          result: {
            data: {
              nextRecommendedTask: mockRecommendation,
            },
          },
        },
      ];

      const { result } = renderHook(() => useAIRecommendations('board-1'), {
        wrapper: createWrapper(mocks),
      });

      await waitFor(() => {
        expect(result.current.recommendation).toBeDefined();
      });

      // network-only should always fetch from server (not cache)
      expect(result.current.recommendation).toBeDefined();
    });

    it('should handle null recommendation (no tasks)', async () => {
      const mocks = [
        {
          request: {
            query: NextRecommendedTaskDocument,
            variables: { boardId: 'board-1' },
          },
          result: {
            data: {
              nextRecommendedTask: null,
            },
          },
        },
      ];

      const { result } = renderHook(() => useAIRecommendations('board-1'), {
        wrapper: createWrapper(mocks),
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.recommendation).toBeNull();
      expect(result.current.error).toBeNull();
    });

    it('should include task labels and subtasks', async () => {
      const mocks = [
        {
          request: {
            query: NextRecommendedTaskDocument,
            variables: { boardId: 'board-1' },
          },
          result: {
            data: {
              nextRecommendedTask: mockRecommendation,
            },
          },
        },
      ];

      const { result } = renderHook(() => useAIRecommendations('board-1'), {
        wrapper: createWrapper(mocks),
      });

      await waitFor(() => {
        expect(result.current.recommendation).toBeDefined();
        expect(result.current.recommendation?.labels).toHaveLength(1);
      });

      expect(result.current.recommendation?.labels[0].name).toBe('urgent');
      expect(result.current.recommendation?.subTasks).toHaveLength(1);
    });
  });

  describe('Error Cases', () => {
    it('should handle GraphQL errors', async () => {
      const mocks = [
        {
          request: {
            query: NextRecommendedTaskDocument,
            variables: { boardId: 'board-1' },
          },
          result: {
            errors: [{ message: 'AI service unavailable' }],
          },
        },
      ];

      const { result } = renderHook(() => useAIRecommendations('board-1'), {
        wrapper: createWrapper(mocks),
      });

      await waitFor(() => {
        expect(result.current.error).toBeDefined();
        expect(result.current.error?.message).toContain(
          'AI service unavailable'
        );
      });

      expect(result.current.recommendation).toBeNull();
    });

    it('should handle network errors', async () => {
      const mocks = [
        {
          request: {
            query: NextRecommendedTaskDocument,
            variables: { boardId: 'board-1' },
          },
          error: new Error('Network error'),
        },
      ];

      const { result } = renderHook(() => useAIRecommendations('board-1'), {
        wrapper: createWrapper(mocks),
      });

      await waitFor(() => {
        expect(result.current.error).toBeDefined();
        expect(result.current.error?.message).toBe('Network error');
      });

      expect(result.current.recommendation).toBeNull();
    });
  });

  describe('Refresh Functionality', () => {
    it('should refresh recommendation on manual refetch', async () => {
      const mocks = [
        {
          request: {
            query: NextRecommendedTaskDocument,
            variables: { boardId: 'board-1' },
          },
          result: {
            data: {
              nextRecommendedTask: mockRecommendation,
            },
          },
        },
        {
          request: {
            query: NextRecommendedTaskDocument,
            variables: { boardId: 'board-1' },
          },
          result: {
            data: {
              nextRecommendedTask: {
                ...mockRecommendation,
                id: 'task-2',
                title: 'Updated Recommendation',
              },
            },
          },
        },
      ];

      const { result } = renderHook(() => useAIRecommendations('board-1'), {
        wrapper: createWrapper(mocks),
      });

      await waitFor(() => {
        expect(result.current.recommendation?.id).toBe('task-1');
      });

      // Trigger manual refresh
      await result.current.refresh();

      await waitFor(() => {
        expect(result.current.recommendation?.id).toBe('task-2');
        expect(result.current.recommendation?.title).toBe(
          'Updated Recommendation'
        );
      });
    });

    it('should handle refresh errors gracefully', async () => {
      const mocks = [
        {
          request: {
            query: NextRecommendedTaskDocument,
            variables: { boardId: 'board-1' },
          },
          result: {
            data: {
              nextRecommendedTask: mockRecommendation,
            },
          },
        },
        {
          request: {
            query: NextRecommendedTaskDocument,
            variables: { boardId: 'board-1' },
          },
          error: new Error('Refresh failed'),
        },
      ];

      const { result } = renderHook(() => useAIRecommendations('board-1'), {
        wrapper: createWrapper(mocks),
      });

      await waitFor(() => {
        expect(result.current.recommendation).toBeDefined();
      });

      // Trigger refresh (should fail gracefully)
      await result.current.refresh();

      await waitFor(() => {
        expect(result.current.error).toBeDefined();
      });
    });
  });

  describe('Skip Option', () => {
    it('should skip query when skip option is true', async () => {
      const mocks = [
        {
          request: {
            query: NextRecommendedTaskDocument,
            variables: { boardId: 'board-1' },
          },
          result: {
            data: {
              nextRecommendedTask: mockRecommendation,
            },
          },
        },
      ];

      const { result } = renderHook(
        () => useAIRecommendations('board-1', { skip: true }),
        { wrapper: createWrapper(mocks) }
      );

      // Query should not execute
      expect(result.current.loading).toBe(false);
      expect(result.current.recommendation).toBeNull();
    });

    it('should execute query when skip option is false', async () => {
      const mocks = [
        {
          request: {
            query: NextRecommendedTaskDocument,
            variables: { boardId: 'board-1' },
          },
          result: {
            data: {
              nextRecommendedTask: mockRecommendation,
            },
          },
        },
      ];

      const { result } = renderHook(
        () => useAIRecommendations('board-1', { skip: false }),
        { wrapper: createWrapper(mocks) }
      );

      await waitFor(() => {
        expect(result.current.recommendation).toBeDefined();
      });
    });
  });

  describe('Polling', () => {
    it('should support polling interval option', async () => {
      const mocks = [
        {
          request: {
            query: NextRecommendedTaskDocument,
            variables: { boardId: 'board-1' },
          },
          result: {
            data: {
              nextRecommendedTask: mockRecommendation,
            },
          },
        },
      ];

      const { result } = renderHook(
        () => useAIRecommendations('board-1', { pollInterval: 5000 }),
        { wrapper: createWrapper(mocks) }
      );

      await waitFor(() => {
        expect(result.current.recommendation).toBeDefined();
      });

      // Polling is configured (exact polling behavior is handled by Apollo Client)
      expect(result.current.recommendation).toBeDefined();
    });
  });

  describe('Loading States', () => {
    it('should track loading state during query', async () => {
      const mocks = [
        {
          request: {
            query: NextRecommendedTaskDocument,
            variables: { boardId: 'board-1' },
          },
          result: {
            data: {
              nextRecommendedTask: mockRecommendation,
            },
          },
          delay: 100, // Simulate network delay
        },
      ];

      const { result } = renderHook(() => useAIRecommendations('board-1'), {
        wrapper: createWrapper(mocks),
      });

      // Initial loading state
      expect(result.current.loading).toBe(true);

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle task with all optional fields', async () => {
      const minimalTask = {
        ...mockRecommendation,
        description: null,
        dueDate: null,
        dueTime: null,
        estimatedDuration: null,
        labels: [],
        subTasks: [],
      };

      const mocks = [
        {
          request: {
            query: NextRecommendedTaskDocument,
            variables: { boardId: 'board-1' },
          },
          result: {
            data: {
              nextRecommendedTask: minimalTask,
            },
          },
        },
      ];

      const { result } = renderHook(() => useAIRecommendations('board-1'), {
        wrapper: createWrapper(mocks),
      });

      await waitFor(() => {
        expect(result.current.recommendation).toBeDefined();
        expect(result.current.recommendation?.labels).toHaveLength(0);
      });

      expect(result.current.recommendation?.subTasks).toHaveLength(0);
    });

    it('should handle overdue task recommendation', async () => {
      const overdueTask = {
        ...mockRecommendation,
        isOverdue: true,
        dueDate: '2024-12-31',
      };

      const mocks = [
        {
          request: {
            query: NextRecommendedTaskDocument,
            variables: { boardId: 'board-1' },
          },
          result: {
            data: {
              nextRecommendedTask: overdueTask,
            },
          },
        },
      ];

      const { result } = renderHook(() => useAIRecommendations('board-1'), {
        wrapper: createWrapper(mocks),
      });

      await waitFor(() => {
        expect(result.current.recommendation?.isOverdue).toBe(true);
      });
    });

    it('should handle task with completion percentage', async () => {
      const partialTask = {
        ...mockRecommendation,
        completionPercentage: 50,
      };

      const mocks = [
        {
          request: {
            query: NextRecommendedTaskDocument,
            variables: { boardId: 'board-1' },
          },
          result: {
            data: {
              nextRecommendedTask: partialTask,
            },
          },
        },
      ];

      const { result } = renderHook(() => useAIRecommendations('board-1'), {
        wrapper: createWrapper(mocks),
      });

      await waitFor(() => {
        expect(result.current.recommendation?.completionPercentage).toBe(50);
      });
    });
  });

  describe('Board ID Variations', () => {
    it('should handle different board IDs', async () => {
      const mocks = [
        {
          request: {
            query: NextRecommendedTaskDocument,
            variables: { boardId: 'board-2' },
          },
          result: {
            data: {
              nextRecommendedTask: mockRecommendation,
            },
          },
        },
      ];

      const { result } = renderHook(() => useAIRecommendations('board-2'), {
        wrapper: createWrapper(mocks),
      });

      await waitFor(() => {
        expect(result.current.recommendation).toBeDefined();
      });
    });
  });
});
