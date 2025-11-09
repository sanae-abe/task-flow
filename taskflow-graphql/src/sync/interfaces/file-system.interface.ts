/**
 * FileSystem抽象化インターフェース
 * 実ファイルシステムとMockファイルシステムの統一インターフェース
 */
export interface FileSystemStats {
  /** ファイルサイズ（バイト） */
  size: number;
  /** 最終更新日時 */
  mtime: Date;
}

/**
 * ファイルシステム操作の抽象化インターフェース
 * テスタビリティとDependency Injectionのための抽象層
 */
export interface FileSystem {
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
  writeFile(
    path: string,
    content: string,
    encoding?: BufferEncoding
  ): Promise<void>;

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
