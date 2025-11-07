# PWA E2Eテストドキュメント

## 概要

TaskFlowアプリのPWA（Progressive Web App）機能を包括的にテストするE2Eテストスイートです。

## テスト対象機能

### 1. Service Worker登録

- Service Workerの正常な登録
- Service Workerのアクティベーション
- キャッシュの作成と管理
- バージョン情報の確認

### 2. オフライン機能

- オフライン時のアプリケーション動作
- キャッシュからのリソース読み込み
- ローカルストレージの動作確認
- オフラインページの表示

### 3. PWAインストールプロンプト

- インストールプロンプトの表示
- プロンプトの却下機能
- 却下状態の永続化
- スタンドアロンモードの検出

### 4. Service Worker更新通知

- Service Worker更新の検出
- 更新通知の表示
- 更新の適用とリロード

### 5. キャッシュ機能

- 静的リソースのキャッシュ
- キャッシュからのリソース読み込み
- 古いキャッシュの削除
- キャッシュサイズの管理

### 6. PWAマニフェスト

- マニフェストファイルの存在確認
- マニフェスト内容の検証
- アイコンファイルの確認

### 7. オフラインインジケーター

- オフライン状態の表示
- オンライン復帰時の非表示

### 8. PWA統合テスト

- 完全なPWAワークフロー
- オフライン/オンライン切り替え
- データの永続化

## テストファイル構成

```
e2e/
├── tests/
│   └── pwa.spec.ts                # メインテストファイル
├── helpers/
│   └── pwa-helpers.ts             # PWAテスト用ヘルパー関数
└── fixtures/
    └── pwa-fixtures.ts            # カスタムフィクスチャ
```

## 使用方法

### 全PWAテストの実行

```bash
npm run test:e2e -- e2e/tests/pwa.spec.ts
```

### 特定のテストグループの実行

```bash
# Service Worker登録のテストのみ
npm run test:e2e -- e2e/tests/pwa.spec.ts -g "Service Worker登録"

# オフライン機能のテストのみ
npm run test:e2e -- e2e/tests/pwa.spec.ts -g "オフライン機能"

# PWAインストールプロンプトのテストのみ
npm run test:e2e -- e2e/tests/pwa.spec.ts -g "PWAインストールプロンプト"
```

### 特定のブラウザでの実行

```bash
# Chromiumのみ
npm run test:e2e -- e2e/tests/pwa.spec.ts --project=chromium

# Firefoxのみ
npm run test:e2e -- e2e/tests/pwa.spec.ts --project=firefox

# モバイルChromeのみ
npm run test:e2e -- e2e/tests/pwa.spec.ts --project="Mobile Chrome"
```

### デバッグモード

```bash
# UIモードで実行
npm run test:e2e -- e2e/tests/pwa.spec.ts --ui

# デバッグモードで実行
npm run test:e2e -- e2e/tests/pwa.spec.ts --debug
```

### ヘッドモードで実行（ブラウザ表示）

```bash
npm run test:e2e -- e2e/tests/pwa.spec.ts --headed
```

## ヘルパー関数

### Service Worker関連

```typescript
// Service Workerの状態を取得
const status = await getServiceWorkerStatus(page);

// Service Workerの登録を待つ
await waitForServiceWorkerRegistration(page);

// Service Workerを登録解除
await unregisterServiceWorker(page);

// Service Workerのバージョンを取得
const version = await getServiceWorkerVersion(page);

// SKIP_WAITINGメッセージを送信
await skipWaiting(page);
```

### キャッシュ関連

```typescript
// キャッシュの状態を取得
const cache = await getCacheStatus(page);

// 特定のURLがキャッシュされているか確認
const isCached = await isUrlCached(page, '/index.html');

// 全キャッシュをクリア
await clearAllCaches(page);

// キャッシュサイズを取得
const size = await getCacheSize(page);
```

### オフライン/オンライン制御

```typescript
// オフラインモードに切り替え
await goOffline(context);

// オンラインモードに切り替え
await goOnline(context);

// オフラインイベントを発火
await triggerOfflineEvent(page);

// オンラインイベントを発火
await triggerOnlineEvent(page);
```

### PWAインストール関連

```typescript
// インストールプロンプトをトリガー
await triggerInstallPrompt(page);

// PWAがインストール済みかチェック
const isInstalled = await isPWAInstalled(page);

// インストール却下フラグを取得
const dismissed = await getInstallDismissedFlag(page);

// インストール却下フラグをクリア
await clearInstallDismissedFlag(page);
```

### その他

```typescript
// マニフェストを取得
const manifest = await getManifest(page);

// ネットワーク監視を設定
const monitor = setupNetworkMonitoring(page);
const requests = monitor.getRequests();

// Service Workerログを監視
const logger = await captureServiceWorkerLogs(page);
const logs = logger.getLogs();
```

## カスタムフィクスチャ

### pwaPage

Service Workerが登録され、アクティブな状態のページ

```typescript
test('example test', async ({ pwaPage }) => {
  // pwaPageは既にService Worker登録済み
  await expect(pwaPage).toHaveURL('/');
});
```

### cleanPWAPage

キャッシュとService Workerがクリアされた状態のページ

```typescript
test('clean state test', async ({ cleanPWAPage }) => {
  // cleanPWAPageはキャッシュとSWがクリアされた状態
});
```

### offlinePage

オフラインモードのページ

```typescript
test('offline test', async ({ offlinePage }) => {
  // offlinePageは既にオフラインモード
  await expect(offlinePage.locator('text=オフライン')).toBeVisible();
});
```

## テストケース詳細

### Service Worker登録テスト

```typescript
test('Service Workerが正常に登録される', async ({ page }) => {
  await page.goto('/');
  await page.waitForLoadState('networkidle');

  const swStatus = await getServiceWorkerStatus(page);
  expect(swStatus.supported).toBe(true);
  expect(swStatus.isRegistered).toBe(true);
  expect(swStatus.state).toBe('activated');
});
```

### オフライン機能テスト

```typescript
test('オフライン時にアプリケーションが動作する', async ({ page, context }) => {
  // キャッシュを作成
  await page.goto('/');
  await page.waitForLoadState('networkidle');

  // オフラインモードに切り替え
  await goOffline(context);

  // ページをリロード
  await page.reload();
  await page.waitForLoadState('networkidle');

  // アプリが動作することを確認
  await expect(page.locator('body')).toBeVisible();
});
```

### キャッシュ機能テスト

```typescript
test('静的リソースがキャッシュされる', async ({ page }) => {
  await page.goto('/');
  await page.waitForLoadState('networkidle');

  const cache = await getCacheStatus(page);
  expect(cache.hasCaches).toBe(true);

  const isCached = await isUrlCached(page, '/index.html');
  expect(isCached).toBe(true);
});
```

## トラブルシューティング

### Service Workerが登録されない

```bash
# Service Workerのログを確認
npm run dev
# ブラウザの開発者ツールで Console > Service Workers を確認
```

### キャッシュが作成されない

```bash
# キャッシュの状態を確認
# ブラウザの開発者ツールで Application > Cache Storage を確認
```

### オフラインテストが失敗する

```bash
# オフラインモードが正しく設定されているか確認
# ネットワークタブでオフライン状態を確認
```

### テストがタイムアウトする

```typescript
// タイムアウト時間を延長
test('long running test', async ({ page }) => {
  test.setTimeout(60000); // 60秒に延長
  // ...
});
```

## ベストプラクティス

### 1. テスト前のクリーンアップ

```typescript
test.beforeEach(async ({ page }) => {
  await clearAllCaches(page);
  await unregisterServiceWorker(page);
});
```

### 2. テスト後のクリーンアップ

```typescript
test.afterEach(async ({ page, context }) => {
  await goOnline(context);
  await clearAllCaches(page);
});
```

### 3. 待機処理の使用

```typescript
// Service Workerの登録を待つ
await waitForServiceWorkerRegistration(page);

// ネットワークアイドルを待つ
await page.waitForLoadState('networkidle');
```

### 4. エラーハンドリング

```typescript
try {
  const status = await getServiceWorkerStatus(page);
} catch (error) {
  console.error('Failed to get SW status:', error);
}
```

## CI/CD統合

### GitHub Actions設定例

```yaml
- name: Run PWA E2E tests
  run: npm run test:e2e -- e2e/tests/pwa.spec.ts

- name: Upload test results
  if: always()
  uses: actions/upload-artifact@v3
  with:
    name: pwa-test-results
    path: test-results/
```

## パフォーマンス考慮事項

- テストは並列実行可能
- オフラインテストは順次実行推奨
- キャッシュクリアは必要時のみ実行
- Service Worker登録の待機時間を最適化

## 今後の拡張予定

- [ ] プッシュ通知のテスト
- [ ] バックグラウンド同期のテスト
- [ ] パフォーマンスメトリクスの測定
- [ ] クロスブラウザ互換性の強化
- [ ] モバイル端末での実機テスト

## 関連ドキュメント

- [Playwright公式ドキュメント](https://playwright.dev/)
- [Service Worker API](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
- [PWAドキュメント](https://web.dev/progressive-web-apps/)
- [TaskFlow PWA実装ガイド](/docs/PWA.md)
