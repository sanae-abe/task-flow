import { Task, TaskStatus, Priority, Label } from '../types';
import { PathValidator } from './security/path-validator';
import { MarkdownSanitizer } from './security/sanitizer';
import { promises as fs } from 'fs';
import { randomUUID } from 'crypto';

/**
 * Parsed task representation before conversion to Task type
 */
interface ParsedTask {
  title: string;
  status: TaskStatus;
  priority: Priority;
  labels: string[];
  section: string;
  createdAt?: string;
  completedAt?: string;
}

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
export class MarkdownParser {
  private pathValidator: PathValidator;
  private sanitizer: MarkdownSanitizer;

  constructor() {
    this.pathValidator = new PathValidator();
    this.sanitizer = new MarkdownSanitizer();
  }

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
  async parse(filePath: string): Promise<Task[]> {
    // Security: Validate path to prevent traversal attacks
    const validatedPath = this.pathValidator.validate(filePath);

    // Read file content
    const content = await fs.readFile(validatedPath, 'utf-8');

    // Parse content into structured tasks
    const parsedTasks = this.parseContent(content);

    // Convert to Task objects
    return this.convertToTasks(parsedTasks);
  }

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
  private parseContent(content: string): ParsedTask[] {
    const lines = content.split('\n');
    const parsedTasks: ParsedTask[] = [];
    let currentPriority: Priority = Priority.MEDIUM;
    let currentSection = 'default';

    for (const line of lines) {
      const trimmedLine = line.trim();

      // Detect section headers (e.g., "## 🔥 URGENT")
      if (trimmedLine.startsWith('#')) {
        currentPriority = this.detectPriority(trimmedLine);
        currentSection = trimmedLine.replace(/^#+\s*/, '');
        continue;
      }

      // Parse task lines (e.g., "- [ ] Task title")
      const taskMatch = trimmedLine.match(/^-\s*\[(.)\]\s*(.+)$/);
      if (taskMatch) {
        const [, statusChar, rawTitle] = taskMatch;
        const status = this.parseStatus(statusChar);
        const { title, labels, createdAt, completedAt } =
          this.parseTaskLine(rawTitle);

        // Skip empty tasks
        if (!title) {
          continue;
        }

        parsedTasks.push({
          title,
          status,
          priority: currentPriority,
          labels,
          section: currentSection,
          createdAt,
          completedAt,
        });
      }
    }

    return parsedTasks;
  }

  /**
   * Detect priority from section header
   *
   * @param sectionHeader - Section header text (e.g., "## 🔥 URGENT")
   * @returns Detected priority level
   *
   * @fallback Priority.MEDIUM if no emoji match
   */
  private detectPriority(sectionHeader: string): Priority {
    const headerUpper = sectionHeader.toUpperCase();

    if (headerUpper.includes('🔥') || headerUpper.includes('URGENT') || headerUpper.includes('CRITICAL')) {
      return Priority.CRITICAL;
    }
    if (headerUpper.includes('⚠️') || headerUpper.includes('HIGH')) {
      return Priority.HIGH;
    }
    if (headerUpper.includes('📝') || headerUpper.includes('LOW')) {
      return Priority.LOW;
    }
    // Default or 📌 MEDIUM
    return Priority.MEDIUM;
  }

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
  private parseStatus(statusChar: string): TaskStatus {
    switch (statusChar.toLowerCase()) {
      case ' ':
        return TaskStatus.TODO;
      case '~':
        return TaskStatus.IN_PROGRESS;
      case 'x':
        return TaskStatus.COMPLETED;
      default:
        return TaskStatus.TODO;
    }
  }

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
  private parseTaskLine(rawTitle: string): {
    title: string;
    labels: string[];
    createdAt?: string;
    completedAt?: string;
  } {
    // Extract tags (#tag-name)
    const tagRegex = /#([\w-]+)/g;
    const labels: string[] = [];
    let match: RegExpExecArray | null;

    while ((match = tagRegex.exec(rawTitle)) !== null) {
      labels.push(match[1]);
    }

    // Extract created date
    const createdMatch = rawTitle.match(/\(created:\s*(\d{4}-\d{2}-\d{2})\)/);
    const createdAt = createdMatch ? createdMatch[1] : undefined;

    // Extract completed date
    const completedMatch = rawTitle.match(
      /\(completed:\s*(\d{4}-\d{2}-\d{2})\)/
    );
    const completedAt = completedMatch ? completedMatch[1] : undefined;

    // Clean title: remove tags and date metadata
    let title = rawTitle
      .replace(/#[\w-]+/g, '') // Remove tags
      .replace(/\(created:\s*\d{4}-\d{2}-\d{2}\)/g, '') // Remove created date
      .replace(/\(completed:\s*\d{4}-\d{2}-\d{2}\)/g, '') // Remove completed date
      .trim();

    // Security: Sanitize title to prevent XSS
    title = this.sanitizer.sanitizeTitle(title);

    return { title, labels, createdAt, completedAt };
  }

  /**
   * Convert ParsedTask[] to Task[]
   *
   * @param parsedTasks - Array of parsed task data
   * @returns Array of Task objects with generated IDs
   *
   * @side-effects Generates new UUIDs for each task
   */
  private convertToTasks(parsedTasks: ParsedTask[]): Task[] {
    return parsedTasks.map((parsed, index) => {
      const now = new Date();
      const createdAt = this.parseDate(parsed.createdAt) || now;
      const completedAt = parsed.completedAt
        ? this.parseDate(parsed.completedAt)
        : undefined;

      return {
        id: randomUUID(),
        boardId: 'default', // Default board - will be set by caller
        columnId: 'default', // Default column - will be set by caller
        title: parsed.title,
        description: undefined,
        status: parsed.status,
        priority: parsed.priority,
        dueDate: undefined,
        dueTime: undefined,
        labels: this.convertLabels(parsed.labels),
        subtasks: [], // Markdown format doesn't support subtasks
        files: [], // Markdown format doesn't support file attachments
        recurrence: undefined,
        position: index,
        createdAt,
        updatedAt: now,
        completedAt,
        deletedAt: undefined,
        // Computed fields
        isOverdue: false,
        completionPercentage: 0,
        estimatedDuration: undefined,
      };
    });
  }

  /**
   * Convert label names to Label objects
   *
   * @param labelNames - Array of label names from tags
   * @returns Array of Label objects with generated IDs
   */
  private convertLabels(labelNames: string[]): Label[] {
    return labelNames.map(name => ({
      id: randomUUID(),
      name,
      color: this.generateLabelColor(name),
      boardId: undefined, // Will be set when label is assigned to a board
      taskCount: 0, // Initial task count
      createdAt: new Date(),
    }));
  }

  /**
   * Generate consistent color for label based on name
   *
   * @param name - Label name
   * @returns Hex color code
   *
   * @algorithm Simple hash-based color generation for consistency
   */
  private generateLabelColor(name: string): string {
    // Simple hash function for consistent color generation
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }

    // Convert to hex color (pastel palette)
    const hue = Math.abs(hash % 360);
    return `hsl(${hue}, 65%, 75%)`;
  }

  /**
   * Parse date string to Date object
   *
   * @param dateStr - Date string in YYYY-MM-DD format
   * @returns Parsed Date object or undefined
   *
   * @fallback Returns undefined for invalid dates
   */
  private parseDate(dateStr?: string): Date | undefined {
    if (!dateStr) {
      return undefined;
    }

    const parsed = new Date(dateStr);

    // Validate date
    if (isNaN(parsed.getTime())) {
      return undefined;
    }

    return parsed;
  }
}
