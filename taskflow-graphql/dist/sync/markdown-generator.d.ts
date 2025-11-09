import { Task } from '../types';
import type { FileSystem } from './interfaces/file-system.interface';
/**
 * Markdown Generator for TaskFlow GraphQL
 *
 * Generates markdown files from task data with the following features:
 * - Header with metadata (last updated, total count)
 * - Priority-based sections (Critical/High/Medium/Low)
 * - Status-based checkboxes (TODO/IN_PROGRESS/COMPLETED)
 * - Tag formatting from labels
 * - Date formatting (YYYY-MM-DD)
 * - Completed tasks section
 * - Excludes DELETED tasks
 * - XSS protection via MarkdownSanitizer
 */
export declare class MarkdownGenerator {
    private fs;
    private sanitizer;
    constructor(fs: FileSystem);
    /**
     * Generate markdown file from tasks
     * @param tasks - Array of tasks to convert to markdown
     * @param filePath - Output file path
     */
    generate(tasks: Task[], filePath: string): Promise<void>;
    /**
     * Generate markdown content from tasks
     * @param tasks - Array of tasks
     * @returns Markdown formatted string
     */
    private generateContent;
    /**
     * Generate header with metadata
     * @param lines - Output lines array
     * @param tasks - Task array for metadata calculation
     */
    private generateHeader;
    /**
     * Generate active task sections by priority
     * @param lines - Output lines array
     * @param tasks - Task array
     */
    private generateActiveSections;
    /**
     * Generate completed tasks section
     * @param lines - Output lines array
     * @param tasks - Task array
     */
    private generateCompletedSection;
    /**
     * Generate single task line
     * @param lines - Output lines array
     * @param task - Task object
     */
    private generateTaskLine;
    /**
     * Convert task status to checkbox format
     * @param status - Task status
     * @returns Checkbox string
     */
    private statusToCheckbox;
    /**
     * Format labels as tags
     * @param labels - Array of labels
     * @returns Tag string (e.g., "#rust #performance")
     */
    private formatTags;
    /**
     * Format creation and completion dates
     * @param createdAt - Creation date
     * @param completedAt - Completion date (optional)
     * @returns Formatted date string
     */
    private formatDates;
    /**
     * Format date to YYYY-MM-DD
     * @param date - Date object
     * @returns Formatted date string
     */
    private formatDate;
}
//# sourceMappingURL=markdown-generator.d.ts.map