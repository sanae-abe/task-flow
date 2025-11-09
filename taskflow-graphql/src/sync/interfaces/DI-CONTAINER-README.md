# Dependency Injection Container

TypeScript実装の型安全なDependency Injection（DI）コンテナ。

## 特徴

- **型安全性**: TypeScriptのジェネリックを活用した完全な型推論
- **3つのライフタイム**: Singleton、Transient、Factory
- **循環依存の検出**: 依存関係のサイクルを自動検出
- **階層的なDI**: 親子コンテナのサポート
- **診断機能**: コンテナの状態を詳細に確認
- **軽量**: 外部依存なし、300行程度のシンプルな実装

## インストール

```typescript
import { DIContainer, globalContainer } from './di-container';
```

## 基本的な使用方法

### 1. Singleton（シングルトン）

コンテナ内で1つのインスタンスのみが作成され、再利用されます。

```typescript
const container = new DIContainer();

// 登録
container.registerSingleton('logger', () => Logger.getInstance());

// 解決（同じインスタンスが返される）
const logger1 = container.resolve<Logger>('logger');
const logger2 = container.resolve<Logger>('logger');

console.log(logger1 === logger2); // true
```

### 2. Transient（トランジェント）

解決のたびに新しいインスタンスが作成されます。

```typescript
// 登録
container.registerTransient('rateLimiter', () => new RateLimiter());

// 解決（異なるインスタンスが返される）
const limiter1 = container.resolve<RateLimiter>('rateLimiter');
const limiter2 = container.resolve<RateLimiter>('rateLimiter');

console.log(limiter1 === limiter2); // false
```

### 3. Factory（ファクトリー）

パラメータを受け取って新しいインスタンスを生成します。

```typescript
// 登録
container.registerFactory<FileSystem, [string]>(
  'fileSystem',
  (basePath: string) => new RealFileSystem(basePath)
);

// 解決（パラメータ付き）
const fs1 = container.resolveFactory<FileSystem, [string]>(
  'fileSystem',
  '/path/to/workspace'
);
const fs2 = container.resolveFactory<FileSystem, [string]>(
  'fileSystem',
  '/different/path'
);
```

### 4. Instance（インスタンス直接登録）

すでに作成済みのインスタンスを登録します。

```typescript
const logger = Logger.getInstance();
container.registerInstance('logger', logger);

const resolved = container.resolve<Logger>('logger');
console.log(logger === resolved); // true
```

## 依存関係の管理

### 依存関係の明示

```typescript
// Loggerに依存するRateLimiterを登録
container.registerSingleton('logger', () => Logger.getInstance());

container.registerSingleton(
  'rateLimiter',
  () => {
    const logger = container.resolve<Logger>('logger');
    const limiter = new RateLimiter();
    logger.info('RateLimiter created');
    return limiter;
  },
  ['logger'] // 依存キーを明示（循環依存検出用）
);
```

### 依存関係のチェーン

```typescript
container.registerSingleton('logger', () => Logger.getInstance());

container.registerSingleton(
  'rateLimiter',
  () => new RateLimiter(),
  ['logger']
);

container.registerSingleton(
  'fileSystem',
  () => {
    const logger = container.resolve<Logger>('logger');
    const limiter = container.resolve<RateLimiter>('rateLimiter');
    return new RealFileSystem('/workspace');
  },
  ['logger', 'rateLimiter']
);

// 解決時に依存関係が自動的に解決される
const fs = container.resolve<FileSystem>('fileSystem');
```

### 循環依存の検出

```typescript
container.registerSingleton(
  'serviceA',
  () => ({ b: container.resolve('serviceB') }),
  ['serviceB']
);

container.registerSingleton(
  'serviceB',
  () => ({ a: container.resolve('serviceA') }),
  ['serviceA']
);

try {
  container.resolve('serviceA');
} catch (error) {
  // CircularDependencyError: Circular dependency detected: serviceA -> serviceB -> serviceA
  console.log(error.message);
  console.log(error.cycle); // ['serviceA', 'serviceB', 'serviceA']
}
```

## 高度な機能

### 子コンテナ（階層的なDI）

```typescript
const parent = new DIContainer();
parent.registerSingleton('logger', () => Logger.getInstance());

const child = parent.createChild();
child.registerSingleton('rateLimiter', () => new RateLimiter());

// 子コンテナから親の依存性も利用可能
const logger = child.resolve<Logger>('logger'); // 親から解決
const limiter = child.resolve<RateLimiter>('rateLimiter'); // 子から解決
```

### コンテナの診断

```typescript
const diagnostics = container.diagnose();

console.log('Total registrations:', diagnostics.totalRegistrations);
console.log('Singletons:', diagnostics.singletons);
console.log('Transients:', diagnostics.transients);
console.log('Factories:', diagnostics.factories);
console.log('Cached instances:', diagnostics.cachedInstances);

// 詳細情報
diagnostics.registrations.forEach(reg => {
  console.log(`${reg.key}: ${reg.lifetime}`);
  console.log('  Dependencies:', reg.dependencies);
  console.log('  Cached:', reg.hasCachedInstance);
});
```

### メソッドチェーン

```typescript
const container = new DIContainer()
  .registerSingleton('logger', () => Logger.getInstance())
  .registerSingleton('rateLimiter', () => new RateLimiter())
  .registerFactory('fileSystem', (path: string) => new RealFileSystem(path));
```

### グローバルコンテナ

```typescript
import { globalContainer } from './di-container';

// アプリケーション起動時にグローバルコンテナをセットアップ
globalContainer
  .registerSingleton('logger', () => Logger.getInstance())
  .registerSingleton('rateLimiter', () => new RateLimiter());

// アプリケーション全体で使用可能
const logger = globalContainer.resolve<Logger>('logger');
```

## エラーハンドリング

### DependencyNotFoundError

```typescript
try {
  container.resolve('nonExistent');
} catch (error) {
  // DependencyNotFoundError: Dependency not found: 'nonExistent'
  console.log(error.name); // 'DependencyNotFoundError'
  console.log(error.key); // 'nonExistent'
}
```

### CircularDependencyError

```typescript
try {
  container.resolve('circularDep');
} catch (error) {
  // CircularDependencyError
  console.log(error.name); // 'CircularDependencyError'
  console.log(error.cycle); // ['serviceA', 'serviceB', 'serviceA']
}
```

### DIContainerError

```typescript
try {
  // ファクトリーをresolveで解決（エラー）
  container.registerFactory('factory', () => ({}));
  container.resolve('factory');
} catch (error) {
  // DIContainerError: Cannot resolve factory without arguments
  console.log(error.name); // 'DIContainerError'
}
```

## 実用的な使用例

### アプリケーションのセットアップ

```typescript
function setupContainer(): DIContainer {
  const container = new DIContainer();

  // 基本サービス
  container.registerSingleton('logger', () => Logger.getInstance());

  // パフォーマンス関連
  container.registerSingleton('rateLimiter', () => new RateLimiter());

  // ファイルシステム（パス別）
  container.registerFactory<FileSystem, [string]>(
    'fileSystem',
    (basePath: string) => new RealFileSystem(basePath)
  );

  // 複雑なサービス（依存性あり）
  container.registerSingleton(
    'syncService',
    () => {
      const logger = container.resolve<Logger>('logger');
      const limiter = container.resolve<RateLimiter>('rateLimiter');

      return new SyncService(logger, limiter);
    },
    ['logger', 'rateLimiter']
  );

  return container;
}

// アプリケーション起動
const container = setupContainer();
const syncService = container.resolve<SyncService>('syncService');
```

### テストでのモック使用

```typescript
// テスト用コンテナ
const testContainer = new DIContainer();

// モックロガー
testContainer.registerInstance('logger', {
  info: vi.fn(),
  error: vi.fn(),
} as any);

// モックファイルシステム
testContainer.registerFactory('fileSystem', (path: string) => ({
  readFile: async () => 'mock content',
  writeFile: async () => {},
  stat: async () => ({ size: 100, mtime: new Date() }),
  exists: async () => true,
}));

// テストで使用
const service = testContainer.resolve<MyService>('myService');
```

### 環境別の設定

```typescript
const isDevelopment = process.env.NODE_ENV === 'development';

if (isDevelopment) {
  container.registerSingleton('logger', () => {
    const logger = Logger.getInstance();
    logger.setDefaultContext({ environment: 'development' });
    return logger;
  });
} else {
  container.registerSingleton('logger', () => {
    const logger = Logger.getInstance();
    logger.setDefaultContext({ environment: 'production' });
    return logger;
  });
}
```

## API リファレンス

### DIContainer

#### コンストラクタ

```typescript
constructor(parent?: DIContainer)
```

#### メソッド

- `register<T>(key: string, factory: Factory<T>, lifetime?: Lifetime, dependencies?: string[]): this`
- `registerSingleton<T>(key: string, factory: Factory<T>, dependencies?: string[]): this`
- `registerTransient<T>(key: string, factory: Factory<T>, dependencies?: string[]): this`
- `registerFactory<T, TArgs>(key: string, factory: Factory<T, TArgs>, dependencies?: string[]): this`
- `registerInstance<T>(key: string, instance: T): this`
- `resolve<T>(key: string): T`
- `resolveFactory<T, TArgs>(key: string, ...args: TArgs): T`
- `has(key: string): boolean`
- `unregister(key: string): boolean`
- `clear(): void`
- `getKeys(includeParent?: boolean): string[]`
- `getInfo(key: string): { lifetime: Lifetime; dependencies: string[]; hasCachedInstance: boolean; } | undefined`
- `createChild(): DIContainer`
- `diagnose(): DiagnosticsInfo`

### Lifetime

```typescript
enum Lifetime {
  Singleton = 'singleton',
  Transient = 'transient',
  Factory = 'factory',
}
```

### エラークラス

- `DIContainerError`: 基本エラークラス
- `CircularDependencyError`: 循環依存エラー
- `DependencyNotFoundError`: 依存性未登録エラー

## ベストプラクティス

### 1. 依存関係を明示する

```typescript
// Good: 依存関係を明示
container.registerSingleton(
  'service',
  () => new Service(container.resolve('logger')),
  ['logger']
);

// Bad: 依存関係を明示しない
container.registerSingleton('service', () => new Service(container.resolve('logger')));
```

### 2. 適切なライフタイムを選択する

- **Singleton**: 状態を持つサービス、リソースを共有するサービス
- **Transient**: ステートレスなサービス、リクエストごとに異なる状態が必要なサービス
- **Factory**: パラメータに応じて異なるインスタンスが必要な場合

### 3. 型安全性を活用する

```typescript
// Good: 型を明示
const logger = container.resolve<Logger>('logger');

// Bad: 型なし
const logger = container.resolve('logger');
```

### 4. テストではモックを使用する

```typescript
// 本番
container.registerSingleton('logger', () => Logger.getInstance());

// テスト
testContainer.registerInstance('logger', mockLogger);
```

### 5. グローバルコンテナの使用を慎重に

グローバルコンテナは便利ですが、テスタビリティを損なう可能性があります。
小規模なアプリケーションでは有用ですが、大規模では明示的な依存性注入を推奨します。

## パフォーマンス考慮事項

- **Singleton**: 初回解決時にのみインスタンス化、以降はキャッシュ使用
- **Transient**: 解決のたびにインスタンス化、メモリ使用量に注意
- **Factory**: パラメータに応じてインスタンス化、キャッシュなし

## トラブルシューティング

### Q: "Circular dependency detected" エラーが出る

**A**: 依存関係にサイクルがあります。`error.cycle`を確認して、依存関係を見直してください。

### Q: ファクトリーを`resolve()`で解決するとエラーになる

**A**: ファクトリーは`resolveFactory()`を使用してください。

### Q: 子コンテナで親の依存性が解決できない

**A**: 親コンテナに依存性が正しく登録されているか確認してください。`has()`メソッドで確認できます。

## ライセンス

このコードはtaskflow-graphqlプロジェクトの一部です。

## 関連ファイル

- **実装**: `/src/sync/interfaces/di-container.ts`
- **使用例**: `/src/sync/interfaces/di-container.examples.ts`
- **テスト**: `/src/sync/interfaces/__tests__/di-container.test.ts`
