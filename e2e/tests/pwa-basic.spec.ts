import { test, expect } from '@playwright/test';

/**
 * PWA基本機能テスト（簡易版）
 * 重要な機能のみを素早くテスト
 */

test.describe('PWA基本機能テスト', () => {
  test('Service Workerが登録される', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Service Workerの登録状態を確認
    const isRegistered = await page.evaluate(async () => {
      if (!('serviceWorker' in navigator)) {
        return false;
      }

      const registration = await navigator.serviceWorker.getRegistration();
      return !!registration;
    });

    expect(isRegistered).toBe(true);
  });

  test('マニフェストファイルが存在する', async ({ page }) => {
    const response = await page.goto('/manifest.json');
    expect(response?.status()).toBe(200);

    const manifest = await response?.json();
    expect(manifest.name).toBe('TaskFlow - タスク管理ツール');
    expect(manifest.display).toBe('standalone');
  });

  test('オフライン時にキャッシュから読み込める', async ({
    page,
    context,
  }) => {
    // 通常モードでキャッシュを作成
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Service Worker登録を待機
    await page.waitForTimeout(2000);

    // オフラインモードに切り替え
    await context.setOffline(true);

    // ページをリロード
    await page.reload();
    await page.waitForLoadState('networkidle');

    // アプリケーションタイトルが表示されることを確認（キャッシュから読み込まれた証拠）
    const title = await page.title();
    expect(title).toContain('TaskFlow');

    // オンラインに戻す
    await context.setOffline(false);
  });

  test('静的リソースがキャッシュされる', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const hasCache = await page.evaluate(async () => {
      const cacheNames = await caches.keys();
      return cacheNames.some((name) => name.startsWith('taskflow-'));
    });

    expect(hasCache).toBe(true);
  });

  test('PWAアイコンが存在する', async ({ page }) => {
    const iconPaths = ['/favicon.ico', '/favicon.svg', '/logo192.svg'];

    for (const iconPath of iconPaths) {
      const response = await page.goto(iconPath);
      expect(response?.status()).toBe(200);
    }
  });
});
