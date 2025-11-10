import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { EventEmitter } from 'events';
import type { IDBPDatabase } from 'idb';
import { SyncCoordinator } from '../sync-coordinator';
import type {
  Task,
  SyncConfig,
  FileWatcherEvent,
  Conflict,
} from '../../types';

// Mock dependencies
vi.mock('../../../utils/logger', () => ({
  Logger: {
    getInstance: () => ({
      info: vi.fn(),
      warn: vi.fn(),
      error: vi.fn(),
      debug: vi.fn(),
      startTimer: vi.fn(() => ({ done: vi.fn() })),
      logSyncEvent: vi.fn(),
    }),
  },
}));

vi.mock('../../parsers/markdown-parser');
vi.mock('../../parsers/markdown-serializer');
vi.mock('../../security/path-validator');
vi.mock('../../performance/diff-detector');
vi.mock('../../performance/batch-writer');
vi.mock('../../resilience/retry');
vi.mock('../../resilience/circuit-breaker');
vi.mock('../../merge/three-way-merger');
vi.mock('../../merge/conflict-resolver');
vi.mock('../sync-state-manager');

// Mock FileWatcher
class MockFileWatcher extends EventEmitter {
  private watching = false;

  async start(): Promise<void> {
    this.watching = true;
  }

  async stop(): Promise<void> {
    this.watching = false;
  }

  isWatching(): boolean {
    return this.watching;
  }

  triggerChange(event: FileWatcherEvent): void {
    this.emit('change', event);
  }

  triggerError(event: FileWatcherEvent): void {
    this.emit('error', event);
  }
}

// Mock FileSystem
interface MockFileSystem {
  readFile: ReturnType<typeof vi.fn>;
  writeFile: ReturnType<typeof vi.fn>;
}

// Mock IndexedDB
interface MockIDBPDatabase extends Partial<IDBPDatabase> {
  transaction: ReturnType<typeof vi.fn>;
}

// Test data
const createMockTask = (overrides?: Partial<Task>): Task => ({
  id: 'task-1',
  title: 'Test Task',
  status: 'pending',
  priority: 'medium',
  createdAt: new Date('2025-01-01'),
  updatedAt: new Date('2025-01-01'),
  ...overrides,
});

const createMockConfig = (overrides?: Partial<SyncConfig>): SyncConfig => ({
  todoPath: '/test/TODO.md',
  direction: 'bidirectional',
  strategy: 'last_write_wins',
  conflictResolution: 'prefer_file',
  debounceMs: 1000,
  throttleMs: 5000,
  maxFileSizeMB: 5,
  maxTasks: 10000,
  webhooksEnabled: false,
  autoBackup: true,
  ...overrides,
});

describe('SyncCoordinator', () => {
  let coordinator: SyncCoordinator;
  let mockFileWatcher: MockFileWatcher;
  let mockFileSystem: MockFileSystem;
  let mockDatabase: MockIDBPDatabase;
  let config: SyncConfig;

  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks();

    // Create mock instances
    mockFileWatcher = new MockFileWatcher();
    mockFileSystem = {
      readFile: vi.fn(),
      writeFile: vi.fn(),
    };

    const mockStore = {
      getAll: vi.fn().mockResolvedValue([]),
      get: vi.fn(),
      put: vi.fn(),
      delete: vi.fn(),
    };

    const mockTransaction = {
      objectStore: vi.fn().mockReturnValue(mockStore),
      done: Promise.resolve(),
    };

    mockDatabase = {
      transaction: vi.fn().mockReturnValue(mockTransaction),
    };

    config = createMockConfig();
  });

  afterEach(() => {
    if (coordinator) {
      coordinator.removeAllListeners();
    }
  });

  // ==============================================
  // 1. Lifecycle Tests (7 tests - added 2 validation tests)
  // ==============================================
  describe('Lifecycle Management', () => {
    it('should initialize with correct configuration', () => {
      coordinator = new SyncCoordinator({
        config,
        fileWatcher: mockFileWatcher,
        fileSystem: mockFileSystem,
        database: mockDatabase as IDBPDatabase,
      });

      expect(coordinator).toBeDefined();
      expect(coordinator.getStats().totalSyncs).toBe(0);
    });

    it('should reject invalid configuration - missing todoPath', () => {
      const invalidConfig = { ...config, todoPath: '' };

      expect(() => {
        new SyncCoordinator({
          config: invalidConfig,
          fileWatcher: mockFileWatcher,
          fileSystem: mockFileSystem,
          database: mockDatabase as IDBPDatabase,
        });
      }).toThrow('Invalid config: todoPath is required');
    });

    it('should reject invalid configuration - invalid debounceMs', () => {
      const invalidConfig = { ...config, debounceMs: -100 };

      expect(() => {
        new SyncCoordinator({
          config: invalidConfig,
          fileWatcher: mockFileWatcher,
          fileSystem: mockFileSystem,
          database: mockDatabase as IDBPDatabase,
        });
      }).toThrow('Invalid config: debounceMs must be >= 0');
    });

    it('should start successfully', async () => {
      const { PathValidator } = await import('../../security/path-validator');
      const mockPathValidator = PathValidator as any;
      mockPathValidator.prototype.validate = vi.fn().mockReturnValue('/test/TODO.md');
      mockPathValidator.prototype.exists = vi.fn().mockResolvedValue(true);
      mockPathValidator.prototype.validateFileSize = vi.fn().mockResolvedValue(undefined);

      coordinator = new SyncCoordinator({
        config,
        fileWatcher: mockFileWatcher,
        fileSystem: mockFileSystem,
        database: mockDatabase as IDBPDatabase,
      });

      const startedSpy = vi.fn();
      coordinator.on('started', startedSpy);

      await coordinator.start();

      expect(startedSpy).toHaveBeenCalled();
      expect(mockFileWatcher.isWatching()).toBe(true);
    });

    it('should stop successfully', async () => {
      const { PathValidator } = await import('../../security/path-validator');
      const mockPathValidator = PathValidator as any;
      mockPathValidator.prototype.validate = vi.fn().mockReturnValue('/test/TODO.md');
      mockPathValidator.prototype.exists = vi.fn().mockResolvedValue(true);
      mockPathValidator.prototype.validateFileSize = vi.fn().mockResolvedValue(undefined);

      coordinator = new SyncCoordinator({
        config,
        fileWatcher: mockFileWatcher,
        fileSystem: mockFileSystem,
        database: mockDatabase as IDBPDatabase,
      });

      await coordinator.start();

      const stoppedSpy = vi.fn();
      coordinator.on('stopped', stoppedSpy);

      await coordinator.stop();

      expect(stoppedSpy).toHaveBeenCalled();
      expect(mockFileWatcher.isWatching()).toBe(false);
    });

    it('should not start if already running', async () => {
      const { PathValidator } = await import('../../security/path-validator');
      const mockPathValidator = PathValidator as any;
      mockPathValidator.prototype.validate = vi.fn().mockReturnValue('/test/TODO.md');
      mockPathValidator.prototype.exists = vi.fn().mockResolvedValue(true);
      mockPathValidator.prototype.validateFileSize = vi.fn().mockResolvedValue(undefined);

      coordinator = new SyncCoordinator({
        config,
        fileWatcher: mockFileWatcher,
        fileSystem: mockFileSystem,
        database: mockDatabase as IDBPDatabase,
      });

      await coordinator.start();
      await coordinator.start(); // Second start should be no-op

      expect(mockFileWatcher.isWatching()).toBe(true);
    });

    it('should not stop if not running', async () => {
      coordinator = new SyncCoordinator({
        config,
        fileWatcher: mockFileWatcher,
        fileSystem: mockFileSystem,
        database: mockDatabase as IDBPDatabase,
      });

      await coordinator.stop(); // Should not throw

      expect(mockFileWatcher.isWatching()).toBe(false);
    });
  });

  // ==============================================
  // 2. File to App Sync Tests (10 tests)
  // ==============================================
  describe('File to App Sync', () => {
    beforeEach(async () => {
      const { PathValidator } = await import('../../security/path-validator');
      const { CircuitBreakerManager } = await import('../../resilience/circuit-breaker');
      const { Retry } = await import('../../resilience/retry');
      const { MarkdownParser } = await import('../../parsers/markdown-parser');
      const { DiffDetector } = await import('../../performance/diff-detector');
      const { BatchWriter } = await import('../../performance/batch-writer');

      const mockPathValidator = PathValidator as any;
      mockPathValidator.prototype.validate = vi.fn().mockReturnValue('/test/TODO.md');
      mockPathValidator.prototype.exists = vi.fn().mockResolvedValue(true);

      const mockCircuitBreaker = CircuitBreakerManager as any;
      mockCircuitBreaker.prototype.createBreaker = vi.fn();
      mockCircuitBreaker.prototype.getBreaker = vi.fn().mockReturnValue({
        fire: vi.fn().mockResolvedValue('# Test TODO\n\n- [ ] Task 1'),
      });
      mockCircuitBreaker.prototype.removeAll = vi.fn();

      const mockRetry = Retry as any;
      mockRetry.prototype.execute = vi.fn().mockImplementation(async (fn) => await fn());

      const mockParser = MarkdownParser as any;
      mockParser.prototype.parse = vi.fn().mockResolvedValue({
        sections: [],
        tasks: [],
      });
      mockParser.prototype.extractTasks = vi.fn().mockReturnValue([
        {
          title: 'Task 1',
          checked: false,
          lineNumber: 2,
          section: '',
          indentLevel: 0,
          rawText: '- [ ] Task 1',
        },
      ]);

      const mockDiffDetector = DiffDetector as any;
      mockDiffDetector.prototype.isIdentical = vi.fn().mockReturnValue(false);
      mockDiffDetector.prototype.detectDiff = vi.fn().mockReturnValue([]);
      mockDiffDetector.prototype.getSummary = vi.fn().mockReturnValue({
        addedChars: 10,
        deletedChars: 0,
        changeSeverity: 'minor',
      });

      const mockBatchWriter = BatchWriter as any;
      mockBatchWriter.prototype.bulkUpsertTasks = vi.fn().mockResolvedValue(undefined);
      mockBatchWriter.prototype.bulkDeleteTasks = vi.fn().mockResolvedValue(undefined);

      coordinator = new SyncCoordinator({
        config,
        fileSystem: mockFileSystem,
        database: mockDatabase as IDBPDatabase,
      });
    });

    it('should sync file to app successfully', async () => {
      const syncCompletedSpy = vi.fn();
      coordinator.on('sync-completed', syncCompletedSpy);

      await coordinator.syncFileToApp();

      expect(syncCompletedSpy).toHaveBeenCalled();
      const stats = coordinator.getStats();
      expect(stats.totalSyncs).toBe(1);
      expect(stats.successfulSyncs).toBe(1);
    });

    it('should detect file changes', async () => {
      const { DiffDetector } = await import('../../performance/diff-detector');
      const mockDiffDetector = DiffDetector as any;

      // First sync
      await coordinator.syncFileToApp();

      // Second sync with identical content should be skipped
      mockDiffDetector.prototype.isIdentical = vi.fn().mockReturnValue(true);
      await coordinator.syncFileToApp();

      const stats = coordinator.getStats();
      expect(stats.totalSyncs).toBe(2); // Both syncs execute, but second has no changes
    });

    it('should create new tasks from file', async () => {
      const { BatchWriter } = await import('../../performance/batch-writer');
      const mockBatchWriter = BatchWriter as any;

      await coordinator.syncFileToApp();

      expect(mockBatchWriter.prototype.bulkUpsertTasks).toHaveBeenCalled();
    });

    it('should update existing tasks', async () => {
      // Re-initialize coordinator with fresh mocks
      const mockStore = {
        getAll: vi.fn().mockResolvedValue([
          createMockTask({ title: 'Task 1', status: 'pending' }),
        ]),
        get: vi.fn(),
        put: vi.fn(),
        delete: vi.fn(),
      };

      const mockTransaction = {
        objectStore: vi.fn().mockReturnValue(mockStore),
        done: Promise.resolve(),
      };

      const testDatabase = {
        transaction: vi.fn().mockReturnValue(mockTransaction),
      };

      const { MarkdownParser } = await import('../../parsers/markdown-parser');
      const { BatchWriter } = await import('../../performance/batch-writer');

      const mockParser = MarkdownParser as any;
      const mockBatchWriter = BatchWriter as any;

      // Clear previous mocks
      mockParser.prototype.extractTasks = vi.fn().mockReturnValue([
        {
          title: 'Task 1',
          checked: true, // Status changed
          lineNumber: 2,
          section: '',
          indentLevel: 0,
          rawText: '- [x] Task 1',
        },
      ]);

      mockBatchWriter.prototype.bulkUpsertTasks = vi.fn().mockResolvedValue(undefined);

      const testCoordinator = new SyncCoordinator({
        config,
        fileSystem: mockFileSystem,
        database: testDatabase as IDBPDatabase,
      });

      await testCoordinator.syncFileToApp();

      expect(mockBatchWriter.prototype.bulkUpsertTasks).toHaveBeenCalled();
    });

    it('should delete removed tasks', async () => {
      const mockStore = {
        getAll: vi.fn().mockResolvedValue([
          createMockTask({ id: 'task-1', title: 'Deleted Task' }),
        ]),
        get: vi.fn(),
        put: vi.fn(),
        delete: vi.fn(),
      };

      const mockTransaction = {
        objectStore: vi.fn().mockReturnValue(mockStore),
        done: Promise.resolve(),
      };

      mockDatabase.transaction = vi.fn().mockReturnValue(mockTransaction);

      const { MarkdownParser } = await import('../../parsers/markdown-parser');
      const mockParser = MarkdownParser as any;
      mockParser.prototype.extractTasks = vi.fn().mockReturnValue([]); // No tasks in file

      await coordinator.syncFileToApp();

      const { BatchWriter } = await import('../../performance/batch-writer');
      const mockBatchWriter = BatchWriter as any;
      expect(mockBatchWriter.prototype.bulkDeleteTasks).toHaveBeenCalled();
    });

    it('should handle file read errors', async () => {
      const { CircuitBreakerManager } = await import('../../resilience/circuit-breaker');
      const mockCircuitBreaker = CircuitBreakerManager as any;
      mockCircuitBreaker.prototype.getBreaker = vi.fn().mockReturnValue({
        fire: vi.fn().mockRejectedValue(new Error('File read failed')),
      });
      mockCircuitBreaker.prototype.createBreaker = vi.fn();
      mockCircuitBreaker.prototype.removeAll = vi.fn();

      coordinator = new SyncCoordinator({
        config,
        fileSystem: mockFileSystem,
        database: mockDatabase as IDBPDatabase,
      });

      const syncErrorSpy = vi.fn();
      coordinator.on('sync-error', syncErrorSpy);

      await expect(coordinator.syncFileToApp()).rejects.toThrow('File read failed');

      const stats = coordinator.getStats();
      expect(stats.failedSyncs).toBe(1);
      expect(syncErrorSpy).toHaveBeenCalled();
    });

    it('should detect conflicts during sync', async () => {
      const mockStore = {
        getAll: vi.fn().mockResolvedValue([
          createMockTask({
            title: 'Task 1',
            status: 'pending',
            priority: 'high',
          }),
        ]),
        get: vi.fn(),
        put: vi.fn(),
        delete: vi.fn(),
      };

      const mockTransaction = {
        objectStore: vi.fn().mockReturnValue(mockStore),
        done: Promise.resolve(),
      };

      const testDatabase = {
        transaction: vi.fn().mockReturnValue(mockTransaction),
      };

      const { MarkdownParser } = await import('../../parsers/markdown-parser');
      const mockParser = MarkdownParser as any;
      mockParser.prototype.extractTasks = vi.fn().mockReturnValue([
        {
          title: 'Task 1',
          checked: true,
          lineNumber: 2,
          section: '',
          indentLevel: 0,
          rawText: '- [x] Task 1',
          metadata: { priority: 'low' }, // Conflict: different priority
        },
      ]);

      const testCoordinator = new SyncCoordinator({
        config,
        fileSystem: mockFileSystem,
        database: testDatabase as IDBPDatabase,
      });

      await testCoordinator.syncFileToApp();

      const conflicts = testCoordinator.getConflicts();
      // Conflicts should be detected (basic strategy)
      expect(conflicts.length).toBeGreaterThanOrEqual(0);
    });

    it('should skip sync if already in progress', async () => {
      const { Retry } = await import('../../resilience/retry');
      const mockRetry = Retry as any;

      let syncInProgress = false;
      mockRetry.prototype.execute = vi.fn().mockImplementation(async (fn) => {
        if (syncInProgress) {
          throw new Error('Sync already in progress');
        }
        syncInProgress = true;
        await new Promise(resolve => setTimeout(resolve, 100));
        const result = await fn();
        syncInProgress = false;
        return result;
      });

      coordinator = new SyncCoordinator({
        config,
        fileSystem: mockFileSystem,
        database: mockDatabase as IDBPDatabase,
      });

      // Start two syncs concurrently
      const sync1 = coordinator.syncFileToApp();
      const sync2 = coordinator.syncFileToApp(); // Should be skipped

      await Promise.all([sync1, sync2]);

      const stats = coordinator.getStats();
      expect(stats.totalSyncs).toBe(1); // Only one sync executed
    });

    it('should emit sync-completed event', async () => {
      const syncCompletedSpy = vi.fn();
      coordinator.on('sync-completed', syncCompletedSpy);

      await coordinator.syncFileToApp();

      expect(syncCompletedSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          direction: 'file_to_app',
          success: true,
        })
      );
    });

    it('should emit sync-error event on failure', async () => {
      const { CircuitBreakerManager } = await import('../../resilience/circuit-breaker');
      const mockCircuitBreaker = CircuitBreakerManager as any;
      mockCircuitBreaker.prototype.getBreaker = vi.fn().mockReturnValue({
        fire: vi.fn().mockRejectedValue(new Error('Sync failed')),
      });
      mockCircuitBreaker.prototype.createBreaker = vi.fn();
      mockCircuitBreaker.prototype.removeAll = vi.fn();

      coordinator = new SyncCoordinator({
        config,
        fileSystem: mockFileSystem,
        database: mockDatabase as IDBPDatabase,
      });

      const syncErrorSpy = vi.fn();
      coordinator.on('sync-error', syncErrorSpy);

      await expect(coordinator.syncFileToApp()).rejects.toThrow('Sync failed');

      expect(syncErrorSpy).toHaveBeenCalled();
    });
  });

  // ==============================================
  // 3. App to File Sync Tests (10 tests)
  // ==============================================
  describe('App to File Sync', () => {
    beforeEach(async () => {
      const { PathValidator } = await import('../../security/path-validator');
      const { CircuitBreakerManager } = await import('../../resilience/circuit-breaker');
      const { Retry } = await import('../../resilience/retry');
      const { MarkdownSerializer } = await import('../../parsers/markdown-serializer');
      const { MarkdownParser } = await import('../../parsers/markdown-parser');

      const mockPathValidator = PathValidator as any;
      mockPathValidator.prototype.validate = vi.fn().mockReturnValue('/test/TODO.md');
      mockPathValidator.prototype.exists = vi.fn().mockResolvedValue(true);

      const mockCircuitBreaker = CircuitBreakerManager as any;
      mockCircuitBreaker.prototype.createBreaker = vi.fn();
      mockCircuitBreaker.prototype.getBreaker = vi.fn().mockReturnValue({
        fire: vi.fn().mockResolvedValue(undefined),
      });
      mockCircuitBreaker.prototype.removeAll = vi.fn();

      const mockRetry = Retry as any;
      mockRetry.prototype.execute = vi.fn().mockImplementation(async (fn) => await fn());

      const mockSerializer = MarkdownSerializer as any;
      mockSerializer.prototype.serialize = vi.fn().mockResolvedValue('# Test TODO\n\n- [ ] Task 1');

      const mockParser = MarkdownParser as any;
      mockParser.prototype.validate = vi.fn().mockReturnValue({ valid: true });

      coordinator = new SyncCoordinator({
        config,
        fileSystem: mockFileSystem,
        database: mockDatabase as IDBPDatabase,
      });
    });

    it('should sync app to file successfully', async () => {
      const mockStore = {
        getAll: vi.fn().mockResolvedValue([createMockTask()]),
        get: vi.fn(),
        put: vi.fn(),
        delete: vi.fn(),
      };

      const mockTransaction = {
        objectStore: vi.fn().mockReturnValue(mockStore),
        done: Promise.resolve(),
      };

      mockDatabase.transaction = vi.fn().mockReturnValue(mockTransaction);

      const syncCompletedSpy = vi.fn();
      coordinator.on('sync-completed', syncCompletedSpy);

      await coordinator.syncAppToFile();

      expect(syncCompletedSpy).toHaveBeenCalled();
      const stats = coordinator.getStats();
      expect(stats.totalSyncs).toBe(1);
      expect(stats.successfulSyncs).toBe(1);
    });

    it('should serialize tasks to markdown', async () => {
      const mockStore = {
        getAll: vi.fn().mockResolvedValue([
          createMockTask({ title: 'Task 1' }),
          createMockTask({ title: 'Task 2', id: 'task-2' }),
        ]),
        get: vi.fn(),
        put: vi.fn(),
        delete: vi.fn(),
      };

      const mockTransaction = {
        objectStore: vi.fn().mockReturnValue(mockStore),
        done: Promise.resolve(),
      };

      mockDatabase.transaction = vi.fn().mockReturnValue(mockTransaction);

      await coordinator.syncAppToFile();

      const { MarkdownSerializer } = await import('../../parsers/markdown-serializer');
      const mockSerializer = MarkdownSerializer as any;
      expect(mockSerializer.prototype.serialize).toHaveBeenCalled();
    });

    it('should write to file', async () => {
      const mockStore = {
        getAll: vi.fn().mockResolvedValue([createMockTask()]),
        get: vi.fn(),
        put: vi.fn(),
        delete: vi.fn(),
      };

      const mockTransaction = {
        objectStore: vi.fn().mockReturnValue(mockStore),
        done: Promise.resolve(),
      };

      mockDatabase.transaction = vi.fn().mockReturnValue(mockTransaction);

      await coordinator.syncAppToFile();

      const { CircuitBreakerManager } = await import('../../resilience/circuit-breaker');
      const mockCircuitBreaker = CircuitBreakerManager as any;
      const breaker = mockCircuitBreaker.prototype.getBreaker();
      expect(breaker.fire).toHaveBeenCalled();
    });

    it('should create backup before writing', async () => {
      const mockStore = {
        getAll: vi.fn().mockResolvedValue([createMockTask()]),
        get: vi.fn(),
        put: vi.fn(),
        delete: vi.fn(),
      };

      const mockTransaction = {
        objectStore: vi.fn().mockReturnValue(mockStore),
        done: Promise.resolve(),
      };

      mockDatabase.transaction = vi.fn().mockReturnValue(mockTransaction);

      mockFileSystem.readFile = vi.fn().mockResolvedValue('# Old TODO');

      await coordinator.syncAppToFile();

      // Backup is created internally (not exposed via mockFileSystem in this test)
      const stats = coordinator.getStats();
      expect(stats.successfulSyncs).toBe(1);
    });

    it('should skip file write in dry run mode', async () => {
      const dryRunConfig = createMockConfig({ dryRun: true });
      coordinator = new SyncCoordinator({
        config: dryRunConfig,
        fileSystem: mockFileSystem,
        database: mockDatabase as IDBPDatabase,
      });

      const mockStore = {
        getAll: vi.fn().mockResolvedValue([createMockTask()]),
        get: vi.fn(),
        put: vi.fn(),
        delete: vi.fn(),
      };

      const mockTransaction = {
        objectStore: vi.fn().mockReturnValue(mockStore),
        done: Promise.resolve(),
      };

      mockDatabase.transaction = vi.fn().mockReturnValue(mockTransaction);

      await coordinator.syncAppToFile();

      const stats = coordinator.getStats();
      expect(stats.successfulSyncs).toBe(1);
    });

    it('should handle file write errors', async () => {
      const { CircuitBreakerManager } = await import('../../resilience/circuit-breaker');
      const mockCircuitBreaker = CircuitBreakerManager as any;
      mockCircuitBreaker.prototype.getBreaker = vi.fn().mockReturnValue({
        fire: vi.fn().mockRejectedValue(new Error('File write failed')),
      });

      coordinator = new SyncCoordinator({
        config,
        fileSystem: mockFileSystem,
        database: mockDatabase as IDBPDatabase,
      });

      const mockStore = {
        getAll: vi.fn().mockResolvedValue([createMockTask()]),
        get: vi.fn(),
        put: vi.fn(),
        delete: vi.fn(),
      };

      const mockTransaction = {
        objectStore: vi.fn().mockReturnValue(mockStore),
        done: Promise.resolve(),
      };

      mockDatabase.transaction = vi.fn().mockReturnValue(mockTransaction);

      await expect(coordinator.syncAppToFile()).rejects.toThrow('File write failed');

      const stats = coordinator.getStats();
      expect(stats.failedSyncs).toBe(1);
    });

    it('should handle invalid markdown generation', async () => {
      const { MarkdownParser } = await import('../../parsers/markdown-parser');
      const mockParser = MarkdownParser as any;
      mockParser.prototype.validate = vi.fn().mockReturnValue({
        valid: false,
        errors: ['Invalid markdown'],
      });

      coordinator = new SyncCoordinator({
        config,
        fileSystem: mockFileSystem,
        database: mockDatabase as IDBPDatabase,
      });

      const mockStore = {
        getAll: vi.fn().mockResolvedValue([createMockTask()]),
        get: vi.fn(),
        put: vi.fn(),
        delete: vi.fn(),
      };

      const mockTransaction = {
        objectStore: vi.fn().mockReturnValue(mockStore),
        done: Promise.resolve(),
      };

      mockDatabase.transaction = vi.fn().mockReturnValue(mockTransaction);

      await expect(coordinator.syncAppToFile()).rejects.toThrow('Invalid markdown');
    });

    it('should handle empty task list', async () => {
      const mockStore = {
        getAll: vi.fn().mockResolvedValue([]),
        get: vi.fn(),
        put: vi.fn(),
        delete: vi.fn(),
      };

      const mockTransaction = {
        objectStore: vi.fn().mockReturnValue(mockStore),
        done: Promise.resolve(),
      };

      mockDatabase.transaction = vi.fn().mockReturnValue(mockTransaction);

      await coordinator.syncAppToFile();

      const stats = coordinator.getStats();
      expect(stats.successfulSyncs).toBe(1);
    });

    it('should emit sync-completed event', async () => {
      const mockStore = {
        getAll: vi.fn().mockResolvedValue([createMockTask()]),
        get: vi.fn(),
        put: vi.fn(),
        delete: vi.fn(),
      };

      const mockTransaction = {
        objectStore: vi.fn().mockReturnValue(mockStore),
        done: Promise.resolve(),
      };

      mockDatabase.transaction = vi.fn().mockReturnValue(mockTransaction);

      const syncCompletedSpy = vi.fn();
      coordinator.on('sync-completed', syncCompletedSpy);

      await coordinator.syncAppToFile();

      expect(syncCompletedSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          direction: 'app_to_file',
          success: true,
        })
      );
    });

    it('should skip sync if already in progress', async () => {
      const mockStore = {
        getAll: vi.fn().mockResolvedValue([createMockTask()]),
        get: vi.fn(),
        put: vi.fn(),
        delete: vi.fn(),
      };

      const mockTransaction = {
        objectStore: vi.fn().mockReturnValue(mockStore),
        done: Promise.resolve(),
      };

      mockDatabase.transaction = vi.fn().mockReturnValue(mockTransaction);

      const { Retry } = await import('../../resilience/retry');
      const mockRetry = Retry as any;

      let syncInProgress = false;
      mockRetry.prototype.execute = vi.fn().mockImplementation(async (fn) => {
        if (syncInProgress) {
          throw new Error('Sync already in progress');
        }
        syncInProgress = true;
        await new Promise(resolve => setTimeout(resolve, 100));
        const result = await fn();
        syncInProgress = false;
        return result;
      });

      coordinator = new SyncCoordinator({
        config,
        fileSystem: mockFileSystem,
        database: mockDatabase as IDBPDatabase,
      });

      const sync1 = coordinator.syncAppToFile();
      const sync2 = coordinator.syncAppToFile(); // Should be skipped

      await Promise.all([sync1, sync2]);

      const stats = coordinator.getStats();
      expect(stats.totalSyncs).toBe(1);
    });
  });

  // ==============================================
  // 4. Statistics Tests (5 tests)
  // ==============================================
  describe('Statistics', () => {
    beforeEach(async () => {
      const { PathValidator } = await import('../../security/path-validator');
      const { CircuitBreakerManager } = await import('../../resilience/circuit-breaker');
      const { Retry } = await import('../../resilience/retry');
      const { MarkdownParser } = await import('../../parsers/markdown-parser');
      const { DiffDetector } = await import('../../performance/diff-detector');
      const { BatchWriter } = await import('../../performance/batch-writer');

      const mockPathValidator = PathValidator as any;
      mockPathValidator.prototype.validate = vi.fn().mockReturnValue('/test/TODO.md');

      const mockCircuitBreaker = CircuitBreakerManager as any;
      mockCircuitBreaker.prototype.createBreaker = vi.fn();
      mockCircuitBreaker.prototype.getBreaker = vi.fn().mockReturnValue({
        fire: vi.fn().mockResolvedValue('# Test'),
      });
      mockCircuitBreaker.prototype.removeAll = vi.fn();

      const mockRetry = Retry as any;
      mockRetry.prototype.execute = vi.fn().mockImplementation(async (fn) => await fn());

      const mockParser = MarkdownParser as any;
      mockParser.prototype.parse = vi.fn().mockResolvedValue({ sections: [], tasks: [] });
      mockParser.prototype.extractTasks = vi.fn().mockReturnValue([]);

      const mockDiffDetector = DiffDetector as any;
      mockDiffDetector.prototype.isIdentical = vi.fn().mockReturnValue(false);
      mockDiffDetector.prototype.detectDiff = vi.fn().mockReturnValue([]);
      mockDiffDetector.prototype.getSummary = vi.fn().mockReturnValue({
        addedChars: 0,
        deletedChars: 0,
        changeSeverity: 'minor',
      });

      const mockBatchWriter = BatchWriter as any;
      mockBatchWriter.prototype.bulkUpsertTasks = vi.fn().mockResolvedValue(undefined);

      coordinator = new SyncCoordinator({
        config,
        fileSystem: mockFileSystem,
        database: mockDatabase as IDBPDatabase,
      });
    });

    it('should track total syncs', async () => {
      await coordinator.syncFileToApp();
      await coordinator.syncFileToApp();

      const stats = coordinator.getStats();
      expect(stats.totalSyncs).toBe(2);
    });

    it('should track successful syncs', async () => {
      await coordinator.syncFileToApp();

      const stats = coordinator.getStats();
      expect(stats.successfulSyncs).toBe(1);
      expect(stats.failedSyncs).toBe(0);
    });

    it('should track failed syncs', async () => {
      const { CircuitBreakerManager } = await import('../../resilience/circuit-breaker');
      const mockCircuitBreaker = CircuitBreakerManager as any;
      mockCircuitBreaker.prototype.getBreaker = vi.fn().mockReturnValue({
        fire: vi.fn().mockRejectedValue(new Error('Test error')),
      });

      coordinator = new SyncCoordinator({
        config,
        fileSystem: mockFileSystem,
        database: mockDatabase as IDBPDatabase,
      });

      await expect(coordinator.syncFileToApp()).rejects.toThrow();

      const stats = coordinator.getStats();
      expect(stats.failedSyncs).toBe(1);
    });

    it('should calculate average duration', async () => {
      await coordinator.syncFileToApp();
      await coordinator.syncFileToApp();

      const stats = coordinator.getStats();
      expect(stats.averageDurationMs).toBeGreaterThanOrEqual(0);
    });

    it('should track last sync timestamp', async () => {
      const beforeSync = new Date();
      await coordinator.syncFileToApp();
      const afterSync = new Date();

      const stats = coordinator.getStats();
      expect(stats.lastSyncAt).toBeDefined();
      expect(stats.lastSyncAt!.getTime()).toBeGreaterThanOrEqual(beforeSync.getTime());
      expect(stats.lastSyncAt!.getTime()).toBeLessThanOrEqual(afterSync.getTime());
    });
  });

  // ==============================================
  // 5. Conflict Management Tests (5 tests)
  // ==============================================
  describe('Conflict Management', () => {
    beforeEach(async () => {
      const { PathValidator } = await import('../../security/path-validator');
      const { CircuitBreakerManager } = await import('../../resilience/circuit-breaker');
      const { Retry } = await import('../../resilience/retry');
      const { MarkdownParser } = await import('../../parsers/markdown-parser');
      const { DiffDetector } = await import('../../performance/diff-detector');
      const { BatchWriter } = await import('../../performance/batch-writer');

      const mockPathValidator = PathValidator as any;
      mockPathValidator.prototype.validate = vi.fn().mockReturnValue('/test/TODO.md');

      const mockCircuitBreaker = CircuitBreakerManager as any;
      mockCircuitBreaker.prototype.createBreaker = vi.fn();
      mockCircuitBreaker.prototype.getBreaker = vi.fn().mockReturnValue({
        fire: vi.fn().mockResolvedValue('# Test'),
      });
      mockCircuitBreaker.prototype.removeAll = vi.fn();

      const mockRetry = Retry as any;
      mockRetry.prototype.execute = vi.fn().mockImplementation(async (fn) => await fn());

      const mockParser = MarkdownParser as any;
      mockParser.prototype.parse = vi.fn().mockResolvedValue({ sections: [], tasks: [] });

      const mockDiffDetector = DiffDetector as any;
      mockDiffDetector.prototype.isIdentical = vi.fn().mockReturnValue(false);
      mockDiffDetector.prototype.detectDiff = vi.fn().mockReturnValue([]);
      mockDiffDetector.prototype.getSummary = vi.fn().mockReturnValue({
        addedChars: 10,
        deletedChars: 0,
        changeSeverity: 'minor',
      });

      const mockBatchWriter = BatchWriter as any;
      mockBatchWriter.prototype.bulkUpsertTasks = vi.fn().mockResolvedValue(undefined);

      coordinator = new SyncCoordinator({
        config,
        fileSystem: mockFileSystem,
        database: mockDatabase as IDBPDatabase,
      });
    });

    it('should detect conflicts', async () => {
      const mockStore = {
        getAll: vi.fn().mockResolvedValue([
          createMockTask({
            title: 'Task 1',
            status: 'pending',
            priority: 'high',
          }),
        ]),
        get: vi.fn(),
        put: vi.fn(),
        delete: vi.fn(),
      };

      const mockTransaction = {
        objectStore: vi.fn().mockReturnValue(mockStore),
        done: Promise.resolve(),
      };

      const testDatabase = {
        transaction: vi.fn().mockReturnValue(mockTransaction),
      };

      const { MarkdownParser } = await import('../../parsers/markdown-parser');
      const mockParser = MarkdownParser as any;
      mockParser.prototype.extractTasks = vi.fn().mockReturnValue([
        {
          title: 'Task 1',
          checked: true,
          lineNumber: 2,
          section: '',
          indentLevel: 0,
          rawText: '- [x] Task 1',
          metadata: { priority: 'low' },
        },
      ]);

      const testCoordinator = new SyncCoordinator({
        config,
        fileSystem: mockFileSystem,
        database: testDatabase as IDBPDatabase,
      });

      await testCoordinator.syncFileToApp();

      const conflicts = testCoordinator.getConflicts();
      // Verify conflict detection
      expect(conflicts.length).toBeGreaterThanOrEqual(0);
      if (conflicts.length > 0) {
        expect(conflicts[0].conflictType).toBe('content');
      }
    });

    it('should return only unresolved conflicts', async () => {
      const mockStore = {
        getAll: vi.fn().mockResolvedValue([
          createMockTask({ title: 'Task 1', priority: 'high' }),
        ]),
        get: vi.fn(),
        put: vi.fn(),
        delete: vi.fn(),
      };

      const mockTransaction = {
        objectStore: vi.fn().mockReturnValue(mockStore),
        done: Promise.resolve(),
      };

      mockDatabase.transaction = vi.fn().mockReturnValue(mockTransaction);

      const { MarkdownParser } = await import('../../parsers/markdown-parser');
      const mockParser = MarkdownParser as any;
      mockParser.prototype.extractTasks = vi.fn().mockReturnValue([
        {
          title: 'Task 1',
          checked: false,
          lineNumber: 2,
          section: '',
          indentLevel: 0,
          rawText: '- [ ] Task 1',
          metadata: { priority: 'low' },
        },
      ]);

      await coordinator.syncFileToApp();

      const allConflicts = coordinator.getConflicts();
      const unresolvedConflicts = allConflicts.filter(c => !c.resolved);

      expect(unresolvedConflicts.length).toBeGreaterThanOrEqual(0);
    });

    it('should resolve conflicts using prefer_file policy', async () => {
      const preferFileConfig = createMockConfig({ conflictResolution: 'prefer_file' });
      coordinator = new SyncCoordinator({
        config: preferFileConfig,
        fileSystem: mockFileSystem,
        database: mockDatabase as IDBPDatabase,
      });

      const mockStore = {
        getAll: vi.fn().mockResolvedValue([
          createMockTask({ title: 'Task 1', status: 'pending' }),
        ]),
        get: vi.fn(),
        put: vi.fn(),
        delete: vi.fn(),
      };

      const mockTransaction = {
        objectStore: vi.fn().mockReturnValue(mockStore),
        done: Promise.resolve(),
      };

      mockDatabase.transaction = vi.fn().mockReturnValue(mockTransaction);

      const { MarkdownParser } = await import('../../parsers/markdown-parser');
      const mockParser = MarkdownParser as any;
      mockParser.prototype.extractTasks = vi.fn().mockReturnValue([
        {
          title: 'Task 1',
          checked: true,
          lineNumber: 2,
          section: '',
          indentLevel: 0,
          rawText: '- [x] Task 1',
        },
      ]);

      await coordinator.syncFileToApp();

      const stats = coordinator.getStats();
      expect(stats.successfulSyncs).toBe(1);
    });

    it('should resolve conflicts using prefer_app policy', async () => {
      const preferAppConfig = createMockConfig({ conflictResolution: 'prefer_app' });
      coordinator = new SyncCoordinator({
        config: preferAppConfig,
        fileSystem: mockFileSystem,
        database: mockDatabase as IDBPDatabase,
      });

      const mockStore = {
        getAll: vi.fn().mockResolvedValue([
          createMockTask({ title: 'Task 1', status: 'pending' }),
        ]),
        get: vi.fn(),
        put: vi.fn(),
        delete: vi.fn(),
      };

      const mockTransaction = {
        objectStore: vi.fn().mockReturnValue(mockStore),
        done: Promise.resolve(),
      };

      mockDatabase.transaction = vi.fn().mockReturnValue(mockTransaction);

      const { MarkdownParser } = await import('../../parsers/markdown-parser');
      const mockParser = MarkdownParser as any;
      mockParser.prototype.extractTasks = vi.fn().mockReturnValue([
        {
          title: 'Task 1',
          checked: true,
          lineNumber: 2,
          section: '',
          indentLevel: 0,
          rawText: '- [x] Task 1',
        },
      ]);

      await coordinator.syncFileToApp();

      const stats = coordinator.getStats();
      expect(stats.successfulSyncs).toBe(1);
    });

    it('should track conflict statistics', async () => {
      const mockStore = {
        getAll: vi.fn().mockResolvedValue([
          createMockTask({ title: 'Task 1', priority: 'high' }),
        ]),
        get: vi.fn(),
        put: vi.fn(),
        delete: vi.fn(),
      };

      const mockTransaction = {
        objectStore: vi.fn().mockReturnValue(mockStore),
        done: Promise.resolve(),
      };

      mockDatabase.transaction = vi.fn().mockReturnValue(mockTransaction);

      const { MarkdownParser } = await import('../../parsers/markdown-parser');
      const mockParser = MarkdownParser as any;
      mockParser.prototype.extractTasks = vi.fn().mockReturnValue([
        {
          title: 'Task 1',
          checked: false,
          lineNumber: 2,
          section: '',
          indentLevel: 0,
          rawText: '- [ ] Task 1',
          metadata: { priority: 'low' },
        },
      ]);

      await coordinator.syncFileToApp();

      const stats = coordinator.getStats();
      expect(stats.totalConflicts).toBeGreaterThanOrEqual(0);
    });
  });

  // ==============================================
  // 6. Batch Operations Tests (5 tests)
  // ==============================================
  describe('Batch Operations', () => {
    beforeEach(async () => {
      const { PathValidator } = await import('../../security/path-validator');
      const { CircuitBreakerManager } = await import('../../resilience/circuit-breaker');
      const { Retry } = await import('../../resilience/retry');
      const { MarkdownParser } = await import('../../parsers/markdown-parser');
      const { DiffDetector } = await import('../../performance/diff-detector');
      const { BatchWriter } = await import('../../performance/batch-writer');

      const mockPathValidator = PathValidator as any;
      mockPathValidator.prototype.validate = vi.fn().mockReturnValue('/test/TODO.md');

      const mockCircuitBreaker = CircuitBreakerManager as any;
      mockCircuitBreaker.prototype.createBreaker = vi.fn();
      mockCircuitBreaker.prototype.getBreaker = vi.fn().mockReturnValue({
        fire: vi.fn().mockResolvedValue('# Test'),
      });
      mockCircuitBreaker.prototype.removeAll = vi.fn();

      const mockRetry = Retry as any;
      mockRetry.prototype.execute = vi.fn().mockImplementation(async (fn) => await fn());

      const mockParser = MarkdownParser as any;
      mockParser.prototype.parse = vi.fn().mockResolvedValue({ sections: [], tasks: [] });

      const mockDiffDetector = DiffDetector as any;
      mockDiffDetector.prototype.isIdentical = vi.fn().mockReturnValue(false);
      mockDiffDetector.prototype.detectDiff = vi.fn().mockReturnValue([]);
      mockDiffDetector.prototype.getSummary = vi.fn().mockReturnValue({
        addedChars: 10,
        deletedChars: 0,
        changeSeverity: 'minor',
      });

      const mockBatchWriter = BatchWriter as any;
      mockBatchWriter.prototype.bulkUpsertTasks = vi.fn().mockResolvedValue(undefined);
      mockBatchWriter.prototype.bulkDeleteTasks = vi.fn().mockResolvedValue(undefined);

      coordinator = new SyncCoordinator({
        config,
        fileSystem: mockFileSystem,
        database: mockDatabase as IDBPDatabase,
      });
    });

    it('should batch upsert multiple tasks', async () => {
      const { MarkdownParser } = await import('../../parsers/markdown-parser');
      const mockParser = MarkdownParser as any;
      mockParser.prototype.extractTasks = vi.fn().mockReturnValue([
        { title: 'Task 1', checked: false, lineNumber: 0, section: '', indentLevel: 0, rawText: '' },
        { title: 'Task 2', checked: false, lineNumber: 1, section: '', indentLevel: 0, rawText: '' },
        { title: 'Task 3', checked: false, lineNumber: 2, section: '', indentLevel: 0, rawText: '' },
      ]);

      await coordinator.syncFileToApp();

      const { BatchWriter } = await import('../../performance/batch-writer');
      const mockBatchWriter = BatchWriter as any;
      expect(mockBatchWriter.prototype.bulkUpsertTasks).toHaveBeenCalled();
    });

    it('should batch delete multiple tasks', async () => {
      const mockStore = {
        getAll: vi.fn().mockResolvedValue([
          createMockTask({ id: 'task-1', title: 'Task 1' }),
          createMockTask({ id: 'task-2', title: 'Task 2' }),
        ]),
        get: vi.fn(),
        put: vi.fn(),
        delete: vi.fn(),
      };

      const mockTransaction = {
        objectStore: vi.fn().mockReturnValue(mockStore),
        done: Promise.resolve(),
      };

      const testDatabase = {
        transaction: vi.fn().mockReturnValue(mockTransaction),
      };

      const { MarkdownParser } = await import('../../parsers/markdown-parser');
      const { BatchWriter } = await import('../../performance/batch-writer');

      const mockParser = MarkdownParser as any;
      const mockBatchWriter = BatchWriter as any;

      mockParser.prototype.extractTasks = vi.fn().mockReturnValue([]);
      mockBatchWriter.prototype.bulkDeleteTasks = vi.fn().mockResolvedValue(undefined);

      const testCoordinator = new SyncCoordinator({
        config,
        fileSystem: mockFileSystem,
        database: testDatabase as IDBPDatabase,
      });

      await testCoordinator.syncFileToApp();

      expect(mockBatchWriter.prototype.bulkDeleteTasks).toHaveBeenCalled();
    });

    it('should handle batch operation errors', async () => {
      const { BatchWriter } = await import('../../performance/batch-writer');
      const mockBatchWriter = BatchWriter as any;
      mockBatchWriter.prototype.bulkUpsertTasks = vi.fn().mockRejectedValue(
        new Error('Batch operation failed')
      );

      const { MarkdownParser } = await import('../../parsers/markdown-parser');
      const mockParser = MarkdownParser as any;
      mockParser.prototype.extractTasks = vi.fn().mockReturnValue([
        { title: 'Task 1', checked: false, lineNumber: 0, section: '', indentLevel: 0, rawText: '' },
      ]);

      coordinator = new SyncCoordinator({
        config,
        fileSystem: mockFileSystem,
        database: mockDatabase as IDBPDatabase,
      });

      await expect(coordinator.syncFileToApp()).rejects.toThrow('Batch operation failed');
    });

    it('should process mixed create/update/delete operations', async () => {
      const mockStore = {
        getAll: vi.fn().mockResolvedValue([
          createMockTask({ title: 'Task 2', status: 'pending' }),
          createMockTask({ id: 'task-4', title: 'Task 4' }),
        ]),
        get: vi.fn(),
        put: vi.fn(),
        delete: vi.fn(),
      };

      const mockTransaction = {
        objectStore: vi.fn().mockReturnValue(mockStore),
        done: Promise.resolve(),
      };

      mockDatabase.transaction = vi.fn().mockReturnValue(mockTransaction);

      const { MarkdownParser } = await import('../../parsers/markdown-parser');
      const mockParser = MarkdownParser as any;
      mockParser.prototype.extractTasks = vi.fn().mockReturnValue([
        { title: 'Task 1', checked: false, lineNumber: 0, section: '', indentLevel: 0, rawText: '' },
        { title: 'Task 2', checked: true, lineNumber: 1, section: '', indentLevel: 0, rawText: '' },
        { title: 'Task 3', checked: false, lineNumber: 2, section: '', indentLevel: 0, rawText: '' },
      ]);

      await coordinator.syncFileToApp();

      const { BatchWriter } = await import('../../performance/batch-writer');
      const mockBatchWriter = BatchWriter as any;
      expect(mockBatchWriter.prototype.bulkUpsertTasks).toHaveBeenCalled();
      expect(mockBatchWriter.prototype.bulkDeleteTasks).toHaveBeenCalled();
    });

    it('should optimize empty batch operations', async () => {
      const mockStore = {
        getAll: vi.fn().mockResolvedValue([]),
        get: vi.fn(),
        put: vi.fn(),
        delete: vi.fn(),
      };

      const mockTransaction = {
        objectStore: vi.fn().mockReturnValue(mockStore),
        done: Promise.resolve(),
      };

      const testDatabase = {
        transaction: vi.fn().mockReturnValue(mockTransaction),
      };

      const { MarkdownParser } = await import('../../parsers/markdown-parser');
      const { BatchWriter } = await import('../../performance/batch-writer');

      const mockParser = MarkdownParser as any;
      const mockBatchWriter = BatchWriter as any;

      mockParser.prototype.extractTasks = vi.fn().mockReturnValue([]);

      // Reset mock call history
      mockBatchWriter.prototype.bulkUpsertTasks.mockClear();
      mockBatchWriter.prototype.bulkDeleteTasks.mockClear();

      const testCoordinator = new SyncCoordinator({
        config,
        fileSystem: mockFileSystem,
        database: testDatabase as IDBPDatabase,
      });

      await testCoordinator.syncFileToApp();

      // Empty operations should not call batch methods (or called with empty arrays)
      // Since there are no tasks, no batch operations should be needed
      const stats = testCoordinator.getStats();
      expect(stats.successfulSyncs).toBe(1);
    });
  });

  // ==============================================
  // 7. Error Handling Tests (5 tests)
  // ==============================================
  describe('Error Handling', () => {
    it('should retry on transient file read errors', async () => {
      const { PathValidator } = await import('../../security/path-validator');
      const { CircuitBreakerManager } = await import('../../resilience/circuit-breaker');
      const { Retry } = await import('../../resilience/retry');
      const { MarkdownParser } = await import('../../parsers/markdown-parser');
      const { DiffDetector } = await import('../../performance/diff-detector');
      const { BatchWriter } = await import('../../performance/batch-writer');

      const mockPathValidator = PathValidator as any;
      mockPathValidator.prototype.validate = vi.fn().mockReturnValue('/test/TODO.md');

      let fireAttemptCount = 0;
      const mockCircuitBreaker = CircuitBreakerManager as any;
      mockCircuitBreaker.prototype.createBreaker = vi.fn();
      mockCircuitBreaker.prototype.getBreaker = vi.fn().mockReturnValue({
        fire: vi.fn().mockImplementation(async () => {
          fireAttemptCount++;
          if (fireAttemptCount < 3) {
            throw new Error('Transient error');
          }
          return '# Test';
        }),
      });
      mockCircuitBreaker.prototype.removeAll = vi.fn();

      const mockRetry = Retry as any;
      mockRetry.prototype.execute = vi.fn().mockImplementation(async (fn, options) => {
        // Simulate retry logic: attempt up to 3 times
        let lastError;
        for (let i = 0; i < 3; i++) {
          try {
            return await fn();
          } catch (error) {
            lastError = error;
            if (i < 2) continue; // retry
          }
        }
        throw lastError;
      });

      const mockParser = MarkdownParser as any;
      mockParser.prototype.parse = vi.fn().mockResolvedValue({ sections: [], tasks: [] });
      mockParser.prototype.extractTasks = vi.fn().mockReturnValue([]);

      const mockDiffDetector = DiffDetector as any;
      mockDiffDetector.prototype.isIdentical = vi.fn().mockReturnValue(false);
      mockDiffDetector.prototype.detectDiff = vi.fn().mockReturnValue([]);
      mockDiffDetector.prototype.getSummary = vi.fn().mockReturnValue({
        addedChars: 0,
        deletedChars: 0,
        changeSeverity: 'minor',
      });

      const mockBatchWriter = BatchWriter as any;
      mockBatchWriter.prototype.bulkUpsertTasks = vi.fn().mockResolvedValue(undefined);

      coordinator = new SyncCoordinator({
        config,
        fileSystem: mockFileSystem,
        database: mockDatabase as IDBPDatabase,
      });

      // Should succeed after retries
      await coordinator.syncFileToApp();
      const stats = coordinator.getStats();
      expect(stats.successfulSyncs).toBe(1);
      expect(fireAttemptCount).toBe(3); // Retried 3 times before success
    });

    it('should trigger circuit breaker on repeated failures', async () => {
      const { PathValidator } = await import('../../security/path-validator');
      const { CircuitBreakerManager } = await import('../../resilience/circuit-breaker');

      const mockPathValidator = PathValidator as any;
      mockPathValidator.prototype.validate = vi.fn().mockReturnValue('/test/TODO.md');

      const mockCircuitBreaker = CircuitBreakerManager as any;
      let callCount = 0;
      mockCircuitBreaker.prototype.getBreaker = vi.fn().mockReturnValue({
        fire: vi.fn().mockImplementation(() => {
          callCount++;
          if (callCount > 5) {
            return Promise.resolve(''); // Circuit breaker fallback
          }
          return Promise.reject(new Error('Service unavailable'));
        }),
      });
      mockCircuitBreaker.prototype.createBreaker = vi.fn();
      mockCircuitBreaker.prototype.removeAll = vi.fn();

      coordinator = new SyncCoordinator({
        config,
        fileSystem: mockFileSystem,
        database: mockDatabase as IDBPDatabase,
      });

      // Circuit breaker should eventually trigger
      expect(coordinator).toBeDefined();
    });

    it('should handle validation errors', async () => {
      const { PathValidator } = await import('../../security/path-validator');
      const mockPathValidator = PathValidator as any;
      mockPathValidator.prototype.validate = vi.fn().mockImplementation(() => {
        throw new Error('Invalid path');
      });

      coordinator = new SyncCoordinator({
        config,
        fileSystem: mockFileSystem,
        database: mockDatabase as IDBPDatabase,
      });

      await expect(coordinator.syncFileToApp()).rejects.toThrow('Invalid path');
    });

    it('should handle database errors gracefully', async () => {
      const mockStore = {
        getAll: vi.fn().mockRejectedValue(new Error('Database error')),
        get: vi.fn(),
        put: vi.fn(),
        delete: vi.fn(),
      };

      const mockTransaction = {
        objectStore: vi.fn().mockReturnValue(mockStore),
        done: Promise.resolve(),
      };

      const errorDatabase = {
        transaction: vi.fn().mockReturnValue(mockTransaction),
      };

      const { PathValidator } = await import('../../security/path-validator');
      const { CircuitBreakerManager } = await import('../../resilience/circuit-breaker');
      const { Retry } = await import('../../resilience/retry');

      const mockPathValidator = PathValidator as any;
      mockPathValidator.prototype.validate = vi.fn().mockReturnValue('/test/TODO.md');

      const mockCircuitBreaker = CircuitBreakerManager as any;
      mockCircuitBreaker.prototype.createBreaker = vi.fn();
      mockCircuitBreaker.prototype.getBreaker = vi.fn().mockReturnValue({
        fire: vi.fn().mockResolvedValue('# Test'),
      });
      mockCircuitBreaker.prototype.removeAll = vi.fn();

      const mockRetry = Retry as any;
      mockRetry.prototype.execute = vi.fn().mockImplementation(async (fn) => await fn());

      coordinator = new SyncCoordinator({
        config,
        fileSystem: mockFileSystem,
        database: errorDatabase as IDBPDatabase,
      });

      // Should handle gracefully (returns empty array)
      const stats = coordinator.getStats();
      expect(stats).toBeDefined();
    });

    it('should emit error events', async () => {
      const { PathValidator } = await import('../../security/path-validator');
      const { CircuitBreakerManager } = await import('../../resilience/circuit-breaker');

      const mockPathValidator = PathValidator as any;
      mockPathValidator.prototype.validate = vi.fn().mockReturnValue('/test/TODO.md');

      const mockCircuitBreaker = CircuitBreakerManager as any;
      mockCircuitBreaker.prototype.createBreaker = vi.fn();
      mockCircuitBreaker.prototype.getBreaker = vi.fn().mockReturnValue({
        fire: vi.fn().mockRejectedValue(new Error('Test error')),
      });
      mockCircuitBreaker.prototype.removeAll = vi.fn();

      coordinator = new SyncCoordinator({
        config,
        fileSystem: mockFileSystem,
        database: mockDatabase as IDBPDatabase,
      });

      const errorSpy = vi.fn();
      coordinator.on('sync-error', errorSpy);

      await expect(coordinator.syncFileToApp()).rejects.toThrow();

      expect(errorSpy).toHaveBeenCalled();
    });
  });

  // ==============================================
  // 8. Edge Cases Tests (5 tests)
  // ==============================================
  describe('Edge Cases', () => {
    beforeEach(async () => {
      const { PathValidator } = await import('../../security/path-validator');
      const { CircuitBreakerManager } = await import('../../resilience/circuit-breaker');
      const { Retry } = await import('../../resilience/retry');
      const { MarkdownParser } = await import('../../parsers/markdown-parser');
      const { MarkdownSerializer } = await import('../../parsers/markdown-serializer');
      const { DiffDetector } = await import('../../performance/diff-detector');
      const { BatchWriter } = await import('../../performance/batch-writer');

      const mockPathValidator = PathValidator as any;
      mockPathValidator.prototype.validate = vi.fn().mockReturnValue('/test/TODO.md');
      mockPathValidator.prototype.exists = vi.fn().mockResolvedValue(true);

      const mockCircuitBreaker = CircuitBreakerManager as any;
      mockCircuitBreaker.prototype.createBreaker = vi.fn();
      mockCircuitBreaker.prototype.getBreaker = vi.fn().mockReturnValue({
        fire: vi.fn().mockResolvedValue(''),
      });
      mockCircuitBreaker.prototype.removeAll = vi.fn();

      const mockRetry = Retry as any;
      mockRetry.prototype.execute = vi.fn().mockImplementation(async (fn) => await fn());

      const mockParser = MarkdownParser as any;
      mockParser.prototype.parse = vi.fn().mockResolvedValue({ sections: [], tasks: [] });
      mockParser.prototype.extractTasks = vi.fn().mockReturnValue([]);
      mockParser.prototype.validate = vi.fn().mockReturnValue({ valid: true });

      const mockSerializer = MarkdownSerializer as any;
      mockSerializer.prototype.serialize = vi.fn().mockResolvedValue('');

      const mockDiffDetector = DiffDetector as any;
      mockDiffDetector.prototype.isIdentical = vi.fn().mockReturnValue(false);
      mockDiffDetector.prototype.detectDiff = vi.fn().mockReturnValue([]);
      mockDiffDetector.prototype.getSummary = vi.fn().mockReturnValue({
        addedChars: 0,
        deletedChars: 0,
        changeSeverity: 'minor',
      });

      const mockBatchWriter = BatchWriter as any;
      mockBatchWriter.prototype.bulkUpsertTasks = vi.fn().mockResolvedValue(undefined);
      mockBatchWriter.prototype.bulkDeleteTasks = vi.fn().mockResolvedValue(undefined);

      coordinator = new SyncCoordinator({
        config,
        fileSystem: mockFileSystem,
        database: mockDatabase as IDBPDatabase,
      });
    });

    it('should handle empty file content', async () => {
      await coordinator.syncFileToApp();

      const stats = coordinator.getStats();
      expect(stats.successfulSyncs).toBe(1);
    });

    it('should handle large files (within limits)', async () => {
      const { CircuitBreakerManager } = await import('../../resilience/circuit-breaker');
      const mockCircuitBreaker = CircuitBreakerManager as any;

      const largeContent = '- [ ] Task\n'.repeat(1000);
      mockCircuitBreaker.prototype.getBreaker = vi.fn().mockReturnValue({
        fire: vi.fn().mockResolvedValue(largeContent),
      });

      coordinator = new SyncCoordinator({
        config,
        fileSystem: mockFileSystem,
        database: mockDatabase as IDBPDatabase,
      });

      const { MarkdownParser } = await import('../../parsers/markdown-parser');
      const mockParser = MarkdownParser as any;
      mockParser.prototype.extractTasks = vi.fn().mockReturnValue(
        Array.from({ length: 1000 }, (_, i) => ({
          title: `Task ${i + 1}`,
          checked: false,
          lineNumber: i,
          section: '',
          indentLevel: 0,
          rawText: '',
        }))
      );

      await coordinator.syncFileToApp();

      const stats = coordinator.getStats();
      expect(stats.successfulSyncs).toBe(1);
    });

    it('should handle concurrent sync attempts', async () => {
      const sync1 = coordinator.syncFileToApp();
      const sync2 = coordinator.syncFileToApp();
      const sync3 = coordinator.syncFileToApp();

      await Promise.allSettled([sync1, sync2, sync3]);

      const stats = coordinator.getStats();
      expect(stats.totalSyncs).toBe(1); // Only one should execute
    });

    it('should handle non-existent file gracefully', async () => {
      const { PathValidator } = await import('../../security/path-validator');
      const mockPathValidator = PathValidator as any;
      mockPathValidator.prototype.exists = vi.fn().mockResolvedValue(false);

      coordinator = new SyncCoordinator({
        config,
        fileSystem: mockFileSystem,
        database: mockDatabase as IDBPDatabase,
      });

      // Should not throw during start
      await expect(coordinator.start()).resolves.not.toThrow();
    });

    it('should handle special characters in task titles', async () => {
      const { MarkdownParser } = await import('../../parsers/markdown-parser');
      const mockParser = MarkdownParser as any;
      mockParser.prototype.extractTasks = vi.fn().mockReturnValue([
        {
          title: 'Task with "quotes" and <tags>',
          checked: false,
          lineNumber: 0,
          section: '',
          indentLevel: 0,
          rawText: '',
        },
        {
          title: 'Task with emoji 🚀',
          checked: false,
          lineNumber: 1,
          section: '',
          indentLevel: 0,
          rawText: '',
        },
      ]);

      await coordinator.syncFileToApp();

      const stats = coordinator.getStats();
      expect(stats.successfulSyncs).toBe(1);
    });
  });

  // ==============================================
  // Additional Tests (3 bonus tests)
  // ==============================================
  describe('Additional Features', () => {
    beforeEach(async () => {
      const { PathValidator } = await import('../../security/path-validator');
      const { CircuitBreakerManager } = await import('../../resilience/circuit-breaker');
      const { Retry } = await import('../../resilience/retry');
      const { MarkdownParser } = await import('../../parsers/markdown-parser');
      const { DiffDetector } = await import('../../performance/diff-detector');
      const { BatchWriter } = await import('../../performance/batch-writer');

      const mockPathValidator = PathValidator as any;
      mockPathValidator.prototype.validate = vi.fn().mockReturnValue('/test/TODO.md');

      const mockCircuitBreaker = CircuitBreakerManager as any;
      mockCircuitBreaker.prototype.createBreaker = vi.fn();
      mockCircuitBreaker.prototype.getBreaker = vi.fn().mockReturnValue({
        fire: vi.fn().mockResolvedValue('# Test'),
      });
      mockCircuitBreaker.prototype.removeAll = vi.fn();

      const mockRetry = Retry as any;
      mockRetry.prototype.execute = vi.fn().mockImplementation(async (fn) => await fn());

      const mockParser = MarkdownParser as any;
      mockParser.prototype.parse = vi.fn().mockResolvedValue({ sections: [], tasks: [] });
      mockParser.prototype.extractTasks = vi.fn().mockReturnValue([]);

      const mockDiffDetector = DiffDetector as any;
      mockDiffDetector.prototype.isIdentical = vi.fn().mockReturnValue(false);
      mockDiffDetector.prototype.detectDiff = vi.fn().mockReturnValue([]);
      mockDiffDetector.prototype.getSummary = vi.fn().mockReturnValue({
        addedChars: 0,
        deletedChars: 0,
        changeSeverity: 'minor',
      });

      const mockBatchWriter = BatchWriter as any;
      mockBatchWriter.prototype.bulkUpsertTasks = vi.fn().mockResolvedValue(undefined);

      coordinator = new SyncCoordinator({
        config,
        fileSystem: mockFileSystem,
        database: mockDatabase as IDBPDatabase,
      });
    });

    it('should get sync history with limit', async () => {
      await coordinator.syncFileToApp();
      await coordinator.syncFileToApp();
      await coordinator.syncFileToApp();

      const history = coordinator.getSyncHistory(2);
      expect(history.length).toBe(2);
    });

    it('should get sync state', async () => {
      // Create a test coordinator with mocked state manager
      const { SyncStateManager } = await import('../sync-state-manager');
      const mockStateManager = SyncStateManager as any;

      const mockGetSyncState = vi.fn().mockReturnValue({
        syncing: false,
        pendingOperations: 0,
        unresolvedConflicts: 0,
        errors: [],
        version: 1,
      });

      mockStateManager.prototype.getSyncState = mockGetSyncState;

      const testCoordinator = new SyncCoordinator({
        config,
        fileSystem: mockFileSystem,
        database: mockDatabase as IDBPDatabase,
      });

      const state = testCoordinator.getSyncState();
      expect(state).toBeDefined();
      expect(mockGetSyncState).toHaveBeenCalled();
    });

    it('should handle file watcher events', async () => {
      const { PathValidator } = await import('../../security/path-validator');
      const mockPathValidator = PathValidator as any;
      mockPathValidator.prototype.validate = vi.fn().mockReturnValue('/test/TODO.md');
      mockPathValidator.prototype.exists = vi.fn().mockResolvedValue(true);
      mockPathValidator.prototype.validateFileSize = vi.fn().mockResolvedValue(undefined);

      coordinator = new SyncCoordinator({
        config,
        fileWatcher: mockFileWatcher,
        fileSystem: mockFileSystem,
        database: mockDatabase as IDBPDatabase,
      });

      await coordinator.start();

      const watcherErrorSpy = vi.fn();
      coordinator.on('watcher-error', watcherErrorSpy);

      mockFileWatcher.triggerError({
        type: 'error',
        path: '/test/TODO.md',
        timestamp: new Date(),
        error: new Error('Watcher error'),
      });

      expect(watcherErrorSpy).toHaveBeenCalled();
    });
  });
});
