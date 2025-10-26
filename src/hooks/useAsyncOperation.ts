import { useState, useCallback } from "react";

/**
 * 非同期操作の状態管理を行うカスタムフック
 * ローディング状態、エラー状態、成功状態を統一的に管理
 */
export interface UseAsyncOperationResult<T = void> {
  /** 現在実行中かどうか */
  isLoading: boolean;
  /** エラーメッセージ */
  _error: string | null;
  /** 非同期操作を実行する関数 */
  execute: (operation: () => Promise<T>) => Promise<T>;
  /** エラーをクリアする関数 */
  clearError: () => void;
  /** 状態をリセットする関数 */
  reset: () => void;
}

export const useAsyncOperation = <T = void>(): UseAsyncOperationResult<T> => {
  const [isLoading, setIsLoading] = useState(false);
  const [_error, setError] = useState<string | null>(null);

  const execute = useCallback(async (operation: () => Promise<T>): Promise<T> => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await operation();
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "操作に失敗しました";
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const reset = useCallback(() => {
    setIsLoading(false);
    setError(null);
  }, []);

  return {
    isLoading,
    _error,
    execute,
    clearError,
    reset,
  };
};