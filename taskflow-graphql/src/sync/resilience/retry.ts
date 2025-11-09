import { retry as retryAsync } from '@lifeomic/attempt';

// @lifeomic/attempt types (no exported types, define manually)
interface AttemptRetryOptions {
  maxAttempts?: number;
  delay?: number;
  factor?: number;
  maxDelay?: number;
  jitter?: boolean;
  handleError?: (error: Error, context: { attemptNum: number; abort: () => void }) => void;
}

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
export class Retry {
  private stats: Map<string, RetryStatistics> = new Map();

  /**
   * 関数をリトライ可能にして実行します
   *
   * @param fn 実行する非同期関数
   * @param options リトライオプション
   * @returns 関数の戻り値
   */
  async execute<T>(
    fn: () => Promise<T>,
    options: RetryOptions = {}
  ): Promise<T> {
    const {
      maxAttempts = 3,
      initialDelayMs = 1000,
      maxDelayMs = 30000,
      backoffStrategy = 'exponential',
      multiplier = 2,
      jitter = true,
      shouldRetry = this.defaultShouldRetry,
      onRetry,
    } = options;

    const funcName = fn.name || 'anonymous';
    this.initStats(funcName);

    const attemptOptions: AttemptRetryOptions = {
      maxAttempts,
      delay: initialDelayMs,
      factor: backoffStrategy === 'exponential' ? multiplier : 1,
      maxDelay: maxDelayMs,
      jitter: jitter,
      handleError: (error, context) => {
        const typedError =
          error instanceof Error ? error : new Error(String(error));

        // リトライ不可能なエラーの場合は即座に失敗
        if (!shouldRetry(typedError)) {
          context.abort();
          return;
        }

        // 統計情報を更新
        this.incrementRetryCount(funcName);

        // コールバック実行
        if (onRetry) {
          void onRetry(typedError, context.attemptNum);
        }
      },
    };

    try {
      const result = await retryAsync(fn, attemptOptions);
      this.incrementSuccessCount(funcName);
      return result;
    } catch (error) {
      this.incrementFailureCount(funcName);
      throw error;
    }
  }

  /**
   * デフォルトのリトライ判定関数
   *
   * 一時的なエラーのみリトライします
   *
   * @param error エラーオブジェクト
   * @returns リトライ可能な場合はtrue
   */
  private defaultShouldRetry(error: Error): boolean {
    // ネットワークエラー
    if (
      error.message.includes('ECONNREFUSED') ||
      error.message.includes('ETIMEDOUT') ||
      error.message.includes('ENOTFOUND')
    ) {
      return true;
    }

    // HTTPステータスコードベースの判定
    const httpError = error as any;
    if (httpError.status || httpError.statusCode) {
      const status = httpError.status || httpError.statusCode;

      // リトライ可能なステータスコード
      const retryableStatuses = [
        408, // Request Timeout
        429, // Too Many Requests
        500, // Internal Server Error
        502, // Bad Gateway
        503, // Service Unavailable
        504, // Gateway Timeout
      ];

      return retryableStatuses.includes(status);
    }

    // Rate Limit エラー
    if (
      error.message.includes('rate limit') ||
      error.message.includes('throttle')
    ) {
      return true;
    }

    // デフォルトはリトライしない
    return false;
  }

  /**
   * 統計情報を初期化します
   *
   * @param funcName 関数名
   */
  private initStats(funcName: string): void {
    if (!this.stats.has(funcName)) {
      this.stats.set(funcName, {
        functionName: funcName,
        totalAttempts: 0,
        successCount: 0,
        failureCount: 0,
        retryCount: 0,
        averageRetries: 0,
        successRate: 0,
      });
    }

    const stats = this.stats.get(funcName)!;
    stats.totalAttempts++;
    stats.lastExecutionTime = new Date();
  }

  /**
   * リトライ回数をインクリメントします
   *
   * @param funcName 関数名
   */
  private incrementRetryCount(funcName: string): void {
    const stats = this.stats.get(funcName);
    if (stats) {
      stats.retryCount++;
      this.updateAverageRetries(funcName);
    }
  }

  /**
   * 成功回数をインクリメントします
   *
   * @param funcName 関数名
   */
  private incrementSuccessCount(funcName: string): void {
    const stats = this.stats.get(funcName);
    if (stats) {
      stats.successCount++;
      this.updateSuccessRate(funcName);
    }
  }

  /**
   * 失敗回数をインクリメントします
   *
   * @param funcName 関数名
   */
  private incrementFailureCount(funcName: string): void {
    const stats = this.stats.get(funcName);
    if (stats) {
      stats.failureCount++;
      this.updateSuccessRate(funcName);
    }
  }

  /**
   * 平均リトライ回数を更新します
   *
   * @param funcName 関数名
   */
  private updateAverageRetries(funcName: string): void {
    const stats = this.stats.get(funcName);
    if (stats && stats.totalAttempts > 0) {
      stats.averageRetries =
        Math.round((stats.retryCount / stats.totalAttempts) * 100) / 100;
    }
  }

  /**
   * 成功率を更新します
   *
   * @param funcName 関数名
   */
  private updateSuccessRate(funcName: string): void {
    const stats = this.stats.get(funcName);
    if (stats) {
      const total = stats.successCount + stats.failureCount;
      stats.successRate =
        total > 0 ? Math.round((stats.successCount / total) * 100) : 0;
    }
  }

  /**
   * 統計情報を取得します
   *
   * @param funcName 関数名（省略時は全関数の統計）
   * @returns 統計情報
   */
  getStats(funcName?: string): RetryStatistics | Map<string, RetryStatistics> {
    if (funcName) {
      return (
        this.stats.get(funcName) || {
          functionName: funcName,
          totalAttempts: 0,
          successCount: 0,
          failureCount: 0,
          retryCount: 0,
          averageRetries: 0,
          successRate: 0,
        }
      );
    }
    return new Map(this.stats);
  }

  /**
   * 統計情報をリセットします
   *
   * @param funcName 関数名（省略時は全関数をリセット）
   */
  resetStats(funcName?: string): void {
    if (funcName) {
      this.stats.delete(funcName);
    } else {
      this.stats.clear();
    }
  }

  /**
   * 統計情報を人間が読みやすい形式で出力します
   *
   * @param funcName 関数名（省略時は全関数の統計）
   * @returns フォーマットされた文字列
   */
  formatStats(funcName?: string): string {
    const stats = funcName
      ? new Map([[funcName, this.getStats(funcName) as RetryStatistics]])
      : (this.getStats() as Map<string, RetryStatistics>);

    const lines: string[] = [];
    lines.push('=== Retry Statistics ===');

    for (const [name, stat] of stats) {
      lines.push(`\n[${name}]`);
      lines.push(`  Total Attempts: ${stat.totalAttempts}`);
      lines.push(`  Success: ${stat.successCount}`);
      lines.push(`  Failure: ${stat.failureCount}`);
      lines.push(`  Retries: ${stat.retryCount}`);
      lines.push(`  Average Retries: ${stat.averageRetries}`);
      lines.push(`  Success Rate: ${stat.successRate}%`);

      if (stat.lastExecutionTime) {
        lines.push(`  Last Execution: ${stat.lastExecutionTime.toISOString()}`);
      }
    }

    return lines.join('\n');
  }
}
