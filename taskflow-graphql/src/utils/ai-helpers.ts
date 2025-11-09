/**
 * AI Helper Utilities
 * Common utilities for AI operations across the application
 */

import type { TaskRecord } from './indexeddb.js';
import type { UserContext } from './ai-client.js';

// ============================================================================
// Context Building
// ============================================================================

/**
 * Build user context from task history
 */
export function buildUserContext(
  completedTasks: TaskRecord[],
  currentTime: Date = new Date()
): UserContext {
  const completionHistory = completedTasks
    .filter(t => t.completedAt && t.createdAt)
    .map(task => {
      const completedAt = new Date(task.completedAt!);
      const createdAt = new Date(task.createdAt);
      const duration = Math.round(
        (completedAt.getTime() - createdAt.getTime()) / (1000 * 60)
      ); // minutes

      return {
        taskId: task.id,
        completedAt,
        timeOfDay: completedAt.getHours(),
        dayOfWeek: completedAt.getDay(),
        duration,
      };
    });

  return {
    currentTime,
    completionHistory,
  };
}

/**
 * Extract working hours from completion history
 */
export function extractWorkingHours(
  completionHistory: Array<{ timeOfDay: number }>
): { start: string; end: string } | undefined {
  if (completionHistory.length === 0) return undefined;

  const hours = completionHistory.map(h => h.timeOfDay).sort((a, b) => a - b);

  // Find most common start/end hours
  const startHour = Math.min(...hours);
  const endHour = Math.max(...hours);

  return {
    start: `${startHour.toString().padStart(2, '0')}:00`,
    end: `${endHour.toString().padStart(2, '0')}:00`,
  };
}

/**
 * Determine preferred priority from history
 */
export function determinePreferredPriority(
  completedTasks: TaskRecord[]
): 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | undefined {
  if (completedTasks.length === 0) return undefined;

  const priorityCounts = completedTasks.reduce(
    (acc, task) => {
      acc[task.priority] = (acc[task.priority] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  const sortedPriorities = Object.entries(priorityCounts).sort(
    (a, b) => b[1] - a[1]
  );

  return sortedPriorities[0]?.[0] as
    | 'CRITICAL'
    | 'HIGH'
    | 'MEDIUM'
    | 'LOW'
    | undefined;
}

// ============================================================================
// Task Analysis
// ============================================================================

/**
 * Detect task complexity level
 */
export function detectComplexity(
  task: TaskRecord
): 'simple' | 'moderate' | 'complex' | 'very_complex' {
  let complexityScore = 0;

  // Subtask count
  if (task.subtasks.length > 10) complexityScore += 3;
  else if (task.subtasks.length > 5) complexityScore += 2;
  else if (task.subtasks.length > 2) complexityScore += 1;

  // Description length
  if (task.description) {
    if (task.description.length > 500) complexityScore += 2;
    else if (task.description.length > 200) complexityScore += 1;
  }

  // Priority (high priority often means complex)
  if (task.priority === 'CRITICAL') complexityScore += 1;

  // Files attached (more files = more complex)
  if (task.files && task.files.length > 3) complexityScore += 1;

  // Classification
  if (complexityScore >= 6) return 'very_complex';
  if (complexityScore >= 4) return 'complex';
  if (complexityScore >= 2) return 'moderate';
  return 'simple';
}

/**
 * Detect if task is suitable for breakdown
 */
export function shouldBreakdown(task: TaskRecord): {
  shouldBreak: boolean;
  reason: string;
} {
  const complexity = detectComplexity(task);

  // Already has many subtasks
  if (task.subtasks.length > 5) {
    return {
      shouldBreak: false,
      reason: 'Task already has sufficient subtasks',
    };
  }

  // Simple tasks don't need breakdown
  if (complexity === 'simple') {
    return {
      shouldBreak: false,
      reason: 'Task is simple enough to execute directly',
    };
  }

  // Complex tasks benefit from breakdown
  if (complexity === 'complex' || complexity === 'very_complex') {
    return {
      shouldBreak: true,
      reason: `Task complexity (${complexity}) suggests breakdown would be helpful`,
    };
  }

  // Moderate complexity: optional
  return {
    shouldBreak: false,
    reason: 'Task complexity is moderate, breakdown is optional',
  };
}

/**
 * Extract keywords from task for categorization
 */
export function extractTaskKeywords(task: TaskRecord): string[] {
  const text = `${task.title} ${task.description || ''}`.toLowerCase();
  const keywords: string[] = [];

  // Technical keywords
  const technicalPatterns = [
    'api',
    'backend',
    'frontend',
    'database',
    'server',
    'ui',
    'ux',
    'design',
    'component',
    'module',
    'test',
    'debug',
    'fix',
    'refactor',
    'optimize',
    'deploy',
    'release',
    'build',
    'ci/cd',
    'security',
    'performance',
    'scalability',
  ];

  // Action keywords
  const actionPatterns = [
    'create',
    'build',
    'develop',
    'implement',
    'design',
    'review',
    'test',
    'verify',
    'validate',
    'analyze',
    'research',
    'investigate',
    'document',
    'write',
  ];

  // Category keywords
  const categoryPatterns = [
    'bug',
    'feature',
    'enhancement',
    'documentation',
    'maintenance',
    'research',
    'planning',
  ];

  const allPatterns = [
    ...technicalPatterns,
    ...actionPatterns,
    ...categoryPatterns,
  ];

  allPatterns.forEach(pattern => {
    if (text.includes(pattern)) {
      keywords.push(pattern);
    }
  });

  return [...new Set(keywords)]; // Remove duplicates
}

// ============================================================================
// Validation
// ============================================================================

/**
 * Validate AI confidence score
 */
export function isConfidenceAcceptable(confidence: number): boolean {
  return confidence >= 0.5; // 50% minimum confidence threshold
}

/**
 * Validate AI response quality
 */
export function validateAIResponse<T>(
  response: T | null | undefined,
  confidence: number
): { valid: boolean; reason?: string } {
  if (!response) {
    return { valid: false, reason: 'Empty response from AI' };
  }

  if (!isConfidenceAcceptable(confidence)) {
    return {
      valid: false,
      reason: `Low confidence score: ${confidence.toFixed(2)}`,
    };
  }

  return { valid: true };
}

// ============================================================================
// Formatting
// ============================================================================

/**
 * Format confidence score for display
 */
export function formatConfidence(confidence: number): string {
  const percentage = Math.round(confidence * 100);
  if (percentage >= 90) return `${percentage}% (Very High)`;
  if (percentage >= 70) return `${percentage}% (High)`;
  if (percentage >= 50) return `${percentage}% (Medium)`;
  return `${percentage}% (Low)`;
}

/**
 * Format task list for AI prompt
 */
export function formatTasksForPrompt(tasks: TaskRecord[]): string {
  return tasks
    .map(
      (task, index) =>
        `${index + 1}. [${task.priority}] ${task.title}${
          task.dueDate
            ? ` (Due: ${new Date(task.dueDate).toLocaleDateString()})`
            : ''
        }`
    )
    .join('\n');
}

/**
 * Format time duration in human-readable format
 */
export function formatDuration(minutes: number): string {
  if (minutes < 60) {
    return `${minutes}m`;
  }
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
}

// ============================================================================
// Caching & Performance
// ============================================================================

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

const cache = new Map<string, CacheEntry<any>>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

/**
 * Cache AI response with TTL
 */
export function cacheAIResponse<T>(key: string, data: T): void {
  cache.set(key, {
    data,
    timestamp: Date.now(),
  });
}

/**
 * Get cached AI response if valid
 */
export function getCachedAIResponse<T>(key: string): T | null {
  const entry = cache.get(key);
  if (!entry) return null;

  const age = Date.now() - entry.timestamp;
  if (age > CACHE_TTL) {
    cache.delete(key);
    return null;
  }

  return entry.data;
}

/**
 * Clear AI response cache
 */
export function clearAICache(): void {
  cache.clear();
}

/**
 * Generate cache key for AI operations
 */
export function generateCacheKey(
  operation: string,
  params: Record<string, any>
): string {
  const sortedParams = Object.keys(params)
    .sort()
    .map(key => `${key}:${JSON.stringify(params[key])}`)
    .join('|');
  return `${operation}:${sortedParams}`;
}

// ============================================================================
// Error Handling
// ============================================================================

/**
 * Wrap AI operation with error handling
 */
export async function safeAIOperation<T>(
  operation: () => Promise<T>,
  fallback: T
): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    console.error('AI operation failed:', error);
    return fallback;
  }
}

/**
 * Retry AI operation with exponential backoff
 */
export async function retryAIOperation<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as Error;
      if (attempt < maxRetries - 1) {
        const delay = baseDelay * Math.pow(2, attempt);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError || new Error('AI operation failed after retries');
}

// ============================================================================
// Metrics & Analytics
// ============================================================================

interface AIMetrics {
  operationCount: number;
  successCount: number;
  failureCount: number;
  averageConfidence: number;
  averageLatency: number;
}

const metrics: AIMetrics = {
  operationCount: 0,
  successCount: 0,
  failureCount: 0,
  averageConfidence: 0,
  averageLatency: 0,
};

/**
 * Track AI operation metrics
 */
export function trackAIMetrics(
  success: boolean,
  confidence: number,
  latency: number
): void {
  metrics.operationCount++;
  if (success) {
    metrics.successCount++;
  } else {
    metrics.failureCount++;
  }

  // Update running averages
  const totalOperations = metrics.operationCount;
  metrics.averageConfidence =
    (metrics.averageConfidence * (totalOperations - 1) + confidence) /
    totalOperations;
  metrics.averageLatency =
    (metrics.averageLatency * (totalOperations - 1) + latency) /
    totalOperations;
}

/**
 * Get AI metrics
 */
export function getAIMetrics(): Readonly<AIMetrics> {
  return { ...metrics };
}

/**
 * Reset AI metrics
 */
export function resetAIMetrics(): void {
  metrics.operationCount = 0;
  metrics.successCount = 0;
  metrics.failureCount = 0;
  metrics.averageConfidence = 0;
  metrics.averageLatency = 0;
}
