import { describe, it, expect } from 'vitest';
import { LABEL_COLORS, getColorInfo, createLabel } from './labels';

describe('labels utility', () => {
  describe('LABEL_COLORS', () => {
    it('should have 7 color variants', () => {
      expect(LABEL_COLORS).toHaveLength(7);
    });

    it('should have correct color structure', () => {
      LABEL_COLORS.forEach(color => {
        expect(color).toHaveProperty('name');
        expect(color).toHaveProperty('variant');
        expect(typeof color.name).toBe('string');
        expect(typeof color.variant).toBe('string');
      });
    });

    it('should include all expected variants', () => {
      const variants = LABEL_COLORS.map(c => c.variant);
      expect(variants).toContain('default');
      expect(variants).toContain('primary');
      expect(variants).toContain('success');
      expect(variants).toContain('attention');
      expect(variants).toContain('severe');
      expect(variants).toContain('danger');
      expect(variants).toContain('done');
    });
  });

  describe('getColorInfo', () => {
    it('should return color info for valid variant', () => {
      const info = getColorInfo('primary');
      expect(info.name).toBe('Primary');
      expect(info.variant).toBe('primary');
    });

    it('should return default for invalid variant', () => {
      const info = getColorInfo('invalid-variant');
      expect(info.name).toBe('Default');
      expect(info.variant).toBe('default');
    });

    it('should return default for empty string', () => {
      const info = getColorInfo('');
      expect(info.name).toBe('Default');
      expect(info.variant).toBe('default');
    });

    it('should work for all valid variants', () => {
      LABEL_COLORS.forEach(expectedColor => {
        const info = getColorInfo(expectedColor.variant);
        expect(info).toEqual(expectedColor);
      });
    });
  });

  describe('createLabel', () => {
    it('should create label with unique ID', () => {
      const label1 = createLabel('Test Label', 'primary');
      const label2 = createLabel('Test Label', 'primary');

      expect(label1.id).not.toBe(label2.id);
    });

    it('should create label with correct structure', () => {
      const label = createLabel('My Label', 'success');

      expect(label).toHaveProperty('id');
      expect(label).toHaveProperty('name');
      expect(label).toHaveProperty('color');
      expect(label.name).toBe('My Label');
      expect(label.color).toBe('success');
    });

    it('should trim label name', () => {
      const label = createLabel('  Spaced Label  ', 'danger');
      expect(label.name).toBe('Spaced Label');
    });

    it('should have ID starting with "label-"', () => {
      const label = createLabel('Test', 'default');
      expect(label.id).toMatch(/^label-\d+-[a-z0-9]+$/);
    });

    it('should preserve color variant', () => {
      const variants = [
        'default',
        'primary',
        'success',
        'attention',
        'severe',
        'danger',
        'done',
      ];

      variants.forEach(variant => {
        const label = createLabel('Test', variant);
        expect(label.color).toBe(variant);
      });
    });

    it('should handle empty name', () => {
      const label = createLabel('', 'primary');
      expect(label.name).toBe('');
      expect(label.color).toBe('primary');
    });

    it('should handle name with only spaces', () => {
      const label = createLabel('   ', 'success');
      expect(label.name).toBe('');
    });

    it('should create valid labels with special characters', () => {
      const label = createLabel('Bug 🐛', 'danger');
      expect(label.name).toBe('Bug 🐛');
      expect(label.id).toBeTruthy();
    });
  });
});
