# FileWatcher

TODO.mdファイルの変更を監視し、リアルタイムで同期イベントを発行するファイルウォッチャー。

## 概要

FileWatcherは、chokidarを使用してファイルシステムの変更を監視し、デバウンス・スロットルによるレート制限を適用して、過剰なイベント発火を防ぎます。

## 主要機能

### 1. ファイル監視
- **変更検出**: ファイルの変更、追加、削除を検出
- **安定性保証**: `awaitWriteFinish`により、書き込み完了後にイベント発火
- **パス検証**: PathValidatorによるセキュリティ検証

### 2. レート制限
- **デバウンス**: 連続する変更の最後のみを処理（デフォルト: 500ms）
- **スロットル**: 一定時間内に1回のみ実行（デフォルト: 2000ms）
- **統計情報**: イベント発火回数、スキップ率を記録

### 3. エラーハンドリング
- **自動リトライ**: エラー発生時に自動的にリトライ（最大3回）
- **エラーイベント**: エラー情報を含むイベントを発行
- **グレースフルシャットダウン**: 停止時に保留中の処理を適切にクリーンアップ

### 4. セキュリティ
- **パストラバーサル対策**: PathValidatorによる厳格な検証
- **ファイルサイズ制限**: 最大ファイルサイズを制限（デフォルト: 5MB）
- **nullバイト攻撃対策**: 不正なパス形式を検出

### 5. パフォーマンス
- **効率的な監視**: ポーリングではなくネイティブのファイルシステムイベントを使用
- **メモリ効率**: イベントバッファリングとレート制限による最適化
- **統計トラッキング**: パフォーマンスメトリクスの収集

## 使用方法

### 基本的な使用例

```typescript
import { FileWatcher } from './file-system/file-watcher';
import type { SyncConfig } from './types';

// 同期設定
const config: SyncConfig = {
  todoPath: '/path/to/TODO.md',
  direction: 'bidirectional',
  strategy: 'last_write_wins',
  conflictResolution: 'prefer_file',
  debounceMs: 500,
  throttleMs: 2000,
  maxFileSizeMB: 5,
  maxTasks: 1000,
  webhooksEnabled: false,
  autoBackup: true,
};

// FileWatcherの作成
const watcher = new FileWatcher({
  filePath: config.todoPath,
  config,
});

// イベントリスナーの登録
watcher.on('change', (event) => {
  console.log('File changed:', event);
  // 同期処理をトリガー
});

watcher.on('add', (event) => {
  console.log('File added:', event);
});

watcher.on('unlink', (event) => {
  console.log('File deleted:', event);
});

watcher.on('error', (event) => {
  console.error('Watcher error:', event.error);
});

// 監視開始
await watcher.start();

// 監視停止
await watcher.stop();
```

### イベント統合

```typescript
// すべてのイベントを統一的に処理
watcher.on('event', (event) => {
  switch (event.type) {
    case 'change':
      console.log('Changed:', event.path);
      break;
    case 'add':
      console.log('Added:', event.path);
      break;
    case 'unlink':
      console.log('Deleted:', event.path);
      break;
    case 'error':
      console.error('Error:', event.error);
      break;
  }
});
```

### 統計情報の取得

```typescript
// 監視統計を取得
const stats = watcher.getStats();
console.log('Total events:', stats.totalEvents);
console.log('Event counts:', stats.eventCounts);
console.log('Error count:', stats.errorCount);
console.log('Current file size:', stats.currentFileSize);

// レート制限統計を取得
const rateLimiterStats = watcher.getRateLimiterStats();
console.log('Rate limiter stats:', rateLimiterStats);
```

### ファイル情報の取得

```typescript
const fileInfo = await watcher.getFileInfo();
console.log('File exists:', fileInfo.exists);
console.log('File size:', fileInfo.size);
console.log('Last modified:', fileInfo.mtime);
console.log('Is readable:', fileInfo.isReadable);
console.log('Is writable:', fileInfo.isWritable);
```

### 保留中のイベントをフラッシュ

```typescript
// デバウンス・スロットルで保留中のイベントを即座に実行
watcher.flush();
```

### クリーンアップ

```typescript
// リソースを完全にクリーンアップ
await watcher.dispose();
```

## イベントタイプ

### FileWatcherEvent

```typescript
interface FileWatcherEvent {
  /** イベントタイプ */
  type: 'change' | 'add' | 'unlink' | 'error';

  /** ファイルパス */
  path: string;

  /** タイムスタンプ */
  timestamp: Date;

  /** ファイル統計情報 */
  stats?: {
    size: number;
    mtime: Date;
  };

  /** エラー情報（エラーイベントの場合） */
  error?: Error;
}
```

### イベント詳細

- **change**: ファイル内容が変更された
- **add**: 新しいファイルが作成された
- **unlink**: ファイルが削除された
- **error**: エラーが発生した

## 設定オプション

### FileWatcherOptions

```typescript
interface FileWatcherOptions {
  /** 監視対象ファイルパス */
  filePath: string;

  /** 同期設定 */
  config: SyncConfig;

  /** デバウンス時間（ミリ秒） */
  debounceMs?: number; // デフォルト: 500

  /** スロットル時間（ミリ秒） */
  throttleMs?: number; // デフォルト: 2000

  /** 最大ファイルサイズ（MB） */
  maxFileSizeMB?: number; // デフォルト: 5

  /** リトライ回数 */
  maxRetries?: number; // デフォルト: 3

  /** リトライ間隔（ミリ秒） */
  retryDelayMs?: number; // デフォルト: 1000

  /** 無視するイベントパターン */
  ignorePatterns?: string[]; // デフォルト: []
}
```

## レート制限の仕組み

### デバウンス（Debounce）

連続する変更の最後のみを処理します。

```
ファイル変更: ----*--*--*--------*--*----------
                  ↓  ↓  ↓        ↓  ↓
デバウンス:   --------------○-----------○------
              (500ms待機後に実行)
```

### スロットル（Throttle）

一定時間内に1回のみ実行します。

```
ファイル変更: ----*--*--*--*--*--*--*--*------
                  ↓        ↓        ↓
スロットル:   ----○--------○--------○----------
              (2000msごとに実行)
```

### 組み合わせ（Debounce + Throttle）

デバウンスで連続変更を抑制しつつ、スロットルで最大待機時間を保証します。

```
ファイル変更: ----*--*--*--------*--*--*--*----
                  ↓  ↓  ↓        ↓  ↓  ↓  ↓
レート制限:   --------------○-----------○------
              (500msデバウンス + 2000ms最大待機)
```

## エラーハンドリング

### 自動リトライ

エラー発生時に自動的にリトライを実行します。

```typescript
// エラー発生
watcher.on('error', (event) => {
  console.error('Error occurred:', event.error);
  // 自動的にリトライが実行される（最大3回）
});

// リトライ情報は統計に記録される
const stats = watcher.getStats();
console.log('Retry count:', stats.retryCount);
```

### エラーの種類

1. **パス検証エラー**: 不正なファイルパス
2. **ファイルサイズエラー**: ファイルサイズ制限超過
3. **ファイルシステムエラー**: ファイル読み取り/書き込みエラー
4. **chokidarエラー**: ウォッチャーの内部エラー

## セキュリティ考慮事項

### パストラバーサル対策

```typescript
// 不正なパスは検証でブロックされる
const watcher = new FileWatcher({
  filePath: '../../etc/passwd', // エラー: Path traversal detected
  config,
});
```

### ファイルサイズ制限

```typescript
// 大きすぎるファイルは拒否される
const watcher = new FileWatcher({
  filePath: 'large-file.md',
  config,
  maxFileSizeMB: 1, // 1MB制限
});

// ファイルサイズ超過時にエラーイベントが発火
watcher.on('error', (event) => {
  if (event.error?.message.includes('exceeds')) {
    console.error('File too large!');
  }
});
```

### nullバイト攻撃対策

```typescript
// nullバイトを含むパスは検証でブロックされる
const watcher = new FileWatcher({
  filePath: 'TODO.md\0.txt', // エラー: null byte detected
  config,
});
```

## パフォーマンス最適化

### イベントバッファリング

chokidarの`awaitWriteFinish`により、書き込み完了を待機してからイベントを発火します。

```typescript
awaitWriteFinish: {
  stabilityThreshold: 200, // 200ms間変更がなければ完了
  pollInterval: 100,        // 100msごとにチェック
}
```

### 統計情報によるモニタリング

```typescript
// 定期的に統計を確認
setInterval(() => {
  const stats = watcher.getStats();
  const rateLimiterStats = watcher.getRateLimiterStats();

  console.log('Watcher stats:', stats);
  console.log('Rate limiter stats:', rateLimiterStats);

  // スキップ率が高い場合は警告
  for (const [name, stat] of rateLimiterStats) {
    if (stat.skipRate > 80) {
      console.warn(`High skip rate (${stat.skipRate}%) for ${name}`);
    }
  }
}, 60000); // 1分ごと
```

## トラブルシューティング

### ファイルが監視されない

```typescript
// ファイルの存在確認
const fileInfo = await watcher.getFileInfo();
if (!fileInfo.exists) {
  console.error('File does not exist:', watcher.getFilePath());
}
```

### イベントが発火しない

```typescript
// 監視中かどうか確認
if (!watcher.isWatching()) {
  console.error('Watcher is not running');
  await watcher.start();
}

// 保留中のイベントをフラッシュ
watcher.flush();
```

### エラーが多発する

```typescript
const stats = watcher.getStats();
if (stats.errorCount > 10) {
  console.error('Too many errors, stopping watcher');
  await watcher.stop();

  // ログを確認
  // エラー原因を特定
  // 再起動
  await watcher.start();
}
```

## ベストプラクティス

### 1. 適切なリスナー管理

```typescript
// リスナーの登録
watcher.on('change', handleChange);

// 不要になったらリスナーを削除
watcher.off('change', handleChange);

// または全リスナーを削除
watcher.removeAllListeners();
```

### 2. グレースフルシャットダウン

```typescript
// プロセス終了時にクリーンアップ
process.on('SIGINT', async () => {
  console.log('Shutting down...');
  await watcher.dispose();
  process.exit(0);
});
```

### 3. エラーログの記録

```typescript
watcher.on('error', (event) => {
  // 構造化ログで記録
  logger.error({
    err: event.error,
    path: event.path,
    timestamp: event.timestamp,
  }, 'File watcher error');
});
```

### 4. 統計情報のリセット

```typescript
// 定期的に統計をリセットして、メモリ使用量を抑制
setInterval(() => {
  watcher.resetStats();
}, 86400000); // 24時間ごと
```

## テスト

### ユニットテスト

```typescript
import { FileWatcher } from './file-watcher';

describe('FileWatcher', () => {
  it('should emit change event when file is modified', async () => {
    const watcher = new FileWatcher({ filePath: 'test.md', config });

    const changePromise = new Promise((resolve) => {
      watcher.once('change', resolve);
    });

    await watcher.start();

    // ファイルを変更
    await fs.writeFile('test.md', 'new content');

    const event = await changePromise;
    expect(event.type).toBe('change');

    await watcher.dispose();
  });
});
```

## 統合例

### SyncEngineとの統合

```typescript
import { FileWatcher } from './file-system/file-watcher';
import { SyncEngine } from './sync-engine';

class TodoSyncService {
  private watcher: FileWatcher;
  private syncEngine: SyncEngine;

  constructor(config: SyncConfig) {
    this.watcher = new FileWatcher({
      filePath: config.todoPath,
      config,
    });

    this.syncEngine = new SyncEngine(config);

    // ファイル変更時に同期を実行
    this.watcher.on('change', async (event) => {
      await this.syncEngine.syncFromFile();
    });
  }

  async start(): Promise<void> {
    await this.watcher.start();
    await this.syncEngine.initialize();
  }

  async stop(): Promise<void> {
    await this.watcher.dispose();
  }
}
```

## 関連ドキュメント

- [PathValidator](../security/PATH_VALIDATOR.md) - パス検証とセキュリティ
- [RateLimiter](../performance/RATE_LIMITER.md) - レート制限の詳細
- [Logger](../utils/LOGGER.md) - ロギング機能
- [SyncEngine](../SYNC_ENGINE.md) - 同期エンジン

## ライセンス

MIT
