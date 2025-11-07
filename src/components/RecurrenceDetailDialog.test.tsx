/**
 * RecurrenceDetailDialog component tests
 * 繰り返し設定ダイアログの包括的テスト
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import RecurrenceDetailDialog from './RecurrenceDetailDialog';
import type { RecurrenceConfig } from '../types/recurrence';

// Mock all child components to simplify testing
vi.mock('./RecurrenceDetailDialog/components', () => ({
  RecurrencePatternSelector: () => (
    <div data-testid='recurrence-pattern-selector'>Pattern Selector</div>
  ),
  WeeklyOptionsSelector: () => (
    <div data-testid='weekly-options-selector'>Weekly Options</div>
  ),
  MonthlyOptionsSelector: () => (
    <div data-testid='monthly-options-selector'>Monthly Options</div>
  ),
  RecurrenceEndConditions: () => (
    <div data-testid='recurrence-end-conditions'>End Conditions</div>
  ),
  RecurrenceErrorDisplay: () => null,
  RecurrencePreview: () => <div data-testid='recurrence-preview'>Preview</div>,
}));

vi.mock('./shared/Dialog/UnifiedDialog', () => ({
  default: ({ isOpen, title, children }: any) =>
    isOpen ? (
      <div data-testid='unified-dialog'>
        <h1>{title}</h1>
        {children}
      </div>
    ) : null,
}));

describe('RecurrenceDetailDialog', () => {
  const mockOnClose = vi.fn();
  const mockOnSave = vi.fn();

  beforeEach(() => {
    mockOnClose.mockClear();
    mockOnSave.mockClear();
  });

  describe('Dialog rendering', () => {
    it('should not render when isOpen is false', () => {
      render(
        <RecurrenceDetailDialog
          isOpen={false}
          onClose={mockOnClose}
          onSave={mockOnSave}
        />
      );

      expect(screen.queryByTestId('unified-dialog')).not.toBeInTheDocument();
    });

    it('should render when isOpen is true', () => {
      render(
        <RecurrenceDetailDialog
          isOpen
          onClose={mockOnClose}
          onSave={mockOnSave}
        />
      );

      expect(screen.getByTestId('unified-dialog')).toBeInTheDocument();
    });

    it('should render with correct title', () => {
      render(
        <RecurrenceDetailDialog
          isOpen
          onClose={mockOnClose}
          onSave={mockOnSave}
        />
      );

      expect(screen.getByText('recurrence.detailTitle')).toBeInTheDocument();
    });
  });

  describe('Component rendering', () => {
    it('should render RecurrencePatternSelector', () => {
      render(
        <RecurrenceDetailDialog
          isOpen
          onClose={mockOnClose}
          onSave={mockOnSave}
        />
      );

      expect(
        screen.getByTestId('recurrence-pattern-selector')
      ).toBeInTheDocument();
    });

    it('should render RecurrenceEndConditions', () => {
      render(
        <RecurrenceDetailDialog
          isOpen
          onClose={mockOnClose}
          onSave={mockOnSave}
        />
      );

      expect(
        screen.getByTestId('recurrence-end-conditions')
      ).toBeInTheDocument();
    });

    it('should render RecurrencePreview', () => {
      render(
        <RecurrenceDetailDialog
          isOpen
          onClose={mockOnClose}
          onSave={mockOnSave}
        />
      );

      expect(screen.getByTestId('recurrence-preview')).toBeInTheDocument();
    });
  });

  describe('With initial recurrence', () => {
    const mockRecurrence: RecurrenceConfig = {
      pattern: 'daily',
      interval: 1,
      endType: 'never',
      weeklyDays: [],
      monthlyType: 'dayOfMonth',
    };

    it('should render with provided recurrence', () => {
      render(
        <RecurrenceDetailDialog
          isOpen
          recurrence={mockRecurrence}
          onClose={mockOnClose}
          onSave={mockOnSave}
        />
      );

      expect(screen.getByTestId('unified-dialog')).toBeInTheDocument();
    });

    it('should handle weekly recurrence', () => {
      const weeklyRecurrence: RecurrenceConfig = {
        ...mockRecurrence,
        pattern: 'weekly',
        weeklyDays: [1, 3, 5],
      };

      render(
        <RecurrenceDetailDialog
          isOpen
          recurrence={weeklyRecurrence}
          onClose={mockOnClose}
          onSave={mockOnSave}
        />
      );

      expect(screen.getByTestId('unified-dialog')).toBeInTheDocument();
    });

    it('should handle monthly recurrence', () => {
      const monthlyRecurrence: RecurrenceConfig = {
        ...mockRecurrence,
        pattern: 'monthly',
        monthlyType: 'dayOfWeek',
      };

      render(
        <RecurrenceDetailDialog
          isOpen
          recurrence={monthlyRecurrence}
          onClose={mockOnClose}
          onSave={mockOnSave}
        />
      );

      expect(screen.getByTestId('unified-dialog')).toBeInTheDocument();
    });
  });

  describe('Edge cases', () => {
    it('should handle yearly pattern', () => {
      const yearlyRecurrence: RecurrenceConfig = {
        pattern: 'yearly',
        interval: 1,
        endType: 'never',
        weeklyDays: [],
        monthlyType: 'dayOfMonth',
      };

      render(
        <RecurrenceDetailDialog
          isOpen
          recurrence={yearlyRecurrence}
          onClose={mockOnClose}
          onSave={mockOnSave}
        />
      );

      expect(screen.getByTestId('unified-dialog')).toBeInTheDocument();
    });

    it('should handle recurrence with end date', () => {
      const recurrenceWithEndDate: RecurrenceConfig = {
        pattern: 'daily',
        interval: 1,
        endType: 'date',
        endDate: '2025-12-31',
        weeklyDays: [],
        monthlyType: 'dayOfMonth',
      };

      render(
        <RecurrenceDetailDialog
          isOpen
          recurrence={recurrenceWithEndDate}
          onClose={mockOnClose}
          onSave={mockOnSave}
        />
      );

      expect(screen.getByTestId('unified-dialog')).toBeInTheDocument();
    });

    it('should handle recurrence with max occurrences', () => {
      const recurrenceWithOccurrences: RecurrenceConfig = {
        pattern: 'weekly',
        interval: 2,
        endType: 'occurrences',
        maxOccurrences: 10,
        weeklyDays: [1, 3, 5],
        monthlyType: 'dayOfMonth',
      };

      render(
        <RecurrenceDetailDialog
          isOpen
          recurrence={recurrenceWithOccurrences}
          onClose={mockOnClose}
          onSave={mockOnSave}
        />
      );

      expect(screen.getByTestId('unified-dialog')).toBeInTheDocument();
    });

    it('should handle all end types', () => {
      const endTypes = ['never', 'date', 'occurrences'] as const;

      endTypes.forEach(endType => {
        const { unmount } = render(
          <RecurrenceDetailDialog
            isOpen
            recurrence={{
              pattern: 'daily',
              interval: 1,
              endType,
              weeklyDays: [],
              monthlyType: 'dayOfMonth',
            }}
            onClose={mockOnClose}
            onSave={mockOnSave}
          />
        );

        expect(screen.getByTestId('unified-dialog')).toBeInTheDocument();
        unmount();
      });
    });

    it('should handle all patterns', () => {
      const patterns = ['daily', 'weekly', 'monthly', 'yearly'] as const;

      patterns.forEach(pattern => {
        const { unmount } = render(
          <RecurrenceDetailDialog
            isOpen
            recurrence={{
              pattern,
              interval: 1,
              endType: 'never',
              weeklyDays: [],
              monthlyType: 'dayOfMonth',
            }}
            onClose={mockOnClose}
            onSave={mockOnSave}
          />
        );

        expect(screen.getByTestId('unified-dialog')).toBeInTheDocument();
        unmount();
      });
    });
  });
});
