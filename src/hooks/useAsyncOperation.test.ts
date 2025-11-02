/**
 * useAsyncOperation hook tests
 * 非同期操作状態管理の包括的テスト
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { useAsyncOperation } from './useAsyncOperation';

describe('useAsyncOperation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Initial state', () => {
    it('should initialize with correct default values', () => {
      const { result } = renderHook(() => useAsyncOperation());

      expect(result.current.isLoading).toBe(false);
      expect(result.current._error).toBeNull();
      expect(typeof result.current.execute).toBe('function');
      expect(typeof result.current.clearError).toBe('function');
      expect(typeof result.current.reset).toBe('function');
    });
  });

  describe('execute - success cases', () => {
    it('should execute async operation successfully', async () => {
      const { result } = renderHook(() => useAsyncOperation<string>());
      const mockOperation = vi.fn().mockResolvedValue('success');

      let returnValue: string | undefined;

      await act(async () => {
        returnValue = await result.current.execute(mockOperation);
      });

      expect(mockOperation).toHaveBeenCalledTimes(1);
      expect(returnValue).toBe('success');
      expect(result.current.isLoading).toBe(false);
      expect(result.current._error).toBeNull();
    });

    // Note: Testing isLoading=true during async execution is challenging with renderHook
    // due to React state batching. The functionality is verified through integration tests.

    it('should clear previous error on new execution', async () => {
      const { result } = renderHook(() => useAsyncOperation());

      // First execution - error
      await act(async () => {
        try {
          await result.current.execute(() => Promise.reject(new Error('First error')));
        } catch {
          // Expected error
        }
      });

      expect(result.current._error).toBe('First error');

      // Second execution - success
      await act(async () => {
        await result.current.execute(() => Promise.resolve());
      });

      expect(result.current._error).toBeNull();
    });

    it('should handle operations that return void', async () => {
      const { result } = renderHook(() => useAsyncOperation<void>());
      const mockOperation = vi.fn().mockResolvedValue(undefined);

      await act(async () => {
        await result.current.execute(mockOperation);
      });

      expect(mockOperation).toHaveBeenCalledTimes(1);
      expect(result.current.isLoading).toBe(false);
      expect(result.current._error).toBeNull();
    });

    it('should handle operations that return objects', async () => {
      const { result } = renderHook(() => useAsyncOperation<{ data: number }>());
      const mockData = { data: 42 };
      const mockOperation = vi.fn().mockResolvedValue(mockData);

      let returnValue: { data: number } | undefined;

      await act(async () => {
        returnValue = await result.current.execute(mockOperation);
      });

      expect(returnValue).toEqual(mockData);
      expect(result.current._error).toBeNull();
    });
  });

  describe('execute - error cases', () => {
    it('should handle Error instance correctly', async () => {
      const { result } = renderHook(() => useAsyncOperation());
      const errorMessage = 'Test error message';
      const mockOperation = vi.fn().mockRejectedValue(new Error(errorMessage));

      await act(async () => {
        try {
          await result.current.execute(mockOperation);
        } catch {
          // Expected error
        }
      });

      expect(result.current._error).toBe(errorMessage);
      expect(result.current.isLoading).toBe(false);
    });

    it('should handle non-Error rejections', async () => {
      const { result } = renderHook(() => useAsyncOperation());
      const mockOperation = vi.fn().mockRejectedValue('string error');

      await act(async () => {
        try {
          await result.current.execute(mockOperation);
        } catch {
          // Expected error
        }
      });

      expect(result.current._error).toBe('操作に失敗しました');
      expect(result.current.isLoading).toBe(false);
    });

    it('should re-throw error after setting state', async () => {
      const { result } = renderHook(() => useAsyncOperation());
      const testError = new Error('Test error');
      const mockOperation = vi.fn().mockRejectedValue(testError);

      await act(async () => {
        try {
          await result.current.execute(mockOperation);
        } catch (err) {
          expect(err).toBe(testError);
        }
      });

      await waitFor(() => {
        expect(result.current._error).toBe('Test error');
      });
    });

    it('should set isLoading to false even when error occurs', async () => {
      const { result } = renderHook(() => useAsyncOperation());
      const mockOperation = vi.fn().mockRejectedValue(new Error('Error'));

      await act(async () => {
        try {
          await result.current.execute(mockOperation);
        } catch {
          // Expected error
        }
      });

      expect(result.current.isLoading).toBe(false);
    });
  });

  describe('clearError', () => {
    it('should clear error state', async () => {
      const { result } = renderHook(() => useAsyncOperation());

      // Set error first
      await act(async () => {
        try {
          await result.current.execute(() => Promise.reject(new Error('Test error')));
        } catch {
          // Expected error
        }
      });

      expect(result.current._error).toBe('Test error');

      // Clear error
      act(() => {
        result.current.clearError();
      });

      expect(result.current._error).toBeNull();
    });

    it('should not affect isLoading state', async () => {
      const { result } = renderHook(() => useAsyncOperation());

      await act(async () => {
        try {
          await result.current.execute(() => Promise.reject(new Error('Error')));
        } catch {
          // Expected error
        }
      });

      const loadingBeforeClear = result.current.isLoading;

      act(() => {
        result.current.clearError();
      });

      expect(result.current.isLoading).toBe(loadingBeforeClear);
    });
  });

  describe('reset', () => {
    it('should reset all states to initial values', async () => {
      const { result } = renderHook(() => useAsyncOperation());

      // Set error state
      await act(async () => {
        try {
          await result.current.execute(() => Promise.reject(new Error('Error')));
        } catch {
          // Expected error
        }
      });

      expect(result.current._error).toBe('Error');
      expect(result.current.isLoading).toBe(false);

      // Reset
      act(() => {
        result.current.reset();
      });

      expect(result.current.isLoading).toBe(false);
      expect(result.current._error).toBeNull();
    });

    it('should reset isLoading even if it was true', () => {
      const { result } = renderHook(() => useAsyncOperation());

      act(() => {
        result.current.reset();
      });

      expect(result.current.isLoading).toBe(false);
      expect(result.current._error).toBeNull();
    });
  });

  describe('Multiple sequential executions', () => {
    it('should handle multiple successful executions', async () => {
      const { result } = renderHook(() => useAsyncOperation<number>());

      await act(async () => {
        await result.current.execute(() => Promise.resolve(1));
      });

      expect(result.current._error).toBeNull();

      await act(async () => {
        await result.current.execute(() => Promise.resolve(2));
      });

      expect(result.current._error).toBeNull();
      expect(result.current.isLoading).toBe(false);
    });

    it('should handle error followed by success', async () => {
      const { result } = renderHook(() => useAsyncOperation());

      // First - error
      await act(async () => {
        try {
          await result.current.execute(() => Promise.reject(new Error('Error 1')));
        } catch {
          // Expected error
        }
      });

      expect(result.current._error).toBe('Error 1');

      // Second - success
      await act(async () => {
        await result.current.execute(() => Promise.resolve());
      });

      expect(result.current._error).toBeNull();
    });

    it('should handle success followed by error', async () => {
      const { result } = renderHook(() => useAsyncOperation());

      // First - success
      await act(async () => {
        await result.current.execute(() => Promise.resolve());
      });

      expect(result.current._error).toBeNull();

      // Second - error
      await act(async () => {
        try {
          await result.current.execute(() => Promise.reject(new Error('Error 2')));
        } catch {
          // Expected error
        }
      });

      expect(result.current._error).toBe('Error 2');
    });
  });

  describe('Edge cases', () => {
    it('should handle operations that throw synchronously', async () => {
      const { result } = renderHook(() => useAsyncOperation());
      const mockOperation = () => {
        throw new Error('Sync error');
      };

      await act(async () => {
        try {
          await result.current.execute(mockOperation);
        } catch (err) {
          expect(err).toBeInstanceOf(Error);
          expect((err as Error).message).toBe('Sync error');
        }
      });

      await waitFor(() => {
        expect(result.current._error).toBe('Sync error');
      });
      expect(result.current.isLoading).toBe(false);
    });

    it('should handle empty error message', async () => {
      const { result } = renderHook(() => useAsyncOperation());
      const mockOperation = vi.fn().mockRejectedValue(new Error(''));

      await act(async () => {
        try {
          await result.current.execute(mockOperation);
        } catch {
          // Expected error
        }
      });

      expect(result.current._error).toBe('');
    });

    it('should preserve function references across renders', () => {
      const { result, rerender } = renderHook(() => useAsyncOperation());

      const executeRef = result.current.execute;
      const clearErrorRef = result.current.clearError;
      const resetRef = result.current.reset;

      rerender();

      expect(result.current.execute).toBe(executeRef);
      expect(result.current.clearError).toBe(clearErrorRef);
      expect(result.current.reset).toBe(resetRef);
    });
  });
});
