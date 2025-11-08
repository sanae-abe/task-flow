/**
 * Push Notification Utilities
 * プッシュ通知機能の基盤（将来の拡張用）
 */

import i18n from '../i18n/config';

export type NotificationPermission = 'default' | 'granted' | 'denied';

// NotificationAction型定義
interface NotificationAction {
  action: string;
  title: string;
  icon?: string;
}

// 拡張NotificationOptions型（vibrate, actions対応）
interface ExtendedNotificationOptions extends NotificationOptions {
  vibrate?: number[];
  actions?: NotificationAction[];
}

/**
 * 通知権限を取得
 */
export function getNotificationPermission(): NotificationPermission {
  if (!('Notification' in window)) {
    return 'denied';
  }
  return Notification.permission as NotificationPermission;
}

/**
 * 通知権限をリクエスト
 */
export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!('Notification' in window)) {
    console.warn('[Notifications] Not supported in this browser');
    return 'denied';
  }

  if (Notification.permission === 'granted') {
    return 'granted';
  }

  if (Notification.permission === 'denied') {
    return 'denied';
  }

  try {
    const permission = await Notification.requestPermission();
    console.log('[Notifications] Permission:', permission);
    return permission as NotificationPermission;
  } catch (error) {
    console.error('[Notifications] Error requesting permission:', error);
    return 'denied';
  }
}

/**
 * ローカル通知を表示
 */
export async function showLocalNotification(
  title: string,
  options?: ExtendedNotificationOptions
): Promise<void> {
  const permission = await requestNotificationPermission();

  if (permission !== 'granted') {
    console.warn('[Notifications] Permission not granted');
    return;
  }

  try {
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      // Service Worker経由で通知を表示
      const registration = await navigator.serviceWorker.ready;
      await registration.showNotification(title, {
        icon: '/logo192.svg',
        badge: '/favicon.ico',
        ...options,
      });
    } else {
      // フォールバック: 通常の通知API
      new Notification(title, {
        icon: '/logo192.svg',
        ...options,
      });
    }
  } catch (error) {
    console.error('[Notifications] Error showing notification:', error);
  }
}

/**
 * タスク期限通知を表示
 */
export async function notifyTaskDue(
  taskTitle: string,
  dueDate: Date
): Promise<void> {
  const options: ExtendedNotificationOptions = {
    body: i18n.t('notification.taskDueBody', { taskTitle }),
    tag: `task-due-${taskTitle}`,
    icon: '/logo192.svg',
    badge: '/favicon.ico',
    vibrate: [200, 100, 200],
    data: {
      url: '/',
      type: 'task-due',
      taskTitle,
      dueDate: dueDate.toISOString(),
    },
    actions: [
      {
        action: 'view',
        title: i18n.t('notification.actions.view'),
      },
      {
        action: 'dismiss',
        title: i18n.t('notification.actions.dismiss'),
      },
    ],
  };

  await showLocalNotification(i18n.t('notification.taskDueTitle'), options);
}

/**
 * タスク完了通知を表示
 */
export async function notifyTaskCompleted(taskTitle: string): Promise<void> {
  const options: ExtendedNotificationOptions = {
    body: i18n.t('notification.taskCompletedBody', { taskTitle }),
    tag: `task-completed-${taskTitle}`,
    icon: '/logo192.svg',
    badge: '/favicon.ico',
    vibrate: [100],
    data: {
      url: '/',
      type: 'task-completed',
      taskTitle,
    },
  };

  await showLocalNotification(
    i18n.t('notification.taskCompletedTitle'),
    options
  );
}

/**
 * 通知をすべてクリア
 */
export async function clearAllNotifications(): Promise<void> {
  if (!('serviceWorker' in navigator)) {
    return;
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    const notifications = await registration.getNotifications();

    notifications.forEach(notification => {
      notification.close();
    });

    console.log(
      `[Notifications] Cleared ${notifications.length} notifications`
    );
  } catch (error) {
    console.error('[Notifications] Error clearing notifications:', error);
  }
}

/**
 * 通知サポート状況を確認
 */
export function isNotificationSupported(): boolean {
  return 'Notification' in window && 'serviceWorker' in navigator;
}

/**
 * プッシュ通知のサブスクリプションを取得（将来の実装用）
 */
export async function getPushSubscription(): Promise<PushSubscription | null> {
  if (!('serviceWorker' in navigator)) {
    return null;
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    return await registration.pushManager.getSubscription();
  } catch (error) {
    console.error('[Notifications] Error getting push subscription:', error);
    return null;
  }
}

/**
 * プッシュ通知をサブスクライブ（将来の実装用）
 */
export async function subscribeToPushNotifications(): Promise<PushSubscription | null> {
  if (!('serviceWorker' in navigator)) {
    return null;
  }

  try {
    // VAPID公開鍵（本番環境では環境変数から取得）
    // const vapidPublicKey = process.env.REACT_APP_VAPID_PUBLIC_KEY;

    // 将来的にバックエンドAPIから公開鍵を取得する想定
    console.log('[Notifications] Push subscription not yet implemented');

    // const registration = await navigator.serviceWorker.ready;
    // const subscription = await registration.pushManager.subscribe({
    //   userVisibleOnly: true,
    //   applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
    // });

    // return subscription;
    return null;
  } catch (error) {
    console.error('[Notifications] Error subscribing to push:', error);
    return null;
  }
}

/**
 * プッシュ通知のサブスクリプションを解除（将来の実装用）
 */
export async function unsubscribeFromPushNotifications(): Promise<boolean> {
  const subscription = await getPushSubscription();

  if (!subscription) {
    return false;
  }

  try {
    await subscription.unsubscribe();
    console.log('[Notifications] Unsubscribed from push notifications');
    return true;
  } catch (error) {
    console.error('[Notifications] Error unsubscribing from push:', error);
    return false;
  }
}

/**
 * VAPID公開鍵をUint8Arrayに変換（将来の実装用）
 */
// function urlBase64ToUint8Array(base64String: string): Uint8Array {
//   const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
//   const base64 = (base64String + padding)
//     .replace(/-/g, '+')
//     .replace(/_/g, '/');

//   const rawData = window.atob(base64);
//   const outputArray = new Uint8Array(rawData.length);

//   for (let i = 0; i < rawData.length; ++i) {
//     outputArray[i] = rawData.charCodeAt(i);
//   }

//   return outputArray;
// }
