import CircuitBreaker from 'opossum';
/**
 * Circuit Breakerの状態
 */
export declare enum CircuitState {
    /** 閉鎖（正常動作） */
    CLOSED = "CLOSED",
    /** 開放（エラー多発により遮断） */
    OPEN = "OPEN",
    /** 半開（試験的に再試行） */
    HALF_OPEN = "HALF_OPEN"
}
/**
 * Circuit Breakerオプション
 */
export interface CircuitBreakerOptions {
    /** タイムアウト時間（ミリ秒、デフォルト: 10000） */
    timeoutMs?: number;
    /** エラー閾値パーセンテージ（デフォルト: 50%） */
    errorThresholdPercentage?: number;
    /** リセット時間（ミリ秒、デフォルト: 30000） */
    resetTimeoutMs?: number;
    /** ローリングウィンドウサイズ（デフォルト: 10秒） */
    rollingCountTimeoutMs?: number;
    /** バケット数（デフォルト: 10） */
    rollingCountBuckets?: number;
    /** 最小リクエスト数（デフォルト: 20） */
    volumeThreshold?: number;
    /** キャパシティ（同時実行数、デフォルト: 10） */
    capacity?: number;
    /** フォールバック関数 */
    fallback?: (error: Error) => any;
    /** 状態変更時のコールバック */
    onStateChange?: (from: CircuitState, to: CircuitState) => void;
}
/**
 * Circuit Breaker統計
 */
export interface CircuitBreakerStatistics {
    /** 関数名 */
    functionName: string;
    /** 現在の状態 */
    state: CircuitState;
    /** 合計リクエスト数 */
    totalRequests: number;
    /** 成功数 */
    successCount: number;
    /** 失敗数 */
    failureCount: number;
    /** タイムアウト数 */
    timeoutCount: number;
    /** フォールバック実行数 */
    fallbackCount: number;
    /** 開放回数 */
    openCount: number;
    /** 最終実行日時 */
    lastExecutionTime?: Date;
    /** 成功率（0-100%） */
    successRate: number;
    /** エラー率（0-100%） */
    errorRate: number;
}
/**
 * CircuitBreakerManager - サーキットブレーカー機構
 *
 * opossumを使用して、連続するエラーからシステムを保護します。
 * エラー多発時に処理を遮断し、システムの過負荷を防ぎます。
 *
 * @example
 * ```typescript
 * const manager = new CircuitBreakerManager();
 *
 * // Circuit Breakerを作成
 * const breaker = manager.createBreaker(
 *   'syncToFile',
 *   async (data) => {
 *     return await syncToFile(data);
 *   },
 *   {
 *     timeoutMs: 5000,
 *     errorThresholdPercentage: 50,
 *     resetTimeoutMs: 30000,
 *     fallback: (error) => {
 *       console.error('Circuit is open, using fallback', error);
 *       return null;
 *     },
 *   }
 * );
 *
 * // 実行
 * const result = await breaker.fire(data);
 * ```
 */
export declare class CircuitBreakerManager {
    private breakers;
    private stats;
    /**
     * Circuit Breakerを作成します
     *
     * @param name Circuit Breaker名
     * @param fn 実行する非同期関数
     * @param options オプション
     * @returns Circuit Breakerインスタンス
     */
    createBreaker<T extends any[], R>(name: string, fn: (...args: T) => Promise<R>, options?: CircuitBreakerOptions): CircuitBreaker<T, R>;
    /**
     * Circuit Breakerを取得します
     *
     * @param name Circuit Breaker名
     * @returns Circuit Breakerインスタンス（存在しない場合はundefined）
     */
    getBreaker(name: string): CircuitBreaker | undefined;
    /**
     * Circuit Breakerを削除します
     *
     * @param name Circuit Breaker名
     */
    removeBreaker(name: string): void;
    /**
     * すべてのCircuit Breakerを削除します
     */
    removeAll(): void;
    /**
     * イベントリスナーをアタッチします
     *
     * @param breaker Circuit Breakerインスタンス
     * @param name Circuit Breaker名
     * @param onStateChange 状態変更時のコールバック
     */
    private attachEventListeners;
    /**
     * 統計情報を初期化します
     *
     * @param name Circuit Breaker名
     */
    private initStats;
    /**
     * 成功回数をインクリメントします
     *
     * @param name Circuit Breaker名
     */
    private incrementSuccessCount;
    /**
     * 失敗回数をインクリメントします
     *
     * @param name Circuit Breaker名
     */
    private incrementFailureCount;
    /**
     * タイムアウト回数をインクリメントします
     *
     * @param name Circuit Breaker名
     */
    private incrementTimeoutCount;
    /**
     * フォールバック実行回数をインクリメントします
     *
     * @param name Circuit Breaker名
     */
    private incrementFallbackCount;
    /**
     * 開放回数をインクリメントします
     *
     * @param name Circuit Breaker名
     */
    private incrementOpenCount;
    /**
     * 状態を更新します
     *
     * @param name Circuit Breaker名
     * @param state 新しい状態
     */
    private updateState;
    /**
     * 成功率とエラー率を更新します
     *
     * @param name Circuit Breaker名
     */
    private updateRates;
    /**
     * 統計情報を取得します
     *
     * @param name Circuit Breaker名（省略時は全Circuit Breakerの統計）
     * @returns 統計情報
     */
    getStats(name?: string): CircuitBreakerStatistics | Map<string, CircuitBreakerStatistics>;
    /**
     * 統計情報をリセットします
     *
     * @param name Circuit Breaker名（省略時は全Circuit Breakerをリセット）
     */
    resetStats(name?: string): void;
    /**
     * 統計情報を人間が読みやすい形式で出力します
     *
     * @param name Circuit Breaker名（省略時は全Circuit Breakerの統計）
     * @returns フォーマットされた文字列
     */
    formatStats(name?: string): string;
    /**
     * ヘルスチェックレポートを生成します
     *
     * @returns ヘルスチェックレポート
     */
    getHealthReport(): {
        healthy: boolean;
        breakers: Array<{
            name: string;
            state: CircuitState;
            healthy: boolean;
            stats: CircuitBreakerStatistics;
        }>;
    };
}
//# sourceMappingURL=circuit-breaker.d.ts.map