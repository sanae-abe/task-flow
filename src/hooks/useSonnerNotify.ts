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

  return {
    success: (message: string, options?: AddNotificationOptions) =>
      createToast('success', message, options),

    error: (message: string, options?: AddNotificationOptions) =>
      createToast('error', message, { duration: 5000, ...options }),

    info: (message: string, options?: AddNotificationOptions) =>
      createToast('info', message, options),

    warning: (message: string, options?: AddNotificationOptions) =>
      createToast('warning', message, options),

    toast: {
      success: (message: string, options?: AddNotificationOptions) =>
        createToast('success', message, options),
      error: (message: string, options?: AddNotificationOptions) =>
        createToast('error', message, { duration: 5000, ...options }),
      loading: (message: string, options?: AddNotificationOptions) =>
        createToast('loading', message, { persistent: true, ...options }),
    },

    persistent: {
      success: (message: string, options?: Omit<AddNotificationOptions, "persistent">) =>
        createToast('success', message, { ...options, persistent: true }),
      info: (message: string, options?: Omit<AddNotificationOptions, "persistent">) =>
        createToast('info', message, { ...options, persistent: true }),
      warning: (message: string, options?: Omit<AddNotificationOptions, "persistent">) =>
        createToast('warning', message, { ...options, persistent: true }),
      error: (message: string, options?: Omit<AddNotificationOptions, "persistent">) =>
        createToast('error', message, { ...options, persistent: true }),
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