import { test as base, expect } from '@playwright/test';
import {
  getServiceWorkerStatus,
  waitForServiceWorkerRegistration,
  getCacheStatus,
  clearAllCaches,
  unregisterServiceWorker,
  goOffline,
  goOnline,
} from '../helpers/pwa-helpers';

/**
 * PWAテスト用カスタムフィクスチャ
 */

type PWAFixtures = {
  /**
   * Service Workerが登録され、アクティブな状態のページ
   */
  pwaPage: typeof base extends { page: infer P } ? P : never;

  /**
   * クリーンな状態のPWAページ（キャッシュとService Workerをクリア）
   */
  cleanPWAPage: typeof base extends { page: infer P } ? P : never;

  /**
   * オフラインモードのページ
   */
  offlinePage: typeof base extends { page: infer P } ? P : never;
};

export const test = base.extend<PWAFixtures>({
  /**
   * Service Workerが登録され、アクティブな状態のページ
   */
  pwaPage: async ({ page }, use) => {
    // ページを開いてService Workerを登録
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Service Workerがアクティブになるまで待つ
    await waitForServiceWorkerRegistration(page);

    // テストに使用
    await use(page);
  },

  /**
   * クリーンな状態のPWAページ（キャッシュとService Workerをクリア）
   */
  cleanPWAPage: async ({ page }, use) => {
    // キャッシュとService Workerをクリア
    await page.goto('/');
    await clearAllCaches(page);
    await unregisterServiceWorker(page);

    // ページをリロード
    await page.reload();
    await page.waitForLoadState('networkidle');

    // テストに使用
    await use(page);

    // テスト後もクリーンアップ
    await clearAllCaches(page);
    await unregisterServiceWorker(page);
  },

  /**
   * オフラインモードのページ
   */
  offlinePage: async ({ page, context }, use) => {
    // まず通常モードでService Workerを登録
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await waitForServiceWorkerRegistration(page);

    // オフラインモードに切り替え
    await goOffline(context);

    // ページをリロード（キャッシュから読み込み）
    await page.reload();
    await page.waitForLoadState('networkidle');

    // テストに使用
    await use(page);

    // オンラインに戻す
    await goOnline(context);
  },
});

export { expect };

/**
 * PWA関連のカスタムマッチャー
 */
export const pwaMatchers = {
  /**
   * Service Workerが登録されているか確認
   */
  async toHaveServiceWorkerRegistered(page: any) {
    const status = await getServiceWorkerStatus(page);

    return {
      pass: status.isRegistered,
      message: () =>
        status.isRegistered
          ? 'Service Worker is registered'
          : 'Service Worker is not registered',
    };
  },

  /**
   * Service Workerがアクティブか確認
   */
  async toHaveActiveServiceWorker(page: any) {
    const status = await getServiceWorkerStatus(page);

    return {
      pass: status.isActive,
      message: () =>
        status.isActive
          ? 'Service Worker is active'
          : `Service Worker is not active (state: ${status.state})`,
    };
  },

  /**
   * キャッシュが存在するか確認
   */
  async toHaveCache(page: any) {
    const cacheStatus = await getCacheStatus(page);

    return {
      pass: cacheStatus.hasCaches,
      message: () =>
        cacheStatus.hasCaches
          ? `Cache exists: ${cacheStatus.cacheNames.join(', ')}`
          : 'No cache found',
    };
  },

  /**
   * 特定のURLがキャッシュされているか確認
   */
  async toHaveCachedUrl(page: any, url: string) {
    const cacheStatus = await getCacheStatus(page);

    if (!cacheStatus.hasCaches) {
      return {
        pass: false,
        message: () => 'No cache found',
      };
    }

    const isCached = cacheStatus.cachedUrls.some((cachedUrl: string) =>
      cachedUrl.includes(url)
    );

    return {
      pass: isCached,
      message: () =>
        isCached
          ? `URL is cached: ${url}`
          : `URL is not cached: ${url}. Cached URLs: ${cacheStatus.cachedUrls.join(', ')}`,
    };
  },
};

/**
 * PWAテストのセットアップヘルパー
 */
export async function setupPWATest(page: any) {
  // ページを開く
  await page.goto('/');
  await page.waitForLoadState('networkidle');

  // Service Workerの登録を待つ
  const swStatus = await waitForServiceWorkerRegistration(page);

  return {
    serviceWorker: swStatus,
    cache: await getCacheStatus(page),
  };
}

/**
 * PWAテストのクリーンアップヘルパー
 */
export async function cleanupPWATest(page: any) {
  await clearAllCaches(page);
  await unregisterServiceWorker(page);
}

/**
 * オフラインテストのセットアップ
 */
export async function setupOfflineTest(page: any, context: any) {
  // まず通常モードでキャッシュを作成
  await page.goto('/');
  await page.waitForLoadState('networkidle');
  await waitForServiceWorkerRegistration(page);

  // オフラインモードに切り替え
  await goOffline(context);

  return async () => {
    // オンラインに戻す
    await goOnline(context);
  };
}

/**
 * Service Worker更新テストのセットアップ
 */
export async function setupUpdateTest(page: any) {
  // Service Workerを登録
  await page.goto('/');
  await page.waitForLoadState('networkidle');
  await waitForServiceWorkerRegistration(page);

  // 更新をトリガー
  const updateTriggered = await page.evaluate(async () => {
    const registration = await navigator.serviceWorker.getRegistration();
    if (!registration) {
      return false;
    }

    await registration.update();
    return true;
  });

  return {
    updateTriggered,
  };
}
