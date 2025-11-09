import { EventEmitter } from 'events';
import type { SyncConfig } from '../types';
/**
 * FileWatcherのオプション
 */
export interface FileWatcherOptions {
    /** 監視対象ファイルパス */
    filePath: string;
    /** 同期設定 */
    config: SyncConfig;
    /** デバウンス時間（ミリ秒） */
    debounceMs?: number;
    /** スロットル時間（ミリ秒） */
    throttleMs?: number;
    /** 最大ファイルサイズ（MB） */
    maxFileSizeMB?: number;
    /** リトライ回数 */
    maxRetries?: number;
    /** リトライ間隔（ミリ秒） */
    retryDelayMs?: number;
    /** 無視するイベントパターン */
    ignorePatterns?: string[];
}
/**
 * ファイル監視統計
 */
export interface WatcherStatistics {
    /** 監視開始日時 */
    startedAt?: Date;
    /** 合計イベント数 */
    totalEvents: number;
    /** イベントタイプ別カウント */
    eventCounts: {
        change: number;
        add: number;
        unlink: number;
        error: number;
    };
    /** 最終イベント日時 */
    lastEventAt?: Date;
    /** 最終イベントタイプ */
    lastEventType?: string;
    /** エラー数 */
    errorCount: number;
    /** リトライ数 */
    retryCount: number;
    /** 監視中フラグ */
    isWatching: boolean;
    /** 現在のファイルサイズ（バイト） */
    currentFileSize?: number;
    /** 最終変更日時 */
    lastModifiedAt?: Date;
}
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
export declare class FileWatcher extends EventEmitter {
    private watcher?;
    private pathValidator;
    private rateLimiter;
    private logger;
    private options;
    private stats;
    private validatedPath;
    private retryTimeouts;
    private rateLimitedHandlers;
    /**
     * @param options ファイルウォッチャーのオプション
     */
    constructor(options: FileWatcherOptions);
    /**
     * レート制限されたイベントハンドラをセットアップ
     */
    private setupRateLimitedHandlers;
    /**
     * ファイル監視を開始
     */
    start(): Promise<void>;
    /**
     * ファイル監視を停止
     */
    stop(): Promise<void>;
    /**
     * ファイルイベントを処理
     */
    private handleFileEvent;
    /**
     * イベントを発行
     */
    private emitEvent;
    /**
     * エラーを処理
     */
    private handleError;
    /**
     * リトライをスケジュール
     */
    private scheduleRetry;
    /**
     * ファイルサイズを検証
     */
    private validateFileSize;
    /**
     * 統計情報を更新
     */
    private updateStatistics;
    /**
     * 監視統計情報を取得
     */
    getStats(): WatcherStatistics;
    /**
     * 監視中かどうかを確認
     */
    isWatching(): boolean;
    /**
     * ファイルパスを取得
     */
    getFilePath(): string;
    /**
     * レート制限統計を取得
     */
    getRateLimiterStats(): Map<string, any>;
    /**
     * 統計情報をリセット
     */
    resetStats(): void;
    /**
     * 即座に保留中のイベントをフラッシュ
     */
    flush(): void;
    /**
     * 現在のファイル情報を取得
     */
    getFileInfo(): Promise<{
        exists: boolean;
        size?: number;
        mtime?: Date;
        isReadable?: boolean;
        isWritable?: boolean;
    }>;
    /**
     * リソースをクリーンアップ
     */
    dispose(): Promise<void>;
}
/**
 * FileWatcherファクトリー関数
 *
 * @param options ファイルウォッチャーのオプション
 * @returns FileWatcherインスタンス
 */
export declare function createFileWatcher(options: FileWatcherOptions): FileWatcher;
//# sourceMappingURL=file-watcher.d.ts.map