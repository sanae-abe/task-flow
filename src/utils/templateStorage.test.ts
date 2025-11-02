/**
 * Template Storage tests
 * テンプレートストレージの包括的テスト
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  TemplateStorage,
  TemplateStorageError,
  type TemplateStorageSchema,
} from './templateStorage';
import type { TaskTemplate, TemplateFormData } from '../types/template';

// Mock logger
vi.mock('./logger', () => ({
  logger: {
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    _error: vi.fn(),
  },
}));

// Mock uuid
vi.mock('uuid', () => ({
  v4: () => `test-uuid-${Date.now()}`,
}));

describe('Template Storage', () => {
  let mockLocalStorage: { [key: string]: string };

  beforeEach(() => {
    // Mock localStorage
    mockLocalStorage = {};
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: vi.fn((key: string) => mockLocalStorage[key] || null),
        setItem: vi.fn((key: string, value: string) => {
          mockLocalStorage[key] = value;
        }),
        removeItem: vi.fn((key: string) => {
          delete mockLocalStorage[key];
        }),
        clear: vi.fn(() => {
          mockLocalStorage = {};
        }),
      },
      writable: true,
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('load', () => {
    it('should return empty array when no data stored', () => {
      const templates = TemplateStorage.load();
      expect(templates).toEqual([]);
    });

    it('should load valid templates', () => {
      const mockData: TemplateStorageSchema = {
        version: '1.0.0',
        templates: [
          {
            id: 'template-1',
            name: 'Test Template',
            description: 'Test Description',
            category: 'work',
            taskTitle: 'Task Title',
            taskDescription: 'Task Description',
            labels: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            usageCount: 0,
            isFavorite: false,
          },
        ],
        updatedAt: new Date().toISOString(),
      };

      mockLocalStorage['taskflow-templates'] = JSON.stringify(mockData);

      const templates = TemplateStorage.load();
      expect(templates).toHaveLength(1);
      expect(templates[0].id).toBe('template-1');
    });

    it('should throw error when localStorage is unavailable', () => {
      Object.defineProperty(window, 'localStorage', {
        value: {
          getItem: () => {
            throw new Error('Storage unavailable');
          },
          setItem: () => {
            throw new Error('Storage unavailable');
          },
        },
        writable: true,
      });

      expect(() => TemplateStorage.load()).toThrow(TemplateStorageError);
      expect(() => TemplateStorage.load()).toThrow(
        'LocalStorageが利用できません'
      );
    });

    it('should reset storage when data is invalid', () => {
      mockLocalStorage['taskflow-templates'] = JSON.stringify({
        invalid: 'data',
      });

      const templates = TemplateStorage.load();
      expect(templates).toEqual([]);
    });

    it('should throw error when JSON parse fails', () => {
      mockLocalStorage['taskflow-templates'] = 'invalid json';

      expect(() => TemplateStorage.load()).toThrow(TemplateStorageError);
      expect(() => TemplateStorage.load()).toThrow('解析に失敗');
    });
  });

  describe('save', () => {
    it('should save templates to localStorage', () => {
      const templates: TaskTemplate[] = [
        {
          id: 'template-1',
          name: 'Test Template',
          description: 'Test Description',
          category: 'work',
          taskTitle: 'Task Title',
          taskDescription: 'Task Description',
          labels: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          usageCount: 0,
          isFavorite: false,
        },
      ];

      TemplateStorage.save(templates);

      const stored = mockLocalStorage['taskflow-templates'];
      expect(stored).toBeTruthy();

      const parsed = JSON.parse(stored);
      expect(parsed.templates).toHaveLength(1);
      expect(parsed.version).toBe('1.0.0');
    });

    it('should throw error for invalid templates', () => {
      const invalidTemplates = [
        {
          id: 'invalid',
          // missing required fields
        },
      ] as unknown as TaskTemplate[];

      expect(() => TemplateStorage.save(invalidTemplates)).toThrow(
        TemplateStorageError
      );
    });

    it('should throw error when localStorage is unavailable', () => {
      // isStorageAvailable()がsetItem/removeItemを試すため、
      // QuotaExceededErrorが発生すると「LocalStorageが利用できません」エラーになる
      Object.defineProperty(window, 'localStorage', {
        value: {
          getItem: vi.fn(() => null),
          setItem: vi.fn(() => {
            const error = new Error('QuotaExceededError');
            error.name = 'QuotaExceededError';
            throw error;
          }),
          removeItem: vi.fn(),
          clear: vi.fn(),
          key: vi.fn(),
          length: 0,
        },
        writable: true,
        configurable: true,
      });

      const templates: TaskTemplate[] = [
        {
          id: 'template-1',
          name: 'Test',
          description: '',
          category: 'work',
          taskTitle: '',
          taskDescription: '',
          labels: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          usageCount: 0,
          isFavorite: false,
        },
      ];

      expect(() => TemplateStorage.save(templates)).toThrow(
        TemplateStorageError
      );
      // isStorageAvailable()チェックで失敗するため
      expect(() => TemplateStorage.save(templates)).toThrow('LocalStorageが利用できません');
    });
  });

  describe('create', () => {
    it('should create a new template', () => {
      const formData: TemplateFormData = {
        name: 'New Template',
        description: 'Description',
        category: 'work',
        taskTitle: 'Task',
        taskDescription: 'Task Desc',
        labels: [],
        isFavorite: false,
      };

      const template = TemplateStorage.create(formData);

      expect(template.id).toBeTruthy();
      expect(template.name).toBe('New Template');
      expect(template.usageCount).toBe(0);
      expect(template.createdAt).toBeTruthy();
      expect(template.updatedAt).toBeTruthy();
    });

    it('should add template to storage', () => {
      const formData: TemplateFormData = {
        name: 'New Template',
        description: '',
        category: 'personal',
        taskTitle: '',
        taskDescription: '',
        labels: [],
        isFavorite: false,
      };

      TemplateStorage.create(formData);
      const templates = TemplateStorage.load();

      expect(templates).toHaveLength(1);
      expect(templates[0].name).toBe('New Template');
    });
  });

  describe('update', () => {
    it('should update existing template', () => {
      const template = TemplateStorage.create({
        name: 'Original',
        description: '',
        category: 'work',
        taskTitle: '',
        taskDescription: '',
        labels: [],
        isFavorite: false,
      });

      const updated = TemplateStorage.update(template.id, {
        name: 'Updated',
        description: 'New Description',
      });

      expect(updated).not.toBeNull();
      expect(updated!.name).toBe('Updated');
      expect(updated!.description).toBe('New Description');
    });

    it('should return null for non-existent template', () => {
      const result = TemplateStorage.update('non-existent', {
        name: 'Updated',
      });

      expect(result).toBeNull();
    });
  });

  describe('delete', () => {
    it('should delete existing template', () => {
      const template = TemplateStorage.create({
        name: 'To Delete',
        description: '',
        category: 'work',
        taskTitle: '',
        taskDescription: '',
        labels: [],
        isFavorite: false,
      });

      const result = TemplateStorage.delete(template.id);

      expect(result).toBe(true);

      const templates = TemplateStorage.load();
      expect(templates).toHaveLength(0);
    });

    it('should return false for non-existent template', () => {
      const result = TemplateStorage.delete('non-existent');
      expect(result).toBe(false);
    });
  });

  describe('incrementUsage', () => {
    it('should increment usage count', () => {
      const template = TemplateStorage.create({
        name: 'Template',
        description: '',
        category: 'work',
        taskTitle: '',
        taskDescription: '',
        labels: [],
        isFavorite: false,
      });

      TemplateStorage.incrementUsage(template.id);

      const templates = TemplateStorage.load();
      expect(templates[0].usageCount).toBe(1);

      TemplateStorage.incrementUsage(template.id);
      const templatesAfter = TemplateStorage.load();
      expect(templatesAfter[0].usageCount).toBe(2);
    });

    it('should handle non-existent template', () => {
      expect(() => {
        TemplateStorage.incrementUsage('non-existent');
      }).not.toThrow();
    });
  });

  describe('toggleFavorite', () => {
    it('should toggle favorite status', () => {
      const template = TemplateStorage.create({
        name: 'Template',
        description: '',
        category: 'work',
        taskTitle: '',
        taskDescription: '',
        labels: [],
        isFavorite: false,
      });

      const result1 = TemplateStorage.toggleFavorite(template.id);
      expect(result1).toBe(true);

      const templates1 = TemplateStorage.load();
      expect(templates1[0].isFavorite).toBe(true);

      const result2 = TemplateStorage.toggleFavorite(template.id);
      expect(result2).toBe(false);

      const templates2 = TemplateStorage.load();
      expect(templates2[0].isFavorite).toBe(false);
    });

    it('should return false for non-existent template', () => {
      const result = TemplateStorage.toggleFavorite('non-existent');
      expect(result).toBe(false);
    });
  });

  describe('clear', () => {
    it('should clear all templates', () => {
      TemplateStorage.create({
        name: 'Template 1',
        description: '',
        category: 'work',
        taskTitle: '',
        taskDescription: '',
        labels: [],
        isFavorite: false,
      });

      TemplateStorage.clear();

      const templates = TemplateStorage.load();
      expect(templates).toHaveLength(0);
    });
  });

  describe('export', () => {
    it('should export all templates', () => {
      TemplateStorage.create({
        name: 'Template 1',
        description: '',
        category: 'work',
        taskTitle: '',
        taskDescription: '',
        labels: [],
        isFavorite: false,
      });

      const exported = TemplateStorage.export();

      expect(exported.version).toBe('1.0.0');
      expect(exported.templates).toHaveLength(1);
      expect(exported.updatedAt).toBeTruthy();
    });
  });

  describe('import', () => {
    it('should import templates with replaceAll option', () => {
      TemplateStorage.create({
        name: 'Existing',
        description: '',
        category: 'work',
        taskTitle: '',
        taskDescription: '',
        labels: [],
        isFavorite: false,
      });

      const importData: TemplateStorageSchema = {
        version: '1.0.0',
        templates: [
          {
            id: 'import-1',
            name: 'Imported',
            description: '',
            category: 'personal',
            taskTitle: '',
            taskDescription: '',
            labels: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            usageCount: 0,
            isFavorite: false,
          },
        ],
        updatedAt: new Date().toISOString(),
      };

      TemplateStorage.import(importData, { replaceAll: true });

      const templates = TemplateStorage.load();
      expect(templates).toHaveLength(1);
      expect(templates[0].name).toBe('Imported');
    });

    it('should import templates with merge option', () => {
      const existing = TemplateStorage.create({
        name: 'Existing',
        description: '',
        category: 'work',
        taskTitle: '',
        taskDescription: '',
        labels: [],
        isFavorite: false,
      });

      const importData: TemplateStorageSchema = {
        version: '1.0.0',
        templates: [
          {
            id: 'different-id',
            name: 'Imported',
            description: '',
            category: 'personal',
            taskTitle: '',
            taskDescription: '',
            labels: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            usageCount: 0,
            isFavorite: false,
          },
        ],
        updatedAt: new Date().toISOString(),
      };

      TemplateStorage.import(importData, { merge: true });

      const templates = TemplateStorage.load();
      expect(templates).toHaveLength(2);
    });

    it('should handle duplicate IDs in merge mode', () => {
      const existing = TemplateStorage.create({
        name: 'Existing',
        description: '',
        category: 'work',
        taskTitle: '',
        taskDescription: '',
        labels: [],
        isFavorite: false,
      });

      const importData: TemplateStorageSchema = {
        version: '1.0.0',
        templates: [
          {
            id: existing.id,
            name: 'Duplicate ID',
            description: '',
            category: 'personal',
            taskTitle: '',
            taskDescription: '',
            labels: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            usageCount: 0,
            isFavorite: false,
          },
        ],
        updatedAt: new Date().toISOString(),
      };

      TemplateStorage.import(importData, { merge: true });

      const templates = TemplateStorage.load();
      expect(templates).toHaveLength(2);
      expect(templates[1].name).toContain('(インポート)');
    });

    it('should throw error for invalid import data', () => {
      const invalidData = { invalid: 'data' };

      expect(() => TemplateStorage.import(invalidData)).toThrow(
        TemplateStorageError
      );
    });
  });

  describe('getStorageSize', () => {
    it('should return storage size in bytes', () => {
      TemplateStorage.create({
        name: 'Template',
        description: '',
        category: 'work',
        taskTitle: '',
        taskDescription: '',
        labels: [],
        isFavorite: false,
      });

      const size = TemplateStorage.getStorageSize();
      expect(size).toBeGreaterThan(0);
    });

    it('should return 0 when no data', () => {
      const size = TemplateStorage.getStorageSize();
      expect(size).toBe(0);
    });
  });

  describe('getStorageInfo', () => {
    it('should return storage information', () => {
      TemplateStorage.create({
        name: 'Template 1',
        description: '',
        category: 'work',
        taskTitle: '',
        taskDescription: '',
        labels: [],
        isFavorite: false,
      });

      const info = TemplateStorage.getStorageInfo();

      expect(info.templatesCount).toBe(1);
      expect(info.version).toBe('1.0.0');
      expect(info.storageSize).toBeGreaterThan(0);
      expect(info.lastUpdated).toBeTruthy();
    });

    it('should return default values when no data', () => {
      const info = TemplateStorage.getStorageInfo();

      expect(info.templatesCount).toBe(0);
      expect(info.storageSize).toBe(0);
      expect(info.lastUpdated).toBeNull();
    });
  });
});
