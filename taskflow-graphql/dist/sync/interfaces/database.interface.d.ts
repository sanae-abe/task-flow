/**
 * Database抽象化インターフェース
 * IndexedDB/Supabase両対応の統一データアクセス層
 *
 * FileSystem interfaceと一貫した設計パターンを踏襲:
 * - テスタビリティとDependency Injectionのための抽象層
 * - 実装詳細を隠蔽し、異なるストレージバックエンドを透過的に切り替え可能
 * - 型安全性を最大限活用（Task, Board, Label型）
 */
import type { TaskRecord, BoardRecord, LabelRecord, TemplateRecord, WebhookRecord, WebhookDeliveryRecord } from '../../types/database';
/**
 * データベース統計情報
 * FileSystemStatsと同等の役割を持つメタデータ
 */
export interface DatabaseStats {
    /** レコード総数 */
    count: number;
    /** 最終更新日時（最新レコードのupdatedAt） */
    lastModified: Date;
    /** ストレージ使用量（推定バイト数） */
    storageSize?: number;
}
/**
 * バッチ操作結果
 */
export interface BatchOperationResult<T> {
    /** 成功したレコード */
    success: T[];
    /** 失敗したレコード（エラー情報付き） */
    failed: Array<{
        record: T;
        error: Error;
    }>;
    /** 成功数 */
    successCount: number;
    /** 失敗数 */
    failureCount: number;
}
/**
 * トランザクション操作のコンテキスト
 * 実装固有のトランザクションオブジェクトをラップ
 */
export interface TransactionContext {
    /** トランザクションID（デバッグ用） */
    id: string;
    /** トランザクション開始時刻 */
    startedAt: Date;
}
/**
 * クエリオプション（ページネーション・ソート）
 */
export interface QueryOptions {
    /** 取得件数制限 */
    limit?: number;
    /** オフセット */
    offset?: number;
    /** ソートフィールドと方向 */
    orderBy?: {
        field: string;
        direction: 'asc' | 'desc';
    };
}
/**
 * クエリ結果（ページネーション対応）
 */
export interface QueryResult<T> {
    /** 取得したレコード */
    data: T[];
    /** 総件数（フィルタ適用後） */
    total: number;
    /** 次のページがあるか */
    hasMore: boolean;
}
/**
 * データベース操作の抽象化インターフェース
 * IndexedDB/Supabase両対応の統一API
 *
 * **設計思想**:
 * - Single Responsibility: 各メソッドは1つの責務に集中
 * - Type Safety: ジェネリクスで型安全性を保証
 * - Consistency: FileSystem interfaceと一貫した命名規則
 * - Testability: Mock/Stub実装を容易にする抽象化
 *
 * **実装パターン**:
 * - IndexedDB実装: ブラウザローカルストレージ、オフライン対応
 * - Supabase実装: クラウド同期、リアルタイム更新対応
 * - Mock実装: テスト用のインメモリストレージ
 */
export interface Database {
    /**
     * タスクをIDで取得
     * @param id タスクID
     * @returns タスクレコード（存在しない場合はnull）
     * @throws データベースエラー時
     */
    getTask(id: string): Promise<TaskRecord | null>;
    /**
     * 複数タスクをIDで一括取得
     * @param ids タスクIDの配列
     * @returns タスクレコードの配列（存在しないIDは除外）
     */
    getTasks(ids: string[]): Promise<TaskRecord[]>;
    /**
     * ボードIDでタスク一覧を取得
     * @param boardId ボードID
     * @param options クエリオプション（ページネーション・ソート）
     * @returns タスク一覧とページネーション情報
     */
    getTasksByBoard(boardId: string, options?: QueryOptions): Promise<QueryResult<TaskRecord>>;
    /**
     * カラムIDでタスク一覧を取得
     * @param columnId カラムID
     * @param options クエリオプション
     * @returns タスク一覧とページネーション情報
     */
    getTasksByColumn(columnId: string, options?: QueryOptions): Promise<QueryResult<TaskRecord>>;
    /**
     * タスクを作成
     * @param task タスクレコード（idは自動生成される場合あり）
     * @returns 作成されたタスクレコード
     * @throws バリデーションエラー、制約違反時
     */
    createTask(task: TaskRecord): Promise<TaskRecord>;
    /**
     * タスクを更新
     * @param id タスクID
     * @param updates 更新内容（部分更新対応）
     * @returns 更新後のタスクレコード
     * @throws タスクが存在しない、バリデーションエラー時
     */
    updateTask(id: string, updates: Partial<TaskRecord>): Promise<TaskRecord>;
    /**
     * タスクを削除
     * @param id タスクID
     * @returns 削除成功時true
     * @throws タスクが存在しない時
     */
    deleteTask(id: string): Promise<boolean>;
    /**
     * 複数タスクを一括削除
     * @param ids タスクIDの配列
     * @returns バッチ操作結果
     */
    deleteTasks(ids: string[]): Promise<BatchOperationResult<string>>;
    /**
     * ボードをIDで取得
     * @param id ボードID
     * @returns ボードレコード（存在しない場合はnull）
     */
    getBoard(id: string): Promise<BoardRecord | null>;
    /**
     * 全ボード一覧を取得
     * @param options クエリオプション
     * @returns ボード一覧とページネーション情報
     */
    getBoards(options?: QueryOptions): Promise<QueryResult<BoardRecord>>;
    /**
     * ボードを作成
     * @param board ボードレコード
     * @returns 作成されたボードレコード
     */
    createBoard(board: BoardRecord): Promise<BoardRecord>;
    /**
     * ボードを更新
     * @param id ボードID
     * @param updates 更新内容
     * @returns 更新後のボードレコード
     */
    updateBoard(id: string, updates: Partial<BoardRecord>): Promise<BoardRecord>;
    /**
     * ボードを削除
     * @param id ボードID
     * @returns 削除成功時true
     */
    deleteBoard(id: string): Promise<boolean>;
    /**
     * ラベルをIDで取得
     * @param id ラベルID
     * @returns ラベルレコード（存在しない場合はnull）
     */
    getLabel(id: string): Promise<LabelRecord | null>;
    /**
     * ボードIDでラベル一覧を取得（グローバルラベル含む）
     * @param boardId ボードID（省略時は全グローバルラベル）
     * @returns ラベルレコードの配列
     */
    getLabelsByBoard(boardId?: string): Promise<LabelRecord[]>;
    /**
     * ラベルを作成
     * @param label ラベルレコード
     * @returns 作成されたラベルレコード
     */
    createLabel(label: LabelRecord): Promise<LabelRecord>;
    /**
     * ラベルを更新
     * @param id ラベルID
     * @param updates 更新内容
     * @returns 更新後のラベルレコード
     */
    updateLabel(id: string, updates: Partial<LabelRecord>): Promise<LabelRecord>;
    /**
     * ラベルを削除
     * @param id ラベルID
     * @returns 削除成功時true
     */
    deleteLabel(id: string): Promise<boolean>;
    /**
     * テンプレートをIDで取得
     * @param id テンプレートID
     * @returns テンプレートレコード（存在しない場合はnull）
     */
    getTemplate(id: string): Promise<TemplateRecord | null>;
    /**
     * 全テンプレート一覧を取得
     * @param options クエリオプション
     * @returns テンプレート一覧とページネーション情報
     */
    getTemplates(options?: QueryOptions): Promise<QueryResult<TemplateRecord>>;
    /**
     * カテゴリでテンプレート一覧を取得
     * @param category カテゴリ名
     * @returns テンプレートレコードの配列
     */
    getTemplatesByCategory(category: string): Promise<TemplateRecord[]>;
    /**
     * テンプレートを作成
     * @param template テンプレートレコード
     * @returns 作成されたテンプレートレコード
     */
    createTemplate(template: TemplateRecord): Promise<TemplateRecord>;
    /**
     * テンプレートを更新
     * @param id テンプレートID
     * @param updates 更新内容
     * @returns 更新後のテンプレートレコード
     */
    updateTemplate(id: string, updates: Partial<TemplateRecord>): Promise<TemplateRecord>;
    /**
     * テンプレートを削除
     * @param id テンプレートID
     * @returns 削除成功時true
     */
    deleteTemplate(id: string): Promise<boolean>;
    /**
     * Webhookを取得
     * @param id WebhookID
     * @returns Webhookレコード（存在しない場合はnull）
     */
    getWebhook?(id: string): Promise<WebhookRecord | null>;
    /**
     * 全Webhook一覧を取得
     * @returns Webhookレコードの配列
     */
    getWebhooks?(): Promise<WebhookRecord[]>;
    /**
     * Webhookを作成
     * @param webhook Webhookレコード
     * @returns 作成されたWebhookレコード
     */
    createWebhook?(webhook: WebhookRecord): Promise<WebhookRecord>;
    /**
     * Webhookを更新
     * @param id WebhookID
     * @param updates 更新内容
     * @returns 更新後のWebhookレコード
     */
    updateWebhook?(id: string, updates: Partial<WebhookRecord>): Promise<WebhookRecord>;
    /**
     * Webhookを削除
     * @param id WebhookID
     * @returns 削除成功時true
     */
    deleteWebhook?(id: string): Promise<boolean>;
    /**
     * Webhook配信履歴を作成
     * @param delivery 配信履歴レコード
     * @returns 作成された配信履歴レコード
     */
    createWebhookDelivery?(delivery: WebhookDeliveryRecord): Promise<WebhookDeliveryRecord>;
    /**
     * WebhookIDで配信履歴一覧を取得
     * @param webhookId WebhookID
     * @param options クエリオプション
     * @returns 配信履歴一覧とページネーション情報
     */
    getWebhookDeliveries?(webhookId: string, options?: QueryOptions): Promise<QueryResult<WebhookDeliveryRecord>>;
    /**
     * 複数タスクを一括作成
     * @param tasks タスクレコードの配列
     * @returns バッチ操作結果
     */
    batchCreateTasks(tasks: TaskRecord[]): Promise<BatchOperationResult<TaskRecord>>;
    /**
     * 複数タスクを一括更新
     * @param updates { id, updates }の配列
     * @returns バッチ操作結果
     */
    batchUpdateTasks(updates: Array<{
        id: string;
        updates: Partial<TaskRecord>;
    }>): Promise<BatchOperationResult<TaskRecord>>;
    /**
     * 複数ラベルを一括作成
     * @param labels ラベルレコードの配列
     * @returns バッチ操作結果
     */
    batchCreateLabels(labels: LabelRecord[]): Promise<BatchOperationResult<LabelRecord>>;
    /**
     * トランザクション内で複数操作を実行
     * @param callback トランザクションコンテキストを受け取る関数
     * @returns コールバックの戻り値
     * @throws トランザクション内のエラー、ロールバック時
     *
     * **実装例（IndexedDB）**:
     * ```typescript
     * await db.transaction(async (tx) => {
     *   const task = await db.createTask(newTask);
     *   await db.updateBoard(boardId, { updatedAt: new Date().toISOString() });
     *   return task;
     * });
     * ```
     *
     * **実装例（Supabase）**:
     * ```typescript
     * // SupabaseはRPC関数内でトランザクション処理
     * await supabase.rpc('batch_update_tasks', { tasks: [...] });
     * ```
     */
    transaction<T>(callback: (tx: TransactionContext) => Promise<T>): Promise<T>;
    /**
     * タスク統計情報を取得
     * @param boardId ボードID（省略時は全ボード）
     * @returns データベース統計情報
     */
    getTaskStats(boardId?: string): Promise<DatabaseStats>;
    /**
     * ボード統計情報を取得
     * @returns データベース統計情報
     */
    getBoardStats(): Promise<DatabaseStats>;
    /**
     * ラベル統計情報を取得
     * @param boardId ボードID（省略時は全グローバルラベル）
     * @returns データベース統計情報
     */
    getLabelStats(boardId?: string): Promise<DatabaseStats>;
    /**
     * タスクを検索（タイトル・説明での全文検索）
     * @param query 検索クエリ
     * @param boardId ボードID（省略時は全ボード）
     * @param options クエリオプション
     * @returns 検索結果とページネーション情報
     */
    searchTasks(query: string, boardId?: string, options?: QueryOptions): Promise<QueryResult<TaskRecord>>;
    /**
     * ラベルIDでタスク一覧を取得
     * @param labelId ラベルID
     * @param options クエリオプション
     * @returns タスク一覧とページネーション情報
     */
    getTasksByLabel(labelId: string, options?: QueryOptions): Promise<QueryResult<TaskRecord>>;
    /**
     * 期限日範囲でタスク一覧を取得
     * @param startDate 開始日（ISO string）
     * @param endDate 終了日（ISO string）
     * @param boardId ボードID（省略時は全ボード）
     * @param options クエリオプション
     * @returns タスク一覧とページネーション情報
     */
    getTasksByDateRange(startDate: string, endDate: string, boardId?: string, options?: QueryOptions): Promise<QueryResult<TaskRecord>>;
    /**
     * 削除済みタスク一覧を取得（ゴミ箱機能）
     * @param boardId ボードID（省略時は全ボード）
     * @param options クエリオプション
     * @returns 削除済みタスク一覧とページネーション情報
     */
    getDeletedTasks(boardId?: string, options?: QueryOptions): Promise<QueryResult<TaskRecord>>;
    /**
     * 削除済みタスクを完全削除
     * @param retentionDays 保持期間（日数）を超えたタスクを削除
     * @returns 削除されたタスクID配列
     */
    purgeDeletedTasks(retentionDays: number): Promise<string[]>;
    /**
     * データベース接続を確立
     * @throws 接続エラー時
     */
    connect(): Promise<void>;
    /**
     * データベース接続を切断
     */
    disconnect(): Promise<void>;
    /**
     * データベース接続状態を確認
     * @returns 接続済みの場合true
     */
    isConnected(): boolean;
    /**
     * データベースを初期化（テーブル作成等）
     * @throws 初期化エラー時
     */
    initialize(): Promise<void>;
    /**
     * データベースをクリア（全データ削除）
     * @throws 削除エラー時
     * @warning テスト専用、本番環境では使用禁止
     */
    clear(): Promise<void>;
}
/**
 * Database実装が必須メソッドを実装しているか検証
 */
export declare function isDatabaseImplementation(obj: unknown): obj is Database;
/**
 * バッチ操作結果が完全成功かチェック
 */
export declare function isBatchOperationSuccess<T>(result: BatchOperationResult<T>): boolean;
/**
 * クエリ結果が空かチェック
 */
export declare function isQueryResultEmpty<T>(result: QueryResult<T>): boolean;
//# sourceMappingURL=database.interface.d.ts.map