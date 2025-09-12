import React, { 
  createContext, 
  useContext, 
  useState, 
  useCallback, 
  useMemo, 
  useRef, 
  useEffect,
  type ReactNode 
} from 'react';
import { v4 as uuidv4 } from 'uuid';

import type { Notification, NotificationType } from '../types';

// 設定可能なオプション
export interface NotificationConfig {
  maxNotifications?: number;
  defaultDuration?: number;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
}

// 追加通知のオプション
export interface AddNotificationOptions {
  duration?: number;
  persistent?: boolean; // 手動削除のみ
  actionLabel?: string; // 将来の機能拡張用
  onAction?: () => void; // 将来の機能拡張用
}

interface NotificationContextType {
  notifications: Notification[];
  config: NotificationConfig;
  addNotification: (
    type: NotificationType, 
    title: string, 
    message?: string, 
    options?: AddNotificationOptions
  ) => string; // IDを返すように変更
  removeNotification: (id: string) => void;
  clearAllNotifications: () => void;
  updateConfig: (newConfig: Partial<NotificationConfig>) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

interface NotificationProviderProps {
  children: ReactNode;
  config?: NotificationConfig;
}

const DEFAULT_CONFIG: NotificationConfig = {
  maxNotifications: 5,
  defaultDuration: 3000,
  position: 'top-right'
};

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ 
  children, 
  config: initialConfig = {} 
}) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [config, setConfig] = useState<NotificationConfig>({
    ...DEFAULT_CONFIG,
    ...initialConfig
  });
  
  // タイマー管理のためのRef
  const timersRef = useRef<Map<string, NodeJS.Timeout>>(new Map());

  // コンポーネントアンマウント時のクリーンアップ
  useEffect(() => () => {
      // 全てのタイマーをクリア
      timersRef.current.forEach(timer => {
        clearTimeout(timer);
      });
      timersRef.current.clear();
    }, []);

  const removeNotification = useCallback((id: string) => {
    // タイマーがあればクリア
    const timer = timersRef.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timersRef.current.delete(id);
    }
    
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  }, []);

  const addNotification = useCallback((
    type: NotificationType,
    title: string,
    message?: string,
    options: AddNotificationOptions = {}
  ): string => {
    try {
      // バリデーション
      if (!title.trim()) {
        throw new Error('Notification title cannot be empty');
      }

      const {
        duration = config.defaultDuration,
        persistent = false
      } = options;

      const id = uuidv4();
      const notification: Notification = {
        id,
        type,
        title: title.trim(),
        message: message?.trim(),
        duration: persistent ? undefined : duration,
        createdAt: new Date()
      };

      setNotifications(prev => {
        const newNotifications = [...prev, notification];
        // 最大数を超えた場合は古いものから削除
        if (config.maxNotifications && newNotifications.length > config.maxNotifications) {
          const removed = newNotifications.shift();
          if (removed) {
            // 削除される通知のタイマーもクリア
            const timer = timersRef.current.get(removed.id);
            if (timer) {
              clearTimeout(timer);
              timersRef.current.delete(removed.id);
            }
          }
        }
        return newNotifications;
      });

      // 自動削除タイマー（persistentでない場合のみ）
      if (!persistent && duration && duration > 0) {
        const timer = setTimeout(() => {
          removeNotification(id);
        }, duration);
        
        timersRef.current.set(id, timer);
      }

      return id;
    } catch (error) {
      // エラーログ（開発環境のみ）
      if (process.env.NODE_ENV === 'development') {
        // eslint-disable-next-line no-console
        console.error('Failed to add notification:', error);
      }
      throw error;
    }
  }, [config.defaultDuration, config.maxNotifications, removeNotification]);

  const clearAllNotifications = useCallback(() => {
    // 全てのタイマーをクリア
    timersRef.current.forEach(timer => {
      clearTimeout(timer);
    });
    timersRef.current.clear();
    
    setNotifications([]);
  }, []);

  const updateConfig = useCallback((newConfig: Partial<NotificationConfig>) => {
    setConfig(prev => ({ ...prev, ...newConfig }));
  }, []);

  // Context値のメモ化でパフォーマンス最適化
  const value = useMemo<NotificationContextType>(() => ({
    notifications,
    config,
    addNotification,
    removeNotification,
    clearAllNotifications,
    updateConfig
  }), [notifications, config, addNotification, removeNotification, clearAllNotifications, updateConfig]);

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = (): NotificationContextType => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

// 型安全なヘルパー関数with improved API
export const useNotify = () => {
  const { addNotification } = useNotifications();

  return useMemo(() => ({
    success: (title: string, message?: string, options?: AddNotificationOptions) => 
      addNotification('success', title, message, options),
    
    info: (title: string, message?: string, options?: AddNotificationOptions) => 
      addNotification('info', title, message, options),
    
    warning: (title: string, message?: string, options?: AddNotificationOptions) => 
      addNotification('warning', title, message, options),
    
    error: (title: string, message?: string, options?: AddNotificationOptions) => 
      addNotification('error', title, message, { 
        duration: 5000, // エラーは少し長めに表示
        ...options 
      }),
      
    // 便利なメソッド追加
    toast: {
      success: (title: string, options?: AddNotificationOptions) =>
        addNotification('success', title, undefined, options),
      error: (title: string, options?: AddNotificationOptions) =>
        addNotification('error', title, undefined, { duration: 5000, ...options }),
      loading: (title: string, options?: AddNotificationOptions) =>
        addNotification('info', title, undefined, { persistent: true, ...options }),
    },
    
    // 永続的な通知
    persistent: {
      success: (title: string, message?: string, options?: Omit<AddNotificationOptions, 'persistent'>) =>
        addNotification('success', title, message, { ...options, persistent: true }),
      info: (title: string, message?: string, options?: Omit<AddNotificationOptions, 'persistent'>) =>
        addNotification('info', title, message, { ...options, persistent: true }),
      warning: (title: string, message?: string, options?: Omit<AddNotificationOptions, 'persistent'>) =>
        addNotification('warning', title, message, { ...options, persistent: true }),
      error: (title: string, message?: string, options?: Omit<AddNotificationOptions, 'persistent'>) =>
        addNotification('error', title, message, { ...options, persistent: true }),
    }
  }), [addNotification]);
};

// Promise用のヘルパー
export const useAsyncNotify = () => {
  const notify = useNotify();
  const { removeNotification } = useNotifications();
  
  return useMemo(() => ({
    promise: async <T,>(
      promise: Promise<T>, 
      messages: {
        loading: string;
        success: string | ((data: T) => string);
        error: string | ((error: unknown) => string);
      }
    ): Promise<T> => {
      const loadingId = notify.toast.loading(messages.loading);
      
      try {
        const result = await promise;
        removeNotification(loadingId);
        const successMessage = typeof messages.success === 'function' 
          ? messages.success(result) 
          : messages.success;
        notify.success(successMessage);
        return result;
      } catch (error) {
        removeNotification(loadingId);
        const errorMessage = typeof messages.error === 'function' 
          ? messages.error(error) 
          : messages.error;
        notify.error(errorMessage);
        throw error;
      }
    }
  }), [notify, removeNotification]);
};