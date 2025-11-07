# TaskFlow パフォーマンス監視システム

## 📊 概要

TaskFlowアプリケーションのパフォーマンスを継続的に監視・改善するための包括的なシステムです。

**技術スタック**: Vite 7.1.12, React 19.2.0, Tailwind CSS 4.1.16

## 🎯 目標指標

### Lighthouse スコア目標
- **Performance**: 90+ (良好)
- **Accessibility**: 100 (完璧)
- **Best Practices**: 100 (完璧)
- **SEO**: 90+ (良好)
- **PWA**: 80+ (良好)

### Core Web Vitals 目標
- **LCP (Largest Contentful Paint)**: 2.5秒以下
- **FID (First Input Delay)**: 100ms以下
- **CLS (Cumulative Layout Shift)**: 0.1以下
- **FCP (First Contentful Paint)**: 1.8秒以下
- **TTFB (Time to First Byte)**: 800ms以下

### バンドルサイズ目標
- **JavaScript**: 500KB以下 (gzip圧縮後)
- **CSS**: 50KB以下 (gzip圧縮後)
- **Total**: 1.5MB以下 (gzip圧縮後)

## 🛠️ セットアップ

### 1. 依存関係インストール

```bash
npm install
```

必要なパッケージ:
- `@lhci/cli`: Lighthouse CI
- `rollup-plugin-visualizer`: Bundle分析
- `web-vitals`: Core Web Vitals測定
- `playwright`: E2Eテスト・Web Vitals測定

### 2. ディレクトリ構造

```
taskflow-app/
├── lighthouserc.js                 # Lighthouse CI設定
├── performance-budget.json         # パフォーマンスバジェット設定
├── scripts/
│   └── measure-web-vitals.js       # Core Web Vitals測定スクリプト
├── performance-reports/            # 生成されたレポート (gitignore)
│   ├── bundle-analysis.html        # Bundle分析レポート
│   ├── web-vitals-report.json      # Web Vitalsレポート (JSON)
│   └── web-vitals-report.html      # Web Vitalsレポート (HTML)
└── lighthouse-reports/             # Lighthouseレポート (gitignore)
    └── *.html                      # 各実行のLighthouseレポート
```

## 📋 使用方法

### 🚀 クイックスタート

```bash
# 1. アプリケーションをビルド
npm run build

# 2. プレビューサーバー起動（別ターミナル）
npm run preview

# 3. Lighthouse監査実行
npm run perf:lighthouse

# 4. Core Web Vitals測定
npm run perf:web-vitals

# 5. Bundle分析
npm run perf:bundle
```

### 📊 各種パフォーマンステストコマンド

#### Lighthouse CI

```bash
# フル自動実行（collect + assert）
npm run perf:lighthouse

# データ収集のみ
npm run perf:lighthouse:collect

# アサーション（基準チェック）のみ
npm run perf:lighthouse:assert

# パフォーマンスバジェットチェック
npm run perf:budget
```

**出力**:
- `lighthouse-reports/`: HTML形式のLighthouseレポート
- `.lighthouseci/`: Lighthouse CIの内部データ

#### Core Web Vitals 測定

```bash
npm run perf:web-vitals
```

**測定内容**:
- LCP (Largest Contentful Paint)
- FCP (First Contentful Paint)
- CLS (Cumulative Layout Shift)
- TTFB (Time to First Byte)
- DOM Content Loaded
- Load Complete

**出力**:
- `performance-reports/web-vitals-report.json`: JSONデータ
- `performance-reports/web-vitals-report.html`: ビジュアルレポート

#### Bundle分析

```bash
npm run perf:bundle
```

**出力**:
- `performance-reports/bundle-analysis.html`: インタラクティブなTreemapビュー
- gzip/brotli圧縮後のサイズ表示

#### 包括的パフォーマンスレポート

```bash
# 全テスト実行
npm run perf:report

# または手動で順次実行
npm run build
npm run preview &  # バックグラウンドで起動
npm run perf:lighthouse
npm run perf:web-vitals
npm run perf:bundle
```

## 🔧 設定ファイル詳細

### lighthouserc.js

Lighthouse CIの設定ファイル。以下を定義:

- **collect**: テスト対象URLと実行回数
- **assert**: パフォーマンスバジェットと基準
- **upload**: レポート保存先

**主要設定**:

```javascript
{
  ci: {
    collect: {
      staticDistDir: './build',  // ビルド済みファイル
      numberOfRuns: 3,           // 3回実行して平均値
    },
    assert: {
      assertions: {
        'categories:performance': ['error', { minScore: 0.9 }],
        'categories:accessibility': ['error', { minScore: 1.0 }],
        'largest-contentful-paint': ['error', { maxNumericValue: 2500 }],
        // ... その他の基準
      }
    }
  }
}
```

### performance-budget.json

パフォーマンスバジェット設定。以下を定義:

- **resourceSizes**: リソースサイズ制限（KB）
- **resourceCounts**: リソース数制限
- **timings**: タイミングメトリクス制限
- **targets**: Lighthouseスコア目標

**主要バジェット**:

```json
{
  "budget": [
    {
      "resourceSizes": [
        { "resourceType": "script", "budget": 500 },
        { "resourceType": "stylesheet", "budget": 50 },
        { "resourceType": "total", "budget": 1500 }
      ],
      "timings": [
        { "metric": "largest-contentful-paint", "budget": 2500 },
        { "metric": "cumulative-layout-shift", "budget": 0.1 }
      ]
    }
  ]
}
```

### vite.config.ts

Viteビルド設定にBundle分析プラグインを追加:

```typescript
import { visualizer } from 'rollup-plugin-visualizer';

export default defineConfig({
  plugins: [
    react(),
    process.env.ANALYZE === 'true'
      ? visualizer({
          open: true,
          filename: './performance-reports/bundle-analysis.html',
          gzipSize: true,
          brotliSize: true,
          template: 'treemap',
        })
      : undefined,
  ].filter(Boolean),
  // ... その他の設定
});
```

**Bundle最適化戦略**:

- **Manual Chunks**: 主要ライブラリを分離
  - `vendor`: React/React DOM
  - `lexical-editor`: Lexicalエディタ
  - `radix-core/radix-form/radix-nav`: Radix UIコンポーネント
  - `date-utils`: date-fns/react-day-picker
  - `icons-lucide`: Lucide React Icons
  - `utilities`: 小型ユーティリティライブラリ

- **Terser最適化**:
  - production時に `console.log`/`console.info` 削除
  - `debugger` 削除

## 📈 レポート解析

### Lighthouse レポート

**確認項目**:

1. **Performance**:
   - FCP, LCP, TBT, CLS, Speed Index
   - リソースサイズと数
   - レンダリングブロッキングリソース

2. **Accessibility**:
   - ARIA属性の適切な使用
   - カラーコントラスト
   - キーボードナビゲーション

3. **Best Practices**:
   - HTTPS使用
   - 画像アスペクト比
   - コンソールエラー

4. **SEO**:
   - meta description
   - viewport設定
   - robots.txt

### Core Web Vitals レポート

**評価基準**:

| メトリクス | 良好 | 改善必要 | 不良 |
|-----------|------|---------|------|
| LCP       | ≤2.5s | ≤4.0s  | >4.0s |
| FID       | ≤100ms | ≤300ms | >300ms |
| CLS       | ≤0.1  | ≤0.25  | >0.25 |
| FCP       | ≤1.8s | ≤3.0s  | >3.0s |
| TTFB      | ≤800ms | ≤1.8s  | >1.8s |

**HTMLレポート内容**:

- 各メトリクスの平均値・最小値・最大値・中央値
- カラーコード（緑=良好、黄=改善必要、赤=不良）
- 推奨基準との比較
- 総合評価

### Bundle分析レポート

**確認項目**:

1. **サイズ分布**:
   - 最大のchunkを特定
   - vendor/app コード比率
   - 未使用コードの検出

2. **最適化機会**:
   - 動的importで遅延ロード可能なモジュール
   - 複数chunkに重複するコード
   - Tree shakingで削減可能なコード

## 🚀 パフォーマンス最適化ガイド

### 1. JavaScript最適化

#### コード分割

```typescript
// ❌ 悪い例：すべて同期ロード
import { HeavyComponent } from './HeavyComponent';

// ✅ 良い例：動的import
const HeavyComponent = React.lazy(() => import('./HeavyComponent'));

function App() {
  return (
    <Suspense fallback={<Loading />}>
      <HeavyComponent />
    </Suspense>
  );
}
```

#### Tree Shaking

```typescript
// ❌ 悪い例：全体import
import _ from 'lodash';

// ✅ 良い例：必要な関数のみimport
import { debounce } from 'lodash-es';
```

#### Memoization

```typescript
// ✅ React.memo でコンポーネントメモ化
const TaskCard = React.memo(({ task }) => {
  return <div>{task.title}</div>;
});

// ✅ useMemo で計算結果メモ化
const sortedTasks = useMemo(() => {
  return tasks.sort((a, b) => a.priority - b.priority);
}, [tasks]);

// ✅ useCallback で関数メモ化
const handleClick = useCallback(() => {
  console.log('clicked');
}, []);
```

### 2. CSS最適化

#### Critical CSS

```html
<!-- インライン化してFCP改善 -->
<style>
  .critical-component { /* ... */ }
</style>
```

#### Tailwind最適化

```javascript
// tailwind.config.js
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  // 未使用クラスを自動削除
};
```

### 3. 画像最適化

```html
<!-- レスポンシブ画像 -->
<img
  srcset="image-320w.jpg 320w,
          image-640w.jpg 640w,
          image-1280w.jpg 1280w"
  sizes="(max-width: 640px) 100vw, 640px"
  src="image-640w.jpg"
  alt="Description"
  loading="lazy"
/>

<!-- 次世代フォーマット -->
<picture>
  <source srcset="image.avif" type="image/avif">
  <source srcset="image.webp" type="image/webp">
  <img src="image.jpg" alt="Description">
</picture>
```

### 4. フォント最適化

```css
/* font-display: swap でFOIT回避 */
@font-face {
  font-family: 'CustomFont';
  src: url('/fonts/custom.woff2') format('woff2');
  font-display: swap;
}

/* サブセット化 */
@font-face {
  font-family: 'CustomFont';
  src: url('/fonts/custom-latin.woff2') format('woff2');
  unicode-range: U+0000-00FF;
}
```

### 5. Service Worker最適化

```javascript
// public/sw.js
// 静的リソースのキャッシュ
const CACHE_NAME = 'taskflow-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/static/js/main.js',
  '/static/css/main.css',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
  );
});
```

## 🔄 CI/CD統合

### GitHub Actions 例

```yaml
name: Performance Monitoring

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  lighthouse:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install dependencies
        run: npm ci

      - name: Build
        run: npm run build

      - name: Run Lighthouse CI
        run: npm run perf:lighthouse

      - name: Upload Lighthouse reports
        uses: actions/upload-artifact@v3
        with:
          name: lighthouse-reports
          path: lighthouse-reports/

  web-vitals:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install dependencies
        run: npm ci

      - name: Build
        run: npm run build

      - name: Start preview server
        run: npm run preview &

      - name: Wait for server
        run: npx wait-on http://localhost:4173

      - name: Measure Web Vitals
        run: npm run perf:web-vitals

      - name: Upload Web Vitals reports
        uses: actions/upload-artifact@v3
        with:
          name: web-vitals-reports
          path: performance-reports/
```

## 📊 継続的改善サイクル

1. **測定**: 定期的にパフォーマンステスト実行
2. **分析**: レポートからボトルネック特定
3. **最適化**: 優先度付けして改善実施
4. **検証**: 最適化効果を測定
5. **監視**: バジェット超過を防止

### 推奨スケジュール

- **日次**: 開発環境でのLighthouse実行
- **週次**: Core Web Vitals測定・Bundle分析
- **リリース前**: 全パフォーマンステスト実行
- **本番環境**: リアルユーザーモニタリング（RUM）

## 🎯 パフォーマンスチェックリスト

### ビルド時

- [ ] Bundle分析でサイズ確認
- [ ] Lighthouse Performance 90+
- [ ] パフォーマンスバジェット遵守
- [ ] 未使用コードの削除
- [ ] 適切なCode Splitting

### デプロイ前

- [ ] Core Web Vitals 全て「良好」
- [ ] Lighthouse Accessibility 100
- [ ] 画像最適化完了
- [ ] Service Worker動作確認
- [ ] HTTPS有効化

### 本番環境

- [ ] リアルユーザーモニタリング設定
- [ ] エラーログ監視
- [ ] パフォーマンス異常アラート設定

## 📚 参考リソース

- [Lighthouse CI Documentation](https://github.com/GoogleChrome/lighthouse-ci)
- [Web Vitals](https://web.dev/vitals/)
- [Vite Performance](https://vitejs.dev/guide/performance.html)
- [React Performance](https://react.dev/learn/render-and-commit)
- [Core Web Vitals Guide](https://web.dev/learn-core-web-vitals/)

## 🐛 トラブルシューティング

### Lighthouse CI実行エラー

**問題**: `ERROR: No Chrome installations found.`

**解決策**:
```bash
# Chromiumをインストール
npx playwright install chromium
```

### Web Vitals測定でデータ取得できない

**問題**: メトリクスが `null` または `N/A`

**解決策**:
1. プレビューサーバーが起動しているか確認
2. URLが正しいか確認（デフォルト: http://localhost:4173）
3. タイムアウト時間を延長（scripts/measure-web-vitals.js）

### Bundle分析レポートが生成されない

**問題**: `ANALYZE=true` でもレポートなし

**解決策**:
```bash
# 環境変数が正しく設定されているか確認
ANALYZE=true npm run build

# または package.json のスクリプト使用
npm run perf:bundle
```

---

**Last Updated**: 2025-11-07
**Version**: 1.0.0
**Maintainer**: TaskFlow Development Team
