import { renderHook, act } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useLabelSort } from './useLabelSort';

describe('useLabelSort', () => {
  it('should initialize with default values', () => {
    const { result } = renderHook(() => useLabelSort());

    expect(result.current.sortField).toBe('name');
    expect(result.current.sortDirection).toBe('asc');
    expect(typeof result.current.handleSort).toBe('function');
  });

  it('should toggle sort direction when clicking the same field', () => {
    const { result } = renderHook(() => useLabelSort());

    // Click name field (already selected, should toggle direction)
    act(() => {
      result.current.handleSort('name');
    });

    expect(result.current.sortField).toBe('name');
    expect(result.current.sortDirection).toBe('desc');

    // Click again to toggle back
    act(() => {
      result.current.handleSort('name');
    });

    expect(result.current.sortField).toBe('name');
    expect(result.current.sortDirection).toBe('asc');
  });

  it('should change sort field and reset to asc when clicking a different field', () => {
    const { result } = renderHook(() => useLabelSort());

    // First toggle name to desc
    act(() => {
      result.current.handleSort('name');
    });
    expect(result.current.sortDirection).toBe('desc');

    // Click boardName field
    act(() => {
      result.current.handleSort('boardName');
    });

    expect(result.current.sortField).toBe('boardName');
    expect(result.current.sortDirection).toBe('asc');
  });

  it('should handle usageCount field', () => {
    const { result } = renderHook(() => useLabelSort());

    act(() => {
      result.current.handleSort('usageCount');
    });

    expect(result.current.sortField).toBe('usageCount');
    expect(result.current.sortDirection).toBe('asc');

    // Toggle direction
    act(() => {
      result.current.handleSort('usageCount');
    });

    expect(result.current.sortDirection).toBe('desc');
  });

  it('should maintain correct state through multiple field changes', () => {
    const { result } = renderHook(() => useLabelSort());

    // name -> boardName
    act(() => {
      result.current.handleSort('boardName');
    });
    expect(result.current.sortField).toBe('boardName');
    expect(result.current.sortDirection).toBe('asc');

    // Toggle boardName
    act(() => {
      result.current.handleSort('boardName');
    });
    expect(result.current.sortDirection).toBe('desc');

    // Switch to usageCount
    act(() => {
      result.current.handleSort('usageCount');
    });
    expect(result.current.sortField).toBe('usageCount');
    expect(result.current.sortDirection).toBe('asc');

    // Back to name
    act(() => {
      result.current.handleSort('name');
    });
    expect(result.current.sortField).toBe('name');
    expect(result.current.sortDirection).toBe('asc');
  });
});
