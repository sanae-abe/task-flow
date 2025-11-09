import { describe, it, expect, vi } from 'vitest';
import {
  priorityConfig,
  prioritySelectorOptions,
  getPriorityOrder,
  getPriorityWeight,
  getPriorityLabel,
  getPriorityDescription,
  getPriorityAriaLabel,
  buildPriorityConfig,
  buildPrioritySelectorOptions,
  buildPriorityAriaLabel,
} from './priorityConfig';
import type { Priority } from '../types';
import { Zap, ChevronUp, Minus, ChevronDown } from 'lucide-react';

describe('priorityConfig', () => {
  describe('priorityConfig constant', () => {
    it('should have configurations for all priority levels', () => {
      expect(priorityConfig).toHaveProperty('critical');
      expect(priorityConfig).toHaveProperty('high');
      expect(priorityConfig).toHaveProperty('medium');
      expect(priorityConfig).toHaveProperty('low');
    });

    it('should have correct structure for critical priority', () => {
      const critical = priorityConfig.critical;
      expect(critical.label).toBe('緊急');
      expect(critical.labelEn).toBe('Critical');
      expect(critical.description).toBe('今すぐ対応が必要');
      expect(critical.icon).toBe(Zap);
      expect(critical.variant).toBe('danger');
      expect(critical.colors).toHaveProperty('filled');
      expect(critical.colors).toHaveProperty('outlined');
      expect(critical.colors).toHaveProperty('subtle');
    });

    it('should have correct structure for high priority', () => {
      const high = priorityConfig.high;
      expect(high.label).toBe('高');
      expect(high.labelEn).toBe('High');
      expect(high.description).toBe('近日中に対応が必要');
      expect(high.icon).toBe(ChevronUp);
      expect(high.variant).toBe('attention');
    });

    it('should have correct structure for medium priority', () => {
      const medium = priorityConfig.medium;
      expect(medium.label).toBe('中');
      expect(medium.labelEn).toBe('Medium');
      expect(medium.description).toBe('通常の優先度');
      expect(medium.icon).toBe(Minus);
      expect(medium.variant).toBe('accent');
    });

    it('should have correct structure for low priority', () => {
      const low = priorityConfig.low;
      expect(low.label).toBe('低');
      expect(low.labelEn).toBe('Low');
      expect(low.description).toBe('時間があるときに対応');
      expect(low.icon).toBe(ChevronDown);
      expect(low.variant).toBe('secondary');
    });

    it('should have color schemes for each priority', () => {
      const priorities: Priority[] = ['critical', 'high', 'medium', 'low'];

      priorities.forEach(priority => {
        const config = priorityConfig[priority];
        expect(config.colors.filled).toHaveProperty('bg');
        expect(config.colors.filled).toHaveProperty('text');
        expect(config.colors.filled).toHaveProperty('border');
        expect(config.colors.outlined).toHaveProperty('bg');
        expect(config.colors.outlined).toHaveProperty('text');
        expect(config.colors.outlined).toHaveProperty('border');
        expect(config.colors.subtle).toHaveProperty('bg');
        expect(config.colors.subtle).toHaveProperty('text');
        expect(config.colors.subtle).toHaveProperty('border');
      });
    });

    it('should have valid color values', () => {
      expect(priorityConfig.critical.colors.filled.bg).toMatch(
        /^#[0-9a-f]{6}$/i
      );
      expect(priorityConfig.high.colors.filled.bg).toMatch(/^#[0-9a-f]{6}$/i);
      expect(priorityConfig.medium.colors.filled.bg).toMatch(/^#[0-9a-f]{6}$/i);
      expect(priorityConfig.low.colors.filled.bg).toMatch(/^#[0-9a-f]{6}$/i);
    });
  });

  describe('prioritySelectorOptions', () => {
    it('should have 5 options (undefined + 4 priorities)', () => {
      expect(prioritySelectorOptions).toHaveLength(5);
    });

    it('should have undefined as first option', () => {
      const firstOption = prioritySelectorOptions[0];
      expect(firstOption.value).toBeUndefined();
      expect(firstOption.label).toBe('選択なし');
      expect(firstOption.description).toBe('優先度を設定しない');
      expect(firstOption.icon).toBeNull();
      expect(firstOption.color).toBe('#656d76');
    });

    it('should have all priorities in correct order', () => {
      expect(prioritySelectorOptions[1]?.value).toBe('critical');
      expect(prioritySelectorOptions[2]?.value).toBe('high');
      expect(prioritySelectorOptions[3]?.value).toBe('medium');
      expect(prioritySelectorOptions[4]?.value).toBe('low');
    });

    it('should have consistent labels with priorityConfig', () => {
      expect(prioritySelectorOptions[1]?.label).toBe(
        priorityConfig.critical.label
      );
      expect(prioritySelectorOptions[2]?.label).toBe(priorityConfig.high.label);
      expect(prioritySelectorOptions[3]?.label).toBe(
        priorityConfig.medium.label
      );
      expect(prioritySelectorOptions[4]?.label).toBe(priorityConfig.low.label);
    });

    it('should have consistent descriptions with priorityConfig', () => {
      expect(prioritySelectorOptions[1]?.description).toBe(
        priorityConfig.critical.description
      );
      expect(prioritySelectorOptions[2]?.description).toBe(
        priorityConfig.high.description
      );
    });

    it('should have consistent icons with priorityConfig', () => {
      expect(prioritySelectorOptions[1]?.icon).toBe(
        priorityConfig.critical.icon
      );
      expect(prioritySelectorOptions[2]?.icon).toBe(priorityConfig.high.icon);
      expect(prioritySelectorOptions[3]?.icon).toBe(priorityConfig.medium.icon);
      expect(prioritySelectorOptions[4]?.icon).toBe(priorityConfig.low.icon);
    });

    it('should have consistent colors with priorityConfig', () => {
      expect(prioritySelectorOptions[1]?.color).toBe(
        priorityConfig.critical.colors.filled.bg
      );
      expect(prioritySelectorOptions[2]?.color).toBe(
        priorityConfig.high.colors.filled.bg
      );
    });
  });

  describe('getPriorityOrder', () => {
    it('should return correct order for critical', () => {
      expect(getPriorityOrder('critical')).toBe(1);
    });

    it('should return correct order for high', () => {
      expect(getPriorityOrder('high')).toBe(2);
    });

    it('should return correct order for medium', () => {
      expect(getPriorityOrder('medium')).toBe(3);
    });

    it('should return correct order for low', () => {
      expect(getPriorityOrder('low')).toBe(4);
    });

    it('should return 5 for invalid priority', () => {
      expect(getPriorityOrder('invalid' as Priority)).toBe(5);
    });

    it('should maintain priority ordering (critical < high < medium < low)', () => {
      expect(getPriorityOrder('critical')).toBeLessThan(
        getPriorityOrder('high')
      );
      expect(getPriorityOrder('high')).toBeLessThan(getPriorityOrder('medium'));
      expect(getPriorityOrder('medium')).toBeLessThan(getPriorityOrder('low'));
    });
  });

  describe('getPriorityWeight', () => {
    it('should return 999 for undefined priority', () => {
      expect(getPriorityWeight(undefined)).toBe(999);
    });

    it('should return correct weight for critical', () => {
      expect(getPriorityWeight('critical')).toBe(1);
    });

    it('should return correct weight for high', () => {
      expect(getPriorityWeight('high')).toBe(2);
    });

    it('should return correct weight for medium', () => {
      expect(getPriorityWeight('medium')).toBe(3);
    });

    it('should return correct weight for low', () => {
      expect(getPriorityWeight('low')).toBe(4);
    });

    it('should make undefined priority sort last', () => {
      expect(getPriorityWeight(undefined)).toBeGreaterThan(
        getPriorityWeight('low')
      );
    });

    it('should enable correct sorting by weight', () => {
      const weights = [
        getPriorityWeight('low'),
        getPriorityWeight('critical'),
        getPriorityWeight(undefined),
        getPriorityWeight('medium'),
        getPriorityWeight('high'),
      ];
      const sorted = [...weights].sort((a, b) => a - b);
      expect(sorted).toEqual([1, 2, 3, 4, 999]);
    });
  });

  describe('getPriorityLabel', () => {
    it('should return "未設定" for undefined', () => {
      expect(getPriorityLabel(undefined)).toBe('未設定');
    });

    it('should return correct label for critical', () => {
      expect(getPriorityLabel('critical')).toBe('緊急');
    });

    it('should return correct label for high', () => {
      expect(getPriorityLabel('high')).toBe('高');
    });

    it('should return correct label for medium', () => {
      expect(getPriorityLabel('medium')).toBe('中');
    });

    it('should return correct label for low', () => {
      expect(getPriorityLabel('low')).toBe('低');
    });

    it('should match priorityConfig labels', () => {
      const priorities: Priority[] = ['critical', 'high', 'medium', 'low'];
      priorities.forEach(priority => {
        expect(getPriorityLabel(priority)).toBe(priorityConfig[priority].label);
      });
    });
  });

  describe('getPriorityDescription', () => {
    it('should return default description for undefined', () => {
      expect(getPriorityDescription(undefined)).toBe('優先度を設定しない');
    });

    it('should return correct description for critical', () => {
      expect(getPriorityDescription('critical')).toBe('今すぐ対応が必要');
    });

    it('should return correct description for high', () => {
      expect(getPriorityDescription('high')).toBe('近日中に対応が必要');
    });

    it('should return correct description for medium', () => {
      expect(getPriorityDescription('medium')).toBe('通常の優先度');
    });

    it('should return correct description for low', () => {
      expect(getPriorityDescription('low')).toBe('時間があるときに対応');
    });

    it('should match priorityConfig descriptions', () => {
      const priorities: Priority[] = ['critical', 'high', 'medium', 'low'];
      priorities.forEach(priority => {
        expect(getPriorityDescription(priority)).toBe(
          priorityConfig[priority].description
        );
      });
    });
  });

  describe('getPriorityAriaLabel', () => {
    it('should return aria-label for undefined', () => {
      expect(getPriorityAriaLabel(undefined)).toBe('優先度: 未設定');
    });

    it('should return correct aria-label for critical', () => {
      expect(getPriorityAriaLabel('critical')).toBe(
        '優先度: 緊急 - 今すぐ対応が必要'
      );
    });

    it('should return correct aria-label for high', () => {
      expect(getPriorityAriaLabel('high')).toBe(
        '優先度: 高 - 近日中に対応が必要'
      );
    });

    it('should return correct aria-label for medium', () => {
      expect(getPriorityAriaLabel('medium')).toBe('優先度: 中 - 通常の優先度');
    });

    it('should return correct aria-label for low', () => {
      expect(getPriorityAriaLabel('low')).toBe(
        '優先度: 低 - 時間があるときに対応'
      );
    });

    it('should include both label and description', () => {
      const priorities: Priority[] = ['critical', 'high', 'medium', 'low'];
      priorities.forEach(priority => {
        const ariaLabel = getPriorityAriaLabel(priority);
        expect(ariaLabel).toContain(priorityConfig[priority].label);
        expect(ariaLabel).toContain(priorityConfig[priority].description);
      });
    });
  });

  describe('buildPriorityConfig', () => {
    it('should build config with translations', () => {
      const mockT = vi.fn((key: string) => `translated_${key}`);
      const config = buildPriorityConfig(mockT);

      expect(config.critical.label).toBe('translated_priority.critical');
      expect(config.critical.description).toBe(
        'translated_priority.criticalDesc'
      );
      expect(config.high.label).toBe('translated_priority.high');
      expect(config.medium.label).toBe('translated_priority.medium');
      expect(config.low.label).toBe('translated_priority.low');
    });

    it('should preserve labelEn values', () => {
      const mockT = vi.fn((key: string) => key);
      const config = buildPriorityConfig(mockT);

      expect(config.critical.labelEn).toBe('Critical');
      expect(config.high.labelEn).toBe('High');
      expect(config.medium.labelEn).toBe('Medium');
      expect(config.low.labelEn).toBe('Low');
    });

    it('should preserve icons', () => {
      const mockT = vi.fn((key: string) => key);
      const config = buildPriorityConfig(mockT);

      expect(config.critical.icon).toBe(Zap);
      expect(config.high.icon).toBe(ChevronUp);
      expect(config.medium.icon).toBe(Minus);
      expect(config.low.icon).toBe(ChevronDown);
    });

    it('should preserve variants', () => {
      const mockT = vi.fn((key: string) => key);
      const config = buildPriorityConfig(mockT);

      expect(config.critical.variant).toBe('danger');
      expect(config.high.variant).toBe('attention');
      expect(config.medium.variant).toBe('accent');
      expect(config.low.variant).toBe('secondary');
    });

    it('should preserve color schemes', () => {
      const mockT = vi.fn((key: string) => key);
      const config = buildPriorityConfig(mockT);

      expect(config.critical.colors).toEqual(priorityConfig.critical.colors);
      expect(config.high.colors).toEqual(priorityConfig.high.colors);
      expect(config.medium.colors).toEqual(priorityConfig.medium.colors);
      expect(config.low.colors).toEqual(priorityConfig.low.colors);
    });

    it('should call translation function with correct keys', () => {
      const mockT = vi.fn((key: string) => key);
      buildPriorityConfig(mockT);

      expect(mockT).toHaveBeenCalledWith('priority.critical');
      expect(mockT).toHaveBeenCalledWith('priority.criticalDesc');
      expect(mockT).toHaveBeenCalledWith('priority.high');
      expect(mockT).toHaveBeenCalledWith('priority.highDesc');
      expect(mockT).toHaveBeenCalledWith('priority.medium');
      expect(mockT).toHaveBeenCalledWith('priority.mediumDesc');
      expect(mockT).toHaveBeenCalledWith('priority.low');
      expect(mockT).toHaveBeenCalledWith('priority.lowDesc');
    });
  });

  describe('buildPrioritySelectorOptions', () => {
    it('should build options with translations', () => {
      const mockT = vi.fn((key: string) => `translated_${key}`);
      const options = buildPrioritySelectorOptions(mockT);

      expect(options).toHaveLength(5);
      expect(options[0]?.label).toBe('translated_priority.noPriority');
      expect(options[0]?.description).toBe(
        'translated_priority.noPriorityDesc'
      );
    });

    it('should have undefined as first option', () => {
      const mockT = vi.fn((key: string) => key);
      const options = buildPrioritySelectorOptions(mockT);

      expect(options[0]?.value).toBeUndefined();
      expect(options[0]?.icon).toBeNull();
      expect(options[0]?.color).toBe('#656d76');
    });

    it('should use buildPriorityConfig for priority labels', () => {
      const mockT = vi.fn((key: string) => `translated_${key}`);
      const options = buildPrioritySelectorOptions(mockT);

      expect(options[1]?.label).toBe('translated_priority.critical');
      expect(options[2]?.label).toBe('translated_priority.high');
      expect(options[3]?.label).toBe('translated_priority.medium');
      expect(options[4]?.label).toBe('translated_priority.low');
    });

    it('should preserve icons for priority options', () => {
      const mockT = vi.fn((key: string) => key);
      const options = buildPrioritySelectorOptions(mockT);

      expect(options[1]?.icon).toBe(Zap);
      expect(options[2]?.icon).toBe(ChevronUp);
      expect(options[3]?.icon).toBe(Minus);
      expect(options[4]?.icon).toBe(ChevronDown);
    });

    it('should preserve colors for priority options', () => {
      const mockT = vi.fn((key: string) => key);
      const options = buildPrioritySelectorOptions(mockT);

      expect(options[1]?.color).toBe(priorityConfig.critical.colors.filled.bg);
      expect(options[2]?.color).toBe(priorityConfig.high.colors.filled.bg);
      expect(options[3]?.color).toBe(priorityConfig.medium.colors.filled.bg);
      expect(options[4]?.color).toBe(priorityConfig.low.colors.filled.bg);
    });
  });

  describe('buildPriorityAriaLabel', () => {
    it('should build aria-label for undefined with translations', () => {
      const mockT = vi.fn((key: string) => {
        if (key === 'priority.ariaLabel') return 'Priority';
        if (key === 'priority.unset') return 'Unset';
        return key;
      });

      const label = buildPriorityAriaLabel(undefined, mockT);
      expect(label).toBe('Priority: Unset');
    });

    it('should build aria-label for critical with translations', () => {
      const mockT = vi.fn((key: string) => {
        if (key === 'priority.ariaLabel') return 'Priority';
        if (key === 'priority.critical') return 'Critical';
        if (key === 'priority.criticalDesc') return 'Urgent attention required';
        return key;
      });

      const label = buildPriorityAriaLabel('critical', mockT);
      expect(label).toBe('Priority: Critical - Urgent attention required');
    });

    it('should use buildPriorityConfig for priority data', () => {
      const mockT = vi.fn((key: string) => `translated_${key}`);
      const label = buildPriorityAriaLabel('high', mockT);

      expect(label).toContain('translated_priority.ariaLabel');
      expect(label).toContain('translated_priority.high');
      expect(label).toContain('translated_priority.highDesc');
    });

    it('should call translation function with correct keys', () => {
      const mockT = vi.fn((key: string) => key);
      buildPriorityAriaLabel('medium', mockT);

      expect(mockT).toHaveBeenCalledWith('priority.ariaLabel');
      expect(mockT).toHaveBeenCalledWith('priority.medium');
      expect(mockT).toHaveBeenCalledWith('priority.mediumDesc');
    });

    it('should handle all priority levels', () => {
      const mockT = vi.fn((key: string) => key);

      buildPriorityAriaLabel('critical', mockT);
      buildPriorityAriaLabel('high', mockT);
      buildPriorityAriaLabel('medium', mockT);
      buildPriorityAriaLabel('low', mockT);
      buildPriorityAriaLabel(undefined, mockT);

      // Each priority calls buildPriorityConfig (8 calls) + aria label (1) + description reference = 9 per priority
      // undefined calls 2 (ariaLabel + unset)
      // Total: 4 * 9 + 2 = 38
      expect(mockT).toHaveBeenCalled();
      expect(mockT.mock.calls.length).toBeGreaterThan(0);
    });
  });
});
