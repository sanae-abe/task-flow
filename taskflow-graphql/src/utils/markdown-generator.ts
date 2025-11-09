/**
 * Markdown Generator Utility for TaskFlow
 * Converts tasks, boards, and other entities to various Markdown formats
 *
 * Supported formats:
 * - STANDARD: Basic Markdown
 * - GITHUB_FLAVORED: GitHub-flavored Markdown with task lists
 * - OBSIDIAN: Obsidian-compatible Markdown with metadata
 */

import { format as formatDate } from 'date-fns';
import type { TaskRecord, BoardRecord, LabelRecord } from './indexeddb.js';

// ============================================================================
// Types
// ============================================================================

export enum MarkdownFormat {
  STANDARD = 'STANDARD',
  GITHUB_FLAVORED = 'GITHUB_FLAVORED',
  OBSIDIAN = 'OBSIDIAN',
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

// ============================================================================
// Main Generator Functions
// ============================================================================

/**
 * Generate Markdown for a single task
 */
export function generateTaskMarkdown(
  task: TaskRecord,
  labels: LabelRecord[] = [],
  options: MarkdownGeneratorOptions = {}
): string {
  const {
    format = MarkdownFormat.STANDARD,
    includeSubtasks = true,
    includeLabels = true,
    includeAttachments = true,
  } = options;

  let markdown = '';

  // Task title and status
  const checkbox = task.status === 'COMPLETED' ? '[x]' : '[ ]';
  const priorityBadge = formatPriority(task.priority, format);

  markdown += `${checkbox} ${task.title}`;

  if (includeLabels && labels.length > 0) {
    markdown += ` ${formatLabels(labels, format)}`;
  }

  if (priorityBadge) {
    markdown += ` ${priorityBadge}`;
  }

  markdown += '\n';

  // Description
  if (task.description) {
    markdown += `  ${task.description}\n`;
  }

  // Due date
  if (task.dueDate) {
    const dueInfo = formatDueDate(
      task.dueDate,
      task.dueTime,
      task.status === 'COMPLETED'
    );
    markdown += `  ${dueInfo}\n`;
  }

  // Subtasks
  if (includeSubtasks && task.subtasks && task.subtasks.length > 0) {
    markdown += formatSubtasks(task.subtasks);
  }

  // Attachments
  if (includeAttachments && task.files && task.files.length > 0) {
    markdown += formatAttachments(task.files);
  }

  return markdown;
}

/**
 * Generate Markdown for multiple tasks grouped by column
 */
export function generateTasksMarkdown(
  tasks: TaskRecord[],
  columns: Array<{ id: string; name: string; position: number }>,
  labels: LabelRecord[] = [],
  options: MarkdownGeneratorOptions = {}
): string {
  let markdown = '';

  // Group tasks by column
  const tasksByColumn = new Map<string, TaskRecord[]>();
  columns.forEach(col => tasksByColumn.set(col.id, []));

  tasks.forEach(task => {
    if (!tasksByColumn.has(task.columnId)) {
      tasksByColumn.set(task.columnId, []);
    }
    tasksByColumn.get(task.columnId)!.push(task);
  });

  // Sort columns by position
  const sortedColumns = [...columns].sort((a, b) => a.position - b.position);

  // Generate markdown for each column
  sortedColumns.forEach(column => {
    const columnTasks = tasksByColumn.get(column.id) || [];

    if (columnTasks.length === 0) {
      return;
    }

    // Column header
    markdown += `## ${column.name} (${columnTasks.length} task${columnTasks.length !== 1 ? 's' : ''})\n\n`;

    // Tasks
    columnTasks.forEach(task => {
      const taskLabels = labels.filter(label => task.labels.includes(label.id));
      markdown += generateTaskMarkdown(task, taskLabels, options);
      markdown += '\n';
    });

    markdown += '\n';
  });

  return markdown;
}

/**
 * Generate Markdown for an entire board
 */
export function generateBoardMarkdown(
  board: BoardRecord,
  tasks: TaskRecord[],
  labels: LabelRecord[] = [],
  options: MarkdownGeneratorOptions = {}
): string {
  const { format = MarkdownFormat.STANDARD, includeMetadata = true } = options;

  let markdown = '';

  // Obsidian frontmatter
  if (format === MarkdownFormat.OBSIDIAN && includeMetadata) {
    markdown += generateObsidianFrontmatter(board, tasks);
    markdown += '\n';
  }

  // Board title
  markdown += `# ${board.name}\n\n`;

  // Board description
  if (board.description) {
    markdown += `${board.description}\n\n`;
  }

  // Tasks by column
  markdown += generateTasksMarkdown(tasks, board.columns, labels, options);

  // Statistics
  if (includeMetadata) {
    markdown += generateStatistics(tasks);
  }

  // Metadata footer (for standard/GitHub formats)
  if (format !== MarkdownFormat.OBSIDIAN && includeMetadata) {
    markdown += generateMetadataFooter(board, tasks);
  }

  return markdown;
}

// ============================================================================
// Formatting Helper Functions
// ============================================================================

/**
 * Format priority badge based on markdown format
 */
function formatPriority(priority: string, format: MarkdownFormat): string {
  const priorityMap: Record<string, string> = {
    CRITICAL: '🔴 Critical',
    HIGH: '🟠 High',
    MEDIUM: '🟡 Medium',
    LOW: '🟢 Low',
  };

  const priorityText = priorityMap[priority] || priority;

  switch (format) {
    case MarkdownFormat.GITHUB_FLAVORED:
      return `**Priority: ${priorityText}**`;
    case MarkdownFormat.OBSIDIAN:
      return `#priority/${priority.toLowerCase()}`;
    default:
      return `(${priorityText})`;
  }
}

/**
 * Format labels based on markdown format
 */
function formatLabels(labels: LabelRecord[], format: MarkdownFormat): string {
  if (labels.length === 0) return '';

  switch (format) {
    case MarkdownFormat.OBSIDIAN:
      return labels
        .map(label => `#${label.name.replace(/\s+/g, '-')}`)
        .join(' ');
    case MarkdownFormat.GITHUB_FLAVORED:
      return labels.map(label => `\`${label.name}\``).join(' ');
    default:
      return labels.map(label => `#${label.name}`).join(' ');
  }
}

/**
 * Format due date with overdue detection
 */
function formatDueDate(
  dueDate: string,
  dueTime?: string,
  isCompleted = false
): string {
  const date = new Date(dueDate);
  const now = new Date();
  const isOverdue = !isCompleted && date < now;

  let formatted = `📅 Due: ${formatDate(date, 'MMM dd, yyyy')}`;

  if (dueTime) {
    formatted += ` at ${dueTime}`;
  }

  if (isOverdue) {
    formatted += ' ⚠️ OVERDUE';
  }

  return formatted;
}

/**
 * Format subtasks list
 */
function formatSubtasks(
  subtasks: Array<{
    id: string;
    title: string;
    completed: boolean;
    position: number;
  }>
): string {
  let markdown = '';

  const sortedSubtasks = [...subtasks].sort((a, b) => a.position - b.position);

  sortedSubtasks.forEach(subtask => {
    const checkbox = subtask.completed ? '[x]' : '[ ]';
    markdown += `  - ${checkbox} ${subtask.title}\n`;
  });

  return markdown;
}

/**
 * Format attachments list
 */
function formatAttachments(
  files: Array<{ id: string; name: string; type: string; size: number }>
): string {
  let markdown = '  📎 Attachments:\n';

  files.forEach(file => {
    const sizeKB = (file.size / 1024).toFixed(1);
    markdown += `  - ${file.name} (${sizeKB} KB)\n`;
  });

  return markdown;
}

/**
 * Generate Obsidian frontmatter
 */
function generateObsidianFrontmatter(
  board: BoardRecord,
  tasks: TaskRecord[]
): string {
  const stats = calculateStats(tasks);
  const now = new Date();

  return `---
board: ${board.name}
generated: ${formatDate(now, 'yyyy-MM-dd HH:mm:ss')}
total_tasks: ${stats.total}
completed_tasks: ${stats.completed}
completion_rate: ${((stats.completed / stats.total) * 100).toFixed(1)}%
tags: [taskflow, board]
---
`;
}

/**
 * Generate statistics section
 */
function generateStatistics(tasks: TaskRecord[]): string {
  const stats = calculateStats(tasks);

  let markdown = '---\n\n';
  markdown += '## 📊 Statistics\n\n';
  markdown += `- **Total Tasks**: ${stats.total}\n`;
  markdown += `- **Completed**: ${stats.completed} (${((stats.completed / stats.total) * 100).toFixed(1)}%)\n`;
  markdown += `- **In Progress**: ${stats.total - stats.completed - stats.overdue}\n`;

  if (stats.overdue > 0) {
    markdown += `- **Overdue**: ${stats.overdue} ⚠️\n`;
  }

  markdown += '\n### By Priority\n\n';
  markdown += `- 🔴 Critical: ${stats.byPriority.critical}\n`;
  markdown += `- 🟠 High: ${stats.byPriority.high}\n`;
  markdown += `- 🟡 Medium: ${stats.byPriority.medium}\n`;
  markdown += `- 🟢 Low: ${stats.byPriority.low}\n`;

  return markdown;
}

/**
 * Generate metadata footer
 */
function generateMetadataFooter(
  board: BoardRecord,
  tasks: TaskRecord[]
): string {
  const now = new Date();
  const stats = calculateStats(tasks);

  let markdown = '\n---\n\n';
  markdown += `*Generated from TaskFlow Board: ${board.name}*\n`;
  markdown += `*Export Date: ${formatDate(now, 'MMMM dd, yyyy HH:mm:ss')}*\n`;
  markdown += `*Total Tasks: ${stats.total} | Completed: ${stats.completed}*\n`;

  return markdown;
}

/**
 * Calculate task statistics
 */
function calculateStats(tasks: TaskRecord[]): MarkdownTaskStats {
  const stats: MarkdownTaskStats = {
    total: tasks.length,
    completed: 0,
    overdue: 0,
    byPriority: {
      critical: 0,
      high: 0,
      medium: 0,
      low: 0,
    },
  };

  const now = new Date();

  tasks.forEach(task => {
    if (task.status === 'COMPLETED') {
      stats.completed++;
    }

    if (task.dueDate && task.status !== 'COMPLETED') {
      const dueDate = new Date(task.dueDate);
      if (dueDate < now) {
        stats.overdue++;
      }
    }

    const priorityKey =
      task.priority.toLowerCase() as keyof typeof stats.byPriority;
    if (priorityKey in stats.byPriority) {
      stats.byPriority[priorityKey]++;
    }
  });

  return stats;
}

// ============================================================================
// Export Utilities
// ============================================================================

/**
 * Generate filename for markdown export
 */
export function generateMarkdownFilename(
  boardName: string,
  _mdFormat: MarkdownFormat = MarkdownFormat.STANDARD
): string {
  const timestamp = formatDate(new Date(), 'yyyy-MM-dd-HHmmss');
  const sanitizedName = boardName.replace(/[^a-z0-9]/gi, '-').toLowerCase();
  return `${sanitizedName}-${timestamp}.md`;
}

/**
 * Get format-specific file extension
 */
export function getMarkdownExtension(_mdFormat: MarkdownFormat): string {
  return '.md'; // All formats use .md extension
}
