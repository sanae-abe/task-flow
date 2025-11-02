/**
 * Data Export utility functions tests
 * データエクスポート機能の包括的テスト
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  exportData,
  exportBoard,
  validateImportData,
  readFileAsText,
  type ExportData,
} from './dataExport';
import type { KanbanBoard, Task, Column } from '../types';

// Mock DOM APIs
global.URL.createObjectURL = vi.fn(() => 'blob:mock-url');
global.URL.revokeObjectURL = vi.fn();

describe('Data Export Utils', () => {
  let mockBoard: KanbanBoard;
  let mockDocument: any;

  beforeEach(() => {
    const now = new Date().toISOString();
    mockBoard = {
      id: 'board-1',
      title: 'Test Board',
      columns: [
        {
          id: 'col-1',
          title: 'Column 1',
          tasks: [
            {
              id: 'task-1',
              title: 'Task 1',
              description: 'Test Description',
              createdAt: now,
              updatedAt: now,
            } as Task,
          ],
          deletionState: 'active',
          deletedAt: null,
        } as Column,
      ],
      deletionState: 'active',
      deletedAt: null,
      createdAt: now,
      updatedAt: now,
    } as KanbanBoard;

    // Mock document
    mockDocument = {
      createElement: vi.fn(() => ({
        href: '',
        download: '',
        click: vi.fn(),
      })),
      body: {
        appendChild: vi.fn(),
        removeChild: vi.fn(),
      },
    };
    global.document = mockDocument as any;
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('exportData', () => {
    it('should create export data with correct structure', () => {
      const boards = [mockBoard];
      exportData(boards);

      // Verify createElement was called
      expect(mockDocument.createElement).toHaveBeenCalledWith('a');
    });

    it('should create blob with JSON data', () => {
      const boards = [mockBoard];
      const blobSpy = vi.spyOn(global, 'Blob');

      exportData(boards);

      expect(blobSpy).toHaveBeenCalledWith(
        [expect.stringContaining('"version"')],
        { type: 'application/json' }
      );
    });

    it('should set correct filename with date', () => {
      const boards = [mockBoard];
      const link = { href: '', download: '', click: vi.fn() };
      mockDocument.createElement = vi.fn(() => link);

      exportData(boards);

      const today = new Date().toISOString().slice(0, 10);
      expect(link.download).toBe(`kanban-backup-${today}.json`);
    });

    it('should trigger download', () => {
      const boards = [mockBoard];
      const link = { href: '', download: '', click: vi.fn() };
      mockDocument.createElement = vi.fn(() => link);

      exportData(boards);

      expect(link.click).toHaveBeenCalled();
      expect(mockDocument.body.appendChild).toHaveBeenCalled();
      expect(mockDocument.body.removeChild).toHaveBeenCalled();
    });

    it('should revoke object URL after download', () => {
      const boards = [mockBoard];
      exportData(boards);

      expect(global.URL.revokeObjectURL).toHaveBeenCalled();
    });
  });

  describe('exportBoard', () => {
    it('should export single board', () => {
      const link = { href: '', download: '', click: vi.fn() };
      mockDocument.createElement = vi.fn(() => link);

      exportBoard(mockBoard);

      expect(link.click).toHaveBeenCalled();
    });

    it('should sanitize board title in filename', () => {
      const board = { ...mockBoard, title: 'Test Board!!!' };
      const link = { href: '', download: '', click: vi.fn() };
      mockDocument.createElement = vi.fn(() => link);

      exportBoard(board);

      const today = new Date().toISOString().slice(0, 10);
      expect(link.download).toBe(`kanban-Test-Board----${today}.json`);
    });

    it('should create export data with single board', () => {
      const blobSpy = vi.spyOn(global, 'Blob');

      exportBoard(mockBoard);

      const blobData = blobSpy.mock.calls[0][0][0] as string;
      const exportData = JSON.parse(blobData);

      expect(exportData.boards).toHaveLength(1);
      expect(exportData.boards[0].id).toBe('board-1');
    });
  });

  describe('validateImportData', () => {
    it('should validate correct export data', () => {
      const validData: ExportData = {
        version: '1.0.0',
        exportedAt: new Date().toISOString(),
        boards: [mockBoard],
      };

      const result = validateImportData(validData);

      expect(result.version).toBe('1.0.0');
      expect(result.boards).toHaveLength(1);
    });

    it('should throw error for invalid data type', () => {
      expect(() => validateImportData(null)).toThrow('無効なファイル形式です');
      expect(() => validateImportData('string')).toThrow(
        '無効なファイル形式です'
      );
      expect(() => validateImportData(123)).toThrow('無効なファイル形式です');
    });

    it('should throw error for missing required fields', () => {
      const invalidData = {
        boards: [],
      };

      expect(() => validateImportData(invalidData)).toThrow(
        '必要なフィールドが不足しています'
      );
    });

    it('should throw error for invalid boards array', () => {
      const invalidData = {
        version: '1.0.0',
        exportedAt: new Date().toISOString(),
        boards: 'not-an-array',
      };

      expect(() => validateImportData(invalidData)).toThrow(
        '必要なフィールドが不足しています'
      );
    });

    it('should throw error for invalid board structure', () => {
      const invalidData = {
        version: '1.0.0',
        exportedAt: new Date().toISOString(),
        boards: [
          {
            id: 'board-1',
            // missing title and columns
          },
        ],
      };

      expect(() => validateImportData(invalidData)).toThrow(
        'ボードデータの構造が無効です'
      );
    });

    it('should throw error for invalid column structure', () => {
      const invalidData = {
        version: '1.0.0',
        exportedAt: new Date().toISOString(),
        boards: [
          {
            id: 'board-1',
            title: 'Board',
            columns: [
              {
                id: 'col-1',
                // missing title and tasks
              },
            ],
          },
        ],
      };

      expect(() => validateImportData(invalidData)).toThrow(
        'カラムデータの構造が無効です'
      );
    });

    it('should throw error for invalid task structure', () => {
      const invalidData = {
        version: '1.0.0',
        exportedAt: new Date().toISOString(),
        boards: [
          {
            id: 'board-1',
            title: 'Board',
            columns: [
              {
                id: 'col-1',
                title: 'Column',
                tasks: [
                  {
                    id: 'task-1',
                    // missing title
                  },
                ],
              },
            ],
          },
        ],
      };

      expect(() => validateImportData(invalidData)).toThrow(
        'タスクデータの構造が無効です'
      );
    });

    it('should convert date strings to Date objects', () => {
      const validData = {
        version: '1.0.0',
        exportedAt: '2024-01-01T00:00:00Z',
        boards: [
          {
            id: 'board-1',
            title: 'Board',
            createdAt: '2024-01-01T00:00:00Z',
            updatedAt: '2024-01-01T00:00:00Z',
            columns: [
              {
                id: 'col-1',
                title: 'Column',
                tasks: [
                  {
                    id: 'task-1',
                    title: 'Task',
                    createdAt: '2024-01-01T00:00:00Z',
                    updatedAt: '2024-01-01T00:00:00Z',
                    dueDate: '2024-01-15T00:00:00Z',
                  },
                ],
              },
            ],
          },
        ],
      };

      const result = validateImportData(validData);

      expect(result.boards[0].createdAt).toBeInstanceOf(Date);
      expect(result.boards[0].updatedAt).toBeInstanceOf(Date);
      expect(result.boards[0].columns[0].tasks[0].createdAt).toBeInstanceOf(
        Date
      );
      expect(result.boards[0].columns[0].tasks[0].dueDate).toBeInstanceOf(Date);
    });

    it('should convert subtask dates', () => {
      const validData = {
        version: '1.0.0',
        exportedAt: '2024-01-01T00:00:00Z',
        boards: [
          {
            id: 'board-1',
            title: 'Board',
            columns: [
              {
                id: 'col-1',
                title: 'Column',
                tasks: [
                  {
                    id: 'task-1',
                    title: 'Task',
                    subTasks: [
                      {
                        id: 'subtask-1',
                        title: 'Subtask',
                        createdAt: '2024-01-01T00:00:00Z',
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      };

      const result = validateImportData(validData);

      expect(
        result.boards[0].columns[0].tasks[0].subTasks[0].createdAt
      ).toBeInstanceOf(Date);
    });

    it('should convert attachment dates', () => {
      const validData = {
        version: '1.0.0',
        exportedAt: '2024-01-01T00:00:00Z',
        boards: [
          {
            id: 'board-1',
            title: 'Board',
            columns: [
              {
                id: 'col-1',
                title: 'Column',
                tasks: [
                  {
                    id: 'task-1',
                    title: 'Task',
                    attachments: [
                      {
                        id: 'attach-1',
                        name: 'file.pdf',
                        uploadedAt: '2024-01-01T00:00:00Z',
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      };

      const result = validateImportData(validData);

      expect(
        result.boards[0].columns[0].tasks[0].attachments[0].uploadedAt
      ).toBeInstanceOf(Date);
    });
  });

  describe('readFileAsText', () => {
    it('should read file as text', async () => {
      const fileContent = 'test file content';
      const mockFile = new File([fileContent], 'test.json', {
        type: 'application/json',
      });

      // Mock FileReader
      class MockFileReader {
        result: string | null = null;
        onload: ((event: any) => void) | null = null;
        onerror: ((event: any) => void) | null = null;

        readAsText(_file: File) {
          setTimeout(() => {
            this.result = fileContent;
            if (this.onload) {
              this.onload({ target: this });
            }
          }, 0);
        }
      }

      global.FileReader = MockFileReader as any;

      const result = await readFileAsText(mockFile);
      expect(result).toBe(fileContent);
    });

    it('should reject on read error', async () => {
      const mockFile = new File(['content'], 'test.json');

      class MockFileReader {
        onload: ((event: any) => void) | null = null;
        onerror: ((event: any) => void) | null = null;

        readAsText(_file: File) {
          setTimeout(() => {
            if (this.onerror) {
              this.onerror({});
            }
          }, 0);
        }
      }

      global.FileReader = MockFileReader as any;

      await expect(readFileAsText(mockFile)).rejects.toThrow(
        'ファイルの読み込みに失敗しました'
      );
    });

    it('should reject when result is not a string', async () => {
      const mockFile = new File(['content'], 'test.json');

      class MockFileReader {
        result: any = new ArrayBuffer(8);
        onload: ((event: any) => void) | null = null;
        onerror: ((event: any) => void) | null = null;

        readAsText(_file: File) {
          setTimeout(() => {
            if (this.onload) {
              this.onload({ target: this });
            }
          }, 0);
        }
      }

      global.FileReader = MockFileReader as any;

      await expect(readFileAsText(mockFile)).rejects.toThrow(
        'ファイルの読み込みに失敗しました'
      );
    });
  });
});
