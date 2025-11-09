import CircuitBreaker from 'opossum';

// opossum types (define manually as @types/opossum may be incomplete)
interface OposumOptions {
  timeout?: number;
  errorThresholdPercentage?: number;
  resetTimeout?: number;
  rollingCountTimeout?: number;
  rollingCountBuckets?: number;
  name?: string;
  rollingPercentilesEnabled?: boolean;
  capacity?: number;
  errorFilter?: (error: Error) => boolean;
  volumeThreshold?: number;
  enabled?: boolean;
}

/**
 * Circuit Breakerの状態
 */
export enum CircuitState {
  /** 閉鎖（正常動作） */
  CLOSED = 'CLOSED',
  /** 開放（エラー多発により遮断） */
  OPEN = 'OPEN',
  /** 半開（試験的に再試行） */
  HALF_OPEN = 'HALF_OPEN',
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
export class CircuitBreakerManager {
  private breakers: Map<string, CircuitBreaker> = new Map();
  private stats: Map<string, CircuitBreakerStatistics> = new Map();

  /**
   * Circuit Breakerを作成します
   *
   * @param name Circuit Breaker名
   * @param fn 実行する非同期関数
   * @param options オプション
   * @returns Circuit Breakerインスタンス
   */
  createBreaker<T extends any[], R>(
    name: string,
    fn: (...args: T) => Promise<R>,
    options: CircuitBreakerOptions = {}
  ): CircuitBreaker<T, R> {
    // 既存のBreakerがあれば削除
    if (this.breakers.has(name)) {
      this.removeBreaker(name);
    }

    const {
      timeoutMs = 10000,
      errorThresholdPercentage = 50,
      resetTimeoutMs = 30000,
      rollingCountTimeoutMs = 10000,
      rollingCountBuckets = 10,
      volumeThreshold = 20,
      capacity = 10,
      fallback,
      onStateChange,
    } = options;

    // 統計情報を初期化
    this.initStats(name);

    // Opossumオプション
    const opossumOptions: OposumOptions = {
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
  getBreaker(name: string): CircuitBreaker | undefined {
    return this.breakers.get(name);
  }

  /**
   * Circuit Breakerを削除します
   *
   * @param name Circuit Breaker名
   */
  removeBreaker(name: string): void {
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
  removeAll(): void {
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
  private attachEventListeners(
    breaker: CircuitBreaker,
    name: string,
    onStateChange?: (from: CircuitState, to: CircuitState) => void
  ): void {
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
  private initStats(name: string): void {
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
  private incrementSuccessCount(name: string): void {
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
  private incrementFailureCount(name: string): void {
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
  private incrementTimeoutCount(name: string): void {
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
  private incrementFallbackCount(name: string): void {
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
  private incrementOpenCount(name: string): void {
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
  private updateState(name: string, state: CircuitState): void {
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
  private updateRates(name: string): void {
    const stats = this.stats.get(name);
    if (stats && stats.totalRequests > 0) {
      stats.successRate = Math.round(
        (stats.successCount / stats.totalRequests) * 100
      );
      stats.errorRate = Math.round(
        (stats.failureCount / stats.totalRequests) * 100
      );
    }
  }

  /**
   * 統計情報を取得します
   *
   * @param name Circuit Breaker名（省略時は全Circuit Breakerの統計）
   * @returns 統計情報
   */
  getStats(
    name?: string
  ): CircuitBreakerStatistics | Map<string, CircuitBreakerStatistics> {
    if (name) {
      return (
        this.stats.get(name) || {
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
        }
      );
    }
    return new Map(this.stats);
  }

  /**
   * 統計情報をリセットします
   *
   * @param name Circuit Breaker名（省略時は全Circuit Breakerをリセット）
   */
  resetStats(name?: string): void {
    if (name) {
      const breaker = this.breakers.get(name);
      if (breaker) {
        // clearStats() is not available in all opossum versions
        // Reset by deleting and reinitializing stats
      }
      this.stats.delete(name);
      this.initStats(name);
    } else {
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
  formatStats(name?: string): string {
    const stats = name
      ? new Map([[name, this.getStats(name) as CircuitBreakerStatistics]])
      : (this.getStats() as Map<string, CircuitBreakerStatistics>);

    const lines: string[] = [];
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
  getHealthReport(): {
    healthy: boolean;
    breakers: Array<{
      name: string;
      state: CircuitState;
      healthy: boolean;
      stats: CircuitBreakerStatistics;
    }>;
  } {
    const breakers: Array<{
      name: string;
      state: CircuitState;
      healthy: boolean;
      stats: CircuitBreakerStatistics;
    }> = [];

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
