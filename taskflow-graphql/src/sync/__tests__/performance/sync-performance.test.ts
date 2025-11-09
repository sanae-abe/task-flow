/**
 * TODO.md Sync Performance Tests
 *
 * Measures sync performance with large datasets, memory usage, and concurrency.
 * Phase 5 requirement: 5 comprehensive performance benchmark tests
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtemp, rm } from 'fs/promises';
import { tmpdir } from 'os';
import { join } from 'path';
import { openDB, IDBPDatabase } from 'idb';
import { SyncCoordinator } from '../../database/sync-coordinator.js';
import type { SyncConfig } from '../../types.js';

// Setup fake-indexeddb for Node.js environment
import 'fake-indexeddb/auto';

// Test configuration
const TEST_TIMEOUT = 60000; // 60 seconds for performance tests

/**
 * Helper: Create test directory
 */
async function createTestDirectory(): Promise<string> {
  return await mkdtemp(join(tmpdir(), 'perf-test-'));
}

/**
 * Helper: Cleanup test directory
 */
async function cleanupTestDirectory(dir: string): Promise<void> {
  try {
    await rm(dir, { recursive: true, force: true });
  } catch (error) {
    // Ignore cleanup errors
  }
}

/**
 * Helper: Create test IndexedDB
 */
async function createTestDatabase(dbName: string): Promise<IDBPDatabase> {
  return await openDB(dbName, 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains('tasks')) {
        db.createObjectStore('tasks', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('boards')) {
        db.createObjectStore('boards', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('baseVersions')) {
        db.createObjectStore('baseVersions', { keyPath: 'taskId' });
      }
      if (!db.objectStoreNames.contains('syncState')) {
        db.createObjectStore('syncState', { keyPath: 'id' });
      }
    },
  });
}

/**
 * Helper: Generate large TODO.md file with N tasks
 */
function generateLargeTodoFile(taskCount: number): string {
  const tasks: string[] = ['## Performance Test Tasks\n'];

  for (let i = 0; i < taskCount; i++) {
    const status = i % 3 === 0 ? 'x' : ' ';
    const priority = i % 4 === 0 ? '高' : i % 4 === 1 ? '中' : '低';
    const tags = i % 5 === 0 ? `#tag${i % 10}` : '';

    tasks.push(`- [${status}] Task ${i} (優先度:${priority}) ${tags}`.trim());
  }

  return tasks.join('\n');
}

/**
 * Helper: Measure memory usage
 */
function measureMemory(): { heapUsed: number; heapTotal: number; external: number } {
  const mem = process.memoryUsage();
  return {
    heapUsed: mem.heapUsed,
    heapTotal: mem.heapTotal,
    external: mem.external,
  };
}

/**
 * Helper: Format bytes to MB
 */
function formatMB(bytes: number): string {
  return (bytes / 1024 / 1024).toFixed(2);
}

describe('Sync Performance Tests', () => {
  let testDir: string;
  let database: IDBPDatabase;
  let dbName: string;

  beforeEach(async () => {
    testDir = await createTestDirectory();
    dbName = `perf-test-db-${Date.now()}`;
    database = await createTestDatabase(dbName);
  });

  afterEach(async () => {
    if (database) {
      database.close();
    }
    await cleanupTestDirectory(testDir);
  });

  /**
   * Test 1: 1000 Task File → App Sync Speed
   * Target: <2 seconds
   */
  it('should sync 1000 tasks from file to app in <2 seconds', async () => {
    const taskCount = 1000;
    const todoPath = join(testDir, 'TODO.md');

    // Arrange: Create large TODO.md file
    const { writeFile } = await import('fs/promises');
    const todoContent = generateLargeTodoFile(taskCount);
    await writeFile(todoPath, todoContent, 'utf-8');

    const config: SyncConfig = {
      todoPath,
      direction: 'file_to_app',
      strategy: 'three_way_merge',
      conflictResolution: 'prefer_file',
      debounceMs: 0,
      throttleMs: 0,
      maxFileSizeMB: 10,
      maxTasks: 10000,
      webhooksEnabled: false,
      autoBackup: false,
    };

    const coordinator = new SyncCoordinator({ config, database });
    await coordinator.start();

    // Act: Measure sync time
    const startTime = performance.now();
    await coordinator.syncFileToApp();
    const endTime = performance.now();
    const duration = endTime - startTime;

    // Assert
    const stats = coordinator.getStats();
    const throughput = taskCount / (duration / 1000);

    console.log(`\n📊 Test 1 Results:`);
    console.log(`  Tasks synced: ${taskCount}`);
    console.log(`  Duration: ${duration.toFixed(2)}ms (${(duration / 1000).toFixed(2)}s)`);
    console.log(`  Throughput: ${throughput.toFixed(0)} tasks/second`);
    console.log(`  Target: <2000ms`);
    console.log(`  Status: ${duration < 2000 ? '✅ PASS' : '❌ FAIL'}`);

    expect(duration).toBeLessThan(2000);
    expect(stats.successfulSyncs).toBe(1);
    expect(throughput).toBeGreaterThan(100); // At least 100 tasks/sec

    await coordinator.stop();
  }, TEST_TIMEOUT);

  /**
   * Test 2: 1000 Task App → File Sync Speed
   * Target: <2 seconds
   */
  it('should sync 1000 tasks from app to file in <2 seconds', async () => {
    const taskCount = 1000;
    const todoPath = join(testDir, 'TODO.md');

    // Arrange: Create 1000 tasks in database
    const tx = database.transaction('tasks', 'readwrite');
    const store = tx.objectStore('tasks');

    for (let i = 0; i < taskCount; i++) {
      await store.add({
        id: `task-${i}`,
        title: `Performance Task ${i}`,
        status: i % 3 === 0 ? 'completed' : 'pending',
        priority: i % 2 === 0 ? 'high' : 'medium',
        order: i,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }
    await tx.done;

    const config: SyncConfig = {
      todoPath,
      direction: 'app_to_file',
      strategy: 'three_way_merge',
      conflictResolution: 'prefer_app',
      debounceMs: 0,
      throttleMs: 0,
      maxFileSizeMB: 10,
      maxTasks: 10000,
      webhooksEnabled: false,
      autoBackup: false,
    };

    const coordinator = new SyncCoordinator({ config, database });
    await coordinator.start();

    // Act: Measure sync time
    const startTime = performance.now();
    await coordinator.syncAppToFile();
    const endTime = performance.now();
    const duration = endTime - startTime;

    // Assert
    const stats = coordinator.getStats();
    const throughput = taskCount / (duration / 1000);

    console.log(`\n📊 Test 2 Results:`);
    console.log(`  Tasks synced: ${taskCount}`);
    console.log(`  Duration: ${duration.toFixed(2)}ms (${(duration / 1000).toFixed(2)}s)`);
    console.log(`  Throughput: ${throughput.toFixed(0)} tasks/second`);
    console.log(`  Target: <2000ms`);
    console.log(`  Status: ${duration < 2000 ? '✅ PASS' : '❌ FAIL'}`);

    expect(duration).toBeLessThan(2000);
    expect(stats.successfulSyncs).toBe(1);
    expect(throughput).toBeGreaterThan(100);

    await coordinator.stop();
  }, TEST_TIMEOUT);

  /**
   * Test 3: Memory Usage During Large Sync
   * Target: <100MB increase
   */
  it('should use <100MB memory for 1000 task sync', async () => {
    const taskCount = 1000;
    const todoPath = join(testDir, 'TODO.md');

    // Arrange
    const { writeFile } = await import('fs/promises');
    const todoContent = generateLargeTodoFile(taskCount);
    await writeFile(todoPath, todoContent, 'utf-8');

    const config: SyncConfig = {
      todoPath,
      direction: 'file_to_app',
      strategy: 'three_way_merge',
      conflictResolution: 'prefer_file',
      debounceMs: 0,
      throttleMs: 0,
      maxFileSizeMB: 10,
      maxTasks: 10000,
      webhooksEnabled: false,
      autoBackup: false,
    };

    const coordinator = new SyncCoordinator({ config, database });
    await coordinator.start();

    // Force garbage collection if available
    if (global.gc) {
      global.gc();
    }

    // Act: Measure memory before and after
    const memBefore = measureMemory();
    await coordinator.syncFileToApp();
    const memAfter = measureMemory();

    const memoryIncrease = memAfter.heapUsed - memBefore.heapUsed;
    const memoryIncreaseMB = memoryIncrease / 1024 / 1024;

    // Assert
    console.log(`\n📊 Test 3 Results:`);
    console.log(`  Memory before: ${formatMB(memBefore.heapUsed)} MB`);
    console.log(`  Memory after: ${formatMB(memAfter.heapUsed)} MB`);
    console.log(`  Memory increase: ${formatMB(memoryIncrease)} MB`);
    console.log(`  Target: <100 MB`);
    console.log(`  Status: ${memoryIncreaseMB < 100 ? '✅ PASS' : '❌ FAIL'}`);

    expect(memoryIncreaseMB).toBeLessThan(100);

    await coordinator.stop();
  }, TEST_TIMEOUT);

  /**
   * Test 4: Incremental Sync Performance (Diff Detection)
   * Target: <200ms for 10-task delta
   */
  it('should perform incremental sync in <200ms for 10-task change', async () => {
    const totalTasks = 1000;
    const changedTasks = 10;
    const todoPath = join(testDir, 'TODO.md');

    // Arrange: Initial sync with 1000 tasks
    const { writeFile } = await import('fs/promises');
    const todoContent = generateLargeTodoFile(totalTasks);
    await writeFile(todoPath, todoContent, 'utf-8');

    const config: SyncConfig = {
      todoPath,
      direction: 'file_to_app',
      strategy: 'three_way_merge',
      conflictResolution: 'prefer_file',
      debounceMs: 0,
      throttleMs: 0,
      maxFileSizeMB: 10,
      maxTasks: 10000,
      webhooksEnabled: false,
      autoBackup: false,
    };

    const coordinator = new SyncCoordinator({ config, database });
    await coordinator.start();

    // Initial sync
    await coordinator.syncFileToApp();

    // Act: Modify 10 tasks and measure incremental sync
    const lines = todoContent.split('\n');
    for (let i = 0; i < changedTasks; i++) {
      lines[i + 1] = `- [x] Modified Task ${i} (優先度:高) #modified`;
    }
    await writeFile(todoPath, lines.join('\n'), 'utf-8');

    const startTime = performance.now();
    await coordinator.syncFileToApp();
    const endTime = performance.now();
    const duration = endTime - startTime;

    // Assert
    const stats = coordinator.getStats();

    console.log(`\n📊 Test 4 Results:`);
    console.log(`  Total tasks: ${totalTasks}`);
    console.log(`  Changed tasks: ${changedTasks}`);
    console.log(`  Incremental sync duration: ${duration.toFixed(2)}ms`);
    console.log(`  Target: <200ms`);
    console.log(`  Status: ${duration < 200 ? '✅ PASS' : '❌ FAIL'}`);

    expect(duration).toBeLessThan(200);
    expect(stats.totalSyncs).toBe(2);

    await coordinator.stop();
  }, TEST_TIMEOUT);

  /**
   * Test 5: Concurrent Sync Operations
   * Target: <5 seconds total, no deadlocks
   */
  it('should handle 10 concurrent syncs without deadlocks in <5s', async () => {
    const concurrency = 10;
    const tasksPerSync = 100;
    const coordinators: SyncCoordinator[] = [];

    try {
      // Arrange: Create 10 coordinators with separate databases
      const setupPromises = [];
      for (let i = 0; i < concurrency; i++) {
        const todoPath = join(testDir, `TODO-${i}.md`);
        const dbName = `concurrent-test-${Date.now()}-${i}`;
        const db = await createTestDatabase(dbName);

        const { writeFile } = await import('fs/promises');
        const todoContent = generateLargeTodoFile(tasksPerSync);
        await writeFile(todoPath, todoContent, 'utf-8');

        const config: SyncConfig = {
          todoPath,
          direction: 'file_to_app',
          strategy: 'three_way_merge',
          conflictResolution: 'prefer_file',
          debounceMs: 0,
          throttleMs: 0,
          maxFileSizeMB: 10,
          maxTasks: 10000,
          webhooksEnabled: false,
          autoBackup: false,
        };

        const coordinator = new SyncCoordinator({ config, database: db });
        coordinators.push(coordinator);
        setupPromises.push(coordinator.start());
      }

      await Promise.all(setupPromises);

      // Act: Run all syncs concurrently
      const startTime = performance.now();
      const syncPromises = coordinators.map(c => c.syncFileToApp());
      await Promise.all(syncPromises);
      const endTime = performance.now();
      const totalDuration = endTime - startTime;

      // Assert
      const avgDuration = totalDuration / concurrency;

      console.log(`\n📊 Test 5 Results:`);
      console.log(`  Concurrent operations: ${concurrency}`);
      console.log(`  Tasks per operation: ${tasksPerSync}`);
      console.log(`  Total duration: ${totalDuration.toFixed(2)}ms (${(totalDuration / 1000).toFixed(2)}s)`);
      console.log(`  Average duration: ${avgDuration.toFixed(2)}ms`);
      console.log(`  Target: <5000ms total`);
      console.log(`  Status: ${totalDuration < 5000 ? '✅ PASS' : '❌ FAIL'}`);

      expect(totalDuration).toBeLessThan(5000);

      // Verify all syncs succeeded
      for (const coordinator of coordinators) {
        const stats = coordinator.getStats();
        expect(stats.successfulSyncs).toBe(1);
      }
    } finally {
      // Cleanup
      for (const coordinator of coordinators) {
        await coordinator.stop();
      }
    }
  }, TEST_TIMEOUT);
});
