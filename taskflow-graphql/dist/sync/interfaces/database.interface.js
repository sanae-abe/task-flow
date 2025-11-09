/**
 * Database抽象化インターフェース
 * IndexedDB/Supabase両対応の統一データアクセス層
 *
 * FileSystem interfaceと一貫した設計パターンを踏襲:
 * - テスタビリティとDependency Injectionのための抽象層
 * - 実装詳細を隠蔽し、異なるストレージバックエンドを透過的に切り替え可能
 * - 型安全性を最大限活用（Task, Board, Label型）
 */
// ============================================================================
// Type Guards & Utilities
// ============================================================================
/**
 * Database実装が必須メソッドを実装しているか検証
 */
export function isDatabaseImplementation(obj) {
    if (typeof obj !== 'object' || obj === null)
        return false;
    const db = obj;
    return (typeof db.getTask === 'function' &&
        typeof db.createTask === 'function' &&
        typeof db.updateTask === 'function' &&
        typeof db.deleteTask === 'function' &&
        typeof db.getBoard === 'function' &&
        typeof db.createBoard === 'function' &&
        typeof db.getLabel === 'function' &&
        typeof db.createLabel === 'function' &&
        typeof db.transaction === 'function' &&
        typeof db.connect === 'function' &&
        typeof db.disconnect === 'function' &&
        typeof db.isConnected === 'function');
}
/**
 * バッチ操作結果が完全成功かチェック
 */
export function isBatchOperationSuccess(result) {
    return result.failureCount === 0 && result.successCount > 0;
}
/**
 * クエリ結果が空かチェック
 */
export function isQueryResultEmpty(result) {
    return result.data.length === 0 && result.total === 0;
}
//# sourceMappingURL=database.interface.js.map