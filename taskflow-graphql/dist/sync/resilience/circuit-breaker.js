import CircuitBreaker from 'opossum';
/**
 * Circuit Breakerの状態
 */
export var CircuitState;
(function (CircuitState) {
    /** 閉鎖（正常動作） */
    CircuitState["CLOSED"] = "CLOSED";
    /** 開放（エラー多発により遮断） */
    CircuitState["OPEN"] = "OPEN";
    /** 半開（試験的に再試行） */
    CircuitState["HALF_OPEN"] = "HALF_OPEN";
})(CircuitState || (CircuitState = {}));
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
export class CircuitBreakerManager {
    breakers = new Map();
    stats = new Map();
    /**
     * Circuit Breakerを作成します
     *
     * @param name Circuit Breaker名
     * @param fn 実行する非同期関数
     * @param options オプション
     * @returns Circuit Breakerインスタンス
     */
    createBreaker(name, fn, options = {}) {
        // 既存のBreakerがあれば削除
        if (this.breakers.has(name)) {
            this.removeBreaker(name);
        }
        const { timeoutMs = 10000, errorThresholdPercentage = 50, resetTimeoutMs = 30000, rollingCountTimeoutMs = 10000, rollingCountBuckets = 10, volumeThreshold = 20, capacity = 10, fallback, onStateChange, } = options;
        // 統計情報を初期化
        this.initStats(name);
        // Opossumオプション
        const opossumOptions = {
            timeout: timeoutMs,
            errorThresholdPercentage,
            resetTimeout: resetTimeoutMs,
            rollingCountTimeout: rollingCountTimeoutMs,
            rollingCountBuckets,
            volumeThreshold,
            capacity,
            name,
        };
        // Circuit Breaker作成
        const breaker = new CircuitBreaker(fn, opossumOptions);
        // Fallback設定
        if (fallback) {
            breaker.fallback(fallback);
        }
        // イベントリスナー設定
        this.attachEventListeners(breaker, name, onStateChange);
        // 保存
        this.breakers.set(name, breaker);
        return breaker;
    }
    /**
     * Circuit Breakerを取得します
     *
     * @param name Circuit Breaker名
     * @returns Circuit Breakerインスタンス（存在しない場合はundefined）
     */
    getBreaker(name) {
        return this.breakers.get(name);
    }
    /**
     * Circuit Breakerを削除します
     *
     * @param name Circuit Breaker名
     */
    removeBreaker(name) {
        const breaker = this.breakers.get(name);
        if (breaker) {
            breaker.shutdown();
            this.breakers.delete(name);
            this.stats.delete(name);
        }
    }
    /**
     * すべてのCircuit Breakerを削除します
     */
    removeAll() {
        for (const [name] of this.breakers) {
            this.removeBreaker(name);
        }
    }
    /**
     * イベントリスナーをアタッチします
     *
     * @param breaker Circuit Breakerインスタンス
     * @param name Circuit Breaker名
     * @param onStateChange 状態変更時のコールバック
     */
    attachEventListeners(breaker, name, onStateChange) {
        // 成功
        breaker.on('success', () => {
            this.incrementSuccessCount(name);
        });
        // 失敗
        breaker.on('failure', () => {
            this.incrementFailureCount(name);
        });
        // タイムアウト
        breaker.on('timeout', () => {
            this.incrementTimeoutCount(name);
        });
        // フォールバック
        breaker.on('fallback', () => {
            this.incrementFallbackCount(name);
        });
        // 開放
        breaker.on('open', () => {
            this.incrementOpenCount(name);
            this.updateState(name, CircuitState.OPEN);
            if (onStateChange) {
                onStateChange(CircuitState.CLOSED, CircuitState.OPEN);
            }
        });
        // 半開
        breaker.on('halfOpen', () => {
            this.updateState(name, CircuitState.HALF_OPEN);
            if (onStateChange) {
                onStateChange(CircuitState.OPEN, CircuitState.HALF_OPEN);
            }
        });
        // 閉鎖
        breaker.on('close', () => {
            this.updateState(name, CircuitState.CLOSED);
            if (onStateChange) {
                onStateChange(CircuitState.HALF_OPEN, CircuitState.CLOSED);
            }
        });
    }
    /**
     * 統計情報を初期化します
     *
     * @param name Circuit Breaker名
     */
    initStats(name) {
        if (!this.stats.has(name)) {
            this.stats.set(name, {
                functionName: name,
                state: CircuitState.CLOSED,
                totalRequests: 0,
                successCount: 0,
                failureCount: 0,
                timeoutCount: 0,
                fallbackCount: 0,
                openCount: 0,
                successRate: 0,
                errorRate: 0,
            });
        }
    }
    /**
     * 成功回数をインクリメントします
     *
     * @param name Circuit Breaker名
     */
    incrementSuccessCount(name) {
        const stats = this.stats.get(name);
        if (stats) {
            stats.totalRequests++;
            stats.successCount++;
            stats.lastExecutionTime = new Date();
            this.updateRates(name);
        }
    }
    /**
     * 失敗回数をインクリメントします
     *
     * @param name Circuit Breaker名
     */
    incrementFailureCount(name) {
        const stats = this.stats.get(name);
        if (stats) {
            stats.totalRequests++;
            stats.failureCount++;
            stats.lastExecutionTime = new Date();
            this.updateRates(name);
        }
    }
    /**
     * タイムアウト回数をインクリメントします
     *
     * @param name Circuit Breaker名
     */
    incrementTimeoutCount(name) {
        const stats = this.stats.get(name);
        if (stats) {
            stats.timeoutCount++;
        }
    }
    /**
     * フォールバック実行回数をインクリメントします
     *
     * @param name Circuit Breaker名
     */
    incrementFallbackCount(name) {
        const stats = this.stats.get(name);
        if (stats) {
            stats.fallbackCount++;
        }
    }
    /**
     * 開放回数をインクリメントします
     *
     * @param name Circuit Breaker名
     */
    incrementOpenCount(name) {
        const stats = this.stats.get(name);
        if (stats) {
            stats.openCount++;
        }
    }
    /**
     * 状態を更新します
     *
     * @param name Circuit Breaker名
     * @param state 新しい状態
     */
    updateState(name, state) {
        const stats = this.stats.get(name);
        if (stats) {
            stats.state = state;
        }
    }
    /**
     * 成功率とエラー率を更新します
     *
     * @param name Circuit Breaker名
     */
    updateRates(name) {
        const stats = this.stats.get(name);
        if (stats && stats.totalRequests > 0) {
            stats.successRate = Math.round((stats.successCount / stats.totalRequests) * 100);
            stats.errorRate = Math.round((stats.failureCount / stats.totalRequests) * 100);
        }
    }
    /**
     * 統計情報を取得します
     *
     * @param name Circuit Breaker名（省略時は全Circuit Breakerの統計）
     * @returns 統計情報
     */
    getStats(name) {
        if (name) {
            return (this.stats.get(name) || {
                functionName: name,
                state: CircuitState.CLOSED,
                totalRequests: 0,
                successCount: 0,
                failureCount: 0,
                timeoutCount: 0,
                fallbackCount: 0,
                openCount: 0,
                successRate: 0,
                errorRate: 0,
            });
        }
        return new Map(this.stats);
    }
    /**
     * 統計情報をリセットします
     *
     * @param name Circuit Breaker名（省略時は全Circuit Breakerをリセット）
     */
    resetStats(name) {
        if (name) {
            const breaker = this.breakers.get(name);
            if (breaker) {
                breaker.clearStats();
            }
            this.stats.delete(name);
            this.initStats(name);
        }
        else {
            for (const [breakerName] of this.breakers) {
                this.resetStats(breakerName);
            }
        }
    }
    /**
     * 統計情報を人間が読みやすい形式で出力します
     *
     * @param name Circuit Breaker名（省略時は全Circuit Breakerの統計）
     * @returns フォーマットされた文字列
     */
    formatStats(name) {
        const stats = name
            ? new Map([[name, this.getStats(name)]])
            : this.getStats();
        const lines = [];
        lines.push('=== Circuit Breaker Statistics ===');
        for (const [breakerName, stat] of stats) {
            lines.push(`\n[${breakerName}]`);
            lines.push(`  State: ${stat.state}`);
            lines.push(`  Total Requests: ${stat.totalRequests}`);
            lines.push(`  Success: ${stat.successCount}`);
            lines.push(`  Failure: ${stat.failureCount}`);
            lines.push(`  Timeout: ${stat.timeoutCount}`);
            lines.push(`  Fallback: ${stat.fallbackCount}`);
            lines.push(`  Open Count: ${stat.openCount}`);
            lines.push(`  Success Rate: ${stat.successRate}%`);
            lines.push(`  Error Rate: ${stat.errorRate}%`);
            if (stat.lastExecutionTime) {
                lines.push(`  Last Execution: ${stat.lastExecutionTime.toISOString()}`);
            }
        }
        return lines.join('\n');
    }
    /**
     * ヘルスチェックレポートを生成します
     *
     * @returns ヘルスチェックレポート
     */
    getHealthReport() {
        const breakers = [];
        let allHealthy = true;
        for (const [name, stat] of this.stats) {
            const healthy = stat.state === CircuitState.CLOSED;
            if (!healthy) {
                allHealthy = false;
            }
            breakers.push({
                name,
                state: stat.state,
                healthy,
                stats: stat,
            });
        }
        return {
            healthy: allHealthy,
            breakers,
        };
    }
}
//# sourceMappingURL=circuit-breaker.js.map