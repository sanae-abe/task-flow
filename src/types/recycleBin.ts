export interface RecycleBinItem {
  id: string;
  type: 'task' | 'board';
  title: string;
  description?: string;
  deletedAt?: string | null;

  // タスク固有のフィールド
  boardId?: string;
  columnId?: string;
  boardTitle?: string;
  columnTitle?: string;

  // ボード固有のフィールド
  columnsCount?: number;
  taskCount?: number;
}

export interface RecycleBinItemWithMeta extends RecycleBinItem {
  // 共通メタデータ
  canRestore: boolean;
  timeUntilDeletion?: string;
}