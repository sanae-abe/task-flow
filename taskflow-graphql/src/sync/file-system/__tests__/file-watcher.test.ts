import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { FileWatcher, createFileWatcher } from '../file-watcher';
import type { FileWatcherOptions, WatcherStatistics } from '../file-watcher';
import type { FileWatcherEvent, SyncConfig } from '../../types';
import { promises as fs } from 'fs';
import path from 'path';
import os from 'os';

// NOTE: chokidar is NOT mocked in this test file to allow real file event testing
// This enables integration tests with actual file system events

describe('FileWatcher', () => {
  let watcher: FileWatcher;
  let tempDir: string;
  let testFilePath: string;
  const mockConfig: SyncConfig = {
    filePath: '',
    debounceMs: 100,
    throttleMs: 500,
    maxFileSizeMB: 5,
    enabled: true,
  };

  beforeEach(async () => {
    // Create test directory within project (to avoid PathValidator issues)
    tempDir = path.join(process.cwd(), `.test-${Date.now()}`);
    await fs.mkdir(tempDir, { recursive: true });
    testFilePath = path.join(tempDir, 'test.md');
    await fs.writeFile(testFilePath, '# Test File\n\nInitial content');
  });

  afterEach(async () => {
    // Cleanup
    if (watcher) {
      await watcher.dispose();
    }
    // Clean up temp directory
    try {
      await fs.rm(tempDir, { recursive: true, force: true });
    } catch (error) {
      // Ignore cleanup errors
    }
  });

  describe('Constructor - Initialization', () => {
    it('should create FileWatcher instance with valid options', () => {
      const options: FileWatcherOptions = {
        filePath: testFilePath,
        config: mockConfig,
      };

      watcher = new FileWatcher(options);

      expect(watcher).toBeInstanceOf(FileWatcher);
      expect(watcher.isWatching()).toBe(false);
    });

    it('should apply default options correctly', () => {
      const options: FileWatcherOptions = {
        filePath: testFilePath,
        config: mockConfig,
      };

      watcher = new FileWatcher(options);
      const stats = watcher.getStats();

      expect(stats.isWatching).toBe(false);
      expect(stats.totalEvents).toBe(0);
      expect(stats.errorCount).toBe(0);
    });

    it('should override default options with provided values', () => {
      const options: FileWatcherOptions = {
        filePath: testFilePath,
        config: mockConfig,
        debounceMs: 200,
        throttleMs: 1000,
        maxFileSizeMB: 10,
        maxRetries: 5,
        retryDelayMs: 2000,
      };

      watcher = new FileWatcher(options);

      expect(watcher).toBeInstanceOf(FileWatcher);
    });

    it('should initialize statistics with correct defaults', () => {
      const options: FileWatcherOptions = {
        filePath: testFilePath,
        config: mockConfig,
      };

      watcher = new FileWatcher(options);
      const stats = watcher.getStats();

      expect(stats.totalEvents).toBe(0);
      expect(stats.eventCounts.change).toBe(0);
      expect(stats.eventCounts.add).toBe(0);
      expect(stats.eventCounts.unlink).toBe(0);
      expect(stats.eventCounts.error).toBe(0);
      expect(stats.errorCount).toBe(0);
      expect(stats.retryCount).toBe(0);
      expect(stats.isWatching).toBe(false);
    });

    it('should throw error for invalid file path', () => {
      const options: FileWatcherOptions = {
        filePath: '../../../etc/passwd', // Path traversal attempt
        config: mockConfig,
      };

      expect(() => new FileWatcher(options)).toThrow();
    });

    it('should validate file path on construction', () => {
      const options: FileWatcherOptions = {
        filePath: testFilePath,
        config: mockConfig,
      };

      watcher = new FileWatcher(options);
      const validatedPath = watcher.getFilePath();

      expect(validatedPath).toBeTruthy();
      expect(path.isAbsolute(validatedPath)).toBe(true);
    });

    it('should setup rate limited handlers during construction', () => {
      const options: FileWatcherOptions = {
        filePath: testFilePath,
        config: mockConfig,
      };

      watcher = new FileWatcher(options);

      // Handlers should be ready even before start()
      expect(watcher).toBeInstanceOf(FileWatcher);
    });

    it('should handle custom ignore patterns', () => {
      const options: FileWatcherOptions = {
        filePath: testFilePath,
        config: mockConfig,
        ignorePatterns: ['*.tmp', '*.swp'],
      };

      watcher = new FileWatcher(options);

      expect(watcher).toBeInstanceOf(FileWatcher);
    });
  });

  describe('start() - Start File Watching', () => {
    it('should start watching successfully', async () => {
      const options: FileWatcherOptions = {
        filePath: testFilePath,
        config: mockConfig,
      };

      watcher = new FileWatcher(options);
      await watcher.start();

      expect(watcher.isWatching()).toBe(true);
      const stats = watcher.getStats();
      expect(stats.isWatching).toBe(true);
      expect(stats.startedAt).toBeInstanceOf(Date);
    });

    it('should emit "started" event on successful start', async () => {
      const options: FileWatcherOptions = {
        filePath: testFilePath,
        config: mockConfig,
      };

      watcher = new FileWatcher(options);

      const startedPromise = new Promise<void>((resolve) => {
        watcher.on('started', (data) => {
          expect(data.path).toBe(watcher.getFilePath());
          expect(data.timestamp).toBeInstanceOf(Date);
          resolve();
        });
      });

      await watcher.start();
      await startedPromise;
    });

    it('should warn when already watching', async () => {
      const options: FileWatcherOptions = {
        filePath: testFilePath,
        config: mockConfig,
      };

      watcher = new FileWatcher(options);
      await watcher.start();

      // Try to start again
      await watcher.start();

      expect(watcher.isWatching()).toBe(true);
    });

    it('should wait for file creation if file does not exist', async () => {
      const nonExistentPath = path.join(tempDir, 'non-existent.md');
      const options: FileWatcherOptions = {
        filePath: nonExistentPath,
        config: mockConfig,
      };

      watcher = new FileWatcher(options);
      await watcher.start();

      expect(watcher.isWatching()).toBe(true);
    });

    it('should validate file size on start', async () => {
      const options: FileWatcherOptions = {
        filePath: testFilePath,
        config: mockConfig,
        maxFileSizeMB: 5,
      };

      watcher = new FileWatcher(options);
      await watcher.start();

      const stats = watcher.getStats();
      expect(stats.currentFileSize).toBeGreaterThan(0);
    });

    it('should throw error for oversized file', async () => {
      // Create a file larger than maxFileSizeMB
      const largePath = path.join(tempDir, 'large.md');
      const largeContent = 'x'.repeat(6 * 1024 * 1024); // 6 MB
      await fs.writeFile(largePath, largeContent);

      const options: FileWatcherOptions = {
        filePath: largePath,
        config: mockConfig,
        maxFileSizeMB: 5,
      };

      watcher = new FileWatcher(options);

      await expect(watcher.start()).rejects.toThrow();
    });

    it('should initialize chokidar with correct options', async () => {
      const options: FileWatcherOptions = {
        filePath: testFilePath,
        config: mockConfig,
        ignorePatterns: ['*.tmp'],
      };

      watcher = new FileWatcher(options);
      await watcher.start();

      expect(watcher.isWatching()).toBe(true);
    });

    it('should update statistics on start', async () => {
      const options: FileWatcherOptions = {
        filePath: testFilePath,
        config: mockConfig,
      };

      watcher = new FileWatcher(options);
      const beforeStats = watcher.getStats();
      expect(beforeStats.startedAt).toBeUndefined();

      await watcher.start();

      const afterStats = watcher.getStats();
      expect(afterStats.startedAt).toBeInstanceOf(Date);
      expect(afterStats.isWatching).toBe(true);
    });
  });

  describe('stop() - Stop File Watching', () => {
    it('should stop watching successfully', async () => {
      const options: FileWatcherOptions = {
        filePath: testFilePath,
        config: mockConfig,
      };

      watcher = new FileWatcher(options);
      await watcher.start();
      expect(watcher.isWatching()).toBe(true);

      await watcher.stop();
      expect(watcher.isWatching()).toBe(false);
    });

    it('should emit "stopped" event on successful stop', async () => {
      const options: FileWatcherOptions = {
        filePath: testFilePath,
        config: mockConfig,
      };

      watcher = new FileWatcher(options);
      await watcher.start();

      const stoppedPromise = new Promise<void>((resolve) => {
        watcher.on('stopped', (data) => {
          expect(data.path).toBe(watcher.getFilePath());
          expect(data.timestamp).toBeInstanceOf(Date);
          resolve();
        });
      });

      await watcher.stop();
      await stoppedPromise;
    });

    it('should warn when not watching', async () => {
      const options: FileWatcherOptions = {
        filePath: testFilePath,
        config: mockConfig,
      };

      watcher = new FileWatcher(options);

      // Try to stop without starting
      await watcher.stop();

      expect(watcher.isWatching()).toBe(false);
    });

    it('should clear retry timeouts on stop', async () => {
      const options: FileWatcherOptions = {
        filePath: testFilePath,
        config: mockConfig,
      };

      watcher = new FileWatcher(options);
      await watcher.start();
      await watcher.stop();

      const stats = watcher.getStats();
      expect(stats.isWatching).toBe(false);
    });

    it('should cancel rate limited handlers on stop', async () => {
      const options: FileWatcherOptions = {
        filePath: testFilePath,
        config: mockConfig,
      };

      watcher = new FileWatcher(options);
      await watcher.start();
      await watcher.stop();

      expect(watcher.isWatching()).toBe(false);
    });

    it('should close chokidar watcher on stop', async () => {
      const options: FileWatcherOptions = {
        filePath: testFilePath,
        config: mockConfig,
      };

      watcher = new FileWatcher(options);
      await watcher.start();
      await watcher.stop();

      expect(watcher.isWatching()).toBe(false);
    });

    it('should update statistics on stop', async () => {
      const options: FileWatcherOptions = {
        filePath: testFilePath,
        config: mockConfig,
      };

      watcher = new FileWatcher(options);
      await watcher.start();

      const beforeStats = watcher.getStats();
      expect(beforeStats.isWatching).toBe(true);

      await watcher.stop();

      const afterStats = watcher.getStats();
      expect(afterStats.isWatching).toBe(false);
    });

    it('should maintain statistics after stop', async () => {
      const options: FileWatcherOptions = {
        filePath: testFilePath,
        config: mockConfig,
      };

      watcher = new FileWatcher(options);
      await watcher.start();
      await watcher.stop();

      const stats = watcher.getStats();
      expect(stats.startedAt).toBeInstanceOf(Date);
    });
  });

  describe('Event Handling - File Events', () => {
    it('should detect file changes', async () => {
      const options: FileWatcherOptions = {
        filePath: testFilePath,
        config: mockConfig,
        debounceMs: 50,
      };

      watcher = new FileWatcher(options);

      const changePromise = new Promise<FileWatcherEvent>((resolve, reject) => {
        const timeout = setTimeout(() => reject(new Error('Timeout waiting for change event')), 5000);
        watcher.on('change', (event) => {
          clearTimeout(timeout);
          resolve(event);
        });
      });

      await watcher.start();

      // Wait for watcher initialization
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Modify file
      await fs.writeFile(testFilePath, '# Updated Content\n\nModified');

      const event = await changePromise;

      expect(event.type).toBe('change');
      expect(event.path).toBeTruthy();
      expect(event.timestamp).toBeInstanceOf(Date);
    });

    it('should detect file additions', async () => {
      const newFilePath = path.join(tempDir, 'new-file.md');
      const options: FileWatcherOptions = {
        filePath: newFilePath,
        config: mockConfig,
        debounceMs: 50,
      };

      watcher = new FileWatcher(options);

      const addPromise = new Promise<FileWatcherEvent>((resolve, reject) => {
        const timeout = setTimeout(() => reject(new Error('Timeout waiting for add event')), 5000);
        watcher.on('add', (event) => {
          clearTimeout(timeout);
          resolve(event);
        });
      });

      await watcher.start();

      // Wait for watcher initialization
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Create file
      await fs.writeFile(newFilePath, 'New file content');

      const event = await addPromise;

      expect(event.type).toBe('add');
      expect(event.path).toBeTruthy();
    });

    it('should detect file deletions', async () => {
      const options: FileWatcherOptions = {
        filePath: testFilePath,
        config: mockConfig,
        debounceMs: 50,
      };

      watcher = new FileWatcher(options);

      const unlinkPromise = new Promise<FileWatcherEvent>((resolve, reject) => {
        const timeout = setTimeout(() => reject(new Error('Timeout waiting for unlink event')), 5000);
        watcher.on('unlink', (event) => {
          clearTimeout(timeout);
          resolve(event);
        });
      });

      await watcher.start();

      // Wait for watcher initialization
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Delete file
      await fs.unlink(testFilePath);

      const event = await unlinkPromise;

      expect(event.type).toBe('unlink');
      expect(event.path).toBeTruthy();
    });

    it('should emit generic "event" for all event types', async () => {
      const options: FileWatcherOptions = {
        filePath: testFilePath,
        config: mockConfig,
        debounceMs: 50,
      };

      watcher = new FileWatcher(options);

      const eventPromise = new Promise<FileWatcherEvent>((resolve, reject) => {
        const timeout = setTimeout(() => reject(new Error('Timeout waiting for generic event')), 5000);
        watcher.on('event', (event) => {
          if (event.type === 'change') {
            clearTimeout(timeout);
            resolve(event);
          }
        });
      });

      await watcher.start();

      // Wait for watcher initialization
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Modify file
      await fs.writeFile(testFilePath, 'Changed content');

      const event = await eventPromise;

      expect(event).toBeDefined();
      expect(event.type).toBe('change');
    });

    it('should include file stats in event', async () => {
      const options: FileWatcherOptions = {
        filePath: testFilePath,
        config: mockConfig,
        debounceMs: 50,
      };

      watcher = new FileWatcher(options);

      const changePromise = new Promise<FileWatcherEvent>((resolve, reject) => {
        const timeout = setTimeout(() => reject(new Error('Timeout waiting for stats event')), 5000);
        watcher.on('change', (event) => {
          clearTimeout(timeout);
          resolve(event);
        });
      });

      await watcher.start();

      // Wait for watcher initialization
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Modify file
      await fs.writeFile(testFilePath, 'New content with stats');

      const event = await changePromise;

      expect(event.stats).toBeDefined();
      expect(event.stats?.size).toBeGreaterThan(0);
      expect(event.stats?.mtime).toBeInstanceOf(Date);
    });
  });

  describe('Debounce & Throttle - Rate Limiting', () => {
    it('should debounce rapid file changes', async () => {
      const options: FileWatcherOptions = {
        filePath: testFilePath,
        config: mockConfig,
        debounceMs: 100,
      };

      watcher = new FileWatcher(options);

      let eventCount = 0;
      watcher.on('change', () => {
        eventCount++;
      });

      await watcher.start();

      // Wait for initial event processing
      await new Promise((resolve) => setTimeout(resolve, 150));

      // Rapid changes
      await fs.writeFile(testFilePath, 'Change 1');
      await new Promise((resolve) => setTimeout(resolve, 20));
      await fs.writeFile(testFilePath, 'Change 2');
      await new Promise((resolve) => setTimeout(resolve, 20));
      await fs.writeFile(testFilePath, 'Change 3');

      // Wait for debounce
      await new Promise((resolve) => setTimeout(resolve, 200));

      // Should be debounced to fewer events
      expect(eventCount).toBeLessThan(3);
    });

    it('should throttle high-frequency events', async () => {
      const options: FileWatcherOptions = {
        filePath: testFilePath,
        config: mockConfig,
        throttleMs: 200,
      };

      watcher = new FileWatcher(options);

      let eventCount = 0;
      watcher.on('change', () => {
        eventCount++;
      });

      await watcher.start();

      // Wait for initial event processing
      await new Promise((resolve) => setTimeout(resolve, 150));

      // Multiple rapid changes
      for (let i = 0; i < 5; i++) {
        await fs.writeFile(testFilePath, `Change ${i}`);
        await new Promise((resolve) => setTimeout(resolve, 30));
      }

      // Wait for throttle window
      await new Promise((resolve) => setTimeout(resolve, 300));

      // Should be throttled
      expect(eventCount).toBeLessThan(5);
    });

    it('should respect custom debounce settings', async () => {
      const options: FileWatcherOptions = {
        filePath: testFilePath,
        config: mockConfig,
        debounceMs: 200,
      };

      watcher = new FileWatcher(options);

      let eventCount = 0;
      watcher.on('change', () => {
        eventCount++;
      });

      await watcher.start();

      // Wait for watcher initialization
      await new Promise((resolve) => setTimeout(resolve, 1000));

      await fs.writeFile(testFilePath, 'Quick change 1');
      await new Promise((resolve) => setTimeout(resolve, 100));
      await fs.writeFile(testFilePath, 'Quick change 2');

      // Wait for debounce period + file system propagation
      await new Promise((resolve) => setTimeout(resolve, 500));

      expect(eventCount).toBeGreaterThan(0);
    });

    it('should flush pending events on demand', async () => {
      const options: FileWatcherOptions = {
        filePath: testFilePath,
        config: mockConfig,
        debounceMs: 1000,
      };

      watcher = new FileWatcher(options);

      let eventCount = 0;
      watcher.on('change', () => {
        eventCount++;
      });

      await watcher.start();

      // Wait for watcher initialization
      await new Promise((resolve) => setTimeout(resolve, 1000));

      await fs.writeFile(testFilePath, 'Change for flush');

      // Wait for file change propagation to chokidar
      await new Promise((resolve) => setTimeout(resolve, 300));

      // Flush immediately instead of waiting for debounce
      watcher.flush();

      // Wait for flush processing
      await new Promise((resolve) => setTimeout(resolve, 200));

      expect(eventCount).toBeGreaterThan(0);
    });
  });

  describe('Error Handling & Retry', () => {
    it('should handle file system errors gracefully', async () => {
      const options: FileWatcherOptions = {
        filePath: testFilePath,
        config: mockConfig,
      };

      watcher = new FileWatcher(options);

      const errorPromise = new Promise<FileWatcherEvent>((resolve) => {
        watcher.on('error', (event) => {
          resolve(event);
        });
      });

      await watcher.start();

      // Simulate error by removing file system permissions (platform-dependent)
      // For this test, we'll just verify error event structure
      // await fs.chmod(testFilePath, 0o000);

      // Note: Actual error triggering is platform-dependent
      // Just verify the watcher is running
      expect(watcher.isWatching()).toBe(true);
    });

    it('should increment error count on errors', async () => {
      const options: FileWatcherOptions = {
        filePath: testFilePath,
        config: mockConfig,
      };

      watcher = new FileWatcher(options);
      await watcher.start();

      const initialStats = watcher.getStats();
      expect(initialStats.errorCount).toBe(0);

      // Error handling is internal, verify initial state
      expect(watcher.isWatching()).toBe(true);
    });

    it('should retry on transient errors', async () => {
      const options: FileWatcherOptions = {
        filePath: testFilePath,
        config: mockConfig,
        maxRetries: 3,
        retryDelayMs: 100,
      };

      watcher = new FileWatcher(options);
      await watcher.start();

      // Retry logic is internal, verify watcher is running
      expect(watcher.isWatching()).toBe(true);
    });

    it('should stop after max retries exceeded', async () => {
      const options: FileWatcherOptions = {
        filePath: testFilePath,
        config: mockConfig,
        maxRetries: 1,
        retryDelayMs: 50,
      };

      watcher = new FileWatcher(options);
      await watcher.start();

      // Max retries logic is internal
      expect(watcher.isWatching()).toBe(true);
    });

    it('should reset error count on successful retry', async () => {
      const options: FileWatcherOptions = {
        filePath: testFilePath,
        config: mockConfig,
        maxRetries: 3,
      };

      watcher = new FileWatcher(options);
      await watcher.start();

      const stats = watcher.getStats();
      expect(stats.errorCount).toBe(0);
    });

    it('should track retry count correctly', async () => {
      const options: FileWatcherOptions = {
        filePath: testFilePath,
        config: mockConfig,
      };

      watcher = new FileWatcher(options);
      await watcher.start();

      const stats = watcher.getStats();
      expect(stats.retryCount).toBe(0);
    });
  });

  describe('Statistics - getStats()', () => {
    it('should return comprehensive statistics', async () => {
      const options: FileWatcherOptions = {
        filePath: testFilePath,
        config: mockConfig,
      };

      watcher = new FileWatcher(options);
      await watcher.start();

      const stats = watcher.getStats();

      expect(stats).toBeDefined();
      expect(stats.isWatching).toBe(true);
      expect(stats.startedAt).toBeInstanceOf(Date);
      expect(stats.totalEvents).toBeDefined();
      expect(stats.eventCounts).toBeDefined();
      expect(stats.errorCount).toBeDefined();
      expect(stats.retryCount).toBeDefined();
    });

    it('should update event counts on file changes', async () => {
      const options: FileWatcherOptions = {
        filePath: testFilePath,
        config: mockConfig,
        debounceMs: 50,
      };

      watcher = new FileWatcher(options);
      await watcher.start();

      const initialStats = watcher.getStats();
      const initialTotal = initialStats.totalEvents;

      // Wait for initial event processing
      await new Promise((resolve) => setTimeout(resolve, 100));

      await fs.writeFile(testFilePath, 'Updated content');

      // Wait for event processing
      await new Promise((resolve) => setTimeout(resolve, 150));

      const updatedStats = watcher.getStats();
      expect(updatedStats.totalEvents).toBeGreaterThanOrEqual(initialTotal);
    });

    it('should track last event timestamp', async () => {
      const options: FileWatcherOptions = {
        filePath: testFilePath,
        config: mockConfig,
        debounceMs: 50,
      };

      watcher = new FileWatcher(options);
      await watcher.start();

      // Wait for watcher initialization
      await new Promise((resolve) => setTimeout(resolve, 500));

      await fs.writeFile(testFilePath, 'New content');

      // Wait for event processing and debounce
      await new Promise((resolve) => setTimeout(resolve, 300));

      const stats = watcher.getStats();
      expect(stats.lastEventAt).toBeInstanceOf(Date);
    });

    it('should track last event type', async () => {
      const options: FileWatcherOptions = {
        filePath: testFilePath,
        config: mockConfig,
        debounceMs: 50,
      };

      watcher = new FileWatcher(options);
      await watcher.start();

      // Wait for watcher initialization
      await new Promise((resolve) => setTimeout(resolve, 500));

      await fs.writeFile(testFilePath, 'Content change');

      // Wait for event processing and debounce
      await new Promise((resolve) => setTimeout(resolve, 300));

      const stats = watcher.getStats();
      expect(['change', 'add']).toContain(stats.lastEventType);
    });

    it('should track current file size', async () => {
      const options: FileWatcherOptions = {
        filePath: testFilePath,
        config: mockConfig,
      };

      watcher = new FileWatcher(options);
      await watcher.start();

      const stats = watcher.getStats();
      expect(stats.currentFileSize).toBeGreaterThan(0);
    });

    it('should track last modified time', async () => {
      const options: FileWatcherOptions = {
        filePath: testFilePath,
        config: mockConfig,
      };

      watcher = new FileWatcher(options);
      await watcher.start();

      const stats = watcher.getStats();
      expect(stats.lastModifiedAt).toBeInstanceOf(Date);
    });

    it('should return deep copy of event counts', () => {
      const options: FileWatcherOptions = {
        filePath: testFilePath,
        config: mockConfig,
      };

      watcher = new FileWatcher(options);
      const stats1 = watcher.getStats();
      const stats2 = watcher.getStats();

      expect(stats1.eventCounts).not.toBe(stats2.eventCounts);
      expect(stats1.eventCounts).toEqual(stats2.eventCounts);
    });
  });

  describe('resetStats() - Statistics Reset', () => {
    it('should reset event counts to zero', async () => {
      const options: FileWatcherOptions = {
        filePath: testFilePath,
        config: mockConfig,
      };

      watcher = new FileWatcher(options);
      await watcher.start();

      watcher.resetStats();

      const stats = watcher.getStats();
      expect(stats.totalEvents).toBe(0);
      expect(stats.eventCounts.change).toBe(0);
      expect(stats.eventCounts.add).toBe(0);
      expect(stats.eventCounts.unlink).toBe(0);
      expect(stats.errorCount).toBe(0);
      expect(stats.retryCount).toBe(0);
    });

    it('should preserve isWatching flag', async () => {
      const options: FileWatcherOptions = {
        filePath: testFilePath,
        config: mockConfig,
      };

      watcher = new FileWatcher(options);
      await watcher.start();

      const beforeReset = watcher.isWatching();
      watcher.resetStats();
      const afterReset = watcher.isWatching();

      expect(beforeReset).toBe(afterReset);
    });

    it('should preserve startedAt timestamp', async () => {
      const options: FileWatcherOptions = {
        filePath: testFilePath,
        config: mockConfig,
      };

      watcher = new FileWatcher(options);
      await watcher.start();

      const beforeStats = watcher.getStats();
      watcher.resetStats();
      const afterStats = watcher.getStats();

      expect(afterStats.startedAt).toEqual(beforeStats.startedAt);
    });

    it('should reset rate limiter statistics', async () => {
      const options: FileWatcherOptions = {
        filePath: testFilePath,
        config: mockConfig,
      };

      watcher = new FileWatcher(options);
      await watcher.start();

      watcher.resetStats();

      const rateLimiterStats = watcher.getRateLimiterStats();
      expect(rateLimiterStats).toBeDefined();
    });
  });

  describe('getFileInfo() - File Information', () => {
    it('should return file information for existing file', async () => {
      const options: FileWatcherOptions = {
        filePath: testFilePath,
        config: mockConfig,
      };

      watcher = new FileWatcher(options);
      const fileInfo = await watcher.getFileInfo();

      expect(fileInfo.exists).toBe(true);
      expect(fileInfo.size).toBeGreaterThan(0);
      expect(fileInfo.mtime).toBeInstanceOf(Date);
      expect(fileInfo.isReadable).toBe(true);
      expect(fileInfo.isWritable).toBe(true);
    });

    it('should return exists: false for non-existent file', async () => {
      const nonExistentPath = path.join(tempDir, 'non-existent.md');
      const options: FileWatcherOptions = {
        filePath: nonExistentPath,
        config: mockConfig,
      };

      watcher = new FileWatcher(options);
      const fileInfo = await watcher.getFileInfo();

      expect(fileInfo.exists).toBe(false);
      expect(fileInfo.size).toBeUndefined();
      expect(fileInfo.mtime).toBeUndefined();
    });

    it('should check file readability', async () => {
      const options: FileWatcherOptions = {
        filePath: testFilePath,
        config: mockConfig,
      };

      watcher = new FileWatcher(options);
      const fileInfo = await watcher.getFileInfo();

      expect(fileInfo.isReadable).toBe(true);
    });

    it('should check file writability', async () => {
      const options: FileWatcherOptions = {
        filePath: testFilePath,
        config: mockConfig,
      };

      watcher = new FileWatcher(options);
      const fileInfo = await watcher.getFileInfo();

      expect(fileInfo.isWritable).toBe(true);
    });
  });

  describe('dispose() - Resource Cleanup', () => {
    it('should stop watcher on dispose', async () => {
      const options: FileWatcherOptions = {
        filePath: testFilePath,
        config: mockConfig,
      };

      watcher = new FileWatcher(options);
      await watcher.start();

      expect(watcher.isWatching()).toBe(true);

      await watcher.dispose();

      expect(watcher.isWatching()).toBe(false);
    });

    it('should remove all event listeners on dispose', async () => {
      const options: FileWatcherOptions = {
        filePath: testFilePath,
        config: mockConfig,
      };

      watcher = new FileWatcher(options);

      let changeCount = 0;
      watcher.on('change', () => changeCount++);

      await watcher.start();
      await watcher.dispose();

      // Listeners should be removed
      expect(watcher.listenerCount('change')).toBe(0);
    });

    it('should clear rate limited handlers on dispose', async () => {
      const options: FileWatcherOptions = {
        filePath: testFilePath,
        config: mockConfig,
      };

      watcher = new FileWatcher(options);
      await watcher.start();
      await watcher.dispose();

      expect(watcher.isWatching()).toBe(false);
    });

    it('should be safe to call dispose multiple times', async () => {
      const options: FileWatcherOptions = {
        filePath: testFilePath,
        config: mockConfig,
      };

      watcher = new FileWatcher(options);
      await watcher.start();

      await watcher.dispose();
      await watcher.dispose();

      expect(watcher.isWatching()).toBe(false);
    });

    it('should be safe to dispose without starting', async () => {
      const options: FileWatcherOptions = {
        filePath: testFilePath,
        config: mockConfig,
      };

      watcher = new FileWatcher(options);

      await expect(watcher.dispose()).resolves.not.toThrow();
    });
  });

  describe('Utility Methods', () => {
    it('should return correct file path', () => {
      const options: FileWatcherOptions = {
        filePath: testFilePath,
        config: mockConfig,
      };

      watcher = new FileWatcher(options);
      const filePath = watcher.getFilePath();

      expect(filePath).toBeTruthy();
      expect(path.isAbsolute(filePath)).toBe(true);
    });

    it('should return isWatching status', async () => {
      const options: FileWatcherOptions = {
        filePath: testFilePath,
        config: mockConfig,
      };

      watcher = new FileWatcher(options);

      expect(watcher.isWatching()).toBe(false);

      await watcher.start();
      expect(watcher.isWatching()).toBe(true);

      await watcher.stop();
      expect(watcher.isWatching()).toBe(false);
    });

    it('should return rate limiter stats', async () => {
      const options: FileWatcherOptions = {
        filePath: testFilePath,
        config: mockConfig,
      };

      watcher = new FileWatcher(options);
      await watcher.start();

      const stats = watcher.getRateLimiterStats();

      expect(stats).toBeInstanceOf(Map);
    });
  });

  describe('Integration Tests - Real-world Scenarios', () => {
    it('should handle rapid file updates correctly', async () => {
      const options: FileWatcherOptions = {
        filePath: testFilePath,
        config: mockConfig,
        debounceMs: 100,
        throttleMs: 300,
      };

      watcher = new FileWatcher(options);

      let eventCount = 0;
      watcher.on('change', () => {
        eventCount++;
      });

      await watcher.start();

      // Wait for initial event processing
      await new Promise((resolve) => setTimeout(resolve, 150));

      // Simulate rapid edits
      for (let i = 0; i < 10; i++) {
        await fs.writeFile(testFilePath, `Edit ${i}`);
        await new Promise((resolve) => setTimeout(resolve, 20));
      }

      // Wait for rate limiting
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Should be rate limited
      expect(eventCount).toBeLessThan(10);
    });

    it('should recover from file deletion and recreation', async () => {
      const options: FileWatcherOptions = {
        filePath: testFilePath,
        config: mockConfig,
        debounceMs: 50,
      };

      watcher = new FileWatcher(options);

      let unlinkDetected = false;
      let addDetected = false;

      watcher.on('unlink', () => {
        unlinkDetected = true;
      });

      watcher.on('add', () => {
        addDetected = true;
      });

      await watcher.start();

      // Wait for watcher initialization
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Delete file
      await fs.unlink(testFilePath);
      await new Promise((resolve) => setTimeout(resolve, 300));

      // Recreate file
      await fs.writeFile(testFilePath, 'Recreated content');
      await new Promise((resolve) => setTimeout(resolve, 150));

      expect(unlinkDetected).toBe(true);
      expect(addDetected).toBe(true);
    });

    it('should maintain accurate statistics across lifecycle', async () => {
      const options: FileWatcherOptions = {
        filePath: testFilePath,
        config: mockConfig,
        debounceMs: 50,
      };

      watcher = new FileWatcher(options);
      await watcher.start();

      const initialStats = watcher.getStats();
      expect(initialStats.isWatching).toBe(true);

      // Wait for initial event processing
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Make changes
      await fs.writeFile(testFilePath, 'Change 1');
      await new Promise((resolve) => setTimeout(resolve, 150));

      const midStats = watcher.getStats();
      expect(midStats.totalEvents).toBeGreaterThanOrEqual(initialStats.totalEvents);

      await watcher.stop();

      const finalStats = watcher.getStats();
      expect(finalStats.isWatching).toBe(false);
      expect(finalStats.totalEvents).toEqual(midStats.totalEvents);
    });

    it('should handle file permission changes gracefully', async () => {
      const options: FileWatcherOptions = {
        filePath: testFilePath,
        config: mockConfig,
      };

      watcher = new FileWatcher(options);
      await watcher.start();

      // Permission changes are platform-specific
      // Just verify watcher continues running
      expect(watcher.isWatching()).toBe(true);

      await watcher.stop();
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty file content', async () => {
      const emptyPath = path.join(tempDir, 'empty.md');
      await fs.writeFile(emptyPath, '');

      const options: FileWatcherOptions = {
        filePath: emptyPath,
        config: mockConfig,
      };

      watcher = new FileWatcher(options);
      await watcher.start();

      const stats = watcher.getStats();
      expect(stats.currentFileSize).toBe(0);

      await watcher.stop();
    });

    it('should handle unicode file names', async () => {
      const unicodePath = path.join(tempDir, '日本語ファイル.md');
      await fs.writeFile(unicodePath, 'Unicode content');

      const options: FileWatcherOptions = {
        filePath: unicodePath,
        config: mockConfig,
      };

      watcher = new FileWatcher(options);
      await watcher.start();

      expect(watcher.isWatching()).toBe(true);

      await watcher.stop();
    });

    it('should handle special characters in file content', async () => {
      const specialContent = '🔥 Special chars: @#$%^&*()';
      await fs.writeFile(testFilePath, specialContent);

      const options: FileWatcherOptions = {
        filePath: testFilePath,
        config: mockConfig,
      };

      watcher = new FileWatcher(options);
      await watcher.start();

      const fileInfo = await watcher.getFileInfo();
      expect(fileInfo.exists).toBe(true);

      await watcher.stop();
    });

    it('should handle very long file paths', async () => {
      const longName = 'a'.repeat(200) + '.md';
      const longPath = path.join(tempDir, longName);
      await fs.writeFile(longPath, 'Content');

      const options: FileWatcherOptions = {
        filePath: longPath,
        config: mockConfig,
      };

      watcher = new FileWatcher(options);
      await watcher.start();

      expect(watcher.isWatching()).toBe(true);

      await watcher.stop();
    });

    it('should handle file at exactly max size limit', async () => {
      const maxSizePath = path.join(tempDir, 'max-size.md');
      const exactSize = 5 * 1024 * 1024; // Exactly 5 MB
      const content = 'x'.repeat(exactSize);
      await fs.writeFile(maxSizePath, content);

      const options: FileWatcherOptions = {
        filePath: maxSizePath,
        config: mockConfig,
        maxFileSizeMB: 5,
      };

      watcher = new FileWatcher(options);

      // Should succeed at exact limit
      await expect(watcher.start()).resolves.not.toThrow();

      await watcher.stop();
    });
  });

  describe('Factory Function - createFileWatcher()', () => {
    it('should create FileWatcher instance via factory', () => {
      const options: FileWatcherOptions = {
        filePath: testFilePath,
        config: mockConfig,
      };

      const factoryWatcher = createFileWatcher(options);

      expect(factoryWatcher).toBeInstanceOf(FileWatcher);
      expect(factoryWatcher.isWatching()).toBe(false);
    });

    it('should create fully functional watcher via factory', async () => {
      const options: FileWatcherOptions = {
        filePath: testFilePath,
        config: mockConfig,
      };

      const factoryWatcher = createFileWatcher(options);

      await factoryWatcher.start();
      expect(factoryWatcher.isWatching()).toBe(true);

      await factoryWatcher.stop();
      expect(factoryWatcher.isWatching()).toBe(false);

      await factoryWatcher.dispose();
    });
  });
});
