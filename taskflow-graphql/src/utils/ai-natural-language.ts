/**
 * AI Natural Language Processing Utility
 * Parses natural language queries into structured task data
 */

import type { AIContext, ParsedTask } from './ai-client.js';
import { getAIClient } from './ai-client.js';
import type { CreateTaskInput } from '../generated/graphql.js';

// ============================================================================
// Types
// ============================================================================

export interface ParseOptions {
  defaultBoardId?: string;
  defaultColumnId?: string;
  context?: AIContext;
  includeSubtasks?: boolean;
}

export interface ParseResult extends ParsedTask {
  confidence: number;
  extractedEntities: ExtractedEntity[];
}

export interface ExtractedEntity {
  type: 'date' | 'time' | 'priority' | 'label' | 'action' | 'duration'; // Week 8: Added duration
  value: string;
  position: number;
}

// ============================================================================
// Main Functions
// ============================================================================

/**
 * Parse natural language query into structured task
 */
export async function parseNaturalLanguageToTask(
  query: string,
  options: ParseOptions = {}
): Promise<ParseResult> {
  const aiClient = getAIClient();
  const parsedTask = await aiClient.parseNaturalLanguage(
    query,
    options.context
  );

  // Extract additional entities
  const entities = extractEntities(query);

  // Calculate confidence based on extraction success
  const confidence = calculateParseConfidence(parsedTask, entities);

  return {
    ...parsedTask,
    confidence,
    extractedEntities: entities,
  };
}

/**
 * Convert ParsedTask to CreateTaskInput
 */
export function convertToCreateTaskInput(
  parsed: ParsedTask,
  options: ParseOptions
): CreateTaskInput {
  const { defaultBoardId = 'default', defaultColumnId = 'todo' } = options;

  const input: CreateTaskInput = {
    boardId: defaultBoardId,
    columnId: defaultColumnId,
    title: parsed.title || 'Untitled Task',
    description: parsed.description,
    priority: (parsed.priority as any) || 'MEDIUM',
    dueDate: parsed.dueDate,
    dueTime: parsed.dueTime,
    labels: parsed.labels || [],
  };

  // Add subtasks if requested and available
  if (
    options.includeSubtasks &&
    parsed.subtasks &&
    parsed.subtasks.length > 0
  ) {
    input.subtasks = parsed.subtasks.map((title, index) => ({
      title,
      position: index,
    }));
  }

  return input;
}

/**
 * Extract entities from natural language query
 */
export function extractEntities(query: string): ExtractedEntity[] {
  const entities: ExtractedEntity[] = [];

  // Date patterns
  const datePatterns = [
    { pattern: /\b(today|tomorrow|tonight)\b/gi, type: 'date' as const },
    {
      pattern:
        /\b(next|this) (week|month|monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b/gi,
      type: 'date' as const,
    },
    { pattern: /\d{4}-\d{2}-\d{2}/g, type: 'date' as const },
    { pattern: /\d{1,2}\/\d{1,2}(\/\d{2,4})?/g, type: 'date' as const },
  ];

  // Time patterns
  const timePatterns = [
    {
      pattern: /\b(morning|afternoon|evening|night)\b/gi,
      type: 'time' as const,
    },
    { pattern: /\b\d{1,2}:\d{2}\s*(am|pm)?\b/gi, type: 'time' as const },
    {
      pattern: /\bat\s+\d{1,2}(:\d{2})?\s*(am|pm)?\b/gi,
      type: 'time' as const,
    },
  ];

  // Priority patterns
  const priorityPatterns = [
    {
      pattern: /\b(urgent|critical|asap|emergency)\b/gi,
      type: 'priority' as const,
    },
    { pattern: /\b(important|high priority)\b/gi, type: 'priority' as const },
    {
      pattern: /\b(low priority|whenever|no rush)\b/gi,
      type: 'priority' as const,
    },
  ];

  // Action patterns
  const actionPatterns = [
    {
      pattern: /\b(create|build|develop|implement|design|write|draft)\b/gi,
      type: 'action' as const,
    },
    {
      pattern: /\b(review|check|verify|test|validate)\b/gi,
      type: 'action' as const,
    },
    {
      pattern: /\b(send|email|call|contact|reach out)\b/gi,
      type: 'action' as const,
    },
  ];

  // Duration patterns - Week 8: Added duration extraction
  const durationPatterns = [
    {
      pattern: /\b(\d+)\s*(hour|hours|hr|hrs)\b/gi,
      type: 'duration' as const,
    },
    {
      pattern: /\b(\d+)\s*(minute|minutes|min|mins)\b/gi,
      type: 'duration' as const,
    },
    {
      pattern: /\b(\d+)\s*(day|days)\b/gi,
      type: 'duration' as const,
    },
    {
      pattern: /\b(quick|fast|short|brief)\b/gi,
      type: 'duration' as const,
    },
    {
      pattern: /\b(long|extended|lengthy)\b/gi,
      type: 'duration' as const,
    },
  ];

  // Extract all patterns
  const allPatterns = [
    ...datePatterns,
    ...timePatterns,
    ...priorityPatterns,
    ...actionPatterns,
    ...durationPatterns, // Week 8: Include duration patterns
  ];

  allPatterns.forEach(({ pattern, type }) => {
    let match;
    while ((match = pattern.exec(query)) !== null) {
      entities.push({
        type,
        value: match[0],
        position: match.index,
      });
    }
  });

  // Sort by position
  entities.sort((a, b) => a.position - b.position);

  return entities;
}

/**
 * Calculate confidence score for parsing
 */
function calculateParseConfidence(
  parsed: ParsedTask,
  entities: ExtractedEntity[]
): number {
  let confidence = 0.5; // Base confidence

  // Boost confidence for extracted entities
  if (entities.length > 0) {
    confidence += Math.min(0.3, entities.length * 0.1);
  }

  // Boost for having priority
  if (parsed.priority) {
    confidence += 0.1;
  }

  // Boost for having due date
  if (parsed.dueDate) {
    confidence += 0.1;
  }

  // Boost for having subtasks
  if (parsed.subtasks && parsed.subtasks.length > 0) {
    confidence += 0.1;
  }

  // Penalty for very short or very long titles
  if (parsed.title.length < 3 || parsed.title.length > 200) {
    confidence -= 0.1;
  }

  return Math.max(0, Math.min(1, confidence));
}

/**
 * Suggest task labels based on content
 */
export function suggestLabels(query: string): string[] {
  const queryLower = query.toLowerCase();
  const suggestions: string[] = [];

  // Domain-specific labels
  const labelMap: Record<string, string[]> = {
    'bug|fix|error|issue': ['bug', 'fix'],
    'feature|enhancement|new': ['feature', 'enhancement'],
    'documentation|docs|readme': ['documentation'],
    'test|testing|qa': ['testing'],
    'refactor|cleanup|improve': ['refactoring'],
    'security|vulnerability|exploit': ['security'],
    'performance|optimize|speed': ['performance'],
    'design|ui|ux': ['design'],
    'backend|api|server': ['backend'],
    'frontend|client|ui': ['frontend'],
  };

  Object.entries(labelMap).forEach(([pattern, labels]) => {
    const regex = new RegExp(`\\b(${pattern})\\b`, 'i');
    if (regex.test(queryLower)) {
      suggestions.push(...labels);
    }
  });

  // Remove duplicates
  return [...new Set(suggestions)];
}

/**
 * Extract action items from description
 */
export function extractActionItems(description: string): string[] {
  const lines = description.split('\n');
  const actionItems: string[] = [];

  lines.forEach(line => {
    const trimmed = line.trim();
    // Check for list markers
    if (
      trimmed.match(/^[-*+•]\s+/) ||
      trimmed.match(/^\d+\.\s+/) ||
      trimmed.match(/^\[[ x]\]\s+/)
    ) {
      // Remove marker
      const item = trimmed
        .replace(/^[-*+•]\s+/, '')
        .replace(/^\d+\.\s+/, '')
        .replace(/^\[[ x]\]\s+/, '')
        .trim();

      if (item.length > 0) {
        actionItems.push(item);
      }
    }
  });

  return actionItems;
}

/**
 * Normalize date from various formats
 * Week 8: Enhanced with more relative date patterns
 */
export function normalizeDate(dateStr: string): Date | null {
  const now = new Date();
  const dateStrLower = dateStr.toLowerCase().trim();

  // Handle "in X days/weeks/months" pattern
  const inPattern = /^in\s+(\d+)\s+(day|days|week|weeks|month|months)$/i;
  const inMatch = dateStrLower.match(inPattern);
  if (inMatch) {
    const count = parseInt(inMatch[1], 10);
    const unit = inMatch[2].toLowerCase();
    const date = new Date(now);

    if (unit.startsWith('day')) {
      date.setDate(date.getDate() + count);
    } else if (unit.startsWith('week')) {
      date.setDate(date.getDate() + count * 7);
    } else if (unit.startsWith('month')) {
      date.setMonth(date.getMonth() + count);
    }

    return date;
  }

  // Handle "next [day of week]" pattern
  const dayNames = [
    'sunday',
    'monday',
    'tuesday',
    'wednesday',
    'thursday',
    'friday',
    'saturday',
  ];
  const nextDayPattern = /^next\s+(sunday|monday|tuesday|wednesday|thursday|friday|saturday)$/i;
  const nextDayMatch = dateStrLower.match(nextDayPattern);
  if (nextDayMatch) {
    const targetDay = dayNames.indexOf(nextDayMatch[1].toLowerCase());
    const currentDay = now.getDay();
    let daysUntil = targetDay - currentDay;
    if (daysUntil <= 0) daysUntil += 7; // Next occurrence
    const date = new Date(now);
    date.setDate(date.getDate() + daysUntil);
    return date;
  }

  // Handle "end of month/week"
  if (dateStrLower === 'end of month') {
    const date = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    return date;
  }
  if (dateStrLower === 'end of week') {
    const currentDay = now.getDay();
    const daysUntilSunday = 7 - currentDay;
    const date = new Date(now);
    date.setDate(date.getDate() + daysUntilSunday);
    return date;
  }

  // Handle relative dates (existing)
  const relativeDateMap: Record<string, () => Date> = {
    today: () => now,
    tomorrow: () => {
      const date = new Date(now);
      date.setDate(date.getDate() + 1);
      return date;
    },
    'next week': () => {
      const date = new Date(now);
      date.setDate(date.getDate() + 7);
      return date;
    },
    'next month': () => {
      const date = new Date(now);
      date.setMonth(date.getMonth() + 1);
      return date;
    },
    yesterday: () => {
      const date = new Date(now);
      date.setDate(date.getDate() - 1);
      return date;
    },
  };

  if (dateStrLower in relativeDateMap) {
    return relativeDateMap[dateStrLower]();
  }

  // Try parsing as ISO or standard date
  const parsed = new Date(dateStr);
  if (!isNaN(parsed.getTime())) {
    return parsed;
  }

  return null;
}

/**
 * Extract and estimate task duration in minutes
 * Week 8: New function for duration estimation
 */
export function estimateDuration(query: string): number | null {
  const queryLower = query.toLowerCase();

  // Explicit duration patterns
  const hourPattern = /(\d+)\s*(hour|hours|hr|hrs)/i;
  const minutePattern = /(\d+)\s*(minute|minutes|min|mins)/i;
  const dayPattern = /(\d+)\s*(day|days)/i;

  // Check for explicit durations
  const hourMatch = queryLower.match(hourPattern);
  if (hourMatch) {
    return parseInt(hourMatch[1], 10) * 60;
  }

  const minuteMatch = queryLower.match(minutePattern);
  if (minuteMatch) {
    return parseInt(minuteMatch[1], 10);
  }

  const dayMatch = queryLower.match(dayPattern);
  if (dayMatch) {
    return parseInt(dayMatch[1], 10) * 8 * 60; // Assume 8 hours per day
  }

  // Implicit duration estimates
  if (/\b(quick|fast|short|brief)\b/i.test(queryLower)) {
    return 15; // 15 minutes
  }
  if (/\b(long|extended|lengthy)\b/i.test(queryLower)) {
    return 120; // 2 hours
  }

  // Action-based estimates
  const actionEstimates: Record<string, number> = {
    'email|call|send': 15,
    'review|check|verify': 30,
    'meeting|discussion': 60,
    'develop|implement|build': 120,
    'design|plan': 90,
    'test|validate': 45,
    'research|investigate': 90,
    'write|draft|document': 60,
  };

  for (const [pattern, minutes] of Object.entries(actionEstimates)) {
    const regex = new RegExp(`\\b(${pattern})\\b`, 'i');
    if (regex.test(queryLower)) {
      return minutes;
    }
  }

  return null; // Unable to estimate
}
