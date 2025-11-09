/**
 * リトライオプション
 */
export interface RetryOptions {
    /** 最大リトライ回数（デフォルト: 3） */
    maxAttempts?: number;
    /** 初期遅延時間（ミリ秒、デフォルト: 1000） */
    initialDelayMs?: number;
    /** 最大遅延時間（ミリ秒、デフォルト: 30000） */
    maxDelayMs?: number;
    /** バックオフ戦略（'exponential' | 'linear' | 'constant'） */
    backoffStrategy?: 'exponential' | 'linear' | 'constant';
    /** 乗数（exponentialの場合、デフォルト: 2） */
    multiplier?: number;
    /** ジッター追加（ランダム遅延でサーバー負荷分散） */
    jitter?: boolean;
    /** リトライ可能エラーの判定関数 */
    shouldRetry?: (error: Error) => boolean;
    /** リトライ前のコールバック */
    onRetry?: (error: Error, attempt: number) => void | Promise<void>;
}
/**
 * リトライ統計
 */
export interface RetryStatistics {
    /** 関数名 */
    functionName: string;
    /** 合計試行回数 */
    totalAttempts: number;
    /** 成功回数 */
    successCount: number;
    /** 失敗回数 */
    failureCount: number;
    /** リトライ回数 */
    retryCount: number;
    /** 最終実行日時 */
    lastExecutionTime?: Date;
    /** 平均リトライ回数 */
    averageRetries: number;
    /** 成功率（0-100%） */
    successRate: number;
}
/**
 * Retry - リトライ機構
 *
 * @lifeomic/attemptを使用して、一時的なエラーに対する自動リトライを実装します。
 * ネットワークエラー、レート制限、一時的なサーバーエラーに対応します。
 *
 * @example
 * ```typescript
 * const retry = new Retry();
 *
 * // 基本的な使用
 * const result = await retry.execute(async () => {
 *   return await fetchData();
 * });
 *
 * // カスタムオプション
 * const result = await retry.execute(
 *   async () => await fetchData(),
 *   {
 *     maxAttempts: 5,
 *     initialDelayMs: 2000,
 *     backoffStrategy: 'exponential',
 *     jitter: true,
 *   }
 * );
 * ```
 */
export declare class Retry {
    private stats;
    /**
     * 関数をリトライ可能にして実行します
     *
     * @param fn 実行する非同期関数
     * @param options リトライオプション
     * @returns 関数の戻り値
     */
    execute<T>(fn: () => Promise<T>, options?: RetryOptions): Promise<T>;
    /**
     * デフォルトのリトライ判定関数
     *
     * 一時的なエラーのみリトライします
     *
     * @param error エラーオブジェクト
     * @returns リトライ可能な場合はtrue
     */
    private defaultShouldRetry;
    /**
     * 統計情報を初期化します
     *
     * @param funcName 関数名
     */
    private initStats;
    /**
     * リトライ回数をインクリメントします
     *
     * @param funcName 関数名
     */
    private incrementRetryCount;
    /**
     * 成功回数をインクリメントします
     *
     * @param funcName 関数名
     */
    private incrementSuccessCount;
    /**
     * 失敗回数をインクリメントします
     *
     * @param funcName 関数名
     */
    private incrementFailureCount;
    /**
     * 平均リトライ回数を更新します
     *
     * @param funcName 関数名
     */
    private updateAverageRetries;
    /**
     * 成功率を更新します
     *
     * @param funcName 関数名
     */
    private updateSuccessRate;
    /**
     * 統計情報を取得します
     *
     * @param funcName 関数名（省略時は全関数の統計）
     * @returns 統計情報
     */
    getStats(funcName?: string): RetryStatistics | Map<string, RetryStatistics>;
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
}
//# sourceMappingURL=retry.d.ts.map