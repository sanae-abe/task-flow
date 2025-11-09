/**
 * Markdown Generator Utility for TaskFlow
 * Converts tasks, boards, and other entities to various Markdown formats
 *
 * Supported formats:
 * - STANDARD: Basic Markdown
 * - GITHUB_FLAVORED: GitHub-flavored Markdown with task lists
 * - OBSIDIAN: Obsidian-compatible Markdown with metadata
 */
import type { TaskRecord, BoardRecord, LabelRecord } from './indexeddb.js';
export declare enum MarkdownFormat {
    STANDARD = "STANDARD",
    GITHUB_FLAVORED = "GITHUB_FLAVORED",
    OBSIDIAN = "OBSIDIAN"
}
export interface MarkdownGeneratorOptions {
    format?: MarkdownFormat;
    includeSubtasks?: boolean;
    includeLabels?: boolean;
    includeAttachments?: boolean;
    includeMetadata?: boolean;
}
export interface MarkdownTaskStats {
    total: number;
    completed: number;
    overdue: number;
    byPriority: {
        critical: number;
        high: number;
        medium: number;
        low: number;
    };
}
/**
 * Generate Markdown for a single task
 */
export declare function generateTaskMarkdown(task: TaskRecord, labels?: LabelRecord[], options?: MarkdownGeneratorOptions): string;
/**
 * Generate Markdown for multiple tasks grouped by column
 */
export declare function generateTasksMarkdown(tasks: TaskRecord[], columns: Array<{
    id: string;
    name: string;
    position: number;
}>, labels?: LabelRecord[], options?: MarkdownGeneratorOptions): string;
/**
 * Generate Markdown for an entire board
 */
export declare function generateBoardMarkdown(board: BoardRecord, tasks: TaskRecord[], labels?: LabelRecord[], options?: MarkdownGeneratorOptions): string;
/**
 * Generate filename for markdown export
 */
export declare function generateMarkdownFilename(boardName: string, _mdFormat?: MarkdownFormat): string;
/**
 * Get format-specific file extension
 */
export declare function getMarkdownExtension(_mdFormat: MarkdownFormat): string;
//# sourceMappingURL=markdown-generator.d.ts.map