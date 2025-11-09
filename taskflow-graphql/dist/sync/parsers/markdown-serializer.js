import { Logger } from '../utils/logger';
import { MarkdownSanitizer } from '../security/sanitizer';
const logger = Logger.getInstance();
const sanitizer = new MarkdownSanitizer();
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
export class MarkdownSerializer {
    DEFAULT_OPTIONS = {
        includeFrontMatter: true,
        indent: '  ',
        sectionSpacing: 1,
        checkboxFormat: {
            checked: '[x]',
            unchecked: '[ ]',
        },
        dateFormat: 'iso',
    };
    /**
     * タスクをMarkdown形式にシリアライズします
     *
     * @param tasks タスクの配列
     * @param options シリアライズオプション
     * @returns Markdown文字列
     */
    async serialize(tasks, options = {}) {
        const timer = logger.startTimer('markdown-serialize');
        try {
            const opts = { ...this.DEFAULT_OPTIONS, ...options };
            const context = {
                currentIndentLevel: 0,
                stats: {
                    totalTasks: tasks.length,
                    convertedTasks: 0,
                    skippedTasks: 0,
                    errors: 0,
                },
                errors: [],
            };
            logger.debug({ taskCount: tasks.length }, 'Starting markdown serialization');
            const sections = [];
            // Front matter
            if (opts.includeFrontMatter) {
                sections.push(this.generateFrontMatter(tasks));
            }
            // タスクをセクションごとにグループ化
            const tasksBySection = this.groupTasksBySection(tasks);
            // セクションごとにMarkdownを生成
            for (const [sectionName, sectionTasks] of tasksBySection) {
                context.currentSection = sectionName;
                const sectionMarkdown = this.serializeSection(sectionName, sectionTasks, opts, context);
                sections.push(sectionMarkdown);
            }
            // セクション間に空行を追加
            const spacing = '\n'.repeat(opts.sectionSpacing || 1);
            const markdown = sections.join(spacing);
            timer.done({
                itemsProcessed: context.stats.convertedTasks,
                operation: 'markdown-serialize',
            });
            logger.info({
                totalTasks: context.stats.totalTasks,
                convertedTasks: context.stats.convertedTasks,
                skippedTasks: context.stats.skippedTasks,
                errors: context.stats.errors,
            }, 'Markdown serialization completed');
            if (context.errors.length > 0) {
                logger.warn({ errors: context.errors }, 'Serialization completed with errors');
            }
            return markdown;
        }
        catch (error) {
            logger.error({ err: error }, 'Failed to serialize markdown');
            throw error;
        }
    }
    /**
     * Front matterを生成します
     *
     * @param tasks タスクの配列
     * @returns Front matter文字列
     */
    generateFrontMatter(tasks) {
        const lines = [];
        lines.push('---');
        lines.push(`title: TODO`);
        lines.push(`version: 1.2`);
        lines.push(`created: ${new Date().toISOString()}`);
        lines.push(`updated: ${new Date().toISOString()}`);
        lines.push(`tasks: ${tasks.length}`);
        lines.push('---');
        return lines.join('\n');
    }
    /**
     * タスクをセクションごとにグループ化します
     *
     * @param tasks タスクの配列
     * @returns セクション名をキーとしたMap
     */
    groupTasksBySection(tasks) {
        const grouped = new Map();
        for (const task of tasks) {
            const section = task.section || '未分類';
            if (!grouped.has(section)) {
                grouped.set(section, []);
            }
            grouped.get(section).push(task);
        }
        // セクションをソート（優先度順）
        const sorted = new Map(Array.from(grouped.entries()).sort(([a], [b]) => {
            // 特定のセクションを優先
            const priority = ['🔴 最優先', '🟡 重要', '🟢 通常', '未分類'];
            const aIndex = priority.indexOf(a);
            const bIndex = priority.indexOf(b);
            if (aIndex !== -1 && bIndex !== -1) {
                return aIndex - bIndex;
            }
            else if (aIndex !== -1) {
                return -1;
            }
            else if (bIndex !== -1) {
                return 1;
            }
            return a.localeCompare(b);
        }));
        return sorted;
    }
    /**
     * セクションをシリアライズします
     *
     * @param sectionName セクション名
     * @param tasks セクションのタスク
     * @param options オプション
     * @param context コンテキスト
     * @returns セクションのMarkdown
     */
    serializeSection(sectionName, tasks, options, context) {
        const lines = [];
        // セクション見出し
        lines.push(`## ${sanitizer.sanitizeSection(sectionName)}`);
        lines.push('');
        // タスクをソート（order、priority、createdAt順）
        const sortedTasks = this.sortTasks(tasks);
        // タスクをシリアライズ
        for (const task of sortedTasks) {
            try {
                const taskMarkdown = this.serializeTask(task, options, context);
                lines.push(taskMarkdown);
                context.stats.convertedTasks++;
            }
            catch (error) {
                logger.error({ err: error, taskId: task.id }, 'Failed to serialize task');
                context.stats.errors++;
                context.errors.push({
                    line: context.stats.convertedTasks,
                    message: error instanceof Error ? error.message : String(error),
                });
            }
        }
        return lines.join('\n');
    }
    /**
     * タスクをソートします
     *
     * @param tasks タスクの配列
     * @returns ソート済みタスク
     */
    sortTasks(tasks) {
        return tasks.sort((a, b) => {
            // order指定があればそれを優先
            if (a.order !== undefined && b.order !== undefined) {
                return a.order - b.order;
            }
            // 優先度でソート
            const priorityOrder = { high: 0, medium: 1, low: 2 };
            const aPriority = priorityOrder[a.priority] ?? 1;
            const bPriority = priorityOrder[b.priority] ?? 1;
            if (aPriority !== bPriority) {
                return aPriority - bPriority;
            }
            // 作成日時でソート
            return a.createdAt.getTime() - b.createdAt.getTime();
        });
    }
    /**
     * タスクをシリアライズします
     *
     * @param task タスク
     * @param options オプション
     * @param context コンテキスト
     * @returns タスクのMarkdown
     */
    serializeTask(task, options, context) {
        const indent = options.indent || '  ';
        const indentStr = indent.repeat(context.currentIndentLevel);
        // チェックボックス
        const checkbox = task.status === 'completed'
            ? options.checkboxFormat?.checked || '[x]'
            : options.checkboxFormat?.unchecked || '[ ]';
        // タイトル
        const title = sanitizer.sanitizeTitle(task.title);
        // メタデータ
        const metadata = [];
        if (task.priority && task.priority !== 'medium') {
            const priorityLabel = {
                low: '優先度:低',
                high: '優先度:高',
            }[task.priority];
            if (priorityLabel) {
                metadata.push(priorityLabel);
            }
        }
        if (task.dueDate) {
            const formattedDate = this.formatDate(task.dueDate, options.dateFormat);
            metadata.push(`期限:${formattedDate}`);
        }
        if (task.tags && task.tags.length > 0) {
            const tags = task.tags.map(tag => `#${tag}`).join(' ');
            metadata.push(tags);
        }
        // Markdown行を構築
        const metadataStr = metadata.length > 0 ? ` (${metadata.join(', ')})` : '';
        return `${indentStr}- ${checkbox} ${title}${metadataStr}`;
    }
    /**
     * 日付をフォーマットします
     *
     * @param dateStr 日付文字列
     * @param format フォーマット形式
     * @returns フォーマット済み日付
     */
    formatDate(dateStr, format = 'iso') {
        if (format === 'iso') {
            return dateStr;
        }
        // カスタムフォーマットは将来実装
        return dateStr;
    }
    /**
     * 単一タスクをMarkdown行に変換します
     *
     * @param task タスク
     * @param options オプション
     * @returns Markdown行
     */
    taskToMarkdownLine(task, options = {}) {
        const opts = { ...this.DEFAULT_OPTIONS, ...options };
        const context = {
            currentIndentLevel: 0,
            stats: { totalTasks: 1, convertedTasks: 0, skippedTasks: 0, errors: 0 },
            errors: [],
        };
        return this.serializeTask(task, opts, context);
    }
    /**
     * 差分更新用：特定のタスクのMarkdown行を更新します
     *
     * @param content 既存のMarkdown
     * @param task 更新するタスク
     * @param lineNumber 行番号（0-indexed）
     * @returns 更新されたMarkdown
     */
    updateTaskLine(content, task, lineNumber) {
        const lines = content.split('\n');
        if (lineNumber < 0 || lineNumber >= lines.length) {
            logger.warn({ lineNumber, totalLines: lines.length }, 'Invalid line number');
            return content;
        }
        const newLine = this.taskToMarkdownLine(task);
        lines[lineNumber] = newLine;
        return lines.join('\n');
    }
    /**
     * 差分更新用：タスクを追加します
     *
     * @param content 既存のMarkdown
     * @param task 追加するタスク
     * @param sectionName セクション名
     * @returns 更新されたMarkdown
     */
    addTask(content, task, sectionName) {
        const lines = content.split('\n');
        const section = sectionName || task.section || '未分類';
        // セクションを探す
        let sectionLine = -1;
        for (let i = 0; i < lines.length; i++) {
            if (lines[i].trim() === `## ${section}`) {
                sectionLine = i;
                break;
            }
        }
        // セクションが見つからない場合は末尾に追加
        if (sectionLine === -1) {
            lines.push('');
            lines.push(`## ${section}`);
            lines.push('');
            sectionLine = lines.length - 1;
        }
        // セクション内の最後のタスクを探す
        let insertLine = sectionLine + 1;
        for (let i = sectionLine + 1; i < lines.length; i++) {
            const line = lines[i].trim();
            // 次のセクションに到達したら終了
            if (line.startsWith('##')) {
                break;
            }
            // チェックボックス行があればその次に挿入
            if (line.startsWith('- [')) {
                insertLine = i + 1;
            }
        }
        const newLine = this.taskToMarkdownLine(task);
        lines.splice(insertLine, 0, newLine);
        return lines.join('\n');
    }
    /**
     * 差分更新用：タスクを削除します
     *
     * @param content 既存のMarkdown
     * @param lineNumber 行番号（0-indexed）
     * @returns 更新されたMarkdown
     */
    removeTask(content, lineNumber) {
        const lines = content.split('\n');
        if (lineNumber < 0 || lineNumber >= lines.length) {
            logger.warn({ lineNumber, totalLines: lines.length }, 'Invalid line number');
            return content;
        }
        lines.splice(lineNumber, 1);
        return lines.join('\n');
    }
    /**
     * Markdownコンテンツを整形します
     *
     * @param content Markdown
     * @returns 整形されたMarkdown
     */
    format(content) {
        const lines = content.split('\n');
        const formatted = [];
        let inFrontMatter = false;
        let prevLineEmpty = false;
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            const trimmed = line.trim();
            // Front matter処理
            if (trimmed === '---') {
                inFrontMatter = !inFrontMatter;
                formatted.push(line);
                continue;
            }
            if (inFrontMatter) {
                formatted.push(line);
                continue;
            }
            // 空行の重複を除去
            if (trimmed === '') {
                if (!prevLineEmpty) {
                    formatted.push('');
                    prevLineEmpty = true;
                }
                continue;
            }
            formatted.push(line);
            prevLineEmpty = false;
        }
        // 末尾の余分な空行を除去
        while (formatted.length > 0 && formatted[formatted.length - 1] === '') {
            formatted.pop();
        }
        // 最後に改行を追加
        formatted.push('');
        return formatted.join('\n');
    }
    /**
     * タスクの統計情報を生成します
     *
     * @param tasks タスクの配列
     * @returns 統計情報のMarkdown
     */
    generateStatistics(tasks) {
        const total = tasks.length;
        const completed = tasks.filter(t => t.status === 'completed').length;
        const inProgress = tasks.filter(t => t.status === 'in_progress').length;
        const pending = tasks.filter(t => t.status === 'pending').length;
        const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;
        const lines = [];
        lines.push('## 📊 統計情報');
        lines.push('');
        lines.push(`- 合計タスク数: ${total}`);
        lines.push(`- 完了: ${completed} (${completionRate}%)`);
        lines.push(`- 進行中: ${inProgress}`);
        lines.push(`- 未着手: ${pending}`);
        lines.push('');
        return lines.join('\n');
    }
}
//# sourceMappingURL=markdown-serializer.js.map