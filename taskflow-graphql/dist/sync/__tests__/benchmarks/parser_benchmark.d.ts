/**
 * Parser Performance Benchmark
 *
 * Measures markdown parsing performance across different file sizes.
 * Acceptance criteria:
 * - Small file (10 tasks): < 10ms
 * - Medium file (100 tasks): < 50ms
 * - Large file (1000 tasks): < 200ms
 * - Very large file (5000 tasks): < 1000ms
 */
interface BenchmarkResult {
    fileSize: string;
    taskCount: number;
    charCount: number;
    lineCount: number;
    parseTimeMs: number;
    memoryUsedMB: number;
    passed: boolean;
    threshold: number;
}
/**
 * Run all parser benchmarks
 */
export declare function runParserBenchmarks(): Promise<BenchmarkResult[]>;
/**
 * Run specific stress test
 */
export declare function stressTestParser(taskCount?: number): Promise<void>;
export {};
//# sourceMappingURL=parser_benchmark.d.ts.map