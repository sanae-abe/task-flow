import React from 'react';
import { render, screen, act, waitFor } from '@testing-library/react';
import { renderHook } from '@testing-library/react';
import { 
  NotificationProvider, 
  useNotifications, 
  useNotify,
  useAsyncNotify,
  type NotificationConfig 
} from '../NotificationContext';

// テスト用のWrapper
const createWrapper = (config?: NotificationConfig) => ({ children }: { children: React.ReactNode }) => (
  <NotificationProvider config={config}>
    {children}
  </NotificationProvider>
);

describe('NotificationContext', () => {
  beforeEach(() => {
    jest.clearAllTimers();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  describe('useNotifications', () => {
    it('should throw error when used outside provider', () => {
      const { result } = renderHook(() => useNotifications());
      expect(result.error).toBeDefined();
      expect(result.error?.message).toBe('useNotifications must be used within a NotificationProvider');
    });

    it('should provide notification context', () => {
      const { result } = renderHook(() => useNotifications(), {
        wrapper: createWrapper()
      });

      expect(result.current).toHaveProperty('notifications');
      expect(result.current).toHaveProperty('addNotification');
      expect(result.current).toHaveProperty('removeNotification');
      expect(result.current).toHaveProperty('clearAllNotifications');
      expect(result.current).toHaveProperty('config');
      expect(result.current.notifications).toEqual([]);
    });
  });

  describe('addNotification', () => {
    it('should add notification with default duration', () => {
      const { result } = renderHook(() => useNotifications(), {
        wrapper: createWrapper()
      });

      act(() => {
        const id = result.current.addNotification('success', 'Test notification');
        expect(typeof id).toBe('string');
        expect(result.current.notifications).toHaveLength(1);
        expect(result.current.notifications[0]).toMatchObject({
          type: 'success',
          title: 'Test notification',
          id: expect.any(String),
          createdAt: expect.any(Date)
        });
      });
    });

    it('should auto-remove notification after duration', async () => {
      const { result } = renderHook(() => useNotifications(), {
        wrapper: createWrapper({ defaultDuration: 1000 })
      });

      act(() => {
        result.current.addNotification('info', 'Auto remove test');
      });

      expect(result.current.notifications).toHaveLength(1);

      act(() => {
        jest.advanceTimersByTime(1000);
      });

      await waitFor(() => {
        expect(result.current.notifications).toHaveLength(0);
      });
    });

    it('should not auto-remove persistent notifications', () => {
      const { result } = renderHook(() => useNotifications(), {
        wrapper: createWrapper({ defaultDuration: 1000 })
      });

      act(() => {
        result.current.addNotification('warning', 'Persistent test', undefined, { persistent: true });
      });

      expect(result.current.notifications).toHaveLength(1);

      act(() => {
        jest.advanceTimersByTime(2000);
      });

      expect(result.current.notifications).toHaveLength(1);
    });

    it('should respect maxNotifications limit', () => {
      const { result } = renderHook(() => useNotifications(), {
        wrapper: createWrapper({ maxNotifications: 2 })
      });

      act(() => {
        result.current.addNotification('info', 'First');
        result.current.addNotification('info', 'Second');
        result.current.addNotification('info', 'Third');
      });

      expect(result.current.notifications).toHaveLength(2);
      expect(result.current.notifications[0].title).toBe('Second');
      expect(result.current.notifications[1].title).toBe('Third');
    });

    it('should throw error for empty title', () => {
      const { result } = renderHook(() => useNotifications(), {
        wrapper: createWrapper()
      });

      expect(() => {
        act(() => {
          result.current.addNotification('error', '   ');
        });
      }).toThrow('Notification title cannot be empty');
    });
  });

  describe('removeNotification', () => {
    it('should remove specific notification', () => {
      const { result } = renderHook(() => useNotifications(), {
        wrapper: createWrapper()
      });

      let firstId: string;
      let secondId: string;

      act(() => {
        firstId = result.current.addNotification('info', 'First');
        secondId = result.current.addNotification('info', 'Second');
      });

      expect(result.current.notifications).toHaveLength(2);

      act(() => {
        result.current.removeNotification(firstId);
      });

      expect(result.current.notifications).toHaveLength(1);
      expect(result.current.notifications[0].id).toBe(secondId);
    });
  });

  describe('clearAllNotifications', () => {
    it('should remove all notifications', () => {
      const { result } = renderHook(() => useNotifications(), {
        wrapper: createWrapper()
      });

      act(() => {
        result.current.addNotification('info', 'First');
        result.current.addNotification('info', 'Second');
        result.current.addNotification('info', 'Third');
      });

      expect(result.current.notifications).toHaveLength(3);

      act(() => {
        result.current.clearAllNotifications();
      });

      expect(result.current.notifications).toHaveLength(0);
    });
  });

  describe('useNotify hook', () => {
    it('should provide convenient notification methods', () => {
      const { result } = renderHook(() => {
        const notifications = useNotifications();
        const notify = useNotify();
        return { notifications, notify };
      }, {
        wrapper: createWrapper()
      });

      act(() => {
        result.current.notify.success('Success message');
        result.current.notify.error('Error message');
        result.current.notify.warning('Warning message');
        result.current.notify.info('Info message');
      });

      expect(result.current.notifications.notifications).toHaveLength(4);
      
      const [success, error, warning, info] = result.current.notifications.notifications;
      expect(success.type).toBe('success');
      expect(error.type).toBe('error');
      expect(warning.type).toBe('warning');
      expect(info.type).toBe('info');
    });

    it('should provide toast methods', () => {
      const { result } = renderHook(() => {
        const notifications = useNotifications();
        const notify = useNotify();
        return { notifications, notify };
      }, {
        wrapper: createWrapper()
      });

      act(() => {
        result.current.notify.toast.success('Toast success');
        result.current.notify.toast.loading('Loading...');
      });

      expect(result.current.notifications.notifications).toHaveLength(2);
      expect(result.current.notifications.notifications[0].title).toBe('Toast success');
      expect(result.current.notifications.notifications[1].title).toBe('Loading...');
    });

    it('should provide persistent notification methods', () => {
      const { result } = renderHook(() => {
        const notifications = useNotifications();
        const notify = useNotify();
        return { notifications, notify };
      }, {
        wrapper: createWrapper({ defaultDuration: 100 })
      });

      act(() => {
        result.current.notify.persistent.info('Persistent info');
      });

      expect(result.current.notifications.notifications).toHaveLength(1);

      // 時間経過後も残っている
      act(() => {
        jest.advanceTimersByTime(200);
      });

      expect(result.current.notifications.notifications).toHaveLength(1);
    });
  });

  describe('useAsyncNotify hook', () => {
    it('should handle successful promise', async () => {
      const { result } = renderHook(() => {
        const notifications = useNotifications();
        const asyncNotify = useAsyncNotify();
        return { notifications, asyncNotify };
      }, {
        wrapper: createWrapper()
      });

      const testPromise = Promise.resolve('success data');

      await act(async () => {
        const resultData = await result.current.asyncNotify.promise(testPromise, {
          loading: 'Loading...',
          success: 'Success!',
          error: 'Error occurred'
        });
        expect(resultData).toBe('success data');
      });

      // loading通知は削除され、success通知が追加される
      await waitFor(() => {
        expect(result.current.notifications.notifications).toHaveLength(1);
        expect(result.current.notifications.notifications[0].type).toBe('success');
        expect(result.current.notifications.notifications[0].title).toBe('Success!');
      });
    });

    it('should handle rejected promise', async () => {
      const { result } = renderHook(() => {
        const notifications = useNotifications();
        const asyncNotify = useAsyncNotify();
        return { notifications, asyncNotify };
      }, {
        wrapper: createWrapper()
      });

      const testPromise = Promise.reject(new Error('test error'));

      await act(async () => {
        try {
          await result.current.asyncNotify.promise(testPromise, {
            loading: 'Loading...',
            success: 'Success!',
            error: 'Error occurred'
          });
        } catch (error) {
          expect(error).toBeInstanceOf(Error);
        }
      });

      // loading通知は削除され、error通知が追加される
      await waitFor(() => {
        expect(result.current.notifications.notifications).toHaveLength(1);
        expect(result.current.notifications.notifications[0].type).toBe('error');
        expect(result.current.notifications.notifications[0].title).toBe('Error occurred');
      });
    });

    it('should handle dynamic success/error messages', async () => {
      const { result } = renderHook(() => {
        const notifications = useNotifications();
        const asyncNotify = useAsyncNotify();
        return { notifications, asyncNotify };
      }, {
        wrapper: createWrapper()
      });

      const testPromise = Promise.resolve({ id: 123, name: 'Test User' });

      await act(async () => {
        await result.current.asyncNotify.promise(testPromise, {
          loading: 'Creating user...',
          success: (data) => `User ${data.name} created successfully!`,
          error: (error) => `Failed to create user: ${error}`
        });
      });

      await waitFor(() => {
        expect(result.current.notifications.notifications).toHaveLength(1);
        expect(result.current.notifications.notifications[0].title).toBe('User Test User created successfully!');
      });
    });
  });

  describe('Configuration', () => {
    it('should use custom config', () => {
      const customConfig = {
        maxNotifications: 10,
        defaultDuration: 5000,
        position: 'bottom-left' as const
      };

      const { result } = renderHook(() => useNotifications(), {
        wrapper: createWrapper(customConfig)
      });

      expect(result.current.config.maxNotifications).toBe(10);
      expect(result.current.config.defaultDuration).toBe(5000);
      expect(result.current.config.position).toBe('bottom-left');
    });

    it('should update config dynamically', () => {
      const { result } = renderHook(() => useNotifications(), {
        wrapper: createWrapper()
      });

      act(() => {
        result.current.updateConfig({ maxNotifications: 10 });
      });

      expect(result.current.config.maxNotifications).toBe(10);
    });
  });

  describe('Memory leak prevention', () => {
    it('should clear timers on unmount', () => {
      const { result, unmount } = renderHook(() => useNotifications(), {
        wrapper: createWrapper({ defaultDuration: 5000 })
      });

      act(() => {
        result.current.addNotification('info', 'Test');
      });

      const clearTimeoutSpy = jest.spyOn(global, 'clearTimeout');
      
      unmount();

      expect(clearTimeoutSpy).toHaveBeenCalled();
    });

    it('should clear timer when notification is manually removed', () => {
      const { result } = renderHook(() => useNotifications(), {
        wrapper: createWrapper({ defaultDuration: 5000 })
      });

      let notificationId: string;
      act(() => {
        notificationId = result.current.addNotification('info', 'Test');
      });

      const clearTimeoutSpy = jest.spyOn(global, 'clearTimeout');

      act(() => {
        result.current.removeNotification(notificationId);
      });

      expect(clearTimeoutSpy).toHaveBeenCalled();
    });
  });
});