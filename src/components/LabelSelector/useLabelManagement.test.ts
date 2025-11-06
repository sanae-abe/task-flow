/**
 * useLabelManagement hook tests
 * ラベル管理フックの包括的テスト
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useLabelManagement } from './useLabelManagement';
import type { Label } from '../../types';

// Mock contexts
const mockGetAllLabels = vi.fn();
const mockCreateLabel = vi.fn();
const mockIsLabelInCurrentBoard = vi.fn();
const mockCopyLabelToCurrentBoard = vi.fn();
const mockSetMessageCallback = vi.fn();

vi.mock('../../contexts/LabelContext', () => ({
  useLabel: () => ({
    getAllLabels: mockGetAllLabels,
    createLabel: mockCreateLabel,
    isLabelInCurrentBoard: mockIsLabelInCurrentBoard,
    copyLabelToCurrentBoard: mockCopyLabelToCurrentBoard,
    setMessageCallback: mockSetMessageCallback,
  }),
}));

describe('useLabelManagement', () => {
  let mockSelectedLabels: Label[];
  let mockOnLabelsChange: ReturnType<typeof vi.fn>;
  let mockAllLabels: Label[];

  beforeEach(() => {
    mockSelectedLabels = [];
    mockOnLabelsChange = vi.fn();
    mockAllLabels = [
      { id: 'label-1', name: 'Bug', color: '#d1242f' },
      { id: 'label-2', name: 'Feature', color: '#0969da' },
      { id: 'label-3', name: 'Documentation', color: '#22863a' },
    ];

    mockGetAllLabels.mockReturnValue(mockAllLabels);
    mockIsLabelInCurrentBoard.mockImplementation(
      (id: string) => id === 'label-1' || id === 'label-2'
    );
    mockSetMessageCallback.mockClear();
    mockOnLabelsChange.mockClear();
    mockCreateLabel.mockClear();
    mockCopyLabelToCurrentBoard.mockClear();
  });

  describe('Initialization', () => {
    it('should initialize with empty selected labels', () => {
      const { result } = renderHook(() =>
        useLabelManagement({
          selectedLabels: [],
          onLabelsChange: mockOnLabelsChange,
        })
      );

      expect(result.current.selectedLabelIds.size).toBe(0);
    });

    it('should initialize with selected labels', () => {
      const selectedLabels = [mockAllLabels[0]!, mockAllLabels[1]!];

      const { result } = renderHook(() =>
        useLabelManagement({
          selectedLabels,
          onLabelsChange: mockOnLabelsChange,
        })
      );

      expect(result.current.selectedLabelIds.size).toBe(2);
      expect(result.current.selectedLabelIds.has('label-1')).toBe(true);
      expect(result.current.selectedLabelIds.has('label-2')).toBe(true);
    });

    it('should set message callback on mount', () => {
      renderHook(() =>
        useLabelManagement({
          selectedLabels: mockSelectedLabels,
          onLabelsChange: mockOnLabelsChange,
        })
      );

      expect(mockSetMessageCallback).toHaveBeenCalled();
    });

    it('should clear message callback on unmount', () => {
      const { unmount } = renderHook(() =>
        useLabelManagement({
          selectedLabels: mockSelectedLabels,
          onLabelsChange: mockOnLabelsChange,
        })
      );

      unmount();

      expect(mockSetMessageCallback).toHaveBeenCalledWith(null);
    });

    it('should initialize dialog as closed', () => {
      const { result } = renderHook(() =>
        useLabelManagement({
          selectedLabels: mockSelectedLabels,
          onLabelsChange: mockOnLabelsChange,
        })
      );

      expect(result.current.isAddDialogOpen).toBe(false);
    });
  });

  describe('Label Classification', () => {
    it('should classify labels into current and other boards', () => {
      const { result } = renderHook(() =>
        useLabelManagement({
          selectedLabels: mockSelectedLabels,
          onLabelsChange: mockOnLabelsChange,
        })
      );

      expect(result.current.currentBoardLabels).toHaveLength(2);
      expect(result.current.otherBoardLabels).toHaveLength(1);
      expect(result.current.currentBoardLabels[0]?.id).toBe('label-1');
      expect(result.current.currentBoardLabels[1]?.id).toBe('label-2');
      expect(result.current.otherBoardLabels[0]?.id).toBe('label-3');
    });

    it('should update classification when labels change', () => {
      mockIsLabelInCurrentBoard.mockImplementation(
        (id: string) => id === 'label-1'
      );

      const { result, rerender } = renderHook(() =>
        useLabelManagement({
          selectedLabels: mockSelectedLabels,
          onLabelsChange: mockOnLabelsChange,
        })
      );

      expect(result.current.currentBoardLabels).toHaveLength(1);
      expect(result.current.otherBoardLabels).toHaveLength(2);

      // Change the mock implementation
      mockIsLabelInCurrentBoard.mockImplementation(() => true);
      rerender();

      expect(result.current.currentBoardLabels).toHaveLength(3);
      expect(result.current.otherBoardLabels).toHaveLength(0);
    });

    it('should handle empty labels array', () => {
      mockGetAllLabels.mockReturnValue([]);

      const { result } = renderHook(() =>
        useLabelManagement({
          selectedLabels: mockSelectedLabels,
          onLabelsChange: mockOnLabelsChange,
        })
      );

      expect(result.current.currentBoardLabels).toHaveLength(0);
      expect(result.current.otherBoardLabels).toHaveLength(0);
    });
  });

  describe('Dialog Management', () => {
    it('should open add dialog', () => {
      const { result } = renderHook(() =>
        useLabelManagement({
          selectedLabels: mockSelectedLabels,
          onLabelsChange: mockOnLabelsChange,
        })
      );

      act(() => {
        result.current.handleAddDialogOpen();
      });

      expect(result.current.isAddDialogOpen).toBe(true);
    });

    it('should close add dialog', () => {
      const { result } = renderHook(() =>
        useLabelManagement({
          selectedLabels: mockSelectedLabels,
          onLabelsChange: mockOnLabelsChange,
        })
      );

      act(() => {
        result.current.handleAddDialogOpen();
      });

      expect(result.current.isAddDialogOpen).toBe(true);

      act(() => {
        result.current.handleAddDialogClose();
      });

      expect(result.current.isAddDialogOpen).toBe(false);
    });

    it('should toggle dialog state correctly', () => {
      const { result } = renderHook(() =>
        useLabelManagement({
          selectedLabels: mockSelectedLabels,
          onLabelsChange: mockOnLabelsChange,
        })
      );

      expect(result.current.isAddDialogOpen).toBe(false);

      act(() => {
        result.current.handleAddDialogOpen();
      });
      expect(result.current.isAddDialogOpen).toBe(true);

      act(() => {
        result.current.handleAddDialogClose();
      });
      expect(result.current.isAddDialogOpen).toBe(false);

      act(() => {
        result.current.handleAddDialogOpen();
      });
      expect(result.current.isAddDialogOpen).toBe(true);
    });
  });

  describe('Toggle Label', () => {
    it('should add label when not selected', () => {
      const { result } = renderHook(() =>
        useLabelManagement({
          selectedLabels: mockSelectedLabels,
          onLabelsChange: mockOnLabelsChange,
        })
      );

      act(() => {
        result.current.toggleLabel(mockAllLabels[0]!);
      });

      expect(mockOnLabelsChange).toHaveBeenCalledWith([mockAllLabels[0]]);
    });

    it('should remove label when already selected', () => {
      const selectedLabels = [mockAllLabels[0]!, mockAllLabels[1]!];

      const { result } = renderHook(() =>
        useLabelManagement({
          selectedLabels,
          onLabelsChange: mockOnLabelsChange,
        })
      );

      act(() => {
        result.current.toggleLabel(mockAllLabels[0]!);
      });

      expect(mockOnLabelsChange).toHaveBeenCalledWith([mockAllLabels[1]]);
    });

    it('should maintain other labels when toggling', () => {
      const selectedLabels = [mockAllLabels[0]!];

      const { result } = renderHook(() =>
        useLabelManagement({
          selectedLabels,
          onLabelsChange: mockOnLabelsChange,
        })
      );

      act(() => {
        result.current.toggleLabel(mockAllLabels[1]!);
      });

      expect(mockOnLabelsChange).toHaveBeenCalledWith([
        mockAllLabels[0],
        mockAllLabels[1],
      ]);
    });

    it('should handle toggle on empty selection', () => {
      const { result } = renderHook(() =>
        useLabelManagement({
          selectedLabels: [],
          onLabelsChange: mockOnLabelsChange,
        })
      );

      act(() => {
        result.current.toggleLabel(mockAllLabels[0]!);
      });

      expect(mockOnLabelsChange).toHaveBeenCalledWith([mockAllLabels[0]]);
    });
  });

  describe('Remove Label', () => {
    it('should remove label by id', () => {
      const selectedLabels = [mockAllLabels[0]!, mockAllLabels[1]!];

      const { result } = renderHook(() =>
        useLabelManagement({
          selectedLabels,
          onLabelsChange: mockOnLabelsChange,
        })
      );

      act(() => {
        result.current.removeLabel('label-1');
      });

      expect(mockOnLabelsChange).toHaveBeenCalledWith([mockAllLabels[1]]);
    });

    it('should handle removing non-existent label', () => {
      const selectedLabels = [mockAllLabels[0]!];

      const { result } = renderHook(() =>
        useLabelManagement({
          selectedLabels,
          onLabelsChange: mockOnLabelsChange,
        })
      );

      act(() => {
        result.current.removeLabel('non-existent-id');
      });

      expect(mockOnLabelsChange).toHaveBeenCalledWith([mockAllLabels[0]]);
    });

    it('should handle removing from empty selection', () => {
      const { result } = renderHook(() =>
        useLabelManagement({
          selectedLabels: [],
          onLabelsChange: mockOnLabelsChange,
        })
      );

      act(() => {
        result.current.removeLabel('label-1');
      });

      expect(mockOnLabelsChange).toHaveBeenCalledWith([]);
    });

    it('should remove last label successfully', () => {
      const selectedLabels = [mockAllLabels[0]!];

      const { result } = renderHook(() =>
        useLabelManagement({
          selectedLabels,
          onLabelsChange: mockOnLabelsChange,
        })
      );

      act(() => {
        result.current.removeLabel('label-1');
      });

      expect(mockOnLabelsChange).toHaveBeenCalledWith([]);
    });
  });

  describe('Create Label', () => {
    it('should create label and close dialog', () => {
      const { result } = renderHook(() =>
        useLabelManagement({
          selectedLabels: mockSelectedLabels,
          onLabelsChange: mockOnLabelsChange,
        })
      );

      act(() => {
        result.current.handleAddDialogOpen();
      });

      expect(result.current.isAddDialogOpen).toBe(true);

      act(() => {
        result.current.handleLabelCreated({
          name: 'New Label',
          color: '#ff0000',
        });
      });

      expect(mockCreateLabel).toHaveBeenCalledWith('New Label', '#ff0000');
      expect(result.current.isAddDialogOpen).toBe(false);
    });

    it('should set pending auto-select after creating label', () => {
      const { result } = renderHook(() =>
        useLabelManagement({
          selectedLabels: mockSelectedLabels,
          onLabelsChange: mockOnLabelsChange,
        })
      );

      act(() => {
        result.current.handleLabelCreated({
          name: 'New Label',
          color: '#ff0000',
        });
      });

      expect(mockCreateLabel).toHaveBeenCalledWith('New Label', '#ff0000');
    });

    it('should auto-select newly created label', async () => {
      const newLabel: Label = {
        id: 'label-4',
        name: 'New Label',
        color: '#ff0000',
      };

      const { result, rerender } = renderHook(() =>
        useLabelManagement({
          selectedLabels: mockSelectedLabels,
          onLabelsChange: mockOnLabelsChange,
        })
      );

      act(() => {
        result.current.handleLabelCreated({
          name: 'New Label',
          color: '#ff0000',
        });
      });

      // Simulate label being added to allLabels
      mockGetAllLabels.mockReturnValue([...mockAllLabels, newLabel]);
      rerender();

      await waitFor(() => {
        expect(mockOnLabelsChange).toHaveBeenCalledWith([newLabel]);
      });
    });

    it('should not auto-select if label already selected', async () => {
      const newLabel: Label = {
        id: 'label-4',
        name: 'New Label',
        color: '#ff0000',
      };

      const { result, rerender } = renderHook(() =>
        useLabelManagement({
          selectedLabels: [newLabel],
          onLabelsChange: mockOnLabelsChange,
        })
      );

      act(() => {
        result.current.handleLabelCreated({
          name: 'New Label',
          color: '#ff0000',
        });
      });

      mockGetAllLabels.mockReturnValue([...mockAllLabels, newLabel]);
      rerender();

      await waitFor(() => {
        expect(mockOnLabelsChange).not.toHaveBeenCalled();
      });
    });
  });

  describe('Copy and Select Label', () => {
    it('should copy label to current board', () => {
      const labelToCopy = mockAllLabels[2]!;

      const { result } = renderHook(() =>
        useLabelManagement({
          selectedLabels: mockSelectedLabels,
          onLabelsChange: mockOnLabelsChange,
        })
      );

      act(() => {
        result.current.handleCopyAndSelectLabel(labelToCopy);
      });

      expect(mockCopyLabelToCurrentBoard).toHaveBeenCalledWith(labelToCopy);
    });

    it('should auto-select copied label', async () => {
      const labelToCopy = mockAllLabels[2]!;
      const copiedLabel: Label = {
        id: 'label-4',
        name: labelToCopy.name,
        color: labelToCopy.color,
      };

      const { result, rerender } = renderHook(() =>
        useLabelManagement({
          selectedLabels: mockSelectedLabels,
          onLabelsChange: mockOnLabelsChange,
        })
      );

      act(() => {
        result.current.handleCopyAndSelectLabel(labelToCopy);
      });

      // Simulate copied label being added
      mockGetAllLabels.mockReturnValue([...mockAllLabels, copiedLabel]);
      rerender();

      await waitFor(() => {
        expect(mockOnLabelsChange).toHaveBeenCalledWith([copiedLabel]);
      });
    });

    it('should set pending auto-select with correct name and color', () => {
      const labelToCopy = mockAllLabels[2]!;

      const { result } = renderHook(() =>
        useLabelManagement({
          selectedLabels: mockSelectedLabels,
          onLabelsChange: mockOnLabelsChange,
        })
      );

      act(() => {
        result.current.handleCopyAndSelectLabel(labelToCopy);
      });

      expect(mockCopyLabelToCurrentBoard).toHaveBeenCalledWith(labelToCopy);
    });
  });

  describe('All Labels Access', () => {
    it('should provide access to all labels', () => {
      const { result } = renderHook(() =>
        useLabelManagement({
          selectedLabels: mockSelectedLabels,
          onLabelsChange: mockOnLabelsChange,
        })
      );

      expect(result.current.allLabels).toEqual(mockAllLabels);
    });

    it('should update when getAllLabels returns new data', () => {
      const { result, rerender } = renderHook(() =>
        useLabelManagement({
          selectedLabels: mockSelectedLabels,
          onLabelsChange: mockOnLabelsChange,
        })
      );

      expect(result.current.allLabels).toHaveLength(3);

      const newLabels = [
        ...mockAllLabels,
        { id: 'label-4', name: 'New', color: '#000000' },
      ];
      mockGetAllLabels.mockReturnValue(newLabels);
      rerender();

      expect(result.current.allLabels).toHaveLength(4);
    });
  });

  describe('Selected Label IDs', () => {
    it('should track selected label IDs', () => {
      const selectedLabels = [mockAllLabels[0]!, mockAllLabels[1]!];

      const { result } = renderHook(() =>
        useLabelManagement({
          selectedLabels,
          onLabelsChange: mockOnLabelsChange,
        })
      );

      expect(result.current.selectedLabelIds.has('label-1')).toBe(true);
      expect(result.current.selectedLabelIds.has('label-2')).toBe(true);
      expect(result.current.selectedLabelIds.has('label-3')).toBe(false);
    });

    it('should update when selection changes', () => {
      const { result, rerender } = renderHook(
        ({ selectedLabels }) =>
          useLabelManagement({
            selectedLabels,
            onLabelsChange: mockOnLabelsChange,
          }),
        {
          initialProps: { selectedLabels: [mockAllLabels[0]!] },
        }
      );

      expect(result.current.selectedLabelIds.has('label-1')).toBe(true);
      expect(result.current.selectedLabelIds.has('label-2')).toBe(false);

      rerender({ selectedLabels: [mockAllLabels[0]!, mockAllLabels[1]!] });

      expect(result.current.selectedLabelIds.has('label-2')).toBe(true);
    });
  });

  describe('Edge Cases', () => {
    it('should handle rapid dialog open/close', () => {
      const { result } = renderHook(() =>
        useLabelManagement({
          selectedLabels: mockSelectedLabels,
          onLabelsChange: mockOnLabelsChange,
        })
      );

      act(() => {
        result.current.handleAddDialogOpen();
        result.current.handleAddDialogClose();
        result.current.handleAddDialogOpen();
      });

      expect(result.current.isAddDialogOpen).toBe(true);
    });

    it('should handle multiple label toggles', () => {
      const { result } = renderHook(() =>
        useLabelManagement({
          selectedLabels: [],
          onLabelsChange: mockOnLabelsChange,
        })
      );

      act(() => {
        result.current.toggleLabel(mockAllLabels[0]!);
        result.current.toggleLabel(mockAllLabels[1]!);
        result.current.toggleLabel(mockAllLabels[0]!);
      });

      expect(mockOnLabelsChange).toHaveBeenCalledTimes(3);
    });

    it('should handle simultaneous create and copy operations', async () => {
      const { result, rerender } = renderHook(() =>
        useLabelManagement({
          selectedLabels: mockSelectedLabels,
          onLabelsChange: mockOnLabelsChange,
        })
      );

      act(() => {
        result.current.handleLabelCreated({
          name: 'Created Label',
          color: '#ff0000',
        });
        result.current.handleCopyAndSelectLabel(mockAllLabels[2]!);
      });

      const newLabels = [
        ...mockAllLabels,
        { id: 'label-4', name: 'Created Label', color: '#ff0000' },
        { id: 'label-5', name: 'Documentation', color: '#22863a' },
      ];
      mockGetAllLabels.mockReturnValue(newLabels);
      rerender();

      await waitFor(() => {
        expect(mockOnLabelsChange).toHaveBeenCalled();
      });
    });

    it('should preserve selected labels ref stability', () => {
      const { result, rerender } = renderHook(
        ({ selectedLabels }) =>
          useLabelManagement({
            selectedLabels,
            onLabelsChange: mockOnLabelsChange,
          }),
        {
          initialProps: { selectedLabels: [mockAllLabels[0]!] },
        }
      );

      const firstToggle = result.current.toggleLabel;

      rerender({ selectedLabels: [mockAllLabels[0]!, mockAllLabels[1]!] });

      expect(result.current.toggleLabel).toBe(firstToggle);
    });
  });
});
