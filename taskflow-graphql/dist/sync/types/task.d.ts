/**
 * タスクのステータス
 */
export type TaskStatus = 'pending' | 'in_progress' | 'completed';
/**
 * タスクの優先度
 */
export type TaskPriority = 'low' | 'medium' | 'high';
/**
 * タスクの基本型定義
 *
 * Single Source of Truth: すべてのタスク型はこの定義を参照します
 */
export interface Task {
    /** タスクID（UUID v4形式） */
    id: string;
    /** タスクタイトル */
    title: string;
    /** タスクステータス */
    status: TaskStatus;
    /** 優先度 */
    priority: TaskPriority;
    /** 期限日（ISO 8601形式） */
    dueDate?: string;
    /** タスクの説明 */
    description?: string;
    /** 作成日時 */
    createdAt: Date;
    /** 更新日時 */
    updatedAt: Date;
    /** タグ（カテゴリ分類用） */
    tags?: string[];
    /** 親タスクID（サブタスクの場合） */
    parentId?: string;
    /** 並び順 */
    order?: number;
    /** セクション名（TODO.mdの見出し） */
    section?: string;
    /** アーカイブ済みフラグ */
    archived?: boolean;
}
/**
 * タスク作成用の入力型
 *
 * 必須フィールドのみを要求し、システムが自動生成するフィールドは除外
 */
export interface TaskInput {
    /** タスクタイトル */
    title: string;
    /** タスクステータス（デフォルト: 'pending'） */
    status?: TaskStatus;
    /** 優先度（デフォルト: 'medium'） */
    priority?: TaskPriority;
    /** 期限日（ISO 8601形式） */
    dueDate?: string;
    /** タスクの説明 */
    description?: string;
    /** タグ */
    tags?: string[];
    /** 親タスクID */
    parentId?: string;
    /** 並び順 */
    order?: number;
    /** セクション名 */
    section?: string;
}
/**
 * タスク更新用の入力型
 *
 * すべてのフィールドをオプショナルにし、部分更新を許可
 */
export interface TaskUpdateInput {
    /** タスクタイトル */
    title?: string;
    /** タスクステータス */
    status?: TaskStatus;
    /** 優先度 */
    priority?: TaskPriority;
    /** 期限日 */
    dueDate?: string;
    /** タスクの説明 */
    description?: string;
    /** タグ */
    tags?: string[];
    /** 親タスクID */
    parentId?: string;
    /** 並び順 */
    order?: number;
    /** セクション名 */
    section?: string;
    /** アーカイブ済みフラグ */
    archived?: boolean;
}
/**
 * TODO.mdから解析されたタスク（変換前）
 */
export interface ParsedTask {
    /** タイトル */
    title: string;
    /** チェック状態（checked/unchecked） */
    checked: boolean;
    /** 行番号（0-indexed） */
    lineNumber: number;
    /** セクション名 */
    section: string;
    /** インデントレベル */
    indentLevel: number;
    /** 生のMarkdownテキスト */
    rawText: string;
    /** メタデータ（期限、優先度等を抽出） */
    metadata?: {
        dueDate?: string;
        priority?: TaskPriority;
        tags?: string[];
    };
}
/**
 * タスクフィルター（検索・絞り込み用）
 */
export interface TaskFilter {
    /** ステータスで絞り込み */
    status?: TaskStatus | TaskStatus[];
    /** 優先度で絞り込み */
    priority?: TaskPriority | TaskPriority[];
    /** タグで絞り込み */
    tags?: string[];
    /** セクションで絞り込み */
    section?: string;
    /** 期限日の範囲で絞り込み */
    dueDateRange?: {
        start?: string;
        end?: string;
    };
    /** アーカイブ済みを含むか */
    includeArchived?: boolean;
    /** 親タスクIDで絞り込み */
    parentId?: string;
    /** 検索クエリ（タイトル・説明を対象） */
    searchQuery?: string;
}
/**
 * タスクのソート順
 */
export interface TaskSort {
    /** ソートフィールド */
    field: 'createdAt' | 'updatedAt' | 'dueDate' | 'priority' | 'order' | 'title';
    /** ソート方向 */
    direction: 'asc' | 'desc';
}
/**
 * ページネーション情報
 */
export interface Pagination {
    /** 取得件数 */
    limit: number;
    /** オフセット */
    offset: number;
}
/**
 * タスクリスト（ページネーション対応）
 */
export interface TaskList {
    /** タスクの配列 */
    tasks: Task[];
    /** 総件数 */
    total: number;
    /** 現在のページ */
    page: number;
    /** 1ページあたりの件数 */
    pageSize: number;
    /** 総ページ数 */
    totalPages: number;
    /** 次のページがあるか */
    hasNext: boolean;
    /** 前のページがあるか */
    hasPrevious: boolean;
}
/**
 * タスクバリデーション結果
 */
export interface TaskValidationResult {
    /** バリデーション成功フラグ */
    valid: boolean;
    /** エラーメッセージ（失敗時） */
    errors?: string[];
    /** 警告メッセージ */
    warnings?: string[];
}
/**
 * 同期メタデータ（TODO.md ↔ App 同期用）
 */
export interface SyncMetadata {
    /** 最終同期日時 */
    lastSyncAt: Date;
    /** 同期元（'file' | 'app'） */
    source: 'file' | 'app';
    /** TODO.mdのハッシュ値（変更検知用） */
    fileHash?: string;
    /** 競合状態フラグ */
    hasConflict?: boolean;
    /** 同期バージョン */
    version: number;
}
/**
 * 同期イベント
 */
export interface SyncEvent {
    /** イベントタイプ */
    type: 'file_changed' | 'app_changed' | 'conflict_detected' | 'sync_completed' | 'sync_failed';
    /** タイムスタンプ */
    timestamp: Date;
    /** 変更されたタスクID */
    taskIds?: string[];
    /** エラー情報（失敗時） */
    error?: Error;
    /** メタデータ */
    metadata?: SyncMetadata;
}
/**
 * タスク統計情報
 */
export interface TaskStatistics {
    /** 合計タスク数 */
    total: number;
    /** ステータス別の件数 */
    byStatus: Record<TaskStatus, number>;
    /** 優先度別の件数 */
    byPriority: Record<TaskPriority, number>;
    /** 期限切れタスク数 */
    overdue: number;
    /** 今日期限のタスク数 */
    dueToday: number;
    /** 今週期限のタスク数 */
    dueThisWeek: number;
    /** 完了率（0-100%） */
    completionRate: number;
}
//# sourceMappingURL=task.d.ts.map