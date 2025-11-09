import type { FileSystem, FileSystemStats } from '../interfaces/file-system.interface.js';
/**
 * Mockファイルシステム実装
 * テスト用のインメモリファイルシステム
 */
export declare class MockFileSystem implements FileSystem {
    /** インメモリファイルストレージ */
    private readonly files;
    /**
     * ファイル内容を読み込む
     * @param path ファイルパス
     * @param encoding エンコーディング（未使用・互換性のため）
     * @returns ファイル内容
     * @throws ファイルが存在しない場合
     */
    readFile(path: string, _encoding?: BufferEncoding): Promise<string>;
    /**
     * ファイルに内容を書き込む
     * @param path ファイルパス
     * @param content 書き込む内容
     * @param encoding エンコーディング（未使用・互換性のため）
     */
    writeFile(path: string, content: string, _encoding?: BufferEncoding): Promise<void>;
    /**
     * ファイル情報を取得
     * @param path ファイルパス
     * @returns ファイル統計情報
     * @throws ファイルが存在しない場合
     */
    stat(path: string): Promise<FileSystemStats>;
    /**
     * ファイルの存在確認
     * @param path ファイルパス
     * @returns 存在する場合true
     */
    exists(path: string): Promise<boolean>;
    /**
     * テストヘルパー: ファイルを直接セット
     * @param path ファイルパス
     * @param content ファイル内容
     * @param mtime 最終更新日時（省略時は現在時刻）
     */
    setFile(path: string, content: string, mtime?: Date): void;
    /**
     * テストヘルパー: 全ファイルをクリア
     */
    clear(): void;
    /**
     * テストヘルパー: ファイルを削除
     * @param path ファイルパス
     * @returns 削除された場合true
     */
    deleteFile(path: string): boolean;
    /**
     * テストヘルパー: 全ファイルパスを取得
     * @returns ファイルパスの配列
     */
    getAllPaths(): string[];
    /**
     * テストヘルパー: ファイル数を取得
     * @returns ファイル数
     */
    getFileCount(): number;
}
//# sourceMappingURL=mock-file-system.d.ts.map