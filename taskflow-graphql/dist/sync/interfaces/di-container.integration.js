/**
 * DI Container Integration Examples
 *
 * 実際のSync Infrastructure（FileWatcher、MarkdownParser等）との統合例
 */
import { DIContainer } from './di-container';
import { Logger } from '../utils/logger';
import { RateLimiter } from '../performance/rate-limiter';
import { RealFileSystem } from '../file-system/real-file-system';
import { MockFileSystem } from '../file-system/mock-file-system';
import { MarkdownParser } from '../parsers/markdown-parser';
import { MarkdownSerializer } from '../parsers/markdown-serializer';
import { PathValidator } from '../security/path-validator';
import { createFileWatcher } from '../file-system/file-watcher';
// ========================================
// Production Container Setup
// ========================================
/**
 * 本番環境用のDIコンテナセットアップ
 *
 * 実際のアプリケーションで使用するコンテナの設定例
 */
export function setupProductionContainer(workspacePath) {
    const container = new DIContainer();
    // ========================================
    // 基本インフラストラクチャ（Singleton）
    // ========================================
    // Logger - アプリケーション全体で共有
    container.registerSingleton('logger', () => {
        const logger = Logger.getInstance();
        logger.setDefaultContext({
            environment: process.env.NODE_ENV || 'production',
            workspacePath,
        });
        return logger;
    });
    // ========================================
    // セキュリティ（Singleton）
    // ========================================
    // PathValidator - パス検証
    container.registerSingleton('pathValidator', () => {
        return new PathValidator(workspacePath);
    });
    // ========================================
    // パフォーマンス（Singleton）
    // ========================================
    // RateLimiter - レート制限
    container.registerSingleton('rateLimiter', () => {
        const logger = container.resolve('logger');
        const limiter = new RateLimiter();
        logger.info('RateLimiter initialized');
        return limiter;
    }, ['logger']);
    // ========================================
    // ファイルシステム（Factory）
    // ========================================
    // FileSystem - パスごとに異なるインスタンス
    container.registerFactory('fileSystem', (basePath) => {
        const logger = container.resolve('logger');
        const validator = container.resolve('pathValidator');
        // パスを検証
        try {
            validator.validate(basePath);
        }
        catch (error) {
            throw new Error(`Invalid path: ${basePath}`);
        }
        logger.debug({ basePath }, 'Creating FileSystem instance');
        return new RealFileSystem();
    });
    // ========================================
    // パーサー（Singleton）
    // ========================================
    // MarkdownParser - Markdown解析
    container.registerSingleton('markdownParser', () => {
        const logger = container.resolve('logger');
        logger.info('MarkdownParser initialized');
        return new MarkdownParser();
    }, ['logger']);
    // MarkdownSerializer - Markdown生成
    container.registerSingleton('markdownSerializer', () => {
        const logger = container.resolve('logger');
        logger.info('MarkdownSerializer initialized');
        return new MarkdownSerializer();
    }, ['logger']);
    // ========================================
    // ファイル監視（Factory）
    // ========================================
    // FileWatcher - TODO.mdファイル監視
    // パスとオプションごとに異なるウォッチャーインスタンスを作成
    container.registerFactory('fileWatcher', (filePath, options) => {
        const logger = container.resolve('logger');
        // デフォルトSyncConfig
        const defaultConfig = {
            todoPath: filePath,
            direction: 'bidirectional',
            strategy: 'three_way_merge',
            conflictResolution: 'merge',
            debounceMs: 300,
            throttleMs: 1000,
            maxFileSizeMB: 5,
            maxTasks: 1000,
            webhooksEnabled: false,
            autoBackup: true,
            backupRetentionDays: 7,
            dryRun: false,
        };
        const watcherOptions = {
            filePath,
            config: defaultConfig,
            ...options,
        };
        logger.info({ filePath, options }, 'Creating FileWatcher instance');
        return createFileWatcher(watcherOptions);
    });
    // ========================================
    // 同期サービス（Singleton）
    // ========================================
    container.registerSingleton('syncService', () => {
        const logger = container.resolve('logger');
        const parser = container.resolve('markdownParser');
        const serializer = container.resolve('markdownSerializer');
        const limiter = container.resolve('rateLimiter');
        return {
            syncToFile: limiter.rateLimit(async (taskId, filePath) => {
                const timer = logger.startTimer('sync-to-file', { taskId, filePath });
                try {
                    const fs = container.resolveFactory('fileSystem', workspacePath);
                    // タスクデータを取得（実際の実装では別のサービスから取得）
                    const taskData = { id: taskId, title: 'Example Task', status: 'todo' };
                    // Markdownに変換
                    const markdown = serializer.serialize(taskData);
                    // ファイルに書き込み
                    await fs.writeFile(filePath, markdown);
                    logger.logSyncEvent('success', { taskId, filePath }, 'Synced to file');
                    timer.done({ itemsProcessed: 1 });
                }
                catch (error) {
                    logger.logSyncEvent('failure', { taskId, filePath, error }, 'Sync failed');
                    throw error;
                }
            }, { debounceMs: 500, throttleMs: 2000 }),
            syncFromFile: limiter.rateLimit(async (filePath) => {
                const timer = logger.startTimer('sync-from-file', { filePath });
                try {
                    const fs = container.resolveFactory('fileSystem', workspacePath);
                    // ファイルを読み込み
                    const content = await fs.readFile(filePath);
                    // Markdownを解析
                    const taskData = parser.parse(content);
                    logger.logSyncEvent('success', { filePath }, 'Synced from file');
                    timer.done({ itemsProcessed: 1 });
                    return taskData;
                }
                catch (error) {
                    logger.logSyncEvent('failure', { filePath, error }, 'Sync failed');
                    throw error;
                }
            }, { debounceMs: 500, throttleMs: 2000 }),
        };
    }, ['logger', 'markdownParser', 'markdownSerializer', 'rateLimiter']);
    return container;
}
// ========================================
// Test Container Setup
// ========================================
/**
 * テスト環境用のDIコンテナセットアップ
 *
 * モックを使用したテスト用のコンテナ設定例
 */
export function setupTestContainer() {
    const container = new DIContainer();
    // ========================================
    // モックLogger
    // ========================================
    const mockLogger = {
        trace: vi.fn(),
        debug: vi.fn(),
        info: vi.fn(),
        warn: vi.fn(),
        error: vi.fn(),
        fatal: vi.fn(),
        setDefaultContext: vi.fn(),
        clearDefaultContext: vi.fn(),
        startTimer: vi.fn(() => ({ done: vi.fn() })),
        logSyncEvent: vi.fn(),
        logSecurityEvent: vi.fn(),
        logPerformanceEvent: vi.fn(),
        child: vi.fn(),
        getPinoLogger: vi.fn(),
    };
    container.registerInstance('logger', mockLogger);
    // ========================================
    // モックPathValidator
    // ========================================
    const mockPathValidator = {
        isValidPath: vi.fn(() => true),
        validatePath: vi.fn(),
        normalizePath: vi.fn((path) => path),
    };
    container.registerInstance('pathValidator', mockPathValidator);
    // ========================================
    // モックRateLimiter
    // ========================================
    const mockRateLimiter = {
        debounce: vi.fn((fn) => fn),
        throttle: vi.fn((fn) => fn),
        rateLimit: vi.fn((fn) => fn),
        getStats: vi.fn(),
        resetStats: vi.fn(),
    };
    container.registerInstance('rateLimiter', mockRateLimiter);
    // ========================================
    // モックFileSystem
    // ========================================
    container.registerFactory('fileSystem', (basePath) => {
        return new MockFileSystem();
    });
    // ========================================
    // モックMarkdownParser
    // ========================================
    const mockParser = {
        parse: vi.fn(() => ({ id: 'test-task', title: 'Test Task', status: 'todo' })),
    };
    container.registerInstance('markdownParser', mockParser);
    // ========================================
    // モックMarkdownSerializer
    // ========================================
    const mockSerializer = {
        serialize: vi.fn(() => '# Test Task\n\nStatus: todo'),
    };
    container.registerInstance('markdownSerializer', mockSerializer);
    return container;
}
// ========================================
// Usage Examples
// ========================================
/**
 * Example 1: Production Usage
 */
export async function exampleProductionUsage() {
    const container = setupProductionContainer('/workspace/tasks');
    // Sync Service を取得
    const syncService = container.resolve('syncService');
    // ファイルに同期
    await syncService.syncToFile('task-123', 'task-123.md');
    // ファイルから同期
    const taskData = await syncService.syncFromFile('task-123.md');
    console.log('Task data:', taskData);
}
/**
 * Example 2: Test Usage
 */
export async function exampleTestUsage() {
    const container = setupTestContainer();
    // モックされたサービスを取得
    const logger = container.resolve('logger');
    const parser = container.resolve('markdownParser');
    const fs = container.resolveFactory('fileSystem', '/test');
    // テスト実行
    const content = await fs.readFile('test.md');
    const taskData = parser.parse(content);
    // モックの呼び出しを検証
    expect(parser.parse).toHaveBeenCalledWith(content);
    expect(logger.info).not.toHaveBeenCalled(); // モックは実際にログを出力しない
}
/**
 * Example 3: Custom Container for Specific Feature
 */
export function exampleFeatureSpecificContainer() {
    const baseContainer = setupProductionContainer('/workspace');
    const featureContainer = baseContainer.createChild();
    // 機能固有の依存性を追加
    featureContainer.registerSingleton('featureService', () => {
        const logger = featureContainer.resolve('logger');
        const parser = featureContainer.resolve('markdownParser');
        return {
            processTask: async (taskId) => {
                logger.info({ taskId }, 'Processing task');
                // 機能固有の処理...
            },
        };
    }, ['logger', 'markdownParser']);
    return featureContainer;
}
/**
 * Example 4: Environment-based Configuration
 */
export function setupEnvironmentContainer(workspacePath) {
    const container = new DIContainer();
    const env = process.env.NODE_ENV || 'development';
    // 環境別のLogger設定
    container.registerSingleton('logger', () => {
        const logger = Logger.getInstance();
        if (env === 'development') {
            logger.setDefaultContext({
                environment: 'development',
                debug: true,
            });
        }
        else if (env === 'production') {
            logger.setDefaultContext({
                environment: 'production',
                debug: false,
            });
        }
        return logger;
    });
    // 環境別のFileSystem設定
    if (env === 'test') {
        // テスト環境ではモック使用
        container.registerFactory('fileSystem', () => new MockFileSystem());
    }
    else {
        // 開発・本番環境では実ファイルシステム使用
        container.registerFactory('fileSystem', (basePath) => new RealFileSystem(basePath));
    }
    return container;
}
/**
 * Example 5: Diagnostics and Monitoring
 */
export function exampleDiagnostics() {
    const container = setupProductionContainer('/workspace');
    // コンテナの状態を診断
    const diagnostics = container.diagnose();
    console.log('=== Container Diagnostics ===');
    console.log(`Total Registrations: ${diagnostics.totalRegistrations}`);
    console.log(`Singletons: ${diagnostics.singletons}`);
    console.log(`Transients: ${diagnostics.transients}`);
    console.log(`Factories: ${diagnostics.factories}`);
    console.log(`Cached Instances: ${diagnostics.cachedInstances}`);
    console.log('\n=== Registration Details ===');
    diagnostics.registrations.forEach(reg => {
        console.log(`\n${reg.key}:`);
        console.log(`  Lifetime: ${reg.lifetime}`);
        console.log(`  Dependencies: ${reg.dependencies.join(', ') || 'none'}`);
        console.log(`  Cached: ${reg.hasCachedInstance}`);
    });
}
/**
 * Example 6: FileWatcher Integration
 */
export async function exampleFileWatcherIntegration() {
    const container = setupProductionContainer('/workspace/tasks');
    // FileWatcherを作成（ファクトリー経由）
    const todoPath = '/workspace/tasks/TODO.md';
    const watcher = container.resolveFactory('fileWatcher', todoPath, {
        debounceMs: 500,
        throttleMs: 2000,
        maxFileSizeMB: 10,
    });
    // イベントハンドラを登録
    watcher.on('change', async (event) => {
        const logger = container.resolve('logger');
        logger.info({ event }, 'File changed, triggering sync');
        // 変更を同期サービスに通知
        const syncService = container.resolve('syncService');
        await syncService.syncFromFile(event.path);
    });
    watcher.on('add', async (event) => {
        const logger = container.resolve('logger');
        logger.info({ event }, 'File added');
    });
    watcher.on('unlink', async (event) => {
        const logger = container.resolve('logger');
        logger.warn({ event }, 'File deleted');
    });
    watcher.on('error', (event) => {
        const logger = container.resolve('logger');
        logger.error({ error: event.error }, 'FileWatcher error occurred');
    });
    // 監視開始
    await watcher.start();
    console.log('FileWatcher started, monitoring:', todoPath);
    // 統計情報を確認
    const stats = watcher.getStats();
    console.log('Watcher statistics:', stats);
    // クリーンアップ（アプリケーション終了時）
    // await watcher.dispose();
}
/**
 * Example 7: Error Handling in Integration
 */
export async function exampleErrorHandling() {
    const container = setupProductionContainer('/workspace');
    try {
        // 存在しない依存性を解決
        container.resolve('nonExistentService');
    }
    catch (error) {
        if (error.name === 'DependencyNotFoundError') {
            console.error(`Service not found: ${error.key}`);
            // フォールバック処理...
        }
    }
    try {
        // 無効なパスでファイルシステムを作成
        const fs = container.resolveFactory('fileSystem', '../../../etc/passwd' // パストラバーサル攻撃
        );
    }
    catch (error) {
        console.error('Security violation detected:', error.message);
        // セキュリティイベントをログ
        const logger = container.resolve('logger');
        logger.logSecurityEvent('path_traversal', {}, error.message);
    }
}
// ========================================
// Global Container for Application
// ========================================
let appContainer = null;
/**
 * アプリケーション全体で共有するコンテナを初期化
 */
export function initializeAppContainer(workspacePath) {
    if (appContainer) {
        throw new Error('Application container already initialized');
    }
    appContainer = setupProductionContainer(workspacePath);
}
/**
 * アプリケーションコンテナを取得
 */
export function getAppContainer() {
    if (!appContainer) {
        throw new Error('Application container not initialized. Call initializeAppContainer() first.');
    }
    return appContainer;
}
/**
 * アプリケーションコンテナをリセット（主にテスト用）
 */
export function resetAppContainer() {
    appContainer = null;
}
// Vitestのviをインポート（テスト環境でのみ必要）
// @ts-ignore
import { vi, expect } from 'vitest';
//# sourceMappingURL=di-container.integration.js.map