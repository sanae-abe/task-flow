/**
 * useTaskSubscriptions - Real-time task updates via WebSocket
 *
 * WebSocketベースのリアルタイムタスク更新を提供するカスタムhook。
 * GraphQL subscriptions（OnTaskCreated, OnTaskUpdated, OnTaskDeleted）をラップし、
 * 以下機能を提供：
 * - 自動IndexedDB同期（Data Access Policy準拠）
 * - 接続エラー・再接続処理
 * - イベントハンドラーコールバック
 * - 接続状態管理
 *
 * @example
 * ```typescript
 * const { connected, error } = useTaskSubscriptions({
 *   boardId: 'board-1',
 *   onTaskCreated: (task) => console.log('New task:', task),
 *   onTaskUpdated: (task) => console.log('Updated task:', task),
 *   onTaskDeleted: (taskId) => console.log('Deleted task:', taskId),
 * });
 * ```
 *
 * @see /Users/sanae.abe/workspace/taskflow-app/src/graphql/subscriptions.graphql
 * @see /Users/sanae.abe/workspace/taskflow-app/src/lib/apollo-client.ts
 */

import { useEffect, useState, useCallback } from 'react';
import {
  useOnTaskCreatedSubscription,
  useOnTaskUpdatedSubscription,
  useOnTaskDeletedSubscription,
} from '../generated/graphql';
import { useKanban } from '../contexts/KanbanContext';
import type { Task } from '../types';

/**
 * Event handlers for task subscriptions
 */
export interface TaskSubscriptionHandlers {
  /**
   * Callback when a new task is created
   * @param task - Newly created task
   */
  onTaskCreated?: (task: Task) => void;

  /**
   * Callback when a task is updated
   * @param task - Updated task
   */
  onTaskUpdated?: (task: Task) => void;

  /**
   * Callback when a task is deleted
   * @param taskId - ID of deleted task
   */
  onTaskDeleted?: (taskId: string) => void;
}

/**
 * Options for useTaskSubscriptions hook
 */
export interface UseTaskSubscriptionsOptions extends TaskSubscriptionHandlers {
  /**
   * Board ID to subscribe to (nullable for all boards)
   */
  boardId?: string;

  /**
   * Skip subscription activation (default: false)
   */
  skip?: boolean;
}

/**
 * Return type for useTaskSubscriptions hook
 */
export interface UseTaskSubscriptionsReturn {
  /**
   * WebSocket connection status
   */
  connected: boolean;

  /**
   * Subscription error (null if no error)
   */
  error: Error | null;
}

/**
 * useTaskSubscriptions Hook
 *
 * リアルタイムタスク更新のカスタムhook。
 * WebSocket接続とIndexedDB同期を自動管理。
 */
export const useTaskSubscriptions = (
  options: UseTaskSubscriptionsOptions = {}
): UseTaskSubscriptionsReturn => {
  const {
    boardId,
    skip = false,
    onTaskCreated,
    onTaskUpdated,
    onTaskDeleted,
  } = options;
  const { dispatch } = useKanban();
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  /**
   * Task Created Subscription
   */
  const {
    data: createdData,
    error: createdError,
    loading: createdLoading,
  } = useOnTaskCreatedSubscription({
    variables: { boardId: boardId || null },
    skip,
    onError: err => {
      console.error('Task created subscription error:', err);
      setError(new Error(err.message));
      setConnected(false);
    },
  });

  /**
   * Task Updated Subscription
   */
  const {
    data: updatedData,
    error: updatedError,
    loading: updatedLoading,
  } = useOnTaskUpdatedSubscription({
    variables: { boardId: boardId || null },
    skip,
    onError: err => {
      console.error('Task updated subscription error:', err);
      setError(new Error(err.message));
      setConnected(false);
    },
  });

  /**
   * Task Deleted Subscription
   */
  const {
    data: deletedData,
    error: deletedError,
    loading: deletedLoading,
  } = useOnTaskDeletedSubscription({
    variables: { boardId: boardId || null },
    skip,
    onError: err => {
      console.error('Task deleted subscription error:', err);
      setError(new Error(err.message));
      setConnected(false);
    },
  });

  /**
   * Handle task created event
   */
  const handleTaskCreated = useCallback(
    (task: Task, boardId: string, columnId: string) => {
      // Sync to IndexedDB via KanbanContext (placeholder API)
      if (dispatch) {
        dispatch({
          type: 'ADD_TASK',
          payload: {
            boardId,
            columnId,
            task,
          },
        });
      }

      // Call external handler
      if (onTaskCreated) {
        onTaskCreated(task);
      }
    },
    [dispatch, onTaskCreated]
  );

  /**
   * Handle task updated event
   */
  const handleTaskUpdated = useCallback(
    (task: Task) => {
      // Sync to IndexedDB via KanbanContext (placeholder API)
      if (dispatch) {
        dispatch({
          type: 'UPDATE_TASK',
          payload: {
            taskId: task.id,
            updates: task,
          },
        });
      }

      // Call external handler
      if (onTaskUpdated) {
        onTaskUpdated(task);
      }
    },
    [dispatch, onTaskUpdated]
  );

  /**
   * Handle task deleted event
   */
  const handleTaskDeleted = useCallback(
    (taskId: string) => {
      // Sync to IndexedDB via KanbanContext (placeholder API)
      if (dispatch) {
        dispatch({
          type: 'DELETE_TASK',
          payload: { taskId },
        });
      }

      // Call external handler
      if (onTaskDeleted) {
        onTaskDeleted(taskId);
      }
    },
    [dispatch, onTaskDeleted]
  );

  /**
   * Process task created data
   */
  useEffect(() => {
    if (createdData?.taskCreated) {
      const gqlTask = createdData.taskCreated as any;
      // Type adapter: Convert GraphQL Task to local Task type
      const task: Task = {
        id: gqlTask.id,
        title: gqlTask.title,
        description: gqlTask.description || '',
        createdAt: gqlTask.createdAt || new Date().toISOString(),
        updatedAt: gqlTask.updatedAt || new Date().toISOString(),
        dueDate: gqlTask.dueDate || null,
        completedAt: gqlTask.completedAt || null,
        priority: gqlTask.priority,
        labels: gqlTask.labels || [],
        subTasks: gqlTask.subTasks || [],
        files: gqlTask.files || [],
      };
      handleTaskCreated(task, gqlTask.boardId, gqlTask.columnId);
    }
  }, [createdData, handleTaskCreated]);

  /**
   * Process task updated data
   */
  useEffect(() => {
    if (updatedData?.taskUpdated) {
      const gqlTask = updatedData.taskUpdated as any;
      // Type adapter: Convert GraphQL Task to local Task type
      const task: Task = {
        id: gqlTask.id,
        title: gqlTask.title,
        description: gqlTask.description || '',
        createdAt: gqlTask.createdAt || new Date().toISOString(),
        updatedAt: gqlTask.updatedAt || new Date().toISOString(),
        dueDate: gqlTask.dueDate || null,
        completedAt: gqlTask.completedAt || null,
        priority: gqlTask.priority,
        labels: gqlTask.labels || [],
        subTasks: gqlTask.subTasks || [],
        files: gqlTask.files || [],
      };
      handleTaskUpdated(task);
    }
  }, [updatedData, handleTaskUpdated]);

  /**
   * Process task deleted data
   */
  useEffect(() => {
    if (deletedData?.taskDeleted) {
      handleTaskDeleted(deletedData.taskDeleted.id);
    }
  }, [deletedData, handleTaskDeleted]);

  /**
   * Update connection status
   */
  useEffect(() => {
    const isLoading = createdLoading || updatedLoading || deletedLoading;
    const hasError = createdError || updatedError || deletedError;

    if (!skip && !isLoading && !hasError) {
      setConnected(true);
      setError(null);
    } else if (hasError) {
      setConnected(false);
      setError(new Error('Subscription connection failed'));
    }
  }, [
    createdLoading,
    updatedLoading,
    deletedLoading,
    createdError,
    updatedError,
    deletedError,
    skip,
  ]);

  return {
    connected,
    error,
  };
};
