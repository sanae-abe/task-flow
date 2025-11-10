/**
 * LabelSelector sub-components tests
 * CurrentBoardLabelSection, OtherBoardLabelSection, SelectedLabelsDisplay の包括的テスト
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import type { Label } from '../../types';
import { CurrentBoardLabelSection } from './CurrentBoardLabelSection';
import { OtherBoardLabelSection } from './OtherBoardLabelSection';
import { SelectedLabelsDisplay } from './SelectedLabelsDisplay';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
} from '@/components/ui/dropdown-menu';

// Mock LabelColorCircle
vi.mock('./LabelColorCircle', () => ({
  LabelColorCircle: ({ color }: { color: string }) => (
    <div data-testid={`color-circle-${color}`} className='color-circle'>
      {color}
    </div>
  ),
}));

// Mock LabelChip
vi.mock('../LabelChip', () => ({
  default: ({
    label,
    showRemove,
    onRemove,
  }: {
    label: Label;
    showRemove?: boolean;
    onRemove?: (id: string) => void;
  }) => (
    <div data-testid={`label-chip-${label.id}`} className='label-chip'>
      <span>{label.name}</span>
      {showRemove && (
        <button
          data-testid={`remove-label-${label.id}`}
          onClick={() => onRemove?.(label.id)}
        >
          Remove
        </button>
      )}
    </div>
  ),
}));

// Helper function to create mock labels
const createMockLabel = (overrides?: Partial<Label>): Label => ({
  id: 'label-1',
  name: 'Test Label',
  color: 'primary',
  ...overrides,
});

// Helper to wrap components in DropdownMenu context
const renderInDropdownMenu = (component: React.ReactElement) =>
  render(
    <DropdownMenu open>
      <DropdownMenuTrigger>Trigger</DropdownMenuTrigger>
      <DropdownMenuContent>{component}</DropdownMenuContent>
    </DropdownMenu>
  );

describe('CurrentBoardLabelSection', () => {
  const mockOnToggleLabel = vi.fn();

  const defaultProps = {
    labels: [
      createMockLabel({ id: '1', name: 'Label 1', color: 'primary' }),
      createMockLabel({ id: '2', name: 'Label 2', color: 'success' }),
      createMockLabel({ id: '3', name: 'Label 3', color: 'danger' }),
    ],
    selectedLabelIds: new Set(['1']),
    onToggleLabel: mockOnToggleLabel,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Basic rendering', () => {
    it('should render null when labels array is empty', () => {
      const { container: _container } = renderInDropdownMenu(
        <CurrentBoardLabelSection
          labels={[]}
          selectedLabelIds={new Set()}
          onToggleLabel={mockOnToggleLabel}
        />
      );

      expect(screen.queryByText('現在のボード')).not.toBeInTheDocument();
    });

    it('should render section header', () => {
      renderInDropdownMenu(<CurrentBoardLabelSection {...defaultProps} />);

      expect(screen.getByText('現在のボード')).toBeInTheDocument();
    });

    it('should render all labels', () => {
      renderInDropdownMenu(<CurrentBoardLabelSection {...defaultProps} />);

      expect(screen.getByText('Label 1')).toBeInTheDocument();
      expect(screen.getByText('Label 2')).toBeInTheDocument();
      expect(screen.getByText('Label 3')).toBeInTheDocument();
    });

    it('should render color circles for each label', () => {
      renderInDropdownMenu(<CurrentBoardLabelSection {...defaultProps} />);

      expect(screen.getByTestId('color-circle-primary')).toBeInTheDocument();
      expect(screen.getByTestId('color-circle-success')).toBeInTheDocument();
      expect(screen.getByTestId('color-circle-danger')).toBeInTheDocument();
    });

    it('should render single label', () => {
      const singleLabel = [createMockLabel({ id: '1', name: 'Single' })];
      renderInDropdownMenu(
        <CurrentBoardLabelSection
          labels={singleLabel}
          selectedLabelIds={new Set()}
          onToggleLabel={mockOnToggleLabel}
        />
      );

      expect(screen.getByText('Single')).toBeInTheDocument();
    });
  });

  describe('Selection state', () => {
    it('should mark selected labels as checked', () => {
      renderInDropdownMenu(<CurrentBoardLabelSection {...defaultProps} />);

      const checkboxItems = screen.getAllByRole('menuitemcheckbox');
      expect(checkboxItems[0]).toHaveAttribute('data-state', 'checked');
      expect(checkboxItems[1]).toHaveAttribute('data-state', 'unchecked');
      expect(checkboxItems[2]).toHaveAttribute('data-state', 'unchecked');
    });

    it('should handle multiple selections', () => {
      const selectedIds = new Set(['1', '2']);
      renderInDropdownMenu(
        <CurrentBoardLabelSection
          {...defaultProps}
          selectedLabelIds={selectedIds}
        />
      );

      const checkboxItems = screen.getAllByRole('menuitemcheckbox');
      expect(checkboxItems[0]).toHaveAttribute('data-state', 'checked');
      expect(checkboxItems[1]).toHaveAttribute('data-state', 'checked');
      expect(checkboxItems[2]).toHaveAttribute('data-state', 'unchecked');
    });

    it('should handle no selections', () => {
      renderInDropdownMenu(
        <CurrentBoardLabelSection
          {...defaultProps}
          selectedLabelIds={new Set()}
        />
      );

      const checkboxItems = screen.getAllByRole('menuitemcheckbox');
      checkboxItems.forEach(item => {
        expect(item).toHaveAttribute('data-state', 'unchecked');
      });
    });

    it('should handle all selections', () => {
      const selectedIds = new Set(['1', '2', '3']);
      renderInDropdownMenu(
        <CurrentBoardLabelSection
          {...defaultProps}
          selectedLabelIds={selectedIds}
        />
      );

      const checkboxItems = screen.getAllByRole('menuitemcheckbox');
      checkboxItems.forEach(item => {
        expect(item).toHaveAttribute('data-state', 'checked');
      });
    });
  });

  describe('Toggle functionality', () => {
    it('should call onToggleLabel when label is clicked', () => {
      renderInDropdownMenu(<CurrentBoardLabelSection {...defaultProps} />);

      const firstLabel = screen.getByText('Label 1');
      fireEvent.click(firstLabel);

      expect(mockOnToggleLabel).toHaveBeenCalledTimes(1);
      expect(mockOnToggleLabel).toHaveBeenCalledWith(defaultProps.labels[0]);
    });

    it('should call onToggleLabel with correct label', () => {
      renderInDropdownMenu(<CurrentBoardLabelSection {...defaultProps} />);

      const secondLabel = screen.getByText('Label 2');
      fireEvent.click(secondLabel);

      expect(mockOnToggleLabel).toHaveBeenCalledWith(defaultProps.labels[1]);
    });

    it('should handle multiple clicks', () => {
      renderInDropdownMenu(<CurrentBoardLabelSection {...defaultProps} />);

      const label = screen.getByText('Label 1');
      fireEvent.click(label);
      fireEvent.click(label);

      expect(mockOnToggleLabel).toHaveBeenCalledTimes(2);
    });
  });
});

describe('OtherBoardLabelSection', () => {
  const mockOnCopyAndSelectLabel = vi.fn();

  const defaultProps = {
    labels: [
      createMockLabel({ id: '1', name: 'Other Label 1', color: 'primary' }),
      createMockLabel({ id: '2', name: 'Other Label 2', color: 'success' }),
    ],
    onCopyAndSelectLabel: mockOnCopyAndSelectLabel,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Basic rendering', () => {
    it('should render null when labels array is empty', () => {
      const { container: _container } = renderInDropdownMenu(
        <OtherBoardLabelSection
          labels={[]}
          onCopyAndSelectLabel={mockOnCopyAndSelectLabel}
        />
      );

      expect(screen.queryByText('他のボード')).not.toBeInTheDocument();
    });

    it('should render section header', () => {
      renderInDropdownMenu(<OtherBoardLabelSection {...defaultProps} />);

      expect(screen.getByText('他のボード')).toBeInTheDocument();
    });

    it('should render all labels', () => {
      renderInDropdownMenu(<OtherBoardLabelSection {...defaultProps} />);

      expect(screen.getByText('Other Label 1')).toBeInTheDocument();
      expect(screen.getByText('Other Label 2')).toBeInTheDocument();
    });

    it('should render color circles', () => {
      renderInDropdownMenu(<OtherBoardLabelSection {...defaultProps} />);

      expect(screen.getByTestId('color-circle-primary')).toBeInTheDocument();
      expect(screen.getByTestId('color-circle-success')).toBeInTheDocument();
    });
  });

  describe('Copy and select functionality', () => {
    it('should call onCopyAndSelectLabel when label is clicked', () => {
      renderInDropdownMenu(<OtherBoardLabelSection {...defaultProps} />);

      const firstLabel = screen.getByText('Other Label 1');
      fireEvent.click(firstLabel);

      expect(mockOnCopyAndSelectLabel).toHaveBeenCalledTimes(1);
      expect(mockOnCopyAndSelectLabel).toHaveBeenCalledWith(
        defaultProps.labels[0]
      );
    });

    it('should call onCopyAndSelectLabel with correct label', () => {
      renderInDropdownMenu(<OtherBoardLabelSection {...defaultProps} />);

      const secondLabel = screen.getByText('Other Label 2');
      fireEvent.click(secondLabel);

      expect(mockOnCopyAndSelectLabel).toHaveBeenCalledWith(
        defaultProps.labels[1]
      );
    });

    it('should handle multiple clicks', () => {
      renderInDropdownMenu(<OtherBoardLabelSection {...defaultProps} />);

      const label = screen.getByText('Other Label 1');
      fireEvent.click(label);
      fireEvent.click(label);

      expect(mockOnCopyAndSelectLabel).toHaveBeenCalledTimes(2);
    });
  });

  describe('Menu item rendering', () => {
    it('should render as menu items', () => {
      renderInDropdownMenu(<OtherBoardLabelSection {...defaultProps} />);

      const menuItems = screen.getAllByRole('menuitem');
      expect(menuItems).toHaveLength(2);
    });

    it('should render single label', () => {
      const singleLabel = [createMockLabel({ id: '1', name: 'Single Other' })];
      renderInDropdownMenu(
        <OtherBoardLabelSection
          labels={singleLabel}
          onCopyAndSelectLabel={mockOnCopyAndSelectLabel}
        />
      );

      expect(screen.getByText('Single Other')).toBeInTheDocument();
    });
  });
});

describe('SelectedLabelsDisplay', () => {
  const mockOnRemoveLabel = vi.fn();

  const defaultProps = {
    selectedLabels: [
      createMockLabel({ id: '1', name: 'Selected 1', color: 'primary' }),
      createMockLabel({ id: '2', name: 'Selected 2', color: 'success' }),
      createMockLabel({ id: '3', name: 'Selected 3', color: 'danger' }),
    ],
    onRemoveLabel: mockOnRemoveLabel,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Basic rendering', () => {
    it('should render null when selectedLabels array is empty', () => {
      const { container } = render(
        <SelectedLabelsDisplay
          selectedLabels={[]}
          onRemoveLabel={mockOnRemoveLabel}
        />
      );

      expect(container.firstChild).toBeNull();
    });

    it('should render all selected labels', () => {
      render(<SelectedLabelsDisplay {...defaultProps} />);

      expect(screen.getByText('Selected 1')).toBeInTheDocument();
      expect(screen.getByText('Selected 2')).toBeInTheDocument();
      expect(screen.getByText('Selected 3')).toBeInTheDocument();
    });

    it('should render label chips', () => {
      render(<SelectedLabelsDisplay {...defaultProps} />);

      expect(screen.getByTestId('label-chip-1')).toBeInTheDocument();
      expect(screen.getByTestId('label-chip-2')).toBeInTheDocument();
      expect(screen.getByTestId('label-chip-3')).toBeInTheDocument();
    });

    it('should render single selected label', () => {
      const singleLabel = [
        createMockLabel({ id: '1', name: 'Single Selected' }),
      ];
      render(
        <SelectedLabelsDisplay
          selectedLabels={singleLabel}
          onRemoveLabel={mockOnRemoveLabel}
        />
      );

      expect(screen.getByText('Single Selected')).toBeInTheDocument();
    });

    it('should have proper flex layout classes', () => {
      const { container } = render(<SelectedLabelsDisplay {...defaultProps} />);

      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper).toHaveClass('flex', 'flex-wrap', 'items-center', 'gap-1');
    });
  });

  describe('Remove functionality', () => {
    it('should show remove buttons on all labels', () => {
      render(<SelectedLabelsDisplay {...defaultProps} />);

      expect(screen.getByTestId('remove-label-1')).toBeInTheDocument();
      expect(screen.getByTestId('remove-label-2')).toBeInTheDocument();
      expect(screen.getByTestId('remove-label-3')).toBeInTheDocument();
    });

    it('should call onRemoveLabel when remove button is clicked', () => {
      render(<SelectedLabelsDisplay {...defaultProps} />);

      const removeButton = screen.getByTestId('remove-label-1');
      fireEvent.click(removeButton);

      expect(mockOnRemoveLabel).toHaveBeenCalledTimes(1);
      expect(mockOnRemoveLabel).toHaveBeenCalledWith('1');
    });

    it('should call onRemoveLabel with correct ID', () => {
      render(<SelectedLabelsDisplay {...defaultProps} />);

      const removeButton2 = screen.getByTestId('remove-label-2');
      fireEvent.click(removeButton2);

      expect(mockOnRemoveLabel).toHaveBeenCalledWith('2');
    });

    it('should handle multiple remove clicks', () => {
      render(<SelectedLabelsDisplay {...defaultProps} />);

      const removeButton1 = screen.getByTestId('remove-label-1');
      const removeButton2 = screen.getByTestId('remove-label-2');

      fireEvent.click(removeButton1);
      fireEvent.click(removeButton2);

      expect(mockOnRemoveLabel).toHaveBeenCalledTimes(2);
      expect(mockOnRemoveLabel).toHaveBeenCalledWith('1');
      expect(mockOnRemoveLabel).toHaveBeenCalledWith('2');
    });
  });

  describe('Component lifecycle', () => {
    it('should render consistently on re-renders', () => {
      const { rerender } = render(<SelectedLabelsDisplay {...defaultProps} />);

      expect(screen.getByText('Selected 1')).toBeInTheDocument();

      rerender(<SelectedLabelsDisplay {...defaultProps} />);

      expect(screen.getByText('Selected 1')).toBeInTheDocument();
    });

    it('should update when selectedLabels changes', () => {
      const { rerender } = render(<SelectedLabelsDisplay {...defaultProps} />);

      expect(screen.getByText('Selected 1')).toBeInTheDocument();

      const newLabels = [createMockLabel({ id: '4', name: 'New Label' })];
      rerender(
        <SelectedLabelsDisplay
          selectedLabels={newLabels}
          onRemoveLabel={mockOnRemoveLabel}
        />
      );

      expect(screen.queryByText('Selected 1')).not.toBeInTheDocument();
      expect(screen.getByText('New Label')).toBeInTheDocument();
    });

    it('should handle transition from empty to populated', () => {
      const { rerender, container } = render(
        <SelectedLabelsDisplay
          selectedLabels={[]}
          onRemoveLabel={mockOnRemoveLabel}
        />
      );

      expect(container.firstChild).toBeNull();

      rerender(<SelectedLabelsDisplay {...defaultProps} />);

      expect(screen.getByText('Selected 1')).toBeInTheDocument();
    });

    it('should handle transition from populated to empty', () => {
      const { rerender, container } = render(
        <SelectedLabelsDisplay {...defaultProps} />
      );

      expect(screen.getByText('Selected 1')).toBeInTheDocument();

      rerender(
        <SelectedLabelsDisplay
          selectedLabels={[]}
          onRemoveLabel={mockOnRemoveLabel}
        />
      );

      expect(container.firstChild).toBeNull();
    });
  });

  describe('Edge cases', () => {
    it('should handle labels with long names', () => {
      const longNameLabel = [
        createMockLabel({
          id: '1',
          name: 'This is a very long label name that should be handled properly',
        }),
      ];
      render(
        <SelectedLabelsDisplay
          selectedLabels={longNameLabel}
          onRemoveLabel={mockOnRemoveLabel}
        />
      );

      expect(
        screen.getByText(
          'This is a very long label name that should be handled properly'
        )
      ).toBeInTheDocument();
    });

    it('should handle labels with special characters', () => {
      const specialLabel = [
        createMockLabel({ id: '1', name: 'Label (1) - [copy]' }),
      ];
      render(
        <SelectedLabelsDisplay
          selectedLabels={specialLabel}
          onRemoveLabel={mockOnRemoveLabel}
        />
      );

      expect(screen.getByText('Label (1) - [copy]')).toBeInTheDocument();
    });

    it('should handle labels with Unicode characters', () => {
      const unicodeLabel = [createMockLabel({ id: '1', name: '日本語ラベル' })];
      render(
        <SelectedLabelsDisplay
          selectedLabels={unicodeLabel}
          onRemoveLabel={mockOnRemoveLabel}
        />
      );

      expect(screen.getByText('日本語ラベル')).toBeInTheDocument();
    });

    it('should handle large number of selected labels', () => {
      const manyLabels = Array.from({ length: 20 }, (_, i) =>
        createMockLabel({ id: `${i}`, name: `Label ${i}` })
      );

      render(
        <SelectedLabelsDisplay
          selectedLabels={manyLabels}
          onRemoveLabel={mockOnRemoveLabel}
        />
      );

      expect(screen.getByText('Label 0')).toBeInTheDocument();
      expect(screen.getByText('Label 19')).toBeInTheDocument();
    });
  });
});
