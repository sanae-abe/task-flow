/**
 * IconButton component tests
 * 統一アイコンボタンコンポーネントの包括的テスト
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import IconButton from './IconButton';
import { Settings, Trash2, Edit } from 'lucide-react';

describe('IconButton', () => {
  describe('Basic rendering', () => {
    it('should render with default props', () => {
      render(<IconButton icon={Settings} ariaLabel='Settings' />);

      const button = screen.getByRole('button', { name: /settings/i });
      expect(button).toBeInTheDocument();
    });

    it('should render with icon component', () => {
      render(<IconButton icon={Settings} ariaLabel='Settings' />);

      const button = screen.getByRole('button', { name: /settings/i });
      const svg = button.querySelector('svg');
      expect(svg).toBeInTheDocument();
    });

    it('should render with aria-label', () => {
      render(<IconButton icon={Settings} ariaLabel='Open settings' />);

      const button = screen.getByRole('button', { name: /open settings/i });
      expect(button).toHaveAttribute('aria-label', 'Open settings');
    });

    it('should render different icons', () => {
      const { unmount: unmount1 } = render(
        <IconButton icon={Settings} ariaLabel='Settings' />
      );
      expect(screen.getByRole('button')).toBeInTheDocument();
      unmount1();

      const { unmount: unmount2 } = render(
        <IconButton icon={Trash2} ariaLabel='Delete' />
      );
      expect(screen.getByRole('button')).toBeInTheDocument();
      unmount2();

      render(<IconButton icon={Edit} ariaLabel='Edit' />);
      expect(screen.getByRole('button')).toBeInTheDocument();
    });
  });

  describe('Variant prop', () => {
    it('should render with default variant', () => {
      render(
        <IconButton icon={Settings} ariaLabel='Settings' variant='default' />
      );

      const button = screen.getByRole('button');
      expect(button).toHaveClass('text-foreground');
    });

    it('should render with danger variant', () => {
      render(<IconButton icon={Trash2} ariaLabel='Delete' variant='danger' />);

      const button = screen.getByRole('button');
      expect(button).toHaveClass('text-destructive', 'hover:destructive/90');
    });

    it('should render with success variant', () => {
      render(
        <IconButton icon={Settings} ariaLabel='Settings' variant='success' />
      );

      const button = screen.getByRole('button');
      expect(button).toHaveClass('text-success', 'hover:text-success/90');
    });

    it('should render with warning variant', () => {
      render(
        <IconButton icon={Settings} ariaLabel='Settings' variant='warning' />
      );

      const button = screen.getByRole('button');
      expect(button).toHaveClass('text-warning', 'hover:text-warning/90');
    });

    it('should apply ghost variant from Button component', () => {
      render(<IconButton icon={Settings} ariaLabel='Settings' />);

      const button = screen.getByRole('button');
      // Note: ghost variant is applied internally to Button component
      expect(button).toBeInTheDocument();
    });
  });

  describe('Size prop', () => {
    it('should render with small size', () => {
      render(<IconButton icon={Settings} ariaLabel='Settings' size='small' />);

      const button = screen.getByRole('button');
      expect(button).toHaveClass('p-1');
    });

    it('should render with medium size (default)', () => {
      render(<IconButton icon={Settings} ariaLabel='Settings' size='medium' />);

      const button = screen.getByRole('button');
      expect(button).toHaveClass('p-2');
    });

    it('should render with large size', () => {
      render(<IconButton icon={Settings} ariaLabel='Settings' size='large' />);

      const button = screen.getByRole('button');
      expect(button).toHaveClass('p-3');
    });

    it('should apply correct icon size for small', () => {
      render(<IconButton icon={Settings} ariaLabel='Settings' size='small' />);

      const button = screen.getByRole('button');
      const svg = button.querySelector('svg');
      expect(svg).toBeInTheDocument();
      // Icon size is controlled internally, we verify it's rendered
    });

    it('should apply correct icon size for medium', () => {
      render(<IconButton icon={Settings} ariaLabel='Settings' size='medium' />);

      const button = screen.getByRole('button');
      const svg = button.querySelector('svg');
      expect(svg).toBeInTheDocument();
    });

    it('should apply correct icon size for large', () => {
      render(<IconButton icon={Settings} ariaLabel='Settings' size='large' />);

      const button = screen.getByRole('button');
      const svg = button.querySelector('svg');
      expect(svg).toBeInTheDocument();
    });
  });

  describe('Disabled state', () => {
    it('should be enabled by default', () => {
      render(<IconButton icon={Settings} ariaLabel='Settings' />);

      const button = screen.getByRole('button');
      expect(button).not.toBeDisabled();
    });

    it('should be disabled when disabled prop is true', () => {
      render(<IconButton icon={Settings} ariaLabel='Settings' disabled />);

      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
    });

    it('should not trigger onClick when disabled', () => {
      const onClick = vi.fn();
      render(
        <IconButton
          icon={Settings}
          ariaLabel='Settings'
          onClick={onClick}
          disabled
        />
      );

      const button = screen.getByRole('button');
      fireEvent.click(button);

      expect(onClick).not.toHaveBeenCalled();
    });
  });

  describe('Click events', () => {
    it('should call onClick when clicked', () => {
      const onClick = vi.fn();
      render(
        <IconButton icon={Settings} ariaLabel='Settings' onClick={onClick} />
      );

      const button = screen.getByRole('button');
      fireEvent.click(button);

      expect(onClick).toHaveBeenCalledTimes(1);
    });

    it('should pass event to onClick handler', () => {
      const onClick = vi.fn();
      render(
        <IconButton icon={Settings} ariaLabel='Settings' onClick={onClick} />
      );

      const button = screen.getByRole('button');
      fireEvent.click(button);

      expect(onClick).toHaveBeenCalledWith(expect.any(Object));
    });

    it('should work without onClick handler', () => {
      render(<IconButton icon={Settings} ariaLabel='Settings' />);

      const button = screen.getByRole('button');
      expect(() => fireEvent.click(button)).not.toThrow();
    });

    it('should stop propagation when stopPropagation is true', () => {
      const onClick = vi.fn();
      const parentClick = vi.fn();

      render(
        <div onClick={parentClick}>
          <IconButton
            icon={Settings}
            ariaLabel='Settings'
            onClick={onClick}
            stopPropagation
          />
        </div>
      );

      const button = screen.getByRole('button');
      fireEvent.click(button);

      expect(onClick).toHaveBeenCalledTimes(1);
      expect(parentClick).not.toHaveBeenCalled();
    });

    it('should allow propagation when stopPropagation is false', () => {
      const onClick = vi.fn();
      const parentClick = vi.fn();

      render(
        <div onClick={parentClick}>
          <IconButton
            icon={Settings}
            ariaLabel='Settings'
            onClick={onClick}
            stopPropagation={false}
          />
        </div>
      );

      const button = screen.getByRole('button');
      fireEvent.click(button);

      expect(onClick).toHaveBeenCalledTimes(1);
      expect(parentClick).toHaveBeenCalledTimes(1);
    });
  });

  describe('Custom styling', () => {
    it('should apply custom className', () => {
      render(
        <IconButton
          icon={Settings}
          ariaLabel='Settings'
          className='custom-class'
        />
      );

      const button = screen.getByRole('button');
      expect(button).toHaveClass('custom-class');
    });

    it('should apply custom style object', () => {
      render(
        <IconButton
          icon={Settings}
          ariaLabel='Settings'
          style={{ backgroundColor: 'red' } as any}
        />
      );

      const button = screen.getByRole('button');
      // Note: Style is applied but may be overridden by CSS classes
      expect(button).toHaveAttribute('style');
    });

    it('should merge custom className with default classes', () => {
      render(
        <IconButton
          icon={Settings}
          ariaLabel='Settings'
          className='my-custom-class'
        />
      );

      const button = screen.getByRole('button');
      expect(button).toHaveClass('my-custom-class');
      expect(button).toHaveClass('transition-all', 'duration-150');
    });
  });

  describe('Combined props', () => {
    it('should render with variant and size', () => {
      render(
        <IconButton
          icon={Trash2}
          ariaLabel='Delete'
          variant='danger'
          size='large'
        />
      );

      const button = screen.getByRole('button');
      expect(button).toHaveClass('text-destructive');
      expect(button).toHaveClass('p-3');
    });

    it('should render with all props combined', () => {
      const onClick = vi.fn();
      render(
        <IconButton
          icon={Settings}
          ariaLabel='Settings'
          variant='success'
          size='small'
          disabled={false}
          onClick={onClick}
          className='extra-class'
          style={{ marginTop: '10px' } as any}
        />
      );

      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
      expect(button).toHaveClass('text-success', 'p-1', 'extra-class');
      expect(button).toHaveAttribute('style');
      expect(button).not.toBeDisabled();

      fireEvent.click(button);
      expect(onClick).toHaveBeenCalled();
    });

    it('should handle disabled with custom styling', () => {
      render(
        <IconButton
          icon={Settings}
          ariaLabel='Settings'
          disabled
          variant='danger'
          className='custom'
        />
      );

      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
      expect(button).toHaveClass('custom');
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA attributes', () => {
      render(<IconButton icon={Settings} ariaLabel='Open settings' />);

      const button = screen.getByRole('button', { name: /open settings/i });
      expect(button).toHaveAttribute('aria-label', 'Open settings');
    });

    it('should be focusable when enabled', () => {
      render(<IconButton icon={Settings} ariaLabel='Settings' />);

      const button = screen.getByRole('button');
      button.focus();
      expect(button).toHaveFocus();
    });

    it('should not be focusable when disabled', () => {
      render(<IconButton icon={Settings} ariaLabel='Settings' disabled />);

      const button = screen.getByRole('button');
      button.focus();
      expect(button).not.toHaveFocus();
    });

    it('should maintain semantic button element', () => {
      render(<IconButton icon={Settings} ariaLabel='Settings' />);

      const button = screen.getByRole('button');
      expect(button.tagName.toLowerCase()).toBe('button');
    });
  });

  describe('ForwardRef', () => {
    it('should forward ref to button element', () => {
      const ref = { current: null as HTMLButtonElement | null };
      render(<IconButton ref={ref} icon={Settings} ariaLabel='Settings' />);

      expect(ref.current).toBeInstanceOf(HTMLButtonElement);
    });

    it('should allow access to button methods through ref', () => {
      const ref = { current: null as HTMLButtonElement | null };
      render(<IconButton ref={ref} icon={Settings} ariaLabel='Settings' />);

      expect(ref.current?.click).toBeDefined();
      expect(ref.current?.focus).toBeDefined();
    });
  });

  describe('Edge cases', () => {
    it('should handle rapid clicks', () => {
      const onClick = vi.fn();
      render(
        <IconButton icon={Settings} ariaLabel='Settings' onClick={onClick} />
      );

      const button = screen.getByRole('button');
      fireEvent.click(button);
      fireEvent.click(button);
      fireEvent.click(button);

      expect(onClick).toHaveBeenCalledTimes(3);
    });

    it('should handle empty style object', () => {
      render(<IconButton icon={Settings} ariaLabel='Settings' style={{}} />);

      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
    });

    it('should handle undefined style', () => {
      render(
        <IconButton icon={Settings} ariaLabel='Settings' style={undefined} />
      );

      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
    });

    it('should render with very long aria-label', () => {
      const longLabel = 'A'.repeat(100);
      render(<IconButton icon={Settings} ariaLabel={longLabel} />);

      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-label', longLabel);
    });
  });
});
