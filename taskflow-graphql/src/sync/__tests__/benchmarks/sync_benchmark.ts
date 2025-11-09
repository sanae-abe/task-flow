import { SyncCoordinator } from '../../database/sync-coordinator';
import { MarkdownParser } from '../../parsers/markdown-parser';
import { MarkdownSerializer } from '../../parsers/markdown-serializer';
import { MockDatabase } from '../../database/mock-database';
import type { Task, SyncConfig } from '../../types';
import { performance } from 'perf_hooks';

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
 * Generate sample tasks
 */
function generateTasks(count: number): Task[] {
  const tasks: Task[] = [];
  const sections = ['🔴 最優先', '🟡 重要', '🟢 通常', '未分類'];

  for (let i = 0; i < count; i++) {
    tasks.push({
      id: `task-${i}`,
      title: `Task ${i + 1}`,
      status: i % 3 === 0 ? 'completed' : 'pending',
      priority: i % 3 === 0 ? 'high' : i % 3 === 1 ? 'medium' : 'low',
      section: sections[i % sections.length],
      order: i,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  return tasks;
}

/**
 * Generate markdown content from tasks
 */
async function generateMarkdownFromTasks(tasks: Task[]): Promise<string> {
  const serializer = new MarkdownSerializer();
  return await serializer.serialize(tasks, {
    includeFrontMatter: true,
    sectionSpacing: 1,
  });
}

/**
 * Measure memory usage
 */
function measureMemory(): number {
  const usage = process.memoryUsage();
  return usage.heapUsed / 1024 / 1024;
}

/**
 * Benchmark File → App sync
 */
async function benchmarkFileToAppSync(
  taskCount: number,
  threshold: number
): Promise<SyncBenchmarkResult> {
  const mockDb = new MockDatabase();
  await mockDb.initialize();

  const config: SyncConfig = {
    todoPath: '/tmp/benchmark-todo.md',
    direction: 'file_to_app',
    strategy: 'last_write_wins',
    conflictResolution: 'prefer_file',
    debounceMs: 0,
    throttleMs: 0,
    maxFileSizeMB: 10,
    maxTasks: 10000,
    webhooksEnabled: false,
    autoBackup: false,
  };

  // Create sample markdown content
  const tasks = generateTasks(taskCount);
  const markdownContent = await generateMarkdownFromTasks(tasks);

  // Mock file system to return our content
  const mockFileSystem = {
    readFile: async () => markdownContent,
    writeFile: async () => {},
    exists: async () => true,
    stat: async () => ({ size: markdownContent.length }),
  };

  const coordinator = new SyncCoordinator({
    config,
    database: mockDb.getDatabase(),
    fileSystem: mockFileSystem as any,
  });

  // Warm up
  await coordinator.start();
  await coordinator.syncFileToApp();

  // Clear database for actual test
  await mockDb.clearAllTasks();

  // Measure
  global.gc && global.gc();
  const memBefore = measureMemory();

  const startTime = performance.now();
  await coordinator.syncFileToApp();
  const endTime = performance.now();

  const memAfter = measureMemory();

  await coordinator.stop();

  const syncTimeMs = endTime - startTime;
  const throughputTasksPerSec = (taskCount / syncTimeMs) * 1000;
  const memoryUsedMB = memAfter - memBefore;

  return {
    testName: `File → App sync (${taskCount} tasks)`,
    syncDirection: 'file_to_app',
    taskCount,
    syncTimeMs: Math.round(syncTimeMs * 100) / 100,
    throughputTasksPerSec: Math.round(throughputTasksPerSec),
    memoryUsedMB: Math.round(memoryUsedMB * 100) / 100,
    batchWriteOptimization: true,
    passed: syncTimeMs < threshold,
    threshold,
  };
}

/**
 * Benchmark App → File sync
 */
async function benchmarkAppToFileSync(
  taskCount: number,
  threshold: number
): Promise<SyncBenchmarkResult> {
  const mockDb = new MockDatabase();
  await mockDb.initialize();

  const config: SyncConfig = {
    todoPath: '/tmp/benchmark-todo.md',
    direction: 'app_to_file',
    strategy: 'last_write_wins',
    conflictResolution: 'prefer_app',
    debounceMs: 0,
    throttleMs: 0,
    maxFileSizeMB: 10,
    maxTasks: 10000,
    webhooksEnabled: false,
    autoBackup: false,
  };

  // Populate database with tasks
  const tasks = generateTasks(taskCount);
  await mockDb.bulkUpsertTasks(tasks);

  let writtenContent = '';
  const mockFileSystem = {
    readFile: async () => '',
    writeFile: async (_path: string, content: string) => {
      writtenContent = content;
    },
    exists: async () => true,
    stat: async () => ({ size: 0 }),
  };

  const coordinator = new SyncCoordinator({
    config,
    database: mockDb.getDatabase(),
    fileSystem: mockFileSystem as any,
  });

  // Warm up
  await coordinator.start();
  await coordinator.syncAppToFile();

  // Measure
  global.gc && global.gc();
  const memBefore = measureMemory();

  const startTime = performance.now();
  await coordinator.syncAppToFile();
  const endTime = performance.now();

  const memAfter = measureMemory();

  await coordinator.stop();

  const syncTimeMs = endTime - startTime;
  const throughputTasksPerSec = (taskCount / syncTimeMs) * 1000;
  const memoryUsedMB = memAfter - memBefore;

  return {
    testName: `App → File sync (${taskCount} tasks)`,
    syncDirection: 'app_to_file',
    taskCount,
    syncTimeMs: Math.round(syncTimeMs * 100) / 100,
    throughputTasksPerSec: Math.round(throughputTasksPerSec),
    memoryUsedMB: Math.round(memoryUsedMB * 100) / 100,
    batchWriteOptimization: false,
    passed: syncTimeMs < threshold,
    threshold,
  };
}

/**
 * Benchmark 3-way merge performance
 */
async function benchmark3WayMerge(
  taskCount: number,
  conflictPercentage: number = 10
): Promise<SyncBenchmarkResult> {
  const mockDb = new MockDatabase();
  await mockDb.initialize();

  const config: SyncConfig = {
    todoPath: '/tmp/benchmark-todo.md',
    direction: 'bidirectional',
    strategy: 'three_way_merge',
    conflictResolution: 'prefer_file',
    debounceMs: 0,
    throttleMs: 0,
    maxFileSizeMB: 10,
    maxTasks: 10000,
    webhooksEnabled: false,
    autoBackup: false,
  };

  // Create base tasks
  const baseTasks = generateTasks(taskCount);
  await mockDb.bulkUpsertTasks(baseTasks);

  // Create file version (with conflicts)
  const fileTasks = baseTasks.map((task, idx) => {
    if (idx < (taskCount * conflictPercentage) / 100) {
      return { ...task, status: 'completed' as const };
    }
    return task;
  });

  // Create app version (with different conflicts)
  const appTasks = baseTasks.map((task, idx) => {
    if (idx >= taskCount - (taskCount * conflictPercentage) / 100) {
      return { ...task, priority: 'high' as const };
    }
    return task;
  });

  await mockDb.clearAllTasks();
  await mockDb.bulkUpsertTasks(appTasks);

  const markdownContent = await generateMarkdownFromTasks(fileTasks);

  const mockFileSystem = {
    readFile: async () => markdownContent,
    writeFile: async () => {},
    exists: async () => true,
    stat: async () => ({ size: markdownContent.length }),
  };

  const coordinator = new SyncCoordinator({
    config,
    database: mockDb.getDatabase(),
    fileSystem: mockFileSystem as any,
  });

  await coordinator.start();

  // Measure 3-way merge
  const startTime = performance.now();
  await coordinator.syncFileToApp();
  const endTime = performance.now();

  await coordinator.stop();

  const syncTimeMs = endTime - startTime;
  const throughputTasksPerSec = (taskCount / syncTimeMs) * 1000;

  const stats = coordinator.getStats();

  return {
    testName: `3-way merge (${taskCount} tasks, ${conflictPercentage}% conflicts)`,
    syncDirection: 'bidirectional',
    taskCount,
    syncTimeMs: Math.round(syncTimeMs * 100) / 100,
    throughputTasksPerSec: Math.round(throughputTasksPerSec),
    memoryUsedMB: 0,
    batchWriteOptimization: true,
    passed: syncTimeMs < 500, // More lenient for merge operations
    threshold: 500,
  };
}

/**
 * Benchmark batch write optimization (N+1 prevention)
 */
async function benchmarkBatchWriteOptimization(): Promise<{
  testName: string;
  individualWrites: number;
  batchWrite: number;
  improvement: string;
  passed: boolean;
}> {
  const mockDb = new MockDatabase();
  await mockDb.initialize();

  const tasks = generateTasks(100);

  // Measure individual writes (N+1 problem)
  await mockDb.clearAllTasks();
  const individualStart = performance.now();

  for (const task of tasks) {
    await mockDb.upsertTask(task);
  }

  const individualEnd = performance.now();
  const individualTime = individualEnd - individualStart;

  // Measure batch write
  await mockDb.clearAllTasks();
  const batchStart = performance.now();

  await mockDb.bulkUpsertTasks(tasks);

  const batchEnd = performance.now();
  const batchTime = batchEnd - batchStart;

  const improvement = Math.round((individualTime / batchTime) * 100) / 100;

  return {
    testName: 'Batch write optimization',
    individualWrites: Math.round(individualTime * 100) / 100,
    batchWrite: Math.round(batchTime * 100) / 100,
    improvement: `${improvement}x faster`,
    passed: improvement >= 5, // Should be at least 5x faster
  };
}

/**
 * Run all sync benchmarks
 */
export async function runSyncBenchmarks(): Promise<SyncBenchmarkResult[]> {
  console.log('\n📊 Sync Performance Benchmark\n');
  console.log('='.repeat(80));

  const results: SyncBenchmarkResult[] = [];

  // File → App sync tests
  console.log('\n📥 File → App Sync Tests:');
  const fileToAppTests = [
    { taskCount: 10, threshold: 50 },
    { taskCount: 100, threshold: 200 },
    { taskCount: 1000, threshold: 1000 },
  ];

  for (const test of fileToAppTests) {
    const result = await benchmarkFileToAppSync(test.taskCount, test.threshold);
    results.push(result);

    const status = result.passed ? '✅ PASS' : '❌ FAIL';
    const percentage = Math.round((result.syncTimeMs / result.threshold) * 100);

    console.log(
      `   ${status} ${test.taskCount} tasks: ${result.syncTimeMs}ms / ${result.threshold}ms (${percentage}%)`
    );
    console.log(
      `        Throughput: ${result.throughputTasksPerSec} tasks/sec, Memory: ${result.memoryUsedMB}MB`
    );
  }

  // App → File sync tests
  console.log('\n📤 App → File Sync Tests:');
  const appToFileTests = [
    { taskCount: 10, threshold: 50 },
    { taskCount: 100, threshold: 200 },
    { taskCount: 1000, threshold: 1000 },
  ];

  for (const test of appToFileTests) {
    const result = await benchmarkAppToFileSync(test.taskCount, test.threshold);
    results.push(result);

    const status = result.passed ? '✅ PASS' : '❌ FAIL';
    const percentage = Math.round((result.syncTimeMs / result.threshold) * 100);

    console.log(
      `   ${status} ${test.taskCount} tasks: ${result.syncTimeMs}ms / ${result.threshold}ms (${percentage}%)`
    );
    console.log(
      `        Throughput: ${result.throughputTasksPerSec} tasks/sec, Memory: ${result.memoryUsedMB}MB`
    );
  }

  // 3-way merge tests
  console.log('\n🔀 3-Way Merge Tests:');
  const mergeTests = [
    { taskCount: 100, conflictPercentage: 10 },
    { taskCount: 100, conflictPercentage: 50 },
  ];

  for (const test of mergeTests) {
    const result = await benchmark3WayMerge(
      test.taskCount,
      test.conflictPercentage
    );
    results.push(result);

    const status = result.passed ? '✅ PASS' : '❌ FAIL';

    console.log(
      `   ${status} ${test.taskCount} tasks, ${test.conflictPercentage}% conflicts: ${result.syncTimeMs}ms`
    );
    console.log(`        Throughput: ${result.throughputTasksPerSec} tasks/sec`);
  }

  // Batch write optimization test
  console.log('\n⚡ Batch Write Optimization:');
  const batchResult = await benchmarkBatchWriteOptimization();

  const batchStatus = batchResult.passed ? '✅ PASS' : '❌ FAIL';
  console.log(`   ${batchStatus} ${batchResult.testName}:`);
  console.log(
    `        Individual writes: ${batchResult.individualWrites}ms (N+1 problem)`
  );
  console.log(`        Batch write: ${batchResult.batchWrite}ms`);
  console.log(`        Improvement: ${batchResult.improvement}`);

  console.log('\n' + '='.repeat(80));

  // Summary
  const allPassed = results.every(r => r.passed) && batchResult.passed;
  const avgFileToAppTime =
    fileToAppTests.reduce(
      (sum, _, idx) => sum + results[idx].syncTimeMs,
      0
    ) / fileToAppTests.length;
  const avgAppToFileTime =
    appToFileTests.reduce(
      (sum, _, idx) =>
        sum + results[fileToAppTests.length + idx].syncTimeMs,
      0
    ) / appToFileTests.length;

  console.log('\n📈 Summary:');
  console.log(`   Overall: ${allPassed ? '✅ ALL PASSED' : '❌ SOME FAILED'}`);
  console.log(
    `   Avg File→App sync time: ${Math.round(avgFileToAppTime * 100) / 100}ms`
  );
  console.log(
    `   Avg App→File sync time: ${Math.round(avgAppToFileTime * 100) / 100}ms`
  );
  console.log(`   Batch write improvement: ${batchResult.improvement}`);

  return results;
}

// Run benchmarks if executed directly
if (require.main === module) {
  (async () => {
    await runSyncBenchmarks();
  })();
}
