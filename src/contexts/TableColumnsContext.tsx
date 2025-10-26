import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
} from "react";
import {
  DEFAULT_COLUMNS,
  type TableColumn,
  type TableColumnSettings,
} from "../types/table";

const STORAGE_KEY = "taskflow-table-columns";

interface TableColumnsContextType {
  columns: TableColumn[];
  columnOrder: string[];
  visibleColumns: TableColumn[];
  gridTemplateColumns: string;
  toggleColumnVisibility: (columnId: string) => void;
  updateColumnWidth: (columnId: string, width: string) => void;
  reorderColumns: (newOrder: string[]) => void;
  removeColumn: (columnId: string) => void;
  resetToDefaults: () => void;
  forceRender: number;
}

const TableColumnsContext = createContext<TableColumnsContextType | undefined>(
  undefined,
);

export const TableColumnsProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [forceRender, setForceRender] = useState(0);

  const [settings, setSettings] = useState<TableColumnSettings>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);

      if (stored) {
        const parsed = JSON.parse(stored) as TableColumnSettings;

        // デフォルトカラムとマージして、新しいカラムが追加された場合に対応
        const mergedColumns = mergeWithDefaults(parsed.columns);

        // 新しく追加されたカラムをcolumnOrderに追加
        const existingOrder = parsed.columnOrder.filter((id) =>
          mergedColumns.some((col) => col.id === id),
        );
        const newColumns = mergedColumns.filter(
          (col) => !existingOrder.includes(col.id),
        );
        const updatedOrder = [
          ...existingOrder,
          ...newColumns.map((col) => col.id),
        ];

        const result = {
          columns: mergedColumns,
          columnOrder: updatedOrder,
        };

        // 新しいカラムが追加された場合は、ローカルストレージを更新
        if (newColumns.length > 0) {
          try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(result));
          } catch (_error) {
            // Failed to update localStorage, continue silently
          }
        }

        return result;
      }
    } catch (_error) {
      // Failed to load settings, will use defaults
    }

    const defaultSettings = {
      columns: [...DEFAULT_COLUMNS],
      columnOrder: DEFAULT_COLUMNS.map((col) => col.id),
    };
    return defaultSettings;
  });

  // カラムの表示/非表示を切り替え
  const toggleColumnVisibility = useCallback((columnId: string) => {
    setSettings((currentSettings) => {
      const newColumns = currentSettings.columns.map((col) =>
        col.id === columnId ? { ...col, visible: !col.visible } : { ...col },
      );

      const newSettings = {
        columns: newColumns,
        columnOrder: [...currentSettings.columnOrder],
      };

      // localStorageに保存
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newSettings));
      } catch (_error) {
        // Failed to save settings, continue silently
      }

      return newSettings;
    });

    // 強制再レンダリングを発生させる
    setForceRender((prev) => prev + 1);
  }, []);

  // カラムの幅を変更
  const updateColumnWidth = useCallback((columnId: string, width: string) => {
    setSettings((currentSettings) => {
      const newColumns = currentSettings.columns.map((col) =>
        col.id === columnId ? { ...col, width } : col,
      );
      const newSettings = {
        ...currentSettings,
        columns: newColumns,
      };

      // localStorageに保存
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newSettings));
      } catch (_error) {
        // Failed to save settings, continue silently
      }

      return newSettings;
    });
  }, []);

  // カラムの順序を変更
  const reorderColumns = useCallback((newOrder: string[]) => {
    setSettings((currentSettings) => {
      const newSettings = {
        ...currentSettings,
        columnOrder: newOrder,
      };

      // localStorageに保存
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newSettings));
      } catch (_error) {
        // Failed to save settings, continue silently
      }

      return newSettings;
    });
  }, []);

  // カラムを削除（カスタムカラムのみ）
  const removeColumn = useCallback((columnId: string) => {
    // デフォルトカラムは削除できない
    if (DEFAULT_COLUMNS.some((col) => col.id === columnId)) {
      return;
    }

    setSettings((currentSettings) => {
      const newColumns = currentSettings.columns.filter(
        (col) => col.id !== columnId,
      );
      const newOrder = currentSettings.columnOrder.filter(
        (id) => id !== columnId,
      );

      const newSettings = {
        columns: newColumns,
        columnOrder: newOrder,
      };

      // localStorageに保存
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newSettings));
      } catch (_error) {
        // Failed to save settings, continue silently
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
      columnOrder: DEFAULT_COLUMNS.map((col) => col.id),
    };
    setSettings(defaultSettings);
  }, []);

  // 表示されているカラムを順序通りに取得
  const visibleColumns = useMemo(() => {
    const result = settings.columnOrder
      .map((id) => settings.columns.find((col) => col.id === id))
      .filter((col): col is TableColumn => col !== undefined && col.visible);

    return result;
  }, [settings.columns, settings.columnOrder]);

  // グリッドテンプレートカラムのCSS値を生成
  const gridTemplateColumns = useMemo(
    () => visibleColumns.map((col: TableColumn) => col.width).join(" "),
    [visibleColumns],
  );

  const contextValue = useMemo(
    () => ({
      columns: settings.columns,
      columnOrder: settings.columnOrder,
      visibleColumns,
      gridTemplateColumns,
      toggleColumnVisibility,
      updateColumnWidth,
      reorderColumns,
      removeColumn,
      resetToDefaults,
      forceRender,
    }),
    [
      settings.columns,
      settings.columnOrder,
      visibleColumns,
      gridTemplateColumns,
      toggleColumnVisibility,
      updateColumnWidth,
      reorderColumns,
      removeColumn,
      resetToDefaults,
      forceRender,
    ],
  );

  return (
    <TableColumnsContext.Provider value={contextValue}>
      {children}
    </TableColumnsContext.Provider>
  );
};

export const useTableColumns = () => {
  const context = useContext(TableColumnsContext);
  if (context === undefined) {
    throw new Error(
      "useTableColumns must be used within a TableColumnsProvider",
    );
  }
  return context;
};

// デフォルトカラムと保存されたカラムをマージする関数
function mergeWithDefaults(savedColumns: TableColumn[]): TableColumn[] {
  const merged = [...DEFAULT_COLUMNS];

  // 保存されたカスタムカラムを追加
  savedColumns.forEach((savedCol) => {
    const defaultIndex = merged.findIndex((col) => col.id === savedCol.id);
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
