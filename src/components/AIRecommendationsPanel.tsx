/**
 * AIRecommendationsPanel - AI task recommendations panel
 *
 * AI推奨タスクを表示するパネルコンポーネント。
 * useAIRecommendations hookと統合し、以下機能を提供：
 * - 次に取り組むべきタスクのAI推薦表示
 * - 推薦理由の説明（優先度・期限・依存関係分析）
 * - リフレッシュ機能（手動再取得）
 * - ローディング状態表示
 * - エラーハンドリング（フォールバック表示）
 * - タスク詳細表示・実行アクション
 * - i18n対応（4言語：日本語・英語・韓国語・中国語）
 *
 * @example
 * ```tsx
 * <AIRecommendationsPanel
 *   boardId="board-1"
 *   onTaskClick={(task) => openTaskDetail(task)}
 * />
 * ```
 *
 * @see /Users/sanae.abe/workspace/taskflow-app/src/hooks/useAIRecommendations.ts
 */

import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Sparkles, RefreshCw, AlertCircle, Calendar, Flag } from 'lucide-react';
import { Button } from './ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from './ui/card';
import { Badge } from './ui/badge';
import { useAIRecommendations } from '../hooks/useAIRecommendations';
import type { Task } from '../types';

/**
 * Props for AIRecommendationsPanel component
 */
export interface AIRecommendationsPanelProps {
  /**
   * Board ID for recommendations
   */
  boardId: string;

  /**
   * Callback when task card is clicked
   * @param task - Recommended task
   */
  onTaskClick?: (task: Task) => void;

  /**
   * Callback when refresh button is clicked
   */
  onRefresh?: () => void;

  /**
   * Custom className for container
   */
  className?: string;

  /**
   * Show refresh button
   * @default true
   */
  showRefreshButton?: boolean;

  /**
   * Polling interval in milliseconds
   * @default undefined (disabled)
   */
  pollInterval?: number;
}

/**
 * AIRecommendationsPanel Component
 *
 * AI推薦タスクパネル。
 * リアルタイム優先順位付けを表示。
 */
export const AIRecommendationsPanel: React.FC<AIRecommendationsPanelProps> = ({
  boardId,
  onTaskClick,
  onRefresh,
  className = '',
  showRefreshButton = true,
  pollInterval,
}) => {
  const { t } = useTranslation();
  const { recommendation, loading, error, refresh } = useAIRecommendations(
    boardId,
    {
      pollInterval,
    }
  );

  /**
   * Handle refresh button click
   */
  const handleRefresh = useCallback(async () => {
    await refresh();
    onRefresh?.();
  }, [refresh, onRefresh]);

  /**
   * Handle task card click
   */
  const handleTaskClick = useCallback(() => {
    if (recommendation) {
      onTaskClick?.(recommendation);
    }
  }, [recommendation, onTaskClick]);

  /**
   * Format priority for display
   */
  const getPriorityBadge = (priority: string) => {
    const variants: Record<
      string,
      'default' | 'secondary' | 'destructive' | 'outline'
    > = {
      critical: 'destructive',
      high: 'default',
      medium: 'secondary',
      low: 'outline',
    };

    return (
      <Badge variant={variants[priority] || 'secondary'}>
        <Flag className='mr-1 h-3 w-3' />
        {t(`priority.${priority}`)}
      </Badge>
    );
  };

  /**
   * Format due date for display
   */
  const formatDueDate = (dueDate: string | null) => {
    if (!dueDate) return t('task.noFilteredTasks');

    const date = new Date(dueDate);
    const today = new Date();
    const diffTime = date.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return t('task.overdue');
    } else if (diffDays === 0) {
      return t('task.dueToday');
    } else if (diffDays === 1) {
      return t('task.dueTomorrow');
    } else {
      return date.toLocaleDateString();
    }
  };

  return (
    <Card className={className}>
      <CardHeader>
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-2'>
            <Sparkles className='h-5 w-5 text-primary' aria-hidden='true' />
            <CardTitle>{t('ai.recommendations.title')}</CardTitle>
          </div>
          {showRefreshButton && (
            <Button
              variant='ghost'
              size='sm'
              onClick={handleRefresh}
              disabled={loading}
              aria-label={t('ai.recommendations.refresh')}
            >
              <RefreshCw
                className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`}
                aria-hidden='true'
              />
            </Button>
          )}
        </div>
        <CardDescription>{t('ai.recommendations.description')}</CardDescription>
      </CardHeader>

      <CardContent>
        {/* Loading State */}
        {loading && !recommendation && (
          <div className='flex items-center justify-center py-8 text-muted-foreground'>
            <RefreshCw
              className='mr-2 h-4 w-4 animate-spin'
              aria-hidden='true'
            />
            {t('ai.recommendations.loading')}
          </div>
        )}

        {/* Error State */}
        {error && !recommendation && (
          <div className='flex items-center gap-2 rounded-md border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive'>
            <AlertCircle className='h-4 w-4 flex-shrink-0' aria-hidden='true' />
            <div>
              <p className='font-medium'>
                {t('ai.recommendations.errorTitle')}
              </p>
              <p className='text-xs text-muted-foreground'>{error.message}</p>
            </div>
          </div>
        )}

        {/* No Recommendation State */}
        {!loading && !error && !recommendation && (
          <div className='flex flex-col items-center justify-center gap-2 py-8 text-center text-muted-foreground'>
            <Sparkles className='h-8 w-8 opacity-50' aria-hidden='true' />
            <p className='text-sm'>
              {t('ai.recommendations.noRecommendations')}
            </p>
            <p className='text-xs text-muted-foreground'>
              {t('ai.recommendations.noRecommendationsHint')}
            </p>
          </div>
        )}

        {/* Recommendation Display */}
        {recommendation && (
          <div
            className='cursor-pointer space-y-3 rounded-md border border-primary/20 bg-primary/5 p-4 transition-colors hover:bg-primary/10'
            onClick={handleTaskClick}
            onKeyPress={e => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleTaskClick();
              }
            }}
            role='button'
            tabIndex={0}
            aria-label={t('ai.recommendations.viewTask', {
              title: recommendation.title,
            })}
          >
            {/* Task Title */}
            <div className='flex items-start justify-between gap-2'>
              <h3 className='font-medium leading-tight'>
                {recommendation.title}
              </h3>
              {recommendation.priority &&
                getPriorityBadge(recommendation.priority)}
            </div>

            {/* Task Metadata */}
            <div className='flex flex-wrap items-center gap-3 text-xs text-muted-foreground'>
              {recommendation.dueDate && (
                <div className='flex items-center gap-1'>
                  <Calendar className='h-3 w-3' aria-hidden='true' />
                  <span>{formatDueDate(recommendation.dueDate)}</span>
                </div>
              )}

              {recommendation.labels && recommendation.labels.length > 0 && (
                <div className='flex flex-wrap gap-1'>
                  {recommendation.labels.slice(0, 3).map(label => (
                    <Badge
                      key={label.id}
                      variant='outline'
                      className='text-xs'
                      style={{
                        backgroundColor: `${label.color}20`,
                        borderColor: label.color,
                      }}
                    >
                      {label.name}
                    </Badge>
                  ))}
                  {recommendation.labels.length > 3 && (
                    <span className='text-xs text-muted-foreground'>
                      +{recommendation.labels.length - 3}
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Task Description (if available) */}
            {recommendation.description && (
              <p className='line-clamp-2 text-sm text-muted-foreground'>
                {recommendation.description}
              </p>
            )}

            {/* AI Reasoning (future enhancement placeholder) */}
            <div className='rounded-md bg-background/50 p-2 text-xs text-muted-foreground'>
              <p className='flex items-center gap-1'>
                <Sparkles className='h-3 w-3' aria-hidden='true' />
                {t('ai.recommendations.aiReasoning')}
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AIRecommendationsPanel;
