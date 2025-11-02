/**
 * dataStatistics utility tests
 * データ統計計算ユーティリティの包括的テスト
 */

import { describe, it, expect } from 'vitest';
import {
  calculateDataStatistics,
  calculateCurrentBoardStatistics,
  formatFileSize,
} from './dataStatistics';
import type { KanbanBoard } from '../types';

describe('dataStatistics', () => {
  const mockBoard: KanbanBoard = {
    id: 'board-1',
    title: 'Test Board',
    columns: [
      {
        id: 'col-1',
        title: 'To Do',
        tasks: [
          {
            id: 'task-1',
            title: 'Task 1',
            description: '',
            status: 'todo',
            priority: 'medium',
            labels: [{ id: 'label-1', name: 'Bug', color: '#ff0000' }],
            subTasks: [],
            createdAt: '2025-01-01T00:00:00.000Z',
            updatedAt: '2025-01-01T00:00:00.000Z',
            dueDate: null,
            completedAt: null,
            files: [
              {
                id: 'file-1',
                name: 'test.txt',
                size: 100,
                type: 'text/plain',
                url: 'blob:test',
              },
            ],
          } as any,
          {
            id: 'task-2',
            title: 'Task 2',
            description: '',
            status: 'todo',
            priority: 'high',
            labels: [{ id: 'label-2', name: 'Feature', color: '#00ff00' }],
            subTasks: [],
            createdAt: '2025-01-01T00:00:00.000Z',
            updatedAt: '2025-01-01T00:00:00.000Z',
            dueDate: null,
            completedAt: null,
          } as any,
        ],
        color: '#6b7280',
        deletionState: 'active',
        deletedAt: null,
      },
      {
        id: 'col-2',
        title: 'Done',
        tasks: [
          {
            id: 'task-3',
            title: 'Task 3',
            description: '',
            status: 'done',
            priority: 'low',
            labels: [{ id: 'label-1', name: 'Bug', color: '#ff0000' }],
            subTasks: [],
            createdAt: '2025-01-01T00:00:00.000Z',
            updatedAt: '2025-01-01T00:00:00.000Z',
            dueDate: null,
            completedAt: '2025-01-02T00:00:00.000Z',
            files: [
              {
                id: 'file-2',
                name: 'image.png',
                size: 200,
                type: 'image/png',
                url: 'blob:image',
              },
              {
                id: 'file-3',
                name: 'doc.pdf',
                size: 300,
                type: 'application/pdf',
                url: 'blob:doc',
              },
            ],
          } as any,
        ],
        color: '#10b981',
        deletionState: 'active',
        deletedAt: null,
      },
    ],
    labels: [],
    createdAt: '2025-01-01T00:00:00.000Z',
    updatedAt: '2025-01-01T00:00:00.000Z',
    deletionState: 'active',
    deletedAt: null,
  };

  const mockLabels = [
    { id: 'label-1', name: 'Bug', color: '#ff0000' },
    { id: 'label-2', name: 'Feature', color: '#00ff00' },
    { id: 'label-3', name: 'Enhancement', color: '#0000ff' },
  ];

  describe('calculateDataStatistics', () => {
    it('should calculate statistics for single board', () => {
      const stats = calculateDataStatistics([mockBoard], mockLabels);

      expect(stats.boardCount).toBe(1);
      expect(stats.taskCount).toBe(3);
      expect(stats.labelCount).toBe(3);
      expect(stats.attachmentCount).toBe(3);
      expect(stats.estimatedSize).toBeGreaterThan(0);
    });

    it('should calculate statistics for multiple boards', () => {
      const board2: KanbanBoard = {
        ...mockBoard,
        id: 'board-2',
        columns: [
          {
            ...mockBoard.columns[0],
            tasks: [mockBoard.columns[0].tasks[0]],
          },
        ],
      };

      const stats = calculateDataStatistics([mockBoard, board2], mockLabels);

      expect(stats.boardCount).toBe(2);
      expect(stats.taskCount).toBe(4); // 3 from board1, 1 from board2
      expect(stats.labelCount).toBe(3);
    });

    it('should handle empty boards array', () => {
      const stats = calculateDataStatistics([], mockLabels);

      expect(stats.boardCount).toBe(0);
      expect(stats.taskCount).toBe(0);
      expect(stats.labelCount).toBe(3);
      expect(stats.attachmentCount).toBe(0);
      expect(stats.estimatedSize).toBeGreaterThan(0);
    });

    it('should handle boards with no tasks', () => {
      const emptyBoard: KanbanBoard = {
        ...mockBoard,
        columns: [
          {
            ...mockBoard.columns[0],
            tasks: [],
          },
        ],
      };

      const stats = calculateDataStatistics([emptyBoard], []);

      expect(stats.boardCount).toBe(1);
      expect(stats.taskCount).toBe(0);
      expect(stats.labelCount).toBe(0);
      expect(stats.attachmentCount).toBe(0);
    });

    it('should count tasks without files', () => {
      const boardNoFiles: KanbanBoard = {
        ...mockBoard,
        columns: [
          {
            ...mockBoard.columns[0],
            tasks: [
              {
                ...mockBoard.columns[0].tasks[1],
                files: undefined,
              } as any,
            ],
          },
        ],
      };

      const stats = calculateDataStatistics([boardNoFiles], []);

      expect(stats.taskCount).toBe(1);
      expect(stats.attachmentCount).toBe(0);
    });

    it('should calculate estimated size correctly', () => {
      const stats = calculateDataStatistics([mockBoard], mockLabels);

      expect(typeof stats.estimatedSize).toBe('number');
      expect(stats.estimatedSize).toBeGreaterThan(0);

      // Size should increase with more data
      const stats2 = calculateDataStatistics([mockBoard, mockBoard], mockLabels);
      expect(stats2.estimatedSize).toBeGreaterThan(stats.estimatedSize);
    });

    it('should handle empty labels array', () => {
      const stats = calculateDataStatistics([mockBoard], []);

      expect(stats.labelCount).toBe(0);
    });
  });

  describe('calculateCurrentBoardStatistics', () => {
    it('should calculate statistics for single board', () => {
      const stats = calculateCurrentBoardStatistics(mockBoard);

      expect(stats.boardCount).toBe(1);
      expect(stats.taskCount).toBe(3);
      expect(stats.labelCount).toBe(2); // label-1 and label-2
      expect(stats.attachmentCount).toBe(3);
      expect(stats.estimatedSize).toBeGreaterThan(0);
    });

    it('should handle null board', () => {
      const stats = calculateCurrentBoardStatistics(null);

      expect(stats.boardCount).toBe(1);
      expect(stats.taskCount).toBe(0);
      expect(stats.labelCount).toBe(0);
      expect(stats.attachmentCount).toBe(0);
      expect(stats.estimatedSize).toBe(0);
    });

    it('should count unique labels only', () => {
      const stats = calculateCurrentBoardStatistics(mockBoard);

      // task-1 has label-1, task-2 has label-2, task-3 has label-1
      // So unique labels = 2 (label-1, label-2)
      expect(stats.labelCount).toBe(2);
    });

    it('should handle board with no labels', () => {
      const boardNoLabels: KanbanBoard = {
        ...mockBoard,
        columns: [
          {
            ...mockBoard.columns[0],
            tasks: [
              {
                ...mockBoard.columns[0].tasks[0],
                labels: [],
              } as any,
            ],
          },
        ],
      };

      const stats = calculateCurrentBoardStatistics(boardNoLabels);

      expect(stats.labelCount).toBe(0);
    });

    it('should handle board with undefined labels', () => {
      const boardUndefinedLabels: KanbanBoard = {
        ...mockBoard,
        columns: [
          {
            ...mockBoard.columns[0],
            tasks: [
              {
                ...mockBoard.columns[0].tasks[0],
                labels: undefined,
              } as any,
            ],
          },
        ],
      };

      const stats = calculateCurrentBoardStatistics(boardUndefinedLabels);

      expect(stats.labelCount).toBe(0);
    });

    it('should always return boardCount as 1', () => {
      const stats1 = calculateCurrentBoardStatistics(mockBoard);
      const stats2 = calculateCurrentBoardStatistics(null);

      expect(stats1.boardCount).toBe(1);
      expect(stats2.boardCount).toBe(1);
    });

    it('should handle tasks without files', () => {
      const boardNoFiles: KanbanBoard = {
        ...mockBoard,
        columns: [
          {
            ...mockBoard.columns[0],
            tasks: [
              {
                ...mockBoard.columns[0].tasks[0],
                files: undefined,
              } as any,
            ],
          },
        ],
      };

      const stats = calculateCurrentBoardStatistics(boardNoFiles);

      expect(stats.attachmentCount).toBe(0);
    });

    it('should calculate size for complex board', () => {
      const stats = calculateCurrentBoardStatistics(mockBoard);

      expect(stats.estimatedSize).toBeGreaterThan(0);
      expect(typeof stats.estimatedSize).toBe('number');
    });
  });

  describe('formatFileSize', () => {
    it('should format 0 bytes', () => {
      expect(formatFileSize(0)).toBe('0 B');
    });

    it('should format bytes (< 1KB)', () => {
      expect(formatFileSize(100)).toBe('100.0 B');
      expect(formatFileSize(500)).toBe('500.0 B');
      expect(formatFileSize(1023)).toBe('1023.0 B');
    });

    it('should format kilobytes', () => {
      expect(formatFileSize(1024)).toBe('1.0 KB');
      expect(formatFileSize(1536)).toBe('1.5 KB');
      expect(formatFileSize(2048)).toBe('2.0 KB');
    });

    it('should format megabytes', () => {
      expect(formatFileSize(1024 * 1024)).toBe('1.0 MB');
      expect(formatFileSize(1024 * 1024 * 1.5)).toBe('1.5 MB');
      expect(formatFileSize(1024 * 1024 * 5)).toBe('5.0 MB');
    });

    it('should format gigabytes', () => {
      expect(formatFileSize(1024 * 1024 * 1024)).toBe('1.0 GB');
      expect(formatFileSize(1024 * 1024 * 1024 * 2.5)).toBe('2.5 GB');
    });

    it('should round to 1 decimal place', () => {
      expect(formatFileSize(1234)).toBe('1.2 KB');
      expect(formatFileSize(1567)).toBe('1.5 KB');
    });

    it('should handle exact boundaries', () => {
      expect(formatFileSize(1024)).toBe('1.0 KB');
      expect(formatFileSize(1024 * 1024)).toBe('1.0 MB');
      expect(formatFileSize(1024 * 1024 * 1024)).toBe('1.0 GB');
    });
  });

  describe('Integration scenarios', () => {
    it('should provide consistent statistics between functions', () => {
      const allStats = calculateDataStatistics([mockBoard], mockLabels);
      const currentStats = calculateCurrentBoardStatistics(mockBoard);

      expect(currentStats.taskCount).toBe(allStats.taskCount);
      expect(currentStats.attachmentCount).toBe(allStats.attachmentCount);
    });

    it('should format calculated size correctly', () => {
      const stats = calculateCurrentBoardStatistics(mockBoard);
      const formatted = formatFileSize(stats.estimatedSize);

      expect(formatted).toMatch(/\d+\.\d+ (B|KB|MB|GB)/);
    });

    it('should handle empty data gracefully', () => {
      const emptyStats = calculateDataStatistics([], []);
      const nullStats = calculateCurrentBoardStatistics(null);

      expect(emptyStats.taskCount).toBe(0);
      expect(nullStats.taskCount).toBe(0);
      expect(formatFileSize(emptyStats.estimatedSize)).toMatch(/\d+\.\d+ (B|KB)/);
      expect(formatFileSize(nullStats.estimatedSize)).toBe('0 B');
    });
  });
});
