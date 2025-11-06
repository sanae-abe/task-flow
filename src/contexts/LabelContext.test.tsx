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
        labels: [{ id: 'label-3', name: 'Docs', color: 'default' }],
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

  describe('Label CRUD operations', () => {
    describe('createLabel', () => {
      it('should create a new label', () => {
        const wrapper = ({ children }: { children: React.ReactNode }) => (
          <LabelProvider>{children}</LabelProvider>
        );

        const { result } = renderHook(() => useLabel(), { wrapper });

        result.current.createLabel('Enhancement', '#1f883d');

        expect(mockBoardDispatch).toHaveBeenCalledWith({
          type: 'ADD_LABEL',
          payload: {
            label: expect.objectContaining({
              id: expect.any(String),
              name: 'Enhancement',
              color: '#1f883d',
            }),
          },
        });
      });

      it('should not create label when no current board', () => {
        mockBoardState.currentBoard = null;

        const wrapper = ({ children }: { children: React.ReactNode }) => (
          <LabelProvider>{children}</LabelProvider>
        );

        const { result } = renderHook(() => useLabel(), { wrapper });

        result.current.createLabel('Test', '#0969da');

        expect(mockBoardDispatch).not.toHaveBeenCalled();
      });

      it('should trigger message callback on successful creation', () => {
        const messageCallback = vi.fn();
        const wrapper = ({ children }: { children: React.ReactNode }) => (
          <LabelProvider>{children}</LabelProvider>
        );

        const { result } = renderHook(() => useLabel(), { wrapper });

        result.current.setMessageCallback(messageCallback);
        result.current.createLabel('New Label', '#0969da');

        expect(messageCallback).toHaveBeenCalledWith({
          type: 'success',
          text: 'ラベル「New Label」を作成しました',
        });
      });
    });

    describe('createLabelInBoard', () => {
      it('should create label in specified board', () => {
        const wrapper = ({ children }: { children: React.ReactNode }) => (
          <LabelProvider>{children}</LabelProvider>
        );

        const { result } = renderHook(() => useLabel(), { wrapper });

        result.current.createLabelInBoard('Label', '#0969da', 'board-1');

        expect(mockBoardDispatch).toHaveBeenCalledWith({
          type: 'ADD_LABEL',
          payload: {
            label: expect.objectContaining({
              name: 'Label',
              color: '#0969da',
            }),
          },
        });
      });

      it('should not create label in different board', () => {
        const wrapper = ({ children }: { children: React.ReactNode }) => (
          <LabelProvider>{children}</LabelProvider>
        );

        const { result } = renderHook(() => useLabel(), { wrapper });

        result.current.createLabelInBoard('Label', '#0969da', 'board-999');

        expect(mockBoardDispatch).not.toHaveBeenCalled();
      });

      it('should trigger message callback when creating in current board', () => {
        const messageCallback = vi.fn();
        const wrapper = ({ children }: { children: React.ReactNode }) => (
          <LabelProvider>{children}</LabelProvider>
        );

        const { result } = renderHook(() => useLabel(), { wrapper });

        result.current.setMessageCallback(messageCallback);
        result.current.createLabelInBoard('Label', '#0969da', 'board-1');

        expect(messageCallback).toHaveBeenCalledWith({
          type: 'success',
          text: 'ラベル「Label」を作成しました',
        });
      });
    });

    describe('updateLabel', () => {
      it('should update label name', () => {
        const wrapper = ({ children }: { children: React.ReactNode }) => (
          <LabelProvider>{children}</LabelProvider>
        );

        const { result } = renderHook(() => useLabel(), { wrapper });

        result.current.updateLabel('label-1', { name: 'Critical Bug' });

        expect(mockBoardDispatch).toHaveBeenCalledWith({
          type: 'UPDATE_LABEL',
          payload: {
            labelId: 'label-1',
            updates: { name: 'Critical Bug' },
          },
        });
      });

      it('should update label color', () => {
        const wrapper = ({ children }: { children: React.ReactNode }) => (
          <LabelProvider>{children}</LabelProvider>
        );

        const { result } = renderHook(() => useLabel(), { wrapper });

        result.current.updateLabel('label-1', { color: '#ff0000' });

        expect(mockBoardDispatch).toHaveBeenCalledWith({
          type: 'UPDATE_LABEL',
          payload: {
            labelId: 'label-1',
            updates: { color: '#ff0000' },
          },
        });
      });

      it('should update both name and color', () => {
        const wrapper = ({ children }: { children: React.ReactNode }) => (
          <LabelProvider>{children}</LabelProvider>
        );

        const { result } = renderHook(() => useLabel(), { wrapper });

        result.current.updateLabel('label-1', {
          name: 'Updated',
          color: '#00ff00',
        });

        expect(mockBoardDispatch).toHaveBeenCalledWith({
          type: 'UPDATE_LABEL',
          payload: {
            labelId: 'label-1',
            updates: { name: 'Updated', color: '#00ff00' },
          },
        });
      });

      it('should not update when no current board', () => {
        mockBoardState.currentBoard = null;

        const wrapper = ({ children }: { children: React.ReactNode }) => (
          <LabelProvider>{children}</LabelProvider>
        );

        const { result } = renderHook(() => useLabel(), { wrapper });

        result.current.updateLabel('label-1', { name: 'Test' });

        expect(mockBoardDispatch).not.toHaveBeenCalled();
      });

      it('should not update when label not found', () => {
        const wrapper = ({ children }: { children: React.ReactNode }) => (
          <LabelProvider>{children}</LabelProvider>
        );

        const { result } = renderHook(() => useLabel(), { wrapper });

        result.current.updateLabel('non-existent', { name: 'Test' });

        expect(mockBoardDispatch).not.toHaveBeenCalled();
      });

      it('should trigger message callback with appropriate message for name change', () => {
        const messageCallback = vi.fn();
        const wrapper = ({ children }: { children: React.ReactNode }) => (
          <LabelProvider>{children}</LabelProvider>
        );

        const { result } = renderHook(() => useLabel(), { wrapper });

        result.current.setMessageCallback(messageCallback);
        result.current.updateLabel('label-1', { name: 'New Name' });

        expect(messageCallback).toHaveBeenCalledWith({
          type: 'success',
          text: expect.stringContaining('New Name'),
        });
      });

      it('should trigger message callback with appropriate message for color change', () => {
        const messageCallback = vi.fn();
        const wrapper = ({ children }: { children: React.ReactNode }) => (
          <LabelProvider>{children}</LabelProvider>
        );

        const { result } = renderHook(() => useLabel(), { wrapper });

        result.current.setMessageCallback(messageCallback);
        result.current.updateLabel('label-1', { color: '#ff0000' });

        expect(messageCallback).toHaveBeenCalledWith({
          type: 'success',
          text: expect.stringContaining('色を変更'),
        });
      });
    });

    describe('deleteLabel', () => {
      it('should delete a label', () => {
        const wrapper = ({ children }: { children: React.ReactNode }) => (
          <LabelProvider>{children}</LabelProvider>
        );

        const { result } = renderHook(() => useLabel(), { wrapper });

        result.current.deleteLabel('label-1');

        expect(mockBoardDispatch).toHaveBeenCalledWith({
          type: 'DELETE_LABEL',
          payload: { labelId: 'label-1' },
        });
      });

      it('should not delete when no current board', () => {
        mockBoardState.currentBoard = null;

        const wrapper = ({ children }: { children: React.ReactNode }) => (
          <LabelProvider>{children}</LabelProvider>
        );

        const { result } = renderHook(() => useLabel(), { wrapper });

        result.current.deleteLabel('label-1');

        expect(mockBoardDispatch).not.toHaveBeenCalled();
      });

      it('should trigger message callback on deletion', () => {
        const messageCallback = vi.fn();
        const wrapper = ({ children }: { children: React.ReactNode }) => (
          <LabelProvider>{children}</LabelProvider>
        );

        const { result } = renderHook(() => useLabel(), { wrapper });

        result.current.setMessageCallback(messageCallback);
        result.current.deleteLabel('label-1');

        expect(messageCallback).toHaveBeenCalledWith({
          type: 'success',
          text: expect.stringContaining('削除しました'),
        });
      });
    });

    describe('deleteLabelFromAllBoards', () => {
      it('should delete label from all boards', () => {
        const wrapper = ({ children }: { children: React.ReactNode }) => (
          <LabelProvider>{children}</LabelProvider>
        );

        const { result } = renderHook(() => useLabel(), { wrapper });

        result.current.deleteLabelFromAllBoards('label-1');

        expect(mockBoardDispatch).toHaveBeenCalledWith({
          type: 'DELETE_LABEL_FROM_ALL_BOARDS',
          payload: { labelId: 'label-1' },
        });
      });

      it('should trigger message callback on deletion', () => {
        const messageCallback = vi.fn();
        const wrapper = ({ children }: { children: React.ReactNode }) => (
          <LabelProvider>{children}</LabelProvider>
        );

        const { result } = renderHook(() => useLabel(), { wrapper });

        result.current.setMessageCallback(messageCallback);
        result.current.deleteLabelFromAllBoards('label-1');

        expect(messageCallback).toHaveBeenCalledWith({
          type: 'success',
          text: expect.stringContaining('削除しました'),
        });
      });
    });
  });

  describe('Label usage count', () => {
    it('should count label usage in current board', () => {
      const boardWithTasks: KanbanBoard = {
        ...mockBoard,
        columns: [
          {
            id: 'col-1',
            title: 'To Do',
            tasks: [
              {
                id: 'task-1',
                title: 'Task 1',
                labels: [mockLabel1],
              } as any,
              {
                id: 'task-2',
                title: 'Task 2',
                labels: [mockLabel1, mockLabel2],
              } as any,
            ],
          } as any,
        ],
      };

      mockBoardState.currentBoard = boardWithTasks;

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <LabelProvider>{children}</LabelProvider>
      );

      const { result } = renderHook(() => useLabel(), { wrapper });

      const count = result.current.getCurrentBoardLabelUsageCount('label-1');
      expect(count).toBe(2);
    });

    it('should return 0 when no current board', () => {
      mockBoardState.currentBoard = null;

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <LabelProvider>{children}</LabelProvider>
      );

      const { result } = renderHook(() => useLabel(), { wrapper });

      const count = result.current.getCurrentBoardLabelUsageCount('label-1');
      expect(count).toBe(0);
    });

    it('should count label usage in specific board', () => {
      const boardWithTasks: KanbanBoard = {
        ...mockBoard,
        id: 'board-test',
        columns: [
          {
            id: 'col-1',
            title: 'To Do',
            tasks: [
              {
                id: 'task-1',
                title: 'Task 1',
                labels: [mockLabel1],
              } as any,
            ],
          } as any,
        ],
      };

      mockBoardState.boards = [boardWithTasks];

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <LabelProvider>{children}</LabelProvider>
      );

      const { result } = renderHook(() => useLabel(), { wrapper });

      const count = result.current.getLabelUsageCountInBoard(
        'label-1',
        'board-test'
      );
      expect(count).toBe(1);
    });

    it('should return 0 for non-existent board', () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <LabelProvider>{children}</LabelProvider>
      );

      const { result } = renderHook(() => useLabel(), { wrapper });

      const count = result.current.getLabelUsageCountInBoard(
        'label-1',
        'non-existent'
      );
      expect(count).toBe(0);
    });

    it('should count label usage across all boards', () => {
      const board1: KanbanBoard = {
        ...mockBoard,
        id: 'board-1',
        columns: [
          {
            id: 'col-1',
            title: 'To Do',
            tasks: [
              {
                id: 'task-1',
                title: 'Task 1',
                labels: [mockLabel1],
              } as any,
            ],
          } as any,
        ],
      };

      const board2: KanbanBoard = {
        ...mockBoard,
        id: 'board-2',
        columns: [
          {
            id: 'col-2',
            title: 'To Do',
            tasks: [
              {
                id: 'task-2',
                title: 'Task 2',
                labels: [mockLabel1],
              } as any,
            ],
          } as any,
        ],
      };

      mockBoardState.boards = [board1, board2];

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <LabelProvider>{children}</LabelProvider>
      );

      const { result } = renderHook(() => useLabel(), { wrapper });

      const count = result.current.getAllLabelUsageCount('label-1');
      expect(count).toBe(2);
    });
  });

  describe('Label query operations', () => {
    it('should get all labels from all boards', () => {
      const board2: KanbanBoard = {
        ...mockBoard,
        id: 'board-2',
        labels: [{ id: 'label-3', name: 'Docs', color: 'default' }],
      };

      mockBoardState.boards = [mockBoard, board2];

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <LabelProvider>{children}</LabelProvider>
      );

      const { result } = renderHook(() => useLabel(), { wrapper });

      const allLabels = result.current.getAllLabels();
      expect(allLabels).toHaveLength(3);
    });

    it('should get all labels with board info', () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <LabelProvider>{children}</LabelProvider>
      );

      const { result } = renderHook(() => useLabel(), { wrapper });

      const labelsWithInfo = result.current.getAllLabelsWithBoardInfo();

      expect(labelsWithInfo).toEqual([
        expect.objectContaining({
          id: 'label-1',
          boardName: 'Test Board',
          boardId: 'board-1',
        }),
        expect.objectContaining({
          id: 'label-2',
          boardName: 'Test Board',
          boardId: 'board-1',
        }),
      ]);
    });

    it('should handle boards without labels', () => {
      const emptyBoard: KanbanBoard = {
        ...mockBoard,
        labels: undefined as any,
      };

      mockBoardState.boards = [emptyBoard];

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <LabelProvider>{children}</LabelProvider>
      );

      const { result } = renderHook(() => useLabel(), { wrapper });

      const allLabels = result.current.getAllLabels();
      expect(allLabels).toEqual([]);
    });
  });

  describe('Label sharing operations', () => {
    it('should copy label to current board', () => {
      const labelToCopy: Label = {
        id: 'label-other',
        name: 'Other Label',
        color: '#0969da',
      };

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <LabelProvider>{children}</LabelProvider>
      );

      const { result } = renderHook(() => useLabel(), { wrapper });

      result.current.copyLabelToCurrentBoard(labelToCopy);

      expect(mockBoardDispatch).toHaveBeenCalledWith({
        type: 'ADD_LABEL',
        payload: {
          label: expect.objectContaining({
            name: 'Other Label',
            color: '#0969da',
            id: expect.not.stringMatching('label-other'),
          }),
        },
      });
    });

    it('should not copy label if already exists', () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <LabelProvider>{children}</LabelProvider>
      );

      const { result } = renderHook(() => useLabel(), { wrapper });

      result.current.copyLabelToCurrentBoard(mockLabel1);

      expect(mockBoardDispatch).not.toHaveBeenCalled();
    });

    it('should not copy when no current board', () => {
      mockBoardState.currentBoard = null;

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <LabelProvider>{children}</LabelProvider>
      );

      const { result } = renderHook(() => useLabel(), { wrapper });

      result.current.copyLabelToCurrentBoard(mockLabel1);

      expect(mockBoardDispatch).not.toHaveBeenCalled();
    });

    it('should check if label is in current board', () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <LabelProvider>{children}</LabelProvider>
      );

      const { result } = renderHook(() => useLabel(), { wrapper });

      expect(result.current.isLabelInCurrentBoard('label-1')).toBe(true);
      expect(result.current.isLabelInCurrentBoard('label-999')).toBe(false);
    });
  });

  describe('Message callback management', () => {
    it('should set message callback', () => {
      const messageCallback = vi.fn();
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <LabelProvider>{children}</LabelProvider>
      );

      const { result } = renderHook(() => useLabel(), { wrapper });

      result.current.setMessageCallback(messageCallback);
      result.current.createLabel('Test', '#0969da');

      expect(messageCallback).toHaveBeenCalled();
    });

    it('should clear message callback with null', () => {
      const messageCallback = vi.fn();
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <LabelProvider>{children}</LabelProvider>
      );

      const { result } = renderHook(() => useLabel(), { wrapper });

      result.current.setMessageCallback(messageCallback);
      result.current.setMessageCallback(null);
      result.current.createLabel('Test', '#0969da');

      expect(messageCallback).not.toHaveBeenCalled();
    });

    it('should replace previous callback when setting new one', () => {
      const callback1 = vi.fn();
      const callback2 = vi.fn();
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <LabelProvider>{children}</LabelProvider>
      );

      const { result } = renderHook(() => useLabel(), { wrapper });

      result.current.setMessageCallback(callback1);
      result.current.setMessageCallback(callback2);
      result.current.createLabel('Test', '#0969da');

      expect(callback1).not.toHaveBeenCalled();
      expect(callback2).toHaveBeenCalled();
    });
  });
});
