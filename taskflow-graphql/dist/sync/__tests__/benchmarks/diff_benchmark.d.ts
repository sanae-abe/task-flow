/**
 * DiffDetector Performance Benchmark
 *
 * Measures character-level and line-level diff detection speed.
 * Tests change detection accuracy and performance.
 */
interface DiffBenchmarkResult {
    testName: string;
    contentSize: string;
    charCount: number;
    lineCount: number;
    diffTimeMs: number;
    changesDetected: number;
    throughputCharsPerSec: number;
    passed: boolean;
    threshold: number;
}
/**
 * Run all diff benchmarks
 */
export declare function runDiffBenchmarks(): Promise<DiffBenchmarkResult[]>;
export {};
//# sourceMappingURL=diff_benchmark.d.ts.map