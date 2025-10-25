import { toast } from "sonner";

export interface AddNotificationOptions {
  id?: string;
  duration?: number;
  persistent?: boolean;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export interface NotifyAPI {
  success: (message: string, options?: AddNotificationOptions) => string | number;
  error: (message: string, options?: AddNotificationOptions) => string | number;
  info: (message: string, options?: AddNotificationOptions) => string | number;
  warning: (message: string, options?: AddNotificationOptions) => string | number;
  toast: {
    success: (message: string, options?: AddNotificationOptions) => string | number;
    error: (message: string, options?: AddNotificationOptions) => string | number;
    loading: (message: string, options?: AddNotificationOptions) => string | number;
  };
  persistent: {
    success: (message: string, options?: Omit<AddNotificationOptions, "persistent">) => string | number;
    info: (message: string, options?: Omit<AddNotificationOptions, "persistent">) => string | number;
    warning: (message: string, options?: Omit<AddNotificationOptions, "persistent">) => string | number;
    error: (message: string, options?: Omit<AddNotificationOptions, "persistent">) => string | number;
  };
}

/**
 * Sonnerを使用したNotificationフック（既存のuseNotifyとAPI互換）
 */
export const useSonnerNotify = (): NotifyAPI => {
  const createToast = (
    type: 'success' | 'error' | 'info' | 'warning' | 'loading',
    message: string,
    options: AddNotificationOptions = {}
  ): string | number => {
    const { duration, persistent, action, id } = options;

    const toastOptions = {
      id,
      duration: persistent ? Infinity : duration,
      action: action ? {
        label: action.label,
        onClick: action.onClick,
      } : undefined,
    };

    switch (type) {
      case 'success':
        return toast.success(message, toastOptions);
      case 'error':
        return toast.error(message, toastOptions);
      case 'warning':
        return toast.warning(message, toastOptions);
      case 'loading':
        return toast.loading(message, toastOptions);
      case 'info':
      default:
        return toast.info(message, toastOptions);
    }
  };

  // 型化されたトースト作成関数ファクトリー
  const createTypedToast = (type: 'success' | 'error' | 'info' | 'warning' | 'loading', defaultOptions: AddNotificationOptions = {}) =>
    (message: string, options?: AddNotificationOptions) =>
      createToast(type, message, { ...defaultOptions, ...options });

  // 永続化トースト作成関数ファクトリー
  const createPersistentToast = (type: 'success' | 'error' | 'info' | 'warning') =>
    (message: string, options?: Omit<AddNotificationOptions, "persistent">) =>
      createToast(type, message, { ...options, persistent: true });

  return {
    success: createTypedToast('success'),
    error: createTypedToast('error', { duration: 5000 }),
    info: createTypedToast('info'),
    warning: createTypedToast('warning'),

    toast: {
      success: createTypedToast('success'),
      error: createTypedToast('error', { duration: 5000 }),
      loading: createTypedToast('loading', { persistent: true }),
    },

    persistent: {
      success: createPersistentToast('success'),
      info: createPersistentToast('info'),
      warning: createPersistentToast('warning'),
      error: createPersistentToast('error'),
    },
  };
};

/**
 * useAsyncNotifyと互換性のあるAPI（Sonner版）
 */
export const useAsyncSonnerNotify = () => {
  const notify = useSonnerNotify();

  return async <T>(
    asyncFn: () => Promise<T>,
    messages: {
      loading: string;
      success: (result: T) => string;
      error?: (error: Error) => string;
    }
  ): Promise<T> => {
    const loadingId = notify.toast.loading(messages.loading);

    try {
      const result = await asyncFn();
      toast.dismiss(loadingId);
      const successMessage = messages.success(result);
      notify.success(successMessage);
      return result;
    } catch (error) {
      toast.dismiss(loadingId);
      const errorMessage = messages.error
        ? messages.error(error as Error)
        : "処理中にエラーが発生しました";
      notify.error(errorMessage);
      throw error;
    }
  };
};