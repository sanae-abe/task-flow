/**
 * CircleColorPicker component tests
 * 円形カラーピッカーコンポーネントの包括的テスト
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import CircleColorPicker from './CircleColorPicker';

// Mock label utilities
vi.mock('../utils/labels', () => ({
  LABEL_COLORS: [
    { name: 'Default', variant: 'default' },
    { name: 'Primary', variant: 'primary' },
    { name: 'Success', variant: 'success' },
    { name: 'Attention', variant: 'attention' },
    { name: 'Severe', variant: 'severe' },
    { name: 'Danger', variant: 'danger' },
    { name: 'Done', variant: 'done' },
  ],
}));

vi.mock('../utils/labelHelpers', () => ({
  getLabelColors: (variant: string) => {
    const colorMap: Record<string, { bg: string; text: string }> = {
      default: { bg: '#e5e7eb', text: '#1f2937' },
      primary: { bg: '#3b82f6', text: '#ffffff' },
      success: { bg: '#10b981', text: '#ffffff' },
      attention: { bg: '#f59e0b', text: '#ffffff' },
      severe: { bg: '#ef4444', text: '#ffffff' },
      danger: { bg: '#dc2626', text: '#ffffff' },
      done: { bg: '#6366f1', text: '#ffffff' },
    };
    return colorMap[variant] || colorMap.default;
  },
}));

describe('CircleColorPicker', () => {
  const mockOnColorSelect = vi.fn();

  const defaultProps = {
    selectedColor: 'default',
    onColorSelect: mockOnColorSelect,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Basic rendering', () => {
    it('should render all color options', () => {
      render(<CircleColorPicker {...defaultProps} />);

      const colorButtons = screen.getAllByRole('button');
      expect(colorButtons).toHaveLength(7); // 7 colors in LABEL_COLORS
    });

    it('should render with custom className', () => {
      const { container } = render(
        <CircleColorPicker {...defaultProps} className='custom-class' />
      );

      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper).toHaveClass('custom-class');
    });

    it('should have proper aria-labels for each color', () => {
      render(<CircleColorPicker {...defaultProps} />);

      expect(screen.getByLabelText('Default色を選択')).toBeInTheDocument();
      expect(screen.getByLabelText('Primary色を選択')).toBeInTheDocument();
      expect(screen.getByLabelText('Success色を選択')).toBeInTheDocument();
      expect(screen.getByLabelText('Attention色を選択')).toBeInTheDocument();
      expect(screen.getByLabelText('Severe色を選択')).toBeInTheDocument();
      expect(screen.getByLabelText('Danger色を選択')).toBeInTheDocument();
      expect(screen.getByLabelText('Done色を選択')).toBeInTheDocument();
    });
  });

  describe('Color selection', () => {
    it('should call onColorSelect when a color is clicked', () => {
      render(<CircleColorPicker {...defaultProps} />);

      const primaryButton = screen.getByLabelText('Primary色を選択');
      fireEvent.click(primaryButton);

      expect(mockOnColorSelect).toHaveBeenCalledTimes(1);
      expect(mockOnColorSelect).toHaveBeenCalledWith('primary');
    });

    it('should call onColorSelect with correct variant for each color', () => {
      render(<CircleColorPicker {...defaultProps} />);

      const colors = [
        'default',
        'primary',
        'success',
        'attention',
        'severe',
        'danger',
        'done',
      ];

      colors.forEach((color, index) => {
        const colorButtons = screen.getAllByRole('button');
        fireEvent.click(colorButtons[index]);

        expect(mockOnColorSelect).toHaveBeenCalledWith(color);
      });

      expect(mockOnColorSelect).toHaveBeenCalledTimes(7);
    });

    it('should handle multiple clicks on same color', () => {
      render(<CircleColorPicker {...defaultProps} />);

      const successButton = screen.getByLabelText('Success色を選択');
      fireEvent.click(successButton);
      fireEvent.click(successButton);
      fireEvent.click(successButton);

      expect(mockOnColorSelect).toHaveBeenCalledTimes(3);
      expect(mockOnColorSelect).toHaveBeenCalledWith('success');
    });
  });

  describe('Selected state styling', () => {
    it('should apply selected state to default color', () => {
      render(
        <CircleColorPicker
          selectedColor='default'
          onColorSelect={mockOnColorSelect}
        />
      );

      const defaultButton = screen.getByLabelText('Default色を選択');
      const style = defaultButton.getAttribute('style');

      expect(style).toContain('background: rgb(255, 255, 255)'); // White background when selected
      expect(style).toContain('border-color: rgb(229, 231, 235)'); // Default bg color as border
    });

    it('should apply selected state to primary color', () => {
      render(
        <CircleColorPicker
          selectedColor='primary'
          onColorSelect={mockOnColorSelect}
        />
      );

      const primaryButton = screen.getByLabelText('Primary色を選択');
      const style = primaryButton.getAttribute('style');

      expect(style).toContain('background: rgb(255, 255, 255)');
      expect(style).toContain('border-color: rgb(59, 130, 246)'); // Primary bg color as border
    });

    it('should apply unselected state correctly', () => {
      render(
        <CircleColorPicker
          selectedColor='primary'
          onColorSelect={mockOnColorSelect}
        />
      );

      const defaultButton = screen.getByLabelText('Default色を選択');
      const style = defaultButton.getAttribute('style');

      expect(style).toContain('background: rgb(229, 231, 235)'); // Actual bg color
      expect(style).toContain('border-color: transparent');
    });

    it('should update selected state when selectedColor prop changes', () => {
      const { rerender } = render(
        <CircleColorPicker
          selectedColor='default'
          onColorSelect={mockOnColorSelect}
        />
      );

      let defaultButton = screen.getByLabelText('Default色を選択');
      expect(defaultButton.getAttribute('style')).toContain(
        'background: rgb(255, 255, 255)'
      );

      rerender(
        <CircleColorPicker
          selectedColor='success'
          onColorSelect={mockOnColorSelect}
        />
      );

      defaultButton = screen.getByLabelText('Default色を選択');
      expect(defaultButton.getAttribute('style')).toContain(
        'background: rgb(229, 231, 235)'
      );

      const successButton = screen.getByLabelText('Success色を選択');
      expect(successButton.getAttribute('style')).toContain(
        'background: rgb(255, 255, 255)'
      );
    });
  });

  describe('Error handling', () => {
    it('should handle errors in onColorSelect gracefully', () => {
      const errorCallback = vi.fn(() => {
        throw new Error('Test error');
      });

      render(
        <CircleColorPicker
          selectedColor='default'
          onColorSelect={errorCallback}
        />
      );

      const primaryButton = screen.getByLabelText('Primary色を選択');

      // Should not throw
      expect(() => fireEvent.click(primaryButton)).not.toThrow();
      expect(errorCallback).toHaveBeenCalledWith('primary');
    });

    it('should continue working after error in callback', () => {
      let shouldThrow = true;
      const conditionalErrorCallback = vi.fn(() => {
        if (shouldThrow) {
          throw new Error('First call error');
        }
      });

      render(
        <CircleColorPicker
          selectedColor='default'
          onColorSelect={conditionalErrorCallback}
        />
      );

      const primaryButton = screen.getByLabelText('Primary色を選択');

      // First click throws error
      fireEvent.click(primaryButton);
      expect(conditionalErrorCallback).toHaveBeenCalledTimes(1);

      // Second click should work
      shouldThrow = false;
      fireEvent.click(primaryButton);
      expect(conditionalErrorCallback).toHaveBeenCalledTimes(2);
    });
  });

  describe('Accessibility', () => {
    it('should be keyboard navigable', () => {
      render(<CircleColorPicker {...defaultProps} />);

      const buttons = screen.getAllByRole('button');
      buttons[0].focus();
      expect(buttons[0]).toHaveFocus();

      buttons[1].focus();
      expect(buttons[1]).toHaveFocus();
    });

    it('should have type="button" to prevent form submission', () => {
      render(<CircleColorPicker {...defaultProps} />);

      const buttons = screen.getAllByRole('button');
      buttons.forEach(button => {
        expect(button).toHaveAttribute('type', 'button');
      });
    });

    it('should have focus ring styling', () => {
      render(<CircleColorPicker {...defaultProps} />);

      const button = screen.getByLabelText('Default色を選択');
      expect(button.className).toContain('focus:ring-2');
      expect(button.className).toContain('focus:ring-primary');
    });

    it('should have proper button semantics', () => {
      render(<CircleColorPicker {...defaultProps} />);

      const buttons = screen.getAllByRole('button');
      buttons.forEach(button => {
        expect(button.tagName.toLowerCase()).toBe('button');
      });
    });
  });

  describe('Component lifecycle', () => {
    it('should render consistently on re-renders', () => {
      const { rerender } = render(<CircleColorPicker {...defaultProps} />);

      expect(screen.getAllByRole('button')).toHaveLength(7);

      rerender(<CircleColorPicker {...defaultProps} />);

      expect(screen.getAllByRole('button')).toHaveLength(7);
    });

    it('should memoize properly with same props', () => {
      const { rerender } = render(<CircleColorPicker {...defaultProps} />);

      const firstRenderButtons = screen.getAllByRole('button');

      rerender(<CircleColorPicker {...defaultProps} />);

      const secondRenderButtons = screen.getAllByRole('button');

      expect(firstRenderButtons.length).toBe(secondRenderButtons.length);
    });
  });

  describe('Visual styling', () => {
    it('should have rounded shape', () => {
      render(<CircleColorPicker {...defaultProps} />);

      const buttons = screen.getAllByRole('button');
      buttons.forEach(button => {
        expect(button.className).toContain('rounded-full');
      });
    });

    it('should have hover effects', () => {
      render(<CircleColorPicker {...defaultProps} />);

      const buttons = screen.getAllByRole('button');
      buttons.forEach(button => {
        expect(button.className).toContain('hover:scale-110');
      });
    });

    it('should have transition animations', () => {
      render(<CircleColorPicker {...defaultProps} />);

      const buttons = screen.getAllByRole('button');
      buttons.forEach(button => {
        expect(button.className).toContain('transition-all');
        expect(button.className).toContain('duration-200');
      });
    });

    it('should have correct size', () => {
      render(<CircleColorPicker {...defaultProps} />);

      const buttons = screen.getAllByRole('button');
      buttons.forEach(button => {
        expect(button.className).toContain('w-6');
        expect(button.className).toContain('h-6');
      });
    });
  });

  describe('Edge cases', () => {
    it('should handle unknown selected color gracefully', () => {
      render(
        <CircleColorPicker
          selectedColor='unknown-color'
          onColorSelect={mockOnColorSelect}
        />
      );

      const buttons = screen.getAllByRole('button');
      expect(buttons).toHaveLength(7);

      // All buttons should be in unselected state
      buttons.forEach(button => {
        const style = button.getAttribute('style');
        expect(style).toContain('border-color: transparent');
      });
    });

    it('should handle empty string as selected color', () => {
      render(
        <CircleColorPicker selectedColor='' onColorSelect={mockOnColorSelect} />
      );

      const buttons = screen.getAllByRole('button');
      expect(buttons).toHaveLength(7);
    });

    it('should handle rapid color changes', () => {
      render(<CircleColorPicker {...defaultProps} />);

      const buttons = screen.getAllByRole('button');

      // Rapidly click different colors
      buttons.forEach(button => {
        fireEvent.click(button);
      });

      expect(mockOnColorSelect).toHaveBeenCalledTimes(7);
    });
  });
});
