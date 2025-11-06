/**
 * DueDateBadge component tests
 * 期限バッジコンポーネントの包括的テスト
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import DueDateBadge from './DueDateBadge';
import { DueDateBadgeProps } from '../types/date';

describe('DueDateBadge', () => {
  const mockDueDate = new Date('2025-01-15T10:00:00.000Z');
  const mockFormatDueDate = vi.fn((_date: Date) => '2025/01/15');

  const defaultProps: DueDateBadgeProps = {
    dueDate: mockDueDate,
    isOverdue: vi.fn(() => false),
    isDueToday: vi.fn(() => false),
    isDueTomorrow: vi.fn(() => false),
    formatDueDate: mockFormatDueDate,
    isRecurrence: false,
  };

  describe('Basic rendering', () => {
    it('should render due date with formatted text', () => {
      render(<DueDateBadge {...defaultProps} />);

      expect(screen.getByText('期限: 2025/01/15')).toBeInTheDocument();
      expect(mockFormatDueDate).toHaveBeenCalledWith(mockDueDate);
    });

    it('should call formatDueDate with correct date', () => {
      const customDate = new Date('2025-12-25T15:30:00.000Z');
      const customFormatDueDate = vi.fn((_date: Date) => '2025/12/25');

      render(
        <DueDateBadge
          {...defaultProps}
          dueDate={customDate}
          formatDueDate={customFormatDueDate}
        />
      );

      expect(customFormatDueDate).toHaveBeenCalledWith(customDate);
    });
  });

  describe('Variant selection based on date status', () => {
    it('should use danger variant when overdue', () => {
      const overdueProps = {
        ...defaultProps,
        isOverdue: vi.fn(() => true),
        isDueToday: vi.fn(() => false),
        isDueTomorrow: vi.fn(() => false),
      };

      render(<DueDateBadge {...overdueProps} />);

      // StatusBadgeがdangerバリアント（text-destructiveクラス）でレンダリングされることを確認
      const badge = screen.getByText('期限: 2025/01/15').closest('div');
      expect(badge).toHaveClass('text-destructive');
    });

    it('should use warning variant when due today', () => {
      const todayProps = {
        ...defaultProps,
        isOverdue: vi.fn(() => false),
        isDueToday: vi.fn(() => true),
        isDueTomorrow: vi.fn(() => false),
      };

      render(<DueDateBadge {...todayProps} />);

      // StatusBadgeがwarningバリアント（text-warningクラス）でレンダリングされることを確認
      const badge = screen.getByText('期限: 2025/01/15').closest('div');
      expect(badge).toHaveClass('text-warning');
    });

    it('should use info variant when due tomorrow', () => {
      const tomorrowProps = {
        ...defaultProps,
        isOverdue: vi.fn(() => false),
        isDueToday: vi.fn(() => false),
        isDueTomorrow: vi.fn(() => true),
      };

      render(<DueDateBadge {...tomorrowProps} />);

      // StatusBadgeがinfoバリアント（text-primaryクラス）でレンダリングされることを確認
      const badge = screen.getByText('期限: 2025/01/15').closest('div');
      expect(badge).toHaveClass('text-primary');
    });

    it('should use neutral variant for normal dates', () => {
      const neutralProps = {
        ...defaultProps,
        isOverdue: vi.fn(() => false),
        isDueToday: vi.fn(() => false),
        isDueTomorrow: vi.fn(() => false),
      };

      render(<DueDateBadge {...neutralProps} />);

      // StatusBadgeがneutralバリアント（text-muted-foregroundクラス）でレンダリングされることを確認
      const badge = screen.getByText('期限: 2025/01/15').closest('div');
      expect(badge).toHaveClass('text-muted-foreground');
    });
  });

  describe('Variant priority (overdue has highest priority)', () => {
    it('should prioritize overdue over today', () => {
      const overdueAndTodayProps = {
        ...defaultProps,
        isOverdue: vi.fn(() => true),
        isDueToday: vi.fn(() => true),
        isDueTomorrow: vi.fn(() => false),
      };

      render(<DueDateBadge {...overdueAndTodayProps} />);

      // overdueが優先されてdangerバリアント（赤色）になることを確認
      const badge = screen.getByText('期限: 2025/01/15').closest('div');
      expect(badge).toHaveClass('text-destructive');
    });

    it('should prioritize today over tomorrow', () => {
      const todayAndTomorrowProps = {
        ...defaultProps,
        isOverdue: vi.fn(() => false),
        isDueToday: vi.fn(() => true),
        isDueTomorrow: vi.fn(() => true),
      };

      render(<DueDateBadge {...todayAndTomorrowProps} />);

      // todayが優先されてwarningバリアント（黄色）になることを確認
      const badge = screen.getByText('期限: 2025/01/15').closest('div');
      expect(badge).toHaveClass('text-warning');
    });
  });

  describe('Recurrence icon display', () => {
    it('should show recurrence icon when isRecurrence is true', () => {
      render(<DueDateBadge {...defaultProps} isRecurrence />);

      // RotateCcwアイコン（SVG要素）がレンダリングされていることを確認
      const badgeContainer = screen
        .getByText('期限: 2025/01/15')
        .closest('div');
      const icon = badgeContainer?.querySelector('svg');
      expect(icon).toBeInTheDocument();
    });

    it('should not show recurrence icon when isRecurrence is false', () => {
      render(<DueDateBadge {...defaultProps} isRecurrence={false} />);

      // RotateCcwアイコンがレンダリングされていないことを確認
      const icon =
        document.querySelector('[data-lucide="rotate-ccw"]') ||
        document.querySelector('svg[data-testid="rotate-ccw-icon"]');

      expect(icon).not.toBeInTheDocument();
    });

    it('should not show recurrence icon by default', () => {
      render(<DueDateBadge {...defaultProps} />);

      // isRecurrence未指定時はアイコンが表示されないことを確認
      const icon =
        document.querySelector('[data-lucide="rotate-ccw"]') ||
        document.querySelector('svg[data-testid="rotate-ccw-icon"]');

      expect(icon).not.toBeInTheDocument();
    });
  });

  describe('Function calls', () => {
    it('should call status check functions for variant determination', () => {
      const spyProps = {
        ...defaultProps,
        isOverdue: vi.fn(() => false),
        isDueToday: vi.fn(() => false),
        isDueTomorrow: vi.fn(() => false),
      };

      render(<DueDateBadge {...spyProps} />);

      expect(spyProps.isOverdue).toHaveBeenCalled();
      expect(spyProps.isDueToday).toHaveBeenCalled();
      expect(spyProps.isDueTomorrow).toHaveBeenCalled();
    });

    it('should stop checking after finding overdue', () => {
      const spyProps = {
        ...defaultProps,
        isOverdue: vi.fn(() => true),
        isDueToday: vi.fn(() => true),
        isDueTomorrow: vi.fn(() => true),
      };

      render(<DueDateBadge {...spyProps} />);

      expect(spyProps.isOverdue).toHaveBeenCalled();
      // overdueが真の場合、残りの関数は呼ばれない
      expect(spyProps.isDueToday).not.toHaveBeenCalled();
      expect(spyProps.isDueTomorrow).not.toHaveBeenCalled();
    });
  });

  describe('CSS classes and styling', () => {
    it('should apply correct StatusBadge props', () => {
      render(<DueDateBadge {...defaultProps} />);

      const badgeElement = screen
        .getByText('期限: 2025/01/15')
        .closest('[class*="border-0"]');
      expect(badgeElement).toBeInTheDocument();

      const transparentBadge = screen
        .getByText('期限: 2025/01/15')
        .closest('[class*="bg-transparent"]');
      expect(transparentBadge).toBeInTheDocument();
    });
  });

  describe('Date formatting edge cases', () => {
    it('should handle different date formats', () => {
      const customFormatDueDate = vi.fn((date: Date) =>
        date.toLocaleDateString()
      );

      render(
        <DueDateBadge {...defaultProps} formatDueDate={customFormatDueDate} />
      );

      expect(customFormatDueDate).toHaveBeenCalledWith(mockDueDate);
      expect(
        screen.getByText(`期限: ${mockDueDate.toLocaleDateString()}`)
      ).toBeInTheDocument();
    });

    it('should handle empty or null formatted dates gracefully', () => {
      const emptyFormatDueDate = vi.fn(() => '');

      render(
        <DueDateBadge {...defaultProps} formatDueDate={emptyFormatDueDate} />
      );

      // 空文字列でも期限テキストが表示されることを確認（部分一致）
      expect(
        screen.getByText((content, _element) => content.includes('期限:'))
      ).toBeInTheDocument();
    });
  });
});
