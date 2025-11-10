import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useSonnerNotify, useAsyncSonnerNotify } from './useSonnerNotify';
import { toast } from 'sonner';

// Mock sonner
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(message => `success-${message}`),
    error: vi.fn(message => `error-${message}`),
    info: vi.fn(message => `info-${message}`),
    warning: vi.fn(message => `warning-${message}`),
    loading: vi.fn(message => `loading-${message}`),
    dismiss: vi.fn(),
  },
}));

describe('useSonnerNotify', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Basic notification methods', () => {
    it('should create success notification', () => {
      const { result } = renderHook(() => useSonnerNotify());

      const notificationId = result.current.success('Success message');

      expect(toast.success).toHaveBeenCalledWith(
        'Success message',
        expect.objectContaining({
          id: undefined,
          duration: undefined,
          action: undefined,
        })
      );
      expect(notificationId).toBe('success-Success message');
    });

    it('should create error notification with default duration', () => {
      const { result } = renderHook(() => useSonnerNotify());

      const notificationId = result.current._error('Error message');

      expect(toast.error).toHaveBeenCalledWith(
        'Error message',
        expect.objectContaining({
          duration: 5000,
        })
      );
      expect(notificationId).toBe('error-Error message');
    });

    it('should create info notification', () => {
      const { result } = renderHook(() => useSonnerNotify());

      const notificationId = result.current.info('Info message');

      expect(toast.info).toHaveBeenCalledWith(
        'Info message',
        expect.objectContaining({
          id: undefined,
          duration: undefined,
        })
      );
      expect(notificationId).toBe('info-Info message');
    });

    it('should create warning notification', () => {
      const { result } = renderHook(() => useSonnerNotify());

      const notificationId = result.current.warning('Warning message');

      expect(toast.warning).toHaveBeenCalledWith(
        'Warning message',
        expect.objectContaining({
          id: undefined,
          duration: undefined,
        })
      );
      expect(notificationId).toBe('warning-Warning message');
    });
  });

  describe('Options handling', () => {
    it('should handle custom id', () => {
      const { result } = renderHook(() => useSonnerNotify());

      result.current.success('Message', { id: 'custom-id' });

      expect(toast.success).toHaveBeenCalledWith(
        'Message',
        expect.objectContaining({
          id: 'custom-id',
        })
      );
    });

    it('should handle custom duration', () => {
      const { result } = renderHook(() => useSonnerNotify());

      result.current.info('Message', { duration: 3000 });

      expect(toast.info).toHaveBeenCalledWith(
        'Message',
        expect.objectContaining({
          duration: 3000,
        })
      );
    });

    it('should handle persistent option', () => {
      const { result } = renderHook(() => useSonnerNotify());

      result.current.success('Message', { persistent: true });

      expect(toast.success).toHaveBeenCalledWith(
        'Message',
        expect.objectContaining({
          duration: Infinity,
        })
      );
    });

    it('should handle action option', () => {
      const { result } = renderHook(() => useSonnerNotify());
      const actionFn = vi.fn();

      result.current.success('Message', {
        action: {
          label: 'Undo',
          onClick: actionFn,
        },
      });

      expect(toast.success).toHaveBeenCalledWith(
        'Message',
        expect.objectContaining({
          action: {
            label: 'Undo',
            onClick: actionFn,
          },
        })
      );
    });

    it('should override error default duration with custom duration', () => {
      const { result } = renderHook(() => useSonnerNotify());

      result.current._error('Error', { duration: 3000 });

      expect(toast.error).toHaveBeenCalledWith(
        'Error',
        expect.objectContaining({
          duration: 3000,
        })
      );
    });
  });

  describe('Toast namespace methods', () => {
    it('should create success toast via toast.success', () => {
      const { result } = renderHook(() => useSonnerNotify());

      const notificationId = result.current.toast.success('Toast success');

      expect(toast.success).toHaveBeenCalledWith(
        'Toast success',
        expect.objectContaining({
          id: undefined,
          duration: undefined,
        })
      );
      expect(notificationId).toBe('success-Toast success');
    });

    it('should create error toast via toast._error', () => {
      const { result } = renderHook(() => useSonnerNotify());

      const notificationId = result.current.toast._error('Toast error');

      expect(toast.error).toHaveBeenCalledWith(
        'Toast error',
        expect.objectContaining({
          duration: 5000,
        })
      );
      expect(notificationId).toBe('error-Toast error');
    });

    it('should create loading toast with persistent option', () => {
      const { result } = renderHook(() => useSonnerNotify());

      const notificationId = result.current.toast.loading('Loading...');

      expect(toast.loading).toHaveBeenCalledWith(
        'Loading...',
        expect.objectContaining({
          duration: Infinity,
        })
      );
      expect(notificationId).toBe('loading-Loading...');
    });
  });

  describe('Persistent namespace methods', () => {
    it('should create persistent success notification', () => {
      const { result } = renderHook(() => useSonnerNotify());

      result.current.persistent.success('Persistent success');

      expect(toast.success).toHaveBeenCalledWith(
        'Persistent success',
        expect.objectContaining({
          duration: Infinity,
        })
      );
    });

    it('should create persistent info notification', () => {
      const { result } = renderHook(() => useSonnerNotify());

      result.current.persistent.info('Persistent info');

      expect(toast.info).toHaveBeenCalledWith(
        'Persistent info',
        expect.objectContaining({
          duration: Infinity,
        })
      );
    });

    it('should create persistent warning notification', () => {
      const { result } = renderHook(() => useSonnerNotify());

      result.current.persistent.warning('Persistent warning');

      expect(toast.warning).toHaveBeenCalledWith(
        'Persistent warning',
        expect.objectContaining({
          duration: Infinity,
        })
      );
    });

    it('should create persistent error notification', () => {
      const { result } = renderHook(() => useSonnerNotify());

      result.current.persistent._error('Persistent error');

      expect(toast.error).toHaveBeenCalledWith(
        'Persistent error',
        expect.objectContaining({
          duration: Infinity,
        })
      );
    });

    it('should allow custom options for persistent notifications', () => {
      const { result } = renderHook(() => useSonnerNotify());
      const actionFn = vi.fn();

      result.current.persistent.success('Message', {
        id: 'custom-id',
        action: {
          label: 'Action',
          onClick: actionFn,
        },
      });

      expect(toast.success).toHaveBeenCalledWith(
        'Message',
        expect.objectContaining({
          id: 'custom-id',
          duration: Infinity,
          action: {
            label: 'Action',
            onClick: actionFn,
          },
        })
      );
    });
  });
});

describe('useAsyncSonnerNotify', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Success flow', () => {
    it('should show loading toast and then success toast on successful operation', async () => {
      const { result } = renderHook(() => useAsyncSonnerNotify());

      const asyncFn = vi.fn(async () => 'Result data');
      const messages = {
        loading: 'Loading...',
        success: (data: string) => `Success: ${data}`,
      };

      const resultValue = await result.current(asyncFn, messages);

      expect(toast.loading).toHaveBeenCalledWith(
        'Loading...',
        expect.any(Object)
      );
      expect(toast.dismiss).toHaveBeenCalledWith('loading-Loading...');
      expect(toast.success).toHaveBeenCalledWith(
        'Success: Result data',
        expect.any(Object)
      );
      expect(resultValue).toBe('Result data');
    });

    it('should return result from async operation', async () => {
      const { result } = renderHook(() => useAsyncSonnerNotify());

      const asyncFn = vi.fn(async () => ({ id: 1, name: 'Test' }));
      const messages = {
        loading: 'Loading...',
        success: () => 'Success',
      };

      const resultValue = await result.current(asyncFn, messages);

      expect(resultValue).toEqual({ id: 1, name: 'Test' });
    });
  });

  describe('Error flow', () => {
    it('should show loading toast and then error toast on failed operation', async () => {
      const { result } = renderHook(() => useAsyncSonnerNotify());

      const error = new Error('Operation failed');
      const asyncFn = vi.fn(async () => {
        throw error;
      });
      const messages = {
        loading: 'Loading...',
        success: () => 'Success',
        _error: (err: Error) => `Error: ${err.message}`,
      };

      await expect(result.current(asyncFn, messages)).rejects.toThrow(
        'Operation failed'
      );

      expect(toast.loading).toHaveBeenCalledWith(
        'Loading...',
        expect.any(Object)
      );
      expect(toast.dismiss).toHaveBeenCalledWith('loading-Loading...');
      expect(toast.error).toHaveBeenCalledWith(
        'Error: Operation failed',
        expect.any(Object)
      );
    });

    it('should use default error message when error handler is not provided', async () => {
      const { result } = renderHook(() => useAsyncSonnerNotify());

      const asyncFn = vi.fn(async () => {
        throw new Error('Test error');
      });
      const messages = {
        loading: 'Loading...',
        success: () => 'Success',
      };

      await expect(result.current(asyncFn, messages)).rejects.toThrow(
        'Test error'
      );

      expect(toast.error).toHaveBeenCalledWith(
        '処理中にエラーが発生しました',
        expect.any(Object)
      );
    });

    it('should rethrow the error after displaying notification', async () => {
      const { result } = renderHook(() => useAsyncSonnerNotify());

      const originalError = new Error('Critical error');
      const asyncFn = vi.fn(async () => {
        throw originalError;
      });
      const messages = {
        loading: 'Loading...',
        success: () => 'Success',
      };

      let caughtError;
      try {
        await result.current(asyncFn, messages);
      } catch (error) {
        caughtError = error;
      }

      expect(caughtError).toBe(originalError);
    });
  });

  describe('Complex scenarios', () => {
    it('should handle async operation with complex result type', async () => {
      const { result } = renderHook(() => useAsyncSonnerNotify());

      const complexResult = {
        users: [
          { id: 1, name: 'Alice' },
          { id: 2, name: 'Bob' },
        ],
        metadata: { total: 2, page: 1 },
      };

      const asyncFn = vi.fn(async () => complexResult);
      const messages = {
        loading: 'Fetching users...',
        success: (data: typeof complexResult) =>
          `Loaded ${data.users.length} users`,
      };

      const resultValue = await result.current(asyncFn, messages);

      expect(resultValue).toEqual(complexResult);
      expect(toast.success).toHaveBeenCalledWith(
        'Loaded 2 users',
        expect.any(Object)
      );
    });

    it('should dismiss loading toast before showing success', async () => {
      const { result } = renderHook(() => useAsyncSonnerNotify());

      const asyncFn = vi.fn(async () => 'data');
      const messages = {
        loading: 'Loading...',
        success: () => 'Done',
      };

      await result.current(asyncFn, messages);

      const dismissCall = (toast.dismiss as ReturnType<typeof vi.fn>).mock
        .calls[0];
      const successCall = (toast.success as ReturnType<typeof vi.fn>).mock
        .calls[0];

      expect(dismissCall).toBeDefined();
      expect(successCall).toBeDefined();
    });

    it('should dismiss loading toast before showing error', async () => {
      const { result } = renderHook(() => useAsyncSonnerNotify());

      const asyncFn = vi.fn(async () => {
        throw new Error('Fail');
      });
      const messages = {
        loading: 'Loading...',
        success: () => 'Done',
      };

      await expect(result.current(asyncFn, messages)).rejects.toThrow();

      const dismissCall = (toast.dismiss as ReturnType<typeof vi.fn>).mock
        .calls[0];
      const errorCall = (toast.error as ReturnType<typeof vi.fn>).mock.calls[0];

      expect(dismissCall).toBeDefined();
      expect(errorCall).toBeDefined();
    });
  });
});
