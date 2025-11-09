import { MarkdownParser } from '../../parsers/markdown-parser';
import { performance } from 'perf_hooks';

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
 * Generate sample TODO.md content with specified number of tasks
 */
function generateTodoContent(taskCount: number): string {
  const lines: string[] = [];

  // Front matter
  lines.push('---');
  lines.push('title: Performance Test TODO');
  lines.push('version: 1.2');
  lines.push('created: 2025-11-09T00:00:00Z');
  lines.push('updated: 2025-11-09T00:00:00Z');
  lines.push(`tasks: ${taskCount}`);
  lines.push('---');
  lines.push('');

  // Distribute tasks across sections
  const sectionsPerTasks = Math.ceil(taskCount / 4);

  // High priority section
  lines.push('## 🔴 最優先');
  lines.push('');
  for (let i = 0; i < Math.min(sectionsPerTasks, taskCount); i++) {
    const checked = i % 3 === 0 ? 'x' : ' ';
    lines.push(
      `- [${checked}] Task ${i + 1} (優先度:高, 期限:2025-12-31) #urgent #important`
    );
  }
  lines.push('');

  // Medium priority section
  lines.push('## 🟡 重要');
  lines.push('');
  const startIdx = sectionsPerTasks;
  const endIdx = Math.min(sectionsPerTasks * 2, taskCount);
  for (let i = startIdx; i < endIdx; i++) {
    const checked = i % 4 === 0 ? 'x' : ' ';
    lines.push(
      `- [${checked}] Task ${i + 1} (優先度:中, 期限:2025-12-15) #feature`
    );
  }
  lines.push('');

  // Low priority section
  lines.push('## 🟢 通常');
  lines.push('');
  const startIdx2 = sectionsPerTasks * 2;
  const endIdx2 = Math.min(sectionsPerTasks * 3, taskCount);
  for (let i = startIdx2; i < endIdx2; i++) {
    const checked = i % 5 === 0 ? 'x' : ' ';
    lines.push(`- [${checked}] Task ${i + 1} (優先度:低) #backlog`);
  }
  lines.push('');

  // Uncategorized section
  lines.push('## 未分類');
  lines.push('');
  const startIdx3 = sectionsPerTasks * 3;
  for (let i = startIdx3; i < taskCount; i++) {
    const checked = i % 6 === 0 ? 'x' : ' ';
    lines.push(`- [${checked}] Task ${i + 1}`);
  }

  return lines.join('\n');
}

/**
 * Measure memory usage
 */
function measureMemory(): number {
  const usage = process.memoryUsage();
  return usage.heapUsed / 1024 / 1024; // Convert to MB
}

/**
 * Run benchmark for a specific file size
 */
async function benchmarkFileSize(
  taskCount: number,
  threshold: number
): Promise<BenchmarkResult> {
  const parser = new MarkdownParser();

  // Generate content
  const content = generateTodoContent(taskCount);
  const charCount = content.length;
  const lineCount = content.split('\n').length;

  // Warm up (to reduce JIT compilation effects)
  await parser.parse(content);

  // Measure memory before
  global.gc && global.gc(); // Force GC if available
  const memBefore = measureMemory();

  // Measure parse time
  const startTime = performance.now();
  const result = await parser.parse(content);
  const endTime = performance.now();

  // Measure memory after
  const memAfter = measureMemory();
  const memoryUsedMB = memAfter - memBefore;

  const parseTimeMs = endTime - startTime;
  const passed = parseTimeMs < threshold;

  // Verify parsing correctness
  const extractedTasks = parser.extractTasks(result);
  const tasksMatch = extractedTasks.length === result.checkboxes.length;

  if (!tasksMatch) {
    console.warn(
      `⚠️  Task count mismatch: extracted ${extractedTasks.length}, expected ${result.checkboxes.length}`
    );
  }

  return {
    fileSize: `${taskCount} tasks`,
    taskCount: result.checkboxes.length,
    charCount,
    lineCount,
    parseTimeMs: Math.round(parseTimeMs * 100) / 100,
    memoryUsedMB: Math.round(memoryUsedMB * 100) / 100,
    passed,
    threshold,
  };
}

/**
 * Run all parser benchmarks
 */
export async function runParserBenchmarks(): Promise<BenchmarkResult[]> {
  console.log('\n📊 Parser Performance Benchmark\n');
  console.log('=' .repeat(80));

  const benchmarks = [
    { taskCount: 10, threshold: 10, label: 'Small' },
    { taskCount: 100, threshold: 50, label: 'Medium' },
    { taskCount: 1000, threshold: 200, label: 'Large' },
    { taskCount: 5000, threshold: 1000, label: 'Very Large' },
  ];

  const results: BenchmarkResult[] = [];

  for (const bench of benchmarks) {
    console.log(`\n🔍 Testing ${bench.label} file (${bench.taskCount} tasks)...`);

    const result = await benchmarkFileSize(bench.taskCount, bench.threshold);
    results.push(result);

    const status = result.passed ? '✅ PASS' : '❌ FAIL';
    const percentage = Math.round((result.parseTimeMs / result.threshold) * 100);

    console.log(`   ${status} - ${result.parseTimeMs}ms / ${result.threshold}ms (${percentage}%)`);
    console.log(`   📄 Parsed: ${result.taskCount} tasks, ${result.lineCount} lines, ${result.charCount} chars`);
    console.log(`   💾 Memory: ${result.memoryUsedMB}MB`);
  }

  console.log('\n' + '='.repeat(80));

  // Summary
  const allPassed = results.every(r => r.passed);
  const avgTime =
    results.reduce((sum, r) => sum + r.parseTimeMs, 0) / results.length;
  const totalMemory = results.reduce((sum, r) => sum + r.memoryUsedMB, 0);

  console.log('\n📈 Summary:');
  console.log(`   Overall: ${allPassed ? '✅ ALL PASSED' : '❌ SOME FAILED'}`);
  console.log(`   Average parse time: ${Math.round(avgTime * 100) / 100}ms`);
  console.log(`   Total memory used: ${Math.round(totalMemory * 100) / 100}MB`);
  console.log(
    `   Throughput (1000 tasks): ${Math.round(1000 / results[2].parseTimeMs)}k tasks/sec`
  );

  return results;
}

/**
 * Run specific stress test
 */
export async function stressTestParser(taskCount: number = 10000): Promise<void> {
  console.log(`\n🔥 Parser Stress Test (${taskCount} tasks)\n`);
  console.log('='.repeat(80));

  const parser = new MarkdownParser();
  const content = generateTodoContent(taskCount);

  console.log(`📄 Generated content: ${content.length} chars, ${content.split('\n').length} lines`);

  const startTime = performance.now();
  const result = await parser.parse(content);
  const endTime = performance.now();

  const parseTimeMs = endTime - startTime;

  console.log(`\n⏱️  Parse time: ${Math.round(parseTimeMs)}ms`);
  console.log(`📊 Tasks parsed: ${result.checkboxes.length}`);
  console.log(`📁 Sections: ${result.sections.length}`);
  console.log(
    `⚡ Throughput: ${Math.round((taskCount / parseTimeMs) * 1000)} tasks/sec`
  );

  if (parseTimeMs > 5000) {
    console.log('⚠️  WARNING: Parse time exceeds 5 seconds!');
  }
}

// Run benchmarks if executed directly
if (require.main === module) {
  (async () => {
    await runParserBenchmarks();

    // Optional stress test
    if (process.env.STRESS_TEST === 'true') {
      await stressTestParser(10000);
    }
  })();
}
