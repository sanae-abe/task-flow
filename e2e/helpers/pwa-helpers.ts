import { Page, BrowserContext } from '@playwright/test';

/**
 * PWA E2Eテスト用ヘルパー関数
 */

/**
 * Service Workerの登録状態を取得
 */
export async function getServiceWorkerStatus(page: Page) {
  return await page.evaluate(async () => {
    if (!('serviceWorker' in navigator)) {
      return {
        supported: false,
        isRegistered: false,
        isActive: false,
      };
    }

    try {
      const registration = await navigator.serviceWorker.getRegistration();

      return {
        supported: true,
        isRegistered: !!registration,
        isActive: registration?.active?.state === 'activated',
        scope: registration?.scope,
        state: registration?.active?.state,
        waiting: !!registration?.waiting,
        installing: !!registration?.installing,
      };
    } catch (error) {
      return {
        supported: true,
        isRegistered: false,
        isActive: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  });
}

/**
 * Service Workerが登録されるまで待つ
 */
export async function waitForServiceWorkerRegistration(
  page: Page,
  timeout = 10000
) {
  const startTime = Date.now();

  while (Date.now() - startTime < timeout) {
    const status = await getServiceWorkerStatus(page);

    if (status.isRegistered && status.isActive) {
      return status;
    }

    await page.waitForTimeout(500);
  }

  throw new Error('Service Worker registration timeout');
}

/**
 * キャッシュの状態を取得
 */
export async function getCacheStatus(page: Page) {
  return await page.evaluate(async () => {
    try {
      const cacheNames = await caches.keys();
      const taskflowCaches = cacheNames.filter((name) =>
        name.startsWith('taskflow-')
      );

      if (taskflowCaches.length === 0) {
        return {
          hasCaches: false,
          cacheNames: [],
          cachedUrls: [],
        };
      }

      // 最新のキャッシュを取得
      const latestCache = taskflowCaches[taskflowCaches.length - 1];
      const cache = await caches.open(latestCache);
      const requests = await cache.keys();
      const urls = requests.map((req) => new URL(req.url).pathname);

      return {
        hasCaches: true,
        cacheNames: taskflowCaches,
        latestCache,
        cachedUrls: urls,
        urlCount: urls.length,
      };
    } catch (error) {
      return {
        hasCaches: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  });
}

/**
 * 特定のURLがキャッシュされているか確認
 */
export async function isUrlCached(page: Page, url: string): Promise<boolean> {
  return await page.evaluate(async (targetUrl) => {
    try {
      const cacheNames = await caches.keys();
      const taskflowCache = cacheNames.find((name) =>
        name.startsWith('taskflow-')
      );

      if (!taskflowCache) {
        return false;
      }

      const cache = await caches.open(taskflowCache);
      const response = await cache.match(targetUrl);

      return !!response;
    } catch {
      return false;
    }
  }, url);
}

/**
 * キャッシュをクリア
 */
export async function clearAllCaches(page: Page) {
  await page.evaluate(async () => {
    const cacheNames = await caches.keys();
    await Promise.all(cacheNames.map((name) => caches.delete(name)));
  });
}

/**
 * Service Workerを登録解除
 */
export async function unregisterServiceWorker(page: Page) {
  await page.evaluate(async () => {
    if ('serviceWorker' in navigator) {
      const registration = await navigator.serviceWorker.getRegistration();
      if (registration) {
        await registration.unregister();
      }
    }
  });
}

/**
 * オフラインモードを有効化
 */
export async function goOffline(context: BrowserContext) {
  await context.setOffline(true);
}

/**
 * オンラインモードを有効化
 */
export async function goOnline(context: BrowserContext) {
  await context.setOffline(false);
}

/**
 * オフラインイベントを発火
 */
export async function triggerOfflineEvent(page: Page) {
  await page.evaluate(() => {
    window.dispatchEvent(new Event('offline'));
  });
}

/**
 * オンラインイベントを発火
 */
export async function triggerOnlineEvent(page: Page) {
  await page.evaluate(() => {
    window.dispatchEvent(new Event('online'));
  });
}

/**
 * beforeinstallpromptイベントをシミュレート
 */
export async function triggerInstallPrompt(page: Page) {
  await page.evaluate(() => {
    // ローカルストレージのフラグをクリア
    localStorage.removeItem('pwa-install-dismissed');

    // beforeinstallpromptイベントを作成
    const event = new Event('beforeinstallprompt') as any;
    event.platforms = ['web'];
    event.userChoice = Promise.resolve({
      outcome: 'dismissed',
      platform: 'web',
    });
    event.prompt = () => Promise.resolve();

    window.dispatchEvent(event);
  });
}

/**
 * Service Worker更新イベントをシミュレート
 */
export async function triggerServiceWorkerUpdate(page: Page) {
  await page.evaluate(async () => {
    const registration = await navigator.serviceWorker.getRegistration();
    if (registration) {
      await registration.update();
    }
  });
}

/**
 * Service WorkerにSKIP_WAITINGメッセージを送信
 */
export async function skipWaiting(page: Page) {
  await page.evaluate(() => {
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({ type: 'SKIP_WAITING' });
    }
  });
}

/**
 * キャッシュのサイズを取得（バイト単位）
 */
export async function getCacheSize(page: Page): Promise<number> {
  return await page.evaluate(async () => {
    try {
      const cacheNames = await caches.keys();
      const taskflowCache = cacheNames.find((name) =>
        name.startsWith('taskflow-')
      );

      if (!taskflowCache) {
        return 0;
      }

      const cache = await caches.open(taskflowCache);
      const requests = await cache.keys();

      let totalSize = 0;
      for (const request of requests) {
        try {
          const response = await cache.match(request);
          if (response) {
            const blob = await response.blob();
            totalSize += blob.size;
          }
        } catch {
          // エラーは無視
        }
      }

      return totalSize;
    } catch {
      return 0;
    }
  });
}

/**
 * マニフェストを取得
 */
export async function getManifest(page: Page) {
  const response = await page.goto('/manifest.json');
  if (!response || response.status() !== 200) {
    throw new Error('Failed to load manifest.json');
  }

  return await response.json();
}

/**
 * Service Workerのバージョンを取得
 */
export async function getServiceWorkerVersion(page: Page): Promise<string | null> {
  return await page.evaluate(async () => {
    try {
      const registration = await navigator.serviceWorker.getRegistration();
      if (!registration || !registration.active) {
        return null;
      }

      const response = await fetch(registration.active.scriptURL);
      const text = await response.text();
      const versionMatch = text.match(/CACHE_VERSION\s*=\s*['"]([^'"]+)['"]/);

      return versionMatch ? versionMatch[1] : null;
    } catch {
      return null;
    }
  });
}

/**
 * PWAがインストール済みかチェック
 */
export async function isPWAInstalled(page: Page): Promise<boolean> {
  return await page.evaluate(() => {
    return window.matchMedia('(display-mode: standalone)').matches;
  });
}

/**
 * ローカルストレージからPWAインストール却下フラグを取得
 */
export async function getInstallDismissedFlag(page: Page): Promise<string | null> {
  return await page.evaluate(() => {
    return localStorage.getItem('pwa-install-dismissed');
  });
}

/**
 * ローカルストレージのPWAインストール却下フラグをクリア
 */
export async function clearInstallDismissedFlag(page: Page) {
  await page.evaluate(() => {
    localStorage.removeItem('pwa-install-dismissed');
  });
}

/**
 * ネットワークリクエストを監視
 */
export function setupNetworkMonitoring(page: Page) {
  const requests: Array<{
    url: string;
    method: string;
    resourceType: string;
    fromCache: boolean;
  }> = [];

  page.on('request', (request) => {
    requests.push({
      url: request.url(),
      method: request.method(),
      resourceType: request.resourceType(),
      fromCache: request.isNavigationRequest(),
    });
  });

  return {
    getRequests: () => requests,
    clearRequests: () => {
      requests.length = 0;
    },
  };
}

/**
 * Service Workerログを監視
 */
export async function captureServiceWorkerLogs(page: Page) {
  const logs: string[] = [];

  page.on('console', (msg) => {
    const text = msg.text();
    if (text.includes('[SW]')) {
      logs.push(text);
    }
  });

  return {
    getLogs: () => logs,
    clearLogs: () => {
      logs.length = 0;
    },
  };
}

/**
 * オフライン時の動作をテスト
 */
export async function testOfflineBehavior(
  page: Page,
  context: BrowserContext,
  action: () => Promise<void>
) {
  // オフラインモードに切り替え
  await goOffline(context);
  await triggerOfflineEvent(page);

  try {
    // アクションを実行
    await action();
  } finally {
    // オンラインに戻す
    await goOnline(context);
    await triggerOnlineEvent(page);
  }
}

/**
 * キャッシュ戦略のテスト
 */
export async function testCacheStrategy(
  page: Page,
  url: string,
  expectedStrategy: 'cache-first' | 'network-first' | 'stale-while-revalidate'
) {
  // ネットワーク監視を設定
  const networkMonitor = setupNetworkMonitoring(page);

  // 初回アクセス
  await page.goto(url);
  await page.waitForLoadState('networkidle');

  const firstLoadRequests = networkMonitor.getRequests();
  networkMonitor.clearRequests();

  // 2回目のアクセス
  await page.reload();
  await page.waitForLoadState('networkidle');

  const secondLoadRequests = networkMonitor.getRequests();

  return {
    firstLoadRequests,
    secondLoadRequests,
    strategy: expectedStrategy,
  };
}
