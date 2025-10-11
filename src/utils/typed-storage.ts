/**
 * 型安全なストレージシステム
 * TypeScript 5.7.3の型安全性を活用したローカルストレージラッパー
 */

import type { KanbanBoard, Label } from "../types";
import {
  isValidKanbanBoard,
  isValidLabel,
  parseTypedJSON,
  Result,
  StorageError,
} from "./type-guards";

// ストレージキーの型安全な定義
const STORAGE_KEYS = {
  BOARDS: "taskflow-boards",
  CURRENT_BOARD_ID: "taskflow-current-board-id",
  LABELS: "taskflow-labels",
  USER_PREFERENCES: "taskflow-user-preferences",
  TABLE_COLUMNS: "taskflow-table-columns",
  VIEW_MODE: "taskflow-view-mode",
} as const;

// StorageKey type (unused but kept for future use)
// type StorageKey = keyof typeof STORAGE_KEYS;

// 型安全なストレージインターフェース
interface TypedStorageItem<T> {
  value: T;
  timestamp: number;
  version: string;
  checksum?: string;
}

// ストレージスキーマ定義
interface StorageSchema {
  [STORAGE_KEYS.BOARDS]: KanbanBoard[];
  [STORAGE_KEYS.CURRENT_BOARD_ID]: string;
  [STORAGE_KEYS.LABELS]: Label[];
  [STORAGE_KEYS.USER_PREFERENCES]: {
    theme: "light" | "dark" | "auto";
    language: "ja" | "en";
    autoSave: boolean;
  };
  [STORAGE_KEYS.TABLE_COLUMNS]: {
    visibleColumns: string[];
    columnWidths: Record<string, string>;
  };
  [STORAGE_KEYS.VIEW_MODE]: "kanban" | "table" | "calendar";
}

// バリデーターマップ
const VALIDATORS: {
  [K in keyof StorageSchema]: (value: unknown) => value is StorageSchema[K];
} = {
  [STORAGE_KEYS.BOARDS]: (value): value is KanbanBoard[] =>
    Array.isArray(value) && value.every(isValidKanbanBoard),
  [STORAGE_KEYS.CURRENT_BOARD_ID]: (value): value is string =>
    typeof value === "string",
  [STORAGE_KEYS.LABELS]: (value): value is Label[] =>
    Array.isArray(value) && value.every(isValidLabel),
  [STORAGE_KEYS.USER_PREFERENCES]: (
    value,
  ): value is StorageSchema[typeof STORAGE_KEYS.USER_PREFERENCES] => {
    if (typeof value !== "object" || value === null) {
      return false;
    }
    const obj = value as Record<string, unknown>;
    return (
      (obj["theme"] === "light" ||
        obj["theme"] === "dark" ||
        obj["theme"] === "auto") &&
      (obj["language"] === "ja" || obj["language"] === "en") &&
      typeof obj["autoSave"] === "boolean"
    );
  },
  [STORAGE_KEYS.TABLE_COLUMNS]: (
    value,
  ): value is StorageSchema[typeof STORAGE_KEYS.TABLE_COLUMNS] => {
    if (typeof value !== "object" || value === null) {
      return false;
    }
    const obj = value as Record<string, unknown>;
    return (
      Array.isArray(obj["visibleColumns"]) &&
      (obj["visibleColumns"] as unknown[]).every(
        (item) => typeof item === "string",
      ) &&
      typeof obj["columnWidths"] === "object" &&
      obj["columnWidths"] !== null
    );
  },
  [STORAGE_KEYS.VIEW_MODE]: (
    value,
  ): value is StorageSchema[typeof STORAGE_KEYS.VIEW_MODE] =>
    value === "kanban" || value === "table" || value === "calendar",
};

// チェックサム生成
const generateChecksum = (data: string): string => {
  let hash = 0;
  for (let i = 0; i < data.length; i++) {
    const char = data.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return hash.toString(16);
};

// メインストレージクラス
class TypedLocalStorage {
  private readonly version = "1.0.0";

  // 型安全なアイテム取得
  getItem<K extends keyof StorageSchema>(
    key: K,
    validator?: (value: unknown) => value is StorageSchema[K],
  ): Result<StorageSchema[K], StorageError> {
    try {
      const rawValue = localStorage.getItem(
        STORAGE_KEYS[key as keyof typeof STORAGE_KEYS],
      );
      if (rawValue === null) {
        return {
          success: false,
          error: new StorageError("Item not found", String(key), "get"),
        };
      }

      const parsedItem = parseTypedJSON(
        rawValue,
        (value): value is TypedStorageItem<StorageSchema[K]> => {
          if (typeof value !== "object" || value === null) {
            return false;
          }
          const obj = value as Record<string, unknown>;
          return (
            "value" in obj &&
            typeof obj["timestamp"] === "number" &&
            typeof obj["version"] === "string"
          );
        },
      );

      if (!parsedItem) {
        return {
          success: false,
          error: new StorageError("Invalid JSON format", key, "get"),
        };
      }

      // チェックサム検証
      if (parsedItem.checksum) {
        const dataString = JSON.stringify(parsedItem.value);
        if (generateChecksum(dataString) !== parsedItem.checksum) {
          return {
            success: false,
            error: new StorageError("Checksum mismatch", key, "get"),
          };
        }
      }

      // 型検証
      const validatorFn = validator || VALIDATORS[key];
      if (!validatorFn(parsedItem.value)) {
        return {
          success: false,
          error: new StorageError("Type validation failed", key, "get"),
        };
      }

      return { success: true, data: parsedItem.value };
    } catch (error) {
      return {
        success: false,
        error: new StorageError(
          error instanceof Error ? error.message : "Unknown error",
          key,
          "get",
        ),
      };
    }
  }

  // 型安全なアイテム保存
  setItem<K extends keyof StorageSchema>(
    key: K,
    value: StorageSchema[K],
  ): Result<void, StorageError> {
    try {
      // 型検証
      if (!VALIDATORS[key](value)) {
        return {
          success: false,
          error: new StorageError("Type validation failed", key, "set"),
        };
      }

      const dataString = JSON.stringify(value);
      const storageItem: TypedStorageItem<StorageSchema[K]> = {
        value,
        timestamp: Date.now(),
        version: this.version,
        checksum: generateChecksum(dataString),
      };

      localStorage.setItem(
        STORAGE_KEYS[key as keyof typeof STORAGE_KEYS],
        JSON.stringify(storageItem),
      );
      return { success: true, data: undefined };
    } catch (error) {
      return {
        success: false,
        error: new StorageError(
          error instanceof Error ? error.message : "Unknown error",
          key,
          "set",
        ),
      };
    }
  }

  // アイテム削除
  removeItem<K extends keyof StorageSchema>(
    key: K,
  ): Result<void, StorageError> {
    try {
      localStorage.removeItem(STORAGE_KEYS[key as keyof typeof STORAGE_KEYS]);
      return { success: true, data: undefined };
    } catch (error) {
      return {
        success: false,
        error: new StorageError(
          error instanceof Error ? error.message : "Unknown error",
          key,
          "remove",
        ),
      };
    }
  }

  // 存在チェック
  hasItem<K extends keyof StorageSchema>(key: K): boolean {
    return (
      localStorage.getItem(STORAGE_KEYS[key as keyof typeof STORAGE_KEYS]) !==
      null
    );
  }

  // 全アイテムクリア
  clear(): Result<void, StorageError> {
    try {
      Object.values(STORAGE_KEYS).forEach((key) => {
        localStorage.removeItem(key);
      });
      return { success: true, data: undefined };
    } catch (error) {
      return {
        success: false,
        error: new StorageError(
          error instanceof Error ? error.message : "Unknown error",
          "all",
          "remove",
        ),
      };
    }
  }

  // ストレージサイズ取得
  getStorageSize(): number {
    let totalSize = 0;
    Object.values(STORAGE_KEYS).forEach((key) => {
      const item = localStorage.getItem(key);
      if (item) {
        totalSize += new Blob([item]).size;
      }
    });
    return totalSize;
  }

  // ストレージ情報取得
  getStorageInfo(): {
    totalSize: number;
    itemCount: number;
    items: Array<{ key: string; size: number; timestamp?: number }>;
  } {
    const items: Array<{ key: string; size: number; timestamp?: number }> = [];
    let totalSize = 0;

    Object.entries(STORAGE_KEYS).forEach(([storageKey, localStorageKey]) => {
      const item = localStorage.getItem(localStorageKey);
      if (item) {
        const size = new Blob([item]).size;
        totalSize += size;

        try {
          const parsed = JSON.parse(item);
          items.push({
            key: storageKey,
            size,
            timestamp: parsed.timestamp,
          });
        } catch {
          items.push({ key: storageKey, size });
        }
      }
    });

    return {
      totalSize,
      itemCount: items.length,
      items,
    };
  }
}

// シングルトンインスタンス
const typedStorage = new TypedLocalStorage();

export { typedStorage, TypedLocalStorage, StorageError };
export type { StorageSchema };
