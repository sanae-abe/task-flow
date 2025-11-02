/**
 * LabelChip component tests
 * ラベルチップコンポーネントの包括的テスト
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import LabelChip from './LabelChip';
import type { Label } from '../types';

// Mock getLabelColors utility
const mockGetLabelColors = vi.fn();
vi.mock('../utils/labelHelpers', () => ({
  getLabelColors: (color: string) => mockGetLabelColors(color),
}));

// Mock IconButton component
vi.mock('./shared/IconButton', () => ({
  default: ({ icon: Icon, onClick, size, ariaLabel }: any) => (
    <button onClick={onClick} aria-label={ariaLabel} data-size={size}>
      <Icon data-testid="icon-component" />
    </button>
  ),
}));

// Mock X icon from lucide-react
vi.mock('lucide-react', () => ({
  X: () => <span data-testid="x-icon">X</span>,
}));

describe('LabelChip', () => {
  const mockLabel: Label = {
    id: 'label-1',
    name: 'Bug',
    color: 'danger',
  };

  const mockColors = {
    bg: '#d1242f',
    color: '#ffffff',
  };

  beforeEach(() => {
    mockGetLabelColors.mockReturnValue(mockColors);
  });

  describe('Rendering', () => {
    it('should render label name', () => {
      render(<LabelChip label={mockLabel} />);

      expect(screen.getByText('Bug')).toBeInTheDocument();
    });

    it('should apply label colors from getLabelColors', () => {
      render(<LabelChip label={mockLabel} />);

      expect(mockGetLabelColors).toHaveBeenCalledWith('danger');
    });

    it('should render with different label colors', () => {
      const primaryLabel: Label = {
        id: 'label-2',
        name: 'Feature',
        color: 'primary',
      };

      const primaryColors = {
        bg: '#3b82f6',
        color: '#ffffff',
      };

      mockGetLabelColors.mockReturnValue(primaryColors);

      render(<LabelChip label={primaryLabel} />);

      expect(mockGetLabelColors).toHaveBeenCalledWith('primary');
      expect(screen.getByText('Feature')).toBeInTheDocument();
    });

    it('should not render remove button by default', () => {
      render(<LabelChip label={mockLabel} />);

      expect(screen.queryByRole('button')).not.toBeInTheDocument();
    });

    it('should render remove button when showRemove is true', () => {
      const onRemove = vi.fn();
      render(<LabelChip label={mockLabel} showRemove={true} onRemove={onRemove} />);

      expect(screen.getByRole('button')).toBeInTheDocument();
      expect(screen.getByTestId('x-icon')).toBeInTheDocument();
    });

    it('should render remove button with correct aria-label', () => {
      const onRemove = vi.fn();
      render(<LabelChip label={mockLabel} showRemove={true} onRemove={onRemove} />);

      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-label', 'Bugラベルを削除');
    });

    it('should apply small size to remove button', () => {
      const onRemove = vi.fn();
      render(<LabelChip label={mockLabel} showRemove={true} onRemove={onRemove} />);

      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('data-size', 'small');
    });
  });

  describe('Click Behavior', () => {
    it('should not be clickable by default', () => {
      const onClick = vi.fn();
      const { container } = render(
        <LabelChip label={mockLabel} onClick={onClick} />
      );

      const labelChip = container.querySelector('.inline-flex');
      expect(labelChip).not.toHaveClass('cursor-pointer');
    });

    it('should be clickable when clickable prop is true', () => {
      const onClick = vi.fn();
      const { container } = render(
        <LabelChip label={mockLabel} clickable={true} onClick={onClick} />
      );

      const labelChip = container.querySelector('.inline-flex');
      expect(labelChip).toHaveClass('cursor-pointer');
    });

    it('should call onClick when clickable and clicked', () => {
      const onClick = vi.fn();
      const { container } = render(
        <LabelChip label={mockLabel} clickable={true} onClick={onClick} />
      );

      const labelChip = container.querySelector('.inline-flex')!;
      fireEvent.click(labelChip);

      expect(onClick).toHaveBeenCalledTimes(1);
    });

    it('should not call onClick when not clickable', () => {
      const onClick = vi.fn();
      const { container } = render(
        <LabelChip label={mockLabel} clickable={false} onClick={onClick} />
      );

      const labelChip = container.querySelector('.inline-flex')!;
      fireEvent.click(labelChip);

      expect(onClick).not.toHaveBeenCalled();
    });

    it('should not call onClick when clickable prop is not set', () => {
      const onClick = vi.fn();
      const { container } = render(
        <LabelChip label={mockLabel} onClick={onClick} />
      );

      const labelChip = container.querySelector('.inline-flex')!;
      fireEvent.click(labelChip);

      expect(onClick).not.toHaveBeenCalled();
    });
  });

  describe('Keyboard Behavior', () => {
    it('should handle Enter key when clickable', () => {
      const onClick = vi.fn();
      const { container } = render(
        <LabelChip label={mockLabel} clickable={true} onClick={onClick} />
      );

      const labelChip = container.querySelector('.inline-flex')!;
      fireEvent.keyDown(labelChip, { key: 'Enter' });

      expect(onClick).toHaveBeenCalledTimes(1);
    });

    it('should handle Space key when clickable', () => {
      const onClick = vi.fn();
      const { container } = render(
        <LabelChip label={mockLabel} clickable={true} onClick={onClick} />
      );

      const labelChip = container.querySelector('.inline-flex')!;
      fireEvent.keyDown(labelChip, { key: ' ' });

      expect(onClick).toHaveBeenCalledTimes(1);
    });

    it('should handle Enter and Space key accessibility', () => {
      const onClick = vi.fn();
      const { container } = render(
        <LabelChip label={mockLabel} clickable={true} onClick={onClick} />
      );

      const labelChip = container.querySelector('.inline-flex')!;

      // Test Enter key
      fireEvent.keyDown(labelChip, { key: 'Enter' });
      expect(onClick).toHaveBeenCalledTimes(1);

      // Test Space key
      fireEvent.keyDown(labelChip, { key: ' ' });
      expect(onClick).toHaveBeenCalledTimes(2);
    });

    it('should not handle keyboard events when not clickable', () => {
      const onClick = vi.fn();
      const { container } = render(
        <LabelChip label={mockLabel} clickable={false} onClick={onClick} />
      );

      const labelChip = container.querySelector('.inline-flex')!;
      fireEvent.keyDown(labelChip, { key: 'Enter' });
      fireEvent.keyDown(labelChip, { key: ' ' });

      expect(onClick).not.toHaveBeenCalled();
    });

    it('should not handle other keys', () => {
      const onClick = vi.fn();
      const { container } = render(
        <LabelChip label={mockLabel} clickable={true} onClick={onClick} />
      );

      const labelChip = container.querySelector('.inline-flex')!;
      fireEvent.keyDown(labelChip, { key: 'A' });
      fireEvent.keyDown(labelChip, { key: 'Escape' });
      fireEvent.keyDown(labelChip, { key: 'Tab' });

      expect(onClick).not.toHaveBeenCalled();
    });
  });

  describe('Remove Button', () => {
    it('should call onRemove when remove button is clicked', () => {
      const onRemove = vi.fn();
      render(<LabelChip label={mockLabel} showRemove={true} onRemove={onRemove} />);

      const removeButton = screen.getByRole('button');
      fireEvent.click(removeButton);

      expect(onRemove).toHaveBeenCalledTimes(1);
    });

    it('should call only onRemove when remove button is clicked on non-clickable chip', () => {
      const onRemove = vi.fn();
      const onClick = vi.fn();
      render(
        <LabelChip
          label={mockLabel}
          showRemove={true}
          onRemove={onRemove}
          clickable={false}
          onClick={onClick}
        />
      );

      const removeButton = screen.getByRole('button');
      fireEvent.click(removeButton);

      expect(onRemove).toHaveBeenCalledTimes(1);
      expect(onClick).not.toHaveBeenCalled();
    });

    it('should not call onRemove when showRemove is false', () => {
      const onRemove = vi.fn();
      const { container } = render(
        <LabelChip label={mockLabel} showRemove={false} onRemove={onRemove} />
      );

      const labelChip = container.querySelector('.inline-flex')!;
      fireEvent.click(labelChip);

      expect(onRemove).not.toHaveBeenCalled();
    });
  });

  describe('Accessibility', () => {
    it('should have role="button" when clickable', () => {
      const onClick = vi.fn();
      const { container } = render(
        <LabelChip label={mockLabel} clickable={true} onClick={onClick} />
      );

      const labelChip = container.querySelector('.inline-flex')!;
      expect(labelChip).toHaveAttribute('role', 'button');
    });

    it('should not have role="button" when not clickable', () => {
      const { container } = render(<LabelChip label={mockLabel} />);

      const labelChip = container.querySelector('.inline-flex')!;
      expect(labelChip).not.toHaveAttribute('role', 'button');
    });

    it('should have tabIndex={0} when clickable', () => {
      const onClick = vi.fn();
      const { container } = render(
        <LabelChip label={mockLabel} clickable={true} onClick={onClick} />
      );

      const labelChip = container.querySelector('.inline-flex')!;
      expect(labelChip).toHaveAttribute('tabindex', '0');
    });

    it('should not have tabIndex when not clickable', () => {
      const { container } = render(<LabelChip label={mockLabel} />);

      const labelChip = container.querySelector('.inline-flex')!;
      expect(labelChip).not.toHaveAttribute('tabindex');
    });
  });

  describe('Memoization', () => {
    it('should re-render when label changes', () => {
      const { rerender } = render(<LabelChip label={mockLabel} />);

      expect(screen.getByText('Bug')).toBeInTheDocument();

      const newLabel: Label = {
        id: 'label-2',
        name: 'Feature',
        color: 'primary',
      };

      rerender(<LabelChip label={newLabel} />);

      expect(screen.queryByText('Bug')).not.toBeInTheDocument();
      expect(screen.getByText('Feature')).toBeInTheDocument();
    });

    it('should re-render when showRemove changes', () => {
      const onRemove = vi.fn();
      const { rerender } = render(
        <LabelChip label={mockLabel} showRemove={false} onRemove={onRemove} />
      );

      expect(screen.queryByRole('button')).not.toBeInTheDocument();

      rerender(<LabelChip label={mockLabel} showRemove={true} onRemove={onRemove} />);

      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    it('should re-render when clickable changes', () => {
      const onClick = vi.fn();
      const { container, rerender } = render(
        <LabelChip label={mockLabel} clickable={false} onClick={onClick} />
      );

      let labelChip = container.querySelector('.inline-flex')!;
      expect(labelChip).not.toHaveClass('cursor-pointer');

      rerender(
        <LabelChip label={mockLabel} clickable={true} onClick={onClick} />
      );

      labelChip = container.querySelector('.inline-flex')!;
      expect(labelChip).toHaveClass('cursor-pointer');
    });
  });

  describe('Edge Cases', () => {
    it('should handle long label names', () => {
      const longLabel: Label = {
        id: 'label-long',
        name: 'This is a very long label name that might overflow',
        color: 'default',
      };

      render(<LabelChip label={longLabel} />);

      expect(
        screen.getByText('This is a very long label name that might overflow')
      ).toBeInTheDocument();
    });

    it('should handle special characters in label name', () => {
      const specialLabel: Label = {
        id: 'label-special',
        name: 'Label@#$%^&*()',
        color: 'primary',
      };

      render(<LabelChip label={specialLabel} />);

      expect(screen.getByText('Label@#$%^&*()')).toBeInTheDocument();
    });

    it('should handle empty label name', () => {
      const emptyLabel: Label = {
        id: 'label-empty',
        name: '',
        color: 'default',
      };

      const { container } = render(<LabelChip label={emptyLabel} />);

      // Empty label should still render the container
      const labelChip = container.querySelector('.inline-flex');
      expect(labelChip).toBeInTheDocument();
    });

    it('should handle all color variants', () => {
      const colors = [
        'default',
        'primary',
        'success',
        'warning',
        'danger',
      ] as const;

      colors.forEach((color) => {
        const label: Label = {
          id: `label-${color}`,
          name: color,
          color,
        };

        const { unmount } = render(<LabelChip label={label} />);

        expect(mockGetLabelColors).toHaveBeenCalledWith(color);
        expect(screen.getByText(color)).toBeInTheDocument();

        unmount();
      });
    });

    it('should handle both clickable and showRemove together without nested buttons', () => {
      const onClick = vi.fn();
      const onRemove = vi.fn();
      const { container } = render(
        <LabelChip
          label={mockLabel}
          clickable={false}
          onClick={onClick}
          showRemove={true}
          onRemove={onRemove}
        />
      );

      // Remove button should be present
      const removeButton = screen.getByRole('button');
      expect(removeButton).toBeInTheDocument();

      // Clicking remove button should call onRemove
      fireEvent.click(removeButton);
      expect(onRemove).toHaveBeenCalledTimes(1);
      expect(onClick).not.toHaveBeenCalled();
    });

    it('should handle undefined onClick callback', () => {
      const { container } = render(
        <LabelChip label={mockLabel} clickable={true} />
      );

      const labelChip = container.querySelector('.inline-flex')!;

      // Should not throw error
      expect(() => {
        fireEvent.click(labelChip);
        fireEvent.keyDown(labelChip, { key: 'Enter' });
      }).not.toThrow();
    });

    it('should not render remove button without onRemove callback', () => {
      render(<LabelChip label={mockLabel} showRemove={true} />);

      // No button should be rendered without onRemove
      expect(screen.queryByRole('button')).not.toBeInTheDocument();
    });
  });
});
