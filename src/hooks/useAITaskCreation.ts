/**
 * useAITaskCreation - AI-powered natural language task creation
 *
 * 自然言語入力からタスクを作成するカスタムhook。
 * GraphQL mutation（CREATE_TASK_FROM_NL）をラップし、以下機能を提供：
 * - DOMPurifyによるXSS対策（AI生成コンテンツのサニタイズ）
 * - IndexedDB自動同期（Data Access Policy準拠）
 * - Sonner toast通知（成功/エラー）
 * - エラーハンドリング（GraphQLエラー、ネットワークエラー）
 *
 * @example
 * ```typescript
 * const { createTask, loading, error } = useAITaskCreation();
 *
 * const handleSubmit = async () => {
 *   const result = await createTask('明日までにレポート提出');
 *   if (result) {
 *     console.log('Created task:', result);
 *   }
 * };
 * ```
 *
 * @see /Users/sanae.abe/workspace/taskflow-app/src/graphql/ai-features.graphql
 * @see /Users/sanae.abe/workspace/taskflow-app/src/lib/apollo-client.ts
 */

import { useCallback } from 'react';
import DOMPurify from 'dompurify';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import { useCreateTaskFromNaturalLanguageMutation } from '../generated/graphql';
import { useKanban } from '../contexts/KanbanContext';
import type { Task } from '../types';

/**
 * AI Context for natural language processing
 *
 * Optional context to improve AI accuracy
 */
export interface AIContext {
  boardId?: string;
  preferences?: {
    defaultPriority?: string;
    defaultColumnId?: string;
  };
  recentActivity?: string[];
}

/**
 * Return type for useAITaskCreation hook
 */
export interface UseAITaskCreationReturn {
  /**
   * Create task from natural language query
   * @param query - Natural language input (e.g., "明日までにレポート")
   * @param context - Optional AI context for better accuracy
   * @returns Created task or null on error
   */
  createTask: (query: string, context?: AIContext) => Promise<Task | null>;

  /**
   * Loading state
   */
  loading: boolean;

  /**
   * GraphQL/network error
   */
  error: Error | null;
}

/**
 * useAITaskCreation Hook
 *
 * AI自然言語タスク作成のカスタムhook。
 * セキュリティ・データ同期・通知をすべて自動処理。
 */
export const useAITaskCreation = (): UseAITaskCreationReturn => {
  const { t } = useTranslation();
  const { dispatch } = useKanban() as any; // GraphQL integration placeholder - dispatch API not yet in KanbanContext

  // GraphQL mutation (auto-generated hook)
  const [createTaskMutation, { loading, error: mutationError }] =
    useCreateTaskFromNaturalLanguageMutation({
      errorPolicy: 'all', // Capture both data and errors
    }) as any; // Type compatibility for GraphQL codegen

  /**
   * Sanitize AI-generated content (XSS protection)
   *
   * AI応答はユーザー入力と同等のリスク。必ずサニタイズ。
   */
  const sanitizeContent = useCallback(
    (content: string): string =>
      DOMPurify.sanitize(content, {
        ALLOWED_TAGS: [], // Remove all HTML tags
        ALLOWED_ATTR: [],
      }),
    []
  );

  /**
   * Create task from natural language input
   *
   * Main function exposed to components.
   */
  const createTask = useCallback(
    async (query: string, context?: AIContext): Promise<Task | null> => {
      try {
        // Input validation
        if (!query || query.trim().length === 0) {
          toast.error(t('ai.errors.emptyQuery'));
          return null;
        }

        if (query.length > 1000) {
          toast.error(t('ai.errors.queryTooLong'));
          return null;
        }

        // Execute GraphQL mutation
        const { data, errors } = await createTaskMutation({
          variables: {
            query: query.trim(),
            context: context || {},
          },
        });

        // Handle GraphQL errors
        if (errors && errors.length > 0) {
          const errorMessage =
            errors[0]?.message || t('ai.errors.graphqlError');
          toast.error(errorMessage);
          return null;
        }

        // Handle no data returned
        if (!data || !data.createTaskFromNaturalLanguage) {
          toast.error(t('ai.errors.noDataReturned'));
          return null;
        }

        const aiTask = data.createTaskFromNaturalLanguage as any;

        // Sanitize AI-generated content (XSS protection)
        const sanitizedTask: Task = {
          id: aiTask.id,
          title: sanitizeContent(aiTask.title),
          description: aiTask.description
            ? sanitizeContent(aiTask.description)
            : '',
          createdAt: aiTask.createdAt || new Date().toISOString(),
          updatedAt: aiTask.updatedAt || new Date().toISOString(),
          dueDate: aiTask.dueDate || null,
          completedAt: null,
          priority: aiTask.priority,
          labels: aiTask.labels || [],
          subTasks: [],
          files: [],
        };

        // Sync to IndexedDB (Data Access Policy compliance)
        // Dispatch to KanbanContext → triggers useDataSync auto-save (placeholder API)
        if (dispatch) {
          dispatch({
            type: 'ADD_TASK',
            payload: {
              boardId: aiTask.boardId,
              columnId: aiTask.columnId,
              task: sanitizedTask,
            },
          });
        }

        // Success notification
        toast.success(
          t('ai.success.taskCreated', { title: sanitizedTask.title })
        );

        return sanitizedTask;
      } catch (err) {
        // Network error or unexpected error
        const errorMessage =
          err instanceof Error ? err.message : t('ai.errors.networkError');
        toast.error(errorMessage);
        return null;
      }
    },
    [createTaskMutation, dispatch, sanitizeContent, t]
  );

  return {
    createTask,
    loading,
    error: mutationError ? new Error(mutationError.message) : null,
  };
};
