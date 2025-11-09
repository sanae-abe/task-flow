# Performance Benchmarks

Comprehensive performance benchmarking suite for the TODO.md sync system.

## Overview

This benchmark suite measures performance across all critical components:
- **Parser**: Markdown → Task parsing speed
- **Serializer**: Task → Markdown conversion speed
- **DiffDetector**: Change detection performance
- **Sync**: End-to-end sync throughput

## Quick Start

```bash
# Run all benchmarks
npm run benchmark

# Save results to BENCHMARK_RESULTS.md
npm run benchmark -- --save-report

# Run with stress test (10,000 tasks)
STRESS_TEST=true npm run benchmark
```

## Individual Benchmarks

```bash
# Parser only
ts-node src/sync/__tests__/benchmarks/parser_benchmark.ts

# Serializer only
ts-node src/sync/__tests__/benchmarks/serializer_benchmark.ts

# DiffDetector only
ts-node src/sync/__tests__/benchmarks/diff_benchmark.ts

# Sync operations only
ts-node src/sync/__tests__/benchmarks/sync_benchmark.ts
```

## Files

| File | Description |
|------|-------------|
| `parser_benchmark.ts` | Parser performance tests (10-5000 tasks) |
| `serializer_benchmark.ts` | Serializer performance tests + differential updates |
| `diff_benchmark.ts` | DiffDetector performance + accuracy tests |
| `sync_benchmark.ts` | End-to-end sync performance + batch optimization |
| `run_benchmarks.ts` | Main runner script for all benchmarks |
| `BENCHMARK_RESULTS.md` | Generated report with all results |

## Acceptance Criteria

### Parser
- Small (10 tasks): < 10ms ✅
- Medium (100 tasks): < 50ms ✅
- Large (1000 tasks): < 200ms ✅
- Very Large (5000 tasks): < 1000ms ✅

### Serializer
- Full serialization: Linear scaling ✅
- Differential update: < 1ms per task ✅
- Task addition: < 2ms ✅

### DiffDetector
- Character-level diff: Fast for typical files ✅
- Line-level diff: Sub-second for large files ✅
- Change detection accuracy: > 99% ✅

### Sync Operations
- File→App sync: > 500 tasks/sec ✅
- App→File sync: > 500 tasks/sec ✅
- Batch write optimization: > 5x improvement ✅
- 3-way merge: < 2x overhead ✅

## Metrics Collected

### Performance
- **Time**: Execution time in milliseconds
- **Throughput**: Tasks/sec or chars/sec
- **Memory**: Heap usage in MB

### Accuracy
- **Change detection**: False positive/negative rates
- **Parsing correctness**: Task count validation

## CI/CD Integration

### GitHub Actions Example

```yaml
name: Performance Tests
on: [push, pull_request]
jobs:
  benchmark:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run benchmark -- --save-report
      - name: Check for regression
        run: |
          # Compare against baseline (implement custom logic)
          if [ -f baseline-results.json ]; then
            node scripts/compare-benchmarks.js
          fi
```

## Baseline Comparison

Store baseline results for regression detection:

```bash
# Create baseline
npm run benchmark -- --save-report
cp src/sync/__tests__/benchmarks/benchmark-results.json baseline-results.json

# Compare against baseline
npm run benchmark -- --save-report
node scripts/compare-benchmarks.js baseline-results.json benchmark-results.json
```

## Performance Tips

### Optimize for Your Use Case

1. **Small files (< 100 tasks)**: All operations are fast, no optimization needed
2. **Medium files (100-1000 tasks)**: Enable differential sync
3. **Large files (1000-5000 tasks)**: Use chunked processing
4. **Very large files (> 5000 tasks)**: Consider splitting into multiple files

### Environment Optimization

- **Node.js**: Use latest LTS for best performance
- **Memory**: Ensure at least 512MB available heap
- **GC**: Use `--expose-gc` flag for manual GC in tests

### Code Optimization

- Enable differential sync (default)
- Use batch operations for bulk updates
- Implement debounce/throttle for rapid changes
- Cache parsed results when possible

## Troubleshooting

### Benchmarks are slow

```bash
# Check Node.js version (use latest LTS)
node --version

# Run with verbose output
DEBUG=* npm run benchmark

# Check system resources
node --max-old-space-size=4096 run_benchmarks.ts
```

### Memory issues

```bash
# Increase heap size
node --max-old-space-size=8192 run_benchmarks.ts

# Enable GC logging
node --trace-gc run_benchmarks.ts
```

### Inconsistent results

- Run benchmarks multiple times for average
- Close other applications to reduce noise
- Use dedicated benchmark environment
- Disable CPU throttling on laptops

## Development

### Adding New Benchmarks

1. Create new file: `my_benchmark.ts`
2. Implement benchmark functions
3. Export `runMyBenchmarks()` function
4. Add to `run_benchmarks.ts`
5. Update acceptance criteria in docs

### Benchmark Template

```typescript
import { performance } from 'perf_hooks';

interface BenchmarkResult {
  testName: string;
  timeMs: number;
  passed: boolean;
  threshold: number;
}

async function benchmarkMyFeature(): Promise<BenchmarkResult> {
  // Warm up
  myFeature();

  // Measure
  const startTime = performance.now();
  myFeature();
  const endTime = performance.now();

  return {
    testName: 'My Feature',
    timeMs: endTime - startTime,
    passed: (endTime - startTime) < 100,
    threshold: 100,
  };
}

export async function runMyBenchmarks(): Promise<BenchmarkResult[]> {
  const results = [];
  results.push(await benchmarkMyFeature());
  return results;
}
```

## Resources

- [Performance API Documentation](https://nodejs.org/api/perf_hooks.html)
- [fast-diff Library](https://github.com/jhchen/fast-diff)
- [IndexedDB Performance Best Practices](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API/Using_IndexedDB)

## License

MIT
