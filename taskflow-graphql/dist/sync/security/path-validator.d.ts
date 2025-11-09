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
export declare class PathValidator {
    private allowedBasePath;
    private allowedRealPath;
    /**
     * @param basePath 許可するベースパス（デフォルト: プロセスの現在のディレクトリ）
     */
    constructor(basePath?: string);
    /**
     * allowedBasePathの実パス（シンボリックリンク解決済み）を取得
     * @private
     */
    private getAllowedRealPath;
    /**
     * ファイルパスを検証し、安全な絶対パスを返します
     *
     * @param filePath 検証するファイルパス
     * @returns 検証済みの絶対パス
     * @throws パストラバーサルが検出された場合、または不正なパス形式の場合
     */
    validate(filePath: string): string;
    /**
     * ファイルパスを検証し、シンボリックリンクを解決した安全な絶対パスを返します
     * （非同期版 - シンボリックリンク対策付き）
     *
     * @param filePath 検証するファイルパス
     * @returns 検証済みの絶対パス（シンボリックリンク解決済み）
     * @throws パストラバーサルが検出された場合、またはシンボリックリンク経由の不正アクセスが検出された場合
     */
    validateAsync(filePath: string): Promise<string>;
    /**
     * ファイルサイズを検証します
     *
     * @param filePath 検証するファイルパス
     * @param maxSizeMB 最大サイズ（MB）
     * @throws ファイルサイズが制限を超える場合
     */
    validateFileSize(filePath: string, maxSizeMB?: number): Promise<void>;
    /**
     * ファイルが存在することを確認します
     *
     * @param filePath 確認するファイルパス
     * @returns ファイルが存在する場合はtrue
     */
    exists(filePath: string): Promise<boolean>;
    /**
     * ファイルが読み取り可能であることを確認します
     *
     * @param filePath 確認するファイルパス
     * @returns ファイルが読み取り可能な場合はtrue
     */
    isReadable(filePath: string): Promise<boolean>;
    /**
     * ファイルが書き込み可能であることを確認します
     *
     * @param filePath 確認するファイルパス
     * @returns ファイルが書き込み可能な場合はtrue
     */
    isWritable(filePath: string): Promise<boolean>;
    /**
     * 許可されたベースパスを取得します
     *
     * @returns 許可されたベースパス
     */
    getAllowedBasePath(): string;
}
//# sourceMappingURL=path-validator.d.ts.map