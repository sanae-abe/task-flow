/**
 * 差分の種類
 */
export declare enum DiffType {
    /** 変更なし */
    EQUAL = 0,
    /** 削除 */
    DELETE = -1,
    /** 追加 */
    INSERT = 1
}
/**
 * 差分結果
 */
export interface DiffResult {
    /** 差分の種類 */
    type: DiffType;
    /** 変更されたテキスト */
    text: string;
}
/**
 * 変更サマリー
 */
export interface ChangeSummary {
    /** 変更があったか */
    hasChanges: boolean;
    /** 追加された行数 */
    addedLines: number;
    /** 削除された行数 */
    deletedLines: number;
    /** 変更された行数 */
    modifiedLines: number;
    /** 追加された文字数 */
    addedChars: number;
    /** 削除された文字数 */
    deletedChars: number;
    /** 変更の重大度（0-100） */
    changeSeverity: number;
}
/**
 * 行単位の変更情報
 */
export interface LineChange {
    /** 行番号（0-indexed） */
    lineNumber: number;
    /** 変更の種類 */
    type: 'added' | 'deleted' | 'modified';
    /** 古い内容（削除・変更の場合） */
    oldContent?: string;
    /** 新しい内容（追加・変更の場合） */
    newContent?: string;
}
/**
 * DiffDetector - TODO.md差分検出
 *
 * fast-diffを使用して効率的に差分を検出します。
 * 全体パースの代わりに増分更新を可能にし、パフォーマンスを大幅に向上させます。
 *
 * @example
 * ```typescript
 * const detector = new DiffDetector();
 * const diffs = detector.detectDiff(oldContent, newContent);
 * const summary = detector.getSummary(diffs);
 *
 * if (summary.hasChanges) {
 *   const changes = detector.getLineChanges(oldContent, newContent);
 *   // 変更された行のみを処理
 * }
 * ```
 */
export declare class DiffDetector {
    /**
     * 2つのテキスト間の差分を検出します
     *
     * @param oldText 古いテキスト
     * @param newText 新しいテキスト
     * @returns 差分結果の配列
     */
    detectDiff(oldText: string, newText: string): DiffResult[];
    /**
     * 差分から変更サマリーを生成します
     *
     * @param diffs 差分結果の配列
     * @returns 変更サマリー
     */
    getSummary(diffs: DiffResult[]): ChangeSummary;
    /**
     * 行単位の変更情報を取得します
     *
     * @param oldText 古いテキスト
     * @param newText 新しいテキスト
     * @returns 行単位の変更情報の配列
     */
    getLineChanges(oldText: string, newText: string): LineChange[];
    /**
     * 特定のパターンにマッチする変更のみを抽出します
     *
     * @param diffs 差分結果の配列
     * @param pattern 検索パターン（正規表現）
     * @returns マッチした差分結果の配列
     */
    filterByPattern(diffs: DiffResult[], pattern: RegExp): DiffResult[];
    /**
     * 変更がタスク関連かどうかを判定します
     *
     * @param diffs 差分結果の配列
     * @returns タスク関連の変更がある場合はtrue
     */
    hasTaskChanges(diffs: DiffResult[]): boolean;
    /**
     * 変更がメタデータ関連かどうかを判定します
     *
     * @param diffs 差分結果の配列
     * @returns メタデータ関連の変更がある場合はtrue
     */
    hasMetadataChanges(diffs: DiffResult[]): boolean;
    /**
     * 差分を人間が読みやすい形式で出力します
     *
     * @param diffs 差分結果の配列
     * @param maxLength 最大表示文字数（デフォルト: 100）
     * @returns フォーマットされた文字列
     */
    formatDiff(diffs: DiffResult[], maxLength?: number): string;
    /**
     * 2つのファイル内容が同一かどうかを高速に判定します
     *
     * @param content1 ファイル内容1
     * @param content2 ファイル内容2
     * @returns 同一の場合はtrue
     */
    isIdentical(content1: string, content2: string): boolean;
    /**
     * 変更が閾値を超えているかを判定します
     *
     * @param diffs 差分結果の配列
     * @param thresholdChars 文字数閾値（デフォルト: 1000）
     * @returns 閾値を超えている場合はtrue
     */
    exceedsThreshold(diffs: DiffResult[], thresholdChars?: number): boolean;
    /**
     * 差分を統計情報として出力します
     *
     * @param diffs 差分結果の配列
     * @returns 統計情報オブジェクト
     */
    getStatistics(diffs: DiffResult[]): {
        totalDiffs: number;
        insertions: number;
        deletions: number;
        unchanged: number;
        summary: ChangeSummary;
    };
    /**
     * 複数の変更をマージします
     *
     * @param diffsList 複数の差分結果配列
     * @returns マージされた差分結果
     */
    mergeDiffs(diffsList: DiffResult[][]): DiffResult[];
    /**
     * チャンク単位で差分を検出します（大容量ファイル対応）
     *
     * @param oldText 古いテキスト
     * @param newText 新しいテキスト
     * @param chunkSize チャンクサイズ（文字数）
     * @returns 差分結果の配列
     */
    detectDiffChunked(oldText: string, newText: string, chunkSize?: number): DiffResult[];
}
//# sourceMappingURL=diff-detector.d.ts.map