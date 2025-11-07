# TaskFlow PWA機能ドキュメント

## 概要

TaskFlowはProgressive Web App (PWA)として実装されており、ネイティブアプリのような体験を提供します。

## 主要機能

### 1. オフライン対応

- **Service Worker**: アプリケーションの静的リソースをキャッシュし、オフライン時にも使用可能
- **キャッシュ戦略**:
  - 静的リソース: Cache First (高速読み込み)
  - 動的コンテンツ: Network First (最新データ優先)
  - アセット: Cache First with Network Fallback

### 2. インストール機能

- デスクトップやモバイルのホーム画面に追加可能
- スタンドアロンモードでの起動
- アプリショートカット対応（新しいタスク、カンバン、カレンダー）

### 3. 更新通知

- 新しいバージョンが利用可能な時に自動通知
- ワンクリックでアップデート可能
- 更新後の自動リロード

### 4. プッシュ通知基盤

- 将来的な拡張のためのインフラ構築済み
- タスク期限通知などに対応予定

## 技術仕様

### Service Worker

**ファイル**: `/public/sw.js`

**キャッシュバージョン**: v1.0.0

**キャッシュ対象リソース**:
- `/` (ルートページ)
- `/index.html`
- `/offline.html`
- `/manifest.json`
- `/favicon.ico`, `/favicon.svg`
- `/logo192.svg`, `/logo512.svg`

**キャッシュ戦略**:

```javascript
// 静的リソース: Cache First
- '/', '/index.html', '/manifest.json', '/favicon.ico'

// 動的コンテンツ: Network First
- '/api/'

// アセット: Cache First with Network Fallback
- '.png', '.jpg', '.jpeg', '.svg', '.woff', '.woff2', '.ttf'
```

### PWA Manifest

**ファイル**: `/public/manifest.json`

**設定内容**:
- アプリ名: TaskFlow
- 表示モード: standalone
- テーマカラー: #0969da
- 背景色: #f6f8fa
- アイコン: 複数サイズ対応（16x16〜512x512）
- ショートカット: 3種類（新規タスク、カンバン、カレンダー）
- シェアターゲット: 外部からのタスク共有に対応

## コンポーネント構成

### 1. ServiceWorkerUpdateNotification

**ファイル**: `/src/components/ServiceWorkerUpdateNotification.tsx`

**機能**:
- Service Workerの更新通知を表示
- ワンクリックでアップデート実行
- 更新中のローディング状態表示

**使用方法**:
```tsx
<ServiceWorkerUpdateNotification registration={updateRegistration} />
```

### 2. PWAInstallPrompt

**ファイル**: `/src/components/PWAInstallPrompt.tsx`

**機能**:
- アプリインストールプロンプトを表示
- ユーザーの選択を追跡
- 7日間の再表示抑制機能

**使用方法**:
```tsx
<PWAInstallPrompt />
```

### 3. OfflineIndicator

**ファイル**: `/src/components/OfflineIndicator.tsx`

**機能**:
- オンライン/オフライン状態の表示
- オフライン復帰時の通知
- アニメーション付き表示

## カスタムフック

### usePWA

**ファイル**: `/src/hooks/usePWA.ts`

**戻り値**:
```typescript
interface PWAStatus {
  isInstallable: boolean;        // インストール可能か
  isInstalled: boolean;          // インストール済みか
  isStandalone: boolean;         // スタンドアロンモードか
  isServiceWorkerSupported: boolean; // Service Worker対応か
  isServiceWorkerActive: boolean;    // Service Worker有効か
}
```

**使用例**:
```tsx
const { isInstallable, isStandalone } = usePWA();
```

## ユーティリティ関数

### Service Worker管理

**ファイル**: `/src/utils/serviceWorker.ts`

**主要関数**:

```typescript
// Service Worker登録
register(config?: ServiceWorkerConfig): void

// Service Worker登録解除
unregister(): void

// 更新をスキップして即座にアクティベート
skipWaiting(): void

// 特定のURLをキャッシュに追加
cacheUrls(urls: string[]): void

// Service Workerの状態を取得
getServiceWorkerStatus(): Promise<ServiceWorkerStatus>
```

**設定オプション**:
```typescript
interface ServiceWorkerConfig {
  onSuccess?: (registration: ServiceWorkerRegistration) => void;
  onUpdate?: (registration: ServiceWorkerRegistration) => void;
  onOfflineReady?: () => void;
  onError?: (error: Error) => void;
}
```

### 通知管理

**ファイル**: `/src/utils/notifications.ts`

**主要関数**:

```typescript
// 通知権限を取得
getNotificationPermission(): NotificationPermission

// 通知権限をリクエスト
requestNotificationPermission(): Promise<NotificationPermission>

// ローカル通知を表示
showLocalNotification(title: string, options?: NotificationOptions): Promise<void>

// タスク期限通知
notifyTaskDue(taskTitle: string, dueDate: Date): Promise<void>

// タスク完了通知
notifyTaskCompleted(taskTitle: string): Promise<void>

// 通知をすべてクリア
clearAllNotifications(): Promise<void>

// 通知サポート確認
isNotificationSupported(): boolean

// プッシュ通知購読（将来の実装用）
getPushSubscription(): Promise<PushSubscription | null>
subscribeToPushNotifications(): Promise<PushSubscription | null>
unsubscribeFromPushNotifications(): Promise<boolean>
```

## セットアップ

### 開発環境

1. Service Workerは開発環境でも動作します
2. `localhost:3000` でアクセス時に自動登録されます
3. Chrome DevToolsの「Application」タブでService Workerの状態を確認できます

### 本番環境

1. ビルド時に`/public/sw.js`と`/public/offline.html`が自動的にコピーされます
2. デプロイ後、HTTPSまたはlocalhostでのみService Workerが動作します

## テスト方法

### オフライン機能のテスト

1. アプリケーションを開く
2. Chrome DevTools → Network → Offline にチェック
3. ページをリロード
4. オフラインページまたはキャッシュされたコンテンツが表示されることを確認

### インストールのテスト

**デスクトップ（Chrome）**:
1. アプリケーションを開く
2. アドレスバー右端の「インストール」アイコンをクリック
3. またはPWAInstallPromptコンポーネントの表示を確認
4. インストール後、スタンドアロンウィンドウで起動することを確認

**モバイル（iOS Safari）**:
1. Safariでアプリケーションを開く
2. 共有ボタン → 「ホーム画面に追加」
3. アイコンがホーム画面に追加される

**モバイル（Android Chrome）**:
1. Chromeでアプリケーションを開く
2. メニュー → 「ホーム画面に追加」
3. または自動表示されるバナーから「追加」をクリック

### 更新通知のテスト

1. アプリケーションをビルドしてデプロイ
2. `public/sw.js`のCACHE_VERSIONを変更
3. 再度ビルドしてデプロイ
4. ブラウザで開いているアプリに更新通知が表示されることを確認

## パフォーマンス

### Lighthouse スコア目標

- **Performance**: 90以上
- **Accessibility**: 90以上
- **Best Practices**: 90以上
- **SEO**: 90以上
- **PWA**: すべてのチェック項目を満たす

### Core Web Vitals

- **LCP** (Largest Contentful Paint): < 2.5秒
- **FID** (First Input Delay): < 100ms
- **CLS** (Cumulative Layout Shift): < 0.1

## トラブルシューティング

### Service Workerが登録されない

**原因**:
- HTTPSまたはlocalhostではない環境
- ブラウザがService Workerに非対応

**解決策**:
1. HTTPS環境でデプロイ
2. 最新のモダンブラウザを使用

### キャッシュが更新されない

**原因**:
- Service Workerの古いバージョンがアクティブ

**解決策**:
1. Chrome DevTools → Application → Service Workers → Unregister
2. ページをハードリフレッシュ (Ctrl+Shift+R / Cmd+Shift+R)
3. または更新通知が表示されたら「更新」をクリック

### インストールプロンプトが表示されない

**原因**:
- すでにインストール済み
- ユーザーが以前却下した（7日間抑制中）
- PWA要件を満たしていない

**解決策**:
1. Chrome DevTools → Application → Manifest で要件確認
2. localStorage の `pwa-install-dismissed` をクリア
3. PWA要件の確認（マニフェスト、Service Worker、HTTPS）

### オフラインページが表示されない

**原因**:
- Service Workerがオフラインページをキャッシュできていない
- ネットワークエラーが発生している

**解決策**:
1. Chrome DevTools → Application → Cache Storage でオフラインページがキャッシュされているか確認
2. Service Workerを再登録

## セキュリティ考慮事項

### Service Worker

- HTTPS環境でのみ動作（localhost除く）
- スコープ制限（ルートディレクトリ配下のみ）
- キャッシュバージョニングによる古いコンテンツ排除
- XSS対策（Content-Type検証）

### 通知

- 明示的な権限リクエスト
- ユーザーの選択を尊重（却下時の再表示抑制）
- 機密情報を通知に含めない設計

### ストレージ

- LocalStorage使用の最小化
- 機密情報の非保存
- キャッシュストレージの適切な管理

## 将来の拡張計画

### Phase 1 (完了)
- ✅ Service Worker実装
- ✅ オフライン対応
- ✅ インストール機能
- ✅ 更新通知
- ✅ プッシュ通知基盤

### Phase 2 (計画中)
- ⬜ プッシュ通知実装（VAPID設定）
- ⬜ タスク期限リマインダー通知
- ⬜ バックグラウンド同期
- ⬜ 定期的なバックグラウンド同期

### Phase 3 (検討中)
- ⬜ Web Share API統合（既存のShare Target APIと連携）
- ⬜ File System Access API対応
- ⬜ バッジAPI（未読タスク数表示）
- ⬜ Shortcuts API拡張（動的ショートカット）

## 参考資料

- [MDN - Progressive Web Apps](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps)
- [Google Developers - PWA](https://web.dev/progressive-web-apps/)
- [Service Worker API](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
- [Web App Manifest](https://developer.mozilla.org/en-US/docs/Web/Manifest)
- [Notifications API](https://developer.mozilla.org/en-US/docs/Web/API/Notifications_API)
- [Web Share Target API](https://web.dev/web-share-target/)

## まとめ

TaskFlowのPWA実装により、以下の改善が実現されました：

1. **オフライン対応**: ネットワーク接続なしでもアプリケーション使用可能
2. **インストール可能**: デスクトップ・モバイルのホーム画面に追加可能
3. **自動更新**: 新バージョンの自動検出と更新通知
4. **高速起動**: キャッシュにより高速なアプリケーション起動
5. **通知基盤**: 将来的なプッシュ通知実装の準備完了

これにより、TaskFlowはネイティブアプリに匹敵するユーザー体験を提供できるようになりました。
