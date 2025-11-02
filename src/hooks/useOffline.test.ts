/**
 * useOffline hook tests
 * オフライン検出機能の包括的テスト
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useOffline } from './useOffline';

describe('useOffline', () => {
  let onlineEventListeners: Array<() => void> = [];
  let offlineEventListeners: Array<() => void> = [];

  beforeEach(() => {
    onlineEventListeners = [];
    offlineEventListeners = [];

    // navigator.onLineのモック
    Object.defineProperty(navigator, 'onLine', {
      writable: true,
      value: true,
    });

    // window.addEventListenerのモック
    vi.spyOn(window, 'addEventListener').mockImplementation((event, handler) => {
      if (event === 'online') {
        onlineEventListeners.push(handler as () => void);
      } else if (event === 'offline') {
        offlineEventListeners.push(handler as () => void);
      }
    });

    // window.removeEventListenerのモック
    vi.spyOn(window, 'removeEventListener').mockImplementation(
      (event, handler) => {
        if (event === 'online') {
          const index = onlineEventListeners.indexOf(handler as () => void);
          if (index !== -1) {
            onlineEventListeners.splice(index, 1);
          }
        } else if (event === 'offline') {
          const index = offlineEventListeners.indexOf(handler as () => void);
          if (index !== -1) {
            offlineEventListeners.splice(index, 1);
          }
        }
      }
    );
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Initial state', () => {
    it('should initialize with online state when navigator.onLine is true', () => {
      Object.defineProperty(navigator, 'onLine', {
        writable: true,
        value: true,
      });

      const { result } = renderHook(() => useOffline());

      expect(result.current.isOnline).toBe(true);
      expect(result.current.isOffline).toBe(false);
      expect(result.current.wasOffline).toBe(false);
    });

    it('should initialize with offline state when navigator.onLine is false', () => {
      Object.defineProperty(navigator, 'onLine', {
        writable: true,
        value: false,
      });

      const { result } = renderHook(() => useOffline());

      expect(result.current.isOnline).toBe(false);
      expect(result.current.isOffline).toBe(true);
      expect(result.current.wasOffline).toBe(false);
    });
  });

  describe('Online/Offline transitions', () => {
    it('should update state when going offline', async () => {
      const { result } = renderHook(() => useOffline());

      expect(result.current.isOnline).toBe(true);

      act(() => {
        offlineEventListeners.forEach(listener => listener());
      });

      await waitFor(() => {
        expect(result.current.isOnline).toBe(false);
        expect(result.current.isOffline).toBe(true);
        expect(result.current.wasOffline).toBe(true);
      });
    });

    it('should update state when going online', async () => {
      Object.defineProperty(navigator, 'onLine', {
        writable: true,
        value: false,
      });

      const { result } = renderHook(() => useOffline());

      expect(result.current.isOnline).toBe(false);

      act(() => {
        onlineEventListeners.forEach(listener => listener());
      });

      await waitFor(() => {
        expect(result.current.isOnline).toBe(true);
        expect(result.current.isOffline).toBe(false);
        expect(result.current.wasOffline).toBe(false);
      });
    });

    it('should track wasOffline when connection is lost and regained', async () => {
      const { result } = renderHook(() => useOffline());

      // Initially online
      expect(result.current.wasOffline).toBe(false);

      // Go offline
      act(() => {
        offlineEventListeners.forEach(listener => listener());
      });

      await waitFor(() => {
        expect(result.current.wasOffline).toBe(true);
      });

      // Come back online
      act(() => {
        onlineEventListeners.forEach(listener => listener());
      });

      await waitFor(() => {
        expect(result.current.isOnline).toBe(true);
        expect(result.current.wasOffline).toBe(false);
      });
    });
  });

  describe('resetWasOffline', () => {
    it('should reset wasOffline flag', async () => {
      const { result } = renderHook(() => useOffline());

      // Go offline
      act(() => {
        offlineEventListeners.forEach(listener => listener());
      });

      await waitFor(() => {
        expect(result.current.wasOffline).toBe(true);
      });

      // Reset wasOffline
      act(() => {
        result.current.resetWasOffline();
      });

      expect(result.current.wasOffline).toBe(false);
      expect(result.current.isOnline).toBe(false); // Should still be offline
    });

    it('should not affect isOnline state', async () => {
      const { result } = renderHook(() => useOffline());

      const initialOnline = result.current.isOnline;

      act(() => {
        result.current.resetWasOffline();
      });

      expect(result.current.isOnline).toBe(initialOnline);
    });
  });

  describe('Event listener cleanup', () => {
    it('should add event listeners on mount', () => {
      renderHook(() => useOffline());

      expect(window.addEventListener).toHaveBeenCalledWith(
        'online',
        expect.any(Function)
      );
      expect(window.addEventListener).toHaveBeenCalledWith(
        'offline',
        expect.any(Function)
      );
    });

    it('should remove event listeners on unmount', () => {
      const { unmount } = renderHook(() => useOffline());

      const onlineListener = onlineEventListeners[0];
      const offlineListener = offlineEventListeners[0];

      unmount();

      expect(window.removeEventListener).toHaveBeenCalledWith(
        'online',
        onlineListener
      );
      expect(window.removeEventListener).toHaveBeenCalledWith(
        'offline',
        offlineListener
      );
    });
  });

  describe('Multiple transitions', () => {
    it('should handle rapid online/offline switches', async () => {
      const { result } = renderHook(() => useOffline());

      // Go offline
      act(() => {
        offlineEventListeners.forEach(listener => listener());
      });

      await waitFor(() => {
        expect(result.current.isOnline).toBe(false);
      });

      // Go online
      act(() => {
        onlineEventListeners.forEach(listener => listener());
      });

      await waitFor(() => {
        expect(result.current.isOnline).toBe(true);
      });

      // Go offline again
      act(() => {
        offlineEventListeners.forEach(listener => listener());
      });

      await waitFor(() => {
        expect(result.current.isOnline).toBe(false);
        expect(result.current.wasOffline).toBe(true);
      });
    });
  });

  describe('isOffline computed property', () => {
    it('should correctly compute isOffline from isOnline', () => {
      const { result } = renderHook(() => useOffline());

      expect(result.current.isOnline).toBe(true);
      expect(result.current.isOffline).toBe(false);

      act(() => {
        offlineEventListeners.forEach(listener => listener());
      });

      waitFor(() => {
        expect(result.current.isOnline).toBe(false);
        expect(result.current.isOffline).toBe(true);
      });
    });

    it('should always be inverse of isOnline', async () => {
      const { result } = renderHook(() => useOffline());

      // Test in online state
      expect(result.current.isOnline).toBe(!result.current.isOffline);

      // Test in offline state
      act(() => {
        offlineEventListeners.forEach(listener => listener());
      });

      await waitFor(() => {
        expect(result.current.isOnline).toBe(!result.current.isOffline);
      });
    });
  });
});
