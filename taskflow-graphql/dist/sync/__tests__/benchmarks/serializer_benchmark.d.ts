/**
 * Serializer Performance Benchmark
 *
 * Measures Task → Markdown serialization performance.
 * Tests differential update performance and memory usage.
 */
interface SerializerBenchmarkResult {
    testName: string;
    taskCount: number;
    serializeTimeMs: number;
    outputSizeChars: number;
    outputSizeLines: number;
    memoryUsedMB: number;
    throughputTasksPerSec: number;
    passed: boolean;
    threshold: number;
}
/**
 * Run all serializer benchmarks
 */
export declare function runSerializerBenchmarks(): Promise<SerializerBenchmarkResult[]>;
export {};
//# sourceMappingURL=serializer_benchmark.d.ts.map