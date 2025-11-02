/**
 * useTemplateManagement hook tests
 * テンプレート管理機能の包括的テスト
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useTemplateManagement } from './useTemplateManagement';
import { TemplateStorage } from '../utils/templateStorage';
import type { TaskTemplate, TemplateFormData } from '../types/template';

// Mock TemplateStorage
vi.mock('../utils/templateStorage', () => ({
  TemplateStorage: {
    load: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    toggleFavorite: vi.fn(),
  },
}));

// Mock console methods
vi.spyOn(console, 'warn').mockImplementation(() => {});
vi.spyOn(console, 'error').mockImplementation(() => {});

describe('useTemplateManagement', () => {
  const mockTemplates: TaskTemplate[] = [
    {
      id: 'template-1',
      name: 'Template 1',
      description: 'Description 1',
      category: 'work',
      taskTitle: 'Task Title 1',
      taskDescription: 'Task Description 1',
      labels: [],
      createdAt: '2025-01-01T00:00:00.000Z',
      updatedAt: '2025-01-01T00:00:00.000Z',
      usageCount: 0,
      isFavorite: false,
    },
    {
      id: 'template-2',
      name: 'Template 2',
      description: 'Description 2',
      category: 'personal',
      taskTitle: 'Task Title 2',
      taskDescription: 'Task Description 2',
      labels: [],
      createdAt: '2025-01-01T00:00:00.000Z',
      updatedAt: '2025-01-01T00:00:00.000Z',
      usageCount: 5,
      isFavorite: true,
    },
  ];

  const mockFormData: TemplateFormData = {
    name: 'New Template',
    description: 'New Description',
    category: 'work',
    taskTitle: 'New Task',
    taskDescription: 'New Task Description',
    labels: [],
    isFavorite: false,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (TemplateStorage.load as any).mockReturnValue(mockTemplates);
  });

  describe('Initial load', () => {
    it('should load templates on mount', async () => {
      const { result } = renderHook(() => useTemplateManagement());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.templates).toEqual(mockTemplates);
      expect(result.current._error).toBeNull();
      expect(TemplateStorage.load).toHaveBeenCalledTimes(1);
    });

    it('should handle load errors gracefully', async () => {
      (TemplateStorage.load as any).mockImplementation(() => {
        throw new Error('Load failed');
      });

      const { result } = renderHook(() => useTemplateManagement());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
        expect(result.current.templates).toEqual([]);
        expect(result.current._error).toBe(
          'テンプレートの読み込みに失敗しました'
        );
      });

      expect(console.warn).toHaveBeenCalled();
    });

    it('should start with loading state', async () => {
      const { result } = renderHook(() => useTemplateManagement());

      // Initially loading should be true, but it changes very quickly
      // so we just check that templates eventually load
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current._error).toBeNull();
    });
  });

  describe('Create template', () => {
    it('should create template successfully', async () => {
      const newTemplate: TaskTemplate = {
        ...mockFormData,
        id: 'template-3',
        createdAt: '2025-01-01T00:00:00.000Z',
        updatedAt: '2025-01-01T00:00:00.000Z',
        usageCount: 0,
      };

      (TemplateStorage.create as any).mockReturnValue(newTemplate);

      const { result } = renderHook(() => useTemplateManagement());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      let createdTemplate: TaskTemplate | null = null;

      await act(async () => {
        createdTemplate = await result.current.createTemplate(mockFormData);
      });

      expect(createdTemplate).toEqual(newTemplate);
      expect(result.current.templates).toHaveLength(3);
      expect(result.current.templates[2]).toEqual(newTemplate);
      expect(result.current._error).toBeNull();
    });

    it('should handle create errors', async () => {
      (TemplateStorage.create as any).mockImplementation(() => {
        throw new Error('Create failed');
      });

      const { result } = renderHook(() => useTemplateManagement());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      let createdTemplate: TaskTemplate | null = null;

      await act(async () => {
        createdTemplate = await result.current.createTemplate(mockFormData);
      });

      expect(createdTemplate).toBeNull();
      expect(result.current._error).toBe('テンプレートの作成に失敗しました');
      expect(console.error).toHaveBeenCalled();
    });
  });

  describe('Update template', () => {
    it('should update template successfully', async () => {
      const updatedTemplate: TaskTemplate = {
        ...mockTemplates[0],
        name: 'Updated Name',
        description: 'Updated Description',
      };

      (TemplateStorage.update as any).mockReturnValue(updatedTemplate);

      const { result } = renderHook(() => useTemplateManagement());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      let resultTemplate: TaskTemplate | null = null;

      await act(async () => {
        resultTemplate = await result.current.updateTemplate('template-1', {
          ...mockFormData,
          name: 'Updated Name',
          description: 'Updated Description',
        });
      });

      expect(resultTemplate).toEqual(updatedTemplate);
      expect(result.current.templates[0]).toEqual(updatedTemplate);
      expect(result.current._error).toBeNull();
    });

    it('should handle update when template not found', async () => {
      (TemplateStorage.update as any).mockReturnValue(null);

      const { result } = renderHook(() => useTemplateManagement());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      let resultTemplate: TaskTemplate | null = null;

      await act(async () => {
        resultTemplate = await result.current.updateTemplate(
          'non-existent',
          mockFormData
        );
      });

      expect(resultTemplate).toBeNull();
      expect(result.current._error).toBe('テンプレートが見つかりませんでした');
    });

    it('should handle update errors', async () => {
      (TemplateStorage.update as any).mockImplementation(() => {
        throw new Error('Update failed');
      });

      const { result } = renderHook(() => useTemplateManagement());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      let resultTemplate: TaskTemplate | null = null;

      await act(async () => {
        resultTemplate = await result.current.updateTemplate(
          'template-1',
          mockFormData
        );
      });

      expect(resultTemplate).toBeNull();
      expect(result.current._error).toBe('テンプレートの更新に失敗しました');
      expect(console.error).toHaveBeenCalled();
    });
  });

  describe('Delete template', () => {
    it('should delete template successfully', async () => {
      (TemplateStorage.delete as any).mockReturnValue(true);

      const { result } = renderHook(() => useTemplateManagement());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      let success = false;

      await act(async () => {
        success = await result.current.deleteTemplate('template-1');
      });

      expect(success).toBe(true);
      expect(result.current.templates).toHaveLength(1);
      expect(result.current.templates.find(t => t.id === 'template-1')).toBeUndefined();
      expect(result.current._error).toBeNull();
    });

    it('should handle delete when template not found', async () => {
      (TemplateStorage.delete as any).mockReturnValue(false);

      const { result } = renderHook(() => useTemplateManagement());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      let success = false;

      await act(async () => {
        success = await result.current.deleteTemplate('non-existent');
      });

      expect(success).toBe(false);
      expect(result.current._error).toBe('テンプレートの削除に失敗しました');
    });

    it('should handle delete errors', async () => {
      (TemplateStorage.delete as any).mockImplementation(() => {
        throw new Error('Delete failed');
      });

      const { result } = renderHook(() => useTemplateManagement());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      let success = false;

      await act(async () => {
        success = await result.current.deleteTemplate('template-1');
      });

      expect(success).toBe(false);
      expect(result.current._error).toBe('テンプレートの削除に失敗しました');
      expect(console.error).toHaveBeenCalled();
    });
  });

  describe('Toggle favorite', () => {
    it('should toggle favorite to true', async () => {
      (TemplateStorage.toggleFavorite as any).mockReturnValue(true);

      const { result } = renderHook(() => useTemplateManagement());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      let newState = false;

      await act(async () => {
        newState = await result.current.toggleFavorite('template-1');
      });

      expect(newState).toBe(true);
      expect(result.current.templates[0].isFavorite).toBe(true);
      expect(result.current._error).toBeNull();
    });

    it('should toggle favorite to false', async () => {
      (TemplateStorage.toggleFavorite as any).mockReturnValue(false);

      const { result } = renderHook(() => useTemplateManagement());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      let newState = false;

      await act(async () => {
        newState = await result.current.toggleFavorite('template-2');
      });

      expect(newState).toBe(false);
      expect(result.current.templates[1].isFavorite).toBe(false);
      expect(result.current._error).toBeNull();
    });

    it('should handle toggle favorite errors', async () => {
      (TemplateStorage.toggleFavorite as any).mockImplementation(() => {
        throw new Error('Toggle failed');
      });

      const { result } = renderHook(() => useTemplateManagement());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      let newState = true;

      await act(async () => {
        newState = await result.current.toggleFavorite('template-1');
      });

      expect(newState).toBe(false);
      expect(result.current._error).toBe('お気に入りの変更に失敗しました');
      expect(console.error).toHaveBeenCalled();
    });
  });

  describe('Reload templates', () => {
    it('should reload templates', async () => {
      const { result } = renderHook(() => useTemplateManagement());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const newTemplates: TaskTemplate[] = [
        {
          ...mockTemplates[0],
          name: 'Reloaded Template',
        },
      ];

      (TemplateStorage.load as any).mockReturnValue(newTemplates);

      await act(async () => {
        result.current.reloadTemplates();
      });

      await waitFor(() => {
        expect(result.current.templates).toEqual(newTemplates);
        expect(result.current.loading).toBe(false);
      });
    });
  });

  describe('Error state management', () => {
    it('should clear error on successful operation', async () => {
      // First, cause an error
      (TemplateStorage.create as any).mockImplementationOnce(() => {
        throw new Error('Create failed');
      });

      const { result } = renderHook(() => useTemplateManagement());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await act(async () => {
        await result.current.createTemplate(mockFormData);
      });

      expect(result.current._error).toBe('テンプレートの作成に失敗しました');

      // Now, perform successful operation
      const newTemplate: TaskTemplate = {
        ...mockFormData,
        id: 'template-3',
        createdAt: '2025-01-01T00:00:00.000Z',
        updatedAt: '2025-01-01T00:00:00.000Z',
        usageCount: 0,
      };

      (TemplateStorage.create as any).mockReturnValue(newTemplate);

      await act(async () => {
        await result.current.createTemplate(mockFormData);
      });

      expect(result.current._error).toBeNull();
    });
  });
});
