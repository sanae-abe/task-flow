/**
 * InlineMessage component tests
 * インラインメッセージコンポーネントの包括的テスト
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import InlineMessage from './InlineMessage';

// Mock icon components
vi.mock('lucide-react', () => ({
  Info: ({ size }: any) => (
    <div data-testid='info-icon' data-size={size}>
      Info
    </div>
  ),
  CircleCheck: ({ size }: any) => (
    <div data-testid='circle-check-icon' data-size={size}>
      CircleCheck
    </div>
  ),
  AlertTriangle: ({ size }: any) => (
    <div data-testid='alert-triangle-icon' data-size={size}>
      AlertTriangle
    </div>
  ),
}));

vi.mock('./icons/InfoFillIcon', () => ({
  default: ({ size }: any) => (
    <div data-testid='info-fill-icon' data-size={size}>
      InfoFill
    </div>
  ),
}));

vi.mock('./icons/CircleCheck2Icon', () => ({
  default: ({ size }: any) => (
    <div data-testid='circle-check2-icon' data-size={size}>
      CircleCheck2
    </div>
  ),
}));

describe('InlineMessage', () => {
  describe('Rendering', () => {
    it('should not render when message is null', () => {
      const { container } = render(<InlineMessage message={null} />);

      expect(container.firstChild).toBeNull();
    });

    it('should not render when message is empty string', () => {
      const { container } = render(<InlineMessage message='' />);

      expect(container.firstChild).toBeNull();
    });

    it('should render message text', () => {
      render(<InlineMessage message='Test message' />);

      expect(screen.getByText('Test message')).toBeInTheDocument();
    });

    it('should render with default variant (info)', () => {
      const { container } = render(<InlineMessage message='Test message' />);

      expect(container.firstChild).toHaveClass('text-primary');
      expect(screen.getByTestId('info-icon')).toBeInTheDocument();
    });

    it('should apply custom className', () => {
      const { container } = render(
        <InlineMessage message='Test message' className='custom-class' />
      );

      expect(container.firstChild).toHaveClass('custom-class');
    });
  });

  describe('Variants', () => {
    it('should render success variant', () => {
      const { container } = render(
        <InlineMessage message='Success message' variant='success' />
      );

      expect(container.firstChild).toHaveClass('text-success');
      expect(screen.getByTestId('circle-check-icon')).toBeInTheDocument();
    });

    it('should render success variant with inverted icon', () => {
      const { container } = render(
        <InlineMessage
          message='Success message'
          variant='success'
          useInvertedIcon
        />
      );

      expect(container.firstChild).toHaveClass('text-success');
      expect(screen.getByTestId('circle-check2-icon')).toBeInTheDocument();
    });

    it('should render warning variant', () => {
      const { container } = render(
        <InlineMessage message='Warning message' variant='warning' />
      );

      expect(container.firstChild).toHaveClass('text-warning');
      expect(screen.getByTestId('alert-triangle-icon')).toBeInTheDocument();
    });

    it('should render critical variant', () => {
      const { container } = render(
        <InlineMessage message='Critical message' variant='critical' />
      );

      expect(container.firstChild).toHaveClass('text-destructive');
      expect(screen.getByTestId('alert-triangle-icon')).toBeInTheDocument();
    });

    it('should render info variant', () => {
      const { container } = render(
        <InlineMessage message='Info message' variant='info' />
      );

      expect(container.firstChild).toHaveClass('text-primary');
      expect(screen.getByTestId('info-icon')).toBeInTheDocument();
    });

    it('should render unavailable variant', () => {
      const { container } = render(
        <InlineMessage message='Unavailable message' variant='unavailable' />
      );

      expect(container.firstChild).toHaveClass('text-muted-foreground');
      expect(screen.getByTestId('alert-triangle-icon')).toBeInTheDocument();
    });
  });

  describe('Size', () => {
    it('should render with default size (medium)', () => {
      const { container } = render(<InlineMessage message='Test message' />);

      const text = screen.getByText('Test message');
      expect(text).toHaveClass('text-sm', 'font-normal');
      expect(container.firstChild).toHaveClass('gap-2');
    });

    it('should render with small size', () => {
      const { container } = render(
        <InlineMessage message='Test message' size='small' />
      );

      const text = screen.getByText('Test message');
      expect(text).toHaveClass('text-xs', 'font-bold');
      expect(container.firstChild).toHaveClass('gap-1');
    });

    it('should render with medium size', () => {
      const { container } = render(
        <InlineMessage message='Test message' size='medium' />
      );

      const text = screen.getByText('Test message');
      expect(text).toHaveClass('text-sm', 'font-normal');
      expect(container.firstChild).toHaveClass('gap-2');
    });

    it('should use correct icon size for small', () => {
      render(<InlineMessage message='Test message' size='small' />);

      const icon = screen.getByTestId('info-fill-icon');
      expect(icon).toHaveAttribute('data-size', '12');
    });

    it('should use correct icon size for medium', () => {
      render(<InlineMessage message='Test message' size='medium' />);

      const icon = screen.getByTestId('info-icon');
      expect(icon).toHaveAttribute('data-size', '16');
    });

    it('should use InfoFillIcon for small info variant', () => {
      render(
        <InlineMessage message='Test message' variant='info' size='small' />
      );

      expect(screen.getByTestId('info-fill-icon')).toBeInTheDocument();
    });

    it('should use Info icon for medium info variant', () => {
      render(
        <InlineMessage message='Test message' variant='info' size='medium' />
      );

      expect(screen.getByTestId('info-icon')).toBeInTheDocument();
    });
  });

  describe('Icon Rendering', () => {
    it('should render icon before message text', () => {
      const { container } = render(<InlineMessage message='Test message' />);

      const firstChild = container.querySelector('div');
      const iconContainer = firstChild?.querySelector('span:first-child');
      expect(iconContainer).toBeInTheDocument();
    });

    it('should apply pt-[0.2em] to icon container', () => {
      const { container } = render(<InlineMessage message='Test message' />);

      const iconContainer = container.querySelector(
        'span.flex.items-center.pt-\\[0\\.2em\\]'
      );
      expect(iconContainer).toBeInTheDocument();
    });
  });

  describe('CSS Classes', () => {
    it('should apply flex and items-start classes', () => {
      const { container } = render(<InlineMessage message='Test message' />);

      expect(container.firstChild).toHaveClass('flex', 'items-start');
    });

    it('should combine all variant-specific classes', () => {
      const { container, rerender } = render(
        <InlineMessage
          message='Test message'
          variant='success'
          size='small'
          className='custom'
        />
      );

      expect(container.firstChild).toHaveClass(
        'flex',
        'items-start',
        'text-success',
        'custom',
        'gap-1'
      );

      rerender(
        <InlineMessage
          message='Test message'
          variant='warning'
          size='medium'
          className='custom'
        />
      );

      expect(container.firstChild).toHaveClass(
        'flex',
        'items-start',
        'text-warning',
        'custom',
        'gap-2'
      );
    });
  });

  describe('Edge Cases', () => {
    it('should handle very long messages', () => {
      const longMessage = 'A'.repeat(500);
      render(<InlineMessage message={longMessage} />);

      expect(screen.getByText(longMessage)).toBeInTheDocument();
    });

    it('should handle special characters in message', () => {
      const specialMessage = '<script>alert("XSS")</script>';
      render(<InlineMessage message={specialMessage} />);

      expect(screen.getByText(specialMessage)).toBeInTheDocument();
    });

    it('should handle multiline messages', () => {
      const multilineMessage = 'Line 1\nLine 2\nLine 3';
      render(<InlineMessage message={multilineMessage} />);

      // Multiline text is rendered as-is, check for presence
      expect(
        screen.getByText(
          (content, element) =>
            element?.tagName === 'SPAN' && content.includes('Line 1')
        )
      ).toBeInTheDocument();
    });

    it('should handle all variant combinations with both sizes', () => {
      const variants: Array<
        'success' | 'warning' | 'critical' | 'info' | 'unavailable'
      > = ['success', 'warning', 'critical', 'info', 'unavailable'];
      const sizes: Array<'small' | 'medium'> = ['small', 'medium'];

      variants.forEach(variant => {
        sizes.forEach(size => {
          const { unmount } = render(
            <InlineMessage
              message={`${variant}-${size}`}
              variant={variant}
              size={size}
            />
          );
          expect(screen.getByText(`${variant}-${size}`)).toBeInTheDocument();
          unmount();
        });
      });
    });

    it('should handle undefined useInvertedIcon for non-success variants', () => {
      render(
        <InlineMessage
          message='Test message'
          variant='warning'
          useInvertedIcon
        />
      );

      expect(screen.getByTestId('alert-triangle-icon')).toBeInTheDocument();
    });

    it('should handle false useInvertedIcon for success variant', () => {
      render(
        <InlineMessage
          message='Test message'
          variant='success'
          useInvertedIcon={false}
        />
      );

      expect(screen.getByTestId('circle-check-icon')).toBeInTheDocument();
    });
  });

  describe('Re-rendering', () => {
    it('should update message when changed', () => {
      const { rerender } = render(<InlineMessage message='Initial message' />);

      expect(screen.getByText('Initial message')).toBeInTheDocument();

      rerender(<InlineMessage message='Updated message' />);

      expect(screen.queryByText('Initial message')).not.toBeInTheDocument();
      expect(screen.getByText('Updated message')).toBeInTheDocument();
    });

    it('should update variant when changed', () => {
      const { container, rerender } = render(
        <InlineMessage message='Test message' variant='success' />
      );

      expect(container.firstChild).toHaveClass('text-success');

      rerender(<InlineMessage message='Test message' variant='warning' />);

      expect(container.firstChild).not.toHaveClass('text-success');
      expect(container.firstChild).toHaveClass('text-warning');
    });

    it('should update size when changed', () => {
      const { rerender } = render(
        <InlineMessage message='Test message' size='small' />
      );

      let icon = screen.getByTestId('info-fill-icon');
      expect(icon).toHaveAttribute('data-size', '12');

      rerender(<InlineMessage message='Test message' size='medium' />);

      icon = screen.getByTestId('info-icon');
      expect(icon).toHaveAttribute('data-size', '16');
    });

    it('should unmount when message becomes null', () => {
      const { container, rerender } = render(
        <InlineMessage message='Test message' />
      );

      expect(container.firstChild).not.toBeNull();

      rerender(<InlineMessage message={null} />);

      expect(container.firstChild).toBeNull();
    });
  });
});
