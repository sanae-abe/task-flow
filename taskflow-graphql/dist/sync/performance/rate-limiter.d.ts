/**
 * レート制限オプション
 */
export interface RateLimitOptions {
    /** デバウンス時間（ミリ秒） */
    debounceMs?: number;
    /** スロットル時間（ミリ秒） */
    throttleMs?: number;
    /** 先頭実行（throttle用） */
    leading?: boolean;
    /** 末尾実行（throttle用） */
    trailing?: boolean;
    /** 最大待機時間（debounce用） */
    maxWait?: number;
}
/**
 * 実行統計
 */
export interface ExecutionStats {
    /** 合計呼び出し回数 */
    totalCalls: number;
    /** 実際に実行された回数 */
    executedCalls: number;
    /** スキップされた回数 */
    skippedCalls: number;
    /** 最終実行時刻 */
    lastExecutionTime?: Date;
    /** 最終呼び出し時刻 */
    lastCallTime?: Date;
    /** スキップ率（0-100%） */
    skipRate: number;
}
/**
 * RateLimiter - レート制限（Throttle + Debounce）
 *
 * ファイル監視による過剰な同期を防ぎます。
 * Throttle（一定時間に1回のみ実行）とDebounce（連続呼び出しの最後のみ実行）を組み合わせます。
 *
 * @example
 * ```typescript
 * const limiter = new RateLimiter();
 *
 * // Debounce: 連続呼び出しの最後のみ実行（500ms後）
 * const debouncedSync = limiter.debounce(syncFunction, { debounceMs: 500 });
 *
 * // Throttle: 一定時間に1回のみ実行（2000msごと）
 * const throttledSync = limiter.throttle(syncFunction, { throttleMs: 2000 });
 *
 * // 組み合わせ: Debounce + Throttle
 * const rateLimitedSync = limiter.rateLimit(syncFunction, {
 *   debounceMs: 500,
 *   throttleMs: 2000,
 * });
 * ```
 */
export declare class RateLimiter {
    private stats;
    /**
     * Debounce関数を作成します
     *
     * 連続呼び出しの最後のみを実行します。
     * 例: ユーザーがタイピング中は実行せず、タイピング停止後500ms後に実行
     *
     * @param func 実行する関数
     * @param options オプション
     * @returns デバウンスされた関数
     */
    debounce<T extends (...args: any[]) => any>(func: T, options?: RateLimitOptions): T & {
        cancel: () => void;
        flush: () => void;
    };
    /**
     * Throttle関数を作成します
     *
     * 一定時間内に1回のみ実行します。
     * 例: スクロールイベントを2000msごとに1回のみ実行
     *
     * @param func 実行する関数
     * @param options オプション
     * @returns スロットルされた関数
     */
    throttle<T extends (...args: any[]) => any>(func: T, options?: RateLimitOptions): T & {
        cancel: () => void;
        flush: () => void;
    };
    /**
     * Debounce + Throttleの組み合わせ関数を作成します
     *
     * 連続呼び出しをデバウンスしつつ、最大待機時間でスロットルします。
     * これにより、過剰な実行を防ぎながらも、一定時間内には必ず実行されることを保証します。
     *
     * @param func 実行する関数
     * @param options オプション
     * @returns レート制限された関数
     */
    rateLimit<T extends (...args: any[]) => any>(func: T, options?: RateLimitOptions): T & {
        cancel: () => void;
        flush: () => void;
    };
    /**
     * 統計情報を初期化します
     *
     * @param funcName 関数名
     */
    private initStats;
    /**
     * 呼び出し回数をインクリメントします
     *
     * @param funcName 関数名
     */
    private incrementCallCount;
    /**
     * 実行回数をインクリメントします
     *
     * @param funcName 関数名
     */
    private incrementExecutionCount;
    /**
     * スキップ率を更新します
     *
     * @param funcName 関数名
     */
    private updateSkipRate;
    /**
     * 統計情報を取得します
     *
     * @param funcName 関数名（省略時は全関数の統計）
     * @returns 統計情報
     */
    getStats(funcName?: string): ExecutionStats | Map<string, ExecutionStats>;
    /**
     * 統計情報をリセットします
     *
     * @param funcName 関数名（省略時は全関数をリセット）
     */
    resetStats(funcName?: string): void;
    /**
     * 統計情報を人間が読みやすい形式で出力します
     *
     * @param funcName 関数名（省略時は全関数の統計）
     * @returns フォーマットされた文字列
     */
    formatStats(funcName?: string): string;
    /**
     * パフォーマンスレポートを生成します
     *
     * @returns パフォーマンスレポート
     */
    getPerformanceReport(): {
        totalFunctions: number;
        totalCalls: number;
        totalExecutions: number;
        totalSkipped: number;
        averageSkipRate: number;
        functions: Array<{
            name: string;
            stats: ExecutionStats;
        }>;
    };
    /**
     * すべての実行中のタイマーをキャンセルします
     */
    cancelAll(): void;
}
//# sourceMappingURL=rate-limiter.d.ts.map