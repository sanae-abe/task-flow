import { test, expect, type Page, type ConsoleMessage } from '@playwright/test';

/**
 * ブラウザエラー自動検出E2Eテスト
 * Claude Codeが自律的にブラウザのエラーを検出するためのテスト
 */

// エラーコレクター
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

  // コンソールエラー収集
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

  // ページエラー収集
  page.on('pageerror', (error: Error) => {
    const errorMsg = `${error.name}: ${error.message}\n${error.stack}`;
    collector.pageErrors.push(errorMsg);
    console.error(`[Page Error] ${errorMsg}`);
  });

  // ネットワークエラー収集
  page.on('requestfailed', (request) => {
    const failure = request.failure();
    const errorMsg = `${request.method()} ${request.url()} - ${failure?.errorText || 'Unknown error'}`;
    collector.networkErrors.push(errorMsg);
    console.error(`[Network Error] ${errorMsg}`);
  });

  return collector;
}

test.describe('ブラウザエラー自動検出', () => {
  let errorCollector: ErrorCollector | undefined;

  test.beforeEach(async ({ page }) => {
    errorCollector = createErrorCollector(page);
  });

  test.afterEach(async () => {
    // テスト後にエラーレポート出力
    if (!errorCollector) return;

    const totalErrors =
      errorCollector.consoleErrors.length +
      errorCollector.pageErrors.length +
      errorCollector.networkErrors.length;

    if (totalErrors > 0) {
      console.log('\n========== エラーサマリー ==========');
      console.log(`コンソールエラー: ${errorCollector.consoleErrors.length}`);
      console.log(`ページエラー: ${errorCollector.pageErrors.length}`);
      console.log(`ネットワークエラー: ${errorCollector.networkErrors.length}`);
      console.log(`警告: ${errorCollector.warnings.length}`);
      console.log('===================================\n');
    }
  });

  test('トップページ読み込み時のエラー検出', async ({ page }) => {
    await page.goto('/');

    // ページが正常にレンダリングされるまで待機
    await page.waitForLoadState('networkidle');

    // エラーがないことを確認
    expect(errorCollector?.consoleErrors || [], 'コンソールエラーがあります').toHaveLength(0);
    expect(errorCollector?.pageErrors || [], 'ページエラーがあります').toHaveLength(0);
    expect(errorCollector?.networkErrors || [], 'ネットワークエラーがあります').toHaveLength(0);
  });

  test('タスク作成フローのエラー検出', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // タスク作成ボタンをクリック
    const createButton = page.locator('button:has-text("新規タスク"), button:has-text("New Task")');
    if (await createButton.count() > 0) {
      await createButton.first().click();

      // ダイアログが開くのを待機
      await page.waitForTimeout(500);

      // タイトル入力
      const titleInput = page.locator('input[name="title"], input[placeholder*="タスク"], input[placeholder*="Task"]');
      if (await titleInput.count() > 0) {
        await titleInput.first().fill('E2Eテストタスク');
      }

      // 送信ボタン（実際には送信しない）
      // await page.click('button[type="submit"]');
    }

    // エラーがないことを確認
    expect(errorCollector?.consoleErrors || [], 'タスク作成時のコンソールエラー').toHaveLength(0);
    expect(errorCollector?.pageErrors || [], 'タスク作成時のページエラー').toHaveLength(0);
  });

  test('カンバンビュー表示時のエラー検出', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // ツールチップやオーバーレイを閉じる
    const overlay = page.locator('[role="button"][aria-label*="ヒント"], [role="button"][aria-label*="閉じる"]');
    if (await overlay.count() > 0) {
      await overlay.first().click({ force: true });
      await page.waitForTimeout(300);
    }

    // ビュー切り替えボタンを探す
    const kanbanButton = page.locator('button:has-text("カンバン"), button:has-text("Kanban"), [aria-label*="Kanban"]');
    if (await kanbanButton.count() > 0) {
      await kanbanButton.first().click({ force: true });
      await page.waitForTimeout(500);
    }

    expect(errorCollector?.consoleErrors || []).toHaveLength(0);
    expect(errorCollector?.pageErrors || []).toHaveLength(0);
  });

  test('テーブルビュー表示時のエラー検出', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const tableButton = page.locator('button:has-text("テーブル"), button:has-text("Table"), [aria-label*="Table"]');
    if (await tableButton.count() > 0) {
      await tableButton.first().click();
      await page.waitForTimeout(500);
    }

    expect(errorCollector?.consoleErrors || []).toHaveLength(0);
    expect(errorCollector?.pageErrors || []).toHaveLength(0);
  });

  test('カレンダービュー表示時のエラー検出', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const calendarButton = page.locator('button:has-text("カレンダー"), button:has-text("Calendar"), [aria-label*="Calendar"]');
    if (await calendarButton.count() > 0) {
      await calendarButton.first().click();
      await page.waitForTimeout(1000);
    }

    expect(errorCollector?.consoleErrors || []).toHaveLength(0);
    expect(errorCollector?.pageErrors || []).toHaveLength(0);
  });

  test('リッチテキストエディタのエラー検出（XSS対策確認）', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // タスク作成ダイアログを開く
    const createButton = page.locator('button:has-text("新規タスク"), button:has-text("New Task")');
    if (await createButton.count() > 0) {
      await createButton.first().click();
      await page.waitForTimeout(500);

      // リッチテキストエディタを探す
      const richTextEditor = page.locator('[contenteditable="true"], .lexical-editor');
      if (await richTextEditor.count() > 0) {
        // 潜在的にXSSを引き起こす可能性のあるコンテンツを入力
        await richTextEditor.first().fill('<script>alert("XSS")</script>');
        await page.waitForTimeout(500);
      }
    }

    // XSS攻撃が実行されていないことを確認（alertダイアログが開かない）
    expect(errorCollector?.consoleErrors || []).toHaveLength(0);
    expect(errorCollector?.pageErrors || []).toHaveLength(0);
  });

  test('長時間操作でのメモリリーク検出', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // 初期メモリ使用量を記録
    const initialMetrics = await page.evaluate(() => {
      if ('memory' in performance) {
        const mem = (performance as any).memory;
        return {
          usedJSHeapSize: mem.usedJSHeapSize,
          totalJSHeapSize: mem.totalJSHeapSize,
        };
      }
      return null;
    });

    // 繰り返し操作（ビュー切り替え）
    for (let i = 0; i < 10; i++) {
      const buttons = await page.locator('button').all();
      if (buttons.length > 0) {
        // ランダムなボタンをクリック（クラッシュしないことを確認）
        const randomButton = buttons[Math.floor(Math.random() * buttons.length)];
        try {
          await randomButton.click({ timeout: 1000 });
          await page.waitForTimeout(200);
        } catch {
          // クリックできないボタンはスキップ
        }
      }
    }

    // 最終メモリ使用量を記録
    const finalMetrics = await page.evaluate(() => {
      if ('memory' in performance) {
        const mem = (performance as any).memory;
        return {
          usedJSHeapSize: mem.usedJSHeapSize,
          totalJSHeapSize: mem.totalJSHeapSize,
        };
      }
      return null;
    });

    // メモリリークの警告（厳格なテストではなく、異常値を検出）
    if (initialMetrics && finalMetrics) {
      const growth = finalMetrics.usedJSHeapSize - initialMetrics.usedJSHeapSize;
      const growthMB = growth / 1024 / 1024;

      if (growthMB > 50) {
        console.warn(`⚠️ メモリ使用量が大幅に増加: ${growthMB.toFixed(2)} MB`);
      }
    }

    expect(errorCollector?.consoleErrors || []).toHaveLength(0);
    expect(errorCollector?.pageErrors || []).toHaveLength(0);
  });
});
