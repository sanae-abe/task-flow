import { renderHook } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useLabelData } from './useLabelData';

// Mock useLabel context
const mockGetAllLabelsWithBoardInfo = vi.fn();
const mockGetAllLabelUsageCount = vi.fn();

vi.mock('../../../contexts/LabelContext', () => ({
  useLabel: () => ({
    getAllLabelsWithBoardInfo: mockGetAllLabelsWithBoardInfo,
    getAllLabelUsageCount: mockGetAllLabelUsageCount,
  }),
}));

describe('useLabelData', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return empty array when no labels exist', () => {
    mockGetAllLabelsWithBoardInfo.mockReturnValue([]);

    const { result } = renderHook(() => useLabelData('name', 'asc'));

    expect(result.current.allLabelsWithInfo).toEqual([]);
  });

  it('should sort labels by name in ascending order', () => {
    mockGetAllLabelsWithBoardInfo.mockReturnValue([
      { id: '1', name: 'Zebra', color: 'red', boardName: 'Board A' },
      { id: '2', name: 'Apple', color: 'blue', boardName: 'Board B' },
      { id: '3', name: 'Mango', color: 'green', boardName: 'Board C' },
    ]);
    mockGetAllLabelUsageCount.mockReturnValue(0);

    const { result } = renderHook(() => useLabelData('name', 'asc'));

    expect(result.current.allLabelsWithInfo[0].name).toBe('Apple');
    expect(result.current.allLabelsWithInfo[1].name).toBe('Mango');
    expect(result.current.allLabelsWithInfo[2].name).toBe('Zebra');
  });

  it('should sort labels by name in descending order', () => {
    mockGetAllLabelsWithBoardInfo.mockReturnValue([
      { id: '1', name: 'Zebra', color: 'red', boardName: 'Board A' },
      { id: '2', name: 'Apple', color: 'blue', boardName: 'Board B' },
      { id: '3', name: 'Mango', color: 'green', boardName: 'Board C' },
    ]);
    mockGetAllLabelUsageCount.mockReturnValue(0);

    const { result } = renderHook(() => useLabelData('name', 'desc'));

    expect(result.current.allLabelsWithInfo[0].name).toBe('Zebra');
    expect(result.current.allLabelsWithInfo[1].name).toBe('Mango');
    expect(result.current.allLabelsWithInfo[2].name).toBe('Apple');
  });

  it('should sort labels by boardName in ascending order', () => {
    mockGetAllLabelsWithBoardInfo.mockReturnValue([
      { id: '1', name: 'Label1', color: 'red', boardName: 'Zebra Board' },
      { id: '2', name: 'Label2', color: 'blue', boardName: 'Apple Board' },
      { id: '3', name: 'Label3', color: 'green', boardName: 'Mango Board' },
    ]);
    mockGetAllLabelUsageCount.mockReturnValue(0);

    const { result } = renderHook(() => useLabelData('boardName', 'asc'));

    expect(result.current.allLabelsWithInfo[0].boardName).toBe('Apple Board');
    expect(result.current.allLabelsWithInfo[1].boardName).toBe('Mango Board');
    expect(result.current.allLabelsWithInfo[2].boardName).toBe('Zebra Board');
  });

  it('should sort labels by boardName in descending order', () => {
    mockGetAllLabelsWithBoardInfo.mockReturnValue([
      { id: '1', name: 'Label1', color: 'red', boardName: 'Zebra Board' },
      { id: '2', name: 'Label2', color: 'blue', boardName: 'Apple Board' },
      { id: '3', name: 'Label3', color: 'green', boardName: 'Mango Board' },
    ]);
    mockGetAllLabelUsageCount.mockReturnValue(0);

    const { result } = renderHook(() => useLabelData('boardName', 'desc'));

    expect(result.current.allLabelsWithInfo[0].boardName).toBe('Zebra Board');
    expect(result.current.allLabelsWithInfo[1].boardName).toBe('Mango Board');
    expect(result.current.allLabelsWithInfo[2].boardName).toBe('Apple Board');
  });

  it('should sort labels by usageCount in ascending order', () => {
    mockGetAllLabelsWithBoardInfo.mockReturnValue([
      { id: '1', name: 'Label1', color: 'red', boardName: 'Board A' },
      { id: '2', name: 'Label2', color: 'blue', boardName: 'Board B' },
      { id: '3', name: 'Label3', color: 'green', boardName: 'Board C' },
    ]);
    mockGetAllLabelUsageCount.mockImplementation((id: string) => {
      const counts: Record<string, number> = { '1': 10, '2': 5, '3': 15 };
      return counts[id] || 0;
    });

    const { result } = renderHook(() => useLabelData('usageCount', 'asc'));

    expect(result.current.allLabelsWithInfo[0].usageCount).toBe(5);
    expect(result.current.allLabelsWithInfo[1].usageCount).toBe(10);
    expect(result.current.allLabelsWithInfo[2].usageCount).toBe(15);
  });

  it('should sort labels by usageCount in descending order', () => {
    mockGetAllLabelsWithBoardInfo.mockReturnValue([
      { id: '1', name: 'Label1', color: 'red', boardName: 'Board A' },
      { id: '2', name: 'Label2', color: 'blue', boardName: 'Board B' },
      { id: '3', name: 'Label3', color: 'green', boardName: 'Board C' },
    ]);
    mockGetAllLabelUsageCount.mockImplementation((id: string) => {
      const counts: Record<string, number> = { '1': 10, '2': 5, '3': 15 };
      return counts[id] || 0;
    });

    const { result } = renderHook(() => useLabelData('usageCount', 'desc'));

    expect(result.current.allLabelsWithInfo[0].usageCount).toBe(15);
    expect(result.current.allLabelsWithInfo[1].usageCount).toBe(10);
    expect(result.current.allLabelsWithInfo[2].usageCount).toBe(5);
  });

  it('should add usageCount to labels', () => {
    mockGetAllLabelsWithBoardInfo.mockReturnValue([
      { id: '1', name: 'Label1', color: 'red', boardName: 'Board A' },
    ]);
    mockGetAllLabelUsageCount.mockReturnValue(42);

    const { result } = renderHook(() => useLabelData('name', 'asc'));

    expect(result.current.allLabelsWithInfo[0].usageCount).toBe(42);
  });

  it('should merge duplicate labels from different boards', () => {
    mockGetAllLabelsWithBoardInfo.mockReturnValue([
      { id: '1', name: 'Label1', color: 'red', boardName: 'Board A' },
      { id: '1', name: 'Label1', color: 'red', boardName: 'Board B' },
      { id: '1', name: 'Label1', color: 'red', boardName: 'Board C' },
    ]);
    mockGetAllLabelUsageCount.mockReturnValue(10);

    const { result } = renderHook(() => useLabelData('name', 'asc'));

    expect(result.current.allLabelsWithInfo).toHaveLength(1);
    expect(result.current.allLabelsWithInfo[0].boardName).toBe(
      'Board A, Board B, Board C'
    );
  });

  it('should handle multiple unique and duplicate labels', () => {
    mockGetAllLabelsWithBoardInfo.mockReturnValue([
      { id: '1', name: 'Label1', color: 'red', boardName: 'Board A' },
      { id: '1', name: 'Label1', color: 'red', boardName: 'Board B' },
      { id: '2', name: 'Label2', color: 'blue', boardName: 'Board C' },
      { id: '3', name: 'Label3', color: 'green', boardName: 'Board D' },
      { id: '3', name: 'Label3', color: 'green', boardName: 'Board E' },
    ]);
    mockGetAllLabelUsageCount.mockReturnValue(5);

    const { result } = renderHook(() => useLabelData('name', 'asc'));

    expect(result.current.allLabelsWithInfo).toHaveLength(3);
    expect(result.current.allLabelsWithInfo[0].id).toBe('1');
    expect(result.current.allLabelsWithInfo[0].boardName).toBe(
      'Board A, Board B'
    );
    expect(result.current.allLabelsWithInfo[1].id).toBe('2');
    expect(result.current.allLabelsWithInfo[1].boardName).toBe('Board C');
    expect(result.current.allLabelsWithInfo[2].id).toBe('3');
    expect(result.current.allLabelsWithInfo[2].boardName).toBe(
      'Board D, Board E'
    );
  });

  it('should default to name sorting when sortField is invalid', () => {
    mockGetAllLabelsWithBoardInfo.mockReturnValue([
      { id: '1', name: 'Zebra', color: 'red', boardName: 'Board A' },
      { id: '2', name: 'Apple', color: 'blue', boardName: 'Board B' },
    ]);
    mockGetAllLabelUsageCount.mockReturnValue(0);

    // @ts-expect-error - Testing invalid sortField
    const { result } = renderHook(() => useLabelData('invalid', 'asc'));

    expect(result.current.allLabelsWithInfo[0].name).toBe('Apple');
    expect(result.current.allLabelsWithInfo[1].name).toBe('Zebra');
  });

  it('should re-compute when sort parameters change', () => {
    mockGetAllLabelsWithBoardInfo.mockReturnValue([
      { id: '1', name: 'Zebra', color: 'red', boardName: 'Board A' },
      { id: '2', name: 'Apple', color: 'blue', boardName: 'Board B' },
    ]);
    mockGetAllLabelUsageCount.mockReturnValue(0);

    const { result, rerender } = renderHook(
      ({ sortField, sortDirection }) => useLabelData(sortField, sortDirection),
      {
        initialProps: {
          sortField: 'name' as const,
          sortDirection: 'asc' as const,
        },
      }
    );

    expect(result.current.allLabelsWithInfo[0].name).toBe('Apple');

    rerender({ sortField: 'name', sortDirection: 'desc' });

    expect(result.current.allLabelsWithInfo[0].name).toBe('Zebra');
  });
});
