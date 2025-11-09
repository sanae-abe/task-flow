/**
 * Template Tools Test Suite
 * Week 5 Day 33-34: Template management tools
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  handleCreateTemplate,
  handleListTemplates,
  handleCreateTaskFromTemplate,
  handleUpdateTemplate,
  handleDeleteTemplate,
} from '../tools/template-tools.js';
import { db } from '../../utils/indexeddb.js';

describe('Template Tools', () => {
  let testBoardId: string;
  let testColumnId: string;
  let testTemplateId: string;

  beforeEach(async () => {
    // Create test board
    const board = await db.addBoard({
      id: crypto.randomUUID(),
      name: 'Test Board',
      columns: [
        { id: crypto.randomUUID(), name: 'To Do', position: 0 },
        { id: crypto.randomUUID(), name: 'In Progress', position: 1 },
      ],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
    testBoardId = board.id;
    testColumnId = board.columns[0].id;

    // Create test template
    const template = await db.addTemplate({
      id: crypto.randomUUID(),
      name: 'Bug Fix Template',
      description: 'Standard bug fix workflow',
      category: 'Development',
      isFavorite: false,
      taskData: {
        title: 'Fix: [Bug Description]',
        priority: 'HIGH',
        subtasks: [
          {
            id: crypto.randomUUID(),
            title: 'Reproduce bug',
            completed: false,
            position: 0,
          },
          {
            id: crypto.randomUUID(),
            title: 'Fix issue',
            completed: false,
            position: 1,
          },
          {
            id: crypto.randomUUID(),
            title: 'Add test',
            completed: false,
            position: 2,
          },
        ],
      },
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
    testTemplateId = template.id;
  });

  describe('create_template', () => {
    it('should create a new template', async () => {
      const result = await handleCreateTemplate({
        name: 'Feature Template',
        description: 'New feature development',
        category: 'Development',
        isFavorite: true,
        taskData: {
          title: 'Feature: [Name]',
          priority: 'MEDIUM',
          estimatedHours: 8,
        },
      });

      expect(result.content).toBeDefined();
      const data = JSON.parse(result.content[0].text);
      expect(data.success).toBe(true);
      expect(data.template.name).toBe('Feature Template');
      expect(data.template.category).toBe('Development');
      expect(data.template.isFavorite).toBe(true);
      expect(data.template.id).toBeDefined();
    });

    it('should create template without optional fields', async () => {
      const result = await handleCreateTemplate({
        name: 'Simple Template',
        taskData: {
          title: 'Simple Task',
        },
      });

      const data = JSON.parse(result.content[0].text);
      expect(data.success).toBe(true);
      expect(data.template.name).toBe('Simple Template');
    });

    it('should handle complex task data', async () => {
      const result = await handleCreateTemplate({
        name: 'Complex Template',
        taskData: {
          title: 'Complex Task',
          description: 'Detailed description',
          priority: 'CRITICAL',
          estimatedHours: 16,
          labels: ['urgent', 'backend'],
          subtasks: [
            {
              id: crypto.randomUUID(),
              title: 'Step 1',
              completed: false,
              position: 0,
            },
            {
              id: crypto.randomUUID(),
              title: 'Step 2',
              completed: false,
              position: 1,
            },
          ],
        },
      });

      const data = JSON.parse(result.content[0].text);
      expect(data.success).toBe(true);
    });
  });

  describe('list_templates', () => {
    it('should list all templates', async () => {
      const result = await handleListTemplates({});

      expect(result.content).toBeDefined();
      const data = JSON.parse(result.content[0].text);
      expect(data.success).toBe(true);
      expect(data.count).toBeGreaterThan(0);
      expect(data.templates).toBeInstanceOf(Array);
    });

    it('should filter by category', async () => {
      await handleCreateTemplate({
        name: 'Marketing Template',
        category: 'Marketing',
        taskData: { title: 'Marketing Task' },
      });

      const result = await handleListTemplates({
        category: 'Marketing',
      });

      const data = JSON.parse(result.content[0].text);
      expect(data.success).toBe(true);
      expect(data.filters.category).toBe('Marketing');
      expect(data.templates.every((t: any) => t.category === 'Marketing')).toBe(
        true
      );
    });

    it('should filter by favorite status', async () => {
      await handleCreateTemplate({
        name: 'Favorite Template',
        isFavorite: true,
        taskData: { title: 'Favorite Task' },
      });

      const result = await handleListTemplates({
        isFavorite: true,
      });

      const data = JSON.parse(result.content[0].text);
      expect(data.success).toBe(true);
      expect(data.filters.isFavorite).toBe(true);
      expect(data.templates.every((t: any) => t.isFavorite === true)).toBe(
        true
      );
    });
  });

  describe('create_task_from_template', () => {
    it('should create task from template', async () => {
      const result = await handleCreateTaskFromTemplate({
        templateId: testTemplateId,
        boardId: testBoardId,
        columnId: testColumnId,
      });

      expect(result.content).toBeDefined();
      const data = JSON.parse(result.content[0].text);
      expect(data.success).toBe(true);
      expect(data.template.id).toBe(testTemplateId);
      expect(data.task).toBeDefined();
      expect(data.task.priority).toBe('HIGH');
    });

    it('should apply overrides to template data', async () => {
      const result = await handleCreateTaskFromTemplate({
        templateId: testTemplateId,
        boardId: testBoardId,
        columnId: testColumnId,
        overrides: {
          title: 'Custom Bug Title',
          priority: 'CRITICAL',
        },
      });

      const data = JSON.parse(result.content[0].text);
      expect(data.success).toBe(true);
      expect(data.task.title).toBe('Custom Bug Title');
      expect(data.task.priority).toBe('CRITICAL');
    });

    it('should handle non-existent template', async () => {
      const result = await handleCreateTaskFromTemplate({
        templateId: 'non-existent-id',
        boardId: testBoardId,
        columnId: testColumnId,
      });

      const data = JSON.parse(result.content[0].text);
      expect(data.success).toBe(false);
      expect(data.error).toContain('not found');
    });

    it('should handle invalid board or column', async () => {
      const result = await handleCreateTaskFromTemplate({
        templateId: testTemplateId,
        boardId: 'invalid-board',
        columnId: 'invalid-column',
      });

      const data = JSON.parse(result.content[0].text);
      expect(data.success).toBe(false);
      expect(data.error).toContain('not found');
    });
  });

  describe('update_template', () => {
    it('should update template properties', async () => {
      const result = await handleUpdateTemplate({
        id: testTemplateId,
        name: 'Updated Bug Fix Template',
        isFavorite: true,
      });

      expect(result.content).toBeDefined();
      const data = JSON.parse(result.content[0].text);
      expect(data.success).toBe(true);
      expect(data.template.name).toBe('Updated Bug Fix Template');
      expect(data.template.isFavorite).toBe(true);
    });

    it('should update task data', async () => {
      const result = await handleUpdateTemplate({
        id: testTemplateId,
        taskData: {
          title: 'New Template Title',
          priority: 'CRITICAL',
        },
      });

      const data = JSON.parse(result.content[0].text);
      expect(data.success).toBe(true);
    });

    it('should handle non-existent template', async () => {
      const result = await handleUpdateTemplate({
        id: 'non-existent-id',
        name: 'Updated',
      });

      const data = JSON.parse(result.content[0].text);
      expect(data.success).toBe(false);
      expect(data.error).toContain('not found');
    });
  });

  describe('delete_template', () => {
    it('should delete template', async () => {
      const result = await handleDeleteTemplate({
        id: testTemplateId,
      });

      expect(result.content).toBeDefined();
      const data = JSON.parse(result.content[0].text);
      expect(data.success).toBe(true);
      expect(data.deletedTemplate.id).toBe(testTemplateId);

      // Verify template is deleted
      const listResult = await handleListTemplates({});
      const listData = JSON.parse(listResult.content[0].text);
      expect(
        listData.templates.find((t: any) => t.id === testTemplateId)
      ).toBeUndefined();
    });

    it('should handle non-existent template', async () => {
      const result = await handleDeleteTemplate({
        id: 'non-existent-id',
      });

      const data = JSON.parse(result.content[0].text);
      expect(data.success).toBe(false);
      expect(data.error).toContain('not found');
    });
  });
});
