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
export class BatchWriter {
    db;
    /**
     * @param db IndexedDBインスタンス（将来的に抽象化）
     */
    constructor(db) {
        this.db = db;
        // 将来的にDI対応
    }
    /**
     * 複数のタスクを一括でupsertします
     *
     * @param tasks upsertするタスクの配列
     * @returns 書き込まれたタスク数
     */
    async bulkUpsertTasks(tasks) {
        if (!this.db) {
            throw new Error('Database not initialized');
        }
        if (tasks.length === 0) {
            return 0;
        }
        // 1トランザクションで全タスクを書き込み
        const tx = this.db.transaction('tasks', 'readwrite');
        const store = tx.objectStore('tasks');
        // 並列でputを実行
        const promises = tasks.map(task => store.put(task));
        await Promise.all([...promises, tx.done]);
        return tasks.length;
    }
    /**
     * 複数のタスクを一括で削除します
     *
     * @param taskIds 削除するタスクIDの配列
     * @returns 削除されたタスク数
     */
    async bulkDeleteTasks(taskIds) {
        if (!this.db) {
            throw new Error('Database not initialized');
        }
        if (taskIds.length === 0) {
            return 0;
        }
        const tx = this.db.transaction('tasks', 'readwrite');
        const store = tx.objectStore('tasks');
        const promises = taskIds.map(id => store.delete(id));
        await Promise.all([...promises, tx.done]);
        return taskIds.length;
    }
    /**
     * 複数のタスクを一括で取得します
     *
     * @param taskIds 取得するタスクIDの配列
     * @returns タスクの配列
     */
    async bulkGetTasks(taskIds) {
        if (!this.db) {
            throw new Error('Database not initialized');
        }
        if (taskIds.length === 0) {
            return [];
        }
        const tx = this.db.transaction('tasks', 'readonly');
        const store = tx.objectStore('tasks');
        const promises = taskIds.map(id => store.get(id));
        return await Promise.all(promises);
    }
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
    async bulkUpsertTasksChunked(tasks, chunkSize = 1000) {
        if (tasks.length === 0) {
            return 0;
        }
        let totalWritten = 0;
        for (let i = 0; i < tasks.length; i += chunkSize) {
            const chunk = tasks.slice(i, i + chunkSize);
            const written = await this.bulkUpsertTasks(chunk);
            totalWritten += written;
        }
        return totalWritten;
    }
    /**
     * トランザクション内で複数の操作を実行します
     *
     * @param operations 実行する操作の配列
     */
    async transaction(operations) {
        if (!this.db) {
            throw new Error('Database not initialized');
        }
        const mode = operations.some(op => op.type !== 'get')
            ? 'readwrite'
            : 'readonly';
        const tx = this.db.transaction('tasks', mode);
        const store = tx.objectStore('tasks');
        const promises = operations.map(op => {
            switch (op.type) {
                case 'put':
                    return store.put(op.data);
                case 'delete':
                    return store.delete(op.data);
                case 'get':
                    return store.get(op.data);
            }
        });
        await Promise.all([...promises, tx.done]);
    }
    /**
     * 統計情報を取得します
     *
     * @returns タスク数
     */
    async getTaskCount() {
        if (!this.db) {
            throw new Error('Database not initialized');
        }
        const tx = this.db.transaction('tasks', 'readonly');
        const store = tx.objectStore('tasks');
        return await store.count();
    }
    /**
     * すべてのタスクを削除します（危険な操作）
     *
     * @returns 削除されたタスク数
     */
    async clearAllTasks() {
        if (!this.db) {
            throw new Error('Database not initialized');
        }
        const count = await this.getTaskCount();
        const tx = this.db.transaction('tasks', 'readwrite');
        const store = tx.objectStore('tasks');
        await store.clear();
        await tx.done;
        return count;
    }
}
//# sourceMappingURL=batch-writer.js.map