import type { FileSystem, FileSystemStats } from '../interfaces/file-system.interface.js';
/**
 * 実ファイルシステム実装
 * Node.js fs.promisesをラップし、FileSystemインターフェースを実装
 */
export declare class RealFileSystem implements FileSystem {
    /**
     * ファイル内容を読み込む
     * @param path ファイルパス
     * @param encoding エンコーディング（デフォルト: 'utf-8'）
     * @returns ファイル内容
     * @throws ファイルが存在しない場合や読み込みエラー
     */
    readFile(path: string, encoding?: BufferEncoding): Promise<string>;
    /**
     * ファイルに内容を書き込む
     * @param path ファイルパス
     * @param content 書き込む内容
     * @param encoding エンコーディング（デフォルト: 'utf-8'）
     * @throws 書き込みエラー
     */
    writeFile(path: string, content: string, encoding?: BufferEncoding): Promise<void>;
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
}
/**
 * シングルトンインスタンス
 * 実装の再利用のためのデフォルトエクスポート
 */
export declare const realFileSystem: RealFileSystem;
//# sourceMappingURL=real-file-system.d.ts.map