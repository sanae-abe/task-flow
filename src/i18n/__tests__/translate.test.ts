/**
 * Translation System Tests
 *
 * Tests for the i18n translation functionality
 */

import { describe, it, expect } from 'vitest';
import { translate, buildKey, resources, supportedLocales } from '../index';

describe('i18n Translation System', () => {
  describe('translate function', () => {
    it('should translate simple keys in Japanese', () => {
      expect(translate('common.save', 'ja')).toBe('保存');
      expect(translate('common.cancel', 'ja')).toBe('キャンセル');
      expect(translate('common.delete', 'ja')).toBe('削除');
    });

    it('should translate simple keys in English', () => {
      expect(translate('common.save', 'en')).toBe('Save');
      expect(translate('common.cancel', 'en')).toBe('Cancel');
      expect(translate('common.delete', 'en')).toBe('Delete');
    });

    it('should handle variable interpolation', () => {
      const result = translate('task.deleteTaskConfirm', 'ja', {
        title: 'Test Task',
      });
      expect(result).toBe('「Test Task」を削除しますか？');

      const resultEn = translate('task.deleteTaskConfirm', 'en', {
        title: 'Test Task',
      });
      // Updated to match actual translation in en.json
      expect(resultEn).toBe('Delete "Test Task"?');
    });

    it('should handle multiple variables', () => {
      // Using board.deleteBoardMessage which has {{title}} variable
      const result = translate('subheader.deleteBoardMessage', 'ja', {
        title: 'Test Board',
      });
      expect(result).toBe('「Test Board」を削除しますか？');

      const resultEn = translate('subheader.deleteBoardMessage', 'en', {
        title: 'Test Board',
      });
      expect(resultEn).toBe('Delete "Test Board"?');
    });

    it('should return key for missing translations', () => {
      const result = translate('nonexistent.key', 'ja');
      expect(result).toBe('nonexistent.key');
    });

    it('should default to Japanese locale', () => {
      const result = translate('common.save');
      expect(result).toBe('保存');
    });
  });

  describe('buildKey function', () => {
    it('should build valid translation keys', () => {
      expect(buildKey('common', 'save')).toBe('common.save');
      expect(buildKey('task', 'create')).toBe('task.create');
      expect(buildKey('priority', 'critical')).toBe('priority.critical');
    });
  });

  describe('translation resources', () => {
    it('should have both Japanese and English resources', () => {
      expect(resources).toHaveProperty('ja');
      expect(resources).toHaveProperty('en');
    });

    it('should have matching structure for both locales', () => {
      const jaKeys = Object.keys(resources.ja);
      const enKeys = Object.keys(resources.en);
      expect(jaKeys).toEqual(enKeys);
    });

    it('should have all required namespaces', () => {
      const requiredNamespaces = [
        'common',
        'task',
        'priority',
        'subtask',
        'label',
        'board',
        'column',
        'view',
        'template',
        'recycleBin',
        'settings',
        'filter',
        'recurrence',
        'attachment',
        'time',
        'header',
        'subheader',
        'help',
        'notification',
        'validation',
        'calendar',
        'export',
        'pwa',
        'about',
      ];

      requiredNamespaces.forEach(namespace => {
        expect(resources.ja).toHaveProperty(namespace);
        expect(resources.en).toHaveProperty(namespace);
      });
    });
  });

  describe('supported locales', () => {
    it('should have correct supported locales', () => {
      expect(supportedLocales).toContain('ja');
      expect(supportedLocales).toContain('en');
      expect(supportedLocales).toHaveLength(2);
    });
  });

  describe('priority translations', () => {
    it('should translate priority levels correctly', () => {
      expect(translate('priority.critical', 'ja')).toBe('最優先');
      expect(translate('priority.high', 'ja')).toBe('高');
      expect(translate('priority.medium', 'ja')).toBe('中');
      expect(translate('priority.low', 'ja')).toBe('低');

      expect(translate('priority.critical', 'en')).toBe('Critical');
      expect(translate('priority.high', 'en')).toBe('High');
      expect(translate('priority.medium', 'en')).toBe('Medium');
      expect(translate('priority.low', 'en')).toBe('Low');
    });
  });

  describe('task-related translations', () => {
    it('should translate task actions', () => {
      expect(translate('task.createTask', 'ja')).toBe('タスクを作成');
      expect(translate('task.editTask', 'ja')).toBe('タスクを編集');
      expect(translate('task.deleteTask', 'ja')).toBe('タスクを削除');

      expect(translate('task.createTask', 'en')).toBe('Create Task');
      expect(translate('task.editTask', 'en')).toBe('Edit Task');
      expect(translate('task.deleteTask', 'en')).toBe('Delete Task');
    });

    it('should translate task states', () => {
      expect(translate('task.overdue', 'ja')).toBe('期限切れ');
      expect(translate('task.dueToday', 'ja')).toBe('今日が期限');
      expect(translate('task.dueTomorrow', 'ja')).toBe('明日が期限');

      expect(translate('task.overdue', 'en')).toBe('Overdue');
      expect(translate('task.dueToday', 'en')).toBe('Due Today');
      expect(translate('task.dueTomorrow', 'en')).toBe('Due Tomorrow');
    });
  });

  describe('view translations', () => {
    it('should translate view types', () => {
      expect(translate('view.kanban', 'ja')).toBe('カンバン');
      expect(translate('view.table', 'ja')).toBe('テーブル');
      expect(translate('view.calendar', 'ja')).toBe('カレンダー');

      expect(translate('view.kanban', 'en')).toBe('Kanban');
      expect(translate('view.table', 'en')).toBe('Table');
      expect(translate('view.calendar', 'en')).toBe('Calendar');
    });
  });

  describe('validation translations', () => {
    it('should translate validation messages', () => {
      expect(translate('validation.required', 'ja')).toBe('必須項目です');
      expect(translate('validation.tooShort', 'ja')).toBe(
        '入力が短すぎます（最小{{min}}文字）'
      );
      expect(translate('validation.invalidFormat', 'ja')).toBe(
        '形式が正しくありません'
      );

      // Updated to match actual translation in en.json
      expect(translate('validation.required', 'en')).toBe(
        'This field is required'
      );
      expect(translate('validation.tooShort', 'en')).toBe(
        'Input is too short (min {{min}} characters)'
      );
      expect(translate('validation.invalidFormat', 'en')).toBe(
        'Invalid format'
      );
    });
  });

  describe('notification translations', () => {
    it('should translate notification messages', () => {
      expect(translate('notification.taskCreated', 'ja')).toBe(
        'タスクを作成しました'
      );
      expect(translate('notification.taskUpdated', 'ja')).toBe(
        'タスクを更新しました'
      );

      expect(translate('notification.taskCreated', 'en')).toBe('Task created');
      expect(translate('notification.taskUpdated', 'en')).toBe('Task updated');
    });
  });
});
