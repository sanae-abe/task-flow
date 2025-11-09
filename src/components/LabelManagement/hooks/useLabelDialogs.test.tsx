import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useLabelDialogs } from './useLabelDialogs';
import type { LabelWithInfo, LabelFormData } from '../../../types/labelManagement';

// Mock useLabel context
const mockCreateLabel = vi.fn();
const mockCreateLabelInBoard = vi.fn();
const mockUpdateLabel = vi.fn();
const mockDeleteLabelFromAllBoards = vi.fn();
const mockSetMessageCallback = vi.fn();

vi.mock('../../../contexts/LabelContext', () => ({
  useLabel: () => ({
    createLabel: mockCreateLabel,
    createLabelInBoard: mockCreateLabelInBoard,
    updateLabel: mockUpdateLabel,
    deleteLabelFromAllBoards: mockDeleteLabelFromAllBoards,
    setMessageCallback: mockSetMessageCallback,
  }),
}));

describe('useLabelDialogs', () => {
  const mockLabel: LabelWithInfo = {
    id: 'label-1',
    name: 'Test Label',
    color: 'blue',
    boardName: 'Test Board',
    usageCount: 5,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should initialize with default state', () => {
    const { result } = renderHook(() => useLabelDialogs());

    expect(result.current.editDialog.isOpen).toBe(false);
    expect(result.current.editDialog.label).toBeNull();
    expect(result.current.editDialog.mode).toBe('create');

    expect(result.current.deleteDialog.isOpen).toBe(false);
    expect(result.current.deleteDialog.label).toBeNull();
  });

  it('should set message callback on mount and clear on unmount', () => {
    const onMessage = vi.fn();
    const { unmount } = renderHook(() => useLabelDialogs(onMessage));

    expect(mockSetMessageCallback).toHaveBeenCalledWith(onMessage);

    unmount();

    expect(mockSetMessageCallback).toHaveBeenCalledWith(null);
  });

  it('should open edit dialog with correct label and mode', () => {
    const { result } = renderHook(() => useLabelDialogs());

    act(() => {
      result.current.handleEdit(mockLabel);
    });

    expect(result.current.editDialog.isOpen).toBe(true);
    expect(result.current.editDialog.label).toEqual(mockLabel);
    expect(result.current.editDialog.mode).toBe('edit');
  });

  it('should open create dialog with correct state', () => {
    const { result } = renderHook(() => useLabelDialogs());

    act(() => {
      result.current.handleCreate();
    });

    expect(result.current.editDialog.isOpen).toBe(true);
    expect(result.current.editDialog.label).toBeNull();
    expect(result.current.editDialog.mode).toBe('create');
  });

  it('should open delete dialog with correct label', () => {
    const { result } = renderHook(() => useLabelDialogs());

    act(() => {
      result.current.handleDelete(mockLabel);
    });

    expect(result.current.deleteDialog.isOpen).toBe(true);
    expect(result.current.deleteDialog.label).toEqual(mockLabel);
  });

  it('should close edit dialog and reset state', () => {
    const { result } = renderHook(() => useLabelDialogs());

    // Open edit dialog first
    act(() => {
      result.current.handleEdit(mockLabel);
    });

    // Close it
    act(() => {
      result.current.handleCloseEditDialog();
    });

    expect(result.current.editDialog.isOpen).toBe(false);
    expect(result.current.editDialog.label).toBeNull();
    expect(result.current.editDialog.mode).toBe('create');
  });

  it('should close delete dialog and reset state', () => {
    const { result } = renderHook(() => useLabelDialogs());

    // Open delete dialog first
    act(() => {
      result.current.handleDelete(mockLabel);
    });

    // Close it
    act(() => {
      result.current.handleCloseDeleteDialog();
    });

    expect(result.current.deleteDialog.isOpen).toBe(false);
    expect(result.current.deleteDialog.label).toBeNull();
  });

  it('should create label in current board when no boardId specified', () => {
    const { result } = renderHook(() => useLabelDialogs());

    // Open create dialog
    act(() => {
      result.current.handleCreate();
    });

    const labelData: LabelFormData = {
      name: 'New Label',
      color: 'red',
    };

    // Save label
    act(() => {
      result.current.handleSave(labelData);
    });

    expect(mockCreateLabel).toHaveBeenCalledWith('New Label', 'red');
    expect(mockCreateLabelInBoard).not.toHaveBeenCalled();
    expect(result.current.editDialog.isOpen).toBe(false);
  });

  it('should create label in specified board when boardId provided', () => {
    const { result } = renderHook(() => useLabelDialogs());

    // Open create dialog
    act(() => {
      result.current.handleCreate();
    });

    const labelData: LabelFormData = {
      name: 'New Label',
      color: 'green',
      boardId: 'board-123',
    };

    // Save label
    act(() => {
      result.current.handleSave(labelData);
    });

    expect(mockCreateLabelInBoard).toHaveBeenCalledWith('New Label', 'green', 'board-123');
    expect(mockCreateLabel).not.toHaveBeenCalled();
    expect(result.current.editDialog.isOpen).toBe(false);
  });

  it('should update label when in edit mode', () => {
    const { result } = renderHook(() => useLabelDialogs());

    // Open edit dialog
    act(() => {
      result.current.handleEdit(mockLabel);
    });

    const labelData: LabelFormData = {
      name: 'Updated Label',
      color: 'purple',
    };

    // Save label
    act(() => {
      result.current.handleSave(labelData);
    });

    expect(mockUpdateLabel).toHaveBeenCalledWith('label-1', labelData);
    expect(mockCreateLabel).not.toHaveBeenCalled();
    expect(mockCreateLabelInBoard).not.toHaveBeenCalled();
    expect(result.current.editDialog.isOpen).toBe(false);
  });

  it('should confirm delete and close dialog', () => {
    const { result } = renderHook(() => useLabelDialogs());

    // Open delete dialog
    act(() => {
      result.current.handleDelete(mockLabel);
    });

    // Confirm delete
    act(() => {
      result.current.handleConfirmDelete();
    });

    expect(mockDeleteLabelFromAllBoards).toHaveBeenCalledWith('label-1');
    expect(result.current.deleteDialog.isOpen).toBe(false);
  });

  it('should not delete if no label is set', () => {
    const { result } = renderHook(() => useLabelDialogs());

    // Try to confirm delete without opening dialog
    act(() => {
      result.current.handleConfirmDelete();
    });

    expect(mockDeleteLabelFromAllBoards).not.toHaveBeenCalled();
  });

  it('should handle message callback updates', () => {
    const onMessage1 = vi.fn();
    const { rerender } = renderHook(
      ({ onMessage }) => useLabelDialogs(onMessage),
      { initialProps: { onMessage: onMessage1 } }
    );

    expect(mockSetMessageCallback).toHaveBeenCalledWith(onMessage1);

    const onMessage2 = vi.fn();
    rerender({ onMessage: onMessage2 });

    expect(mockSetMessageCallback).toHaveBeenCalledWith(onMessage2);
  });

  it('should return all required methods and state', () => {
    const { result } = renderHook(() => useLabelDialogs());

    expect(result.current).toHaveProperty('editDialog');
    expect(result.current).toHaveProperty('deleteDialog');
    expect(result.current).toHaveProperty('handleEdit');
    expect(result.current).toHaveProperty('handleCreate');
    expect(result.current).toHaveProperty('handleDelete');
    expect(result.current).toHaveProperty('handleCloseEditDialog');
    expect(result.current).toHaveProperty('handleCloseDeleteDialog');
    expect(result.current).toHaveProperty('handleSave');
    expect(result.current).toHaveProperty('handleConfirmDelete');
  });
});
