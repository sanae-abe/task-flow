import { throttle, debounce } from 'lodash-es';
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
export class RateLimiter {
    stats = new Map();
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
    debounce(func, options = {}) {
        const { debounceMs = 500, maxWait } = options;
        const funcName = func.name || 'anonymous';
        this.initStats(funcName);
        const wrappedFunc = (...args) => {
            this.incrementCallCount(funcName);
            return func(...args);
        };
        const debouncedFunc = debounce(wrappedFunc, debounceMs, {
            maxWait,
        });
        // 実行カウントを追跡
        const originalFunc = debouncedFunc;
        const trackedFunc = ((...args) => {
            const result = originalFunc(...args);
            this.incrementExecutionCount(funcName);
            return result;
        });
        trackedFunc.cancel = originalFunc.cancel;
        trackedFunc.flush = originalFunc.flush;
        return trackedFunc;
    }
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
    throttle(func, options = {}) {
        const { throttleMs = 2000, leading = true, trailing = true } = options;
        const funcName = func.name || 'anonymous';
        this.initStats(funcName);
        const wrappedFunc = (...args) => {
            this.incrementCallCount(funcName);
            return func(...args);
        };
        const throttledFunc = throttle(wrappedFunc, throttleMs, {
            leading,
            trailing,
        });
        // 実行カウントを追跡
        const originalFunc = throttledFunc;
        const trackedFunc = ((...args) => {
            const result = originalFunc(...args);
            this.incrementExecutionCount(funcName);
            return result;
        });
        trackedFunc.cancel = originalFunc.cancel;
        trackedFunc.flush = originalFunc.flush;
        return trackedFunc;
    }
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
    rateLimit(func, options = {}) {
        const { debounceMs = 500, throttleMs = 2000 } = options;
        // Debounce with maxWait (= throttle effect)
        return this.debounce(func, {
            debounceMs,
            maxWait: throttleMs,
        });
    }
    /**
     * 統計情報を初期化します
     *
     * @param funcName 関数名
     */
    initStats(funcName) {
        if (!this.stats.has(funcName)) {
            this.stats.set(funcName, {
                totalCalls: 0,
                executedCalls: 0,
                skippedCalls: 0,
                skipRate: 0,
            });
        }
    }
    /**
     * 呼び出し回数をインクリメントします
     *
     * @param funcName 関数名
     */
    incrementCallCount(funcName) {
        const stats = this.stats.get(funcName);
        if (stats) {
            stats.totalCalls++;
            stats.lastCallTime = new Date();
            this.updateSkipRate(funcName);
        }
    }
    /**
     * 実行回数をインクリメントします
     *
     * @param funcName 関数名
     */
    incrementExecutionCount(funcName) {
        const stats = this.stats.get(funcName);
        if (stats) {
            stats.executedCalls++;
            stats.lastExecutionTime = new Date();
            this.updateSkipRate(funcName);
        }
    }
    /**
     * スキップ率を更新します
     *
     * @param funcName 関数名
     */
    updateSkipRate(funcName) {
        const stats = this.stats.get(funcName);
        if (stats) {
            stats.skippedCalls = stats.totalCalls - stats.executedCalls;
            stats.skipRate =
                stats.totalCalls > 0
                    ? Math.round((stats.skippedCalls / stats.totalCalls) * 100)
                    : 0;
        }
    }
    /**
     * 統計情報を取得します
     *
     * @param funcName 関数名（省略時は全関数の統計）
     * @returns 統計情報
     */
    getStats(funcName) {
        if (funcName) {
            return (this.stats.get(funcName) || {
                totalCalls: 0,
                executedCalls: 0,
                skippedCalls: 0,
                skipRate: 0,
            });
        }
        return new Map(this.stats);
    }
    /**
     * 統計情報をリセットします
     *
     * @param funcName 関数名（省略時は全関数をリセット）
     */
    resetStats(funcName) {
        if (funcName) {
            this.stats.delete(funcName);
        }
        else {
            this.stats.clear();
        }
    }
    /**
     * 統計情報を人間が読みやすい形式で出力します
     *
     * @param funcName 関数名（省略時は全関数の統計）
     * @returns フォーマットされた文字列
     */
    formatStats(funcName) {
        const stats = funcName
            ? new Map([[funcName, this.getStats(funcName)]])
            : this.getStats();
        const lines = [];
        lines.push('=== Rate Limiter Statistics ===');
        for (const [name, stat] of stats) {
            lines.push(`\n[${name}]`);
            lines.push(`  Total Calls: ${stat.totalCalls}`);
            lines.push(`  Executed: ${stat.executedCalls}`);
            lines.push(`  Skipped: ${stat.skippedCalls}`);
            lines.push(`  Skip Rate: ${stat.skipRate}%`);
            if (stat.lastExecutionTime) {
                lines.push(`  Last Execution: ${stat.lastExecutionTime.toISOString()}`);
            }
            if (stat.lastCallTime) {
                lines.push(`  Last Call: ${stat.lastCallTime.toISOString()}`);
            }
        }
        return lines.join('\n');
    }
    /**
     * パフォーマンスレポートを生成します
     *
     * @returns パフォーマンスレポート
     */
    getPerformanceReport() {
        const allStats = this.getStats();
        let totalCalls = 0;
        let totalExecutions = 0;
        let totalSkipped = 0;
        const functions = [];
        for (const [name, stats] of allStats) {
            totalCalls += stats.totalCalls;
            totalExecutions += stats.executedCalls;
            totalSkipped += stats.skippedCalls;
            functions.push({ name, stats });
        }
        const averageSkipRate = totalCalls > 0 ? Math.round((totalSkipped / totalCalls) * 100) : 0;
        return {
            totalFunctions: allStats.size,
            totalCalls,
            totalExecutions,
            totalSkipped,
            averageSkipRate,
            functions,
        };
    }
    /**
     * すべての実行中のタイマーをキャンセルします
     */
    cancelAll() {
        // 統計情報のみリセット（実際の関数はユーザーが保持）
        this.stats.clear();
    }
}
//# sourceMappingURL=rate-limiter.js.map