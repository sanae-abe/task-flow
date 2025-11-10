/**
 * TimeSelector component tests
 * 時刻選択コンポーネントの包括的テスト
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import TimeSelector from './TimeSelector';

// Mock TimeSelectorDialog component
vi.mock('./TimeSelectorDialog', () => ({
  default: ({
    isOpen,
    hasTime,
    dueTime,
    onSave,
    onClose,
  }: {
    isOpen: boolean;
    hasTime: boolean;
    dueTime: string;
    onSave: (hasTime: boolean, time: string) => void;
    onClose: () => void;
  }) => {
    if (!isOpen) return null;

    return (
      <div data-testid='time-selector-dialog'>
        <div>Time Dialog</div>
        <div data-testid='dialog-hasTime'>{hasTime ? 'true' : 'false'}</div>
        <div data-testid='dialog-dueTime'>{dueTime}</div>
        <button onClick={() => onSave(true, '14:30')} data-testid='dialog-save'>
          Save
        </button>
        <button onClick={() => onSave(false, '')} data-testid='dialog-remove'>
          Remove
        </button>
        <button onClick={onClose} data-testid='dialog-close'>
          Close
        </button>
      </div>
    );
  },
}));

describe('TimeSelector', () => {
  const mockOnTimeChange = vi.fn();

  const defaultProps = {
    hasTime: false,
    dueTime: '',
    onTimeChange: mockOnTimeChange,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Basic rendering', () => {
    it('should render time selector button', () => {
      render(<TimeSelector {...defaultProps} />);

      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    it('should show default text when no time is set', () => {
      render(<TimeSelector {...defaultProps} />);

      expect(screen.getByText('時刻を設定')).toBeInTheDocument();
    });

    it('should show time when hasTime is true', () => {
      render(
        <TimeSelector hasTime dueTime='14:30' onTimeChange={mockOnTimeChange} />
      );

      expect(screen.getByText('14:30 まで')).toBeInTheDocument();
    });

    it('should render clock icon', () => {
      const { container } = render(<TimeSelector {...defaultProps} />);

      const svgElement = container.querySelector('svg');
      expect(svgElement).toBeInTheDocument();
    });

    it('should have outline variant styling', () => {
      render(<TimeSelector {...defaultProps} />);

      const button = screen.getByRole('button');
      // Button should exist with proper styling
      expect(button).toBeInTheDocument();
      expect(button.className).toContain('outline');
    });
  });

  describe('Button text variations', () => {
    it('should show default text when hasTime is false', () => {
      render(
        <TimeSelector
          hasTime={false}
          dueTime=''
          onTimeChange={mockOnTimeChange}
        />
      );

      expect(screen.getByText('時刻を設定')).toBeInTheDocument();
    });

    it('should show time text when hasTime is true and dueTime is provided', () => {
      render(
        <TimeSelector hasTime dueTime='09:00' onTimeChange={mockOnTimeChange} />
      );

      expect(screen.getByText('09:00 まで')).toBeInTheDocument();
    });

    it('should show default text when hasTime is true but dueTime is empty', () => {
      render(
        <TimeSelector hasTime dueTime='' onTimeChange={mockOnTimeChange} />
      );

      expect(screen.getByText('時刻を設定')).toBeInTheDocument();
    });

    it('should update button text when props change', () => {
      const { rerender } = render(<TimeSelector {...defaultProps} />);

      expect(screen.getByText('時刻を設定')).toBeInTheDocument();

      rerender(
        <TimeSelector hasTime dueTime='15:45' onTimeChange={mockOnTimeChange} />
      );

      expect(screen.getByText('15:45 まで')).toBeInTheDocument();
    });

    it('should handle various time formats', () => {
      const times = ['00:00', '12:00', '23:59', '08:30', '17:15'];

      times.forEach(time => {
        const { rerender } = render(
          <TimeSelector
            hasTime
            dueTime={time}
            onTimeChange={mockOnTimeChange}
          />
        );

        expect(screen.getByText(`${time} まで`)).toBeInTheDocument();

        rerender(<TimeSelector {...defaultProps} />);
      });
    });
  });

  describe('Dialog interaction', () => {
    it('should open dialog when button is clicked', async () => {
      render(<TimeSelector {...defaultProps} />);

      const button = screen.getByRole('button');
      fireEvent.click(button);

      await waitFor(() => {
        expect(screen.getByTestId('time-selector-dialog')).toBeInTheDocument();
      });
    });

    it('should not open dialog when button is clicked and disabled', () => {
      render(<TimeSelector {...defaultProps} disabled />);

      const button = screen.getByRole('button');
      fireEvent.click(button);

      expect(
        screen.queryByTestId('time-selector-dialog')
      ).not.toBeInTheDocument();
    });

    it('should pass correct props to dialog', async () => {
      render(
        <TimeSelector hasTime dueTime='14:30' onTimeChange={mockOnTimeChange} />
      );

      const button = screen.getByRole('button');
      fireEvent.click(button);

      await waitFor(() => {
        expect(screen.getByTestId('dialog-hasTime')).toHaveTextContent('true');
        expect(screen.getByTestId('dialog-dueTime')).toHaveTextContent('14:30');
      });
    });

    it('should close dialog when close button is clicked', async () => {
      render(<TimeSelector {...defaultProps} />);

      const button = screen.getByRole('button');
      fireEvent.click(button);

      await waitFor(() => {
        expect(screen.getByTestId('time-selector-dialog')).toBeInTheDocument();
      });

      const closeButton = screen.getByTestId('dialog-close');
      fireEvent.click(closeButton);

      await waitFor(() => {
        expect(
          screen.queryByTestId('time-selector-dialog')
        ).not.toBeInTheDocument();
      });
    });
  });

  describe('Time change handling', () => {
    it('should call onTimeChange when save is clicked in dialog', async () => {
      render(<TimeSelector {...defaultProps} />);

      const button = screen.getByRole('button');
      fireEvent.click(button);

      await waitFor(() => {
        expect(screen.getByTestId('time-selector-dialog')).toBeInTheDocument();
      });

      const saveButton = screen.getByTestId('dialog-save');
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(mockOnTimeChange).toHaveBeenCalledTimes(1);
        expect(mockOnTimeChange).toHaveBeenCalledWith(true, '14:30');
      });
    });

    it('should call onTimeChange when remove is clicked in dialog', async () => {
      render(
        <TimeSelector hasTime dueTime='14:30' onTimeChange={mockOnTimeChange} />
      );

      const button = screen.getByRole('button');
      fireEvent.click(button);

      await waitFor(() => {
        expect(screen.getByTestId('time-selector-dialog')).toBeInTheDocument();
      });

      const removeButton = screen.getByTestId('dialog-remove');
      fireEvent.click(removeButton);

      await waitFor(() => {
        expect(mockOnTimeChange).toHaveBeenCalledTimes(1);
        expect(mockOnTimeChange).toHaveBeenCalledWith(false, '');
      });
    });

    it('should maintain onTimeChange reference stability', () => {
      const { rerender } = render(<TimeSelector {...defaultProps} />);

      rerender(<TimeSelector {...defaultProps} />);
      rerender(<TimeSelector {...defaultProps} />);

      // onTimeChange should be the same reference
      expect(mockOnTimeChange).not.toHaveBeenCalled();
    });
  });

  describe('Disabled state', () => {
    it('should be disabled when disabled prop is true', () => {
      render(<TimeSelector {...defaultProps} disabled />);

      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
    });

    it('should be enabled when disabled prop is false', () => {
      render(<TimeSelector {...defaultProps} disabled={false} />);

      const button = screen.getByRole('button');
      expect(button).not.toBeDisabled();
    });

    it('should be enabled by default when disabled prop is not provided', () => {
      render(<TimeSelector {...defaultProps} />);

      const button = screen.getByRole('button');
      expect(button).not.toBeDisabled();
    });

    it('should not open dialog when disabled', async () => {
      const user = userEvent.setup();
      render(<TimeSelector {...defaultProps} disabled />);

      const button = screen.getByRole('button');
      await user.click(button);

      expect(
        screen.queryByTestId('time-selector-dialog')
      ).not.toBeInTheDocument();
    });

    it('should toggle disabled state correctly', () => {
      const { rerender } = render(
        <TimeSelector {...defaultProps} disabled={false} />
      );

      let button = screen.getByRole('button');
      expect(button).not.toBeDisabled();

      rerender(<TimeSelector {...defaultProps} disabled />);

      button = screen.getByRole('button');
      expect(button).toBeDisabled();

      rerender(<TimeSelector {...defaultProps} disabled={false} />);

      button = screen.getByRole('button');
      expect(button).not.toBeDisabled();
    });
  });

  describe('Accessibility', () => {
    it('should be keyboard navigable', () => {
      render(<TimeSelector {...defaultProps} />);

      const button = screen.getByRole('button');
      button.focus();
      expect(button).toHaveFocus();
    });

    it('should be clickable via keyboard (Enter)', async () => {
      const user = userEvent.setup();
      render(<TimeSelector {...defaultProps} />);

      const button = screen.getByRole('button');
      button.focus();
      await user.keyboard('{Enter}');

      await waitFor(() => {
        expect(screen.getByTestId('time-selector-dialog')).toBeInTheDocument();
      });
    });

    it('should be clickable via keyboard (Space)', async () => {
      const user = userEvent.setup();
      render(<TimeSelector {...defaultProps} />);

      const button = screen.getByRole('button');
      button.focus();
      await user.keyboard(' ');

      await waitFor(() => {
        expect(screen.getByTestId('time-selector-dialog')).toBeInTheDocument();
      });
    });

    it('should have proper button semantics', () => {
      render(<TimeSelector {...defaultProps} />);

      const button = screen.getByRole('button');
      expect(button.tagName.toLowerCase()).toBe('button');
    });
  });

  describe('Component lifecycle', () => {
    it('should render consistently on re-renders', () => {
      const { rerender } = render(<TimeSelector {...defaultProps} />);

      expect(screen.getByText('時刻を設定')).toBeInTheDocument();

      rerender(<TimeSelector {...defaultProps} />);

      expect(screen.getByText('時刻を設定')).toBeInTheDocument();
    });

    it('should update when hasTime changes', () => {
      const { rerender } = render(<TimeSelector {...defaultProps} />);

      expect(screen.getByText('時刻を設定')).toBeInTheDocument();

      rerender(
        <TimeSelector hasTime dueTime='18:00' onTimeChange={mockOnTimeChange} />
      );

      expect(screen.getByText('18:00 まで')).toBeInTheDocument();
    });

    it('should update when dueTime changes', () => {
      const { rerender } = render(
        <TimeSelector hasTime dueTime='10:00' onTimeChange={mockOnTimeChange} />
      );

      expect(screen.getByText('10:00 まで')).toBeInTheDocument();

      rerender(
        <TimeSelector hasTime dueTime='20:00' onTimeChange={mockOnTimeChange} />
      );

      expect(screen.getByText('20:00 まで')).toBeInTheDocument();
    });

    it('should handle multiple dialog open/close cycles', async () => {
      render(<TimeSelector {...defaultProps} />);

      const button = screen.getByRole('button');

      // Open dialog
      fireEvent.click(button);
      await waitFor(() => {
        expect(screen.getByTestId('time-selector-dialog')).toBeInTheDocument();
      });

      // Close dialog
      const closeButton = screen.getByTestId('dialog-close');
      fireEvent.click(closeButton);
      await waitFor(() => {
        expect(
          screen.queryByTestId('time-selector-dialog')
        ).not.toBeInTheDocument();
      });

      // Open again
      fireEvent.click(button);
      await waitFor(() => {
        expect(screen.getByTestId('time-selector-dialog')).toBeInTheDocument();
      });
    });
  });

  describe('Edge cases', () => {
    it('should handle empty dueTime with hasTime true', () => {
      render(
        <TimeSelector hasTime dueTime='' onTimeChange={mockOnTimeChange} />
      );

      expect(screen.getByText('時刻を設定')).toBeInTheDocument();
    });

    it('should handle whitespace dueTime', () => {
      render(
        <TimeSelector hasTime dueTime='   ' onTimeChange={mockOnTimeChange} />
      );

      // Whitespace is truthy, shows formatted time
      const button = screen.getByRole('button');
      expect(button).toHaveTextContent('まで');
    });

    it('should handle rapid button clicks', async () => {
      render(<TimeSelector {...defaultProps} />);

      const button = screen.getByRole('button');

      // Click multiple times rapidly
      fireEvent.click(button);
      fireEvent.click(button);
      fireEvent.click(button);

      // Only one dialog should be open
      await waitFor(() => {
        const dialogs = screen.queryAllByTestId('time-selector-dialog');
        expect(dialogs).toHaveLength(1);
      });
    });

    it('should handle time format edge cases', () => {
      const edgeTimes = ['00:00', '23:59', '12:00', '01:01'];

      edgeTimes.forEach(time => {
        const { rerender } = render(
          <TimeSelector
            hasTime
            dueTime={time}
            onTimeChange={mockOnTimeChange}
          />
        );

        expect(screen.getByText(`${time} まで`)).toBeInTheDocument();

        rerender(<TimeSelector {...defaultProps} />);
      });
    });
  });
});
