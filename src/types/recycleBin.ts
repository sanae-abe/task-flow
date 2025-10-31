/**
 * ゴミ箱アイテムの基本型定義
 * タスク、ボード、カラムの削除されたアイテムを統一的に扱うためのインターフェース
 */
export interface RecycleBinItem {
  /** アイテムの一意識別子 */
  id: string;
  /** アイテムの種別 */
  type: 'task' | 'board' | 'column';
  /** アイテムのタイトル */
  title: string;
  /** アイテムの説明（タスクの場合のみ） */
  description?: string;
  /** 削除日時（ISO形式の文字列） */
  deletedAt?: string | null;

  // タスク固有のフィールド
  /** 所属するボードのID（タスクの場合） */
  boardId?: string;
  /** 所属するカラムのID（タスクの場合） */
  columnId?: string;
  /** 所属するボードのタイトル（タスクの場合） */
  boardTitle?: string;
  /** 所属するカラムのタイトル（タスクの場合） */
  columnTitle?: string;

  // ボード固有のフィールド
  /** ボード内のカラム数（ボード・カラムの場合） */
  columnsCount?: number;
  /** 内包するタスク数（ボード・カラムの場合） */
  taskCount?: number;
}

/**
 * メタデータ付きゴミ箱アイテム
 * UI表示用の追加情報を含む拡張版
 */
export interface RecycleBinItemWithMeta extends RecycleBinItem {
  /** 復元可能かどうか */
  canRestore: boolean;
  /** 自動削除までの残り時間（人間が読める形式） */
  timeUntilDeletion?: string;
}

/**
 * ゴミ箱アイテムの型ガード: タスク
 */
export const isTaskRecycleBinItem = (
  item: RecycleBinItem
): item is RecycleBinItem & { type: 'task' } => item.type === 'task';

/**
 * ゴミ箱アイテムの型ガード: ボード
 */
export const isBoardRecycleBinItem = (
  item: RecycleBinItem
): item is RecycleBinItem & { type: 'board' } => item.type === 'board';

/**
 * ゴミ箱アイテムの型ガード: カラム
 */
export const isColumnRecycleBinItem = (
  item: RecycleBinItem
): item is RecycleBinItem & { type: 'column' } => item.type === 'column';

/**
 * 有効なゴミ箱アイテムかどうかを検証
 */
export const isValidRecycleBinItem = (
  item: unknown
): item is RecycleBinItem => {
  if (typeof item !== 'object' || item === null) {
    return false;
  }

  const obj = item as Record<string, unknown>;

  return (
    typeof obj['id'] === 'string' &&
    typeof obj['title'] === 'string' &&
    ['task', 'board', 'column'].includes(obj['type'] as string) &&
    (obj['deletedAt'] === undefined ||
      obj['deletedAt'] === null ||
      typeof obj['deletedAt'] === 'string')
  );
};
