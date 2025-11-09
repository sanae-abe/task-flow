import type { Task, MarkdownSerializeOptions } from '../types';
/**
 * MarkdownSerializer - Task → TODO.md変換
 *
 * TaskオブジェクトをMarkdown形式に変換してTODO.mdを生成します。
 * セクション構造、チェックボックス、メタデータを含む完全なMarkdownを出力します。
 *
 * @example
 * ```typescript
 * const serializer = new MarkdownSerializer();
 * const markdown = await serializer.serialize(tasks, {
 *   includeFrontMatter: true,
 *   sectionSpacing: 1,
 * });
 * ```
 */
export declare class MarkdownSerializer {
    private readonly DEFAULT_OPTIONS;
    /**
     * タスクをMarkdown形式にシリアライズします
     *
     * @param tasks タスクの配列
     * @param options シリアライズオプション
     * @returns Markdown文字列
     */
    serialize(tasks: Task[], options?: MarkdownSerializeOptions): Promise<string>;
    /**
     * Front matterを生成します
     *
     * @param tasks タスクの配列
     * @returns Front matter文字列
     */
    private generateFrontMatter;
    /**
     * タスクをセクションごとにグループ化します
     *
     * @param tasks タスクの配列
     * @returns セクション名をキーとしたMap
     */
    private groupTasksBySection;
    /**
     * セクションをシリアライズします
     *
     * @param sectionName セクション名
     * @param tasks セクションのタスク
     * @param options オプション
     * @param context コンテキスト
     * @returns セクションのMarkdown
     */
    private serializeSection;
    /**
     * タスクをソートします
     *
     * @param tasks タスクの配列
     * @returns ソート済みタスク
     */
    private sortTasks;
    /**
     * タスクをシリアライズします
     *
     * @param task タスク
     * @param options オプション
     * @param context コンテキスト
     * @returns タスクのMarkdown
     */
    private serializeTask;
    /**
     * 日付をフォーマットします
     *
     * @param dateStr 日付文字列
     * @param format フォーマット形式
     * @returns フォーマット済み日付
     */
    private formatDate;
    /**
     * 単一タスクをMarkdown行に変換します
     *
     * @param task タスク
     * @param options オプション
     * @returns Markdown行
     */
    taskToMarkdownLine(task: Task, options?: MarkdownSerializeOptions): string;
    /**
     * 差分更新用：特定のタスクのMarkdown行を更新します
     *
     * @param content 既存のMarkdown
     * @param task 更新するタスク
     * @param lineNumber 行番号（0-indexed）
     * @returns 更新されたMarkdown
     */
    updateTaskLine(content: string, task: Task, lineNumber: number): string;
    /**
     * 差分更新用：タスクを追加します
     *
     * @param content 既存のMarkdown
     * @param task 追加するタスク
     * @param sectionName セクション名
     * @returns 更新されたMarkdown
     */
    addTask(content: string, task: Task, sectionName?: string): string;
    /**
     * 差分更新用：タスクを削除します
     *
     * @param content 既存のMarkdown
     * @param lineNumber 行番号（0-indexed）
     * @returns 更新されたMarkdown
     */
    removeTask(content: string, lineNumber: number): string;
    /**
     * Markdownコンテンツを整形します
     *
     * @param content Markdown
     * @returns 整形されたMarkdown
     */
    format(content: string): string;
    /**
     * タスクの統計情報を生成します
     *
     * @param tasks タスクの配列
     * @returns 統計情報のMarkdown
     */
    generateStatistics(tasks: Task[]): string;
}
//# sourceMappingURL=markdown-serializer.d.ts.map