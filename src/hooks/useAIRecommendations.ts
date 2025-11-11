/**
 * useAIRecommendations - AI task recommendations (IndexedDB-based)
 *
 * AI分析によるタスク推奨機能を提供するカスタムhook。
 * IndexedDBのタスクを使用してローカルでAI推奨を計算し、以下機能を提供：
 * - IndexedDB直接アクセス（オフライン対応）
 * - AI推奨スコア計算（優先度 + 期限）
 * - リフレッシュ機能（手動再計算）
 * - データアクセスポリシー準拠
 *
 * @example
 * ```typescript
 * const { recommendation, loading, error, refresh } = useAIRecommendations('board-1');
 *
 * if (recommendation) {
 *   console.log('Next task:', recommendation.title);
 * }
 * ```
 *
 * @see /Users/sanae.abe/workspace/taskflow-app/src/lib/data-access-policy.ts
 * @see /Users/sanae.abe/workspace/taskflow-app/src/contexts/BoardContext.tsx
 */

import { useCallback, useMemo } from 'react';
import { useBoard } from '../contexts/BoardContext';
import type { Task, Priority } from '../types';

/**
 * Return type for useAIRecommendations hook
 */
export interface UseAIRecommendationsReturn {
  /**
   * Next recommended task to work on (nullable if no tasks)
   */
  recommendation: Task | null;

  /**
   * Loading state (always false for IndexedDB)
   */
  loading: boolean;

  /**
   * Error (null for IndexedDB)
   */
  error: Error | null;

  /**
   * Manually refresh recommendations
   */
  refresh: () => Promise<void>;
}

/**
 * Priority score mapping
 * Based on backend AI recommendation logic
 */
const PRIORITY_SCORES: Record<Priority, number> = {
  critical: 100,
  high: 75,
  medium: 50,
  low: 25,
};

/**
 * Calculate AI recommendation score for a task
 *
 * Score calculation:
 * - Priority score: critical=100, high=75, medium=50, low=25
 * - Due date score: closer deadline = higher score
 *
 * @param task - Task to calculate score for
 * @returns AI recommendation score (0-200)
 */
function calculateAIScore(task: Task): number {
  // Priority score
  const priorityScore = task.priority
    ? PRIORITY_SCORES[task.priority]
    : PRIORITY_SCORES.low;

  // Due date score (0-100, closer deadline = higher score)
  let dueDateScore = 0;
  if (task.dueDate) {
    const now = new Date();
    const dueDate = new Date(task.dueDate);
    const daysUntilDue = (dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);

    if (daysUntilDue < 0) {
      // Overdue tasks get highest score
      dueDateScore = 100;
    } else if (daysUntilDue <= 1) {
      // Due today or tomorrow
      dueDateScore = 90;
    } else if (daysUntilDue <= 3) {
      // Due in 2-3 days
      dueDateScore = 70;
    } else if (daysUntilDue <= 7) {
      // Due in 4-7 days
      dueDateScore = 50;
    } else {
      // Due in 8+ days
      dueDateScore = 30;
    }
  }

  return priorityScore + dueDateScore;
}

/**
 * useAIRecommendations Hook
 *
 * AI推奨タスク取得のカスタムhook（IndexedDBベース）。
 * リアルタイム優先順位付けを提供。
 *
 * @param boardId - Board ID for recommendations (not used, kept for API compatibility)
 * @param options - Optional configuration
 */
export const useAIRecommendations = (
  _boardId: string,
  options?: {
    /**
     * Skip calculation (default: false)
     */
    skip?: boolean;

    /**
     * Polling interval (not implemented for IndexedDB)
     */
    pollInterval?: number;
  }
): UseAIRecommendationsReturn => {
  const { currentBoard } = useBoard();

  /**
   * Calculate AI recommendation from IndexedDB tasks
   */
  const recommendation = useMemo(() => {
    if (options?.skip || !currentBoard) {
      return null;
    }

    // Get all tasks from all columns
    const allTasks = currentBoard.columns.flatMap((column) => column.tasks);

    // Filter incomplete tasks (not completed, not deleted)
    const incompleteTasks = allTasks.filter(
      (task) =>
        task.completedAt === null &&
        task.deletionState !== 'deleted'
    );

    if (incompleteTasks.length === 0) {
      return null;
    }

    // Calculate AI score for each task
    const tasksWithScores = incompleteTasks.map((task) => ({
      task,
      score: calculateAIScore(task),
    }));

    // Sort by score (descending)
    tasksWithScores.sort((a, b) => b.score - a.score);

    // Return top recommended task
    return tasksWithScores[0].task;
  }, [currentBoard, options?.skip]);

  /**
   * Manually refresh recommendations
   *
   * For IndexedDB, this is a no-op since data is always up-to-date.
   * Kept for API compatibility.
   */
  const refresh = useCallback(async () => {
    // No-op: IndexedDB data is always current
    console.log('[useAIRecommendations] Refresh requested (IndexedDB is always current)');
  }, []);

  return {
    recommendation,
    loading: false, // No loading for IndexedDB
    error: null, // No error for IndexedDB
    refresh,
  };
};
