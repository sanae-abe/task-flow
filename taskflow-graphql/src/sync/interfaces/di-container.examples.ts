/**
 * DI Container Usage Examples
 *
 * DIコンテナの実用的な使用例とベストプラクティス
 */

import { DIContainer, Lifetime, globalContainer } from './di-container';
import { Logger } from '../utils/logger';
import { RateLimiter } from '../performance/rate-limiter';
import { FileSystem } from './file-system.interface';
import { RealFileSystem } from '../file-system/real-file-system';

// ========================================
// Example 1: Basic Singleton Registration
// ========================================

/**
 * シングルトンの基本的な登録と解決
 */
export function example1_BasicSingleton() {
  const container = new DIContainer();

  // シングルトン登録
  container.registerSingleton('logger', () => Logger.getInstance());

  // 解決（同じインスタンスが返される）
  const logger1 = container.resolve<Logger>('logger');
  const logger2 = container.resolve<Logger>('logger');

  console.log('Same instance:', logger1 === logger2); // true
}

// ========================================
// Example 2: Transient Registration
// ========================================

/**
 * トランジェントの登録（毎回新しいインスタンス）
 */
export function example2_Transient() {
  const container = new DIContainer();

  // トランジェント登録
  container.registerTransient('rateLimiter', () => new RateLimiter());

  // 解決（異なるインスタンスが返される）
  const limiter1 = container.resolve<RateLimiter>('rateLimiter');
  const limiter2 = container.resolve<RateLimiter>('rateLimiter');

  console.log('Different instances:', limiter1 !== limiter2); // true
}

// ========================================
// Example 3: Factory Registration
// ========================================

/**
 * ファクトリー登録（パラメータ付き生成）
 */
export function example3_Factory() {
  const container = new DIContainer();

  // ファクトリー登録（パラメータを受け取る）
  container.registerFactory<FileSystem, [string]>(
    'fileSystem',
    (basePath: string) => new RealFileSystem(basePath)
  );

  // ファクトリー解決
  const fs1 = container.resolveFactory<FileSystem, [string]>(
    'fileSystem',
    '/path/to/workspace'
  );
  const fs2 = container.resolveFactory<FileSystem, [string]>(
    'fileSystem',
    '/different/path'
  );

  console.log('Factory created instances with different params');
}

// ========================================
// Example 4: Instance Registration
// ========================================

/**
 * インスタンスの直接登録
 */
export function example4_Instance() {
  const container = new DIContainer();

  // すでに作成済みのインスタンスを登録
  const logger = Logger.getInstance();
  container.registerInstance('logger', logger);

  // 解決（登録したインスタンスが返される）
  const resolved = container.resolve<Logger>('logger');

  console.log('Same instance:', logger === resolved); // true
}

// ========================================
// Example 5: Dependency Chain
// ========================================

/**
 * 依存関係のチェーン
 */
export function example5_DependencyChain() {
  const container = new DIContainer();

  // 依存関係を明示的に指定
  container.registerSingleton('logger', () => Logger.getInstance());

  container.registerSingleton(
    'rateLimiter',
    () => {
      // Loggerに依存
      const logger = container.resolve<Logger>('logger');
      const limiter = new RateLimiter();
      logger.info('RateLimiter created');
      return limiter;
    },
    ['logger'] // 依存キーを明示
  );

  container.registerSingleton(
    'fileSystem',
    () => {
      // RateLimiterとLoggerに依存
      const logger = container.resolve<Logger>('logger');
      const limiter = container.resolve<RateLimiter>('rateLimiter');
      logger.info('FileSystem created with RateLimiter');
      return new RealFileSystem('/workspace');
    },
    ['logger', 'rateLimiter'] // 依存キーを明示
  );

  // 解決（依存関係が自動的に解決される）
  const fs = container.resolve<FileSystem>('fileSystem');
  console.log('FileSystem resolved with all dependencies');
}

// ========================================
// Example 6: Circular Dependency Detection
// ========================================

/**
 * 循環依存の検出
 */
export function example6_CircularDependency() {
  const container = new DIContainer();

  // 循環依存を作成
  container.registerSingleton(
    'serviceA',
    () => {
      // ServiceBに依存
      const serviceB = container.resolve('serviceB');
      return { name: 'ServiceA', dependency: serviceB };
    },
    ['serviceB']
  );

  container.registerSingleton(
    'serviceB',
    () => {
      // ServiceAに依存（循環）
      const serviceA = container.resolve('serviceA');
      return { name: 'ServiceB', dependency: serviceA };
    },
    ['serviceA']
  );

  try {
    container.resolve('serviceA');
  } catch (error) {
    console.log('Circular dependency detected:', error.message);
    // CircularDependencyError: Circular dependency detected: serviceA -> serviceB -> serviceA
  }
}

// ========================================
// Example 7: Child Container
// ========================================

/**
 * 子コンテナ（階層的なDI）
 */
export function example7_ChildContainer() {
  const parent = new DIContainer();
  const child = parent.createChild();

  // 親コンテナに登録
  parent.registerSingleton('logger', () => Logger.getInstance());

  // 子コンテナに登録
  child.registerSingleton('rateLimiter', () => new RateLimiter());

  // 子コンテナから解決（親の依存性も利用可能）
  const logger = child.resolve<Logger>('logger'); // 親から解決
  const limiter = child.resolve<RateLimiter>('rateLimiter'); // 子から解決

  console.log('Child can access parent dependencies');
}

// ========================================
// Example 8: Container Diagnostics
// ========================================

/**
 * コンテナの診断情報
 */
export function example8_Diagnostics() {
  const container = new DIContainer();

  // 複数の依存性を登録
  container.registerSingleton('logger', () => Logger.getInstance());
  container.registerTransient('rateLimiter', () => new RateLimiter());
  container.registerFactory(
    'fileSystem',
    (path: string) => new RealFileSystem(path)
  );

  // いくつか解決してキャッシュを作成
  container.resolve<Logger>('logger');

  // 診断情報を取得
  const diagnostics = container.diagnose();
  console.log('Total registrations:', diagnostics.totalRegistrations);
  console.log('Singletons:', diagnostics.singletons);
  console.log('Transients:', diagnostics.transients);
  console.log('Factories:', diagnostics.factories);
  console.log('Cached instances:', diagnostics.cachedInstances);
  console.log('Registrations:', diagnostics.registrations);
}

// ========================================
// Example 9: Real-World Setup
// ========================================

/**
 * 実際のアプリケーションセットアップ
 */
export function example9_RealWorldSetup() {
  const container = new DIContainer();

  // 基本サービス（シングルトン）
  container.registerSingleton('logger', () => Logger.getInstance());

  // パフォーマンス関連（シングルトン）
  container.registerSingleton('rateLimiter', () => new RateLimiter());

  // ファイルシステム（ファクトリー - パスに応じて異なるインスタンス）
  container.registerFactory<FileSystem, [string]>(
    'fileSystem',
    (basePath: string) => new RealFileSystem(basePath)
  );

  // 依存性を持つサービス
  container.registerSingleton(
    'syncService',
    () => {
      const logger = container.resolve<Logger>('logger');
      const limiter = container.resolve<RateLimiter>('rateLimiter');

      return {
        sync: async (path: string) => {
          const fs = container.resolveFactory<FileSystem, [string]>(
            'fileSystem',
            path
          );
          logger.info(`Syncing ${path}`);
          // 同期処理...
        },
      };
    },
    ['logger', 'rateLimiter']
  );

  return container;
}

// ========================================
// Example 10: Global Container
// ========================================

/**
 * グローバルコンテナの使用
 */
export function example10_GlobalContainer() {
  // グローバルコンテナに登録
  globalContainer.registerSingleton('logger', () => Logger.getInstance());
  globalContainer.registerSingleton('rateLimiter', () => new RateLimiter());

  // アプリケーション全体で使用可能
  const logger = globalContainer.resolve<Logger>('logger');
  logger.info('Using global container');

  // 診断
  console.log('Global container keys:', globalContainer.getKeys());
}

// ========================================
// Example 11: Method Chaining
// ========================================

/**
 * メソッドチェーン
 */
export function example11_MethodChaining() {
  const container = new DIContainer()
    .registerSingleton('logger', () => Logger.getInstance())
    .registerSingleton('rateLimiter', () => new RateLimiter())
    .registerFactory('fileSystem', (path: string) => new RealFileSystem(path));

  console.log('Registered dependencies:', container.getKeys());
}

// ========================================
// Example 12: Error Handling
// ========================================

/**
 * エラーハンドリング
 */
export function example12_ErrorHandling() {
  const container = new DIContainer();

  try {
    // 未登録の依存性を解決
    container.resolve('nonExistent');
  } catch (error) {
    console.log('Error:', error.name); // DependencyNotFoundError
    console.log('Message:', error.message);
  }

  try {
    // ファクトリーをresolveで解決（エラー）
    container.registerFactory('factory', () => ({}));
    container.resolve('factory');
  } catch (error) {
    console.log('Error:', error.name); // DIContainerError
    console.log('Use resolveFactory() for factories');
  }
}

// ========================================
// Example 13: Testing with Mock
// ========================================

/**
 * テストでのモック使用
 */
export function example13_TestingWithMock() {
  // 本番用コンテナ
  const productionContainer = new DIContainer();
  productionContainer.registerSingleton('logger', () => Logger.getInstance());
  productionContainer.registerFactory(
    'fileSystem',
    (path: string) => new RealFileSystem(path)
  );

  // テスト用コンテナ
  const testContainer = new DIContainer();

  // モックロガー
  const mockLogger = {
    info: (msg: string) => console.log('[MOCK]', msg),
    error: (msg: string) => console.error('[MOCK]', msg),
  } as any;

  testContainer.registerInstance('logger', mockLogger);

  // モックファイルシステム
  testContainer.registerFactory('fileSystem', (path: string) => ({
    readFile: async () => 'mock content',
    writeFile: async () => {},
    stat: async () => ({ size: 100, mtime: new Date() }),
    exists: async () => true,
  }));

  // テストで使用
  const logger = testContainer.resolve<Logger>('logger');
  logger.info('Test message'); // [MOCK] Test message
}

// ========================================
// Example 14: Conditional Registration
// ========================================

/**
 * 条件付き登録
 */
export function example14_ConditionalRegistration() {
  const container = new DIContainer();
  const isDevelopment = process.env.NODE_ENV === 'development';

  if (isDevelopment) {
    // 開発環境用
    container.registerSingleton('logger', () => {
      const logger = Logger.getInstance();
      logger.setDefaultContext({ environment: 'development' });
      return logger;
    });
  } else {
    // 本番環境用
    container.registerSingleton('logger', () => {
      const logger = Logger.getInstance();
      logger.setDefaultContext({ environment: 'production' });
      return logger;
    });
  }

  const logger = container.resolve<Logger>('logger');
  logger.info('Environment-specific logger');
}

// ========================================
// Example 15: Lazy Loading
// ========================================

/**
 * 遅延ロード（必要になるまでインスタンス化しない）
 */
export function example15_LazyLoading() {
  const container = new DIContainer();

  console.log('Registering dependencies...');

  // シングルトンは初回resolve時にのみ作成される
  container.registerSingleton('heavyService', () => {
    console.log('Creating heavy service...');
    return { name: 'HeavyService' };
  });

  console.log('Dependencies registered, but not created yet');

  // ここで初めてインスタンスが作成される
  const service = container.resolve('heavyService'); // "Creating heavy service..." が出力される

  // 2回目は既存のインスタンスが返される
  const service2 = container.resolve('heavyService'); // メッセージは出力されない

  console.log('Same instance:', service === service2); // true
}
