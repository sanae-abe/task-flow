import chokidar from 'chokidar';
import { EventEmitter } from 'events';
import { promises as fs } from 'fs';
import { PathValidator } from '../security/path-validator';
import { RateLimiter } from '../performance/rate-limiter';
import { Logger } from '../utils/logger';
/**
 * FileWatcher - TODO.mdファイル監視
 *
 * chokidarを使用してファイルシステムの変更を監視し、
 * デバウンス・スロットルによるレート制限を適用します。
 *
 * @example
 * ```typescript
 * const watcher = new FileWatcher({
 *   filePath: '/path/to/TODO.md',
 *   config: syncConfig,
 *   debounceMs: 500,
 *   throttleMs: 2000,
 * });
 *
 * watcher.on('change', (event) => {
 *   console.log('File changed:', event);
 * });
 *
 * await watcher.start();
 * ```
 */
export class FileWatcher extends EventEmitter {
    watcher;
    pathValidator;
    rateLimiter;
    logger;
    options;
    stats;
    validatedPath;
    retryTimeouts = new Map();
    // レート制限された各イベントハンドラ
    rateLimitedHandlers = new Map();
    /**
     * @param options ファイルウォッチャーのオプション
     */
    constructor(options) {
        super();
        // オプションのデフォルト値設定
        this.options = {
            filePath: options.filePath,
            config: options.config,
            debounceMs: options.debounceMs ?? options.config.debounceMs ?? 500,
            throttleMs: options.throttleMs ?? options.config.throttleMs ?? 2000,
            maxFileSizeMB: options.maxFileSizeMB ?? options.config.maxFileSizeMB ?? 5,
            maxRetries: options.maxRetries ?? 3,
            retryDelayMs: options.retryDelayMs ?? 1000,
            ignorePatterns: options.ignorePatterns ?? [],
        };
        // 依存コンポーネントの初期化
        this.pathValidator = new PathValidator(process.cwd());
        this.rateLimiter = new RateLimiter();
        this.logger = Logger.getInstance().child({
            feature: 'file-watcher',
            filePath: this.options.filePath,
        });
        // 統計情報の初期化
        this.stats = {
            totalEvents: 0,
            eventCounts: {
                change: 0,
                add: 0,
                unlink: 0,
                error: 0,
            },
            errorCount: 0,
            retryCount: 0,
            isWatching: false,
        };
        // ファイルパスの検証
        try {
            this.validatedPath = this.pathValidator.validate(this.options.filePath);
            this.logger.debug({ validatedPath: this.validatedPath }, 'File path validated successfully');
        }
        catch (error) {
            this.logger.error({ err: error, filePath: this.options.filePath }, 'Failed to validate file path');
            throw error;
        }
        // レート制限されたイベントハンドラを作成
        this.setupRateLimitedHandlers();
    }
    /**
     * レート制限されたイベントハンドラをセットアップ
     */
    setupRateLimitedHandlers() {
        const eventTypes = [
            'change',
            'add',
            'unlink',
        ];
        for (const eventType of eventTypes) {
            const handler = this.rateLimiter.rateLimit((event) => {
                this.emitEvent(event);
            }, {
                debounceMs: this.options.debounceMs,
                throttleMs: this.options.throttleMs,
            });
            this.rateLimitedHandlers.set(eventType, handler);
        }
    }
    /**
     * ファイル監視を開始
     */
    async start() {
        if (this.stats.isWatching) {
            this.logger.warn('File watcher is already running');
            return;
        }
        try {
            // ファイルの存在確認
            const exists = await this.pathValidator.exists(this.validatedPath);
            if (!exists) {
                this.logger.warn({ path: this.validatedPath }, 'File does not exist yet, waiting for creation');
            }
            // ファイルサイズ検証（存在する場合）
            if (exists) {
                await this.validateFileSize();
            }
            // chokidarウォッチャーの初期化
            this.watcher = chokidar.watch(this.validatedPath, {
                persistent: true,
                ignoreInitial: false,
                awaitWriteFinish: {
                    stabilityThreshold: 200,
                    pollInterval: 100,
                },
                ignored: this.options.ignorePatterns,
                usePolling: false,
                interval: 100,
                binaryInterval: 300,
                alwaysStat: true,
            });
            // イベントハンドラの登録
            this.watcher
                .on('add', (path, stats) => this.handleFileEvent('add', path, stats))
                .on('change', (path, stats) => this.handleFileEvent('change', path, stats))
                .on('unlink', path => this.handleFileEvent('unlink', path))
                .on('error', error => this.handleError(error instanceof Error ? error : new Error(String(error))));
            this.stats.isWatching = true;
            this.stats.startedAt = new Date();
            this.logger.info({
                path: this.validatedPath,
                debounceMs: this.options.debounceMs,
                throttleMs: this.options.throttleMs,
                maxFileSizeMB: this.options.maxFileSizeMB,
            }, 'File watcher started successfully');
            this.emit('started', { path: this.validatedPath, timestamp: new Date() });
        }
        catch (error) {
            this.logger.error({ err: error }, 'Failed to start file watcher');
            this.stats.isWatching = false;
            throw error;
        }
    }
    /**
     * ファイル監視を停止
     */
    async stop() {
        if (!this.stats.isWatching) {
            this.logger.warn('File watcher is not running');
            return;
        }
        try {
            // 保留中のリトライタイマーをクリア
            for (const timeout of this.retryTimeouts.values()) {
                clearTimeout(timeout);
            }
            this.retryTimeouts.clear();
            // レート制限されたハンドラをキャンセル
            for (const handler of this.rateLimitedHandlers.values()) {
                handler.cancel();
            }
            // ウォッチャーを停止
            if (this.watcher) {
                await this.watcher.close();
                this.watcher = undefined;
            }
            this.stats.isWatching = false;
            this.logger.info({
                totalEvents: this.stats.totalEvents,
                errorCount: this.stats.errorCount,
            }, 'File watcher stopped successfully');
            this.emit('stopped', { path: this.validatedPath, timestamp: new Date() });
        }
        catch (error) {
            this.logger.error({ err: error }, 'Failed to stop file watcher');
            throw error;
        }
    }
    /**
     * ファイルイベントを処理
     */
    async handleFileEvent(type, path, stats) {
        try {
            // パス検証
            const validatedPath = this.pathValidator.validate(path);
            // ファイルサイズ検証（unlink以外）
            if (type !== 'unlink') {
                await this.validateFileSize();
            }
            // イベント作成
            const event = {
                type,
                path: validatedPath,
                timestamp: new Date(),
                stats: stats
                    ? {
                        size: stats.size,
                        mtime: stats.mtime,
                    }
                    : undefined,
            };
            // 統計更新
            this.updateStatistics(event);
            // レート制限されたハンドラを呼び出し
            const handler = this.rateLimitedHandlers.get(type);
            if (handler) {
                handler(event);
            }
            this.logger.debug({
                eventType: type,
                path: validatedPath,
                size: stats?.size,
            }, `File ${type} event detected`);
        }
        catch (error) {
            this.handleError(error);
        }
    }
    /**
     * イベントを発行
     */
    emitEvent(event) {
        this.emit('event', event);
        this.emit(event.type, event);
        this.logger.info({
            eventType: event.type,
            path: event.path,
            size: event.stats?.size,
        }, `File watcher event emitted: ${event.type}`);
    }
    /**
     * エラーを処理
     */
    handleError(error) {
        const errorEvent = {
            type: 'error',
            path: this.validatedPath,
            timestamp: new Date(),
            error,
        };
        this.stats.errorCount++;
        this.stats.eventCounts.error++;
        this.stats.lastEventAt = new Date();
        this.stats.lastEventType = 'error';
        this.logger.error({
            err: error,
            path: this.validatedPath,
            errorCount: this.stats.errorCount,
        }, 'File watcher error occurred');
        this.emit('error', errorEvent);
        // リトライロジック
        if (this.stats.errorCount <= this.options.maxRetries) {
            this.scheduleRetry();
        }
        else {
            this.logger.error({ maxRetries: this.options.maxRetries }, 'Max retries exceeded, stopping watcher');
            this.stop().catch(err => {
                this.logger.error({ err }, 'Failed to stop watcher after max retries');
            });
        }
    }
    /**
     * リトライをスケジュール
     */
    scheduleRetry() {
        const retryKey = `retry-${this.stats.retryCount}`;
        if (this.retryTimeouts.has(retryKey)) {
            return;
        }
        this.stats.retryCount++;
        const timeout = setTimeout(async () => {
            this.retryTimeouts.delete(retryKey);
            this.logger.info({
                retryCount: this.stats.retryCount,
                delayMs: this.options.retryDelayMs,
            }, 'Retrying file watcher operation');
            try {
                await this.stop();
                await this.start();
                this.stats.errorCount = 0; // リトライ成功時はエラーカウントをリセット
            }
            catch (error) {
                this.logger.error({ err: error }, 'Retry failed');
                this.handleError(error);
            }
        }, this.options.retryDelayMs);
        this.retryTimeouts.set(retryKey, timeout);
    }
    /**
     * ファイルサイズを検証
     */
    async validateFileSize() {
        try {
            await this.pathValidator.validateFileSize(this.validatedPath, this.options.maxFileSizeMB);
            // ファイル統計情報を更新
            const stats = await fs.stat(this.validatedPath);
            this.stats.currentFileSize = stats.size;
            this.stats.lastModifiedAt = stats.mtime;
        }
        catch (error) {
            this.logger.error({
                err: error,
                path: this.validatedPath,
                maxFileSizeMB: this.options.maxFileSizeMB,
            }, 'File size validation failed');
            throw error;
        }
    }
    /**
     * 統計情報を更新
     */
    updateStatistics(event) {
        this.stats.totalEvents++;
        this.stats.eventCounts[event.type]++;
        this.stats.lastEventAt = event.timestamp;
        this.stats.lastEventType = event.type;
        if (event.stats) {
            this.stats.currentFileSize = event.stats.size;
            this.stats.lastModifiedAt = event.stats.mtime;
        }
    }
    /**
     * 監視統計情報を取得
     */
    getStats() {
        return {
            ...this.stats,
            // 深いコピーを返す
            eventCounts: { ...this.stats.eventCounts },
        };
    }
    /**
     * 監視中かどうかを確認
     */
    isWatching() {
        return this.stats.isWatching;
    }
    /**
     * ファイルパスを取得
     */
    getFilePath() {
        return this.validatedPath;
    }
    /**
     * レート制限統計を取得
     */
    getRateLimiterStats() {
        return this.rateLimiter.getStats();
    }
    /**
     * 統計情報をリセット
     */
    resetStats() {
        this.stats = {
            startedAt: this.stats.startedAt,
            totalEvents: 0,
            eventCounts: {
                change: 0,
                add: 0,
                unlink: 0,
                error: 0,
            },
            errorCount: 0,
            retryCount: 0,
            isWatching: this.stats.isWatching,
            currentFileSize: this.stats.currentFileSize,
            lastModifiedAt: this.stats.lastModifiedAt,
        };
        this.rateLimiter.resetStats();
        this.logger.info('File watcher statistics reset');
    }
    /**
     * 即座に保留中のイベントをフラッシュ
     */
    flush() {
        for (const handler of this.rateLimitedHandlers.values()) {
            handler.flush();
        }
        this.logger.debug('Pending events flushed');
    }
    /**
     * 現在のファイル情報を取得
     */
    async getFileInfo() {
        try {
            const exists = await this.pathValidator.exists(this.validatedPath);
            if (!exists) {
                return { exists: false };
            }
            const stats = await fs.stat(this.validatedPath);
            const isReadable = await this.pathValidator.isReadable(this.validatedPath);
            const isWritable = await this.pathValidator.isWritable(this.validatedPath);
            return {
                exists: true,
                size: stats.size,
                mtime: stats.mtime,
                isReadable,
                isWritable,
            };
        }
        catch (error) {
            this.logger.error({ err: error }, 'Failed to get file info');
            throw error;
        }
    }
    /**
     * リソースをクリーンアップ
     */
    async dispose() {
        await this.stop();
        // すべてのリスナーを削除
        this.removeAllListeners();
        // レート制限ハンドラをクリア
        this.rateLimitedHandlers.clear();
        this.logger.info('File watcher disposed');
    }
}
/**
 * FileWatcherファクトリー関数
 *
 * @param options ファイルウォッチャーのオプション
 * @returns FileWatcherインスタンス
 */
export function createFileWatcher(options) {
    return new FileWatcher(options);
}
//# sourceMappingURL=file-watcher.js.map