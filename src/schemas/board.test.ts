/**
 * Board Schema tests
 * ボード関連スキーマの包括的テスト
 */

import { describe, it, expect } from 'vitest';
import {
  columnSchema,
  boardSchema,
  boardCreateInputSchema,
  boardUpdateInputSchema,
  columnCreateInputSchema,
  columnUpdateInputSchema,
} from './board';

describe('Board Schemas', () => {
  describe('columnSchema', () => {
    const validColumn = {
      id: 'col-1',
      title: 'To Do',
      tasks: [],
      color: '#6B7280',
    };

    it('should accept valid column', () => {
      const result = columnSchema.parse(validColumn);
      expect(result).toEqual(validColumn);
    });

    it('should accept column without color', () => {
      const { color, ...columnWithoutColor } = validColumn;
      expect(() => columnSchema.parse(columnWithoutColor)).not.toThrow();
    });

    it('should reject column with missing id', () => {
      expect(() => columnSchema.parse({ ...validColumn, id: '' })).toThrow();
    });

    it('should reject column with missing title', () => {
      expect(() => columnSchema.parse({ ...validColumn, title: '' })).toThrow();
    });

    it('should reject column with title too long', () => {
      expect(() =>
        columnSchema.parse({ ...validColumn, title: 'a'.repeat(101) })
      ).toThrow();
    });

    it('should accept column with valid color', () => {
      const validColors = ['#000000', '#FFFFFF', '#FF5733', '#00ff00'];
      validColors.forEach(color => {
        expect(() =>
          columnSchema.parse({ ...validColumn, color })
        ).not.toThrow();
      });
    });

    it('should reject column with invalid color', () => {
      const invalidColors = ['red', '#FFF', '#GGGGGG', 'rgb(255,0,0)'];
      invalidColors.forEach(color => {
        expect(() => columnSchema.parse({ ...validColumn, color })).toThrow();
      });
    });

    it('should accept column with tasks', () => {
      const columnWithTasks = {
        ...validColumn,
        tasks: [
          {
            id: 'task-1',
            title: 'Test Task',
            description: '',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            dueDate: null,
            completedAt: null,
            labels: [],
            subTasks: [],
            files: [],
          },
        ],
      };
      expect(() => columnSchema.parse(columnWithTasks)).not.toThrow();
    });

    it('should accept column with deletion state', () => {
      expect(() =>
        columnSchema.parse({
          ...validColumn,
          deletionState: 'deleted' as const,
          deletedAt: new Date().toISOString(),
        })
      ).not.toThrow();
    });
  });

  describe('boardSchema', () => {
    const validBoard = {
      id: 'board-1',
      title: 'My Board',
      columns: [],
      labels: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    it('should accept valid board', () => {
      const result = boardSchema.parse(validBoard);
      expect(result).toEqual(validBoard);
    });

    it('should reject board with missing id', () => {
      expect(() => boardSchema.parse({ ...validBoard, id: '' })).toThrow();
    });

    it('should reject board with missing title', () => {
      expect(() => boardSchema.parse({ ...validBoard, title: '' })).toThrow();
    });

    it('should reject board with title too long', () => {
      expect(() =>
        boardSchema.parse({ ...validBoard, title: 'a'.repeat(101) })
      ).toThrow();
    });

    it('should accept board with columns', () => {
      const boardWithColumns = {
        ...validBoard,
        columns: [
          {
            id: 'col-1',
            title: 'To Do',
            tasks: [],
            color: '#6B7280',
          },
          {
            id: 'col-2',
            title: 'In Progress',
            tasks: [],
            color: '#3B82F6',
          },
        ],
      };
      expect(() => boardSchema.parse(boardWithColumns)).not.toThrow();
    });

    it('should accept board with labels', () => {
      const boardWithLabels = {
        ...validBoard,
        labels: [
          { id: 'label-1', name: 'Bug', color: '#FF0000' },
          { id: 'label-2', name: 'Feature', color: '#00FF00' },
        ],
      };
      expect(() => boardSchema.parse(boardWithLabels)).not.toThrow();
    });

    it('should reject board with invalid label', () => {
      const boardWithInvalidLabel = {
        ...validBoard,
        labels: [
          { id: 'label-1', name: '', color: '#FF0000' }, // Empty name
        ],
      };
      expect(() => boardSchema.parse(boardWithInvalidLabel)).toThrow();
    });

    it('should accept board with deletion state', () => {
      expect(() =>
        boardSchema.parse({
          ...validBoard,
          deletionState: 'active' as const,
          deletedAt: null,
        })
      ).not.toThrow();
    });
  });

  describe('boardCreateInputSchema', () => {
    it('should accept valid board creation input', () => {
      const input = { title: 'New Board' };
      const result = boardCreateInputSchema.parse(input);
      expect(result.title).toBe('New Board');
    });

    it('should reject creation input with missing title', () => {
      expect(() => boardCreateInputSchema.parse({})).toThrow();
      expect(() => boardCreateInputSchema.parse({ title: '' })).toThrow();
    });

    it('should reject creation input with title too long', () => {
      expect(() =>
        boardCreateInputSchema.parse({ title: 'a'.repeat(101) })
      ).toThrow();
    });

    it('should accept creation input with maximum length title', () => {
      expect(() =>
        boardCreateInputSchema.parse({ title: 'a'.repeat(100) })
      ).not.toThrow();
    });
  });

  describe('boardUpdateInputSchema', () => {
    it('should require id field', () => {
      expect(() =>
        boardUpdateInputSchema.parse({ title: 'Updated Title' })
      ).toThrow();
    });

    it('should accept update with only id', () => {
      const update = { id: 'board-1' };
      const result = boardUpdateInputSchema.parse(update);
      expect(result.id).toBe('board-1');
    });

    it('should accept update with id and title', () => {
      const update = { id: 'board-1', title: 'Updated Title' };
      const result = boardUpdateInputSchema.parse(update);
      expect(result.id).toBe('board-1');
      expect(result.title).toBe('Updated Title');
    });

    it('should reject update with empty id', () => {
      expect(() =>
        boardUpdateInputSchema.parse({ id: '', title: 'Updated' })
      ).toThrow();
    });

    it('should reject update with invalid title', () => {
      expect(() =>
        boardUpdateInputSchema.parse({ id: 'board-1', title: '' })
      ).toThrow();
      expect(() =>
        boardUpdateInputSchema.parse({ id: 'board-1', title: 'a'.repeat(101) })
      ).toThrow();
    });
  });

  describe('columnCreateInputSchema', () => {
    it('should accept valid column creation input', () => {
      const input = { title: 'New Column' };
      const result = columnCreateInputSchema.parse(input);
      expect(result.title).toBe('New Column');
    });

    it('should accept column creation with color', () => {
      const input = { title: 'New Column', color: '#FF5733' };
      const result = columnCreateInputSchema.parse(input);
      expect(result.color).toBe('#FF5733');
    });

    it('should reject creation input with missing title', () => {
      expect(() => columnCreateInputSchema.parse({})).toThrow();
      expect(() => columnCreateInputSchema.parse({ title: '' })).toThrow();
    });

    it('should reject creation input with title too long', () => {
      expect(() =>
        columnCreateInputSchema.parse({ title: 'a'.repeat(101) })
      ).toThrow();
    });

    it('should reject creation input with invalid color', () => {
      expect(() =>
        columnCreateInputSchema.parse({ title: 'New Column', color: 'red' })
      ).toThrow();
    });
  });

  describe('columnUpdateInputSchema', () => {
    it('should require id field', () => {
      expect(() =>
        columnUpdateInputSchema.parse({ title: 'Updated Title' })
      ).toThrow();
    });

    it('should accept update with only id', () => {
      const update = { id: 'col-1' };
      const result = columnUpdateInputSchema.parse(update);
      expect(result.id).toBe('col-1');
    });

    it('should accept update with id and title', () => {
      const update = { id: 'col-1', title: 'Updated Title' };
      const result = columnUpdateInputSchema.parse(update);
      expect(result.id).toBe('col-1');
      expect(result.title).toBe('Updated Title');
    });

    it('should accept update with id and color', () => {
      const update = { id: 'col-1', color: '#00FF00' };
      const result = columnUpdateInputSchema.parse(update);
      expect(result.color).toBe('#00FF00');
    });

    it('should accept update with id, title, and color', () => {
      const update = { id: 'col-1', title: 'Updated Title', color: '#0000FF' };
      expect(() => columnUpdateInputSchema.parse(update)).not.toThrow();
    });

    it('should reject update with empty id', () => {
      expect(() =>
        columnUpdateInputSchema.parse({ id: '', title: 'Updated' })
      ).toThrow();
    });

    it('should reject update with invalid title', () => {
      expect(() =>
        columnUpdateInputSchema.parse({ id: 'col-1', title: '' })
      ).toThrow();
      expect(() =>
        columnUpdateInputSchema.parse({ id: 'col-1', title: 'a'.repeat(101) })
      ).toThrow();
    });

    it('should reject update with invalid color', () => {
      expect(() =>
        columnUpdateInputSchema.parse({ id: 'col-1', color: 'blue' })
      ).toThrow();
    });
  });
});
