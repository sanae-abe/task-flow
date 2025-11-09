/**
 * MarkdownSanitizer - XSS攻撃対策
 *
 * TODO.mdから読み込んだMarkdownテキストをサニタイズします。
 * 悪意あるスクリプトやHTMLタグを除去します。
 *
 * @example
 * ```typescript
 * const sanitizer = new MarkdownSanitizer();
 * const safeTitle = sanitizer.sanitizeTitle('<script>alert("XSS")</script>Task');
 * // => 'Task'
 * ```
 */
export declare class MarkdownSanitizer {
    /**
     * タスクタイトルをサニタイズします
     *
     * すべてのHTMLタグと属性を除去し、プレーンテキストのみを返します。
     *
     * @param title サニタイズするタイトル
     * @returns サニタイズされたタイトル
     */
    sanitizeTitle(title: string): string;
    /**
     * タスク説明をサニタイズします
     *
     * 基本的なMarkdownタグ（強調、リンク等）のみを許可します。
     *
     * @param description サニタイズする説明
     * @returns サニタイズされた説明
     */
    sanitizeDescription(description: string): string;
    /**
     * Markdownコンテンツ全体をサニタイズします
     *
     * 一般的なMarkdown要素を許可しつつ、危険なタグを除去します。
     *
     * @param content サニタイズするコンテンツ
     * @returns サニタイズされたコンテンツ
     */
    sanitizeMarkdown(content: string): string;
    /**
     * URLをサニタイズします
     *
     * @param url サニタイズするURL
     * @returns サニタイズされたURL（安全でない場合は空文字列）
     */
    sanitizeUrl(url: string): string;
    /**
     * セクション名をサニタイズします
     *
     * @param section サニタイズするセクション名
     * @returns サニタイズされたセクション名
     */
    sanitizeSection(section: string): string;
    /**
     * 複数行のテキストをサニタイズします
     *
     * @param text サニタイズするテキスト
     * @returns サニタイズされたテキスト（行ごと）
     */
    sanitizeMultiline(text: string): string;
    /**
     * バッチでタイトルをサニタイズします
     *
     * @param titles サニタイズするタイトルの配列
     * @returns サニタイズされたタイトルの配列
     */
    sanitizeTitles(titles: string[]): string[];
    /**
     * サニタイズが必要かどうかをチェックします
     *
     * @param text チェックするテキスト
     * @returns HTMLタグが含まれる場合はtrue
     */
    needsSanitization(text: string): boolean;
}
//# sourceMappingURL=sanitizer.d.ts.map