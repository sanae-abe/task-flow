import path from 'path';
import { promises as fs } from 'fs';

/**
 * PathValidator - パストラバーサル攻撃対策
 *
 * ファイルパスの検証とサニタイゼーションを行います。
 * 許可されたベースパス外へのアクセスを防ぎます。
 *
 * @example
 * ```typescript
 * const validator = new PathValidator('/Users/user/project');
 * const safePath = validator.validate('../../../etc/passwd'); // Error: Path traversal detected
 * const validPath = validator.validate('./TODO.md'); // OK: /Users/user/project/TODO.md
 * ```
 */
export class PathValidator {
  private allowedBasePath: string;
  private allowedRealPath: string | null = null;

  /**
   * @param basePath 許可するベースパス（デフォルト: プロセスの現在のディレクトリ）
   */
  constructor(basePath: string = process.cwd()) {
    this.allowedBasePath = path.resolve(basePath);
  }

  /**
   * allowedBasePathの実パス（シンボリックリンク解決済み）を取得
   * @private
   */
  private async getAllowedRealPath(): Promise<string> {
    if (!this.allowedRealPath) {
      try {
        this.allowedRealPath = await fs.realpath(this.allowedBasePath);
      } catch {
        // realpathが失敗した場合はallowedBasePathをそのまま使用
        this.allowedRealPath = this.allowedBasePath;
      }
    }
    return this.allowedRealPath;
  }

  /**
   * ファイルパスを検証し、安全な絶対パスを返します
   *
   * @param filePath 検証するファイルパス
   * @returns 検証済みの絶対パス
   * @throws パストラバーサルが検出された場合、または不正なパス形式の場合
   */
  validate(filePath: string): string {
    // 空文字列・null・undefinedチェック
    if (!filePath || typeof filePath !== 'string') {
      throw new Error('Invalid file path: path must be a non-empty string');
    }

    // nullバイト攻撃対策
    if (filePath.includes('\0')) {
      throw new Error('Invalid file path: null byte detected');
    }

    // 絶対パスに解決
    const resolvedPath = path.resolve(this.allowedBasePath, filePath);

    // パストラバーサルチェック
    if (!resolvedPath.startsWith(this.allowedBasePath)) {
      throw new Error(
        `Path traversal detected: ${filePath} resolves outside allowed base path`
      );
    }

    // Windowsの代替データストリーム対策
    if (process.platform === 'win32' && resolvedPath.includes(':')) {
      const colonCount = (resolvedPath.match(/:/g) || []).length;
      if (colonCount > 1) {
        throw new Error(
          'Invalid file path: alternate data streams not allowed'
        );
      }
    }

    return resolvedPath;
  }

  /**
   * ファイルパスを検証し、シンボリックリンクを解決した安全な絶対パスを返します
   * （非同期版 - シンボリックリンク対策付き）
   *
   * @param filePath 検証するファイルパス
   * @returns 検証済みの絶対パス（シンボリックリンク解決済み）
   * @throws パストラバーサルが検出された場合、またはシンボリックリンク経由の不正アクセスが検出された場合
   */
  async validateAsync(filePath: string): Promise<string> {
    // 基本検証（同期版と同じ）
    const resolvedPath = this.validate(filePath);

    // allowedBasePathの実パスを取得（シンボリックリンク解決済み）
    const allowedRealPath = await this.getAllowedRealPath();

    try {
      // シンボリックリンク解決（実際のパスを取得）
      const realPath = await fs.realpath(resolvedPath);

      // 実際のパスもallowedRealPath配下か確認
      if (!realPath.startsWith(allowedRealPath)) {
        throw new Error(
          `Symbolic link traversal detected: ${filePath} resolves to ${realPath} which is outside allowed base path`
        );
      }

      return realPath;
    } catch (error: any) {
      // ファイル未存在は許可（新規作成時）
      if (error.code === 'ENOENT') {
        return resolvedPath;
      }

      // その他のエラー（権限エラー等）は再スロー
      throw error;
    }
  }

  /**
   * ファイルサイズを検証します
   *
   * @param filePath 検証するファイルパス
   * @param maxSizeMB 最大サイズ（MB）
   * @throws ファイルサイズが制限を超える場合
   */
  async validateFileSize(
    filePath: string,
    maxSizeMB: number = 5
  ): Promise<void> {
    const stats = await fs.stat(filePath);
    const maxBytes = maxSizeMB * 1024 * 1024;

    if (stats.size > maxBytes) {
      throw new Error(
        `File size exceeds ${maxSizeMB}MB limit: ${Math.round((stats.size / 1024 / 1024) * 100) / 100}MB`
      );
    }
  }

  /**
   * ファイルが存在することを確認します
   *
   * @param filePath 確認するファイルパス
   * @returns ファイルが存在する場合はtrue
   */
  async exists(filePath: string): Promise<boolean> {
    try {
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * ファイルが読み取り可能であることを確認します
   *
   * @param filePath 確認するファイルパス
   * @returns ファイルが読み取り可能な場合はtrue
   */
  async isReadable(filePath: string): Promise<boolean> {
    try {
      await fs.access(filePath, fs.constants.R_OK);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * ファイルが書き込み可能であることを確認します
   *
   * @param filePath 確認するファイルパス
   * @returns ファイルが書き込み可能な場合はtrue
   */
  async isWritable(filePath: string): Promise<boolean> {
    try {
      await fs.access(filePath, fs.constants.W_OK);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * 許可されたベースパスを取得します
   *
   * @returns 許可されたベースパス
   */
  getAllowedBasePath(): string {
    return this.allowedBasePath;
  }
}
