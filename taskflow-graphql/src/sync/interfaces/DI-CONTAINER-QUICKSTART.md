# DI Container - クイックスタートガイド

## 5分で始めるDIコンテナ

### 1. インポート

```typescript
import { DIContainer } from '@/sync/interfaces/di-container';
```

### 2. コンテナの作成

```typescript
const container = new DIContainer();
```

### 3. 依存性の登録

#### Singleton（1つのインスタンスを共有）
```typescript
// Logger - アプリケーション全体で共有
container.registerSingleton('logger', () => Logger.getInstance());

// RateLimiter - 状態を持つサービス
container.registerSingleton('rateLimiter', () => new RateLimiter());
```

#### Transient（毎回新しいインスタンス）
```typescript
// MarkdownParser - ステートレスなサービス
container.registerTransient('parser', () => new MarkdownParser());
```

#### Factory（パラメータ付きで生成）
```typescript
// FileSystem - パスに応じて異なるインスタンス
container.registerFactory<FileSystem, [string]>(
  'fileSystem',
  (basePath: string) => new RealFileSystem(basePath)
);
```

### 4. 依存性の解決

```typescript
// Singleton/Transientの解決
const logger = container.resolve<Logger>('logger');
const parser = container.resolve<MarkdownParser>('parser');

// Factoryの解決（パラメータ付き）
const fs = container.resolveFactory<FileSystem, [string]>(
  'fileSystem',
  '/workspace/tasks'
);
```

### 5. 使用例

```typescript
// ロギング
logger.info('Application started');

// ファイル読み込み
const content = await fs.readFile('task-123.md');

// パース
const taskData = parser.parse(content);
```

## よくあるパターン

### パターン1: 依存関係のある登録

```typescript
// Loggerに依存するサービス
container.registerSingleton('logger', () => Logger.getInstance());

container.registerSingleton(
  'syncService',
  () => {
    const logger = container.resolve<Logger>('logger');
    return new SyncService(logger);
  },
  ['logger'] // 依存関係を明示
);
```

### パターン2: メソッドチェーン

```typescript
const container = new DIContainer()
  .registerSingleton('logger', () => Logger.getInstance())
  .registerSingleton('rateLimiter', () => new RateLimiter())
  .registerFactory('fileSystem', (path: string) => new RealFileSystem(path));
```

### パターン3: テスト用モック

```typescript
// テスト用コンテナ
const testContainer = new DIContainer();

// モックLogger
testContainer.registerInstance('logger', {
  info: vi.fn(),
  error: vi.fn(),
} as any);

// テスト実行
const service = testContainer.resolve('myService');
```

## 統合例（本番環境）

```typescript
import { setupProductionContainer } from '@/sync/interfaces';

// アプリケーション起動時
const container = setupProductionContainer('/workspace/tasks');

// サービスを取得して使用
const syncService = container.resolve('syncService');
await syncService.syncToFile('task-123', 'task-123.md');
```

## 統合例（テスト環境）

```typescript
import { setupTestContainer } from '@/sync/interfaces';

// テストごとにコンテナを作成
describe('MyService', () => {
  let container: DIContainer;

  beforeEach(() => {
    container = setupTestContainer();
  });

  it('should sync task', async () => {
    const service = container.resolve('myService');
    // テスト実行...
  });
});
```

## エラーハンドリング

```typescript
try {
  const service = container.resolve('unknownService');
} catch (error) {
  if (error.name === 'DependencyNotFoundError') {
    console.error(`Service not found: ${error.key}`);
  }
}
```

## 診断

```typescript
// コンテナの状態を確認
const diagnostics = container.diagnose();
console.log(`Registered: ${diagnostics.totalRegistrations}`);
console.log(`Singletons: ${diagnostics.singletons}`);
console.log(`Cached: ${diagnostics.cachedInstances}`);
```

## チートシート

| 操作 | メソッド | 例 |
|------|---------|-----|
| Singleton登録 | `registerSingleton(key, factory)` | `container.registerSingleton('logger', () => Logger.getInstance())` |
| Transient登録 | `registerTransient(key, factory)` | `container.registerTransient('parser', () => new Parser())` |
| Factory登録 | `registerFactory(key, factory)` | `container.registerFactory('fs', (p) => new FS(p))` |
| Instance登録 | `registerInstance(key, instance)` | `container.registerInstance('config', config)` |
| 解決 | `resolve<T>(key)` | `container.resolve<Logger>('logger')` |
| Factory解決 | `resolveFactory<T, Args>(key, ...args)` | `container.resolveFactory('fs', '/path')` |
| 存在確認 | `has(key)` | `container.has('logger')` |
| 削除 | `unregister(key)` | `container.unregister('logger')` |
| クリア | `clear()` | `container.clear()` |
| キー一覧 | `getKeys()` | `container.getKeys()` |
| 診断 | `diagnose()` | `container.diagnose()` |

## ライフタイム選択ガイド

| ライフタイム | 使用場面 | 例 |
|--------------|----------|-----|
| **Singleton** | 状態を共有するサービス | Logger, Config, Database Connection |
| **Transient** | ステートレスなサービス | Parser, Validator, Handler |
| **Factory** | パラメータに応じたインスタンス | FileSystem(path), Connection(url) |

## 次のステップ

1. **詳細ドキュメント**: `DI-CONTAINER-README.md`
2. **使用例**: `di-container.examples.ts`
3. **統合例**: `di-container.integration.ts`
4. **テスト**: `__tests__/di-container.test.ts`

## ヘルプ

問題が発生した場合:
1. `container.diagnose()` で状態を確認
2. `container.has(key)` で登録を確認
3. エラーメッセージを確認（`DependencyNotFoundError`, `CircularDependencyError`等）
4. `DI-CONTAINER-README.md` のトラブルシューティングを参照
