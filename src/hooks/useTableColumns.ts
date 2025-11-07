import { useState, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  DEFAULT_COLUMNS,
  COLUMN_LABEL_KEYS,
  type TableColumn,
  type TableColumnSettings,
  type TableColumnsHookReturn,
} from '../types/table';

const STORAGE_KEY = 'taskflow-table-columns';

export const useTableColumns = (): TableColumnsHookReturn => {
  const { t } = useTranslation();
  // 強制再レンダリング用のカウンター
  const [forceRender, setForceRender] = useState(0);

  const [settings, setSettings] = useState<TableColumnSettings>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);

      if (stored) {
        const parsed = JSON.parse(stored) as TableColumnSettings;

        // デフォルトカラムとマージして、新しいカラムが追加された場合に対応
        const mergedColumns = mergeWithDefaults(parsed.columns);
        const result = {
          columns: mergedColumns,
          columnOrder: parsed.columnOrder.filter(id =>
            mergedColumns.some(col => col.id === id)
          ),
        };
        return result;
      }
    } catch (_error) {
      // Failed to load settings, will use defaults
    }

    const defaultSettings = {
      columns: [...DEFAULT_COLUMNS],
      columnOrder: DEFAULT_COLUMNS.map(col => col.id),
    };
    return defaultSettings;
  });

  // カラムの表示/非表示を切り替え
  const toggleColumnVisibility = useCallback((columnId: string) => {
    setSettings(currentSettings => {
      const newColumns = currentSettings.columns.map(col =>
        col.id === columnId ? { ...col, visible: !col.visible } : { ...col }
      );

      const newSettings = {
        columns: newColumns,
        columnOrder: [...currentSettings.columnOrder],
      };

      // localStorageに保存
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newSettings));
      } catch (_error) {
        // Failed to save settings
      }

      // 強制再レンダリングを発生させる
      setForceRender(prev => prev + 1);

      // カスタムイベントを発行してTableViewに通知
      setTimeout(() => {
        window.dispatchEvent(
          new CustomEvent('table-columns-visibility-changed', {
            detail: { timestamp: Date.now() },
          })
        );
      }, 0);

      return newSettings;
    });
  }, []);

  // カラムの幅を変更
  const updateColumnWidth = useCallback((columnId: string, width: string) => {
    setSettings(currentSettings => {
      const newColumns = currentSettings.columns.map(col =>
        col.id === columnId ? { ...col, width } : col
      );
      const newSettings = {
        ...currentSettings,
        columns: newColumns,
      };

      // localStorageに保存
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newSettings));
      } catch (_error) {
        // Failed to save settings
      }

      return newSettings;
    });
  }, []);

  // カラムの順序を変更
  const reorderColumns = useCallback((newOrder: string[]) => {
    setSettings(currentSettings => {
      const newSettings = {
        ...currentSettings,
        columnOrder: newOrder,
      };

      // localStorageに保存
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newSettings));
      } catch (_error) {
        // Failed to save settings
      }

      return newSettings;
    });
  }, []);

  // カスタムカラムを追加
  const addCustomColumn = useCallback((column: Omit<TableColumn, 'id'>) => {
    setSettings(currentSettings => {
      const newColumn: TableColumn = {
        id: `custom-${Date.now()}`,
        label: column.label,
        width: column.width,
        visible: column.visible,
        sortable: column.sortable,
        type: column.type,
        accessor: column.accessor,
        render: column.render,
      };

      const newColumns = [...currentSettings.columns, newColumn];
      const newOrder = [...currentSettings.columnOrder, newColumn.id];

      const newSettings = {
        columns: newColumns,
        columnOrder: newOrder,
      };

      // localStorageに保存
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newSettings));
      } catch (_error) {
        // Failed to save settings
      }

      return newSettings;
    });
  }, []);

  // カラムを削除（カスタムカラムのみ）
  const removeColumn = useCallback((columnId: string) => {
    // デフォルトカラムは削除できない
    if (DEFAULT_COLUMNS.some(col => col.id === columnId)) {
      return;
    }

    setSettings(currentSettings => {
      const newColumns = currentSettings.columns.filter(
        col => col.id !== columnId
      );
      const newOrder = currentSettings.columnOrder.filter(
        id => id !== columnId
      );

      const newSettings = {
        columns: newColumns,
        columnOrder: newOrder,
      };

      // localStorageに保存
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newSettings));
      } catch (_error) {
        // Failed to save settings
      }

      return newSettings;
    });
  }, []);

  // 設定をリセット
  const resetToDefaults = useCallback(() => {
    // localStorageもクリア
    localStorage.removeItem(STORAGE_KEY);

    const defaultSettings = {
      columns: [...DEFAULT_COLUMNS],
      columnOrder: DEFAULT_COLUMNS.map(col => col.id),
    };
    setSettings(defaultSettings);
  }, []);

  // ラベルを翻訳したカラムを取得
  const translatedColumns = useMemo(
    () =>
      settings.columns.map(col => ({
        ...col,
        label: COLUMN_LABEL_KEYS[col.id]
          ? t(COLUMN_LABEL_KEYS[col.id] as string)
          : col.label,
      })),
    [settings.columns, t]
  );

  // 表示されているカラムを順序通りに取得
  const visibleColumns = useMemo(() => {
    const result = settings.columnOrder
      .map(id => translatedColumns.find(col => col.id === id))
      .filter((col): col is TableColumn => col !== undefined && col.visible);

    return [...result];
  }, [translatedColumns, settings.columnOrder]);

  // グリッドテンプレートカラムのCSS値を生成
  const gridTemplateColumns = useMemo(
    () => visibleColumns.map((col: TableColumn) => col.width).join(' '),
    [visibleColumns]
  );

  // 毎回新しいオブジェクトを返すことを確実にする
  const returnValue = {
    columns: [...translatedColumns],
    columnOrder: [...settings.columnOrder],
    visibleColumns: [...visibleColumns],
    gridTemplateColumns,
    toggleColumnVisibility,
    updateColumnWidth,
    reorderColumns,
    addCustomColumn,
    removeColumn,
    resetToDefaults,
    _forceRender: forceRender,
    // 一意のタイムスタンプを追加して確実に新しいオブジェクトとして認識される
    _timestamp: Date.now(),
  };

  return returnValue;
};

// デフォルトカラムと保存されたカラムをマージする関数
function mergeWithDefaults(savedColumns: TableColumn[]): TableColumn[] {
  const merged = [...DEFAULT_COLUMNS];

  // 保存されたカスタムカラムを追加
  savedColumns.forEach(savedCol => {
    const defaultIndex = merged.findIndex(col => col.id === savedCol.id);
    if (defaultIndex >= 0) {
      // デフォルトカラムの設定を更新（type, accessor, renderは保持）
      const existingCol = merged[defaultIndex];
      if (existingCol) {
        merged[defaultIndex] = {
          id: existingCol.id,
          label: savedCol.label ?? existingCol.label,
          width: savedCol.width ?? existingCol.width,
          visible: savedCol.visible ?? existingCol.visible,
          sortable: savedCol.sortable ?? existingCol.sortable,
          type: existingCol.type,
          accessor: existingCol.accessor,
          render: existingCol.render,
        };
      }
    } else {
      // カスタムカラムを追加
      merged.push(savedCol);
    }
  });

  return merged;
}
