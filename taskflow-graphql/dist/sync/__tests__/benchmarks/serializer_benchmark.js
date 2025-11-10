import { MarkdownSerializer } from '../../parsers/markdown-serializer';
import { performance } from 'perf_hooks';
/**
 * Generate sample tasks
 */
function generateTasks(count) {
    const tasks = [];
    const sections = ['🔴 最優先', '🟡 重要', '🟢 通常', '未分類'];
    for (let i = 0; i < count; i++) {
        const sectionIdx = i % sections.length;
        const status = i % 3 === 0 ? 'completed' : i % 3 === 1 ? 'in_progress' : 'pending';
        const priority = i % 3 === 0 ? 'high' : i % 3 === 1 ? 'medium' : 'low';
        tasks.push({
            id: `task-${i}`,
            title: `Task ${i + 1}: Sample task for benchmark`,
            status,
            priority,
            dueDate: i % 2 === 0 ? '2025-12-31' : undefined,
            tags: i % 2 === 0 ? ['test', 'benchmark'] : undefined,
            section: sections[sectionIdx],
            order: i,
            createdAt: new Date('2025-01-01'),
            updatedAt: new Date('2025-11-09'),
        });
    }
    return tasks;
}
/**
 * Measure memory usage
 */
function measureMemory() {
    const usage = process.memoryUsage();
    return usage.heapUsed / 1024 / 1024;
}
/**
 * Benchmark full serialization
 */
async function benchmarkFullSerialization(taskCount, threshold) {
    const serializer = new MarkdownSerializer();
    const tasks = generateTasks(taskCount);
    // Warm up
    await serializer.serialize(tasks);
    // Measure
    global.gc && global.gc();
    const memBefore = measureMemory();
    const startTime = performance.now();
    const markdown = await serializer.serialize(tasks, {
        includeFrontMatter: true,
        sectionSpacing: 1,
    });
    const endTime = performance.now();
    const memAfter = measureMemory();
    const serializeTimeMs = endTime - startTime;
    const outputSizeChars = markdown.length;
    const outputSizeLines = markdown.split('\n').length;
    const memoryUsedMB = memAfter - memBefore;
    const throughputTasksPerSec = (taskCount / serializeTimeMs) * 1000;
    const passed = serializeTimeMs < threshold;
    return {
        testName: `Full serialization (${taskCount} tasks)`,
        taskCount,
        serializeTimeMs: Math.round(serializeTimeMs * 100) / 100,
        outputSizeChars,
        outputSizeLines,
        memoryUsedMB: Math.round(memoryUsedMB * 100) / 100,
        throughputTasksPerSec: Math.round(throughputTasksPerSec),
        passed,
        threshold,
    };
}
/**
 * Benchmark differential update (single task)
 */
async function benchmarkDifferentialUpdate() {
    const serializer = new MarkdownSerializer();
    const tasks = generateTasks(100);
    // Generate initial markdown
    const initialMarkdown = await serializer.serialize(tasks);
    // Update single task
    const taskToUpdate = { ...tasks[50], status: 'completed' };
    // Measure differential update
    const iterations = 1000;
    const startTime = performance.now();
    for (let i = 0; i < iterations; i++) {
        serializer.updateTaskLine(initialMarkdown, taskToUpdate, 60); // Approximate line number
    }
    const endTime = performance.now();
    const totalTimeMs = endTime - startTime;
    const avgTimeMs = totalTimeMs / iterations;
    return {
        testName: 'Differential update (1 task)',
        taskCount: 1,
        serializeTimeMs: Math.round(avgTimeMs * 100) / 100,
        outputSizeChars: initialMarkdown.length,
        outputSizeLines: initialMarkdown.split('\n').length,
        memoryUsedMB: 0,
        throughputTasksPerSec: Math.round((1 / avgTimeMs) * 1000),
        passed: avgTimeMs < 1, // Should be sub-millisecond
        threshold: 1,
    };
}
/**
 * Benchmark task addition
 */
async function benchmarkTaskAddition() {
    const serializer = new MarkdownSerializer();
    const initialTasks = generateTasks(100);
    const initialMarkdown = await serializer.serialize(initialTasks);
    const newTask = {
        id: 'new-task',
        title: 'New task to add',
        status: 'pending',
        priority: 'high',
        section: '🔴 最優先',
        order: 101,
        createdAt: new Date(),
        updatedAt: new Date(),
    };
    // Measure
    const iterations = 1000;
    const startTime = performance.now();
    for (let i = 0; i < iterations; i++) {
        serializer.addTask(initialMarkdown, newTask);
    }
    const endTime = performance.now();
    const totalTimeMs = endTime - startTime;
    const avgTimeMs = totalTimeMs / iterations;
    return {
        testName: 'Task addition',
        taskCount: 1,
        serializeTimeMs: Math.round(avgTimeMs * 100) / 100,
        outputSizeChars: initialMarkdown.length,
        outputSizeLines: initialMarkdown.split('\n').length,
        memoryUsedMB: 0,
        throughputTasksPerSec: Math.round((1 / avgTimeMs) * 1000),
        passed: avgTimeMs < 2, // Should be very fast
        threshold: 2,
    };
}
/**
 * Run all serializer benchmarks
 */
export async function runSerializerBenchmarks() {
    console.log('\n📊 Serializer Performance Benchmark\n');
    console.log('='.repeat(80));
    const results = [];
    // Full serialization benchmarks
    const fullSerializationTests = [
        { taskCount: 10, threshold: 10 },
        { taskCount: 100, threshold: 50 },
        { taskCount: 1000, threshold: 200 },
        { taskCount: 5000, threshold: 1000 },
    ];
    console.log('\n🔄 Full Serialization Tests:');
    for (const test of fullSerializationTests) {
        const result = await benchmarkFullSerialization(test.taskCount, test.threshold);
        results.push(result);
        const status = result.passed ? '✅ PASS' : '❌ FAIL';
        const percentage = Math.round((result.serializeTimeMs / result.threshold) * 100);
        console.log(`   ${status} ${test.taskCount} tasks: ${result.serializeTimeMs}ms / ${result.threshold}ms (${percentage}%)`);
        console.log(`        Output: ${result.outputSizeLines} lines, ${result.outputSizeChars} chars`);
        console.log(`        Throughput: ${result.throughputTasksPerSec} tasks/sec, Memory: ${result.memoryUsedMB}MB`);
    }
    // Differential update benchmark
    console.log('\n⚡ Differential Update Tests:');
    const diffResult = await benchmarkDifferentialUpdate();
    results.push(diffResult);
    const diffStatus = diffResult.passed ? '✅ PASS' : '❌ FAIL';
    console.log(`   ${diffStatus} ${diffResult.testName}: ${diffResult.serializeTimeMs}ms / ${diffResult.threshold}ms`);
    console.log(`        Throughput: ${diffResult.throughputTasksPerSec} ops/sec`);
    // Task addition benchmark
    const addResult = await benchmarkTaskAddition();
    results.push(addResult);
    const addStatus = addResult.passed ? '✅ PASS' : '❌ FAIL';
    console.log(`   ${addStatus} ${addResult.testName}: ${addResult.serializeTimeMs}ms / ${addResult.threshold}ms`);
    console.log(`        Throughput: ${addResult.throughputTasksPerSec} ops/sec`);
    console.log('\n' + '='.repeat(80));
    // Summary
    const allPassed = results.every(r => r.passed);
    const fullSerializationResults = results.slice(0, 4);
    const avgTime = fullSerializationResults.reduce((sum, r) => sum + r.serializeTimeMs, 0) /
        fullSerializationResults.length;
    console.log('\n📈 Summary:');
    console.log(`   Overall: ${allPassed ? '✅ ALL PASSED' : '❌ SOME FAILED'}`);
    console.log(`   Avg full serialization time: ${Math.round(avgTime * 100) / 100}ms`);
    console.log(`   Differential update performance: ${diffResult.serializeTimeMs}ms per update`);
    console.log(`   Task addition performance: ${addResult.serializeTimeMs}ms per add`);
    return results;
}
// Run benchmarks if executed directly
if (require.main === module) {
    (async () => {
        await runSerializerBenchmarks();
    })();
}
//# sourceMappingURL=serializer_benchmark.js.map