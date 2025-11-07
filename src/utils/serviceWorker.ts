/**
 * Service Worker Registration Utilities
 * PWA機能を提供するためのService Worker登録管理
 */

const isLocalhost = Boolean(
  window.location.hostname === 'localhost' ||
    window.location.hostname === '[::1]' ||
    window.location.hostname.match(
      /^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/
    )
);

export type ServiceWorkerConfig = {
  onSuccess?: (registration: ServiceWorkerRegistration) => void;
  onUpdate?: (registration: ServiceWorkerRegistration) => void;
  onOfflineReady?: () => void;
  onError?: (error: Error) => void;
};

/**
 * Service Workerを登録
 */
export function register(config?: ServiceWorkerConfig): void {
  if (!('serviceWorker' in navigator)) {
    console.warn('[SW] Service Worker is not supported in this browser');
    config?.onError?.(new Error('Service Worker not supported'));
    return;
  }

  // 開発環境でもService Workerを登録（テスト用）
  window.addEventListener('load', () => {
    const swUrl = `${window.location.origin}/sw.js`;

    if (isLocalhost) {
      // ローカル環境では常にService Workerをチェック
      checkValidServiceWorker(swUrl, config);

      // ローカル環境での追加情報表示
      navigator.serviceWorker.ready
        .then(registration => {
          console.log(
            '[SW] Service Worker is ready. App is being served cache-first.',
            {
              scope: registration.scope,
              active: registration.active?.state,
            }
          );
          config?.onOfflineReady?.();
        })
        .catch(error => {
          console.error('[SW] Error in service worker ready:', error);
          config?.onError?.(error);
        });
    } else {
      // 本番環境
      registerValidSW(swUrl, config);
    }
  });
}

/**
 * 有効なService Workerを登録
 */
function registerValidSW(swUrl: string, config?: ServiceWorkerConfig): void {
  navigator.serviceWorker
    .register(swUrl)
    .then(registration => {
      console.log('[SW] Service Worker registered successfully:', {
        scope: registration.scope,
        updateViaCache: registration.updateViaCache,
      });

      // 更新チェック
      registration.onupdatefound = () => {
        const installingWorker = registration.installing;
        if (installingWorker === null) {
          return;
        }

        installingWorker.onstatechange = () => {
          if (installingWorker.state === 'installed') {
            if (navigator.serviceWorker.controller) {
              // 新しいコンテンツが利用可能
              console.log(
                '[SW] New content is available. Please refresh to update.'
              );

              if (config?.onUpdate) {
                config.onUpdate(registration);
              }
            } else {
              // 初回インストール完了
              console.log('[SW] Content is cached for offline use.');

              if (config?.onSuccess) {
                config.onSuccess(registration);
              }
              if (config?.onOfflineReady) {
                config.onOfflineReady();
              }
            }
          }
        };
      };

      // 定期的に更新をチェック（1時間ごと）
      const updateInterval = setInterval(
        () => {
          registration.update().catch(err => {
            console.warn('[SW] Update check failed:', err);
          });
        },
        60 * 60 * 1000
      ); // 1 hour

      // クリーンアップ用（ページアンロード時）
      window.addEventListener('beforeunload', () => {
        clearInterval(updateInterval);
      });
    })
    .catch(error => {
      console.error('[SW] Service Worker registration failed:', error);
      config?.onError?.(error);
    });
}

/**
 * Service Workerが有効かチェック
 */
function checkValidServiceWorker(
  swUrl: string,
  config?: ServiceWorkerConfig
): void {
  fetch(swUrl, {
    headers: { 'Service-Worker': 'script' },
  })
    .then(response => {
      const contentType = response.headers.get('content-type');

      if (
        response.status === 404 ||
        (contentType !== null && !contentType.includes('javascript'))
      ) {
        // Service Workerが見つからない場合は登録解除
        navigator.serviceWorker.ready
          .then(registration => {
            registration.unregister().then(() => {
              console.log('[SW] Service Worker unregistered. Reloading...');
              window.location.reload();
            });
          })
          .catch(error => {
            console.error('[SW] Error unregistering invalid SW:', error);
            config?.onError?.(error);
          });
      } else {
        // 有効なService Workerを登録
        registerValidSW(swUrl, config);
      }
    })
    .catch(error => {
      console.log(
        '[SW] No internet connection. App is running in offline mode.',
        error
      );
      config?.onOfflineReady?.();
    });
}

/**
 * Service Workerの登録を解除
 */
export function unregister(): void {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready
      .then(registration => registration.unregister())
      .then(() => {
        console.log('[SW] Service Worker unregistered successfully');
      })
      .catch(error => {
        console.error('[SW] Error unregistering Service Worker:', error);
      });
  }
}

/**
 * Service Worker更新をスキップして即座にアクティベート
 */
export function skipWaiting(): void {
  if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
    try {
      navigator.serviceWorker.controller.postMessage({ type: 'SKIP_WAITING' });
      console.log('[SW] Skip waiting message sent');
    } catch (error) {
      console.error('[SW] Error sending skip waiting message:', error);
    }
  }
}

/**
 * 特定のURLをキャッシュに追加
 */
export function cacheUrls(urls: string[]): void {
  if (!('serviceWorker' in navigator) || !navigator.serviceWorker.controller) {
    console.warn('[SW] Cannot cache URLs - Service Worker not active');
    return;
  }

  try {
    navigator.serviceWorker.controller.postMessage({
      type: 'CACHE_URLS',
      payload: urls,
    });
    console.log('[SW] Cache URLs message sent:', urls);
  } catch (error) {
    console.error('[SW] Error sending cache URLs message:', error);
  }
}

/**
 * Service Workerの状態を取得
 */
export async function getServiceWorkerStatus(): Promise<{
  isSupported: boolean;
  isRegistered: boolean;
  isActive: boolean;
  scope?: string;
}> {
  if (!('serviceWorker' in navigator)) {
    return {
      isSupported: false,
      isRegistered: false,
      isActive: false,
    };
  }

  try {
    const registration = await navigator.serviceWorker.getRegistration();

    return {
      isSupported: true,
      isRegistered: !!registration,
      isActive: registration?.active?.state === 'activated',
      scope: registration?.scope,
    };
  } catch (error) {
    console.error('[SW] Error getting service worker status:', error);
    return {
      isSupported: true,
      isRegistered: false,
      isActive: false,
    };
  }
}
