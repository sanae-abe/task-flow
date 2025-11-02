/**
 * useLabelSelector hook tests
 * ラベル選択・作成機能の包括的テスト
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useLabelSelector } from './useLabelSelector';
import type { Label } from '../types';

// Mock KanbanContext
const mockGetAllLabels = vi.fn();

vi.mock('../contexts/KanbanContext', () => ({
  useKanban: vi.fn(() => ({
    getAllLabels: mockGetAllLabels,
  })),
}));

// Mock labels utility
vi.mock('../utils/labels', () => ({
  LABEL_COLORS: [
    { variant: 'default', name: 'Gray' },
    { variant: 'primary', name: 'Blue' },
    { variant: 'success', name: 'Green' },
  ],
  createLabel: (name: string, color: string) => ({
    id: `label-${Date.now()}`,
    name: name.trim(),
    color,
  }),
}));

describe('useLabelSelector', () => {
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

  const mockLabel3: Label = {
    id: 'label-3',
    name: 'Documentation',
    color: 'default',
  };

  const allLabels = [mockLabel1, mockLabel2, mockLabel3];

  beforeEach(() => {
    // Reset to original labels only (no "NewLabel", no "Label@#$%", etc.)
    mockGetAllLabels.mockReturnValue([...allLabels]);
  });

  describe('Initialization', () => {
    it('should initialize with default state', () => {
      const onLabelsChange = vi.fn();
      const { result } = renderHook(() =>
        useLabelSelector({
          selectedLabels: [],
          onLabelsChange,
        })
      );

      expect(result.current.isCreating).toBe(false);
      expect(result.current.newLabelName).toBe('');
      expect(result.current.selectedColor).toBe('default');
      expect(result.current.isValid).toBe(false);
    });

    it('should provide all available functions', () => {
      const onLabelsChange = vi.fn();
      const { result } = renderHook(() =>
        useLabelSelector({
          selectedLabels: [],
          onLabelsChange,
        })
      );

      expect(typeof result.current.setNewLabelName).toBe('function');
      expect(typeof result.current.setSelectedColor).toBe('function');
      expect(typeof result.current.startCreating).toBe('function');
      expect(typeof result.current.cancelCreating).toBe('function');
      expect(typeof result.current.createNewLabel).toBe('function');
      expect(typeof result.current.removeLabel).toBe('function');
      expect(typeof result.current.handleKeyDown).toBe('function');
      expect(typeof result.current.addSuggestedLabel).toBe('function');
    });
  });

  describe('startCreating', () => {
    it('should set isCreating to true', () => {
      const onLabelsChange = vi.fn();
      const { result } = renderHook(() =>
        useLabelSelector({
          selectedLabels: [],
          onLabelsChange,
        })
      );

      act(() => {
        result.current.startCreating();
      });

      expect(result.current.isCreating).toBe(true);
    });

    it('should reset newLabelName and selectedColor', () => {
      const onLabelsChange = vi.fn();
      const { result } = renderHook(() =>
        useLabelSelector({
          selectedLabels: [],
          onLabelsChange,
        })
      );

      // Set some values
      act(() => {
        result.current.setNewLabelName('Test');
        result.current.setSelectedColor('primary');
      });

      // Start creating again
      act(() => {
        result.current.startCreating();
      });

      expect(result.current.newLabelName).toBe('');
      expect(result.current.selectedColor).toBe('default');
    });
  });

  describe('cancelCreating', () => {
    it('should set isCreating to false', () => {
      const onLabelsChange = vi.fn();
      const { result } = renderHook(() =>
        useLabelSelector({
          selectedLabels: [],
          onLabelsChange,
        })
      );

      act(() => {
        result.current.startCreating();
      });

      expect(result.current.isCreating).toBe(true);

      act(() => {
        result.current.cancelCreating();
      });

      expect(result.current.isCreating).toBe(false);
    });

    it('should reset newLabelName', () => {
      const onLabelsChange = vi.fn();
      const { result } = renderHook(() =>
        useLabelSelector({
          selectedLabels: [],
          onLabelsChange,
        })
      );

      act(() => {
        result.current.startCreating();
        result.current.setNewLabelName('Test Label');
      });

      act(() => {
        result.current.cancelCreating();
      });

      expect(result.current.newLabelName).toBe('');
    });
  });

  describe('setNewLabelName', () => {
    it('should update newLabelName', () => {
      const onLabelsChange = vi.fn();
      const { result } = renderHook(() =>
        useLabelSelector({
          selectedLabels: [],
          onLabelsChange,
        })
      );

      act(() => {
        result.current.setNewLabelName('New Label');
      });

      expect(result.current.newLabelName).toBe('New Label');
    });

    it('should update isValid based on name length', () => {
      const onLabelsChange = vi.fn();
      const { result } = renderHook(() =>
        useLabelSelector({
          selectedLabels: [],
          onLabelsChange,
        })
      );

      // Less than 2 characters
      act(() => {
        result.current.setNewLabelName('A');
      });
      expect(result.current.isValid).toBe(false);

      // 2 or more characters
      act(() => {
        result.current.setNewLabelName('Ab');
      });
      expect(result.current.isValid).toBe(true);
    });

    it('should trim whitespace for validation', () => {
      const onLabelsChange = vi.fn();
      const { result } = renderHook(() =>
        useLabelSelector({
          selectedLabels: [],
          onLabelsChange,
        })
      );

      // Whitespace-only should be invalid
      act(() => {
        result.current.setNewLabelName('   ');
      });
      expect(result.current.isValid).toBe(false);

      // With content after trim
      act(() => {
        result.current.setNewLabelName('  AB  ');
      });
      expect(result.current.isValid).toBe(true);
    });
  });

  describe('setSelectedColor', () => {
    it('should update selectedColor', () => {
      const onLabelsChange = vi.fn();
      const { result } = renderHook(() =>
        useLabelSelector({
          selectedLabels: [],
          onLabelsChange,
        })
      );

      act(() => {
        result.current.setSelectedColor('primary');
      });

      expect(result.current.selectedColor).toBe('primary');
    });
  });

  describe('isValid (validation)', () => {
    it('should be false for names shorter than 2 characters', () => {
      const onLabelsChange = vi.fn();
      const { result } = renderHook(() =>
        useLabelSelector({
          selectedLabels: [],
          onLabelsChange,
        })
      );

      act(() => {
        result.current.setNewLabelName('A');
      });

      expect(result.current.isValid).toBe(false);
    });

    it('should be false for duplicate names (case-insensitive)', () => {
      const onLabelsChange = vi.fn();
      const { result } = renderHook(() =>
        useLabelSelector({
          selectedLabels: [],
          onLabelsChange,
        })
      );

      // "Bug" already exists in allLabels
      act(() => {
        result.current.setNewLabelName('bug');
      });

      expect(result.current.isValid).toBe(false);

      act(() => {
        result.current.setNewLabelName('BUG');
      });

      expect(result.current.isValid).toBe(false);
    });

    it('should be true for unique names with 2+ characters', () => {
      const onLabelsChange = vi.fn();
      const { result } = renderHook(() =>
        useLabelSelector({
          selectedLabels: [],
          onLabelsChange,
        })
      );

      act(() => {
        result.current.setNewLabelName('NewLabel');
      });

      expect(result.current.isValid).toBe(true);
    });
  });

  describe('createNewLabel', () => {
    it('should create new label and call onLabelsChange', () => {
      const onLabelsChange = vi.fn();
      const { result } = renderHook(() =>
        useLabelSelector({
          selectedLabels: [],
          onLabelsChange,
        })
      );

      // Check preconditions
      const allLabelsSnapshot = mockGetAllLabels();
      const hasNewLabel = allLabelsSnapshot.some(
        l => l.name.toLowerCase() === 'newlabel'
      );
      expect(hasNewLabel).toBe(false); // Ensure "NewLabel" doesn't exist

      act(() => {
        result.current.setNewLabelName('NewLabel');
        result.current.setSelectedColor('primary');
      });

      // Check validation before creating
      expect(result.current.isValid).toBe(true);
      expect(result.current.newLabelName).toBe('NewLabel');

      act(() => {
        result.current.createNewLabel();
      });

      expect(onLabelsChange).toHaveBeenCalledTimes(1);
      const callArg = onLabelsChange.mock.calls[0][0];
      expect(callArg).toHaveLength(1);
      expect(callArg[0]).toMatchObject({
        name: 'NewLabel',
        color: 'primary',
      });
    });

    it('should append to existing selectedLabels', () => {
      const onLabelsChange = vi.fn();
      const existingLabels = [mockLabel1];

      const { result} = renderHook(() =>
        useLabelSelector({
          selectedLabels: existingLabels,
          onLabelsChange,
        })
      );

      act(() => {
        result.current.setNewLabelName('NewLabel');
      });

      // Check validation before creating
      expect(result.current.isValid).toBe(true);

      act(() => {
        result.current.createNewLabel();
      });

      expect(onLabelsChange).toHaveBeenCalledTimes(1);
      const callArg = onLabelsChange.mock.calls[0][0];
      expect(callArg).toHaveLength(2);
      expect(callArg[0]).toBe(mockLabel1);
      expect(callArg[1]).toMatchObject({ name: 'NewLabel' });
    });

    it('should not create label with name shorter than 2 characters', () => {
      const onLabelsChange = vi.fn();
      const { result } = renderHook(() =>
        useLabelSelector({
          selectedLabels: [],
          onLabelsChange,
        })
      );

      act(() => {
        result.current.setNewLabelName('A');
        result.current.createNewLabel();
      });

      expect(onLabelsChange).not.toHaveBeenCalled();
    });

    it('should not create label with duplicate name', () => {
      const onLabelsChange = vi.fn();
      const { result } = renderHook(() =>
        useLabelSelector({
          selectedLabels: [],
          onLabelsChange,
        })
      );

      // "Bug" already exists
      act(() => {
        result.current.setNewLabelName('bug');
        result.current.createNewLabel();
      });

      expect(onLabelsChange).not.toHaveBeenCalled();
    });

    it('should trim label name before creating', () => {
      const onLabelsChange = vi.fn();
      const { result } = renderHook(() =>
        useLabelSelector({
          selectedLabels: [],
          onLabelsChange,
        })
      );

      act(() => {
        result.current.setNewLabelName('  NewLabel  ');
      });

      expect(result.current.isValid).toBe(true);

      act(() => {
        result.current.createNewLabel();
      });

      expect(onLabelsChange).toHaveBeenCalledTimes(1);
      const callArg = onLabelsChange.mock.calls[0][0];
      expect(callArg[0]).toMatchObject({ name: 'NewLabel' }); // trimmed
    });

    it('should reset state after creating', () => {
      const onLabelsChange = vi.fn();
      const { result } = renderHook(() =>
        useLabelSelector({
          selectedLabels: [],
          onLabelsChange,
        })
      );

      act(() => {
        result.current.setNewLabelName('NewLabel');
      });

      expect(result.current.isValid).toBe(true);

      act(() => {
        result.current.createNewLabel();
      });

      // Verify onLabelsChange was called
      expect(onLabelsChange).toHaveBeenCalledTimes(1);

      // After createNewLabel succeeds, cancelCreating() is called which resets newLabelName
      expect(result.current.newLabelName).toBe('');
      expect(result.current.isCreating).toBe(false);
    });
  });

  describe('removeLabel', () => {
    it('should remove label by id', () => {
      const onLabelsChange = vi.fn();
      const selectedLabels = [mockLabel1, mockLabel2];

      const { result } = renderHook(() =>
        useLabelSelector({
          selectedLabels,
          onLabelsChange,
        })
      );

      act(() => {
        result.current.removeLabel('label-1');
      });

      expect(onLabelsChange).toHaveBeenCalledWith([mockLabel2]);
    });

    it('should handle removing non-existent label gracefully', () => {
      const onLabelsChange = vi.fn();
      const selectedLabels = [mockLabel1];

      const { result } = renderHook(() =>
        useLabelSelector({
          selectedLabels,
          onLabelsChange,
        })
      );

      act(() => {
        result.current.removeLabel('non-existent-id');
      });

      expect(onLabelsChange).toHaveBeenCalledWith([mockLabel1]);
    });

    it('should handle empty selectedLabels', () => {
      const onLabelsChange = vi.fn();
      const { result } = renderHook(() =>
        useLabelSelector({
          selectedLabels: [],
          onLabelsChange,
        })
      );

      act(() => {
        result.current.removeLabel('label-1');
      });

      expect(onLabelsChange).toHaveBeenCalledWith([]);
    });
  });

  describe('handleKeyDown', () => {
    it('should cancel creating on Escape key', () => {
      const onLabelsChange = vi.fn();
      const { result } = renderHook(() =>
        useLabelSelector({
          selectedLabels: [],
          onLabelsChange,
        })
      );

      act(() => {
        result.current.startCreating();
      });

      expect(result.current.isCreating).toBe(true);

      const escapeEvent = {
        key: 'Escape',
        preventDefault: vi.fn(),
      } as unknown as React.KeyboardEvent;

      act(() => {
        result.current.handleKeyDown(escapeEvent);
      });

      expect(escapeEvent.preventDefault).toHaveBeenCalled();
      expect(result.current.isCreating).toBe(false);
    });

    it('should prevent Enter key default but not create label', () => {
      const onLabelsChange = vi.fn();
      const { result } = renderHook(() =>
        useLabelSelector({
          selectedLabels: [],
          onLabelsChange,
        })
      );

      act(() => {
        result.current.setNewLabelName('ValidLabel');
      });

      const enterEvent = {
        key: 'Enter',
        preventDefault: vi.fn(),
      } as unknown as React.KeyboardEvent;

      act(() => {
        result.current.handleKeyDown(enterEvent);
      });

      expect(enterEvent.preventDefault).toHaveBeenCalled();
      // Enter key does NOT auto-create (as per implementation)
      expect(onLabelsChange).not.toHaveBeenCalled();
    });

    it('should handle other keys without action', () => {
      const onLabelsChange = vi.fn();
      const { result } = renderHook(() =>
        useLabelSelector({
          selectedLabels: [],
          onLabelsChange,
        })
      );

      const otherEvent = {
        key: 'A',
        preventDefault: vi.fn(),
      } as unknown as React.KeyboardEvent;

      act(() => {
        result.current.handleKeyDown(otherEvent);
      });

      // No action for other keys
      expect(otherEvent.preventDefault).not.toHaveBeenCalled();
    });
  });

  describe('suggestions', () => {
    it('should return all labels when none are selected', () => {
      const onLabelsChange = vi.fn();
      const { result } = renderHook(() =>
        useLabelSelector({
          selectedLabels: [],
          onLabelsChange,
        })
      );

      expect(result.current.suggestions).toHaveLength(3);
      expect(result.current.suggestions).toEqual(allLabels);
    });

    it('should exclude selected labels from suggestions', () => {
      const onLabelsChange = vi.fn();
      const { result } = renderHook(() =>
        useLabelSelector({
          selectedLabels: [mockLabel1],
          onLabelsChange,
        })
      );

      expect(result.current.suggestions).toHaveLength(2);
      expect(result.current.suggestions).toEqual([mockLabel2, mockLabel3]);
    });

    it('should return empty array when all labels are selected', () => {
      const onLabelsChange = vi.fn();
      const { result } = renderHook(() =>
        useLabelSelector({
          selectedLabels: allLabels,
          onLabelsChange,
        })
      );

      expect(result.current.suggestions).toHaveLength(0);
    });

    it('should be case-insensitive when filtering', () => {
      const onLabelsChange = vi.fn();
      const upperCaseLabel = { ...mockLabel1, name: 'BUG' };

      const { result } = renderHook(() =>
        useLabelSelector({
          selectedLabels: [upperCaseLabel],
          onLabelsChange,
        })
      );

      // "Bug" should still be filtered out (case-insensitive)
      expect(result.current.suggestions).not.toContainEqual(mockLabel1);
    });
  });

  describe('addSuggestedLabel', () => {
    it('should add suggested label to selectedLabels', () => {
      const onLabelsChange = vi.fn();
      const { result } = renderHook(() =>
        useLabelSelector({
          selectedLabels: [mockLabel1],
          onLabelsChange,
        })
      );

      act(() => {
        result.current.addSuggestedLabel(mockLabel2);
      });

      expect(onLabelsChange).toHaveBeenCalledWith([mockLabel1, mockLabel2]);
    });

    it('should not add label if already selected', () => {
      const onLabelsChange = vi.fn();
      const { result } = renderHook(() =>
        useLabelSelector({
          selectedLabels: [mockLabel1],
          onLabelsChange,
        })
      );

      act(() => {
        result.current.addSuggestedLabel(mockLabel1);
      });

      expect(onLabelsChange).not.toHaveBeenCalled();
    });

    it('should not add label with duplicate name (case-insensitive)', () => {
      const onLabelsChange = vi.fn();
      const upperCaseLabel = { ...mockLabel1, id: 'label-upper', name: 'BUG' };

      const { result } = renderHook(() =>
        useLabelSelector({
          selectedLabels: [mockLabel1],
          onLabelsChange,
        })
      );

      act(() => {
        result.current.addSuggestedLabel(upperCaseLabel);
      });

      expect(onLabelsChange).not.toHaveBeenCalled();
    });

    it('should handle adding to empty selectedLabels', () => {
      const onLabelsChange = vi.fn();
      const { result } = renderHook(() =>
        useLabelSelector({
          selectedLabels: [],
          onLabelsChange,
        })
      );

      act(() => {
        result.current.addSuggestedLabel(mockLabel1);
      });

      expect(onLabelsChange).toHaveBeenCalledWith([mockLabel1]);
    });
  });

  describe('Edge cases', () => {
    it('should handle getAllLabels returning empty array', () => {
      mockGetAllLabels.mockReturnValue([]);

      const onLabelsChange = vi.fn();
      const { result } = renderHook(() =>
        useLabelSelector({
          selectedLabels: [],
          onLabelsChange,
        })
      );

      expect(result.current.suggestions).toHaveLength(0);
    });

    it('should handle whitespace-only label name', () => {
      const onLabelsChange = vi.fn();
      const { result } = renderHook(() =>
        useLabelSelector({
          selectedLabels: [],
          onLabelsChange,
        })
      );

      act(() => {
        result.current.setNewLabelName('   ');
        result.current.createNewLabel();
      });

      expect(onLabelsChange).not.toHaveBeenCalled();
    });

    it('should handle special characters in label names', () => {
      const onLabelsChange = vi.fn();
      const { result } = renderHook(() =>
        useLabelSelector({
          selectedLabels: [],
          onLabelsChange,
        })
      );

      act(() => {
        result.current.setNewLabelName('Label@#$%');
      });

      expect(result.current.isValid).toBe(true);

      act(() => {
        result.current.createNewLabel();
      });

      expect(onLabelsChange).toHaveBeenCalledTimes(1);
      const callArg = onLabelsChange.mock.calls[0][0];
      expect(callArg[0]).toMatchObject({ name: 'Label@#$%' });
    });

    it('should handle very long label names', () => {
      const onLabelsChange = vi.fn();
      const longName = 'A'.repeat(100);

      const { result } = renderHook(() =>
        useLabelSelector({
          selectedLabels: [],
          onLabelsChange,
        })
      );

      act(() => {
        result.current.setNewLabelName(longName);
      });

      expect(result.current.isValid).toBe(true);

      act(() => {
        result.current.createNewLabel();
      });

      expect(onLabelsChange).toHaveBeenCalledTimes(1);
      const callArg = onLabelsChange.mock.calls[0][0];
      expect(callArg[0]).toMatchObject({ name: longName });
    });
  });

  describe('Callback stability', () => {
    it('should maintain function references when props unchanged', () => {
      const onLabelsChange = vi.fn();
      const { result, rerender } = renderHook(
        ({ selectedLabels, onChange }) =>
          useLabelSelector({
            selectedLabels,
            onLabelsChange: onChange,
          }),
        {
          initialProps: { selectedLabels: [], onChange: onLabelsChange },
        }
      );

      const firstFunctions = {
        startCreating: result.current.startCreating,
        cancelCreating: result.current.cancelCreating,
        createNewLabel: result.current.createNewLabel,
        removeLabel: result.current.removeLabel,
        handleKeyDown: result.current.handleKeyDown,
        addSuggestedLabel: result.current.addSuggestedLabel,
      };

      // Rerender with same props
      rerender({ selectedLabels: [], onChange: onLabelsChange });

      // These callbacks depend on selectedLabels, so they will change
      // when selectedLabels reference changes (even if it's empty array)
      // Only callbacks that don't depend on selectedLabels are stable
      expect(result.current.startCreating).toBe(firstFunctions.startCreating);
      expect(result.current.cancelCreating).toBe(
        firstFunctions.cancelCreating
      );
      expect(result.current.handleKeyDown).toBe(firstFunctions.handleKeyDown);
    });
  });
});
