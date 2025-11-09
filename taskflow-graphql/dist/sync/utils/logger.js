import pino from 'pino';
/**
 * Logger - 構造化ロギング
 *
 * pinoを使用した高速な構造化ロギングを提供します。
 * JSON形式でログを出力し、検索・分析を容易にします。
 *
 * @example
 * ```typescript
 * const logger = Logger.getInstance();
 *
 * // 基本的なログ
 * logger.info('Sync started');
 *
 * // コンテキスト付きログ
 * logger.info({ taskId: 'task-123', operation: 'sync' }, 'Task synced');
 *
 * // エラーログ
 * logger.error({ err: error, taskId: 'task-123' }, 'Sync failed');
 *
 * // パフォーマンス測定
 * const timer = logger.startTimer('sync-to-file');
 * await syncToFile();
 * timer.done({ itemsProcessed: 100 });
 * ```
 */
export class Logger {
    static instance;
    logger;
    defaultContext = {};
    constructor() {
        const isDevelopment = process.env.NODE_ENV === 'development';
        const logLevel = process.env.LOG_LEVEL || 'info';
        this.logger = pino({
            level: logLevel,
            // 開発環境では人間が読みやすい形式、本番環境ではJSON形式
            transport: isDevelopment
                ? {
                    target: 'pino-pretty',
                    options: {
                        colorize: true,
                        translateTime: 'HH:MM:ss Z',
                        ignore: 'pid,hostname',
                    },
                }
                : undefined,
            // タイムスタンプをISO 8601形式で出力
            timestamp: () => `,"time":"${new Date().toISOString()}"`,
            // エラーオブジェクトのシリアライズ
            serializers: {
                err: pino.stdSerializers.err,
                error: pino.stdSerializers.err,
            },
        });
    }
    /**
     * シングルトンインスタンスを取得します
     *
     * @returns Loggerインスタンス
     */
    static getInstance() {
        if (!Logger.instance) {
            Logger.instance = new Logger();
        }
        return Logger.instance;
    }
    /**
     * デフォルトコンテキストを設定します
     *
     * すべてのログに自動的に追加されるコンテキスト情報
     *
     * @param context コンテキスト情報
     */
    setDefaultContext(context) {
        this.defaultContext = { ...this.defaultContext, ...context };
    }
    /**
     * デフォルトコンテキストをクリアします
     */
    clearDefaultContext() {
        this.defaultContext = {};
    }
    /**
     * コンテキストをマージします
     *
     * @param context 追加コンテキスト
     * @returns マージされたコンテキスト
     */
    mergeContext(context) {
        return { ...this.defaultContext, ...context };
    }
    /**
     * TRACEレベルのログを出力します
     *
     * @param contextOrMessage コンテキストまたはメッセージ
     * @param message メッセージ（第1引数がコンテキストの場合）
     */
    trace(contextOrMessage, message) {
        if (typeof contextOrMessage === 'string') {
            this.logger.trace(this.mergeContext(), contextOrMessage);
        }
        else {
            this.logger.trace(this.mergeContext(contextOrMessage), message);
        }
    }
    /**
     * DEBUGレベルのログを出力します
     *
     * @param contextOrMessage コンテキストまたはメッセージ
     * @param message メッセージ（第1引数がコンテキストの場合）
     */
    debug(contextOrMessage, message) {
        if (typeof contextOrMessage === 'string') {
            this.logger.debug(this.mergeContext(), contextOrMessage);
        }
        else {
            this.logger.debug(this.mergeContext(contextOrMessage), message);
        }
    }
    /**
     * INFOレベルのログを出力します
     *
     * @param contextOrMessage コンテキストまたはメッセージ
     * @param message メッセージ（第1引数がコンテキストの場合）
     */
    info(contextOrMessage, message) {
        if (typeof contextOrMessage === 'string') {
            this.logger.info(this.mergeContext(), contextOrMessage);
        }
        else {
            this.logger.info(this.mergeContext(contextOrMessage), message);
        }
    }
    /**
     * WARNレベルのログを出力します
     *
     * @param contextOrMessage コンテキストまたはメッセージ
     * @param message メッセージ（第1引数がコンテキストの場合）
     */
    warn(contextOrMessage, message) {
        if (typeof contextOrMessage === 'string') {
            this.logger.warn(this.mergeContext(), contextOrMessage);
        }
        else {
            this.logger.warn(this.mergeContext(contextOrMessage), message);
        }
    }
    /**
     * ERRORレベルのログを出力します
     *
     * @param contextOrMessage コンテキストまたはメッセージ
     * @param message メッセージ（第1引数がコンテキストの場合）
     */
    error(contextOrMessage, message) {
        if (typeof contextOrMessage === 'string') {
            this.logger.error(this.mergeContext(), contextOrMessage);
        }
        else {
            this.logger.error(this.mergeContext(contextOrMessage), message);
        }
    }
    /**
     * FATALレベルのログを出力します
     *
     * @param contextOrMessage コンテキストまたはメッセージ
     * @param message メッセージ（第1引数がコンテキストの場合）
     */
    fatal(contextOrMessage, message) {
        if (typeof contextOrMessage === 'string') {
            this.logger.fatal(this.mergeContext(), contextOrMessage);
        }
        else {
            this.logger.fatal(this.mergeContext(contextOrMessage), message);
        }
    }
    /**
     * パフォーマンス測定を開始します
     *
     * @param operation 操作名
     * @param context 追加コンテキスト
     * @returns タイマーオブジェクト
     */
    startTimer(operation, context) {
        const startTime = new Date();
        const startMemory = process.memoryUsage().heapUsed;
        this.debug(this.mergeContext({ ...context, operation }), `Started: ${operation}`);
        return {
            done: (metrics) => {
                const endTime = new Date();
                const durationMs = endTime.getTime() - startTime.getTime();
                const endMemory = process.memoryUsage().heapUsed;
                const memoryUsed = endMemory - startMemory;
                const performanceMetrics = {
                    operation,
                    durationMs,
                    startTime,
                    endTime,
                    memoryUsed,
                    ...metrics,
                };
                // スループット計算
                if (metrics?.itemsProcessed) {
                    performanceMetrics.throughput = Math.round((metrics.itemsProcessed / durationMs) * 1000);
                }
                this.info(this.mergeContext({ ...context, ...performanceMetrics }), `Completed: ${operation} (${durationMs}ms)`);
            },
        };
    }
    /**
     * 同期イベントをログに記録します
     *
     * @param event イベントタイプ
     * @param context コンテキスト
     * @param message メッセージ
     */
    logSyncEvent(event, context, message) {
        const eventContext = {
            ...context,
            event,
            feature: 'sync',
        };
        switch (event) {
            case 'start':
                this.info(eventContext, message || 'Sync started');
                break;
            case 'success':
                this.info(eventContext, message || 'Sync completed successfully');
                break;
            case 'failure':
                this.error(eventContext, message || 'Sync failed');
                break;
            case 'conflict':
                this.warn(eventContext, message || 'Conflict detected');
                break;
            case 'skip':
                this.debug(eventContext, message || 'Sync skipped');
                break;
        }
    }
    /**
     * セキュリティイベントをログに記録します
     *
     * @param event イベントタイプ
     * @param context コンテキスト
     * @param message メッセージ
     */
    logSecurityEvent(event, context, message) {
        const eventContext = {
            ...context,
            event,
            feature: 'security',
        };
        switch (event) {
            case 'auth_success':
                this.info(eventContext, message || 'Authentication successful');
                break;
            case 'auth_failure':
                this.warn(eventContext, message || 'Authentication failed');
                break;
            case 'path_traversal':
                this.error(eventContext, message || 'Path traversal attempt detected');
                break;
            case 'xss_detected':
                this.warn(eventContext, message || 'XSS attempt detected');
                break;
            case 'sanitized':
                this.debug(eventContext, message || 'Content sanitized');
                break;
        }
    }
    /**
     * パフォーマンスイベントをログに記録します
     *
     * @param event イベントタイプ
     * @param metrics メトリクス
     * @param context コンテキスト
     */
    logPerformanceEvent(event, metrics, context) {
        const eventContext = {
            ...context,
            ...metrics,
            event,
            feature: 'performance',
        };
        switch (event) {
            case 'slow_operation':
                this.warn(eventContext, `Slow operation detected: ${metrics.operation}`);
                break;
            case 'high_memory':
                this.warn(eventContext, 'High memory usage detected');
                break;
            case 'batch_processed':
                this.info(eventContext, `Batch processed: ${metrics.itemsProcessed} items`);
                break;
            case 'cache_hit':
                this.debug(eventContext, 'Cache hit');
                break;
            case 'cache_miss':
                this.debug(eventContext, 'Cache miss');
                break;
        }
    }
    /**
     * 子ロガーを作成します
     *
     * デフォルトコンテキストが設定された新しいロガーインスタンス
     *
     * @param context デフォルトコンテキスト
     * @returns 子ロガー
     */
    child(context) {
        const childLogger = new Logger();
        childLogger.logger = this.logger.child(context);
        childLogger.defaultContext = { ...this.defaultContext, ...context };
        return childLogger;
    }
    /**
     * 生のPinoロガーインスタンスを取得します
     *
     * @returns Pinoロガー
     */
    getPinoLogger() {
        return this.logger;
    }
}
// デフォルトエクスポート
export default Logger.getInstance();
//# sourceMappingURL=logger.js.map