import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  saveSettings,
  loadSettings,
  updateDefaultColumns,
  resetSettings,
  updateAutoDeletionSettings,
  getAutoDeletionSettings,
  isAutoDeletionEnabled,
} from './settingsStorage';
import { DEFAULT_SETTINGS, type AppSettings } from '../types/settings';

describe('settingsStorage', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  describe('saveSettings', () => {
    it('should save settings to localStorage', () => {
      saveSettings(DEFAULT_SETTINGS);
      const stored = localStorage.getItem('taskflow-app-settings');
      expect(stored).toBeTruthy();
      expect(JSON.parse(stored!)).toEqual(DEFAULT_SETTINGS);
    });

    it('should save custom settings', () => {
      const customSettings: AppSettings = {
        defaultColumns: [
          { id: 'col1', name: 'Column 1' },
          { id: 'col2', name: 'Column 2' },
        ],
        autoDeletion: {
          ...DEFAULT_SETTINGS.autoDeletion,
          enabled: true,
          retentionDays: 60,
        },
      };

      saveSettings(customSettings);
      const stored = JSON.parse(localStorage.getItem('taskflow-app-settings')!);
      expect(stored).toEqual(customSettings);
    });

    it('should throw error when localStorage fails', () => {
      // Mock localStorage to throw an error
      const mockLocalStorage = {
        setItem: vi.fn(() => {
          throw new Error('Quota exceeded');
        }),
      };

      // Replace global localStorage temporarily
      const originalLocalStorage = global.localStorage;
      (global as any).localStorage = mockLocalStorage;

      expect(() => saveSettings(DEFAULT_SETTINGS)).toThrow(
        '設定の保存に失敗しました'
      );

      // Restore original localStorage
      (global as any).localStorage = originalLocalStorage;
    });

    it('should handle complex settings', () => {
      const complexSettings: AppSettings = {
        defaultColumns: Array.from({ length: 10 }, (_, i) => ({
          id: `col${i}`,
          name: `Column ${i}`,
        })),
        autoDeletion: {
          enabled: true,
          retentionDays: 90,
          notifyBeforeDeletion: true,
          notificationDays: 7,
          excludeLabelIds: ['label1', 'label2', 'label3'],
          excludePriorities: ['critical', 'high'],
          autoExportBeforeDeletion: true,
          enableSoftDeletion: true,
          softDeletionRetentionDays: 14,
        },
      };

      saveSettings(complexSettings);
      const loaded = loadSettings();
      expect(loaded).toEqual(complexSettings);
    });
  });

  describe('loadSettings', () => {
    it('should return DEFAULT_SETTINGS when localStorage is empty', () => {
      const settings = loadSettings();
      expect(settings).toEqual(DEFAULT_SETTINGS);
    });

    it('should load settings from localStorage', () => {
      const customSettings: AppSettings = {
        defaultColumns: [{ id: 'custom', name: 'Custom Column' }],
        autoDeletion: {
          ...DEFAULT_SETTINGS.autoDeletion,
          retentionDays: 45,
        },
      };

      localStorage.setItem(
        'taskflow-app-settings',
        JSON.stringify(customSettings)
      );

      const loaded = loadSettings();
      expect(loaded).toEqual(customSettings);
    });

    it('should return DEFAULT_SETTINGS for invalid JSON', () => {
      localStorage.setItem('taskflow-app-settings', 'invalid json');
      const settings = loadSettings();
      expect(settings).toEqual(DEFAULT_SETTINGS);
    });

    it('should return DEFAULT_SETTINGS for null parsed value', () => {
      localStorage.setItem('taskflow-app-settings', 'null');
      const settings = loadSettings();
      expect(settings).toEqual(DEFAULT_SETTINGS);
    });

    it('should return DEFAULT_SETTINGS for non-object parsed value', () => {
      localStorage.setItem('taskflow-app-settings', '123');
      const settings = loadSettings();
      expect(settings).toEqual(DEFAULT_SETTINGS);
    });

    it('should return DEFAULT_SETTINGS when defaultColumns is not an array', () => {
      const invalidSettings = {
        defaultColumns: 'not an array',
        autoDeletion: DEFAULT_SETTINGS.autoDeletion,
      };
      localStorage.setItem(
        'taskflow-app-settings',
        JSON.stringify(invalidSettings)
      );

      const settings = loadSettings();
      expect(settings).toEqual(DEFAULT_SETTINGS);
    });

    it('should filter out invalid column configurations', () => {
      const partiallyValidSettings = {
        defaultColumns: [
          { id: 'valid1', name: 'Valid 1' },
          { id: 123, name: 'Invalid' }, // id is not string
          { name: 'Missing ID' }, // no id
          { id: 'valid2', name: 'Valid 2' },
          null,
          undefined,
          'invalid',
        ],
        autoDeletion: DEFAULT_SETTINGS.autoDeletion,
      };

      localStorage.setItem(
        'taskflow-app-settings',
        JSON.stringify(partiallyValidSettings)
      );

      const settings = loadSettings();
      expect(settings.defaultColumns).toEqual([
        { id: 'valid1', name: 'Valid 1' },
        { id: 'valid2', name: 'Valid 2' },
      ]);
    });

    it('should return DEFAULT_SETTINGS when no valid columns found', () => {
      const noValidColumns = {
        defaultColumns: [
          { id: 123, name: 'Invalid' },
          { name: 'Missing ID' },
          null,
        ],
        autoDeletion: DEFAULT_SETTINGS.autoDeletion,
      };

      localStorage.setItem(
        'taskflow-app-settings',
        JSON.stringify(noValidColumns)
      );

      const settings = loadSettings();
      expect(settings).toEqual(DEFAULT_SETTINGS);
    });

    it('should validate autoDeletion settings', () => {
      const settingsWithAutoDeletion = {
        defaultColumns: DEFAULT_SETTINGS.defaultColumns,
        autoDeletion: {
          enabled: true,
          retentionDays: 60,
          notifyBeforeDeletion: true,
          notificationDays: 5,
          excludeLabelIds: ['label1'],
          excludePriorities: ['high'],
          autoExportBeforeDeletion: false,
          enableSoftDeletion: false,
          softDeletionRetentionDays: 10,
        },
      };

      localStorage.setItem(
        'taskflow-app-settings',
        JSON.stringify(settingsWithAutoDeletion)
      );

      const settings = loadSettings();
      expect(settings.autoDeletion).toEqual(
        settingsWithAutoDeletion.autoDeletion
      );
    });

    it('should clamp retentionDays to 1-365 range', () => {
      // Test valid but out-of-range values (will be clamped)
      const settings1 = {
        defaultColumns: DEFAULT_SETTINGS.defaultColumns,
        autoDeletion: {
          enabled: true,
          retentionDays: 1, // Valid minimum
          notifyBeforeDeletion: true,
          notificationDays: 5,
        },
      };
      localStorage.setItem('taskflow-app-settings', JSON.stringify(settings1));
      expect(loadSettings().autoDeletion.retentionDays).toBe(1);

      const settings2 = {
        defaultColumns: DEFAULT_SETTINGS.defaultColumns,
        autoDeletion: {
          enabled: true,
          retentionDays: 500, // Above maximum - will be clamped
          notifyBeforeDeletion: true,
          notificationDays: 5,
        },
      };
      localStorage.setItem('taskflow-app-settings', JSON.stringify(settings2));
      expect(loadSettings().autoDeletion.retentionDays).toBe(365);
    });

    it('should return DEFAULT_SETTINGS for invalid retentionDays (<= 0)', () => {
      const settings = {
        defaultColumns: DEFAULT_SETTINGS.defaultColumns,
        autoDeletion: {
          enabled: true,
          retentionDays: 0, // Invalid - fails validation
          notifyBeforeDeletion: true,
          notificationDays: 5,
        },
      };
      localStorage.setItem('taskflow-app-settings', JSON.stringify(settings));
      expect(loadSettings()).toEqual(DEFAULT_SETTINGS);
    });

    it('should clamp notificationDays to 0-30 range', () => {
      const settings1 = {
        defaultColumns: DEFAULT_SETTINGS.defaultColumns,
        autoDeletion: {
          enabled: true,
          retentionDays: 30,
          notifyBeforeDeletion: true,
          notificationDays: 0, // Valid minimum
        },
      };
      localStorage.setItem('taskflow-app-settings', JSON.stringify(settings1));
      expect(loadSettings().autoDeletion.notificationDays).toBe(0);

      const settings2 = {
        defaultColumns: DEFAULT_SETTINGS.defaultColumns,
        autoDeletion: {
          enabled: true,
          retentionDays: 30,
          notifyBeforeDeletion: true,
          notificationDays: 50, // Above maximum - will be clamped
        },
      };
      localStorage.setItem('taskflow-app-settings', JSON.stringify(settings2));
      expect(loadSettings().autoDeletion.notificationDays).toBe(30);
    });

    it('should return DEFAULT_SETTINGS for invalid notificationDays (< 0)', () => {
      const settings = {
        defaultColumns: DEFAULT_SETTINGS.defaultColumns,
        autoDeletion: {
          enabled: true,
          retentionDays: 30,
          notifyBeforeDeletion: true,
          notificationDays: -5, // Invalid - fails validation
        },
      };
      localStorage.setItem('taskflow-app-settings', JSON.stringify(settings));
      expect(loadSettings()).toEqual(DEFAULT_SETTINGS);
    });

    it('should clamp softDeletionRetentionDays to 1-30 range', () => {
      const settings1 = {
        defaultColumns: DEFAULT_SETTINGS.defaultColumns,
        autoDeletion: {
          enabled: true,
          retentionDays: 30,
          notifyBeforeDeletion: true,
          notificationDays: 5,
          softDeletionRetentionDays: 0,
        },
      };
      localStorage.setItem('taskflow-app-settings', JSON.stringify(settings1));
      expect(loadSettings().autoDeletion.softDeletionRetentionDays).toBe(1);

      const settings2 = {
        defaultColumns: DEFAULT_SETTINGS.defaultColumns,
        autoDeletion: {
          enabled: true,
          retentionDays: 30,
          notifyBeforeDeletion: true,
          notificationDays: 5,
          softDeletionRetentionDays: 100,
        },
      };
      localStorage.setItem('taskflow-app-settings', JSON.stringify(settings2));
      expect(loadSettings().autoDeletion.softDeletionRetentionDays).toBe(30);
    });

    it('should use default autoDeletion for invalid autoDeletion object', () => {
      const invalidAutoDeletion = {
        defaultColumns: DEFAULT_SETTINGS.defaultColumns,
        autoDeletion: {
          enabled: 'not a boolean', // Invalid type
          retentionDays: 'invalid',
        },
      };

      localStorage.setItem(
        'taskflow-app-settings',
        JSON.stringify(invalidAutoDeletion)
      );

      const settings = loadSettings();
      expect(settings.autoDeletion).toEqual(DEFAULT_SETTINGS.autoDeletion);
    });

    it('should handle missing excludeLabelIds and excludePriorities', () => {
      const partialAutoDeletion = {
        defaultColumns: DEFAULT_SETTINGS.defaultColumns,
        autoDeletion: {
          enabled: true,
          retentionDays: 30,
          notifyBeforeDeletion: true,
          notificationDays: 3,
          // excludeLabelIds and excludePriorities missing
        },
      };

      localStorage.setItem(
        'taskflow-app-settings',
        JSON.stringify(partialAutoDeletion)
      );

      const settings = loadSettings();
      expect(settings.autoDeletion.excludeLabelIds).toEqual([]);
      expect(settings.autoDeletion.excludePriorities).toEqual([]);
    });

    it('should use default values for missing boolean flags', () => {
      const partialAutoDeletion = {
        defaultColumns: DEFAULT_SETTINGS.defaultColumns,
        autoDeletion: {
          enabled: true,
          retentionDays: 30,
          notifyBeforeDeletion: true,
          notificationDays: 3,
          // Missing: autoExportBeforeDeletion, enableSoftDeletion, softDeletionRetentionDays
        },
      };

      localStorage.setItem(
        'taskflow-app-settings',
        JSON.stringify(partialAutoDeletion)
      );

      const settings = loadSettings();
      expect(settings.autoDeletion.autoExportBeforeDeletion).toBe(true);
      expect(settings.autoDeletion.enableSoftDeletion).toBe(true);
      expect(settings.autoDeletion.softDeletionRetentionDays).toBe(7);
    });
  });

  describe('updateDefaultColumns', () => {
    it('should update default columns', () => {
      const newColumns = [
        { id: 'new1', name: 'New Column 1' },
        { id: 'new2', name: 'New Column 2' },
      ];

      updateDefaultColumns(newColumns);

      const settings = loadSettings();
      expect(settings.defaultColumns).toEqual(newColumns);
    });

    it('should preserve autoDeletion settings when updating columns', () => {
      const customAutoDeletion = {
        ...DEFAULT_SETTINGS.autoDeletion,
        enabled: true,
        retentionDays: 60,
      };

      saveSettings({
        defaultColumns: DEFAULT_SETTINGS.defaultColumns,
        autoDeletion: customAutoDeletion,
      });

      const newColumns = [{ id: 'updated', name: 'Updated Column' }];
      updateDefaultColumns(newColumns);

      const settings = loadSettings();
      expect(settings.defaultColumns).toEqual(newColumns);
      expect(settings.autoDeletion).toEqual(customAutoDeletion);
    });
  });

  describe('resetSettings', () => {
    it('should reset to DEFAULT_SETTINGS', () => {
      const customSettings: AppSettings = {
        defaultColumns: [{ id: 'custom', name: 'Custom' }],
        autoDeletion: {
          ...DEFAULT_SETTINGS.autoDeletion,
          enabled: true,
          retentionDays: 100,
        },
      };

      saveSettings(customSettings);
      expect(loadSettings()).toEqual(customSettings);

      resetSettings();
      expect(loadSettings()).toEqual(DEFAULT_SETTINGS);
    });
  });

  describe('updateAutoDeletionSettings', () => {
    it('should update autoDeletion settings', () => {
      const newAutoDeletion = {
        enabled: true,
        retentionDays: 90,
        notifyBeforeDeletion: true,
        notificationDays: 10,
        excludeLabelIds: ['label1', 'label2'],
        excludePriorities: ['critical'],
        autoExportBeforeDeletion: false,
        enableSoftDeletion: false,
        softDeletionRetentionDays: 5,
      };

      updateAutoDeletionSettings(newAutoDeletion);

      const settings = loadSettings();
      expect(settings.autoDeletion).toEqual(newAutoDeletion);
    });

    it('should preserve defaultColumns when updating autoDeletion', () => {
      const customColumns = [
        { id: 'col1', name: 'Column 1' },
        { id: 'col2', name: 'Column 2' },
      ];

      saveSettings({
        defaultColumns: customColumns,
        autoDeletion: DEFAULT_SETTINGS.autoDeletion,
      });

      const newAutoDeletion = {
        ...DEFAULT_SETTINGS.autoDeletion,
        enabled: true,
      };
      updateAutoDeletionSettings(newAutoDeletion);

      const settings = loadSettings();
      expect(settings.defaultColumns).toEqual(customColumns);
      expect(settings.autoDeletion).toEqual(newAutoDeletion);
    });
  });

  describe('getAutoDeletionSettings', () => {
    it('should return autoDeletion settings', () => {
      const autoDeletion = getAutoDeletionSettings();
      expect(autoDeletion).toEqual(DEFAULT_SETTINGS.autoDeletion);
    });

    it('should return custom autoDeletion settings', () => {
      const customAutoDeletion = {
        enabled: true,
        retentionDays: 45,
        notifyBeforeDeletion: true,
        notificationDays: 5,
        excludeLabelIds: ['label1'],
        excludePriorities: ['high'],
        autoExportBeforeDeletion: true,
        enableSoftDeletion: true,
        softDeletionRetentionDays: 10,
      };

      updateAutoDeletionSettings(customAutoDeletion);

      const retrieved = getAutoDeletionSettings();
      expect(retrieved).toEqual(customAutoDeletion);
    });
  });

  describe('isAutoDeletionEnabled', () => {
    it('should return false by default', () => {
      expect(isAutoDeletionEnabled()).toBe(false);
    });

    it('should return true when enabled', () => {
      updateAutoDeletionSettings({
        ...DEFAULT_SETTINGS.autoDeletion,
        enabled: true,
      });

      expect(isAutoDeletionEnabled()).toBe(true);
    });

    it('should return false when disabled', () => {
      updateAutoDeletionSettings({
        ...DEFAULT_SETTINGS.autoDeletion,
        enabled: false,
      });

      expect(isAutoDeletionEnabled()).toBe(false);
    });
  });

  describe('Edge cases and error handling', () => {
    it('should handle localStorage getItem returning null', () => {
      const originalGetItem = Storage.prototype.getItem;
      Storage.prototype.getItem = () => null;

      const settings = loadSettings();
      expect(settings).toEqual(DEFAULT_SETTINGS);

      Storage.prototype.getItem = originalGetItem;
    });

    it('should handle empty string in localStorage', () => {
      localStorage.setItem('taskflow-app-settings', '');
      const settings = loadSettings();
      expect(settings).toEqual(DEFAULT_SETTINGS);
    });

    it('should handle very large settings', () => {
      const largeSettings: AppSettings = {
        defaultColumns: Array.from({ length: 100 }, (_, i) => ({
          id: `col${i}`,
          name: `Column ${i}`,
        })),
        autoDeletion: {
          ...DEFAULT_SETTINGS.autoDeletion,
          excludeLabelIds: Array.from({ length: 100 }, (_, i) => `label${i}`),
          excludePriorities: Array.from(
            { length: 10 },
            (_, i) => `priority${i}`
          ),
        },
      };

      saveSettings(largeSettings);
      const loaded = loadSettings();
      expect(loaded).toEqual(largeSettings);
    });
  });
});
