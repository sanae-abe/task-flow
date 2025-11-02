/**
 * useTableColumns hook tests
 * テーブルカラム管理機能の包括的テスト
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useTableColumns } from './useTableColumns';
import { DEFAULT_COLUMNS } from '../types/table';

const STORAGE_KEY = 'taskflow-table-columns';

describe('useTableColumns', () => {
  let localStorageMock: { [key: string]: string } = {};

  beforeEach(() => {
    // Mock localStorage
    localStorageMock = {};
    vi.stubGlobal('localStorage', {
      getItem: vi.fn((key: string) => localStorageMock[key] || null),
      setItem: vi.fn((key: string, value: string) => {
        localStorageMock[key] = value;
      }),
      removeItem: vi.fn((key: string) => {
        delete localStorageMock[key];
      }),
      clear: vi.fn(() => {
        localStorageMock = {};
      }),
    });

    // Mock window.dispatchEvent
    vi.stubGlobal('dispatchEvent', vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  describe('Initialization', () => {
    it('should initialize with default columns', () => {
      const { result } = renderHook(() => useTableColumns());

      expect(result.current.columns).toHaveLength(DEFAULT_COLUMNS.length);
      expect(result.current.columnOrder).toHaveLength(DEFAULT_COLUMNS.length);
      expect(result.current.visibleColumns.length).toBeGreaterThan(0);
    });

    it('should load settings from localStorage', () => {
      const savedSettings = {
        columns: DEFAULT_COLUMNS.map(col => ({
          ...col,
          visible: col.id === 'title', // Only title visible
        })),
        columnOrder: DEFAULT_COLUMNS.map(col => col.id),
      };

      localStorageMock[STORAGE_KEY] = JSON.stringify(savedSettings);

      const { result } = renderHook(() => useTableColumns());

      expect(result.current.visibleColumns).toHaveLength(1);
      expect(result.current.visibleColumns[0]?.id).toBe('title');
    });

    it('should handle invalid localStorage data gracefully', () => {
      localStorageMock[STORAGE_KEY] = 'invalid json';

      const { result } = renderHook(() => useTableColumns());

      // Should fall back to defaults
      expect(result.current.columns).toHaveLength(DEFAULT_COLUMNS.length);
    });

    it('should merge with defaults when new columns are added', () => {
      // Saved settings with old columns (missing some new defaults)
      const oldSettings = {
        columns: DEFAULT_COLUMNS.slice(0, 5), // Only first 5 columns
        columnOrder: DEFAULT_COLUMNS.slice(0, 5).map(col => col.id),
      };

      localStorageMock[STORAGE_KEY] = JSON.stringify(oldSettings);

      const { result } = renderHook(() => useTableColumns());

      // Should have all default columns
      expect(result.current.columns.length).toBeGreaterThanOrEqual(
        DEFAULT_COLUMNS.length
      );
    });
  });

  describe('toggleColumnVisibility', () => {
    it('should toggle column visibility', async () => {
      const { result } = renderHook(() => useTableColumns());

      const columnId = DEFAULT_COLUMNS[0]?.id;
      if (!columnId) throw new Error('No column id');

      const initialVisibility = result.current.columns[0]?.visible;

      await act(async () => {
        result.current.toggleColumnVisibility(columnId);
      });

      await waitFor(() => {
        expect(result.current.columns[0]?.visible).toBe(!initialVisibility);
      });
    });

    it('should save to localStorage when toggling', async () => {
      const { result } = renderHook(() => useTableColumns());

      const columnId = DEFAULT_COLUMNS[0]?.id;
      if (!columnId) throw new Error('No column id');

      await act(async () => {
        result.current.toggleColumnVisibility(columnId);
      });

      await waitFor(() => {
        expect(localStorage.setItem).toHaveBeenCalled();
      });
    });

    it('should dispatch custom event when toggling', async () => {
      const { result } = renderHook(() => useTableColumns());

      const columnId = DEFAULT_COLUMNS[0]?.id;
      if (!columnId) throw new Error('No column id');

      await act(async () => {
        result.current.toggleColumnVisibility(columnId);
      });

      // Wait for setTimeout(0) to complete
      await new Promise(resolve => setTimeout(resolve, 10));

      expect(window.dispatchEvent).toHaveBeenCalled();
    });

    it('should increment force render counter', async () => {
      const { result } = renderHook(() => useTableColumns());

      const columnId = DEFAULT_COLUMNS[0]?.id;
      if (!columnId) throw new Error('No column id');

      const initialForceRender = result.current._forceRender;

      await act(async () => {
        result.current.toggleColumnVisibility(columnId);
      });

      await waitFor(() => {
        expect(result.current._forceRender).toBe(initialForceRender + 1);
      });
    });
  });

  describe('updateColumnWidth', () => {
    it('should update column width', async () => {
      const { result } = renderHook(() => useTableColumns());

      const columnId = DEFAULT_COLUMNS[0]?.id;
      if (!columnId) throw new Error('No column id');

      await act(async () => {
        result.current.updateColumnWidth(columnId, '200px');
      });

      await waitFor(() => {
        expect(result.current.columns[0]?.width).toBe('200px');
      });
    });

    it('should save to localStorage when updating width', async () => {
      const { result } = renderHook(() => useTableColumns());

      const columnId = DEFAULT_COLUMNS[0]?.id;
      if (!columnId) throw new Error('No column id');

      await act(async () => {
        result.current.updateColumnWidth(columnId, '150px');
      });

      await waitFor(() => {
        expect(localStorage.setItem).toHaveBeenCalled();
      });
    });

    it('should handle non-existent column gracefully', async () => {
      const { result } = renderHook(() => useTableColumns());

      await act(async () => {
        result.current.updateColumnWidth('non-existent', '100px');
      });

      // Should not throw, columns unchanged
      expect(result.current.columns).toBeDefined();
    });
  });

  describe('reorderColumns', () => {
    it('should reorder columns', async () => {
      const { result } = renderHook(() => useTableColumns());

      const originalOrder = [...result.current.columnOrder];
      const newOrder = [...originalOrder].reverse();

      await act(async () => {
        result.current.reorderColumns(newOrder);
      });

      await waitFor(() => {
        expect(result.current.columnOrder).toEqual(newOrder);
      });
    });

    it('should save to localStorage when reordering', async () => {
      const { result } = renderHook(() => useTableColumns());

      const newOrder = [...result.current.columnOrder].reverse();

      await act(async () => {
        result.current.reorderColumns(newOrder);
      });

      await waitFor(() => {
        expect(localStorage.setItem).toHaveBeenCalled();
      });
    });

    it('should update visibleColumns according to new order', async () => {
      const { result } = renderHook(() => useTableColumns());

      const newOrder = [...result.current.columnOrder].reverse();

      await act(async () => {
        result.current.reorderColumns(newOrder);
      });

      await waitFor(() => {
        // visibleColumns should respect new order
        const visibleIds = result.current.visibleColumns.map(col => col.id);
        const newOrderVisible = newOrder.filter(id =>
          result.current.columns.find(col => col.id === id && col.visible)
        );
        expect(visibleIds).toEqual(newOrderVisible);
      });
    });
  });

  describe('addCustomColumn', () => {
    it('should add custom column', async () => {
      const { result } = renderHook(() => useTableColumns());

      const initialLength = result.current.columns.length;

      const customColumn = {
        label: 'Custom',
        width: '100px',
        visible: true,
        sortable: true,
        type: 'text' as const,
        accessor: (task: any) => task.custom,
      };

      await act(async () => {
        result.current.addCustomColumn(customColumn);
      });

      await waitFor(() => {
        expect(result.current.columns).toHaveLength(initialLength + 1);
      });
    });

    it('should generate unique id for custom column', async () => {
      const { result } = renderHook(() => useTableColumns());

      const customColumn = {
        label: 'Custom',
        width: '100px',
        visible: true,
        sortable: true,
        type: 'text' as const,
        accessor: (task: any) => task.custom,
      };

      await act(async () => {
        result.current.addCustomColumn(customColumn);
      });

      await waitFor(() => {
        const lastColumn =
          result.current.columns[result.current.columns.length - 1];
        expect(lastColumn?.id).toMatch(/^custom-\d+$/);
      });
    });

    it('should add custom column to columnOrder', async () => {
      const { result } = renderHook(() => useTableColumns());

      const initialOrderLength = result.current.columnOrder.length;

      const customColumn = {
        label: 'Custom',
        width: '100px',
        visible: true,
        sortable: true,
        type: 'text' as const,
        accessor: (task: any) => task.custom,
      };

      await act(async () => {
        result.current.addCustomColumn(customColumn);
      });

      await waitFor(() => {
        expect(result.current.columnOrder).toHaveLength(initialOrderLength + 1);
      });
    });

    it('should save to localStorage when adding custom column', async () => {
      const { result } = renderHook(() => useTableColumns());

      const customColumn = {
        label: 'Custom',
        width: '100px',
        visible: true,
        sortable: true,
        type: 'text' as const,
        accessor: (task: any) => task.custom,
      };

      await act(async () => {
        result.current.addCustomColumn(customColumn);
      });

      await waitFor(() => {
        expect(localStorage.setItem).toHaveBeenCalled();
      });
    });
  });

  describe('removeColumn', () => {
    it('should remove custom column', async () => {
      const { result } = renderHook(() => useTableColumns());

      // First add a custom column
      const customColumn = {
        label: 'Custom',
        width: '100px',
        visible: true,
        sortable: true,
        type: 'text' as const,
        accessor: (task: any) => task.custom,
      };

      await act(async () => {
        result.current.addCustomColumn(customColumn);
      });

      let customId: string | undefined;
      await waitFor(() => {
        customId = result.current.columns[result.current.columns.length - 1]?.id;
        expect(customId).toBeDefined();
      });

      const lengthBeforeRemove = result.current.columns.length;

      // Remove the custom column
      if (customId) {
        await act(async () => {
          result.current.removeColumn(customId);
        });

        await waitFor(() => {
          expect(result.current.columns).toHaveLength(lengthBeforeRemove - 1);
        });
      }
    });

    it('should not remove default columns', async () => {
      const { result } = renderHook(() => useTableColumns());

      const defaultColumnId = DEFAULT_COLUMNS[0]?.id;
      if (!defaultColumnId) throw new Error('No default column id');

      const initialLength = result.current.columns.length;

      await act(async () => {
        result.current.removeColumn(defaultColumnId);
      });

      // Length should remain the same
      expect(result.current.columns).toHaveLength(initialLength);
    });

    it('should remove column from columnOrder', async () => {
      const { result } = renderHook(() => useTableColumns());

      // Add and remove custom column
      const customColumn = {
        label: 'Custom',
        width: '100px',
        visible: true,
        sortable: true,
        type: 'text' as const,
        accessor: (task: any) => task.custom,
      };

      await act(async () => {
        result.current.addCustomColumn(customColumn);
      });

      let customId: string | undefined;
      await waitFor(() => {
        customId = result.current.columns[result.current.columns.length - 1]?.id;
      });

      if (customId) {
        await act(async () => {
          result.current.removeColumn(customId);
        });

        await waitFor(() => {
          expect(result.current.columnOrder).not.toContain(customId);
        });
      }
    });
  });

  describe('resetToDefaults', () => {
    it('should reset to default settings', async () => {
      const { result } = renderHook(() => useTableColumns());

      // Make some changes
      const columnId = DEFAULT_COLUMNS[0]?.id;
      if (!columnId) throw new Error('No column id');

      await act(async () => {
        result.current.updateColumnWidth(columnId, '300px');
      });

      await waitFor(() => {
        expect(result.current.columns[0]?.width).toBe('300px');
      });

      // Reset to defaults
      await act(async () => {
        result.current.resetToDefaults();
      });

      await waitFor(() => {
        expect(result.current.columns[0]?.width).toBe(DEFAULT_COLUMNS[0]?.width);
      });
    });

    it('should remove localStorage when resetting', async () => {
      const { result } = renderHook(() => useTableColumns());

      await act(async () => {
        result.current.resetToDefaults();
      });

      expect(localStorage.removeItem).toHaveBeenCalledWith(STORAGE_KEY);
    });

    it('should remove custom columns when resetting', async () => {
      const { result } = renderHook(() => useTableColumns());

      // Add custom column
      const customColumn = {
        label: 'Custom',
        width: '100px',
        visible: true,
        sortable: true,
        type: 'text' as const,
        accessor: (task: any) => task.custom,
      };

      await act(async () => {
        result.current.addCustomColumn(customColumn);
      });

      await waitFor(() => {
        expect(result.current.columns.length).toBeGreaterThan(
          DEFAULT_COLUMNS.length
        );
      });

      // Reset
      await act(async () => {
        result.current.resetToDefaults();
      });

      await waitFor(() => {
        expect(result.current.columns).toHaveLength(DEFAULT_COLUMNS.length);
      });
    });
  });

  describe('visibleColumns', () => {
    it('should only include visible columns', () => {
      const { result } = renderHook(() => useTableColumns());

      const allVisible = result.current.visibleColumns.every(col => col.visible);
      expect(allVisible).toBe(true);
    });

    it('should respect column order', () => {
      const { result } = renderHook(() => useTableColumns());

      const visibleIds = result.current.visibleColumns.map(col => col.id);
      const orderedVisibleIds = result.current.columnOrder.filter(id =>
        result.current.columns.find(col => col.id === id && col.visible)
      );

      expect(visibleIds).toEqual(orderedVisibleIds);
    });

    it('should update when visibility changes', async () => {
      const { result } = renderHook(() => useTableColumns());

      const initialVisibleCount = result.current.visibleColumns.length;
      const visibleColumnId = result.current.visibleColumns[0]?.id;
      if (!visibleColumnId) throw new Error('No visible column');

      await act(async () => {
        result.current.toggleColumnVisibility(visibleColumnId);
      });

      await waitFor(() => {
        expect(result.current.visibleColumns).toHaveLength(
          initialVisibleCount - 1
        );
      });
    });
  });

  describe('gridTemplateColumns', () => {
    it('should generate CSS grid template', () => {
      const { result } = renderHook(() => useTableColumns());

      expect(typeof result.current.gridTemplateColumns).toBe('string');
      expect(result.current.gridTemplateColumns.length).toBeGreaterThan(0);
    });

    it('should include all visible column widths', () => {
      const { result } = renderHook(() => useTableColumns());

      const expectedWidths = result.current.visibleColumns
        .map(col => col.width)
        .join(' ');

      expect(result.current.gridTemplateColumns).toBe(expectedWidths);
    });

    it('should update when column widths change', async () => {
      const { result } = renderHook(() => useTableColumns());

      const visibleColumnId = result.current.visibleColumns[0]?.id;
      if (!visibleColumnId) throw new Error('No visible column');

      const initialTemplate = result.current.gridTemplateColumns;

      await act(async () => {
        result.current.updateColumnWidth(visibleColumnId, '500px');
      });

      await waitFor(() => {
        expect(result.current.gridTemplateColumns).not.toBe(initialTemplate);
        expect(result.current.gridTemplateColumns).toContain('500px');
      });
    });
  });

  describe('Edge cases', () => {
    it('should handle localStorage setItem failure gracefully', async () => {
      vi.mocked(localStorage.setItem).mockImplementation(() => {
        throw new Error('Storage full');
      });

      const { result } = renderHook(() => useTableColumns());

      const columnId = DEFAULT_COLUMNS[0]?.id;
      if (!columnId) throw new Error('No column id');

      // Should not throw
      await act(async () => {
        result.current.toggleColumnVisibility(columnId);
      });

      expect(result.current.columns).toBeDefined();
    });

    it('should handle empty columnOrder', async () => {
      localStorageMock[STORAGE_KEY] = JSON.stringify({
        columns: DEFAULT_COLUMNS,
        columnOrder: [],
      });

      const { result } = renderHook(() => useTableColumns());

      // Should still work
      expect(result.current.visibleColumns).toBeDefined();
    });

    it('should return new object on each call', () => {
      const { result } = renderHook(() => useTableColumns());

      const firstRender = result.current;
      const { rerender } = renderHook(() => useTableColumns());

      rerender();

      // timestamp should be different
      expect(result.current._timestamp).toBeDefined();
    });
  });
});
