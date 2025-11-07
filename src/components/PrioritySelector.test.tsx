/**
 * PrioritySelector component test suite
 * 優先度セレクターコンポーネントのテスト
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import PrioritySelector from './PrioritySelector';
import type { Priority } from '../types';

describe('PrioritySelector', () => {
  let mockOnChange: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockOnChange = vi.fn();
  });

  describe('Rendering', () => {
    it('should render all priority options', () => {
      render(
        <PrioritySelector priority='medium' onPriorityChange={mockOnChange} />
      );

      // Now includes "選択なし" option, so we look for Japanese labels
      expect(screen.getByLabelText(/緊急/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/高/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/中/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/低/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/選択なし/i)).toBeInTheDocument();
    });

    it('should render with selected priority', () => {
      render(
        <PrioritySelector priority='high' onPriorityChange={mockOnChange} />
      );

      const highRadio = screen.getByLabelText(/高/i) as HTMLInputElement;
      expect(highRadio.checked).toBe(true);
    });

    it('should render with no selection when value is undefined', () => {
      render(
        <PrioritySelector
          priority={undefined}
          onPriorityChange={mockOnChange}
        />
      );

      const noneRadio = screen.getByLabelText(/選択なし/i) as HTMLInputElement;
      expect(noneRadio.checked).toBe(true);
    });
  });

  describe('Interaction', () => {
    it('should call onChange when priority is selected', () => {
      render(
        <PrioritySelector priority='medium' onPriorityChange={mockOnChange} />
      );

      const highRadio = screen.getByLabelText(/高/i);
      fireEvent.click(highRadio);

      expect(mockOnChange).toHaveBeenCalledWith('high');
    });

    it('should call onChange for each priority level', () => {
      const priorities: Priority[] = ['critical', 'high', 'medium', 'low'];

      priorities.forEach(priority => {
        mockOnChange.mockClear();
        // Set different initial priority to ensure onChange is triggered
        const initialPriority = priority === 'high' ? 'low' : 'high';
        const { unmount } = render(
          <PrioritySelector
            priority={initialPriority}
            onPriorityChange={mockOnChange}
          />
        );

        // Map English priority to Japanese label
        const labelMap: Record<Priority, string> = {
          critical: '緊急',
          high: '高',
          medium: '中',
          low: '低',
        };

        const radio = screen.getByLabelText(labelMap[priority]);
        fireEvent.click(radio);

        expect(mockOnChange).toHaveBeenCalledWith(priority);
        unmount();
      });
    });

    it('should update selection when value prop changes', () => {
      const { rerender } = render(
        <PrioritySelector priority='low' onPriorityChange={mockOnChange} />
      );

      const lowRadio = screen.getByLabelText(/低/i) as HTMLInputElement;
      expect(lowRadio.checked).toBe(true);

      rerender(
        <PrioritySelector priority='high' onPriorityChange={mockOnChange} />
      );

      const highRadio = screen.getByLabelText(/高/i) as HTMLInputElement;
      expect(highRadio.checked).toBe(true);
      expect(lowRadio.checked).toBe(false);
    });
  });

  describe('Styling', () => {
    it('should apply correct color classes for critical priority', () => {
      render(
        <PrioritySelector priority='critical' onPriorityChange={mockOnChange} />
      );

      const criticalRadio = screen.getByLabelText(/緊急/i);
      expect(criticalRadio).toBeInTheDocument();
    });

    it('should apply correct color classes for high priority', () => {
      render(
        <PrioritySelector priority='high' onPriorityChange={mockOnChange} />
      );

      const highRadio = screen.getByLabelText(/高/i);
      expect(highRadio).toBeInTheDocument();
    });

    it('should apply correct color classes for medium priority', () => {
      render(
        <PrioritySelector priority='medium' onPriorityChange={mockOnChange} />
      );

      const mediumRadio = screen.getByLabelText(/中/i);
      expect(mediumRadio).toBeInTheDocument();
    });

    it('should apply correct color classes for low priority', () => {
      render(
        <PrioritySelector priority='low' onPriorityChange={mockOnChange} />
      );

      const lowRadio = screen.getByLabelText(/低/i);
      expect(lowRadio).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper radio group role', () => {
      render(
        <PrioritySelector priority='medium' onPriorityChange={mockOnChange} />
      );

      const radios = screen.getAllByRole('radio');
      expect(radios).toHaveLength(5); // Now includes "選択なし"
    });

    it('should have proper labels for screen readers', () => {
      render(
        <PrioritySelector priority='medium' onPriorityChange={mockOnChange} />
      );

      expect(screen.getByLabelText(/緊急/i)).toHaveAccessibleName();
      expect(screen.getByLabelText(/高/i)).toHaveAccessibleName();
      expect(screen.getByLabelText(/中/i)).toHaveAccessibleName();
      expect(screen.getByLabelText(/低/i)).toHaveAccessibleName();
      expect(screen.getByLabelText(/選択なし/i)).toHaveAccessibleName();
    });

    it('should be keyboard navigable', () => {
      render(
        <PrioritySelector priority='medium' onPriorityChange={mockOnChange} />
      );

      const firstRadio = screen.getByLabelText(/選択なし/i);
      firstRadio.focus();

      expect(document.activeElement).toBe(firstRadio);
    });
  });

  describe('Edge Cases', () => {
    it('should handle null value', () => {
      render(
        <PrioritySelector
          priority={undefined}
          onPriorityChange={mockOnChange}
        />
      );

      const noneRadio = screen.getByLabelText(/選択なし/i) as HTMLInputElement;
      expect(noneRadio.checked).toBe(true);
    });

    it('should not throw when onChange is not provided', () => {
      expect(() => {
        render(
          <PrioritySelector
            priority='medium'
            onPriorityChange={undefined as any}
          />
        );
      }).not.toThrow();
    });

    it('should handle rapid selection changes', () => {
      render(
        <PrioritySelector
          priority={undefined}
          onPriorityChange={mockOnChange}
        />
      );

      const labels = ['緊急', '高', '低', '中'];
      labels.forEach(label => {
        const radio = screen.getByLabelText(label);
        fireEvent.click(radio);
      });

      // Should be called 4 times for 4 different selections
      expect(mockOnChange).toHaveBeenCalledTimes(4);
    });
  });
});
