import { Task } from '../types';
/**
 * Markdown Parser for TaskFlow
 *
 * Parses markdown files with priority-based sections and task lists:
 * - 🔥 URGENT/CRITICAL → Priority.CRITICAL
 * - ⚠️ HIGH → Priority.HIGH
 * - 📌 MEDIUM → Priority.MEDIUM
 * - 📝 LOW → Priority.LOW
 *
 * Task format: "- [ ] Task title #tag1 #tag2 (created: 2025-11-09)"
 *
 * @security
 * - Path traversal protection via PathValidator
 * - XSS protection via MarkdownSanitizer
 */
export declare class MarkdownParser {
    private pathValidator;
    private sanitizer;
    constructor();
    /**
     * Parse markdown file and extract tasks
     *
     * @param filePath - Absolute path to markdown file
     * @returns Array of parsed tasks
     * @throws Error if file cannot be read or path is invalid
     *
     * @example
     * const parser = new MarkdownParser();
     * const tasks = await parser.parse('/path/to/tasks.md');
     */
    parse(filePath: string): Promise<Task[]>;
    /**
     * Parse markdown content into structured task data
     *
     * @param content - Raw markdown content
     * @returns Array of parsed tasks with metadata
     *
     * @algorithm
     * 1. Split content by lines
     * 2. Track current section/priority
     * 3. Extract tasks from list items
     * 4. Parse metadata (tags, dates)
     */
    private parseContent;
    /**
     * Detect priority from section header
     *
     * @param sectionHeader - Section header text (e.g., "## 🔥 URGENT")
     * @returns Detected priority level
     *
     * @fallback Priority.MEDIUM if no emoji match
     */
    private detectPriority;
    /**
     * Parse task status from checkbox character
     *
     * @param statusChar - Single character from checkbox (e.g., ' ', '~', 'x')
     * @returns Corresponding TaskStatus
     *
     * @mapping
     * - ' ' → TODO
     * - '~' → IN_PROGRESS
     * - 'x' or 'X' → COMPLETED
     */
    private parseStatus;
    /**
     * Parse task line to extract title, labels, and dates
     *
     * @param rawTitle - Raw task title with metadata
     * @returns Parsed components
     *
     * @example
     * Input: "Fix bug #backend #urgent (created: 2025-11-09) (completed: 2025-11-10)"
     * Output: {
     *   title: "Fix bug",
     *   labels: ["backend", "urgent"],
     *   createdAt: "2025-11-09",
     *   completedAt: "2025-11-10"
     * }
     */
    private parseTaskLine;
    /**
     * Convert ParsedTask[] to Task[]
     *
     * @param parsedTasks - Array of parsed task data
     * @returns Array of Task objects with generated IDs
     *
     * @side-effects Generates new UUIDs for each task
     */
    private convertToTasks;
    /**
     * Convert label names to Label objects
     *
     * @param labelNames - Array of label names from tags
     * @returns Array of Label objects with generated IDs
     */
    private convertLabels;
    /**
     * Generate consistent color for label based on name
     *
     * @param name - Label name
     * @returns Hex color code
     *
     * @algorithm Simple hash-based color generation for consistency
     */
    private generateLabelColor;
    /**
     * Parse date string to Date object
     *
     * @param dateStr - Date string in YYYY-MM-DD format
     * @returns Parsed Date object or undefined
     *
     * @fallback Returns undefined for invalid dates
     */
    private parseDate;
}
//# sourceMappingURL=markdown-parser.d.ts.map