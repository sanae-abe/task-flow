import type { IDBPDatabase } from 'idb';
import type { Task } from '../types';
/**
 * BatchWriter - IndexedDBバッチ書き込み
 *
 * N+1問題を解決するため、複数のタスクを1トランザクションで書き込みます。
 * パフォーマンスを大幅に向上させます。
 *
 * @example
 * ```typescript
 * const writer = new BatchWriter(db);
 * await writer.bulkUpsertTasks(tasks); // 1トランザクションで全タスク書き込み
 * ```
 */
export declare class BatchWriter {
    private db?;
    /**
     * @param db IndexedDBインスタンス（将来的に抽象化）
     */
    constructor(db?: IDBPDatabase | undefined);
    /**
     * 複数のタスクを一括でupsertします
     *
     * @param tasks upsertするタスクの配列
     * @returns 書き込まれたタスク数
     */
    bulkUpsertTasks(tasks: Task[]): Promise<number>;
    /**
     * 複数のタスクを一括で削除します
     *
     * @param taskIds 削除するタスクIDの配列
     * @returns 削除されたタスク数
     */
    bulkDeleteTasks(taskIds: string[]): Promise<number>;
    /**
     * 複数のタスクを一括で取得します
     *
     * @param taskIds 取得するタスクIDの配列
     * @returns タスクの配列
     */
    bulkGetTasks(taskIds: string[]): Promise<(Task | undefined)[]>;
    /**
     * チャンクサイズを指定して一括書き込みします
     *
     * 大量のタスク（10,000+）を扱う場合、メモリを節約するため
     * チャンクに分割して書き込みます。
     *
     * @param tasks upsertするタスクの配列
     * @param chunkSize チャンクサイズ（デフォルト: 1000）
     * @returns 書き込まれたタスク数
     */
    bulkUpsertTasksChunked(tasks: Task[], chunkSize?: number): Promise<number>;
    /**
     * トランザクション内で複数の操作を実行します
     *
     * @param operations 実行する操作の配列
     */
    transaction(operations: Array<{
        type: 'put' | 'delete' | 'get';
        data: Task | string;
    }>): Promise<void>;
    /**
     * 統計情報を取得します
     *
     * @returns タスク数
     */
    getTaskCount(): Promise<number>;
    /**
     * すべてのタスクを削除します（危険な操作）
     *
     * @returns 削除されたタスク数
     */
    clearAllTasks(): Promise<number>;
}
//# sourceMappingURL=batch-writer.d.ts.map