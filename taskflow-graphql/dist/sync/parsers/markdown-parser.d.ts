import type { MarkdownParseResult, ParsedTask } from '../types';
/**
 * MarkdownParser - TODO.mdパーサー
 *
 * TODO.mdファイルをパースして、タスク情報を抽出します。
 * Front matter、セクション、チェックボックスを解析します。
 *
 * @example
 * ```typescript
 * const parser = new MarkdownParser();
 * const result = await parser.parse(markdownContent);
 *
 * console.log(result.frontMatter);  // { version: 1.2, title: "TODO" }
 * console.log(result.sections);     // [{ name: "高優先", level: 2, ... }]
 * console.log(result.checkboxes);   // [{ checked: false, text: "タスク1", ... }]
 * ```
 */
export declare class MarkdownParser {
    private readonly FRONT_MATTER_DELIMITER;
    private readonly HEADING_PATTERN;
    private readonly CHECKBOX_PATTERN;
    private readonly DUE_DATE_PATTERN;
    private readonly PRIORITY_PATTERN;
    private readonly TAG_PATTERN;
    /**
     * Markdownコンテンツをパースします
     *
     * @param content Markdownコンテンツ
     * @returns パース結果
     */
    parse(content: string): Promise<MarkdownParseResult>;
    /**
     * Front matterをパースします
     *
     * @param lines 行の配列
     * @returns Front matterとコンテンツ開始行
     */
    private parseFrontMatter;
    /**
     * セクション（見出し）をパースします
     *
     * @param lines 行の配列
     * @param startLine 開始行
     * @returns セクションの配列
     */
    private parseSections;
    /**
     * チェックボックスをパースします
     *
     * @param lines 行の配列
     * @param startLine 開始行
     * @returns チェックボックスの配列
     */
    private parseCheckboxes;
    /**
     * チェックボックスをParsedTaskに変換します
     *
     * @param checkbox チェックボックス
     * @returns ParsedTask
     */
    private checkboxToTask;
    /**
     * タイトルからメタデータを抽出します
     *
     * @param text タイトルテキスト
     * @returns メタデータ
     */
    private extractMetadata;
    /**
     * タイトルからメタデータ情報を除去します
     *
     * @param text タイトルテキスト
     * @returns クリーンなタイトル
     */
    private cleanTitle;
    /**
     * パース結果からタスクを抽出します
     *
     * @param result パース結果
     * @returns ParsedTaskの配列
     */
    extractTasks(result: MarkdownParseResult): ParsedTask[];
    /**
     * 特定のセクションのタスクのみを抽出します
     *
     * @param result パース結果
     * @param sectionName セクション名
     * @returns ParsedTaskの配列
     */
    extractTasksBySection(result: MarkdownParseResult, sectionName: string): ParsedTask[];
    /**
     * 空のパース結果を返します
     *
     * @returns 空のMarkdownParseResult
     */
    private emptyResult;
    /**
     * Markdownコンテンツを検証します
     *
     * @param content Markdownコンテンツ
     * @returns 検証結果
     */
    validate(content: string): {
        valid: boolean;
        errors: string[];
        warnings: string[];
    };
}
//# sourceMappingURL=markdown-parser.d.ts.map