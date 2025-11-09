import { promises as fs } from 'fs';
import path from 'path';
import { EventEmitter } from 'events';
import type { IDBPDatabase } from 'idb';
import type {
  Task,
  SyncConfig,
  SyncStatistics,
  SyncHistory,
  Conflict,
  FileWatcherEvent,
  BackupInfo,
} from '../types';
import { MarkdownParser } from '../parsers/markdown-parser';
import { MarkdownSerializer } from '../parsers/markdown-serializer';
import { PathValidator } from '../security/path-validator';
import { DiffDetector } from '../performance/diff-detector';
import { BatchWriter } from '../performance/batch-writer';
import { Retry } from '../resilience/retry';
import { CircuitBreakerManager } from '../resilience/circuit-breaker';
import { Logger } from '../utils/logger';
import type { FileSystem } from '../interfaces/file-system.interface';
import { ThreeWayMerger } from '../merge/three-way-merger';
import { ConflictResolver } from '../merge/conflict-resolver';
import { SyncStateManager } from './sync-state-manager';

const logger = Logger.getInstance();

/**
 * FileWatcher型定義（インターフェース）
 * 実装は後のフェーズで提供される想定
 */
interface FileWatcher extends EventEmitter {
  start(): Promise<void>;
  stop(): Promise<void>;
  isWatching(): boolean;
}

/**
 * SyncCoordinatorのオプション
 */
export interface SyncCoordinatorOptions {
  /** 同期設定 */
  config: SyncConfig;

  /** FileWatcherインスタンス（オプショナル） */
  fileWatcher?: FileWatcher;

  /** FileSystemインスタンス（DI用） */
  fileSystem?: FileSystem;

  /** IndexedDBインスタンス（DI用） */
  database?: IDBPDatabase;
}

/**
 * SyncCoordinator - TODO.md ↔ App 同期オーケストレーター
 *
 * TODO.mdファイルとアプリケーション（IndexedDB）間の双方向同期を管理します。
 * 既存コンポーネントをDI経由で統合し、以下の機能を提供：
 *
 * - ファイル→アプリ同期（TODO.mdをパース→IndexedDB更新）
 * - アプリ→ファイル同期（IndexedDBを読み取り→TODO.md書き込み）
 * - 差分同期（変更されたタスクのみ処理）
 * - 競合検出（基本的な競合検出、3-way mergeはPhase 4）
 * - バックアップ（書き込み前の自動バックアップ）
 * - 統計追跡（同期回数、成功率、エラー等）
 *
 * @example
 * ```typescript
 * const coordinator = new SyncCoordinator({
 *   config: {
 *     todoPath: '/path/to/TODO.md',
 *     direction: 'bidirectional',
 *     strategy: 'last_write_wins',
 *     conflictResolution: 'prefer_file',
 *     debounceMs: 1000,
 *     throttleMs: 5000,
 *     maxFileSizeMB: 5,
 *     maxTasks: 10000,
 *     webhooksEnabled: false,
 *     autoBackup: true,
 *   },
 *   database: db,
 * });
 *
 * await coordinator.start();
 * await coordinator.syncFileToApp();
 * const stats = coordinator.getStats();
 * await coordinator.stop();
 * ```
 */
export class SyncCoordinator extends EventEmitter {
  private config: SyncConfig;
  private fileWatcher?: FileWatcher;
  private fileSystem?: FileSystem;
  private database?: IDBPDatabase;

  // Components (DI)
  private parser: MarkdownParser;
  private serializer: MarkdownSerializer;
  private pathValidator: PathValidator;
  private diffDetector: DiffDetector;
  private batchWriter: BatchWriter;
  private retry: Retry;
  private circuitBreaker: CircuitBreakerManager;
  private threeWayMerger: ThreeWayMerger;
  private conflictResolver: ConflictResolver;
  private stateManager: SyncStateManager;

  // State
  private isRunning: boolean = false;
  private isSyncing: boolean = false;
  private lastFileContent: string = '';
  private lastFileHash: string = '';
  private syncHistory: SyncHistory[] = [];
  private conflicts: Conflict[] = [];

  // Statistics
  private statistics: SyncStatistics = {
    totalSyncs: 0,
    successfulSyncs: 0,
    failedSyncs: 0,
    averageDurationMs: 0,
    totalTasksChanged: 0,
    totalConflicts: 0,
    autoResolvedConflicts: 0,
    manualResolvedConflicts: 0,
  };

  constructor(options: SyncCoordinatorOptions) {
    super();

    this.config = options.config;
    this.fileWatcher = options.fileWatcher;
    this.fileSystem = options.fileSystem;
    this.database = options.database;

    // Initialize components
    this.parser = new MarkdownParser();
    this.serializer = new MarkdownSerializer();
    this.pathValidator = new PathValidator(path.dirname(this.config.todoPath));
    this.diffDetector = new DiffDetector();
    this.batchWriter = new BatchWriter(this.database);
    this.retry = new Retry();
    this.circuitBreaker = new CircuitBreakerManager();
    this.threeWayMerger = new ThreeWayMerger();
    this.conflictResolver = new ConflictResolver({
      policy: this.config.conflictResolution,
      attemptAutoMerge: this.config.strategy === 'three_way_merge',
      preferLatestTimestamp: this.config.strategy === 'last_write_wins',
    });
    this.stateManager = new SyncStateManager(this.database);

    // Setup circuit breakers for file operations
    this.setupCircuitBreakers();

    logger.info(
      {
        todoPath: this.config.todoPath,
        direction: this.config.direction,
        strategy: this.config.strategy,
      },
      'SyncCoordinator initialized'
    );
  }

  /**
   * Circuit Breakerを設定します
   */
  private setupCircuitBreakers(): void {
    // File read operations
    this.circuitBreaker.createBreaker(
      'file-read',
      async (filePath: string) => {
        if (this.fileSystem) {
          return await this.fileSystem.readFile(filePath);
        }
        return await fs.readFile(filePath, 'utf-8');
      },
      {
        timeoutMs: 5000,
        errorThresholdPercentage: 50,
        resetTimeoutMs: 30000,
        fallback: error => {
          logger.error({ err: error }, 'File read circuit breaker triggered');
          return '';
        },
      }
    );

    // File write operations
    this.circuitBreaker.createBreaker(
      'file-write',
      async (filePath: string, content: string) => {
        if (this.fileSystem) {
          return await this.fileSystem.writeFile(filePath, content);
        }
        return await fs.writeFile(filePath, content, 'utf-8');
      },
      {
        timeoutMs: 10000,
        errorThresholdPercentage: 50,
        resetTimeoutMs: 30000,
      }
    );
  }

  /**
   * SyncCoordinatorを起動します
   */
  async start(): Promise<void> {
    if (this.isRunning) {
      logger.warn('SyncCoordinator is already running');
      return;
    }

    const timer = logger.startTimer('sync-coordinator-start');

    try {
      // Validate TODO.md path
      const validatedPath = this.pathValidator.validate(this.config.todoPath);
      logger.debug({ validatedPath }, 'TODO.md path validated');

      // Check file accessibility
      const exists = await this.pathValidator.exists(validatedPath);
      if (!exists) {
        logger.warn(
          { todoPath: validatedPath },
          'TODO.md does not exist, will be created on first sync'
        );
      } else {
        // Validate file size
        await this.pathValidator.validateFileSize(
          validatedPath,
          this.config.maxFileSizeMB
        );
      }

      // Start file watcher if provided
      if (this.fileWatcher) {
        this.setupFileWatcherListeners();
        await this.fileWatcher.start();
        logger.info('FileWatcher started');
      }

      this.isRunning = true;

      timer.done({ operation: 'sync-coordinator-start' });
      logger.info('SyncCoordinator started successfully');

      this.emit('started');
    } catch (error) {
      logger.error({ err: error }, 'Failed to start SyncCoordinator');
      throw error;
    }
  }

  /**
   * SyncCoordinatorを停止します
   */
  async stop(): Promise<void> {
    if (!this.isRunning) {
      logger.warn('SyncCoordinator is not running');
      return;
    }

    const timer = logger.startTimer('sync-coordinator-stop');

    try {
      // Stop file watcher
      if (this.fileWatcher && this.fileWatcher.isWatching()) {
        await this.fileWatcher.stop();
        logger.info('FileWatcher stopped');
      }

      // Remove all circuit breakers
      this.circuitBreaker.removeAll();

      this.isRunning = false;

      timer.done({ operation: 'sync-coordinator-stop' });
      logger.info('SyncCoordinator stopped successfully');

      this.emit('stopped');
    } catch (error) {
      logger.error({ err: error }, 'Failed to stop SyncCoordinator');
      throw error;
    }
  }

  /**
   * FileWatcherのイベントリスナーを設定します
   */
  private setupFileWatcherListeners(): void {
    if (!this.fileWatcher) return;

    this.fileWatcher.on('change', async (event: FileWatcherEvent) => {
      logger.debug({ event }, 'File change detected');

      // Debounce handling
      if (this.isSyncing) {
        logger.debug('Sync already in progress, skipping');
        return;
      }

      try {
        await this.syncFileToApp();
      } catch (error) {
        logger.error({ err: error }, 'Auto-sync failed after file change');
        this.emit('sync-error', error);
      }
    });

    this.fileWatcher.on('error', (event: FileWatcherEvent) => {
      logger.error({ event }, 'FileWatcher error');
      this.emit('watcher-error', event.error);
    });
  }

  /**
   * ファイル→アプリ同期を実行します
   *
   * TODO.mdをパースしてIndexedDBを更新します
   */
  async syncFileToApp(): Promise<void> {
    if (this.isSyncing) {
      logger.warn('Sync already in progress');
      return;
    }

    this.isSyncing = true;
    this.stateManager.markSyncStart();
    const syncId = this.generateSyncId();
    const startTime = new Date();
    const timer = logger.startTimer('sync-file-to-app');

    logger.logSyncEvent('start', {
      syncDirection: 'file_to_app',
      operation: 'syncFileToApp',
    });

    const history: SyncHistory = {
      id: syncId,
      startedAt: startTime,
      direction: 'file_to_app',
      tasksChanged: 0,
      tasksCreated: 0,
      tasksUpdated: 0,
      tasksDeleted: 0,
      conflictsDetected: 0,
      conflictsResolved: 0,
      success: false,
    };

    try {
      // Read file with circuit breaker protection
      const fileBreaker = this.circuitBreaker.getBreaker('file-read');
      if (!fileBreaker) {
        throw new Error('File read circuit breaker not initialized');
      }

      const validatedPath = this.pathValidator.validate(this.config.todoPath);
      const fileContent = await this.retry.execute(
        async () => await fileBreaker.fire(validatedPath) as string,
        {
          maxAttempts: 3,
          initialDelayMs: 1000,
          backoffStrategy: 'exponential',
        }
      );

      // Check if file content changed (differential sync)
      const hasChanges = !this.diffDetector.isIdentical(
        this.lastFileContent,
        fileContent
      );
      if (!hasChanges && this.lastFileContent !== '') {
        logger.debug('No changes detected in TODO.md, skipping sync');
        this.isSyncing = false;
        return;
      }

      // Detect diff for incremental sync
      const diffs = this.diffDetector.detectDiff(
        this.lastFileContent,
        fileContent
      );
      const summary = this.diffDetector.getSummary(diffs);

      logger.info(
        {
          addedChars: summary.addedChars,
          deletedChars: summary.deletedChars,
          changeSeverity: summary.changeSeverity,
        },
        'File changes detected'
      );

      // Parse TODO.md
      const parseResult = await this.parser.parse(fileContent);
      const tasks = this.parser.extractTasks(parseResult);

      logger.debug({ taskCount: tasks.length }, 'Tasks extracted from TODO.md');

      // Get current tasks from database
      const currentTasks = await this.getAllTasksFromDB();

      // Convert ParsedTask to Task objects
      const newTasks: Task[] = tasks.map(parsedTask =>
        this.parsedTaskToTask(parsedTask)
      );

      // Detect conflicts and merge using 3-way merge if strategy is enabled
      const detectedConflicts: Conflict[] = [];
      const mergedTasks: Task[] = [];

      if (this.config.strategy === 'three_way_merge') {
        // Use 3-way merge
        const baseVersions = await this.stateManager.getAllBaseVersions();

        for (const newTask of newTasks) {
          const currentTask = currentTasks.find(t => t.title === newTask.title);

          if (currentTask) {
            const baseVersion = baseVersions.get(currentTask.id);

            if (baseVersion) {
              // Perform 3-way merge
              const mergeResult = this.threeWayMerger.merge(
                baseVersion.task,
                newTask,
                currentTask
              );

              if (!mergeResult.hasConflicts && mergeResult.mergedTask) {
                mergedTasks.push(mergeResult.mergedTask);
              } else if (mergeResult.conflicts.length > 0) {
                // Create conflict object
                const conflict: Conflict = {
                  id: this.generateSyncId(),
                  taskId: currentTask.id,
                  fileVersion: newTask,
                  appVersion: currentTask,
                  baseVersion: baseVersion.task,
                  detectedAt: new Date(),
                  conflictType: 'content',
                  resolved: false,
                };
                detectedConflicts.push(conflict);

                // Try to resolve using conflict resolver
                const resolutionResult = this.conflictResolver.resolve(conflict);

                if (resolutionResult.success && resolutionResult.resolvedTask) {
                  mergedTasks.push(resolutionResult.resolvedTask);
                  conflict.resolved = true;
                  conflict.resolvedAt = new Date();
                  conflict.resolution = resolutionResult.resolution;
                } else {
                  // Could not auto-resolve, keep original
                  mergedTasks.push(newTask);
                }
              }
            } else {
              // No base version, use newTask
              mergedTasks.push(newTask);
            }
          } else {
            // New task
            mergedTasks.push(newTask);
          }
        }

        // Replace newTasks with merged results
        newTasks.splice(0, newTasks.length, ...mergedTasks);
      } else {
        // Use basic conflict detection (legacy)
        const basicConflicts = this.detectConflicts(currentTasks, newTasks);
        detectedConflicts.push(...basicConflicts);

        if (basicConflicts.length > 0) {
          logger.warn(
            { conflicts: basicConflicts.length },
            'Conflicts detected (basic)'
          );

          // Handle conflicts based on policy
          const resolvedTasks = this.resolveConflicts(
            basicConflicts,
            newTasks,
            currentTasks
          );

          // Use resolved tasks
          newTasks.splice(0, newTasks.length, ...resolvedTasks);
        }
      }

      history.conflictsDetected = detectedConflicts.length;
      history.conflictsResolved = detectedConflicts.filter(c => c.resolved).length;

      // Update conflicts list
      if (detectedConflicts.length > 0) {
        this.conflicts.push(...detectedConflicts);
        this.stateManager.updateUnresolvedConflicts(
          this.conflicts.filter(c => !c.resolved).length
        );
      }

      // Detect changes (create, update, delete)
      const changes = this.detectTaskChanges(currentTasks, newTasks);

      history.tasksCreated = changes.created.length;
      history.tasksUpdated = changes.updated.length;
      history.tasksDeleted = changes.deleted.length;
      history.tasksChanged =
        changes.created.length +
        changes.updated.length +
        changes.deleted.length;

      // Apply changes to database using batch writer
      if (changes.created.length > 0 || changes.updated.length > 0) {
        const tasksToUpsert = [...changes.created, ...changes.updated];
        await this.batchWriter.bulkUpsertTasks(tasksToUpsert);
        logger.info(
          { count: tasksToUpsert.length },
          'Tasks upserted to database'
        );
      }

      if (changes.deleted.length > 0) {
        const taskIdsToDelete = changes.deleted.map(t => t.id);
        await this.batchWriter.bulkDeleteTasks(taskIdsToDelete);
        logger.info(
          { count: taskIdsToDelete.length },
          'Tasks deleted from database'
        );
      }

      // Save base versions for 3-way merge
      if (this.config.strategy === 'three_way_merge') {
        const allCurrentTasks = await this.getAllTasksFromDB();
        await this.stateManager.saveBaseVersions(allCurrentTasks);
        logger.debug(
          { count: allCurrentTasks.length },
          'Base versions saved for 3-way merge'
        );
      }

      // Update state
      this.lastFileContent = fileContent;
      this.lastFileHash = this.calculateHash(fileContent);
      this.stateManager.updateHashes(this.lastFileHash, undefined);
      this.stateManager.incrementSyncVersion();

      // Update statistics
      this.statistics.totalSyncs++;
      this.statistics.successfulSyncs++;
      this.statistics.totalTasksChanged += history.tasksChanged;
      this.statistics.totalConflicts += history.conflictsDetected;
      this.statistics.autoResolvedConflicts += history.conflictsResolved;
      this.statistics.lastSyncAt = new Date();
      this.statistics.lastSuccessfulSyncAt = new Date();

      // Finalize history
      history.success = true;
      history.completedAt = new Date();
      history.durationMs = history.completedAt.getTime() - startTime.getTime();

      // Update average duration
      this.updateAverageDuration(history.durationMs);

      this.syncHistory.push(history);

      timer.done({
        itemsProcessed: history.tasksChanged,
        operation: 'sync-file-to-app',
      });

      logger.logSyncEvent('success', {
        syncDirection: 'file_to_app',
        operation: 'syncFileToApp',
        tasksChanged: history.tasksChanged,
      });

      this.emit('sync-completed', history);
      this.stateManager.markSyncComplete(true);
    } catch (error) {
      logger.logSyncEvent('failure', {
        err: error,
        syncDirection: 'file_to_app',
        operation: 'syncFileToApp',
      });

      this.statistics.totalSyncs++;
      this.statistics.failedSyncs++;

      history.success = false;
      history.error = error instanceof Error ? error : new Error(String(error));
      history.completedAt = new Date();
      history.durationMs = history.completedAt.getTime() - startTime.getTime();

      this.syncHistory.push(history);

      this.emit('sync-error', error);
      this.stateManager.markSyncComplete(false, history.error);
      throw error;
    } finally {
      this.isSyncing = false;
    }
  }

  /**
   * アプリ→ファイル同期を実行します
   *
   * IndexedDBからタスクを読み取りTODO.mdに書き込みます
   */
  async syncAppToFile(): Promise<void> {
    if (this.isSyncing) {
      logger.warn('Sync already in progress');
      return;
    }

    this.isSyncing = true;
    this.stateManager.markSyncStart();
    const syncId = this.generateSyncId();
    const startTime = new Date();
    const timer = logger.startTimer('sync-app-to-file');

    logger.logSyncEvent('start', {
      syncDirection: 'app_to_file',
      operation: 'syncAppToFile',
    });

    const history: SyncHistory = {
      id: syncId,
      startedAt: startTime,
      direction: 'app_to_file',
      tasksChanged: 0,
      tasksCreated: 0,
      tasksUpdated: 0,
      tasksDeleted: 0,
      conflictsDetected: 0,
      conflictsResolved: 0,
      success: false,
    };

    try {
      // Get all tasks from database
      const tasks = await this.getAllTasksFromDB();

      logger.debug(
        { taskCount: tasks.length },
        'Tasks retrieved from database'
      );

      // Create backup before writing (if enabled)
      if (this.config.autoBackup) {
        await this.createBackup('before_sync');
      }

      // Serialize tasks to Markdown
      const markdown = await this.serializer.serialize(tasks, {
        includeFrontMatter: true,
        sectionSpacing: 1,
      });

      // Validate markdown
      const validation = this.parser.validate(markdown);
      if (!validation.valid) {
        throw new Error(
          `Invalid markdown generated: ${validation.errors?.join(', ')}`
        );
      }

      // Write to file with circuit breaker protection
      const fileBreaker = this.circuitBreaker.getBreaker('file-write');
      if (!fileBreaker) {
        throw new Error('File write circuit breaker not initialized');
      }

      const validatedPath = this.pathValidator.validate(this.config.todoPath);

      if (!this.config.dryRun) {
        await this.retry.execute(
          async () => await fileBreaker.fire(validatedPath, markdown),
          {
            maxAttempts: 3,
            initialDelayMs: 1000,
            backoffStrategy: 'exponential',
          }
        );

        logger.info(
          { todoPath: validatedPath },
          'TODO.md updated successfully'
        );
      } else {
        logger.info('Dry run mode: TODO.md write skipped');
      }

      // Save base versions for 3-way merge
      if (this.config.strategy === 'three_way_merge') {
        await this.stateManager.saveBaseVersions(tasks);
        logger.debug(
          { count: tasks.length },
          'Base versions saved for 3-way merge'
        );
      }

      // Update state
      this.lastFileContent = markdown;
      this.lastFileHash = this.calculateHash(markdown);
      this.stateManager.updateHashes(this.lastFileHash, undefined);
      this.stateManager.incrementSyncVersion();

      // Update statistics
      this.statistics.totalSyncs++;
      this.statistics.successfulSyncs++;
      this.statistics.lastSyncAt = new Date();
      this.statistics.lastSuccessfulSyncAt = new Date();

      history.tasksChanged = tasks.length;
      history.success = true;
      history.completedAt = new Date();
      history.durationMs = history.completedAt.getTime() - startTime.getTime();

      this.updateAverageDuration(history.durationMs);

      this.syncHistory.push(history);

      timer.done({
        itemsProcessed: tasks.length,
        operation: 'sync-app-to-file',
      });

      logger.logSyncEvent('success', {
        syncDirection: 'app_to_file',
        operation: 'syncAppToFile',
        tasksChanged: history.tasksChanged,
      });

      this.emit('sync-completed', history);
      this.stateManager.markSyncComplete(true);
    } catch (error) {
      logger.logSyncEvent('failure', {
        err: error,
        syncDirection: 'app_to_file',
        operation: 'syncAppToFile',
      });

      this.statistics.totalSyncs++;
      this.statistics.failedSyncs++;

      history.success = false;
      history.error = error instanceof Error ? error : new Error(String(error));
      history.completedAt = new Date();
      history.durationMs = history.completedAt.getTime() - startTime.getTime();

      this.syncHistory.push(history);

      this.emit('sync-error', error);
      this.stateManager.markSyncComplete(false, history.error);
      throw error;
    } finally {
      this.isSyncing = false;
    }
  }

  /**
   * 同期統計情報を取得します
   */
  getStats(): SyncStatistics {
    return { ...this.statistics };
  }

  /**
   * 同期履歴を取得します
   */
  getSyncHistory(limit: number = 10): SyncHistory[] {
    return this.syncHistory.slice(-limit);
  }

  /**
   * 未解決の競合を取得します
   */
  getConflicts(): Conflict[] {
    return this.conflicts.filter(c => !c.resolved);
  }

  /**
   * 同期状態を取得します
   */
  getSyncState() {
    return this.stateManager.getSyncState();
  }

  /**
   * ベースバージョンを取得します（3-way merge用）
   */
  async getBaseVersion(taskId: string) {
    return await this.stateManager.getBaseVersion(taskId);
  }

  /**
   * 古いベースバージョンをクリーンアップします
   */
  async cleanupOldBaseVersions(olderThanDays: number = 30): Promise<number> {
    return await this.stateManager.cleanupOldBaseVersions(olderThanDays);
  }

  /**
   * バックアップを作成します
   */
  private async createBackup(
    reason: BackupInfo['reason']
  ): Promise<BackupInfo | null> {
    try {
      const validatedPath = this.pathValidator.validate(this.config.todoPath);
      const exists = await this.pathValidator.exists(validatedPath);

      if (!exists) {
        logger.debug('TODO.md does not exist, skipping backup');
        return null;
      }

      const content = await fs.readFile(validatedPath, 'utf-8');
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const backupPath = `${validatedPath}.backup.${timestamp}`;

      await fs.writeFile(backupPath, content, 'utf-8');

      const stats = await fs.stat(backupPath);
      const backup: BackupInfo = {
        id: this.generateSyncId(),
        path: backupPath,
        createdAt: new Date(),
        size: stats.size,
        sourceHash: this.calculateHash(content),
        reason,
      };

      logger.info({ backupPath, reason }, 'Backup created');

      return backup;
    } catch (error) {
      logger.error({ err: error }, 'Failed to create backup');
      return null;
    }
  }

  /**
   * IndexedDBから全タスクを取得します
   */
  private async getAllTasksFromDB(): Promise<Task[]> {
    if (!this.database) {
      logger.warn('Database not initialized, returning empty array');
      return [];
    }

    try {
      const tx = this.database.transaction('tasks', 'readonly');
      const store = tx.objectStore('tasks');
      const tasks = await store.getAll();
      await tx.done;

      return tasks;
    } catch (error) {
      logger.error({ err: error }, 'Failed to get tasks from database');
      return [];
    }
  }

  /**
   * ParsedTaskをTaskに変換します
   */
  private parsedTaskToTask(parsedTask: any): Task {
    return {
      id: this.generateTaskId(),
      title: parsedTask.title,
      status: parsedTask.checked ? 'completed' : 'pending',
      priority: parsedTask.metadata?.priority || 'medium',
      dueDate: parsedTask.metadata?.dueDate,
      tags: parsedTask.metadata?.tags,
      section: parsedTask.section,
      order: parsedTask.lineNumber,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  /**
   * 競合を検出します（基本実装）
   */
  private detectConflicts(currentTasks: Task[], newTasks: Task[]): Conflict[] {
    const conflicts: Conflict[] = [];

    // Title-based matching (simple implementation)
    const currentTaskMap = new Map(currentTasks.map(t => [t.title, t]));

    for (const newTask of newTasks) {
      const currentTask = currentTaskMap.get(newTask.title);

      if (currentTask) {
        // Check if there are differences
        const hasConflict =
          currentTask.status !== newTask.status ||
          currentTask.priority !== newTask.priority ||
          currentTask.dueDate !== newTask.dueDate;

        if (hasConflict) {
          conflicts.push({
            id: this.generateSyncId(),
            taskId: currentTask.id,
            fileVersion: newTask,
            appVersion: currentTask,
            detectedAt: new Date(),
            conflictType: 'content',
            resolved: false,
          });
        }
      }
    }

    return conflicts;
  }

  /**
   * 競合を解決します
   */
  private resolveConflicts(
    conflicts: Conflict[],
    fileTasks: Task[],
    _appTasks: Task[]
  ): Task[] {
    const resolvedTasks = [...fileTasks];

    for (const conflict of conflicts) {
      const index = resolvedTasks.findIndex(
        t => t.title === conflict.fileVersion.title
      );

      if (index !== -1) {
        // Apply conflict resolution policy
        switch (this.config.conflictResolution) {
          case 'prefer_file':
            // Keep file version (already in resolvedTasks)
            break;

          case 'prefer_app':
            // Use app version
            resolvedTasks[index] = conflict.appVersion;
            break;

          case 'manual':
            // Keep file version but mark as unresolved
            logger.warn(
              { conflictId: conflict.id },
              'Manual conflict resolution required'
            );
            break;

          default:
            // Default to prefer_file
            break;
        }

        conflict.resolved = true;
        conflict.resolvedAt = new Date();
      }
    }

    return resolvedTasks;
  }

  /**
   * タスクの変更を検出します
   */
  private detectTaskChanges(
    currentTasks: Task[],
    newTasks: Task[]
  ): {
    created: Task[];
    updated: Task[];
    deleted: Task[];
  } {
    const currentMap = new Map(currentTasks.map(t => [t.title, t]));
    const newMap = new Map(newTasks.map(t => [t.title, t]));

    const created: Task[] = [];
    const updated: Task[] = [];
    const deleted: Task[] = [];

    // Find created and updated
    for (const newTask of newTasks) {
      const current = currentMap.get(newTask.title);

      if (!current) {
        created.push(newTask);
      } else {
        // Check if updated
        if (
          current.status !== newTask.status ||
          current.priority !== newTask.priority ||
          current.dueDate !== newTask.dueDate
        ) {
          // Preserve ID and timestamps
          updated.push({
            ...newTask,
            id: current.id,
            createdAt: current.createdAt,
            updatedAt: new Date(),
          });
        }
      }
    }

    // Find deleted
    for (const current of currentTasks) {
      if (!newMap.has(current.title)) {
        deleted.push(current);
      }
    }

    return { created, updated, deleted };
  }

  /**
   * ハッシュ値を計算します（簡易実装）
   */
  private calculateHash(content: string): string {
    let hash = 0;
    for (let i = 0; i < content.length; i++) {
      const char = content.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return hash.toString(16);
  }

  /**
   * 平均同期時間を更新します
   */
  private updateAverageDuration(durationMs: number): void {
    const totalDuration =
      this.statistics.averageDurationMs * (this.statistics.totalSyncs - 1) +
      durationMs;
    this.statistics.averageDurationMs = Math.round(
      totalDuration / this.statistics.totalSyncs
    );
  }

  /**
   * 同期IDを生成します（簡易UUID）
   */
  private generateSyncId(): string {
    return `sync-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * タスクIDを生成します（簡易UUID）
   */
  private generateTaskId(): string {
    return `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}
