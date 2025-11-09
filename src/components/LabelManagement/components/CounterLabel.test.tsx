import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import CounterLabel from './CounterLabel';

describe('CounterLabel', () => {
  it('should render count of 0', () => {
    render(<CounterLabel count={0} />);
    expect(screen.getByText('0')).toBeInTheDocument();
  });

  it('should render positive count', () => {
    render(<CounterLabel count={5} />);
    expect(screen.getByText('5')).toBeInTheDocument();
  });

  it('should render large count', () => {
    render(<CounterLabel count={999} />);
    expect(screen.getByText('999')).toBeInTheDocument();
  });

  it('should apply muted foreground color when count is 0', () => {
    const { container } = render(<CounterLabel count={0} />);
    const span = container.querySelector('span');
    expect(span).toHaveClass('text-muted-foreground');
    expect(span).not.toHaveClass('text-foreground');
  });

  it('should apply foreground color when count is greater than 0', () => {
    const { container } = render(<CounterLabel count={1} />);
    const span = container.querySelector('span');
    expect(span).toHaveClass('text-foreground');
    expect(span).not.toHaveClass('text-muted-foreground');
  });

  it('should apply text-sm class', () => {
    const { container } = render(<CounterLabel count={5} />);
    const span = container.querySelector('span');
    expect(span).toHaveClass('text-sm');
  });

  it('should handle negative count (edge case)', () => {
    render(<CounterLabel count={-1} />);
    expect(screen.getByText('-1')).toBeInTheDocument();
  });

  it('should render different counts correctly', () => {
    const { rerender } = render(<CounterLabel count={0} />);
    expect(screen.getByText('0')).toBeInTheDocument();

    rerender(<CounterLabel count={10} />);
    expect(screen.getByText('10')).toBeInTheDocument();

    rerender(<CounterLabel count={100} />);
    expect(screen.getByText('100')).toBeInTheDocument();
  });
});
