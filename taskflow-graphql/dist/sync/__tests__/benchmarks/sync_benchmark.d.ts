/**
 * Sync Performance Benchmark
 *
 * Measures end-to-end sync performance:
 * - File → App sync throughput
 * - App → File sync throughput
 * - 3-way merge performance
 * - Batch write optimization
 */
interface SyncBenchmarkResult {
    testName: string;
    syncDirection: 'file_to_app' | 'app_to_file' | 'bidirectional';
    taskCount: number;
    syncTimeMs: number;
    throughputTasksPerSec: number;
    memoryUsedMB: number;
    batchWriteOptimization: boolean;
    passed: boolean;
    threshold: number;
}
/**
 * Run all sync benchmarks
 */
export declare function runSyncBenchmarks(): Promise<SyncBenchmarkResult[]>;
export {};
//# sourceMappingURL=sync_benchmark.d.ts.map