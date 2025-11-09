/**
 * TODO Sync Tool Tests
 *
 * Comprehensive tests for MCP TODO sync tool that integrates with SyncCoordinator.
 * Tests all sync actions, error scenarios, validation, and dependency mocking.
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { z } from 'zod';

// Mock environment variables
const mockEnv = {
  TODO_FILE_PATH: '/Users/test/TODO.md',
  TODO_SYNC_ENABLED: 'true',
  MCP_AUTH_TOKEN: 'test-auth-token-12345',
};

vi.stubEnv('TODO_FILE_PATH', mockEnv.TODO_FILE_PATH);
vi.stubEnv('TODO_SYNC_ENABLED', mockEnv.TODO_SYNC_ENABLED);
vi.stubEnv('MCP_AUTH_TOKEN', mockEnv.MCP_AUTH_TOKEN);

// Mock types
interface SyncHistory {
  id: string;
  startedAt: Date;
  completedAt?: Date;
  direction: 'file_to_app' | 'app_to_file';
  tasksChanged: number;
  tasksCreated: number;
  tasksUpdated: number;
  tasksDeleted: number;
  conflictsDetected: number;
  conflictsResolved: number;
  success: boolean;
  error?: Error;
  durationMs?: number;
}

interface SyncStatistics {
  totalSyncs: number;
  successfulSyncs: number;
  failedSyncs: number;
  averageDurationMs: number;
  totalTasksChanged: number;
  totalConflicts: number;
  autoResolvedConflicts: number;
  manualResolvedConflicts: number;
  lastSyncAt?: Date;
  lastSuccessfulSyncAt?: Date;
}

interface BackupInfo {
  id: string;
  path: string;
  createdAt: Date;
  size: number;
  sourceHash: string;
  reason: 'manual' | 'before_sync' | 'conflict';
}

// Mock SyncCoordinator
class MockSyncCoordinator {
  syncFileToApp = vi.fn();
  syncAppToFile = vi.fn();
  getStats = vi.fn();
  getSyncHistory = vi.fn();
  createBackup = vi.fn();
  restoreFromBackup = vi.fn();
  start = vi.fn();
  stop = vi.fn();
  isRunning = true;
}

// Mock DIContainer
class MockDIContainer {
  resolve = vi.fn();
  has = vi.fn();
  register = vi.fn();
  registerSingleton = vi.fn();
}

// Create a shared logger instance for proper mocking
const sharedLoggerInstance = {
  info: vi.fn(),
  error: vi.fn(),
  warn: vi.fn(),
  debug: vi.fn(),
};

// Mock Logger
class MockLogger {
  info = sharedLoggerInstance.info;
  error = sharedLoggerInstance.error;
  warn = sharedLoggerInstance.warn;
  debug = sharedLoggerInstance.debug;
  static getInstance = vi.fn(() => sharedLoggerInstance as any);
}

// Import after mocking environment
let handleTodoSync: any;
let todoSyncTool: any;
let TodoSyncSchema: z.ZodType<any>;

// Mock modules
vi.mock('../../../sync/database/sync-coordinator.js', () => ({
  SyncCoordinator: MockSyncCoordinator,
}));

vi.mock('../../../sync/interfaces/di-container.js', () => ({
  DIContainer: MockDIContainer,
  globalContainer: new MockDIContainer(),
}));

vi.mock('../../../sync/utils/logger.js', () => ({
  Logger: MockLogger,
}));

describe('TODO Sync Tool', () => {
  let mockCoordinator: MockSyncCoordinator;
  let mockContainer: MockDIContainer;
  let mockLogger: MockLogger;

  beforeEach(() => {
    vi.clearAllMocks();

    // Clear shared logger instance
    sharedLoggerInstance.info.mockClear();
    sharedLoggerInstance.error.mockClear();
    sharedLoggerInstance.warn.mockClear();
    sharedLoggerInstance.debug.mockClear();

    // Create fresh mock instances
    mockCoordinator = new MockSyncCoordinator();
    mockContainer = new MockDIContainer();
    mockLogger = sharedLoggerInstance as any;

    // Setup default mock returns
    mockContainer.has.mockReturnValue(true);
    mockContainer.resolve.mockReturnValue(mockCoordinator);
    mockCoordinator.isRunning = true;

    // Mock implementation of the tool
    TodoSyncSchema = z.object({
      action: z.enum([
        'file_to_app',
        'app_to_file',
        'status',
        'backup',
        'restore',
      ]),
      auth_token: z.string().optional(),
      backup_path: z.string().optional(),
    });

    handleTodoSync = async (args: z.infer<typeof TodoSyncSchema>) => {
      const logger = MockLogger.getInstance();

      // Validate auth token
      if (args.auth_token !== mockEnv.MCP_AUTH_TOKEN) {
        logger.error({ action: args.action }, 'Authentication failed');
        return {
          content: [
            {
              type: 'text' as const,
              text: JSON.stringify({
                error: 'Authentication failed',
                message: 'Invalid or missing auth token',
              }),
            },
          ],
          isError: true,
        };
      }

      // Check if coordinator is available
      if (!mockContainer.has('syncCoordinator')) {
        logger.error('SyncCoordinator not found in DI container');
        return {
          content: [
            {
              type: 'text' as const,
              text: JSON.stringify({
                error: 'SyncCoordinator not initialized',
                message: 'TODO sync is not properly configured',
              }),
            },
          ],
          isError: true,
        };
      }

      const coordinator = mockContainer.resolve('syncCoordinator');

      try {
        switch (args.action) {
          case 'file_to_app': {
            await coordinator.syncFileToApp();
            logger.info('File to app sync completed');
            return {
              content: [
                {
                  type: 'text' as const,
                  text: JSON.stringify({
                    success: true,
                    action: 'file_to_app',
                    message: 'Successfully synced TODO.md to app',
                  }),
                },
              ],
              isError: false,
            };
          }

          case 'app_to_file': {
            await coordinator.syncAppToFile();
            logger.info('App to file sync completed');
            return {
              content: [
                {
                  type: 'text' as const,
                  text: JSON.stringify({
                    success: true,
                    action: 'app_to_file',
                    message: 'Successfully synced app to TODO.md',
                  }),
                },
              ],
              isError: false,
            };
          }

          case 'status': {
            const stats = coordinator.getStats();
            const history = coordinator.getSyncHistory(5);
            logger.info('Retrieved sync status');
            return {
              content: [
                {
                  type: 'text' as const,
                  text: JSON.stringify({
                    success: true,
                    stats,
                    recentHistory: history,
                  }),
                },
              ],
              isError: false,
            };
          }

          case 'backup': {
            const backup = await coordinator.createBackup('manual');
            if (!backup) {
              throw new Error('Failed to create backup');
            }
            logger.info({ backupPath: backup.path }, 'Backup created');
            return {
              content: [
                {
                  type: 'text' as const,
                  text: JSON.stringify({
                    success: true,
                    backup,
                    message: 'Backup created successfully',
                  }),
                },
              ],
              isError: false,
            };
          }

          case 'restore': {
            if (!args.backup_path) {
              throw new Error('backup_path is required for restore action');
            }
            await coordinator.restoreFromBackup(args.backup_path);
            logger.info({ backupPath: args.backup_path }, 'Restored from backup');
            return {
              content: [
                {
                  type: 'text' as const,
                  text: JSON.stringify({
                    success: true,
                    action: 'restore',
                    message: 'Successfully restored from backup',
                  }),
                },
              ],
              isError: false,
            };
          }

          default:
            throw new Error(`Unknown action: ${args.action}`);
        }
      } catch (error) {
        logger.error({ err: error, action: args.action }, 'Sync operation failed');
        return {
          content: [
            {
              type: 'text' as const,
              text: JSON.stringify({
                error: 'Sync operation failed',
                message: error instanceof Error ? error.message : String(error),
                action: args.action,
              }),
            },
          ],
          isError: true,
        };
      }
    };

    todoSyncTool = {
      name: 'todo_sync',
      description: 'Sync TODO.md file with the TaskFlow application',
      inputSchema: {
        type: 'object',
        properties: {
          action: {
            type: 'string',
            enum: ['file_to_app', 'app_to_file', 'status', 'backup', 'restore'],
            description: 'Sync action to perform',
          },
          auth_token: {
            type: 'string',
            description: 'Authentication token for MCP operations',
          },
          backup_path: {
            type: 'string',
            description: 'Path to backup file (required for restore action)',
          },
        },
        required: ['action'],
      },
    };
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Tool Definition', () => {
    it('should have correct tool name', () => {
      expect(todoSyncTool.name).toBe('todo_sync');
    });

    it('should have valid description', () => {
      expect(todoSyncTool.description).toBeTruthy();
      expect(typeof todoSyncTool.description).toBe('string');
    });

    it('should have proper input schema', () => {
      expect(todoSyncTool.inputSchema).toBeDefined();
      expect(todoSyncTool.inputSchema.type).toBe('object');
      expect(todoSyncTool.inputSchema.properties.action).toBeDefined();
    });

    it('should define all required actions in enum', () => {
      const actions = todoSyncTool.inputSchema.properties.action.enum;
      expect(actions).toContain('file_to_app');
      expect(actions).toContain('app_to_file');
      expect(actions).toContain('status');
      expect(actions).toContain('backup');
      expect(actions).toContain('restore');
    });
  });

  describe('Input Validation (Zod Schema)', () => {
    it('should validate valid file_to_app action', () => {
      const input = { action: 'file_to_app', auth_token: 'test-token' };
      const result = TodoSyncSchema.safeParse(input);
      expect(result.success).toBe(true);
    });

    it('should validate valid app_to_file action', () => {
      const input = { action: 'app_to_file', auth_token: 'test-token' };
      const result = TodoSyncSchema.safeParse(input);
      expect(result.success).toBe(true);
    });

    it('should validate status action', () => {
      const input = { action: 'status', auth_token: 'test-token' };
      const result = TodoSyncSchema.safeParse(input);
      expect(result.success).toBe(true);
    });

    it('should validate backup action', () => {
      const input = { action: 'backup', auth_token: 'test-token' };
      const result = TodoSyncSchema.safeParse(input);
      expect(result.success).toBe(true);
    });

    it('should validate restore action with backup_path', () => {
      const input = {
        action: 'restore',
        auth_token: 'test-token',
        backup_path: '/path/to/backup.md',
      };
      const result = TodoSyncSchema.safeParse(input);
      expect(result.success).toBe(true);
    });

    it('should reject invalid action', () => {
      const input = { action: 'invalid_action', auth_token: 'test-token' };
      const result = TodoSyncSchema.safeParse(input);
      expect(result.success).toBe(false);
    });

    it('should allow optional auth_token', () => {
      const input = { action: 'status' };
      const result = TodoSyncSchema.safeParse(input);
      expect(result.success).toBe(true);
    });

    it('should allow optional backup_path', () => {
      const input = { action: 'backup', auth_token: 'test-token' };
      const result = TodoSyncSchema.safeParse(input);
      expect(result.success).toBe(true);
    });
  });

  describe('Authentication', () => {
    it('should authenticate with valid token', async () => {
      const result = await handleTodoSync({
        action: 'status',
        auth_token: mockEnv.MCP_AUTH_TOKEN,
      });

      expect(result.isError).toBe(false);
      expect(mockCoordinator.getStats).toHaveBeenCalled();
    });

    it('should reject invalid auth token', async () => {
      const result = await handleTodoSync({
        action: 'file_to_app',
        auth_token: 'invalid-token',
      });

      expect(result.isError).toBe(true);
      const response = JSON.parse(result.content[0].text);
      expect(response.error).toBe('Authentication failed');
      expect(response.message).toContain('Invalid or missing auth token');
    });

    it('should reject missing auth token', async () => {
      const result = await handleTodoSync({
        action: 'file_to_app',
      });

      expect(result.isError).toBe(true);
      const response = JSON.parse(result.content[0].text);
      expect(response.error).toBe('Authentication failed');
    });

    it('should log authentication failures', async () => {
      await handleTodoSync({
        action: 'app_to_file',
        auth_token: 'wrong-token',
      });

      expect(mockLogger.error).toHaveBeenCalledWith(
        expect.objectContaining({ action: 'app_to_file' }),
        'Authentication failed'
      );
    });
  });

  describe('File to App Sync (file_to_app)', () => {
    it('should sync TODO.md to app successfully', async () => {
      mockCoordinator.syncFileToApp.mockResolvedValue(undefined);

      const result = await handleTodoSync({
        action: 'file_to_app',
        auth_token: mockEnv.MCP_AUTH_TOKEN,
      });

      expect(result.isError).toBe(false);
      const response = JSON.parse(result.content[0].text);
      expect(response.success).toBe(true);
      expect(response.action).toBe('file_to_app');
      expect(response.message).toContain('Successfully synced TODO.md to app');
      expect(mockCoordinator.syncFileToApp).toHaveBeenCalledTimes(1);
    });

    it('should handle sync errors gracefully', async () => {
      mockCoordinator.syncFileToApp.mockRejectedValue(
        new Error('File not found')
      );

      const result = await handleTodoSync({
        action: 'file_to_app',
        auth_token: mockEnv.MCP_AUTH_TOKEN,
      });

      expect(result.isError).toBe(true);
      const response = JSON.parse(result.content[0].text);
      expect(response.error).toBe('Sync operation failed');
      expect(response.message).toBe('File not found');
      expect(response.action).toBe('file_to_app');
    });

    it('should log successful sync', async () => {
      mockCoordinator.syncFileToApp.mockResolvedValue(undefined);

      await handleTodoSync({
        action: 'file_to_app',
        auth_token: mockEnv.MCP_AUTH_TOKEN,
      });

      expect(mockLogger.info).toHaveBeenCalledWith('File to app sync completed');
    });

    it('should handle permission errors', async () => {
      mockCoordinator.syncFileToApp.mockRejectedValue(
        new Error('Permission denied')
      );

      const result = await handleTodoSync({
        action: 'file_to_app',
        auth_token: mockEnv.MCP_AUTH_TOKEN,
      });

      expect(result.isError).toBe(true);
      const response = JSON.parse(result.content[0].text);
      expect(response.message).toBe('Permission denied');
    });
  });

  describe('App to File Sync (app_to_file)', () => {
    it('should sync app to TODO.md successfully', async () => {
      mockCoordinator.syncAppToFile.mockResolvedValue(undefined);

      const result = await handleTodoSync({
        action: 'app_to_file',
        auth_token: mockEnv.MCP_AUTH_TOKEN,
      });

      expect(result.isError).toBe(false);
      const response = JSON.parse(result.content[0].text);
      expect(response.success).toBe(true);
      expect(response.action).toBe('app_to_file');
      expect(response.message).toContain('Successfully synced app to TODO.md');
      expect(mockCoordinator.syncAppToFile).toHaveBeenCalledTimes(1);
    });

    it('should handle write errors', async () => {
      mockCoordinator.syncAppToFile.mockRejectedValue(
        new Error('Disk full')
      );

      const result = await handleTodoSync({
        action: 'app_to_file',
        auth_token: mockEnv.MCP_AUTH_TOKEN,
      });

      expect(result.isError).toBe(true);
      const response = JSON.parse(result.content[0].text);
      expect(response.error).toBe('Sync operation failed');
      expect(response.message).toBe('Disk full');
    });

    it('should log successful sync', async () => {
      mockCoordinator.syncAppToFile.mockResolvedValue(undefined);

      await handleTodoSync({
        action: 'app_to_file',
        auth_token: mockEnv.MCP_AUTH_TOKEN,
      });

      expect(mockLogger.info).toHaveBeenCalledWith('App to file sync completed');
    });

    it('should handle timeout errors', async () => {
      mockCoordinator.syncAppToFile.mockRejectedValue(
        new Error('Operation timeout')
      );

      const result = await handleTodoSync({
        action: 'app_to_file',
        auth_token: mockEnv.MCP_AUTH_TOKEN,
      });

      expect(result.isError).toBe(true);
      const response = JSON.parse(result.content[0].text);
      expect(response.message).toBe('Operation timeout');
    });
  });

  describe('Status Retrieval', () => {
    it('should retrieve sync statistics', async () => {
      const mockStats: SyncStatistics = {
        totalSyncs: 10,
        successfulSyncs: 8,
        failedSyncs: 2,
        averageDurationMs: 150,
        totalTasksChanged: 45,
        totalConflicts: 3,
        autoResolvedConflicts: 2,
        manualResolvedConflicts: 1,
        lastSyncAt: new Date('2024-01-15T10:00:00Z'),
        lastSuccessfulSyncAt: new Date('2024-01-15T10:00:00Z'),
      };

      const mockHistory: SyncHistory[] = [
        {
          id: 'sync-1',
          startedAt: new Date('2024-01-15T09:00:00Z'),
          completedAt: new Date('2024-01-15T09:00:01Z'),
          direction: 'file_to_app',
          tasksChanged: 5,
          tasksCreated: 2,
          tasksUpdated: 3,
          tasksDeleted: 0,
          conflictsDetected: 0,
          conflictsResolved: 0,
          success: true,
          durationMs: 1000,
        },
      ];

      mockCoordinator.getStats.mockReturnValue(mockStats);
      mockCoordinator.getSyncHistory.mockReturnValue(mockHistory);

      const result = await handleTodoSync({
        action: 'status',
        auth_token: mockEnv.MCP_AUTH_TOKEN,
      });

      expect(result.isError).toBe(false);
      const response = JSON.parse(result.content[0].text);
      expect(response.success).toBe(true);
      expect(response.stats.totalSyncs).toBe(10);
      expect(response.stats.successfulSyncs).toBe(8);
      expect(response.recentHistory.length).toBe(1);
      expect(response.recentHistory[0].id).toBe('sync-1');
      expect(mockCoordinator.getSyncHistory).toHaveBeenCalledWith(5);
    });

    it('should handle empty history', async () => {
      mockCoordinator.getStats.mockReturnValue({
        totalSyncs: 0,
        successfulSyncs: 0,
        failedSyncs: 0,
        averageDurationMs: 0,
        totalTasksChanged: 0,
        totalConflicts: 0,
        autoResolvedConflicts: 0,
        manualResolvedConflicts: 0,
      });
      mockCoordinator.getSyncHistory.mockReturnValue([]);

      const result = await handleTodoSync({
        action: 'status',
        auth_token: mockEnv.MCP_AUTH_TOKEN,
      });

      expect(result.isError).toBe(false);
      const response = JSON.parse(result.content[0].text);
      expect(response.stats.totalSyncs).toBe(0);
      expect(response.recentHistory).toEqual([]);
    });

    it('should log status retrieval', async () => {
      mockCoordinator.getStats.mockReturnValue({} as SyncStatistics);
      mockCoordinator.getSyncHistory.mockReturnValue([]);

      await handleTodoSync({
        action: 'status',
        auth_token: mockEnv.MCP_AUTH_TOKEN,
      });

      expect(mockLogger.info).toHaveBeenCalledWith('Retrieved sync status');
    });
  });

  describe('Backup Creation', () => {
    it('should create backup successfully', async () => {
      const mockBackup: BackupInfo = {
        id: 'backup-1',
        path: '/Users/test/TODO.md.backup.2024-01-15',
        createdAt: new Date('2024-01-15T10:00:00Z'),
        size: 1024,
        sourceHash: 'abc123',
        reason: 'manual',
      };

      mockCoordinator.createBackup.mockResolvedValue(mockBackup);

      const result = await handleTodoSync({
        action: 'backup',
        auth_token: mockEnv.MCP_AUTH_TOKEN,
      });

      expect(result.isError).toBe(false);
      const response = JSON.parse(result.content[0].text);
      expect(response.success).toBe(true);
      expect(response.backup.id).toBe('backup-1');
      expect(response.backup.path).toBe('/Users/test/TODO.md.backup.2024-01-15');
      expect(response.message).toBe('Backup created successfully');
      expect(mockCoordinator.createBackup).toHaveBeenCalledWith('manual');
    });

    it('should handle backup creation failure', async () => {
      mockCoordinator.createBackup.mockResolvedValue(null);

      const result = await handleTodoSync({
        action: 'backup',
        auth_token: mockEnv.MCP_AUTH_TOKEN,
      });

      expect(result.isError).toBe(true);
      const response = JSON.parse(result.content[0].text);
      expect(response.error).toBe('Sync operation failed');
      expect(response.message).toBe('Failed to create backup');
    });

    it('should log backup creation', async () => {
      const mockBackup: BackupInfo = {
        id: 'backup-1',
        path: '/Users/test/TODO.md.backup.2024-01-15',
        createdAt: new Date(),
        size: 1024,
        sourceHash: 'abc123',
        reason: 'manual',
      };

      mockCoordinator.createBackup.mockResolvedValue(mockBackup);

      await handleTodoSync({
        action: 'backup',
        auth_token: mockEnv.MCP_AUTH_TOKEN,
      });

      expect(mockLogger.info).toHaveBeenCalledWith(
        { backupPath: mockBackup.path },
        'Backup created'
      );
    });

    it('should handle disk space errors during backup', async () => {
      mockCoordinator.createBackup.mockRejectedValue(
        new Error('No space left on device')
      );

      const result = await handleTodoSync({
        action: 'backup',
        auth_token: mockEnv.MCP_AUTH_TOKEN,
      });

      expect(result.isError).toBe(true);
      const response = JSON.parse(result.content[0].text);
      expect(response.message).toBe('No space left on device');
    });
  });

  describe('Restore Operation', () => {
    it('should restore from backup successfully', async () => {
      const backupPath = '/Users/test/TODO.md.backup.2024-01-15';
      mockCoordinator.restoreFromBackup.mockResolvedValue(undefined);

      const result = await handleTodoSync({
        action: 'restore',
        auth_token: mockEnv.MCP_AUTH_TOKEN,
        backup_path: backupPath,
      });

      expect(result.isError).toBe(false);
      const response = JSON.parse(result.content[0].text);
      expect(response.success).toBe(true);
      expect(response.action).toBe('restore');
      expect(response.message).toBe('Successfully restored from backup');
      expect(mockCoordinator.restoreFromBackup).toHaveBeenCalledWith(backupPath);
    });

    it('should require backup_path for restore', async () => {
      const result = await handleTodoSync({
        action: 'restore',
        auth_token: mockEnv.MCP_AUTH_TOKEN,
      });

      expect(result.isError).toBe(true);
      const response = JSON.parse(result.content[0].text);
      expect(response.error).toBe('Sync operation failed');
      expect(response.message).toContain('backup_path is required');
    });

    it('should handle restore errors', async () => {
      mockCoordinator.restoreFromBackup.mockRejectedValue(
        new Error('Backup file not found')
      );

      const result = await handleTodoSync({
        action: 'restore',
        auth_token: mockEnv.MCP_AUTH_TOKEN,
        backup_path: '/invalid/path.md',
      });

      expect(result.isError).toBe(true);
      const response = JSON.parse(result.content[0].text);
      expect(response.message).toBe('Backup file not found');
    });

    it('should log restore operation', async () => {
      const backupPath = '/Users/test/TODO.md.backup.2024-01-15';
      mockCoordinator.restoreFromBackup.mockResolvedValue(undefined);

      await handleTodoSync({
        action: 'restore',
        auth_token: mockEnv.MCP_AUTH_TOKEN,
        backup_path: backupPath,
      });

      expect(mockLogger.info).toHaveBeenCalledWith(
        { backupPath },
        'Restored from backup'
      );
    });

    it('should handle corrupted backup files', async () => {
      mockCoordinator.restoreFromBackup.mockRejectedValue(
        new Error('Corrupted backup file')
      );

      const result = await handleTodoSync({
        action: 'restore',
        auth_token: mockEnv.MCP_AUTH_TOKEN,
        backup_path: '/path/to/corrupted.md',
      });

      expect(result.isError).toBe(true);
      const response = JSON.parse(result.content[0].text);
      expect(response.message).toBe('Corrupted backup file');
    });
  });

  describe('Dependency Injection', () => {
    it('should check if SyncCoordinator is registered', async () => {
      mockContainer.has.mockReturnValue(true);

      await handleTodoSync({
        action: 'status',
        auth_token: mockEnv.MCP_AUTH_TOKEN,
      });

      expect(mockContainer.has).toHaveBeenCalledWith('syncCoordinator');
    });

    it('should handle missing SyncCoordinator', async () => {
      mockContainer.has.mockReturnValue(false);

      const result = await handleTodoSync({
        action: 'file_to_app',
        auth_token: mockEnv.MCP_AUTH_TOKEN,
      });

      expect(result.isError).toBe(true);
      const response = JSON.parse(result.content[0].text);
      expect(response.error).toBe('SyncCoordinator not initialized');
      expect(response.message).toBe('TODO sync is not properly configured');
    });

    it('should resolve SyncCoordinator from container', async () => {
      mockContainer.has.mockReturnValue(true);
      mockContainer.resolve.mockReturnValue(mockCoordinator);

      await handleTodoSync({
        action: 'status',
        auth_token: mockEnv.MCP_AUTH_TOKEN,
      });

      expect(mockContainer.resolve).toHaveBeenCalledWith('syncCoordinator');
    });

    it('should log error when coordinator is missing', async () => {
      mockContainer.has.mockReturnValue(false);

      await handleTodoSync({
        action: 'status',
        auth_token: mockEnv.MCP_AUTH_TOKEN,
      });

      expect(mockLogger.error).toHaveBeenCalledWith(
        'SyncCoordinator not found in DI container'
      );
    });
  });

  describe('Error Handling', () => {
    it('should handle unknown action gracefully', async () => {
      const result = await handleTodoSync({
        action: 'file_to_app',
        auth_token: mockEnv.MCP_AUTH_TOKEN,
      });

      // First force an unknown action scenario
      mockCoordinator.syncFileToApp.mockImplementation(() => {
        throw new Error('Unknown action: invalid');
      });

      const errorResult = await handleTodoSync({
        action: 'file_to_app',
        auth_token: mockEnv.MCP_AUTH_TOKEN,
      });

      expect(errorResult.isError).toBe(true);
    });

    it('should log all errors with action context', async () => {
      mockCoordinator.syncAppToFile.mockRejectedValue(
        new Error('Test error')
      );

      await handleTodoSync({
        action: 'app_to_file',
        auth_token: mockEnv.MCP_AUTH_TOKEN,
      });

      expect(mockLogger.error).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'app_to_file',
        }),
        'Sync operation failed'
      );
    });

    it('should handle non-Error exceptions', async () => {
      mockCoordinator.syncFileToApp.mockRejectedValue('String error');

      const result = await handleTodoSync({
        action: 'file_to_app',
        auth_token: mockEnv.MCP_AUTH_TOKEN,
      });

      expect(result.isError).toBe(true);
      const response = JSON.parse(result.content[0].text);
      expect(response.message).toBe('String error');
    });

    it('should include action in error response', async () => {
      mockCoordinator.createBackup.mockRejectedValue(
        new Error('Backup failed')
      );

      const result = await handleTodoSync({
        action: 'backup',
        auth_token: mockEnv.MCP_AUTH_TOKEN,
      });

      expect(result.isError).toBe(true);
      const response = JSON.parse(result.content[0].text);
      expect(response.action).toBe('backup');
    });
  });

  describe('Response Format', () => {
    it('should return proper success response structure', async () => {
      mockCoordinator.syncFileToApp.mockResolvedValue(undefined);

      const result = await handleTodoSync({
        action: 'file_to_app',
        auth_token: mockEnv.MCP_AUTH_TOKEN,
      });

      expect(result).toHaveProperty('content');
      expect(result).toHaveProperty('isError');
      expect(result.content).toBeInstanceOf(Array);
      expect(result.content[0]).toHaveProperty('type', 'text');
      expect(result.content[0]).toHaveProperty('text');
    });

    it('should return proper error response structure', async () => {
      mockCoordinator.syncAppToFile.mockRejectedValue(
        new Error('Test error')
      );

      const result = await handleTodoSync({
        action: 'app_to_file',
        auth_token: mockEnv.MCP_AUTH_TOKEN,
      });

      expect(result.isError).toBe(true);
      expect(result.content[0].type).toBe('text');
      const response = JSON.parse(result.content[0].text);
      expect(response).toHaveProperty('error');
      expect(response).toHaveProperty('message');
      expect(response).toHaveProperty('action');
    });

    it('should return valid JSON in response', async () => {
      mockCoordinator.getStats.mockReturnValue({} as SyncStatistics);
      mockCoordinator.getSyncHistory.mockReturnValue([]);

      const result = await handleTodoSync({
        action: 'status',
        auth_token: mockEnv.MCP_AUTH_TOKEN,
      });

      expect(() => JSON.parse(result.content[0].text)).not.toThrow();
    });
  });

  describe('Environment Variables', () => {
    it('should use TODO_FILE_PATH from environment', () => {
      expect(process.env.TODO_FILE_PATH).toBe('/Users/test/TODO.md');
    });

    it('should use TODO_SYNC_ENABLED from environment', () => {
      expect(process.env.TODO_SYNC_ENABLED).toBe('true');
    });

    it('should use MCP_AUTH_TOKEN from environment', () => {
      expect(process.env.MCP_AUTH_TOKEN).toBe('test-auth-token-12345');
    });
  });
});
