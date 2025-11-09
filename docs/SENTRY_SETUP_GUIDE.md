# Sentry セットアップガイド

**最終更新**: 2025-11-09
**対象**: 本番環境エラートラッキング

---

## 📋 概要

TaskFlowでは、Sentryを使用して本番環境のエラートラッキングとパフォーマンス監視を実施しています。

### 実装済み機能

- ✅ **エラートラッキング**: JavaScript例外、React Error Boundary
- ✅ **パフォーマンス監視**: トランザクション・スパントレース
- ✅ **セッションリプレイ**: エラー時のユーザー操作録画
- ✅ **プライバシーフィルタリング**: Cookie、IPアドレスの自動削除
- ✅ **ソースマップアップロード**: 本番ビルド時の自動アップロード

---

## 🚀 セットアップ手順

### Step 1: Sentryアカウント作成

1. [Sentry公式サイト](https://sentry.io/)にアクセス
2. 「Start for free」をクリック
3. アカウント作成（GitHub/Google OAuth推奨）
4. 無料プラン（Developer）を選択
   - 5,000 errors/月
   - 10,000 performance transactions/月

### Step 2: プロジェクト作成

1. Sentryダッシュボードで「Create Project」
2. プラットフォーム: **React**
3. プロジェクト名: `taskflow`
4. チーム: デフォルトチーム
5. 作成完了後、DSNをコピー

### Step 3: 環境変数設定

`.env.production`ファイルを作成（`.env.example`参照）:

```bash
# Sentry DSN（エラートラッキング）
VITE_SENTRY_DSN=https://your-sentry-dsn@o123456.ingest.sentry.io/123456

# Sentry ソースマップアップロード設定（本番ビルド時のみ）
SENTRY_ORG=your-organization-slug
SENTRY_PROJECT=taskflow
SENTRY_AUTH_TOKEN=your-auth-token-here
```

### Step 4: Sentry Auth Token作成

ソースマップアップロード用のAuth Tokenを作成:

1. Sentry Dashboard → Settings → Auth Tokens
2. 「Create New Token」
3. 権限を選択:
   - `project:releases`
   - `project:write`
4. Token名: `taskflow-sourcemaps`
5. トークンをコピーして`.env.production`に設定

### Step 5: デプロイ

Vercelにデプロイする場合:

1. Vercel Dashboard → Settings → Environment Variables
2. 以下の環境変数を追加（Production のみ）:
   - `VITE_SENTRY_DSN`
   - `SENTRY_ORG`
   - `SENTRY_PROJECT`
   - `SENTRY_AUTH_TOKEN`

3. デプロイ実行

---

## 🔧 実装詳細

### Sentry初期化（src/index.tsx）

```typescript
import * as Sentry from '@sentry/react';

// 本番環境のみ初期化
if (import.meta.env.PROD && import.meta.env.VITE_SENTRY_DSN) {
  Sentry.init({
    dsn: import.meta.env.VITE_SENTRY_DSN,
    environment: import.meta.env.MODE,
    integrations: [
      Sentry.browserTracingIntegration(),
      Sentry.replayIntegration({
        maskAllText: true,
        blockAllMedia: true,
      }),
    ],
    tracesSampleRate: 0.1, // 10%のトランザクション
    replaysSessionSampleRate: 0.1, // 10%のセッション
    replaysOnErrorSampleRate: 1.0, // エラー時100%
    beforeSend(event) {
      // プライバシーフィルタリング
      if (event.request?.cookies) {
        delete event.request.cookies;
      }
      if (event.user?.ip_address) {
        event.user.ip_address = null;
      }
      return event;
    },
  });
}
```

### Error Boundary統合

```typescript
<Sentry.ErrorBoundary fallback={<ErrorFallback />}>
  <App />
</Sentry.ErrorBoundary>
```

### ソースマップアップロード（vite.config.ts）

```typescript
import { sentryVitePlugin } from '@sentry/vite-plugin';

export default defineConfig({
  plugins: [
    // 本番ビルド時のみ有効化
    process.env.NODE_ENV === 'production' && process.env.SENTRY_AUTH_TOKEN
      ? sentryVitePlugin({
          org: process.env.SENTRY_ORG,
          project: process.env.SENTRY_PROJECT,
          authToken: process.env.SENTRY_AUTH_TOKEN,
          sourcemaps: {
            assets: './build/**',
          },
          telemetry: false,
        })
      : undefined,
  ].filter(Boolean),
  build: {
    sourcemap: true, // ソースマップ生成必須
  },
});
```

---

## 📊 監視ダッシュボード活用

### エラー監視

1. **Issues** - エラー一覧
   - エラー種別
   - 影響ユーザー数
   - 発生頻度
   - スタックトレース

2. **Performance** - パフォーマンス監視
   - トランザクション時間
   - ページロード時間
   - API呼び出し時間

3. **Replays** - セッションリプレイ
   - エラー発生時のユーザー操作
   - コンソールログ
   - ネットワークリクエスト

### アラート設定

1. Sentry Dashboard → Alerts → Create Alert Rule
2. 条件設定:
   - エラー発生率 > 10件/時
   - 新規エラー検知
   - クリティカルエラー（Error Boundary）
3. 通知先:
   - Email
   - Slack（推奨）

---

## 🔐 プライバシー・セキュリティ

### 個人情報フィルタリング

`beforeSend`フックで以下を自動削除:
- Cookieデータ
- IPアドレス
- ユーザー識別情報

### セッションリプレイの安全性

- `maskAllText: true` - すべてのテキストをマスク
- `blockAllMedia: true` - 画像・動画をブロック
- ユーザー操作のみ記録（機密情報は除外）

### GDPR準拠

- データ保持期間: 90日（Sentryデフォルト）
- ユーザーデータ削除リクエスト対応
- プライバシーポリシー明記

---

## 🧪 テスト方法

### エラートラッキングテスト

開発環境でテスト用エラーを発生させる:

```typescript
// 任意のコンポーネントで実行
throw new Error('Sentry test error - please ignore');
```

### 本番環境での確認

1. 本番環境デプロイ後、Sentryダッシュボードを確認
2. Issues → 最新エラーを確認
3. スタックトレースが正しく表示されているか確認（ソースマップ適用済み）

---

## 💰 コスト管理

### 無料プラン（Developer）

- エラー: 5,000件/月
- パフォーマンス: 10,000トランザクション/月
- チームメンバー: 1名

### コスト最適化

1. **サンプリングレート調整**
   - `tracesSampleRate: 0.1` (10%)
   - `replaysSessionSampleRate: 0.1` (10%)
   - エラー時は100%記録

2. **不要なエラーのフィルタリング**
   ```typescript
   beforeSend(event) {
     // 開発環境のエラーを除外
     if (event.environment === 'development') {
       return null;
     }
     return event;
   }
   ```

---

## 🐛 トラブルシューティング

### ソースマップがアップロードされない

- `SENTRY_AUTH_TOKEN`が正しく設定されているか確認
- Vercelの環境変数を確認（Productionのみに設定）
- ビルドログでSentryプラグインの実行を確認

### エラーが記録されない

- `VITE_SENTRY_DSN`が正しく設定されているか確認
- 本番環境（`import.meta.env.PROD === true`）でのみ動作
- ブラウザのコンソールでSentry初期化を確認

### スタックトレースが難読化されている

- `sourcemap: true`がビルド設定に含まれているか確認
- ソースマップが正しくアップロードされているか確認
- Sentry Dashboard → Settings → Source Maps で確認

---

## 📚 参考リンク

- [Sentry公式ドキュメント](https://docs.sentry.io/)
- [Sentry React SDK](https://docs.sentry.io/platforms/javascript/guides/react/)
- [Sentry Vite Plugin](https://docs.sentry.io/platforms/javascript/guides/react/sourcemaps/uploading/vite/)
- [Sentryダッシュボード](https://sentry.io/)

---

## ✅ セットアップチェックリスト

- [ ] Sentryアカウント作成
- [ ] プロジェクト作成（taskflow）
- [ ] DSN取得
- [ ] Auth Token作成
- [ ] `.env.production`設定
- [ ] Vercel環境変数設定
- [ ] デプロイ実行
- [ ] エラートラッキング動作確認
- [ ] ソースマップアップロード確認
- [ ] アラート設定（Slack推奨）

---

**次のステップ**: [MONITORING_STRATEGY.md](./MONITORING_STRATEGY.md) - 監視戦略全体の確認
