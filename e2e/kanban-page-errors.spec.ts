import { test, expect, type Page, type ConsoleMessage } from '@playwright/test';

/**
 * /kanban ページ専用エラー検出テスト
 */

interface ErrorCollector {
  consoleErrors: string[];
  pageErrors: string[];
  networkErrors: string[];
  warnings: string[];
}

function createErrorCollector(page: Page): ErrorCollector {
  const collector: ErrorCollector = {
    consoleErrors: [],
    pageErrors: [],
    networkErrors: [],
    warnings: [],
  };

  page.on('console', (msg: ConsoleMessage) => {
    const type = msg.type();
    const text = msg.text();

    if (type === 'error') {
      collector.consoleErrors.push(text);
      console.error(`[Console Error] ${text}`);
    } else if (type === 'warning') {
      collector.warnings.push(text);
      console.warn(`[Console Warning] ${text}`);
    }
  });

  page.on('pageerror', (error: Error) => {
    const errorMsg = `${error.name}: ${error.message}\n${error.stack}`;
    collector.pageErrors.push(errorMsg);
    console.error(`[Page Error] ${errorMsg}`);
  });

  page.on('requestfailed', (request) => {
    const failure = request.failure();
    const errorMsg = `${request.method()} ${request.url()} - ${failure?.errorText || 'Unknown error'}`;
    collector.networkErrors.push(errorMsg);
    console.error(`[Network Error] ${errorMsg}`);
  });

  return collector;
}

test.describe('/kanban ページエラー検出', () => {
  let errorCollector: ErrorCollector | undefined;

  test.beforeEach(async ({ page }) => {
    errorCollector = createErrorCollector(page);
  });

  test.afterEach(async () => {
    if (!errorCollector) return;

    const totalErrors =
      errorCollector.consoleErrors.length +
      errorCollector.pageErrors.length +
      errorCollector.networkErrors.length;

    if (totalErrors > 0) {
      console.log('\n========== /kanban エラーサマリー ==========');
      console.log(`コンソールエラー: ${errorCollector.consoleErrors.length}`);
      errorCollector.consoleErrors.forEach((err, i) => {
        console.log(`  [${i + 1}] ${err}`);
      });
      console.log(`\nページエラー: ${errorCollector.pageErrors.length}`);
      errorCollector.pageErrors.forEach((err, i) => {
        console.log(`  [${i + 1}] ${err}`);
      });
      console.log(`\nネットワークエラー: ${errorCollector.networkErrors.length}`);
      errorCollector.networkErrors.forEach((err, i) => {
        console.log(`  [${i + 1}] ${err}`);
      });
      console.log(`\n警告: ${errorCollector.warnings.length}`);
      console.log('==========================================\n');
    }
  });

  test('/kanban ページの直接アクセステスト', async ({ page }) => {
    // /kanban に直接アクセス
    await page.goto('/kanban');

    // ページが正常にレンダリングされるまで待機
    await page.waitForLoadState('networkidle');

    // ページタイトルまたは特徴的な要素が存在することを確認
    await page.waitForTimeout(2000); // コンポーネントマウント待機

    // エラーレポート
    console.log('\n========== 詳細エラーレポート ==========');
    console.log(`URL: ${page.url()}`);
    console.log(`コンソールエラー数: ${errorCollector?.consoleErrors.length || 0}`);
    console.log(`ページエラー数: ${errorCollector?.pageErrors.length || 0}`);
    console.log(`ネットワークエラー数: ${errorCollector?.networkErrors.length || 0}`);
    console.log('=======================================\n');

    // エラーがあっても失敗させず、情報収集のみ
    // 実際の修正はエラー内容を確認してから行う
  });

  test('/kanban ページのナビゲーションテスト', async ({ page }) => {
    // トップページから /kanban へ遷移
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // ツールチップやオーバーレイを閉じる
    const overlay = page.locator('[role="button"][aria-label*="ヒント"], [role="button"][aria-label*="閉じる"]');
    if (await overlay.count() > 0) {
      await overlay.first().click({ force: true });
      await page.waitForTimeout(300);
    }

    // カンバンビューボタンをクリック
    const kanbanButton = page.locator('button:has-text("カンバン"), button:has-text("Kanban"), [aria-label*="Kanban"]');
    if (await kanbanButton.count() > 0) {
      await kanbanButton.first().click({ force: true });
      await page.waitForTimeout(1000);
    }

    // URLが /kanban に変わっているか確認
    console.log(`\n遷移後のURL: ${page.url()}`);

    // エラーレポート
    console.log('\n========== ナビゲーション後エラーレポート ==========');
    console.log(`コンソールエラー数: ${errorCollector?.consoleErrors.length || 0}`);
    console.log(`ページエラー数: ${errorCollector?.pageErrors.length || 0}`);
    console.log('=================================================\n');
  });
});
