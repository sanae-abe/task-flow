# E2E Testing Guide

TaskFlowアプリケーションのEnd-to-End (E2E) テストガイドです。

## 概要

TaskFlowでは、[Playwright](https://playwright.dev/)を使用してE2Eテストを実装しています。
Playwrightは、クロスブラウザテスト、信頼性の高い自動化、優れた開発者体験を提供します。

## セットアップ

### 前提条件

- Node.js 18以上
- npm 8以上

### インストール

```bash
# 依存関係のインストール
npm install

# Playwrightブラウザのインストール
npx playwright install
```

## テスト構造

```
e2e/
├── fixtures/          # テストフィクスチャ（共通設定）
│   └── test-fixtures.ts
├── helpers/           # テストヘルパー関数
│   └── test-helpers.ts
└── tests/             # テストファイル
    ├── task-management.spec.ts
    ├── kanban-view.spec.ts
    ├── label-management.spec.ts
    ├── subtasks-and-recurrence.spec.ts
    └── template-management.spec.ts
```

## テスト実行

### 基本実行

```bash
# すべてのテストを実行
npm run test:e2e

# UI モードで実行（推奨）
npm run test:e2e:ui

# デバッグモードで実行
npm run test:e2e:debug

# ヘッド付きモードで実行（ブラウザが表示される）
npm run test:e2e:headed
```

### ブラウザ別実行

```bash
# Chromium のみ
npm run test:e2e:chromium

# Firefox のみ
npm run test:e2e:firefox

# WebKit (Safari) のみ
npm run test:e2e:webkit

# モバイルブラウザ
npm run test:e2e:mobile
```

### レポート表示

```bash
# テストレポートを表示
npm run test:e2e:report
```

## テストカバレッジ

### 現在カバーされている機能

#### 1. タスク管理 (`task-management.spec.ts`)
- ✅ タスク作成（シンプル / 詳細）
- ✅ タスク編集（タイトル / 説明 / ステータス）
- ✅ タスク削除
- ✅ タスク完了/未完了
- ✅ タスク複製
- ✅ バリデーション検証

#### 2. カンバンビュー (`kanban-view.spec.ts`)
- ✅ カラム表示
- ✅ ドラッグ&ドロップ（カラム間移動）
- ✅ カラム内並び替え
- ✅ カラム管理（位置移動、デフォルト設定）
- ✅ 完了タスクの自動配置
- ✅ フィルタリング・ソート

#### 3. ラベル管理 (`label-management.spec.ts`)
- ✅ ラベル作成・編集・削除
- ✅ カスタムカラー選択
- ✅ ソート機能（名前順、色順）
- ✅ タスクへのラベル適用
- ✅ ラベルフィルタリング
- ✅ バリデーション検証

#### 4. サブタスク・繰り返し (`subtasks-and-recurrence.spec.ts`)
- ✅ サブタスク作成・編集・削除
- ✅ サブタスク完了/未完了
- ✅ サブタスク進捗表示
- ✅ サブタスクドラッグ&ドロップ
- ✅ 繰り返し設定（日次/週次/月次/年次）
- ✅ 繰り返し編集・削除
- ✅ 繰り返しタスク完了時の自動再作成

#### 5. テンプレート管理 (`template-management.spec.ts`)
- ✅ テンプレート作成・編集・削除
- ✅ タスクからテンプレート作成
- ✅ テンプレートからタスク作成
- ✅ お気に入り機能
- ✅ カテゴリフィルタリング
- ✅ バリデーション検証

## ヘルパー関数

`e2e/helpers/test-helpers.ts` には、以下のヘルパー関数が用意されています：

### ナビゲーション
- `navigateToKanban(page)` - カンバンビューへ移動
- `navigateToTable(page)` - テーブルビューへ移動
- `navigateToCalendar(page)` - カレンダービューへ移動

### タスク操作
- `createTask(page, options)` - タスク作成
- `editTask(page, taskTitle, updates)` - タスク編集
- `deleteTask(page, taskTitle)` - タスク削除
- `completeTask(page, taskTitle)` - タスク完了

### カンバン操作
- `dragTaskToColumn(page, taskTitle, targetColumn)` - タスクをカラム間でドラッグ
- `getTasksInColumn(page, columnName)` - カラム内のタスク一覧取得

### ラベル操作
- `createLabel(page, name, color)` - ラベル作成
- `deleteLabel(page, labelName)` - ラベル削除

### サブタスク操作
- `addSubtask(page, taskTitle, subtaskTitle)` - サブタスク追加
- `completeSubtask(page, taskTitle, subtaskTitle)` - サブタスク完了

### アサーション
- `assertTaskExists(page, taskTitle)` - タスク存在確認
- `assertTaskNotExists(page, taskTitle)` - タスク非存在確認
- `assertTaskInColumn(page, taskTitle, columnName)` - タスクがカラムに存在確認

## テスト作成ガイドライン

### 1. テスト分離

各テストは独立して実行可能であるべきです。

```typescript
test.beforeEach(async ({ page, cleanState }) => {
  await page.goto('/');
  // cleanStateフィクスチャが自動的にデータをクリア
});
```

### 2. 明確なテスト名

```typescript
// ✅ 良い例
test('should create task with priority and due date', async ({ page }) => {
  // ...
});

// ❌ 悪い例
test('test1', async ({ page }) => {
  // ...
});
```

### 3. ヘルパー関数の活用

```typescript
// ✅ 良い例 - ヘルパー使用
await createTask(page, { title: 'New Task', priority: 'High' });

// ❌ 悪い例 - 毎回実装
await page.getByRole('button', { name: /add task/i }).click();
await page.getByLabel(/title/i).fill('New Task');
// ... 長いコード
```

### 4. 待機処理

```typescript
// ✅ 良い例 - Playwrightの自動待機を活用
await page.getByText('Task Title').click();

// ✅ 特定の状態を待つ
await page.waitForLoadState('networkidle');

// ❌ 悪い例 - 固定時間待機（避ける）
await page.waitForTimeout(5000);
```

### 5. アサーション

```typescript
// ✅ 複数のアサーション
await expect(page.getByText('Task Title')).toBeVisible();
await expect(page.getByText('High Priority')).toBeVisible();

// ✅ ヘルパーアサーション
await assertTaskExists(page, 'Task Title');
```

## デバッグ

### UI モード（推奨）

```bash
npm run test:e2e:ui
```

UI モードでは以下が可能です：
- テストの実行状況をリアルタイムで確認
- ステップバイステップでのデバッグ
- スクリーンショット・ビデオの確認
- テストの再実行

### デバッグモード

```bash
npm run test:e2e:debug
```

デバッガが起動し、ブレークポイントで停止できます。

### Codegen（テストコード生成）

```bash
npm run test:e2e:codegen
```

ブラウザでの操作を記録し、テストコードを自動生成します。

## CI/CD統合

### GitHub Actions

`.github/workflows/e2e-tests.yml` にCI/CD設定があります。

```yaml
# プッシュ時に自動実行
on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]
```

### テストレポート

- HTML レポート: GitHub Actions Artifacts にアップロード
- JUnit XML: CI/CD システムと統合可能
- スクリーンショット・ビデオ: 失敗時に自動保存

### マトリクスビルド

複数ブラウザで並列実行：
- Chromium
- Firefox
- WebKit (Safari)

## ベストプラクティス

### 1. Page Object Model（推奨）

複雑なコンポーネントは Page Object として抽出：

```typescript
// good: e2e/pages/TaskPage.ts
export class TaskPage {
  constructor(private page: Page) {}

  async createTask(title: string) {
    await this.page.getByRole('button', { name: /add task/i }).click();
    await this.page.getByLabel(/title/i).fill(title);
    await this.page.getByRole('button', { name: /create/i }).click();
  }
}
```

### 2. データのセットアップ・クリーンアップ

```typescript
test.beforeEach(async ({ page, cleanState }) => {
  // cleanStateフィクスチャが自動的にクリーンアップ
});
```

### 3. テストデータの管理

```typescript
// e2e/fixtures/test-data.ts
export const TEST_TASKS = {
  simple: { title: 'Simple Task' },
  withPriority: { title: 'High Priority Task', priority: 'High' },
  // ...
};
```

### 4. アクセシビリティ重視

```typescript
// ✅ ロール・ラベルベースのセレクタを使用
await page.getByRole('button', { name: /add task/i });
await page.getByLabel(/title/i);

// ❌ CSS セレクタは避ける
await page.locator('.task-button');
```

## トラブルシューティング

### テストが不安定（Flaky）

```typescript
// ✅ 自動待機を活用
await page.waitForLoadState('networkidle');

// ✅ より具体的なセレクタを使用
await page.getByRole('button', { name: 'Create Task', exact: true });

// ✅ リトライ設定
test.describe.configure({ retries: 2 });
```

### タイムアウトエラー

```typescript
// テストレベルでタイムアウト延長
test('long running test', async ({ page }) => {
  test.setTimeout(60000); // 60秒
  // ...
});
```

### ブラウザインストールエラー

```bash
# システム依存関係も含めてインストール
npx playwright install --with-deps
```

## 参考リンク

- [Playwright公式ドキュメント](https://playwright.dev/)
- [Playwright Best Practices](https://playwright.dev/docs/best-practices)
- [Playwright API Reference](https://playwright.dev/docs/api/class-playwright)
- [Playwright Test Runner](https://playwright.dev/docs/test-runners)

## 今後の拡張予定

- [ ] API Mocking（MSW統合）
- [ ] ビジュアルリグレッションテスト
- [ ] パフォーマンステスト（Lighthouse CI）
- [ ] アクセシビリティテスト（axe-core統合）
- [ ] カレンダービューのテスト
- [ ] テーブルビューのテスト
- [ ] ごみ箱機能のテスト
- [ ] データインポート/エクスポートのテスト
