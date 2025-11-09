/**
 * Mockファイルシステム実装
 * テスト用のインメモリファイルシステム
 */
export class MockFileSystem {
    /** インメモリファイルストレージ */
    files = new Map();
    /**
     * ファイル内容を読み込む
     * @param path ファイルパス
     * @param encoding エンコーディング（未使用・互換性のため）
     * @returns ファイル内容
     * @throws ファイルが存在しない場合
     */
    async readFile(path, _encoding) {
        const entry = this.files.get(path);
        if (!entry) {
            throw new Error(`ENOENT: no such file or directory, open '${path}'`);
        }
        return entry.content;
    }
    /**
     * ファイルに内容を書き込む
     * @param path ファイルパス
     * @param content 書き込む内容
     * @param encoding エンコーディング（未使用・互換性のため）
     */
    async writeFile(path, content, _encoding) {
        this.files.set(path, {
            content,
            mtime: new Date(),
        });
    }
    /**
     * ファイル情報を取得
     * @param path ファイルパス
     * @returns ファイル統計情報
     * @throws ファイルが存在しない場合
     */
    async stat(path) {
        const entry = this.files.get(path);
        if (!entry) {
            throw new Error(`ENOENT: no such file or directory, stat '${path}'`);
        }
        return {
            size: Buffer.byteLength(entry.content, 'utf-8'),
            mtime: entry.mtime,
        };
    }
    /**
     * ファイルの存在確認
     * @param path ファイルパス
     * @returns 存在する場合true
     */
    async exists(path) {
        return this.files.has(path);
    }
    /**
     * テストヘルパー: ファイルを直接セット
     * @param path ファイルパス
     * @param content ファイル内容
     * @param mtime 最終更新日時（省略時は現在時刻）
     */
    setFile(path, content, mtime = new Date()) {
        this.files.set(path, { content, mtime });
    }
    /**
     * テストヘルパー: 全ファイルをクリア
     */
    clear() {
        this.files.clear();
    }
    /**
     * テストヘルパー: ファイルを削除
     * @param path ファイルパス
     * @returns 削除された場合true
     */
    deleteFile(path) {
        return this.files.delete(path);
    }
    /**
     * テストヘルパー: 全ファイルパスを取得
     * @returns ファイルパスの配列
     */
    getAllPaths() {
        return Array.from(this.files.keys());
    }
    /**
     * テストヘルパー: ファイル数を取得
     * @returns ファイル数
     */
    getFileCount() {
        return this.files.size;
    }
}
//# sourceMappingURL=mock-file-system.js.map