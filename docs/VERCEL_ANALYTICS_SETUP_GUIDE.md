# Vercel Analytics セットアップガイド

**最終更新**: 2025-11-09
**対象**: Core Web Vitals測定・リアルユーザーモニタリング

---

## 📋 概要

TaskFlowでは、Vercel AnalyticsとSpeed Insightsを使用して、リアルユーザーのパフォーマンスデータを収集しています。

### 実装済み機能

- ✅ **Analytics**: ページビュー、ユーザー行動追跡
- ✅ **Speed Insights**: Core Web Vitals（LCP, FID, CLS）測定
- ✅ **自動統合**: Vercelデプロイ時に自動有効化
- ✅ **完全無料**: Hobby/Pro両プラン対応

---

## 🚀 実装内容

### パッケージインストール済み

```bash
npm install --save @vercel/analytics @vercel/speed-insights
```

### コード統合（src/index.tsx）

```typescript
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/react';

root.render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
      <Analytics />
      <SpeedInsights />
    </BrowserRouter>
  </React.StrictMode>
);
```

---

## ⚙️ Vercelダッシュボード設定

### Step 1: Analytics有効化

1. [Vercel Dashboard](https://vercel.com/)にログイン
2. プロジェクト選択（taskflow-app）
3. **Analytics**タブをクリック
4. 「Enable Analytics」をクリック

### Step 2: Speed Insights有効化

1. 同じプロジェクトページで**Speed Insights**タブをクリック
2. 「Enable Speed Insights」をクリック

### Step 3: デプロイ

1. 最新のコードをVercelにデプロイ
2. デプロイ完了後、ダッシュボードでデータ収集開始を確認

---

## 📊 測定されるメトリクス

### Analytics（ページビュー・イベント）

| メトリクス | 説明 |
|-----------|------|
| **Page Views** | ページごとの訪問数 |
| **Unique Visitors** | ユニークユーザー数 |
| **Top Pages** | 人気ページランキング |
| **Top Referrers** | 流入元（検索エンジン、SNS等）|
| **Devices** | デバイス種別（Desktop, Mobile, Tablet）|

### Speed Insights（Core Web Vitals）

| メトリクス | 説明 | 目標値 |
|-----------|------|--------|
| **LCP** (Largest Contentful Paint) | 最大コンテンツ描画時間 | <2.5秒 |
| **FID** (First Input Delay) | 初回入力遅延 | <100ms |
| **CLS** (Cumulative Layout Shift) | 累積レイアウトシフト | <0.1 |
| **TTFB** (Time to First Byte) | 最初のバイト到達時間 | <600ms |
| **FCP** (First Contentful Paint) | 初回コンテンツ描画時間 | <1.8秒 |

---

## 📈 ダッシュボード活用方法

### Analyticsダッシュボード

1. **Overview** - 全体概要
   - 訪問数トレンド
   - ユニークユーザー数
   - デバイス内訳

2. **Top Pages** - ページ分析
   - 最も人気のページ
   - 滞在時間
   - 離脱率

3. **Referrers** - 流入元分析
   - 検索エンジン（Google, Bing等）
   - SNS（Twitter, Facebook等）
   - ダイレクトアクセス

### Speed Insightsダッシュボード

1. **Core Web Vitals Summary**
   - LCP, FID, CLSの総合スコア
   - 良好・改善が必要・不良の割合

2. **Page Performance**
   - ページ別パフォーマンス
   - デバイス別スコア
   - 地域別スコア

3. **Real User Monitoring**
   - 実際のユーザー環境でのパフォーマンス
   - フィールドデータ（実データ）
   - 時系列トレンド

---

## 🔧 高度な設定

### カスタムイベント送信

Analyticsでカスタムイベントを送信する場合:

```typescript
import { track } from '@vercel/analytics';

// タスク作成イベント
track('task_created', {
  task_type: 'kanban',
  priority: 'high',
});

// ボード作成イベント
track('board_created', {
  board_type: 'personal',
});
```

### デバッグモード

開発環境でデータ送信を確認:

```typescript
import { Analytics } from '@vercel/analytics/react';

<Analytics debug={true} />
```

---

## 🎯 パフォーマンス目標

### Core Web Vitals目標値

| メトリクス | 現在値（推定） | 目標値 | 優先度 |
|-----------|--------------|--------|--------|
| **LCP** | 2.0秒 | <2.5秒 | 🟢 達成 |
| **FID** | 50ms | <100ms | 🟢 達成 |
| **CLS** | 0.05 | <0.1 | 🟢 達成 |
| **TTFB** | 400ms | <600ms | 🟢 達成 |

### 改善アクション

1. **LCPが遅い場合**（>2.5秒）
   - 画像最適化（WebP, AVIF）
   - フォントプリロード
   - Critical CSS抽出

2. **FIDが遅い場合**（>100ms）
   - JavaScriptバンドルサイズ削減
   - Code Splitting強化
   - 非同期処理最適化

3. **CLSが高い場合**（>0.1）
   - 画像・動画の明示的なサイズ指定
   - フォント読み込み最適化
   - 動的コンテンツの事前確保

---

## 💰 料金プラン

### Hobby（無料）

- Analytics: 100,000イベント/月
- Speed Insights: 無制限
- データ保持: 30日間

### Pro（$20/月）

- Analytics: 1,000,000イベント/月
- Speed Insights: 無制限
- データ保持: 90日間
- カスタムイベント送信

---

## 🔐 プライバシー・GDPR準拠

### データ収集

- ✅ **個人識別情報なし**: IPアドレス匿名化
- ✅ **Cookieレス**: サードパーティCookie不使用
- ✅ **GDPR準拠**: EU一般データ保護規則準拠
- ✅ **オプトアウト可能**: ユーザーが追跡拒否可能

### プライバシーポリシー

プライバシーポリシーに以下を明記:

```markdown
## アクセス解析ツール

当サイトでは、アクセス解析ツール「Vercel Analytics」を使用しています。
このツールは個人を特定する情報を収集せず、匿名化されたデータのみを取得します。
詳細は[Vercelプライバシーポリシー](https://vercel.com/legal/privacy-policy)をご確認ください。
```

---

## 🐛 トラブルシューティング

### データが表示されない

1. **Vercelダッシュボードで有効化確認**
   - Analytics/Speed Insightsが有効化されているか確認

2. **デプロイ確認**
   - 最新のコードがデプロイされているか確認
   - `@vercel/analytics`, `@vercel/speed-insights`がインストールされているか確認

3. **本番環境確認**
   - データは本番環境（Vercelデプロイ）でのみ収集
   - ローカル開発環境では収集されない（`debug={true}`除く）

### Core Web Vitalsスコアが低い

1. **Lighthouseで詳細分析**
   ```bash
   npm run lighthouse
   ```

2. **パフォーマンスレポート確認**
   - `docs/PERFORMANCE_REPORT.md`参照
   - バンドルサイズ最適化の推奨事項確認

---

## 📚 参考リンク

- [Vercel Analytics公式ドキュメント](https://vercel.com/docs/analytics)
- [Vercel Speed Insights公式ドキュメント](https://vercel.com/docs/speed-insights)
- [Web Vitals](https://web.dev/vitals/)
- [Core Web Vitals測定ガイド](https://web.dev/measure/)

---

## ✅ セットアップチェックリスト

### コード実装（完了済み）

- [x] `@vercel/analytics`インストール
- [x] `@vercel/speed-insights`インストール
- [x] `<Analytics />`コンポーネント追加
- [x] `<SpeedInsights />`コンポーネント追加
- [x] 型チェック・ビルド確認

### Vercelダッシュボード設定（要実施）

- [ ] Analyticsタブで「Enable Analytics」
- [ ] Speed Insightsタブで「Enable Speed Insights」
- [ ] 最新コードをVercelにデプロイ
- [ ] データ収集開始を確認（24時間以内）

---

## 🎯 期待効果

### データ収集開始後

- ✅ **リアルユーザーデータ**: 実際のユーザー環境でのパフォーマンス測定
- ✅ **継続的改善**: Core Web Vitalsトレンド分析
- ✅ **ボトルネック特定**: 遅いページ・デバイスの特定
- ✅ **データ駆動意思決定**: 実データに基づく最適化

### 1週間後の推奨アクション

1. Speed Insightsダッシュボード確認
2. Core Web Vitals目標達成確認
3. 改善が必要なページ特定
4. 最適化計画立案（`docs/PERFORMANCE_REPORT.md`参照）

---

**次のステップ**: Vercelダッシュボードで設定を完了し、デプロイして本番環境でのデータ収集を開始
