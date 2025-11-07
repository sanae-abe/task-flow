# TaskFlow パフォーマンス最適化ガイド

**最終更新**: 2025-11-07
**バージョン**: 1.0.0
**対象**: TaskFlow v1.0.0 (React 19.2.0 + Vite 7.1.12 + Tailwind CSS 4.1.16)

---

## 📊 現在のパフォーマンス状況

### ビルドサイズ（gzip圧縮後）

| リソース | サイズ（圧縮後） | 目標 | ステータス |
|---------|------------------|------|------------|
| **JavaScript合計** | ~493 KB | 350 KB | ⚠️ 改善推奨 |
| - React 19 | 119 KB | - | ✅ 最新版 |
| - React DOM | 58 KB | - | ✅ 最新版 |
| - Lexical Editor | 58 KB | - | ✅ 分離済み |
| - その他チャンク | 258 KB | - | ⚠️ 要確認 |
| **CSS** | 14 KB | 80 KB | ✅ 良好 |
| **Total** | ~507 KB | 800 KB | ✅ 目標内 |

### チャンク分割戦略

現在の実装状況（vite.config.ts）:

```typescript
manualChunks: {
  'react': ['react', 'react-dom'],           // 177KB (gzip)
  'lexical-editor': ['@lexical/*', 'lexical'], // 58KB (gzip)
  'radix-core': ['@radix-ui/react-dialog', ...], // 分離済み
  'i18n': ['i18next', 'react-i18next'],       // 分離済み
  'utilities': ['uuid', 'dompurify', ...],    // 27KB (gzip)
  'app-*': [各機能別チャンク]                 // 機能別分離
}
```

**評価**: ✅ 適切なチャンク分割が実装済み

---

## 🎯 最適化提案（優先度順）

### 🔴 高優先度（即実施推奨）

#### 1. React Lazy Loadingの導入

**現状**: すべてのコンポーネントが初期ロードに含まれる
**影響**: 初期バンドルサイズ増加（~500KB）

**実装例**:

```tsx
// src/App.tsx
import { lazy, Suspense } from 'react';

// 遅延ロード対象コンポーネント
const TableView = lazy(() => import('./components/TableView/TableView'));
const CalendarView = lazy(() => import('./components/CalendarView'));
const TemplateManagementPanel = lazy(() =>
  import('./components/TemplateManagement/TemplateManagementPanel')
);
const RecycleBinView = lazy(() =>
  import('./components/RecycleBin/RecycleBinView')
);
const SettingsDialog = lazy(() =>
  import('./components/SettingsDialog')
);

// ローディングフォールバック
const LoadingFallback = () => (
  <div className="flex items-center justify-center h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500" />
  </div>
);

// 使用例
function App() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <Routes>
        <Route path="/table" element={<TableView />} />
        <Route path="/calendar" element={<CalendarView />} />
        {/* ... */}
      </Routes>
    </Suspense>
  );
}
```

**期待効果**: 初期バンドルサイズ30-40%削減（~150KB削減）

---

#### 2. 画像最適化（SVG最適化）

**現状**: lucide-react使用（SVGアイコン）
**改善**: 未使用アイコンのTree-shaking確認

**実装例**:

```tsx
// ❌ 悪い例：すべてのアイコンをインポート
import * as Icons from 'lucide-react';

// ✅ 良い例：必要なアイコンのみインポート
import { Calendar, Settings, Trash2, Plus } from 'lucide-react';
```

**期待効果**: アイコンバンドルサイズ10-20KB削減

---

#### 3. Service Workerキャッシュ戦略強化

**現状**: PWA実装済み（public/sw.js）
**改善**: より積極的なキャッシュ戦略

**実装例** (public/sw.js):

```javascript
const CACHE_NAME = 'taskflow-v1.0.0';
const RUNTIME_CACHE = 'taskflow-runtime-v1.0.0';

// キャッシュ対象リソース（より積極的）
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/offline.html',
  // 主要チャンクを事前キャッシュ
  '/assets/js/react-*.js',
  '/assets/js/vendor-*.js',
  '/assets/js/index-*.js',
  '/assets/index-*.css',
];

// Stale-While-Revalidate戦略
self.addEventListener('fetch', (event) => {
  if (event.request.url.includes('/assets/')) {
    event.respondWith(
      caches.open(RUNTIME_CACHE).then((cache) => {
        return cache.match(event.request).then((response) => {
          const fetchPromise = fetch(event.request).then((networkResponse) => {
            cache.put(event.request, networkResponse.clone());
            return networkResponse;
          });
          return response || fetchPromise;
        });
      })
    );
  }
});
```

**期待効果**: リピート訪問時のロード時間80%削減

---

### 🟡 中優先度（3ヶ月以内実施）

#### 4. Prism.jsの条件付きロード

**現状**: コードブロック機能のためPrism.js常時ロード（61KB gzip前 → 19KB gzip後）
**改善**: コードブロック使用時のみロード

**実装例**:

```tsx
// src/components/RichTextEditor/plugins/CodeHighlightPlugin.tsx
const PrismLanguages = lazy(() => import('prismjs'));

// コードブロック挿入時にのみロード
const insertCodeBlock = async () => {
  const Prism = await import('prismjs');
  // コードハイライト処理
};
```

**期待効果**: 初期バンドルサイズ19KB削減（コードブロック未使用時）

---

#### 5. date-fnsのTree-shaking強化

**現状**: date-fns使用（56KB gzip前 → 15KB gzip後）
**改善**: 必要な関数のみインポート

**実装例**:

```tsx
// ❌ 悪い例
import * as dateFns from 'date-fns';

// ✅ 良い例
import { format, addDays, isBefore } from 'date-fns';
import { ja } from 'date-fns/locale';
```

**期待効果**: date-utilsチャンク5-10KB削減

---

#### 6. Tailwind CSS未使用クラス削除

**現状**: Tailwind CSS PurgeCSS有効化済み（14KB gzip）
**改善**: 未使用ユーティリティクラスの確認

**検証方法**:

```bash
# 未使用CSSの検出
npm install -D purgecss
npx purgecss --css build/assets/*.css --content build/**/*.html build/**/*.js
```

**期待効果**: CSS 2-5KB削減

---

### 🟢 低優先度（6ヶ月以内検討）

#### 7. React 19の並行レンダリング活用

**実装例**:

```tsx
import { useTransition } from 'react';

function TaskList() {
  const [isPending, startTransition] = useTransition();

  const handleFilterChange = (filter) => {
    startTransition(() => {
      setFilter(filter); // 低優先度更新
    });
  };

  return (
    <div>
      {isPending && <LoadingSpinner />}
      <TaskTable />
    </div>
  );
}
```

**期待効果**: UI応答性30%向上

---

#### 8. WebP/AVIF画像形式採用

**現状**: SVGアイコンのみ（画像ファイルほぼなし）
**改善**: 将来的な画像追加時にWebP/AVIF優先

**実装例**:

```html
<picture>
  <source srcset="image.avif" type="image/avif">
  <source srcset="image.webp" type="image/webp">
  <img src="image.png" alt="Fallback">
</picture>
```

**期待効果**: 画像サイズ50-70%削減（画像追加時）

---

#### 9. IndexedDB活用（大規模データ対応）

**現状**: localStorage使用（容量制限5-10MB）
**改善**: 大規模データ向けIndexedDB移行

**実装例**:

```typescript
// src/utils/storage.ts
import { openDB } from 'idb';

const dbPromise = openDB('taskflow-db', 1, {
  upgrade(db) {
    db.createObjectStore('tasks', { keyPath: 'id' });
    db.createObjectStore('boards', { keyPath: 'id' });
  },
});

export async function saveTask(task: Task) {
  const db = await dbPromise;
  await db.put('tasks', task);
}
```

**期待効果**: データ容量上限解放（理論上無制限）

---

## 📈 パフォーマンス測定方法

### 1. Lighthouse測定（本番環境）

**推奨**: Vercelデプロイ環境で測定

```bash
# 本番環境URL指定
npm run perf:lighthouse -- --url=https://tflow-app.vercel.app
```

**代替**: Chrome DevToolsで手動測定

1. https://tflow-app.vercel.app を開く
2. Chrome DevTools > Lighthouse タブ
3. "Generate report" クリック

**目標スコア**:
- Performance: **85+** ⚡
- Accessibility: **95+** ♿
- Best Practices: **90+** ✅
- SEO: **90+** 🔍

---

### 2. Core Web Vitals測定

**ローカル測定** (要プレビューサーバー起動):

```bash
npm run build
npm run preview  # 別ターミナル
npm run perf:web-vitals
```

**本番環境測定**:
- Google Search Console > Core Web Vitals
- https://pagespeed.web.dev/ で直接測定

**目標値**:
- LCP: **< 2.5秒** 🎯
- FID/INP: **< 100ms** ⚡
- CLS: **< 0.1** 📐

---

### 3. Bundle分析

```bash
npm run perf:bundle
# または
ANALYZE=true npm run build
```

レポート: `performance-reports/bundle-analysis.html`

**確認ポイント**:
- 300KB超のチャンク特定
- 重複依存関係検出
- Tree-shaking対象確認

---

## 🔄 継続的監視戦略

### CI/CD統合

**GitHub Actions例** (.github/workflows/performance.yml):

```yaml
name: Performance Monitoring

on:
  pull_request:
    branches: [main]
  schedule:
    - cron: '0 0 * * 0'  # 毎週日曜日

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

      - name: Build application
        run: npm run build

      - name: Run Lighthouse CI
        run: npm run perf:lighthouse
        env:
          LHCI_GITHUB_APP_TOKEN: ${{ secrets.LHCI_GITHUB_APP_TOKEN }}

      - name: Upload Lighthouse reports
        uses: actions/upload-artifact@v3
        with:
          name: lighthouse-reports
          path: performance-reports/lighthouse-reports/
```

---

### パフォーマンスバジェット監視

**設定ファイル**: `performance-budget.json`

**自動チェック**:

```bash
npm run perf:budget
```

**バジェット超過時の対応**:
1. Bundle分析で原因特定
2. Lazy Loading適用
3. 不要な依存関係削除
4. チャンク分割見直し

---

## 📊 ベンチマーク比較

### 現在 vs 最適化後（予測）

| メトリクス | 現在 | 最適化後 | 改善率 |
|-----------|------|----------|--------|
| **初期バンドルサイズ** | ~500 KB | ~350 KB | **30%削減** |
| **JavaScript** | 493 KB | 340 KB | **31%削減** |
| **CSS** | 14 KB | 10 KB | **29%削減** |
| **LCP** | 推定2.0s | 推定1.5s | **25%改善** |
| **FCP** | 推定1.2s | 推定0.8s | **33%改善** |
| **リピート訪問** | 推定1.5s | 推定0.3s | **80%改善** |

---

## ✅ 実装チェックリスト

### Phase 1: 即座実施（1週間以内）

- [ ] React Lazy Loading導入（TableView, CalendarView等）
- [ ] lucide-reactの個別インポート確認
- [ ] Service Workerキャッシュ戦略強化
- [ ] Bundle分析レポート確認・改善箇所特定

### Phase 2: 短期実施（1ヶ月以内）

- [ ] Prism.js条件付きロード実装
- [ ] date-fns Tree-shaking強化
- [ ] Tailwind CSS未使用クラス削除
- [ ] Lighthouseスコア測定（本番環境）

### Phase 3: 中期実施（3ヶ月以内）

- [ ] React 19並行レンダリング活用
- [ ] コンポーネントメモ化最適化（React.memo）
- [ ] useMemo/useCallback適切配置
- [ ] GitHub Actions CI/CD統合

### Phase 4: 長期検討（6ヶ月以内）

- [ ] IndexedDB移行検討（大規模データ対応）
- [ ] WebP/AVIF画像対応（画像追加時）
- [ ] HTTP/3対応確認（Vercel標準対応済み）
- [ ] Edge Computing活用検討

---

## 🔧 トラブルシューティング

### Lighthouseローカル測定エラー対処

**エラー**: "NO_FCP" (First Contentful Paint検出失敗)

**原因**: 静的サーバー起動設定の問題

**解決策**:

1. **本番環境で測定（推奨）**:
   ```bash
   # Chrome DevToolsで直接測定
   # https://tflow-app.vercel.app
   ```

2. **プレビューサーバー使用**:
   ```bash
   npm run build
   npm run preview  # http://localhost:4173
   # 別ターミナルでLighthouse実行
   lighthouse http://localhost:4173 --view
   ```

3. **Playwright使用（scripts/lighthouse-production.js）**:
   ```bash
   node scripts/lighthouse-production.js
   ```

---

### Bundle分析が表示されない

**解決策**:

```bash
# 環境変数明示的設定
ANALYZE=true npm run build

# レポート確認
open performance-reports/bundle-analysis.html
```

---

## 📚 参考資料

### 公式ドキュメント

- [Web Vitals](https://web.dev/vitals/)
- [Lighthouse CI](https://github.com/GoogleChrome/lighthouse-ci)
- [Vite Performance](https://vitejs.dev/guide/performance.html)
- [React 19 Performance](https://react.dev/blog/2024/04/25/react-19)

### ツール・サービス

- [PageSpeed Insights](https://pagespeed.web.dev/)
- [WebPageTest](https://www.webpagetest.org/)
- [Bundlephobia](https://bundlephobia.com/)
- [Can I Use](https://caniuse.com/)

---

## 📝 まとめ

### 現在のパフォーマンス状況

✅ **良好な点**:
- 適切なチャンク分割実装済み
- CSS最適化（Tailwind PurgeCSS有効）
- PWA実装済み（Service Worker）
- 最新技術スタック（React 19, Vite 7）

⚠️ **改善推奨**:
- React Lazy Loading未実装
- 初期バンドルサイズやや大きい（~500KB）
- Lighthouseローカル測定環境整備

### 次のアクション

1. **今週中**: React Lazy Loading実装開始
2. **今月中**: Bundle分析→改善実施
3. **3ヶ月**: Lighthouse 85+スコア達成
4. **6ヶ月**: IndexedDB移行検討

---

**作成者**: Performance Engineer Team
**レビュー**: 2025-11-07
**次回レビュー**: 2026-02-07 (3ヶ月後)
