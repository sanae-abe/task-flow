import { Task, TaskStatus, Priority, Label } from '../types';
import type { FileSystem } from './interfaces/file-system.interface';
import { MarkdownSanitizer } from './security/sanitizer';

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
export class MarkdownGenerator {
  private sanitizer: MarkdownSanitizer;

  constructor(private fs: FileSystem) {
    this.sanitizer = new MarkdownSanitizer();
  }

  /**
   * Generate markdown file from tasks
   * @param tasks - Array of tasks to convert to markdown
   * @param filePath - Output file path
   */
  async generate(tasks: Task[], filePath: string): Promise<void> {
    const content = this.generateContent(tasks);
    await this.fs.writeFile(filePath, content);
  }

  /**
   * Generate markdown content from tasks
   * @param tasks - Array of tasks
   * @returns Markdown formatted string
   */
  private generateContent(tasks: Task[]): string {
    const lines: string[] = [];

    this.generateHeader(lines, tasks);
    lines.push('');

    this.generateActiveSections(lines, tasks);

    this.generateCompletedSection(lines, tasks);

    return lines.join('\n');
  }

  /**
   * Generate header with metadata
   * @param lines - Output lines array
   * @param tasks - Task array for metadata calculation
   */
  private generateHeader(lines: string[], tasks: Task[]): void {
    const activeTasks = tasks.filter(
      t => t.status !== TaskStatus.COMPLETED && t.status !== TaskStatus.DELETED
    );
    const now = new Date();
    const timestamp = `${this.formatDate(now)} ${now.toTimeString().slice(0, 8)}`;

    lines.push('# Personal TODOs');
    lines.push('');
    lines.push('<!-- metadata -->');
    lines.push(`<!-- last_updated: ${timestamp} -->`);
    lines.push(`<!-- total_todos: ${activeTasks.length} -->`);
  }

  /**
   * Generate active task sections by priority
   * @param lines - Output lines array
   * @param tasks - Task array
   */
  private generateActiveSections(lines: string[], tasks: Task[]): void {
    const activeTasks = tasks.filter(
      t => t.status !== TaskStatus.COMPLETED && t.status !== TaskStatus.DELETED
    );

    const priorityConfig: Array<{
      priority: Priority;
      emoji: string;
      label: string;
    }> = [
      { priority: Priority.CRITICAL, emoji: '🔥', label: 'Critical' },
      { priority: Priority.HIGH, emoji: '⚠️', label: 'High' },
      { priority: Priority.MEDIUM, emoji: '📌', label: 'Medium' },
      { priority: Priority.LOW, emoji: '📝', label: 'Low' },
    ];

    for (const { priority, emoji, label } of priorityConfig) {
      lines.push('');
      lines.push(`## ${emoji} ${label}`);

      const priorityTasks = activeTasks.filter(t => t.priority === priority);

      if (priorityTasks.length === 0) {
        // Empty section - no tasks
        continue;
      }

      for (const task of priorityTasks) {
        this.generateTaskLine(lines, task);
      }
    }
  }

  /**
   * Generate completed tasks section
   * @param lines - Output lines array
   * @param tasks - Task array
   */
  private generateCompletedSection(lines: string[], tasks: Task[]): void {
    const completedTasks = tasks.filter(t => t.status === TaskStatus.COMPLETED);

    if (completedTasks.length === 0) {
      return;
    }

    lines.push('');
    lines.push('## ✅ Completed');

    for (const task of completedTasks) {
      this.generateTaskLine(lines, task);
    }
  }

  /**
   * Generate single task line
   * @param lines - Output lines array
   * @param task - Task object
   */
  private generateTaskLine(lines: string[], task: Task): void {
    const checkbox = this.statusToCheckbox(task.status);
    // XSS対策: タイトルをサニタイズ
    const title = this.sanitizer.sanitizeTitle(task.title);
    const tags = this.formatTags(task.labels);
    const dates = this.formatDates(task.createdAt, task.completedAt);

    let line = `- ${checkbox} ${title}`;

    if (tags) {
      line += ` ${tags}`;
    }

    if (dates) {
      line += ` ${dates}`;
    }

    lines.push(line);
  }

  /**
   * Convert task status to checkbox format
   * @param status - Task status
   * @returns Checkbox string
   */
  private statusToCheckbox(status: TaskStatus): string {
    switch (status) {
      case TaskStatus.TODO:
        return '[ ]';
      case TaskStatus.IN_PROGRESS:
        return '[~]';
      case TaskStatus.COMPLETED:
        return '[x]';
      case TaskStatus.DELETED:
        // DELETED tasks should not be rendered
        return '[ ]';
      default:
        return '[ ]';
    }
  }

  /**
   * Format labels as tags
   * @param labels - Array of labels
   * @returns Tag string (e.g., "#rust #performance")
   */
  private formatTags(labels: Label[]): string {
    if (!labels || labels.length === 0) {
      return '';
    }

    // XSS対策: ラベル名をサニタイズ
    return labels
      .map(label => `#${this.sanitizer.sanitizeTitle(label.name)}`)
      .join(' ');
  }

  /**
   * Format creation and completion dates
   * @param createdAt - Creation date
   * @param completedAt - Completion date (optional)
   * @returns Formatted date string
   */
  private formatDates(createdAt: Date, completedAt?: Date): string {
    const created = this.formatDate(createdAt);

    if (completedAt) {
      const completed = this.formatDate(completedAt);
      return `(created: ${created}, completed: ${completed})`;
    }

    return `(created: ${created})`;
  }

  /**
   * Format date to YYYY-MM-DD
   * @param date - Date object
   * @returns Formatted date string
   */
  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  }
}
