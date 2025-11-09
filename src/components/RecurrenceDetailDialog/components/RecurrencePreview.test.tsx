import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import RecurrencePreview from './RecurrencePreview';
import type { RecurrenceConfig } from '../types';

// Mock getRecurrenceDescription
vi.mock('../../../utils/recurrence', () => ({
  getRecurrenceDescription: vi.fn((config: RecurrenceConfig) => {
    if (config.frequency === 'daily') return '毎日';
    if (config.frequency === 'weekly') return '毎週';
    if (config.frequency === 'monthly') return '毎月';
    return '不明';
  }),
}));

describe('RecurrencePreview', () => {
  it('should render null when config is null', () => {
    // @ts-expect-error - Testing null config
    const { container } = render(<RecurrencePreview config={null} />);
    expect(container.firstChild).toBeNull();
  });

  it('should render null when config is undefined', () => {
    // @ts-expect-error - Testing undefined config
    const { container } = render(<RecurrencePreview config={undefined} />);
    expect(container.firstChild).toBeNull();
  });

  it('should render daily recurrence description', () => {
    const config: RecurrenceConfig = {
      frequency: 'daily',
      interval: 1,
    };

    render(<RecurrencePreview config={config} />);
    expect(screen.getByText('設定内容: 毎日')).toBeInTheDocument();
  });

  it('should render weekly recurrence description', () => {
    const config: RecurrenceConfig = {
      frequency: 'weekly',
      interval: 1,
      byWeekday: ['MO', 'WE', 'FR'],
    };

    render(<RecurrencePreview config={config} />);
    expect(screen.getByText('設定内容: 毎週')).toBeInTheDocument();
  });

  it('should render monthly recurrence description', () => {
    const config: RecurrenceConfig = {
      frequency: 'monthly',
      interval: 1,
      byMonthDay: [15],
    };

    render(<RecurrencePreview config={config} />);
    expect(screen.getByText('設定内容: 毎月')).toBeInTheDocument();
  });

  it('should render with correct styling classes', () => {
    const config: RecurrenceConfig = {
      frequency: 'daily',
      interval: 1,
    };

    const { container } = render(<RecurrencePreview config={config} />);
    const previewDiv = container.querySelector('.mt-5.p-2.bg-neutral-100');
    expect(previewDiv).toBeInTheDocument();
  });

  it('should render description text in small size', () => {
    const config: RecurrenceConfig = {
      frequency: 'daily',
      interval: 1,
    };

    const { container } = render(<RecurrencePreview config={config} />);
    const textElement = container.querySelector('.text-sm');
    expect(textElement).toBeInTheDocument();
  });
});
