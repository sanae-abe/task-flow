import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import EmptyState from './EmptyState';

// Mock useTranslation
const mockT = vi.fn((key: string) => {
  if (key === 'label.noLabels') return 'ラベルがありません';
  return key;
});

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: mockT,
  }),
}));

describe('EmptyState', () => {
  it('should render empty state message', () => {
    render(<EmptyState />);
    expect(screen.getByText('ラベルがありません')).toBeInTheDocument();
  });

  it('should call translation with correct key', () => {
    render(<EmptyState />);
    expect(mockT).toHaveBeenCalledWith('label.noLabels');
  });

  it('should render with correct styling classes', () => {
    const { container } = render(<EmptyState />);
    const div = container.querySelector('.text-center.py-6');
    expect(div).toBeInTheDocument();
  });

  it('should have dashed border', () => {
    const { container } = render(<EmptyState />);
    const div = container.querySelector('.border-dashed');
    expect(div).toBeInTheDocument();
  });

  it('should have rounded corners', () => {
    const { container } = render(<EmptyState />);
    const div = container.querySelector('.rounded-md');
    expect(div).toBeInTheDocument();
  });

  it('should be a flex container', () => {
    const { container } = render(<EmptyState />);
    const div = container.querySelector('.flex.flex-col');
    expect(div).toBeInTheDocument();
  });

  it('should center items', () => {
    const { container } = render(<EmptyState />);
    const div = container.querySelector('.justify-center.items-center');
    expect(div).toBeInTheDocument();
  });

  it('should have gap-2 spacing', () => {
    const { container } = render(<EmptyState />);
    const div = container.querySelector('.gap-2');
    expect(div).toBeInTheDocument();
  });

  it('should have text-zinc-700 color for text', () => {
    const { container } = render(<EmptyState />);
    const span = container.querySelector('.text-zinc-700');
    expect(span).toBeInTheDocument();
  });
});
