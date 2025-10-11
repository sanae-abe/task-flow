import { useState, useCallback, useMemo } from "react";
import {
  DEFAULT_COLUMNS,
  type TableColumn,
  type TableColumnSettings,
  type TableColumnsHookReturn,
} from "../types/table";

const STORAGE_KEY = "taskflow-table-columns";

// 開発環境でのみログを出力するヘルパー関数
const debugLog = (message: string, ...args: unknown[]) => {
  if (process.env.NODE_ENV === "development") {
    // eslint-disable-next-line no-console
    console.log(message, ...args);
  }
};

export const useTableColumns = (): TableColumnsHookReturn => {
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
          columnOrder: parsed.columnOrder.filter((id) =>
            mergedColumns.some((col) => col.id === id),
          ),
        };
        return result;
      }
    } catch (error) {
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
    debugLog("🎯 toggleColumnVisibility called with:", columnId);
    setSettings((currentSettings) => {
      debugLog(
        "🔍 Current settings before toggle:",
        currentSettings.columns.map((c) => ({ id: c.id, visible: c.visible })),
      );

      const newColumns = currentSettings.columns.map((col) =>
        col.id === columnId ? { ...col, visible: !col.visible } : { ...col },
      );

      const newSettings = {
        columns: newColumns,
        columnOrder: [...currentSettings.columnOrder],
      };

      debugLog(
        "🔄 New settings after toggle:",
        newColumns.map((c) => ({ id: c.id, visible: c.visible })),
      );

      // localStorageに保存
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newSettings));
        debugLog("💾 Settings saved to localStorage");
      } catch (error) {
        debugLog("❌ Failed to save settings:", error);
      }

      // 強制再レンダリングを発生させる
      setForceRender((prev) => {
        debugLog("🔄 Force render incrementing from", prev, "to", prev + 1);
        return prev + 1;
      });

      // カスタムイベントを発行してTableViewに通知
      setTimeout(() => {
        debugLog("📡 Dispatching table-columns-visibility-changed event");
        window.dispatchEvent(
          new CustomEvent("table-columns-visibility-changed", {
            detail: { timestamp: Date.now() },
          }),
        );
      }, 0);

      return newSettings;
    });
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
      } catch (error) {
        debugLog("❌ Failed to save settings:", error);
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
      } catch (error) {
        debugLog("❌ Failed to save settings:", error);
      }

      return newSettings;
    });
  }, []);

  // カスタムカラムを追加
  const addCustomColumn = useCallback((column: Omit<TableColumn, "id">) => {
    setSettings((currentSettings) => {
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
      } catch (error) {
        debugLog("❌ Failed to save settings:", error);
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
      } catch (error) {
        debugLog("❌ Failed to save settings:", error);
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

    return [...result];
  }, [settings.columns, settings.columnOrder]);

  // グリッドテンプレートカラムのCSS値を生成
  const gridTemplateColumns = useMemo(
    () => visibleColumns.map((col: TableColumn) => col.width).join(" "),
    [visibleColumns],
  );

  // 毎回新しいオブジェクトを返すことを確実にする
  const returnValue = {
    columns: [...settings.columns],
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
