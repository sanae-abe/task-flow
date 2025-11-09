import { promises as fs } from 'node:fs';
import type {
  FileSystem,
  FileSystemStats,
} from '../interfaces/file-system.interface.js';

/**
 * 実ファイルシステム実装
 * Node.js fs.promisesをラップし、FileSystemインターフェースを実装
 */
export class RealFileSystem implements FileSystem {
  /**
   * ファイル内容を読み込む
   * @param path ファイルパス
   * @param encoding エンコーディング（デフォルト: 'utf-8'）
   * @returns ファイル内容
   * @throws ファイルが存在しない場合や読み込みエラー
   */
  async readFile(
    path: string,
    encoding: BufferEncoding = 'utf-8'
  ): Promise<string> {
    try {
      return await fs.readFile(path, { encoding });
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to read file at ${path}: ${error.message}`);
      }
      throw error;
    }
  }

  /**
   * ファイルに内容を書き込む
   * @param path ファイルパス
   * @param content 書き込む内容
   * @param encoding エンコーディング（デフォルト: 'utf-8'）
   * @throws 書き込みエラー
   */
  async writeFile(
    path: string,
    content: string,
    encoding: BufferEncoding = 'utf-8'
  ): Promise<void> {
    try {
      await fs.writeFile(path, content, { encoding });
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to write file at ${path}: ${error.message}`);
      }
      throw error;
    }
  }

  /**
   * ファイル情報を取得
   * @param path ファイルパス
   * @returns ファイル統計情報
   * @throws ファイルが存在しない場合
   */
  async stat(path: string): Promise<FileSystemStats> {
    try {
      const stats = await fs.stat(path);
      return {
        size: stats.size,
        mtime: stats.mtime,
      };
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to stat file at ${path}: ${error.message}`);
      }
      throw error;
    }
  }

  /**
   * ファイルの存在確認
   * @param path ファイルパス
   * @returns 存在する場合true
   */
  async exists(path: string): Promise<boolean> {
    try {
      await fs.access(path);
      return true;
    } catch {
      return false;
    }
  }
}

/**
 * シングルトンインスタンス
 * 実装の再利用のためのデフォルトエクスポート
 */
export const realFileSystem = new RealFileSystem();
