/**
 * LabelContext tests
 * ラベル管理コンテキストの包括的テスト
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { LabelProvider, useLabel } from './LabelContext';
import type { Label, KanbanBoard } from '../types';
import React from 'react';

// Mock BoardContext
const mockBoardDispatch = vi.fn();
const mockBoardState = {
  boards: [] as KanbanBoard[],
  currentBoard: null as KanbanBoard | null,
  viewMode: 'kanban' as const,
  sortOption: null,
  taskFilter: { type: 'all' as const, label: '' },
};

vi.mock('./BoardContext', () => ({
  useBoard: () => ({
    state: mockBoardState,
    dispatch: mockBoardDispatch,
  }),
}));

describe('LabelContext', () => {
  const mockLabel1: Label = {
    id: 'label-1',
    name: 'Bug',
    color: 'danger',
  };

  const mockLabel2: Label = {
    id: 'label-2',
    name: 'Feature',
    color: 'primary',
  };

  const mockBoard: KanbanBoard = {
    id: 'board-1',
    title: 'Test Board',
    columns: [],
    labels: [mockLabel1, mockLabel2],
    createdAt: '2025-01-01T00:00:00.000Z',
    updatedAt: '2025-01-01T00:00:00.000Z',
    deletionState: 'active',
    deletedAt: null,
  };

  beforeEach(() => {
    mockBoardDispatch.mockClear();
    mockBoardState.currentBoard = mockBoard;
    mockBoardState.boards = [mockBoard];
  });

  describe('Provider rendering', () => {
    it('should provide context value', () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <LabelProvider>{children}</LabelProvider>
      );

      const { result } = renderHook(() => useLabel(), { wrapper });

      expect(result.current).toBeDefined();
      expect(result.current.labels).toBeDefined();
    });

    it('should throw error when used outside provider', () => {
      // Suppress console.error for this test
      const originalError = console.error;
      console.error = vi.fn();

      expect(() => {
        renderHook(() => useLabel());
      }).toThrow('useLabel must be used within a LabelProvider');

      console.error = originalError;
    });

    it('should expose current board labels', () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <LabelProvider>{children}</LabelProvider>
      );

      const { result } = renderHook(() => useLabel(), { wrapper });

      expect(result.current.labels).toEqual([mockLabel1, mockLabel2]);
    });

    it('should return empty array when no current board', () => {
      mockBoardState.currentBoard = null;

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <LabelProvider>{children}</LabelProvider>
      );

      const { result } = renderHook(() => useLabel(), { wrapper });

      expect(result.current.labels).toEqual([]);
    });
  });

  describe('Multiple boards', () => {
    it('should handle multiple boards', () => {
      const board2: KanbanBoard = {
        id: 'board-2',
        title: 'Board 2',
        columns: [],
        labels: [
          { id: 'label-3', name: 'Docs', color: 'default' },
        ],
        createdAt: '2025-01-01T00:00:00.000Z',
        updatedAt: '2025-01-01T00:00:00.000Z',
        deletionState: 'active',
        deletedAt: null,
      };

      mockBoardState.boards = [mockBoard, board2];

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <LabelProvider>{children}</LabelProvider>
      );

      const { result } = renderHook(() => useLabel(), { wrapper });

      // Should only show labels from current board
      expect(result.current.labels).toEqual([mockLabel1, mockLabel2]);
    });
  });

  describe('Edge cases', () => {
    it('should handle boards with no labels', () => {
      const emptyBoard: KanbanBoard = {
        ...mockBoard,
        labels: [],
      };
      mockBoardState.currentBoard = emptyBoard;
      mockBoardState.boards = [emptyBoard];

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <LabelProvider>{children}</LabelProvider>
      );

      const { result } = renderHook(() => useLabel(), { wrapper });

      expect(result.current.labels).toEqual([]);
    });

    it('should handle empty boards array', () => {
      mockBoardState.boards = [];
      mockBoardState.currentBoard = null;

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <LabelProvider>{children}</LabelProvider>
      );

      const { result } = renderHook(() => useLabel(), { wrapper });

      expect(result.current.labels).toEqual([]);
    });
  });
});
