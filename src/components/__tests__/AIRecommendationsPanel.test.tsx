/**
 * AIRecommendationsPanel.test.tsx - Comprehensive test suite for AIRecommendationsPanel component
 *
 * Tests cover:
 * - Rendering and UI states (loading, error, empty, recommendation)
 * - User interactions (refresh, task click, keyboard navigation)
 * - Data display (task metadata, labels, priority badges)
 * - Error handling
 * - Accessibility (ARIA attributes, keyboard navigation)
 * - i18n (4 languages)
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { I18nextProvider } from 'react-i18next';
import i18n from '../../i18n/config';
import AIRecommendationsPanel from '../AIRecommendationsPanel';
import { useAIRecommendations } from '../../hooks/useAIRecommendations';
import type { Task } from '../../types';

// Mock useAIRecommendations hook
vi.mock('../../hooks/useAIRecommendations');

// Mock Lucide icons
vi.mock('lucide-react', () => ({
  Sparkles: () => <div data-testid='sparkles-icon'>Sparkles</div>,
  RefreshCw: () => <div data-testid='refresh-icon'>RefreshCw</div>,
  AlertCircle: () => <div data-testid='alert-icon'>AlertCircle</div>,
  Calendar: () => <div data-testid='calendar-icon'>Calendar</div>,
  Flag: () => <div data-testid='flag-icon'>Flag</div>,
}));

const mockRefresh = vi.fn();

const mockTask: Task = {
  id: 'task-1',
  title: 'Complete project documentation',
  description: 'Write comprehensive documentation for the project',
  createdAt: new Date('2025-01-01').toISOString(),
  updatedAt: new Date('2025-01-02').toISOString(),
  dueDate: new Date('2025-11-15').toISOString(),
  completedAt: null,
  priority: 'high',
  labels: [
    { id: 'label-1', name: 'Documentation', color: '#3b82f6' },
    { id: 'label-2', name: 'Priority', color: '#ef4444' },
  ],
  subTasks: [],
  files: [],
};

describe('AIRecommendationsPanel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (useAIRecommendations as any).mockReturnValue({
      recommendation: null,
      loading: false,
      error: null,
      refresh: mockRefresh,
    });
  });

  const renderComponent = (props = {}) =>
    render(
      <I18nextProvider i18n={i18n}>
        <AIRecommendationsPanel boardId='board-1' {...props} />
      </I18nextProvider>
    );

  describe('Rendering', () => {
    it('should render with title and description', () => {
      renderComponent();

      expect(screen.getByText(/AI/i)).toBeInTheDocument();
      expect(screen.getByTestId('sparkles-icon')).toBeInTheDocument();
    });

    it('should render refresh button by default', () => {
      renderComponent();

      expect(screen.getByTestId('refresh-icon')).toBeInTheDocument();
    });

    it('should not render refresh button when showRefreshButton=false', () => {
      renderComponent({ showRefreshButton: false });

      expect(screen.queryByTestId('refresh-icon')).not.toBeInTheDocument();
    });

    it('should apply custom className', () => {
      const { container } = renderComponent({ className: 'custom-class' });

      expect(container.firstChild).toHaveClass('custom-class');
    });
  });

  describe('Loading State', () => {
    it('should show loading indicator', () => {
      (useAIRecommendations as any).mockReturnValue({
        recommendation: null,
        loading: true,
        error: null,
        refresh: mockRefresh,
      });

      renderComponent();

      expect(screen.getByText(/loading|取得中/i)).toBeInTheDocument();
      expect(screen.getByTestId('refresh-icon')).toBeInTheDocument();
    });

    it('should disable refresh button during loading', () => {
      (useAIRecommendations as any).mockReturnValue({
        recommendation: null,
        loading: true,
        error: null,
        refresh: mockRefresh,
      });

      renderComponent();

      const refreshButton = screen.getByRole('button');
      expect(refreshButton).toBeDisabled();
    });
  });

  describe('Error State', () => {
    it('should show error message', () => {
      const error = new Error('Network error');
      (useAIRecommendations as any).mockReturnValue({
        recommendation: null,
        loading: false,
        error,
        refresh: mockRefresh,
      });

      renderComponent();

      expect(screen.getByTestId('alert-icon')).toBeInTheDocument();
      expect(screen.getByText(/error|失敗/i)).toBeInTheDocument();
      expect(screen.getByText(/Network error/i)).toBeInTheDocument();
    });

    it('should still show refresh button on error', () => {
      (useAIRecommendations as any).mockReturnValue({
        recommendation: null,
        loading: false,
        error: new Error('Test error'),
        refresh: mockRefresh,
      });

      renderComponent();

      expect(screen.getByTestId('refresh-icon')).toBeInTheDocument();
    });
  });

  describe('Empty State', () => {
    it('should show no recommendations message', () => {
      renderComponent();

      expect(
        screen.getByText(/no recommendations|推奨するタスクはありません/i)
      ).toBeInTheDocument();
    });

    it('should show hint message', () => {
      renderComponent();

      expect(screen.getByText(/completed|完了/i)).toBeInTheDocument();
    });
  });

  describe('Recommendation Display', () => {
    beforeEach(() => {
      (useAIRecommendations as any).mockReturnValue({
        recommendation: mockTask,
        loading: false,
        error: null,
        refresh: mockRefresh,
      });
    });

    it('should display task title', () => {
      renderComponent();

      expect(screen.getByText(mockTask.title)).toBeInTheDocument();
    });

    it('should display priority badge', () => {
      renderComponent();

      expect(screen.getByTestId('flag-icon')).toBeInTheDocument();
      expect(screen.getByText(/high|高/i)).toBeInTheDocument();
    });

    it('should display due date', () => {
      renderComponent();

      expect(screen.getByTestId('calendar-icon')).toBeInTheDocument();
    });

    it('should display task description', () => {
      renderComponent();

      expect(screen.getByText(mockTask.description!)).toBeInTheDocument();
    });

    it('should display labels', () => {
      renderComponent();

      expect(screen.getByText('Documentation')).toBeInTheDocument();
      expect(screen.getByText('Priority')).toBeInTheDocument();
    });

    it('should limit labels to 3 and show count', () => {
      const taskWithManyLabels = {
        ...mockTask,
        labels: [
          { id: '1', name: 'Label 1', color: '#000' },
          { id: '2', name: 'Label 2', color: '#000' },
          { id: '3', name: 'Label 3', color: '#000' },
          { id: '4', name: 'Label 4', color: '#000' },
          { id: '5', name: 'Label 5', color: '#000' },
        ],
      };

      (useAIRecommendations as any).mockReturnValue({
        recommendation: taskWithManyLabels,
        loading: false,
        error: null,
        refresh: mockRefresh,
      });

      renderComponent();

      expect(screen.getByText('Label 1')).toBeInTheDocument();
      expect(screen.getByText('Label 2')).toBeInTheDocument();
      expect(screen.getByText('Label 3')).toBeInTheDocument();
      expect(screen.queryByText('Label 4')).not.toBeInTheDocument();
      expect(screen.getByText(/\+2/)).toBeInTheDocument();
    });

    it('should display AI reasoning message', () => {
      renderComponent();

      expect(screen.getByText(/AI|優先度分析/i)).toBeInTheDocument();
    });
  });

  describe('User Interactions', () => {
    it('should call refresh on button click', async () => {
      const user = userEvent.setup();
      renderComponent();

      const refreshButton = screen.getByRole('button');
      await user.click(refreshButton);

      expect(mockRefresh).toHaveBeenCalledTimes(1);
    });

    it('should call onRefresh callback', async () => {
      const user = userEvent.setup();
      const onRefresh = vi.fn();
      renderComponent({ onRefresh });

      const refreshButton = screen.getByRole('button');
      await user.click(refreshButton);

      await waitFor(() => {
        expect(onRefresh).toHaveBeenCalledTimes(1);
      });
    });

    it('should call onTaskClick when task card is clicked', async () => {
      const user = userEvent.setup();
      const onTaskClick = vi.fn();

      (useAIRecommendations as any).mockReturnValue({
        recommendation: mockTask,
        loading: false,
        error: null,
        refresh: mockRefresh,
      });

      renderComponent({ onTaskClick });

      const taskCard = screen.getByRole('button', {
        name: new RegExp(mockTask.title),
      });
      await user.click(taskCard);

      expect(onTaskClick).toHaveBeenCalledWith(mockTask);
    });

    it('should support keyboard navigation on task card', async () => {
      const user = userEvent.setup();
      const onTaskClick = vi.fn();

      (useAIRecommendations as any).mockReturnValue({
        recommendation: mockTask,
        loading: false,
        error: null,
        refresh: mockRefresh,
      });

      renderComponent({ onTaskClick });

      const taskCard = screen.getByRole('button', {
        name: new RegExp(mockTask.title),
      });
      taskCard.focus();
      await user.keyboard('{Enter}');

      expect(onTaskClick).toHaveBeenCalledWith(mockTask);
    });

    it('should support space key on task card', async () => {
      const user = userEvent.setup();
      const onTaskClick = vi.fn();

      (useAIRecommendations as any).mockReturnValue({
        recommendation: mockTask,
        loading: false,
        error: null,
        refresh: mockRefresh,
      });

      renderComponent({ onTaskClick });

      const taskCard = screen.getByRole('button', {
        name: new RegExp(mockTask.title),
      });
      taskCard.focus();
      await user.keyboard(' ');

      expect(onTaskClick).toHaveBeenCalledWith(mockTask);
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA label on refresh button', () => {
      renderComponent();

      const refreshButton = screen.getByRole('button');
      expect(refreshButton).toHaveAttribute('aria-label');
    });

    it('should have proper ARIA label on task card', () => {
      (useAIRecommendations as any).mockReturnValue({
        recommendation: mockTask,
        loading: false,
        error: null,
        refresh: mockRefresh,
      });

      renderComponent();

      const taskCard = screen.getByRole('button', {
        name: new RegExp(mockTask.title),
      });
      expect(taskCard).toHaveAttribute('aria-label');
    });

    it('should have proper tabIndex on task card', () => {
      (useAIRecommendations as any).mockReturnValue({
        recommendation: mockTask,
        loading: false,
        error: null,
        refresh: mockRefresh,
      });

      renderComponent();

      const taskCard = screen.getByRole('button', {
        name: new RegExp(mockTask.title),
      });
      expect(taskCard).toHaveAttribute('tabIndex', '0');
    });

    it('should mark icons as aria-hidden', () => {
      renderComponent();

      const sparklesIcon = screen.getByTestId('sparkles-icon');
      expect(sparklesIcon.parentElement).toHaveAttribute('aria-hidden', 'true');
    });
  });

  describe('Due Date Formatting', () => {
    it('should show "overdue" for past dates', () => {
      const overdueTask = {
        ...mockTask,
        dueDate: new Date('2020-01-01').toISOString(),
      };

      (useAIRecommendations as any).mockReturnValue({
        recommendation: overdueTask,
        loading: false,
        error: null,
        refresh: mockRefresh,
      });

      renderComponent();

      expect(screen.getByText(/overdue|期限切れ/i)).toBeInTheDocument();
    });

    it('should show "due today" for today\'s date', () => {
      const today = new Date();
      const todayTask = {
        ...mockTask,
        dueDate: today.toISOString(),
      };

      (useAIRecommendations as any).mockReturnValue({
        recommendation: todayTask,
        loading: false,
        error: null,
        refresh: mockRefresh,
      });

      renderComponent();

      expect(screen.getByText(/due today|今日が期限/i)).toBeInTheDocument();
    });

    it('should show "due tomorrow" for tomorrow\'s date', () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const tomorrowTask = {
        ...mockTask,
        dueDate: tomorrow.toISOString(),
      };

      (useAIRecommendations as any).mockReturnValue({
        recommendation: tomorrowTask,
        loading: false,
        error: null,
        refresh: mockRefresh,
      });

      renderComponent();

      expect(screen.getByText(/due tomorrow|明日が期限/i)).toBeInTheDocument();
    });
  });

  describe('Polling', () => {
    it('should pass pollInterval to hook', () => {
      renderComponent({ pollInterval: 5000 });

      expect(useAIRecommendations).toHaveBeenCalledWith('board-1', {
        pollInterval: 5000,
      });
    });

    it('should not pass pollInterval if not provided', () => {
      renderComponent();

      expect(useAIRecommendations).toHaveBeenCalledWith('board-1', {
        pollInterval: undefined,
      });
    });
  });
});
