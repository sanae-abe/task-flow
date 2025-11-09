import { Logger as PinoLogger } from 'pino';
/**
 * ログレベル
 */
export type LogLevel = 'trace' | 'debug' | 'info' | 'warn' | 'error' | 'fatal';
/**
 * ログコンテキスト
 */
export interface LogContext {
    /** リクエストID */
    requestId?: string;
    /** ユーザーID */
    userId?: string;
    /** セッションID */
    sessionId?: string;
    /** 機能名 */
    feature?: string;
    /** 操作名 */
    operation?: string;
    /** タスクID */
    taskId?: string;
    /** ファイルパス */
    filePath?: string;
    /** 同期方向 */
    syncDirection?: 'file_to_app' | 'app_to_file';
    /** その他のコンテキスト情報 */
    [key: string]: any;
}
/**
 * パフォーマンス測定結果
 */
export interface PerformanceMetrics {
    /** 処理名 */
    operation: string;
    /** 所要時間（ミリ秒） */
    durationMs: number;
    /** 開始時刻 */
    startTime: Date;
    /** 終了時刻 */
    endTime: Date;
    /** 処理されたアイテム数 */
    itemsProcessed?: number;
    /** スループット（アイテム/秒） */
    throughput?: number;
    /** メモリ使用量（バイト） */
    memoryUsed?: number;
    /** 追加メトリクス */
    [key: string]: any;
}
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
export declare class Logger {
    private static instance;
    private logger;
    private defaultContext;
    private constructor();
    /**
     * シングルトンインスタンスを取得します
     *
     * @returns Loggerインスタンス
     */
    static getInstance(): Logger;
    /**
     * デフォルトコンテキストを設定します
     *
     * すべてのログに自動的に追加されるコンテキスト情報
     *
     * @param context コンテキスト情報
     */
    setDefaultContext(context: LogContext): void;
    /**
     * デフォルトコンテキストをクリアします
     */
    clearDefaultContext(): void;
    /**
     * コンテキストをマージします
     *
     * @param context 追加コンテキスト
     * @returns マージされたコンテキスト
     */
    private mergeContext;
    /**
     * TRACEレベルのログを出力します
     *
     * @param contextOrMessage コンテキストまたはメッセージ
     * @param message メッセージ（第1引数がコンテキストの場合）
     */
    trace(contextOrMessage: LogContext | string, message?: string): void;
    /**
     * DEBUGレベルのログを出力します
     *
     * @param contextOrMessage コンテキストまたはメッセージ
     * @param message メッセージ（第1引数がコンテキストの場合）
     */
    debug(contextOrMessage: LogContext | string, message?: string): void;
    /**
     * INFOレベルのログを出力します
     *
     * @param contextOrMessage コンテキストまたはメッセージ
     * @param message メッセージ（第1引数がコンテキストの場合）
     */
    info(contextOrMessage: LogContext | string, message?: string): void;
    /**
     * WARNレベルのログを出力します
     *
     * @param contextOrMessage コンテキストまたはメッセージ
     * @param message メッセージ（第1引数がコンテキストの場合）
     */
    warn(contextOrMessage: LogContext | string, message?: string): void;
    /**
     * ERRORレベルのログを出力します
     *
     * @param contextOrMessage コンテキストまたはメッセージ
     * @param message メッセージ（第1引数がコンテキストの場合）
     */
    error(contextOrMessage: LogContext | string, message?: string): void;
    /**
     * FATALレベルのログを出力します
     *
     * @param contextOrMessage コンテキストまたはメッセージ
     * @param message メッセージ（第1引数がコンテキストの場合）
     */
    fatal(contextOrMessage: LogContext | string, message?: string): void;
    /**
     * パフォーマンス測定を開始します
     *
     * @param operation 操作名
     * @param context 追加コンテキスト
     * @returns タイマーオブジェクト
     */
    startTimer(operation: string, context?: LogContext): {
        done: (metrics?: Partial<PerformanceMetrics>) => void;
    };
    /**
     * 同期イベントをログに記録します
     *
     * @param event イベントタイプ
     * @param context コンテキスト
     * @param message メッセージ
     */
    logSyncEvent(event: 'start' | 'success' | 'failure' | 'conflict' | 'skip', context: LogContext, message?: string): void;
    /**
     * セキュリティイベントをログに記録します
     *
     * @param event イベントタイプ
     * @param context コンテキスト
     * @param message メッセージ
     */
    logSecurityEvent(event: 'auth_success' | 'auth_failure' | 'path_traversal' | 'xss_detected' | 'sanitized', context: LogContext, message?: string): void;
    /**
     * パフォーマンスイベントをログに記録します
     *
     * @param event イベントタイプ
     * @param metrics メトリクス
     * @param context コンテキスト
     */
    logPerformanceEvent(event: 'slow_operation' | 'high_memory' | 'batch_processed' | 'cache_hit' | 'cache_miss', metrics: Partial<PerformanceMetrics>, context?: LogContext): void;
    /**
     * 子ロガーを作成します
     *
     * デフォルトコンテキストが設定された新しいロガーインスタンス
     *
     * @param context デフォルトコンテキスト
     * @returns 子ロガー
     */
    child(context: LogContext): Logger;
    /**
     * 生のPinoロガーインスタンスを取得します
     *
     * @returns Pinoロガー
     */
    getPinoLogger(): PinoLogger;
}
declare const _default: Logger;
export default _default;
//# sourceMappingURL=logger.d.ts.map