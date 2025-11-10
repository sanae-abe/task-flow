/**
 * useAIRecommendations - AI task recommendations
 *
 * AI分析によるタスク推奨機能を提供するカスタムhook。
 * GraphQL query（NEXT_RECOMMENDED_TASK）をラップし、以下機能を提供：
 * - network-only fetchPolicy（常に最新の推奨を取得）
 * - エラーハンドリング（フォールバック処理）
 * - リフレッシュ機能（手動再取得）
 * - ローディング状態管理
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
 * @see /Users/sanae.abe/workspace/taskflow-app/src/graphql/ai-features.graphql
 * @see /Users/sanae.abe/workspace/taskflow-app/src/lib/apollo-client.ts
 */

import { useCallback } from 'react';
import { useNextRecommendedTaskQuery } from '../generated/graphql';
import type { Task } from '../types';

/**
 * Return type for useAIRecommendations hook
 */
export interface UseAIRecommendationsReturn {
  /**
   * Next recommended task to work on (nullable if no tasks)
   */
  recommendation: Task | null;

  /**
   * Loading state
   */
  loading: boolean;

  /**
   * GraphQL/network error
   */
  error: Error | null;

  /**
   * Manually refresh recommendations
   */
  refresh: () => Promise<void>;
}

/**
 * useAIRecommendations Hook
 *
 * AI推奨タスク取得のカスタムhook。
 * リアルタイム優先順位付けを提供。
 *
 * @param boardId - Board ID for recommendations
 * @param options - Optional configuration
 */
export const useAIRecommendations = (
  boardId: string,
  options?: {
    /**
     * Skip query execution (default: false)
     */
    skip?: boolean;

    /**
     * Polling interval in milliseconds (default: disabled)
     */
    pollInterval?: number;
  }
): UseAIRecommendationsReturn => {
  // GraphQL query (auto-generated hook)
  const { data, loading, error, refetch } = useNextRecommendedTaskQuery({
    variables: { boardId },
    fetchPolicy: 'network-only', // Always fetch latest recommendations
    errorPolicy: 'all', // Capture both data and errors
    skip: options?.skip ?? false,
    pollInterval: options?.pollInterval,
  });

  /**
   * Manually refresh recommendations
   *
   * Force refetch from server (network-only).
   */
  const refresh = useCallback(async () => {
    try {
      await refetch();
    } catch (err) {
      // Error already captured by Apollo error state
      console.error('Failed to refresh AI recommendations:', err);
    }
  }, [refetch]);

  // Extract recommendation from GraphQL response
  const recommendation = (data?.nextRecommendedTask || null) as Task | null;

  return {
    recommendation,
    loading,
    error: error ? new Error(error.message) : null,
    refresh,
  };
};
